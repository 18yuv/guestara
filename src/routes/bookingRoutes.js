import express from 'express';
import * as bookingController from '../controllers/bookingController.js';
import { validateBooking } from '../middlewares/validation.js';
import { bookingLimiter } from '../middlewares/rateLimit.js';

const router = express.Router();

router.post('/', bookingLimiter, validateBooking, bookingController.createBooking);
router.get('/', bookingController.getBookings);
router.patch('/:id/cancel', bookingController.cancelBooking);

export default router;