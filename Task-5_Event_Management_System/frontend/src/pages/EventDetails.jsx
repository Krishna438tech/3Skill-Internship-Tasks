import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import "../styles/events.css";

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState(null);
  const [tickets, setTickets] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchEvent = async () => {
    try {
      const { data } = await API.get(`/events/${id}`);
      setEvent(data.event);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load event");
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const handleBooking = async () => {
    if (!user) {
      toast.error("Please login to book event");
      navigate("/login");
      return;
    }

    if (user.role === "admin") {
      toast.error("Admin cannot book events");
      return;
    }

    try {
      setLoading(true);

      const { data } = await API.post("/bookings", {
        eventId: id,
        numberOfTickets: tickets,
      });

      toast.success(data.message || "Event booked successfully");
      navigate("/my-bookings");
    } catch (error) {
      toast.error(error.response?.data?.message || "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  if (!event) {
    return <p className="empty-text">Loading event details...</p>;
  }

  return (
    <div className="page">
      <div className="details-card">
        <img
          src={
            event.image ||
            "https://images.unsplash.com/photo-1505373877841-8d25f7d46678"
          }
          alt={event.title}
        />

        <div className="details-content">
          <h1>{event.title}</h1>

          <p className="details-description">{event.description}</p>

          <div className="details-info">
            <div>
              <strong>Category:</strong> {event.category?.name}
            </div>
            <div>
              <strong>Date:</strong> {new Date(event.date).toLocaleDateString()}
            </div>
            <div>
              <strong>Time:</strong> {event.time}
            </div>
            <div>
              <strong>Location:</strong> {event.location}
            </div>
            <div>
              <strong>Type:</strong> {event.eventType}
            </div>
            <div>
              <strong>Organizer:</strong> {event.organizer}
            </div>
            <div>
              <strong>Price:</strong> {event.price === 0 ? "Free" : `₹${event.price}`}
            </div>
            <div>
              <strong>Available Seats:</strong> {event.availableSeats}
            </div>
          </div>

          <div className="booking-box">
            <input
              type="number"
              min="1"
              max={event.availableSeats}
              value={tickets}
              onChange={(e) => setTickets(Number(e.target.value))}
            />

            <button
              className="btn-primary"
              onClick={handleBooking}
              disabled={loading || event.availableSeats === 0}
            >
              {loading ? "Booking..." : "Book Event"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;