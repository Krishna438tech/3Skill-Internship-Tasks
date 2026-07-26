import { useEffect, useState } from "react";
import {
  FaArrowRight,
  FaBuilding,
  FaCheckCircle,
  FaEnvelope,
  FaHeart,
  FaHome,
  FaPhoneAlt,
  FaSave,
  FaShieldAlt,
  FaUser,
  FaUserCog,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/profile.css";

const Profile = () => {
  const { user, updateProfile, isAdmin } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
    });
  }, [user]);

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

    if (!formData.name.trim()) {
      errors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      errors.name = "Name must contain at least 2 characters";
    }

    if (formData.phone.trim()) {
      const phoneRegex = /^[0-9+\-\s]{8,15}$/;

      if (!phoneRegex.test(formData.phone.trim())) {
        errors.phone = "Enter a valid phone number";
      }
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

    await updateProfile({
      name: formData.name.trim(),
      phone: formData.phone.trim(),
    });

    setSubmitting(false);
  };

  const userInitial = user?.name?.trim()?.charAt(0)?.toUpperCase() || "U";

  return (
    <main className="profile-page">
      <section className="profile-hero">
        <div className="container profile-hero-content">
          <span>
            <FaUserCog />
            Account Center
          </span>

          <h1>Manage your HomeNest profile.</h1>

          <p>
            Keep your account information updated so property inquiries and
            communication remain smooth and reliable.
          </p>
        </div>
      </section>

      <section className="profile-main-section">
        <div className="container profile-layout">
          <aside className="profile-summary-card">
            <div className="profile-cover-pattern" />

            <div className="profile-avatar-large">{userInitial}</div>

            <h2>{user?.name || "HomeNest User"}</h2>

            <p>{user?.email || "Signed in account"}</p>

            <span
              className={
                isAdmin
                  ? "profile-role-badge profile-role-admin"
                  : "profile-role-badge"
              }
            >
              {isAdmin ? "Administrator" : "Member"}
            </span>

            <div className="profile-summary-divider" />

            <div className="profile-summary-list">
              <div>
                <FaEnvelope />
                <span>Email</span>
                <strong>{user?.email || "Not available"}</strong>
              </div>

              <div>
                <FaPhoneAlt />
                <span>Phone</span>
                <strong>{user?.phone || "Not added yet"}</strong>
              </div>

              <div>
                <FaShieldAlt />
                <span>Role</span>
                <strong>{isAdmin ? "Admin access" : "User access"}</strong>
              </div>
            </div>
          </aside>

          <div className="profile-content-column">
            <section className="profile-form-card">
              <div className="profile-section-heading">
                <span>Personal information</span>
                <h2>Update account details</h2>
                <p>
                  Your email is used for login, so it is shown as read-only.
                  Name and phone can be updated safely.
                </p>
              </div>

              <form className="profile-form" onSubmit={handleSubmit} noValidate>
                <div className="profile-form-grid">
                  <label className="profile-form-group">
                    <span>Full name</span>

                    <div
                      className={
                        fieldErrors.name
                          ? "profile-input-wrapper profile-input-error"
                          : "profile-input-wrapper"
                      }
                    >
                      <FaUser />

                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                      />
                    </div>

                    {fieldErrors.name && (
                      <small>{fieldErrors.name}</small>
                    )}
                  </label>

                  <label className="profile-form-group">
                    <span>Email address</span>

                    <div className="profile-input-wrapper profile-input-readonly">
                      <FaEnvelope />

                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        readOnly
                        placeholder="Email address"
                      />
                    </div>
                  </label>

                  <label className="profile-form-group profile-phone-field">
                    <span>Phone number</span>

                    <div
                      className={
                        fieldErrors.phone
                          ? "profile-input-wrapper profile-input-error"
                          : "profile-input-wrapper"
                      }
                    >
                      <FaPhoneAlt />

                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Enter your phone number"
                      />
                    </div>

                    {fieldErrors.phone && (
                      <small>{fieldErrors.phone}</small>
                    )}
                  </label>
                </div>

                <button
                  type="submit"
                  className="profile-save-button"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="profile-button-spinner" />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <FaSave />
                      Save Changes
                    </>
                  )}
                </button>
              </form>
            </section>

            <section className="profile-quick-actions">
              <div className="profile-section-heading">
                <span>Quick access</span>
                <h2>Your HomeNest shortcuts</h2>
              </div>

              <div className="profile-action-grid">
                <Link to="/properties" className="profile-action-card">
                  <span>
                    <FaBuilding />
                  </span>

                  <div>
                    <h3>Browse Properties</h3>
                    <p>Explore latest homes and real estate listings.</p>
                  </div>

                  <FaArrowRight />
                </Link>

                <Link to="/favorites" className="profile-action-card">
                  <span>
                    <FaHeart />
                  </span>

                  <div>
                    <h3>Saved Properties</h3>
                    <p>Review the listings you added to favorites.</p>
                  </div>

                  <FaArrowRight />
                </Link>

                <Link to="/my-inquiries" className="profile-action-card">
                  <span>
                    <FaCheckCircle />
                  </span>

                  <div>
                    <h3>My Inquiries</h3>
                    <p>Track your property inquiry history and status.</p>
                  </div>

                  <FaArrowRight />
                </Link>

                {isAdmin && (
                  <Link to="/admin/dashboard" className="profile-action-card">
                    <span>
                      <FaHome />
                    </span>

                    <div>
                      <h3>Admin Dashboard</h3>
                      <p>Manage users, properties and inquiries.</p>
                    </div>

                    <FaArrowRight />
                  </Link>
                )}
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Profile;