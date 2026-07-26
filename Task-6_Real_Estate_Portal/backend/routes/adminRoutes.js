import express from "express";
import {
  getAdminDashboardStats,
  getAllUsers,
  blockUser,
  unblockUser,
  deleteUser,
} from "../controllers/adminController.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.get("/dashboard", protect, adminOnly, getAdminDashboardStats);

router.get("/users", protect, adminOnly, getAllUsers);
router.put("/users/:id/block", protect, adminOnly, blockUser);
router.put("/users/:id/unblock", protect, adminOnly, unblockUser);
router.delete("/users/:id", protect, adminOnly, deleteUser);

export default router;