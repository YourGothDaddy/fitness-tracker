import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { Colors } from "../../../../../constants/Colors";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import Animated, {
  withSpring,
  useAnimatedStyle,
  FadeIn,
  FadeOut,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

const EnergySettingsView = () => {
  const router = useRouter();
  const { hideHeader } = useLocalSearchParams();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [selectedValues, setSelectedValues] = useState({
    bmr: "Default",
    baseline: "Sedentary (BMR * 0.2)",
  });
  const [isTefEnabled, setIsTefEnabled] = useState(false);
  const [customBMR, setCustomBMR] = useState("");

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
          headerShown: false,
        }}
      />
      <SafeAreaView style={styles.container}>
        {/* Consistent Header */}
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

        {/* Main Content */}
        <ScrollView
          style={styles.settingsContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Energy Display Card */}
          <View style={styles.energyCard}>
            <Text style={styles.energyValue}>1,500</Text>
            <Text style={styles.energyUnit}>kcal / day</Text>
          </View>

          <View style={styles.settingsContainer}>
            {/* BMR Section */}
            <View style={styles.settingSection}>
              <Text style={styles.sectionTitle}>Basal Metabolic Rate</Text>
              <TouchableOpacity
                style={styles.selector}
                onPress={() => toggleDropdown("bmr")}
              >
                <Text style={styles.selectorText}>{selectedValues.bmr}</Text>
                <MaterialIcons
                  name={
                    activeDropdown === "bmr" ? "expand-less" : "expand-more"
                  }
                  size={24}
                  color={Colors.darkGreen.color}
                />
              </TouchableOpacity>

              {activeDropdown === "bmr" && (
                <Animated.View
                  entering={FadeIn.duration(200)}
                  exiting={FadeOut.duration(200)}
                  style={styles.dropdown}
                >
                  {["Default", "Custom"].map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.dropdownItem,
                        selectedValues.bmr === option &&
                          styles.dropdownItemSelected,
                      ]}
                      onPress={() => handleOptionSelect("bmr", option)}
                    >
                      <Text
                        style={[
                          styles.dropdownText,
                          selectedValues.bmr === option &&
                            styles.dropdownTextSelected,
                        ]}
                      >
                        {option}
                      </Text>
                      {selectedValues.bmr === option && (
                        <MaterialIcons
                          name="check"
                          size={20}
                          color={Colors.darkGreen.color}
                        />
                      )}
                    </TouchableOpacity>
                  ))}
                </Animated.View>
              )}

              {/* Custom BMR Input Field */}
              {selectedValues.bmr === "Custom" && (
                <Animated.View
                  entering={FadeIn.duration(200)}
                  style={styles.customInputContainer}
                >
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.customInput}
                      value={customBMR}
                      onChangeText={setCustomBMR}
                      placeholder="Enter BMR value"
                      keyboardType="numeric"
                      placeholderTextColor="#94a3b8"
                    />
                    <Text style={styles.inputUnit}>kcal</Text>
                  </View>
                  <Text style={styles.inputHelper}>
                    Enter your calculated Basal Metabolic Rate
                  </Text>
                </Animated.View>
              )}
            </View>

            {/* Activity Level Section */}
            <View style={styles.settingSection}>
              <Text style={styles.sectionTitle}>Activity Level</Text>
              <TouchableOpacity
                style={styles.selector}
                onPress={() => toggleDropdown("baseline")}
              >
                <Text style={styles.selectorText}>
                  {selectedValues.baseline}
                </Text>
                <MaterialIcons
                  name={
                    activeDropdown === "baseline"
                      ? "expand-less"
                      : "expand-more"
                  }
                  size={24}
                  color="#10b981"
                />
              </TouchableOpacity>

              {activeDropdown === "baseline" && (
                <Animated.View
                  entering={FadeIn.duration(200)}
                  exiting={FadeOut.duration(200)}
                  style={styles.dropdown}
                >
                  {[
                    "None",
                    "Sedentary (BMR * 0.2)",
                    "Lightly Active (BMR * 0.375)",
                    "Moderately Active (BMR*0.5)",
                    "Very Active (BMR * 0.9)",
                    "Custom",
                  ].map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.dropdownItem,
                        selectedValues.baseline === option &&
                          styles.dropdownItemSelected,
                      ]}
                      onPress={() => handleOptionSelect("baseline", option)}
                    >
                      <Text
                        style={[
                          styles.dropdownText,
                          selectedValues.baseline === option &&
                            styles.dropdownTextSelected,
                        ]}
                      >
                        {option}
                      </Text>
                      {selectedValues.baseline === option && (
                        <MaterialIcons name="check" size={20} color="#10b981" />
                      )}
                    </TouchableOpacity>
                  ))}
                </Animated.View>
              )}
            </View>

            {/* TEF Toggle Section */}
            <View style={styles.settingSection}>
              <View style={styles.toggleHeader}>
                <Text style={styles.sectionTitle}>Thermic Effect of Food</Text>
                <TouchableOpacity
                  style={styles.toggle}
                  onPress={() => setIsTefEnabled(!isTefEnabled)}
                >
                  <Animated.View
                    style={[
                      styles.toggleTrack,
                      isTefEnabled && styles.toggleTrackActive,
                    ]}
                  >
                    <Animated.View
                      style={[
                        styles.toggleThumb,
                        isTefEnabled && styles.toggleThumbActive,
                      ]}
                    />
                  </Animated.View>
                </TouchableOpacity>
              </View>
              <Text style={styles.description}>
                Account for calories burned during digestion (typically 10% of
                total intake)
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white.color,
  },
  header: {
    position: "relative",
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGreen.color,
  },
  backButton: {
    paddingLeft: 20,
  },
  settingsContent: {
    flex: 1,
  },
  energyCard: {
    margin: 20,
    padding: 20,
    backgroundColor: Colors.lightGreen.color,
    borderRadius: 15,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  energyValue: {
    fontSize: 36,
    fontWeight: "bold",
    color: Colors.darkGreen.color,
    marginBottom: 5,
  },
  energyUnit: {
    fontSize: 16,
    color: "#666",
  },
  settingsContainer: {
    padding: 20,
  },
  settingSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  selector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: Colors.white.color,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.lightGreen.color,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  selectorText: {
    fontSize: 16,
    color: Colors.darkGreen.color,
  },
  dropdown: {
    marginTop: 8,
    backgroundColor: Colors.white.color,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.lightGreen.color,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGreen.color,
  },
  dropdownItemSelected: {
    backgroundColor: Colors.lightGreen.color + "20",
  },
  dropdownText: {
    fontSize: 16,
    color: Colors.darkGreen.color,
  },
  dropdownTextSelected: {
    color: Colors.darkGreen.color,
    fontWeight: "500",
  },
  toggleHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toggle: {
    padding: 4,
  },
  toggleTrack: {
    width: 52,
    height: 32,
    backgroundColor: "#e2e8f0",
    borderRadius: 16,
    padding: 2,
  },
  toggleTrackActive: {
    backgroundColor: Colors.darkGreen.color,
  },
  toggleThumb: {
    width: 28,
    height: 28,
    backgroundColor: Colors.white.color,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleThumbActive: {
    transform: [{ translateX: 20 }],
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
    lineHeight: 20,
  },
  customInputContainer: {
    marginTop: 12,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  customInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: Colors.lightGreen.color,
    borderRadius: 8,
    padding: 8,
    marginRight: 8,
  },
  inputUnit: {
    fontSize: 16,
    color: Colors.darkGreen.color,
  },
  inputHelper: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
    lineHeight: 20,
  },
});

export default EnergySettingsView;
