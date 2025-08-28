import {
  View,
  Text,
  StyleSheet,
  Platform,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import Icon from "../../../components/Icon";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Colors } from "../../../constants/Colors";
import { nutritionService } from "@/app/services/nutritionService";
import { useFocusEffect } from "@react-navigation/native";
import Svg, { Circle, Path } from "react-native-svg";

// Circular Progress Component
const CircularProgress = ({
  percentage,
  size = 36,
  strokeWidth = 2,
  color = "#8cc63f",
}) => {
  const safeSize = Number.isFinite(size) ? size : 36;
  const safeStroke = Number.isFinite(strokeWidth) ? strokeWidth : 2;
  const outerRadius = Math.max(0, (safeSize - safeStroke) / 2);
  const pct = Number.isFinite(percentage)
    ? Math.max(0, Math.min(percentage, 100))
    : 0;
  const innerRadius = (pct / 100) * outerRadius;

  return (
    <View style={{ width: safeSize, height: safeSize }}>
      <Svg width={safeSize} height={safeSize}>
        {/* Outer circle (solid white background) */}
        <Circle
          cx={safeSize / 2}
          cy={safeSize / 2}
          r={outerRadius}
          fill="white"
        />
        {/* Inner progress circle that grows from center */}
        <Circle
          cx={safeSize / 2}
          cy={safeSize / 2}
          r={innerRadius}
          fill={color}
        />
        {/* Checkmark when 100% */}
        {Math.round(pct) >= 100 && (
          <>
            {console.log(
              `Rendering checkmark for ${pct}% (rounded: ${Math.round(pct)})`
            )}
            <Path
              d="M 10 18 L 15 23 L 26 12"
              stroke="white"
              strokeWidth={4}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={1}
            />
          </>
        )}
      </Svg>
    </View>
  );
};

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

  // State for main targets
  const [mainTargets, setMainTargets] = useState([]);
  const [carbohydratesData, setCarbohydratesData] = useState(null);
  const [aminoAcidsData, setAminoAcidsData] = useState(null);
  const [fatsData, setFatsData] = useState(null);
  const [mineralsData, setMineralsData] = useState(null);
  const [otherData, setOtherData] = useState(null);
  const [sterolsData, setSterolsData] = useState(null);
  const [vitaminsData, setVitaminsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetailed, setLoadingDetailed] = useState(false);
  const [error, setError] = useState(null);

  // New state for user nutrient targets
  const [userNutrientTargets, setUserNutrientTargets] = useState({});
  const [loadingTargets, setLoadingTargets] = useState(true);

  const fetchUserNutrientTargets = useCallback(async () => {
    setLoadingTargets(true);
    try {
      const data = await nutritionService.getUserNutrientTargets();
      // Normalize property names for compatibility
      const normalized = data.map((item) => ({
        ...item,
        NutrientName: item.NutrientName || item.Name || item.nutrientName,
        Category: item.Category || item.category,
        IsTracked: item.IsTracked ?? item.isTracked ?? false,
        DailyTarget: item.DailyTarget ?? item.dailyTarget ?? null,
      }));

      // Group by category
      const grouped = {};
      normalized.forEach((item) => {
        if (!item.Category) return;
        if (!grouped[item.Category]) grouped[item.Category] = [];
        grouped[item.Category].push(item);
      });
      setUserNutrientTargets(grouped);
    } catch (err) {
      console.log("Failed to load user nutrient targets:", err);
      setUserNutrientTargets({});
    } finally {
      setLoadingTargets(false);
    }
  }, []);

  const fetchMainTargets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const today = new Date();
      const mainTargetsData = await nutritionService.getMainTargets(today);
      setMainTargets(mainTargetsData.targets);
      setError("");
    } catch (mainTargetsError) {
      setError("Failed to load main targets");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDetailedNutrients = useCallback(async () => {
    setLoadingDetailed(true);
    const today = new Date();

    // Fetch all detailed nutrient data in parallel
    const promises = [
      nutritionService.getCarbohydrates(today).catch(() => null),
      nutritionService.getAminoAcids(today).catch(() => null),
      nutritionService.getFats(today).catch(() => null),
      nutritionService.getMinerals(today).catch(() => null),
      nutritionService.getOtherNutrients(today).catch(() => null),
      nutritionService.getSterols(today).catch(() => null),
      nutritionService.getVitamins(today).catch(() => null),
    ];

    try {
      const [
        carbsData,
        aminoAcidsData,
        fatsData,
        mineralsData,
        otherData,
        sterolsData,
        vitaminsData,
      ] = await Promise.all(promises);

      setCarbohydratesData(carbsData);
      setAminoAcidsData(aminoAcidsData);
      setFatsData(fatsData);
      setMineralsData(mineralsData);
      setOtherData(otherData);
      setSterolsData(sterolsData);
      setVitaminsData(vitaminsData);
    } catch (err) {
      // Silently handle errors for detailed nutrients
      console.log("Some detailed nutrients failed to load");
    } finally {
      setLoadingDetailed(false);
    }
  }, []);

  // Define renderProgressBar function first
  const renderProgressBar = useCallback((consumed, required) => {
    const c = Number(consumed);
    const r = Number(required);
    let percentage = 0;
    if (Number.isFinite(c) && Number.isFinite(r) && r > 0) {
      percentage = Math.max(0, Math.min((c / r) * 100, 100));
    }
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
  }, []);

  // Use useFocusEffect to refresh data when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Fetch user nutrient targets first
      fetchUserNutrientTargets();
      // Fetch main targets immediately (fast)
      fetchMainTargets();
      // Fetch detailed nutrients in the background (slower, but doesn't block UI)
      fetchDetailedNutrients();
    }, [fetchUserNutrientTargets, fetchMainTargets, fetchDetailedNutrients])
  );

  // Memoize the main targets rendering
  const memoizedMainTargets = useMemo(() => {
    return (Array.isArray(mainTargets) ? mainTargets : []).map(
      (item, index) => {
        const c = Number(item?.consumed);
        const r = Number(item?.required);
        let percentage = 0;
        if (Number.isFinite(c) && Number.isFinite(r) && r > 0) {
          percentage = Math.max(0, Math.min((c / r) * 100, 100));
        }
        // Debug logging
        console.log(`${item.label}: ${c}/${r} = ${percentage}%`);
        // Fix floating point precision issues - if very close to 100%, make it 100%
        if (percentage >= 99.5) {
          percentage = 100;
          console.log(`${item.label}: Adjusted to 100%`);
        }
        const consumedText = Number.isFinite(c) ? c.toFixed(1) : "0.0";
        const requiredText = Number.isFinite(r) ? r.toFixed(1) : "0.0";
        return (
          <View key={index} style={styles.mainTargetRow}>
            <View style={styles.targetIconContainer}>
              <View style={styles.targetIconGradient}>
                <CircularProgress
                  percentage={percentage}
                  size={36}
                  strokeWidth={2}
                  color="#8cc63f"
                />
              </View>
            </View>
            <View style={styles.targetInfo}>
              <Text style={styles.targetLabel}>{item.label}</Text>
              <Text style={styles.targetValues}>
                {consumedText}/{requiredText}{" "}
                {item.label === "Energy" ? "kcal" : "g"}
              </Text>
            </View>
            {renderProgressBar(c, r)}
          </View>
        );
      }
    );
  }, [mainTargets, renderProgressBar]);

  // Helper function to get tracked nutrients for a category
  const getTrackedNutrients = (category) => {
    if (!userNutrientTargets[category]) return [];

    return userNutrientTargets[category]
      .filter((nutrient) => nutrient.IsTracked)
      .map((nutrient) => nutrient.NutrientName);
  };

  // Helper function to check if a category has any tracked nutrients
  const hasTrackedNutrients = (category) => {
    return getTrackedNutrients(category).length > 0;
  };

  return (
    <View style={styles.container}>
      {/* Main Targets Card */}
      <LinearGradient colors={["#ffffff", "#f8faf5"]} style={styles.mainCard}>
        <View style={styles.cardHeader}>
          <Icon name="stars" size={24} color="#619819" />
          <Text style={styles.cardTitle}>Main Targets</Text>
        </View>

        {loading ? (
          <View style={styles.loadingContentContainer}>
            <ActivityIndicator size="large" color={Colors.darkGreen.color} />
          </View>
        ) : error ? (
          <Text style={{ color: "red" }}>{error}</Text>
        ) : (
          memoizedMainTargets
        )}
      </LinearGradient>

      {/* Category Cards - Only show categories with tracked nutrients */}
      {loadingDetailed || loadingTargets ? (
        <LinearGradient
          colors={["#ffffff", "#f8faf5"]}
          style={styles.categoryCard}
        >
          <View style={styles.cardHeader}>
            <Icon name="hourglass-empty" size={24} color="#619819" />
            <Text style={styles.cardTitle}>Loading Detailed Nutrients...</Text>
          </View>
          <View style={styles.loadingContentContainer}>
            <ActivityIndicator size="large" color={Colors.darkGreen.color} />
            <Text style={styles.loadingText}>
              Loading detailed nutrient data...
            </Text>
          </View>
        </LinearGradient>
      ) : (
        Object.entries(categories)
          .filter(([category]) => hasTrackedNutrients(category))
          .map(([category, nutrients], catIndex) => {
            const trackedNutrients = getTrackedNutrients(category);

            return (
              <LinearGradient
                key={catIndex}
                colors={["#ffffff", "#f8faf5"]}
                style={styles.categoryCard}
              >
                <View style={styles.cardHeader}>
                  <Icon
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
                  {nutrients
                    .filter((nutrient) => trackedNutrients.includes(nutrient))
                    .map((nutrient, index) => {
                      // Get user's custom target for this nutrient
                      const userTarget = userNutrientTargets[category]?.find(
                        (n) => n.NutrientName === nutrient
                      );

                      let item;
                      if (category === "Carbohydrates" && carbohydratesData) {
                        const nutrientData = carbohydratesData.nutrients.find(
                          (n) => n.label === nutrient
                        );
                        if (nutrientData) {
                          item = {
                            label: nutrient,
                            consumed: nutrientData.consumed,
                            required:
                              userTarget?.DailyTarget || nutrientData.required,
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
                            required:
                              userTarget?.DailyTarget || nutrientData.required,
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
                            required:
                              userTarget?.DailyTarget || nutrientData.required,
                          };
                        }
                      } else if (category === "Minerals" && mineralsData) {
                        const nutrientData = mineralsData.nutrients.find(
                          (n) => n.label === nutrient
                        );
                        if (nutrientData) {
                          item = {
                            label: nutrient,
                            consumed: nutrientData.consumed,
                            required:
                              userTarget?.DailyTarget || nutrientData.required,
                          };
                        }
                      } else if (category === "Other" && otherData) {
                        const nutrientData = otherData.nutrients.find(
                          (n) => n.label === nutrient
                        );
                        if (nutrientData) {
                          item = {
                            label: nutrient,
                            consumed: nutrientData.consumed,
                            required:
                              userTarget?.DailyTarget || nutrientData.required,
                          };
                        }
                      } else if (category === "Sterols" && sterolsData) {
                        const nutrientData = sterolsData.nutrients.find(
                          (n) => n.label === nutrient
                        );
                        if (nutrientData) {
                          item = {
                            label: nutrient,
                            consumed: nutrientData.consumed,
                            required:
                              userTarget?.DailyTarget || nutrientData.required,
                          };
                        }
                      } else if (category === "Vitamins" && vitaminsData) {
                        const nutrientData = vitaminsData.nutrients.find(
                          (n) => n.label === nutrient
                        );
                        if (nutrientData) {
                          item = {
                            label: nutrient,
                            consumed: nutrientData.consumed,
                            required:
                              userTarget?.DailyTarget || nutrientData.required,
                          };
                        }
                      }

                      if (!item) {
                        item = {
                          label: nutrient,
                          consumed: 0,
                          required: userTarget?.DailyTarget || 100,
                        };
                      }

                      return (
                        <View key={index} style={styles.nutrientItem}>
                          <View style={styles.nutrientHeader}>
                            <Text style={styles.nutrientLabel}>{nutrient}</Text>
                            {userTarget?.DailyTarget && (
                              <Icon
                                name="edit"
                                size={12}
                                color={Colors.darkGreen.color}
                                style={styles.customTargetIcon}
                              />
                            )}
                          </View>
                          <Text style={styles.nutrientValues}>
                            {item.consumed === null ? "Unknown" : item.consumed}
                            /{item.required}g
                          </Text>
                          {item.consumed !== null &&
                            renderProgressBar(item.consumed, item.required)}
                        </View>
                      );
                    })}
                </View>
              </LinearGradient>
            );
          })
      )}

      {/* Show message if no tracked nutrients */}
      {!loadingDetailed &&
        !loadingTargets &&
        Object.keys(categories).every(
          (category) => !hasTrackedNutrients(category)
        ) && (
          <LinearGradient
            colors={["#ffffff", "#f8faf5"]}
            style={styles.categoryCard}
          >
            <View style={styles.cardHeader}>
              <Icon name="visibility-off" size={24} color="#619819" />
              <Text style={styles.cardTitle}>No Tracked Nutrients</Text>
            </View>
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateText}>
                You haven't made any nutrients visible yet. Go to More → Targets
                → Nutrient Targets to configure which nutrients you want to
                track.
              </Text>
            </View>
          </LinearGradient>
        )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 20,
    paddingBottom: 32,
  },
  mainCard: {
    borderRadius: 20,
    padding: 20,
    backgroundColor: "#ffffff",
    overflow: "hidden",
    marginBottom: 20,
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
    overflow: "hidden",
    marginBottom: 20,
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
    fontSize: 16,
    fontWeight: "600",
    color: "#2d3436",
  },
  mainTargetRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(97, 152, 25, 0.08)",
    marginBottom: 12,
  },
  targetIconContainer: {
    marginRight: 16,
  },
  targetIconGradient: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  targetInfo: {
    flex: 1,
    marginRight: 12,
  },
  targetLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2d3436",
  },
  targetValues: {
    fontSize: 12,
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
    fontSize: 12,
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
    borderWidth: 1,
    borderColor: "rgba(97, 152, 25, 0.08)",
    borderRadius: 12,
    padding: 16,
  },
  nutrientHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  nutrientLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2d3436",
    flex: 1,
  },
  customTargetIcon: {
    marginLeft: 4,
  },
  nutrientValues: {
    fontSize: 12,
    color: "#636e72",
    marginBottom: 8,
  },
  loadingContentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 100,
  },
  loadingText: {
    fontSize: 14,
    color: "#636e72",
    marginTop: 10,
    textAlign: "center",
  },
  emptyStateContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: 14,
    color: "#636e72",
    textAlign: "center",
    lineHeight: 20,
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
