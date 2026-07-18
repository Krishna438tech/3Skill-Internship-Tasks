import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import API from "../services/api";
import AdminSidebar from "../components/AdminSidebar";
import "../styles/admin.css";
import "../styles/events.css";

const AdminDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/admin/dashboard");
      setDashboard(data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const stats = dashboard?.stats;

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-content">
        <div className="page-header">
          <h1>Admin Dashboard</h1>
          <p>Overview of events, users, bookings and revenue.</p>
        </div>

        {loading ? (
          <p className="empty-text">Loading dashboard...</p>
        ) : !stats ? (
          <p className="empty-text">No dashboard data found.</p>
        ) : (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Users</h3>
                <p>{stats.totalUsers}</p>
              </div>

              <div className="stat-card">
                <h3>Total Admins</h3>
                <p>{stats.totalAdmins}</p>
              </div>

              <div className="stat-card">
                <h3>Total Events</h3>
                <p>{stats.totalEvents}</p>
              </div>

              <div className="stat-card">
                <h3>Active Events</h3>
                <p>{stats.activeEvents}</p>
              </div>

              <div className="stat-card">
                <h3>Categories</h3>
                <p>{stats.totalCategories}</p>
              </div>

              <div className="stat-card">
                <h3>Total Bookings</h3>
                <p>{stats.totalBookings}</p>
              </div>

              <div className="stat-card">
                <h3>Approved</h3>
                <p>{stats.approvedBookings}</p>
              </div>

              <div className="stat-card">
                <h3>Revenue</h3>
                <p>₹{stats.totalRevenue}</p>
              </div>
            </div>

            <div className="admin-table-card">
              <h2>Recent Bookings</h2>

              {dashboard.recentBookings?.length === 0 ? (
                <p className="empty-text">No recent bookings found.</p>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Event</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Amount</th>
                    </tr>
                  </thead>

                  <tbody>
                    {dashboard.recentBookings?.map((booking) => (
                      <tr key={booking._id}>
                        <td>{booking.user?.name}</td>
                        <td>{booking.event?.title}</td>
                        <td>
                          {booking.event?.date
                            ? new Date(booking.event.date).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td>
                          <span className={`status ${booking.status}`}>
                            {booking.status}
                          </span>
                        </td>
                        <td>₹{booking.totalAmount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;