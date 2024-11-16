import React from "react";
import { View, Text, StyleSheet, Dimensions, Platform } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BarChart, LineChart } from "react-native-chart-kit";
import { Colors } from "@/constants/Colors";

// Helper function to format numbers with commas
const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const GeneralView = () => {
  const totalHorizontalPadding = 48; // Container padding (24 * 2)
  const cardPadding = 40; // Card padding (20 * 2)
  const screenWidth =
    Dimensions.get("window").width - totalHorizontalPadding - cardPadding;

  const calorieData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        data: [1800, 1950, 2100, 1750, 1850, 2200, 1900],
      },
    ],
  };

  const weightData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        data: [70.5, 70.3, 70.4, 70.1, 70.0, 69.8, 69.7],
        color: () => Colors.green.color,
        strokeWidth: 2,
      },
    ],
  };

  const chartConfig = {
    backgroundColor: Colors.white.color,
    backgroundGradientFrom: Colors.white.color,
    backgroundGradientTo: Colors.white.color,
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(97, 152, 25, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(45, 52, 54, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForBackgroundLines: {
      strokeDasharray: "",
      stroke: "rgba(97, 152, 25, 0.1)",
      strokeWidth: 1,
    },
    propsForLabels: {
      fontSize: 11,
      fontWeight: "600",
    },
    barPercentage: 0.6,
    propsForVerticalLabels: {
      fontSize: 11,
      rotation: 0,
    },
    formatYLabel: (value) => {
      if (value === undefined || value === null) return "";
      return Number(value).toFixed(1);
    },
  };

  return (
    <View style={styles.container}>
      {/* Calorie Overview Card */}
      <LinearGradient colors={["#ffffff", "#f8faf5"]} style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <MaterialIcons
              name="local-fire-department"
              size={24}
              color="#619819"
              style={styles.headerIcon}
            />
            <Text style={styles.cardTitle}>Calorie Overview</Text>
          </View>
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>This Week</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <View style={styles.labelContainer}>
              <Text style={styles.statLabel}>Daily{"\n"}Average</Text>
            </View>
            <Text style={styles.statValue}>1,935</Text>
            <Text style={styles.statUnit}>kcal</Text>
          </View>

          <View style={styles.statBox}>
            <View style={styles.labelContainer}>
              <Text
                style={styles.statLabel}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                Target
              </Text>
            </View>
            <Text style={styles.statValue}>2,000</Text>
            <Text style={styles.statUnit}>kcal</Text>
          </View>

          <View style={styles.statBox}>
            <View style={styles.labelContainer}>
              <Text
                style={styles.statLabel}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                Deficit
              </Text>
            </View>
            <Text style={[styles.statValue, { color: "#27ae60" }]}>-65</Text>
            <Text style={styles.statUnit}>kcal</Text>
          </View>
        </View>

        <View style={styles.chartContainer}>
          <View style={styles.chartWrapper}>
            <BarChart
              data={calorieData}
              width={screenWidth}
              height={180}
              chartConfig={chartConfig}
              style={styles.chart}
              showBarTops={false}
              fromZero
              segments={4}
              withInnerLines={true}
              yAxisLabel=""
              yAxisSuffix=""
            />
          </View>
        </View>
      </LinearGradient>

      {/* Weight Progress Card */}
      <LinearGradient colors={["#ffffff", "#f8faf5"]} style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <MaterialIcons
              name="monitor-weight"
              size={24}
              color="#619819"
              style={styles.headerIcon}
            />
            <Text style={styles.cardTitle}>Weight Progress</Text>
          </View>
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>This Week</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Starting</Text>
            <View style={styles.statValueContainer}>
              <Text style={styles.statValue}>70.5</Text>
              <Text style={styles.statUnit}>kg</Text>
            </View>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Current</Text>
            <View style={styles.statValueContainer}>
              <Text style={styles.statValue}>69.7</Text>
              <Text style={styles.statUnit}>kg</Text>
            </View>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Change</Text>
            <View style={styles.statValueContainer}>
              <Text style={[styles.statValue, { color: "#27ae60" }]}>-0.8</Text>
              <Text style={styles.statUnit}>kg</Text>
            </View>
          </View>
        </View>

        <View style={styles.chartContainer}>
          <View style={styles.chartWrapper}>
            <LineChart
              data={weightData}
              width={screenWidth}
              height={180}
              chartConfig={chartConfig}
              style={styles.chart}
              bezier
              withDots={true}
              withInnerLines={true}
              segments={4}
              yAxisLabel=""
              yAxisSuffix=""
            />
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 24,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    backgroundColor: "#ffffff",
    overflow: "hidden",
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
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerIcon: {
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2d3436",
  },
  badgeContainer: {
    backgroundColor: "rgba(97, 152, 25, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#619819",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: "rgba(97, 152, 25, 0.05)",
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 100,
  },
  labelContainer: {
    height: 36,
    justifyContent: "center",
    width: "100%",
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#636e72",
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 16,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2d3436",
    textAlign: "center",
    marginBottom: 4,
  },
  statUnit: {
    fontSize: 13,
    color: "#636e72",
    fontWeight: "500",
    textAlign: "center",
  },
  chartContainer: {
    marginHorizontal: -20,
    paddingHorizontal: 10,
  },
  chartWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  chart: {
    borderRadius: 16,
    marginLeft: -10,
  },
});

export default GeneralView;
