import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Linking } from "react-native";
import { useGetNotificationsQuery } from "@/lib/apiSlice";

const operationTypes = ["all", "type1", "type2", "type3"];

type ItemType = {
  id: string;
  title: string;
  body: string;
  link: string;
  operation_type: string;
};

export default function NotificationsScreen() {
  const [filter, setFilter] = useState("all");
  const { data = [], isLoading } = useGetNotificationsQuery(
    filter === "all" ? undefined : filter
  );

  const renderItem = ({ item }: { item: ItemType }) => (
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
      {isLoading ? (
        <Text>Loading...</Text>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item, idx) => item.id?.toString() || idx.toString()}
          renderItem={renderItem}
          ListEmptyComponent={<Text>No notifications found.</Text>}
        />
      )}
    </View>
  );
}
