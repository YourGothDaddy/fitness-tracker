import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Animated,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { Colors } from "../../../../../constants/Colors";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import nutritionService from "@/app/services/nutritionService";

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

const CategoryTab = ({ title, count, onPress }) => (
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
        <Text style={styles.itemCount}>{`${count} items`}</Text>
      </View>
      <MaterialIcons
        name="chevron-right"
        size={24}
        color={Colors.darkGreen.color}
      />
    </View>
  </TouchableOpacity>
);

const NutrientRow = ({ nutrient, onUpdate }) => {
  const [isVisible, setIsVisible] = useState(nutrient.IsTracked);
  const [isCustom, setIsCustom] = useState(nutrient.HasMaxThreshold);
  const [target, setTarget] = useState(
    nutrient.DailyTarget !== null && nutrient.DailyTarget !== undefined
      ? nutrient.DailyTarget.toString()
      : ""
  );
  const [threshold, setThreshold] = useState(
    nutrient.MaxThreshold !== null && nutrient.MaxThreshold !== undefined
      ? nutrient.MaxThreshold.toString()
      : ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Update backend when any value changes
  const handleUpdate = async (changes) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await onUpdate({
        ...nutrient,
        IsTracked: changes?.IsTracked ?? isVisible,
        DailyTarget:
          changes?.DailyTarget !== undefined
            ? changes.DailyTarget
            : target === ""
            ? null
            : parseFloat(target),
        HasMaxThreshold: changes?.HasMaxThreshold ?? isCustom,
        MaxThreshold:
          changes?.MaxThreshold !== undefined
            ? changes.MaxThreshold
            : threshold === ""
            ? null
            : parseFloat(threshold),
      });
      setIsVisible(updated.IsTracked);
      setIsCustom(updated.HasMaxThreshold);
      setTarget(
        updated.DailyTarget !== null && updated.DailyTarget !== undefined
          ? updated.DailyTarget.toString()
          : ""
      );
      setThreshold(
        updated.MaxThreshold !== null && updated.MaxThreshold !== undefined
          ? updated.MaxThreshold.toString()
          : ""
      );
    } catch (err) {
      setError("Failed to update. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Animated.View style={styles.nutrientCard}>
      <Text style={styles.nutrientTitle}>{nutrient.NutrientName}</Text>
      <View style={styles.targetContainer}>
        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>Daily Target</Text>
          <TextInput
            style={[styles.input, isVisible && styles.activeInput]}
            placeholder="0"
            keyboardType="numeric"
            value={target}
            onChangeText={(val) => setTarget(val)}
            onBlur={() =>
              handleUpdate({
                DailyTarget: target === "" ? null : parseFloat(target),
              })
            }
            editable={isVisible}
          />
          <Text style={styles.unit}>mg</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.visibilityButton,
            isVisible && styles.visibilityButtonActive,
          ]}
          onPress={() => {
            setIsVisible((prev) => {
              handleUpdate({ IsTracked: !prev });
              return !prev;
            });
          }}
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
            onChangeText={(val) => setThreshold(val)}
            onBlur={() =>
              handleUpdate({
                MaxThreshold: threshold === "" ? null : parseFloat(threshold),
              })
            }
            editable={isCustom}
          />
          <Text style={styles.unit}>mg</Text>
        </View>
        <TouchableOpacity
          style={[styles.customButton, isCustom && styles.customButtonActive]}
          onPress={() => {
            setIsCustom((prev) => {
              handleUpdate({ HasMaxThreshold: !prev });
              return !prev;
            });
          }}
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
      {loading && (
        <ActivityIndicator size="small" color={Colors.darkGreen.color} />
      )}
      {error && <Text style={{ color: "red" }}>{error}</Text>}
    </Animated.View>
  );
};

const NutrientTargetsView = () => {
  const router = useRouter();
  const { hideHeader, category } = useLocalSearchParams();
  const [nutrientTargets, setNutrientTargets] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTargets = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await nutritionService.getUserNutrientTargets();
        // Normalize property names for compatibility
        const normalized = data.map((item) => ({
          ...item,
          NutrientName: item.NutrientName || item.Name || item.nutrientName,
          Category: item.Category || item.category,
          IsTracked: item.IsTracked ?? item.isTracked ?? false,
          HasMaxThreshold:
            item.HasMaxThreshold ?? item.hasMaxThreshold ?? false,
          DailyTarget: item.DailyTarget ?? item.dailyTarget ?? null,
          MaxThreshold: item.MaxThreshold ?? item.maxThreshold ?? null,
        }));
        // Group by category
        const grouped = {};
        normalized.forEach((item) => {
          if (!item.Category) return;
          if (!grouped[item.Category]) grouped[item.Category] = [];
          grouped[item.Category].push(item);
        });
        setNutrientTargets(grouped);
      } catch (err) {
        setError("Failed to load nutrient targets.");
      } finally {
        setLoading(false);
      }
    };
    fetchTargets();
  }, []);

  const handleUpdate = async (updated) => {
    const result = await nutritionService.updateUserNutrientTarget({
      NutrientName: updated.NutrientName,
      Category: updated.Category,
      IsTracked: updated.IsTracked,
      DailyTarget:
        updated.DailyTarget === "" ? null : parseFloat(updated.DailyTarget),
      HasMaxThreshold: updated.HasMaxThreshold,
      MaxThreshold:
        updated.MaxThreshold === "" ? null : parseFloat(updated.MaxThreshold),
    });
    // Normalize result to PascalCase
    const normalizedResult = {
      ...result,
      NutrientName: result.NutrientName || result.Name || result.nutrientName,
      Category: result.Category || result.category,
      IsTracked: result.IsTracked ?? result.isTracked ?? false,
      HasMaxThreshold:
        result.HasMaxThreshold ?? result.hasMaxThreshold ?? false,
      DailyTarget: result.DailyTarget ?? result.dailyTarget ?? null,
      MaxThreshold: result.MaxThreshold ?? result.maxThreshold ?? null,
    };
    // Update local state optimistically
    setNutrientTargets((prev) => {
      const updatedList = prev[updated.Category].map((n) =>
        n.NutrientName === updated.NutrientName ? normalizedResult : n
      );
      return { ...prev, [updated.Category]: updatedList };
    });
    return normalizedResult;
  };

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
            {loading ? (
              <View style={styles.loadingContentContainer}>
                <ActivityIndicator
                  size="large"
                  color={Colors.darkGreen.color}
                />
              </View>
            ) : error ? (
              <View style={styles.loadingContentContainer}>
                <Text style={{ color: "red" }}>{error}</Text>
              </View>
            ) : !category ? (
              Object.keys(nutrientTargets).map((cat) => (
                <CategoryTab
                  key={cat}
                  title={cat}
                  count={nutrientTargets[cat].length}
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
                    {nutrientTargets[category]?.length || 0} items
                  </Text>
                </View>
                {nutrientTargets[category]?.map((nutrient) => (
                  <NutrientRow
                    key={`${nutrient.Category}-${nutrient.NutrientName}`}
                    nutrient={nutrient}
                    onUpdate={handleUpdate}
                  />
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
  loadingContentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 200,
  },
});
