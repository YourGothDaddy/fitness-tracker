import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { Colors } from "../../../../../constants/Colors";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";

const EnergySection = React.memo(
  ({
    title,
    description,
    options,
    value,
    onOptionSelect,
    showDropdown,
    toggleDropdown,
    isCheckbox,
    isChecked,
    onCheckboxToggle,
  }) => (
    <View
      style={[
        styles.sectionContainer,
        showDropdown && styles.sectionContainerActive,
      ]}
    >
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {!isCheckbox ? (
          <Pressable
            style={[
              styles.dropdownButton,
              showDropdown && styles.dropdownButtonActive,
              title === "Baseline Activity Level" && styles.widerDropdownButton,
            ]}
            onPress={toggleDropdown}
          >
            <Text style={styles.dropdownButtonText} numberOfLines={1}>
              {value}
            </Text>
            <MaterialIcons
              name={showDropdown ? "keyboard-arrow-up" : "keyboard-arrow-down"}
              size={20}
              color={Colors.darkGreen.color}
              style={{ width: "15%" }}
            />
          </Pressable>
        ) : (
          <Pressable style={styles.checkbox} onPress={onCheckboxToggle}>
            <MaterialIcons
              name={isChecked ? "check-box" : "check-box-outline-blank"}
              size={24}
              color={Colors.darkGreen.color}
            />
          </Pressable>
        )}
      </View>
      <Text style={styles.description}>{description}</Text>
      <View style={styles.valueContainer}>
        <Text style={styles.kcalValue}>1500 kcal</Text>
      </View>
      {showDropdown && options && (
        <View style={styles.dropdownMenu}>
          {options.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.dropdownItem,
                value === option && styles.dropdownItemSelected,
              ]}
              onPress={() => onOptionSelect(option)}
            >
              <Text
                style={[
                  styles.dropdownItemText,
                  value === option && styles.dropdownItemTextSelected,
                ]}
              >
                {option}
              </Text>
              {value === option && (
                <MaterialIcons
                  name="check"
                  size={18}
                  color={Colors.white.color}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  )
);

const EnergySettingsView = () => {
  const router = useRouter();
  const { hideHeader } = useLocalSearchParams();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [selectedValues, setSelectedValues] = useState({
    bmr: "Default",
    baseline: "Sedentary (BMR * 0.2)",
  });
  const [isTefEnabled, setIsTefEnabled] = useState(false);

  const handleOptionSelect = useCallback((section, option) => {
    setSelectedValues((prev) => ({
      ...prev,
      [section]: option,
    }));
    setActiveDropdown(null);
  }, []);

  const toggleDropdown = useCallback(
    (section) => {
      setActiveDropdown(activeDropdown === section ? null : section);
    },
    [activeDropdown]
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: hideHeader !== "true",
          title: "Energy Settings",
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
          <View style={styles.container}>
            <Text style={styles.containerTitle}>Energy Burned</Text>

            <EnergySection
              title="BMR"
              description="Sample text describing BMR calculation. This is a placeholder that spans multiple lines to demonstrate the layout pattern."
              options={["Default", "Custom"]}
              value={selectedValues.bmr}
              onOptionSelect={(option) => handleOptionSelect("bmr", option)}
              showDropdown={activeDropdown === "bmr"}
              toggleDropdown={() => toggleDropdown("bmr")}
            />

            <EnergySection
              title="Baseline Activity Level"
              description="Sample text describing baseline activity level and how it affects your daily energy expenditure."
              options={[
                "None",
                "Sedentary (BMR * 0.2)",
                "Lightly Active (BMR * 0.375)",
                "Moderately Active (BMR*0.5)",
                "Very Active (BMR * 0.9)",
                "Custom",
              ]}
              value={selectedValues.baseline}
              onOptionSelect={(option) =>
                handleOptionSelect("baseline", option)
              }
              showDropdown={activeDropdown === "baseline"}
              toggleDropdown={() => toggleDropdown("baseline")}
            />

            <EnergySection
              title="Thermic Effect of Food (TEF)"
              description="Sample text describing the thermic effect of food and its impact on total energy expenditure."
              isCheckbox={true}
              isChecked={isTefEnabled}
              onCheckboxToggle={() => setIsTefEnabled(!isTefEnabled)}
            />

            <View style={styles.separator} />

            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total Energy Burned</Text>
              <Text style={styles.totalValue}>4,500 kcal</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  safeAreaViewContainer: {
    height: "100%",
    width: "100%",
    backgroundColor: Colors.white.color,
  },
  scrollViewContainer: {
    flexGrow: 1,
    padding: 15,
  },
  container: {
    backgroundColor: Colors.lightGreen.color,
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  containerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: Colors.darkGreen.color,
  },
  sectionContainer: {
    backgroundColor: Colors.white.color,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    position: "relative",
    zIndex: 1,
    overflow: "hidden",
  },
  sectionContainerActive: {
    zIndex: 2,
    overflow: "visible",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
    width: "100%",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.darkGreen.color,
    width: "35%",
    flexWrap: "wrap",
  },
  description: {
    fontSize: 14,
    color: Colors.gray.color,
    marginBottom: 8,
  },
  valueContainer: {
    alignItems: "flex-end",
  },
  kcalValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.darkGreen.color,
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white.color,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.darkGreen.color,
    width: "45%",
  },
  widerDropdownButton: {
    width: "62%",
  },
  dropdownButtonActive: {
    backgroundColor: Colors.lightGreen.color,
  },
  dropdownButtonText: {
    color: Colors.darkGreen.color,
    fontSize: 13,
    marginRight: 5,
    width: "85%",
    overflow: "hidden",
  },
  dropdownMenu: {
    backgroundColor: Colors.white.color,
    borderRadius: 12,
    marginTop: 8,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    position: "absolute",
    top: 45,
    right: 12,
    left: 12,
    zIndex: 1000,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGreen.color,
  },
  dropdownItemSelected: {
    backgroundColor: Colors.darkGreen.color,
  },
  dropdownItemText: {
    color: Colors.darkGreen.color,
    fontSize: 14,
  },
  dropdownItemTextSelected: {
    color: Colors.white.color,
    fontWeight: "500",
  },
  checkbox: {
    padding: 5,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.darkGreen.color,
    marginVertical: 12,
    opacity: 0.3,
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.darkGreen.color,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.darkGreen.color,
  },
  header: {
    width: "100%",
  },
  backButton: {
    paddingLeft: 20,
    paddingBottom: 30,
  },
});

export default EnergySettingsView;
