import express from 'express';

import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} from '../controllers/eventController.js';

import {
  protect,
  admin,
} from '../middleware/authMiddleware.js';

import upload from '../middleware/uploadMiddleware.js';

import {
  validateEvent,
} from '../middleware/validationMiddleware.js';

const router = express.Router();

router
  .route('/')
  .get(getEvents)
  .post(
    protect,
    admin,
    upload.single('image'),
    validateEvent,
    createEvent
  );

router
  .route('/:id')
  .get(getEventById)
  .put(
    protect,
    admin,
    upload.single('image'),
    validateEvent,
    updateEvent
  )
  .delete(
    protect,
    admin,
    deleteEvent
  );

export default router;