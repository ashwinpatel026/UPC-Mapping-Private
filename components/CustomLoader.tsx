import React from "react";
import { View, ActivityIndicator, StyleSheet, Modal } from "react-native";

const CustomLoader = ({ visible = false }: { visible: boolean }) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  loaderContainer: {
    padding: 20,
    backgroundColor: "#333",
    borderRadius: 10,
  },
});

export default CustomLoader;
