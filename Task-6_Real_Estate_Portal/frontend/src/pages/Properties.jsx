import { useEffect, useMemo, useState } from "react";
import {
  FaArrowRight,
  FaBath,
  FaBed,
  FaBuilding,
  FaHome,
  FaMapMarkerAlt,
  FaRulerCombined,
  FaSearch,
  FaSlidersH,
  FaTimes,
} from "react-icons/fa";
import { Link, useSearchParams } from "react-router-dom";
import api from "../services/api";
import "../styles/properties.css";

const FALLBACK_PROPERTY_IMAGE =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80";

const PROPERTY_TYPE_OPTIONS = [
  { value: "Flat", label: "Flat" },
  { value: "Apartment", label: "Apartment" },
  { value: "House", label: "House" },
  { value: "Villa", label: "Villa" },
  { value: "Bungalow", label: "Bungalow" },
  { value: "Plot", label: "Plot" },
  { value: "Commercial", label: "Commercial" },
];

const LISTING_PURPOSE_OPTIONS = [
  { value: "Sale", label: "For Sale" },
  { value: "Rent", label: "For Rent" },
];

const getPropertiesFromResponse = (responseData) => {
  if (Array.isArray(responseData)) {
    return responseData;
  }

  if (Array.isArray(responseData?.properties)) {
    return responseData.properties;
  }

  if (Array.isArray(responseData?.data?.properties)) {
    return responseData.data.properties;
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
    return "";
  }

  return String(value)
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

const getPropertyId = (property) => property?._id || property?.id || "";

const getPropertyImage = (property) => {
  if (Array.isArray(property?.images) && property.images.length > 0) {
    const firstImage = property.images[0];

    if (typeof firstImage === "string") {
      return firstImage;
    }

    return (
      firstImage?.url ||
      firstImage?.secure_url ||
      firstImage?.imageUrl ||
      FALLBACK_PROPERTY_IMAGE
    );
  }

  return (
    property?.image ||
    property?.imageUrl ||
    property?.thumbnail ||
    FALLBACK_PROPERTY_IMAGE
  );
};

const getPropertyType = (property) =>
  property?.propertyType ||
  property?.type ||
  property?.category ||
  "Property";

const getListingPurpose = (property) => {
  const rawPurpose =
    property?.listingPurpose ||
    property?.listingType ||
    property?.purpose ||
    property?.propertyFor ||
    "";

  const normalizedPurpose = normalizeText(rawPurpose);

  if (
    ["rent", "rental", "for rent", "lease", "leasing"].includes(
      normalizedPurpose
    )
  ) {
    return "Rent";
  }

  if (
    ["sale", "sell", "selling", "for sale", "buy"].includes(normalizedPurpose)
  ) {
    return "Sale";
  }

  return rawPurpose ? formatLabel(rawPurpose) : "";
};

const getPropertyLocation = (property) => {
  if (typeof property?.location === "string" && property.location.trim()) {
    return property.location.trim();
  }

  const locationObject = property?.location;

  const locationParts = [
    locationObject?.address,
    locationObject?.locality,
    locationObject?.city,
    property?.address,
    property?.locality,
    property?.city,
    property?.state,
  ].filter(Boolean);

  return locationParts.length
    ? [...new Set(locationParts)].join(", ")
    : "Location not specified";
};

const getPropertyArea = (property) =>
  property?.area ||
  property?.size ||
  property?.squareFeet ||
  property?.sqft ||
  null;

const getPropertyPrice = (property) => {
  const listingPurpose = getListingPurpose(property);

  if (normalizeText(listingPurpose) === "rent") {
    return property?.monthlyRent ?? property?.price ?? null;
  }

  return property?.price ?? property?.salePrice ?? null;
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

const getPriceSuffix = (property) =>
  normalizeText(getListingPurpose(property)) === "rent" ? "/month" : "";

const getOwnerName = (property) =>
  property?.owner?.name ||
  property?.user?.name ||
  property?.createdBy?.name ||
  property?.ownerName ||
  "HomeNest";

const PropertyCard = ({ property }) => {
  const propertyId = getPropertyId(property);
  const propertyImage = getPropertyImage(property);
  const propertyType = getPropertyType(property);
  const listingPurpose = getListingPurpose(property);
  const propertyLocation = getPropertyLocation(property);
  const propertyArea = getPropertyArea(property);
  const propertyPrice = getPropertyPrice(property);
  const ownerName = getOwnerName(property);

  return (
    <article className="property-card">
      <Link
        to={propertyId ? `/properties/${propertyId}` : "/properties"}
        className="property-card-image-link"
        aria-label={`View details of ${
          property?.title || "HomeNest property"
        }`}
      >
        <img
          src={propertyImage}
          alt={property?.title || "HomeNest property"}
          className="property-card-image"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = FALLBACK_PROPERTY_IMAGE;
          }}
        />

        <div className="property-card-image-overlay" />

        <div className="property-card-badges">
          {listingPurpose && (
            <span className="property-listing-badge">
              For {listingPurpose}
            </span>
          )}

          <span className="property-type-badge">
            {formatLabel(propertyType)}
          </span>
        </div>
      </Link>

      <div className="property-card-content">
        <div className="property-card-price-row">
          <h3>
            {formatPrice(propertyPrice)}
            {propertyPrice && (
              <small className="property-price-suffix">
                {getPriceSuffix(property)}
              </small>
            )}
          </h3>

          {property?.status && (
            <span
              className={`property-status property-status-${normalizeText(
                property.status
              )}`}
            >
              {formatLabel(property.status)}
            </span>
          )}
        </div>

        <Link
          to={propertyId ? `/properties/${propertyId}` : "/properties"}
          className="property-card-title"
        >
          {property?.title || "Untitled Property"}
        </Link>

        <p className="property-card-location">
          <FaMapMarkerAlt />
          <span>{propertyLocation}</span>
        </p>

        <div className="property-card-features">
          <span>
            <FaBed />
            {property?.bedrooms ?? property?.beds ?? "—"} Beds
          </span>

          <span>
            <FaBath />
            {property?.bathrooms ?? property?.baths ?? "—"} Baths
          </span>

          <span>
            <FaRulerCombined />
            {propertyArea ? `${propertyArea} sq.ft.` : "Area N/A"}
          </span>
        </div>

        <div className="property-card-footer">
          <div className="property-card-owner">
            <span className="property-owner-avatar">
              {ownerName.charAt(0).toUpperCase()}
            </span>

            <div>
              <small>Listed by</small>
              <strong>{ownerName}</strong>
            </div>
          </div>

          <Link
            to={propertyId ? `/properties/${propertyId}` : "/properties"}
            className="property-view-button"
          >
            View Details
            <FaArrowRight />
          </Link>
        </div>
      </div>
    </article>
  );
};

