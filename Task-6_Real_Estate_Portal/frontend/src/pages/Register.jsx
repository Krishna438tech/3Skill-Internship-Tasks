import { useEffect, useState } from "react";
import {
  FaArrowRight,
  FaCheckCircle,
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaHeart,
  FaHome,
  FaLock,
  FaShieldAlt,
  FaUser,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/auth.css";

const Register = () => {
  const { register, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (isAuthenticated) {
      navigate(isAdmin ? "/admin/dashboard" : "/", {
        replace: true,
      });
    }
  }, [isAuthenticated, isAdmin, navigate]);

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

    if (
      name === "password" &&
      fieldErrors.confirmPassword &&
      formData.confirmPassword === value
    ) {
      setFieldErrors((previousErrors) => ({
        ...previousErrors,
        confirmPassword: "",
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    const cleanName = formData.name.trim();
    const cleanEmail = formData.email.trim();

    if (!cleanName) {
      errors.name = "Full name is required";
    } else if (cleanName.length < 2) {
      errors.name = "Name must contain at least 2 characters";
    }

    if (!cleanEmail) {
      errors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      errors.email = "Enter a valid email address";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must contain at least 6 characters";
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Confirm your password";
    } else if (formData.confirmPassword !== formData.password) {
      errors.confirmPassword = "Passwords do not match";
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

    const result = await register({
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
    });

    setSubmitting(false);

    if (result.success) {
      navigate(result.user?.role === "admin" ? "/admin/dashboard" : "/", {
        replace: true,
      });
    }
  };

  return (
    <main className="auth-page auth-register-page">
      <section className="auth-visual-panel auth-register-visual">
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
              <FaHeart />
              Start your property journey
            </span>

            <h1>Create one account for every HomeNest opportunity.</h1>

            <p>
              Save properties you love, contact property owners and manage your
              inquiries through a clean personal dashboard.
            </p>

            <div className="auth-feature-list">
              <div>
                <FaCheckCircle />
                <span>Save and compare suitable properties</span>
              </div>

              <div>
                <FaCheckCircle />
                <span>Send direct property inquiries</span>
              </div>

              <div>
                <FaCheckCircle />
                <span>Track inquiry progress conveniently</span>
              </div>
            </div>
          </div>

          <p className="auth-visual-footer">
            Your next home deserves a better search experience.
          </p>
        </div>
      </section>

      <section className="auth-form-panel">
        <div className="auth-form-container auth-register-container">
          <div className="auth-mobile-brand">
            <Link to="/">
              <span>
                <FaHome />
              </span>
              Home<strong>Nest</strong>
            </Link>
          </div>

          <div className="auth-form-heading">
            <span className="auth-form-eyebrow">Join HomeNest</span>
            <h2>Create your account</h2>
            <p>
              Register once to save properties, send inquiries and manage your
              real estate activity.
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="auth-form-group">
              <label htmlFor="register-name">Full name</label>

              <div
                className={
                  fieldErrors.name
                    ? "auth-input-wrapper auth-input-error"
                    : "auth-input-wrapper"
                }
              >
                <FaUser />

                <input
                  id="register-name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  autoComplete="name"
                />
              </div>

              {fieldErrors.name && (
                <span className="auth-field-error">{fieldErrors.name}</span>
              )}
            </div>

            <div className="auth-form-group">
              <label htmlFor="register-email">Email address</label>

              <div
                className={
                  fieldErrors.email
                    ? "auth-input-wrapper auth-input-error"
                    : "auth-input-wrapper"
                }
              >
                <FaEnvelope />

                <input
                  id="register-email"
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

            <div className="auth-password-grid">
              <div className="auth-form-group">
                <label htmlFor="register-password">Password</label>

                <div
                  className={
                    fieldErrors.password
                      ? "auth-input-wrapper auth-input-error"
                      : "auth-input-wrapper"
                  }
                >
                  <FaLock />

                  <input
                    id="register-password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Minimum 6 characters"
                    autoComplete="new-password"
                  />

                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() => setShowPassword((previous) => !previous)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>

                {fieldErrors.password && (
                  <span className="auth-field-error">
                    {fieldErrors.password}
                  </span>
                )}
              </div>

              <div className="auth-form-group">
                <label htmlFor="register-confirm-password">
                  Confirm password
                </label>

                <div
                  className={
                    fieldErrors.confirmPassword
                      ? "auth-input-wrapper auth-input-error"
                      : "auth-input-wrapper"
                  }
                >
                  <FaLock />

                  <input
                    id="register-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Repeat your password"
                    autoComplete="new-password"
                  />

                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() =>
                      setShowConfirmPassword((previous) => !previous)
                    }
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>

                {fieldErrors.confirmPassword && (
                  <span className="auth-field-error">
                    {fieldErrors.confirmPassword}
                  </span>
                )}
              </div>
            </div>

            <div className="auth-terms-note">
              <FaShieldAlt />

              <p>
                By creating an account, you agree to use HomeNest responsibly
                and provide accurate account information.
              </p>
            </div>

            <button
              type="submit"
              className="auth-submit-button"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="auth-button-spinner" />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <FaArrowRight />
                </>
              )}
            </button>
          </form>

          <div className="auth-switch-text">
            <span>Already have a HomeNest account?</span>
            <Link to="/login">Sign in here</Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Register;