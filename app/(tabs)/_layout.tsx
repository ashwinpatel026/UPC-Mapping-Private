import { Tabs, router } from "expo-router";
import React from "react";
import { Platform, View, Pressable, StyleSheet, Text } from "react-native";

import { useColorScheme } from "@/hooks/useColorScheme";
import { Octicons, Ionicons, Feather } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";
import { IsIPAD, IsAndroid } from "@/themes/app.constant";

import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";

const BackButton = () => {
  const navigation = useNavigation();
  const handlePress = () => {
    // @ts-ignore - navigation type
    if (navigation && navigation.canGoBack && navigation.canGoBack()) {
      // @ts-ignore
      navigation.goBack();
    } else {
      router.replace("/(tabs)");
    }
  };
  return (
    <Pressable
      onPress={handlePress}
      style={{ paddingHorizontal: 8, paddingVertical: 6 }}
    >
      <Ionicons name="chevron-back" size={22} color="#0F172A" />
    </Pressable>
  );
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false, tabBarStyle: { display: "none" } }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="mapping/index" options={{ title: "UPC Mapping" }} />
      <Tabs.Screen name="profile/index" options={{ title: "Profile" }} />
      <Tabs.Screen
        name="notifications/index"
        options={{
          title: "Notifications",
          headerShown: true,
          headerTitle: "Notifications",
          headerTitleAlign: "center",
          headerStyle: { backgroundColor: "#FFFFFF" },
          headerTitleStyle: {
            color: "#0F172A",
            fontSize: 18,
            fontWeight: "600",
            fontFamily: "Poppins_600SemiBold",
          },
          headerShadowVisible: true,
          headerLeftContainerStyle: { paddingLeft: 8 },
          headerLeft: () => <BackButton />,
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
    </Tabs>
  );
}

function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  const containerPadding = Math.max(insets.bottom, 10);

  const labelMap: Record<string, string> = {
    index: "Home",
    "mapping/index": "Mapping",
    "notifications/index": "Notification",
    "profile/index": "Profile",
  };

  return (
    <View
      style={{
        position: "absolute",
        left: 12,
        right: 12,
        bottom: containerPadding - 6,
        backgroundColor: "#1A3F70",
        borderRadius: moderateScale(18),
        height: moderateScale(70),
        shadowColor: "#1A3F70",
        shadowOpacity: 0.06,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
        paddingHorizontal: 8,
      }}
    >
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-around",
        }}
      >
        {state.routes.map((route: any, index: number) => {
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const color = isFocused ? "#FEB100" : "#FFFFFF";

          const icon = (() => {
            switch (route.name) {
              case "index":
                return (
                  <Feather name="home" size={moderateScale(22)} color={color} />
                );
              case "mapping/index":
                return (
                  <Ionicons
                    name="barcode-outline"
                    size={moderateScale(22)}
                    color={color}
                  />
                );
              case "notifications/index":
                return (
                  <Octicons
                    name="bell"
                    size={moderateScale(22)}
                    color={color}
                  />
                );
              case "profile/index":
                return (
                  <Feather name="user" size={moderateScale(22)} color={color} />
                );
              default:
                return null;
            }
          })();

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              onPress={onPress}
              style={{
                alignItems: "center",
                justifyContent: "center",
                paddingTop: 12,
                paddingHorizontal: 8,
              }}
            >
              <View style={{ height: 6, marginBottom: 6 }}>
                {isFocused ? (
                  <View
                    style={{
                      width: 22,
                      height: 6,
                      backgroundColor: "#FEB100",
                      borderTopLeftRadius: 6,
                      borderTopRightRadius: 6,
                    }}
                  />
                ) : null}
              </View>
              {icon}
              <Text style={{ fontSize: 12, marginTop: 6, color }}>
                {labelMap[route.name] || route.name}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
