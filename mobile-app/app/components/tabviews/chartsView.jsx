import { View, Text, ScrollView, StyleSheet, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import { PieChart } from "react-native-chart-kit";
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
    <SafeAreaView style={styles.safeAreaViewContainer}>
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        <View style={styles.chartsContainer}>
          {/* CONSUMED */}
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Calories Consumed (kcal)</Text>
            <View style={styles.chartMainSection}>
              <PieChart
                data={macroData}
                width={screenWidth}
                height={200}
                chartConfig={chartConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="0"
                absolute
              />
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
            <Text style={styles.chartTitle}>Calories Burned (kcal)</Text>
            <View style={styles.chartMainSection}>
              <PieChart
                data={burnedChartData}
                width={screenWidth}
                height={200}
                chartConfig={chartConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="0"
                absolute
              />
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
            <Text style={styles.chartTitle}>Energy Budget (kcal)</Text>
            <View style={styles.chartMainSection}>
              <PieChart
                data={budgetData}
                width={screenWidth}
                height={200}
                chartConfig={chartConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="0"
                absolute
              />
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
    flexDirection: "column",
    alignItems: "center",
    height: "auto",
  },
  pieChartSection: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
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
