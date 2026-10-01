// src/screens/bookings/BookingDetailScreen.tsx

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

import { Booking, BookingStatus } from "../../types/booking";

import { getBookingById, cancelBooking } from "../../api/bookingService";

import Loading from "../../components/Loading";
import ErrorText from "../../components/ErrorText";

import { BookingStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<BookingStackParamList, "BookingDetail">;

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

  blue: "#2563EB",
  blueSoft: "#EFF6FF",

  red: "#DC2626",
  redSoft: "#FEF2F2",
};

const STEPS: BookingStatus[] = ["Pending", "Confirmed", "Completed"];

const STATUS_COLORS: Record<
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

export default function BookingDetailScreen({ route, navigation }: Props) {
  const { bookingId } = route.params;

  const [booking, setBooking] = useState<Booking | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const data = await getBookingById(bookingId);

        setBooking(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load booking");
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  const handleCancel = () => {
    if (!booking) return;

    Alert.alert(
      "Cancel Booking",
      "Are you sure you want to cancel this booking? Reserved tickets will be released.",
      [
        {
          text: "Keep Booking",
          style: "cancel",
        },
        {
          text: "Cancel Booking",
          style: "destructive",
          onPress: async () => {
            setCancelling(true);

            try {
              await cancelBooking(booking._id);

              Alert.alert(
                "Booking Cancelled",
                "Your booking has been cancelled successfully.",
                [
                  {
                    text: "OK",
                    onPress: () => navigation.goBack(),
                  },
                ],
              );
            } catch (e) {
              Alert.alert(
                "Cancellation Failed",
                e instanceof Error ? e.message : "Unable to cancel booking",
              );
            } finally {
              setCancelling(false);
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return <Loading />;
  }

  if (error || !booking) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.headerBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={22} color={THEME.navy} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Booking Details</Text>

          <View style={{ width: 42 }} />
        </View>

        <View style={styles.centerBox}>
          <View style={styles.errorIconCircle}>
            <Ionicons name="alert-circle-outline" size={38} color={THEME.red} />
          </View>

          <Text style={styles.errorTitle}>Couldn't load booking</Text>

          <ErrorText>{error || "Booking not found"}</ErrorText>
        </View>
      </SafeAreaView>
    );
  }

  const event = booking.event;

  const eventName = event?.name ?? "Unknown event";

  const eventCategory = event?.category ?? "Event";

  const eventImage = event?.imageUrl || "https://via.placeholder.com/400";

  const eventLocation = event?.location || "Location unavailable";

  const unitPrice =
    typeof event?.price === "number" ? event.price.toFixed(2) : "0.00";

  const total =
    typeof booking.totalAmount === "number"
      ? booking.totalAmount.toFixed(2)
      : "0.00";

  const bookingDate = new Date(booking.bookingDate);

  const eventDate = event?.date ? new Date(event.date) : null;

  const canCancel =
    booking.status === "Pending" || booking.status === "Confirmed";

  const statusStyle = STATUS_COLORS[booking.status] || STATUS_COLORS.Pending;

  const currentStepIndex = STEPS.indexOf(booking.status);

  const isCancelled = booking.status === "Cancelled";

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Header */}
      <View style={styles.headerBar}>
        <View style={styles.headerGlow} />

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={22} color={THEME.navy} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Booking Details</Text>

          <Text style={styles.headerSubtitle}>
            #{booking._id.slice(-6).toUpperCase()}
          </Text>
        </View>

        <View style={styles.headerStatus}>
          <Ionicons
            name={statusStyle.icon as any}
            size={18}
            color={statusStyle.text}
          />
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Status */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View
              style={[
                styles.statusIconBox,
                {
                  backgroundColor: statusStyle.bg,
                },
              ]}
            >
              <Ionicons
                name={statusStyle.icon as any}
                size={23}
                color={statusStyle.text}
              />
            </View>

            <View style={styles.statusTextArea}>
              <Text style={styles.statusSmall}>CURRENT STATUS</Text>

              <Text
                style={[
                  styles.statusLarge,
                  {
                    color: statusStyle.text,
                  },
                ]}
              >
                {booking.status}
              </Text>
            </View>
          </View>

          {!isCancelled && (
            <View style={styles.trackerRow}>
              {STEPS.map((step, index) => {
                const isDone = index <= currentStepIndex;

                const isCurrent = index === currentStepIndex;

                return (
                  <React.Fragment key={step}>
                    <View style={styles.trackerStep}>
                      <View
                        style={[
                          styles.trackerDot,
                          isDone && styles.trackerDotDone,
                          isCurrent && styles.trackerDotCurrent,
                        ]}
                      >
                        {isDone && (
                          <Ionicons
                            name="checkmark"
                            size={12}
                            color={THEME.white}
                          />
                        )}
                      </View>

                      <Text
                        style={[
                          styles.trackerLabel,
                          isDone && styles.trackerLabelDone,
                        ]}
                      >
                        {step}
                      </Text>
                    </View>

                    {index < STEPS.length - 1 && (
                      <View
                        style={[
                          styles.trackerLine,
                          index < currentStepIndex && styles.trackerLineDone,
                        ]}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </View>
          )}

          {isCancelled && (
            <View style={styles.cancelledBanner}>
              <Ionicons name="close-circle" size={17} color={THEME.red} />

              <Text style={styles.cancelledText}>
                This booking has been cancelled.
              </Text>
            </View>
          )}
        </View>

        {/* Event */}
        <Text style={styles.sectionHeading}>Event</Text>

        <View style={styles.eventCard}>
          <Image source={{ uri: eventImage }} style={styles.eventImage} />

          <View style={styles.eventBody}>
            <View style={styles.categoryPill}>
              <Text style={styles.categoryText}>{eventCategory}</Text>
            </View>

            <Text style={styles.eventName} numberOfLines={2}>
              {eventName}
            </Text>

            <View style={styles.eventMeta}>
              <Ionicons name="location-outline" size={14} color={THEME.muted} />

              <Text style={styles.eventMetaText} numberOfLines={1}>
                {eventLocation}
              </Text>
            </View>

            {eventDate && (
              <View style={styles.eventMeta}>
                <Ionicons
                  name="calendar-outline"
                  size={14}
                  color={THEME.muted}
                />

                <Text style={styles.eventMetaText}>
                  {eventDate.toLocaleDateString()}
                </Text>
              </View>
            )}

            <Text style={styles.eventPrice}>Rs. {unitPrice}</Text>
          </View>
        </View>

        {/* Booking Summary */}
        <Text style={styles.sectionHeading}>Booking Summary</Text>

        <View style={styles.summaryCard}>
          <SummaryRow
            icon="ticket-outline"
            label="Tickets"
            value={String(booking.quantity)}
          />

          <View style={styles.divider} />

          <SummaryRow
            icon="pricetag-outline"
            label="Price per ticket"
            value={`Rs. ${unitPrice}`}
          />

          <View style={styles.divider} />

          <SummaryRow
            icon="wallet-outline"
            label="Total Amount"
            value={`Rs. ${total}`}
            bold
          />
        </View>

        {/* Booking Information */}
        <Text style={styles.sectionHeading}>Booking Information</Text>

        <View style={styles.summaryCard}>
          <SummaryRow
            icon="calendar-outline"
            label="Booked On"
            value={`${bookingDate.toLocaleDateString()} · ${bookingDate.toLocaleTimeString(
              [],
              {
                hour: "2-digit",
                minute: "2-digit",
              },
            )}`}
          />

          <View style={styles.divider} />

          <SummaryRow
            icon="ticket-outline"
            label="Booking ID"
            value={`#${booking._id.slice(-8).toUpperCase()}`}
          />

          <View style={styles.divider} />

          <SummaryRow
            icon="people-outline"
            label="Attendees"
            value={`${booking.quantity}`}
          />
        </View>

        {/* Cancel */}
        {canCancel && (
          <View style={styles.cancelWrapper}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
              disabled={cancelling}
              activeOpacity={0.85}
            >
              <Ionicons
                name={cancelling ? "hourglass-outline" : "close-circle-outline"}
                size={19}
                color={THEME.red}
              />

              <Text style={styles.cancelButtonText}>
                {cancelling ? "Cancelling..." : "Cancel Booking"}
              </Text>
            </TouchableOpacity>

            <Text style={styles.cancelHint}>
              You can cancel while the booking is Pending or Confirmed.
            </Text>
          </View>
        )}

        <View style={{ height: 28 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryRow({
  icon,
  label,
  value,
  bold,
}: {
  icon: string;
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <View style={styles.summaryRow}>
      <View style={styles.summaryLeft}>
        <View style={styles.summaryIconBox}>
          <Ionicons name={icon as any} size={16} color={THEME.violet} />
        </View>

        <Text style={styles.summaryLabel}>{label}</Text>
      </View>

      <Text style={[styles.summaryValue, bold && styles.summaryValueBold]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: THEME.background,
  },

  headerBar: {
    backgroundColor: THEME.navy,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 13,
    overflow: "hidden",
  },

  headerGlow: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: THEME.violet,
    right: -70,
    top: -100,
    opacity: 0.28,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: THEME.white,
    justifyContent: "center",
    alignItems: "center",
  },

  headerCenter: {
    alignItems: "center",
  },

  headerTitle: {
    color: THEME.white,
    fontSize: 17,
    fontWeight: "900",
  },

  headerSubtitle: {
    color: "#C4B5FD",
    fontSize: 10,
    fontWeight: "700",
    marginTop: 2,
  },

  headerStatus: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: THEME.white,
    justifyContent: "center",
    alignItems: "center",
  },

  scroll: {
    flex: 1,
  },

  content: {
    padding: 16,
    paddingBottom: 40,
  },

  statusCard: {
    backgroundColor: THEME.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: THEME.border,
  },

  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  statusIconBox: {
    width: 50,
    height: 50,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },

  statusTextArea: {
    flex: 1,
    marginLeft: 12,
  },

  statusSmall: {
    fontSize: 9,
    color: THEME.muted,
    fontWeight: "900",
    letterSpacing: 1.4,
  },

  statusLarge: {
    fontSize: 22,
    fontWeight: "900",
    marginTop: 3,
  },

  trackerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  trackerStep: {
    alignItems: "center",
    width: 72,
  },

  trackerDot: {
    width: 23,
    height: 23,
    borderRadius: 12,
    backgroundColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
  },

  trackerDotDone: {
    backgroundColor: THEME.violet,
  },

  trackerDotCurrent: {
    backgroundColor: THEME.navy,
  },

  trackerLabel: {
    fontSize: 9,
    color: THEME.muted,
    marginTop: 7,
    fontWeight: "700",
  },

  trackerLabelDone: {
    color: THEME.text,
    fontWeight: "900",
  },

  trackerLine: {
    flex: 1,
    height: 2,
    backgroundColor: "#E2E8F0",
    marginTop: 11,
    marginHorizontal: -12,
  },

  trackerLineDone: {
    backgroundColor: THEME.violet,
  },

  cancelledBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    backgroundColor: THEME.redSoft,
    borderWidth: 1,
    borderColor: "#FECACA",
  },

  cancelledText: {
    color: THEME.red,
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 8,
  },

  sectionHeading: {
    fontSize: 11,
    fontWeight: "900",
    color: THEME.muted,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    marginBottom: 10,
    marginTop: 5,
  },

  eventCard: {
    flexDirection: "row",
    backgroundColor: THEME.white,
    borderRadius: 18,
    marginBottom: 22,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: THEME.border,
  },

  eventImage: {
    width: 120,
    height: 150,
    backgroundColor: THEME.lavenderSoft,
  },

  eventBody: {
    flex: 1,
    padding: 13,
    justifyContent: "center",
  },

  categoryPill: {
    alignSelf: "flex-start",
    backgroundColor: THEME.lavenderSoft,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },

  categoryText: {
    fontSize: 9,
    color: THEME.violet,
    fontWeight: "900",
    textTransform: "uppercase",
  },

  eventName: {
    fontSize: 16,
    fontWeight: "900",
    color: THEME.text,
    marginBottom: 7,
  },

  eventMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },

  eventMetaText: {
    fontSize: 11,
    color: THEME.muted,
    marginLeft: 4,
    flexShrink: 1,
  },

  eventPrice: {
    fontSize: 15,
    fontWeight: "900",
    color: THEME.violet,
    marginTop: 5,
  },

  summaryCard: {
    backgroundColor: THEME.white,
    borderRadius: 16,
    paddingHorizontal: 14,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: THEME.border,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
  },

  summaryLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  summaryIconBox: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: THEME.lavenderSoft,
    justifyContent: "center",
    alignItems: "center",
  },

  summaryLabel: {
    fontSize: 13,
    color: THEME.muted,
    marginLeft: 9,
    fontWeight: "600",
  },

  summaryValue: {
    fontSize: 13,
    color: THEME.text,
    fontWeight: "700",
    flexShrink: 1,
    textAlign: "right",
    marginLeft: 12,
  },

  summaryValueBold: {
    fontSize: 16,
    fontWeight: "900",
    color: THEME.violet,
  },

  divider: {
    height: 1,
    backgroundColor: THEME.background,
  },

  cancelWrapper: {
    marginTop: 4,
  },

  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: THEME.redSoft,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#FECACA",
  },

  cancelButtonText: {
    color: THEME.red,
    fontWeight: "900",
    fontSize: 15,
    marginLeft: 8,
  },

  cancelHint: {
    fontSize: 11,
    color: THEME.muted,
    textAlign: "center",
    marginTop: 10,
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
