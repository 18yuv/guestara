import express from 'express';
import * as bookingController from '../controllers/bookingController.js';
import { validateBooking } from '../middlewares/validation.js';

const router = express.Router();

router.post('/', validateBooking, bookingController.createBooking);
router.get('/', bookingController.getBookings);
router.patch('/:id/cancel', bookingController.cancelBooking);

export default router;