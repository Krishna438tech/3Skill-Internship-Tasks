import { useEffect, useMemo, useState } from "react";
import {
  FaBan,
  FaChartLine,
  FaEnvelope,
  FaEnvelopeOpenText,
  FaPhoneAlt,
  FaRedoAlt,
  FaSearch,
  FaShieldAlt,
  FaTrash,
  FaUnlock,
  FaUserCheck,
  FaUsers,
  FaBuilding,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import "../styles/admin.css";

const getUsersFromResponse = (responseData) => {
  if (Array.isArray(responseData)) {
    return responseData;
  }

  if (Array.isArray(responseData?.users)) {
    return responseData.users;
  }

  if (Array.isArray(responseData?.data?.users)) {
    return responseData.data.users;
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

const ManageUsers = () => {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [actionLoadingId, setActionLoadingId] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    setPageError("");

    try {
      const response = await api.get("/admin/users?limit=50");
      setUsers(getUsersFromResponse(response.data));
    } catch (error) {
      setUsers([]);

      setPageError(
        error.response?.data?.message ||
          error.message ||
          "Unable to load users."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const searchTerm = normalizeText(search);
    const selectedRole = normalizeText(roleFilter);
    const selectedStatus = normalizeText(statusFilter);

    return users.filter((user) => {
      const searchableContent = [
        user?.name,
        user?.email,
        user?.phone,
        user?.role,
      ]
        .map(normalizeText)
        .join(" ");

      const matchesSearch =
        !searchTerm || searchableContent.includes(searchTerm);

      const matchesRole =
        !selectedRole || normalizeText(user?.role) === selectedRole;

      const userStatus = user?.isBlocked ? "blocked" : "active";

      const matchesStatus =
        !selectedStatus || normalizeText(userStatus) === selectedStatus;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const handleBlockUser = async (targetUser) => {
    if (!targetUser?._id || actionLoadingId) {
      return;
    }

    setActionLoadingId(targetUser._id);

    try {
      await api.put(`/admin/users/${targetUser._id}/block`);

      setUsers((previousUsers) =>
        previousUsers.map((item) =>
          item._id === targetUser._id ? { ...item, isBlocked: true } : item
        )
      );

      toast.success("User blocked successfully");
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message || "Unable to block user"
      );
    } finally {
      setActionLoadingId("");
    }
  };

  const handleUnblockUser = async (targetUser) => {
    if (!targetUser?._id || actionLoadingId) {
      return;
    }

    setActionLoadingId(targetUser._id);

    try {
      await api.put(`/admin/users/${targetUser._id}/unblock`);

      setUsers((previousUsers) =>
        previousUsers.map((item) =>
          item._id === targetUser._id ? { ...item, isBlocked: false } : item
        )
      );

      toast.success("User unblocked successfully");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Unable to unblock user"
      );
    } finally {
      setActionLoadingId("");
    }
  };

  const handleDeleteUser = async (targetUser) => {
    const confirmDelete = window.confirm(
      `Delete "${targetUser?.name || "this user"}"? This will remove the user and related data.`
    );

    if (!confirmDelete || !targetUser?._id || actionLoadingId) {
      return;
    }

    setActionLoadingId(targetUser._id);

    try {
      await api.delete(`/admin/users/${targetUser._id}`);

      setUsers((previousUsers) =>
        previousUsers.filter((item) => item._id !== targetUser._id)
      );

      toast.success("User deleted successfully");
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message || "Unable to delete user"
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

              <Link to="/admin/users" className="admin-sidebar-link active">
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
                <span>User Management</span>
                <h2>Manage Users</h2>
                <p>
                  Review registered accounts, control access and remove inactive
                  or invalid users.
                </p>
              </div>

              <button
                type="button"
                className="admin-refresh-button"
                onClick={fetchUsers}
                disabled={loading}
              >
                <FaRedoAlt />
                Refresh
              </button>
            </div>

            <div className="admin-filter-panel admin-user-filter-panel">
              <label>
                <span>Search users</span>

                <div>
                  <FaSearch />
                  <input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search name, email, phone or role"
                  />
                </div>
              </label>

              <label>
                <span>Role</span>

                <select
                  value={roleFilter}
                  onChange={(event) => setRoleFilter(event.target.value)}
                >
                  <option value="">All roles</option>
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </select>
              </label>

              <label>
                <span>Status</span>

                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                >
                  <option value="">All statuses</option>
                  <option value="active">Active</option>
                  <option value="blocked">Blocked</option>
                </select>
              </label>
            </div>

            {loading && (
              <div className="admin-table-card">
                <p className="admin-table-message">Loading users...</p>
              </div>
            )}

            {!loading && pageError && (
              <div className="admin-state-card admin-error-state">
                <span>
                  <FaUsers />
                </span>

                <h3>Users could not be loaded</h3>
                <p>{pageError}</p>

                <button type="button" onClick={fetchUsers}>
                  Try Again
                </button>
              </div>
            )}

            {!loading && !pageError && filteredUsers.length === 0 && (
              <div className="admin-state-card">
                <span>
                  <FaUsers />
                </span>

                <h3>No users found</h3>
                <p>Try changing your search or filter options.</p>

                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setRoleFilter("");
                    setStatusFilter("");
                  }}
                >
                  Clear Filters
                </button>
              </div>
            )}

            {!loading && !pageError && filteredUsers.length > 0 && (
              <div className="admin-table-card">
                <div className="admin-table-header">
                  <span>{filteredUsers.length} users found</span>
                </div>

                <div className="admin-users-list">
                  {filteredUsers.map((targetUser) => {
                    const currentUserId = currentUser?._id || currentUser?.id;
                    const targetUserId = targetUser?._id || targetUser?.id;

                    const isCurrentUser =
                      Boolean(currentUserId) &&
                      Boolean(targetUserId) &&
                      String(targetUserId) === String(currentUserId);

                    const isAdmin = targetUser.role === "admin";

                    return (
                      <article className="admin-user-card" key={targetUser._id}>
                        <div className="admin-user-avatar">
                          {targetUser?.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>

                        <div className="admin-user-main">
                          <div className="admin-user-title-row">
                            <div>
                              <h3>{targetUser.name || "Unnamed User"}</h3>

                              <p>
                                <FaEnvelope />
                                {targetUser.email || "No email"}
                              </p>
                            </div>

                            <div className="admin-user-badges">
                              <span
                                className={
                                  isAdmin
                                    ? "admin-status-badge admin-status-info"
                                    : "admin-status-badge admin-status-success"
                                }
                              >
                                {isAdmin ? "Admin" : "User"}
                              </span>

                              <span
                                className={
                                  targetUser.isBlocked
                                    ? "admin-status-badge admin-status-danger"
                                    : "admin-status-badge admin-status-success"
                                }
                              >
                                {targetUser.isBlocked ? "Blocked" : "Active"}
                              </span>
                            </div>
                          </div>

                          <div className="admin-user-meta">
                            <span>
                              <FaPhoneAlt />
                              {targetUser.phone || "Phone not added"}
                            </span>

                            <span>
                              <FaUserCheck />
                              Joined {formatDate(targetUser.createdAt)}
                            </span>

                            {isCurrentUser && (
                              <span>
                                <FaShieldAlt />
                                Current admin account
                              </span>
                            )}
                          </div>

                          <div className="admin-user-actions">
                            {targetUser.isBlocked ? (
                              <button
                                type="button"
                                onClick={() => handleUnblockUser(targetUser)}
                                disabled={actionLoadingId === targetUser._id}
                              >
                                <FaUnlock />
                                {actionLoadingId === targetUser._id
                                  ? "Updating..."
                                  : "Unblock"}
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleBlockUser(targetUser)}
                                disabled={
                                  actionLoadingId === targetUser._id ||
                                  isAdmin ||
                                  isCurrentUser
                                }
                              >
                                <FaBan />
                                {actionLoadingId === targetUser._id
                                  ? "Updating..."
                                  : "Block"}
                              </button>
                            )}

                            <button
                              type="button"
                              className="admin-danger-action"
                              onClick={() => handleDeleteUser(targetUser)}
                              disabled={
                                actionLoadingId === targetUser._id ||
                                isAdmin ||
                                isCurrentUser
                              }
                            >
                              <FaTrash />
                              {actionLoadingId === targetUser._id
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                          </div>
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

export default ManageUsers;