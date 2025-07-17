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
import React, { useEffect, useState } from "react";
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

  const [energyBudget, setEnergyBudget] = useState({
    target: 0,
    consumed: 0,
    remaining: 0,
  });

  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  const fetchData = async (date = selectedDate) => {
    try {
      setIsLoading(true);
      const [macrosData, energyData, budgetData] = await Promise.all([
        nutritionService.getMacronutrients(date),
        nutritionService.getEnergyExpenditure(date),
        nutritionService.getEnergyBudget(date),
      ]);
      setMacronutrients({
        protein: macrosData.protein,
        carbs: macrosData.carbs,
        fat: macrosData.fat,
        totalMacros: macrosData.totalMacros,
        proteinPercentage: macrosData.proteinPercentage,
        carbsPercentage: macrosData.carbsPercentage,
        fatPercentage: macrosData.fatPercentage,
      });

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

      setEnergyBudget({
        target: budgetData.target,
        consumed: budgetData.consumed,
        remaining: budgetData.remaining,
      });
    } catch (error) {
      // Optionally handle error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(selectedDate);
  }, [selectedDate]);

  useFocusEffect(
    React.useCallback(() => {
      fetchData(selectedDate);
    }, [selectedDate])
  );

  const burnedData = [
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
      svg: { fill: Colors.red.color },
    },
  ];

  const energyBudgetData = [
    {
      key: 1,
      value: energyBudget.consumed,
      svg: { fill: Colors.green.color },
    },
    {
      key: 2,
      value: energyBudget.remaining,
      svg: { fill: Colors.blue.color },
    },
  ];

  const screenWidth = Dimensions.get("window").width * 0.9;

  const chartConfig = {
    backgroundGradientFrom: Colors.lightGreen.color,
    backgroundGradientTo: Colors.lightGreen.color,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  };

  const macroData = [
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
  ];

  const burnedChartData = [
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
      color: Colors.red.color,
      legendFontColor: "#7F7F7F",
    },
  ];

  const budgetData = [
    {
      name: "Consumed",
      population: energyBudget.consumed,
      color: Colors.green.color,
      legendFontColor: "#7F7F7F",
    },
    {
      name: "Remaining",
      population: energyBudget.remaining,
      color: Colors.blue.color,
      legendFontColor: "#7F7F7F",
    },
  ];

  return (
    <View style={styles.container}>
      {/* Macronutrients Card */}
      <LinearGradient colors={["#ffffff", "#f8faf5"]} style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <MaterialIcons name="pie-chart" size={24} color="#619819" />
            <Text style={styles.cardTitle}>Macronutrients</Text>
          </View>
          <View style={styles.timeframeBadgeWrapper}>
            <TouchableOpacity
              style={styles.badgeContainer}
              onPress={showDatePicker}
              activeOpacity={0.8}
            >
              <Text style={styles.badgeText}>{formatDate(selectedDate)}</Text>
              <MaterialIcons
                name="calendar-today"
                size={20}
                color="#619819"
                style={{ marginLeft: 2 }}
              />
            </TouchableOpacity>
          </View>
        </View>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#619819" />
          </View>
        ) : (
          <>
            <View style={styles.chartSection}>
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
            </View>

            <View style={styles.macroDetailsContainer}>
              {[
                {
                  title: "Protein",
                  value: macronutrients.protein,
                  percentage: macronutrients.proteinPercentage.toFixed(1),
                  color: Colors.green.color,
                  icon: "fitness-center",
                },
                {
                  title: "Carbs",
                  value: macronutrients.carbs,
                  percentage: macronutrients.carbsPercentage.toFixed(1),
                  color: Colors.blue.color,
                  icon: "grain",
                },
                {
                  title: "Fat",
                  value: macronutrients.fat,
                  percentage: macronutrients.fatPercentage.toFixed(1),
                  color: Colors.brightRed.color,
                  icon: "opacity",
                },
              ].map((macro, index) => (
                <View key={macro.title} style={styles.macroRow}>
                  <View style={styles.macroIconContainer}>
                    <LinearGradient
                      colors={[macro.color, shadeColor(macro.color, 20)]}
                      style={styles.macroIconGradient}
                    >
                      <MaterialIcons
                        name={macro.icon}
                        size={20}
                        color="white"
                      />
                    </LinearGradient>
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
            <Text
              style={styles.cardTitleWithWrap}
              numberOfLines={2}
            >{`Energy\nExpenditure`}</Text>
          </View>
          <View style={styles.timeframeBadgeWrapper}>
            <TouchableOpacity
              style={styles.badgeContainer}
              onPress={showDatePicker}
              activeOpacity={0.8}
            >
              <Text style={styles.badgeText}>{formatDate(selectedDate)}</Text>
              <MaterialIcons
                name="calendar-today"
                size={20}
                color="#619819"
                style={{ marginLeft: 2 }}
              />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.chartSection}>
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
              color: Colors.red.color,
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

      {/* Energy Budget Card */}
      <LinearGradient colors={["#ffffff", "#f8faf5"]} style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <MaterialIcons name="account-balance" size={24} color="#619819" />
            <Text style={styles.cardTitle}>Energy Budget</Text>
          </View>
          <View style={styles.timeframeBadgeWrapper}>
            <TouchableOpacity
              style={styles.badgeContainer}
              onPress={showDatePicker}
              activeOpacity={0.8}
            >
              <Text style={styles.badgeText}>{formatDate(selectedDate)}</Text>
              <MaterialIcons
                name="calendar-today"
                size={20}
                color="#619819"
                style={{ marginLeft: 2 }}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.chartSection}>
          <PieChart
            data={budgetData}
            width={screenWidth * 0.85}
            height={180}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="0"
            absolute
          />
        </View>

        <View style={styles.budgetDetailsContainer}>
          {[
            {
              title: "Target",
              value: energyBudget.target,
              icon: "flag",
              color: Colors.darkGreen.color,
            },
            {
              title: "Consumed",
              value: energyBudget.consumed,
              icon: "restaurant",
              color: Colors.green.color,
            },
            {
              title: "Remaining",
              value: energyBudget.remaining,
              icon: "hourglass-empty",
              color: Colors.blue.color,
            },
          ].map((item) => (
            <View key={item.title} style={styles.budgetRow}>
              <View style={styles.budgetIconContainer}>
                <LinearGradient
                  colors={[item.color, shadeColor(item.color, 20)]}
                  style={styles.budgetIconGradient}
                >
                  <MaterialIcons name={item.icon} size={20} color="white" />
                </LinearGradient>
              </View>
              <View style={styles.budgetInfo}>
                <Text style={styles.budgetTitle}>{item.title}</Text>
                <Text style={styles.budgetValue}>{item.value} kcal</Text>
              </View>
            </View>
          ))}
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 20,
  },
  card: {
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
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 10,
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
    fontSize: 18,
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
  macroDetailsContainer: {
    gap: 12,
  },
  macroRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "rgba(97, 152, 25, 0.05)",
    borderRadius: 12,
  },
  macroIconContainer: {
    marginRight: 12,
  },
  macroIconGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  macroInfo: {
    flex: 1,
  },
  macroTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2d3436",
  },
  macroValue: {
    fontSize: 14,
    color: "#636e72",
  },
  percentageContainer: {
    backgroundColor: "rgba(97, 152, 25, 0.1)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  percentageText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#619819",
  },
  energyDetailsContainer: {
    gap: 12,
  },
  energyRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "rgba(97, 152, 25, 0.05)",
    borderRadius: 12,
  },
  energyIconContainer: {
    marginRight: 12,
  },
  energyIconGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  energyInfo: {
    flex: 1,
  },
  energyTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2d3436",
  },
  energyValue: {
    fontSize: 14,
    color: "#636e72",
  },
  budgetDetailsContainer: {
    gap: 12,
  },
  budgetRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "rgba(97, 152, 25, 0.05)",
    borderRadius: 12,
  },
  budgetIconContainer: {
    marginRight: 12,
  },
  budgetIconGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  budgetInfo: {
    flex: 1,
  },
  budgetTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2d3436",
  },
  budgetValue: {
    fontSize: 14,
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
    fontSize: 18,
    fontWeight: "600",
    color: "#2d3436",
    flexShrink: 1,
    flexWrap: "wrap",
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

export default ChartsView;
