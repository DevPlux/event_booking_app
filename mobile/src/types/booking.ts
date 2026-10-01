// src/types/booking.ts

import { Event } from "./event";

export type BookingStatus = "Pending" | "Confirmed" | "Completed" | "Cancelled";

export interface BookingUser {
  _id: string;
  name: string;
  email: string;
}

export interface Booking {
  _id: string;

  user: string | BookingUser;

  event: Event;

  quantity: number;

  totalAmount: number;

  status: BookingStatus;

  bookingDate: string;

  createdAt?: string;
  updatedAt?: string;
}
