import express from "express";
import { deleteOrder, getAllCarts, getAllOrders, updateOrderStatus } from "../Controllers/adminOrderController.js";

const router = express.Router();

// Order Routes
router.get("/", getAllOrders);
router.put("/:id", updateOrderStatus);
router.delete("/:id", deleteOrder);

// Cart Routes
router.get("/carts", getAllCarts);

export default router;
