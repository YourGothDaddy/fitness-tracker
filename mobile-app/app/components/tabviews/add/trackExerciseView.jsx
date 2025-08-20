import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Animated,
  Platform,
  Modal,
  Pressable,
  Alert,
  Image,
  BackHandler,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "../../../../components/Icon";
import { Colors } from "../../../../constants/Colors";
import { useRouter } from "expo-router";
import { Stack } from "expo-router";
import { activityService } from "@/app/services/activityService";
import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

const PARTICLE_COUNT = 10;
const PARTICLE_COLOR = "#e74c3c";

function getRandomParticles() {
  return Array.from({ length: PARTICLE_COUNT }, () => {
    const angle = Math.random() * 2 * Math.PI;
    const distance = 14 + Math.random() * 16;
    const rotation = Math.random() * 60 - 30;
    return { angle, distance, rotation };
  });
}

const INTENSITY_PRIORITY = [
  "very low",
  "low",
  "light",
  "moderate",
  "medium",
  "hard",
  "high",
  "vigorous",
  "very hard",
  "very high",
  "max",
  "maximal",
];

const sortEffortLevels = (levels = []) => {
  const priority = (label) => {
    const v = String(label || "").toLowerCase();
    const idx = INTENSITY_PRIORITY.findIndex((p) => v.includes(p));
    return idx === -1 ? Number.MAX_SAFE_INTEGER : idx;
  };
  return [...levels].sort((a, b) => priority(a) - priority(b));
};

const sortTerrainTypes = (levels = []) => {
  const order = ["easy", "moderate", "steep", "rough"];
  const pr = (label) => {
    const v = String(label || "").toLowerCase();
    const idx = order.findIndex((p) => v.includes(p));
    return idx === -1 ? Number.MAX_SAFE_INTEGER : idx;
  };
  return [...levels].sort((a, b) => pr(a) - pr(b));
};

const getCategoryVisual = (name = "") => {
  const key = name.toLowerCase();

  const greenTheme = {
    gradient: ["#8cc63f", "#7ab82f"],
    lightGradient: ["rgba(140, 198, 63, 0.1)", "rgba(122, 184, 47, 0.1)"],
    textColor: "#ffffff",
    lightTextColor: "#8cc63f",
    accentColor: "#8cc63f",
    borderColor: "rgba(140, 198, 63, 0.3)",
    shadowColor: "#8cc63f",
  };

  if (
    key.includes("cardio") ||
    key.includes("running") ||
    key.includes("cycling")
  ) {
    return {
      ...greenTheme,
      icon: "directions-run",
      description: "Heart-pumping activities",
    };
  }

  if (
    key.includes("gym") ||
    key.includes("strength") ||
    key.includes("weight")
  ) {
    return {
      ...greenTheme,
      icon: "fitness-center",
      description: "Build strength & muscle",
    };
  }

  if (
    key.includes("outdoor") ||
    key.includes("hiking") ||
    key.includes("nature")
  ) {
    return {
      ...greenTheme,
      icon: "landscape",
      description: "Fresh air adventures",
    };
  }

  if (key.includes("sports") || key.includes("team") || key.includes("ball")) {
    return {
      ...greenTheme,
      icon: "sports-basketball",
      description: "Competitive & team play",
    };
  }

  if (key.includes("water") || key.includes("swim") || key.includes("aqua")) {
    return {
      ...greenTheme,
      icon: "pool",
      description: "Aquatic activities",
    };
  }

  if (key.includes("winter") || key.includes("snow") || key.includes("ski")) {
    return {
      ...greenTheme,
      icon: "ac-unit",
      description: "Winter sports & activities",
    };
  }

  if (
    key.includes("dance") ||
    key.includes("rhythm") ||
    key.includes("music")
  ) {
    return {
      ...greenTheme,
      icon: "music-note",
      description: "Rhythmic movement",
    };
  }

  if (
    key.includes("martial") ||
    key.includes("combat") ||
    key.includes("fight")
  ) {
    return {
      ...greenTheme,
      icon: "sports-mma",
      description: "Combat & self-defense",
    };
  }

  if (
    key.includes("yoga") ||
    key.includes("meditation") ||
    key.includes("mindful")
  ) {
    return {
      ...greenTheme,
      icon: "self-improvement",
      description: "Mind & body wellness",
    };
  }

  return {
    ...greenTheme,
    icon: "fitness-center",
    description: "Fitness activity",
  };
};

