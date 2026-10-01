import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";

const THEME = {
  violet: "#7C3AED",
  background: "#F8FAFC",
};

export default function Loading() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={THEME.violet} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: THEME.background,
  },
});
