import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { CameraView, useCameraPermissions } from "expo-camera";
import { X } from "lucide-react-native";
import * as Linking from "expo-linking";

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedCode, setScannedCode] = useState("");

  if (!permission?.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.text}>
          We need camera access to scan barcodes.
          {"\n"}Please enable it in system settings if already denied.
        </Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { marginTop: 10, backgroundColor: "#444" }]}
          onPress={() => Linking.openSettings()}
        >
          <Text style={styles.buttonText}>Open Settings</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        barcodeScannerSettings={{
          barcodeTypes: [
            "aztec",
            "ean13",
            "ean8",
            "qr",
            "pdf417",
            "upc_e",
            "datamatrix",
            "code39",
            "code93",
            "itf14",
            "codabar",
            "code128",
            "upc_a",
          ],
        }}
        onBarcodeScanned={(result) => {
          setScannedCode(result.data);
          router.push({
            pathname: "/(routes)/productDetail",
            params: { barcode: result.data },
          });
        }}
      >
        <View style={styles.overlay}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => router.back()}
          >
            <X color="#fff" size={24} />
          </TouchableOpacity>
          <View style={styles.scanArea} />
          <Text style={styles.instructions}>
            Position the barcode within the frame
          </Text>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    padding: 24,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 20,
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 1,
  },
  scanArea: {
    width: 350,
    height: 350,
    borderWidth: 2,
    borderColor: "#fff",
    backgroundColor: "transparent",
    alignSelf: "center",
    marginTop: "50%",
  },
  instructions: {
    color: "#fff",
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
  },
  text: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    fontFamily: "Inter_400Regular",
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 40,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
});
