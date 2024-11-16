import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import { PieChart } from "react-native-chart-kit";
import React from "react";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";

const ChartsView = () => {
  const caloriesConsumed = 1500;
  const proteinConsumed = 30;
  const carbsConsumed = 5;
  const fatConsumed = 2;
  const totalMacros = proteinConsumed + carbsConsumed + fatConsumed;
  const proteinPercentage = ((proteinConsumed / totalMacros) * 100).toFixed(1);
  const carbsPercentage = ((carbsConsumed / totalMacros) * 100).toFixed(1);
  const fatPercentage = ((fatConsumed / totalMacros) * 100).toFixed(1);

  const consumptionData = [
    {
      key: 1,
      value: proteinConsumed,
      svg: { fill: Colors.green.color },
    },
    {
      key: 2,
      value: carbsConsumed,
      svg: { fill: Colors.blue.color },
    },
    {
      key: 3,
      value: fatConsumed,
      svg: { fill: Colors.brightRed.color },
    },
  ];

  const bmr = 1949;
  const exercise = 0;
  const baselineActivity = 390;
  const tef = 1;
  const totalEnergyBurned = bmr + exercise + baselineActivity + tef;
  const bmrPercentage = ((bmr / totalEnergyBurned) * 100).toFixed(1);
  const exercisePercentage = ((exercise / totalEnergyBurned) * 100).toFixed(1);
  const baselineActivityPercentage = (
    (baselineActivity / totalEnergyBurned) *
    100
  ).toFixed(1);
  const tefPercentage = ((tef / totalEnergyBurned) * 100).toFixed(1);

  const burnedData = [
    {
      key: 1,
      value: bmr,
      svg: { fill: Colors.green.color },
    },
    {
      key: 2,
      value: exercise,
      svg: { fill: Colors.blue.color },
    },
    {
      key: 3,
      value: baselineActivity,
      svg: { fill: Colors.brightRed.color },
    },
    {
      key: 4,
      value: tef,
      svg: { fill: Colors.red.color },
    },
  ];

  const target = 2000;
  const exerciseAboveBaseline = exercise;
  const consumed = caloriesConsumed;
  const remaining = target - consumed;

  const energyBudgetData = [
    {
      key: 1,
      value: consumed,
      svg: { fill: Colors.green.color },
    },
    {
      key: 2,
      value: remaining,
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
      population: proteinConsumed,
      color: Colors.green.color,
      legendFontColor: "#7F7F7F",
    },
    {
      name: "Carbs",
      population: carbsConsumed,
      color: Colors.blue.color,
      legendFontColor: "#7F7F7F",
    },
    {
      name: "Fat",
      population: fatConsumed,
      color: Colors.brightRed.color,
      legendFontColor: "#7F7F7F",
    },
  ];

  const burnedChartData = [
    {
      name: "BMR",
      population: bmr,
      color: Colors.green.color,
      legendFontColor: "#7F7F7F",
    },
    {
      name: "Exercise",
      population: exercise,
      color: Colors.blue.color,
      legendFontColor: "#7F7F7F",
    },
    {
      name: "Baseline",
      population: baselineActivity,
      color: Colors.brightRed.color,
      legendFontColor: "#7F7F7F",
    },
    {
      name: "TEF",
      population: tef,
      color: Colors.red.color,
      legendFontColor: "#7F7F7F",
    },
  ];

  const budgetData = [
    {
      name: "Consumed",
      population: consumed,
      color: Colors.green.color,
      legendFontColor: "#7F7F7F",
    },
    {
      name: "Remaining",
      population: remaining,
      color: Colors.blue.color,
      legendFontColor: "#7F7F7F",
    },
  ];

  return (
    <View style={styles.container}>
      {/* Macronutrients Card */}
      <LinearGradient colors={["#ffffff", "#f8faf5"]} style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialIcons name="pie-chart" size={24} color="#619819" />
          <Text style={styles.cardTitle}>Macronutrients</Text>
        </View>

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
              value: proteinConsumed,
              percentage: proteinPercentage,
              color: Colors.green.color,
              icon: "fitness-center",
            },
            {
              title: "Carbs",
              value: carbsConsumed,
              percentage: carbsPercentage,
              color: Colors.blue.color,
              icon: "grain",
            },
            {
              title: "Fat",
              value: fatConsumed,
              percentage: fatPercentage,
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
                  <MaterialIcons name={macro.icon} size={20} color="white" />
                </LinearGradient>
              </View>
              <View style={styles.macroInfo}>
                <Text style={styles.macroTitle}>{macro.title}</Text>
                <Text style={styles.macroValue}>{macro.value}g</Text>
              </View>
              <View style={styles.percentageContainer}>
                <Text style={styles.percentageText}>{macro.percentage}%</Text>
              </View>
            </View>
          ))}
        </View>
      </LinearGradient>

      {/* Energy Expenditure Card */}
      <LinearGradient colors={["#ffffff", "#f8faf5"]} style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialIcons
            name="local-fire-department"
            size={24}
            color="#619819"
          />
          <Text style={styles.cardTitle}>Energy Expenditure</Text>
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
              value: bmr,
              percentage: bmrPercentage,
              color: Colors.green.color,
              icon: "battery-charging-full",
            },
            {
              title: "Exercise",
              value: exercise,
              percentage: exercisePercentage,
              color: Colors.blue.color,
              icon: "directions-run",
            },
            {
              title: "Activity",
              value: baselineActivity,
              percentage: baselineActivityPercentage,
              color: Colors.brightRed.color,
              icon: "directions-walk",
            },
            {
              title: "TEF",
              value: tef,
              percentage: tefPercentage,
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
          <MaterialIcons name="account-balance" size={24} color="#619819" />
          <Text style={styles.cardTitle}>Energy Budget</Text>
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
              value: target,
              icon: "flag",
              color: Colors.darkGreen.color,
            },
            {
              title: "Consumed",
              value: consumed,
              icon: "restaurant",
              color: Colors.green.color,
            },
            {
              title: "Remaining",
              value: remaining,
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
    marginBottom: 20,
    gap: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2d3436",
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
