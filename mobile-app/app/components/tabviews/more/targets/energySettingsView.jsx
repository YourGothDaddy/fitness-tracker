import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  TextInput,
  ActivityIndicator,
  Alert,
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
import activityService from "@/app/services/activityService";
import nutritionService from "@/app/services/nutritionService";
import userService from "@/app/services/userService";

const EnergySettingsView = () => {
  const router = useRouter();
  const { hideHeader } = useLocalSearchParams();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [activityLevels, setActivityLevels] = useState([]);
  const [selectedBmrType, setSelectedBmrType] = useState("Default");
  const [customBMR, setCustomBMR] = useState("");
  const [selectedActivityLevel, setSelectedActivityLevel] = useState(null);
  const [isTefEnabled, setIsTefEnabled] = useState(false);
  const [energySettings, setEnergySettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch activity levels and user info on mount
  useEffect(() => {
    let isMounted = true;
    const fetchInitialData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [levels, profile] = await Promise.all([
          activityService.getActivityLevels(),
          userService.getProfile(),
        ]);
        if (!isMounted) return;
        setActivityLevels(levels);
        // Find user's current activity level
        const userLevel =
          levels.find((lvl) => lvl.id === profile.activityLevelId) || levels[0];
        setSelectedActivityLevel(userLevel);
        // Fetch initial energy settings
        const settings = await nutritionService.getEnergySettings({
          customBmr: undefined,
          activityLevelId: userLevel.id,
          includeTef: false,
        });
        if (!isMounted) return;
        // Ensure we have a valid settings object with the expected properties
        if (settings && typeof settings === "object") {
          setEnergySettings({
            BMR: settings.bmr || 0,
            MaintenanceCalories: settings.maintenanceCalories || 0,
            ActivityLevelId: settings.activityLevelId,
            ActivityLevelName: settings.activityLevelName,
            ActivityMultiplier: settings.activityMultiplier,
            TEFIncluded: settings.tefIncluded,
          });
        } else {
          setError("Invalid response from server");
        }
      } catch (err) {
        setError("Failed to load energy settings. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Refetch energy settings when dependencies change
  useEffect(() => {
    if (!selectedActivityLevel) return;
    let customBmrValue =
      selectedBmrType === "Custom" ? parseFloat(customBMR) : undefined;
    if (
      selectedBmrType === "Custom" &&
      (!customBmrValue || isNaN(customBmrValue))
    ) {
      setEnergySettings((prev) =>
        prev ? { ...prev, BMR: 0, MaintenanceCalories: 0 } : null
      );
      return;
    }
    setLoading(true);
    setError(null);
    nutritionService
      .getEnergySettings({
        customBmr: customBmrValue,
        activityLevelId: selectedActivityLevel.id,
        includeTef: isTefEnabled,
      })
      .then((settings) => {
        // Ensure we have a valid settings object with the expected properties
        if (settings && typeof settings === "object") {
          setEnergySettings({
            BMR: settings.bmr || 0,
            MaintenanceCalories: settings.maintenanceCalories || 0,
            ActivityLevelId: settings.activityLevelId,
            ActivityLevelName: settings.activityLevelName,
            ActivityMultiplier: settings.activityMultiplier,
            TEFIncluded: settings.tefIncluded,
          });
        } else {
          setError("Invalid response from server");
        }
      })
      .catch((error) => {
        setError("Failed to update energy settings.");
      })
      .finally(() => setLoading(false));
  }, [selectedBmrType, customBMR, selectedActivityLevel, isTefEnabled]);

  const handleBmrTypeSelect = (option) => {
    setSelectedBmrType(option);
    setActiveDropdown(null);
    if (option === "Default") setCustomBMR("");
  };

  const handleActivityLevelSelect = (level) => {
    setSelectedActivityLevel(level);
    setActiveDropdown(null);
  };

  // Helper function to safely format numbers
  const formatNumber = (value) => {
    if (value === null || value === undefined || isNaN(value)) {
      return "-";
    }
    const num = typeof value === "string" ? parseFloat(value) : value;
    return isNaN(num) ? "-" : Math.round(num);
  };

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
            {loading ? (
              <ActivityIndicator size="large" color={Colors.darkGreen.color} />
            ) : error ? (
              <Text style={{ color: "red" }}>{error}</Text>
            ) : (
              <>
                <Text style={styles.energyValue}>
                  {energySettings
                    ? formatNumber(energySettings.MaintenanceCalories)
                    : "-"}
                </Text>
                <Text style={styles.energyUnit}>kcal / day</Text>
                <Text
                  style={{
                    color: Colors.darkGreen.color,
                    fontSize: 14,
                    marginTop: 4,
                  }}
                >
                  BMR: {energySettings ? formatNumber(energySettings.BMR) : "-"}{" "}
                  kcal
                </Text>
              </>
            )}
          </View>

          <View style={styles.settingsContainer}>
            {/* BMR Section */}
            <View style={styles.settingSection}>
              <Text style={styles.sectionTitle}>Basal Metabolic Rate</Text>
              <TouchableOpacity
                style={styles.selector}
                onPress={() =>
                  setActiveDropdown(activeDropdown === "bmr" ? null : "bmr")
                }
              >
                <Text style={styles.selectorText}>{selectedBmrType}</Text>
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
                        selectedBmrType === option &&
                          styles.dropdownItemSelected,
                      ]}
                      onPress={() => handleBmrTypeSelect(option)}
                    >
                      <Text
                        style={[
                          styles.dropdownText,
                          selectedBmrType === option &&
                            styles.dropdownTextSelected,
                        ]}
                      >
                        {option}
                      </Text>
                      {selectedBmrType === option && (
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
              {selectedBmrType === "Custom" && (
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
                onPress={() =>
                  setActiveDropdown(
                    activeDropdown === "activity" ? null : "activity"
                  )
                }
              >
                <Text style={styles.selectorText}>
                  {selectedActivityLevel
                    ? selectedActivityLevel.name
                    : "Select Activity Level"}
                </Text>
                <MaterialIcons
                  name={
                    activeDropdown === "activity"
                      ? "expand-less"
                      : "expand-more"
                  }
                  size={24}
                  color="#10b981"
                />
              </TouchableOpacity>

              {activeDropdown === "activity" && (
                <Animated.View
                  entering={FadeIn.duration(200)}
                  exiting={FadeOut.duration(200)}
                  style={styles.dropdown}
                >
                  {activityLevels.map((level) => (
                    <TouchableOpacity
                      key={level.id}
                      style={[
                        styles.dropdownItem,
                        selectedActivityLevel &&
                          selectedActivityLevel.id === level.id &&
                          styles.dropdownItemSelected,
                      ]}
                      onPress={() => handleActivityLevelSelect(level)}
                    >
                      <Text
                        style={[
                          styles.dropdownText,
                          selectedActivityLevel &&
                            selectedActivityLevel.id === level.id &&
                            styles.dropdownTextSelected,
                        ]}
                      >
                        {level.name}
                      </Text>
                      {selectedActivityLevel &&
                        selectedActivityLevel.id === level.id && (
                          <MaterialIcons
                            name="check"
                            size={20}
                            color="#10b981"
                          />
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
                  onPress={() => setIsTefEnabled((prev) => !prev)}
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
