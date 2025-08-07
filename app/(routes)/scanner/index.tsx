import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { Redirect } from "expo-router";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { ENDPOINTS, CONFIG } from "@/config";
import ScannerScreen from "@/screens/scanner/scanner.screen";

export default function index() {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      const token = await SecureStore.getItemAsync("accessToken");

      if (!token) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(ENDPOINTS.VALIDATE_TOKEN, {
          headers: {
            ...CONFIG.headers,
            Authorization: `Bearer ${token}`,
          },
        });

        const isValid =
          response.data?.data?.valid === true || response.data?.valid === true;

        setIsAuthenticated(isValid);
        if (!isValid) await SecureStore.deleteItemAsync("accessToken");
      } catch (error) {
        await SecureStore.deleteItemAsync("accessToken");
        setIsAuthenticated(false);
      }

      setLoading(false);
    };

    checkToken();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(routes)/login" />;
  }
  return <ScannerScreen />;
}
