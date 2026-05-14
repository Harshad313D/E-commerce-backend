import Order from "../Models/order.js";
import Product from "../Models/product.js";
import User from "../Models/user.js";


export const getDashboardStats = async (req, res) => {
  try {
    // 1. Get basic counts
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();

    // 2. Calculate Total Revenue (Only summing completed or delivered orders)
    const revenueData = await Order.aggregate([
      {
        $match: { orderStatus: { $ne: "Cancelled" } }, // Exclude cancelled orders
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
    ]);

    const totalRevenue =
      revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

    // 3. Get 5 most recent orders for the dashboard preview
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("userId", "name email"); // Pull in the buyer's name and email

    res.status(200).json({
      message: "Dashboard stats fetched successfully",
      stats: {
        totalRevenue,
        totalUsers,
        totalProducts,
        totalOrders,
      },
      recentOrders,
    });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Failed to fetch dashboard stats",
        error: error.message,
      });
  }
};
