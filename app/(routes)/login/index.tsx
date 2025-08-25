import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { CONFIG, ENDPOINTS } from "@/config";
import WelcomeHeader from "@/components/WelcomeHeader";
import { ActivityIndicator } from "react-native";
import AlertModal from "@/components/AlertModal";
import { IsIPAD } from "@/themes/app.constant";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { buildDevicePayload } from "@/utils/device";

export default function index() {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const [modal, setModal] = useState({
    visible: false,
    type: "success",
    title: "",
    title2: "",
  });

  const router = useRouter();
  const { expoPushToken } = usePushNotifications();

  const initialErrors = {
    user: false,
    password: false,
  };
  const [errors, setErrors] = useState<typeof initialErrors>(initialErrors);

  const generateDeviceToken = (length = 40) => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";
    let token = "";
    for (let i = 0; i < length; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  };

  const deviceToken = generateDeviceToken();

  const deviceType = Platform.OS === "android" ? "android" : "ios";

  const postData = {
    user_name: user,
    password: password,
    device_token: deviceToken,
    device_type: deviceType,
  };

  const handleSignIn = async () => {
    const newErrors = {
      user: !user?.trim(),
      password: !password?.trim(),
    };

    setErrors(newErrors);
    // If any field has an error, return early
    if (newErrors.user || newErrors.password) {
      return;
    }

    if (isSigningIn) return;
    setIsSigningIn(true);

    try {
      console.log(ENDPOINTS.LOGIN_USER);
      const response = await axios({
        method: "post",
        url: ENDPOINTS.LOGIN_USER,
        headers: CONFIG.headers,
        data: postData,
      });
      if (
        response.data.data.message === "Ok" &&
        response.data.data.access_token
      ) {
        await SecureStore.setItemAsync(
          "accessToken",
          response.data.data.access_token
        );
        // Store userId for notifications
        await SecureStore.setItemAsync(
          "userId",
          response.data.data.data.user_id.toString()
        );
        // Send Expo push token (from hook) + device metadata to backend if available
        try {
          if (expoPushToken?.data) {
            const payload = await buildDevicePayload({
              userId: response.data.data.data.user_id,
              pushToken: expoPushToken.data,
            });
            await axios.post(ENDPOINTS.SAVE_PUSH_TOKEN, payload, {
              headers: CONFIG.headers,
            });
          } else {
            console.log("Expo push token not available yet");
          }
        } catch (err) {
          console.log("Failed to save push token:", err);
        }
        router.push("/(tabs)");
      } else {
        setModal({
          visible: true,
          type: "error",
          title: "Login Failed!",
          title2: response.data.message || "Invalid credentials",
        });
      }
    } catch (error) {
      if (error instanceof Error) {
        console.log("AXIOS ERROR:", error.message);
      } else {
        console.log("Unknown error:", error);
      }

      setModal({
        visible: true,
        type: "error",
        title: "Login Failed!",
        title2: "Something went wrong. Try again later.",
      });
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={styles.container}>
        <WelcomeHeader />
        <Text style={styles.subtitle}>Log in to continue</Text>

        {/* Username Field */}
        <View style={styles.inputWrapper}>
          <Text style={styles.label}>User Name</Text>
          <View
            style={[
              styles.inputRow,
              errors.user && { borderColor: "red", borderWidth: 1 },
            ]}
          >
            <TextInput
              style={styles.input}
              placeholder="Enter User Name"
              placeholderTextColor="#999"
              value={user}
              onChangeText={(text) => {
                setUser(text);
                setErrors((prev) => ({
                  ...prev,
                  user: text.trim() === "", // true if empty, false if not
                }));
              }}
              autoCapitalize="none"
            />
            {!!user && <Ionicons name="checkmark" size={20} color="#0D1A56" />}
          </View>
        </View>

        {/* Password Field */}
        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Password</Text>
          <View
            style={[
              styles.inputRow,
              errors.password && { borderColor: "red", borderWidth: 1 },
            ]}
          >
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#999"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setErrors((prev) => ({
                  ...prev,
                  password: text.trim() === "",
                }));
              }}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? "eye" : "eye-off"}
                size={22}
                color="#0D1A56"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Sign In Button */}
        <TouchableOpacity
          style={[
            styles.signInBtn,
            isSigningIn && { backgroundColor: "#ccc" }, // optional visual feedback
          ]}
          onPress={handleSignIn}
          disabled={isSigningIn}
        >
          {isSigningIn ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.signInText}>Log In</Text>
          )}
        </TouchableOpacity>

        {/* Toast Message Container */}
        <AlertModal
          visible={modal.visible}
          type={modal.type}
          title={modal.title}
          title2={modal.title2}
          onClose={() => setModal((prev) => ({ ...prev, visible: false }))}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 100,
    paddingHorizontal: 24,
    backgroundColor: "#fff",
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontFamily: "Poppins_400Regular",
    color: "#0D1A56",
    textAlign: "center",
  },
  welcome: {
    fontSize: 28,
    fontFamily: "Poppins_400Regular",
    color: "#0D1A56",
    marginTop: 30,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
    color: "#7E8CA0",
    textAlign: "center",
    marginVertical: 10,
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
    borderColor: "#E0E6F3",
    borderRadius: 12,
    padding: IsIPAD ? 16 : 8,
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
  optionsRow: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  optionText: {
    color: "#0D1A56",
    fontSize: 14,
    fontFamily: "Poppins_300Light",
  },
  forgotText: {
    color: "#0D1A56",
    fontSize: 14,
    textDecorationLine: "underline",
    fontFamily: "Poppins_300Light",
  },
  signInBtn: {
    backgroundColor: "#0D1A56",
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 40,
  },
  signInText: {
    color: "#FFF",
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
  },
});
