import React, { useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
} from "react-native";

const { width } = Dimensions.get("window");

type SuccessModalProps = {
  visible: boolean;
  onClose: () => void;
};

const SuccessModal: React.FC<SuccessModalProps> = ({ visible, onClose }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Auto-close after 1.5s
      const timeout = setTimeout(() => {
        onClose();
      }, 1500);

      return () => clearTimeout(timeout);
    }
  }, [visible]);

  return (
    <Modal
      transparent
      animationType="none"
      visible={visible}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
          <Image
            source={require("../assets/images/check.png")} // Make sure this icon exists
            style={styles.icon}
            resizeMode="contain"
          />
          <Text style={styles.title}>Success</Text>
          <Text style={styles.message}>Product saved successfully.</Text>
        </Animated.View>
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
  container: {
    width: width * 0.8,
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  icon: {
    width: 50,
    height: 50,
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2e7d32",
    marginBottom: 5,
  },
  message: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
  },
});

export default SuccessModal;
