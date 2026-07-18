import Event from "../models/Event.js";
import Category from "../models/Category.js";

export const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      image,
      date,
      time,
      location,
      eventType,
      price,
      totalSeats,
      organizer,
    } = req.body;

    if (
      !title ||
      !description ||
      !category ||
      !date ||
      !time ||
      !location ||
      !totalSeats ||
      !organizer
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    const categoryExists = await Category.findById(category);

    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const event = await Event.create({
      title,
      description,
      category,
      image,
      date,
      time,
      location,
      eventType,
      price,
      totalSeats,
      availableSeats: totalSeats,
      organizer,
    });

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      event,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while creating event",
      error: error.message,
    });
  }
};

export const getEvents = async (req, res) => {
  try {
    const { search, category, eventType, status } = req.query;

    const query = {};

    if (status && status !== "all") {
      query.status = status;
    }

    if (!status) {
      query.status = "active";
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { organizer: { $regex: search, $options: "i" } },
      ];
    }

    if (category) {
      query.category = category;
    }

    if (eventType) {
      query.eventType = eventType;
    }

    const events = await Event.find(query)
      .populate("category", "name")
      .sort({ date: 1 });

    res.status(200).json({
      success: true,
      count: events.length,
      events,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while fetching events",
      error: error.message,
    });
  }
};

export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate("category", "name");

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    res.status(200).json({
      success: true,
      event,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while fetching event details",
      error: error.message,
    });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("category", "name");

    res.status(200).json({
      success: true,
      message: "Event updated successfully",
      event: updatedEvent,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while updating event",
      error: error.message,
    });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    await event.deleteOne();

    res.status(200).json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while deleting event",
      error: error.message,
    });
  }
};