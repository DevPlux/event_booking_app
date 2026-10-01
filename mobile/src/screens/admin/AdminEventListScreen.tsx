// src/screens/admin/AdminEventListScreen.tsx

import React, { useState, useCallback, useMemo } from "react";

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
  ScrollView,
  TextInput,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { Event } from "../../types/event";

import { getEvents, deleteEvent } from "../../api/eventService";

import Loading from "../../components/Loading";
import ErrorText from "../../components/ErrorText";

import { AdminStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<AdminStackParamList, "AdminEventList">;

type FilterKey = "All" | "Upcoming" | "Sold Out" | "Ended";

const FILTERS: FilterKey[] = ["All", "Upcoming", "Sold Out", "Ended"];

const THEME = {
  navy: "#0F172A",
  violet: "#7C3AED",
  violetDark: "#5B21B6",

  lavender: "#EDE9FE",
  lavenderSoft: "#F5F3FF",

  white: "#FFFFFF",
  background: "#F8FAFC",

  text: "#111827",
  muted: "#64748B",
  border: "#E2E8F0",

  green: "#059669",
  greenSoft: "#ECFDF5",

  amber: "#D97706",
  amberSoft: "#FFF7ED",

  red: "#DC2626",
  redSoft: "#FEF2F2",
};

export default function AdminEventListScreen({ navigation }: Props) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [activeFilter, setActiveFilter] = useState<FilterKey>("All");

  const fetchEvents = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const data = await getEvents();
      setEvents(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load events");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchEvents();
    }, []),
  );

  const stats = useMemo(() => {
    const now = Date.now();

    const upcoming = events.filter(
      (event) =>
        new Date(event.date).getTime() >= now &&
        event.ticketsSold < event.capacity,
    ).length;

    const soldOut = events.filter(
      (event) =>
        event.ticketsSold >= event.capacity &&
        new Date(event.date).getTime() >= now,
    ).length;

    const ended = events.filter(
      (event) => new Date(event.date).getTime() < now,
    ).length;

    return {
      total: events.length,
      upcoming,
      soldOut,
      ended,
    };
  }, [events]);

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();

    const now = Date.now();

    return events.filter((event) => {
      const matchesSearch =
        query === "" ||
        event.name.toLowerCase().includes(query) ||
        event.location.toLowerCase().includes(query) ||
        event.category.toLowerCase().includes(query);

      const eventTime = new Date(event.date).getTime();

      const isSoldOut = event.ticketsSold >= event.capacity;

      let matchesFilter = true;

      if (activeFilter === "Upcoming") {
        matchesFilter = eventTime >= now && !isSoldOut;
      }

      if (activeFilter === "Sold Out") {
        matchesFilter = eventTime >= now && isSoldOut;
      }

      if (activeFilter === "Ended") {
        matchesFilter = eventTime < now;
      }

      return matchesSearch && matchesFilter;
    });
  }, [events, search, activeFilter]);

  const confirmDelete = (event: Event) => {
    Alert.alert(
      "Delete Event",
      `Are you sure you want to delete "${event.name}"?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",

          onPress: async () => {
            try {
              await deleteEvent(event._id);

              await fetchEvents();
            } catch (e) {
              Alert.alert(
                "Delete Failed",
                e instanceof Error ? e.message : "Unable to delete event",
              );
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Admin header */}
      <View style={styles.topBar}>
        <View style={styles.topGlow} />

        <View style={{ flex: 1 }}>
          <View style={styles.adminBadge}>
            <Ionicons
              name="shield-checkmark-outline"
              size={12}
              color="#C4B5FD"
            />

            <Text style={styles.adminBadgeText}>EVENTORA ADMIN</Text>
          </View>

          <Text style={styles.topBarTitle}>Manage Events</Text>

          <Text style={styles.topBarSubtitle}>
            {stats.total} event
            {stats.total !== 1 ? "s" : ""} · {stats.upcoming} upcoming
          </Text>
        </View>

        <TouchableOpacity
          style={styles.bookingsButton}
          onPress={() => navigation.navigate("AdminBookings")}
          activeOpacity={0.85}
        >
          <Ionicons name="ticket-outline" size={15} color={THEME.violet} />

          <Text style={styles.bookingsButtonText}>Bookings</Text>

          <Ionicons name="chevron-forward" size={12} color={THEME.violet} />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <StatCard
          value={stats.total}
          label="TOTAL"
          icon="calendar-outline"
          iconColor={THEME.violet}
          iconBg={THEME.lavenderSoft}
        />

        <StatCard
          value={stats.upcoming}
          label="UPCOMING"
          icon="time-outline"
          iconColor={THEME.green}
          iconBg={THEME.greenSoft}
        />

        <StatCard
          value={stats.soldOut}
          label="SOLD OUT"
          icon="ticket-outline"
          iconColor={THEME.red}
          iconBg={THEME.redSoft}
        />
      </View>

      {/* Search */}
      <View style={styles.searchWrapper}>
        <Ionicons name="search-outline" size={18} color={THEME.muted} />

        <TextInput
          style={styles.searchInput}
          placeholder="Search events..."
          placeholderTextColor={THEME.muted}
          value={search}
          onChangeText={setSearch}
        />

        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={18} color={THEME.muted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filters */}
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

      {/* Add event */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate("EventForm", {})}
        activeOpacity={0.85}
      >
        <Ionicons name="add-circle-outline" size={20} color={THEME.white} />

        <Text style={styles.addButtonText}>Create New Event</Text>
      </TouchableOpacity>

      {/* List */}
      <FlatList
        data={filteredEvents}
        keyExtractor={(event) => event._id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchEvents(true)}
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
                onPress={() => fetchEvents()}
              >
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.emptyBox}>
              <View style={styles.emptyIconCircle}>
                <Ionicons
                  name="calendar-outline"
                  size={37}
                  color={THEME.violet}
                />
              </View>

              <Text style={styles.emptyTitle}>
                {search || activeFilter !== "All"
                  ? "No events match"
                  : "No events yet"}
              </Text>

              <Text style={styles.emptySubtitle}>
                {search || activeFilter !== "All"
                  ? "Try changing your search or filter."
                  : "Tap 'Create New Event' to add your first event."}
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => {
          const eventDate = new Date(item.date);

          const isEnded = eventDate.getTime() < Date.now();

          const isSoldOut = item.ticketsSold >= item.capacity;

          const available = Math.max(0, item.capacity - item.ticketsSold);

          const statusLabel = isEnded
            ? "Ended"
            : isSoldOut
              ? "Sold Out"
              : "Open";

          const statusTheme = isEnded
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

          return (
            <View style={styles.eventCard}>
              <Image
                source={{
                  uri: item.imageUrl || "https://via.placeholder.com/100",
                }}
                style={styles.eventImage}
              />

              <View style={styles.eventBody}>
                <Text style={styles.eventName} numberOfLines={1}>
                  {item.name}
                </Text>

                <View style={styles.metaRow}>
                  <Ionicons
                    name="calendar-outline"
                    size={12}
                    color={THEME.muted}
                  />

                  <Text style={styles.metaText}>
                    {eventDate.toLocaleDateString()}
                  </Text>
                </View>

                <View style={styles.metaRow}>
                  <Ionicons
                    name="location-outline"
                    size={12}
                    color={THEME.muted}
                  />

                  <Text style={styles.metaText} numberOfLines={1}>
                    {item.location}
                  </Text>
                </View>

                <View style={styles.badgeRow}>
                  <View style={styles.categoryPill}>
                    <Text style={styles.categoryText}>{item.category}</Text>
                  </View>

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
                    >
                      {statusLabel}
                    </Text>
                  </View>
                </View>

                <View style={styles.priceRow}>
                  <Text style={styles.eventPrice}>
                    Rs. {item.price.toFixed(2)}
                  </Text>

                  <Text style={styles.ticketText}>{available} left</Text>
                </View>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() =>
                    navigation.navigate("EventForm", {
                      eventId: item._id,
                    })
                  }
                >
                  <Ionicons
                    name="create-outline"
                    size={17}
                    color={THEME.violet}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.iconButton, styles.deleteButton]}
                  onPress={() => confirmDelete(item)}
                >
                  <Ionicons name="trash-outline" size={17} color={THEME.red} />
                </TouchableOpacity>
              </View>
            </View>
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
    justifyContent: "space-between",
    alignItems: "flex-start",

    paddingHorizontal: 16,
    paddingTop: 16,
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

  adminBadge: {
    flexDirection: "row",
    alignItems: "center",

    alignSelf: "flex-start",

    backgroundColor: "rgba(124,58,237,0.18)",

    paddingHorizontal: 10,
    paddingVertical: 5,

    borderRadius: 18,

    marginBottom: 10,

    gap: 5,
  },

  adminBadgeText: {
    color: "#C4B5FD",

    fontSize: 9,
    fontWeight: "900",

    letterSpacing: 1.3,
  },

  topBarTitle: {
    color: THEME.white,

    fontSize: 27,
    fontWeight: "900",

    letterSpacing: -0.8,
  },

  topBarSubtitle: {
    color: "#CBD5E1",

    fontSize: 12,

    marginTop: 5,

    fontWeight: "500",
  },

  bookingsButton: {
    flexDirection: "row",
    alignItems: "center",

    backgroundColor: THEME.white,

    paddingHorizontal: 11,
    paddingVertical: 9,

    borderRadius: 20,

    marginTop: 4,
  },

  bookingsButtonText: {
    color: THEME.violet,

    fontSize: 11,
    fontWeight: "800",

    marginHorizontal: 5,
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

  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",

    backgroundColor: THEME.white,

    borderRadius: 14,

    paddingHorizontal: 14,

    height: 50,

    marginHorizontal: 16,
    marginTop: 16,

    borderWidth: 1,
    borderColor: THEME.border,
  },

  searchInput: {
    flex: 1,

    fontSize: 14,

    color: THEME.text,

    marginLeft: 10,

    paddingVertical: 0,
  },

  chipsWrapper: {
    height: 56,
    marginTop: 6,
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

  addButton: {
    flexDirection: "row",

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: THEME.violet,

    height: 50,

    borderRadius: 14,

    marginHorizontal: 16,

    marginBottom: 4,
  },

  addButtonText: {
    color: THEME.white,

    fontWeight: "900",

    fontSize: 14,

    marginLeft: 8,
  },

  listContent: {
    padding: 16,
    paddingBottom: 40,
  },

  eventCard: {
    flexDirection: "row",

    backgroundColor: THEME.white,

    borderRadius: 16,

    padding: 10,

    marginBottom: 12,

    alignItems: "center",

    borderWidth: 1,
    borderColor: THEME.border,
  },

  eventImage: {
    width: 78,
    height: 90,

    borderRadius: 12,

    backgroundColor: THEME.lavenderSoft,
  },

  eventBody: {
    flex: 1,

    marginLeft: 12,
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

  metaText: {
    fontSize: 10,

    color: THEME.muted,

    marginLeft: 4,

    flexShrink: 1,
  },

  badgeRow: {
    flexDirection: "row",

    alignItems: "center",

    marginTop: 7,
  },

  categoryPill: {
    backgroundColor: THEME.lavenderSoft,

    paddingHorizontal: 8,
    paddingVertical: 3,

    borderRadius: 10,

    marginRight: 5,
  },

  categoryText: {
    fontSize: 8,

    fontWeight: "900",

    color: THEME.violet,

    textTransform: "uppercase",
  },

  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,

    borderRadius: 10,
  },

  statusText: {
    fontSize: 8,

    fontWeight: "900",

    textTransform: "uppercase",
  },

  priceRow: {
    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

    marginTop: 7,
  },

  eventPrice: {
    fontSize: 14,

    fontWeight: "900",

    color: THEME.violet,
  },

  ticketText: {
    fontSize: 10,

    color: THEME.muted,

    fontWeight: "700",
  },

  actions: {
    flexDirection: "column",

    gap: 7,

    marginLeft: 8,
  },

  iconButton: {
    width: 36,
    height: 36,

    borderRadius: 10,

    backgroundColor: THEME.lavenderSoft,

    justifyContent: "center",
    alignItems: "center",

    borderWidth: 1,
    borderColor: THEME.lavender,
  },

  deleteButton: {
    backgroundColor: THEME.redSoft,

    borderColor: "#FECACA",
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
