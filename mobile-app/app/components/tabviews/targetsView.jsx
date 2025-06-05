import { View, Text, StyleSheet, Platform, Dimensions } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import { Colors } from "../../../constants/Colors";
import { nutritionService } from "@/app/services/nutritionService";

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

  // State for main targets
  const [mainTargets, setMainTargets] = useState([]);
  const [carbohydratesData, setCarbohydratesData] = useState(null);
  const [aminoAcidsData, setAminoAcidsData] = useState(null);
  const [fatsData, setFatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const today = new Date();
        console.log("Fetching data for date:", today.toISOString());

        // Fetch main targets first
        try {
          const mainTargetsData = await nutritionService.getMainTargets(today);
          console.log("Main targets data received:", mainTargetsData);
          setMainTargets(mainTargetsData.targets);
        } catch (mainTargetsError) {
          console.error("Error fetching main targets:", mainTargetsError);
          setError("Failed to load main targets");
          return;
        }

        // Then fetch carbohydrates
        try {
          const carbsData = await nutritionService.getCarbohydrates(today);
          console.log("Carbohydrates data received:", carbsData);
          setCarbohydratesData(carbsData);
        } catch (carbsError) {
          console.error("Error fetching carbohydrates:", carbsError);
          // Don't set error here as we still want to show main targets
        }

        // Then fetch amino acids
        try {
          const aminoAcidsData = await nutritionService.getAminoAcids(today);
          console.log("Amino acids data received:", aminoAcidsData);
          setAminoAcidsData(aminoAcidsData);
        } catch (aminoAcidsError) {
          console.error("Error fetching amino acids:", aminoAcidsError);
          // Don't set error here as we still want to show main targets
        }

        // Then fetch fats
        try {
          const fatsData = await nutritionService.getFats(today);
          console.log("Fats data received:", fatsData);
          setFatsData(fatsData);
        } catch (fatsError) {
          console.error("Error fetching fats:", fatsError);
          // Don't set error here as we still want to show main targets
        }
      } catch (err) {
        console.error("General error in fetchData:", err);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const renderProgressBar = (consumed, required) => {
    const percentage = Math.min((consumed / required) * 100, 100);
    return (
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBar}>
          <LinearGradient
            colors={
              percentage > 90 ? ["#ff7675", "#d63031"] : ["#8cc63f", "#619819"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${percentage}%` }]}
          />
        </View>
        <Text style={styles.progressText}>{percentage.toFixed(0)}%</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Main Targets Card */}
      <LinearGradient colors={["#ffffff", "#f8faf5"]} style={styles.mainCard}>
        <View style={styles.cardHeader}>
          <MaterialIcons name="stars" size={24} color="#619819" />
          <Text style={styles.cardTitle}>Main Targets</Text>
        </View>

        {loading ? (
          <Text>Loading...</Text>
        ) : error ? (
          <Text style={{ color: "red" }}>{error}</Text>
        ) : (
          (Array.isArray(mainTargets) ? mainTargets : []).map((item, index) => (
            <View key={index} style={styles.mainTargetRow}>
              <View style={styles.targetIconContainer}>
                <LinearGradient
                  colors={[item.color, shadeColor(item.color, 20)]}
                  style={styles.targetIconGradient}
                >
                  <MaterialIcons
                    name={
                      item.label === "Energy"
                        ? "local-fire-department"
                        : item.label === "Protein"
                        ? "fitness-center"
                        : item.label === "Net Carbs"
                        ? "grain"
                        : "opacity"
                    }
                    size={20}
                    color="white"
                  />
                </LinearGradient>
              </View>
              <View style={styles.targetInfo}>
                <Text style={styles.targetLabel}>{item.label}</Text>
                <Text style={styles.targetValues}>
                  {item.consumed}/{item.required}{" "}
                  {item.label === "Energy" ? "kcal" : "g"}
                </Text>
              </View>
              {renderProgressBar(item.consumed, item.required)}
            </View>
          ))
        )}
      </LinearGradient>

      {/* Category Cards */}
      {Object.entries(categories).map(([category, nutrients], catIndex) => (
        <LinearGradient
          key={catIndex}
          colors={["#ffffff", "#f8faf5"]}
          style={styles.categoryCard}
        >
          <View style={styles.cardHeader}>
            <MaterialIcons
              name={
                category === "Carbohydrates"
                  ? "grain"
                  : category === "AminoAcids"
                  ? "science"
                  : category === "Fats"
                  ? "opacity"
                  : category === "Minerals"
                  ? "diamond"
                  : category === "Vitamins"
                  ? "medication"
                  : category === "Sterols"
                  ? "biotech"
                  : "category"
              }
              size={24}
              color="#619819"
            />
            <Text style={styles.cardTitle}>{category}</Text>
          </View>

          <View style={styles.nutrientsGrid}>
            {nutrients.map((nutrient, index) => {
              let item;
              if (category === "Carbohydrates" && carbohydratesData) {
                const nutrientData = carbohydratesData.nutrients.find(
                  (n) => n.label === nutrient
                );
                if (nutrientData) {
                  item = {
                    label: nutrient,
                    consumed: nutrientData.consumed,
                    required: nutrientData.required,
                  };
                }
              } else if (category === "AminoAcids" && aminoAcidsData) {
                const nutrientData = aminoAcidsData.nutrients.find(
                  (n) => n.label === nutrient
                );
                if (nutrientData) {
                  item = {
                    label: nutrient,
                    consumed: nutrientData.consumed,
                    required: nutrientData.required,
                  };
                }
              } else if (category === "Fats" && fatsData) {
                const nutrientData = fatsData.nutrients.find(
                  (n) => n.label === nutrient
                );
                if (nutrientData) {
                  item = {
                    label: nutrient,
                    consumed: nutrientData.consumed,
                    required: nutrientData.required,
                  };
                }
              }

              if (!item) {
                item = {
                  label: nutrient,
                  consumed: 0,
                  required: 100,
                };
              }

              return (
                <View key={index} style={styles.nutrientItem}>
                  <Text style={styles.nutrientLabel}>{nutrient}</Text>
                  <Text style={styles.nutrientValues}>
                    {item.consumed === null ? "Unknown" : item.consumed}/
                    {item.required}g
                  </Text>
                  {item.consumed !== null &&
                    renderProgressBar(item.consumed, item.required)}
                </View>
              );
            })}
          </View>
        </LinearGradient>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 20,
  },
  mainCard: {
    borderRadius: 20,
    padding: 20,
    backgroundColor: "#ffffff",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  categoryCard: {
    borderRadius: 20,
    padding: 20,
    backgroundColor: "#ffffff",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2d3436",
  },
  mainTargetRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "rgba(97, 152, 25, 0.05)",
    borderRadius: 12,
    marginBottom: 12,
  },
  targetIconContainer: {
    marginRight: 12,
  },
  targetIconGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  targetInfo: {
    flex: 1,
    marginRight: 12,
  },
  targetLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2d3436",
  },
  targetValues: {
    fontSize: 14,
    color: "#636e72",
  },
  progressBarContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: "rgba(97, 152, 25, 0.1)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#619819",
    width: 40,
    textAlign: "right",
  },
  nutrientsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  nutrientItem: {
    width: "48%",
    backgroundColor: "rgba(97, 152, 25, 0.05)",
    borderRadius: 12,
    padding: 12,
  },
  nutrientLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2d3436",
    marginBottom: 4,
  },
  nutrientValues: {
    fontSize: 12,
    color: "#636e72",
    marginBottom: 8,
  },
});

// Helper function to darken/lighten colors
const shadeColor = (color, percent) => {
  const num = parseInt(color.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00ff) + amt;
  const B = (num & 0x0000ff) + amt;
  return `#${(
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  )
    .toString(16)
    .slice(1)}`;
};

export default TargetsView;
