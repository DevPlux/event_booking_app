// src/components/BookingCard.tsx

import React from "react";

import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { Booking, BookingStatus } from "../types/booking";

type Props = {
  booking: Booking;
  onPress: () => void;
};

const THEME = {
  navy: "#0F172A",
  violet: "#7C3AED",

  lavender: "#EDE9FE",
  lavenderSoft: "#F5F3FF",

  white: "#FFFFFF",
  background: "#F8FAFC",

  text: "#111827",
  muted: "#64748B",
  border: "#E2E8F0",

  amber: "#D97706",
  amberSoft: "#FFF7ED",

  blue: "#2563EB",
  blueSoft: "#EFF6FF",

  green: "#059669",
  greenSoft: "#ECFDF5",

  red: "#DC2626",
  redSoft: "#FEF2F2",
};

const STATUS_COLORS: Record<
  BookingStatus,
  {
    rail: string;
    bg: string;
    text: string;
    icon: string;
  }
> = {
  Pending: {
    rail: THEME.amber,
    bg: THEME.amberSoft,
    text: THEME.amber,
    icon: "time-outline",
  },

  Confirmed: {
    rail: THEME.blue,
    bg: THEME.blueSoft,
    text: THEME.blue,
    icon: "checkmark-circle-outline",
  },

  Completed: {
    rail: THEME.green,
    bg: THEME.greenSoft,
    text: THEME.green,
    icon: "checkmark-done-circle-outline",
  },

  Cancelled: {
    rail: THEME.red,
    bg: THEME.redSoft,
    text: THEME.red,
    icon: "close-circle-outline",
  },
};

export default function BookingCard({ booking, onPress }: Props) {
  const event = booking.event;

  const bookingDate = new Date(booking.bookingDate);

  const eventDate = event?.date ? new Date(event.date) : null;

  const eventName = event?.name ?? "Unknown Event";

  const eventImage = event?.imageUrl || "https://via.placeholder.com/150";

  const eventLocation = event?.location || "Location unavailable";

  const total =
    typeof booking.totalAmount === "number"
      ? booking.totalAmount.toFixed(2)
      : "0.00";

  const status = STATUS_COLORS[booking.status] || STATUS_COLORS.Pending;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      {/* Status rail */}
      <View
        style={[
          styles.rail,
          {
            backgroundColor: status.rail,
          },
        ]}
      />

      {/* Event image */}
      <Image
        source={{
          uri: eventImage,
        }}
        style={styles.image}
        resizeMode="cover"
      />

      {/* Body */}
      <View style={styles.body}>
        <View style={styles.topRow}>
          <Text style={styles.bookingId}>
            #{booking._id.slice(-6).toUpperCase()}
          </Text>

          <View
            style={[
              styles.badge,
              {
                backgroundColor: status.bg,
              },
            ]}
          >
            <Ionicons name={status.icon as any} size={11} color={status.text} />

            <Text
              style={[
                styles.badgeText,
                {
                  color: status.text,
                },
              ]}
            >
              {booking.status}
            </Text>
          </View>
        </View>

        <Text style={styles.eventName} numberOfLines={1}>
          {eventName}
        </Text>

        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={12} color={THEME.muted} />

          <Text style={styles.metaText} numberOfLines={1}>
            {eventLocation}
          </Text>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="ticket-outline" size={12} color={THEME.muted} />

            <Text style={styles.metaText}>
              {booking.quantity} {booking.quantity === 1 ? "ticket" : "tickets"}
            </Text>
          </View>

          {eventDate && (
            <>
              <Text style={styles.dot}>•</Text>

              <Ionicons name="calendar-outline" size={12} color={THEME.muted} />

              <Text style={styles.metaText}>
                {eventDate.toLocaleDateString()}
              </Text>
            </>
          )}
        </View>

        <View style={styles.bottomRow}>
          <View>
            <Text style={styles.bookedLabel}>BOOKED</Text>

            <Text style={styles.bookingDate}>
              {bookingDate.toLocaleDateString()}
            </Text>
          </View>

          <View style={styles.totalArea}>
            <Text style={styles.totalLabel}>TOTAL</Text>

            <Text style={styles.total}>Rs. {total}</Text>
          </View>

          <View style={styles.arrowButton}>
            <Ionicons name="chevron-forward" size={17} color={THEME.violet} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",

    backgroundColor: THEME.white,

    borderRadius: 16,

    marginBottom: 14,

    overflow: "hidden",

    borderWidth: 1,
    borderColor: THEME.border,

    shadowColor: "#000",

    shadowOffset: {
      width: 0,
      height: 3,
    },

    shadowOpacity: 0.05,

    shadowRadius: 8,

    elevation: 2,

    minHeight: 126,
  },

  rail: {
    width: 5,
  },

  image: {
    width: 94,

    alignSelf: "stretch",

    backgroundColor: THEME.lavenderSoft,
  },

  body: {
    flex: 1,

    padding: 12,
  },

  topRow: {
    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

    marginBottom: 5,
  },

  bookingId: {
    fontSize: 9,

    fontWeight: "900",

    color: THEME.muted,

    letterSpacing: 0.8,
  },

  badge: {
    flexDirection: "row",

    alignItems: "center",

    paddingHorizontal: 7,

    paddingVertical: 4,

    borderRadius: 12,
  },

  badgeText: {
    fontSize: 8,

    fontWeight: "900",

    letterSpacing: 0.2,

    marginLeft: 4,

    textTransform: "uppercase",
  },

  eventName: {
    fontSize: 15,

    fontWeight: "900",

    color: THEME.text,

    marginBottom: 5,
  },

  metaRow: {
    flexDirection: "row",

    alignItems: "center",

    marginTop: 3,
  },

  metaItem: {
    flexDirection: "row",

    alignItems: "center",
  },

  metaText: {
    fontSize: 10,

    color: THEME.muted,

    marginLeft: 3,

    fontWeight: "500",

    flexShrink: 1,
  },

  dot: {
    color: THEME.muted,

    marginHorizontal: 5,

    fontSize: 10,
  },

  bottomRow: {
    flexDirection: "row",

    alignItems: "flex-end",

    marginTop: 9,

    paddingTop: 8,

    borderTopWidth: 1,

    borderTopColor: THEME.background,
  },

  bookedLabel: {
    fontSize: 7,

    color: THEME.muted,

    fontWeight: "900",

    letterSpacing: 0.8,
  },

  bookingDate: {
    fontSize: 9,

    color: THEME.muted,

    fontWeight: "600",

    marginTop: 2,
  },

  totalArea: {
    marginLeft: "auto",

    alignItems: "flex-end",
  },

  totalLabel: {
    fontSize: 7,

    color: THEME.muted,

    fontWeight: "900",

    letterSpacing: 0.8,
  },

  total: {
    fontSize: 15,

    fontWeight: "900",

    color: THEME.violet,

    marginTop: 1,
  },

  arrowButton: {
    width: 30,
    height: 30,

    borderRadius: 15,

    backgroundColor: THEME.lavenderSoft,

    justifyContent: "center",

    alignItems: "center",

    marginLeft: 8,
  },
});
