import express from "express";
import {
  createInquiry,
  getMyInquiries,
  getAllInquiries,
  getInquiryById,
  updateInquiryStatus,
  deleteInquiry,
} from "../controllers/inquiryController.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.post("/", protect, createInquiry);
router.get("/my-inquiries", protect, getMyInquiries);

router.get("/admin/all", protect, adminOnly, getAllInquiries);
router.get("/admin/:id", protect, adminOnly, getInquiryById);
router.put("/admin/:id/status", protect, adminOnly, updateInquiryStatus);
router.delete("/admin/:id", protect, adminOnly, deleteInquiry);

export default router;