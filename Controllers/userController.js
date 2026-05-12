import User from "../Models/user.js";

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    // .select("-password") ensures we don't send passwords to the client
    const users = await User.find({}).select("-password");

    res.status(200).json({
      message: "Users fetched successfully",
      count: users.length,
      users,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch users", error: error.message });
  }
};

// Get single user by ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User fetched successfully",
      user,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch user", error: error.message });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await User.findByIdAndDelete(id);

    res.status(200).json({
      message: "User deleted successfully",
      deletedUserId: id,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete user", error: error.message });
  }
};
