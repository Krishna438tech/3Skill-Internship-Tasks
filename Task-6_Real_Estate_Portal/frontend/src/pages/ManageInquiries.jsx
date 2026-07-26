import { useEffect, useMemo, useState } from "react";
import {
  FaBuilding,
  FaCalendarAlt,
  FaChartLine,
  FaEnvelope,
  FaEnvelopeOpenText,
  FaEye,
  FaPhoneAlt,
  FaRedoAlt,
  FaSearch,
  FaTrash,
  FaUser,
  FaUsers,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import "../styles/admin.css";

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

const getPropertyFromInquiry = (inquiry) => {
  return inquiry?.property || inquiry?.propertyId || {};
};

const getPropertyId = (property) => {
  return property?._id || property?.id || "";
};

const getStatusClass = (status) => {
  const normalizedStatus = normalizeText(status || "Pending");

  if (["contacted", "approved", "resolved", "completed"].includes(normalizedStatus)) {
    return "admin-status-info";
  }

  if (["closed", "rejected", "cancelled", "declined"].includes(normalizedStatus)) {
    return "admin-status-danger";
  }

  return "admin-status-warning";
};

const STATUS_OPTIONS = ["Pending", "Contacted", "Closed"];

const ManageInquiries = () => {
  const { user: currentUser } = useAuth();

  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [actionLoadingId, setActionLoadingId] = useState("");

  const fetchInquiries = async () => {
    setLoading(true);
    setPageError("");

    try {
      const response = await api.get("/inquiries/admin/all");
      setInquiries(getInquiriesFromResponse(response.data));
    } catch (error) {
      setInquiries([]);

      setPageError(
        error.response?.data?.message ||
          error.message ||
          "Unable to load inquiries."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

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
        property?.city,
        property?.state,
        property?.address,
        property?.location,
        property?.propertyType,
      ]
        .map(normalizeText)
        .join(" ");

      const matchesSearch =
        !searchTerm || searchableContent.includes(searchTerm);

      const matchesStatus =
        !selectedStatus ||
        normalizeText(inquiry?.status || "Pending") === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [inquiries, search, statusFilter]);

  const handleStatusUpdate = async (inquiry, nextStatus) => {
    if (!inquiry?._id || actionLoadingId) {
      return;
    }

    setActionLoadingId(inquiry._id);

    try {
      const response = await api.put(`/inquiries/admin/${inquiry._id}/status`, {
        status: nextStatus,
      });

      const updatedInquiry =
        response.data?.inquiry || response.data?.data || response.data;

      setInquiries((previousInquiries) =>
        previousInquiries.map((item) =>
          item._id === inquiry._id
            ? {
                ...item,
                ...updatedInquiry,
                status: updatedInquiry?.status || nextStatus,
              }
            : item
        )
      );

      toast.success(`Inquiry marked as ${nextStatus}`);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Unable to update inquiry status"
      );
    } finally {
      setActionLoadingId("");
    }
  };

  const handleDeleteInquiry = async (inquiry) => {
    const confirmDelete = window.confirm(
      `Delete inquiry from "${inquiry?.name || "this user"}"?`
    );

    if (!confirmDelete || !inquiry?._id || actionLoadingId) {
      return;
    }

    setActionLoadingId(inquiry._id);

    try {
      await api.delete(`/inquiries/admin/${inquiry._id}`);

      setInquiries((previousInquiries) =>
        previousInquiries.filter((item) => item._id !== inquiry._id)
      );

      toast.success("Inquiry deleted successfully");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Unable to delete inquiry"
      );
    } finally {
      setActionLoadingId("");
    }
  };

  return (
    <main className="admin-page">
      <section className="admin-main-section admin-manage-section">
        <div className="container admin-dashboard-layout">
          <aside className="admin-sidebar-panel">
            <div className="admin-sidebar-profile">
              <span>{currentUser?.name?.charAt(0)?.toUpperCase() || "A"}</span>

              <div>
                <h3>{currentUser?.name || "HomeNest Admin"}</h3>
                <p>{currentUser?.email || "Administrator"}</p>
              </div>
            </div>

            <nav className="admin-sidebar-nav">
              <Link to="/admin/dashboard" className="admin-sidebar-link">
                <FaChartLine />
                Dashboard
              </Link>

              <Link to="/admin/properties" className="admin-sidebar-link">
                <FaBuilding />
                Manage Properties
              </Link>

              <Link to="/admin/users" className="admin-sidebar-link">
                <FaUsers />
                Manage Users
              </Link>

              <Link to="/admin/inquiries" className="admin-sidebar-link active">
                <FaEnvelopeOpenText />
                Manage Inquiries
              </Link>
            </nav>
          </aside>

          <div className="admin-dashboard-content">
            <div className="admin-section-header">
              <div>
                <span>Inquiry Management</span>
                <h2>Manage Inquiries</h2>
                <p>
                  Review property inquiries, update their progress and remove
                  completed or invalid requests.
                </p>
              </div>

              <button
                type="button"
                className="admin-refresh-button"
                onClick={fetchInquiries}
                disabled={loading}
              >
                <FaRedoAlt />
                Refresh
              </button>
            </div>

            <div className="admin-filter-panel admin-inquiry-filter-panel">
              <label>
                <span>Search inquiries</span>

                <div>
                  <FaSearch />
                  <input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search property, name, email, phone or message"
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

                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {loading && (
              <div className="admin-table-card">
                <p className="admin-table-message">Loading inquiries...</p>
              </div>
            )}

            {!loading && pageError && (
              <div className="admin-state-card admin-error-state">
                <span>
                  <FaEnvelopeOpenText />
                </span>

                <h3>Inquiries could not be loaded</h3>
                <p>{pageError}</p>

                <button type="button" onClick={fetchInquiries}>
                  Try Again
                </button>
              </div>
            )}

            {!loading && !pageError && filteredInquiries.length === 0 && (
              <div className="admin-state-card">
                <span>
                  <FaEnvelopeOpenText />
                </span>

                <h3>No inquiries found</h3>
                <p>
                  Try changing your search or status filter. New user inquiries
                  will appear here.
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
              <div className="admin-table-card">
                <div className="admin-table-header">
                  <span>{filteredInquiries.length} inquiries found</span>
                </div>

                <div className="admin-inquiries-list">
                  {filteredInquiries.map((inquiry) => {
                    const property = getPropertyFromInquiry(inquiry);
                    const propertyId = getPropertyId(property);

                    return (
                      <article
                        className="admin-inquiry-card"
                        key={inquiry._id}
                      >
                        <div className="admin-inquiry-top">
                          <div>
                            <div className="admin-inquiry-badges">
                              <span
                                className={`admin-status-badge ${getStatusClass(
                                  inquiry.status
                                )}`}
                              >
                                {formatLabel(inquiry.status || "Pending")}
                              </span>

                              {property?.propertyType && (
                                <span className="admin-status-badge admin-status-success">
                                  {property.propertyType}
                                </span>
                              )}
                            </div>

                            <h3>
                              {property?.title ||
                                inquiry?.propertyTitle ||
                                "Property details unavailable"}
                            </h3>

                            <p>
                              {property?.address ||
                                property?.location ||
                                property?.city ||
                                "Location not specified"}
                            </p>
                          </div>

                          {propertyId && (
                            <Link
                              to={`/properties/${propertyId}`}
                              className="admin-inquiry-view-link"
                            >
                              <FaEye />
                              View Property
                            </Link>
                          )}
                        </div>

                        <div className="admin-inquiry-meta-grid">
                          <div>
                            <FaUser />
                            <span>Name</span>
                            <strong>{inquiry.name || "N/A"}</strong>
                          </div>

                          <div>
                            <FaEnvelope />
                            <span>Email</span>
                            <strong>{inquiry.email || "N/A"}</strong>
                          </div>

                          <div>
                            <FaPhoneAlt />
                            <span>Phone</span>
                            <strong>{inquiry.phone || "N/A"}</strong>
                          </div>

                          <div>
                            <FaCalendarAlt />
                            <span>Submitted</span>
                            <strong>{formatDate(inquiry.createdAt)}</strong>
                          </div>
                        </div>

                        <div className="admin-inquiry-message">
                          <span>Inquiry message</span>

                          <p>
                            {inquiry.message ||
                              "No message was provided with this inquiry."}
                          </p>
                        </div>

                        <div className="admin-inquiry-actions">
                          <label>
                            <span>Update status</span>

                            <select
                              value={inquiry.status || "Pending"}
                              onChange={(event) =>
                                handleStatusUpdate(inquiry, event.target.value)
                              }
                              disabled={actionLoadingId === inquiry._id}
                            >
                              {STATUS_OPTIONS.map((status) => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              ))}
                            </select>
                          </label>

                          <button
                            type="button"
                            className="admin-danger-action"
                            onClick={() => handleDeleteInquiry(inquiry)}
                            disabled={actionLoadingId === inquiry._id}
                          >
                            <FaTrash />
                            {actionLoadingId === inquiry._id
                              ? "Deleting..."
                              : "Delete Inquiry"}
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default ManageInquiries;