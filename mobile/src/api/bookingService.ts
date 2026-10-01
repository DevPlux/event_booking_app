// src/api/bookingService.ts

import axiosClient from "./axiosClient";
import { Booking, BookingStatus } from "../types/booking";
import { Event } from "../types/event";

// ============= Read =============

export const getMyBookings = async (): Promise<Booking[]> => {
  const response = await axiosClient.get("/bookings/my");
  return response.data;
};

export const getAllBookings = async (): Promise<Booking[]> => {
  const response = await axiosClient.get("/bookings");
  return response.data;
};

export const getBookingById = async (id: string): Promise<Booking> => {
  const response = await axiosClient.get(`/bookings/${id}`);
  return response.data;
};

// ============= Create =============

type CreateBookingInput = {
  event: Event;
  quantity: number;
};

export const createBooking = async ({
  event,
  quantity,
}: CreateBookingInput): Promise<Booking> => {
  const response = await axiosClient.post("/bookings", {
    eventId: event._id,
    quantity,
  });

  return response.data;
};

// ============= Status =============

// Admin only
export const updateBookingStatus = async (
  id: string,
  newStatus: BookingStatus,
): Promise<Booking> => {
  const response = await axiosClient.patch(`/bookings/${id}/status`, {
    status: newStatus,
  });

  return response.data;
};

// ============= Cancel / Delete =============

// Normal user can cancel/delete their own booking.
// Backend also releases the reserved tickets.
export const cancelBooking = async (id: string): Promise<void> => {
  await axiosClient.delete(`/bookings/${id}`);
};

export const deleteBooking = async (id: string): Promise<void> => {
  await axiosClient.delete(`/bookings/${id}`);
};
