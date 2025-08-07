import { StatusBar, StyleSheet, View } from "react-native";
import React from "react";
import { scale, verticalScale } from "react-native-size-matters";
import { Image } from "expo-image";

export default function WelcomeHeader() {
  return (
    <>
      <StatusBar barStyle={"dark-content"} backgroundColor="#fff" />
      <View style={styles.logoWrapper}>
        <Image
          source={require("../assets/images/logo.png")}
          style={styles.logo}
          contentFit="contain"
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  logoWrapper: {
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: verticalScale(22),
  },
  logo: {
    width: scale(148),
    height: verticalScale(140),
  },
});
