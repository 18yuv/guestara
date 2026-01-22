import bookingService from '../services/bookingService.js';
import Booking from '../models/Booking.js';
import { asyncHandler } from '../middlewares/errorHandler.js';

export const checkAvailability = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({
      success: false,
      message: 'Date is required'
    });
  }

  const availability = await bookingService.checkAvailability(id, date);

  res.json({
    success: true,
    data: availability
  });
});

export const createBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.createBooking(req.body);

  const populated = await booking.populate('item', 'name description');

  res.status(201).json({
    success: true,
    message: 'Booking created successfully',
    data: populated
  });
});

export const getBookings = asyncHandler(async (req, res) => {
  const result = await bookingService.getBookings(req.query);

  res.json({
    success: true,
    data: result.bookings,
    pagination: result.pagination
  });
});

export const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findByIdAndUpdate(
    req.params.id,
    { status: 'cancelled' },
    { new: true }
  ).populate('item', 'name description');

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found'
    });
  }

  res.json({
    success: true,
    message: 'Booking cancelled successfully',
    data: booking
  });
});