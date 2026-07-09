import "./Navbar.css";
import { FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";


function Navbar() {

  const navigate = useNavigate();

  const { logout } = useAuth();


  const handleLogout = () => {

    logout();

    navigate("/login");

  };


  return (
    <nav className="navbar">


      <div className="logo">

        <h2>
          QuizHub
        </h2>

      </div>



      <div className="nav-right">


        <span>
          Welcome, Krishna Gopal 👋
        </span>



        <FaUserCircle className="user-icon" />



        <button
          className="logout-btn"
          onClick={handleLogout}
        >
          Logout
        </button>



      </div>


    </nav>
  );

}


export default Navbar;