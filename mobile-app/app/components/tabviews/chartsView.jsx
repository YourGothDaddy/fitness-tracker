import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  Platform,
  TouchableOpacity,
  Modal,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import { PieChart } from "react-native-chart-kit";
import React, { useState, useMemo, useCallback, useRef } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import nutritionService from "@/app/services/nutritionService";
import { useFocusEffect } from "@react-navigation/native";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";

const ChartsView = () => {
  const [macronutrients, setMacronutrients] = useState({
    protein: 0,
    carbs: 0,
    fat: 0,
    totalMacros: 0,
    proteinPercentage: 0,
    carbsPercentage: 0,
    fatPercentage: 0,
  });

  const [energyExpenditure, setEnergyExpenditure] = useState({
    bmr: 0,
    exerciseCalories: 0,
    baselineActivityCalories: 0,
    tefCalories: 0,
    totalEnergyBurned: 0,
    bmrPercentage: 0,
    exercisePercentage: 0,
    baselineActivityPercentage: 0,
    tefPercentage: 0,
  });

  // Removed: energyBudget state (moved to GeneralView)

  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMacronutrientsTooltipVisible, setIsMacronutrientsTooltipVisible] =
    useState(false);
  const [
    isEnergyExpenditureTooltipVisible,
    setIsEnergyExpenditureTooltipVisible,
  ] = useState(false);

  // Helper to format date as YYYY-MM-DD
  const formatDate = (date) => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Date picker handler
  const showDatePicker = () => {
    DateTimePickerAndroid.open({
      value: selectedDate,
      mode: "date",
      is24Hour: true,
      onChange: (event, pickedDate) => {
        if (event.type === "set" && pickedDate) {
          pickedDate.setHours(0, 0, 0, 0);
          setSelectedDate(pickedDate);
        }
      },
      maximumDate: new Date(),
    });
  };

  const isMounted = useRef(true);

  const fetchData = useCallback(
    async (date = selectedDate) => {
      try {
        setIsLoading(true);
        const [macrosData, energyData] = await Promise.all([
          nutritionService.getMacronutrients(date),
          nutritionService.getEnergyExpenditure(date),
        ]);
        if (!isMounted.current) return;
        setMacronutrients({
          protein: macrosData.protein,
          carbs: macrosData.carbs,
          fat: macrosData.fat,
          totalMacros: macrosData.totalMacros,
          proteinPercentage: macrosData.proteinPercentage,
          carbsPercentage: macrosData.carbsPercentage,
          fatPercentage: macrosData.fatPercentage,
        });

        if (!isMounted.current) return;
        setEnergyExpenditure({
          bmr: energyData.bmr,
          exerciseCalories: energyData.exerciseCalories,
          baselineActivityCalories: energyData.baselineActivityCalories,
          tefCalories: energyData.tefCalories,
          totalEnergyBurned: energyData.totalEnergyBurned,
          bmrPercentage: energyData.bmrPercentage,
          exercisePercentage: energyData.exercisePercentage,
          baselineActivityPercentage: energyData.baselineActivityPercentage,
          tefPercentage: energyData.tefPercentage,
        });
      } catch (error) {
        // Optionally handle error
      } finally {
        if (isMounted.current) setIsLoading(false);
      }
    },
    [selectedDate]
  );

  useFocusEffect(
    React.useCallback(() => {
      isMounted.current = true;
      fetchData(selectedDate);
      return () => {
        isMounted.current = false;
      };
    }, [fetchData, selectedDate])
  );

  const burnedData = useMemo(
    () => [
      {
        key: 1,
        value: energyExpenditure.bmr,
        svg: { fill: Colors.green.color },
      },
      {
        key: 2,
        value: energyExpenditure.exerciseCalories,
        svg: { fill: Colors.blue.color },
      },
      {
        key: 3,
        value: energyExpenditure.baselineActivityCalories,
        svg: { fill: Colors.brightRed.color },
      },
      {
        key: 4,
        value: energyExpenditure.tefCalories,
        svg: { fill: "#FF8C00" },
      },
    ],
    [energyExpenditure]
  );

  const screenWidth = Dimensions.get("window").width * 0.9;

  const chartConfig = useMemo(
    () => ({
      backgroundGradientFrom: Colors.lightGreen.color,
      backgroundGradientTo: Colors.lightGreen.color,
      color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    }),
    []
  );

  // Helper functions to check if data has values
  const hasMacroData = () => {
    return (
      macronutrients.protein > 0 ||
      macronutrients.carbs > 0 ||
      macronutrients.fat > 0
    );
  };

  const hasEnergyExpenditureData = () => {
    return (
      energyExpenditure.bmr > 0 ||
      energyExpenditure.exerciseCalories > 0 ||
      energyExpenditure.baselineActivityCalories > 0 ||
      energyExpenditure.tefCalories > 0
    );
  };

  // Removed: energy budget helpers (moved to GeneralView)

  // Default grey chart data
  const getDefaultMacroData = () => [
    {
      name: "",
      population: 1,
      color: "#E0E0E0",
      legendFontColor: "#FFFFFF",
    },
  ];

  const getDefaultEnergyExpenditureData = () => [
    {
      name: "",
      population: 1,
      color: "#E0E0E0",
      legendFontColor: "#FFFFFF",
    },
  ];

  // Removed: default energy budget data

  const macroData = useMemo(
    () =>
      hasMacroData()
        ? [
            {
              name: "Protein",
              population: macronutrients.protein,
              color: Colors.green.color,
              legendFontColor: "#7F7F7F",
            },
            {
              name: "Carbs",
              population: macronutrients.carbs,
              color: Colors.blue.color,
              legendFontColor: "#7F7F7F",
            },
            {
              name: "Fat",
              population: macronutrients.fat,
              color: Colors.brightRed.color,
              legendFontColor: "#7F7F7F",
            },
          ]
        : getDefaultMacroData(),
    [macronutrients]
  );

  const burnedChartData = useMemo(
    () =>
      hasEnergyExpenditureData()
        ? [
            {
              name: "BMR",
              population: energyExpenditure.bmr,
              color: Colors.green.color,
              legendFontColor: "#7F7F7F",
            },
            {
              name: "Exercise",
              population: energyExpenditure.exerciseCalories,
              color: Colors.blue.color,
              legendFontColor: "#7F7F7F",
            },
            {
              name: "Baseline",
              population: energyExpenditure.baselineActivityCalories,
              color: Colors.brightRed.color,
              legendFontColor: "#7F7F7F",
            },
            {
              name: "TEF",
              population: energyExpenditure.tefCalories,
              color: "#FF8C00",
              legendFontColor: "#7F7F7F",
            },
          ]
        : getDefaultEnergyExpenditureData(),
    [energyExpenditure]
  );

  // Removed: energy budget computed data

  return (
    <View style={styles.container}>
      {/* Macronutrients Card */}
      <LinearGradient colors={["#ffffff", "#f8faf5"]} style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <MaterialIcons name="pie-chart" size={24} color="#619819" />
            <Text style={styles.cardTitle}>Macronutrients</Text>
          </View>
          <TouchableOpacity
            style={styles.tooltipIcon}
            onPress={() => setIsMacronutrientsTooltipVisible(true)}
            activeOpacity={0.7}
          >
            <MaterialIcons name="help-outline" size={20} color="#619819" />
          </TouchableOpacity>
        </View>
        <View style={styles.dateButtonContainer}>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={showDatePicker}
            activeOpacity={0.8}
          >
            <MaterialIcons
              name="calendar-today"
              size={18}
              color="#619819"
              style={styles.dateButtonIcon}
            />
            <Text style={styles.dateButtonText}>
              {formatDate(selectedDate)}
            </Text>
          </TouchableOpacity>
        </View>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#619819" />
          </View>
        ) : (
          <>
            <View style={styles.chartSection}>
              <View style={styles.chartContainer}>
                <PieChart
                  data={macroData}
                  width={screenWidth * 0.85}
                  height={180}
                  chartConfig={chartConfig}
                  accessor="population"
                  backgroundColor="transparent"
                  paddingLeft="0"
                  absolute
                />
                {!hasMacroData() && (
                  <View style={styles.noDataOverlay}>
                    <Text style={styles.noDataText}>No Data</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.macroDetailsContainer}>
              {[
                {
                  title: "Protein",
                  value: macronutrients.protein,
                  percentage: macronutrients.proteinPercentage.toFixed(1),
                  color: Colors.green.color,
                },
                {
                  title: "Carbs",
                  value: macronutrients.carbs,
                  percentage: macronutrients.carbsPercentage.toFixed(1),
                  color: Colors.blue.color,
                },
                {
                  title: "Fat",
                  value: macronutrients.fat,
                  percentage: macronutrients.fatPercentage.toFixed(1),
                  color: Colors.brightRed.color,
                },
              ].map((macro, index) => (
                <View key={macro.title} style={styles.macroRow}>
                  <View style={styles.macroIconContainer}>
                    <View
                      style={[
                        styles.macroColorCircle,
                        { backgroundColor: macro.color },
                      ]}
                    />
                  </View>
                  <View style={styles.macroInfo}>
                    <Text style={styles.macroTitle}>{macro.title}</Text>
                    <Text style={styles.macroValue}>{macro.value}g</Text>
                  </View>
                  <View style={styles.percentageContainer}>
                    <Text style={styles.percentageText}>
                      {macro.percentage}%
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}
      </LinearGradient>

      {/* Energy Expenditure Card */}
      <LinearGradient colors={["#ffffff", "#f8faf5"]} style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <MaterialIcons
              name="local-fire-department"
              size={24}
              color="#619819"
            />
            <Text style={styles.cardTitle}>Energy Expenditure</Text>
          </View>
          <TouchableOpacity
            style={styles.tooltipIcon}
            onPress={() => setIsEnergyExpenditureTooltipVisible(true)}
            activeOpacity={0.7}
          >
            <MaterialIcons name="help-outline" size={20} color="#619819" />
          </TouchableOpacity>
        </View>
        <View style={styles.dateButtonContainer}>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={showDatePicker}
            activeOpacity={0.8}
          >
            <MaterialIcons
              name="calendar-today"
              size={18}
              color="#619819"
              style={styles.dateButtonIcon}
            />
            <Text style={styles.dateButtonText}>
              {formatDate(selectedDate)}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.chartSection}>
          <View style={styles.chartContainer}>
            <PieChart
              data={burnedChartData}
              width={screenWidth * 0.85}
              height={180}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="0"
              absolute
            />
            {!hasEnergyExpenditureData() && (
              <View style={styles.noDataOverlay}>
                <Text style={styles.noDataText}>No Data</Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.energyDetailsContainer}>
          {[
            {
              title: "BMR",
              value: energyExpenditure.bmr,
              percentage: energyExpenditure.bmrPercentage.toFixed(1),
              color: Colors.green.color,
              icon: "battery-charging-full",
            },
            {
              title: "Exercise",
              value: energyExpenditure.exerciseCalories,
              percentage: energyExpenditure.exercisePercentage.toFixed(1),
              color: Colors.blue.color,
              icon: "directions-run",
            },
            {
              title: "Activity",
              value: energyExpenditure.baselineActivityCalories,
              percentage:
                energyExpenditure.baselineActivityPercentage.toFixed(1),
              color: Colors.brightRed.color,
              icon: "directions-walk",
            },
            {
              title: "TEF",
              value: energyExpenditure.tefCalories,
              percentage: energyExpenditure.tefPercentage.toFixed(1),
              color: "#FF8C00",
              icon: "whatshot",
            },
          ].map((item) => (
            <View key={item.title} style={styles.energyRow}>
              <View style={styles.energyIconContainer}>
                <LinearGradient
                  colors={[item.color, shadeColor(item.color, 20)]}
                  style={styles.energyIconGradient}
                >
                  <MaterialIcons name={item.icon} size={20} color="white" />
                </LinearGradient>
              </View>
              <View style={styles.energyInfo}>
                <Text style={styles.energyTitle}>{item.title}</Text>
                <Text style={styles.energyValue}>{item.value} kcal</Text>
              </View>
              <View style={styles.percentageContainer}>
                <Text style={styles.percentageText}>{item.percentage}%</Text>
              </View>
            </View>
          ))}
        </View>
      </LinearGradient>

      {/* Removed: Energy Budget Card (moved to GeneralView) */}

      {/* Macronutrients Tooltip Modal */}
      <Modal
        visible={isMacronutrientsTooltipVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsMacronutrientsTooltipVisible(false)}
      >
        <Pressable
          style={styles.tooltipModalOverlay}
          onPress={() => setIsMacronutrientsTooltipVisible(false)}
        >
          <View style={styles.tooltipModal}>
            <Text style={styles.tooltipTitle}>Macronutrients</Text>
            <Text style={styles.tooltipText}>
              Information about protein, carbohydrates, and fat breakdown.
            </Text>
          </View>
        </Pressable>
      </Modal>

      {/* Energy Expenditure Tooltip Modal */}
      <Modal
        visible={isEnergyExpenditureTooltipVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsEnergyExpenditureTooltipVisible(false)}
      >
        <Pressable
          style={styles.tooltipModalOverlay}
          onPress={() => setIsEnergyExpenditureTooltipVisible(false)}
        >
          <View style={styles.tooltipModal}>
            <Text style={styles.tooltipTitle}>Energy Expenditure</Text>
            <Text style={styles.tooltipText}>
              Information about how your body burns calories throughout the day.
            </Text>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 20,
    paddingBottom: 32,
  },
  card: {
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
    justifyContent: "space-between",
    marginBottom: 20,
    paddingRight: 0,
    paddingLeft: 0,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexShrink: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2d3436",
    flexShrink: 1,
    flexWrap: "wrap",
    lineHeight: 20,
  },
  chartSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  chartContainer: {
    position: "relative",
    alignItems: "center",
  },
  noDataOverlay: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -40 }, { translateY: -15 }],
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 1,
  },
  noDataText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  macroDetailsContainer: {
    gap: 16,
  },
  macroRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(97, 152, 25, 0.08)",
  },
  macroIconContainer: {
    marginRight: 16,
  },
  macroColorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  macroInfo: {
    flex: 1,
  },
  macroTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2d3436",
    marginBottom: 2,
  },
  macroValue: {
    fontSize: 12,
    color: "#636e72",
  },
  percentageContainer: {
    backgroundColor: "rgba(97, 152, 25, 0.06)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(97, 152, 25, 0.1)",
  },
  percentageText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#619819",
  },
  energyDetailsContainer: {
    gap: 16,
  },
  energyRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(97, 152, 25, 0.08)",
  },
  energyIconContainer: {
    marginRight: 16,
  },
  energyIconGradient: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  energyInfo: {
    flex: 1,
  },
  energyTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2d3436",
    marginBottom: 2,
  },
  energyValue: {
    fontSize: 12,
    color: "#636e72",
  },
  budgetDetailsContainer: {
    gap: 16,
  },
  budgetRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(97, 152, 25, 0.08)",
  },
  budgetIconContainer: {
    marginRight: 16,
  },
  budgetIconGradient: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  budgetInfo: {
    flex: 1,
  },
  budgetTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2d3436",
  },
  budgetValue: {
    fontSize: 12,
    color: "#636e72",
  },
  timeframeBadgeWrapper: {
    alignItems: "center",
    justifyContent: "center",
    // Remove marginLeft, minWidth, flexShrink
  },
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(97, 152, 25, 0.13)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 24,
    shadowColor: "#619819",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: "rgba(97, 152, 25, 0.18)",
    marginTop: 0,
    minWidth: 0,
    justifyContent: "center",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#619819",
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitleWithWrap: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2d3436",
    flexShrink: 1,
    flexWrap: "wrap",
    lineHeight: 20,
  },
  dateButtonContainer: {
    alignItems: "flex-end",
    marginTop: 8,
    marginBottom: 16,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(97, 152, 25, 0.08)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(97, 152, 25, 0.15)",
  },
  dateButtonIcon: {
    marginRight: 8,
  },
  dateButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#619819",
  },
  tooltipIcon: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: "rgba(97, 152, 25, 0.08)",
  },
  tooltipModalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  tooltipModal: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 32,
    maxWidth: 300,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  tooltipTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2d3436",
    marginBottom: 12,
    textAlign: "center",
  },
  tooltipText: {
    fontSize: 14,
    color: "#636e72",
    lineHeight: 20,
    textAlign: "center",
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

export default ChartsView;
