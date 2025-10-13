import React, { useCallback, useEffect, useState, useRef } from "react";
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
import { LinearGradient } from "expo-linear-gradient";
import Icon from "../../../../../components/Icon";
import { Colors } from "../../../../../constants/Colors";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import nutritionService from "@/app/services/nutritionService";
import PremiumGate from "@/app/components/PremiumGate";
import { useAuth } from "@/app/context/AuthContext";

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

const getCategoryGradient = (category) => {
  const gradients = {
    Carbohydrates: ["#FF6B6B", "#FF5252"], // Coral red gradient
    AminoAcids: ["#4ECDC4", "#26A69A"], // Teal gradient
    Fats: ["#45B7D1", "#2196F3"], // Sky blue gradient
    Minerals: ["#96CEB4", "#66BB6A"], // Mint green gradient
    Other: ["#FFEAA7", "#FFD54F"], // Soft yellow gradient
    Sterols: ["#DDA0DD", "#BA68C8"], // Plum gradient
    Vitamins: ["#FDCB6E", "#FF9800"], // Orange gradient
  };
  return gradients[category] || ["#A0AEC0", "#718096"];
};

const getCategoryLabel = (category) => {
  const labels = {
    Carbohydrates: "CARBS",
    AminoAcids: "AMINO",
    Fats: "FATS",
    Minerals: "MIN",
    Other: "OTHER",
    Sterols: "STEROL",
    Vitamins: "VIT",
  };
  return labels[category] || "CAT";
};

const CategoryTab = ({ title, count, onPress }) => {
  const categoryGradient = getCategoryGradient(title);
  const categoryLabel = getCategoryLabel(title);
  const firstLetter = title.charAt(0);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 150,
        useNativeDriver: false,
      }),
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const animatedShadowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.15, 0.3],
  });

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      style={styles.tabContainer}
    >
      <Animated.View
        style={[
          styles.tabContent,
          {
            transform: [{ scale: scaleAnim }],
            shadowOpacity: animatedShadowOpacity,
          },
        ]}
      >
        {/* Left stub - colored section */}
        <LinearGradient
          colors={categoryGradient}
          style={styles.ticketStub}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.stubContent}>
            <Text style={styles.stubLetter}>{firstLetter}</Text>
            <Text style={styles.stubLabel}>{categoryLabel}</Text>
          </View>
          {/* Ticket tear effect */}
          <View style={styles.ticketTear}>
            <View style={styles.tearCircle} />
            <View style={styles.tearCircle} />
            <View style={styles.tearCircle} />
          </View>
        </LinearGradient>

        {/* Right main content area */}
        <View style={styles.ticketMain}>
          <View style={styles.ticketHeader}>
            <Text style={styles.tabTitle}>{title}</Text>
          </View>
          <Text style={styles.itemCount}>{`${count} items`}</Text>
          <View style={styles.actionChipContainer}>
            <View style={styles.actionChip}>
              <Text style={styles.actionChipText}>View</Text>
            </View>
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

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
  const params = useLocalSearchParams();
  const hideHeaderParam = Array.isArray(params?.hideHeader)
    ? params.hideHeader[0]
    : params?.hideHeader;
  const categoryParam = Array.isArray(params?.category)
    ? params.category[0]
    : params?.category;
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
      // Replace params on the same screen to avoid stacking and unwanted transitions
      router.replace({
        pathname: "/components/tabviews/more/targets/nutrientTargetsView",
        params: { hideHeader: "true", category: selectedCategory },
      });
    },
    [router]
  );

  const { isPremium } = useAuth();

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: hideHeaderParam !== "true",
          title: "Nutrient Targets",
          animation: "none",
        }}
      />
      <SafeAreaView style={styles.safeAreaViewContainer}>
        {hideHeaderParam === "true" && (
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
        <PremiumGate
          enabled={!!isPremium}
          message="Premium required to access Nutrient Targets"
        >
          {!categoryParam ? (
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
                <View style={styles.categoryHeaderContent}>
                  {/* Left stub - colored section */}
                  <LinearGradient
                    colors={getCategoryGradient(categoryParam)}
                    style={styles.categoryHeaderStub}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <View style={styles.categoryHeaderStubContent}>
                      <Text style={styles.categoryHeaderLetter}>
                        {String(categoryParam).charAt(0)}
                      </Text>
                      <Text style={styles.categoryHeaderLabel}>
                        {getCategoryLabel(categoryParam)}
                      </Text>
                    </View>
                  </LinearGradient>

                  {/* Right main content area */}
                  <View style={styles.categoryHeaderMain}>
                    <Text style={styles.categoryTitle}>{categoryParam}</Text>
                    <Text style={styles.categoryItemCount}>
                      {nutrientTargets[categoryParam]?.length || 0} items
                    </Text>
                  </View>
                </View>
              </View>
              <ScrollView
                contentContainerStyle={styles.scrollViewContainer}
                style={styles.nutrientsScrollView}
              >
                <View style={styles.nutrientsContainer}>
                  {nutrientTargets[categoryParam]?.map((nutrient) => (
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
        </PremiumGate>
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
    marginBottom: 16,
    borderRadius: 20,
    backgroundColor: Colors.white.color,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    overflow: "hidden",
  },
  tabContent: {
    flexDirection: "row",
    alignItems: "stretch",
    padding: 0,
    minHeight: 80,
  },
  tabTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2D3748",
  },
  itemCount: {
    fontSize: 14,
    color: "#718096",
    fontWeight: "500",
  },
  unit: {
    fontSize: 14,
    color: "#718096",
    marginLeft: 8,
  },
  stickyCategoryHeader: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: Colors.white.color,
    zIndex: 1,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  nutrientsScrollView: {
    flex: 1,
  },
  nutrientsContainer: {
    paddingTop: 16,
  },
  categoryHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryHeaderStub: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryHeaderStubContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  categoryHeaderLetter: {
    fontSize: 24,
    fontWeight: "900",
    color: Colors.white.color,
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  categoryHeaderLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: Colors.white.color,
    marginTop: 2,
    letterSpacing: 0.5,
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1,
  },
  categoryHeaderMain: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2D3748",
    marginBottom: 4,
  },
  categoryItemCount: {
    fontSize: 14,
    color: "#718096",
    fontWeight: "500",
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
  ticketStub: {
    width: 80,
    backgroundColor: "#FF6B6B",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  stubContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  stubLetter: {
    fontSize: 28,
    fontWeight: "900",
    color: Colors.white.color,
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  stubLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: Colors.white.color,
    marginTop: 2,
    letterSpacing: 0.5,
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1,
  },
  ticketTear: {
    position: "absolute",
    right: -8,
    top: 0,
    bottom: 0,
    width: 16,
    justifyContent: "space-around",
    alignItems: "center",
  },
  tearCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.white.color,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  ticketMain: {
    flex: 1,
    padding: 20,
    paddingLeft: 16,
    position: "relative",
  },
  ticketHeader: {
    marginBottom: 8,
  },
  actionChipContainer: {
    position: "absolute",
    right: 20,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
  actionChip: {
    backgroundColor: Colors.darkGreen.color,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionChipText: {
    color: Colors.white.color,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
