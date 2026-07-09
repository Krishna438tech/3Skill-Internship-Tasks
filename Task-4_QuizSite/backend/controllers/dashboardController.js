const Team = require("../models/Team");
const Quiz = require("../models/Quiz");
const Result = require("../models/Result");


const getDashboard = async(req,res)=>{

    try{

        const userId = req.user._id;


        const teams = await Team.countDocuments({
            members:userId
        });


        const quizzes = await Quiz.countDocuments({
            createdBy:userId
        });


        const attempts = await Result.countDocuments({
            user:userId
        });


        res.json({

            success:true,

            data:{
                teams,
                quizzes,
                attempts
            }

        });


    }catch(error){

        res.status(500).json({

            success:false,

            message:error.message

        });

    }

};


module.exports = {
    getDashboard
};