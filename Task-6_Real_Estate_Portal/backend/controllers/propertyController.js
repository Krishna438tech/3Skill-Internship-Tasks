import Property from "../models/Property.js";

const normalizeAmenities = (amenities) => {
  if (!amenities) {
    return [];
  }

  if (Array.isArray(amenities)) {
    return amenities.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof amenities === "string") {
    return amenities
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const normalizeImages = (images) => {
  if (!images) {
    return [];
  }

  if (Array.isArray(images)) {
    return images.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof images === "string") {
    return images
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const buildPropertyPayload = (body, userId) => {
  return {
    title: body.title,
    description: body.description,
    propertyType: body.propertyType,
    listingPurpose: body.listingPurpose,
    price: body.price,
    monthlyRent: body.monthlyRent || 0,
    securityDeposit: body.securityDeposit || 0,
    maintenanceCharge: body.maintenanceCharge || 0,
    bedrooms: body.bedrooms || 0,
    bathrooms: body.bathrooms || 0,
    balconies: body.balconies || 0,
    area: body.area,
    areaUnit: body.areaUnit || "sqft",
    furnishing: body.furnishing || "Unfurnished",
    floorNumber: body.floorNumber || 0,
    totalFloors: body.totalFloors || 0,
    parking: body.parking || "No Parking",
    address: body.address,
    city: body.city,
    state: body.state,
    pincode: body.pincode || "",
    amenities: normalizeAmenities(body.amenities),
    ownerName: body.ownerName,
    ownerEmail: body.ownerEmail,
    ownerPhone: body.ownerPhone,
    image: body.image,
    images: normalizeImages(body.images),
    availableFrom: body.availableFrom || Date.now(),
    tenantPreference: body.tenantPreference || "Any",
    availabilityStatus: body.availabilityStatus || "Available",
    isFeatured: body.isFeatured || false,
    isActive: body.isActive !== undefined ? body.isActive : true,
    createdBy: userId,
  };
};

export const createProperty = async (req, res) => {
  try {
    const {
      title,
      description,
      propertyType,
      listingPurpose,
      price,
      area,
      address,
      city,
      state,
      ownerName,
      ownerEmail,
      ownerPhone,
      image,
    } = req.body;

    if (
      !title ||
      !description ||
      !propertyType ||
      !listingPurpose ||
      price === undefined ||
      !area ||
      !address ||
      !city ||
      !state ||
      !ownerName ||
      !ownerEmail ||
      !ownerPhone ||
      !image
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required property fields",
      });
    }

    if (Number(price) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Property price or rent must be greater than 0",
      });
    }

    const property = await Property.create(
      buildPropertyPayload(req.body, req.user._id)
    );

    return res.status(201).json({
      success: true,
      message: "Property created successfully",
      property,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create property",
      error: error.message,
    });
  }
};

export const getProperties = async (req, res) => {
  try {
    const {
      search,
      propertyType,
      listingPurpose,
      city,
      state,
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      furnishing,
      availabilityStatus,
      isFeatured,
      sort,
      page = 1,
      limit = 12,
      showInactive,
    } = req.query;

    const query = {};

    if (showInactive !== "true") {
      query.isActive = true;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { city: { $regex: search, $options: "i" } },
        { state: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
      ];
    }

    if (propertyType) {
      query.propertyType = propertyType;
    }

    if (listingPurpose) {
      query.listingPurpose = listingPurpose;
    }

    if (city) {
      query.city = { $regex: city, $options: "i" };
    }

    if (state) {
      query.state = { $regex: state, $options: "i" };
    }

    if (bedrooms) {
      query.bedrooms = { $gte: Number(bedrooms) };
    }

    if (bathrooms) {
      query.bathrooms = { $gte: Number(bathrooms) };
    }

    if (furnishing) {
      query.furnishing = furnishing;
    }

    if (availabilityStatus) {
      query.availabilityStatus = availabilityStatus;
    }

    if (isFeatured === "true") {
      query.isFeatured = true;
    }

    if (minPrice || maxPrice) {
      query.price = {};

      if (minPrice) {
        query.price.$gte = Number(minPrice);
      }

      if (maxPrice) {
        query.price.$lte = Number(maxPrice);
      }
    }

    let sortOption = { createdAt: -1 };

    if (sort === "price-low") {
      sortOption = { price: 1 };
    } else if (sort === "price-high") {
      sortOption = { price: -1 };
    } else if (sort === "oldest") {
      sortOption = { createdAt: 1 };
    } else if (sort === "latest") {
      sortOption = { createdAt: -1 };
    }

    const pageNumber = Math.max(Number(page), 1);
    const limitNumber = Math.min(Math.max(Number(limit), 1), 50);
    const skip = (pageNumber - 1) * limitNumber;

    const totalProperties = await Property.countDocuments(query);

    const properties = await Property.find(query)
      .populate("createdBy", "name email role")
      .sort(sortOption)
      .skip(skip)
      .limit(limitNumber);

    return res.status(200).json({
      success: true,
      count: properties.length,
      totalProperties,
      totalPages: Math.ceil(totalProperties / limitNumber),
      currentPage: pageNumber,
      properties,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch properties",
      error: error.message,
    });
  }
};

export const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate(
      "createdBy",
      "name email role"
    );

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    if (!property.isActive) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    return res.status(200).json({
      success: true,
      property,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch property",
      error: error.message,
    });
  }
};

export const updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    const updatableFields = [
      "title",
      "description",
      "propertyType",
      "listingPurpose",
      "price",
      "monthlyRent",
      "securityDeposit",
      "maintenanceCharge",
      "bedrooms",
      "bathrooms",
      "balconies",
      "area",
      "areaUnit",
      "furnishing",
      "floorNumber",
      "totalFloors",
      "parking",
      "address",
      "city",
      "state",
      "pincode",
      "ownerName",
      "ownerEmail",
      "ownerPhone",
      "image",
      "availableFrom",
      "tenantPreference",
      "availabilityStatus",
      "isFeatured",
      "isActive",
    ];

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        property[field] = req.body[field];
      }
    });

    if (req.body.amenities !== undefined) {
      property.amenities = normalizeAmenities(req.body.amenities);
    }

    if (req.body.images !== undefined) {
      property.images = normalizeImages(req.body.images);
    }

    const updatedProperty = await property.save();

    return res.status(200).json({
      success: true,
      message: "Property updated successfully",
      property: updatedProperty,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update property",
      error: error.message,
    });
  }
};

export const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    await property.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Property deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete property",
      error: error.message,
    });
  }
};