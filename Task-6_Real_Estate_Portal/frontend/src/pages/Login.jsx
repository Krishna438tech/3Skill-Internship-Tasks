import { useEffect, useState } from "react";
import {
  FaArrowRight,
  FaCheckCircle,
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaHome,
  FaLock,
  FaShieldAlt,
} from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/auth.css";

const Login = () => {
  const { login, isAuthenticated, isAdmin } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const redirectPath = location.state?.from || "/";

  useEffect(() => {
    if (isAuthenticated) {
      navigate(isAdmin ? "/admin/dashboard" : redirectPath, {
        replace: true,
      });
    }
  }, [isAuthenticated, isAdmin, navigate, redirectPath]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    if (fieldErrors[name]) {
      setFieldErrors((previousErrors) => ({
        ...previousErrors,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.email.trim()) {
      errors.email = "Email address is required";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())
    ) {
      errors.email = "Enter a valid email address";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm() || submitting) {
      return;
    }

    setSubmitting(true);

    const result = await login({
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
    });

    setSubmitting(false);

    if (result.success) {
      const destination =
        result.user?.role === "admin"
          ? "/admin/dashboard"
          : redirectPath === "/login" || redirectPath === "/register"
            ? "/"
            : redirectPath;

      navigate(destination, {
        replace: true,
      });
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-visual-panel auth-login-visual">
        <div className="auth-visual-overlay" />

        <div className="auth-visual-content">
          <Link to="/" className="auth-brand">
            <span className="auth-brand-icon">
              <FaHome />
            </span>

            <span>
              Home<strong>Nest</strong>
            </span>
          </Link>

          <div className="auth-visual-copy">
            <span className="auth-visual-badge">
              <FaShieldAlt />
              Secure property experience
            </span>

            <h1>Welcome back to a smarter way of finding property.</h1>

            <p>
              Continue exploring homes, checking saved properties and tracking
              every inquiry from one secure account.
            </p>

            <div className="auth-feature-list">
              <div>
                <FaCheckCircle />
                <span>Access your saved properties</span>
              </div>

              <div>
                <FaCheckCircle />
                <span>Track your property inquiries</span>
              </div>

              <div>
                <FaCheckCircle />
                <span>Manage your account securely</span>
              </div>
            </div>
          </div>

          <p className="auth-visual-footer">
            Discover. Save. Connect. All through HomeNest.
          </p>
        </div>
      </section>

      <section className="auth-form-panel">
        <div className="auth-form-container">
          <div className="auth-mobile-brand">
            <Link to="/">
              <span>
                <FaHome />
              </span>
              Home<strong>Nest</strong>
            </Link>
          </div>

          <div className="auth-form-heading">
            <span className="auth-form-eyebrow">Welcome back</span>
            <h2>Sign in to your account</h2>
            <p>
              Enter your registered email and password to continue to
              HomeNest.
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="auth-form-group">
              <label htmlFor="login-email">Email address</label>

              <div
                className={
                  fieldErrors.email
                    ? "auth-input-wrapper auth-input-error"
                    : "auth-input-wrapper"
                }
              >
                <FaEnvelope />

                <input
                  id="login-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email address"
                  autoComplete="email"
                />
              </div>

              {fieldErrors.email && (
                <span className="auth-field-error">{fieldErrors.email}</span>
              )}
            </div>

            <div className="auth-form-group">
              <div className="auth-label-row">
                <label htmlFor="login-password">Password</label>

                <span className="auth-forgot-label">Forgot password?</span>
              </div>

              <div
                className={
                  fieldErrors.password
                    ? "auth-input-wrapper auth-input-error"
                    : "auth-input-wrapper"
                }
              >
                <FaLock />

                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword((previous) => !previous)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              {fieldErrors.password && (
                <span className="auth-field-error">{fieldErrors.password}</span>
              )}
            </div>

            <button
              type="submit"
              className="auth-submit-button"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="auth-button-spinner" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <FaArrowRight />
                </>
              )}
            </button>
          </form>

          <div className="auth-switch-text">
            <span>New to HomeNest?</span>
            <Link to="/register">Create your account</Link>
          </div>

          <div className="auth-security-note">
            <FaShieldAlt />
            <p>
              Your account details are securely processed through the HomeNest
              authentication system.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Login;