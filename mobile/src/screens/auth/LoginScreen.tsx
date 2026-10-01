// src/screens/auth/LoginScreen.tsx

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
import { validateLogin } from "../../utils/validators";
import { useAuth } from "../../context/AuthContext";
import { AuthStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

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
};

export default function LoginScreen({ navigation }: Props) {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setServerError("");

    const validationErrors = validateLogin({
      email,
      password,
    });

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length) {
      return;
    }

    setLoading(true);

    try {
      await login(email.trim().toLowerCase(), password);
    } catch (e) {
      setServerError(e instanceof Error ? e.message : "Unable to sign in");
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

          <View style={styles.logoCircle}>
            <Ionicons name="ticket" size={42} color={THEME.violet} />
          </View>

          <View style={styles.brandRow}>
            <Text style={styles.brandMain}>Event</Text>

            <Text style={styles.brandAccent}>ora</Text>
          </View>

          <Text style={styles.heroSubtitle}>
            Your next experience starts here
          </Text>

          <View style={styles.taglinePill}>
            <Ionicons name="sparkles" size={13} color={THEME.violet} />

            <Text style={styles.taglineText}>Discover · Book · Experience</Text>
          </View>
        </SafeAreaView>

        {/* Form */}
        <View style={styles.cardWrapper}>
          <View style={styles.card}>
            <Text style={styles.eyebrow}>WELCOME BACK</Text>

            <Text style={styles.title}>Sign in</Text>

            <Text style={styles.subtitle}>
              Access your bookings and discover upcoming events.
            </Text>

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
              placeholder="Enter your password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              error={errors.password}
            />

            <ErrorText>{serverError}</ErrorText>

            <PrimaryButton
              title="Sign In"
              onPress={onSubmit}
              loading={loading}
            />

            <TouchableOpacity
              onPress={() => navigation.navigate("Register")}
              style={styles.linkWrapper}
              activeOpacity={0.7}
            >
              <Text style={styles.linkText}>New to Eventora? </Text>

              <Text style={styles.linkBold}>Create account</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.trustRow}>
            <Ionicons
              name="shield-checkmark-outline"
              size={13}
              color={THEME.muted}
            />

            <Text style={styles.legalText}>
              Secure access to your Eventora account
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
    paddingTop: 38,
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
