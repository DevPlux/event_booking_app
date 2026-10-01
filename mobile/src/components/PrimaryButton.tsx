import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

type Props = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
};

const THEME = {
  violet: "#7C3AED",
  violetDark: "#5B21B6",
  white: "#FFFFFF",
  muted: "#94A3B8",
};

export default function PrimaryButton({
  title,
  onPress,
  loading = false,
  disabled = false,
}: Props) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[styles.button, isDisabled && styles.disabled]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator color={THEME.white} size="small" />
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: THEME.violet,

    minHeight: 50,

    paddingVertical: 14,
    paddingHorizontal: 20,

    borderRadius: 14,

    alignItems: "center",
    justifyContent: "center",

    marginTop: 12,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },

  disabled: {
    backgroundColor: THEME.muted,
    opacity: 0.7,
  },

  text: {
    color: THEME.white,
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 0.2,
  },
});
