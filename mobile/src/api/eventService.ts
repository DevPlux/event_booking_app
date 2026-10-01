// src/api/eventService.ts

import axiosClient from "./axiosClient";
import { Event } from "../types/event";

export const getEvents = async (): Promise<Event[]> => {
  const response = await axiosClient.get("/events");
  return response.data;
};

export const getEventById = async (id: string): Promise<Event> => {
  const response = await axiosClient.get(`/events/${id}`);
  return response.data;
};

export type EventInput = {
  name: string;
  description: string;
  date: string;
  location: string;
  price: number;
  capacity: number;
  category: string;
  imageUri?: string;
};

// Helper to build FormData for image upload
const buildEventFormData = (input: EventInput): FormData => {
  const formData = new FormData();

  formData.append("name", input.name);
  formData.append("description", input.description);
  formData.append("date", input.date);
  formData.append("location", input.location);
  formData.append("price", String(input.price));
  formData.append("capacity", String(input.capacity));
  formData.append("category", input.category);

  if (input.imageUri) {
    const uriParts = input.imageUri.split(".");
    const ext =
      uriParts.length > 1 ? uriParts[uriParts.length - 1].toLowerCase() : "jpg";

    formData.append("image", {
      uri: input.imageUri,
      name: `photo.${ext}`,
      type: ext === "png" ? "image/png" : "image/jpeg",
    } as any);
  }

  return formData;
};

export const createEvent = async (input: EventInput): Promise<Event> => {
  const formData = buildEventFormData(input);

  const response = await axiosClient.post("/events", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const updateEvent = async (
  id: string,
  input: EventInput,
): Promise<Event> => {
  const formData = buildEventFormData(input);

  const response = await axiosClient.put(`/events/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const deleteEvent = async (id: string): Promise<void> => {
  await axiosClient.delete(`/events/${id}`);
};
