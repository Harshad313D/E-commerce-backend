import express from "express";
import { addToCart, getCart, removeFromCart, updateCartItemQuantity } from "../../Controllers/User/userCartController.js";

const router = express.Router();

router.get("/:userId", getCart);
router.post("/add", addToCart);
router.delete("/remove", removeFromCart);
router.put("/update-quantity", updateCartItemQuantity); 

export default router;
