// src/screens/admin/AdminBookingDetailScreen.tsx

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

import {
  getBookingById,
  updateBookingStatus,
  deleteBooking,
} from "../../api/bookingService";

import { Booking, BookingStatus } from "../../types/booking";

import Loading from "../../components/Loading";
import ErrorText from "../../components/ErrorText";

import { AdminStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<AdminStackParamList, "AdminBookingDetail">;

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

type BookingAction = {
  label: string;
  status: BookingStatus;
  icon: string;
  variant: "primary" | "danger";
};

const NEXT_ACTIONS: Record<BookingStatus, BookingAction[]> = {
  Pending: [
    {
      label: "Confirm Booking",
      status: "Confirmed",
      icon: "checkmark-circle",
      variant: "primary",
    },
    {
      label: "Cancel Booking",
      status: "Cancelled",
      icon: "close-circle",
      variant: "danger",
    },
  ],

  Confirmed: [
    {
      label: "Mark as Completed",
      status: "Completed",
      icon: "checkmark-done-circle",
      variant: "primary",
    },
    {
      label: "Cancel Booking",
      status: "Cancelled",
      icon: "close-circle",
      variant: "danger",
    },
  ],

  Completed: [],
  Cancelled: [],
};

const getCustomerName = (booking: Booking) => {
  if (typeof booking.user === "string") {
    return booking.user;
  }

  return booking.user?.name || "Unknown User";
};

const getCustomerEmail = (booking: Booking) => {
  if (typeof booking.user === "string") {
    return "—";
  }

  return booking.user?.email || "—";
};

export default function AdminBookingDetailScreen({ route, navigation }: Props) {
  const { bookingId } = route.params;

  const [booking, setBooking] = useState<Booking | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [updating, setUpdating] = useState(false);

  const loadBooking = async () => {
    try {
      setError("");

      const data = await getBookingById(bookingId);

      setBooking(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load booking");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooking();
  }, [bookingId]);

  const changeStatus = async (newStatus: BookingStatus) => {
    if (!booking) return;

    setUpdating(true);

    try {
      const updated = await updateBookingStatus(booking._id, newStatus);

      setBooking(updated);

      Alert.alert("Booking Updated", `Booking is now ${updated.status}`);
    } catch (e) {
      Alert.alert(
        "Update Failed",
        e instanceof Error ? e.message : "Unable to update booking",
      );
    } finally {
      setUpdating(false);
    }
  };

  const confirmDelete = () => {
    if (!booking) return;

    Alert.alert(
      "Delete Booking",
      "This will permanently delete the booking. This action cannot be undone.",
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
              await deleteBooking(booking._id);

              navigation.goBack();
            } catch (e) {
              Alert.alert(
                "Delete Failed",
                e instanceof Error ? e.message : "Unable to delete booking",
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

  if (error || !booking) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.headerBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={21} color={THEME.navy} />
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

  const eventName = event?.name || "Unknown Event";

  const eventImage = event?.imageUrl || "https://via.placeholder.com/150";

  const eventPrice =
    typeof event?.price === "number" ? event.price.toFixed(2) : "0.00";

  const total =
    typeof booking.totalAmount === "number"
      ? booking.totalAmount.toFixed(2)
      : "0.00";

  const bookingDate = new Date(booking.bookingDate);

  const eventDate = event?.date ? new Date(event.date) : null;

  const actions = NEXT_ACTIONS[booking.status] || [];

  const currentStepIndex = STEPS.indexOf(booking.status);

  const isCancelled = booking.status === "Cancelled";

  const statusStyle = STATUS_COLORS[booking.status] || STATUS_COLORS.Pending;

  const customerName = getCustomerName(booking);

  const customerEmail = getCustomerEmail(booking);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Header */}
      <View style={styles.headerBar}>
        <View style={styles.headerGlow} />

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={21} color={THEME.navy} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerLabel}>EVENTORA ADMIN</Text>

          <Text style={styles.headerTitle}>Booking Details</Text>

          <Text style={styles.headerSubtitle}>
            #{booking._id.slice(-6).toUpperCase()}
          </Text>
        </View>

        <View style={styles.headerStatusChip}>
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
              <Text style={styles.statusLabelSmall}>CURRENT STATUS</Text>

              <Text
                style={[
                  styles.statusLabelBig,
                  {
                    color: statusStyle.text,
                  },
                ]}
              >
                {booking.status}
              </Text>
            </View>
          </View>

          {!isCancelled ? (
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
          ) : (
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
          <Image
            source={{
              uri: eventImage,
            }}
            style={styles.eventImage}
          />

          <View style={styles.eventBody}>
            <Text style={styles.eventName} numberOfLines={2}>
              {eventName}
            </Text>

            {eventDate && (
              <View style={styles.metaRow}>
                <Ionicons
                  name="calendar-outline"
                  size={13}
                  color={THEME.muted}
                />

                <Text style={styles.metaText}>
                  {eventDate.toLocaleDateString()}
                </Text>
              </View>
            )}

            <View style={styles.metaRow}>
              <Ionicons name="location-outline" size={13} color={THEME.muted} />

              <Text style={styles.metaText} numberOfLines={1}>
                {event.location}
              </Text>
            </View>

            <Text style={styles.eventInfo}>
              {booking.quantity} ticket
              {booking.quantity !== 1 ? "s" : ""} · Rs. {eventPrice} each
            </Text>

            <Text style={styles.eventTotal}>Rs. {total}</Text>
          </View>
        </View>

        {/* Customer */}
        <Text style={styles.sectionHeading}>Customer</Text>

        <View style={styles.infoCard}>
          <InfoRow icon="person-outline" label="Name" value={customerName} />

          <View style={styles.divider} />

          <InfoRow icon="mail-outline" label="Email" value={customerEmail} />
        </View>

        {/* Booking Info */}
        <Text style={styles.sectionHeading}>Booking Information</Text>

        <View style={styles.infoCard}>
          <InfoRow
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

          <InfoRow
            icon="ticket-outline"
            label="Booking ID"
            value={`#${booking._id.slice(-8).toUpperCase()}`}
          />

          <View style={styles.divider} />

          <InfoRow
            icon="people-outline"
            label="Tickets"
            value={String(booking.quantity)}
          />

          <View style={styles.divider} />

          <InfoRow
            icon="wallet-outline"
            label="Total"
            value={`Rs. ${total}`}
            highlight
          />
        </View>

        {/* Admin Actions */}
        {actions.length > 0 && (
          <>
            <Text style={styles.sectionHeading}>Actions</Text>

            <View style={styles.actionsBlock}>
              {actions.map((action) => {
                const isDanger = action.variant === "danger";

                return (
                  <TouchableOpacity
                    key={action.status}
                    style={[
                      styles.actionButton,

                      isDanger && styles.dangerActionButton,

                      updating && {
                        opacity: 0.6,
                      },
                    ]}
                    onPress={() => changeStatus(action.status)}
                    disabled={updating}
                    activeOpacity={0.85}
                  >
                    <Ionicons
                      name={action.icon as any}
                      size={18}
                      color={isDanger ? THEME.red : THEME.white}
                    />

                    <Text
                      style={[
                        styles.actionText,

                        isDanger && styles.dangerActionText,
                      ]}
                    >
                      {updating ? "Updating..." : action.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

        {/* Delete */}
        <TouchableOpacity style={styles.deleteButton} onPress={confirmDelete}>
          <Ionicons name="trash-outline" size={17} color={THEME.red} />

          <Text style={styles.deleteText}>Delete Booking</Text>
        </TouchableOpacity>

        <View style={{ height: 28 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({
  icon,
  label,
  value,
  highlight,
}: {
  icon: string;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoLeft}>
        <View style={styles.infoIconBox}>
          <Ionicons name={icon as any} size={16} color={THEME.violet} />
        </View>

        <Text style={styles.infoLabel}>{label}</Text>
      </View>

      <Text
        style={[styles.infoValue, highlight && styles.infoValueHighlight]}
        numberOfLines={1}
      >
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

    opacity: 0.27,
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
    flex: 1,
  },

  headerLabel: {
    fontSize: 8,

    fontWeight: "900",

    color: "#C4B5FD",

    letterSpacing: 1.5,

    marginBottom: 2,
  },

  headerTitle: {
    color: THEME.white,

    fontSize: 17,

    fontWeight: "900",
  },

  headerSubtitle: {
    color: "#CBD5E1",

    fontSize: 10,

    marginTop: 2,

    fontWeight: "700",
  },

  headerStatusChip: {
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

  statusLabelSmall: {
    fontSize: 9,

    color: THEME.muted,

    fontWeight: "900",

    letterSpacing: 1.3,
  },

  statusLabelBig: {
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

    backgroundColor: THEME.redSoft,

    padding: 12,

    borderRadius: 10,

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
    width: 110,
    height: 140,

    backgroundColor: THEME.lavenderSoft,
  },

  eventBody: {
    flex: 1,

    padding: 14,

    justifyContent: "center",
  },

  eventName: {
    fontSize: 16,

    fontWeight: "900",

    color: THEME.text,

    marginBottom: 5,
  },

  metaRow: {
    flexDirection: "row",

    alignItems: "center",

    marginTop: 4,
  },

  metaText: {
    fontSize: 11,

    color: THEME.muted,

    marginLeft: 4,

    flexShrink: 1,
  },

  eventInfo: {
    fontSize: 11,

    color: THEME.muted,

    marginTop: 7,

    fontWeight: "600",
  },

  eventTotal: {
    fontSize: 17,

    fontWeight: "900",

    color: THEME.violet,

    marginTop: 5,
  },

  infoCard: {
    backgroundColor: THEME.white,

    borderRadius: 16,

    paddingHorizontal: 14,

    marginBottom: 22,

    borderWidth: 1,

    borderColor: THEME.border,
  },

  infoRow: {
    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

    paddingVertical: 14,
  },

  infoLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  infoIconBox: {
    width: 30,
    height: 30,

    borderRadius: 9,

    backgroundColor: THEME.lavenderSoft,

    justifyContent: "center",
    alignItems: "center",
  },

  infoLabel: {
    fontSize: 13,

    color: THEME.muted,

    marginLeft: 9,

    fontWeight: "600",
  },

  infoValue: {
    fontSize: 13,

    color: THEME.text,

    fontWeight: "700",

    maxWidth: "55%",

    textAlign: "right",
  },

  infoValueHighlight: {
    color: THEME.violet,

    fontSize: 15,

    fontWeight: "900",
  },

  divider: {
    height: 1,

    backgroundColor: THEME.background,
  },

  actionsBlock: {
    marginBottom: 16,
  },

  actionButton: {
    flexDirection: "row",

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: THEME.violet,

    paddingVertical: 16,

    borderRadius: 14,

    marginBottom: 10,
  },

  dangerActionButton: {
    backgroundColor: THEME.redSoft,

    borderWidth: 1,

    borderColor: "#FECACA",
  },

  actionText: {
    color: THEME.white,

    fontWeight: "900",

    fontSize: 14,

    marginLeft: 8,
  },

  dangerActionText: {
    color: THEME.red,
  },

  deleteButton: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    paddingVertical: 15,

    borderRadius: 14,

    backgroundColor: THEME.white,

    borderWidth: 1,

    borderColor: THEME.border,
  },

  deleteText: {
    color: THEME.red,

    fontWeight: "800",

    fontSize: 14,

    marginLeft: 7,
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
