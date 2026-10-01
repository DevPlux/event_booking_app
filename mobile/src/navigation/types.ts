// src/navigation/types.ts

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type EventStackParamList = {
  EventList: undefined;
  EventDetail: { eventId: string };
};

export type BookingStackParamList = {
  MyBookings: undefined;
  BookingDetail: { bookingId: string };
};

export type MainTabParamList = {
  EventsTab: undefined;
  BookingsTab: undefined;
  AdminTab: undefined;
  ProfileTab: undefined;
};

export type AdminStackParamList = {
  AdminEventList: undefined;
  EventForm: { eventId?: string };
  AdminBookings: undefined;
  AdminBookingDetail: { bookingId: string };
};
