import express from "express";
import {

  registerAdmin,
  loginAdmin,
} from "../Controllers/adminController.js";
import { getDashboardStats } from "../Controllers/adminDashboardController.js";

const router = express.Router();


router.post("/register", registerAdmin);
router.post("/login", loginAdmin);

router.get("/", getDashboardStats);


export default router;
