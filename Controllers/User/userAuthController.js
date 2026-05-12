import bcrypt from "bcryptjs";
import User from "../../Models/user.js";

// Register User
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: "user", // Explicitly setting the role, or rely on your schema's default
    });

    await user.save();

    // Remove password from the response object
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    res
      .status(201)
      .json({ message: "User registered successfully", user: userResponse });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Registration failed", error: error.message });
  }
};

// Login User
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user
    const user = await User.findOne({ email });

    // Check if user exists (Optional: check if role is 'user' if you share a collection)
    if (!user) {
      return res
        .status(400)
        .json({ message: "User not found or invalid credentials" });
    }

    // Compare the provided password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // Optional token generation
    // const token = jwt.sign(
    //   { id: user._id, role: user.role },
    //   process.env.JWT_SECRET || 'secret123',
    //   { expiresIn: '1d' }
    // );

    res.status(200).json({
      message: "Login successful",
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      // token,
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};
