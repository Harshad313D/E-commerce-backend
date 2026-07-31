import Cart from "../../Models/cart.js";
import Order from "../../Models/order.js";
import Product from "../../Models/product.js"; 
import razorpayInstance from "../../Config/razorpay.js";
import crypto from "crypto";

// 1. Checkout (Convert Cart to Order + Create Razorpay Order)
export const createOrder = async (req, res) => {
  try {
    const { userId, shippingAddress } = req.body;

    const cart = await Cart.findOne({ userId }).populate("items.productId");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Your cart is empty" });
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const product = item.productId;
      if (product.stock < item.quantity) {
        return res
          .status(400)
          .json({ message: `Insufficient stock for ${product.name}` });
      }

      orderItems.push({
        productId: product._id,
        name: product.name,
        quantity: item.quantity,
        price: product.price,
      });

      totalAmount += product.price * item.quantity;
    }

    // Create Razorpay Order
    const options = {
      amount: Math.round(totalAmount * 100), // Razorpay requires amount in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}_${userId.substring(0, 5)}`,
    };

    const razorpayOrder = await razorpayInstance.orders.create(options);

    // Deduct stock
    for (const item of cart.items) {
      const product = item.productId;
      product.stock -= item.quantity;
      await product.save();
    }

    // Create the order in DB
    const order = new Order({
      userId,
      items: orderItems,
      totalAmount,
      shippingAddress,
      razorpayOrderId: razorpayOrder.id, // Save razorpay Order ID
      paymentStatus: "Pending",
    });

    await order.save();

    res.status(201).json({
      message: "Order placed successfully. Proceed to payment.",
      orderId: order._id,
      razorpayOrderId: razorpayOrder.id,
      totalAmount,
    });
  } catch (error) {
    let msg = "Failed to place order";
    if (error && error.error && error.error.code === "BAD_REQUEST_ERROR") {
      msg = "Razorpay Error: Invalid API Keys. Please put valid keys in .env!";
    } else if (error.message && error.message.includes("Unauthorized")) {
      msg = "Razorpay Error: Invalid API Keys. Please put valid keys in .env!";
    }
    
    res
      .status(500)
      .json({ message: msg, error: error.message || error });
  }
};

// 2. Verify Successful Payment
export const verifyPayment = async (req, res) => {
  try {
    const {
      orderId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      idempotencyKey = `idemp_${Date.now()}`,
    } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.paymentStatus === "Completed")
      return res.status(400).json({ message: "Order already paid" });

    // Verify Signature securely
    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({ message: "Invalid Payment Signature" });
    }

    // Signature matches: Update status
    order.paymentStatus = "Completed";
    order.orderStatus = "Processing"; // Move from Pending to Processing
    order.paymentAttempts.push({
      idempotencyKey,
      razorpayPaymentId,
      status: "SUCCESS",
    });

    await order.save();

    // Clear the cart only upon successful payment
    await Cart.findOneAndDelete({ userId: order.userId });

    res.status(200).json({ message: "Payment verified successfully", order });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to verify payment", error: error.message });
  }
};

// 3. Record Payment Failure & Manage Retries
export const recordPaymentFailure = async (req, res) => {
  try {
    const { orderId, idempotencyKey, razorpayPaymentId, failureReason } =
      req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.paymentStatus === "Completed")
      return res.status(400).json({ message: "Order already paid" });

    // Enforce retry limit
    if (order.retryCount >= order.maxRetries) {
      order.paymentStatus = "Exhausted_Retries";
      order.orderStatus = "Cancelled";

      // Restore stock if they completely failed all retries
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: item.quantity },
        });
      }

      await order.save();
      return res.status(403).json({
        message: "Maximum retries reached. Order cancelled.",
        canRetry: false,
      });
    }

    // Prevent duplicate logging of the same failure click
    const attemptExists = order.paymentAttempts.find(
      (att) => att.idempotencyKey === idempotencyKey
    );
    if (attemptExists) {
      return res
        .status(200)
        .json({ message: "Attempt already logged", canRetry: true });
    }

    // Record Failure
    order.paymentAttempts.push({
      idempotencyKey,
      razorpayPaymentId,
      status: "FAILED",
      failureReason,
    });

    order.retryCount += 1;

    // Check if THIS failure was their last chance
    const canRetry = order.retryCount < order.maxRetries;
    order.paymentStatus = "Failed";

    await order.save();

    res.status(200).json({
      message: "Payment failure recorded",
      canRetry,
      retriesLeft: order.maxRetries - order.retryCount,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to record failure", error: error.message });
  }
};

// 4. Get logged-in user's orders
export const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;
    // Sort by newest first
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch orders", error: error.message });
  }
};

// 5. Get order by ID
export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    res.status(200).json(order);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch order", error: error.message });
  }
};

// 6. Get Razorpay Key
export const getRazorpayKey = (req, res) => {
  res.status(200).json({ key: process.env.RAZORPAY_KEY_ID });
};