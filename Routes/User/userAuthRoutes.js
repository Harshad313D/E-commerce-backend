import express from "express";
import { loginUser, registerUser } from "../../Controllers/User/userAuthController.js";
import { getAllProducts, getProductById } from "../../Controllers/productController.js";

const router = express.Router();

// Authentication Routes
router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/products",getAllProducts)
router.get("/products/:id",getProductById)

export default router;
