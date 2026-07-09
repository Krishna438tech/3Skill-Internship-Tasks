import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./Dashboard.css";

import Navbar from "../../components/Navbar/Navbar";
import Sidebar from "../../components/Sidebar/Sidebar";
import DashboardCard from "../../components/DashboardCard/DashboardCard";

import {
  FaUsers,
  FaPlusCircle,
  FaClipboardList,
  FaTrophy,
  FaUser,
  FaUserFriends,
  FaChartLine
} from "react-icons/fa";

import { getDashboardData } from "../../services/dashboardService";


function Dashboard() {


  const navigate = useNavigate();


  const [stats,setStats] = useState({

    teams:0,
    quizzes:0,
    attempts:0

  });


  const [loading,setLoading] = useState(true);



  useEffect(()=>{


    const fetchDashboard = async()=>{


      try{


        const res = await getDashboardData();


        setStats(res.data.data);


      }
      catch(error){

        console.log(error);

      }
      finally{

        setLoading(false);

      }


    };


    fetchDashboard();


  },[]);




  return (

    <>

      <Navbar />

      <Sidebar />


      <div className="dashboard">


        <div className="dashboard-header">


          <h1>
            Welcome Back 👋
          </h1>


          <p>
            Manage your quizzes and teams from one place.
          </p>


        </div>





        <div className="stats">


          <div className="stat-card">

            <FaUsers />

            <div>

              <h2>
                {loading ? "..." : stats.teams}
              </h2>

              <p>
                My Teams
              </p>

            </div>

          </div>





          <div className="stat-card">

            <FaClipboardList />

            <div>

              <h2>
                {loading ? "..." : stats.quizzes}
              </h2>

              <p>
                My Quizzes
              </p>

            </div>

          </div>






          <div className="stat-card">

            <FaChartLine />

            <div>

              <h2>
                {loading ? "..." : stats.attempts}
              </h2>

              <p>
                Attempts
              </p>

            </div>

          </div>



        </div>







        <div className="cards">


          <DashboardCard
            title="Create Team"
            icon={<FaUsers />}
            onClick={()=>navigate("/create-team")}
          />



          <DashboardCard
            title="Join Team"
            icon={<FaUserFriends />}
            onClick={()=>navigate("/join-team")}
          />



          <DashboardCard
            title="Create Quiz"
            icon={<FaPlusCircle />}
            onClick={()=>navigate("/create-quiz")}
          />




          <DashboardCard
            title="My Quizzes"
            icon={<FaClipboardList />}
            onClick={()=>navigate("/my-quizzes")}
          />



          <DashboardCard
            title="Leaderboard"
            icon={<FaTrophy />}
            onClick={()=>navigate("/leaderboard")}
          />




          <DashboardCard
            title="Profile"
            icon={<FaUser />}
            onClick={()=>navigate("/profile")}
          />



        </div>


      </div>


    </>

  );

}


export default Dashboard;