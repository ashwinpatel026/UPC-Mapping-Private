import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Linking } from "react-native";
import axios from "axios";
import { ENDPOINTS } from "@/config";

const operationTypes = ["all", "type1", "type2", "type3"];

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        filter === "all"
          ? ENDPOINTS.GET_NOTIFICATIONS
          : `${ENDPOINTS.GET_NOTIFICATIONS}?operation_type=${filter}`
      );
      setNotifications(res.data.data || []);
    } catch (err) {
      setNotifications([]);
    }
    setLoading(false);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      className="bg-white rounded-lg p-4 mb-2 border border-gray-200"
      onPress={() => Linking.openURL(item.link)}
    >
      <Text className="font-bold text-lg mb-1">{item.title}</Text>
      <Text className="text-gray-700 mb-1">{item.body}</Text>
      <Text className="text-xs text-blue-500">{item.operation_type}</Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-50 p-4">
      <View className="flex-row mb-4">
        {operationTypes.map((type) => (
          <TouchableOpacity
            key={type}
            className={`px-3 py-1 mr-2 rounded-full ${
              filter === type ? "bg-blue-600" : "bg-gray-200"
            }`}
            onPress={() => setFilter(type)}
          >
            <Text className={filter === type ? "text-white" : "text-gray-800"}>
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item, idx) => item.id?.toString() || idx.toString()}
          renderItem={renderItem}
          ListEmptyComponent={<Text>No notifications found.</Text>}
        />
      )}
    </View>
  );
}
