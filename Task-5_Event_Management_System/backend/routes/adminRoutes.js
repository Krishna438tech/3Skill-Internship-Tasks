import express from "express";
import {
  getDashboardStats,
  getAllUsers,
  toggleBlockUser,
  deleteUser,
} from "../controllers/adminController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/dashboard", protect, adminOnly, getDashboardStats);
router.get("/users", protect, adminOnly, getAllUsers);
router.put("/users/block/:id", protect, adminOnly, toggleBlockUser);
router.delete("/users/:id", protect, adminOnly, deleteUser);

export default router;