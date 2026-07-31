import express from "express";
import {
  createOrder,
  getOrderById,
  getUserOrders,
  verifyPayment,
  recordPaymentFailure,
  getRazorpayKey,
} from "../../Controllers/User/userOrderControllers.js";

const router = express.Router();

router.post("/checkout", createOrder);
router.post("/verify-payment", verifyPayment);
router.post("/record-payment-failure", recordPaymentFailure);
router.get("/get-razorpay-key", getRazorpayKey);
router.get("/:userId", getUserOrders);
router.get("/id/:orderId", getOrderById);

export default router;
