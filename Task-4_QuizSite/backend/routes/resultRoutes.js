const express = require("express");

const {
  submitQuiz,
  leaderboard,
} = require("../controllers/resultController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/submit", protect, submitQuiz);

router.get("/leaderboard", protect, leaderboard);

module.exports = router;