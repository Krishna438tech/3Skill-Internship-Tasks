import express from "express";
import {
  bookEvent,
  getMyBookings,
  cancelBooking,
  getAllBookings,
  updateBookingStatus,
} from "../controllers/bookingController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, bookEvent);
router.get("/my-bookings", protect, getMyBookings);
router.put("/cancel/:id", protect, cancelBooking);

router.get("/admin/all", protect, adminOnly, getAllBookings);
router.put("/admin/status/:id", protect, adminOnly, updateBookingStatus);

export default router;