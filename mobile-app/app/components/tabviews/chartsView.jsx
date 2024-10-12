import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import { PieChart } from "react-native-svg-charts";
import React from "react";

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

  return (
    <SafeAreaView style={styles.safeAreaViewContainer}>
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        {/* CHARTS CONTAINER */}
        <View style={styles.chartsContainer}>
          {/* CONSUMED */}
          <View style={styles.chartContainer}>
            <View>
              <Text style={styles.chartTitle}>Calories Consumed (kcal)</Text>
            </View>
            <View style={styles.chartMainSection}>
              <View style={styles.pieChartSection}>
                <PieChart
                  style={styles.pieChart}
                  data={consumptionData}
                  innerRadius="80%"
                  padAngel={0}
                >
                  <View style={styles.pieChartInnerTextContainer}>
                    <Text>{caloriesConsumed}</Text>
                    <Text>kcal</Text>
                  </View>
                </PieChart>
                <View style={styles.pieChartOutterTextContainer}>
                  <Text style={styles.pieChartOutterText}>Consumed</Text>
                </View>
              </View>
              <View style={styles.tableSection}>
                <View style={styles.tableContainer}>
                  {[
                    {
                      title: "Protein",
                      value: proteinConsumed,
                      percentage: proteinPercentage,
                    },
                    {
                      title: "Carbs",
                      value: carbsConsumed,
                      percentage: carbsPercentage,
                    },
                    {
                      title: "Fat",
                      value: fatConsumed,
                      percentage: fatPercentage,
                    },
                  ].map((row, index, array) => (
                    <View
                      key={row.title}
                      style={[
                        styles.tableRow,
                        index !== array.length - 1 && styles.tableRowWithBorder,
                      ]}
                    >
                      <View style={styles.tableCellContainer}>
                        <Text style={[styles.tableCellTitle, styles.tableCell]}>
                          {row.title}
                        </Text>
                      </View>
                      <View style={styles.tableCellContainer}>
                        <Text style={styles.tableCell}>{row.value}</Text>
                      </View>
                      <View style={styles.tableCellContainer}>
                        <Text style={styles.tableCell}>{row.percentage}%</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </View>

          {/* BURNED */}
          <View style={styles.chartContainer}>
            <View>
              <Text style={styles.chartTitle}>Calories Burned (kcal)</Text>
            </View>
            <View style={styles.chartMainSection}>
              <View style={styles.pieChartSection}>
                <PieChart
                  style={styles.pieChart}
                  data={burnedData}
                  innerRadius="80%"
                  padAngel={0}
                >
                  <View style={styles.pieChartInnerTextContainer}>
                    <Text>{totalEnergyBurned}</Text>
                    <Text>kcal</Text>
                  </View>
                </PieChart>
                <View style={styles.pieChartOutterTextContainer}>
                  <Text style={styles.pieChartOutterText}>Burned</Text>
                </View>
              </View>
              <View style={styles.tableSection}>
                <View style={styles.tableContainer}>
                  {[
                    {
                      title: "BMR",
                      value: bmr,
                      percentage: bmrPercentage,
                    },
                    {
                      title: "Exercise",
                      value: exercise,
                      percentage: exercisePercentage,
                    },
                    {
                      title: "Baseline Activity",
                      value: baselineActivity,
                      percentage: baselineActivityPercentage,
                    },
                    {
                      title: "TEF",
                      value: tef,
                      percentage: tefPercentage,
                    },
                  ].map((row, index, array) => (
                    <View
                      key={row.title}
                      style={[
                        styles.tableRow,
                        index !== array.length - 1 && styles.tableRowWithBorder,
                      ]}
                    >
                      <View style={[styles.tableCellContainer, { flex: 2 }]}>
                        <Text
                          style={[styles.tableCellTitle, styles.tableCell]}
                          numberOfLines={2}
                        >
                          {row.title}
                        </Text>
                      </View>
                      <View style={styles.tableCellContainer}>
                        <Text style={styles.tableCell}>{row.value}</Text>
                      </View>
                      <View style={styles.tableCellContainer}>
                        <Text style={styles.tableCell}>{row.percentage}%</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </View>

          {/* REMAINING */}
          <View style={styles.chartContainer}>
            <View>
              <Text style={styles.chartTitle}>Energy Budget (kcal)</Text>
            </View>
            <View style={styles.chartMainSection}>
              <View style={styles.pieChartSection}>
                <PieChart
                  style={styles.pieChart}
                  data={energyBudgetData}
                  innerRadius="80%"
                  padAngel={0}
                >
                  <View style={styles.pieChartInnerTextContainer}>
                    <Text>{remaining}</Text>
                    <Text>kcal</Text>
                  </View>
                </PieChart>
                <View style={styles.pieChartOutterTextContainer}>
                  <Text style={styles.pieChartOutterText}>Remaining</Text>
                </View>
              </View>
              <View style={styles.tableSection}>
                <View style={styles.tableContainer}>
                  {[
                    {
                      title: "Target",
                      value: target,
                    },
                    {
                      title: "Exercise Above Baseline",
                      value: exerciseAboveBaseline,
                    },
                    {
                      title: "TEF",
                      value: tef,
                    },
                    {
                      title: "Consumed",
                      value: consumed,
                    },
                    {
                      title: "Remaining",
                      value: remaining,
                    },
                  ].map((row, index, array) => (
                    <View
                      key={row.title}
                      style={[
                        styles.tableRow,
                        index !== array.length - 1 && styles.tableRowWithBorder,
                      ]}
                    >
                      <View style={styles.tableCellContainer}>
                        <Text style={[styles.tableCellTitle, styles.tableCell]}>
                          {row.title}
                        </Text>
                      </View>
                      <View style={styles.tableCellContainer}>
                        <Text style={styles.tableCell}>{row.value}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ChartsView;

const styles = StyleSheet.create({
  safeAreaViewContainer: {
    flex: 1,
  },
  scrollViewContainer: {
    flexGrow: 1,
    alignItems: "center",
  },
  // CHART
  chartsContainer: {
    width: "90%",
  },
  chartContainer: {
    flex: 1,
    marginBottom: 10,
    paddingLeft: 10,
    paddingRight: 10,
    maxHeight: 300,

    backgroundColor: Colors.lightGreen.color,

    borderWidth: 0.3,
    borderRadius: 15,
    borderColor: Colors.darkGreen.color,
    justifyContent: "center",
  },
  chartTitle: {},
  chartMainSection: {
    flexDirection: "row",
    height: "70%",
  },
  pieChartSection: {
    flex: 0.7,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  pieChart: {
    height: "90%",
    width: "90%",
    maxHeight: 150,
  },
  pieChartInnerTextContainer: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  pieChartOutterText: {
    position: "relative",
    textAlign: "center",
  },
  // TABLE
  tableSection: {
    flex: 1,
    justifyContent: "center",
    paddingLeft: 10,
  },
  tableContainer: {
    borderWidth: 1,
    borderRadius: 10,
    borderColor: Colors.darkGreen.color,
    padding: 5,
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 20,
  },
  tableRowWithBorder: {
    borderBottomWidth: 1,
    borderColor: Colors.darkGreen.color,
  },
  tableCellContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tableCell: {
    fontSize: 11,
    textAlign: "center",
  },
  tableCellTitle: {
    color: Colors.green.color,
    fontWeight: "500",
    textAlign: "left",
  },
});
