// src/screens/profile/ProfileScreen.tsx

import React, { useState, useCallback, useMemo } from "react";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

import { useAuth } from "../../context/AuthContext";
import { getMyBookings } from "../../api/bookingService";
import { Booking } from "../../types/booking";

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
  red: "#DC2626",
  redSoft: "#FEF2F2",
  amber: "#D97706",
  amberSoft: "#FFF7ED",
  green: "#059669",
  greenSoft: "#ECFDF5",
};

export default function ProfileScreen({ navigation }: any) {
  const { user, logout } = useAuth();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBookings = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);

    try {
      const data = await getMyBookings();
      setBookings(data);
    } catch {
      // Profile statistics are non-critical
    } finally {
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

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((name) => name[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  const formatSpent = (value: number) => {
    return value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value.toFixed(0);
  };

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: logout,
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Header */}
      <View style={styles.topBar}>
        <View style={styles.topGlow} />

        <Text style={styles.topBarLabel}>EVENTORA ACCOUNT</Text>

        <Text style={styles.topBarTitle}>Your Profile</Text>

        <Text style={styles.topBarSubtitle}>
          Manage your account and event activity
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchBookings(true)}
            tintColor={THEME.violet}
          />
        }
      >
        {/* Profile Card */}
        <View style={styles.identityCard}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>

            {user?.isAdmin && (
              <View style={styles.adminIcon}>
                <Ionicons
                  name="shield-checkmark"
                  size={13}
                  color={THEME.white}
                />
              </View>
            )}
          </View>

          <Text style={styles.name}>{user?.name || "Guest User"}</Text>

          <Text style={styles.email}>{user?.email || "Not signed in"}</Text>

          {user?.isAdmin && (
            <View style={styles.adminBadge}>
              <Ionicons
                name="shield-checkmark-outline"
                size={13}
                color={THEME.violet}
              />

              <Text style={styles.adminBadgeText}>EVENT ADMINISTRATOR</Text>
            </View>
          )}
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

            <Text style={styles.statLabel}>BOOKINGS</Text>
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
              {formatSpent(stats.spent)}
            </Text>

            <Text style={styles.statLabel}>SPENT (RS.)</Text>
          </View>
        </View>

        {/* Account */}
        <Text style={styles.sectionHeading}>Account</Text>

        <View style={styles.group}>
          <SettingRow
            icon="person-outline"
            label="Full Name"
            value={user?.name || "—"}
          />

          <Divider />

          <SettingRow
            icon="mail-outline"
            label="Email"
            value={user?.email || "—"}
          />

          <Divider />

          <SettingRow
            icon="finger-print-outline"
            label="User ID"
            value={`#${user?._id?.slice(-8).toUpperCase() || "—"}`}
          />
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionHeading}>Quick Actions</Text>

        <View style={styles.group}>
          <ActionRow
            icon="compass-outline"
            label="Discover Events"
            onPress={() =>
              navigation.getParent()?.navigate("EventsTab" as never)
            }
          />

          <Divider />

          <ActionRow
            icon="ticket-outline"
            label="My Bookings"
            onPress={() =>
              navigation.getParent()?.navigate("BookingsTab" as never)
            }
          />

          {user?.isAdmin && (
            <>
              <Divider />

              <ActionRow
                icon="grid-outline"
                label="Event Management"
                onPress={() =>
                  navigation.getParent()?.navigate("AdminTab" as never)
                }
              />
            </>
          )}
        </View>

        {/* About */}
        <Text style={styles.sectionHeading}>About</Text>

        <View style={styles.group}>
          <SettingRow
            icon="sparkles-outline"
            label="Platform"
            value="Eventora"
          />

          <Divider />

          <SettingRow
            icon="information-circle-outline"
            label="App Version"
            value="1.0.0"
          />

          <Divider />

          <SettingRow
            icon="shield-outline"
            label="Account Type"
            value={user?.isAdmin ? "Administrator" : "Customer"}
          />
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.85}
        >
          <Ionicons name="log-out-outline" size={19} color={THEME.red} />

          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>
          EVENTORA · SE2020 · {new Date().getFullYear()}
        </Text>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingLeft}>
        <View style={styles.settingIconBox}>
          <Ionicons name={icon as any} size={17} color={THEME.violet} />
        </View>

        <Text style={styles.settingLabel}>{label}</Text>
      </View>

      <Text style={styles.settingValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function ActionRow({
  icon,
  label,
  onPress,
}: {
  icon: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.settingRow}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingLeft}>
        <View style={styles.settingIconBox}>
          <Ionicons name={icon as any} size={17} color={THEME.violet} />
        </View>

        <Text style={styles.settingLabel}>{label}</Text>
      </View>

      <Ionicons name="chevron-forward" size={18} color={THEME.muted} />
    </TouchableOpacity>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: THEME.background,
  },

  topBar: {
    backgroundColor: THEME.navy,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 58,
    overflow: "hidden",
  },

  topGlow: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: THEME.violet,
    right: -100,
    top: -120,
    opacity: 0.25,
  },

  topBarLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#C4B5FD",
    letterSpacing: 2,
    marginBottom: 10,
  },

  topBarTitle: {
    color: THEME.white,
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: -1,
  },

  topBarSubtitle: {
    color: "#CBD5E1",
    fontSize: 13,
    marginTop: 7,
    fontWeight: "500",
  },

  content: {
    padding: 16,
    paddingBottom: 40,
  },

  identityCard: {
    backgroundColor: THEME.white,
    borderRadius: 22,
    paddingTop: 52,
    paddingBottom: 24,
    paddingHorizontal: 20,
    alignItems: "center",
    marginTop: -42,
    borderWidth: 1,
    borderColor: THEME.border,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },

  avatarWrapper: {
    position: "relative",
  },

  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: THEME.navy,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: THEME.lavender,
  },

  avatarText: {
    color: THEME.white,
    fontSize: 30,
    fontWeight: "900",
  },

  adminIcon: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: THEME.violet,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: THEME.white,
  },

  name: {
    fontSize: 22,
    fontWeight: "900",
    color: THEME.text,
    marginTop: 16,
  },

  email: {
    fontSize: 13,
    color: THEME.muted,
    marginTop: 4,
    fontWeight: "500",
  },

  adminBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: THEME.lavenderSoft,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 14,
  },

  adminBadgeText: {
    color: THEME.violet,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
  },

  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },

  statCard: {
    flex: 1,
    backgroundColor: THEME.white,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 11,
    borderWidth: 1,
    borderColor: THEME.border,
  },

  statIconBox: {
    width: 30,
    height: 30,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 9,
  },

  statValue: {
    fontSize: 20,
    fontWeight: "900",
    color: THEME.text,
  },

  statLabel: {
    fontSize: 9,
    color: THEME.muted,
    fontWeight: "800",
    marginTop: 3,
    letterSpacing: 0.9,
  },

  sectionHeading: {
    fontSize: 11,
    fontWeight: "900",
    color: THEME.muted,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    marginTop: 24,
    marginBottom: 10,
  },

  group: {
    backgroundColor: THEME.white,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: THEME.border,
  },

  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
  },

  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  settingIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: THEME.lavenderSoft,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  settingLabel: {
    fontSize: 14,
    color: THEME.text,
    fontWeight: "700",
  },

  settingValue: {
    fontSize: 13,
    color: THEME.muted,
    fontWeight: "600",
    maxWidth: "55%",
    textAlign: "right",
  },

  divider: {
    height: 1,
    backgroundColor: THEME.background,
    marginLeft: 60,
  },

  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: THEME.redSoft,
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 28,
    borderWidth: 1,
    borderColor: "#FECACA",
  },

  logoutText: {
    color: THEME.red,
    fontWeight: "800",
    fontSize: 15,
    marginLeft: 8,
  },

  footer: {
    textAlign: "center",
    fontSize: 10,
    color: THEME.muted,
    marginTop: 24,
    fontWeight: "700",
    letterSpacing: 1.2,
  },
});
