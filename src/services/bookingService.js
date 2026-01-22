import Booking from '../models/Booking.js';
import Item from '../models/Item.js';

class BookingService {
  
  async checkAvailability(itemId, date) {
    const item = await Item.findById(itemId);
    
    if (!item) {
      throw new Error('Item not found');
    }

    if (!item.is_bookable) {
      throw new Error('This item is not bookable');
    }

    if (!item.availability || !item.availability.slots) {
      throw new Error('No availability configured for this item');
    }

    const requestedDate = new Date(date);
    const dayOfWeek = requestedDate.getDay();

    if (!item.availability.days.includes(dayOfWeek)) {
      return {
        available: false,
        message: 'Item is not available on this day',
        slots: []
      };
    }

    const existingBookings = await Booking.find({
      item: itemId,
      date: {
        $gte: new Date(requestedDate.setHours(0, 0, 0, 0)),
        $lt: new Date(requestedDate.setHours(23, 59, 59, 999))
      },
      status: 'confirmed'
    });

    const availableSlots = item.availability.slots.filter(slot => {
      const isBooked = existingBookings.some(booking => {
        return this.timesOverlap(
          slot.start_time,
          slot.end_time,
          booking.start_time,
          booking.end_time
        );
      });
      return !isBooked;
    });

    return {
      available: availableSlots.length > 0,
      date: date,
      day_of_week: dayOfWeek,
      total_slots: item.availability.slots.length,
      available_slots: availableSlots,
      booked_slots: item.availability.slots.length - availableSlots.length
    };
  }

  async createBooking(bookingData) {
    const { item, date, start_time, end_time, user_name, user_email } = bookingData;

    const itemDoc = await Item.findById(item);
    
    if (!itemDoc) {
      throw new Error('Item not found');
    }

    if (!itemDoc.is_bookable) {
      throw new Error('This item is not bookable');
    }

    const requestedDate = new Date(date);
    const dayOfWeek = requestedDate.getDay();

    if (!itemDoc.availability.days.includes(dayOfWeek)) {
      throw new Error('Item is not available on this day');
    }

    const slotExists = itemDoc.availability.slots.some(slot => {
      return slot.start_time === start_time && slot.end_time === end_time;
    });

    if (!slotExists) {
      throw new Error('Requested time slot is not available');
    }

    const conflict = await this.checkConflict(item, date, start_time, end_time);
    
    if (conflict) {
      throw new Error('This time slot is already booked');
    }

    const booking = await Booking.create({
      item,
      date,
      start_time,
      end_time,
      user_name,
      user_email,
      status: 'confirmed'
    });

    return booking;
  }

  async checkConflict(itemId, date, startTime, endTime) {
    const requestedDate = new Date(date);
    
    const existingBooking = await Booking.findOne({
      item: itemId,
      date: {
        $gte: new Date(requestedDate.setHours(0, 0, 0, 0)),
        $lt: new Date(requestedDate.setHours(23, 59, 59, 999))
      },
      status: 'confirmed',
      $or: [
        {
          start_time: { $lt: endTime },
          end_time: { $gt: startTime }
        }
      ]
    });

    return existingBooking !== null;
  }

  timesOverlap(start1, end1, start2, end2) {
    return start1 < end2 && end1 > start2;
  }

  async getBookings(filters = {}) {
    const { item, date, user_email, status, page = 1, limit = 10 } = filters;
    
    const query = {};
    
    if (item) query.item = item;
    if (user_email) query.user_email = user_email;
    if (status) query.status = status;
    
    if (date) {
      const requestedDate = new Date(date);
      query.date = {
        $gte: new Date(requestedDate.setHours(0, 0, 0, 0)),
        $lt: new Date(requestedDate.setHours(23, 59, 59, 999))
      };
    }

    const skip = (page - 1) * limit;

    const bookings = await Booking.find(query)
      .populate('item', 'name description')
      .sort({ date: -1, start_time: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(query);

    return {
      bookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }
}

export default new BookingService();