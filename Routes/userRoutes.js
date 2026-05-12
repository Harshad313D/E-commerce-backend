import express from "express";
import { deleteUser, getAllUsers, getUserById } from "../Controllers/userController.js";

const router = express.Router();

router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.delete("/:id", deleteUser);

export default router;
