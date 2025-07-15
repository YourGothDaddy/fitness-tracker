import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BarChart, LineChart } from "react-native-chart-kit";
import { Colors } from "@/constants/Colors";
import { nutritionService } from "../../services/nutritionService";
import { weightService } from "../../services/weightService";
import { activityService } from "../../services/activityService";
import { useRouter } from "expo-router";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";

// Helper function to format numbers with commas
const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// Helper function to get start and end dates for a week
const getWeekDates = () => {
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 6); // Last 7 days including today
  startDate.setHours(0, 0, 0, 0); // Set start date to beginning of day
  today.setHours(23, 59, 59, 999); // Set end date to end of day
  return { startDate, endDate: today };
};

// Helper function to format date to day name
const getDayName = (date) => {
  return new Date(date).toLocaleDateString("en-US", { weekday: "short" });
};

const TIMEFRAMES = [
  { label: "Today", value: "today" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
];

const getTimeframeDates = (timeframe) => {
  const today = new Date();
  let startDate, endDate;
  switch (timeframe) {
    case "today":
      startDate = new Date(today);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(today);
      endDate.setHours(23, 59, 59, 999);
      break;
    case "month":
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today);
      endDate.setHours(23, 59, 59, 999);
      break;
    case "week":
    default:
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(today);
      endDate.setHours(23, 59, 59, 999);
      break;
  }
  return { startDate, endDate };
};

