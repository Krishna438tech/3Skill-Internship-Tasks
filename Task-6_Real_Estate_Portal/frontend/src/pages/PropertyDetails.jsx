import { useEffect, useMemo, useState } from "react";
import {
  FaArrowLeft,
  FaBath,
  FaBed,
  FaBuilding,
  FaCalendarAlt,
  FaCheckCircle,
  FaEnvelope,
  FaHeart,
  FaHome,
  FaImages,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaRegHeart,
  FaRulerCombined,
  FaShieldAlt,
  FaTimes,
  FaUser,
} from "react-icons/fa";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import "../styles/properties.css";

const FALLBACK_PROPERTY_IMAGE =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=85";

const normalizeText = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

const formatLabel = (value) => {
  if (!value) {
    return "Not specified";
  }

  return String(value)
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

const formatPrice = (value) => {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "Price on request";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (value) => {
  if (!value) {
    return "Recently added";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently added";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
};

const getPropertyFromResponse = (responseData) => {
  return (
    responseData?.property ||
    responseData?.data?.property ||
    responseData?.data ||
    responseData ||
    null
  );
};

const getListingPurpose = (property) => {
  const value =
    property?.listingPurpose ||
    property?.listingType ||
    property?.purpose ||
    "";

  const normalizedValue = normalizeText(value);

  if (
    ["rent", "rental", "for rent", "lease", "leasing"].includes(
      normalizedValue
    )
  ) {
    return "Rent";
  }

  if (
    ["sale", "sell", "selling", "for sale", "buy"].includes(normalizedValue)
  ) {
    return "Sale";
  }

  return value ? formatLabel(value) : "";
};

const getPropertyPrice = (property) => {
  if (normalizeText(getListingPurpose(property)) === "rent") {
    return property?.monthlyRent ?? property?.price ?? null;
  }

  return property?.price ?? property?.salePrice ?? null;
};

const getPropertyLocation = (property) => {
  if (typeof property?.location === "string" && property.location.trim()) {
    return property.location.trim();
  }

  const location = property?.location;

  const parts = [
    location?.address,
    location?.locality,
    location?.city,
    property?.address,
    property?.locality,
    property?.city,
    property?.state,
    property?.pincode,
  ].filter(Boolean);

  return parts.length
    ? [...new Set(parts)].join(", ")
    : "Location not specified";
};

const getPropertyImages = (property) => {
  const images = [];

  if (Array.isArray(property?.images)) {
    property.images.forEach((image) => {
      if (typeof image === "string" && image.trim()) {
        images.push(image);
      } else if (image && typeof image === "object") {
        const url = image.url || image.secure_url || image.imageUrl;

        if (url) {
          images.push(url);
        }
      }
    });
  }

  const singleImages = [
    property?.image,
    property?.imageUrl,
    property?.thumbnail,
  ].filter(Boolean);

  images.push(...singleImages);

  const uniqueImages = [...new Set(images)];

  return uniqueImages.length ? uniqueImages : [FALLBACK_PROPERTY_IMAGE];
};

const getOwnerName = (property) =>
  property?.owner?.name ||
  property?.createdBy?.name ||
  property?.user?.name ||
  property?.ownerName ||
  "HomeNest Property Owner";

const getOwnerEmail = (property) =>
  property?.owner?.email ||
  property?.createdBy?.email ||
  property?.user?.email ||
  property?.ownerEmail ||
  "";

const getOwnerPhone = (property) =>
  property?.owner?.phone ||
  property?.createdBy?.phone ||
  property?.user?.phone ||
  property?.ownerPhone ||
  "";

const PropertyDetails = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const [activeImage, setActiveImage] = useState(0);
  const [galleryOpen, setGalleryOpen] = useState(false);

  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const [inquiryForm, setInquiryForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    message: "",
  });

  const [inquiryErrors, setInquiryErrors] = useState({});
  const [inquirySubmitting, setInquirySubmitting] = useState(false);

  const fetchProperty = async () => {
    if (!id) {
      setPageError("Property ID is missing.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setPageError("");

    try {
      const response = await api.get(`/properties/${id}`);
      const propertyData = getPropertyFromResponse(response.data);

      if (!propertyData || typeof propertyData !== "object") {
        throw new Error("Property information is unavailable.");
      }

      setProperty(propertyData);
      setActiveImage(0);
    } catch (error) {
      setProperty(null);

      setPageError(
        error.response?.data?.message ||
          error.message ||
          "Unable to load this property."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperty();
  }, [id]);

  useEffect(() => {
    setInquiryForm((previous) => ({
      ...previous,
      name: previous.name || user?.name || "",
      email: previous.email || user?.email || "",
      phone: previous.phone || user?.phone || "",
    }));
  }, [user]);

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!isAuthenticated || !id) {
        setIsFavorite(false);
        return;
      }

      try {
        const response = await api.get("/favorites/my-favorites");

        const favoriteList = Array.isArray(response.data)
          ? response.data
          : response.data?.favorites ||
            response.data?.data?.favorites ||
            response.data?.data ||
            [];

        const exists = Array.isArray(favoriteList)
          ? favoriteList.some((favorite) => {
              const favoriteProperty =
                favorite?.property || favorite?.propertyId || favorite;

              const favoritePropertyId =
                favoriteProperty?._id ||
                favoriteProperty?.id ||
                favorite?.propertyId;

              return String(favoritePropertyId) === String(id);
            })
          : false;

        setIsFavorite(exists);
      } catch {
        setIsFavorite(false);
      }
    };

    checkFavoriteStatus();
  }, [id, isAuthenticated]);

  const propertyImages = useMemo(
    () => getPropertyImages(property),
    [property]
  );

  const propertyPurpose = getListingPurpose(property);
  const propertyPrice = getPropertyPrice(property);
  const propertyLocation = getPropertyLocation(property);
  const ownerName = getOwnerName(property);
  const ownerEmail = getOwnerEmail(property);
  const ownerPhone = getOwnerPhone(property);

  const goToLogin = () => {
    navigate("/login", {
      state: {
        from: location.pathname,
      },
    });
  };

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to save properties");
      goToLogin();
      return;
    }

    if (favoriteLoading) {
      return;
    }

    setFavoriteLoading(true);

    try {
      if (isFavorite) {
        await api.delete(`/favorites/${id}`);
        setIsFavorite(false);
        toast.success("Property removed from favorites");
      } else {
        await api.post("/favorites", {
          propertyId: id,
          property: id,
        });

        setIsFavorite(true);
        toast.success("Property saved to favorites");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Unable to update favorites"
      );
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleInquiryChange = (event) => {
    const { name, value } = event.target;

    setInquiryForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (inquiryErrors[name]) {
      setInquiryErrors((previous) => ({
        ...previous,
        [name]: "",
      }));
    }
  };

  const validateInquiry = () => {
    const errors = {};

    if (!inquiryForm.name.trim()) {
      errors.name = "Name is required";
    }

    if (!inquiryForm.email.trim()) {
      errors.email = "Email is required";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inquiryForm.email.trim())
    ) {
      errors.email = "Enter a valid email address";
    }

    if (!inquiryForm.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!/^[0-9+\-\s]{8,15}$/.test(inquiryForm.phone.trim())) {
      errors.phone = "Enter a valid phone number";
    }

    if (!inquiryForm.message.trim()) {
      errors.message = "Please enter your inquiry message";
    } else if (inquiryForm.message.trim().length < 10) {
      errors.message = "Message must contain at least 10 characters";
    }

    setInquiryErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleInquirySubmit = async (event) => {
    event.preventDefault();

    if (!isAuthenticated) {
      toast.error("Please login to contact the property owner");
      goToLogin();
      return;
    }

    if (!validateInquiry() || inquirySubmitting) {
      return;
    }

    setInquirySubmitting(true);

    try {
      await api.post("/inquiries", {
        propertyId: id,
        property: id,
        name: inquiryForm.name.trim(),
        email: inquiryForm.email.trim().toLowerCase(),
        phone: inquiryForm.phone.trim(),
        message: inquiryForm.message.trim(),
      });

      toast.success("Your inquiry has been sent successfully");

      setInquiryForm((previous) => ({
        ...previous,
        message: "",
      }));

      setInquiryErrors({});
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Unable to send your inquiry"
      );
    } finally {
      setInquirySubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="property-details-page">
        <div className="route-loader-wrapper">
          <div className="route-loader" />
          <p>Loading property details...</p>
        </div>
      </main>
    );
  }

  if (pageError || !property) {
    return (
      <main className="property-details-page">
        <section className="property-details-error">
          <span>
            <FaBuilding />
          </span>

          <h1>Property could not be loaded</h1>

          <p>{pageError || "This property may no longer be available."}</p>

          <div className="property-details-error-actions">
            <button type="button" onClick={fetchProperty}>
              Try Again
            </button>

            <Link to="/properties">
              <FaArrowLeft />
              Browse Properties
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="property-details-page">
      <section className="property-details-topbar">
        <div className="container property-details-topbar-content">
          <Link to="/properties" className="property-back-link">
            <FaArrowLeft />
            Back to Properties
          </Link>

          <button
            type="button"
            className={
              isFavorite
                ? "property-favorite-main property-favorite-main-active"
                : "property-favorite-main"
            }
            onClick={handleFavorite}
            disabled={favoriteLoading}
          >
            {favoriteLoading ? (
              <span className="property-button-spinner" />
            ) : isFavorite ? (
              <FaHeart />
            ) : (
              <FaRegHeart />
            )}

            {isFavorite ? "Saved to Favorites" : "Save Property"}
          </button>
        </div>
      </section>

      <section className="property-details-header">
        <div className="container">
          <div className="property-details-heading-row">
            <div>
              <div className="property-details-badges">
                <span className="property-details-purpose">
                  For {propertyPurpose || "Listing"}
                </span>

                <span className="property-details-type">
                  {formatLabel(property.propertyType)}
                </span>

                {property.status && (
                  <span className="property-details-status">
                    {formatLabel(property.status)}
                  </span>
                )}
              </div>

              <h1>{property.title || "HomeNest Property"}</h1>

              <p className="property-details-location">
                <FaMapMarkerAlt />
                {propertyLocation}
              </p>
            </div>

            <div className="property-details-price">
              <span>
                {normalizeText(propertyPurpose) === "rent"
                  ? "Monthly rent"
                  : "Property price"}
              </span>

              <strong>{formatPrice(propertyPrice)}</strong>

              {normalizeText(propertyPurpose) === "rent" && <small>/month</small>}
            </div>
          </div>
        </div>
      </section>

      <section className="property-gallery-section">
        <div className="container">
          <div className="property-gallery-grid">
            <button
              type="button"
              className="property-main-image"
              onClick={() => setGalleryOpen(true)}
            >
              <img
                src={propertyImages[0]}
                alt={property.title || "Property"}
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = FALLBACK_PROPERTY_IMAGE;
                }}
              />

              <span>
                <FaImages />
                View Gallery
              </span>
            </button>

            <div className="property-gallery-thumbnails">
              {propertyImages.slice(1, 5).map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => {
                    setActiveImage(index + 1);
                    setGalleryOpen(true);
                  }}
                >
                  <img
                    src={image}
                    alt={`${property.title || "Property"} ${index + 2}`}
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = FALLBACK_PROPERTY_IMAGE;
                    }}
                  />
                </button>
              ))}

              {propertyImages.length === 1 && (
                <>
                  <div className="property-gallery-placeholder">
                    <FaHome />
                  </div>

                  <div className="property-gallery-placeholder">
                    <FaBuilding />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="property-details-content-section">
        <div className="container property-details-layout">
          <div className="property-details-main">
            <section className="property-overview-card">
              <div className="property-section-heading">
                <span>Property overview</span>
                <h2>Important property details</h2>
              </div>

              <div className="property-overview-grid">
                <article>
                  <FaBed />
                  <div>
                    <span>Bedrooms</span>
                    <strong>{property.bedrooms ?? "N/A"}</strong>
                  </div>
                </article>

                <article>
                  <FaBath />
                  <div>
                    <span>Bathrooms</span>
                    <strong>{property.bathrooms ?? "N/A"}</strong>
                  </div>
                </article>

                <article>
                  <FaRulerCombined />
                  <div>
                    <span>Area</span>
                    <strong>
                      {property.area ? `${property.area} sq.ft.` : "N/A"}
                    </strong>
                  </div>
                </article>

                <article>
                  <FaBuilding />
                  <div>
                    <span>Property type</span>
                    <strong>{formatLabel(property.propertyType)}</strong>
                  </div>
                </article>

                <article>
                  <FaHome />
                  <div>
                    <span>Balconies</span>
                    <strong>{property.balconies ?? "N/A"}</strong>
                  </div>
                </article>

                <article>
                  <FaCalendarAlt />
                  <div>
                    <span>Listed on</span>
                    <strong>{formatDate(property.createdAt)}</strong>
                  </div>
                </article>
              </div>
            </section>

            {normalizeText(propertyPurpose) === "rent" && (
              <section className="property-rent-card">
                <div className="property-section-heading">
                  <span>Rental information</span>
                  <h2>Monthly cost breakdown</h2>
                </div>

                <div className="property-rent-grid">
                  <article>
                    <span>Monthly Rent</span>
                    <strong>
                      {formatPrice(property.monthlyRent ?? property.price)}
                    </strong>
                  </article>

                  <article>
                    <span>Security Deposit</span>
                    <strong>{formatPrice(property.securityDeposit)}</strong>
                  </article>

                  <article>
                    <span>Maintenance Charge</span>
                    <strong>{formatPrice(property.maintenanceCharge)}</strong>
                  </article>
                </div>
              </section>
            )}

            <section className="property-description-card">
              <div className="property-section-heading">
                <span>About this property</span>
                <h2>Property description</h2>
              </div>

              <p>
                {property.description ||
                  "No detailed description has been provided for this property."}
              </p>
            </section>

            {Array.isArray(property.amenities) &&
              property.amenities.length > 0 && (
                <section className="property-amenities-card">
                  <div className="property-section-heading">
                    <span>Features and facilities</span>
                    <h2>Available amenities</h2>
                  </div>

                  <div className="property-amenities-grid">
                    {property.amenities.map((amenity, index) => (
                      <div key={`${amenity}-${index}`}>
                        <FaCheckCircle />
                        <span>{formatLabel(amenity)}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
          </div>

          <aside className="property-details-sidebar">
            <section className="property-owner-card">
              <span className="property-owner-card-label">Property contact</span>

              <div className="property-owner-profile">
                <span>{ownerName.charAt(0).toUpperCase()}</span>

                <div>
                  <h3>{ownerName}</h3>
                  <p>Property owner / representative</p>
                </div>
              </div>

              <div className="property-owner-contact">
                {ownerPhone && (
                  <div>
                    <FaPhoneAlt />
                    <span>{ownerPhone}</span>
                  </div>
                )}

                {ownerEmail && (
                  <div>
                    <FaEnvelope />
                    <span>{ownerEmail}</span>
                  </div>
                )}
              </div>

              <div className="property-owner-trust">
                <FaShieldAlt />

                <p>
                  Contact details and inquiries are securely managed through
                  your HomeNest account.
                </p>
              </div>
            </section>

            <section className="property-inquiry-card">
              <div className="property-section-heading">
                <span>Interested in this property?</span>
                <h2>Contact the owner</h2>
              </div>

              {!isAuthenticated && (
                <div className="property-login-notice">
                  <FaShieldAlt />

                  <p>
                    Login is required before sending a property inquiry.
                  </p>
                </div>
              )}

              <form onSubmit={handleInquirySubmit} noValidate>
                <label>
                  <span>Full name</span>

                  <div
                    className={
                      inquiryErrors.name
                        ? "property-inquiry-input property-inquiry-input-error"
                        : "property-inquiry-input"
                    }
                  >
                    <FaUser />

                    <input
                      type="text"
                      name="name"
                      value={inquiryForm.name}
                      onChange={handleInquiryChange}
                      placeholder="Enter your name"
                    />
                  </div>

                  {inquiryErrors.name && (
                    <small>{inquiryErrors.name}</small>
                  )}
                </label>

                <label>
                  <span>Email address</span>

                  <div
                    className={
                      inquiryErrors.email
                        ? "property-inquiry-input property-inquiry-input-error"
                        : "property-inquiry-input"
                    }
                  >
                    <FaEnvelope />

                    <input
                      type="email"
                      name="email"
                      value={inquiryForm.email}
                      onChange={handleInquiryChange}
                      placeholder="Enter your email"
                    />
                  </div>

                  {inquiryErrors.email && (
                    <small>{inquiryErrors.email}</small>
                  )}
                </label>

                <label>
                  <span>Phone number</span>

                  <div
                    className={
                      inquiryErrors.phone
                        ? "property-inquiry-input property-inquiry-input-error"
                        : "property-inquiry-input"
                    }
                  >
                    <FaPhoneAlt />

                    <input
                      type="tel"
                      name="phone"
                      value={inquiryForm.phone}
                      onChange={handleInquiryChange}
                      placeholder="Enter your phone number"
                    />
                  </div>

                  {inquiryErrors.phone && (
                    <small>{inquiryErrors.phone}</small>
                  )}
                </label>

                <label>
                  <span>Your message</span>

                  <textarea
                    name="message"
                    value={inquiryForm.message}
                    onChange={handleInquiryChange}
                    placeholder="I am interested in this property. Please share more details."
                    className={
                      inquiryErrors.message
                        ? "property-inquiry-textarea property-inquiry-input-error"
                        : "property-inquiry-textarea"
                    }
                    rows="5"
                  />

                  {inquiryErrors.message && (
                    <small>{inquiryErrors.message}</small>
                  )}
                </label>

                <button
                  type="submit"
                  className="property-inquiry-submit"
                  disabled={inquirySubmitting}
                >
                  {inquirySubmitting ? (
                    <>
                      <span className="property-button-spinner" />
                      Sending Inquiry...
                    </>
                  ) : (
                    <>
                      <FaEnvelope />
                      Send Inquiry
                    </>
                  )}
                </button>
              </form>
            </section>
          </aside>
        </div>
      </section>

      {galleryOpen && (
        <div className="property-gallery-modal">
          <button
            type="button"
            className="property-gallery-close"
            onClick={() => setGalleryOpen(false)}
            aria-label="Close gallery"
          >
            <FaTimes />
          </button>

          <img
            src={propertyImages[activeImage]}
            alt={property.title || "Property gallery"}
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = FALLBACK_PROPERTY_IMAGE;
            }}
          />

          {propertyImages.length > 1 && (
            <div className="property-gallery-modal-thumbnails">
              {propertyImages.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  className={
                    activeImage === index
                      ? "property-gallery-modal-thumb active"
                      : "property-gallery-modal-thumb"
                  }
                  onClick={() => setActiveImage(index)}
                >
                  <img src={image} alt={`Gallery ${index + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
};

export default PropertyDetails;