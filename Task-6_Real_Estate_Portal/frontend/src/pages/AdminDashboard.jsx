import { useEffect, useMemo, useState } from "react";
import {
  FaArrowRight,
  FaBuilding,
  FaChartLine,
  FaEnvelopeOpenText,
  FaHome,
  FaRedoAlt,
  FaShieldAlt,
  FaUsers,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import "../styles/admin.css";

const getDashboardResponse = (responseData) => {
  return responseData || {};
};

const getNestedNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const formatNumber = (value) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "0";
  }

  return new Intl.NumberFormat("en-IN").format(number);
};

const AdminDashboard = () => {
  const { user } = useAuth();

  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalProperties: 0,
    totalInquiries: 0,
    totalFavorites: 0,
    totalAdmins: 0,
    blockedUsers: 0,
    activeProperties: 0,
    inactiveProperties: 0,
    rentProperties: 0,
    saleProperties: 0,
    pendingInquiries: 0,
    contactedInquiries: 0,
    closedInquiries: 0,
    latestProperties: [],
    latestInquiries: [],
  });

  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const fetchDashboard = async () => {
    setLoading(true);
    setPageError("");

    try {
      const response = await api.get("/admin/dashboard");
      const data = getDashboardResponse(response.data);

      const userStats = data?.stats?.users || {};
      const propertyStats = data?.stats?.properties || {};
      const favoriteStats = data?.stats?.favorites || {};
      const inquiryStats = data?.stats?.inquiries || {};

      const normalUsers = getNestedNumber(userStats.totalUsers);
      const adminUsers = getNestedNumber(userStats.totalAdmins);

      setDashboardData({
        totalUsers: normalUsers + adminUsers,
        totalAdmins: adminUsers,
        blockedUsers: getNestedNumber(userStats.blockedUsers),

        totalProperties: getNestedNumber(propertyStats.totalProperties),
        activeProperties: getNestedNumber(propertyStats.activeProperties),
        inactiveProperties: getNestedNumber(propertyStats.inactiveProperties),
        rentProperties: getNestedNumber(propertyStats.rentProperties),
        saleProperties: getNestedNumber(propertyStats.saleProperties),

        totalFavorites: getNestedNumber(favoriteStats.totalFavorites),

        totalInquiries: getNestedNumber(inquiryStats.totalInquiries),
        pendingInquiries: getNestedNumber(inquiryStats.pendingInquiries),
        contactedInquiries: getNestedNumber(inquiryStats.contactedInquiries),
        closedInquiries: getNestedNumber(inquiryStats.closedInquiries),

        latestProperties: Array.isArray(data.latestProperties)
          ? data.latestProperties
          : [],

        latestInquiries: Array.isArray(data.latestInquiries)
          ? data.latestInquiries
          : [],
      });
    } catch (error) {
      setDashboardData({
        totalUsers: 0,
        totalProperties: 0,
        totalInquiries: 0,
        totalFavorites: 0,
        totalAdmins: 0,
        blockedUsers: 0,
        activeProperties: 0,
        inactiveProperties: 0,
        rentProperties: 0,
        saleProperties: 0,
        pendingInquiries: 0,
        contactedInquiries: 0,
        closedInquiries: 0,
        latestProperties: [],
        latestInquiries: [],
      });

      setPageError(
        error.response?.data?.message ||
          error.message ||
          "Unable to load admin dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const stats = useMemo(() => {
    return [
      {
        label: "Total Users",
        value: dashboardData.totalUsers,
        icon: <FaUsers />,
        hint: `${dashboardData.totalAdmins} admins, ${dashboardData.blockedUsers} blocked`,
        className: "admin-stat-users",
      },
      {
        label: "Properties",
        value: dashboardData.totalProperties,
        icon: <FaBuilding />,
        hint: `${dashboardData.rentProperties} rent, ${dashboardData.saleProperties} sale`,
        className: "admin-stat-properties",
      },
      {
        label: "Inquiries",
        value: dashboardData.totalInquiries,
        icon: <FaEnvelopeOpenText />,
        hint: `${dashboardData.pendingInquiries} pending, ${dashboardData.contactedInquiries} contacted`,
        className: "admin-stat-inquiries",
      },
      {
        label: "Favorites",
        value: dashboardData.totalFavorites,
        icon: <FaHome />,
        hint: "Saved property actions",
        className: "admin-stat-favorites",
      },
    ];
  }, [dashboardData]);

  return (
    <main className="admin-page">
      <section className="admin-hero">
        <div className="container admin-hero-content">
          <span>
            <FaShieldAlt />
            HomeNest Admin
          </span>

          <h1>Control center for your real estate portal.</h1>

          <p>
            Monitor platform activity, manage properties, review inquiries and
            keep the HomeNest experience organized.
          </p>
        </div>
      </section>

      <section className="admin-main-section">
        <div className="container admin-dashboard-layout">
          <aside className="admin-sidebar-panel">
            <div className="admin-sidebar-profile">
              <span>{user?.name?.charAt(0)?.toUpperCase() || "A"}</span>

              <div>
                <h3>{user?.name || "HomeNest Admin"}</h3>
                <p>{user?.email || "Administrator"}</p>
              </div>
            </div>

            <nav className="admin-sidebar-nav">
              <Link to="/admin/dashboard" className="admin-sidebar-link active">
                <FaChartLine />
                Dashboard
              </Link>

              <Link to="/admin/properties" className="admin-sidebar-link">
                <FaBuilding />
                Manage Properties
              </Link>

              <Link to="/admin/users" className="admin-sidebar-link">
                <FaUsers />
                Manage Users
              </Link>

              <Link to="/admin/inquiries" className="admin-sidebar-link">
                <FaEnvelopeOpenText />
                Manage Inquiries
              </Link>
            </nav>
          </aside>

          <div className="admin-dashboard-content">
            <div className="admin-section-header">
              <div>
                <span>Dashboard Overview</span>

                <h2>Welcome back, {user?.name || "Admin"}</h2>

                <p>
                  Here is a quick snapshot of your HomeNest portal activity.
                </p>
              </div>

              <button
                type="button"
                className="admin-refresh-button"
                onClick={fetchDashboard}
                disabled={loading}
              >
                <FaRedoAlt />
                Refresh
              </button>
            </div>

            {loading && (
              <div className="admin-stats-grid">
                {Array.from({ length: 4 }).map((_, index) => (
                  <article
                    className="admin-stat-card admin-skeleton"
                    key={index}
                  >
                    <div className="admin-skeleton-icon" />
                    <div className="admin-skeleton-line short" />
                    <div className="admin-skeleton-line" />
                  </article>
                ))}
              </div>
            )}

            {!loading && pageError && (
              <div className="admin-state-card admin-error-state">
                <span>
                  <FaShieldAlt />
                </span>

                <h3>Dashboard could not be loaded</h3>

                <p>{pageError}</p>

                <button type="button" onClick={fetchDashboard}>
                  Try Again
                </button>
              </div>
            )}

            {!loading && !pageError && (
              <>
                <div className="admin-stats-grid">
                  {stats.map((stat) => (
                    <article
                      className={`admin-stat-card ${stat.className}`}
                      key={stat.label}
                    >
                      <span>{stat.icon}</span>

                      <div>
                        <p>{stat.label}</p>
                        <h3>{formatNumber(stat.value)}</h3>
                        <small>{stat.hint}</small>
                      </div>
                    </article>
                  ))}
                </div>

                <div className="admin-quick-grid">
                  <Link to="/admin/properties" className="admin-quick-card">
                    <span>
                      <FaBuilding />
                    </span>

                    <div>
                      <h3>Manage Properties</h3>

                      <p>
                        Add, edit, review and remove property listings from the
                        platform.
                      </p>
                    </div>

                    <FaArrowRight />
                  </Link>

                  <Link to="/admin/users" className="admin-quick-card">
                    <span>
                      <FaUsers />
                    </span>

                    <div>
                      <h3>Manage Users</h3>

                      <p>
                        View users, block suspicious accounts and manage access.
                      </p>
                    </div>

                    <FaArrowRight />
                  </Link>

                  <Link to="/admin/inquiries" className="admin-quick-card">
                    <span>
                      <FaEnvelopeOpenText />
                    </span>

                    <div>
                      <h3>Manage Inquiries</h3>

                      <p>
                        Review buyer or tenant messages and update inquiry
                        status.
                      </p>
                    </div>

                    <FaArrowRight />
                  </Link>
                </div>

                <div className="admin-insight-card">
                  <div>
                    <span>Admin note</span>

                    <h3>Keep your listings updated and verified.</h3>

                    <p>
                      A clean property catalog improves user trust. Review
                      inquiries regularly and keep unavailable properties
                      updated so the portal remains professional.
                    </p>
                  </div>

                  <Link to="/admin/properties">
                    Start Managing
                    <FaArrowRight />
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default AdminDashboard;