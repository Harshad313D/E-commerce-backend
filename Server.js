import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./Config/db.js";
import cookieParser from "cookie-parser";


import adminRoutes from "./Routes/adminAuthRoutes.js"
import userRoutes from "./Routes/User/userAuthRoutes.js"
import userMngRoutes from "./Routes/userRoutes.js"
import adminProducts from "./Routes/admin-productRoutes.js"

import userCartRotues from "./Routes/User/userCartRoutes.js"
import userOrderRotues from "./Routes/User/userOrderRoutes.js"
import adminOrderMng from "./Routes/adminOrderRoutes.js"

dotenv.config();
connectDB();

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://beauty-product-j8be.onrender.com",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  }),
);
app.use(express.json());

// admin routes
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/admin/users", userMngRoutes);
app.use("/api/v1/products", adminProducts);
app.use("/api/v1/admin/order", adminOrderMng);

// user routes
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/user/cart", userCartRotues);
app.use("/api/v1/user/order", userOrderRotues);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
