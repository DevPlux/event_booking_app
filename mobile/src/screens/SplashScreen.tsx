// src/screens/SplashScreen.tsx

import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const THEME = {
  navy: "#0F172A",
  navySoft: "#1E293B",
  violet: "#7C3AED",
  violetDark: "#5B21B6",
  lavender: "#EDE9FE",
  ivory: "#FAFAF9",
  white: "#FFFFFF",
  muted: "#CBD5E1",
};

export default function SplashScreen() {
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 75,
        useNativeDriver: true,
      }),

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 650,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),

      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 650,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Decorative background shapes */}
      <View style={styles.topGlow} />
      <View style={styles.bottomGlow} />

      {/* Logo */}
      <Animated.View
        style={[
          styles.logoWrapper,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.logoCircle}>
          <Ionicons name="ticket" size={52} color={THEME.violet} />
        </View>
      </Animated.View>

      {/* Brand */}
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          alignItems: "center",
        }}
      >
        <View style={styles.brandRow}>
          <Text style={styles.brandPrimary}>Event</Text>
          <Text style={styles.brandSecondary}>ora</Text>
        </View>

        <Text style={styles.subtitle}>Discover moments worth remembering</Text>

        <View style={styles.taglinePill}>
          <Ionicons name="sparkles" size={14} color={THEME.violet} />

          <Text style={styles.tagline}>Discover · Book · Experience</Text>
        </View>
      </Animated.View>

      {/* Footer */}
      <Animated.View
        style={[
          styles.footer,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        <Text style={styles.footerText}>SE2020 · EVENT BOOKING PLATFORM</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.navy,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },

  topGlow: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: THEME.violetDark,
    top: -120,
    right: -120,
    opacity: 0.26,
  },

  bottomGlow: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: THEME.violet,
    bottom: -140,
    left: -100,
    opacity: 0.16,
  },

  logoWrapper: {
    marginBottom: 28,
  },

  logoCircle: {
    width: 116,
    height: 116,
    borderRadius: 58,
    backgroundColor: THEME.ivory,
    justifyContent: "center",
    alignItems: "center",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },

  brandRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },

  brandPrimary: {
    color: THEME.white,
    fontSize: 42,
    fontWeight: "900",
    letterSpacing: -1.6,
  },

  brandSecondary: {
    color: "#C4B5FD",
    fontSize: 42,
    fontWeight: "300",
    letterSpacing: -1.6,
  },

  subtitle: {
    color: THEME.muted,
    fontSize: 14,
    fontWeight: "500",
    marginTop: 8,
    letterSpacing: 0.2,
  },

  taglinePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.ivory,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 24,
    marginTop: 20,
    gap: 7,
  },

  tagline: {
    color: THEME.navy,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.25,
  },

  footer: {
    position: "absolute",
    bottom: 42,
  },

  footerText: {
    color: THEME.muted,
    fontSize: 10,
    letterSpacing: 1.8,
    fontWeight: "700",
    opacity: 0.7,
  },
});
