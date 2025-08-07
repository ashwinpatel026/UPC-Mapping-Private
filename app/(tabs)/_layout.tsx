import { Tabs } from "expo-router";
import React from "react";
import { Platform, View } from "react-native";

import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Octicons } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";
import { SafeAreaView } from "react-native-safe-area-context";
import { IsIPAD } from "@/themes/app.constant";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#FFF",
          headerShown: false,
          // tabBarButton: HapticTab,
          tabBarBackground: () => (
            <View
              style={{
                flex: 1,
                backgroundColor: "#0D1A56", // Tab background for iPad
              }}
            />
          ),
          tabBarStyle: Platform.select({
            ios: {
              // Use a transparent background on iOS to show the blur effect
              position: "absolute",
            },
            default: {},
          }),
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size }) => (
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  flex: 1,
                }}
              >
                <IconSymbol size={28} name="house.fill" color={color} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="profile/index"
          options={{
            title: "Profile",
            tabBarIcon: ({ color }) => (
              <Octicons size={28} name="person" color={color} />
            ),
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}
