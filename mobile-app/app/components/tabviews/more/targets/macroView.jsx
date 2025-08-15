import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { Colors } from "../../../../../constants/Colors";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import userService from "@/app/services/userService";
import { useFocusEffect } from "@react-navigation/native";
import Slider from "@react-native-community/slider";

const { width } = Dimensions.get("window");

// Macro distribution chart component
const MacroChart = React.memo(({ protein, carbs, fat, totalKcal }) => {
  const total = protein + carbs + fat;
  const proteinWidth = total > 0 ? (protein / total) * 100 : 0;
  const carbsWidth = total > 0 ? (carbs / total) * 100 : 0;
  const fatWidth = total > 0 ? (fat / total) * 100 : 0;

  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>Macro Distribution</Text>
      <View style={styles.chartBar}>
        <View
          style={[
            styles.chartSegment,
            { backgroundColor: Colors.green.color, width: `${proteinWidth}%` },
          ]}
        />
        <View
          style={[
            styles.chartSegment,
            { backgroundColor: Colors.blue.color, width: `${carbsWidth}%` },
          ]}
        />
        <View
          style={[
            styles.chartSegment,
            { backgroundColor: Colors.red.color, width: `${fatWidth}%` },
          ]}
        />
      </View>
      <View style={styles.chartLegend}>
        <View style={styles.legendItem}>
          <View
            style={[styles.legendDot, { backgroundColor: Colors.green.color }]}
          />
          <Text style={styles.legendText}>Protein</Text>
        </View>
        <View style={styles.legendItem}>
          <View
            style={[styles.legendDot, { backgroundColor: Colors.blue.color }]}
          />
          <Text style={styles.legendText}>Carbs</Text>
        </View>
        <View style={styles.legendItem}>
          <View
            style={[styles.legendDot, { backgroundColor: Colors.red.color }]}
          />
          <Text style={styles.legendText}>Fat</Text>
        </View>
      </View>
    </View>
  );
});

// Macro slider component
const MacroSlider = React.memo(
  ({
    title,
    color,
    value,
    onValueChange,
    min,
    max,
    step,
    unit,
    kcal,
    grams,
  }) => (
    <View style={styles.sliderContainer}>
      <View style={styles.sliderHeader}>
        <View style={styles.sliderTitleContainer}>
          <View style={[styles.macroDot, { backgroundColor: color }]} />
          <Text style={styles.sliderTitle}>{title}</Text>
        </View>
        <View style={styles.sliderValues}>
          <Text style={styles.sliderValue}>{value}%</Text>
          <Text style={styles.sliderSubValue}>
            {kcal} kcal • {grams}g
          </Text>
        </View>
      </View>
      <Slider
        style={styles.slider}
        minimumValue={min}
        maximumValue={max}
        value={value}
        onValueChange={onValueChange}
        step={step}
        minimumTrackTintColor={color}
        maximumTrackTintColor={Colors.lightGray.color}
        thumbStyle={styles.sliderThumb}
        trackStyle={styles.sliderTrack}
      />
    </View>
  )
);

// Total calories display
const TotalCaloriesDisplay = React.memo(({ totalKcal, remainingKcal }) => (
  <View style={styles.totalCaloriesContainer}>
    <View style={styles.totalCaloriesHeader}>
      <MaterialIcons
        name="local-fire-department"
        size={24}
        color={Colors.darkGreen.color}
      />
      <Text style={styles.totalCaloriesTitle}>Daily Calorie Goal</Text>
    </View>
    <Text style={styles.totalCaloriesValue}>{totalKcal} kcal</Text>
    <View style={styles.remainingCaloriesContainer}>
      {remainingKcal !== 0 ? (
        <Text
          style={[
            styles.remainingCalories,
            {
              color: remainingKcal > 0 ? Colors.green.color : Colors.red.color,
            },
          ]}
        >
          {remainingKcal > 0
            ? `+${remainingKcal} kcal remaining`
            : `${Math.abs(remainingKcal)} kcal over daily calorie goal`}
        </Text>
      ) : (
        <Text style={[styles.remainingCalories, { color: "transparent" }]}>
          Placeholder
        </Text>
      )}
    </View>
  </View>
));

