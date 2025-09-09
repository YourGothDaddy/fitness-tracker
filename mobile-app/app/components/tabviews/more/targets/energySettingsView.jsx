import React, { useState, useCallback, useEffect, useRef } from "react";
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
import goalsService from "@/app/services/goalsService";
import { useFocusEffect } from "@react-navigation/native";

// Helper to filter and format profile payload for backend (memoized for performance)
const buildProfileUpdatePayload = (() => {
  const cache = new WeakMap();

  return function buildProfileUpdatePayload(profile, overrides = {}) {
    // Check cache for performance optimization
    const cacheKey = { profile, overrides };
    if (
      cache.has(profile) &&
      JSON.stringify(overrides) === JSON.stringify(cache.get(profile).overrides)
    ) {
      return cache.get(profile).result;
    }

    // Always use string for phoneNumber
    let phoneNumber = profile.phoneNumber;
    if (phoneNumber === null || phoneNumber === undefined) phoneNumber = "";
    else phoneNumber = String(phoneNumber);

    // Always "Female" or "Male" (capitalize first letter, rest lowercase)
    let sex = profile.sex;
    if (typeof sex === "string" && sex.length > 0) {
      sex = sex.charAt(0).toUpperCase() + sex.slice(1).toLowerCase();
      if (sex !== "Male" && sex !== "Female") sex = "Female"; // fallback
    } else {
      sex = "Female";
    }

    // Only include allowed fields
    const allowed = [
      "activityLevelId",
      "age",
      "email",
      "fullName",
      "height",
      "includeTef",
      "phoneNumber",
      "sex",
      "weight",
    ];
    const base = { ...profile, ...overrides, phoneNumber, sex };
    const filtered = {};
    for (const key of allowed) {
      filtered[key] =
        base[key] !== undefined && base[key] !== null
          ? base[key]
          : key === "phoneNumber"
          ? ""
          : key === "sex"
          ? "Female"
          : base[key];
    }

    // Cache the result for performance
    cache.set(profile, { overrides: { ...overrides }, result: filtered });
    return filtered;
  };
})();

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
  const [initialLoading, setInitialLoading] = useState(true);
  const [energyLoading, setEnergyLoading] = useState(false);
  const [error, setError] = useState(null);

  // Track if initial data has been loaded to prevent duplicate fetches
  const hasInitialDataLoaded = useRef(false);
  const fetchInProgress = useRef(false);
  const isUpdatingActivityLevel = useRef(false);

  // Fetch activity levels and user info on mount and on focus
  const fetchInitialData = useCallback(async () => {
    // Prevent duplicate fetches if already loading or already loaded
    if (fetchInProgress.current || hasInitialDataLoaded.current) {
      return;
    }

    fetchInProgress.current = true;
    setInitialLoading(true);
    setError(null);

    try {
      const [levels, profile] = await Promise.all([
        activityService.getActivityLevels(),
        userService.getProfileData(),
      ]);

      setActivityLevels(levels);

      // Find user's current activity level - Fixed typo: l.id -> lvl.id
      const userLevel =
        levels.find((lvl) => lvl.id === profile.activityLevelId) || levels[0];
      setSelectedActivityLevel(userLevel);
      setIsTefEnabled(!!profile.includeTef);

      // Fetch initial energy settings
      const settings = await nutritionService.getEnergySettings({
        customBmr: undefined,
        activityLevelId: userLevel.id,
        includeTef: !!profile.includeTef,
      });

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

      hasInitialDataLoaded.current = true;
    } catch (err) {
      console.error("Failed to fetch initial data:", err);
      setError("Failed to load energy settings. Please try again.");
    } finally {
      setInitialLoading(false);
      fetchInProgress.current = false;
    }
  }, []); // No dependencies to prevent unnecessary re-renders

  // Use only useFocusEffect to handle both initial mount and focus events
  useFocusEffect(
    useCallback(() => {
      fetchInitialData();
    }, [fetchInitialData])
  );

  // Debounced energy settings update to prevent excessive API calls
  useEffect(() => {
    // Don't make API calls if initial data hasn't loaded yet or if initial load is in progress
    // Also skip if we're currently updating activity level (handled separately)
    if (
      !selectedActivityLevel ||
      !hasInitialDataLoaded.current ||
      fetchInProgress.current ||
      isUpdatingActivityLevel.current
    ) {
      return;
    }

    let customBmrValue =
      selectedBmrType === "Custom" ? parseFloat(customBMR) : undefined;

    // Handle invalid custom BMR input without API call
    if (
      selectedBmrType === "Custom" &&
      (!customBmrValue || isNaN(customBmrValue))
    ) {
      setEnergySettings((prev) =>
        prev ? { ...prev, BMR: 0, MaintenanceCalories: 0 } : null
      );
      return;
    }

    // Debounce API calls to prevent rapid successive requests
    const timeoutId = setTimeout(() => {
      setEnergyLoading(true);
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
          console.error("Failed to update energy settings:", error);
          setError("Failed to update energy settings.");
        })
        .finally(() => setEnergyLoading(false));
    }, 300); // 300ms debounce delay

    // Cleanup timeout on dependency change or unmount
    return () => clearTimeout(timeoutId);
  }, [selectedBmrType, customBMR, selectedActivityLevel, isTefEnabled]);

  // Debounced daily calories recalculation when BMR settings change
  useEffect(() => {
    // Don't recalculate if initial data hasn't loaded yet or if initial load is in progress
    if (
      !hasInitialDataLoaded.current ||
      fetchInProgress.current ||
      isUpdatingActivityLevel.current
    ) {
      return;
    }

    // Only recalculate if we have valid BMR settings
    if (selectedBmrType === "Custom") {
      const customBmrValue = parseFloat(customBMR);
      if (!customBmrValue || isNaN(customBmrValue)) {
        return;
      }
    }

    // Debounce recalculation to prevent excessive API calls
    const timeoutId = setTimeout(async () => {
      try {
        await goalsService.recalculateDailyCalories();
      } catch (error) {
        console.error("Failed to recalculate daily calories:", error);
        // Don't show error to user for background recalculation
      }
    }, 500); // 500ms debounce delay

    // Cleanup timeout on dependency change or unmount
    return () => clearTimeout(timeoutId);
  }, [selectedBmrType, customBMR, selectedActivityLevel, isTefEnabled]);

  const handleBmrTypeSelect = (option) => {
    setSelectedBmrType(option);
    setActiveDropdown(null);
    if (option === "Default") setCustomBMR("");
  };

  const handleActivityLevelSelect = async (level) => {
    // Prevent duplicate selections or actions during loading
    if (
      (selectedActivityLevel && selectedActivityLevel.id === level.id) ||
      energyLoading ||
      initialLoading
    ) {
      setActiveDropdown(null);
      return;
    }

    setActiveDropdown(null);
    setEnergyLoading(true);
    setError(null);
    isUpdatingActivityLevel.current = true;

    try {
      // Get current profile data
      const profile = await userService.getProfileData();
      // Update with new activity level, filter/format payload
      const updatedProfile = buildProfileUpdatePayload(profile, {
        activityLevelId: level.id,
      });
      await userService.updateProfileData(updatedProfile);

      // Fetch new energy settings directly here to avoid double API calls
      const settings = await nutritionService.getEnergySettings({
        customBmr:
          selectedBmrType === "Custom" ? parseFloat(customBMR) : undefined,
        activityLevelId: level.id,
        includeTef: isTefEnabled,
      });

      // Update both activity level and energy settings atomically
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

      // Update local state only after successful API call
      setSelectedActivityLevel(level);

      // Recalculate daily calories after successful activity level update
      await goalsService.recalculateDailyCalories();
    } catch (err) {
      console.error("Failed to save activity level:", err);
      setError("Failed to save activity level. Please try again.");
      // Keep the previous selection on error
    } finally {
      setEnergyLoading(false);
      isUpdatingActivityLevel.current = false;
    }
  };

  // Persist TEF toggle change
  const handleTefToggle = async () => {
    // Prevent toggle during loading state
    if (energyLoading || initialLoading) return;

    const newTef = !isTefEnabled;
    const previousTef = isTefEnabled;

    // Optimistic update
    setIsTefEnabled(newTef);
    setEnergyLoading(true);
    setError(null);

    try {
      const profile = await userService.getProfileData();
      const updatedProfile = buildProfileUpdatePayload(profile, {
        includeTef: newTef,
      });
      await userService.updateProfileData(updatedProfile);

      // Recalculate daily calories after successful TEF update
      await goalsService.recalculateDailyCalories();
    } catch (err) {
      console.error("Failed to save TEF setting:", err);
      setError("Failed to save TEF setting. Please try again.");
      // Revert to previous state on error
      setIsTefEnabled(previousTef);
    } finally {
      setEnergyLoading(false);
    }
  };

  // Memoized helper function to safely format numbers
  const formatNumber = useCallback((value) => {
    if (value === null || value === undefined || isNaN(value)) {
      return "-";
    }
    const num = typeof value === "string" ? parseFloat(value) : value;
    return isNaN(num) ? "-" : Math.round(num);
  }, []);

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
            {initialLoading || energyLoading ? (
              <ActivityIndicator size="large" color={Colors.darkGreen.color} />
            ) : error ? (
              <Text style={{ color: "red" }}>{error}</Text>
            ) : (
              <>
                <Text style={styles.energyLabel}>
                  Daily Calories to Maintain Weight
                </Text>
                <Text style={styles.energyValue}>
                  {energySettings
                    ? formatNumber(energySettings.MaintenanceCalories)
                    : "-"}
                </Text>
                <Text style={styles.energyUnit}>kcal / day</Text>

                <View style={styles.bmrContainer}>
                  <Text style={styles.bmrLabel}>
                    BMR:{" "}
                    {energySettings ? formatNumber(energySettings.BMR) : "-"}{" "}
                    kcal
                  </Text>
                  <Text style={styles.bmrDescription}>
                    Basal Metabolic Rate - calories burned at rest
                  </Text>
                </View>
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
                  onPress={handleTefToggle}
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
    padding: 15,
    backgroundColor: Colors.lightGreen.color,
    borderRadius: 15,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  energyLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.darkGreen.color,
    marginBottom: 8,
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  energyValue: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.darkGreen.color,
    marginBottom: 4,
    textAlign: "center",
  },
  energyUnit: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
    marginBottom: 12,
  },
  bmrContainer: {
    marginTop: 12,
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderTopWidth: 2,
    borderTopColor: Colors.darkGreen.color + "30",
    backgroundColor: Colors.darkGreen.color + "08",
    borderRadius: 8,
    alignItems: "center",
  },
  bmrLabel: {
    color: Colors.darkGreen.color,
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },
  bmrDescription: {
    color: "#666",
    fontSize: 11,
    marginTop: 4,
    textAlign: "center",
    fontStyle: "italic",
    lineHeight: 14,
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
