// src/navigation/AppNavigator.tsx
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import AuthStack from "./AuthStack";
import MainTabs from "./MainTabs";
import SplashScreen from "../screens/SplashScreen";

export default function AppNavigator() {
  const { token, initializing } = useAuth();

  // Show splash while restoring session from AsyncStorage
  if (initializing) return <SplashScreen />;

  return (
    <NavigationContainer>
      {token ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}
