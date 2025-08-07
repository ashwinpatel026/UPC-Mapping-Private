import React, { useEffect } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";

type AlertType = "success" | "error" | string;

interface AlertModalProps {
  visible: boolean;
  type: AlertType;
  title: string;
  title2?: string;
  onClose: () => void;
}

export default function AlertModal({
  visible,
  type,
  title,
  title2,
  onClose,
}: AlertModalProps) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, {
        duration: 300,
        easing: Easing.out(Easing.ease),
      });
      scale.value = withTiming(1, {
        duration: 300,
        easing: Easing.out(Easing.ease),
      });

      const timer = setTimeout(() => {
        opacity.value = withTiming(0, { duration: 200 });
        scale.value = withTiming(0.9, { duration: 200 });
        setTimeout(onClose, 200);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const iconColor = type === "success" ? "#4BB543" : "#FF4D4D";
  const iconName = type === "success" ? "check-circle" : "x-circle";

  return (
    <Modal transparent visible={visible} animationType="none">
      <TouchableWithoutFeedback>
        <View style={styles.overlay}>
          <Animated.View style={[styles.container, animatedStyle]}>
            <Feather name={iconName as any} size={48} color={iconColor} />
            <Text style={styles.title}>{title}</Text>
            {title2 && <Text style={styles.subtitle}>{title2}</Text>}
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    width: "80%",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 12,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 6,
    textAlign: "center",
  },
});
