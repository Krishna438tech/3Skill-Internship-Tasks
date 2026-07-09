const Quiz = require("../models/Quiz");
const Team = require("../models/Team");

// Create Quiz
const createQuiz = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      difficulty,
      timer,
      teamCode,
      questions,
    } = req.body;

    const team = await Team.findOne({ teamCode });

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    const quiz = await Quiz.create({
      title,
      description,
      category,
      difficulty,
      timer,
      createdBy: req.user._id,
      team: team._id,
      questions,
    });

    res.status(201).json({
      success: true,
      message: "Quiz Created Successfully",
      quiz,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });

  }
};

// Get My Quizzes
const getMyQuizzes = async (req, res) => {

  try {

    const quizzes = await Quiz.find({
      createdBy: req.user._id,
    });

    res.json({
      success: true,
      quizzes,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Server Error",
    });

  }

};

module.exports = {
  createQuiz,
  getMyQuizzes,
};