import mongoose from "mongoose";
import Inquiry from "../models/Inquiry.js";
import Property from "../models/Property.js";

export const createInquiry = async (req, res) => {
  try {
    const { propertyId, name, email, phone, message } = req.body;

    if (!propertyId || !name || !email || !phone || !message) {
      return res.status(400).json({
        success: false,
        message: "Property ID, name, email, phone and message are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid property ID",
      });
    }

    if (message.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: "Message must be at least 10 characters long",
      });
    }

    const property = await Property.findById(propertyId);

    if (!property || !property.isActive) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    if (property.availabilityStatus !== "Available") {
      return res.status(400).json({
        success: false,
        message: "This property is currently not available for inquiry",
      });
    }

    const inquiry = await Inquiry.create({
      user: req.user._id,
      property: propertyId,
      name,
      email,
      phone,
      message,
    });

    const populatedInquiry = await Inquiry.findById(inquiry._id)
      .populate("property", "title propertyType listingPurpose price city state image ownerName ownerEmail ownerPhone")
      .populate("user", "name email phone");

    return res.status(201).json({
      success: true,
      message: "Inquiry sent successfully",
      inquiry: populatedInquiry,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to send inquiry",
      error: error.message,
    });
  }
};

export const getMyInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find({ user: req.user._id })
      .populate("property", "title propertyType listingPurpose price city state image availabilityStatus")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: inquiries.length,
      inquiries,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch your inquiries",
      error: error.message,
    });
  }
};

export const getAllInquiries = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;

    const query = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } },
      ];
    }

    const pageNumber = Math.max(Number(page), 1);
    const limitNumber = Math.min(Math.max(Number(limit), 1), 50);
    const skip = (pageNumber - 1) * limitNumber;

    const totalInquiries = await Inquiry.countDocuments(query);

    const inquiries = await Inquiry.find(query)
      .populate("user", "name email phone role")
      .populate("property", "title propertyType listingPurpose price city state image ownerName ownerEmail ownerPhone availabilityStatus")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber);

    return res.status(200).json({
      success: true,
      count: inquiries.length,
      totalInquiries,
      totalPages: Math.ceil(totalInquiries / limitNumber),
      currentPage: pageNumber,
      inquiries,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch inquiries",
      error: error.message,
    });
  }
};

export const getInquiryById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid inquiry ID",
      });
    }

    const inquiry = await Inquiry.findById(id)
      .populate("user", "name email phone role")
      .populate("property", "title propertyType listingPurpose price city state image ownerName ownerEmail ownerPhone availabilityStatus");

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: "Inquiry not found",
      });
    }

    return res.status(200).json({
      success: true,
      inquiry,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch inquiry",
      error: error.message,
    });
  }
};

export const updateInquiryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNote } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid inquiry ID",
      });
    }

    const allowedStatuses = ["Pending", "Contacted", "Closed"];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Valid status is required: Pending, Contacted or Closed",
      });
    }

    const inquiry = await Inquiry.findById(id);

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: "Inquiry not found",
      });
    }

    inquiry.status = status;

    if (adminNote !== undefined) {
      inquiry.adminNote = adminNote;
    }

    const updatedInquiry = await inquiry.save();

    const populatedInquiry = await Inquiry.findById(updatedInquiry._id)
      .populate("user", "name email phone role")
      .populate("property", "title propertyType listingPurpose price city state image ownerName ownerEmail ownerPhone availabilityStatus");

    return res.status(200).json({
      success: true,
      message: "Inquiry status updated successfully",
      inquiry: populatedInquiry,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update inquiry status",
      error: error.message,
    });
  }
};

export const deleteInquiry = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid inquiry ID",
      });
    }

    const inquiry = await Inquiry.findById(id);

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: "Inquiry not found",
      });
    }

    await inquiry.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Inquiry deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete inquiry",
      error: error.message,
    });
  }
};