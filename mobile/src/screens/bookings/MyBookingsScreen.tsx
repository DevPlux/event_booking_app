// src/screens/bookings/MyBookingsScreen.tsx

import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ScrollView,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { Booking, BookingStatus } from "../../types/booking";

import { getMyBookings } from "../../api/bookingService";
import BookingCard from "../../components/BookingCard";
import Loading from "../../components/Loading";
import ErrorText from "../../components/ErrorText";

import { BookingStackParamList } from "../../navigation/types";
import { useAuth } from "../../context/AuthContext";

type Props = NativeStackScreenProps<BookingStackParamList, "MyBookings">;

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
  navySoft: "#1E293B",

  violet: "#7C3AED",
  violetDark: "#5B21B6",

  lavender: "#EDE9FE",
  lavenderSoft: "#F5F3FF",

  white: "#FFFFFF",
  background: "#F8FAFC",

  text: "#111827",
  muted: "#64748B",
  border: "#E2E8F0",

  amber: "#D97706",
  amberSoft: "#FFF7ED",

  green: "#059669",
  greenSoft: "#ECFDF5",

  red: "#DC2626",
  redSoft: "#FEF2F2",
};

export default function MyBookingsScreen({ navigation }: Props) {
  const { user } = useAuth();

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
      const data = await getMyBookings();
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

    const spent = bookings
      .filter((booking) => booking.status !== "Cancelled")
      .reduce(
        (sum, booking) =>
          sum +
          (typeof booking.totalAmount === "number" ? booking.totalAmount : 0),
        0,
      );

    return {
      total: bookings.length,
      active,
      spent,
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

  const firstName = user?.name?.split(" ")[0] || "there";

  if (loading) {
    return <Loading />;
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Header */}
      <View style={styles.topBar}>
        <View style={styles.topGlow} />

        <View style={{ flex: 1 }}>
          <Text style={styles.topBarLabel}>EVENTORA</Text>

          <Text style={styles.topBarTitle}>My Bookings</Text>

          <Text style={styles.topBarSubtitle}>
            Hi {firstName} · {stats.total} booking
            {stats.total !== 1 ? "s" : ""}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.refreshButton}
          onPress={() => fetchBookings(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="refresh" size={19} color={THEME.violet} />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <View
            style={[
              styles.statIconBox,
              {
                backgroundColor: THEME.lavenderSoft,
              },
            ]}
          >
            <Ionicons name="ticket-outline" size={18} color={THEME.violet} />
          </View>

          <Text style={styles.statValue}>{stats.total}</Text>

          <Text style={styles.statLabel}>TOTAL</Text>
        </View>

        <View style={styles.statCard}>
          <View
            style={[
              styles.statIconBox,
              {
                backgroundColor: THEME.amberSoft,
              },
            ]}
          >
            <Ionicons name="time-outline" size={18} color={THEME.amber} />
          </View>

          <Text style={styles.statValue}>{stats.active}</Text>

          <Text style={styles.statLabel}>ACTIVE</Text>
        </View>

        <View style={styles.statCard}>
          <View
            style={[
              styles.statIconBox,
              {
                backgroundColor: THEME.greenSoft,
              },
            ]}
          >
            <Ionicons name="wallet-outline" size={18} color={THEME.green} />
          </View>

          <Text style={styles.statValue} numberOfLines={1}>
            {stats.spent >= 1000
              ? `${(stats.spent / 1000).toFixed(1)}k`
              : stats.spent.toFixed(0)}
          </Text>

          <Text style={styles.statLabel}>SPENT (RS.)</Text>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.chipsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {FILTERS.map((filter) => {
            const isActive = activeFilter === filter;

            return (
              <TouchableOpacity
                key={filter}
                style={[styles.chip, isActive && styles.chipActive]}
                onPress={() => setActiveFilter(filter)}
                activeOpacity={0.8}
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

      {/* Booking List */}
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
                <Text style={styles.retryText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.emptyBox}>
              <View style={styles.emptyIconCircle}>
                <Ionicons
                  name="ticket-outline"
                  size={38}
                  color={THEME.violet}
                />
              </View>

              <Text style={styles.emptyTitle}>
                {activeFilter === "All"
                  ? "No bookings yet"
                  : `No ${activeFilter.toLowerCase()} bookings`}
              </Text>

              <Text style={styles.emptySubtitle}>
                {activeFilter === "All"
                  ? "Discover an event and make your first booking."
                  : "Try another filter to view your bookings."}
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <BookingCard
            booking={item}
            onPress={() =>
              navigation.navigate("BookingDetail", {
                bookingId: item._id,
              })
            }
          />
        )}
      />
    </SafeAreaView>
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
    justifyContent: "space-between",
    alignItems: "center",

    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 28,

    overflow: "hidden",
  },

  topGlow: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: THEME.violet,
    right: -90,
    top: -120,
    opacity: 0.25,
  },

  topBarLabel: {
    fontSize: 10,
    fontWeight: "900",
    color: "#C4B5FD",
    letterSpacing: 2,
    marginBottom: 7,
  },

  topBarTitle: {
    color: THEME.white,
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -0.8,
  },

  topBarSubtitle: {
    color: "#CBD5E1",
    fontSize: 12,
    marginTop: 6,
    fontWeight: "500",
  },

  refreshButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: THEME.white,
    justifyContent: "center",
    alignItems: "center",
  },

  statsRow: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: -12,
    gap: 10,
  },

  statCard: {
    flex: 1,
    backgroundColor: THEME.white,
    borderRadius: 16,
    paddingVertical: 13,
    paddingHorizontal: 11,
    borderWidth: 1,
    borderColor: THEME.border,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
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
    letterSpacing: 1,
  },

  chipsWrapper: {
    height: 62,
    marginTop: 8,
  },

  chipsRow: {
    paddingHorizontal: 16,
    alignItems: "center",
  },

  chip: {
    height: 36,
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
    paddingHorizontal: 16,
    paddingBottom: 40,
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
