import { Link } from "react-router-dom";
import "../styles/home.css";

const Home = () => {
  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1>
            Discover, Book & Manage <span>Amazing Events</span>
          </h1>
          <p>
            EventHub helps users explore upcoming events, book seats, manage
            registrations, and lets admins control events, users, categories and
            bookings from one dashboard.
          </p>

          <div className="hero-buttons">
            <Link to="/events" className="btn-primary">
              Explore Events
            </Link>
            <Link to="/register" className="btn-outline">
              Get Started
            </Link>
          </div>
        </div>

        <div className="hero-image"></div>
      </section>

      <section className="home-section">
        <div className="section-title">
          <h2>Why EventHub?</h2>
          <p>A complete event management system for users and admins.</p>
        </div>

        <div className="feature-grid">
          <div className="feature-card">
            <h3>Upcoming Events</h3>
            <p>Browse upcoming workshops, conferences, concerts and seminars.</p>
          </div>

          <div className="feature-card">
            <h3>Easy Booking</h3>
            <p>Register for events, track your bookings and cancel anytime.</p>
          </div>

          <div className="feature-card">
            <h3>Admin Control</h3>
            <p>Admins can manage events, categories, users and registrations.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;