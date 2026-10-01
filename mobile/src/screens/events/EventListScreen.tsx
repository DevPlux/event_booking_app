// src/screens/events/EventListScreen.tsx

import React, { useState, useCallback, useMemo } from "react";

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { EventStackParamList } from "../../navigation/types";
import { Event } from "../../types/event";
import { getEvents } from "../../api/eventService";

import EventCard from "../../components/EventCard";
import Loading from "../../components/Loading";
import ErrorText from "../../components/ErrorText";
import { useAuth } from "../../context/AuthContext";

type Props = NativeStackScreenProps<EventStackParamList, "EventList">;

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

  green: "#059669",
  greenSoft: "#ECFDF5",

  red: "#DC2626",
  redSoft: "#FEF2F2",
};

export default function EventListScreen({ navigation }: Props) {
  const { user } = useAuth();

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

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

  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(events.map((event) => event.category).filter(Boolean)),
    );

    return ["All", ...unique];
  }, [events]);

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return events.filter((event) => {
      const matchesSearch =
        query === "" ||
        event.name.toLowerCase().includes(query) ||
        event.location.toLowerCase().includes(query) ||
        event.category.toLowerCase().includes(query);

      const matchesCategory =
        activeCategory === "All" || event.category === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [events, search, activeCategory]);

  const firstName = user?.name?.split(" ")[0] || "there";

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((name) => name[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  if (loading) {
    return <Loading />;
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Brand header */}
      <View style={styles.topBar}>
        <View style={styles.topGlow} />

        <View style={styles.brandRow}>
          <View style={styles.logoCircle}>
            <Ionicons name="ticket" size={19} color={THEME.violet} />
          </View>

          <View style={{ marginLeft: 10 }}>
            <View style={styles.brandNameRow}>
              <Text style={styles.brandNameMain}>Event</Text>

              <Text style={styles.brandNameAccent}>ora</Text>
            </View>

            <View style={styles.brandSubRow}>
              <Ionicons name="sparkles-outline" size={11} color="#C4B5FD" />

              <Text style={styles.brandSubText}>
                Discover your next experience
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.topBarIcon} activeOpacity={0.8}>
          <Ionicons name="notifications-outline" size={20} color={THEME.navy} />

          <View style={styles.notificationDot} />
        </TouchableOpacity>
      </View>

      <FlatList
        key={filteredEvents.length === 0 ? "event-empty" : "event-grid"}
        data={filteredEvents}
        keyExtractor={(event) => event._id}
        numColumns={2}
        columnWrapperStyle={
          filteredEvents.length > 0 ? styles.columnWrapper : undefined
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchEvents(true)}
            tintColor={THEME.violet}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            {/* Greeting */}
            <View style={styles.greetingRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.greetingSmall}>WELCOME BACK</Text>

                <Text style={styles.greetingBig}>Hi, {firstName}</Text>
              </View>

              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
            </View>

            {/* Headline */}
            <Text style={styles.headline}>
              Find something{"\n"}
              worth experiencing.
            </Text>

            {/* Search */}
            <View style={styles.searchWrapper}>
              <Ionicons
                name="search-outline"
                size={19}
                color={THEME.muted}
                style={styles.searchIcon}
              />

              <TextInput
                style={styles.searchInput}
                placeholder="Search events, locations, categories..."
                placeholderTextColor={THEME.muted}
                value={search}
                onChangeText={setSearch}
              />

              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch("")}>
                  <Ionicons name="close-circle" size={19} color={THEME.muted} />
                </TouchableOpacity>
              )}
            </View>

            {/* Categories */}
            <View style={styles.chipsWrapper}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipsRow}
              >
                {categories.map((category) => {
                  const isActive = category === activeCategory;

                  return (
                    <TouchableOpacity
                      key={category}
                      style={[styles.chip, isActive && styles.chipActive]}
                      onPress={() => setActiveCategory(category)}
                      activeOpacity={0.8}
                    >
                      <Text
                        numberOfLines={1}
                        style={[
                          styles.chipText,
                          isActive && styles.chipTextActive,
                        ]}
                      >
                        {category}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {!error && (
              <View style={styles.sectionRow}>
                <View>
                  <Text style={styles.sectionEyebrow}>DISCOVER</Text>

                  <Text style={styles.sectionTitle}>
                    {activeCategory === "All"
                      ? "Upcoming Events"
                      : activeCategory}
                  </Text>
                </View>

                <Text style={styles.sectionCount}>
                  {filteredEvents.length} event
                  {filteredEvents.length !== 1 ? "s" : ""}
                </Text>
              </View>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.gridItem}>
            <EventCard
              event={item}
              onPress={() =>
                navigation.navigate("EventDetail", {
                  eventId: item._id,
                })
              }
            />
          </View>
        )}
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
                <Text style={styles.retryText}>Try Again</Text>
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

              <Text style={styles.emptyTitle}>No events found</Text>

              <Text style={styles.emptySubtitle}>
                Try another search or choose a different category.
              </Text>
            </View>
          )
        }
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

    paddingHorizontal: 16,
    paddingVertical: 15,

    overflow: "hidden",
  },

  topGlow: {
    position: "absolute",
    width: 190,
    height: 190,
    borderRadius: 95,

    backgroundColor: THEME.violet,

    top: -110,
    right: -75,

    opacity: 0.26,
  },

  brandRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  logoCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,

    backgroundColor: THEME.white,

    justifyContent: "center",
    alignItems: "center",
  },

  brandNameRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },

  brandNameMain: {
    color: THEME.white,
    fontSize: 19,
    fontWeight: "900",
    letterSpacing: -0.6,
  },

  brandNameAccent: {
    color: "#C4B5FD",
    fontSize: 19,
    fontWeight: "300",
    letterSpacing: -0.6,
  },

  brandSubRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },

  brandSubText: {
    color: "#CBD5E1",
    fontSize: 10,
    fontWeight: "500",
    marginLeft: 4,
  },

  topBarIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,

    backgroundColor: THEME.white,

    justifyContent: "center",
    alignItems: "center",

    position: "relative",
  },

  notificationDot: {
    position: "absolute",

    width: 7,
    height: 7,
    borderRadius: 4,

    backgroundColor: THEME.violet,

    top: 9,
    right: 9,

    borderWidth: 1.5,
    borderColor: THEME.white,
  },

  listContent: {
    padding: 16,
    paddingBottom: 40,
  },

  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: 14,
  },

  gridItem: {
    width: "48%",
  },

  header: {
    marginBottom: 14,
  },

  greetingRow: {
    flexDirection: "row",
    alignItems: "center",

    marginBottom: 16,
  },

  greetingSmall: {
    fontSize: 10,
    color: THEME.muted,

    fontWeight: "800",
    letterSpacing: 1.4,
  },

  greetingBig: {
    fontSize: 23,
    fontWeight: "900",

    color: THEME.text,

    marginTop: 4,
    letterSpacing: -0.5,
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,

    backgroundColor: THEME.navy,

    justifyContent: "center",
    alignItems: "center",

    borderWidth: 3,
    borderColor: THEME.lavender,
  },

  avatarText: {
    color: THEME.white,
    fontWeight: "900",
    fontSize: 15,
  },

  headline: {
    fontSize: 28,
    fontWeight: "900",

    color: THEME.text,

    marginBottom: 20,

    lineHeight: 34,
    letterSpacing: -0.9,
  },

  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",

    backgroundColor: THEME.white,

    borderRadius: 16,

    paddingHorizontal: 14,
    height: 52,

    marginBottom: 16,

    borderWidth: 1,
    borderColor: THEME.border,
  },

  searchIcon: {
    marginRight: 10,
  },

  searchInput: {
    flex: 1,

    fontSize: 14,

    color: THEME.text,

    paddingVertical: 0,

    fontWeight: "500",
  },

  chipsWrapper: {
    height: 44,
    marginBottom: 4,
  },

  chipsRow: {
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

  sectionRow: {
    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "flex-end",

    marginTop: 20,
    marginBottom: 8,
  },

  sectionEyebrow: {
    fontSize: 9,
    fontWeight: "900",

    color: THEME.violet,

    letterSpacing: 1.4,

    marginBottom: 3,
  },

  sectionTitle: {
    fontSize: 19,

    fontWeight: "900",

    color: THEME.text,

    letterSpacing: -0.5,
  },

  sectionCount: {
    fontSize: 11,

    color: THEME.muted,

    fontWeight: "700",
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

    fontWeight: "500",
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
