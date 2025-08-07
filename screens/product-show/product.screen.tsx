import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Alert, FlatList, Keyboard, Modal, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import CustomLoader from "@/components/CustomLoader";
import {
  useGetBrandsQuery,
  useGetDepartmentsQuery,
  useGetProductTypesQuery,
  useGetSizesQuery,
  useGetFirstCategoryQuery,
  useGetSearchDescriptionQuery,
} from "@/lib/apiSlice";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { ENDPOINTS } from "@/config";
import Toast from "react-native-toast-message";
import SuccessModal from "@/components/SuccessModal";
import { IsIPAD } from "@/themes/app.constant";
import AlertModal from "@/components/AlertModal";

type ProductProps = {
  barcode: string;
  product_type: string;
  department: string;
  FirstCategory: string;
  product_description: string;
  size: string;
  brand: string;
  productcode?: string;
  packaging_material?: string;
  product_type_id?: string;
  department_id?: string;
};

type PackItem = {
  id: string;
  size: string;
  retail: string;
  is_deleted: boolean;
  store_pack_id?: string;
  pack_code?: string;
};

export default function ProductShowScreen() {
  const params = useLocalSearchParams();

  const navigation = useNavigation();

  const packSizeInputRef = useRef<TextInput>(null);
  const [Loader, setLoader] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [showPackModal, setShowPackModal] = useState(false);
  const [showProductTypeModal, setShowProductTypeModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const [packSize, setPackSize] = useState("");
  const [retailPrice, setRetailPrice] = useState("");
  const [packSizeError, setPackSizeError] = useState(false);
  const [retailPriceError, setRetailPriceError] = useState(false);
  const [editPackId, setEditPackId] = useState("");
  const [brandSearchText, setBrandSearchText] = useState("");
  const [searchDeptText, setSearchDeptText] = useState("");
  const [searchSizeText, setSearchSizeText] = useState("");
  const [searchProductTypeText, setSearchProductTypeText] = useState("");
  const [searchCategoryText, setSearchCategoryText] = useState("");

  const [modal, setModal] = useState({
    visible: false,
    type: "success",
    title: "",
    title2: "",
  });

  const [filteredDescriptions, setFilteredDescriptions] = useState<
    { ProductType: string; productdescription: string }[]
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const initialErrors = {
    product_type: false,
    department: false,
    FirstCategory: false,
    product_description: false,
    brand: false,
    size: false,
  };
  const [errors, setErrors] = useState<typeof initialErrors>(initialErrors);

  const barcode = Array.isArray(params.barcode)
    ? params.barcode[0]
    : params.barcode ?? "";

  const [productDetails, setProductDetails] = useState<ProductProps>({
    barcode: barcode,
    product_type: "",
    department: "",
    FirstCategory: "",
    product_description: "",
    brand: "",
    size: "",
    productcode: "",
    packaging_material: "",
    product_type_id: "",
    department_id: "",
  });
  const [packList, setPackList] = useState<PackItem[]>([]);

  useEffect(() => {
    if (barcode) {
      fetchProductByUPC(barcode);
    }
  }, [barcode]);

  const {
    data: brands = [],
    isLoading: loadingBrands,
    error: errorBrands,
  } = useGetBrandsQuery();

  const {
    data: sizes = [],
    isLoading: loadingSizes,
    error: errorSizes,
  } = useGetSizesQuery();

  const {
    data: departments = [],
    isLoading: loadingDepartments,
    error: errorDepartments,
  } = useGetDepartmentsQuery();

  const {
    data: productTypes = [],
    isLoading: loadingProductTypes,
    error: errorProductTypes,
  } = useGetProductTypesQuery();

  const {
    data: firstCategory = [],
    isLoading: loadingFirstCategory,
    error: errorFirstCategory,
  } = useGetFirstCategoryQuery();

  const {
    data: searchDescription = [],
    isLoading: loadingSearchDescription,
    error: errorSearchDescription,
  } = useGetSearchDescriptionQuery();

  const loading =
    loadingBrands ||
    loadingSizes ||
    loadingDepartments ||
    loadingProductTypes ||
    loadingFirstCategory ||
    loadingSearchDescription;

  const fetchProductByUPC = async (upc: string) => {
    setLoader(true);
    try {
      const token = (await SecureStore.getItemAsync("accessToken"))?.trim();
      const response = await fetch(
        `${ENDPOINTS.BACKEND_URL}/backoffice/product/find_product`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ upc }),
        }
      );

      const resJson = await response.json();

      if (!response.ok) {
        console.log("Error Find Product:");
        setLoader(false);
        clearProductStates();
        return;
      }

      const data = resJson?.data;

      if (Array.isArray(data) && data.length > 0) {
        const base = data[0];

        const matchedProductType = productTypes.find(
          (pt) =>
            pt.name.trim().toLowerCase() ===
            base.product_type?.trim().toLowerCase()
        );

        const matchedDepartment = departments.find(
          (d) =>
            d.name.trim().toLowerCase() ===
            base.Department?.trim().toLowerCase()
        );
        // Set productDetails
        setProductDetails({
          barcode: barcode,
          product_type: base.product_type,
          department: base.Department,
          FirstCategory: base.FirstCategory,
          product_description: base.productdescription,
          brand: base.brand,
          size: base.product_size,
          productcode: base?.product_code,
          packaging_material: base?.packaging_material,
          product_type_id: matchedProductType?.id ?? "",
          department_id: matchedDepartment?.id ?? "",
        });

        // Set packList
        const packs: PackItem[] = data.map((item, index) => ({
          id: `${Date.now()}-${index}`,
          size: item.pack_size,
          retail: item.price,
          is_deleted: item.is_delete === "0" ? false : true,
          store_pack_id: item.store_pack_id ?? "",
          pack_code: item.pack_code ?? "",
        }));

        setPackList(packs);
        setLoader(false);
      }
    } catch (error: any) {
      console.error("Error finding product:", error);
      clearProductStates();
    }
  };

  const clearProductStates = () => {
    setProductDetails({
      barcode: barcode,
      product_type: "",
      department: "",
      FirstCategory: "",
      product_description: "",
      brand: "",
      size: "",
      productcode: "",
      packaging_material: "",
      product_type_id: "",
      department_id: "",
    });

    setPackList([]);
  };

  const handleAddPack = () => {
    let valid = true;

    const trimmedSize = packSize.trim();
    const trimmedPrice = retailPrice.trim();

    if (!trimmedSize) {
      setPackSizeError(true);
      valid = false;
    } else {
      setPackSizeError(false);
    }

    if (!trimmedPrice) {
      setRetailPriceError(true);
      valid = false;
    } else {
      setRetailPriceError(false);
    }

    if (!valid) return;

    const formattedPrice = parseFloat(trimmedPrice).toFixed(2);
    const formattedSize = `${parseInt(trimmedSize)} PK`;

    if (editPackId) {
      // ✅ Edit mode
      setPackList((prevList) =>
        prevList.map((item) =>
          item.id === editPackId
            ? { ...item, size: formattedSize, retail: formattedPrice }
            : item
        )
      );
    } else {
      // ✅ Check for deleted pack with same size
      const existingIndex = packList.findIndex(
        (item) => item.size === formattedSize
      );

      if (existingIndex !== -1) {
        const existing = packList[existingIndex];

        if (existing.is_deleted) {
          // ✅ Restore deleted pack
          setPackList((prevList) => {
            const updated = [...prevList];
            updated[existingIndex] = {
              ...existing,
              retail: formattedPrice,
              is_deleted: false,
            };
            return updated;
          });
        } else {
          // Optional: show a warning that this size already exists
          Alert.alert("Duplicate", "Pack size already exists.");
          return;
        }
      } else {
        // ✅ Add new pack
        const newPack: PackItem = {
          id: Date.now().toString(),
          size: formattedSize,
          retail: formattedPrice,
          is_deleted: false,
          store_pack_id: "0",
        };
        setPackList((prevList) => [...prevList, newPack]);
      }
    }

    setPackSize("");
    setRetailPrice("");
    setEditPackId("");
    setPackSizeError(false);
    setRetailPriceError(false);
    setShowPackModal(false);
  };

  const editPack = (pack: PackItem) => {
    const numericSize = pack.size.replace(" PK", ""); // remove the ' PK' part
    const numericPrice = pack.retail.replace("$", ""); // optional: remove '$' if needed

    setPackSize(numericSize);
    setRetailPrice(numericPrice);
    setEditPackId(pack.id);
    setShowPackModal(true);
  };

  const removePack = (id: string) => {
    Alert.alert("Remove Pack", "Are you sure you want to remove this pack?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () =>
          setPackList((prev) =>
            prev.map((pack) =>
              pack.id === id ? { ...pack, is_deleted: true } : pack
            )
          ),
      },
    ]);
  };

  const filteredProductTypes = useMemo(() => {
    if (!searchProductTypeText.trim()) return productTypes;
    return productTypes.filter((proType) =>
      proType.name.toLowerCase().includes(searchProductTypeText.toLowerCase())
    );
  }, [searchProductTypeText, productTypes]);

  const filteredBrands = useMemo(() => {
    if (!brandSearchText.trim()) return brands;
    return brands.filter((brand) =>
      brand.name.toLowerCase().includes(brandSearchText.toLowerCase())
    );
  }, [brandSearchText, brands]);

  const filteredDepartments = useMemo(() => {
    const currentTypeId = productDetails.product_type_id;

    // First, filter departments by selected product type
    const filtered = departments.filter(
      (dept) => dept.product_type_id === currentTypeId
    );

    // Then, filter the already filtered list by search text
    if (!searchDeptText.trim()) return filtered;

    return filtered.filter((dept) =>
      dept.name.toLowerCase().includes(searchDeptText.toLowerCase())
    );
  }, [searchDeptText, departments, productDetails.product_type_id]);

  const filteredFirstCategory = useMemo(() => {
    const currentDeptId = productDetails.department_id;
    const filtered = firstCategory.filter(
      (firstcat) => firstcat.department_id === currentDeptId
    );

    if (!searchCategoryText.trim()) return filtered;
    return filtered.filter((firstcat) =>
      firstcat.name.toLowerCase().includes(searchCategoryText.toLowerCase())
    );
  }, [searchCategoryText, firstCategory, productDetails.department_id]);

  const filteredSizes = useMemo(() => {
    if (!searchSizeText.trim()) return sizes;
    return sizes.filter((size) =>
      size.name.toLowerCase().includes(searchSizeText.toLowerCase())
    );
  }, [searchSizeText, sizes]);

  const handleChange = (text: string) => {
    if (!productDetails.product_type) {
      setErrors((prev) => ({
        ...prev,
        product_type: true,
      }));
      return;
    }

    setProductDetails((prev) => ({
      ...prev,
      product_description: text,
    }));

    setErrors((prev) => ({
      ...prev,
      product_description: text.trim() === "",
    }));

    if (text.length > 0) {
      const matches = searchDescription.filter(
        (item) =>
          item.ProductType === productDetails.product_type &&
          item.productdescription.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredDescriptions(matches);
      setShowSuggestions(true);
    } else {
      setFilteredDescriptions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelect = (description: string) => {
    setProductDetails((prev) => ({
      ...prev,
      product_description: description,
    }));
    setShowSuggestions(false);
    Keyboard.dismiss();
  };
  const handleCancel = () => {
    navigation.goBack();
  };

  const handleSave = async () => {
    let valid = true;
    // Destructure productDetails
    const {
      barcode,
      product_type,
      department,
      FirstCategory,
      product_description,
      brand,
      size,
      product_type_id,
      department_id,
      packaging_material,
      productcode,
    } = productDetails;

    const newErrors = {
      product_type: !product_type.trim(),
      department: !department.trim(),
      FirstCategory: !FirstCategory.trim(),
      product_description: !product_description.trim(),
      brand: !brand.trim(),
      size: !size.trim(),
    };

    setErrors(newErrors);

    const hasError = Object.values(newErrors).some(Boolean);

    if (hasError) {
      setModal({
        visible: true,
        type: "error",
        title: "Missing Fields",
        title2: "Please fill in all required fields.",
      });
      return;
    }

    if (packList.length === 0) {
      setModal({
        visible: true,
        type: "error",
        title: "Missing Pack",
        title2: "Please add at least one pack.",
      });
      return;
    }

    // ✅ Format pack list
    const formattedPackList = packList.map((item, index) => ({
      pack_size: item.size,
      price: item.retail,
      pack_code: item.pack_code || "",
      is_delete: item.is_deleted || false,
      store_pack_id: item.store_pack_id || "0",
    }));

    // ✅ Final object
    const finalData = {
      UPC: barcode,
      product_type: product_type,
      Department: department,
      FirstCategory: FirstCategory,
      productdescription: product_description,
      brand: brand,
      product_size: size,
      product_code: productcode || "",
      packaging_material: packaging_material || "",
      pack_detalis: formattedPackList,
    };

    // console.log("Final Data:", finalData);
    // return false;
    try {
      setLoader(true);
      const token = (await SecureStore.getItemAsync("accessToken"))?.trim();

      const response = await fetch(
        `${ENDPOINTS.BACKEND_URL}/backoffice/product/saveProduct`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(finalData),
        }
      );

      const resJson = await response.json();
      setLoader(false);

      if (!response.ok) {
        setModal({
          visible: true,
          type: "error",
          title: "Error",
          title2: resJson?.message || "Something went wrong.",
        });
        return;
      }

      setShowSuccessModal(true);
    } catch (error: any) {
      setLoader(false);
      console.error("Save Error:", error);

      setModal({
        visible: true,
        type: "error",
        title: "Network Error",
        title2: "Please try again later.",
      });
    }
  };

  if (loading) {
    return <CustomLoader visible={loading} />;
  }
  if (Loader) {
    return <CustomLoader visible={Loader} />;
  }
  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={{ flex: 1 }}>
        <View style={styles.container}>
          {/* UPC Field */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>UPC</Text>
            {/* <View style={[styles.inputRow, { backgroundColor: "ccc" }]}> */}
            <View
              style={{
                flexDirection: "row",
                borderWidth: 1,
                borderColor: "#E0E6F3",
                borderRadius: 12,
                padding: IsIPAD ? 12 : 4,
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "#E5E5E5",
              }}
            >
              <TextInput
                style={styles.input}
                placeholder="Enter UPC"
                placeholderTextColor="#999"
                value={productDetails.barcode}
                editable={false}
              />
            </View>
          </View>

          {/* Product Type and Brand */}
          <View
            style={[styles.inputWrapper, { flexDirection: "row", gap: 10 }]}
          >
            {/* Product Type */}
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>
                Product Type <Text style={{ color: "red" }}>*</Text>
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  borderWidth: 1,
                  borderColor: errors.product_type ? "red" : "#0D1A56",
                  borderRadius: 12,
                  padding: IsIPAD ? 12 : 4,
                  alignItems: "center",
                  justifyContent: "space-between",
                  backgroundColor: "#fff",
                }}
              >
                <TextInput
                  style={{
                    flex: 1,
                    fontSize: IsIPAD ? 14 : 12,
                    color: "#0D1A56",
                    marginRight: 10,
                    fontFamily: "Poppins_400Regular",
                  }}
                  placeholder="Product Type"
                  placeholderTextColor="#999"
                  value={productDetails.product_type}
                  editable={false}
                />
                <TouchableOpacity
                  onPress={() => {
                    // Reset product_type_id and product_type before opening modal
                    setProductDetails((prev) => ({
                      ...prev,
                      department: "",
                      FirstCategory: "",
                    }));
                    setShowProductTypeModal(true);
                  }}
                >
                  <Ionicons
                    name="add-circle-outline"
                    size={IsIPAD ? 28 : 22}
                    color="#007AFF"
                  />
                </TouchableOpacity>
              </View>
              {/* Product Type model */}
              <Modal
                visible={showProductTypeModal}
                animationType="slide"
                transparent={true}
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.brandModalBox}>
                    <Text style={styles.modalTitle}>Select a Product Type</Text>
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Search Product type..."
                      placeholderTextColor="#999"
                      value={searchProductTypeText}
                      onChangeText={setSearchProductTypeText}
                    />

                    {/* 🔄 Loading State */}
                    {loadingProductTypes ? (
                      <ActivityIndicator size="large" />
                    ) : (
                      <FlatList
                        data={filteredProductTypes}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={{ paddingVertical: 10 }}
                        renderItem={({ item }) => (
                          <TouchableOpacity
                            style={styles.brandItem}
                            onPress={() => {
                              setProductDetails((prev) => ({
                                ...prev,
                                product_type: item.name,
                                product_type_id: item.id,
                              }));
                              setErrors((prev) => ({
                                ...prev,
                                product_type: false,
                              }));
                              setShowProductTypeModal(false);
                            }}
                          >
                            <Text style={styles.brandText}>{item.name}</Text>
                          </TouchableOpacity>
                        )}
                        numColumns={3}
                        columnWrapperStyle={{
                          justifyContent: "space-between",
                        }} // space items evenly
                        initialNumToRender={20}
                        maxToRenderPerBatch={30}
                        windowSize={10}
                      />
                    )}

                    <TouchableOpacity
                      onPress={() => setShowProductTypeModal(false)}
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
            </View>

            {/* Product Brand Field */}
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>
                Product Brand <Text style={{ color: "red" }}>*</Text>
              </Text>
              <View
                // style={[
                //   styles.inputRow,
                //   errors.brand && { borderColor: "red", borderWidth: 1 },
                // ]}
                style={{
                  flexDirection: "row",
                  borderWidth: 1,
                  borderColor: errors.brand ? "red" : "#0D1A56",
                  borderRadius: 12,
                  padding: IsIPAD ? 12 : 4,
                  alignItems: "center",
                  justifyContent: "space-between",
                  backgroundColor: "#fff",
                }}
              >
                <TextInput
                  style={{
                    flex: 1,
                    fontSize: IsIPAD ? 14 : 12,
                    color: "#0D1A56",
                    marginRight: 10,
                    fontFamily: "Poppins_400Regular",
                  }}
                  placeholder="Product Brand"
                  placeholderTextColor="#999"
                  value={productDetails.brand}
                  editable={false}
                />
                <TouchableOpacity onPress={() => setShowBrandModal(true)}>
                  <Ionicons
                    name="add-circle-outline"
                    size={IsIPAD ? 28 : 22}
                    color="#007AFF"
                  />
                </TouchableOpacity>
              </View>
              {/* brand model */}
              <Modal
                visible={showBrandModal}
                animationType="slide"
                transparent={true}
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.brandModalBox}>
                    <Text style={styles.modalTitle}>Select a Brand</Text>
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Search brand..."
                      placeholderTextColor="#999"
                      value={brandSearchText}
                      onChangeText={setBrandSearchText}
                    />

                    {/* 🔄 Loading State */}
                    {loadingBrands ? (
                      <ActivityIndicator size="large" />
                    ) : (
                      <FlatList
                        data={filteredBrands}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={{ paddingVertical: 10 }}
                        renderItem={({ item }) => (
                          <TouchableOpacity
                            style={styles.brandItem}
                            onPress={() => {
                              setProductDetails((prev) => ({
                                ...prev,
                                brand: item.name,
                              }));
                              setErrors((prev) => ({
                                ...prev,
                                brand: false,
                              }));
                              setShowBrandModal(false);
                            }}
                          >
                            <Text style={styles.brandText}>{item.name}</Text>
                          </TouchableOpacity>
                        )}
                        numColumns={3}
                        columnWrapperStyle={{
                          justifyContent: "space-between",
                        }} // space items evenly
                        initialNumToRender={20}
                        maxToRenderPerBatch={30}
                        windowSize={10}
                      />
                    )}

                    <TouchableOpacity
                      onPress={() => setShowBrandModal(false)}
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
            </View>
          </View>

          {/* Product Description Field */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>
              Product Description <Text style={{ color: "red" }}>*</Text>
            </Text>
            <View
              style={{
                flexDirection: "row",
                borderWidth: 1,
                borderColor: errors.product_description ? "red" : "#0D1A56",
                borderRadius: 12,
                padding: IsIPAD ? 14 : 4,
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "#fff",
              }}
            >
              <TextInput
                style={{
                  flex: 1,
                  fontSize: IsIPAD ? 14 : 12,
                  color: "#0D1A56",
                  marginRight: 10,
                  fontFamily: "Poppins_400Regular",
                }}
                placeholder="Product Description"
                placeholderTextColor="#999"
                value={productDetails.product_description}
                onChangeText={handleChange}
              />
            </View>
            {showSuggestions && filteredDescriptions.length > 0 && (
              <ScrollView
                style={styles.suggestionBox}
                keyboardShouldPersistTaps="handled"
              >
                {filteredDescriptions.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleSelect(item.productdescription)}
                    style={styles.suggestionItem}
                  >
                    <Text>{item.productdescription}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          {/* Department & Size Row */}
          <View
            style={[styles.inputWrapper, { flexDirection: "row", gap: 10 }]}
          >
            {/* Department Field */}
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>
                Department <Text style={{ color: "red" }}>*</Text>
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  borderWidth: 1,
                  borderColor: errors.department ? "red" : "#0D1A56",
                  borderRadius: 12,
                  padding: IsIPAD ? 12 : 4,
                  alignItems: "center",
                  justifyContent: "space-between",
                  backgroundColor: "#fff",
                }}
              >
                <TextInput
                  // style={styles.input}
                  style={{
                    flex: 1,
                    fontSize: IsIPAD ? 14 : 12,
                    color: "#0D1A56",
                    marginRight: 10,
                    fontFamily: "Poppins_400Regular",
                  }}
                  placeholder="Enter Department"
                  placeholderTextColor="#999"
                  value={productDetails.department}
                  editable={false}
                />
                <TouchableOpacity
                  onPress={() => {
                    if (!productDetails.product_type_id) {
                      alert("Please select Product Type first");
                      return;
                    }
                    setProductDetails((prev) => ({
                      ...prev,
                      FirstCategory: "",
                    }));
                    setErrors((prev) => ({
                      ...prev,
                      department: false,
                    }));
                    setShowDeptModal(true);
                  }}
                >
                  <Ionicons
                    name="add-circle-outline"
                    size={IsIPAD ? 28 : 22}
                    color="#007AFF"
                  />
                </TouchableOpacity>
              </View>

              <Modal
                visible={showDeptModal}
                animationType="slide"
                transparent={true}
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.brandModalBox}>
                    <Text style={styles.modalTitle}>Select a Department</Text>

                    {/* 🔍 Search Input */}
                    <TextInput
                      placeholder="Search Department"
                      placeholderTextColor="#999"
                      value={searchDeptText}
                      onChangeText={setSearchDeptText}
                      style={styles.searchInput}
                    />

                    {/* 🔄 Loading State */}
                    {loadingDepartments ? (
                      <ActivityIndicator size="large" />
                    ) : (
                      <FlatList
                        data={filteredDepartments}
                        keyExtractor={(item) => item.id.toString()}
                        numColumns={3}
                        columnWrapperStyle={{
                          justifyContent: "space-between",
                        }}
                        contentContainerStyle={{ paddingVertical: 10 }}
                        renderItem={({ item }) => (
                          <TouchableOpacity
                            style={styles.brandItem}
                            onPress={() => {
                              setProductDetails((prev) => ({
                                ...prev,
                                department: item.name,
                                department_id: item.id,
                              }));
                              setShowDeptModal(false);
                            }}
                          >
                            <Text style={styles.brandText}>{item.name}</Text>
                          </TouchableOpacity>
                        )}
                      />
                    )}

                    {/* Close Button */}
                    <TouchableOpacity
                      onPress={() => setShowDeptModal(false)}
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
            </View>

            {/* Size Field */}
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>
                Product Size <Text style={{ color: "red" }}>*</Text>
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  borderWidth: 1,
                  borderColor: errors.size ? "red" : "#0D1A56",
                  borderRadius: 12,
                  padding: IsIPAD ? 12 : 4,
                  alignItems: "center",
                  justifyContent: "space-between",
                  backgroundColor: "#fff",
                }}
              >
                <TextInput
                  style={{
                    flex: 1,
                    fontSize: IsIPAD ? 14 : 12,
                    color: "#0D1A56",
                    marginRight: 10,
                    fontFamily: "Poppins_400Regular",
                  }}
                  placeholder="Enter Size"
                  placeholderTextColor="#999"
                  value={productDetails.size}
                  editable={false}
                />
                <TouchableOpacity onPress={() => setShowSizeModal(true)}>
                  <Ionicons
                    name="add-circle-outline"
                    size={IsIPAD ? 28 : 22}
                    color="#007AFF"
                  />
                </TouchableOpacity>
              </View>

              <Modal
                visible={showSizeModal}
                animationType="slide"
                transparent={true}
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.brandModalBox}>
                    <Text style={styles.modalTitle}>Select a Size</Text>

                    {/* 🔍 Search Input */}
                    <TextInput
                      placeholder="Search Size"
                      placeholderTextColor="#999"
                      value={searchSizeText}
                      onChangeText={setSearchSizeText}
                      style={styles.searchInput}
                    />

                    {/* 🔄 Loading or FlatList */}
                    {loadingSizes ? (
                      <ActivityIndicator size="large" />
                    ) : (
                      <FlatList
                        data={filteredSizes}
                        keyExtractor={(item, index) => index.toString()}
                        numColumns={3}
                        columnWrapperStyle={{ justifyContent: "space-between" }}
                        contentContainerStyle={{ paddingVertical: 10 }}
                        renderItem={({ item }) => (
                          <TouchableOpacity
                            style={styles.brandItem}
                            onPress={() => {
                              setProductDetails((prev) => ({
                                ...prev,
                                size: item.name,
                              }));
                              setErrors((prev) => ({
                                ...prev,
                                size: false,
                              }));
                              setShowSizeModal(false);
                            }}
                          >
                            <Text style={styles.brandText}>{item.name}</Text>
                          </TouchableOpacity>
                        )}
                      />
                    )}

                    {/* ❌ Close Button */}
                    <TouchableOpacity
                      onPress={() => setShowSizeModal(false)}
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
            </View>
          </View>

          {/* First Category Field */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>
              First Category <Text style={{ color: "red" }}>*</Text>
            </Text>
            <View
              // style={[
              //   styles.inputRow,
              //   errors.FirstCategory && { borderColor: "red", borderWidth: 1 },
              // ]}
              style={{
                flexDirection: "row",
                borderWidth: 1,
                borderColor: errors.FirstCategory ? "red" : "#0D1A56",
                borderRadius: 12,
                padding: IsIPAD ? 12 : 4,
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "#fff",
              }}
            >
              <TextInput
                // style={styles.input}
                style={{
                  flex: 1,
                  fontSize: IsIPAD ? 14 : 12,
                  color: "#0D1A56",
                  marginRight: 10,
                  fontFamily: "Poppins_400Regular",
                }}
                placeholder="Enter Category"
                placeholderTextColor="#999"
                value={productDetails.FirstCategory}
                editable={false}
              />
              <TouchableOpacity
                onPress={() => {
                  if (!productDetails.department_id) {
                    alert("Please select Department first");
                    return;
                  }
                  setShowCategoryModal(true);
                }}
              >
                <Ionicons
                  name="add-circle-outline"
                  size={IsIPAD ? 28 : 24}
                  color="#007AFF"
                />
              </TouchableOpacity>
            </View>

            <Modal
              visible={showCategoryModal}
              animationType="slide"
              transparent={true}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.brandModalBox}>
                  <Text style={styles.modalTitle}>Select a First Category</Text>

                  {/* 🔍 Search Input */}
                  <TextInput
                    placeholder="Search Size"
                    placeholderTextColor="#999"
                    value={searchCategoryText}
                    onChangeText={setSearchCategoryText}
                    style={styles.searchInput}
                  />

                  {/* 🔄 Loading or FlatList */}
                  {loadingFirstCategory ? (
                    <ActivityIndicator size="large" />
                  ) : (
                    <FlatList
                      data={filteredFirstCategory}
                      keyExtractor={(item, index) => index.toString()}
                      numColumns={3}
                      columnWrapperStyle={{
                        justifyContent: "space-between",
                      }}
                      contentContainerStyle={{ paddingVertical: 10 }}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={styles.brandItem}
                          onPress={() => {
                            setProductDetails((prev) => ({
                              ...prev,
                              FirstCategory: item.name,
                            }));
                            setErrors((prev) => ({
                              ...prev,
                              FirstCategory: false,
                            }));
                            setShowCategoryModal(false);
                          }}
                        >
                          <Text style={styles.brandText}>{item.name}</Text>
                        </TouchableOpacity>
                      )}
                    />
                  )}

                  {/* ❌ Close Button */}
                  <TouchableOpacity
                    onPress={() => setShowCategoryModal(false)}
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
          </View>

          {/* Pack Size Section */}
          <View style={{ padding: 2, marginTop: 10 }}>
            {/* Add Pack Button */}
            <TouchableOpacity
              onPress={() => setShowPackModal(true)}
              style={[
                styles.addButton,
                { flexDirection: "row", alignItems: "center" },
              ]}
            >
              <Ionicons
                name="add-circle-outline"
                size={18}
                color="#fff"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.addButtonText}>Add Pack</Text>
            </TouchableOpacity>

            {/* Pack Table */}
            <View
              style={{ marginTop: 10, borderWidth: 1, borderColor: "#ccc" }}
            >
              {/* Header */}
              <View style={[styles.tableHeader, { flexDirection: "row" }]}>
                <Text style={styles.headerText}>Pack Size</Text>
                <Text style={styles.headerText}>Retail Price</Text>
                <Text style={[styles.headerText, { textAlign: "center" }]}>
                  Action
                </Text>
              </View>

              {/* Rows */}
              {packList
                .filter((pack) => !pack.is_deleted)
                .map((pack) => (
                  <View
                    key={pack.id}
                    style={{
                      flexDirection: "row",
                      borderTopWidth: 1,
                      borderColor: "#ccc",
                      alignItems: "center",
                    }}
                  >
                    <Text style={styles.cell}>{pack.size}</Text>
                    <Text style={styles.cell}>{`$${pack.retail}`}</Text>
                    <View
                      style={[
                        styles.cell,
                        { flexDirection: "row", justifyContent: "center" },
                      ]}
                    >
                      {/* Edit */}
                      <TouchableOpacity
                        onPress={() => editPack(pack)}
                        style={{
                          width: 40,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Ionicons
                          name="create-outline"
                          size={20}
                          color="#003366"
                        />
                      </TouchableOpacity>

                      {/* Remove */}
                      <TouchableOpacity
                        onPress={() => removePack(pack.id)}
                        style={{
                          width: 40,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={20}
                          color="#ff5c75"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
            </View>

            {/* Add Pack Modal */}
            <Modal
              visible={showPackModal}
              animationType="slide"
              transparent={true}
            >
              <View style={styles.modalOverlay}>
                <View
                  style={{
                    backgroundColor: "#fff",
                    width: IsIPAD ? "60%" : "85%",
                    borderRadius: 10,
                    padding: 20,
                  }}
                >
                  <Text style={styles.modalTitle}>Add Pack</Text>

                  {/* PackSize */}
                  <View style={styles.inputWrapper}>
                    <Text style={styles.label}>Pack Size</Text>

                    <View
                      style={{
                        flexDirection: "row",
                        borderWidth: 1,
                        borderColor: packSizeError ? "red" : "#E0E6F3",
                        borderRadius: 12,
                        padding: 0,
                        backgroundColor: "#fff",
                        overflow: "hidden",
                      }}
                    >
                      <TextInput
                        ref={packSizeInputRef}
                        placeholder="e.g. 12"
                        placeholderTextColor="#999"
                        keyboardType="numeric"
                        value={packSize}
                        onChangeText={(text) => {
                          setPackSize(text);
                          if (text.trim()) {
                            setPackSizeError(false);
                          }
                        }}
                        onFocus={() => {
                          if (packSizeError) setPackSizeError(false);
                        }}
                        style={{
                          flex: 1,
                          fontSize: 16,
                          paddingVertical: 12,
                          paddingHorizontal: 16,
                          fontFamily: "Poppins_300Light",
                          color: "#0D1A56",
                        }}
                      />

                      <View
                        style={{
                          paddingHorizontal: 16,
                          justifyContent: "center",
                          alignItems: "center",
                          backgroundColor: "#F5F5F5",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 16,
                            fontFamily: "Poppins_400Regular",
                            color: "#0D1A56",
                          }}
                        >
                          PK
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Retail Price */}
                  <View style={styles.inputWrapper}>
                    <Text style={styles.label}>Retail Price</Text>
                    <View
                      // style={[
                      //   styles.inputRow,
                      //   retailPriceError && { borderColor: "red" },
                      // ]}
                      style={{
                        flexDirection: "row",
                        borderWidth: 1,
                        borderColor: retailPriceError ? "red" : "#E0E6F3",
                        borderRadius: 12,
                        padding: IsIPAD ? 14 : 8,
                        alignItems: "center",
                        justifyContent: "space-between",
                        backgroundColor: "#fff",
                      }}
                    >
                      <TextInput
                        placeholder="0.00"
                        placeholderTextColor="#999"
                        keyboardType="decimal-pad"
                        value={retailPrice}
                        onChangeText={(text) => {
                          setRetailPrice(text); // <- allow user to freely type
                          if (text.trim()) setRetailPriceError(false);
                        }}
                        onBlur={() => {
                          const cleaned = retailPrice.replace(/[^0-9.]/g, "");
                          setRetailPrice(cleaned);
                        }}
                        style={[
                          styles.inputBox,
                          retailPriceError && { borderColor: "red" },
                        ]}
                      />
                    </View>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginTop: 15,
                    }}
                  >
                    <TouchableOpacity
                      style={styles.modalButton}
                      onPress={handleAddPack}
                    >
                      <Text
                        style={{
                          color: "#fff",
                          fontFamily: "Poppins_400Regular",
                        }}
                      >
                        Save Pack
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.modalButton,
                        { backgroundColor: "#ff5c75" },
                      ]}
                      onPress={() => setShowPackModal(false)}
                    >
                      <Text
                        style={{
                          color: "#fff",
                          fontFamily: "Poppins_400Regular",
                        }}
                      >
                        Cancel
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
          </View>
        </View>
      </ScrollView>
      {/* Fixed Button Row */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
      <SuccessModal
        visible={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          navigation.goBack();
        }}
      />
      {/* Toast Message Container */}
      <AlertModal
        visible={modal.visible}
        type={modal.type}
        title={modal.title}
        title2={modal.title2}
        onClose={() => setModal((prev) => ({ ...prev, visible: false }))}
      />
    </View>
  );
}

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
    padding: IsIPAD ? 12 : 4,
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
  modalTitle: {
    fontSize: 18,
    color: "#0D1A56",
    fontFamily: "Poppins_700Bold",
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
    paddingVertical: IsIPAD ? 12 : 8,
    paddingHorizontal: IsIPAD ? 20 : 16,
    borderRadius: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  addButtonText: {
    color: "#fff",
    fontFamily: "Poppins_600SemiBold",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#003366",
  },
  headerText: {
    flex: 1,
    color: "#FFB400",
    padding: IsIPAD ? 12 : 8,
    fontSize: IsIPAD ? 16 : 12,
    fontFamily: "Poppins_600SemiBold",
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
    paddingVertical: IsIPAD ? 10 : 5,
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
    fontSize: IsIPAD ? 14 : 10,
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
  inputBox: {
    flex: 1,
  },

  pkBox: {
    marginLeft: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },

  pkText: {
    fontSize: 16,
    color: "#0D1A56",
    fontFamily: "Poppins_700Bold",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  saveButton: {
    flex: 1,
    marginRight: 8,
    backgroundColor: "#003366",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: "#ff5c75",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontFamily: "Poppins_700Bold",
  },
  suggestionBox: {
    maxHeight: 150,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#003366",
    marginTop: 4,
    borderRadius: 5,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
});
