import express from 'express';

import {
  createBooking,
  getMyBookings,
  getBookingById,
  updateBookingStatus,
  deleteBooking,
  getAllBookings,
} from '../controllers/bookingController.js';

import {
  protect,
  admin,
} from '../middleware/authMiddleware.js';

import {
  validateBooking,
  validateBookingStatus,
} from '../middleware/validationMiddleware.js';

const router = express.Router();

router
  .route('/')
  .post(
    protect,
    validateBooking,
    createBooking
  )
  .get(
    protect,
    admin,
    getAllBookings
  );

router
  .route('/my')
  .get(
    protect,
    getMyBookings
  );

router
  .route('/:id')
  .get(
    protect,
    getBookingById
  )
  .delete(
    protect,
    deleteBooking
  );

router
  .route('/:id/status')
  .patch(
    protect,
    admin,
    validateBookingStatus,
    updateBookingStatus
  );

export default router;