import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import API from "../services/api";
import AdminSidebar from "../components/AdminSidebar";
import "../styles/admin.css";
import "../styles/events.css";

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCategories = async () => {
    try {
      const { data } = await API.get("/categories");
      setCategories(data.categories || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load categories");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
    });
    setEditId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      setLoading(true);

      if (editId) {
        const { data } = await API.put(`/categories/${editId}`, formData);
        toast.success(data.message || "Category updated successfully");
      } else {
        const { data } = await API.post("/categories", formData);
        toast.success(data.message || "Category created successfully");
      }

      resetForm();
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category) => {
    setEditId(category._id);
    setFormData({
      name: category.name || "",
      description: category.description || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (categoryId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this category?"
    );

    if (!confirmDelete) return;

    try {
      const { data } = await API.delete(`/categories/${categoryId}`);
      toast.success(data.message || "Category deleted successfully");
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete category");
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-content">
        <div className="page-header">
          <h1>Manage Categories</h1>
          <p>Add, update and delete event categories.</p>
        </div>

        <div className="admin-table-card">
          <h2>{editId ? "Edit Category" : "Add New Category"}</h2>

          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-row">
              <input
                type="text"
                name="name"
                placeholder="Category name"
                value={formData.name}
                onChange={handleChange}
                required
              />

              <input
                type="text"
                name="description"
                placeholder="Category description"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading
                  ? "Saving..."
                  : editId
                  ? "Update Category"
                  : "Add Category"}
              </button>

              {editId && (
                <button type="button" className="btn-outline" onClick={resetForm}>
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="admin-table-card">
          <h2>All Categories</h2>

          {categories.length === 0 ? (
            <p className="empty-text">No categories found.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {categories.map((category) => (
                  <tr key={category._id}>
                    <td>{category.name}</td>
                    <td>{category.description || "N/A"}</td>
                    <td>{new Date(category.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="btn-edit"
                          onClick={() => handleEdit(category)}
                        >
                          Edit
                        </button>

                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(category._id)}
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

export default ManageCategories;