const MacroView = () => {
  const router = useRouter();
  const { hideHeader } = useLocalSearchParams();
  const [totalKcal, setTotalKcal] = useState(2000);
  const [macroValues, setMacroValues] = useState({
    protein: 0,
    netCarbs: 0,
    fat: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Load macro settings on mount/focus
  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      setLoading(true);
      setError(null);
      setSuccess(false);
      userService
        .getMacroSettings()
        .then((data) => {
          if (!isActive) return;
          setTotalKcal(data.totalKcal || 2000);
          setMacroValues({
            protein: data.proteinRatio || 0,
            netCarbs: data.carbsRatio || 0,
            fat: data.fatRatio || 0,
          });
        })
        .catch((err) => {
          if (!isActive) return;
          setError(err.message || "Failed to load macro settings");
        })
        .finally(() => {
          if (isActive) setLoading(false);
        });
      return () => {
        isActive = false;
      };
    }, [])
  );

  const handleMacroChange = useCallback((field, value) => {
    const newValue = Math.round(value);
    setMacroValues((prev) => ({
      ...prev,
      [field]: newValue,
    }));
    setSuccess(false);
    setError(null);
  }, []);

  const handleSave = async () => {
    if (totalPercentage !== 100) {
      Alert.alert(
        "Invalid Distribution",
        "Macro percentages must add up to 100%. Please adjust your values.",
        [{ text: "OK" }]
      );
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const payload = {
        macroMode: 0,
        totalKcal,
        proteinRatio: macroValues.protein,
        carbsRatio: macroValues.netCarbs,
        fatRatio: macroValues.fat,
      };
      await userService.updateMacroSettings(payload);
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Failed to save macro settings");
    } finally {
      setLoading(false);
    }
  };

  const macroKcals = useMemo(() => {
    return {
      protein: Math.round((macroValues.protein / 100) * totalKcal),
      netCarbs: Math.round((macroValues.netCarbs / 100) * totalKcal),
      fat: Math.round((macroValues.fat / 100) * totalKcal),
    };
  }, [macroValues, totalKcal]);

  const macroGrams = useMemo(() => {
    return {
      protein: Math.round(macroKcals.protein / 4), // 4 calories per gram
      netCarbs: Math.round(macroKcals.netCarbs / 4), // 4 calories per gram
      fat: Math.round(macroKcals.fat / 9), // 9 calories per gram
    };
  }, [macroKcals]);

  const totalPercentage = useMemo(() => {
    return Object.values(macroValues).reduce((sum, val) => sum + val, 0);
  }, [macroValues]);

  const remainingKcal = useMemo(() => {
    const usedKcal = Object.values(macroKcals).reduce(
      (sum, val) => sum + val,
      0
    );
    return totalKcal - usedKcal;
  }, [macroKcals, totalKcal]);

  const isDistributionValid = totalPercentage === 100;
  const isAllZero = totalPercentage === 0;

  if (loading) {
    return (
      <SafeAreaView style={styles.safeAreaViewContainer}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading macro settings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: hideHeader !== "true",
          title: "Macro Targets",
        }}
      />
      <SafeAreaView style={styles.safeAreaViewContainer}>
        {hideHeader === "true" && (
          <View style={styles.header}>
            <Text className="text-4xl font-pextrabold text-center text-green pt-10">
              Fitlicious
            </Text>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <MaterialIcons
                name="arrow-back"
                size={36}
                color={Colors.darkGreen.color}
              />
            </TouchableOpacity>
          </View>
        )}

        <ScrollView contentContainerStyle={styles.scrollViewContainer}>
          <TotalCaloriesDisplay
            totalKcal={totalKcal}
            remainingKcal={remainingKcal}
          />

          <MacroChart
            protein={macroValues.protein}
            carbs={macroValues.netCarbs}
            fat={macroValues.fat}
            totalKcal={totalKcal}
          />

          <View style={styles.slidersContainer}>
            <MacroSlider
              title="Protein"
              color={Colors.green.color}
              value={macroValues.protein}
              onValueChange={(value) => handleMacroChange("protein", value)}
              min={0}
              max={100}
              step={1}
              unit="%"
              kcal={macroKcals.protein}
              grams={macroGrams.protein}
            />

            <MacroSlider
              title="Net Carbs"
              color={Colors.blue.color}
              value={macroValues.netCarbs}
              onValueChange={(value) => handleMacroChange("netCarbs", value)}
              min={0}
              max={100}
              step={1}
              unit="%"
              kcal={macroKcals.netCarbs}
              grams={macroGrams.netCarbs}
            />

            <MacroSlider
              title="Fat"
              color={Colors.red.color}
              value={macroValues.fat}
              onValueChange={(value) => handleMacroChange("fat", value)}
              min={0}
              max={100}
              step={1}
              unit="%"
              kcal={macroKcals.fat}
              grams={macroGrams.fat}
            />
          </View>

          <TouchableOpacity
            style={[styles.saveButton, isAllZero && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading || isAllZero}
          >
            <Text style={styles.saveButtonText}>
              {loading ? "Saving..." : "Save Macro Settings"}
            </Text>
          </TouchableOpacity>

          <View style={styles.alertsContainer}>
            {!isDistributionValid && (
              <View style={styles.validationContainer}>
                <MaterialIcons
                  name="warning"
                  size={20}
                  color={Colors.red.color}
                />
                <Text style={styles.validationText}>
                  Total: {totalPercentage}% (should be 100%)
                </Text>
              </View>
            )}

            {error && (
              <View style={styles.errorContainer}>
                <MaterialIcons
                  name="error"
                  size={20}
                  color={Colors.red.color}
                />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {success && (
              <View style={styles.successContainer}>
                <MaterialIcons
                  name="check-circle"
                  size={20}
                  color={Colors.green.color}
                />
                <Text style={styles.successText}>
                  Macro settings saved successfully!
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

export default MacroView;

const styles = StyleSheet.create({
  backButton: {
    paddingLeft: 20,
    paddingBottom: 30,
  },
  safeAreaViewContainer: {
    height: "100%",
    width: "100%",
    backgroundColor: Colors.white.color,
  },
  scrollViewContainer: {
    flexGrow: 1,
    padding: 6, // Reduced from 12 to reduce top margin
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: Colors.darkGreen.color,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffebee",
    padding: 8, // Reduced from 12
    borderRadius: 8,
    marginBottom: 8, // Reduced from 16
  },
  errorText: {
    color: Colors.red.color,
    marginLeft: 8,
    flex: 1,
  },
  successContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e8f5e8",
    padding: 8, // Reduced from 12
    borderRadius: 8,
    marginBottom: 8, // Reduced from 16
  },
  successText: {
    color: Colors.green.color,
    marginLeft: 8,
    flex: 1,
  },
  totalCaloriesContainer: {
    backgroundColor: Colors.lightGreen.color,
    padding: 4, // Reduced from 6
    borderRadius: 12,
    marginBottom: 10, // Reduced from 20
    alignItems: "center",
  },
  totalCaloriesHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 1, // Reduced from 2
  },
  totalCaloriesTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.darkGreen.color,
    marginLeft: 8,
  },
  totalCaloriesValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.darkGreen.color,
  },
  remainingCalories: {
    fontSize: 12,
    marginTop: 1,
    fontWeight: "500",
  },
  remainingCaloriesContainer: {
    minHeight: 20, // Fixed height to prevent twitching
  },
  chartContainer: {
    backgroundColor: Colors.white.color,
    padding: 10, // Reduced from 20
    borderRadius: 12,
    marginBottom: 10, // Reduced from 20
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 16, // Reduced from 18
    fontWeight: "600",
    marginBottom: 8, // Reduced from 16
    textAlign: "center",
    color: Colors.darkGreen.color,
  },
  chartBar: {
    height: 16, // Reduced from 24
    backgroundColor: Colors.lightGray.color,
    borderRadius: 12,
    flexDirection: "row",
    overflow: "hidden",
    marginBottom: 8, // Reduced from 16
  },
  chartSegment: {
    height: "100%",
  },
  chartLegend: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendDot: {
    width: 10, // Reduced from 12
    height: 10, // Reduced from 12
    borderRadius: 5, // Reduced from 6
    marginRight: 4, // Reduced from 6
  },
  legendText: {
    fontSize: 12, // Reduced from 14
    color: Colors.darkGreen.color,
  },
  slidersContainer: {
    backgroundColor: Colors.white.color,
    padding: 4, // Reduced from 6
    borderRadius: 12,
    marginBottom: 10, // Reduced from 20
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sliderContainer: {
    marginBottom: 4, // Reduced from 7
  },
  sliderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2, // Reduced from 4
  },
  sliderTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  macroDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  sliderTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.darkGreen.color,
  },
  sliderValues: {
    alignItems: "flex-end",
  },
  sliderValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.darkGreen.color,
  },
  sliderSubValue: {
    fontSize: 12,
    color: Colors.gray.color,
    marginTop: 2,
  },
  slider: {
    width: "100%",
    height: 20,
  },
  sliderThumb: {
    backgroundColor: Colors.white.color,
    borderWidth: 2,
    borderColor: Colors.darkGreen.color,
  },
  sliderTrack: {
    height: 6,
    borderRadius: 3,
  },
  validationContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffebee", // Changed from "#fff3cd" to red background
    padding: 6, // Reduced from 12
    borderRadius: 8,
    marginBottom: 8, // Reduced from 16
  },
  validationText: {
    color: Colors.red.color, // Changed from Colors.yellow.color to red
    marginLeft: 8,
    flex: 1,
    fontWeight: "500",
  },
  saveButton: {
    backgroundColor: Colors.green.color,
    padding: 12, // Reduced from 16
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonDisabled: {
    backgroundColor: Colors.lightGray.color,
  },
  saveButtonText: {
    color: Colors.white.color,
    fontSize: 16,
    fontWeight: "bold",
  },
  alertsContainer: {
    minHeight: 60, // Increased from 40 to provide more space for alerts
    marginTop: 10, // Added margin to create space between save button and alerts
    marginBottom: 10, // Added margin for spacing
  },
});
