import express from "express";
import { addToCart, getCart, removeFromCart } from "../../Controllers/User/userCartController.js";

const router = express.Router();

router.get("/:userId", getCart);
router.post("/add", addToCart);
router.delete("/remove", removeFromCart);

export default router;
