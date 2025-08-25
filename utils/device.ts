import * as SecureStore from "expo-secure-store";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";

const DEVICE_ID_KEY = "device_id";

export async function getStableDeviceId(): Promise<string> {
  let id = await SecureStore.getItemAsync(DEVICE_ID_KEY);
  if (!id) {
    // Simple random ID persisted for this install
    id = `${Date.now().toString(36)}-${Math.random()
      .toString(36)
      .slice(2)}-${Math.random().toString(36).slice(2)}`;
    await SecureStore.setItemAsync(DEVICE_ID_KEY, id);
  }
  return id;
}

export async function buildDevicePayload(params: {
  userId: string | number;
  pushToken: string;
}) {
  const deviceId = await getStableDeviceId();
  return {
    userId: String(params.userId),
    deviceId,
    pushToken: params.pushToken,
    platform: Platform.OS,
    osVersion: Device.osVersion ?? "",
    appVersion: (Constants.expoConfig?.version as string) || "",
    deviceModel: Device.modelName ?? "",
    manufacturer: Device.manufacturer ?? "",
    isPhysical: !!Device.isDevice,
  };
}


