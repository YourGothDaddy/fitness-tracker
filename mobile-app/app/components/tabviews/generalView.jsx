import React from "react";
import { View, Text, ScrollView, StyleSheet, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import { BarChart, LineChart } from "react-native-chart-kit";

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

  const screenWidth = Dimensions.get("window").width * 0.85;

  const chartConfig = {
    backgroundColor: Colors.lightGreen.color,
    backgroundGradientFrom: Colors.lightGreen.color,
    backgroundGradientTo: Colors.lightGreen.color,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
  };

  const barData = {
    labels: calorieData.map((item) => item.date),
    datasets: [
      {
        data: calorieData.map((item) => item.protein + item.fats + item.carbs),
      },
    ],
  };

  const lineData = {
    labels: calorieData.map((item) => item.date),
    datasets: [
      {
        data: weightData,
        color: (opacity = 1) => Colors.darkGreen.color,
      },
    ],
  };

  return (
    <SafeAreaView style={styles.safeAreaViewContainer}>
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        <View style={styles.historiesContainer}>
          <View style={styles.historyContainer}>
            <Text>Calorie History</Text>
            <BarChart
              data={barData}
              width={screenWidth}
              height={220}
              chartConfig={chartConfig}
              style={styles.chart}
              showValuesOnTopOfBars
            />
          </View>

          <View style={styles.historyContainer}>
            <Text>Weight History</Text>
            <LineChart
              data={lineData}
              width={screenWidth}
              height={220}
              chartConfig={chartConfig}
              style={styles.chart}
              bezier
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

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
    marginBottom: 20,
    padding: 10,
    backgroundColor: Colors.lightGreen.color,
    borderWidth: 0.3,
    borderRadius: 15,
    borderColor: Colors.darkGreen.color,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});

export default GeneralView;
