import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { Colors } from "../../../../../constants/Colors";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";

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

const CategoryTab = ({ title, onPress }) => (
  <TouchableOpacity style={styles.tabContainer} onPress={onPress}>
    <View style={styles.tabContent}>
      <View style={styles.categoryIconContainer}>
        <MaterialIcons
          name={getCategoryIcon(title)}
          size={28}
          color={Colors.darkGreen.color}
        />
      </View>
      <View style={styles.categoryTextContainer}>
        <Text style={styles.tabTitle}>{title}</Text>
        <Text
          style={styles.itemCount}
        >{`${categories[title].length} items`}</Text>
      </View>
      <MaterialIcons
        name="chevron-right"
        size={24}
        color={Colors.darkGreen.color}
      />
    </View>
  </TouchableOpacity>
);

const NutrientRow = ({ nutrient }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isCustom, setIsCustom] = useState(false);
  const [target, setTarget] = useState("");
  const [threshold, setThreshold] = useState("");

  return (
    <Animated.View style={styles.nutrientCard}>
      <Text style={styles.nutrientTitle}>{nutrient}</Text>
      <View style={styles.targetContainer}>
        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>Daily Target</Text>
          <TextInput
            style={[styles.input, isVisible && styles.activeInput]}
            placeholder="0"
            keyboardType="numeric"
            value={target}
            onChangeText={setTarget}
          />
          <Text style={styles.unit}>mg</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.visibilityButton,
            isVisible && styles.visibilityButtonActive,
          ]}
          onPress={() => setIsVisible(!isVisible)}
        >
          <MaterialIcons
            name={isVisible ? "visibility" : "visibility-off"}
            size={20}
            color={isVisible ? Colors.white.color : Colors.darkGreen.color}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.thresholdContainer}>
        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>Max Threshold</Text>
          <TextInput
            style={[
              styles.input,
              !isCustom && styles.disabledInput,
              isCustom && styles.activeInput,
            ]}
            placeholder="0"
            keyboardType="numeric"
            value={threshold}
            onChangeText={setThreshold}
            editable={isCustom}
          />
          <Text style={styles.unit}>mg</Text>
        </View>
        <TouchableOpacity
          style={[styles.customButton, isCustom && styles.customButtonActive]}
          onPress={() => setIsCustom(!isCustom)}
        >
          <Text
            style={[
              styles.customButtonText,
              isCustom && styles.customButtonTextActive,
            ]}
          >
            Custom
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const NutrientTargetsView = () => {
  const router = useRouter();
  const { hideHeader, category } = useLocalSearchParams();

  const handleCategoryPress = useCallback(
    (selectedCategory) => {
      router.push({
        pathname: "/components/tabviews/more/targets/nutrientTargetsView",
        params: { hideHeader: "true", category: selectedCategory },
      });
    },
    [router]
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: hideHeader !== "true",
          title: "Nutrient Targets",
        }}
      />
      <SafeAreaView style={styles.safeAreaViewContainer}>
        {hideHeader === "true" && (
          <View style={styles.header}>
            <Text className="text-4xl font-pextrabold text-center text-green pt-10">
              Fitlicious
            </Text>
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
        )}
        <ScrollView contentContainerStyle={styles.scrollViewContainer}>
          <View style={styles.tabsContainer}>
            {!category ? (
              Object.keys(categories).map((cat) => (
                <CategoryTab
                  key={cat}
                  title={cat}
                  onPress={() => handleCategoryPress(cat)}
                />
              ))
            ) : (
              <View style={styles.nutrientsContainer}>
                <View style={styles.categoryHeaderContainer}>
                  <View style={styles.categoryTitleWrapper}>
                    <MaterialIcons
                      name={getCategoryIcon(category)}
                      size={28}
                      color={Colors.darkGreen.color}
                    />
                    <Text style={styles.categoryTitle}>{category}</Text>
                  </View>
                  <Text style={styles.categoryItemCount}>
                    {categories[category].length} items
                  </Text>
                </View>
                {categories[category].map((nutrient) => (
                  <NutrientRow key={nutrient} nutrient={nutrient} />
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

export default NutrientTargetsView;

const styles = StyleSheet.create({
  safeAreaViewContainer: {
    flex: 1,
    backgroundColor: Colors.white.color,
  },
  header: {
    position: "relative",
    paddingBottom: 20,
    backgroundColor: Colors.white.color,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGreen.color,
  },
  backButton: {
    paddingLeft: 20,
  },
  scrollViewContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  tabsContainer: {
    width: "100%",
    marginTop: 20,
  },
  tabContainer: {
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: Colors.white.color,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  tabContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  categoryIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.lightGreen.color,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  tabTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2D3748",
  },
  itemCount: {
    fontSize: 14,
    color: "#718096",
    marginTop: 4,
  },
  nutrientCard: {
    backgroundColor: Colors.white.color,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  nutrientTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2D3748",
    marginBottom: 16,
  },
  targetContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  thresholdContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  inputWrapper: {
    flex: 1,
    marginRight: 12,
  },
  inputLabel: {
    fontSize: 14,
    color: "#718096",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F7FAFC",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  activeInput: {
    borderColor: Colors.darkGreen.color,
    backgroundColor: Colors.white.color,
  },
  unit: {
    position: "absolute",
    right: 12,
    top: 40,
    color: "#718096",
  },
  visibilityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.lightGreen.color,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.darkGreen.color,
  },
  visibilityButtonActive: {
    backgroundColor: Colors.darkGreen.color,
  },
  customButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  customButtonActive: {
    backgroundColor: Colors.darkGreen.color,
    borderColor: Colors.darkGreen.color,
  },
  customButtonText: {
    color: "#6B7280",
    fontWeight: "600",
  },
  customButtonTextActive: {
    color: Colors.white.color,
  },
  disabledInput: {
    backgroundColor: "#EDF2F7",
    borderColor: "#E2E8F0",
    color: "#A0AEC0",
  },
  categoryHeaderContainer: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGreen.color,
    marginBottom: 20,
  },
  categoryTitleWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  categoryTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: Colors.darkGreen.color,
    marginLeft: 12,
  },
  categoryItemCount: {
    fontSize: 14,
    color: "#718096",
    marginLeft: 40,
  },
});

const getCategoryIcon = (category) => {
  const icons = {
    Carbohydrates: "grain",
    AminoAcids: "science",
    Fats: "opacity",
    Minerals: "diamond",
    Other: "more-horiz",
    Sterols: "architecture",
    Vitamins: "medication",
  };
  return icons[category] || "circle";
};
