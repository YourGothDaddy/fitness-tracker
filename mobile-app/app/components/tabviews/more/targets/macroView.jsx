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

const OptionButton = React.memo(({ title, isSelected, onPress }) => (
  <TouchableOpacity
    style={[styles.optionButton, isSelected && styles.selectedOption]}
    onPress={onPress}
  >
    <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>
      {title}
    </Text>
  </TouchableOpacity>
));

const MacroField = React.memo(
  ({ title, color, percentage, kcal, value, onChangeText, isFixed }) => (
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
  const [selectedOption, setSelectedOption] = useState("Ratios");
  const [totalKcal, setTotalKcal] = useState(2000);
  const [macroValues, setMacroValues] = useState({
    protein: 30,
    netCarbs: 40,
    fat: 30,
  });

  const handleOptionPress = useCallback((option) => {
    setSelectedOption(option);
  }, []);

  const handleMacroChange = useCallback((field, value) => {
    const numValue = parseInt(value, 10) || 0;
    setMacroValues((prev) => ({
      ...prev,
      [field]: numValue,
    }));
  }, []);

  const macroKcals = useMemo(() => {
    if (selectedOption === "Ratios") {
      return {
        protein: Math.round((macroValues.protein / 100) * totalKcal),
        netCarbs: Math.round((macroValues.netCarbs / 100) * totalKcal),
        fat: Math.round((macroValues.fat / 100) * totalKcal),
      };
    } else {
      return macroValues;
    }
  }, [selectedOption, macroValues, totalKcal]);

  const macroPercentages = useMemo(() => {
    const totalMacroKcal = Object.values(macroKcals).reduce(
      (sum, val) => sum + val,
      0
    );
    return {
      protein: Math.round((macroKcals.protein / totalMacroKcal) * 100),
      netCarbs: Math.round((macroKcals.netCarbs / totalMacroKcal) * 100),
      fat: Math.round((macroKcals.fat / totalMacroKcal) * 100),
    };
  }, [macroKcals]);

  const totalPercentage = useMemo(() => {
    return Object.values(macroPercentages).reduce((sum, val) => sum + val, 0);
  }, [macroPercentages]);

  const totalKcalSum = useMemo(() => {
    return Object.values(macroKcals).reduce((sum, val) => sum + val, 0);
  }, [macroKcals]);

  const isExceedingTotalKcal = totalKcalSum > totalKcal;

  const explanationText =
    selectedOption === "Ratios"
      ? "Ratios: Set percentages for each macro. The app calculates kcal based on your total calorie goal."
      : "Fixed: Enter specific kcal for each macro. Percentages are calculated based on your input.";

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
          <View style={styles.optionsContainer}>
            <OptionButton
              title="Ratios"
              isSelected={selectedOption === "Ratios"}
              onPress={() => handleOptionPress("Ratios")}
            />
            <OptionButton
              title="Fixed"
              isSelected={selectedOption === "Fixed"}
              onPress={() => handleOptionPress("Fixed")}
            />
          </View>
          <Text style={styles.explanationText}>{explanationText}</Text>
          <View style={styles.macroFieldsContainer}>
            <MacroField
              title="Protein"
              color={Colors.green.color}
              percentage={macroPercentages.protein}
              kcal={macroKcals.protein}
              value={
                selectedOption === "Ratios"
                  ? macroValues.protein
                  : macroKcals.protein
              }
              onChangeText={(text) => handleMacroChange("protein", text)}
              isFixed={selectedOption === "Fixed"}
            />
            <MacroField
              title="Net Carbs"
              color={Colors.blue.color}
              percentage={macroPercentages.netCarbs}
              kcal={macroKcals.netCarbs}
              value={
                selectedOption === "Ratios"
                  ? macroValues.netCarbs
                  : macroKcals.netCarbs
              }
              onChangeText={(text) => handleMacroChange("netCarbs", text)}
              isFixed={selectedOption === "Fixed"}
            />
            <MacroField
              title="Fat"
              color={Colors.red.color}
              percentage={macroPercentages.fat}
              kcal={macroKcals.fat}
              value={
                selectedOption === "Ratios" ? macroValues.fat : macroKcals.fat
              }
              onChangeText={(text) => handleMacroChange("fat", text)}
              isFixed={selectedOption === "Fixed"}
            />
            <TotalKcalField kcal={totalKcal} />
            {selectedOption === "Ratios" && totalPercentage > 100 && (
              <Text style={styles.errorText}>
                Values can't be calculated. Total percentage exceeds 100%.
              </Text>
            )}
            {selectedOption === "Fixed" && isExceedingTotalKcal && (
              <Text style={styles.warningText}>
                Warning: The sum of macronutrient calories exceeds the total
                kcal goal.
              </Text>
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
    alignItems: "center",
    padding: 15,
  },
  optionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 15,
  },
  optionButton: {
    flex: 1,
    padding: 10,
    alignItems: "center",
    backgroundColor: Colors.lightGreen.color,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  selectedOption: {
    backgroundColor: Colors.green.color,
  },
  optionText: {
    color: Colors.black.color,
    fontWeight: "bold",
  },
  selectedOptionText: {
    color: Colors.white.color,
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
  warningText: {
    color: Colors.yellow.color,
    fontSize: 12,
    marginTop: 5,
    textAlign: "center",
  },
});
