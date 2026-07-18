import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import API from "../services/api";
import "../styles/events.css";
import "../styles/bookings.css";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/bookings/my-bookings");
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

  const handleCancel = async (bookingId) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this booking?"
    );

    if (!confirmCancel) return;

    try {
      const { data } = await API.put(`/bookings/cancel/${bookingId}`);
      toast.success(data.message || "Booking cancelled successfully");
      fetchBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel booking");
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>My Bookings</h1>
        <p>View and manage your registered events.</p>
      </div>

      {loading ? (
        <p className="empty-text">Loading bookings...</p>
      ) : bookings.length === 0 ? (
        <p className="empty-text">No bookings found.</p>
      ) : (
        <div className="bookings-list">
          {bookings.map((booking) => (
            <div className="booking-card" key={booking._id}>
              <div className="booking-info">
                <h3>{booking.event?.title}</h3>

                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(booking.event?.date).toLocaleDateString()}
                </p>
                <p>
                  <strong>Time:</strong> {booking.event?.time}
                </p>
                <p>
                  <strong>Location:</strong> {booking.event?.location}
                </p>
                <p>
                  <strong>Tickets:</strong> {booking.numberOfTickets}
                </p>
                <p>
                  <strong>Total Amount:</strong>{" "}
                  {booking.totalAmount === 0 ? "Free" : `₹${booking.totalAmount}`}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span className={`status ${booking.status}`}>
                    {booking.status}
                  </span>
                </p>
              </div>

              <div className="booking-actions">
                <button
                  className="btn-small-danger"
                  onClick={() => handleCancel(booking._id)}
                  disabled={
                    booking.status === "cancelled" ||
                    booking.status === "rejected"
                  }
                >
                  Cancel Booking
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;