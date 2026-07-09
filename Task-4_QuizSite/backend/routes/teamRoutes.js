const express = require("express");

const router = express.Router();


const {
    createTeam,
    joinTeam,
    getMyTeam
} = require("../controllers/teamController");


const {
    protect
} = require("../middleware/authMiddleware");



router.post(
    "/create",
    protect,
    createTeam
);


router.post(
    "/join",
    protect,
    joinTeam
);


router.get(
    "/myteam",
    protect,
    getMyTeam
);



module.exports = router;