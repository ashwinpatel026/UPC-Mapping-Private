import React from "react";
import { Stack } from "expo-router";
import { Platform, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";

export default function RoutesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitleAlign: "center",
        headerStyle: { backgroundColor: "#FFFFFF" },
        headerTitleStyle: {
          color: "#0F172A",
          fontSize: 18,
          fontWeight: "600",
          fontFamily: "Poppins_600SemiBold",
        },
        headerShadowVisible: true,
        headerBackVisible: true,
        headerBackground: () => (
          <BlurView
            intensity={80}
            style={{
              ...StyleSheet.absoluteFillObject,
              backgroundColor:
                Platform.OS === "android" ? "#FFFFFF" : "transparent",
            }}
          />
        ),
      }}
    />
  );
}
