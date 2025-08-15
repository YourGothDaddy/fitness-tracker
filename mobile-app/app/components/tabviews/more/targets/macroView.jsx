import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { Colors } from "../../../../../constants/Colors";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import userService from "@/app/services/userService";
import { useFocusEffect } from "@react-navigation/native";

const MacroField = React.memo(
  ({ title, color, percentage, kcal, value, onChangeText }) => (
    <View style={styles.macroFieldContainer}>
      <View style={[styles.colorCircle, { backgroundColor: color }]} />
      <Text style={styles.macroFieldTitle}>{title}</Text>
      <Text style={styles.macroFieldPercentage}>{percentage}%</Text>
      <Text style={styles.macroFieldKcal}>{kcal} kcal</Text>
      <TextInput
        style={styles.macroFieldInput}
        value={value.toString()}
        onChangeText={onChangeText}
        keyboardType="numeric"
      />
    </View>
  )
);

const TotalKcalField = React.memo(({ kcal }) => (
  <View style={styles.totalKcalContainer}>
    <Text style={styles.totalKcalTitle}>Total kcal</Text>
    <Text style={styles.totalKcalValue}>{kcal} kcal</Text>
  </View>
));

const MacroView = () => {
  const router = useRouter();
  const { hideHeader } = useLocalSearchParams();
  const [totalKcal, setTotalKcal] = useState(2000);
  const [macroValues, setMacroValues] = useState({
    protein: 30,
    netCarbs: 40,
    fat: 30,
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
          // Only use ratios mode
          setTotalKcal(data.totalKcal || 2000);
          setMacroValues({
            protein: data.proteinRatio || 30,
            netCarbs: data.carbsRatio || 40,
            fat: data.fatRatio || 30,
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
    const numValue = parseInt(value, 10) || 0;
    setMacroValues((prev) => ({
      ...prev,
      [field]: numValue,
    }));
    setSuccess(false);
    setError(null);
  }, []);

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const payload = {
        macroMode: 0, // Always use Ratios mode
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

  const macroPercentages = useMemo(() => {
    const totalMacroKcal = Object.values(macroKcals).reduce(
      (sum, val) => sum + val,
      0
    );
    return {
      protein:
        totalMacroKcal > 0
          ? Math.round((macroKcals.protein / totalMacroKcal) * 100)
          : 0,
      netCarbs:
        totalMacroKcal > 0
          ? Math.round((macroKcals.netCarbs / totalMacroKcal) * 100)
          : 0,
      fat:
        totalMacroKcal > 0
          ? Math.round((macroKcals.fat / totalMacroKcal) * 100)
          : 0,
    };
  }, [macroKcals]);

  const totalPercentage = useMemo(() => {
    return Object.values(macroPercentages).reduce((sum, val) => sum + val, 0);
  }, [macroPercentages]);

  const explanationText =
    "Set percentages for each macro. The app calculates kcal based on your total calorie goal.";

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: hideHeader !== "true",
          title: "Macro",
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
          {loading && (
            <Text style={{ textAlign: "center", margin: 10 }}>Loading...</Text>
          )}
          {error && <Text style={styles.errorText}>{error}</Text>}
          {success && (
            <Text
              style={{
                color: Colors.green.color,
                textAlign: "center",
                margin: 10,
              }}
            >
              Saved!
            </Text>
          )}
          <Text style={styles.explanationText}>{explanationText}</Text>
          <View style={styles.macroFieldsContainer}>
            <MacroField
              title="Protein"
              color={Colors.green.color}
              percentage={macroPercentages.protein}
              kcal={macroKcals.protein}
              value={macroValues.protein}
              onChangeText={(text) => handleMacroChange("protein", text)}
            />
            <MacroField
              title="Net Carbs"
              color={Colors.blue.color}
              percentage={macroPercentages.netCarbs}
              kcal={macroKcals.netCarbs}
              value={macroValues.netCarbs}
              onChangeText={(text) => handleMacroChange("netCarbs", text)}
            />
            <MacroField
              title="Fat"
              color={Colors.red.color}
              percentage={macroPercentages.fat}
              kcal={macroKcals.fat}
              value={macroValues.fat}
              onChangeText={(text) => handleMacroChange("fat", text)}
            />
            <TotalKcalField kcal={totalKcal} />
            {totalPercentage > 100 && (
              <Text style={styles.errorText}>
                Values can't be calculated. Total percentage exceeds 100%.
              </Text>
            )}
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              disabled={loading}
            >
              <Text style={styles.saveButtonText}>
                {loading ? "Saving..." : "Save"}
              </Text>
            </TouchableOpacity>
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
    alignItems: "center",
    padding: 15,
  },
  explanationText: {
    marginBottom: 15,
    textAlign: "center",
  },
  macroFieldsContainer: {
    width: "100%",
  },
  macroFieldContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: Colors.lightGreen.color,
    padding: 10,
    borderRadius: 5,
  },
  colorCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 10,
  },
  macroFieldTitle: {
    flex: 1,
    fontWeight: "bold",
  },
  macroFieldPercentage: {
    marginRight: 10,
  },
  macroFieldKcal: {
    marginRight: 10,
  },
  macroFieldInput: {
    backgroundColor: Colors.white.color,
    padding: 5,
    width: 50,
    textAlign: "center",
    borderRadius: 5,
  },
  totalKcalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: Colors.lightGreen.color,
    padding: 10,
    borderRadius: 5,
  },
  totalKcalTitle: {
    fontWeight: "bold",
    fontSize: 16,
  },
  totalKcalValue: {
    fontSize: 16,
    color: Colors.darkGreen.color,
  },
  errorText: {
    color: Colors.red.color,
    fontSize: 12,
    marginTop: 5,
    textAlign: "center",
  },
  saveButton: {
    backgroundColor: Colors.green.color,
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: "center",
  },
  saveButtonText: {
    color: Colors.white.color,
    fontWeight: "bold",
  },
});
