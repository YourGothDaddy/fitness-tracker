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
import Icon from "../../../../../components/Icon";
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
        <Icon
          name={getCategoryIcon(title)}
          size={28}
          color={Colors.darkGreen.color}
        />
      </View>
      <View style={styles.categoryTextContainer}>
        <Text style={styles.tabTitle}>{title}</Text>
        <Text style={styles.itemCount}>{`${count} items`}</Text>
      </View>
      <Icon name="chevron-right" size={24} color={Colors.darkGreen.color} />
    </View>
  </TouchableOpacity>
);

const NutrientRow = ({ nutrient, onUpdate }) => {
  const [isVisible, setIsVisible] = useState(nutrient.IsTracked);
  const [target, setTarget] = useState(
    nutrient.DailyTarget !== null && nutrient.DailyTarget !== undefined
      ? nutrient.DailyTarget.toString()
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
      });
      setIsVisible(updated.IsTracked);
      setTarget(
        updated.DailyTarget !== null && updated.DailyTarget !== undefined
          ? updated.DailyTarget.toString()
          : ""
      );
    } catch (err) {
      setError("Failed to update. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.nutrientRow}>
      <View style={styles.nutrientInfo}>
        <Text style={[styles.nutrientTitle, !isVisible && styles.disabledText]}>
          {nutrient.NutrientName}
        </Text>
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>

      <View style={styles.controlsContainer}>
        <View style={styles.inputWrapper}>
          <Text style={[styles.inputLabel, !isVisible && styles.disabledText]}>
            Daily Target
          </Text>
          <View
            style={[
              styles.inputContainer,
              isVisible
                ? styles.activeInputContainer
                : styles.inactiveInputContainer,
            ]}
          >
            <TextInput
              style={[
                styles.targetInput,
                isVisible
                  ? styles.activeTargetInput
                  : styles.inactiveTargetInput,
                loading && styles.loadingInput,
              ]}
              placeholder="0"
              keyboardType="numeric"
              value={target}
              onChangeText={(val) => setTarget(val)}
              onBlur={() =>
                handleUpdate({
                  DailyTarget: target === "" ? null : parseFloat(target),
                })
              }
              editable={isVisible && !loading}
            />
            <Text style={[styles.unit, !isVisible && styles.disabledText]}>
              mg
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.visibilityToggle,
            isVisible && styles.visibilityToggleActive,
            loading && styles.loadingToggle,
          ]}
          onPress={() => {
            if (loading) return;
            setIsVisible((prev) => {
              handleUpdate({ IsTracked: !prev });
              return !prev;
            });
          }}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={Colors.white.color} />
          ) : (
            <Icon
              name={isVisible ? "visibility" : "visibility-off"}
              size={16}
              color={isVisible ? Colors.white.color : Colors.darkGreen.color}
            />
          )}
        </TouchableOpacity>
      </View>
    </View>
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
          DailyTarget: item.DailyTarget ?? item.dailyTarget ?? null,
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
    });
    // Normalize result to PascalCase
    const normalizedResult = {
      ...result,
      NutrientName: result.NutrientName || result.Name || result.nutrientName,
      Category: result.Category || result.category,
      IsTracked: result.IsTracked ?? result.isTracked ?? false,
      DailyTarget: result.DailyTarget ?? result.dailyTarget ?? null,
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
              <Icon
                name="arrow-back"
                size={36}
                color={Colors.darkGreen.color}
              />
            </TouchableOpacity>
          </View>
        )}
        {!category ? (
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
              ) : (
                Object.keys(nutrientTargets).map((cat) => (
                  <CategoryTab
                    key={cat}
                    title={cat}
                    count={nutrientTargets[cat].length}
                    onPress={() => handleCategoryPress(cat)}
                  />
                ))
              )}
            </View>
          </ScrollView>
        ) : (
          <>
            <View style={styles.stickyCategoryHeader}>
              <View style={styles.categoryTitleWrapper}>
                <Icon
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
            <ScrollView
              contentContainerStyle={styles.scrollViewContainer}
              style={styles.nutrientsScrollView}
            >
              <View style={styles.nutrientsContainer}>
                {nutrientTargets[category]?.map((nutrient) => (
                  <NutrientRow
                    key={`${nutrient.Category}-${nutrient.NutrientName}`}
                    nutrient={nutrient}
                    onUpdate={handleUpdate}
                  />
                ))}
              </View>
            </ScrollView>
          </>
        )}
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
  unit: {
    fontSize: 14,
    color: "#718096",
    marginLeft: 8,
  },
  stickyCategoryHeader: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: Colors.white.color,
    zIndex: 1,
  },
  nutrientsScrollView: {
    flex: 1,
  },
  nutrientsContainer: {
    paddingTop: 16,
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
  nutrientRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.white.color,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  nutrientInfo: {
    flex: 1,
    marginRight: 10,
  },
  nutrientTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2D3748",
  },
  disabledText: {
    color: "#A0AEC0",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
  },
  controlsContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  inputWrapper: {
    flex: 1,
    marginRight: 12,
  },
  inputLabel: {
    fontSize: 12,
    color: "#718096",
    marginBottom: 4,
    fontWeight: "500",
  },
  inputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
  },
  activeInputContainer: {
    backgroundColor: Colors.white.color,
    borderColor: Colors.darkGreen.color,
  },
  inactiveInputContainer: {
    backgroundColor: "#F7FAFC",
    borderColor: "#E2E8F0",
  },
  targetInput: {
    flex: 1,
    fontSize: 16,
    color: "#2D3748",
    paddingVertical: 0,
    backgroundColor: "transparent",
  },
  activeTargetInput: {
    color: "#2D3748",
  },
  inactiveTargetInput: {
    color: "#A0AEC0",
  },
  loadingInput: {
    color: "#2D3748",
  },
  visibilityToggle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.lightGreen.color,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.darkGreen.color,
  },
  visibilityToggleActive: {
    backgroundColor: Colors.darkGreen.color,
  },
  loadingToggle: {
    backgroundColor: Colors.darkGreen.color,
  },
});
