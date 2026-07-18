import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import "../styles/events.css";

const Events = () => {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [eventType, setEventType] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchCategories = async () => {
    try {
      const { data } = await API.get("/categories");
      setCategories(data.categories || []);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      if (search) params.append("search", search);
      if (category) params.append("category", category);
      if (eventType) params.append("eventType", eventType);

      const { data } = await API.get(`/events?${params.toString()}`);
      setEvents(data.events || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [search, category, eventType]);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Upcoming Events</h1>
        <p>Search and register for your favourite events.</p>
      </div>

      <div className="filter-box">
        <input
          type="text"
          placeholder="Search by title, location or organizer"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option value={cat._id} key={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>

        <select value={eventType} onChange={(e) => setEventType(e.target.value)}>
          <option value="">All Types</option>
          <option value="online">Online</option>
          <option value="offline">Offline</option>
        </select>
      </div>

      {loading ? (
        <p className="empty-text">Loading events...</p>
      ) : events.length === 0 ? (
        <p className="empty-text">No events found.</p>
      ) : (
        <div className="event-grid">
          {events.map((event) => (
            <div className="event-card" key={event._id}>
              <img
                src={
                  event.image ||
                  "https://images.unsplash.com/photo-1505373877841-8d25f7d46678"
                }
                alt={event.title}
              />

              <div className="event-card-body">
                <h3>{event.title}</h3>

                <div className="event-meta">
                  <p>📅 {new Date(event.date).toLocaleDateString()}</p>
                  <p>⏰ {event.time}</p>
                  <p>📍 {event.location}</p>
                  <p>🎟 Seats: {event.availableSeats}</p>
                </div>

                <p className="event-price">
                  {event.price === 0 ? "Free" : `₹${event.price}`}
                </p>

                <Link to={`/events/${event._id}`} className="btn-primary">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Events;