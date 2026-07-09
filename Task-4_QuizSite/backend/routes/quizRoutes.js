const express = require("express");

const {
  createQuiz,
  getMyQuizzes,
} = require("../controllers/quizController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/create", protect, createQuiz);

router.get("/myquizzes", protect, getMyQuizzes);

module.exports = router;