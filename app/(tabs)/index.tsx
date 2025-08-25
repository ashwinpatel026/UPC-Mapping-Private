import React from "react";
import { View, Text, Image } from "react-native";

export default function index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 24,
      }}
    >
      <Image
        source={require("../../assets/images/logo.png")}
        style={{
          width: 220,
          height: 220,
          marginBottom: 0,
          resizeMode: "contain",
        }}
      />
    </View>
  );
}
