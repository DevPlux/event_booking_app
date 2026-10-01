// src/screens/auth/RegisterScreen.tsx

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import InputField from "../../components/InputField";
import PrimaryButton from "../../components/PrimaryButton";
import ErrorText from "../../components/ErrorText";

import { validateRegister } from "../../utils/validators";
import { useAuth } from "../../context/AuthContext";
import { AuthStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<AuthStackParamList, "Register">;

const THEME = {
  navy: "#0F172A",
  violet: "#7C3AED",
  violetDark: "#5B21B6",
  lavender: "#EDE9FE",
  white: "#FFFFFF",
  background: "#F8FAFC",
  text: "#111827",
  muted: "#64748B",
  border: "#E2E8F0",
};

export default function RegisterScreen({ navigation }: Props) {
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [serverError, setServerError] = useState("");

  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setServerError("");

    const validationErrors = validateRegister({
      name,
      email,
      password,
      confirmPassword,
    });

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length) {
      return;
    }

    setLoading(true);

    try {
      await register(name.trim(), email.trim().toLowerCase(), password);
    } catch (e) {
      setServerError(
        e instanceof Error ? e.message : "Unable to create account",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero */}
        <SafeAreaView edges={["top"]} style={styles.hero}>
          <View style={styles.topGlow} />
          <View style={styles.bottomGlow} />

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={20} color={THEME.white} />
          </TouchableOpacity>

          <View style={styles.logoCircle}>
            <Ionicons name="ticket" size={40} color={THEME.violet} />
          </View>

          <View style={styles.brandRow}>
            <Text style={styles.brandMain}>Event</Text>

            <Text style={styles.brandAccent}>ora</Text>
          </View>

          <Text style={styles.heroSubtitle}>
            Join and start discovering unforgettable events
          </Text>

          <View style={styles.taglinePill}>
            <Ionicons name="sparkles" size={13} color={THEME.violet} />

            <Text style={styles.taglineText}>Discover · Book · Experience</Text>
          </View>
        </SafeAreaView>

        {/* Form Card */}
        <View style={styles.cardWrapper}>
          <View style={styles.card}>
            <Text style={styles.eyebrow}>GET STARTED</Text>

            <Text style={styles.title}>Create your account</Text>

            <Text style={styles.subtitle}>
              Create an Eventora account to book and manage your events.
            </Text>

            <InputField
              label="Full Name"
              placeholder="Your full name"
              value={name}
              onChangeText={setName}
              error={errors.name}
            />

            <InputField
              label="Email"
              placeholder="you@example.com"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              error={errors.email}
            />

            <InputField
              label="Password"
              placeholder="At least 6 characters"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              error={errors.password}
            />

            <InputField
              label="Confirm Password"
              placeholder="Re-enter your password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              error={errors.confirmPassword}
            />

            <ErrorText>{serverError}</ErrorText>

            <PrimaryButton
              title="Create Account"
              onPress={onSubmit}
              loading={loading}
            />

            <TouchableOpacity
              onPress={() => navigation.navigate("Login")}
              style={styles.linkWrapper}
              activeOpacity={0.7}
            >
              <Text style={styles.linkText}>Already have an account? </Text>

              <Text style={styles.linkBold}>Sign in</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.trustRow}>
            <Ionicons
              name="shield-checkmark-outline"
              size={13}
              color={THEME.muted}
            />

            <Text style={styles.legalText}>
              Your account details are securely protected
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.navy,
  },

  scrollContent: {
    flexGrow: 1,
    backgroundColor: THEME.background,
  },

  hero: {
    backgroundColor: THEME.navy,

    paddingTop: 28,
    paddingBottom: 72,

    alignItems: "center",

    overflow: "hidden",
    position: "relative",
  },

  topGlow: {
    position: "absolute",

    width: 280,
    height: 280,
    borderRadius: 140,

    backgroundColor: THEME.violetDark,

    top: -150,
    right: -120,

    opacity: 0.3,
  },

  bottomGlow: {
    position: "absolute",

    width: 220,
    height: 220,
    borderRadius: 110,

    backgroundColor: THEME.violet,

    bottom: -150,
    left: -90,

    opacity: 0.16,
  },

  backButton: {
    position: "absolute",

    top: 16,
    left: 16,

    width: 42,
    height: 42,
    borderRadius: 21,

    backgroundColor: "rgba(255,255,255,0.12)",

    justifyContent: "center",
    alignItems: "center",

    zIndex: 2,
  },

  logoCircle: {
    width: 86,
    height: 86,
    borderRadius: 43,

    backgroundColor: THEME.white,

    justifyContent: "center",
    alignItems: "center",

    shadowColor: "#000",

    shadowOffset: {
      width: 0,
      height: 8,
    },

    shadowOpacity: 0.22,
    shadowRadius: 18,

    elevation: 10,

    marginBottom: 17,
  },

  brandRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },

  brandMain: {
    color: THEME.white,

    fontSize: 31,
    fontWeight: "900",

    letterSpacing: -1.2,
  },

  brandAccent: {
    color: "#C4B5FD",

    fontSize: 31,
    fontWeight: "300",

    letterSpacing: -1.2,
  },

  heroSubtitle: {
    color: "#CBD5E1",

    fontSize: 13,
    fontWeight: "500",

    marginTop: 8,

    textAlign: "center",

    paddingHorizontal: 30,
  },

  taglinePill: {
    flexDirection: "row",
    alignItems: "center",

    backgroundColor: THEME.white,

    paddingHorizontal: 13,
    paddingVertical: 7,

    borderRadius: 22,

    marginTop: 16,

    gap: 6,
  },

  taglineText: {
    color: THEME.navy,

    fontSize: 11,
    fontWeight: "700",

    letterSpacing: 0.25,
  },

  cardWrapper: {
    flex: 1,

    paddingHorizontal: 20,

    marginTop: -48,

    paddingBottom: 28,
  },

  card: {
    backgroundColor: THEME.white,

    borderRadius: 24,

    padding: 24,

    borderWidth: 1,
    borderColor: THEME.border,

    shadowColor: "#000",

    shadowOffset: {
      width: 0,
      height: 8,
    },

    shadowOpacity: 0.07,
    shadowRadius: 20,

    elevation: 6,
  },

  eyebrow: {
    fontSize: 10,

    color: THEME.violet,

    fontWeight: "900",

    letterSpacing: 1.6,

    marginBottom: 8,
  },

  title: {
    fontSize: 28,

    fontWeight: "900",

    color: THEME.text,

    letterSpacing: -0.7,
  },

  subtitle: {
    fontSize: 14,

    color: THEME.muted,

    marginBottom: 26,
    marginTop: 7,

    lineHeight: 20,

    fontWeight: "500",
  },

  linkWrapper: {
    marginTop: 22,

    flexDirection: "row",

    justifyContent: "center",

    alignItems: "center",
  },

  linkText: {
    color: THEME.muted,

    fontSize: 14,

    fontWeight: "500",
  },

  linkBold: {
    color: THEME.violet,

    fontSize: 14,

    fontWeight: "800",
  },

  trustRow: {
    flexDirection: "row",

    justifyContent: "center",

    alignItems: "center",

    marginTop: 16,

    gap: 5,
  },

  legalText: {
    textAlign: "center",

    fontSize: 10,

    color: THEME.muted,

    letterSpacing: 0.2,

    fontWeight: "600",
  },
});
