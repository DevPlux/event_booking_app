export const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({
      message: 'Name is required',
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({
      message: 'A valid email is required',
    });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({
      message: 'Password must be at least 6 characters long',
    });
  }

  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({
      message: 'A valid email is required',
    });
  }

  if (!password) {
    return res.status(400).json({
      message: 'Password is required',
    });
  }

  next();
};

export const validateEvent = (req, res, next) => {
  const {
    name,
    description,
    date,
    location,
    price,
    capacity,
    category,
  } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({
      message: 'Event name is required',
    });
  }

  if (!description || description.trim() === '') {
    return res.status(400).json({
      message: 'Description is required',
    });
  }

  if (!date || isNaN(new Date(date).getTime())) {
    return res.status(400).json({
      message: 'A valid event date is required',
    });
  }

  if (!location || location.trim() === '') {
    return res.status(400).json({
      message: 'Location is required',
    });
  }

  if (
    price === undefined ||
    price === null ||
    isNaN(Number(price)) ||
    Number(price) < 0
  ) {
    return res.status(400).json({
      message: 'Price must be a valid number greater than or equal to 0',
    });
  }

  if (
    capacity === undefined ||
    capacity === null ||
    isNaN(Number(capacity)) ||
    !Number.isInteger(Number(capacity)) ||
    Number(capacity) < 1
  ) {
    return res.status(400).json({
      message: 'Capacity must be a whole number greater than or equal to 1',
    });
  }

  if (!category || category.trim() === '') {
    return res.status(400).json({
      message: 'Category is required',
    });
  }

  next();
};

export const validateBooking = (req, res, next) => {
  const { eventId, quantity } = req.body;

  if (
    !eventId ||
    typeof eventId !== 'string' ||
    eventId.trim() === ''
  ) {
    return res.status(400).json({
      message: 'Event ID is required',
    });
  }

  if (
    quantity === undefined ||
    quantity === null ||
    isNaN(Number(quantity)) ||
    !Number.isInteger(Number(quantity)) ||
    Number(quantity) < 1
  ) {
    return res.status(400).json({
      message: 'Quantity must be a whole number greater than or equal to 1',
    });
  }

  next();
};

export const validateBookingStatus = (req, res, next) => {
  const { status } = req.body;

  const validStatuses = [
    'Pending',
    'Confirmed',
    'Completed',
    'Cancelled',
  ];

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({
      message:
        'Status must be one of: Pending, Confirmed, Completed, Cancelled',
    });
  }

  next();
};