import React from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
} from "react-native";

import ErrorText from "./ErrorText";

type Props = TextInputProps & {
  label?: string;
  error?: string;
};

const THEME = {
  white: "#FFFFFF",
  text: "#111827",
  muted: "#64748B",
  border: "#E2E8F0",
  violet: "#7C3AED",
  lavenderSoft: "#F5F3FF",
  red: "#DC2626",
};

export default function InputField({
  label,
  error,
  multiline,
  ...props
}: Props) {
  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <TextInput
        style={[
          styles.input,
          multiline && styles.multilineInput,
          error ? styles.inputError : null,
        ]}
        placeholderTextColor={THEME.muted}
        multiline={multiline}
        {...props}
      />

      <ErrorText>{error}</ErrorText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 14,
  },

  label: {
    fontSize: 14,
    color: THEME.text,
    marginBottom: 7,
    fontWeight: "700",
  },

  input: {
    minHeight: 48,

    borderWidth: 1,
    borderColor: THEME.border,

    borderRadius: 12,

    paddingHorizontal: 13,
    paddingVertical: 11,

    fontSize: 14,
    color: THEME.text,

    backgroundColor: THEME.white,

    fontWeight: "500",
  },

  multilineInput: {
    minHeight: 100,
    textAlignVertical: "top",
    paddingTop: 12,
  },

  inputError: {
    borderColor: THEME.red,
    backgroundColor: "#FFFDFD",
  },
});
