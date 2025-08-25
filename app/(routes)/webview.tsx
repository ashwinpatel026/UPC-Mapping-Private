import React, { useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { WebView } from "react-native-webview";

export const options = ({ route }: { route: any }) => ({
  title: route?.params?.title || "Browser",
  headerBackTitleVisible: false,
});

export default function InAppWebViewScreen() {
  const { url, title } = useLocalSearchParams<{
    url?: string;
    title?: string;
  }>();

  const finalUrl = useMemo(() => {
    if (!url) return undefined;
    const hasScheme = /^(https?:)?\/\//i.test(url);
    return hasScheme ? url : `https://${url}`;
  }, [url]);

  return (
    <SafeAreaView style={styles.safe} edges={["left", "right", "bottom"]}>
      {finalUrl ? (
        <WebView
          style={styles.webview}
          source={{ uri: finalUrl }}
          originWhitelist={["*"]}
          startInLoadingState
          renderLoading={() => (
            <View style={styles.loaderWrap}>
              <ActivityIndicator size="large" color="#2563EB" />
            </View>
          )}
        />
      ) : (
        <View style={styles.loaderWrap}>
          <Text style={styles.errorText}>Invalid URL</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  webview: { flex: 1 },
  loaderWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  errorText: { color: "#EF4444" },
});
