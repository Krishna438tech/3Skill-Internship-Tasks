import { Link, NavLink, useNavigate } from "react-router-dom";
import { FaCalendarAlt, FaUserCircle } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import "../styles/navbar.css";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getNavLinkClass = ({ isActive }) =>
    isActive ? "nav-link active" : "nav-link";

  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        <FaCalendarAlt />
        EventHub
      </Link>

      <div className="nav-links">
        <NavLink to="/" end className={getNavLinkClass}>
          Home
        </NavLink>

        <NavLink to="/events" className={getNavLinkClass}>
          Events
        </NavLink>

        {user && (
          <NavLink to="/my-bookings" className={getNavLinkClass}>
            My Bookings
          </NavLink>
        )}

        {user?.role === "admin" && (
          <NavLink to="/admin" end className={getNavLinkClass}>
            Admin
          </NavLink>
        )}

        {!user ? (
          <>
            <NavLink
              to="/login"
              className={({ isActive }) =>
                isActive ? "btn-outline active-btn" : "btn-outline"
              }
            >
              Login
            </NavLink>

            <NavLink
              to="/register"
              className={({ isActive }) =>
                isActive ? "btn-primary active-btn" : "btn-primary"
              }
            >
              Register
            </NavLink>
          </>
        ) : (
          <>
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                isActive
                  ? "profile-link active-profile"
                  : "profile-link"
              }
            >
              <FaUserCircle />
              <span>{user.name}</span>
            </NavLink>

            <button
              type="button"
              onClick={handleLogout}
              className="btn-danger"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;