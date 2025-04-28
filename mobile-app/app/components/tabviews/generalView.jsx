import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Dimensions, Platform } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BarChart, LineChart } from "react-native-chart-kit";
import { Colors } from "@/constants/Colors";
import { nutritionService } from "../../services/nutritionService";

// Helper function to format numbers with commas
const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// Helper function to get start and end dates for a week
const getWeekDates = () => {
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 6); // Last 7 days including today
  return { startDate, endDate: today };
};

// Helper function to format date to day name
const getDayName = (date) => {
  return new Date(date).toLocaleDateString("en-US", { weekday: "short" });
};

const GeneralView = () => {
  const [error, setError] = useState("");
  const [calorieOverview, setCalorieOverview] = useState({
    dailyAverage: 0,
    target: 0,
    deficit: 0,
    dailyCalories: [],
  });

  const fetchCalorieOverview = async () => {
    try {
      const { startDate, endDate } = getWeekDates();
      const data = await nutritionService.getCalorieOverview(
        startDate,
        endDate
      );
      setCalorieOverview(data);
      setError("");
    } catch (err) {
      setError("Failed to fetch calorie data");
      console.error("Error fetching calorie overview:", err);
    }
  };

  useEffect(() => {
    fetchCalorieOverview();
  }, []);

  const totalHorizontalPadding = 48;
  const cardPadding = 40;
  const screenWidth =
    Dimensions.get("window").width - totalHorizontalPadding - cardPadding;

  const calorieData = {
    labels: calorieOverview.dailyCalories.map((day) => getDayName(day.date)),
    datasets: [
      {
        data: calorieOverview.dailyCalories.map((day) => day.totalCalories),
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
            <Text style={styles.statValue}>
              {formatNumber(calorieOverview.dailyAverage)}
            </Text>
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
            <Text style={styles.statValue}>
              {formatNumber(calorieOverview.target)}
            </Text>
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
            <Text
              style={[
                styles.statValue,
                { color: calorieOverview.deficit > 0 ? "#27ae60" : "#e74c3c" },
              ]}
            >
              {calorieOverview.deficit > 0 ? "-" : "+"}
              {formatNumber(Math.abs(calorieOverview.deficit))}
            </Text>
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

      {/* Activity Log Card */}
      <LinearGradient colors={["#ffffff", "#f8faf5"]} style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <MaterialIcons
              name="event-note"
              size={24}
              color="#619819"
              style={styles.headerIcon}
            />
            <Text style={styles.cardTitle}>Today's Activity</Text>
          </View>
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>Today</Text>
          </View>
        </View>

        {/* Meals Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Meals</Text>
          <View style={styles.tableContainer}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderText}>Meal & Calories</Text>
              <Text style={styles.tableHeaderText}>Time</Text>
            </View>

            {/* Sample Meal Row */}
            <View style={styles.tableRow}>
              <View style={styles.mainContent}>
                <View style={styles.titleContainer}>
                  <MaterialIcons name="restaurant" size={20} color="#619819" />
                  <Text style={styles.tableCellTitle} numberOfLines={1}>
                    Oatmeal with Berries and Honey
                  </Text>
                </View>
                <View style={styles.detailsContainer}>
                  <View style={styles.detailRow}>
                    <MaterialIcons name="scale" size={16} color="#636e72" />
                    <Text style={styles.detailText}>300g</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <MaterialIcons
                      name="local-fire-department"
                      size={16}
                      color="#636e72"
                    />
                    <Text style={styles.detailText}>285 kcal</Text>
                  </View>
                </View>
              </View>
              <View style={styles.timeContainer}>
                <MaterialIcons
                  name="schedule"
                  size={14}
                  color="#619819"
                  style={styles.timeIcon}
                />
                <Text style={styles.timeText}>08:30</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Exercises Section */}
        <View style={[styles.sectionContainer, { marginTop: 20 }]}>
          <Text style={styles.sectionTitle}>Exercises</Text>
          <View style={styles.tableContainer}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderText}>Exercise & Calories</Text>
              <Text style={styles.tableHeaderText}>Time</Text>
            </View>

            {/* Sample Exercise Row */}
            <View style={styles.tableRow}>
              <View style={styles.mainContent}>
                <View style={styles.titleContainer}>
                  <MaterialIcons
                    name="fitness-center"
                    size={20}
                    color="#619819"
                  />
                  <Text style={styles.tableCellTitle}>Running</Text>
                </View>
                <View style={styles.detailsContainer}>
                  <View style={styles.detailRow}>
                    <MaterialIcons name="timer" size={16} color="#636e72" />
                    <Text style={styles.detailText}>30 min</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <MaterialIcons
                      name="local-fire-department"
                      size={16}
                      color="#636e72"
                    />
                    <Text style={styles.detailText}>320 kcal</Text>
                  </View>
                </View>
              </View>
              <View style={styles.timeContainer}>
                <MaterialIcons
                  name="schedule"
                  size={14}
                  color="#619819"
                  style={styles.timeIcon}
                />
                <Text style={styles.timeText}>07:00</Text>
              </View>
            </View>
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
  sectionContainer: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2d3436",
    marginBottom: 12,
  },
  tableContainer: {
    backgroundColor: "rgba(97, 152, 25, 0.05)",
    borderRadius: 12,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "rgba(97, 152, 25, 0.1)",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(97, 152, 25, 0.1)",
  },
  mainContent: {
    flex: 1,
    gap: 6,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  tableCellTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: "#2d3436",
  },
  detailsContainer: {
    gap: 4,
    paddingLeft: 28, // Aligns with title text
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    color: "#636e72",
  },
  timeContainer: {
    backgroundColor: "rgba(97, 152, 25, 0.1)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timeText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#619819",
  },
});

export default GeneralView;
