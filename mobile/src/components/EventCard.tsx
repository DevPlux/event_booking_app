// src/components/EventCard.tsx

import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { Event } from "../types/event";

type Props = {
  event: Event;
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

  green: "#059669",
  greenSoft: "#ECFDF5",

  red: "#DC2626",
  redSoft: "#FEF2F2",

  amber: "#D97706",
  amberSoft: "#FFF7ED",
};

export default function EventCard({ event, onPress }: Props) {
  const eventDate = new Date(event.date);

  const availableTickets = Math.max(0, event.capacity - event.ticketsSold);

  const isPast = eventDate.getTime() < Date.now();

  const isSoldOut = availableTickets <= 0;

  const canBook = !isPast && !isSoldOut;

  const statusLabel = isPast
    ? "Ended"
    : isSoldOut
      ? "Sold Out"
      : `${availableTickets} Left`;

  const statusTheme = isPast
    ? {
        bg: THEME.background,
        text: THEME.muted,
      }
    : isSoldOut
      ? {
          bg: THEME.redSoft,
          text: THEME.red,
        }
      : {
          bg: THEME.greenSoft,
          text: THEME.green,
        };

  const imageUrl = event.imageUrl || "https://via.placeholder.com/400";

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      {/* Event image */}
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />

        <View style={styles.imageOverlay} />

        {/* Category */}
        <View style={styles.categoryPill}>
          <Text style={styles.categoryText} numberOfLines={1}>
            {event.category}
          </Text>
        </View>

        {/* Availability */}
        <View
          style={[
            styles.statusPill,
            {
              backgroundColor: statusTheme.bg,
            },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              {
                color: statusTheme.text,
              },
            ]}
            numberOfLines={1}
          >
            {statusLabel}
          </Text>
        </View>

        {/* Date badge */}
        <View style={styles.dateBadge}>
          <Text style={styles.dateDay}>
            {eventDate.getDate().toString().padStart(2, "0")}
          </Text>

          <Text style={styles.dateMonth}>
            {eventDate
              .toLocaleString("en-US", {
                month: "short",
              })
              .toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Card body */}
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
          {event.name}
        </Text>

        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={12} color={THEME.muted} />

          <Text style={styles.metaText} numberOfLines={1}>
            {event.location}
          </Text>
        </View>

        <View style={styles.metaRow}>
          <Ionicons name="time-outline" size={12} color={THEME.muted} />

          <Text style={styles.metaText} numberOfLines={1}>
            {eventDate.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>

        <View style={styles.footer}>
          <View style={{ flex: 1 }}>
            <Text style={styles.priceLabel}>FROM</Text>

            <Text style={styles.price} numberOfLines={1}>
              Rs. {event.price.toFixed(2)}
            </Text>
          </View>

          <View
            style={[
              styles.actionButton,
              !canBook && styles.actionButtonDisabled,
            ]}
          >
            <Ionicons
              name={canBook ? "arrow-forward" : "lock-closed-outline"}
              size={17}
              color={canBook ? THEME.white : THEME.muted}
            />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME.white,

    borderRadius: 18,

    overflow: "hidden",

    minHeight: 315,

    borderWidth: 1,
    borderColor: THEME.border,

    shadowColor: "#000",

    shadowOffset: {
      width: 0,
      height: 4,
    },

    shadowOpacity: 0.06,

    shadowRadius: 10,

    elevation: 3,
  },

  imageWrapper: {
    position: "relative",

    width: "100%",

    height: 165,

    backgroundColor: THEME.lavenderSoft,
  },

  image: {
    width: "100%",
    height: "100%",
  },

  imageOverlay: {
    position: "absolute",

    top: 0,
    left: 0,
    right: 0,
    bottom: 0,

    backgroundColor: "rgba(15,23,42,0.08)",
  },

  categoryPill: {
    position: "absolute",

    top: 10,
    left: 10,

    maxWidth: "55%",

    backgroundColor: "rgba(15,23,42,0.88)",

    paddingHorizontal: 9,
    paddingVertical: 5,

    borderRadius: 15,
  },

  categoryText: {
    color: THEME.white,

    fontSize: 9,

    fontWeight: "800",

    textTransform: "uppercase",

    letterSpacing: 0.5,
  },

  statusPill: {
    position: "absolute",

    top: 10,
    right: 10,

    maxWidth: "45%",

    paddingHorizontal: 8,
    paddingVertical: 5,

    borderRadius: 14,
  },

  statusText: {
    fontSize: 9,

    fontWeight: "900",

    textTransform: "uppercase",
  },

  dateBadge: {
    position: "absolute",

    bottom: 10,
    left: 10,

    width: 44,
    height: 48,

    borderRadius: 12,

    backgroundColor: THEME.white,

    justifyContent: "center",
    alignItems: "center",

    shadowColor: "#000",

    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.12,

    shadowRadius: 5,

    elevation: 3,
  },

  dateDay: {
    fontSize: 17,

    fontWeight: "900",

    color: THEME.navy,

    lineHeight: 19,
  },

  dateMonth: {
    fontSize: 8,

    fontWeight: "900",

    color: THEME.violet,

    letterSpacing: 0.6,
  },

  body: {
    flex: 1,

    padding: 13,
  },

  name: {
    fontSize: 15,

    fontWeight: "900",

    color: THEME.text,

    marginBottom: 7,

    letterSpacing: -0.2,
  },

  metaRow: {
    flexDirection: "row",

    alignItems: "center",

    marginBottom: 4,
  },

  metaText: {
    flex: 1,

    fontSize: 10,

    color: THEME.muted,

    marginLeft: 4,

    fontWeight: "500",
  },

  footer: {
    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "flex-end",

    marginTop: "auto",

    paddingTop: 10,
  },

  priceLabel: {
    fontSize: 8,

    color: THEME.muted,

    fontWeight: "900",

    letterSpacing: 0.8,
  },

  price: {
    fontSize: 15,

    fontWeight: "900",

    color: THEME.violet,

    marginTop: 1,

    flexShrink: 1,
  },

  actionButton: {
    width: 34,
    height: 34,

    borderRadius: 17,

    backgroundColor: THEME.violet,

    justifyContent: "center",

    alignItems: "center",

    marginLeft: 6,
  },

  actionButtonDisabled: {
    backgroundColor: THEME.background,

    borderWidth: 1,

    borderColor: THEME.border,
  },
});
