import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Pressable,
  Modal,
} from "react-native";
import {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useGetUnreadCountQuery,
} from "@/lib/apiSlice";
import { useLocalSearchParams, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { getStableDeviceId } from "@/utils/device";
import * as SecureStore from "expo-secure-store";
import { useFocusEffect } from "@react-navigation/native";

const operationTypes = ["all", "orders", "offers", "system"] as const;
type OperationType = (typeof operationTypes)[number];
const operationTypeLabels: Record<(typeof operationTypes)[number], string> = {
  all: "All",
  orders: "Orders",
  offers: "Offers",
  system: "System",
};

type ItemType = {
  notifications_id: string;
  title: string;
  body: string;
  link: string;
  operation_type: string;
  created_at?: string;
  createdAt?: string;
  date?: string;
  read_at?: string | null;
  readAt?: string | null;
  read_device_id?: string | null;
};

export default function NotificationsScreen() {
  const { type } = useLocalSearchParams<{ type?: string }>();
  const initialType: OperationType = useMemo(() => {
    const t = typeof type === "string" ? type : "all";
    return (operationTypes as readonly string[]).includes(t)
      ? (t as OperationType)
      : "all";
  }, [type]);

  const [filter, setFilter] = useState<OperationType>(initialType);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [pendingType, setPendingType] = useState<OperationType>(initialType);
  const [userId, setUserId] = useState<string | null>(null);

  const [markRead] = useMarkNotificationReadMutation();

  // Get userId from SecureStore
  useEffect(() => {
    const getUserId = async () => {
      const storedUserId = await SecureStore.getItemAsync("userId");
      setUserId(storedUserId);
    };
    getUserId();
  }, []);

  // Get unread count
  const { data: unreadData } = useGetUnreadCountQuery(
    { userId: userId || "1" }, // Use stored userId or fallback
    {
      pollingInterval: 30000, // Refresh every 30 seconds
      skip: !userId, // Skip query if userId is not available
    }
  );

  const unreadCount = unreadData?.count || 0;

  // Test useEffect to verify the mutation hook
  useEffect(() => {
    // Testing markRead mutation
  }, [markRead]);

  const {
    data = [],
    isLoading,
    isFetching,
    refetch,
  } = useGetNotificationsQuery(filter === "all" ? undefined : filter);

  // Refresh notifications when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Update filter when coming from a push tap with a new type
  useEffect(() => {
    setFilter((prev) => {
      const nextStr = typeof type === "string" ? type : prev;
      return (operationTypes as readonly string[]).includes(nextStr)
        ? (nextStr as OperationType)
        : prev;
    });
  }, [type]);

  // Function to invalidate cache after marking as read
  const invalidateCache = () => {
    // Refresh notifications list
    refetch();
    // Refresh unread count
    // The unread count will automatically refresh due to polling
  };

  // Unread toggle and helpers
  const [unreadOnly] = useState(false);

  const getItemDate = (item: ItemType): Date | null => {
    const raw = item.created_at || item.createdAt || item.date;
    if (!raw) return null;
    const d = new Date(raw);
    return isNaN(d.getTime()) ? null : d;
  };

  const isItemRead = (item: ItemType): boolean => {
    const v = item.read_at ?? item.readAt;

    // Handle cases where read_at might be "0", "0000-00-00 00:00:00", or similar "empty" values
    if (
      !v ||
      v === "0" ||
      v === "0000-00-00 00:00:00" ||
      v === "null" ||
      v === "undefined"
    ) {
      return false;
    }

    // Check if it's a valid date string
    const date = new Date(v);
    if (isNaN(date.getTime())) {
      return false;
    }

    // If it's a valid date, consider it read
    return true;
  };

  const filtered = useMemo(() => {
    const list: ItemType[] = Array.isArray(data) ? data : [];
    const byType =
      filter === "all" ? list : list.filter((i) => i.operation_type === filter);
    const byRead = unreadOnly ? byType.filter((i) => !isItemRead(i)) : byType;
    return byRead;
  }, [data, filter, unreadOnly]);

  const startOfDayKey = (d: Date) =>
    `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  const formatSectionTitle = (d: Date) => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (sameDay(d, today)) return "Today";
    if (sameDay(d, yesterday)) return "Yesterday";
    return d.toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  const sections = useMemo(() => {
    const groups = new Map<
      string,
      { title: string; data: ItemType[]; order: number }
    >();
    const now = Date.now();
    filtered.forEach((item) => {
      const dt = getItemDate(item) || new Date(now);
      const key = startOfDayKey(dt);
      if (!groups.has(key)) {
        groups.set(key, {
          title: formatSectionTitle(dt),
          data: [],
          order: dt.getTime(),
        });
      }
      groups.get(key)!.data.push(item);
    });
    return Array.from(groups.values()).sort((a, b) => b.order - a.order);
  }, [filtered]);

  const handleNotificationPress = async (item: ItemType) => {
    if (!item?.link) return;

    try {
      if (!isItemRead(item)) {
        const deviceId = await getStableDeviceId();
        // Use stored userId instead of getting it again

        if (userId && deviceId) {
          const params = {
            id: item.notifications_id,
            userId,
            deviceId,
          };

          const result = await markRead(params).unwrap();
          invalidateCache(); // Invalidate cache after successful markRead
        }
      }

      // Open webview
      router.push({
        pathname: "/(routes)/webview",
        params: { url: item.link, title: item.title },
      });
    } catch (error) {
      // Still open webview even if marking read fails
      router.push({
        pathname: "/(routes)/webview",
        params: { url: item.link, title: item.title },
      });
    }
  };

  const renderItem = ({ item }: { item: ItemType }) => {
    const read = isItemRead(item);
    const dt = getItemDate(item);
    const timeLabel = dt
      ? dt.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
      : "";
    return (
      <TouchableOpacity
        style={[styles.card, !read && styles.cardUnread]}
        activeOpacity={0.8}
        onPress={() => handleNotificationPress(item)}
      >
        <View style={styles.itemRow}>
          <View style={[styles.iconWrap, !read && styles.iconWrapUnread]}>
            <Ionicons
              name={read ? "notifications-outline" : "notifications"}
              size={18}
              color={read ? "#64748B" : "#0D1A56"}
            />
          </View>
          <View style={styles.itemContent}>
            <Text
              style={[styles.itemTitle, !read && styles.itemTitleUnread]}
              numberOfLines={2}
            >
              {item.title}
            </Text>
            <Text style={styles.itemBody} numberOfLines={2}>
              {item.body}
            </Text>
          </View>
          <View style={styles.metaWrap}>
            {!read ? <Text style={styles.badgeUnread}>New</Text> : null}
            <Text style={styles.timeText}>{timeLabel}</Text>
            <Ionicons name="chevron-forward" size={16} color="#A5B4FC" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const FilterModal = () => (
    <Modal visible={filterModalVisible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Filter notifications</Text>
          <View style={styles.modalOptions}>
            {operationTypes.map((t) => {
              const selected = pendingType === t;
              return (
                <Pressable
                  key={t}
                  onPress={() => setPendingType(t)}
                  style={[styles.optionRow, selected && styles.optionRowActive]}
                >
                  <View
                    style={[styles.radio, selected && styles.radioActive]}
                  />
                  <Text
                    style={[
                      styles.optionText,
                      selected && styles.optionTextActive,
                    ]}
                  >
                    {operationTypeLabels[t]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.cancelBtn]}
              onPress={() => setFilterModalVisible(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.selectBtn]}
              onPress={() => {
                setFilter(pendingType);
                setFilterModalVisible(false);
              }}
            >
              <Text style={styles.selectText}>Select</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.safe} edges={["left", "right"]}>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <Pressable
            onPress={() => {
              setPendingType(filter);
              setFilterModalVisible(true);
            }}
            style={styles.filterIconBtn}
          >
            <Ionicons name="options-outline" size={20} color="#0F172A" />
            {unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </Pressable>
        </View>
        <FilterModal />
        <SectionList
          sections={sections}
          keyExtractor={(item, idx) =>
            item.notifications_id?.toString() || idx.toString()
          }
          renderItem={renderItem}
          renderSectionHeader={({ section }) => (
            <Text style={styles.sectionTitle}>{section.title}</Text>
          )}
          ListHeaderComponent={undefined}
          ListEmptyComponent={
            !isLoading ? (
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyText}>No notifications found</Text>
                <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh}>
                  <Text style={styles.refreshBtnText}>Refresh</Text>
                </TouchableOpacity>
              </View>
            ) : null
          }
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled={false}
          showsVerticalScrollIndicator={true}
          refreshControl={
            <RefreshControl refreshing={!!isFetching} onRefresh={onRefresh} />
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 0,
    paddingTop: 8,
  },
  filtersContainer: { backgroundColor: "transparent" },
  filtersStrip: { marginBottom: 12 },
  filtersStripContent: { paddingRight: 8 },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#E6ECFF",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#C3D0FF",
  },
  pillActive: { backgroundColor: "#0D1A56", borderColor: "#0D1A56" },
  pillText: { color: "#0D1A56", fontWeight: "600" },
  pillTextActive: { color: "#FFFFFF", fontWeight: "700" },
  sectionTitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E9ECF5",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  cardUnread: { borderColor: "#A5B4FC", backgroundColor: "#F5F7FF" },
  itemRow: { flexDirection: "row", alignItems: "flex-start" },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#E0E7FF",
  },
  iconWrapUnread: { backgroundColor: "#E0E7FF", borderColor: "#C7D2FE" },
  itemContent: { flex: 1 },
  itemTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
  },
  itemTitleUnread: { color: "#0B1220" },
  itemBody: { color: "#475569" },
  metaWrap: { alignItems: "flex-end", marginLeft: 8 },
  badgeUnread: {
    backgroundColor: "#0D1A56",
    color: "#FFFFFF",
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    marginBottom: 6,
    overflow: "hidden",
  },
  timeText: { color: "#64748B", fontSize: 12 },
  emptyWrap: { alignItems: "center", paddingVertical: 64 },
  emptyText: { color: "#64748B", marginBottom: 8 },
  refreshBtn: {
    backgroundColor: "#0D1A56",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  refreshBtnText: { color: "#FFFFFF", fontWeight: "700" },
  listContent: {
    paddingBottom: 100, // Increased padding to account for tab bar
    paddingTop: 8,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 12,
  },
  modalOptions: { marginBottom: 12 },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 6,
    backgroundColor: "#F8FAFF",
    borderWidth: 1,
    borderColor: "#E6ECFF",
  },
  optionRowActive: {
    backgroundColor: "#EEF4FF",
    borderColor: "#C7D2FE",
  },
  radio: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#94A3B8",
    marginRight: 10,
    backgroundColor: "#FFFFFF",
  },
  radioActive: {
    borderColor: "#0D1A56",
    backgroundColor: "#0D1A56",
  },
  optionText: { color: "#0F172A", fontSize: 14, fontWeight: "500" },
  optionTextActive: { color: "#0B1220" },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 4,
  },
  actionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    marginLeft: 8,
  },
  cancelBtn: { backgroundColor: "#E6ECFF" },
  selectBtn: { backgroundColor: "#0D1A56" },
  cancelText: { color: "#0D1A56", fontWeight: "700" },
  selectText: { color: "#FFFFFF", fontWeight: "700" },
  topBar: {
    alignItems: "flex-end",
    marginBottom: 8,
  },
  filterIconBtn: {
    backgroundColor: "#EEF2FF",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#E0E7FF",
  },
  unreadBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#FF6B6B",
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },
  unreadBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
});
