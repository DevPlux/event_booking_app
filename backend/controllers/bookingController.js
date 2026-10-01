import Booking from '../models/Booking.js';
import Event from '../models/Event.js';

const VALID_TRANSITIONS = {
  Pending: ['Confirmed', 'Cancelled'],
  Confirmed: ['Completed', 'Cancelled'],
  Completed: [],
  Cancelled: [],
};

export const createBooking = async (req, res) => {
  const { eventId, quantity } = req.body;

  try {
    const bookingQuantity = Number(quantity);

    if (!eventId) {
      return res.status(400).json({
        message: 'Event ID is required',
      });
    }

    if (!Number.isInteger(bookingQuantity) || bookingQuantity < 1) {
      return res.status(400).json({
        message: 'Quantity must be at least 1',
      });
    }

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        message: 'Event not found',
      });
    }

    // Business Logic 1:
    // Do not allow booking for an event that has already passed
    if (new Date(event.date) < new Date()) {
      return res.status(400).json({
        message: 'This event has already ended',
      });
    }

    // Business Logic 2:
    // Check remaining ticket capacity
    const availableTickets = event.capacity - event.ticketsSold;

    if (bookingQuantity > availableTickets) {
      return res.status(400).json({
        message: `Only ${availableTickets} ticket(s) are available`,
      });
    }

    // Business Logic 3:
    // Calculate booking total
    const totalAmount = event.price * bookingQuantity;

    const booking = new Booking({
      user: req.user._id,
      event: eventId,
      quantity: bookingQuantity,
      totalAmount,
      status: 'Pending',
    });

    const createdBooking = await booking.save();

    // Reserve tickets immediately after successful booking creation
    event.ticketsSold += bookingQuantity;
    await event.save();

    const populatedBooking = await Booking.findById(
      createdBooking._id
    ).populate('event');

    return res.status(201).json(populatedBooking);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      user: req.user._id,
    })
      .populate('event')
      .sort({ createdAt: -1 });

    return res.status(200).json(bookings);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({})
      .populate('user', 'name email')
      .populate('event')
      .sort({ createdAt: -1 });

    return res.status(200).json(bookings);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email')
      .populate('event');

    if (!booking) {
      return res.status(404).json({
        message: 'Booking not found',
      });
    }

    // User can only see own booking unless admin
    if (
      !req.user.isAdmin &&
      booking.user._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: 'Not authorized to view this booking',
      });
    }

    return res.status(200).json(booking);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const updateBookingStatus = async (req, res) => {
  const { status } = req.body;

  const validStatuses = [
    'Pending',
    'Confirmed',
    'Completed',
    'Cancelled',
  ];

  try {
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Invalid status provided',
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        message: 'Booking not found',
      });
    }

    if (!VALID_TRANSITIONS[booking.status]?.includes(status)) {
      return res.status(400).json({
        message: `Cannot change status from ${booking.status} to ${status}`,
      });
    }

    /*
      If a booking is cancelled,
      return the reserved tickets to the event.
    */
    if (status === 'Cancelled') {
      const event = await Event.findById(booking.event);

      if (event) {
        event.ticketsSold = Math.max(
          0,
          event.ticketsSold - booking.quantity
        );

        await event.save();
      }
    }

    booking.status = status;

    const updatedBooking = await booking.save();

    const populatedBooking = await Booking.findById(
      updatedBooking._id
    )
      .populate('user', 'name email')
      .populate('event');

    return res.status(200).json(populatedBooking);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        message: 'Booking not found',
      });
    }

    const isOwner =
      booking.user.toString() === req.user._id.toString();

    if (!isOwner && !req.user.isAdmin) {
      return res.status(403).json({
        message: 'Not authorized to delete this booking',
      });
    }

    /*
      If the booking has not already been cancelled,
      release its reserved tickets.
    */
    if (booking.status !== 'Cancelled') {
      const event = await Event.findById(booking.event);

      if (event) {
        event.ticketsSold = Math.max(
          0,
          event.ticketsSold - booking.quantity
        );

        await event.save();
      }
    }

    await booking.deleteOne();

    return res.status(200).json({
      message: 'Booking cancelled and removed',
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};