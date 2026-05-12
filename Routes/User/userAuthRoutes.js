import express from "express";
import { loginUser, registerUser } from "../../Controllers/User/userAuthController.js";
import { getAllProducts } from "../../Controllers/productController.js";

const router = express.Router();

// Authentication Routes
router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/get/all-products",getAllProducts)


export default router;
