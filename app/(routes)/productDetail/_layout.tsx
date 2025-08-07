import React from "react";
import { Stack } from "expo-router";

export default function _layout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Product Details",
          headerTitleStyle: {
            color: "#1A3F70",
            fontSize: 18,
            fontFamily: "Poppins_700Bold",
          },
          headerTitleAlign: "left",
          headerStyle: {
            backgroundColor: "#fff",
          },
          headerShadowVisible: true,
          headerBackVisible: true,
        }}
      />
    </Stack>
  );
}
