import User from "../models/User.js";
import Property from "../models/Property.js";
import Favorite from "../models/Favorite.js";
import Inquiry from "../models/Inquiry.js";

export const getAdminDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalAdmins,
      blockedUsers,
      totalProperties,
      activeProperties,
      inactiveProperties,
      rentProperties,
      saleProperties,
      availableProperties,
      rentedProperties,
      soldProperties,
      featuredProperties,
      totalFavorites,
      totalInquiries,
      pendingInquiries,
      contactedInquiries,
      closedInquiries,
    ] = await Promise.all([
      User.countDocuments({ role: "user" }),
      User.countDocuments({ role: "admin" }),
      User.countDocuments({ isBlocked: true }),

      Property.countDocuments(),
      Property.countDocuments({ isActive: true }),
      Property.countDocuments({ isActive: false }),
      Property.countDocuments({ listingPurpose: "Rent" }),
      Property.countDocuments({ listingPurpose: "Sale" }),
      Property.countDocuments({ availabilityStatus: "Available" }),
      Property.countDocuments({ availabilityStatus: "Rented" }),
      Property.countDocuments({ availabilityStatus: "Sold" }),
      Property.countDocuments({ isFeatured: true }),

      Favorite.countDocuments(),

      Inquiry.countDocuments(),
      Inquiry.countDocuments({ status: "Pending" }),
      Inquiry.countDocuments({ status: "Contacted" }),
      Inquiry.countDocuments({ status: "Closed" }),
    ]);

    const latestProperties = await Property.find()
      .select("title propertyType listingPurpose price city state availabilityStatus isActive createdAt")
      .sort({ createdAt: -1 })
      .limit(5);

    const latestInquiries = await Inquiry.find()
      .populate("user", "name email phone")
      .populate("property", "title city state")
      .select("name email phone message status createdAt")
      .sort({ createdAt: -1 })
      .limit(5);

    return res.status(200).json({
      success: true,
      stats: {
        users: {
          totalUsers,
          totalAdmins,
          blockedUsers,
        },
        properties: {
          totalProperties,
          activeProperties,
          inactiveProperties,
          rentProperties,
          saleProperties,
          availableProperties,
          rentedProperties,
          soldProperties,
          featuredProperties,
        },
        favorites: {
          totalFavorites,
        },
        inquiries: {
          totalInquiries,
          pendingInquiries,
          contactedInquiries,
          closedInquiries,
        },
      },
      latestProperties,
      latestInquiries,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch admin dashboard stats",
      error: error.message,
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const { search, role, status, page = 1, limit = 20 } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    if (role) {
      query.role = role;
    }

    if (status === "blocked") {
      query.isBlocked = true;
    }

    if (status === "active") {
      query.isBlocked = false;
    }

    const pageNumber = Math.max(Number(page), 1);
    const limitNumber = Math.min(Math.max(Number(limit), 1), 50);
    const skip = (pageNumber - 1) * limitNumber;

    const totalUsers = await User.countDocuments(query);

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber);

    return res.status(200).json({
      success: true,
      count: users.length,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limitNumber),
      currentPage: pageNumber,
      users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};

export const blockUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (id === String(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: "Admin cannot block own account",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role === "admin") {
      return res.status(400).json({
        success: false,
        message: "Admin account cannot be blocked",
      });
    }

    user.isBlocked = true;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "User blocked successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isBlocked: user.isBlocked,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to block user",
      error: error.message,
    });
  }
};

export const unblockUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.isBlocked = false;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "User unblocked successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isBlocked: user.isBlocked,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to unblock user",
      error: error.message,
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (id === String(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: "Admin cannot delete own account",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role === "admin") {
      return res.status(400).json({
        success: false,
        message: "Admin account cannot be deleted",
      });
    }

    await Favorite.deleteMany({ user: user._id });
    await Inquiry.deleteMany({ user: user._id });
    await user.deleteOne();

    return res.status(200).json({
      success: true,
      message: "User and related data deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete user",
      error: error.message,
    });
  }
};