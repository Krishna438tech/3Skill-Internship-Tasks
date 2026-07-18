import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import API from "../services/api";
import AdminSidebar from "../components/AdminSidebar";
import "../styles/admin.css";
import "../styles/events.css";

const ManageEvents = () => {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    image: "",
    date: "",
    time: "",
    location: "",
    eventType: "offline",
    price: "",
    totalSeats: "",
    organizer: "",
    status: "active",
  });

  const fetchCategories = async () => {
    try {
      const { data } = await API.get("/categories");
      setCategories(data.categories || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load categories");
    }
  };

  const fetchEvents = async () => {
    try {
      const { data } = await API.get("/events?status=all");
      setEvents(data.events || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load events");
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchEvents();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setEditId(null);
    setFormData({
      title: "",
      description: "",
      category: "",
      image: "",
      date: "",
      time: "",
      location: "",
      eventType: "offline",
      price: "",
      totalSeats: "",
      organizer: "",
      status: "active",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.category) {
      toast.error("Please select category");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        ...formData,
        price: Number(formData.price) || 0,
        totalSeats: Number(formData.totalSeats),
      };

      if (editId) {
        const { data } = await API.put(`/events/${editId}`, payload);
        toast.success(data.message || "Event updated successfully");
      } else {
        const { data } = await API.post("/events", payload);
        toast.success(data.message || "Event created successfully");
      }

      resetForm();
      fetchEvents();
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (event) => {
    setEditId(event._id);

    setFormData({
      title: event.title || "",
      description: event.description || "",
      category: event.category?._id || event.category || "",
      image: event.image || "",
      date: event.date ? event.date.slice(0, 10) : "",
      time: event.time || "",
      location: event.location || "",
      eventType: event.eventType || "offline",
      price: event.price || "",
      totalSeats: event.totalSeats || "",
      organizer: event.organizer || "",
      status: event.status || "active",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (eventId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this event?"
    );

    if (!confirmDelete) return;

    try {
      const { data } = await API.delete(`/events/${eventId}`);
      toast.success(data.message || "Event deleted successfully");
      fetchEvents();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete event");
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-content">
        <div className="page-header">
          <h1>Manage Events</h1>
          <p>Add, update and delete events.</p>
        </div>

        <div className="admin-table-card">
          <h2>{editId ? "Edit Event" : "Add New Event"}</h2>

          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-row">
              <input
                type="text"
                name="title"
                placeholder="Event title"
                value={formData.title}
                onChange={handleChange}
                required
              />

              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option value={cat._id} key={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <textarea
              name="description"
              placeholder="Event description"
              value={formData.description}
              onChange={handleChange}
              required
            ></textarea>

            <div className="form-row">
              <input
                type="text"
                name="image"
                placeholder="Event image URL"
                value={formData.image}
                onChange={handleChange}
              />

              <input
                type="text"
                name="organizer"
                placeholder="Organizer name"
                value={formData.organizer}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />

              <input
                type="text"
                name="time"
                placeholder="Time e.g. 10:00 AM"
                value={formData.time}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <input
                type="text"
                name="location"
                placeholder="Location"
                value={formData.location}
                onChange={handleChange}
                required
              />

              <select
                name="eventType"
                value={formData.eventType}
                onChange={handleChange}
              >
                <option value="offline">Offline</option>
                <option value="online">Online</option>
              </select>
            </div>

            <div className="form-row">
              <input
                type="number"
                name="price"
                placeholder="Price"
                value={formData.price}
                onChange={handleChange}
                min="0"
              />

              <input
                type="number"
                name="totalSeats"
                placeholder="Total seats"
                value={formData.totalSeats}
                onChange={handleChange}
                min="1"
                required
              />
            </div>

            <div className="form-row">
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? "Saving..." : editId ? "Update Event" : "Add Event"}
              </button>

              {editId && (
                <button type="button" className="btn-outline" onClick={resetForm}>
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="admin-table-card">
          <h2>All Events</h2>

          {events.length === 0 ? (
            <p className="empty-text">No events found.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Seats</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {events.map((event) => (
                  <tr key={event._id}>
                    <td>{event.title}</td>
                    <td>{event.category?.name || "N/A"}</td>
                    <td>{new Date(event.date).toLocaleDateString()}</td>
                    <td>
                      {event.availableSeats}/{event.totalSeats}
                    </td>
                    <td>{event.price === 0 ? "Free" : `₹${event.price}`}</td>
                    <td>
                      <span className={`status ${event.status}`}>
                        {event.status}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="btn-edit"
                          onClick={() => handleEdit(event)}
                        >
                          Edit
                        </button>

                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(event._id)}
                        >
                          Delete
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

export default ManageEvents;