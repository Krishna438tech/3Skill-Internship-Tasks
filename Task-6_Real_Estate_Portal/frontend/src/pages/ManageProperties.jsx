import { useEffect, useMemo, useState } from "react";
import {
  FaBath,
  FaBed,
  FaBuilding,
  FaChartLine,
  FaEdit,
  FaEnvelopeOpenText,
  FaEye,
  FaHome,
  FaPlus,
  FaRedoAlt,
  FaRulerCombined,
  FaSearch,
  FaTimes,
  FaTrash,
  FaUsers,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import "../styles/admin.css";

const INITIAL_FORM = {
  title: "",
  description: "",
  propertyType: "Flat",
  listingPurpose: "Rent",
  price: "",
  monthlyRent: "",
  securityDeposit: "",
  maintenanceCharge: "",
  bedrooms: "",
  bathrooms: "",
  balconies: "",
  area: "",
  city: "",
  state: "",
  location: "",
  image: "",
  ownerName: "",
  ownerEmail: "",
  ownerPhone: "",
  availabilityStatus: "Available",
  isActive: true,
  isFeatured: false,
};

const PROPERTY_TYPES = [
  "Flat",
  "Apartment",
  "House",
  "Villa",
  "Bungalow",
  "Plot",
  "Commercial",
];

const LISTING_PURPOSES = ["Rent", "Sale"];

const AVAILABILITY_STATUS = ["Available", "Rented", "Sold", "Under Review"];

const FALLBACK_PROPERTY_IMAGE =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80";

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

const formatPrice = (value) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "Price on request";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(number);
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

const getPropertyPrice = (property) => {
  if (normalizeText(property?.listingPurpose) === "rent") {
    return property?.monthlyRent ?? property?.price;
  }

  return property?.price ?? property?.salePrice;
};

const numericOrUndefined = (value) => {
  if (value === "" || value === null || value === undefined) {
    return undefined;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : undefined;
};

const buildPayload = (formData, currentUser) => {
  const imageUrl = formData.image.trim();

  const payload = {
    title: formData.title.trim(),
    description: formData.description.trim(),
    propertyType: formData.propertyType,
    listingPurpose: formData.listingPurpose,

    price: numericOrUndefined(formData.price),
    monthlyRent: numericOrUndefined(formData.monthlyRent) || 0,
    securityDeposit: numericOrUndefined(formData.securityDeposit) || 0,
    maintenanceCharge: numericOrUndefined(formData.maintenanceCharge) || 0,

    bedrooms: numericOrUndefined(formData.bedrooms) || 0,
    bathrooms: numericOrUndefined(formData.bathrooms) || 0,
    balconies: numericOrUndefined(formData.balconies) || 0,
    area: numericOrUndefined(formData.area),

    city: formData.city.trim(),
    state: formData.state.trim(),

    address: formData.location.trim(),

    ownerName:
      formData.ownerName.trim() || currentUser?.name || "HomeNest Owner",
    ownerEmail:
      formData.ownerEmail.trim().toLowerCase() ||
      currentUser?.email ||
      "owner@homenest.com",
    ownerPhone: formData.ownerPhone.trim() || currentUser?.phone || "9999999999",

    image: imageUrl,
    images: imageUrl ? [imageUrl] : [],

    availabilityStatus: formData.availabilityStatus,
    isActive: Boolean(formData.isActive),
    isFeatured: Boolean(formData.isFeatured),
  };

  Object.keys(payload).forEach((key) => {
    if (payload[key] === undefined || payload[key] === "") {
      delete payload[key];
    }
  });

  return payload;
};

const ManageProperties = () => {
  const { user } = useAuth();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const [search, setSearch] = useState("");
  const [purposeFilter, setPurposeFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState("");

  const fetchProperties = async () => {
    setLoading(true);
    setPageError("");

    try {
      const response = await api.get("/properties?showInactive=true&limit=50");
      const propertyList = getPropertiesFromResponse(response.data);

      setProperties(propertyList);
    } catch (error) {
      setProperties([]);

      setPageError(
        error.response?.data?.message ||
          error.message ||
          "Unable to load properties."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const filteredProperties = useMemo(() => {
    const searchTerm = normalizeText(search);
    const selectedPurpose = normalizeText(purposeFilter);
    const selectedType = normalizeText(typeFilter);

    return properties.filter((property) => {
      const searchableContent = [
        property?.title,
        property?.description,
        property?.propertyType,
        property?.listingPurpose,
        property?.city,
        property?.state,
        property?.address,
        property?.location,
      ]
        .map(normalizeText)
        .join(" ");

      const matchesSearch =
        !searchTerm || searchableContent.includes(searchTerm);

      const matchesPurpose =
        !selectedPurpose ||
        normalizeText(property?.listingPurpose) === selectedPurpose;

      const matchesType =
        !selectedType || normalizeText(property?.propertyType) === selectedType;

      return matchesSearch && matchesPurpose && matchesType;
    });
  }, [properties, search, purposeFilter, typeFilter]);

  const resetForm = () => {
    setFormData(INITIAL_FORM);
    setFieldErrors({});
    setEditingProperty(null);
  };

  const openAddForm = () => {
    setFormData({
      ...INITIAL_FORM,
      ownerName: user?.name || "",
      ownerEmail: user?.email || "",
      ownerPhone: user?.phone || "",
    });

    setFieldErrors({});
    setEditingProperty(null);
    setFormOpen(true);
  };

  const openEditForm = (property) => {
    const currentImage = getPropertyImage(property);

    setEditingProperty(property);

    setFormData({
      title: property?.title || "",
      description: property?.description || "",
      propertyType: property?.propertyType || "Flat",
      listingPurpose: property?.listingPurpose || "Rent",
      price: property?.price ?? "",
      monthlyRent: property?.monthlyRent ?? "",
      securityDeposit: property?.securityDeposit ?? "",
      maintenanceCharge: property?.maintenanceCharge ?? "",
      bedrooms: property?.bedrooms ?? "",
      bathrooms: property?.bathrooms ?? "",
      balconies: property?.balconies ?? "",
      area: property?.area ?? "",
      city: property?.city || "",
      state: property?.state || "",
      location: property?.address || property?.location || "",
      image: currentImage === FALLBACK_PROPERTY_IMAGE ? "" : currentImage,
      ownerName: property?.ownerName || property?.createdBy?.name || user?.name || "",
      ownerEmail:
        property?.ownerEmail || property?.createdBy?.email || user?.email || "",
      ownerPhone: property?.ownerPhone || user?.phone || "",
      availabilityStatus: property?.availabilityStatus || "Available",
      isActive: property?.isActive !== false,
      isFeatured: Boolean(property?.isFeatured),
    });

    setFieldErrors({});
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    resetForm();
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (fieldErrors[name]) {
      setFieldErrors((previousErrors) => ({
        ...previousErrors,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.title.trim()) {
      errors.title = "Property title is required";
    }

    if (!formData.description.trim()) {
      errors.description = "Description is required";
    } else if (formData.description.trim().length < 20) {
      errors.description = "Description must contain at least 20 characters";
    }

    if (!formData.propertyType) {
      errors.propertyType = "Property type is required";
    }

    if (!formData.listingPurpose) {
      errors.listingPurpose = "Listing purpose is required";
    }

    if (!formData.price || Number(formData.price) <= 0) {
      errors.price = "Price must be greater than 0";
    }

    if (!formData.area || Number(formData.area) <= 0) {
      errors.area = "Area must be greater than 0";
    }

    if (!formData.city.trim()) {
      errors.city = "City is required";
    }

    if (!formData.state.trim()) {
      errors.state = "State is required";
    }

    if (!formData.location.trim()) {
      errors.location = "Address/location is required";
    }

    if (!formData.ownerName.trim()) {
      errors.ownerName = "Owner name is required";
    }

    if (!formData.ownerEmail.trim()) {
      errors.ownerEmail = "Owner email is required";
    } else if (
      !/^\S+@\S+\.\S+$/.test(formData.ownerEmail.trim().toLowerCase())
    ) {
      errors.ownerEmail = "Enter a valid owner email";
    }

    if (!formData.ownerPhone.trim()) {
      errors.ownerPhone = "Owner phone is required";
    }

    if (!formData.image.trim()) {
      errors.image = "Property image URL is required";
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm() || submitting) {
      return;
    }

    setSubmitting(true);

    try {
      const payload = buildPayload(formData, user);

      if (editingProperty?._id) {
        const response = await api.put(
          `/properties/${editingProperty._id}`,
          payload
        );

        const updatedProperty =
          response.data?.property || response.data?.data || response.data;

        setProperties((previousProperties) =>
          previousProperties.map((property) =>
            property._id === editingProperty._id
              ? { ...property, ...updatedProperty }
              : property
          )
        );

        toast.success("Property updated successfully");
      } else {
        const response = await api.post("/properties", payload);

        const createdProperty =
          response.data?.property || response.data?.data || response.data;

        setProperties((previousProperties) => [
          createdProperty,
          ...previousProperties,
        ]);

        toast.success("Property added successfully");
      }

      closeForm();
      fetchProperties();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Unable to save property"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (property) => {
    const confirmDelete = window.confirm(
      `Delete "${property?.title || "this property"}"? This action cannot be undone.`
    );

    if (!confirmDelete) {
      return;
    }

    setDeletingId(property._id);

    try {
      await api.delete(`/properties/${property._id}`);

      setProperties((previousProperties) =>
        previousProperties.filter((item) => item._id !== property._id)
      );

      toast.success("Property deleted successfully");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Unable to delete property"
      );
    } finally {
      setDeletingId("");
    }
  };

  return (
    <main className="admin-page">
      <section className="admin-main-section admin-manage-section">
        <div className="container admin-dashboard-layout">
          <aside className="admin-sidebar-panel">
            <div className="admin-sidebar-profile">
              <span>{user?.name?.charAt(0)?.toUpperCase() || "A"}</span>

              <div>
                <h3>{user?.name || "HomeNest Admin"}</h3>
                <p>{user?.email || "Administrator"}</p>
              </div>
            </div>

            <nav className="admin-sidebar-nav">
              <Link to="/admin/dashboard" className="admin-sidebar-link">
                <FaChartLine />
                Dashboard
              </Link>

              <Link to="/admin/properties" className="admin-sidebar-link active">
                <FaBuilding />
                Manage Properties
              </Link>

              <Link to="/admin/users" className="admin-sidebar-link">
                <FaUsers />
                Manage Users
              </Link>

              <Link to="/admin/inquiries" className="admin-sidebar-link">
                <FaEnvelopeOpenText />
                Manage Inquiries
              </Link>
            </nav>
          </aside>

          <div className="admin-dashboard-content">
            <div className="admin-section-header">
              <div>
                <span>Property Management</span>
                <h2>Manage Properties</h2>
                <p>
                  Add, edit, review and remove real estate listings from
                  HomeNest.
                </p>
              </div>

              <button
                type="button"
                className="admin-primary-button"
                onClick={openAddForm}
              >
                <FaPlus />
                Add Property
              </button>
            </div>

            <div className="admin-filter-panel">
              <label>
                <span>Search properties</span>

                <div>
                  <FaSearch />
                  <input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search title, city, type or purpose"
                  />
                </div>
              </label>

              <label>
                <span>Property type</span>

                <select
                  value={typeFilter}
                  onChange={(event) => setTypeFilter(event.target.value)}
                >
                  <option value="">All types</option>

                  {PROPERTY_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Purpose</span>

                <select
                  value={purposeFilter}
                  onChange={(event) => setPurposeFilter(event.target.value)}
                >
                  <option value="">All purposes</option>

                  {LISTING_PURPOSES.map((purpose) => (
                    <option key={purpose} value={purpose}>
                      {purpose}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="button"
                className="admin-refresh-button"
                onClick={fetchProperties}
                disabled={loading}
              >
                <FaRedoAlt />
                Refresh
              </button>
            </div>

            {loading && (
              <div className="admin-table-card">
                <p className="admin-table-message">Loading properties...</p>
              </div>
            )}

            {!loading && pageError && (
              <div className="admin-state-card admin-error-state">
                <span>
                  <FaBuilding />
                </span>

                <h3>Properties could not be loaded</h3>
                <p>{pageError}</p>

                <button type="button" onClick={fetchProperties}>
                  Try Again
                </button>
              </div>
            )}

            {!loading && !pageError && filteredProperties.length === 0 && (
              <div className="admin-state-card">
                <span>
                  <FaBuilding />
                </span>

                <h3>No properties found</h3>
                <p>Add a new property or adjust your filters.</p>

                <button type="button" onClick={openAddForm}>
                  Add Property
                </button>
              </div>
            )}

            {!loading && !pageError && filteredProperties.length > 0 && (
              <div className="admin-table-card">
                <div className="admin-table-header">
                  <span>{filteredProperties.length} properties found</span>
                </div>

                <div className="admin-property-grid">
                  {filteredProperties.map((property) => (
                    <article className="admin-property-card" key={property._id}>
                      <div className="admin-property-image">
                        <img
                          src={getPropertyImage(property)}
                          alt={property.title}
                          onError={(event) => {
                            event.currentTarget.onerror = null;
                            event.currentTarget.src = FALLBACK_PROPERTY_IMAGE;
                          }}
                        />

                        <div>
                          <span>{property.propertyType || "Property"}</span>
                          <strong>
                            For {property.listingPurpose || "Listing"}
                          </strong>
                        </div>
                      </div>

                      <div className="admin-property-content">
                        <div className="admin-property-title-row">
                          <div>
                            <h3>{property.title}</h3>
                            <p>
                              {property.address ||
                                property.location ||
                                property.city ||
                                "Location not specified"}
                            </p>
                          </div>

                          <span
                            className={
                              property.isActive === false
                                ? "admin-status-badge admin-status-danger"
                                : "admin-status-badge admin-status-success"
                            }
                          >
                            {property.isActive === false ? "Inactive" : "Active"}
                          </span>
                        </div>

                        <h4>
                          {formatPrice(getPropertyPrice(property))}
                          {normalizeText(property.listingPurpose) === "rent" && (
                            <small>/month</small>
                          )}
                        </h4>

                        <div className="admin-property-meta">
                          <span>
                            <FaBed />
                            {property.bedrooms ?? "—"} Beds
                          </span>

                          <span>
                            <FaBath />
                            {property.bathrooms ?? "—"} Baths
                          </span>

                          <span>
                            <FaRulerCombined />
                            {property.area
                              ? `${property.area} sq.ft.`
                              : "Area N/A"}
                          </span>
                        </div>

                        <div className="admin-property-actions">
                          <Link to={`/properties/${property._id}`}>
                            <FaEye />
                            View
                          </Link>

                          <button
                            type="button"
                            onClick={() => openEditForm(property)}
                          >
                            <FaEdit />
                            Edit
                          </button>

                          <button
                            type="button"
                            className="admin-danger-action"
                            onClick={() => handleDelete(property)}
                            disabled={deletingId === property._id}
                          >
                            <FaTrash />
                            {deletingId === property._id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {formOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-property-modal">
            <div className="admin-modal-header">
              <div>
                <span>
                  {editingProperty ? "Update listing" : "Create listing"}
                </span>

                <h2>
                  {editingProperty ? "Edit Property" : "Add New Property"}
                </h2>
              </div>

              <button type="button" onClick={closeForm}>
                <FaTimes />
              </button>
            </div>

            <form className="admin-property-form" onSubmit={handleSubmit}>
              <div className="admin-form-grid">
                <label className="admin-form-group">
                  <span>Title</span>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Luxury 3BHK Flat in Mathura"
                  />
                  {fieldErrors.title && <small>{fieldErrors.title}</small>}
                </label>

                <label className="admin-form-group">
                  <span>Property Type</span>
                  <select
                    name="propertyType"
                    value={formData.propertyType}
                    onChange={handleChange}
                  >
                    {PROPERTY_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.propertyType && (
                    <small>{fieldErrors.propertyType}</small>
                  )}
                </label>

                <label className="admin-form-group">
                  <span>Listing Purpose</span>
                  <select
                    name="listingPurpose"
                    value={formData.listingPurpose}
                    onChange={handleChange}
                  >
                    {LISTING_PURPOSES.map((purpose) => (
                      <option key={purpose} value={purpose}>
                        {purpose}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.listingPurpose && (
                    <small>{fieldErrors.listingPurpose}</small>
                  )}
                </label>

                <label className="admin-form-group">
                  <span>Price</span>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="22000"
                  />
                  {fieldErrors.price && <small>{fieldErrors.price}</small>}
                </label>

                <label className="admin-form-group">
                  <span>Monthly Rent</span>
                  <input
                    type="number"
                    name="monthlyRent"
                    value={formData.monthlyRent}
                    onChange={handleChange}
                    placeholder="22000"
                  />
                </label>

                <label className="admin-form-group">
                  <span>Security Deposit</span>
                  <input
                    type="number"
                    name="securityDeposit"
                    value={formData.securityDeposit}
                    onChange={handleChange}
                    placeholder="44000"
                  />
                </label>

                <label className="admin-form-group">
                  <span>Maintenance Charge</span>
                  <input
                    type="number"
                    name="maintenanceCharge"
                    value={formData.maintenanceCharge}
                    onChange={handleChange}
                    placeholder="2500"
                  />
                </label>

                <label className="admin-form-group">
                  <span>Bedrooms</span>
                  <input
                    type="number"
                    name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleChange}
                    placeholder="3"
                  />
                </label>

                <label className="admin-form-group">
                  <span>Bathrooms</span>
                  <input
                    type="number"
                    name="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleChange}
                    placeholder="2"
                  />
                </label>

                <label className="admin-form-group">
                  <span>Balconies</span>
                  <input
                    type="number"
                    name="balconies"
                    value={formData.balconies}
                    onChange={handleChange}
                    placeholder="2"
                  />
                </label>

                <label className="admin-form-group">
                  <span>Area sq.ft.</span>
                  <input
                    type="number"
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                    placeholder="1450"
                  />
                  {fieldErrors.area && <small>{fieldErrors.area}</small>}
                </label>

                <label className="admin-form-group">
                  <span>City</span>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Mathura"
                  />
                  {fieldErrors.city && <small>{fieldErrors.city}</small>}
                </label>

                <label className="admin-form-group">
                  <span>State</span>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="Uttar Pradesh"
                  />
                  {fieldErrors.state && <small>{fieldErrors.state}</small>}
                </label>

                <label className="admin-form-group">
                  <span>Availability</span>
                  <select
                    name="availabilityStatus"
                    value={formData.availabilityStatus}
                    onChange={handleChange}
                  >
                    {AVAILABILITY_STATUS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="admin-form-group admin-form-full">
                  <span>Address / Location</span>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Prime residential area, Mathura"
                  />
                  {fieldErrors.location && <small>{fieldErrors.location}</small>}
                </label>

                <label className="admin-form-group admin-form-full">
                  <span>Image URL</span>
                  <input
                    type="url"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    placeholder="https://images.unsplash.com/..."
                  />
                  {fieldErrors.image && <small>{fieldErrors.image}</small>}
                </label>

                <label className="admin-form-group">
                  <span>Owner Name</span>
                  <input
                    type="text"
                    name="ownerName"
                    value={formData.ownerName}
                    onChange={handleChange}
                    placeholder="Owner name"
                  />
                  {fieldErrors.ownerName && (
                    <small>{fieldErrors.ownerName}</small>
                  )}
                </label>

                <label className="admin-form-group">
                  <span>Owner Email</span>
                  <input
                    type="email"
                    name="ownerEmail"
                    value={formData.ownerEmail}
                    onChange={handleChange}
                    placeholder="owner@example.com"
                  />
                  {fieldErrors.ownerEmail && (
                    <small>{fieldErrors.ownerEmail}</small>
                  )}
                </label>

                <label className="admin-form-group">
                  <span>Owner Phone</span>
                  <input
                    type="tel"
                    name="ownerPhone"
                    value={formData.ownerPhone}
                    onChange={handleChange}
                    placeholder="9876501234"
                  />
                  {fieldErrors.ownerPhone && (
                    <small>{fieldErrors.ownerPhone}</small>
                  )}
                </label>

                <label className="admin-form-group admin-form-full">
                  <span>Description</span>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="5"
                    placeholder="Write property description..."
                  />
                  {fieldErrors.description && (
                    <small>{fieldErrors.description}</small>
                  )}
                </label>

                <div className="admin-checkbox-row admin-form-full">
                  <label>
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                    />
                    Active listing
                  </label>

                  <label>
                    <input
                      type="checkbox"
                      name="isFeatured"
                      checked={formData.isFeatured}
                      onChange={handleChange}
                    />
                    Featured property
                  </label>
                </div>
              </div>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="admin-secondary-button"
                  onClick={closeForm}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="admin-primary-button"
                  disabled={submitting}
                >
                  {submitting
                    ? "Saving..."
                    : editingProperty
                      ? "Update Property"
                      : "Add Property"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default ManageProperties;