import { Route, Routes } from "react-router-dom";
import AdminRoute from "./components/AdminRoute";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboard from "./pages/AdminDashboard";
import Favorites from "./pages/Favorites";
import Home from "./pages/Home";
import Login from "./pages/Login";
import ManageInquiries from "./pages/ManageInquiries";
import ManageProperties from "./pages/ManageProperties";
import ManageUsers from "./pages/ManageUsers";
import MyInquiries from "./pages/MyInquiries";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import Properties from "./pages/Properties";
import PropertyDetails from "./pages/PropertyDetails";
import Register from "./pages/Register";

const App = () => {
  return (
    <div className="app-shell">
      <Navbar />

      <div className="app-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/properties/:id" element={<PropertyDetails />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/my-inquiries" element={<MyInquiries />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          <Route element={<AdminRoute />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/properties" element={<ManageProperties />} />
            <Route path="/admin/users" element={<ManageUsers />} />
            <Route path="/admin/inquiries" element={<ManageInquiries />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>

      <Footer />
    </div>
  );
};

export default App;