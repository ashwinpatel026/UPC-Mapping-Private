import React from "react";
import { Stack } from "expo-router";

export default function _layout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Scan Barcode",
          headerTitleStyle: {
            color: "#000",
            fontSize: 22,
          },
          headerTitleAlign: "center",
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
