import { View, Text, StyleSheet, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";
import { Colors } from "@/constants/Colors";
import { PieChart } from "react-native-svg-charts";

const Home = () => {
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.chartsContainer}>
        <View style={styles.chartContainer}>
          <Text numberOfLines={1} style={styles.chartTitle}>
            Calories Consumed (kcal)
          </Text>
          <View style={styles.chartSection}>
            <PieChart
              style={styles.chart}
              data={consumptionData}
              innerRadius="80%"
              padAngle={0}
            />
            <View style={styles.calorieTextContainer}>
              <Text style={styles.calorieText}>{caloriesConsumed}</Text>
              <Text style={styles.calorieSubtext}>kcal</Text>
            </View>
            <View style={styles.chartSubtitleContainer}>
              <Text numberOfLines={1}>Consumed</Text>
            </View>
          </View>
          <View style={styles.tableSection}>
            <View style={styles.consumedTableContainer}>
              <View style={styles.tableRow}>
                <Text style={styles.tableCellProtein} className="font-pbold">
                  Protein
                </Text>
                <Text style={styles.tableCell}>{proteinConsumed}g</Text>
                <Text style={styles.tableCell}>{proteinPercentage}%</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableCellCarbs} className="font-pbold">
                  Carbs
                </Text>
                <Text style={styles.tableCell}>{carbsConsumed}g</Text>
                <Text style={styles.tableCell}>{carbsPercentage}%</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableCellFat} className="font-pbold">
                  Fat
                </Text>
                <Text style={styles.tableCell}>{fatConsumed}g</Text>
                <Text style={styles.tableCell}>{fatPercentage}%</Text>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.chartContainer}>
          <Text numberOfLines={1} style={styles.chartTitle}>
            Calories Burned (kcal)
          </Text>
          <View style={styles.chartSection}>
            <PieChart
              style={styles.chart}
              data={burnedData}
              innerRadius="80%"
              padAngle={0}
            />
            <View style={styles.calorieTextContainer}>
              <Text style={styles.calorieText}>{caloriesConsumed}</Text>
              <Text style={styles.calorieSubtext}>kcal</Text>
            </View>
            <View style={styles.chartSubtitleContainer}>
              <Text numberOfLines={1}>Burned</Text>
            </View>
          </View>
          <View style={styles.tableSection}>
            <View style={styles.burnedTableContainer}>
              <View style={styles.tableRow}>
                <Text style={styles.tableCellBMR} className="font-pbold">
                  BMR
                </Text>
                <Text style={styles.tableCell}>{bmr}</Text>
                <Text style={styles.tableCell}>{bmrPercentage}%</Text>
              </View>
              <View style={styles.tableRow}>
                <Text
                  style={styles.tableCellExercise}
                  numberOfLines={1}
                  className="font-pbold"
                >
                  Exercise
                </Text>
                <Text style={styles.tableCell}>{exercise}</Text>
                <Text style={styles.tableCell}>{exercisePercentage}%</Text>
              </View>
              <View style={styles.tableRow}>
                <Text
                  style={styles.tableCellBaselineActivity}
                  className="font-pbold"
                  numberOfLines={2}
                >
                  Baseline Activity
                </Text>
                <Text style={styles.tableCell}>{baselineActivity}</Text>
                <Text style={styles.tableCell}>
                  {baselineActivityPercentage}%
                </Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableCellTEF} className="font-pbold">
                  TEF
                </Text>
                <Text style={styles.tableCell}>{tef}</Text>
                <Text style={styles.tableCell}>{tefPercentage}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  chartsContainer: {
    flex: 1,
    alignItems: "center",
    paddingTop: "5%",
    justifyContent: "space-around",
  },
  chartContainer: {
    flex: 0.31,
    backgroundColor: Colors.lightGreen.color,
    width: "90%",
    flexDirection: "row",
  },
  chartTitle: {
    position: "absolute",
    top: 5,
    left: 5,
  },
  chartSubtitleContainer: {
    position: "absolute",
    bottom: "10%",
    justifyContent: "center",
  },
  chartSection: {
    flex: 1.3,
    justifyContent: "center",
    alignItems: "center",
  },
  chart: {
    height: "90%",
    width: "90%",
  },
  tableSection: {
    flex: 1.7,
    justifyContent: "center",
    paddingHorizontal: "3%",
  },
  consumedTableContainer: {
    flex: 0.6,
    width: "100%",
    borderWidth: 2,
    borderColor: Colors.darkGreen.color,
    borderRadius: 15,
    justifyContent: "center",
  },
  burnedTableContainer: {
    flex: 0.7,
    width: "100%",
    borderWidth: 2,
    borderColor: Colors.darkGreen.color,
    borderRadius: 15,
    justifyContent: "center",
  },
  tableRow: {
    flexDirection: "row",
    flex: 1,
  },
  tableCell: {
    flex: 1,
    textAlign: "center",
    fontSize: 12,
  },
  tableCellProtein: {
    flex: 1,
    textAlign: "center",
    color: Colors.green.color,
    fontSize: 12,
  },
  tableCellCarbs: {
    flex: 1,
    textAlign: "center",
    color: Colors.blue.color,
    fontSize: 12,
  },
  tableCellFat: {
    flex: 1,
    textAlign: "center",
    color: Colors.red.color,
    fontSize: 12,
  },
  tableCellBMR: {
    flex: 1,
    textAlign: "center",
    color: Colors.green.color,
    fontSize: 12,
  },
  tableCellExercise: {
    flex: 1,
    textAlign: "center",
    color: Colors.blue.color,
    fontSize: 12,
  },
  tableCellBaselineActivity: {
    flex: 1,
    textAlign: "center",
    color: Colors.red.color,
    fontSize: 12,
  },
  tableCellTEF: {
    flex: 1,
    textAlign: "center",
    color: Colors.red.color,
    fontSize: 12,
  },
  calorieTextContainer: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  calorieText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  calorieSubtext: {
    fontSize: 14,
  },
});