const ExerciseItem = ({
  category,
  subcategory,
  exercise,
  caloriesPerMinute: initialCaloriesPerMinute,
  caloriesPerHalfHour: initialCaloriesPerHalfHour,
  caloriesPerHour: initialCaloriesPerHour,
  effortLevels = [],
  terrainTypes = [],
  activityTypeId,
  favoriteActivityTypeIds = [],
  onFavoriteToggle,
  isCustomTab,
  hideEffortAndDuration,
  isCustomWorkout,
  customCalories,
  ...rest
}) => {
  const [duration, setDuration] = useState(30);
  const [effort, setEffort] = useState(
    effortLevels[1] || effortLevels[0] || ""
  );
  const [terrain, setTerrain] = useState(terrainTypes[0] || "");
  const [effortModalVisible, setEffortModalVisible] = useState(false);
  const [terrainModalVisible, setTerrainModalVisible] = useState(false);
  const [calories, setCalories] = useState({
    caloriesPerMinute: initialCaloriesPerMinute,
    caloriesPerHalfHour: initialCaloriesPerHalfHour,
    caloriesPerHour: initialCaloriesPerHour,
    totalCalories: initialCaloriesPerMinute * 30,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [date, setDate] = useState(new Date());
  const [showIOSPicker, setShowIOSPicker] = useState(false);
  const [iosTempDateTime, setIosTempDateTime] = useState(new Date());
  const [isFavorite, setIsFavorite] = useState(
    favoriteActivityTypeIds.includes(activityTypeId)
  );
  const heartAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const [showParticles, setShowParticles] = useState(false);
  const [particleConfigs, setParticleConfigs] = useState(getRandomParticles());
  const particleAnims = useRef(
    Array.from({ length: PARTICLE_COUNT }, () => ({
      scale: new Animated.Value(0),
      opacity: new Animated.Value(1),
    }))
  ).current;

  useEffect(() => {
    if (isFavorite) {
      Animated.parallel([
        Animated.timing(heartAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.25,
            duration: 120,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 130,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 120,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 0,
            duration: 130,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
      setParticleConfigs(getRandomParticles());
      setShowParticles(true);
      particleAnims.forEach((anim, i) => {
        anim.scale.setValue(0);
        anim.opacity.setValue(1);
        Animated.parallel([
          Animated.timing(anim.scale, {
            toValue: 1.5 + Math.random() * 0.7,
            duration: 500,
            delay: i * 18,
            useNativeDriver: true,
          }),
          Animated.timing(anim.opacity, {
            toValue: 0,
            duration: 500,
            delay: i * 18,
            useNativeDriver: true,
          }),
        ]).start(() => {
          if (i === PARTICLE_COUNT - 1) setShowParticles(false);
        });
      });
    } else {
      Animated.parallel([
        Animated.timing(heartAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isFavorite, heartAnim, scaleAnim, rotateAnim, particleAnims]);

  useEffect(() => {
    setIsFavorite(favoriteActivityTypeIds.includes(activityTypeId));
  }, [favoriteActivityTypeIds, activityTypeId]);

  const handleFavoritePress = async () => {
    try {
      if (isFavorite) {
        await activityService.removeFavoriteActivityType(activityTypeId);
        setIsFavorite(false);
        onFavoriteToggle && onFavoriteToggle(activityTypeId, false);
      } else {
        await activityService.addFavoriteActivityType(activityTypeId);
        setIsFavorite(true);
        onFavoriteToggle && onFavoriteToggle(activityTypeId, true);
      }
    } catch (err) {
      Alert.alert(
        "Error",
        err?.response?.data?.message ||
          err.message ||
          "Failed to update favorite"
      );
    }
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "-18deg"],
  });

  const particleAngles = Array.from(
    { length: PARTICLE_COUNT },
    (_, i) => i * (360 / PARTICLE_COUNT) * (Math.PI / 180)
  );

  const recalculateCalories = async (newEffort, newTerrain, newDuration) => {
    setLoading(true);
    setError("");
    try {
      const res = await activityService.calculateExerciseCalories({
        category,
        subcategory,
        exercise,
        effortLevel: newEffort,
        durationInMinutes: newDuration,
        terrainType: newTerrain,
      });
      setCalories({
        caloriesPerMinute: res.caloriesPerMinute,
        caloriesPerHalfHour: res.caloriesPerHalfHour,
        caloriesPerHour: res.caloriesPerHour,
        totalCalories: res.totalCalories,
      });
    } catch (err) {
      setError("Failed to recalculate calories");
    } finally {
      setLoading(false);
    }
  };

  const trackExercise = async (selectedDate) => {
    setLoading(true);
    setError("");
    try {
      const requestData = {
        category,
        subcategory,
        exercise,
        effortLevel: effort,
        durationInMinutes: duration,
        terrainType: terrainTypes.length > 0 ? terrain : undefined,
        date: selectedDate,
        isPublic: true,
      };

      await activityService.trackExercise(requestData);

      Alert.alert("Success", "Exercise tracked successfully!");
      setDuration(30);
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to track exercise";
      setError(errorMessage);
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isCustomWorkout) {
      if (
        (effortLevels.length > 0 && effort) ||
        (terrainTypes.length > 0 && terrain)
      ) {
        recalculateCalories(effort, terrain, duration);
      }
    }
  }, [effort, terrain, duration, isCustomWorkout]);

  let showDuration = effortLevels.length > 0 || terrainTypes.length > 0;
  let showEffort = effortLevels.length > 0;
  let showTerrain = terrainTypes.length > 0;

  const handleAddPress = () => {
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: date,
        mode: "date",
        is24Hour: true,
        onChange: (event, selectedDate) => {
          if (event.type === "set" && selectedDate) {
            DateTimePickerAndroid.open({
              value: selectedDate,
              mode: "time",
              is24Hour: true,
              onChange: (timeEvent, selectedTime) => {
                if (timeEvent.type === "set" && selectedTime) {
                  const finalDateTime = new Date(
                    selectedDate.getFullYear(),
                    selectedDate.getMonth(),
                    selectedDate.getDate(),
                    selectedTime.getHours(),
                    selectedTime.getMinutes(),
                    0,
                    0
                  );
                  setDate(finalDateTime);
                  trackExercise(finalDateTime);
                }
              },
              maximumDate: new Date(),
            });
          }
        },
        maximumDate: new Date(),
      });
    } else {
      setIosTempDateTime(new Date());
      setShowIOSPicker(true);
    }
  };

  return (
    <Animated.View style={styles.exerciseItemContainer}>
      {!isCustomWorkout && (
        <TouchableOpacity
          style={styles.heartButtonAbsolute}
          onPress={handleFavoritePress}
          activeOpacity={0.7}
        >
          {showParticles && (
            <>
              {particleAnims.map((anim, i) => {
                const { angle, distance, rotation } = particleConfigs[i];
                const translateX = anim.scale.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, Math.cos(angle) * distance],
                });
                const translateY = anim.scale.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, Math.sin(angle) * distance],
                });
                const rotateParticle = anim.scale.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0deg", `${rotation}deg`],
                });
                return (
                  <Animated.View
                    key={i}
                    style={{
                      position: "absolute",
                      left: 16,
                      top: 16,
                      width: 12,
                      height: 12,
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: anim.opacity,
                      transform: [
                        { translateX },
                        { translateY },
                        { scale: anim.scale },
                        { rotate: rotateParticle },
                      ],
                    }}
                    pointerEvents="none"
                  >
                    <Icon name="heart" size={12} color={PARTICLE_COLOR} />
                  </Animated.View>
                );
              })}
            </>
          )}
          <Animated.View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              alignItems: "center",
              justifyContent: "center",
              opacity: heartAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0],
              }),
            }}
            pointerEvents="none"
          >
            <Icon name="heart-outline" size={26} color="#bbb" />
          </Animated.View>
          <Animated.View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              alignItems: "center",
              justifyContent: "center",
              opacity: heartAnim,
              transform: [{ scale: scaleAnim }, { rotate }],
            }}
            pointerEvents="none"
          >
            <Icon name="heart" size={26} color="#e74c3c" />
          </Animated.View>
        </TouchableOpacity>
      )}
      <View style={styles.exerciseItemLeft}>
        <Text style={styles.exerciseName}>{exercise || subcategory}</Text>
        <View style={styles.caloriesContainer}>
          <View style={styles.totalCaloriesBox}>
            <Icon
              name="local-fire-department"
              size={22}
              color="#ff7043"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.totalCaloriesLabel}>Burned</Text>
            <Text style={styles.totalCaloriesValue}>
              {loading
                ? "..."
                : isCustomWorkout && typeof customCalories === "number"
                ? customCalories
                : calories.totalCalories?.toFixed(1)}{" "}
              kcal
            </Text>
          </View>
          {isCustomWorkout && (
            <Text style={[styles.calorieText]}>
              <Text style={styles.calorieLabel}>Duration:</Text> {duration} min
            </Text>
          )}
        </View>
        {error ? (
          <Text style={{ color: "red", fontSize: 12 }}>{error}</Text>
        ) : null}
        <View
          style={{
            flexDirection: "row",
            gap: 10,
            marginTop: 10,
            flexWrap: "nowrap",
            alignItems: "center",
          }}
        >
          {!hideEffortAndDuration && showDuration && (
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
            >
              <Text style={{ fontSize: 14, color: "#333" }}>Duration:</Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: "#ccc",
                  borderRadius: 8,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  minWidth: 50,
                  fontSize: 14,
                  color: "#333",
                  backgroundColor: "#f5f5f5",
                }}
                placeholder="min"
                value={duration.toString()}
                onChangeText={(val) => {
                  const num = parseInt(val.replace(/[^0-9]/g, ""), 10) || 0;
                  setDuration(num);
                }}
                keyboardType="numeric"
              />
            </View>
          )}
          {!hideEffortAndDuration && showEffort && (
            <>
              <TouchableOpacity
                style={styles.badgeContainer}
                onPress={() => setEffortModalVisible(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.badgeText}>
                  <Text style={styles.calorieLabel}>Effort:</Text>{" "}
                  {effort || "Effort level"}
                </Text>
                <Icon
                  name="arrow-drop-down"
                  size={20}
                  color="#619819"
                  style={{ marginLeft: 2 }}
                />
              </TouchableOpacity>
              <Modal
                visible={effortModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setEffortModalVisible(false)}
              >
                <Pressable
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "rgba(0,0,0,0.2)",
                  }}
                  onPress={() => setEffortModalVisible(false)}
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
                    {effortLevels.map((option) => (
                      <TouchableOpacity
                        key={option}
                        style={{ paddingVertical: 10, paddingHorizontal: 8 }}
                        onPress={() => {
                          setEffort(option);
                          setEffortModalVisible(false);
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 16,
                            color: option === effort ? "#619819" : "#2d3436",
                            fontWeight: option === effort ? "700" : "500",
                          }}
                        >
                          {option}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </Pressable>
              </Modal>
            </>
          )}
          {showTerrain && (
            <>
              <TouchableOpacity
                style={styles.badgeContainer}
                onPress={() => setTerrainModalVisible(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.badgeText}>
                  {terrain || "Terrain type"}
                </Text>
                <Icon
                  name="arrow-drop-down"
                  size={20}
                  color={Colors.darkGreen.color}
                  style={{ marginLeft: 2 }}
                />
              </TouchableOpacity>
              <Modal
                visible={terrainModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setTerrainModalVisible(false)}
              >
                <Pressable
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "rgba(0,0,0,0.2)",
                  }}
                  onPress={() => setTerrainModalVisible(false)}
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
                    {terrainTypes.map((option) => (
                      <TouchableOpacity
                        key={option}
                        style={{ paddingVertical: 10, paddingHorizontal: 8 }}
                        onPress={() => {
                          setTerrain(option);
                          setTerrainModalVisible(false);
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 16,
                            color:
                              option === terrain
                                ? Colors.darkGreen.color
                                : "#2d3436",
                            fontWeight: option === terrain ? "700" : "500",
                          }}
                        >
                          {option}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </Pressable>
              </Modal>
            </>
          )}
        </View>
      </View>
      <View style={styles.rightButtonsContainer}>
        <TouchableOpacity
          style={styles.addExerciseButton}
          onPress={handleAddPress}
          disabled={loading}
        >
          <Icon name="add-circle" size={28} color={Colors.darkGreen.color} />
        </TouchableOpacity>
      </View>
      {Platform.OS === "ios" && showIOSPicker && (
        <Modal
          visible={showIOSPicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowIOSPicker(false)}
        >
          <Pressable
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(0,0,0,0.2)",
            }}
            onPress={() => setShowIOSPicker(false)}
          >
            <View
              style={{
                backgroundColor: "#fff",
                borderRadius: 12,
                padding: 16,
                minWidth: 280,
                elevation: 5,
              }}
            >
              <Text
                style={{ fontSize: 16, fontWeight: "600", marginBottom: 10 }}
              >
                Select Date and Time
              </Text>
              <View style={{ alignItems: "stretch" }}>
                <DateTimePicker
                  testID="datePickerIOS"
                  value={iosTempDateTime}
                  mode="date"
                  display="spinner"
                  maximumDate={new Date()}
                  onChange={(event, newDate) => {
                    if (newDate) {
                      const updated = new Date(iosTempDateTime);
                      updated.setFullYear(newDate.getFullYear());
                      updated.setMonth(newDate.getMonth());
                      updated.setDate(newDate.getDate());
                      setIosTempDateTime(updated);
                    }
                  }}
                  style={{ width: 260 }}
                />
                <View style={{ height: 12 }} />
                <DateTimePicker
                  testID="timePickerIOS"
                  value={iosTempDateTime}
                  mode="time"
                  display="spinner"
                  onChange={(event, newTime) => {
                    if (newTime) {
                      const updated = new Date(iosTempDateTime);
                      updated.setHours(newTime.getHours());
                      updated.setMinutes(newTime.getMinutes());
                      updated.setSeconds(0);
                      updated.setMilliseconds(0);
                      setIosTempDateTime(updated);
                    }
                  }}
                  style={{ width: 260 }}
                />
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  marginTop: 16,
                }}
              >
                <TouchableOpacity
                  onPress={() => setShowIOSPicker(false)}
                  style={{ marginRight: 12 }}
                >
                  <Text
                    style={{ color: "#666", fontWeight: "600", fontSize: 16 }}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setDate(iosTempDateTime);
                    setShowIOSPicker(false);
                    trackExercise(iosTempDateTime);
                  }}
                >
                  <Text
                    style={{
                      color: Colors.darkGreen.color,
                      fontWeight: "600",
                      fontSize: 16,
                    }}
                  >
                    Done
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Pressable>
        </Modal>
      )}
    </Animated.View>
  );
};

