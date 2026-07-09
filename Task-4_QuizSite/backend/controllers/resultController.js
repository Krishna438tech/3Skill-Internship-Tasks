const Quiz = require("../models/Quiz");
const Result = require("../models/Result");

const submitQuiz = async (req, res) => {
  try {
    const { quizId, answers } = req.body;

    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz Not Found",
      });
    }

    let score = 0;

    quiz.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        score++;
      }
    });

    const percentage = (score / quiz.questions.length) * 100;

    const result = await Result.create({
      user: req.user._id,
      quiz: quiz._id,
      score,
      totalQuestions: quiz.questions.length,
      percentage,
    });

    res.status(201).json({
      success: true,
      message: "Quiz Submitted Successfully",
      result,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });

  }
};

const leaderboard = async (req, res) => {

  try {

    const results = await Result.find()
      .populate("user", "name")
      .populate("quiz", "title")
      .sort({ score: -1 });

    res.json({
      success: true,
      results,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Server Error",
    });

  }

};

module.exports = {
  submitQuiz,
  leaderboard,
};