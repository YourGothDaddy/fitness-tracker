import React, { useState, useCallback, useRef } from "react";
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
import Icon from "../../../components/Icon";
import { LinearGradient } from "expo-linear-gradient";
import { BarChart, LineChart } from "react-native-chart-kit";
import { Colors } from "@/constants/Colors";
import { nutritionService } from "../../services/nutritionService";
import { weightService } from "../../services/weightService";
import { activityService } from "../../services/activityService";
import { mealService } from "../../services/mealService";
import { useRouter } from "expo-router";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { useFocusEffect } from "@react-navigation/native";

const getWeekDates = () => {
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 6);
  startDate.setHours(0, 0, 0, 0);
  today.setHours(23, 59, 59, 999);
  return { startDate, endDate: today };
};

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
  const [isLoading, setIsLoading] = useState(true);
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

  const isMounted = useRef(true);
  const pendingRequests = useRef(new Set());
  const router = useRouter();

  const formatDate = (date) => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatShortDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const showDatePicker = useCallback(() => {
    try {
      DateTimePickerAndroid.open({
        value: activityDate,
        mode: "date",
        is24Hour: true,
        onChange: (event, selectedDate) => {
          if (event.type === "set" && selectedDate) {
            selectedDate.setHours(0, 0, 0, 0);
            setActivityDate(selectedDate);
          }
        },
        maximumDate: new Date(),
      });
    } catch (error) {
      console.error("DatePicker error:", error);
      setError("Failed to open date picker. Please try again.");
    }
  }, [activityDate]);

  const getLocalDateAtMidnightUTC = (date) => {
    const localMidnight = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      0,
      0,
      0,
      0
    );
    return new Date(
      Date.UTC(
        localMidnight.getFullYear(),
        localMidnight.getMonth(),
        localMidnight.getDate()
      )
    );
  };

  const cleanup = useCallback(() => {
    return () => {
      isMounted.current = false;
      pendingRequests.current.clear();
    };
  }, []);

  const handleError = useCallback(
    (error, context) => {
      if (!isMounted.current) return;

      if (error.logout) {
        router.replace("/");
        return;
      }

      const status = error?.response?.status;
      if (status === 401) {
        router.replace("/");
        return;
      }

      setError(`Failed to fetch ${context} data. Please try again.`);
    },
    [router]
  );

  const fetchCalorieOverview = useCallback(
    async (timeframe = selectedTimeframe) => {
      const requestId = "calories-" + Date.now();
      pendingRequests.current.add(requestId);

      try {
        const data = await nutritionService.getCalorieOverview(
          null,
          null,
          timeframe
        );
        if (!isMounted.current) return;

        setCalorieOverview(data);
        setError("");
      } catch (err) {
        handleError(err, "calorie");
      } finally {
        if (isMounted.current) {
          pendingRequests.current.delete(requestId);
          if (pendingRequests.current.size === 0) {
            setIsLoading(false);
          }
        }
      }
    },
    [selectedTimeframe, handleError]
  );

  const fetchWeightProgress = useCallback(
    async (timeframe = selectedWeightTimeframe) => {
      const requestId = "weight-" + Date.now();
      pendingRequests.current.add(requestId);
      setIsWeightLoading(true);

      try {
        const { startDate, endDate } = getTimeframeDates(timeframe);
        const data = await weightService.getWeightProgress(startDate, endDate);
        if (!isMounted.current) return;

        setWeightProgress(data);
        setError("");
      } catch (err) {
        handleError(err, "weight");
      } finally {
        if (isMounted.current) {
          setIsWeightLoading(false);
          pendingRequests.current.delete(requestId);
        }
      }
    },
    [selectedWeightTimeframe, handleError]
  );

  const fetchActivityOverview = useCallback(
    async (date = activityDate) => {
      const requestId = "activity-" + Date.now();
      pendingRequests.current.add(requestId);
      setIsActivityLoading(true);

      try {
        const dateToSend = getLocalDateAtMidnightUTC(date);
        const data = await activityService.getActivityOverview(dateToSend);
        if (!isMounted.current) return;

        setActivityOverview(data);
        setError("");
      } catch (err) {
        handleError(err, "activity");
      } finally {
        if (isMounted.current) {
          setIsActivityLoading(false);
          pendingRequests.current.delete(requestId);
        }
      }
    },
    [activityDate, handleError]
  );

  const handleDeleteMeal = useCallback(
    async (mealId) => {
      try {
        await mealService.deleteMeal(mealId);
        await fetchActivityOverview(activityDate);
      } catch (err) {
        handleError(err, "meal deletion");
      }
    },
    [activityDate, fetchActivityOverview, handleError]
  );

  const handleDeleteExercise = useCallback(
    async (activityId) => {
      try {
        await activityService.deleteActivity(activityId);
        await fetchActivityOverview(activityDate);
      } catch (err) {
        handleError(err, "exercise deletion");
      }
    },
    [activityDate, fetchActivityOverview, handleError]
  );

  useFocusEffect(
    useCallback(() => {
      isMounted.current = true;
      setIsLoading(true);

      const fetchData = async () => {
        try {
          await Promise.all([
            fetchCalorieOverview(selectedTimeframe),
            fetchWeightProgress(selectedWeightTimeframe),
            fetchActivityOverview(activityDate),
          ]);
        } catch (error) {
          handleError(error, "data");
        }
      };

      fetchData();
      return cleanup;
    }, [
      selectedTimeframe,
      selectedWeightTimeframe,
      activityDate,
      fetchCalorieOverview,
      fetchWeightProgress,
      fetchActivityOverview,
      handleError,
      cleanup,
    ])
  );

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

  let weightLabels = [],
    weightValues = [];

  if (weightProgress.dailyWeights && weightProgress.dailyWeights.length > 0) {
    if (
      selectedWeightTimeframe === "month" &&
      weightProgress.dailyWeights.length > 2
    ) {
      const len = weightProgress.dailyWeights.length;
      weightLabels = weightProgress.dailyWeights.map((day, idx) => {
        if (idx === 0) return formatShortDate(day.date);
        if (idx === Math.floor(len / 2)) return formatShortDate(day.date);
        if (idx === len - 1) return formatShortDate(day.date);
        return "";
      });
      weightLabels.push("");
      weightValues = weightProgress.dailyWeights.map((day) => day.weight);
      weightValues.push(weightValues[weightValues.length - 1]);
    } else {
      weightLabels = weightProgress.dailyWeights.map((day) => day.dayName);
      weightValues = weightProgress.dailyWeights.map((day) => day.weight);
    }
  }

  const weightData = {
    labels: weightLabels.length > 0 ? weightLabels : ["No Data"],
    datasets: [
      {
        data: weightValues.length > 0 ? weightValues : [0],
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
    formatXLabel: (value) => {
      if (!value || value === "") return "";
      return value;
    },
  };

  const getMealTypeIcon = (mealType) => {
    switch (mealType) {
      case 0:
        return "free-breakfast";
      case 1:
        return "lunch-dining";
      case 2:
        return "dinner-dining";
      case 3:
        return "icecream";
      default:
        return "restaurant";
    }
  };

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
            <Icon
              name="local-fire-department"
              size={24}
              color="#619819"
              style={styles.headerIcon}
            />
            <Text style={styles.cardTitle}>Calorie Overview</Text>
          </View>
        </View>
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
            <Icon
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
            <Text style={styles.statValue}>{calorieOverview.dailyAverage}</Text>
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
            <Text style={styles.statValue}>{calorieOverview.target}</Text>
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
              {Math.abs(calorieOverview.deficit)}
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
            <Icon
              name="monitor-weight"
              size={24}
              color="#619819"
              style={styles.headerIcon}
            />
            <Text style={styles.cardTitle}>Weight Progress</Text>
          </View>
        </View>
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
            <Icon
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
            {isWeightLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#619819" />
              </View>
            ) : weightProgress.dailyWeights &&
              weightProgress.dailyWeights.length > 0 ? (
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
            ) : (
              <View style={styles.emptyStateContainer}>
                <Text style={styles.emptyStateText}>
                  No weight data available for this period
                </Text>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>

      {/* Activity Log Card */}
      <LinearGradient colors={["#ffffff", "#f8faf5"]} style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <Icon
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
            <Icon
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
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Meals</Text>
              <View style={styles.tableContainer}>
                {activityOverview.meals && activityOverview.meals.length > 0 ? (
                  activityOverview.meals.map((meal, index) => (
                    <View key={`meal-${index}`} style={styles.tableRow}>
                      <TouchableOpacity
                        accessibilityLabel="Delete meal"
                        onPress={() => handleDeleteMeal(meal.id)}
                        style={styles.deleteButton}
                      >
                        <Icon name="delete" size={20} color="#e74c3c" />
                      </TouchableOpacity>
                      <View style={styles.rowTop}>
                        <View style={styles.titleContainer}>
                          <Icon
                            name={getMealTypeIcon(meal.mealType)}
                            size={20}
                            color="#619819"
                          />
                          <Text style={styles.tableCellTitle} numberOfLines={1}>
                            {meal.name}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.rowBottom}>
                        <Text style={styles.calorieText}>
                          {meal.calories} kcal
                        </Text>
                        <View style={styles.timeInline}>
                          <Icon
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

            <View style={[styles.sectionContainer, { marginTop: 20 }]}>
              <Text style={styles.sectionTitle}>Exercises</Text>
              <View style={styles.tableContainer}>
                {activityOverview.exercises &&
                activityOverview.exercises.length > 0 ? (
                  activityOverview.exercises.map((exercise, index) => (
                    <View key={`exercise-${index}`} style={styles.tableRow}>
                      <TouchableOpacity
                        accessibilityLabel="Delete exercise"
                        onPress={() => handleDeleteExercise(exercise.id)}
                        style={styles.deleteButton}
                      >
                        <Icon name="delete" size={20} color="#e74c3c" />
                      </TouchableOpacity>
                      <View style={styles.rowTop}>
                        <View style={styles.titleContainer}>
                          <Icon
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
                      </View>
                      <View style={styles.rowBottom}>
                        <Text style={styles.calorieText}>
                          {exercise.caloriesBurned} kcal
                        </Text>
                        <View style={styles.timeInline}>
                          <Icon
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
    minHeight: 200,
  },
  chartWrapper: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 200,
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
    alignItems: "center",
  },
  leftHeader: { flex: 1 },
  tableRow: {
    position: "relative",
    padding: 16,
    paddingTop: 18,
    paddingRight: 48,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(97, 152, 25, 0.1)",
  },
  rowTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  rowBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  calorieText: { fontSize: 13, color: "#636e72", paddingLeft: 28 },
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
    paddingLeft: 28,
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
  timeHeaderContainer: {
    width: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  timeInline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(97, 152, 25, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  iconButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  actionsHeaderContainer: { width: 44 },
  deleteButton: {
    position: "absolute",
    top: 10,
    right: 12,
    padding: 6,
    zIndex: 1,
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
    marginTop: -8,
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
