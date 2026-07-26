import {
  FaEnvelope,
  FaFacebookF,
  FaHome,
  FaInstagram,
  FaLinkedinIn,
  FaMapMarkerAlt,
  FaPhoneAlt,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import "../styles/footer.css";

const FOOTER_CONTACT = {
  location: "Mathura, Uttar Pradesh, India",
  phone: "+91 9027995348",
  email: "goku902799@gmail.com",
};

const FOOTER_SOCIAL_LINKS = {
  facebook: "#",
  instagram: "#",
  linkedin: "#",
};

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="footer-container footer-grid">
          <div className="footer-brand-column">
            <Link to="/" className="footer-brand">
              <span className="footer-brand-icon">
                <FaHome />
              </span>

              <span>
                Home<strong>Nest</strong>
              </span>
            </Link>

            <p>
              Discover carefully listed homes, apartments and commercial
              properties through a modern and trusted real estate platform.
            </p>

            <div className="footer-social-links">
              <a
                href={FOOTER_SOCIAL_LINKS.facebook}
                aria-label="Facebook"
                target="_blank"
                rel="noreferrer"
              >
                <FaFacebookF />
              </a>

              <a
                href={FOOTER_SOCIAL_LINKS.instagram}
                aria-label="Instagram"
                target="_blank"
                rel="noreferrer"
              >
                <FaInstagram />
              </a>

              <a
                href={FOOTER_SOCIAL_LINKS.linkedin}
                aria-label="LinkedIn"
                target="_blank"
                rel="noreferrer"
              >
                <FaLinkedinIn />
              </a>
            </div>
          </div>

          <div className="footer-links-column">
            <h3>Explore</h3>

            <Link to="/">Home</Link>
            <Link to="/properties">Browse Properties</Link>
            <Link to="/favorites">Saved Properties</Link>
            <Link to="/my-inquiries">My Inquiries</Link>
          </div>

          <div className="footer-links-column">
            <h3>Account</h3>

            <Link to="/login">Login</Link>
            <Link to="/register">Create Account</Link>
            <Link to="/profile">My Profile</Link>
            <Link to="/admin/dashboard">Admin Portal</Link>
          </div>

          <div className="footer-contact-column">
            <h3>Contact</h3>

            <div className="footer-contact-item">
              <FaMapMarkerAlt />
              <span>{FOOTER_CONTACT.location}</span>
            </div>

            <div className="footer-contact-item">
              <FaPhoneAlt />
              <span>{FOOTER_CONTACT.phone}</span>
            </div>

            <div className="footer-contact-item">
              <FaEnvelope />
              <span>{FOOTER_CONTACT.email}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-container footer-bottom-content">
          <p>© {currentYear} HomeNest. All rights reserved.</p>

          <p>Built for a seamless property discovery experience.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;