const TrackExerciseView = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [exerciseItems, setExerciseItems] = useState([]);
  const [favoriteActivityTypeIds, setFavoriteActivityTypeIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exerciseMetaData, setExerciseMetaData] = useState([]);
  const [allViewLevel, setAllViewLevel] = useState("category");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [exercisesForSubcategory, setExercisesForSubcategory] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategoriesForCategory, setSubcategoriesForCategory] = useState([]);
  const [pressedCategory, setPressedCategory] = useState(null);
  const [pressedSubcategory, setPressedSubcategory] = useState(null);
  const categoryAnimRefs = useRef({}).current;
  const subcategoryAnimRefs = useRef({}).current;

  // Handle back button press
  useEffect(() => {
    const backAction = () => {
      // If we're in the exercise flow (all tab), handle internal navigation
      if (activeTab === "all") {
        if (allViewLevel === "exercise") {
          // Go back to subcategory selection
          setAllViewLevel("subcategory");
          setSelectedSubcategory(null);
          setExercisesForSubcategory([]);
          return true; // Prevent default back behavior
        } else if (allViewLevel === "subcategory") {
          // Go back to category selection
          setAllViewLevel("category");
          setSelectedCategory(null);
          setSubcategoriesForCategory([]);
          return true; // Prevent default back behavior
        }
      }
      // For other tabs or at the top level, allow default back behavior
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [activeTab, allViewLevel]);

  useEffect(() => {
    const fetchMetaData = async () => {
      try {
        const meta = await activityService.getExerciseMetaData();
        setExerciseMetaData(meta);
      } catch (err) {}
    };
    fetchMetaData();
  }, []);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const favorites = await activityService.getFavoriteActivityTypes();
        setFavoriteActivityTypeIds(favorites.map((f) => f.id));
      } catch (err) {}
    };
    fetchFavorites();
  }, []);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      setError("");
      try {
        let items = [];
        if (activeTab === "all") {
          items = await activityService.getPublicActivityTypes();
        } else if (activeTab === "favorites") {
          const [publicTypes] = await Promise.all([
            activityService.getPublicActivityTypes(),
          ]);
          items = [...publicTypes].filter((t) =>
            favoriteActivityTypeIds.includes(t.id)
          );
        }
        setExerciseItems(items);
      } catch (err) {
        setError("Failed to load exercise data");
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [activeTab, favoriteActivityTypeIds]);

  useEffect(() => {
    if (activeTab !== "all") {
      setAllViewLevel("category");
      setSelectedCategory(null);
      setSelectedSubcategory(null);
      setSubcategoriesForCategory([]);
      setExercisesForSubcategory([]);
    }
  }, [activeTab]);

  const handleFavoriteToggle = (activityTypeId, isNowFavorite) => {
    setFavoriteActivityTypeIds((prev) => {
      if (isNowFavorite) return [...prev, activityTypeId];
      return prev.filter((id) => id !== activityTypeId);
    });
  };

  const filteredItems = exerciseItems.filter((item) => {
    return (
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  useEffect(() => {
    const loadCategories = async () => {
      if (activeTab !== "all" || allViewLevel !== "category") return;
      try {
        setLoading(true);
        const cats = await activityService.getCategories();
        setCategories(
          cats.filter(
            (c) => c && c.toLowerCase().includes(searchQuery.toLowerCase())
          )
        );
      } catch (e) {
      } finally {
        setLoading(false);
      }
    };
    loadCategories();
  }, [activeTab, allViewLevel, searchQuery]);

  const itemsInSelectedCategory = filteredItems.filter(
    (i) => i.category === selectedCategory
  );

  // Helper to get effortLevels and terrainTypes from meta
  const getMetaForItem = (item) => {
    return (
      exerciseMetaData.find(
        (meta) =>
          meta.category === item.category && meta.subcategory === item.name
      ) || {}
    );
  };

  // Helper removed: no custom workouts
  const isCustomOrFavoriteCustom = (item) => false;

  // Determine if the current tab is 'custom'
  const isCustomTab = false;

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <SafeAreaView style={styles.safeAreaViewContainer}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text className="text-4xl font-pextrabold text-center text-green pt-10">
              Fitlicious
            </Text>
          </View>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Icon name="arrow-back" size={36} color={Colors.darkGreen.color} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Icon
              name="search-outline"
              size={24}
              color="#666"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search exercises..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#666"
            />
            {searchQuery !== "" && (
              <TouchableOpacity
                onPress={() => setSearchQuery("")}
                style={styles.clearButton}
              >
                <Icon name="close-circle" size={24} color="#666" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "all" && styles.activeTab]}
            onPress={() => setActiveTab("all")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "all" && styles.activeTabText,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "favorites" && styles.activeTab]}
            onPress={() => setActiveTab("favorites")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "favorites" && styles.activeTabText,
              ]}
            >
              Favorites
            </Text>
          </TouchableOpacity>
          {/* Custom tab removed */}
        </View>

        {loading ? (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <Text>Loading...</Text>
          </View>
        ) : error ? (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <Text style={{ color: "red" }}>{error}</Text>
          </View>
        ) : (
          <ScrollView
            style={styles.exercisesList}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.exercisesListContent}
          >
            {activeTab === "all" && allViewLevel === "category" && (
              <>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Activity Categories</Text>
                  <Text style={styles.sectionSubtitle}>
                    Choose your activity type
                  </Text>
                </View>
                <View style={styles.categoryGrid}>
                  {categories.map((cat, index) => {
                    const visual = getCategoryVisual(cat);

                    // Initialize animation refs for this category
                    if (!categoryAnimRefs[cat]) {
                      categoryAnimRefs[cat] = {
                        scale: new Animated.Value(1),
                        opacity: new Animated.Value(1),
                      };
                    }

                    const handlePressIn = () => {
                      setPressedCategory(cat);
                      Animated.parallel([
                        Animated.timing(categoryAnimRefs[cat].scale, {
                          toValue: 0.95,
                          duration: 150,
                          useNativeDriver: true,
                        }),
                        Animated.timing(categoryAnimRefs[cat].opacity, {
                          toValue: 0.8,
                          duration: 150,
                          useNativeDriver: true,
                        }),
                      ]).start();
                    };

                    const handlePressOut = () => {
                      setPressedCategory(null);
                      Animated.parallel([
                        Animated.timing(categoryAnimRefs[cat].scale, {
                          toValue: 1,
                          duration: 150,
                          useNativeDriver: true,
                        }),
                        Animated.timing(categoryAnimRefs[cat].opacity, {
                          toValue: 1,
                          duration: 150,
                          useNativeDriver: true,
                        }),
                      ]).start();
                    };

                    return (
                      <Animated.View
                        key={cat}
                        style={{
                          transform: [{ scale: categoryAnimRefs[cat].scale }],
                          opacity: categoryAnimRefs[cat].opacity,
                          width: "100%",
                          alignItems: "center",
                        }}
                      >
                        <TouchableOpacity
                          style={[
                            styles.categoryTile,
                            {
                              borderColor: visual.borderColor,
                              shadowColor: visual.shadowColor,
                            },
                          ]}
                          onPressIn={handlePressIn}
                          onPressOut={handlePressOut}
                          onPress={() => {
                            setSelectedCategory(cat);
                            setSelectedSubcategory(null);
                            setExercisesForSubcategory([]);
                            setAllViewLevel("subcategory");
                            (async () => {
                              try {
                                setLoading(true);
                                const subs =
                                  await activityService.getSubcategories(cat);
                                setSubcategoriesForCategory(subs);
                              } catch (e) {
                                setSubcategoriesForCategory([]);
                              } finally {
                                setLoading(false);
                              }
                            })();
                          }}
                          activeOpacity={1}
                        >
                          <LinearGradient
                            colors={visual.gradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.categoryGradientBackground}
                          >
                            <View style={styles.categoryIconContainer}>
                              <Icon
                                name={visual.icon}
                                size={24}
                                color="rgba(255, 255, 255, 0.9)"
                              />
                            </View>
                            <View style={styles.categoryTileContent}>
                              <Text
                                style={[
                                  styles.categoryTileText,
                                  { color: visual.textColor },
                                ]}
                              >
                                {cat}
                              </Text>
                              <Text
                                style={[
                                  styles.categoryDescription,
                                  { color: visual.textColor },
                                ]}
                              >
                                {visual.description}
                              </Text>
                            </View>
                            <View style={styles.categoryShimmer}>
                              <LinearGradient
                                colors={[
                                  "rgba(255, 255, 255, 0)",
                                  "rgba(255, 255, 255, 0.1)",
                                  "rgba(255, 255, 255, 0)",
                                ]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.shimmerGradient}
                              />
                            </View>
                            <View style={styles.categoryArrow}>
                              <Icon
                                name="arrow-forward-ios"
                                size={14}
                                color="rgba(255, 255, 255, 0.7)"
                              />
                            </View>
                          </LinearGradient>
                        </TouchableOpacity>
                      </Animated.View>
                    );
                  })}
                </View>
              </>
            )}

            {activeTab === "all" && allViewLevel === "subcategory" && (
              <>
                <View style={styles.breadcrumbRow}>
                  <TouchableOpacity
                    onPress={() => {
                      setAllViewLevel("category");
                      setSelectedCategory(null);
                      setSelectedSubcategory(null);
                      setSubcategoriesForCategory([]);
                    }}
                    style={styles.breadcrumbBack}
                  >
                    <Icon
                      name="arrow-back"
                      size={22}
                      color={Colors.darkGreen.color}
                    />
                    <Text style={styles.breadcrumbBackText}>
                      All categories
                    </Text>
                  </TouchableOpacity>
                  <Text style={styles.breadcrumbCurrent}>
                    {selectedCategory}
                  </Text>
                </View>
                <View style={styles.categoryGrid}>
                  {subcategoriesForCategory
                    .filter((name) =>
                      name.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((name, index) => {
                      const visual = getCategoryVisual(name);

                      // Initialize animation refs for this subcategory
                      if (!subcategoryAnimRefs[name]) {
                        subcategoryAnimRefs[name] = {
                          scale: new Animated.Value(1),
                          opacity: new Animated.Value(1),
                        };
                      }

                      const handlePressIn = () => {
                        setPressedSubcategory(name);
                        Animated.parallel([
                          Animated.timing(subcategoryAnimRefs[name].scale, {
                            toValue: 0.97,
                            duration: 120,
                            useNativeDriver: true,
                          }),
                          Animated.timing(subcategoryAnimRefs[name].opacity, {
                            toValue: 0.85,
                            duration: 120,
                            useNativeDriver: true,
                          }),
                        ]).start();
                      };

                      const handlePressOut = () => {
                        setPressedSubcategory(null);
                        Animated.parallel([
                          Animated.timing(subcategoryAnimRefs[name].scale, {
                            toValue: 1,
                            duration: 120,
                            useNativeDriver: true,
                          }),
                          Animated.timing(subcategoryAnimRefs[name].opacity, {
                            toValue: 1,
                            duration: 120,
                            useNativeDriver: true,
                          }),
                        ]).start();
                      };

                      return (
                        <Animated.View
                          key={name}
                          style={{
                            transform: [
                              { scale: subcategoryAnimRefs[name].scale },
                            ],
                            opacity: subcategoryAnimRefs[name].opacity,
                            width: "100%",
                            alignItems: "center",
                          }}
                        >
                          <TouchableOpacity
                            style={[
                              styles.subcategoryTile,
                              {
                                borderColor: visual.borderColor,
                                shadowColor: visual.shadowColor,
                              },
                            ]}
                            onPressIn={handlePressIn}
                            onPressOut={handlePressOut}
                            onPress={() => {
                              setSelectedSubcategory(name);
                              setAllViewLevel("exercise");
                              (async () => {
                                try {
                                  setLoading(true);
                                  const exercises =
                                    await activityService.getExercises(
                                      selectedCategory,
                                      name
                                    );
                                  setExercisesForSubcategory(exercises);
                                } catch (e) {
                                  setExercisesForSubcategory([]);
                                } finally {
                                  setLoading(false);
                                }
                              })();
                            }}
                            activeOpacity={1}
                          >
                            <LinearGradient
                              colors={visual.lightGradient}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 1 }}
                              style={styles.subcategoryGradientBackground}
                            >
                              <View style={styles.subcategoryIconContainer}>
                                <Icon
                                  name={visual.icon}
                                  size={18}
                                  color={visual.accentColor}
                                />
                              </View>
                              <View style={styles.subcategoryTileContent}>
                                <Text
                                  style={[
                                    styles.subcategoryTileText,
                                    { color: visual.lightTextColor },
                                  ]}
                                >
                                  {name}
                                </Text>
                                <View style={styles.subcategoryAccentBar}>
                                  <LinearGradient
                                    colors={visual.gradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.accentBarGradient}
                                  />
                                </View>
                              </View>
                              <View style={styles.subcategoryArrow}>
                                <Icon
                                  name="arrow-forward-ios"
                                  size={12}
                                  color={visual.accentColor}
                                />
                              </View>
                            </LinearGradient>
                          </TouchableOpacity>
                        </Animated.View>
                      );
                    })}
                </View>
              </>
            )}

            {activeTab === "all" && allViewLevel === "exercise" && (
              <>
                <View style={styles.breadcrumbRow}>
                  <TouchableOpacity
                    onPress={() => {
                      setAllViewLevel("subcategory");
                      setSelectedSubcategory(null);
                      setExercisesForSubcategory([]);
                    }}
                    style={styles.breadcrumbBack}
                  >
                    <Icon
                      name="arrow-back"
                      size={22}
                      color={Colors.darkGreen.color}
                    />
                    <Text style={styles.breadcrumbBackText}>
                      {selectedCategory}
                    </Text>
                  </TouchableOpacity>
                  <Text style={styles.breadcrumbCurrent}>
                    {selectedSubcategory}
                  </Text>
                </View>

                {exercisesForSubcategory.length === 0 && (
                  <Text style={{ color: "#666", marginBottom: 8 }}>
                    No specific exercises; use the subcategory entries.
                  </Text>
                )}

                {exercisesForSubcategory.map((ex, index) => {
                  const meta = getMetaForItem({
                    category: selectedCategory,
                    name: selectedSubcategory,
                  });
                  const effectiveEffortLevels = sortEffortLevels(
                    Array.isArray(ex.keys) && ex.keys.length > 0
                      ? ex.keys
                      : Array.isArray(meta.effortLevels)
                      ? meta.effortLevels
                      : []
                  );
                  const effectiveTerrainTypes = sortTerrainTypes(
                    Array.isArray(meta.terrainTypes) ? meta.terrainTypes : []
                  );
                  return (
                    <ExerciseItem
                      key={ex.id || index}
                      category={selectedCategory}
                      subcategory={selectedSubcategory}
                      exercise={ex.name}
                      activityTypeId={ex.id}
                      favoriteActivityTypeIds={favoriteActivityTypeIds}
                      onFavoriteToggle={handleFavoriteToggle}
                      effortLevels={effectiveEffortLevels}
                      terrainTypes={effectiveTerrainTypes}
                      hideEffortAndDuration={false}
                      isCustomWorkout={false}
                    />
                  );
                })}
              </>
            )}

            {activeTab !== "all" && (
              <>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Favorite Activities</Text>
                  <Text style={styles.sectionSubtitle}>
                    {"Your saved favorite exercises"}
                  </Text>
                </View>
                {filteredItems.map((item, index) => {
                  const meta = getMetaForItem(item);
                  const hideEffortAndDuration = isCustomOrFavoriteCustom(item);
                  const isCustomWorkout = false;
                  return (
                    <ExerciseItem
                      key={item.id || index}
                      category={item.category}
                      subcategory={item.name}
                      activityTypeId={item.id}
                      favoriteActivityTypeIds={
                        isCustomWorkout ? [] : favoriteActivityTypeIds
                      }
                      onFavoriteToggle={
                        isCustomWorkout ? undefined : handleFavoriteToggle
                      }
                      effortLevels={meta.effortLevels || []}
                      terrainTypes={meta.terrainTypes || []}
                      hideEffortAndDuration={hideEffortAndDuration}
                      isCustomWorkout={hideEffortAndDuration}
                      customCalories={undefined}
                    />
                  );
                })}
              </>
            )}
          </ScrollView>
        )}
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
  header: {
    position: "relative",
  },
  titleContainer: {
    width: "100%",
  },
  backButton: {
    paddingLeft: 20,
    paddingBottom: 30,
  },
  searchSection: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  clearButton: {
    padding: 5,
  },
  exercisesList: {
    flex: 1,
  },
  exercisesListContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  sectionHeader: {
    marginBottom: 24,
    marginTop: 8,
    paddingHorizontal: 4,
    width: "100%",
    backgroundColor: "transparent",
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1a1a1a",
    marginBottom: 6,
    letterSpacing: -0.5,
    textAlign: "left",
    fontFamily: Platform.OS === "ios" ? "System" : "sans-serif",
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666",
    letterSpacing: 0.2,
    textAlign: "left",
    fontFamily: Platform.OS === "ios" ? "System" : "sans-serif",
  },
  categoryGrid: {
    flexDirection: "column",
    gap: 12,
    marginBottom: 12,
    paddingHorizontal: 0,
    alignItems: "center",
    width: "100%",
  },
  categoryTile: {
    backgroundColor: "transparent",
    borderRadius: 20,
    marginBottom: 12,
    width: "95%",
    height: 60,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
      android: { elevation: 6 },
    }),
  },
  categoryIconContainer: {
    position: "absolute",
    top: 12,
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
    }),
  },
  categoryTileContent: {
    flex: 1,
    paddingLeft: 60,
    paddingRight: 50,
    paddingVertical: 8,
    justifyContent: "center",
  },
  categoryTileText: {
    fontSize: 18,
    fontWeight: "800",
    textAlign: "left",
    letterSpacing: -0.4,
    marginBottom: 0,
    fontFamily: Platform.OS === "ios" ? "System" : "sans-serif",
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  categoryDescription: {
    fontSize: 11,
    fontWeight: "500",
    textAlign: "left",
    opacity: 0.8,
    letterSpacing: 0.1,
    marginTop: 1,
    fontFamily: Platform.OS === "ios" ? "System" : "sans-serif",
  },
  categoryShimmer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",
  },
  shimmerGradient: {
    flex: 1,
    opacity: 0.6,
  },
  categoryArrow: {
    position: "absolute",
    top: 12,
    right: 16,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  subcategoryTile: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    marginBottom: 12,
    width: "95%",
    height: 45,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: { elevation: 3 },
    }),
  },
  subcategoryIconContainer: {
    position: "absolute",
    top: 6,
    left: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: { elevation: 1 },
    }),
  },
  subcategoryTileContent: {
    flex: 1,
    paddingLeft: 48,
    paddingRight: 32,
    paddingVertical: 6,
    justifyContent: "center",
  },
  subcategoryTileText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "left",
    letterSpacing: -0.2,
    marginBottom: 6,
    fontFamily: Platform.OS === "ios" ? "System" : "sans-serif-medium",
  },
  subcategoryAccentBar: {
    width: "70%",
    height: 2,
    borderRadius: 1,
    overflow: "hidden",
  },
  accentBarGradient: {
    flex: 1,
  },
  subcategoryArrow: {
    position: "absolute",
    top: "50%",
    right: 12,
    marginTop: -10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: { elevation: 1 },
    }),
  },
  subcategoryGradientBackground: {
    flex: 1,
    borderRadius: 16,
  },
  breadcrumbRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  breadcrumbBack: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  breadcrumbBackText: {
    color: Colors.darkGreen.color,
    fontWeight: "600",
    fontSize: 14,
  },
  breadcrumbCurrent: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1a1a1a",
    letterSpacing: -0.2,
  },
  exerciseItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 20,
    marginBottom: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: "#f1f3f4",
    position: "relative",
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 6 },
    }),
  },
  exerciseItemLeft: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1a1a1a",
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  caloriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  calorieText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#5a6c7d",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  addExerciseButton: {
    padding: 5,
  },
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 15,
    gap: 10,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
  },
  activeTab: {
    backgroundColor: Colors.darkGreen.color,
  },
  tabText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "500",
  },
  activeTabText: {
    color: Colors.white.color,
  },
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(97, 152, 25, 0.13)",
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 24,
    shadowColor: Colors.darkGreen.color,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: "rgba(97, 152, 25, 0.18)",
    marginTop: 0,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.darkGreen.color,
  },
  heartButton: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#eee",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 2,
  },
  rightButtonsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginLeft: 8,
  },
  heartButtonAbsolute: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 10,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#eee",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
    width: 32,
    height: 32,
  },
  calorieLabel: {
    fontWeight: "bold",
  },
  calMinText: {
    backgroundColor: "#E3F2FD",
    color: "#1976D2",
  },
  cal30MinText: {
    backgroundColor: "#E8F5E9",
    color: "#388E3C",
  },
  calHourText: {
    backgroundColor: "#FFF4E0",
    color: "#E67E22",
  },
  calTotalText: {
    backgroundColor: "#F3E5F5",
    color: "#8E24AA",
  },
  totalCaloriesBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#8cc63f",
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 6,
    marginRight: 6,
    shadowColor: "#8cc63f",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  totalCaloriesLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
    marginRight: 8,
    letterSpacing: 0.3,
  },
  totalCaloriesValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.3,
  },
  categoryGradientBackground: {
    flex: 1,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
});

export default TrackExerciseView;
