import "./Sidebar.css";

import {
    FaHome,
    FaUsers,
    FaPlusCircle,
    FaClipboardList,
    FaTrophy,
    FaUser
} from "react-icons/fa";

import { Link } from "react-router-dom";

function Sidebar(){

    return(

        <div className="sidebar">

            <Link to="/dashboard"><FaHome/> Dashboard</Link>

            <Link to="/create-team"><FaUsers/> Create Team</Link>

            <Link to="/join-team"><FaUsers/> Join Team</Link>

            <Link to="/create-quiz"><FaPlusCircle/> Create Quiz</Link>

            <Link to="/my-quizzes"><FaClipboardList/> My Quizzes</Link>

            <Link to="/leaderboard"><FaTrophy/> Leaderboard</Link>

            <Link to="/profile"><FaUser/> Profile</Link>

        </div>

    )

}

export default Sidebar;