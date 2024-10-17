import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../../constants/Colors";
import React from "react";

const TargetsView = () => {
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

  // Original data array for main targets
  const data = [
    {
      label: "Energy",
      consumed: 180.7,
      required: 1358.7,
      color: Colors.white.color,
    },
    {
      label: "Protein",
      consumed: 14.7,
      required: 84.9,
      color: Colors.green.color,
    },
    {
      label: "Net Carbs",
      consumed: 20.0,
      required: 100.0,
      color: Colors.blue.color,
    },
    { label: "Fat", consumed: 10.0, required: 70.0, color: Colors.red.color },
  ];

  // Sample data array for additional categories
  const sampleData = [
    // Carbohydrates
    { label: "Fiber", consumed: 10, required: 25 },
    { label: "Starch", consumed: 30, required: 50 },
    { label: "Sugars", consumed: 20, required: 30 },
    { label: "Galactose", consumed: 5, required: 10 },
    { label: "Glucose", consumed: 15, required: 20 },
    { label: "Sucrose", consumed: 10, required: 15 },
    { label: "Lactose", consumed: 8, required: 12 },
    { label: "Maltose", consumed: 6, required: 10 },
    { label: "Fructose", consumed: 12, required: 18 },

    // Amino Acids
    { label: "Alanine", consumed: 5, required: 10 },
    { label: "Arginine", consumed: 7, required: 15 },
    { label: "AsparticAcid", consumed: 6, required: 12 },
    { label: "Valine", consumed: 5, required: 10 },
    { label: "Glycine", consumed: 4, required: 8 },
    { label: "Glutamine", consumed: 9, required: 15 },
    { label: "Isoleucine", consumed: 6, required: 12 },
    { label: "Leucine", consumed: 8, required: 16 },
    { label: "Lysine", consumed: 7, required: 14 },
    { label: "Methionine", consumed: 5, required: 10 },
    { label: "Proline", consumed: 6, required: 12 },
    { label: "Serine", consumed: 5, required: 10 },
    { label: "Tyrosine", consumed: 4, required: 8 },
    { label: "Threonine", consumed: 6, required: 12 },
    { label: "Tryptophan", consumed: 3, required: 6 },
    { label: "Phenylalanine", consumed: 5, required: 10 },
    { label: "Hydroxyproline", consumed: 2, required: 5 },
    { label: "Histidine", consumed: 4, required: 8 },
    { label: "Cystine", consumed: 3, required: 6 },

    // Fats
    { label: "TotalFats", consumed: 20, required: 70 },
    { label: "MonounsaturatedFats", consumed: 10, required: 30 },
    { label: "PolyunsaturatedFats", consumed: 8, required: 25 },
    { label: "SaturatedFats", consumed: 12, required: 20 },
    { label: "TransFats", consumed: 2, required: 5 },

    // Minerals
    { label: "Iron", consumed: 8, required: 18 },
    { label: "Potassium", consumed: 2000, required: 3500 },
    { label: "Calcium", consumed: 1000, required: 1300 },
    { label: "Magnesium", consumed: 300, required: 400 },
    { label: "Manganese", consumed: 2, required: 5 },
    { label: "Copper", consumed: 1, required: 2 },
    { label: "Sodium", consumed: 1500, required: 2300 },
    { label: "Selenium", consumed: 55, required: 70 },
    { label: "Fluoride", consumed: 3, required: 4 },
    { label: "Phosphorus", consumed: 700, required: 1000 },
    { label: "Zinc", consumed: 8, required: 11 },

    // Other
    { label: "Alcohol", consumed: 0, required: 10 },
    { label: "Water", consumed: 2000, required: 3000 },
    { label: "Caffeine", consumed: 100, required: 400 },
    { label: "Theobromine", consumed: 50, required: 100 },
    { label: "Ash", consumed: 5, required: 10 },

    // Sterols
    { label: "Cholesterol", consumed: 150, required: 300 },
    { label: "Phytosterols", consumed: 100, required: 200 },
    { label: "Stigmasterols", consumed: 50, required: 100 },
    { label: "Campesterol", consumed: 30, required: 60 },
    { label: "BetaSitosterols", consumed: 70, required: 140 },

    // Vitamins
    { label: "Betaine", consumed: 500, required: 900 },
    { label: "VitaminA", consumed: 500, required: 900 },
    { label: "VitaminB1", consumed: 1, required: 1.5 },
    { label: "VitaminB2", consumed: 1.2, required: 1.7 },
    { label: "VitaminB3", consumed: 15, required: 20 },
    { label: "VitaminB4", consumed: 500, required: 900 },
    { label: "VitaminB5", consumed: 5, required: 10 },
    { label: "VitaminB6", consumed: 1.3, required: 2 },
    { label: "VitaminB9", consumed: 400, required: 600 },
    { label: "VitaminB12", consumed: 2.4, required: 3 },
    { label: "VitaminC", consumed: 60, required: 90 },
    { label: "VitaminD", consumed: 15, required: 20 },
    { label: "VitaminE", consumed: 15, required: 20 },
    { label: "VitaminK1", consumed: 90, required: 120 },
    { label: "VitaminK2", consumed: 90, required: 120 },
  ];

  console.log("Colors object:", Colors);

  return (
    <SafeAreaView style={styles.safeAreaViewContainer}>
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        <View style={styles.targetsContainer}>
          {/* First targetContainer for main data */}
          <View style={styles.targetContainer}>
            <Text style={styles.categoryLabel}>Main Targets</Text>
            {data.map((item, index) => {
              const percentage = (
                (item.consumed / item.required) *
                100
              ).toFixed(0);
              return (
                <View key={index} style={styles.mainRowContainer}>
                  <Text style={styles.rowLabel}>
                    {item.label}: {item.consumed}/{item.required}{" "}
                    {item.label === "Energy" ? "kcal" : "g"}
                  </Text>
                  <View style={styles.rowBarContainer}>
                    <View style={styles.rowBar}>
                      <View
                        style={[
                          styles.rowFill,
                          {
                            width: `${percentage}%`,
                            backgroundColor: Colors.green.color,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.rowPercentage}>{percentage}%</Text>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Additional targetContainers for each category */}
          {Object.entries(categories).map(([category, nutrients], catIndex) => (
            <View key={catIndex} style={styles.compactTargetContainer}>
              <Text style={styles.categoryLabel}>{category}</Text>
              {nutrients
                .reduce((result, nutrient, index) => {
                  if (index % 2 === 0) {
                    result.push(nutrients.slice(index, index + 2));
                  }
                  return result;
                }, [])
                .map((pair, pairIndex) => (
                  <View key={pairIndex} style={styles.rowContainer}>
                    {pair.map((nutrient, index) => {
                      const item = sampleData.find(
                        (d) => d.label === nutrient
                      ) || {
                        label: nutrient,
                        consumed: 0,
                        required: 100,
                      };

                      const percentage = (
                        (item.consumed / item.required) *
                        100
                      ).toFixed(0);
                      return (
                        <View key={index} style={styles.halfRowContainer}>
                          <Text style={styles.rowLabel}>
                            {item.label}: {item.consumed}/{item.required}{" "}
                            {item.label === "Energy" ? "kcal" : "g"}
                          </Text>
                          <View style={styles.rowBarContainer}>
                            <View style={styles.rowBar}>
                              <View
                                style={[
                                  styles.rowFill,
                                  {
                                    width: `${percentage}%`,
                                    backgroundColor: Colors.green.color,
                                  },
                                ]}
                              />
                            </View>
                            <Text style={styles.rowPercentage}>
                              {percentage}%
                            </Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TargetsView;

const styles = StyleSheet.create({
  safeAreaViewContainer: {
    flex: 1,
  },
  scrollViewContainer: {
    flexGrow: 1,
    alignItems: "center",
    paddingVertical: 10,
  },
  targetsContainer: {
    width: "90%",
  },
  targetContainer: {
    flex: 1,
    marginBottom: 20,
    padding: 10,
    backgroundColor: Colors.lightGreen.color,
    borderWidth: 0.3,
    borderRadius: 15,
    borderColor: Colors.darkGreen.color,
    justifyContent: "center",
  },
  compactTargetContainer: {
    flex: 1,
    marginBottom: 10,
    padding: 5,
    backgroundColor: Colors.lightGreen.color,
    borderWidth: 0.3,
    borderRadius: 10,
    borderColor: Colors.darkGreen.color,
    justifyContent: "center",
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.darkGreen.color,
    marginBottom: 5,
  },
  mainRowContainer: {
    marginVertical: 5,
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 5,
  },
  halfRowContainer: {
    flex: 0.48,
  },
  rowLabel: {
    fontSize: 14,
    color: Colors.darkGreen.color,
    marginBottom: 5,
  },
  rowBarContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  rowBar: {
    flex: 1,
    height: 10,
    backgroundColor: Colors.gray.color,
    borderRadius: 10,
    overflow: "hidden",
    marginRight: 10,
  },
  rowFill: {
    height: "100%",
  },
  rowPercentage: {
    fontSize: 14,
    color: Colors.darkGreen.color,
  },
});
