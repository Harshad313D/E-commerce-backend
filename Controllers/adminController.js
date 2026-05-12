import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import Admin from "../Models/admin.js";

// Register Admin
export const registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = new Admin({
      name,
      email,
      password: hashedPassword,
      role: "admin",
    });

    await admin.save();

    res.status(201).json({ message: "Admin registered successfully", admin });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Registration failed", error: error.message });
  }
};

// Login Admin
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin || admin.role !== "admin") {
      return res
        .status(400)
        .json({ message: "Admin not found or invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // Optional token generation
    // const token = jwt.sign(
    //   { id: admin._id, role: admin.role },
    //   process.env.JWT_SECRET || 'secret123',
    //   { expiresIn: '1d' }
    // );

    // Send back role from DB
    res.status(200).json({
      message: "Login successful",
      email: admin.email,
      name: admin.name,
      role: admin.role,
      // token,
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};
