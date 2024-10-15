import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import {
  StackedBarChart,
  XAxis,
  YAxis,
  Grid,
  LineChart,
} from "react-native-svg-charts";
import { G, Line } from "react-native-svg";

const GeneralView = () => {
  const calorieData = [
    { date: "01/01", protein: 500, fats: 500, carbs: 500 },
    { date: "02/01", protein: 500, fats: 500, carbs: 500 },
    { date: "03/01", protein: 500, fats: 500, carbs: 500 },
    { date: "04/01", protein: 500, fats: 250, carbs: 250 },
    { date: "05/01", protein: 500, fats: 500, carbs: 500 },
    { date: "06/01", protein: 500, fats: 500, carbs: 500 },
    { date: "07/01", protein: 500, fats: 500, carbs: 500 },
  ];

  const weightData = [70, 72, 71, 73, 74, 75, 76]; // Example weight data
  const minWeight = Math.min(...weightData) - 5;
  const maxWeight = Math.max(...weightData);

  const colors = [Colors.green.color, Colors.red.color, Colors.blue.color];
  const keys = ["protein", "fats", "carbs"];

  const renderYAxis = (data, min, max) => (
    <YAxis
      data={data}
      contentInset={{ top: 10, bottom: 10 }}
      svg={{ fill: "grey", fontSize: 10 }}
      numberOfTicks={5}
      min={min}
      max={max}
      formatLabel={(value) => `${value}`}
    />
  );

  const renderStackedBarChart = () => (
    <StackedBarChart
      style={styles.stackedBarChart}
      data={calorieData}
      keys={keys}
      colors={colors}
      showGrid={false}
      contentInset={{ top: 10, bottom: 10 }}
      spacingInner={0.8}
      spacingOuter={0.4}
    >
      <Grid direction={Grid.Direction.HORIZONTAL} />
      <G>
        <Line
          x1="0%"
          x2="100%"
          y1="0%"
          y2="0%"
          stroke="grey"
          strokeWidth={0.5}
        />
      </G>
    </StackedBarChart>
  );

  const renderLineChart = () => (
    <LineChart
      style={styles.lineChart}
      data={weightData}
      svg={{ stroke: Colors.darkGreen.color, strokeWidth: 2 }}
      contentInset={{ top: 10, bottom: 10 }}
      yMin={minWeight}
      yMax={maxWeight}
    >
      <Grid direction={Grid.Direction.HORIZONTAL} />
    </LineChart>
  );

  const renderXAxis = () => (
    <XAxis
      style={styles.xAxis}
      data={calorieData}
      formatLabel={(value, index) => {
        if (
          index === 0 ||
          index === Math.floor(calorieData.length / 2) ||
          index === calorieData.length - 1
        ) {
          return calorieData[index].date;
        }
        return "";
      }}
      contentInset={{ left: 20, right: 20 }}
      svg={{ fontSize: 10, fill: "black" }}
    />
  );

  return (
    <SafeAreaView style={styles.safeAreaViewContainer}>
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        <View style={styles.historiesContainer}>
          <View style={styles.historyContainer}>
            <Text>Calorie History</Text>
            <View style={styles.chartContainer}>
              {renderYAxis([0, 500, 1000, 1500], 0, 1500)}
              <View style={styles.barChartContainer}>
                {renderStackedBarChart()}
                {renderXAxis()}
              </View>
            </View>
          </View>
          <View style={styles.historyContainer}>
            <Text>Weight History</Text>
            <View style={styles.chartContainer}>
              {renderYAxis(weightData, minWeight, maxWeight)}
              <View style={styles.barChartContainer}>
                {renderLineChart()}
                {renderXAxis()}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default GeneralView;

const styles = StyleSheet.create({
  safeAreaViewContainer: {
    flex: 1,
  },
  scrollViewContainer: {
    flexGrow: 1,
    alignItems: "center",
  },
  historiesContainer: {
    width: "90%",
  },
  historyContainer: {
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
  chartContainer: {
    flexDirection: "row",
    height: 200,
    padding: 10,
  },
  barChartContainer: {
    flex: 1,
    marginLeft: 16,
  },
  stackedBarChart: {
    flex: 1,
  },
  lineChart: {
    flex: 1,
  },
  xAxis: {
    marginHorizontal: -10,
  },
});
