import mongoose from "mongoose";

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Property title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters long"],
      maxlength: [120, "Title cannot exceed 120 characters"],
    },

    description: {
      type: String,
      required: [true, "Property description is required"],
      trim: true,
      minlength: [20, "Description must be at least 20 characters long"],
    },

    propertyType: {
      type: String,
      required: [true, "Property type is required"],
      enum: [
        "Flat",
        "Apartment",
        "House",
        "Villa",
        "Bungalow",
        "Plot",
        "Commercial",
      ],
    },

    listingPurpose: {
      type: String,
      required: [true, "Listing purpose is required"],
      enum: ["Rent", "Sale"],
    },

    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },

    monthlyRent: {
      type: Number,
      default: 0,
      min: [0, "Monthly rent cannot be negative"],
    },

    securityDeposit: {
      type: Number,
      default: 0,
      min: [0, "Security deposit cannot be negative"],
    },

    maintenanceCharge: {
      type: Number,
      default: 0,
      min: [0, "Maintenance charge cannot be negative"],
    },

    bedrooms: {
      type: Number,
      default: 0,
      min: [0, "Bedrooms cannot be negative"],
    },

    bathrooms: {
      type: Number,
      default: 0,
      min: [0, "Bathrooms cannot be negative"],
    },

    balconies: {
      type: Number,
      default: 0,
      min: [0, "Balconies cannot be negative"],
    },

    area: {
      type: Number,
      required: [true, "Area is required"],
      min: [1, "Area must be greater than 0"],
    },

    areaUnit: {
      type: String,
      enum: ["sqft", "sqm", "sqyd"],
      default: "sqft",
    },

    furnishing: {
      type: String,
      enum: ["Unfurnished", "Semi-Furnished", "Fully Furnished"],
      default: "Unfurnished",
    },

    floorNumber: {
      type: Number,
      default: 0,
    },

    totalFloors: {
      type: Number,
      default: 0,
      min: [0, "Total floors cannot be negative"],
    },

    parking: {
      type: String,
      enum: ["No Parking", "Bike Parking", "Car Parking", "Bike and Car Parking"],
      default: "No Parking",
    },

    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },

    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },

    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
    },

    pincode: {
      type: String,
      trim: true,
      default: "",
    },

    amenities: {
      type: [String],
      default: [],
    },

    ownerName: {
      type: String,
      required: [true, "Owner name is required"],
      trim: true,
    },

    ownerEmail: {
      type: String,
      required: [true, "Owner email is required"],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid owner email"],
    },

    ownerPhone: {
      type: String,
      required: [true, "Owner phone is required"],
      trim: true,
    },

    image: {
      type: String,
      required: [true, "Property image URL is required"],
      trim: true,
    },

    images: {
      type: [String],
      default: [],
    },

    availableFrom: {
      type: Date,
      default: Date.now,
    },

    tenantPreference: {
      type: String,
      enum: ["Any", "Family", "Bachelor", "Company"],
      default: "Any",
    },

    availabilityStatus: {
      type: String,
      enum: ["Available", "Rented", "Sold", "Under Review"],
      default: "Available",
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

propertySchema.index({
  title: "text",
  description: "text",
  city: "text",
  state: "text",
  address: "text",
});

const Property = mongoose.model("Property", propertySchema);

export default Property;