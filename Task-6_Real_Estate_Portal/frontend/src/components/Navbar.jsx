import { useEffect, useRef, useState } from "react";
import {
  FaBars,
  FaBuilding,
  FaChevronDown,
  FaHeart,
  FaHome,
  FaRegUser,
  FaSignOutAlt,
  FaTimes,
  FaUserCircle,
} from "react-icons/fa";
import { MdDashboard, MdOutlineContactMail } from "react-icons/md";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/navbar.css";

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const profileMenuRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();

  const closeMenus = () => {
    setMobileMenuOpen(false);
    setProfileMenuOpen(false);
  };

  useEffect(() => {
    closeMenus();
  }, [location.pathname]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    logout();
    closeMenus();
    navigate("/");
  };

  const getNavClass = ({ isActive }) =>
    isActive ? "navbar-link navbar-link-active" : "navbar-link";

  const userInitial = user?.name?.trim()?.charAt(0)?.toUpperCase() || "U";

  return (
    <>
      <header className="site-header">
        <div className="navbar-container">
          <NavLink to="/" className="brand-logo" onClick={closeMenus}>
            <span className="brand-icon">
              <FaHome />
            </span>

            <span className="brand-text">
              Home<span>Nest</span>
            </span>
          </NavLink>

          <nav className="navbar-desktop-links" aria-label="Main navigation">
            <NavLink to="/" end className={getNavClass}>
              Home
            </NavLink>

            <NavLink to="/properties" className={getNavClass}>
              Properties
            </NavLink>

            {isAuthenticated && (
              <>
                <NavLink to="/favorites" className={getNavClass}>
                  Favorites
                </NavLink>

                <NavLink to="/my-inquiries" className={getNavClass}>
                  My Inquiries
                </NavLink>
              </>
            )}

            {isAdmin && (
              <NavLink to="/admin/dashboard" className={getNavClass}>
                Admin
              </NavLink>
            )}
          </nav>

          <div className="navbar-actions">
            {!isAuthenticated ? (
              <div className="navbar-auth-actions">
                <NavLink to="/login" className="navbar-login-button">
                  Login
                </NavLink>

                <NavLink to="/register" className="navbar-register-button">
                  Join HomeNest
                </NavLink>
              </div>
            ) : (
              <div className="profile-menu-wrapper" ref={profileMenuRef}>
                <button
                  type="button"
                  className="profile-menu-button"
                  onClick={() => setProfileMenuOpen((previous) => !previous)}
                  aria-expanded={profileMenuOpen}
                  aria-label="Open profile menu"
                >
                  <span className="profile-avatar">{userInitial}</span>

                  <span className="profile-summary">
                    <strong>{user?.name || "HomeNest User"}</strong>
                    <small>{isAdmin ? "Administrator" : "Member"}</small>
                  </span>

                  <FaChevronDown
                    className={
                      profileMenuOpen
                        ? "profile-chevron profile-chevron-open"
                        : "profile-chevron"
                    }
                  />
                </button>

                {profileMenuOpen && (
                  <div className="profile-dropdown">
                    <div className="profile-dropdown-header">
                      <span className="profile-dropdown-avatar">
                        {userInitial}
                      </span>

                      <div>
                        <strong>{user?.name || "HomeNest User"}</strong>
                        <span>{user?.email || "Signed in"}</span>
                      </div>
                    </div>

                    <div className="profile-dropdown-divider" />

                    <NavLink to="/profile" className="profile-dropdown-link">
                      <FaRegUser />
                      My Profile
                    </NavLink>

                    <NavLink to="/favorites" className="profile-dropdown-link">
                      <FaHeart />
                      Saved Properties
                    </NavLink>

                    <NavLink
                      to="/my-inquiries"
                      className="profile-dropdown-link"
                    >
                      <MdOutlineContactMail />
                      My Inquiries
                    </NavLink>

                    {isAdmin && (
                      <NavLink
                        to="/admin/dashboard"
                        className="profile-dropdown-link"
                      >
                        <MdDashboard />
                        Admin Dashboard
                      </NavLink>
                    )}

                    <div className="profile-dropdown-divider" />

                    <button
                      type="button"
                      className="profile-dropdown-link profile-logout-button"
                      onClick={handleLogout}
                    >
                      <FaSignOutAlt />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}

            <button
              type="button"
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen((previous) => !previous)}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>
      </header>

      <div
        className={
          mobileMenuOpen
            ? "mobile-navigation-overlay mobile-navigation-overlay-visible"
            : "mobile-navigation-overlay"
        }
        onClick={closeMenus}
      />

      <aside
        className={
          mobileMenuOpen
            ? "mobile-navigation mobile-navigation-open"
            : "mobile-navigation"
        }
      >
        <div className="mobile-navigation-header">
          <NavLink to="/" className="brand-logo" onClick={closeMenus}>
            <span className="brand-icon">
              <FaHome />
            </span>

            <span className="brand-text">
              Home<span>Nest</span>
            </span>
          </NavLink>

          <button
            type="button"
            className="mobile-navigation-close"
            onClick={closeMenus}
            aria-label="Close navigation menu"
          >
            <FaTimes />
          </button>
        </div>

        {isAuthenticated && (
          <div className="mobile-user-card">
            <span className="mobile-user-avatar">{userInitial}</span>

            <div>
              <strong>{user?.name || "HomeNest User"}</strong>
              <span>{user?.email}</span>
            </div>
          </div>
        )}

        <nav className="mobile-navigation-links">
          <NavLink to="/" end className={getNavClass}>
            <FaHome />
            Home
          </NavLink>

          <NavLink to="/properties" className={getNavClass}>
            <FaBuilding />
            Explore Properties
          </NavLink>

          {isAuthenticated && (
            <>
              <NavLink to="/favorites" className={getNavClass}>
                <FaHeart />
                Saved Properties
              </NavLink>

              <NavLink to="/my-inquiries" className={getNavClass}>
                <MdOutlineContactMail />
                My Inquiries
              </NavLink>

              <NavLink to="/profile" className={getNavClass}>
                <FaUserCircle />
                My Profile
              </NavLink>
            </>
          )}

          {isAdmin && (
            <NavLink to="/admin/dashboard" className={getNavClass}>
              <MdDashboard />
              Admin Dashboard
            </NavLink>
          )}
        </nav>

        <div className="mobile-navigation-footer">
          {!isAuthenticated ? (
            <>
              <NavLink
                to="/login"
                className="mobile-login-button"
                onClick={closeMenus}
              >
                Login
              </NavLink>

              <NavLink
                to="/register"
                className="mobile-register-button"
                onClick={closeMenus}
              >
                Create Account
              </NavLink>
            </>
          ) : (
            <button
              type="button"
              className="mobile-logout-button"
              onClick={handleLogout}
            >
              <FaSignOutAlt />
              Logout
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

export default Navbar;