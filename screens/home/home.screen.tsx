import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";
import WelcomeHeader from "@/components/WelcomeHeader";
import { Barcode } from "lucide-react-native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { IsIPAD } from "@/themes/app.constant";

export default function HomeScreen() {
  const [upc, setUpc] = useState("");
  const [error, setError] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setUpc("");
      setError(false);
    }, [])
  );
  const handleSearch = () => {
    if (!upc.trim()) {
      setError(true);
      return;
    }

    setError(false);
    router.push({
      pathname: "/(routes)/productDetail",
      params: { barcode: upc },
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={styles.container}>
        <WelcomeHeader />
        {/* search box */}
        <View style={styles.inputWrapper}>
          <View
            // style={[
            //   styles.inputRow,
            //   error && { borderColor: "red", borderWidth: 1 },
            // ]}
            style={{
              flexDirection: "row",
              borderWidth: 1,
              borderColor: error ? "red" : "#0D1A56",
              borderRadius: 12,
              padding: IsIPAD ? 18 : 8,
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: "#fff",
            }}
          >
            <TextInput
              style={{
                flex: 1,
                fontSize: 16,
                fontFamily: "Poppins_300Light",
                color: "#0D1A56",
                marginRight: 10,
              }}
              placeholder="Enter UPC #"
              placeholderTextColor="#999"
              value={upc}
              onChangeText={(text) => {
                setUpc(text);
                if (error) setError(false); // clear error as user types
              }}
            />
          </View>
          {error && (
            <Text style={{ color: "red", marginTop: 5 }}>
              Please enter a UPC number
            </Text>
          )}
        </View>

        {/* Search Button */}
        <View style={{ marginTop: 15 }}>
          <TouchableOpacity style={styles.importButton} onPress={handleSearch}>
            <MaterialIcons name="search" size={28} color="#fff" />
            <Text style={[styles.buttonText, { marginLeft: 8 }]}>Search</Text>
          </TouchableOpacity>
        </View>

        {/* Scan Barcode Button - Own Row */}
        <View style={{ marginTop: 10 }}>
          <TouchableOpacity
            style={styles.importButton}
            onPress={() => router.push("/(routes)/scanner")}
          >
            <Barcode size={28} color="#fff" />
            <Text style={[styles.buttonText, { marginLeft: 8 }]}>
              Scan Barcode
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
    paddingHorizontal: 24,
    backgroundColor: "#fff",
  },
  importButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: "#0D1A56",
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#000",
    marginTop: 20,
  },

  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "Poppins_400Regular",
  },
  inputWrapper: {
    marginTop: 20,
  },
  label: {
    color: "#7E8CA0",
    fontSize: 12,
    fontFamily: "Poppins_300Light",
    marginBottom: 4,
  },
  inputRow: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#0D1A56",
    borderRadius: 12,
    padding: 8,
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Poppins_300Light",
    color: "#0D1A56",
    marginRight: 10,
  },
});
