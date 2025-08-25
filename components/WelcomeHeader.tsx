import { StatusBar, StyleSheet, View } from "react-native";
import React from "react";
import { scale, verticalScale } from "react-native-size-matters";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WelcomeHeader() {
  return (
    <SafeAreaView edges={["top"]} style={styles.safeTop}>
      <StatusBar barStyle={"dark-content"} backgroundColor="#fff" />
      <View style={styles.logoWrapper}>
        <Image
          source={require("../assets/images/logo.png")}
          style={styles.logo}
          contentFit="contain"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeTop: { backgroundColor: "#fff" },
  logoWrapper: {
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: verticalScale(24),
  },
  logo: {
    width: scale(148),
    height: verticalScale(140),
  },
});
