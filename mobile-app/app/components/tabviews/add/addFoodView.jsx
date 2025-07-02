import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Modal,
  Pressable,
  Animated,
  Easing,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Stack } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import CustomField from "../../CustomField";
import CustomButton from "../../CustomButton";
import { Colors } from "../../../../constants/Colors";
import { addFoodItem } from "@/app/services/foodService";

// Nutrition categories and subcategories from targetsView.jsx
const categories = {
  Carbohydrates: [
    "Fiber",
    "Starch",
    "Sugars",
    "Galactose",
    "Glucose",
    "Sucrose",
    "Lactose",
    "Maltose",
    "Fructose",
  ],
  AminoAcids: [
    "Alanine",
    "Arginine",
    "AsparticAcid",
    "Valine",
    "Glycine",
    "Glutamine",
    "Isoleucine",
    "Leucine",
    "Lysine",
    "Methionine",
    "Proline",
    "Serine",
    "Tyrosine",
    "Threonine",
    "Tryptophan",
    "Phenylalanine",
    "Hydroxyproline",
    "Histidine",
    "Cystine",
  ],
  Fats: [
    "TotalFats",
    "MonounsaturatedFats",
    "PolyunsaturatedFats",
    "SaturatedFats",
    "TransFats",
  ],
  Minerals: [
    "Iron",
    "Potassium",
    "Calcium",
    "Magnesium",
    "Manganese",
    "Copper",
    "Sodium",
    "Selenium",
    "Fluoride",
    "Phosphorus",
    "Zinc",
  ],
  Other: ["Alcohol", "Water", "Caffeine", "Theobromine", "Ash"],
  Sterols: [
    "Cholesterol",
    "Phytosterols",
    "Stigmasterols",
    "Campesterol",
    "BetaSitosterols",
  ],
  Vitamins: [
    "Betaine",
    "VitaminA",
    "VitaminB1",
    "VitaminB2",
    "VitaminB3",
    "VitaminB4",
    "VitaminB5",
    "VitaminB6",
    "VitaminB9",
    "VitaminB12",
    "VitaminC",
    "VitaminD",
    "VitaminE",
    "VitaminK1",
    "VitaminK2",
  ],
};

const servingTypes = ["g", "ml", "tsp", "tbsp", "cup", "oz", "piece"];

