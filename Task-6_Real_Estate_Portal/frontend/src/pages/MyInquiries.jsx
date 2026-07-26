import { useEffect, useMemo, useState } from "react";
import {
  FaArrowRight,
  FaBuilding,
  FaCalendarAlt,
  FaEnvelopeOpenText,
  FaHome,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaSearch,
  FaUser,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import api from "../services/api";
import "../styles/properties.css";

const FALLBACK_PROPERTY_IMAGE =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80";

const getInquiriesFromResponse = (responseData) => {
  if (Array.isArray(responseData)) {
    return responseData;
  }

  if (Array.isArray(responseData?.inquiries)) {
    return responseData.inquiries;
  }

  if (Array.isArray(responseData?.data?.inquiries)) {
    return responseData.data.inquiries;
  }

  if (Array.isArray(responseData?.data)) {
    return responseData.data;
  }

  return [];
};

const normalizeText = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

const formatLabel = (value) => {
  if (!value) {
    return "Pending";
  }

  return String(value)
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

const formatDate = (value) => {
  if (!value) {
    return "Recently";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
};

const formatPrice = (price) => {
  const numericPrice = Number(price);

  if (!Number.isFinite(numericPrice)) {
    return "Price on request";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(numericPrice);
};

const getPropertyFromInquiry = (inquiry) => {
  return inquiry?.property || inquiry?.propertyId || {};
};

const getPropertyId = (property) => {
  return property?._id || property?.id || "";
};

const getPropertyImage = (property) => {
  if (Array.isArray(property?.images) && property.images.length > 0) {
    const firstImage = property.images[0];

    if (typeof firstImage === "string") {
      return firstImage;
    }

    return firstImage?.url || firstImage?.secure_url || FALLBACK_PROPERTY_IMAGE;
  }

  return (
    property?.image ||
    property?.imageUrl ||
    property?.thumbnail ||
    FALLBACK_PROPERTY_IMAGE
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

const getPriceSuffix = (property) => {
  return normalizeText(getListingPurpose(property)) === "rent" ? "/month" : "";
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
  ].filter(Boolean);

  return parts.length
    ? [...new Set(parts)].join(", ")
    : "Location not specified";
};

const getStatusClass = (status) => {
  const normalizedStatus = normalizeText(status || "pending");

  if (["approved", "resolved", "completed", "accepted"].includes(normalizedStatus)) {
    return "my-inquiry-status-success";
  }

  if (["rejected", "cancelled", "declined"].includes(normalizedStatus)) {
    return "my-inquiry-status-danger";
  }

  if (["reviewing", "in progress", "contacted"].includes(normalizedStatus)) {
    return "my-inquiry-status-info";
  }

  return "my-inquiry-status-warning";
};

const MyInquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchInquiries = async () => {
    setLoading(true);
    setPageError("");

    try {
      const response = await api.get("/inquiries/my-inquiries");
      const inquiryList = getInquiriesFromResponse(response.data);

      setInquiries(inquiryList);
    } catch (error) {
      setInquiries([]);

      setPageError(
        error.response?.data?.message ||
          error.message ||
          "Unable to load your inquiries."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const availableStatuses = useMemo(() => {
    const statuses = inquiries
      .map((inquiry) => normalizeText(inquiry?.status || "pending"))
      .filter(Boolean);

    return [...new Set(statuses)];
  }, [inquiries]);

  const filteredInquiries = useMemo(() => {
    const searchTerm = normalizeText(search);
    const selectedStatus = normalizeText(statusFilter);

    return inquiries.filter((inquiry) => {
      const property = getPropertyFromInquiry(inquiry);

      const searchableContent = [
        inquiry?.name,
        inquiry?.email,
        inquiry?.phone,
        inquiry?.message,
        inquiry?.status,
        property?.title,
        property?.propertyType,
        getPropertyLocation(property),
      ]
        .map(normalizeText)
        .join(" ");

      const matchesSearch =
        !searchTerm || searchableContent.includes(searchTerm);

      const matchesStatus =
        !selectedStatus ||
        normalizeText(inquiry?.status || "pending") === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [inquiries, search, statusFilter]);

  return (
    <main className="my-inquiries-page">
      <section className="my-inquiries-hero">
        <div className="container my-inquiries-hero-content">
          <span>
            <FaEnvelopeOpenText />
            My Inquiries
          </span>

          <h1>Track every property conversation from one place.</h1>

          <p>
            View your sent inquiries, check their latest status and quickly
            return to the property details whenever needed.
          </p>
        </div>
      </section>

      <section className="my-inquiries-main-section">
        <div className="container">
          <div className="my-inquiries-toolbar">
            <div>
              <span>Inquiry history</span>

              <h2>
                {loading
                  ? "Loading inquiries..."
                  : `${filteredInquiries.length} ${
                      filteredInquiries.length === 1 ? "inquiry" : "inquiries"
                    } found`}
              </h2>
            </div>

            <Link to="/properties" className="my-inquiries-browse-button">
              <FaSearch />
              Browse Properties
            </Link>
          </div>

          <div className="my-inquiries-filter-panel">
            <label>
              <span>Search inquiries</span>

              <div>
                <FaSearch />

                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by property, message, email or phone"
                />
              </div>
            </label>

            <label>
              <span>Status</span>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="">All statuses</option>

                {availableStatuses.map((status) => (
                  <option key={status} value={status}>
                    {formatLabel(status)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {loading && (
            <div className="my-inquiries-list">
              {Array.from({ length: 3 }).map((_, index) => (
                <article className="my-inquiry-skeleton-card" key={index}>
                  <div className="my-inquiry-skeleton my-inquiry-skeleton-image" />

                  <div className="my-inquiry-skeleton-content">
                    <div className="my-inquiry-skeleton my-inquiry-skeleton-title" />
                    <div className="my-inquiry-skeleton my-inquiry-skeleton-line" />
                    <div className="my-inquiry-skeleton my-inquiry-skeleton-line short" />
                  </div>
                </article>
              ))}
            </div>
          )}

          {!loading && pageError && (
            <div className="my-inquiries-state-card my-inquiries-error-state">
              <span>
                <FaBuilding />
              </span>

              <h3>Your inquiries could not be loaded</h3>

              <p>{pageError}</p>

              <button type="button" onClick={fetchInquiries}>
                Try Again
              </button>
            </div>
          )}

          {!loading && !pageError && inquiries.length === 0 && (
            <div className="my-inquiries-state-card">
              <span>
                <FaEnvelopeOpenText />
              </span>

              <h3>No inquiries sent yet</h3>

              <p>
                Open a property details page and send an inquiry to contact the
                owner. Your submitted inquiries will appear here.
              </p>

              <Link to="/properties">
                <FaSearch />
                Explore Properties
              </Link>
            </div>
          )}

          {!loading &&
            !pageError &&
            inquiries.length > 0 &&
            filteredInquiries.length === 0 && (
              <div className="my-inquiries-state-card">
                <span>
                  <FaSearch />
                </span>

                <h3>No matching inquiries found</h3>

                <p>
                  Try changing the search text or clearing the status filter.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("");
                  }}
                >
                  Clear Filters
                </button>
              </div>
            )}

          {!loading && !pageError && filteredInquiries.length > 0 && (
            <div className="my-inquiries-list">
              {filteredInquiries.map((inquiry) => {
                const property = getPropertyFromInquiry(inquiry);
                const propertyId = getPropertyId(property);
                const propertyImage = getPropertyImage(property);
                const listingPurpose = getListingPurpose(property);
                const propertyPrice = getPropertyPrice(property);

                return (
                  <article
                    className="my-inquiry-card"
                    key={inquiry?._id || inquiry?.id}
                  >
                    <Link
                      to={propertyId ? `/properties/${propertyId}` : "/properties"}
                      className="my-inquiry-property-image"
                    >
                      <img
                        src={propertyImage}
                        alt={property?.title || "Property inquiry"}
                        onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src = FALLBACK_PROPERTY_IMAGE;
                        }}
                      />
                    </Link>

                    <div className="my-inquiry-content">
                      <div className="my-inquiry-header">
                        <div>
                          <div className="my-inquiry-badges">
                            <span>{formatLabel(property?.propertyType)}</span>

                            {listingPurpose && (
                              <strong>For {listingPurpose}</strong>
                            )}
                          </div>

                          <Link
                            to={
                              propertyId
                                ? `/properties/${propertyId}`
                                : "/properties"
                            }
                            className="my-inquiry-title"
                          >
                            {property?.title || "Property details unavailable"}
                          </Link>
                        </div>

                        <span
                          className={`my-inquiry-status ${getStatusClass(
                            inquiry?.status
                          )}`}
                        >
                          {formatLabel(inquiry?.status || "pending")}
                        </span>
                      </div>

                      <p className="my-inquiry-location">
                        <FaMapMarkerAlt />
                        {getPropertyLocation(property)}
                      </p>

                      <div className="my-inquiry-meta-grid">
                        <div>
                          <FaHome />
                          <span>Price</span>
                          <strong>
                            {formatPrice(propertyPrice)}
                            {propertyPrice && (
                              <small>{getPriceSuffix(property)}</small>
                            )}
                          </strong>
                        </div>

                        <div>
                          <FaUser />
                          <span>Name</span>
                          <strong>{inquiry?.name || "N/A"}</strong>
                        </div>

                        <div>
                          <FaPhoneAlt />
                          <span>Phone</span>
                          <strong>{inquiry?.phone || "N/A"}</strong>
                        </div>

                        <div>
                          <FaCalendarAlt />
                          <span>Sent on</span>
                          <strong>{formatDate(inquiry?.createdAt)}</strong>
                        </div>
                      </div>

                      <div className="my-inquiry-message">
                        <span>Your message</span>

                        <p>
                          {inquiry?.message ||
                            "No inquiry message was provided."}
                        </p>
                      </div>

                      <div className="my-inquiry-footer">
                        <span>
                          <FaEnvelopeOpenText />
                          {inquiry?.email || "Email not available"}
                        </span>

                        <Link
                          to={
                            propertyId
                              ? `/properties/${propertyId}`
                              : "/properties"
                          }
                        >
                          View Property
                          <FaArrowRight />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default MyInquiries;