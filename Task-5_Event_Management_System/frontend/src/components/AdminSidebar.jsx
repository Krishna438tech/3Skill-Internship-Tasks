import { Link } from "react-router-dom";
import "../styles/admin.css";

const AdminSidebar = () => {
  return (
    <aside className="admin-sidebar">
      <h2>Admin Panel</h2>

      <div className="admin-menu">
        <Link to="/admin">Dashboard</Link>
        <Link to="/admin/events">Manage Events</Link>
        <Link to="/admin/categories">Categories</Link>
        <Link to="/admin/bookings">Bookings</Link>
        <Link to="/admin/users">Users</Link>
      </div>
    </aside>
  );
};

export default AdminSidebar;