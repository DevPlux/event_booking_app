// src/screens/events/EventDetailScreen.tsx

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { EventStackParamList } from "../../navigation/types";
import { Event } from "../../types/event";

import { getEventById } from "../../api/eventService";
import { createBooking } from "../../api/bookingService";

import Loading from "../../components/Loading";
import ErrorText from "../../components/ErrorText";

type Props = NativeStackScreenProps<EventStackParamList, "EventDetail">;

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

  amber: "#D97706",
  amberSoft: "#FFF7ED",
};

export default function EventDetailScreen({ route, navigation }: Props) {
  const { eventId } = route.params;

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [quantity, setQuantity] = useState(1);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const data = await getEventById(eventId);
        setEvent(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load event");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  if (loading) {
    return <Loading />;
  }

  if (error || !event) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.errorHeader}>
          <TouchableOpacity
            style={styles.lightBackButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={21} color={THEME.navy} />
          </TouchableOpacity>
        </View>

        <View style={styles.centerBox}>
          <View style={styles.errorIconCircle}>
            <Ionicons name="alert-circle-outline" size={38} color={THEME.red} />
          </View>

          <Text style={styles.errorTitle}>Couldn't load event</Text>

          <ErrorText>{error || "Event not found"}</ErrorText>
        </View>
      </SafeAreaView>
    );
  }

  const availableTickets = event.capacity - event.ticketsSold;

  const isSoldOut = availableTickets <= 0;

  const eventDate = new Date(event.date);

  const isPastEvent = eventDate.getTime() < Date.now();

  const canBook = !isSoldOut && !isPastEvent;

  const maxQuantity = Math.max(1, availableTickets);

  const totalAmount = event.price * quantity;

  const eventImage = event.imageUrl || "https://via.placeholder.com/600";

  const handleBooking = async () => {
    if (!event || !canBook) {
      return;
    }

    setBooking(true);

    try {
      const created = await createBooking({
        event,
        quantity,
      });

      Alert.alert(
        "Booking Created!",
        `Booking #${created._id.slice(-6).toUpperCase()}\n\nTickets: ${
          created.quantity
        }\nTotal: Rs. ${created.totalAmount.toFixed(
          2,
        )}\nStatus: ${created.status}`,
        [
          {
            text: "Keep Exploring",
          },
          {
            text: "View Bookings",
            onPress: () =>
              navigation.getParent()?.navigate("BookingsTab" as never),
          },
        ],
      );
    } catch (e) {
      Alert.alert(
        "Booking Failed",
        e instanceof Error ? e.message : "Unable to create booking",
      );
    } finally {
      setBooking(false);
    }
  };

  const increaseQuantity = () => {
    setQuantity((current) => Math.min(current + 1, maxQuantity));
  };

  const decreaseQuantity = () => {
    setQuantity((current) => Math.max(1, current - 1));
  };

  return (
    <View style={styles.safe}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingBottom: 145,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.heroWrapper}>
          <Image source={{ uri: eventImage }} style={styles.hero} />

          <View style={styles.heroOverlay} />

          <SafeAreaView
            edges={["top"]}
            style={styles.floatingBackWrapper}
            pointerEvents="box-none"
          >
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.85}
            >
              <Ionicons name="arrow-back" size={22} color={THEME.white} />
            </TouchableOpacity>
          </SafeAreaView>

          <View
            style={[
              styles.availabilityPill,
              canBook ? styles.availablePill : styles.unavailablePill,
            ]}
          >
            <Ionicons
              name={canBook ? "ticket-outline" : "close-circle-outline"}
              size={15}
              color={canBook ? THEME.green : THEME.red}
            />

            <Text
              style={[
                styles.availabilityText,
                {
                  color: canBook ? THEME.green : THEME.red,
                },
              ]}
            >
              {isPastEvent
                ? "EVENT ENDED"
                : isSoldOut
                  ? "SOLD OUT"
                  : `${availableTickets} TICKETS LEFT`}
            </Text>
          </View>
        </View>

        {/* Body */}
        <View style={styles.body}>
          <View style={styles.categoryPill}>
            <Text style={styles.categoryText}>{event.category}</Text>
          </View>

          <Text style={styles.name}>{event.name}</Text>

          {/* Event meta */}
          <View style={styles.eventMetaCard}>
            <View style={styles.metaRow}>
              <View style={styles.metaIconBox}>
                <Ionicons
                  name="calendar-outline"
                  size={18}
                  color={THEME.violet}
                />
              </View>

              <View style={styles.metaContent}>
                <Text style={styles.metaLabel}>DATE & TIME</Text>

                <Text style={styles.metaValue}>
                  {eventDate.toLocaleDateString()} ·{" "}
                  {eventDate.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
            </View>

            <View style={styles.metaDivider} />

            <View style={styles.metaRow}>
              <View style={styles.metaIconBox}>
                <Ionicons
                  name="location-outline"
                  size={18}
                  color={THEME.violet}
                />
              </View>

              <View style={styles.metaContent}>
                <Text style={styles.metaLabel}>LOCATION</Text>

                <Text style={styles.metaValue}>{event.location}</Text>
              </View>
            </View>
          </View>

          <View style={styles.priceRow}>
            <View>
              <Text style={styles.priceLabel}>PRICE PER TICKET</Text>

              <Text style={styles.price}>Rs. {event.price.toFixed(2)}</Text>
            </View>

            <View style={styles.capacityBox}>
              <Ionicons name="people-outline" size={17} color={THEME.violet} />

              <Text style={styles.capacityText}>
                {event.ticketsSold}/{event.capacity}
              </Text>
            </View>
          </View>

          {/* Description */}
          <Text style={styles.sectionHeading}>About this event</Text>

          <View style={styles.descriptionCard}>
            <Text style={styles.description}>
              {event.description ||
                "No description is available for this event."}
            </Text>
          </View>

          {/* Ticket Quantity */}
          {canBook && (
            <>
              <Text style={styles.sectionHeading}>Select Tickets</Text>

              <View style={styles.quantityCard}>
                <TouchableOpacity
                  style={[
                    styles.quantityButton,
                    quantity <= 1 && styles.quantityButtonDisabled,
                  ]}
                  onPress={decreaseQuantity}
                  disabled={quantity <= 1}
                >
                  <Ionicons
                    name="remove"
                    size={20}
                    color={quantity <= 1 ? THEME.muted : THEME.navy}
                  />
                </TouchableOpacity>

                <View style={styles.quantityCenter}>
                  <Text style={styles.quantityValue}>{quantity}</Text>

                  <Text style={styles.quantityLabel}>
                    {quantity === 1 ? "ticket" : "tickets"}
                  </Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.quantityButton,
                    quantity >= availableTickets &&
                      styles.quantityButtonDisabled,
                  ]}
                  onPress={increaseQuantity}
                  disabled={quantity >= availableTickets}
                >
                  <Ionicons
                    name="add"
                    size={20}
                    color={
                      quantity >= availableTickets ? THEME.muted : THEME.navy
                    }
                  />
                </TouchableOpacity>

                <View style={{ flex: 1 }} />

                <View>
                  <Text style={styles.totalLabel}>TOTAL</Text>

                  <Text style={styles.quantityTotal}>
                    Rs. {totalAmount.toFixed(2)}
                  </Text>
                </View>
              </View>
            </>
          )}

          {!canBook && (
            <View style={styles.unavailableBox}>
              <Ionicons
                name="information-circle-outline"
                size={20}
                color={THEME.red}
              />

              <Text style={styles.unavailableText}>
                {isPastEvent
                  ? "This event has already ended and can no longer be booked."
                  : "All tickets for this event have been booked."}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Sticky bottom booking bar */}
      <SafeAreaView edges={["bottom"]} style={styles.bottomBarWrapper}>
        <View style={styles.bottomBar}>
          <View>
            <Text style={styles.bottomLabel}>TOTAL</Text>

            <Text style={styles.bottomTotal}>Rs. {totalAmount.toFixed(2)}</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.bookingButton,
              (!canBook || booking) && styles.bookingButtonDisabled,
            ]}
            onPress={handleBooking}
            disabled={!canBook || booking}
            activeOpacity={0.85}
          >
            <Ionicons
              name={booking ? "hourglass-outline" : "ticket-outline"}
              size={19}
              color={THEME.white}
            />

            <Text style={styles.bookingButtonText}>
              {booking
                ? "Booking..."
                : isPastEvent
                  ? "Event Ended"
                  : isSoldOut
                    ? "Sold Out"
                    : "Book Tickets"}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: THEME.background,
  },

  heroWrapper: {
    position: "relative",
  },

  hero: {
    width: "100%",
    height: 360,
    backgroundColor: THEME.lavenderSoft,
  },

  heroOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(15,23,42,0.18)",
  },

  floatingBackWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(15,23,42,0.88)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 16,
    marginTop: 8,
  },

  availabilityPill: {
    position: "absolute",
    bottom: 50,
    left: 16,

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 12,
    paddingVertical: 7,

    borderRadius: 20,
  },

  availablePill: {
    backgroundColor: THEME.greenSoft,
  },

  unavailablePill: {
    backgroundColor: THEME.redSoft,
  },

  availabilityText: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8,
    marginLeft: 6,
  },

  body: {
    backgroundColor: THEME.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,

    marginTop: -30,

    paddingHorizontal: 20,
    paddingTop: 26,
    paddingBottom: 28,
  },

  categoryPill: {
    alignSelf: "flex-start",
    backgroundColor: THEME.lavenderSoft,

    paddingHorizontal: 11,
    paddingVertical: 5,

    borderRadius: 20,

    marginBottom: 12,
  },

  categoryText: {
    fontSize: 10,
    fontWeight: "900",
    color: THEME.violet,
    letterSpacing: 1,
    textTransform: "uppercase",
  },

  name: {
    fontSize: 29,
    fontWeight: "900",
    color: THEME.text,
    lineHeight: 35,
    letterSpacing: -0.8,
  },

  eventMetaCard: {
    backgroundColor: THEME.white,
    borderRadius: 18,

    marginTop: 20,

    borderWidth: 1,
    borderColor: THEME.border,

    overflow: "hidden",
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",

    padding: 14,
  },

  metaIconBox: {
    width: 38,
    height: 38,
    borderRadius: 11,

    backgroundColor: THEME.lavenderSoft,

    justifyContent: "center",
    alignItems: "center",
  },

  metaContent: {
    marginLeft: 12,
    flex: 1,
  },

  metaLabel: {
    fontSize: 9,
    fontWeight: "900",
    color: THEME.muted,
    letterSpacing: 1.2,
  },

  metaValue: {
    fontSize: 13,
    fontWeight: "700",
    color: THEME.text,
    marginTop: 3,
  },

  metaDivider: {
    height: 1,
    backgroundColor: THEME.background,
    marginLeft: 64,
  },

  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    marginTop: 22,
  },

  priceLabel: {
    fontSize: 9,
    fontWeight: "900",
    color: THEME.muted,
    letterSpacing: 1.2,
  },

  price: {
    fontSize: 26,
    fontWeight: "900",
    color: THEME.violet,
    marginTop: 3,
  },

  capacityBox: {
    flexDirection: "row",
    alignItems: "center",

    backgroundColor: THEME.lavenderSoft,

    paddingHorizontal: 12,
    paddingVertical: 8,

    borderRadius: 18,
  },

  capacityText: {
    color: THEME.violet,
    fontWeight: "800",
    fontSize: 12,
    marginLeft: 5,
  },

  sectionHeading: {
    fontSize: 11,
    fontWeight: "900",
    color: THEME.muted,

    letterSpacing: 1.4,
    textTransform: "uppercase",

    marginTop: 28,
    marginBottom: 10,
  },

  descriptionCard: {
    backgroundColor: THEME.white,

    borderRadius: 16,
    padding: 16,

    borderWidth: 1,
    borderColor: THEME.border,
  },

  description: {
    fontSize: 14,
    color: THEME.text,
    lineHeight: 22,
    fontWeight: "500",
  },

  quantityCard: {
    flexDirection: "row",
    alignItems: "center",

    backgroundColor: THEME.white,

    borderRadius: 16,

    paddingHorizontal: 12,
    paddingVertical: 12,

    borderWidth: 1,
    borderColor: THEME.border,
  },

  quantityButton: {
    width: 42,
    height: 42,
    borderRadius: 21,

    backgroundColor: THEME.lavenderSoft,

    justifyContent: "center",
    alignItems: "center",
  },

  quantityButtonDisabled: {
    opacity: 0.4,
  },

  quantityCenter: {
    alignItems: "center",
    marginHorizontal: 17,
  },

  quantityValue: {
    fontSize: 21,
    fontWeight: "900",
    color: THEME.text,
  },

  quantityLabel: {
    fontSize: 9,
    color: THEME.muted,
    fontWeight: "600",
  },

  totalLabel: {
    fontSize: 9,
    color: THEME.muted,
    fontWeight: "900",
    textAlign: "right",
  },

  quantityTotal: {
    fontSize: 18,
    fontWeight: "900",
    color: THEME.violet,
    marginTop: 2,
  },

  unavailableBox: {
    flexDirection: "row",
    alignItems: "flex-start",

    backgroundColor: THEME.redSoft,

    padding: 14,
    borderRadius: 14,

    marginTop: 24,

    borderWidth: 1,
    borderColor: "#FECACA",
  },

  unavailableText: {
    flex: 1,
    fontSize: 13,
    color: THEME.red,

    fontWeight: "700",

    marginLeft: 9,
    lineHeight: 19,
  },

  bottomBarWrapper: {
    backgroundColor: THEME.white,

    borderTopWidth: 1,
    borderTopColor: THEME.border,
  },

  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 14,
  },

  bottomLabel: {
    fontSize: 9,
    color: THEME.muted,
    fontWeight: "900",
    letterSpacing: 1.3,
  },

  bottomTotal: {
    fontSize: 22,
    fontWeight: "900",
    color: THEME.text,

    marginTop: 2,
  },

  bookingButton: {
    flexDirection: "row",
    alignItems: "center",

    backgroundColor: THEME.violet,

    paddingHorizontal: 22,
    paddingVertical: 14,

    borderRadius: 14,
  },

  bookingButtonDisabled: {
    backgroundColor: THEME.muted,
  },

  bookingButtonText: {
    color: THEME.white,

    fontSize: 15,
    fontWeight: "900",

    marginLeft: 8,
  },

  errorHeader: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },

  lightBackButton: {
    width: 44,
    height: 44,
    borderRadius: 22,

    backgroundColor: THEME.white,

    justifyContent: "center",
    alignItems: "center",

    borderWidth: 1,
    borderColor: THEME.border,
  },

  centerBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  errorIconCircle: {
    width: 82,
    height: 82,
    borderRadius: 41,

    backgroundColor: THEME.redSoft,

    justifyContent: "center",
    alignItems: "center",

    marginBottom: 16,
  },

  errorTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: THEME.text,

    marginBottom: 6,
  },
});
