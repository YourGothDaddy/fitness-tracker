import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
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
    <Text style={styles.tabTitle}>{title}</Text>
    <MaterialIcons
      name="arrow-forward-ios"
      size={24}
      style={styles.arrowIcon}
    />
  </TouchableOpacity>
);

const NutrientRow = ({ nutrient }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isCustom, setIsCustom] = useState(false);

  return (
    <View style={styles.nutrientRow}>
      <View style={styles.inputContainer}>
        <Text style={styles.nutrientTitle}>{nutrient}</Text>
        <View style={styles.inputSwitchRow}>
          <TextInput
            style={styles.input}
            placeholder="Daily target"
            keyboardType="numeric"
          />
          <View style={styles.switchRow}>
            <Text>Visible</Text>
            <Switch
              value={isVisible}
              onValueChange={setIsVisible}
              trackColor={{ false: "#767577", true: Colors.darkGreen.color }}
            />
          </View>
        </View>
        <View style={styles.inputSwitchRow}>
          <TextInput
            style={[styles.input, !isCustom && styles.disabledInput]}
            placeholder="Max threshold"
            keyboardType="numeric"
            editable={isCustom}
          />
          <View style={styles.switchRow}>
            <Text>Custom</Text>
            <Switch
              value={isCustom}
              onValueChange={setIsCustom}
              trackColor={{ false: "#767577", true: Colors.darkGreen.color }}
            />
          </View>
        </View>
      </View>
    </View>
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
          <>
            <View style={styles.headerContainer}>
              <Text className="text-4xl font-pextrabold text-center text-green pt-10">
                Fitlicious
              </Text>
            </View>
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
          </>
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
                <Text style={styles.categoryTitle}>{category}</Text>
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
    height: "100%",
    width: "100%",
    backgroundColor: Colors.white.color,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  backButton: {
    paddingLeft: 20,
    paddingBottom: 30,
  },
  scrollViewContainer: {
    flexGrow: 1,
    alignItems: "center",
  },
  tabsContainer: {
    width: "90%",
    backgroundColor: Colors.lightGreen.color,
    padding: 15,
    borderRadius: 15,
  },
  tabContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: Colors.lightGreen.color,
    borderBottomWidth: 1,
    borderBottomColor: Colors.white.color,
  },
  tabTitle: {
    flex: 1,
    fontSize: 16,
  },
  arrowIcon: {
    color: Colors.darkGreen.color,
  },
  nutrientsContainer: {
    width: "100%",
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: Colors.darkGreen.color,
  },
  nutrientRow: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.white.color,
  },
  inputContainer: {
    flex: 1,
  },
  inputSwitchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 2,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.white.color,
    padding: 5,
    borderRadius: 5,
    marginRight: 10,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 100,
    justifyContent: "space-between",
  },
  nutrientTitle: {
    fontSize: 16,
    marginBottom: 5,
  },
  disabledInput: {
    backgroundColor: "#f0f0f0",
    color: "#888",
  },
});
