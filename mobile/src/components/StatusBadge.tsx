// src/components/StatusBadge.tsx

import React from "react";
import { Text, StyleSheet, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { BookingStatus } from "../types/booking";

type Props = {
  status: BookingStatus;
};

const STATUS_THEME: Record<
  BookingStatus,
  {
    bg: string;
    text: string;
    icon: string;
  }
> = {
  Pending: {
    bg: "#FFF7ED",
    text: "#D97706",
    icon: "time-outline",
  },

  Confirmed: {
    bg: "#EFF6FF",
    text: "#2563EB",
    icon: "checkmark-circle-outline",
  },

  Completed: {
    bg: "#ECFDF5",
    text: "#059669",
    icon: "checkmark-done-circle-outline",
  },

  Cancelled: {
    bg: "#FEF2F2",
    text: "#DC2626",
    icon: "close-circle-outline",
  },
};

export default function StatusBadge({ status }: Props) {
  const theme = STATUS_THEME[status] || STATUS_THEME.Pending;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: theme.bg,
        },
      ]}
    >
      <Ionicons name={theme.icon as any} size={12} color={theme.text} />

      <Text
        style={[
          styles.text,
          {
            color: theme.text,
          },
        ]}
      >
        {status}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 9,
    paddingVertical: 5,

    borderRadius: 14,

    alignSelf: "flex-start",
  },

  text: {
    fontSize: 10,
    fontWeight: "900",
    marginLeft: 4,
    letterSpacing: 0.2,
  },
});
