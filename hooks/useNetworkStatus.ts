import { useEffect, useState } from "react";
import * as Network from "expo-network";

export const useNetworkStatus = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  const checkNetwork = async () => {
    try {
      const networkState = await Network.getNetworkStateAsync();

      const hasInternet =
        networkState.isConnected === true &&
        networkState.isInternetReachable === true;

      setIsConnected(hasInternet);
    } catch (error) {
      console.error("Network check failed:", error);
      setIsConnected(false); // fallback
    }
  };

  useEffect(() => {
    checkNetwork();
    const interval = setInterval(checkNetwork, 5000);
    return () => clearInterval(interval);
  }, []);

  return isConnected;
};
