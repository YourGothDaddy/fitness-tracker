import React, { useState, useCallback, useRef, useMemo } from "react";
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
  RefreshControl,
} from "react-native";
import Icon from "../../../components/Icon";
import { LinearGradient } from "expo-linear-gradient";
import { BarChart, LineChart, PieChart } from "react-native-chart-kit";
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
  const [energyBudget, setEnergyBudget] = useState({
    target: 0,
    consumed: 0,
    remaining: 0,
    overLimit: 0,
  });
  const [energyExpenditure, setEnergyExpenditure] = useState({
    exerciseCalories: 0,
    baselineActivityCalories: 0,
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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [energyBudgetDate, setEnergyBudgetDate] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });
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

  const fetchEnergyBudget = useCallback(
    async (date = energyBudgetDate) => {
      const requestId = "energy-budget-" + Date.now();
      pendingRequests.current.add(requestId);

      try {
        const data = await nutritionService.getEnergyBudget(date);
        if (!isMounted.current) return;

        setEnergyBudget({
          target: data.target,
          consumed: data.consumed,
          remaining: Math.max(0, data.remaining),
          overLimit: Math.max(0, -data.remaining),
        });
        setError("");
      } catch (err) {
        handleError(err, "energy budget");
      } finally {
        if (isMounted.current) {
          pendingRequests.current.delete(requestId);
          if (pendingRequests.current.size === 0) {
            setIsLoading(false);
          }
        }
      }
    },
    [energyBudgetDate, handleError]
  );

  const fetchEnergyExpenditure = useCallback(
    async (date = energyBudgetDate) => {
      const requestId = "energy-expenditure-" + Date.now();
      pendingRequests.current.add(requestId);
      try {
        const data = await nutritionService.getEnergyExpenditure(date);
        if (!isMounted.current) return;
        setEnergyExpenditure({
          exerciseCalories: data.exerciseCalories ?? 0,
          baselineActivityCalories: data.baselineActivityCalories ?? 0,
        });
      } catch (err) {
        handleError(err, "energy expenditure");
      } finally {
        if (isMounted.current) {
          pendingRequests.current.delete(requestId);
          if (pendingRequests.current.size === 0) {
            setIsLoading(false);
          }
        }
      }
    },
    [energyBudgetDate, handleError]
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
        // Find the meal to get its calories before deleting
        const mealToDelete = activityOverview.meals.find(
          (meal) => meal.id === mealId
        );
        const caloriesToRemove = mealToDelete ? mealToDelete.calories : 0;

        // Remove meal from state immediately for instant UI feedback
        setActivityOverview((prev) => ({
          ...prev,
          meals: prev.meals.filter((meal) => meal.id !== mealId),
        }));

        // Update energy budget immediately to reflect the deletion
        setEnergyBudget((prev) => ({
          ...prev,
          consumed: Math.max(0, prev.consumed - caloriesToRemove),
        }));

        await mealService.deleteMeal(mealId);
        // Don't refresh data immediately - trust our local state
        // The item will be gone on next app refresh or navigation
      } catch (err) {
        // If deletion fails, revert both state changes
        setActivityOverview((prev) => ({
          ...prev,
          meals: prev.meals.filter((meal) => meal.id !== mealId),
        }));
        setEnergyBudget((prev) => ({
          ...prev,
          consumed:
            prev.consumed +
            (activityOverview.meals.find((meal) => meal.id === mealId)
              ?.calories || 0),
        }));
        handleError(err, "meal deletion");
      }
    },
    [activityOverview.meals, handleError]
  );

  const handleDeleteExercise = useCallback(
    async (activityId) => {
      try {
        // Find the exercise to get its calories before deleting
        const exerciseToDelete = activityOverview.exercises.find(
          (exercise) => exercise.id === activityId
        );
        const caloriesToRemove = exerciseToDelete
          ? exerciseToDelete.caloriesBurned
          : 0;

        // Remove exercise from state immediately for instant UI feedback
        setActivityOverview((prev) => ({
          ...prev,
          exercises: prev.exercises.filter(
            (exercise) => exercise.id !== activityId
          ),
        }));

        // Update energy expenditure immediately to reflect the deletion
        setEnergyExpenditure((prev) => ({
          ...prev,
          exerciseCalories: Math.max(
            0,
            prev.exerciseCalories - caloriesToRemove
          ),
        }));

        await activityService.deleteActivity(activityId);
        // Don't refresh data immediately - trust our local state
        // The item will be gone on next app refresh or navigation
      } catch (err) {
        // If deletion fails, revert both state changes
        setActivityOverview((prev) => ({
          ...prev,
          exercises: prev.exercises.filter(
            (exercise) => exercise.id !== activityId
          ),
        }));
        setEnergyExpenditure((prev) => ({
          ...prev,
          exerciseCalories:
            prev.exerciseCalories +
            (activityOverview.exercises.find(
              (exercise) => exercise.id === activityId
            )?.caloriesBurned || 0),
        }));
        handleError(err, "exercise deletion");
      }
    },
    [activityOverview.exercises, handleError]
  );

  useFocusEffect(
    useCallback(() => {
      isMounted.current = true;
      setIsLoading(true);

      const fetchData = async () => {
        try {
          await Promise.all([
            fetchEnergyBudget(energyBudgetDate),
            fetchEnergyExpenditure(energyBudgetDate),
            fetchWeightProgress(selectedWeightTimeframe),
            fetchActivityOverview(activityDate),
          ]);
        } catch (error) {
          handleError(error, "data");
        }
      };

      // Always fetch data when focusing on this tab
      // This ensures fresh data when returning from add meal/exercise views
      fetchData();
      return cleanup;
    }, [
      energyBudgetDate,
      fetchEnergyExpenditure,
      selectedWeightTimeframe,
      activityDate,
      fetchEnergyBudget,
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

  const computedRemainingRaw =
    (energyBudget.target || 0) +
    (energyExpenditure.exerciseCalories || 0) -
    (energyBudget.consumed || 0);
  const computedRemaining = Math.max(0, computedRemainingRaw);
  const computedOverLimit = Math.max(0, -computedRemainingRaw);

  const hasEnergyBudgetData = useCallback(() => {
    return (
      (energyBudget.consumed || 0) > 0 ||
      computedRemaining > 0 ||
      computedOverLimit > 0
    );
  }, [energyBudget, computedRemaining, computedOverLimit]);

  const getDefaultEnergyBudgetData = () => [
    {
      name: "",
      population: 1,
      color: "#E0E0E0",
      legendFontColor: "#FFFFFF",
    },
  ];

  const budgetData = useMemo(
    () =>
      hasEnergyBudgetData()
        ? computedOverLimit > 0
          ? [
              {
                name: "Consumed",
                population: energyBudget.consumed,
                color: Colors.brightRed.color,
                legendFontColor: "#7F7F7F",
              },
              {
                name: "Over Limit",
                population: computedOverLimit,
                color: Colors.brightRed.color,
                legendFontColor: "#7F7F7F",
              },
            ]
          : [
              {
                name: "Remaining",
                population: computedRemaining,
                color: Colors.blue.color,
                legendFontColor: "#7F7F7F",
              },
              {
                name: "Consumed",
                population: energyBudget.consumed,
                color: Colors.green.color,
                legendFontColor: "#7F7F7F",
              },
            ]
        : getDefaultEnergyBudgetData(),
    [energyBudget, hasEnergyBudgetData, computedRemaining, computedOverLimit]
  );

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

  const showEnergyBudgetDatePicker = useCallback(() => {
    try {
      DateTimePickerAndroid.open({
        value: energyBudgetDate,
        mode: "date",
        is24Hour: true,
        onChange: (event, selectedDate) => {
          if (event.type === "set" && selectedDate) {
            selectedDate.setHours(0, 0, 0, 0);
            setEnergyBudgetDate(selectedDate);
            fetchEnergyBudget(selectedDate);
            fetchEnergyExpenditure(selectedDate);
          }
        },
        maximumDate: new Date(),
      });
    } catch (error) {
      console.error("DatePicker error:", error);
      setError("Failed to open date picker. Please try again.");
    }
  }, [energyBudgetDate, fetchEnergyBudget, fetchEnergyExpenditure]);

  // Manual refresh function for debugging or manual refresh scenarios
  const refreshAllData = useCallback(async () => {
    if (!isMounted.current) return;

    try {
      setIsLoading(true);
      await Promise.all([
        fetchEnergyBudget(energyBudgetDate),
        fetchEnergyExpenditure(energyBudgetDate),
        fetchWeightProgress(selectedWeightTimeframe),
        fetchActivityOverview(activityDate),
      ]);
    } catch (error) {
      handleError(error, "manual refresh");
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [
    energyBudgetDate,
    selectedWeightTimeframe,
    activityDate,
    fetchEnergyBudget,
    fetchEnergyExpenditure,
    fetchWeightProgress,
    fetchActivityOverview,
    handleError,
  ]);

  // Pull-to-refresh handler
  const onRefresh = useCallback(async () => {
    if (!isMounted.current) return;

    setIsRefreshing(true);
    try {
      await Promise.all([
        fetchEnergyBudget(energyBudgetDate),
        fetchEnergyExpenditure(energyBudgetDate),
        fetchActivityOverview(activityDate),
      ]);
    } catch (error) {
      // Silent refresh - don't show errors for pull-to-refresh
      console.log("Pull-to-refresh failed:", error);
    } finally {
      if (isMounted.current) {
        setIsRefreshing(false);
      }
    }
  }, [
    energyBudgetDate,
    activityDate,
    fetchEnergyBudget,
    fetchEnergyExpenditure,
    fetchActivityOverview,
  ]);

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

  const weightData = useMemo(
    () => ({
      labels: weightLabels.length > 0 ? weightLabels : ["No Data"],
      datasets: [
        {
          data: weightValues.length > 0 ? weightValues : [0],
          color: () => Colors.green.color,
          strokeWidth: 2,
        },
      ],
    }),
    [weightLabels, weightValues]
  );

  const chartConfig = useMemo(
    () => ({
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
    }),
    []
  );

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
      if (activityTypeName === "HIIT") return "flash-on";
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

  const renderMealItem = useCallback(
    ({ item }) => (
      <View style={styles.tableRow}>
        <TouchableOpacity
          accessibilityLabel="Delete meal"
          onPress={() => handleDeleteMeal(item.id)}
          style={styles.deleteButton}
        >
          <Icon name="delete" size={20} color="#e74c3c" />
        </TouchableOpacity>
        <View style={styles.rowTop}>
          <View style={styles.titleContainer}>
            <Icon
              name={getMealTypeIcon(item.mealType)}
              size={20}
              color="#619819"
            />
            <Text style={styles.tableCellTitle} numberOfLines={1}>
              {item.name}
            </Text>
          </View>
        </View>
        <View style={styles.rowBottom}>
          <Text style={styles.calorieText}>{item.calories} kcal</Text>
          <View style={styles.timeInline}>
            <Icon
              name="schedule"
              size={14}
              color="#619819"
              style={styles.timeIcon}
            />
            <Text style={styles.timeText}>
              {activityService.formatTime(item.time)}
            </Text>
          </View>
        </View>
      </View>
    ),
    [handleDeleteMeal]
  );

  const renderExerciseItem = useCallback(
    ({ item }) => (
      <View style={styles.tableRow}>
        <TouchableOpacity
          accessibilityLabel="Delete exercise"
          onPress={() => handleDeleteExercise(item.id)}
          style={styles.deleteButton}
        >
          <Icon name="delete" size={20} color="#e74c3c" />
        </TouchableOpacity>
        <View style={styles.rowTop}>
          <View style={styles.titleContainer}>
            <Icon
              name={getExerciseIcon(item.name, item.category)}
              size={20}
              color="#619819"
            />
            <Text style={styles.tableCellTitle}>{item.name}</Text>
          </View>
        </View>
        <View style={styles.rowBottom}>
          <Text style={styles.calorieText}>{item.caloriesBurned} kcal</Text>
          <View style={styles.timeInline}>
            <Icon
              name="schedule"
              size={14}
              color="#619819"
              style={styles.timeIcon}
            />
            <Text style={styles.timeText}>
              {activityService.formatTime(item.time)}
            </Text>
          </View>
        </View>
      </View>
    ),
    [handleDeleteExercise]
  );

  const keyExtractorById = useCallback((x) => String(x.id), []);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          colors={["#619819"]}
          tintColor="#619819"
        />
      }
    >
      {/* Energy Budget Card */}
      <LinearGradient colors={["#ffffff", "#f8faf5"]} style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <Icon
              name="account-balance"
              size={24}
              color="#619819"
              style={styles.headerIcon}
            />
            <Text style={styles.cardTitle}>Energy Budget</Text>
          </View>
        </View>

        <View style={styles.subtitleContainer}>
          <Text style={styles.formulaText}>
            Remaining = Target + Exercise - Consumed
          </Text>
        </View>

        <View style={styles.dateButtonContainer}>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={showEnergyBudgetDatePicker}
            activeOpacity={0.8}
          >
            <Icon
              name="calendar-today"
              size={18}
              color="#619819"
              style={styles.dateButtonIcon}
            />
            <Text style={styles.dateButtonText}>
              {formatDate(energyBudgetDate)}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.chartContainer}>
          <View style={styles.chartWrapper}>
            <PieChart
              data={budgetData}
              width={screenWidth}
              height={180}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="0"
              absolute
            />
            {!hasEnergyBudgetData() && (
              <View style={styles.noDataOverlayEnergy}>
                <Text style={styles.noDataTextEnergy}>No Data</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.budgetDetailsContainer}>
          {[
            {
              title: "Target",
              value: energyBudget.target,
              icon: "flag",
              color: Colors.darkGreen.color,
            },
            ...(computedOverLimit > 0
              ? [
                  {
                    title: "Consumed",
                    value: energyBudget.consumed,
                    icon: "restaurant",
                    color: Colors.green.color,
                  },
                ]
              : [
                  {
                    title: "Remaining",
                    value: computedRemaining,
                    icon: "hourglass-empty",
                    color: Colors.blue.color,
                  },
                ]),
            {
              title: "Exercise",
              value: Math.round(energyExpenditure.exerciseCalories),
              icon: "directions-run",
              color: Colors.blue.color,
            },
          ].map((item) => (
            <View key={item.title} style={styles.budgetRow}>
              <View style={styles.budgetIconContainer}>
                <LinearGradient
                  colors={[item.color, shadeColor(item.color, 20)]}
                  style={styles.budgetIconGradient}
                >
                  <Icon name={item.icon} size={20} color="white" />
                </LinearGradient>
              </View>
              <View style={styles.budgetInfo}>
                <Text style={styles.budgetTitle}>{item.title}</Text>
                <Text
                  style={[
                    styles.budgetValue,
                    item.title === "Over Limit" && {
                      color: Colors.brightRed.color,
                      fontWeight: "600",
                    },
                  ]}
                >
                  {item.value} kcal
                </Text>
              </View>
            </View>
          ))}
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
        <View style={styles.dateButtonContainer}>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setIsWeightTimeframeModalVisible(true)}
            activeOpacity={0.8}
          >
            <Icon
              name="calendar-today"
              size={18}
              color="#619819"
              style={styles.dateButtonIcon}
            />
            <Text style={styles.dateButtonText}>
              {TIMEFRAMES.find((t) => t.value === selectedWeightTimeframe)
                ?.label || "This Week"}
            </Text>
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
                      fontSize: 14,
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
        <View style={styles.dateButtonContainer}>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={showDatePicker}
            activeOpacity={0.8}
          >
            <Icon
              name="calendar-today"
              size={18}
              color="#619819"
              style={styles.dateButtonIcon}
            />
            <Text style={styles.dateButtonText}>
              {formatDate(activityDate)}
            </Text>
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
                  activityOverview.meals.map((meal, idx) => (
                    <View
                      key={`meal-${meal.id ?? idx}`}
                      style={styles.tableRow}
                    >
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
                  activityOverview.exercises.map((exercise, idx) => (
                    <View
                      key={`exercise-${exercise.id ?? idx}`}
                      style={styles.tableRow}
                    >
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
    paddingBottom: 32,
    gap: 20,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    backgroundColor: "#ffffff",
    overflow: "hidden",
    marginBottom: 20,
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
    fontSize: 16,
    fontWeight: "600",
    color: "#2d3436",
  },
  cardSubtitle: {
    fontSize: 12,
    color: "#7f8c8d",
    marginTop: -10,
    marginBottom: 10,
    paddingHorizontal: 2,
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
    marginBottom: 20,
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
    fontSize: 15,
    fontWeight: "700",
    color: "#2d3436",
    textAlign: "center",
    marginBottom: 4,
  },
  statUnit: {
    fontSize: 12,
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
  noDataOverlayEnergy: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -40 }, { translateY: -15 }],
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 1,
  },
  noDataTextEnergy: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  chart: {
    borderRadius: 16,
    marginLeft: -10,
  },
  sectionContainer: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 14,
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
  calorieText: { fontSize: 12, color: "#636e72", paddingLeft: 28 },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  tableCellTitle: {
    flex: 1,
    fontSize: 14,
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
    fontSize: 12,
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
    fontSize: 12,
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
  subtitleContainer: {
    marginBottom: 8,
    marginTop: -8,
  },
  formulaText: {
    fontSize: 12,
    color: "#7f8c8d",
    fontStyle: "italic",
    textAlign: "left",
  },
  dateButtonContainer: {
    alignItems: "flex-end",
    marginTop: 8,
    marginBottom: 16,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(97, 152, 25, 0.08)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(97, 152, 25, 0.15)",
  },
  dateButtonIcon: {
    marginRight: 8,
  },
  dateButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#619819",
  },
  budgetDetailsContainer: {
    marginTop: 16,
    gap: 16,
  },
  budgetRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(97, 152, 25, 0.08)",
  },
  budgetIconContainer: {
    marginRight: 16,
  },
  budgetIconGradient: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  budgetInfo: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  budgetTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2d3436",
    marginBottom: 2,
  },
  budgetValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2d3436",
  },
});

export default GeneralView;
