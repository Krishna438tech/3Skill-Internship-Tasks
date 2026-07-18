import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import API from "../services/api";
import AdminSidebar from "../components/AdminSidebar";
import "../styles/admin.css";
import "../styles/events.css";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/admin/users");
      setUsers(data.users || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleBlockToggle = async (userId, isBlocked) => {
    const action = isBlocked ? "unblock" : "block";

    const confirmAction = window.confirm(
      `Are you sure you want to ${action} this user?`
    );

    if (!confirmAction) return;

    try {
      const { data } = await API.put(`/admin/users/block/${userId}`);
      toast.success(data.message || `User ${action}ed successfully`);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update user");
    }
  };

  const handleDelete = async (userId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user? This will also delete related bookings."
    );

    if (!confirmDelete) return;

    try {
      const { data } = await API.delete(`/admin/users/${userId}`);
      toast.success(data.message || "User deleted successfully");
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete user");
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-content">
        <div className="page-header">
          <h1>Manage Users</h1>
          <p>View, block, unblock and delete registered users.</p>
        </div>

        <div className="admin-table-card">
          <h2>All Users</h2>

          {loading ? (
            <p className="empty-text">Loading users...</p>
          ) : users.length === 0 ? (
            <p className="empty-text">No users found.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.phone || "N/A"}</td>
                    <td>
                      <span className={`status ${user.role === "admin" ? "approved" : "pending"}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`status ${
                          user.isBlocked ? "rejected" : "approved"
                        }`}
                      >
                        {user.isBlocked ? "Blocked" : "Active"}
                      </span>
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="btn-edit"
                          onClick={() =>
                            handleBlockToggle(user._id, user.isBlocked)
                          }
                          disabled={user.role === "admin"}
                        >
                          {user.isBlocked ? "Unblock" : "Block"}
                        </button>

                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(user._id)}
                          disabled={user.role === "admin"}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
};

export default ManageUsers;