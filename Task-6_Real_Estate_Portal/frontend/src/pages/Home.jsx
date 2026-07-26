import { useState } from "react";
import {
  FaArrowRight,
  FaBuilding,
  FaCheckCircle,
  FaCity,
  FaHeart,
  FaHome,
  FaKey,
  FaMapMarkerAlt,
  FaSearch,
  FaShieldAlt,
  FaStar,
  FaUsers,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [listingPurpose, setListingPurpose] = useState("");

  const handleSearch = (event) => {
    event.preventDefault();

    const params = new URLSearchParams();

    if (search.trim()) {
      params.set("search", search.trim());
    }

    if (propertyType) {
      params.set("propertyType", propertyType);
    }

    if (listingPurpose) {
      params.set("listingPurpose", listingPurpose);
    }

    const queryString = params.toString();

    navigate(queryString ? `/properties?${queryString}` : "/properties");
  };

  return (
    <main>
      <section className="home-hero-section">
        <div className="home-hero-overlay" />

        <div className="container home-hero-content">
          <div className="home-hero-copy">
            <span className="hero-eyebrow">
              <FaMapMarkerAlt />
              Your trusted property destination
            </span>

            <h1>
              Find a place where your
              <span> next chapter begins.</span>
            </h1>

            <p>
              Explore verified homes, premium apartments and valuable
              commercial spaces through one simple and dependable platform.
            </p>

            <div className="hero-trust-row">
              <span>
                <FaCheckCircle />
                Verified listings
              </span>

              <span>
                <FaCheckCircle />
                Direct inquiries
              </span>

              <span>
                <FaCheckCircle />
                Easy favorites
              </span>
            </div>
          </div>

          <form className="property-search-card" onSubmit={handleSearch}>
            <div className="search-card-heading">
              <span>Start your search</span>
              <h2>Discover your ideal property</h2>
            </div>

            <div className="property-search-fields">
              <label className="property-search-field">
                <span>Location or property</span>

                <div>
                  <FaMapMarkerAlt />

                  <input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search by city, title or location"
                  />
                </div>
              </label>

              <label className="property-search-field">
                <span>Property type</span>

                <div>
                  <FaBuilding />

                  <select
                    value={propertyType}
                    onChange={(event) => setPropertyType(event.target.value)}
                  >
                    <option value="">All property types</option>
                    <option value="Flat">Flat</option>
                    <option value="Apartment">Apartment</option>
                    <option value="House">House</option>
                    <option value="Villa">Villa</option>
                    <option value="Bungalow">Bungalow</option>
                    <option value="Plot">Plot</option>
                    <option value="Commercial">Commercial</option>
                  </select>
                </div>
              </label>

              <label className="property-search-field">
                <span>Listing purpose</span>

                <div>
                  <FaHome />

                  <select
                    value={listingPurpose}
                    onChange={(event) =>
                      setListingPurpose(event.target.value)
                    }
                  >
                    <option value="">Sale or rent</option>
                    <option value="Sale">For Sale</option>
                    <option value="Rent">For Rent</option>
                  </select>
                </div>
              </label>

              <button type="submit" className="property-search-button">
                <FaSearch />
                Search Properties
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="home-stats-section">
        <div className="container home-stats-grid">
          <article className="home-stat-card">
            <span>
              <FaHome />
            </span>

            <div>
              <strong>Quality Listings</strong>
              <p>Carefully presented property information</p>
            </div>
          </article>

          <article className="home-stat-card">
            <span>
              <FaShieldAlt />
            </span>

            <div>
              <strong>Secure Experience</strong>
              <p>Protected accounts and reliable access</p>
            </div>
          </article>

          <article className="home-stat-card">
            <span>
              <FaUsers />
            </span>

            <div>
              <strong>Direct Connection</strong>
              <p>Send inquiries directly from property pages</p>
            </div>
          </article>

          <article className="home-stat-card">
            <span>
              <FaKey />
            </span>

            <div>
              <strong>Simple Discovery</strong>
              <p>Search, compare and save suitable homes</p>
            </div>
          </article>
        </div>
      </section>

      <section className="home-section property-types-section">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="section-eyebrow">Explore by category</span>
              <h2>Properties for every lifestyle</h2>
            </div>

            <Link to="/properties" className="section-link">
              View all properties
              <FaArrowRight />
            </Link>
          </div>

          <div className="property-type-grid">
            <Link
              to="/properties?propertyType=House"
              className="property-type-card property-type-house"
            >
              <span className="property-type-icon">
                <FaHome />
              </span>

              <div>
                <h3>Modern Houses</h3>
                <p>Comfortable homes made for family living.</p>
              </div>

              <FaArrowRight className="property-type-arrow" />
            </Link>

            <Link
              to="/properties?propertyType=Flat"
              className="property-type-card property-type-apartment"
            >
              <span className="property-type-icon">
                <FaBuilding />
              </span>

              <div>
                <h3>City Flats</h3>
                <p>Convenient residences near urban essentials.</p>
              </div>

              <FaArrowRight className="property-type-arrow" />
            </Link>

            <Link
              to="/properties?propertyType=Villa"
              className="property-type-card property-type-villa"
            >
              <span className="property-type-icon">
                <FaStar />
              </span>

              <div>
                <h3>Premium Villas</h3>
                <p>Spacious and elegant living experiences.</p>
              </div>

              <FaArrowRight className="property-type-arrow" />
            </Link>

            <Link
              to="/properties?propertyType=Commercial"
              className="property-type-card property-type-commercial"
            >
              <span className="property-type-icon">
                <FaCity />
              </span>

              <div>
                <h3>Commercial Spaces</h3>
                <p>Locations designed to support business growth.</p>
              </div>

              <FaArrowRight className="property-type-arrow" />
            </Link>
          </div>
        </div>
      </section>

      <section className="home-section home-process-section">
        <div className="container">
          <div className="section-heading section-heading-centered">
            <div>
              <span className="section-eyebrow">How HomeNest works</span>

              <h2>Your property journey made simple</h2>

              <p>
                From discovering listings to contacting owners, every step is
                designed to be clear and convenient.
              </p>
            </div>
          </div>

          <div className="home-process-grid">
            <article className="process-card">
              <span className="process-number">01</span>

              <div className="process-icon">
                <FaSearch />
              </div>

              <h3>Explore properties</h3>

              <p>
                Browse available listings and narrow results using useful
                property filters.
              </p>
            </article>

            <article className="process-card">
              <span className="process-number">02</span>

              <div className="process-icon">
                <FaHeart />
              </div>

              <h3>Save your favorites</h3>

              <p>
                Keep suitable homes in your personal favorites collection for
                easy comparison.
              </p>
            </article>

            <article className="process-card">
              <span className="process-number">03</span>

              <div className="process-icon">
                <FaUsers />
              </div>

              <h3>Contact the owner</h3>

              <p>
                Send a direct inquiry and conveniently track its latest status
                from your account.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="home-cta-section">
        <div className="container">
          <div className="home-cta-card">
            <div>
              <span>Ready to discover more?</span>

              <h2>Your next property could be one search away.</h2>

              <p>
                Browse the latest listings and find a space that matches your
                location, budget and lifestyle.
              </p>
            </div>

            <Link to="/properties" className="home-cta-button">
              Explore Properties
              <FaArrowRight />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;