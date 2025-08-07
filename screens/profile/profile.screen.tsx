import React from "react";
import {
  View,
  Text,
  Image,
  Button,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";
import WelcomeHeader from "@/components/WelcomeHeader";
import { MaterialIcons } from "@expo/vector-icons";

export default function ProfileScreen() {
  const router = useRouter();

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync("accessToken");
    router.replace("/(routes)/login");
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <WelcomeHeader />
      <View style={{ flex: 1, padding: 20, backgroundColor: "#fff" }}>
        <TouchableOpacity style={styles.importButton} onPress={handleLogout}>
          <MaterialIcons
            name="logout"
            size={24}
            color="#000"
            style={{ marginRight: 10 }}
          />
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  importButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#000",
    marginTop: 20,
  },
  buttonText: {
    color: "#000",
    fontSize: 18,
    fontFamily: "Poppins_400Regular",
  },
});
