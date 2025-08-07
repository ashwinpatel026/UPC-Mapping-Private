import React, { useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { Redirect } from "expo-router";
import axios from "axios";
import { ENDPOINTS, CONFIG } from "@/config"; // adjust if path differs
import { ActivityIndicator, Text, View } from "react-native";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { Image } from "expo-image";

export default function Index() {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const isConnected = useNetworkStatus();

  useEffect(() => {
    const checkToken = async () => {
      const token = await SecureStore.getItemAsync("accessToken");
      const seenOnboarding = await SecureStore.getItemAsync(
        "hasSeenOnboarding"
      );

      if (seenOnboarding === "true") {
        setHasSeenOnboarding(true);
      }
      if (!token) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      try {
        // 🔒 Make a request to validate token
        const response = await axios.get(ENDPOINTS.VALIDATE_TOKEN, {
          headers: {
            ...CONFIG.headers,
            Authorization: `Bearer ${token}`,
          },
        });

        const isValid =
          response.data?.data?.valid === true || response.data?.valid === true;

        if (isValid) {
          setIsAuthenticated(true);
        } else {
          // Invalid token structure (valid: false, or missing data)
          await SecureStore.deleteItemAsync("accessToken");
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.log("Token check failed:", err);
        await SecureStore.deleteItemAsync("accessToken");
        setIsAuthenticated(false);
      }

      setLoading(false);
    };

    checkToken();
  }, []);

  if (isConnected === false) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff",
          padding: 16,
        }}
      >
        <Image
          source={require("../assets/images/no-network.png")} // make sure you have an icon here
          style={{
            width: 100,
            height: 100,
            marginBottom: 20,
            tintColor: "#999",
          }}
        />
        <Text
          style={{ fontSize: 18, color: "#444", fontFamily: "Poppins_700Bold" }}
        >
          Please connect to the internet
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  // 👇 Handle redirect logic
  if (!hasSeenOnboarding) {
    return <Redirect href="/(routes)/onboarding" />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(routes)/login" />;
  }

  return <Redirect href="/(tabs)" />;
}
