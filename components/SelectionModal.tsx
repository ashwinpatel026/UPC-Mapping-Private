import React from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";

interface ModalItem {
  id?: string | number;
  name: string;
  [key: string]: any; // in case items have more fields
}

interface SelectionModalProps {
  visible: boolean;
  title: string;
  searchText: string;
  onChangeSearchText: (text: string) => void;
  data: ModalItem[];
  loading: boolean;
  onSelectItem: (item: ModalItem) => void;
  onClose: () => void;
}

const SelectionModal: React.FC<SelectionModalProps> = ({
  visible,
  title,
  searchText,
  onChangeSearchText,
  data,
  loading,
  onSelectItem,
  onClose,
}) => {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.brandModalBox}>
          <Text style={styles.modalTitle}>{title}</Text>
          <TextInput
            style={styles.searchInput}
            placeholder={`Search ${title.toLowerCase()}...`}
            value={searchText}
            onChangeText={onChangeSearchText}
          />

          {loading ? (
            <ActivityIndicator size="large" />
          ) : (
            <FlatList
              data={data}
              keyExtractor={(item) => item.id?.toString() ?? item.name}
              contentContainerStyle={{ paddingVertical: 10 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.brandItem}
                  onPress={() => onSelectItem(item)}
                >
                  <Text style={styles.brandText}>{item.name}</Text>
                </TouchableOpacity>
              )}
              numColumns={3}
              columnWrapperStyle={{ justifyContent: "space-between" }}
              initialNumToRender={20}
              maxToRenderPerBatch={30}
              windowSize={10}
            />
          )}

          <TouchableOpacity
            onPress={onClose}
            style={[
              styles.modalButton,
              { marginTop: 10, backgroundColor: "#ff5c75" },
            ]}
          >
            <Text style={{ color: "#FFF" }}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    backgroundColor: "#fff",
    flex: 1,
  },
  inputWrapper: {
    marginTop: 20,
  },
  label: {
    color: "#1A3F70",
    fontSize: 12,
    marginBottom: 4,
    fontFamily: "Poppins_700Bold",
  },
  inputRow: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#E0E6F3",
    borderRadius: 12,
    padding: 4,
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    fontSize: 12,
    color: "#0D1A56",
    marginRight: 10,
    fontFamily: "Poppins_400Regular",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    width: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
  closeButton: {
    marginTop: 20,
    alignSelf: "flex-end",
    backgroundColor: "#ff5c75",
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 6,
  },
  optionItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  optionText: {
    fontSize: 16,
  },
  addButton: {
    alignSelf: "flex-end",
    backgroundColor: "#003366",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontFamily: "Poppins_400Regular",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#003366",
  },
  headerText: {
    flex: 1,
    color: "#FFB400",
    padding: 8,
    fontSize: 12,
    fontFamily: "Poppins_700Bold",
  },
  cell: {
    flex: 1,
    padding: 8,
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
  },

  modalBox: {
    backgroundColor: "#fff",
    width: "85%",
    borderRadius: 10,
    padding: 20,
  },

  modalButton: {
    backgroundColor: "#003366",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
  },

  brandModalBox: {
    backgroundColor: "#fff",
    margin: 20,
    padding: 20,
    borderRadius: 12,
    maxHeight: "70%", // scrollable height
  },

  brandGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  brandItem: {
    width: "30%",
    paddingVertical: 5,
    paddingHorizontal: 5,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },

  brandText: {
    fontSize: 10,
    color: "#0D1A56",
    fontFamily: "Poppins_400Regular",
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
});

export default SelectionModal;
