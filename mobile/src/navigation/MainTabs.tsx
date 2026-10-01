// src/navigation/MainTabs.tsx

import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

import EventListScreen from "../screens/events/EventListScreen";
import EventDetailScreen from "../screens/events/EventDetailScreen";

import MyBookingsScreen from "../screens/bookings/MyBookingsScreen";
import BookingDetailScreen from "../screens/bookings/BookingDetailScreen";

import ProfileScreen from "../screens/profile/ProfileScreen";

import AdminEventListScreen from "../screens/admin/AdminEventListScreen";
import EventFormScreen from "../screens/admin/EventFormScreen";
import AdminBookingsScreen from "../screens/admin/AdminBookingsScreen";
import AdminBookingDetailScreen from "../screens/admin/AdminBookingDetailScreen";

import { useAuth } from "../context/AuthContext";

import {
  MainTabParamList,
  EventStackParamList,
  BookingStackParamList,
  AdminStackParamList,
} from "./types";

// Elegant event-booking palette
const THEME = {
  navy: "#111827",
  navySoft: "#1F2937",
  violet: "#7C3AED",
  violetSoft: "#EDE9FE",
  ivory: "#FAFAF9",
  white: "#FFFFFF",
  text: "#111827",
  muted: "#9CA3AF",
  border: "#E5E7EB",
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const EventStack = createNativeStackNavigator<EventStackParamList>();
const BookingStack = createNativeStackNavigator<BookingStackParamList>();
const AdminStack = createNativeStackNavigator<AdminStackParamList>();

function EventStackScreen() {
  return (
    <EventStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <EventStack.Screen name="EventList" component={EventListScreen} />

      <EventStack.Screen name="EventDetail" component={EventDetailScreen} />
    </EventStack.Navigator>
  );
}

function BookingStackScreen() {
  return (
    <BookingStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <BookingStack.Screen name="MyBookings" component={MyBookingsScreen} />

      <BookingStack.Screen
        name="BookingDetail"
        component={BookingDetailScreen}
      />
    </BookingStack.Navigator>
  );
}

function AdminStackScreen() {
  return (
    <AdminStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <AdminStack.Screen
        name="AdminEventList"
        component={AdminEventListScreen}
      />

      <AdminStack.Screen name="EventForm" component={EventFormScreen} />

      <AdminStack.Screen name="AdminBookings" component={AdminBookingsScreen} />

      <AdminStack.Screen
        name="AdminBookingDetail"
        component={AdminBookingDetailScreen}
      />
    </AdminStack.Navigator>
  );
}

function TabIcon({
  name,
  focused,
  color,
  size,
}: {
  name: any;
  focused: boolean;
  color: string;
  size: number;
}) {
  return (
    <View style={styles.iconWrapper}>
      {focused && <View style={styles.activeBackground} />}

      <Ionicons name={name} size={size} color={color} />
    </View>
  );
}

export default function MainTabs() {
  const { user } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,

        tabBarActiveTintColor: THEME.violet,
        tabBarInactiveTintColor: THEME.muted,

        tabBarStyle: {
          backgroundColor: THEME.white,
          borderTopWidth: 0,
          height: Platform.OS === "ios" ? 88 : 72,
          paddingTop: 8,
          paddingBottom: Platform.OS === "ios" ? 26 : 10,
          paddingHorizontal: 10,

          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: -3,
          },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 8,
        },

        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
          letterSpacing: 0.2,
          marginTop: 2,
        },

        tabBarItemStyle: {
          paddingVertical: 2,
        },
      }}
    >
      <Tab.Screen
        name="EventsTab"
        component={EventStackScreen}
        options={{
          title: "Discover",

          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon
              name={focused ? "compass" : "compass-outline"}
              focused={focused}
              color={color}
              size={23}
            />
          ),
        }}
      />

      <Tab.Screen
        name="BookingsTab"
        component={BookingStackScreen}
        options={{
          title: "Bookings",

          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon
              name={focused ? "ticket" : "ticket-outline"}
              focused={focused}
              color={color}
              size={23}
            />
          ),
        }}
      />

      {user?.isAdmin && (
        <Tab.Screen
          name="AdminTab"
          component={AdminStackScreen}
          options={{
            title: "Manage",

            tabBarIcon: ({ color, size, focused }) => (
              <TabIcon
                name={focused ? "grid" : "grid-outline"}
                focused={focused}
                color={color}
                size={22}
              />
            ),
          }}
        />
      )}

      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          title: "Profile",

          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon
              name={focused ? "person-circle" : "person-circle-outline"}
              focused={focused}
              color={color}
              size={24}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  iconWrapper: {
    width: 46,
    height: 34,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },

  activeBackground: {
    position: "absolute",
    width: 44,
    height: 32,
    borderRadius: 16,
    backgroundColor: THEME.violetSoft,
  },
});
