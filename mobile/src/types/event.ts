// src/types/event.ts

export interface Event {
  _id: string;
  name: string;
  description: string;
  date: string;
  location: string;
  price: number;
  capacity: number;
  ticketsSold: number;
  category: string;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}
