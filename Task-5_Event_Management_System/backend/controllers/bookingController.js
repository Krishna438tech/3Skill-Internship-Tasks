import Booking from "../models/Booking.js";
import Event from "../models/Event.js";

export const bookEvent = async (req, res) => {
  try {
    const { eventId, numberOfTickets } = req.body;

    if (!eventId || !numberOfTickets) {
      return res.status(400).json({
        success: false,
        message: "Event ID and number of tickets are required",
      });
    }

    const tickets = Number(numberOfTickets);

    if (tickets < 1) {
      return res.status(400).json({
        success: false,
        message: "Number of tickets must be at least 1",
      });
    }

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (event.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "This event is not active",
      });
    }

    const eventDate = new Date(event.date);
    const today = new Date();

    if (eventDate < today) {
      return res.status(400).json({
        success: false,
        message: "Cannot book past event",
      });
    }

    if (event.availableSeats < tickets) {
      return res.status(400).json({
        success: false,
        message: `Only ${event.availableSeats} seats are available`,
      });
    }

    const existingBooking = await Booking.findOne({
      user: req.user._id,
      event: eventId,
      status: { $in: ["pending", "approved"] },
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: "You already have an active booking for this event",
      });
    }

    const totalAmount = event.price * tickets;

    const booking = await Booking.create({
      user: req.user._id,
      event: eventId,
      numberOfTickets: tickets,
      totalAmount,
      status: "approved",
    });

    event.availableSeats = event.availableSeats - tickets;
    await event.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate("user", "name email phone")
      .populate("event", "title date time location price");

    res.status(201).json({
      success: true,
      message: "Event booked successfully",
      booking: populatedBooking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while booking event",
      error: error.message,
    });
  }
};

export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("event", "title image date time location price eventType")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while fetching my bookings",
      error: error.message,
    });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("event");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can cancel only your own booking",
      });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Booking is already cancelled",
      });
    }

    if (booking.status === "rejected") {
      return res.status(400).json({
        success: false,
        message: "Rejected booking cannot be cancelled",
      });
    }

    const eventDate = new Date(booking.event.date);
    const today = new Date();

    if (eventDate < today) {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel booking after event date",
      });
    }

    booking.status = "cancelled";
    await booking.save();

    const event = await Event.findById(booking.event._id);
    if (event) {
      event.availableSeats = event.availableSeats + booking.numberOfTickets;
      if (event.availableSeats > event.totalSeats) {
        event.availableSeats = event.totalSeats;
      }
      await event.save();
    }

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while cancelling booking",
      error: error.message,
    });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user", "name email phone")
      .populate("event", "title date time location price")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while fetching all bookings",
      error: error.message,
    });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be approved or rejected",
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cancelled booking cannot be updated",
      });
    }

    if (booking.status === status) {
      return res.status(400).json({
        success: false,
        message: `Booking is already ${status}`,
      });
    }

    if (status === "rejected" && booking.status === "approved") {
      const event = await Event.findById(booking.event);
      if (event) {
        event.availableSeats = event.availableSeats + booking.numberOfTickets;
        if (event.availableSeats > event.totalSeats) {
          event.availableSeats = event.totalSeats;
        }
        await event.save();
      }
    }

    if (status === "approved" && booking.status === "rejected") {
      const event = await Event.findById(booking.event);

      if (!event) {
        return res.status(404).json({
          success: false,
          message: "Event not found",
        });
      }

      if (event.availableSeats < booking.numberOfTickets) {
        return res.status(400).json({
          success: false,
          message: "Not enough seats available to approve this booking",
        });
      }

      event.availableSeats = event.availableSeats - booking.numberOfTickets;
      await event.save();
    }

    booking.status = status;
    await booking.save();

    const updatedBooking = await Booking.findById(booking._id)
      .populate("user", "name email phone")
      .populate("event", "title date time location price");

    res.status(200).json({
      success: true,
      message: `Booking ${status} successfully`,
      booking: updatedBooking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while updating booking status",
      error: error.message,
    });
  }
};