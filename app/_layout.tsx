import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";

import "react-native-reanimated";
import Toast from "react-native-toast-message";
import { ToastConfig } from "../components/ToastConfig";

import { useColorScheme } from "@/hooks/useColorScheme";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  Poppins_600SemiBold,
  Poppins_300Light,
  Poppins_400Regular,
  Poppins_700Bold,
  Poppins_500Medium,
} from "@expo-google-fonts/poppins";
import { Provider } from "react-redux";
import { store } from "@/lib/store";
import { useEffect } from "react";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useSavePushTokenMutation } from "@/lib/apiSlice";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootContent() {
  const colorScheme = useColorScheme();

  // Register for push notifications and upload token when available
  const { expoPushToken } = usePushNotifications();
  const [savePushToken] = useSavePushTokenMutation();

  useEffect(() => {
    if (expoPushToken?.data) {
      const tokenString =
        typeof expoPushToken.data === "string"
          ? expoPushToken.data
          : "" + expoPushToken.data;
      savePushToken({ token: tokenString }).catch(() => {});
    }
  }, [expoPushToken?.data]);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
      </Stack>
      <StatusBar style="auto" />
      <Toast config={ToastConfig} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    Poppins_600SemiBold,
    Poppins_300Light,
    Poppins_700Bold,
    Poppins_400Regular,
    Poppins_500Medium,
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <RootContent />
      </Provider>
    </SafeAreaProvider>
  );
}
