import { useEffect, useState } from "react";
import {
  FaArrowRight,
  FaBath,
  FaBed,
  FaBuilding,
  FaHeart,
  FaMapMarkerAlt,
  FaRegHeart,
  FaRulerCombined,
  FaSearch,
  FaTrash,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import "../styles/properties.css";

const FALLBACK_PROPERTY_IMAGE =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80";

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

const getFavoritesFromResponse = (responseData) => {
  if (Array.isArray(responseData)) {
    return responseData;
  }

  if (Array.isArray(responseData?.favorites)) {
    return responseData.favorites;
  }

  if (Array.isArray(responseData?.data?.favorites)) {
    return responseData.data.favorites;
  }

  if (Array.isArray(responseData?.data)) {
    return responseData.data;
  }

  return [];
};

const getPropertyFromFavorite = (favorite) => {
  return favorite?.property || favorite?.propertyId || favorite;
};

const getPropertyId = (property) => {
  return property?._id || property?.id || "";
};

const getFavoriteId = (favorite) => {
  return (
    favorite?.property?._id ||
    favorite?.property?.id ||
    favorite?.propertyId?._id ||
    favorite?.propertyId?.id ||
    favorite?.propertyId ||
    favorite?._id ||
    favorite?.id ||
    ""
  );
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

const getPropertyArea = (property) => {
  return (
    property?.area ||
    property?.size ||
    property?.squareFeet ||
    property?.sqft ||
    null
  );
};

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [removingId, setRemovingId] = useState("");

  const fetchFavorites = async () => {
    setLoading(true);
    setPageError("");

    try {
      const response = await api.get("/favorites/my-favorites");
      const favoriteList = getFavoritesFromResponse(response.data);

      setFavorites(favoriteList);
    } catch (error) {
      setFavorites([]);

      setPageError(
        error.response?.data?.message ||
          error.message ||
          "Unable to load saved properties."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleRemoveFavorite = async (favorite) => {
    const property = getPropertyFromFavorite(favorite);
    const propertyId = getPropertyId(property) || getFavoriteId(favorite);

    if (!propertyId || removingId) {
      return;
    }

    setRemovingId(propertyId);

    try {
      await api.delete(`/favorites/${propertyId}`);

      setFavorites((previousFavorites) =>
        previousFavorites.filter((item) => {
          const itemProperty = getPropertyFromFavorite(item);
          const itemPropertyId = getPropertyId(itemProperty) || getFavoriteId(item);

          return String(itemPropertyId) !== String(propertyId);
        })
      );

      toast.success("Property removed from favorites");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Unable to remove property"
      );
    } finally {
      setRemovingId("");
    }
  };

  return (
    <main className="favorites-page">
      <section className="favorites-hero">
        <div className="container favorites-hero-content">
          <span>
            <FaHeart />
            Saved Properties
          </span>

          <h1>Your favorite homes in one place.</h1>

          <p>
            Review the properties you saved and quickly continue comparing,
            exploring, or contacting owners.
          </p>
        </div>
      </section>

      <section className="favorites-main-section">
        <div className="container">
          <div className="favorites-toolbar">
            <div>
              <span>My collection</span>

              <h2>
                {loading
                  ? "Loading saved properties..."
                  : `${favorites.length} ${
                      favorites.length === 1 ? "property" : "properties"
                    } saved`}
              </h2>
            </div>

            <Link to="/properties" className="favorites-browse-button">
              <FaSearch />
              Browse More
            </Link>
          </div>

          {loading && (
            <div className="favorites-grid">
              {Array.from({ length: 3 }).map((_, index) => (
                <article className="favorite-skeleton-card" key={index}>
                  <div className="favorite-skeleton favorite-skeleton-image" />
                  <div className="favorite-skeleton favorite-skeleton-title" />
                  <div className="favorite-skeleton favorite-skeleton-line" />
                  <div className="favorite-skeleton favorite-skeleton-footer" />
                </article>
              ))}
            </div>
          )}

          {!loading && pageError && (
            <div className="favorites-state-card favorites-error-state">
              <span>
                <FaBuilding />
              </span>

              <h3>Saved properties could not be loaded</h3>

              <p>{pageError}</p>

              <button type="button" onClick={fetchFavorites}>
                Try Again
              </button>
            </div>
          )}

          {!loading && !pageError && favorites.length === 0 && (
            <div className="favorites-state-card">
              <span>
                <FaRegHeart />
              </span>

              <h3>No favorite properties yet</h3>

              <p>
                Start exploring HomeNest listings and save properties you want
                to compare later.
              </p>

              <Link to="/properties">
                <FaSearch />
                Explore Properties
              </Link>
            </div>
          )}

          {!loading && !pageError && favorites.length > 0 && (
            <div className="favorites-grid">
              {favorites.map((favorite) => {
                const property = getPropertyFromFavorite(favorite);
                const propertyId = getPropertyId(property) || getFavoriteId(favorite);
                const propertyImage = getPropertyImage(property);
                const listingPurpose = getListingPurpose(property);
                const propertyPrice = getPropertyPrice(property);
                const propertyArea = getPropertyArea(property);

                return (
                  <article className="favorite-card" key={propertyId}>
                    <Link
                      to={`/properties/${propertyId}`}
                      className="favorite-card-image"
                    >
                      <img
                        src={propertyImage}
                        alt={property?.title || "Saved property"}
                        onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src = FALLBACK_PROPERTY_IMAGE;
                        }}
                      />

                      <div className="favorite-card-badges">
                        {listingPurpose && (
                          <span>For {listingPurpose}</span>
                        )}

                        <strong>{formatLabel(property?.propertyType)}</strong>
                      </div>
                    </Link>

                    <div className="favorite-card-content">
                      <div className="favorite-card-price-row">
                        <h3>
                          {formatPrice(propertyPrice)}
                          {propertyPrice && (
                            <small>{getPriceSuffix(property)}</small>
                          )}
                        </h3>

                        <button
                          type="button"
                          onClick={() => handleRemoveFavorite(favorite)}
                          disabled={removingId === propertyId}
                          aria-label="Remove favorite"
                        >
                          {removingId === propertyId ? (
                            <span className="property-button-spinner" />
                          ) : (
                            <FaTrash />
                          )}
                        </button>
                      </div>

                      <Link
                        to={`/properties/${propertyId}`}
                        className="favorite-card-title"
                      >
                        {property?.title || "Untitled Property"}
                      </Link>

                      <p className="favorite-card-location">
                        <FaMapMarkerAlt />
                        {getPropertyLocation(property)}
                      </p>

                      <div className="favorite-card-features">
                        <span>
                          <FaBed />
                          {property?.bedrooms ?? "—"} Beds
                        </span>

                        <span>
                          <FaBath />
                          {property?.bathrooms ?? "—"} Baths
                        </span>

                        <span>
                          <FaRulerCombined />
                          {propertyArea ? `${propertyArea} sq.ft.` : "Area N/A"}
                        </span>
                      </div>

                      <Link
                        to={`/properties/${propertyId}`}
                        className="favorite-view-link"
                      >
                        View Details
                        <FaArrowRight />
                      </Link>
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

export default Favorites;