import Cart from "../../Models/cart.js";
import Order from "../../Models/order.js";


// Checkout (Convert Cart to Order)
export const createOrder = async (req, res) => {
  try {
    const { userId, shippingAddress } = req.body;

    // 1. Fetch the user's cart
    const cart = await Cart.findOne({ userId }).populate("items.productId");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Your cart is empty" });
    }

    // 2. Prepare order items and calculate total securely on the backend
    let totalAmount = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const product = item.productId; // Because we populated it

      // Stock check
      if (product.stock < item.quantity) {
        return res
          .status(400)
          .json({ message: `Insufficient stock for ${product.name}` });
      }

      orderItems.push({
        productId: product._id,
        name: product.name,
        quantity: item.quantity,
        price: product.price, // Lock in the current price
      });

      totalAmount += product.price * item.quantity;

      // 3. Deduct stock from the actual product
      product.stock -= item.quantity;
      await product.save();
    }

    // 4. Create the order
    const order = new Order({
      userId,
      items: orderItems,
      totalAmount,
      shippingAddress,
    });

    await order.save();

    // 5. Clear the user's cart
    await Cart.findOneAndDelete({ userId });

    res.status(201).json({ message: "Order placed successfully", order });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to place order", error: error.message });
  }
};

// Get logged-in user's orders
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