const AddFoodView = () => {
  const router = useRouter();
  const [foodName, setFoodName] = useState("");
  const [servingType, setServingType] = useState(servingTypes[0]);
  const [servingQty, setServingQty] = useState("");
  const [macros, setMacros] = useState({
    Protein: "",
    Carbohydrates: "",
    Fat: "",
  });
  const [nutrition, setNutrition] = useState(() => {
    const obj = {};
    Object.entries(categories).forEach(([cat, subs]) => {
      subs.forEach((sub) => {
        obj[sub] = "";
      });
    });
    return obj;
  });
  const [servingTypeModalVisible, setServingTypeModalVisible] = useState(false);
  const [nutritionDetailsVisible, setNutritionDetailsVisible] = useState(false);
  const nutritionAnim = React.useRef(new Animated.Value(0)).current;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  React.useEffect(() => {
    Animated.timing(nutritionAnim, {
      toValue: nutritionDetailsVisible ? 1 : 0,
      duration: 250,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [nutritionDetailsVisible]);

  const handleMacroChange = (macro, value) => {
    setMacros((prev) => ({ ...prev, [macro]: value }));
  };

  const handleNutritionChange = (sub, value) => {
    setNutrition((prev) => ({ ...prev, [sub]: value }));
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    if (
      !foodName ||
      !servingQty ||
      !macros.Protein ||
      !macros.Carbohydrates ||
      !macros.Fat
    ) {
      setError("Please fill in all required fields.");
      return;
    }
    setIsLoading(true);
    try {
      // Prepare NutritionalInformation array
      const nutritionalInformation = Object.entries(nutrition)
        .filter(([name, value]) => value !== "" && !isNaN(Number(value)))
        .map(([name, value]) => {
          // Find category for this nutrient
          let category = Object.keys(categories).find((cat) =>
            categories[cat].includes(name)
          );
          return {
            Category: category || "Other",
            Name: name,
            Amount: Number(value),
          };
        });
      // Prepare payload
      const payload = {
        Name: foodName,
        CaloriesPer100g: 0, // Not collected in UI, backend requires it, set to 0 or calculate if possible
        ProteinPer100g: Number(macros.Protein),
        CarbohydratePer100g: Number(macros.Carbohydrates),
        FatPer100g: Number(macros.Fat),
        Type: 0, // Default to Food (TypeOfConsumable.Food)
        NutritionalInformation: nutritionalInformation,
        IsPublic: true,
      };
      await addFoodItem(payload);
      setSuccess("Food item added successfully!");
      // Optionally reset form
      setFoodName("");
      setServingQty("");
      setMacros({ Protein: "", Carbohydrates: "", Fat: "" });
      setNutrition(() => {
        const obj = {};
        Object.entries(categories).forEach(([cat, subs]) => {
          subs.forEach((sub) => {
            obj[sub] = "";
          });
        });
        return obj;
      });
      // Optionally show alert
      Alert.alert("Success", "Food item added successfully!");
    } catch (err) {
      setError(err.message || "An error occurred.");
      Alert.alert("Error", err.message || "An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safeAreaView}>
        <View style={styles.header}>
          <Text style={styles.appTitle}>Fitlicious</Text>
          <View style={styles.arrowRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <MaterialIcons
                name="arrow-back"
                size={36}
                color={Colors.darkGreen.color}
              />
            </TouchableOpacity>
          </View>
        </View>
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Add Food</Text>
          <CustomField
            styles={styles.input}
            placeholder="Food Name"
            value={foodName}
            onChangeText={setFoodName}
          />
          <View style={styles.row}>
            <CustomField
              styles={[styles.input, { flex: 2 }]}
              placeholder="Serving Quantity"
              value={servingQty}
              onChangeText={setServingQty}
              numeric
              allowDecimal
            />
            <TouchableOpacity
              style={[
                styles.input,
                styles.servingTypeDropdown,
                { flex: 1, marginLeft: 8 },
              ]}
              onPress={() => setServingTypeModalVisible(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.label}>Serving Type</Text>
              <Text style={styles.selectedServingType}>{servingType}</Text>
            </TouchableOpacity>
          </View>
          <Modal
            visible={servingTypeModalVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setServingTypeModalVisible(false)}
          >
            <Pressable
              style={styles.modalOverlay}
              onPress={() => setServingTypeModalVisible(false)}
            >
              <View style={styles.modalContent}>
                {servingTypes.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={styles.modalOption}
                    onPress={() => {
                      setServingType(type);
                      setServingTypeModalVisible(false);
                    }}
                  >
                    <Text style={styles.modalOptionText}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Pressable>
          </Modal>
          <Text style={styles.sectionTitle}>Macronutrients per Serving</Text>
          <View style={styles.row}>
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CustomField
                styles={[styles.input, { flex: 1 }]}
                placeholder="Protein"
                value={macros.Protein}
                onChangeText={(v) => handleMacroChange("Protein", v)}
                numeric
                allowDecimal
                textInputStyle={{ fontSize: 13, textAlign: "center" }}
              />
              <Text style={styles.unitLabel}>g</Text>
            </View>
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                marginLeft: 8,
              }}
            >
              <CustomField
                styles={[styles.input, { flex: 1 }]}
                placeholder="Carbs"
                value={macros.Carbohydrates}
                onChangeText={(v) => handleMacroChange("Carbohydrates", v)}
                numeric
                allowDecimal
                textInputStyle={{ fontSize: 13, textAlign: "center" }}
              />
              <Text style={styles.unitLabel}>g</Text>
            </View>
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                marginLeft: 8,
              }}
            >
              <CustomField
                styles={[styles.input, { flex: 1 }]}
                placeholder="Fat"
                value={macros.Fat}
                onChangeText={(v) => handleMacroChange("Fat", v)}
                numeric
                allowDecimal
                textInputStyle={{ fontSize: 13, textAlign: "center" }}
              />
              <Text style={styles.unitLabel}>g</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.nutritionToggle}
            onPress={() => setNutritionDetailsVisible((v) => !v)}
            activeOpacity={0.7}
          >
            <Text style={styles.nutritionToggleText}>Nutrition Details</Text>
            <MaterialIcons
              name={nutritionDetailsVisible ? "expand-less" : "expand-more"}
              size={24}
              color={Colors.darkGreen.color}
            />
          </TouchableOpacity>
          <Animated.View
            style={[
              styles.nutritionDetailsContainer,
              {
                maxHeight: nutritionAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 4000],
                }),
                opacity: nutritionAnim,
              },
            ]}
          >
            {nutritionDetailsVisible && (
              <View>
                {Object.entries(categories).map(([cat, subs]) => (
                  <View key={cat} style={styles.categorySection}>
                    <Text style={styles.categoryTitle}>{cat}</Text>
                    <View style={styles.subsGrid}>
                      {subs.map((sub) => (
                        <View
                          key={sub}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            width: "47%",
                            justifyContent: "center",
                          }}
                        >
                          <CustomField
                            styles={[styles.input, { flex: 1 }]}
                            placeholder={sub}
                            value={nutrition[sub]}
                            onChangeText={(v) => handleNutritionChange(sub, v)}
                            numeric
                            allowDecimal
                            textInputStyle={{
                              fontSize: 13,
                              textAlign: "center",
                            }}
                          />
                          <Text style={styles.unitLabel}>g</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </Animated.View>
          <CustomButton
            title={isLoading ? "Saving..." : "Save Food"}
            handleOnPress={handleSubmit}
            containerStyles={styles.saveButton}
            textStyles={styles.saveButtonText}
            isLoading={isLoading}
          />
          {error ? (
            <Text style={{ color: "red", textAlign: "center", marginTop: 10 }}>
              {error}
            </Text>
          ) : null}
          {success ? (
            <Text
              style={{ color: "green", textAlign: "center", marginTop: 10 }}
            >
              {success}
            </Text>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    marginTop: Platform.OS === "ios" ? 40 : 30,
    marginBottom: 18,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  appTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: Colors.green.color,
    textAlign: "center",
    letterSpacing: 1,
    marginBottom: 0,
  },
  arrowRow: {
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 10,
  },
  backButton: {
    alignSelf: "flex-start",
    marginLeft: 20,
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.darkGreen.color,
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    marginBottom: 14,
    backgroundColor: "#F8FAF5",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  label: {
    fontSize: 12,
    color: Colors.darkGreen.color,
    marginBottom: 4,
    fontWeight: "500",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.green.color,
    marginTop: 18,
    marginBottom: 8,
  },
  categorySection: {
    marginBottom: 18,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.darkGreen.color,
    marginBottom: 8,
  },
  subsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  nutritionInput: {
    width: "47%",
    fontSize: 13,
  },
  saveButton: {
    marginTop: 24,
    backgroundColor: Colors.darkGreen.color,
    borderRadius: 14,
    paddingVertical: 16,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  servingTypeDropdown: {
    justifyContent: "center",
    minHeight: 48,
  },
  selectedServingType: {
    fontSize: 14,
    color: Colors.darkGreen.color,
    fontWeight: "600",
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    minWidth: 200,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  modalOption: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalOptionText: {
    fontSize: 16,
    color: Colors.darkGreen.color,
    textAlign: "center",
  },
  nutritionToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 18,
    marginBottom: 8,
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: "#F8FAF5",
    borderRadius: 10,
  },
  nutritionToggleText: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.green.color,
  },
  nutritionDetailsContainer: {
    overflow: "hidden",
    marginBottom: 8,
  },
  unitLabel: {
    fontSize: 12,
    color: Colors.darkGreen.color,
    marginLeft: 4,
    marginRight: 0,
    fontWeight: "500",
  },
});

export default AddFoodView;
