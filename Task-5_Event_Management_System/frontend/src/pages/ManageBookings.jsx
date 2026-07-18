import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import API from "../services/api";
import AdminSidebar from "../components/AdminSidebar";
import "../styles/admin.css";
import "../styles/events.css";
import "../styles/bookings.css";

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/bookings/admin/all");
      setBookings(data.bookings || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleStatusUpdate = async (bookingId, status) => {
    const confirmUpdate = window.confirm(
      `Are you sure you want to ${status} this booking?`
    );

    if (!confirmUpdate) return;

    try {
      const { data } = await API.put(`/bookings/admin/status/${bookingId}`, {
        status,
      });

      toast.success(data.message || "Booking status updated");
      fetchBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update booking");
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-content">
        <div className="page-header">
          <h1>Manage Bookings</h1>
          <p>View all event bookings and manage their status.</p>
        </div>

        <div className="admin-table-card">
          <h2>All Bookings</h2>

          {loading ? (
            <p className="empty-text">Loading bookings...</p>
          ) : bookings.length === 0 ? (
            <p className="empty-text">No bookings found.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Event</th>
                  <th>Date</th>
                  <th>Tickets</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking._id}>
                    <td>{booking.user?.name || "N/A"}</td>
                    <td>{booking.user?.email || "N/A"}</td>
                    <td>{booking.event?.title || "N/A"}</td>
                    <td>
                      {booking.event?.date
                        ? new Date(booking.event.date).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td>{booking.numberOfTickets}</td>
                    <td>
                      {booking.totalAmount === 0
                        ? "Free"
                        : `₹${booking.totalAmount}`}
                    </td>
                    <td>
                      <span className={`status ${booking.status}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="btn-edit"
                          onClick={() =>
                            handleStatusUpdate(booking._id, "approved")
                          }
                          disabled={
                            booking.status === "approved" ||
                            booking.status === "cancelled"
                          }
                        >
                          Approve
                        </button>

                        <button
                          className="btn-delete"
                          onClick={() =>
                            handleStatusUpdate(booking._id, "rejected")
                          }
                          disabled={
                            booking.status === "rejected" ||
                            booking.status === "cancelled"
                          }
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
};

export default ManageBookings;