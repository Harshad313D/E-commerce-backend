import express from "express";
import { createProduct, deleteProduct, getAllProducts, getLowStockProducts, getProductById, updateProduct } from "../Controllers/productController.js";

const router = express.Router();

// Specific routes should be placed BEFORE dynamic routes like /:id
// Otherwise, Express will think "low-stock" is an ID!
router.get("/low-stock", getLowStockProducts);

// Standard CRUD Routes
router.post("/", createProduct);
router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.put("/:id", updateProduct); // Use PUT or PATCH for updates
router.delete("/:id", deleteProduct);

export default router;