const PropertySkeleton = () => (
  <article className="property-card property-skeleton-card">
    <div className="property-skeleton property-skeleton-image" />

    <div className="property-card-content">
      <div className="property-skeleton property-skeleton-price" />
      <div className="property-skeleton property-skeleton-title" />
      <div className="property-skeleton property-skeleton-location" />

      <div className="property-card-features">
        <div className="property-skeleton property-skeleton-feature" />
        <div className="property-skeleton property-skeleton-feature" />
        <div className="property-skeleton property-skeleton-feature" />
      </div>

      <div className="property-skeleton property-skeleton-footer" />
    </div>
  </article>
);

const Properties = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    propertyType: searchParams.get("propertyType") || "",
    listingPurpose:
      searchParams.get("listingPurpose") ||
      searchParams.get("listingType") ||
      "",
    sort: searchParams.get("sort") || "newest",
  });

  const fetchProperties = async () => {
    setLoading(true);
    setApiError("");

    try {
      const response = await api.get("/properties");
      setProperties(getPropertiesFromResponse(response.data));
    } catch (error) {
      setProperties([]);

      setApiError(
        error.response?.data?.message ||
          error.message ||
          "Unable to load properties right now."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    setFilters({
      search: searchParams.get("search") || "",
      propertyType: searchParams.get("propertyType") || "",
      listingPurpose:
        searchParams.get("listingPurpose") ||
        searchParams.get("listingType") ||
        "",
      sort: searchParams.get("sort") || "newest",
    });
  }, [searchParams]);

  const filteredProperties = useMemo(() => {
    const searchTerm = normalizeText(filters.search);
    const selectedPropertyType = normalizeText(filters.propertyType);
    const selectedListingPurpose = normalizeText(filters.listingPurpose);

    const matchingProperties = properties.filter((property) => {
      const searchableContent = [
        property?.title,
        property?.description,
        property?.address,
        property?.locality,
        property?.city,
        property?.state,
        getPropertyLocation(property),
        getPropertyType(property),
        getListingPurpose(property),
      ]
        .map(normalizeText)
        .join(" ");

      const currentPropertyType = normalizeText(getPropertyType(property));
      const currentListingPurpose = normalizeText(
        getListingPurpose(property)
      );

      const matchesSearch =
        !searchTerm || searchableContent.includes(searchTerm);

      const flatApartmentAlias =
        (selectedPropertyType === "flat" &&
          currentPropertyType === "apartment") ||
        (selectedPropertyType === "apartment" &&
          currentPropertyType === "flat");

      const matchesPropertyType =
        !selectedPropertyType ||
        currentPropertyType === selectedPropertyType ||
        flatApartmentAlias;

      const matchesListingPurpose =
        !selectedListingPurpose ||
        currentListingPurpose === selectedListingPurpose;

      return matchesSearch && matchesPropertyType && matchesListingPurpose;
    });

    return [...matchingProperties].sort((firstProperty, secondProperty) => {
      const firstPrice = Number(getPropertyPrice(firstProperty)) || 0;
      const secondPrice = Number(getPropertyPrice(secondProperty)) || 0;

      const firstDate =
        new Date(
          firstProperty?.createdAt || firstProperty?.updatedAt || 0
        ).getTime() || 0;

      const secondDate =
        new Date(
          secondProperty?.createdAt || secondProperty?.updatedAt || 0
        ).getTime() || 0;

      switch (filters.sort) {
        case "price-low":
          return firstPrice - secondPrice;

        case "price-high":
          return secondPrice - firstPrice;

        case "oldest":
          return firstDate - secondDate;

        case "newest":
        default:
          return secondDate - firstDate;
      }
    });
  }, [properties, filters]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    setFilters((previousFilters) => ({
      ...previousFilters,
      [name]: value,
    }));
  };

  const handleFilterSubmit = (event) => {
    event.preventDefault();

    const nextParams = new URLSearchParams();

    if (filters.search.trim()) {
      nextParams.set("search", filters.search.trim());
    }

    if (filters.propertyType) {
      nextParams.set("propertyType", filters.propertyType);
    }

    if (filters.listingPurpose) {
      nextParams.set("listingPurpose", filters.listingPurpose);
    }

    if (filters.sort !== "newest") {
      nextParams.set("sort", filters.sort);
    }

    setSearchParams(nextParams);
    setFiltersOpen(false);
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      propertyType: "",
      listingPurpose: "",
      sort: "newest",
    });

    setSearchParams({});
  };

  const hasActiveFilters =
    Boolean(filters.search.trim()) ||
    Boolean(filters.propertyType) ||
    Boolean(filters.listingPurpose) ||
    filters.sort !== "newest";

  return (
    <main className="properties-page">
      <section className="properties-hero">
        <div className="properties-hero-overlay" />

        <div className="container properties-hero-content">
          <span className="properties-hero-eyebrow">
            <FaHome />
            Explore HomeNest listings
          </span>

          <h1>Find properties designed around your next move.</h1>

          <p>
            Search available homes, apartments, villas and commercial spaces
            using filters that make property discovery simple.
          </p>
        </div>
      </section>

      <section className="properties-main-section">
        <div className="container">
          <div className="properties-toolbar">
            <div>
              <span className="properties-results-label">
                Available properties
              </span>

              <h2>
                {loading
                  ? "Loading listings..."
                  : `${filteredProperties.length} ${
                      filteredProperties.length === 1
                        ? "property"
                        : "properties"
                    } found`}
              </h2>
            </div>

            <button
              type="button"
              className="properties-mobile-filter-button"
              onClick={() => setFiltersOpen((previous) => !previous)}
            >
              {filtersOpen ? <FaTimes /> : <FaSlidersH />}
              {filtersOpen ? "Close Filters" : "Show Filters"}
            </button>
          </div>

          <form
            className={
              filtersOpen
                ? "properties-filter-panel properties-filter-panel-open"
                : "properties-filter-panel"
            }
            onSubmit={handleFilterSubmit}
          >
            <label className="properties-filter-field properties-search-field">
              <span>Search location or property</span>

              <div>
                <FaSearch />

                <input
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Search by title, city or location"
                />
              </div>
            </label>

            <label className="properties-filter-field">
              <span>Property type</span>

              <div>
                <FaBuilding />

                <select
                  name="propertyType"
                  value={filters.propertyType}
                  onChange={handleFilterChange}
                >
                  <option value="">All property types</option>

                  {PROPERTY_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </label>

            <label className="properties-filter-field">
              <span>Listing purpose</span>

              <div>
                <FaHome />

                <select
                  name="listingPurpose"
                  value={filters.listingPurpose}
                  onChange={handleFilterChange}
                >
                  <option value="">Sale or rent</option>

                  {LISTING_PURPOSE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </label>

            <label className="properties-filter-field">
              <span>Sort listings</span>

              <select
                name="sort"
                value={filters.sort}
                onChange={handleFilterChange}
                className="properties-sort-select"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="price-low">Price: low to high</option>
                <option value="price-high">Price: high to low</option>
              </select>
            </label>

            <div className="properties-filter-actions">
              <button type="submit" className="properties-apply-button">
                <FaSearch />
                Apply Filters
              </button>

              <button
                type="button"
                className="properties-clear-button"
                onClick={clearFilters}
                disabled={!hasActiveFilters}
              >
                Clear
              </button>
            </div>
          </form>

          {loading && (
            <div className="properties-grid">
              {Array.from({ length: 6 }).map((_, index) => (
                <PropertySkeleton key={index} />
              ))}
            </div>
          )}

          {!loading && apiError && (
            <div className="properties-state-card properties-error-state">
              <span>
                <FaBuilding />
              </span>

              <h3>Properties could not be loaded</h3>
              <p>{apiError}</p>

              <button
                type="button"
                onClick={fetchProperties}
                className="properties-state-button"
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !apiError && filteredProperties.length === 0 && (
            <div className="properties-state-card">
              <span>
                <FaSearch />
              </span>

              <h3>No matching properties found</h3>

              <p>
                Try changing your search term or removing some filters to
                explore more HomeNest listings.
              </p>

              <button
                type="button"
                onClick={clearFilters}
                className="properties-state-button"
              >
                Clear All Filters
              </button>
            </div>
          )}

          {!loading && !apiError && filteredProperties.length > 0 && (
            <div className="properties-grid">
              {filteredProperties.map((property) => (
                <PropertyCard
                  key={getPropertyId(property)}
                  property={property}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default Properties;