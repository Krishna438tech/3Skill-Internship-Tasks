import mongoose from "mongoose";
import Favorite from "../models/Favorite.js";
import Property from "../models/Property.js";

export const addFavorite = async (req, res) => {
  try {
    const { propertyId } = req.body;

    if (!propertyId) {
      return res.status(400).json({
        success: false,
        message: "Property ID is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid property ID",
      });
    }

    const property = await Property.findById(propertyId);

    if (!property || !property.isActive) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    const existingFavorite = await Favorite.findOne({
      user: req.user._id,
      property: propertyId,
    });

    if (existingFavorite) {
      return res.status(409).json({
        success: false,
        message: "Property already added to favorites",
      });
    }

    const favorite = await Favorite.create({
      user: req.user._id,
      property: propertyId,
    });

    const populatedFavorite = await Favorite.findById(favorite._id).populate(
      "property"
    );

    return res.status(201).json({
      success: true,
      message: "Property added to favorites",
      favorite: populatedFavorite,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Property already added to favorites",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to add favorite",
      error: error.message,
    });
  }
};

export const getMyFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.user._id })
      .populate({
        path: "property",
        match: { isActive: true },
        populate: {
          path: "createdBy",
          select: "name email role",
        },
      })
      .sort({ createdAt: -1 });

    const activeFavorites = favorites.filter((item) => item.property !== null);

    return res.status(200).json({
      success: true,
      count: activeFavorites.length,
      favorites: activeFavorites,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch favorites",
      error: error.message,
    });
  }
};

export const removeFavorite = async (req, res) => {
  try {
    const { propertyId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid property ID",
      });
    }

    const favorite = await Favorite.findOne({
      user: req.user._id,
      property: propertyId,
    });

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: "Favorite not found",
      });
    }

    await favorite.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Property removed from favorites",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to remove favorite",
      error: error.message,
    });
  }
};