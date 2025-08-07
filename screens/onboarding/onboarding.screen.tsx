import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";

const { width, height } = Dimensions.get("window");

export default function OnboardingScreen() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/images/logo.png")} // Replace with your logo path
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Welcome Message */}
      <Text style={styles.welcomeText}>Welcome to Our App!</Text>

      {/* Get Started Button */}
      <TouchableOpacity
        style={styles.getStartedBtn}
        onPress={async () => {
          await SecureStore.setItemAsync("hasSeenOnboarding", "true");
          router.push("/login" as any);
        }}
      >
        <Text style={styles.getStartedText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  logo: {
    width: width * 0.5,
    height: width * 0.5,
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 22,
    fontFamily: "Poppins_400Regular",
    color: "#1A3F70",
    textAlign: "center",
    marginBottom: 20,
  },
  getStartedBtn: {
    backgroundColor: "#1A3F70",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  getStartedText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
  },
});
