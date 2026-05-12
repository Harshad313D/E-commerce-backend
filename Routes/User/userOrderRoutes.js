import express from "express";
import { createOrder, getUserOrders } from "../../Controllers/User/userOrderControllers.js";

const router = express.Router();

router.post("/checkout", createOrder);
router.get("/:userId", getUserOrders);

export default router;
