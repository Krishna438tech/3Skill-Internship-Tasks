import { FaArrowLeft, FaHome } from "react-icons/fa";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <main className="not-found-page">
      <div className="not-found-decoration not-found-decoration-one" />
      <div className="not-found-decoration not-found-decoration-two" />

      <div className="not-found-content">
        <span className="not-found-icon">
          <FaHome />
        </span>

        <p className="not-found-code">404</p>

        <h1>This property page could not be found.</h1>

        <p>
          The page may have moved, the listing may no longer be available, or
          the address may be incorrect.
        </p>

        <div className="not-found-actions">
          <Link to="/" className="primary-button">
            <FaArrowLeft />
            Back to Home
          </Link>

          <Link to="/properties" className="secondary-button">
            Browse Properties
          </Link>
        </div>
      </div>
    </main>
  );
};

export default NotFound;