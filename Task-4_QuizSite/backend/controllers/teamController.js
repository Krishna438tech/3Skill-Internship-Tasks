const Team = require("../models/Team");

// Random Team Code
const generateTeamCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  let code = "";

  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return code;
};

// Create Team
const createTeam = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Team name is required",
      });
    }

    let code = generateTeamCode();

    while (await Team.findOne({ teamCode: code })) {
      code = generateTeamCode();
    }

    const team = await Team.create({
      name,
      teamCode: code,
      createdBy: req.user._id,
      members: [req.user._id],
    });

    res.status(201).json({
      success: true,
      message: "Team Created Successfully",
      team,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });

  }
};

// Join Team
const joinTeam = async (req, res) => {

  try {

    const { teamCode } = req.body;

    const team = await Team.findOne({ teamCode });

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Invalid Team Code",
      });
    }

    if (team.members.includes(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: "Already Joined",
      });
    }

    team.members.push(req.user._id);

    await team.save();

    res.json({
      success: true,
      message: "Joined Team Successfully",
      team,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });

  }

};

// Get My Team
const getMyTeam = async (req, res) => {

  try {

    const team = await Team.findOne({
      members: req.user._id,
    }).populate("members", "name email");

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "No Team Found",
      });
    }

    res.json({
      success: true,
      team,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });

  }

};

module.exports = {
  createTeam,
  joinTeam,
  getMyTeam,
};