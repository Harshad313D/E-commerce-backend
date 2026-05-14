import Cart from "../Models/cart.js";
import Order from "../Models/order.js";

// Get all orders from all users
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Orders fetched successfully",
      count: orders.length,
      orders,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch orders", error: error.message });
  }
};

// Update Order Status (Admin marking as Shipped, Delivered, etc.)
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus, paymentStatus } = req.body;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (orderStatus) order.orderStatus = orderStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    const updatedOrder = await order.save();

    res.status(200).json({
      message: "Order updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update order", error: error.message });
  }
};

// Delete an order (Usually for cleanup/cancelled orders)
export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findByIdAndDelete(id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      message: "Order deleted successfully",
      deletedOrderId: id,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete order", error: error.message });
  }
};

// ========================
// CART MANAGEMENT
// ========================

// Get all carts (Useful to see abandoned carts)
export const getAllCarts = async (req, res) => {
  try {
    const carts = await Cart.find()
      .populate("userId", "name email")
      .populate("items.productId", "name price stock");

    res.status(200).json({
      message: "All carts fetched successfully",
      count: carts.length,
      carts,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch carts", error: error.message });
  }
};
