import Event from '../models/Event.js';

export const getEvents = async (req, res) => {
  try {
    const events = await Event.find({}).sort({ date: 1 });

    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (event) {
      res.status(200).json(event);
    } else {
      res.status(404).json({ message: 'Event not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createEvent = async (req, res) => {
  const {
    name,
    description,
    date,
    location,
    price,
    capacity,
    category,
  } = req.body;

  let imageUrl = '';

  if (req.file) {
    imageUrl = req.file.path;
  }

  if (!imageUrl) {
    return res.status(400).json({
      message: 'Image is required',
    });
  }

  try {
    const event = new Event({
      name,
      description,
      date,
      location,
      price,
      capacity,
      ticketsSold: 0,
      category,
      imageUrl,
    });

    const createdEvent = await event.save();

    res.status(201).json(createdEvent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateEvent = async (req, res) => {
  const {
    name,
    description,
    date,
    location,
    price,
    capacity,
    category,
  } = req.body;

  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        message: 'Event not found',
      });
    }

    if (name !== undefined) {
      event.name = name;
    }

    if (description !== undefined) {
      event.description = description;
    }

    if (date !== undefined) {
      event.date = date;
    }

    if (location !== undefined) {
      event.location = location;
    }

    if (price !== undefined) {
      event.price = price;
    }

    if (category !== undefined) {
      event.category = category;
    }

    if (capacity !== undefined) {
      const newCapacity = Number(capacity);

      if (newCapacity < event.ticketsSold) {
        return res.status(400).json({
          message: `Capacity cannot be less than tickets already sold (${event.ticketsSold})`,
        });
      }

      event.capacity = newCapacity;
    }

    if (req.file) {
      event.imageUrl = req.file.path;
    }

    const updatedEvent = await event.save();

    res.status(200).json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (event) {
      await event.deleteOne();

      res.status(200).json({
        message: 'Event removed',
      });
    } else {
      res.status(404).json({
        message: 'Event not found',
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};