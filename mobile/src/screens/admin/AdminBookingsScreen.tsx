// src/screens/admin/AdminBookingsScreen.tsx

import React, { useState, useCallback, useMemo } from "react";

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { Booking, BookingStatus } from "../../types/booking";

import { getAllBookings } from "../../api/bookingService";

import Loading from "../../components/Loading";
import ErrorText from "../../components/ErrorText";

import { AdminStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<AdminStackParamList, "AdminBookings">;

type FilterKey = "All" | "Active" | BookingStatus;

const FILTERS: FilterKey[] = [
  "All",
  "Active",
  "Pending",
  "Confirmed",
  "Completed",
  "Cancelled",
];

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

const STATUS_THEME: Record<
  BookingStatus,
  {
    bg: string;
    text: string;
    icon: string;
  }
> = {
  Pending: {
    bg: THEME.amberSoft,
    text: THEME.amber,
    icon: "time-outline",
  },

  Confirmed: {
    bg: THEME.blueSoft,
    text: THEME.blue,
    icon: "checkmark-circle-outline",
  },

  Completed: {
    bg: THEME.greenSoft,
    text: THEME.green,
    icon: "checkmark-done-circle-outline",
  },

  Cancelled: {
    bg: THEME.redSoft,
    text: THEME.red,
    icon: "close-circle-outline",
  },
};

const getUserName = (booking: Booking) => {
  if (typeof booking.user === "string") {
    return booking.user;
  }

  return booking.user?.name || "Unknown User";
};

export default function AdminBookingsScreen({ navigation }: Props) {
  const [bookings, setBookings] = useState<Booking[]>([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [activeFilter, setActiveFilter] = useState<FilterKey>("All");

  const fetchBookings = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const data = await getAllBookings();

      setBookings(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load bookings");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchBookings();
    }, []),
  );

  const stats = useMemo(() => {
    const active = bookings.filter(
      (booking) =>
        booking.status === "Pending" || booking.status === "Confirmed",
    ).length;

    const completed = bookings.filter(
      (booking) => booking.status === "Completed",
    ).length;

    return {
      total: bookings.length,
      active,
      completed,
    };
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    if (activeFilter === "All") {
      return bookings;
    }

    if (activeFilter === "Active") {
      return bookings.filter(
        (booking) =>
          booking.status === "Pending" || booking.status === "Confirmed",
      );
    }

    return bookings.filter((booking) => booking.status === activeFilter);
  }, [bookings, activeFilter]);

  if (loading) {
    return <Loading />;
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Header */}
      <View style={styles.topBar}>
        <View style={styles.topGlow} />

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color={THEME.navy} />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <View style={styles.adminBadge}>
            <Ionicons
              name="shield-checkmark-outline"
              size={11}
              color="#C4B5FD"
            />

            <Text style={styles.adminBadgeText}>EVENTORA ADMIN</Text>
          </View>

          <Text style={styles.topBarTitle}>All Bookings</Text>

          <Text style={styles.topBarSubtitle}>
            {stats.total} booking
            {stats.total !== 1 ? "s" : ""} · {stats.active} active
          </Text>
        </View>

        <TouchableOpacity
          style={styles.refreshButton}
          onPress={() => fetchBookings(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="refresh" size={18} color={THEME.violet} />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <StatCard
          value={stats.total}
          label="TOTAL"
          icon="ticket-outline"
          iconColor={THEME.violet}
          iconBg={THEME.lavenderSoft}
        />

        <StatCard
          value={stats.active}
          label="ACTIVE"
          icon="time-outline"
          iconColor={THEME.amber}
          iconBg={THEME.amberSoft}
        />

        <StatCard
          value={stats.completed}
          label="COMPLETED"
          icon="checkmark-done-outline"
          iconColor={THEME.green}
          iconBg={THEME.greenSoft}
        />
      </View>

      {/* Filter chips */}
      <View style={styles.chipsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {FILTERS.map((filter) => {
            const isActive = filter === activeFilter;

            return (
              <TouchableOpacity
                key={filter}
                style={[styles.chip, isActive && styles.chipActive]}
                onPress={() => setActiveFilter(filter)}
              >
                <Text
                  style={[styles.chipText, isActive && styles.chipTextActive]}
                >
                  {filter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Booking list */}
      <FlatList
        data={filteredBookings}
        keyExtractor={(booking) => booking._id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchBookings(true)}
            tintColor={THEME.violet}
          />
        }
        ListEmptyComponent={
          error ? (
            <View style={styles.emptyBox}>
              <View
                style={[
                  styles.emptyIconCircle,
                  {
                    backgroundColor: THEME.redSoft,
                  },
                ]}
              >
                <Ionicons
                  name="cloud-offline-outline"
                  size={36}
                  color={THEME.red}
                />
              </View>

              <Text style={styles.emptyTitle}>Something went wrong</Text>

              <ErrorText>{error}</ErrorText>

              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => fetchBookings()}
              >
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.emptyBox}>
              <View style={styles.emptyIconCircle}>
                <Ionicons
                  name="ticket-outline"
                  size={37}
                  color={THEME.violet}
                />
              </View>

              <Text style={styles.emptyTitle}>
                {activeFilter === "All"
                  ? "No bookings yet"
                  : `No ${activeFilter.toLowerCase()} bookings`}
              </Text>

              <Text style={styles.emptySubtitle}>
                Customer bookings will appear here.
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => {
          const event = item.event;

          const eventName = event?.name || "Unknown Event";

          const eventImage =
            event?.imageUrl || "https://via.placeholder.com/150";

          const total =
            typeof item.totalAmount === "number"
              ? item.totalAmount.toFixed(2)
              : "0.00";

          const bookingDate = new Date(item.bookingDate);

          const customerName = getUserName(item);

          const statusTheme = STATUS_THEME[item.status];

          return (
            <TouchableOpacity
              style={styles.bookingCard}
              onPress={() =>
                navigation.navigate("AdminBookingDetail", {
                  bookingId: item._id,
                })
              }
              activeOpacity={0.9}
            >
              <Image
                source={{
                  uri: eventImage,
                }}
                style={styles.bookingImage}
              />

              <View style={styles.bookingBody}>
                <View style={styles.bookingTopRow}>
                  <Text style={styles.bookingId}>
                    #{item._id.slice(-6).toUpperCase()}
                  </Text>

                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: statusTheme.bg,
                      },
                    ]}
                  >
                    <Ionicons
                      name={statusTheme.icon as any}
                      size={11}
                      color={statusTheme.text}
                    />

                    <Text
                      style={[
                        styles.statusText,
                        {
                          color: statusTheme.text,
                        },
                      ]}
                    >
                      {item.status}
                    </Text>
                  </View>
                </View>

                <Text style={styles.eventName} numberOfLines={1}>
                  {eventName}
                </Text>

                <View style={styles.bookingMeta}>
                  <Ionicons
                    name="person-outline"
                    size={11}
                    color={THEME.muted}
                  />

                  <Text style={styles.bookingMetaText} numberOfLines={1}>
                    {customerName}
                  </Text>

                  <Text style={styles.dot}>·</Text>

                  <Ionicons
                    name="ticket-outline"
                    size={11}
                    color={THEME.muted}
                  />

                  <Text style={styles.bookingMetaText}>{item.quantity}</Text>
                </View>

                <View style={styles.bookingBottomRow}>
                  <Text style={styles.bookingDate}>
                    {bookingDate.toLocaleDateString()}{" "}
                    {bookingDate.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>

                  <Text style={styles.bookingTotal}>Rs. {total}</Text>
                </View>
              </View>

              <Ionicons
                name="chevron-forward"
                size={18}
                color={THEME.muted}
                style={{
                  marginLeft: 6,
                }}
              />
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

function StatCard({
  value,
  label,
  icon,
  iconColor,
  iconBg,
}: {
  value: number;
  label: string;
  icon: string;
  iconColor: string;
  iconBg: string;
}) {
  return (
    <View style={styles.statCard}>
      <View
        style={[
          styles.statIconBox,
          {
            backgroundColor: iconBg,
          },
        ]}
      >
        <Ionicons name={icon as any} size={17} color={iconColor} />
      </View>

      <Text style={styles.statValue}>{value}</Text>

      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: THEME.background,
  },

  topBar: {
    backgroundColor: THEME.navy,

    flexDirection: "row",
    alignItems: "flex-start",

    paddingHorizontal: 16,
    paddingTop: 15,
    paddingBottom: 26,

    overflow: "hidden",
  },

  topGlow: {
    position: "absolute",

    width: 220,
    height: 220,
    borderRadius: 110,

    backgroundColor: THEME.violet,

    top: -125,
    right: -85,

    opacity: 0.28,
  },

  backButton: {
    width: 42,
    height: 42,

    borderRadius: 21,

    backgroundColor: THEME.white,

    justifyContent: "center",
    alignItems: "center",

    marginTop: 3,
  },

  headerContent: {
    flex: 1,
    marginLeft: 12,
  },

  adminBadge: {
    flexDirection: "row",
    alignItems: "center",

    alignSelf: "flex-start",

    backgroundColor: "rgba(124,58,237,0.18)",

    paddingHorizontal: 9,
    paddingVertical: 4,

    borderRadius: 16,

    marginBottom: 8,

    gap: 4,
  },

  adminBadgeText: {
    color: "#C4B5FD",

    fontSize: 8,
    fontWeight: "900",

    letterSpacing: 1.3,
  },

  topBarTitle: {
    color: THEME.white,

    fontSize: 26,
    fontWeight: "900",

    letterSpacing: -0.7,
  },

  topBarSubtitle: {
    color: "#CBD5E1",

    fontSize: 12,

    marginTop: 4,

    fontWeight: "500",
  },

  refreshButton: {
    width: 42,
    height: 42,

    borderRadius: 21,

    backgroundColor: THEME.white,

    justifyContent: "center",
    alignItems: "center",

    marginTop: 3,
  },

  statsRow: {
    flexDirection: "row",

    marginHorizontal: 16,
    marginTop: -13,

    gap: 10,
  },

  statCard: {
    flex: 1,

    backgroundColor: THEME.white,

    borderRadius: 16,

    paddingVertical: 12,
    paddingHorizontal: 10,

    borderWidth: 1,
    borderColor: THEME.border,
  },

  statIconBox: {
    width: 30,
    height: 30,

    borderRadius: 9,

    justifyContent: "center",
    alignItems: "center",

    marginBottom: 7,
  },

  statValue: {
    fontSize: 20,

    fontWeight: "900",

    color: THEME.text,
  },

  statLabel: {
    fontSize: 9,

    color: THEME.muted,

    fontWeight: "900",

    marginTop: 3,

    letterSpacing: 0.9,
  },

  chipsWrapper: {
    height: 58,
    marginTop: 8,
  },

  chipsRow: {
    paddingHorizontal: 16,

    alignItems: "center",
  },

  chip: {
    height: 35,

    paddingHorizontal: 16,

    borderRadius: 18,

    backgroundColor: THEME.white,

    marginRight: 8,

    borderWidth: 1,
    borderColor: THEME.border,

    justifyContent: "center",
    alignItems: "center",
  },

  chipActive: {
    backgroundColor: THEME.violet,

    borderColor: THEME.violet,
  },

  chipText: {
    fontSize: 12,

    fontWeight: "700",

    color: THEME.text,
  },

  chipTextActive: {
    color: THEME.white,

    fontWeight: "800",
  },

  listContent: {
    padding: 16,
    paddingBottom: 40,
  },

  bookingCard: {
    flexDirection: "row",

    backgroundColor: THEME.white,

    borderRadius: 16,

    padding: 10,

    marginBottom: 12,

    alignItems: "center",

    borderWidth: 1,

    borderColor: THEME.border,
  },

  bookingImage: {
    width: 78,
    height: 82,

    borderRadius: 12,

    backgroundColor: THEME.lavenderSoft,
  },

  bookingBody: {
    flex: 1,

    marginLeft: 12,
  },

  bookingTopRow: {
    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",
  },

  bookingId: {
    fontSize: 9,

    fontWeight: "900",

    color: THEME.muted,

    letterSpacing: 0.8,
  },

  statusBadge: {
    flexDirection: "row",

    alignItems: "center",

    paddingHorizontal: 7,
    paddingVertical: 4,

    borderRadius: 12,
  },

  statusText: {
    fontSize: 8,

    fontWeight: "900",

    marginLeft: 4,

    textTransform: "uppercase",
  },

  eventName: {
    fontSize: 14,

    fontWeight: "900",

    color: THEME.text,

    marginTop: 5,
  },

  bookingMeta: {
    flexDirection: "row",

    alignItems: "center",

    marginTop: 5,
  },

  bookingMetaText: {
    fontSize: 10,

    color: THEME.muted,

    marginLeft: 3,

    fontWeight: "600",

    maxWidth: 90,
  },

  dot: {
    color: THEME.muted,

    marginHorizontal: 5,

    fontSize: 11,
  },

  bookingBottomRow: {
    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

    marginTop: 7,
  },

  bookingDate: {
    fontSize: 9,

    color: THEME.muted,

    fontWeight: "600",
  },

  bookingTotal: {
    fontSize: 14,

    fontWeight: "900",

    color: THEME.violet,
  },

  emptyBox: {
    alignItems: "center",

    paddingVertical: 60,
    paddingHorizontal: 24,
  },

  emptyIconCircle: {
    width: 84,
    height: 84,

    borderRadius: 42,

    backgroundColor: THEME.lavenderSoft,

    justifyContent: "center",
    alignItems: "center",

    marginBottom: 16,
  },

  emptyTitle: {
    fontSize: 17,

    fontWeight: "900",

    color: THEME.text,
  },

  emptySubtitle: {
    fontSize: 13,

    color: THEME.muted,

    marginTop: 7,

    textAlign: "center",

    lineHeight: 19,
  },

  retryButton: {
    marginTop: 16,

    paddingHorizontal: 22,
    paddingVertical: 11,

    backgroundColor: THEME.violet,

    borderRadius: 12,
  },

  retryText: {
    color: THEME.white,

    fontWeight: "800",

    fontSize: 13,
  },
});