const GeneralView = () => {
  const [error, setError] = useState("");
  const [calorieOverview, setCalorieOverview] = useState({
    dailyAverage: 0,
    target: 0,
    deficit: 0,
    dailyCalories: [],
  });
  const [weightProgress, setWeightProgress] = useState({
    startingWeight: 0,
    currentWeight: 0,
    change: 0,
    goalWeight: 0,
    progressPercentage: 0,
    dailyWeights: [],
  });
  const [activityOverview, setActivityOverview] = useState({
    meals: [],
    exercises: [],
  });
  const [isWeightLoading, setIsWeightLoading] = useState(true);
  const [isActivityLoading, setIsActivityLoading] = useState(true);
  const router = useRouter();
  const [selectedTimeframe, setSelectedTimeframe] = useState("week");
  const [isTimeframeModalVisible, setIsTimeframeModalVisible] = useState(false);
  const [selectedWeightTimeframe, setSelectedWeightTimeframe] =
    useState("week");
  const [isWeightTimeframeModalVisible, setIsWeightTimeframeModalVisible] =
    useState(false);
  const [activityDate, setActivityDate] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });

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
      value: activityDate,
      mode: "date",
      is24Hour: true,
      onChange: (event, selectedDate) => {
        if (event.type === "set" && selectedDate) {
          // Set to midnight local time to avoid timezone issues
          selectedDate.setHours(0, 0, 0, 0);
          setActivityDate(selectedDate);
        }
      },
      maximumDate: new Date(),
    });
  };

  // Helper to get a date object at midnight local, but send as UTC midnight for the selected local day
  const getLocalDateAtMidnightUTC = (date) => {
    // Create a new date at midnight local
    const localMidnight = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      0,
      0,
      0,
      0
    );
    // Get the UTC equivalent of that local midnight
    return new Date(
      Date.UTC(
        localMidnight.getFullYear(),
        localMidnight.getMonth(),
        localMidnight.getDate()
      )
    );
  };

  const fetchCalorieOverview = async (timeframe = selectedTimeframe) => {
    try {
      const data = await nutritionService.getCalorieOverview(
        null,
        null,
        timeframe
      );
      setCalorieOverview(data);
      setError("");
    } catch (err) {
      setError("Failed to fetch calorie data");
      if (err.logout) {
        router.replace("/");
      }
    }
  };

  const fetchWeightProgress = async (timeframe = selectedWeightTimeframe) => {
    try {
      // Use the same getTimeframeDates helper as for calories
      const { startDate, endDate } = getTimeframeDates(timeframe);
      const data = await weightService.getWeightProgress(startDate, endDate);
      setWeightProgress(data);
      setError("");
    } catch (err) {
      setError("Failed to fetch weight data");
      console.error("Error fetching weight progress:", err);

      // Check if this is an auth error that couldn't be automatically handled
      if (err.logout) {
        // Redirect to login page if needed
        router.replace("/");
      }
    } finally {
      setIsWeightLoading(false);
    }
  };

  // Fetch activity overview for the selected date
  const fetchActivityOverview = async (date = activityDate) => {
    try {
      setIsActivityLoading(true);
      // Always send the local day as UTC midnight for that local day
      const dateToSend = getLocalDateAtMidnightUTC(date);
      const data = await activityService.getActivityOverview(dateToSend);
      setActivityOverview(data);
      setError("");
    } catch (err) {
      setError("Failed to fetch activity data");
      console.error("Error fetching activity overview:", err);
      if (err.logout) {
        router.replace("/");
      }
    } finally {
      setIsActivityLoading(false);
    }
  };

  // Fetch calorie overview when selectedTimeframe changes
  useEffect(() => {
    fetchCalorieOverview(selectedTimeframe);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTimeframe]);

  // Fetch weight progress when selectedWeightTimeframe changes
  useEffect(() => {
    fetchWeightProgress(selectedWeightTimeframe);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWeightTimeframe]);

  // Fetch activity overview when activityDate changes
  useEffect(() => {
    fetchActivityOverview(activityDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activityDate]);

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
    labels: weightProgress.dailyWeights.map((day) => day.dayName),
    datasets: [
      {
        data: weightProgress.dailyWeights.map((day) => day.weight),
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

  // Helper function to get meal type icon
  const getMealTypeIcon = (mealType) => {
    switch (mealType) {
      case 0: // Breakfast
        return "free-breakfast";
      case 1: // Lunch
        return "lunch-dining";
      case 2: // Dinner
        return "dinner-dining";
      case 3: // Snack
        return "icecream";
      default:
        return "restaurant";
    }
  };

  // Add this helper function near getMealTypeIcon
  const getExerciseIcon = (activityTypeName, activityCategoryName) => {
    if (activityCategoryName === "Cardio") {
      if (activityTypeName === "Cycling") return "directions-bike";
      if (activityTypeName === "Running") return "directions-run";
      if (activityTypeName === "Swimming") return "pool";
      if (activityTypeName === "Jumping Rope") return "sports";
      if (activityTypeName === "Walking") return "directions-walk";
      return "favorite";
    }
    if (activityCategoryName === "Gym") {
      if (activityTypeName === "Resistance Training") return "fitness-center";
      if (activityTypeName === "Circuit Training") return "fitness-center";
      return "fitness-center";
    }
    if (activityCategoryName === "Outdoor Activity") {
      if (activityTypeName === "Hiking") return "terrain";
      if (activityTypeName === "Cycling") return "directions-bike";
      return "explore";
    }
    return "fitness-center";
  };

  return (
    <ScrollView style={styles.container}>
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
        </View>
        {/* Timeframe Badge - moved below title and centered */}
        <View style={styles.timeframeBadgeWrapper}>
          <TouchableOpacity
            style={styles.badgeContainer}
            onPress={() => setIsTimeframeModalVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.badgeText}>
              {TIMEFRAMES.find((t) => t.value === selectedTimeframe)?.label ||
                "This Week"}
            </Text>
            <MaterialIcons
              name="arrow-drop-down"
              size={20}
              color="#619819"
              style={{ marginLeft: 2 }}
            />
          </TouchableOpacity>
        </View>
        <Modal
          visible={isTimeframeModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setIsTimeframeModalVisible(false)}
        >
          <Pressable
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(0,0,0,0.2)",
            }}
            onPress={() => setIsTimeframeModalVisible(false)}
          >
            <View
              style={{
                backgroundColor: "#fff",
                borderRadius: 12,
                padding: 16,
                minWidth: 180,
                elevation: 5,
              }}
            >
              {TIMEFRAMES.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={{ paddingVertical: 10, paddingHorizontal: 8 }}
                  onPress={() => {
                    setSelectedTimeframe(option.value);
                    setIsTimeframeModalVisible(false);
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      color:
                        option.value === selectedTimeframe
                          ? "#619819"
                          : "#2d3436",
                      fontWeight:
                        option.value === selectedTimeframe ? "700" : "500",
                    }}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Pressable>
        </Modal>

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
        </View>
        {/* Timeframe Badge - moved below title and centered */}
        <View style={styles.timeframeBadgeWrapper}>
          <TouchableOpacity
            style={styles.badgeContainer}
            onPress={() => setIsWeightTimeframeModalVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.badgeText}>
              {TIMEFRAMES.find((t) => t.value === selectedWeightTimeframe)
                ?.label || "This Week"}
            </Text>
            <MaterialIcons
              name="arrow-drop-down"
              size={20}
              color="#619819"
              style={{ marginLeft: 2 }}
            />
          </TouchableOpacity>
        </View>
        <Modal
          visible={isWeightTimeframeModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setIsWeightTimeframeModalVisible(false)}
        >
          <Pressable
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(0,0,0,0.2)",
            }}
            onPress={() => setIsWeightTimeframeModalVisible(false)}
          >
            <View
              style={{
                backgroundColor: "#fff",
                borderRadius: 12,
                padding: 16,
                minWidth: 180,
                elevation: 5,
              }}
            >
              {TIMEFRAMES.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={{ paddingVertical: 10, paddingHorizontal: 8 }}
                  onPress={() => {
                    setSelectedWeightTimeframe(option.value);
                    setIsWeightTimeframeModalVisible(false);
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      color:
                        option.value === selectedWeightTimeframe
                          ? "#619819"
                          : "#2d3436",
                      fontWeight:
                        option.value === selectedWeightTimeframe
                          ? "700"
                          : "500",
                    }}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Pressable>
        </Modal>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Starting</Text>
            <View style={styles.statValueContainer}>
              <Text style={styles.statValue}>
                {weightProgress.startingWeight.toFixed(1)}
              </Text>
              <Text style={styles.statUnit}>kg</Text>
            </View>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Current</Text>
            <View style={styles.statValueContainer}>
              <Text style={styles.statValue}>
                {weightProgress.currentWeight.toFixed(1)}
              </Text>
              <Text style={styles.statUnit}>kg</Text>
            </View>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Change</Text>
            <View style={styles.statValueContainer}>
              <Text
                style={[
                  styles.statValue,
                  {
                    color: weightProgress.change <= 0 ? "#27ae60" : "#e74c3c",
                  },
                ]}
              >
                {weightProgress.change <= 0 ? "-" : "+"}
                {Math.abs(weightProgress.change).toFixed(1)}
              </Text>
              <Text style={styles.statUnit}>kg</Text>
            </View>
          </View>
        </View>

        <View style={styles.chartContainer}>
          <View style={styles.chartWrapper}>
            {weightProgress.dailyWeights.length > 0 && (
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
            )}
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
        </View>
        <View style={styles.timeframeBadgeWrapper}>
          <TouchableOpacity
            style={styles.badgeContainer}
            onPress={showDatePicker}
            activeOpacity={0.8}
          >
            <Text style={styles.badgeText}>{formatDate(activityDate)}</Text>
            <MaterialIcons
              name="calendar-today"
              size={20}
              color="#619819"
              style={{ marginLeft: 2 }}
            />
          </TouchableOpacity>
        </View>

        {isActivityLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#619819" />
          </View>
        ) : (
          <>
            {/* Meals Section */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Meals</Text>
              <View style={styles.tableContainer}>
                {/* Table Header */}
                <View style={styles.tableHeader}>
                  <Text style={styles.tableHeaderText}>Meal & Calories</Text>
                  <Text style={styles.tableHeaderText}>Time</Text>
                </View>

                {activityOverview.meals && activityOverview.meals.length > 0 ? (
                  activityOverview.meals.map((meal, index) => (
                    <View key={`meal-${index}`} style={styles.tableRow}>
                      <View style={styles.mainContent}>
                        <View style={styles.titleContainer}>
                          <MaterialIcons
                            name={getMealTypeIcon(meal.mealType)}
                            size={20}
                            color="#619819"
                          />
                          <Text style={styles.tableCellTitle} numberOfLines={1}>
                            {meal.name}
                          </Text>
                        </View>
                        <View style={styles.detailsContainer}>
                          {meal.weight > 0 && (
                            <View style={styles.detailRow}>
                              <MaterialIcons
                                name="scale"
                                size={16}
                                color="#636e72"
                              />
                              <Text style={styles.detailText}>
                                {meal.weight}g
                              </Text>
                            </View>
                          )}
                          <View style={styles.detailRow}>
                            <MaterialIcons
                              name="local-fire-department"
                              size={16}
                              color="#636e72"
                            />
                            <Text style={styles.detailText}>
                              {meal.calories} kcal
                            </Text>
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
                        <Text style={styles.timeText}>
                          {activityService.formatTime(meal.time)}
                        </Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <View style={styles.emptyStateContainer}>
                    <Text style={styles.emptyStateText}>
                      No meals recorded today
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Exercises Section */}
            <View style={[styles.sectionContainer, { marginTop: 20 }]}>
              <Text style={styles.sectionTitle}>Exercises</Text>
              <View style={styles.tableContainer}>
                {/* Table Header */}
                <View style={styles.tableHeader}>
                  <Text style={styles.tableHeaderText}>
                    Exercise & Calories
                  </Text>
                  <Text style={styles.tableHeaderText}>Time</Text>
                </View>

                {activityOverview.exercises &&
                activityOverview.exercises.length > 0 ? (
                  activityOverview.exercises.map((exercise, index) => (
                    <View key={`exercise-${index}`} style={styles.tableRow}>
                      <View style={styles.mainContent}>
                        <View style={styles.titleContainer}>
                          <MaterialIcons
                            name={getExerciseIcon(
                              exercise.name,
                              exercise.category
                            )}
                            size={20}
                            color="#619819"
                          />
                          <Text style={styles.tableCellTitle}>
                            {exercise.name}
                          </Text>
                        </View>
                        <View style={styles.detailsContainer}>
                          <View style={styles.detailRow}>
                            <MaterialIcons
                              name="timer"
                              size={16}
                              color="#636e72"
                            />
                            <Text style={styles.detailText}>
                              {exercise.durationInMinutes} min
                            </Text>
                          </View>
                          <View style={styles.detailRow}>
                            <MaterialIcons
                              name="local-fire-department"
                              size={16}
                              color="#636e72"
                            />
                            <Text style={styles.detailText}>
                              {exercise.caloriesBurned} kcal
                            </Text>
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
                        <Text style={styles.timeText}>
                          {activityService.formatTime(exercise.time)}
                        </Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <View style={styles.emptyStateContainer}>
                    <Text style={styles.emptyStateText}>
                      No exercises recorded today
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </>
        )}
      </LinearGradient>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    backgroundColor: "#ffffff",
    overflow: "hidden",
    marginBottom: 24,
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
  tableHeaderText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2d3436",
    flex: 1,
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateText: {
    fontSize: 14,
    color: "#636e72",
    fontStyle: "italic",
  },
  timeframeBadgeWrapper: {
    alignItems: "center",
    marginBottom: 16,
    marginTop: -8, // pulls it a bit closer to the title, adjust as needed
  },
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(97, 152, 25, 0.13)",
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 24,
    shadowColor: "#619819",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: "rgba(97, 152, 25, 0.18)",
    marginTop: 0,
  },
});

export default GeneralView;
