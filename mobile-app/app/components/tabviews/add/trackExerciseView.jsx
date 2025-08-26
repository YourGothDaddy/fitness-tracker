import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  FlatList,
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

// Floating sparkles component for category cards
const FloatingSparkles = () => {
  const [sparkles, setSparkles] = useState([]);
  const fadeAnims = useRef([]);
  const scaleAnims = useRef([]);
  const timersRef = useRef([]);
  const loopsRef = useRef([]);

  useEffect(() => {
    const generateSparkles = () => {
      const newSparkles = Array.from({ length: 8 }, (_, index) => ({
        id: Math.random(),
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 2 + Math.random() * 3,
        opacity: 0.3 + Math.random() * 0.7,
        animationDelay: Math.random() * 2000,
        index,
      }));
      setSparkles(newSparkles);

      // Initialize animation refs
      fadeAnims.current = newSparkles.map(() => new Animated.Value(0.3));
      scaleAnims.current = newSparkles.map(() => new Animated.Value(0.8));
    };

    generateSparkles();
  }, []);

  useEffect(() => {
    if (sparkles.length === 0) return;

    // stop any previous loops/timers
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
    loopsRef.current.forEach((anim) => anim.stop());
    loopsRef.current = [];

    sparkles.forEach((sparkle, index) => {
      const fadeAnim = fadeAnims.current[index];
      const scaleAnim = scaleAnims.current[index];

      if (!fadeAnim || !scaleAnim) return;

      const fadeAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 0.8,
            duration: 1500 + Math.random() * 1000,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 0.3,
            duration: 1500 + Math.random() * 1000,
            useNativeDriver: true,
          }),
        ])
      );

      const scaleAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.2,
            duration: 2000 + Math.random() * 1000,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.8,
            duration: 2000 + Math.random() * 1000,
            useNativeDriver: true,
          }),
        ])
      );

      const timer = setTimeout(() => {
        fadeAnimation.start();
        scaleAnimation.start();
      }, sparkle.animationDelay);

      timersRef.current.push(timer);
      loopsRef.current.push(fadeAnimation, scaleAnimation);
    });

    return () => {
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current = [];
      loopsRef.current.forEach((anim) => anim.stop());
      loopsRef.current = [];
    };
  }, [sparkles]);

  return (
    <View style={styles.sparkleContainer}>
      {sparkles.map((sparkle, index) => {
        const fadeAnim = fadeAnims.current[index];
        const scaleAnim = scaleAnims.current[index];

        if (!fadeAnim || !scaleAnim) return null;

        return (
          <Animated.View
            key={sparkle.id}
            style={[
              styles.sparkle,
              {
                left: `${sparkle.x}%`,
                top: `${sparkle.y}%`,
                width: sparkle.size,
                height: sparkle.size,
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          />
        );
      })}
    </View>
  );
};

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
    gradient: ["#2E7D32", "#4CAF50", "#66BB6A"],
    lightGradient: ["rgba(76, 175, 80, 0.15)", "rgba(102, 187, 106, 0.15)"],
    textColor: "#ffffff",
    lightTextColor: "#2E7D32",
    accentColor: "#2E7D32",
    borderColor: "rgba(76, 175, 80, 0.3)",
    shadowColor: "#2E7D32",
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

  // Get unique icon for each exercise type
  const getExerciseIcon = (exerciseName, categoryName) => {
    const key = (exerciseName + categoryName).toLowerCase();

    if (key.includes("running") || key.includes("jogging"))
      return "directions-run";
    if (key.includes("cycling") || key.includes("bike"))
      return "directions-bike";
    if (key.includes("swimming") || key.includes("swim")) return "pool";
    if (key.includes("walking") || key.includes("hike"))
      return "directions-walk";
    if (key.includes("yoga") || key.includes("stretch"))
      return "self-improvement";
    if (key.includes("weight") || key.includes("strength"))
      return "fitness-center";
    if (key.includes("dance") || key.includes("zumba")) return "music-note";
    if (key.includes("boxing") || key.includes("kickbox")) return "sports-mma";
    if (key.includes("tennis") || key.includes("racket"))
      return "sports-tennis";
    if (key.includes("basketball") || key.includes("hoops"))
      return "sports-basketball";
    if (key.includes("soccer") || key.includes("football"))
      return "sports-soccer";
    if (key.includes("skiing") || key.includes("snow")) return "ac-unit";
    if (key.includes("rowing") || key.includes("boat")) return "rowing";
    if (key.includes("climbing") || key.includes("rock")) return "terrain";
    if (key.includes("martial") || key.includes("karate"))
      return "sports-kabaddi";

    // Default icons based on category
    if (categoryName.toLowerCase().includes("cardio")) return "favorite";
    if (categoryName.toLowerCase().includes("strength"))
      return "fitness-center";
    if (categoryName.toLowerCase().includes("outdoor")) return "landscape";
    if (categoryName.toLowerCase().includes("sports")) return "sports";
    if (categoryName.toLowerCase().includes("water")) return "water";
    if (categoryName.toLowerCase().includes("winter")) return "ac-unit";
    if (categoryName.toLowerCase().includes("dance")) return "music-note";
    if (categoryName.toLowerCase().includes("martial")) return "sports-mma";
    if (categoryName.toLowerCase().includes("yoga")) return "self-improvement";

    return "fitness-center"; // Default fallback
  };

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
            <Icon name="heart-outline" size={20} color="#bbb" />
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
            <Icon name="heart" size={20} color="#e74c3c" />
          </Animated.View>
        </TouchableOpacity>
      )}
      {/* Main Content */}
      <View style={styles.exerciseItemContent}>
        {/* Header Section */}
        <View style={styles.exerciseHeader}>
          <Text style={styles.exerciseName}>{exercise || subcategory}</Text>
          <Text style={styles.exerciseCalories}>
            Estimated:{" "}
            {loading ? "..." : calories.totalCalories?.toFixed(0) || "0"} cal
          </Text>
        </View>

        {/* Interactive Inputs Section */}
        <View style={styles.exerciseInputs}>
          {/* Duration Input with Stepper */}
          {!hideEffortAndDuration && showDuration && (
            <View style={styles.durationContainer}>
              <Text style={styles.inputLabel}>Duration</Text>
              <View style={styles.durationStepper}>
                <TouchableOpacity
                  style={styles.stepperButton}
                  onPress={() => setDuration(Math.max(1, duration - 5))}
                  activeOpacity={0.7}
                >
                  <Icon
                    name="remove"
                    size={20}
                    color={Colors.darkGreen.color}
                  />
                </TouchableOpacity>
                <TextInput
                  style={styles.durationInput}
                  placeholder="Duration"
                  value={duration.toString()}
                  onChangeText={(val) => {
                    const num = parseInt(val.replace(/[^0-9]/g, ""), 10) || 0;
                    setDuration(num);
                  }}
                  keyboardType="numeric"
                  textAlign="center"
                />
                <TouchableOpacity
                  style={styles.stepperButton}
                  onPress={() => setDuration(duration + 5)}
                  activeOpacity={0.7}
                >
                  <Icon name="add" size={20} color={Colors.darkGreen.color} />
                </TouchableOpacity>
              </View>
              <Text style={styles.durationUnit}>min</Text>
            </View>
          )}

          {/* Effort Level Dropdown */}
          {!hideEffortAndDuration && showEffort && (
            <View style={styles.effortContainer}>
              <Text style={styles.inputLabel}>Effort Level</Text>
              <TouchableOpacity
                style={styles.effortDropdown}
                onPress={() => setEffortModalVisible(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.effortDropdownText}>
                  {effort || "Select effort level"}
                </Text>
                <Icon
                  name="arrow-drop-down"
                  size={20}
                  color={Colors.darkGreen.color}
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
                      minWidth: 200,
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
                            color:
                              option === effort
                                ? Colors.darkGreen.color
                                : "#2d3436",
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
            </View>
          )}

          {/* Terrain Type Dropdown */}
          {showTerrain && (
            <View style={styles.terrainContainer}>
              <Text style={styles.inputLabel}>Terrain Type</Text>
              <TouchableOpacity
                style={styles.terrainDropdown}
                onPress={() => setTerrainModalVisible(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.terrainDropdownText}>
                  {terrain || "Select terrain type"}
                </Text>
                <Icon
                  name="arrow-drop-down"
                  size={20}
                  color={Colors.darkGreen.color}
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
                      minWidth: 200,
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
            </View>
          )}
        </View>

        {/* Error Message */}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* Action Buttons Section */}
        <View style={styles.exerciseActions}>
          <TouchableOpacity
            style={styles.addExerciseButton}
            onPress={handleAddPress}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Icon name="add" size={24} color="#ffffff" />
            <Text style={styles.addButtonText}>Add Exercise</Text>
          </TouchableOpacity>
        </View>
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
  const [allPublicTypes, setAllPublicTypes] = useState([]);
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

  // Reset helpers to avoid stuck shrink when navigating back
  const resetCategoryAnims = useCallback(() => {
    Object.values(categoryAnimRefs).forEach((anim) => {
      if (!anim) return;
      if (anim.scale?.stopAnimation) anim.scale.stopAnimation();
      if (anim.opacity?.stopAnimation) anim.opacity.stopAnimation();
      if (anim.scale?.setValue) anim.scale.setValue(1);
      if (anim.opacity?.setValue) anim.opacity.setValue(1);
    });
  }, [categoryAnimRefs]);

  const resetSubcategoryAnims = useCallback(() => {
    Object.values(subcategoryAnimRefs).forEach((anim) => {
      if (!anim) return;
      if (anim.scale?.stopAnimation) anim.scale.stopAnimation();
      if (anim.opacity?.stopAnimation) anim.opacity.stopAnimation();
      if (anim.scale?.setValue) anim.scale.setValue(1);
      if (anim.opacity?.setValue) anim.opacity.setValue(1);
    });
  }, [subcategoryAnimRefs]);

  // Handle back button press
  useEffect(() => {
    const backAction = () => {
      // If we're in the exercise flow (all tab), handle internal navigation
      if (activeTab === "all") {
        if (allViewLevel === "exercise") {
          // Go back to subcategory selection
          resetSubcategoryAnims();
          setAllViewLevel("subcategory");
          setSelectedSubcategory(null);
          setExercisesForSubcategory([]);
          return true; // Prevent default back behavior
        } else if (allViewLevel === "subcategory") {
          // Go back to category selection
          resetSubcategoryAnims();
          resetCategoryAnims();
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
  }, [activeTab, allViewLevel, resetCategoryAnims, resetSubcategoryAnims]);

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

  // Load all public activity types once; avoid re-fetch on tab switch
  useEffect(() => {
    let isCancelled = false;
    const loadAllPublic = async () => {
      setLoading(true);
      setError("");
      try {
        const items = await activityService.getPublicActivityTypes();
        if (!isCancelled) setAllPublicTypes(items);
      } catch (err) {
        if (!isCancelled) setError("Failed to load exercise data");
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };
    loadAllPublic();
    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    if (activeTab !== "all") {
      setAllViewLevel("category");
      setSelectedCategory(null);
      setSelectedSubcategory(null);
      setSubcategoriesForCategory([]);
      setExercisesForSubcategory([]);
    }
  }, [activeTab]);

  const handleFavoriteToggle = useCallback((activityTypeId, isNowFavorite) => {
    setFavoriteActivityTypeIds((prev) => {
      if (isNowFavorite) return [...prev, activityTypeId];
      return prev.filter((id) => id !== activityTypeId);
    });
  }, []);

  // Build a fast lookup for metadata to avoid O(n) scans per item
  const metaIndex = React.useMemo(() => {
    const map = new Map();
    (exerciseMetaData || []).forEach((m) => {
      if (!m || !m.category || !m.subcategory) return;
      map.set(`${m.category}|||${m.subcategory}`, m);
    });
    return map;
  }, [exerciseMetaData]);

  // Favorites derived from all public items
  const favoriteItems = React.useMemo(() => {
    if (!allPublicTypes?.length || !favoriteActivityTypeIds?.length) return [];
    const favoriteSet = new Set(favoriteActivityTypeIds);
    return allPublicTypes.filter((t) => favoriteSet.has(t.id));
  }, [allPublicTypes, favoriteActivityTypeIds]);

  const filteredFavoriteItems = React.useMemo(() => {
    const q = (searchQuery || "").toLowerCase();
    if (!q) return favoriteItems;
    return favoriteItems.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }, [favoriteItems, searchQuery]);

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

  // removed: itemsInSelectedCategory derived from deprecated filteredItems

  // Helper to get effortLevels and terrainTypes from prebuilt index
  const getMetaForItem = (item) => {
    return metaIndex.get(`${item.category}|||${item.name}`) || {};
  };

  // Helper removed: no custom workouts
  const isCustomOrFavoriteCustom = (item) => false;

  // Determine if the current tab is 'custom'
  const isCustomTab = false;

  // Memoized ExerciseItem to reduce rerenders across list updates
  const MemoExerciseItem = React.useMemo(() => React.memo(ExerciseItem), []);

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
                          toValue: 0.92,
                          duration: 120,
                          useNativeDriver: true,
                        }),
                        Animated.timing(categoryAnimRefs[cat].opacity, {
                          toValue: 0.85,
                          duration: 120,
                          useNativeDriver: true,
                        }),
                      ]).start();
                    };

                    const handlePressOut = () => {
                      setPressedCategory(null);
                      Animated.parallel([
                        Animated.timing(categoryAnimRefs[cat].scale, {
                          toValue: 1,
                          duration: 120,
                          useNativeDriver: true,
                        }),
                        Animated.timing(categoryAnimRefs[cat].opacity, {
                          toValue: 1,
                          duration: 120,
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
                            // Ensure current tile is restored before navigating deeper
                            const ref = categoryAnimRefs[cat];
                            if (ref) {
                              if (ref.scale?.stopAnimation)
                                ref.scale.stopAnimation();
                              if (ref.opacity?.stopAnimation)
                                ref.opacity.stopAnimation();
                              if (ref.scale?.setValue) ref.scale.setValue(1);
                              if (ref.opacity?.setValue)
                                ref.opacity.setValue(1);
                            }
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
                            <FloatingSparkles />
                            <View style={styles.categoryIconContainer}>
                              <Icon
                                name={visual.icon}
                                size={20}
                                color={visual.accentColor}
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
                                  "rgba(255, 255, 255, 0.15)",
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

            {activeTab === "all" && allViewLevel === "subcategory" && (
              <>
                <View style={styles.breadcrumbRow}>
                  <TouchableOpacity
                    onPress={() => {
                      resetSubcategoryAnims();
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
                            toValue: 0.95,
                            duration: 100,
                            useNativeDriver: true,
                          }),
                          Animated.timing(subcategoryAnimRefs[name].opacity, {
                            toValue: 0.9,
                            duration: 100,
                            useNativeDriver: true,
                          }),
                        ]).start();
                      };

                      const handlePressOut = () => {
                        setPressedSubcategory(null);
                        Animated.parallel([
                          Animated.timing(subcategoryAnimRefs[name].scale, {
                            toValue: 1,
                            duration: 100,
                            useNativeDriver: true,
                          }),
                          Animated.timing(subcategoryAnimRefs[name].opacity, {
                            toValue: 1,
                            duration: 100,
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
                              // Ensure subcategory tile resets before navigating
                              const ref = subcategoryAnimRefs[name];
                              if (ref) {
                                if (ref.scale?.stopAnimation)
                                  ref.scale.stopAnimation();
                                if (ref.opacity?.stopAnimation)
                                  ref.opacity.stopAnimation();
                                if (ref.scale?.setValue) ref.scale.setValue(1);
                                if (ref.opacity?.setValue)
                                  ref.opacity.setValue(1);
                              }
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
                                  size={20}
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
                                  size={14}
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
                      resetSubcategoryAnims();
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
                {filteredFavoriteItems.map((item, index) => {
                  const meta = getMetaForItem(item);
                  const hideEffortAndDuration = isCustomOrFavoriteCustom(item);
                  const isCustomWorkout = false;
                  return (
                    <MemoExerciseItem
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
    gap: 16,
    marginBottom: 12,
    paddingHorizontal: 0,
    alignItems: "center",
    width: "100%",
  },
  categoryTile: {
    backgroundColor: "transparent",
    borderRadius: 24,
    marginBottom: 12,
    width: "95%",
    height: 80,
    borderWidth: 0,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
      },
      android: { elevation: 8 },
    }),
  },
  categoryIconContainer: {
    position: "absolute",
    top: 10,
    left: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
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
  categoryTileContent: {
    flex: 1,
    paddingLeft: 56,
    paddingRight: 40,
    paddingVertical: 12,
    justifyContent: "center",
  },
  categoryTileText: {
    fontSize: 20,
    fontWeight: "800",
    textAlign: "left",
    letterSpacing: -0.4,
    marginBottom: 4,
    fontFamily: Platform.OS === "ios" ? "System" : "sans-serif",
    color: "#ffffff",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  categoryDescription: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "left",
    opacity: 0.9,
    letterSpacing: 0.2,
    marginTop: 2,
    fontFamily: Platform.OS === "ios" ? "System" : "sans-serif",
    color: "#ffffff",
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
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
    opacity: 0.4,
  },
  categoryArrow: {
    position: "absolute",
    top: "50%",
    right: 16,
    marginTop: -12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
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
  subcategoryTile: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    marginBottom: 12,
    width: "95%",
    height: 60,
    borderWidth: 0,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: { elevation: 4 },
    }),
  },
  subcategoryIconContainer: {
    position: "absolute",
    top: 10,
    left: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
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
  subcategoryTileContent: {
    flex: 1,
    paddingLeft: 56,
    paddingRight: 40,
    paddingVertical: 8,
    justifyContent: "center",
  },
  subcategoryTileText: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: "left",
    letterSpacing: -0.2,
    marginBottom: 6,
    fontFamily: Platform.OS === "ios" ? "System" : "sans-serif-medium",
    color: "#2d3436",
  },
  subcategoryAccentBar: {
    width: "75%",
    height: 3,
    borderRadius: 2,
    overflow: "hidden",
  },
  accentBarGradient: {
    flex: 1,
  },
  subcategoryArrow: {
    position: "absolute",
    top: "50%",
    right: 16,
    marginTop: -12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
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
    borderRadius: 20,
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
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 12,
    padding: 12,
    borderWidth: 0,
    position: "relative",
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
    }),
  },
  exerciseItemContent: {
    flex: 1,
  },
  exerciseHeader: {
    marginBottom: 12,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2d3436",
    marginBottom: 4,
    letterSpacing: -0.2,
    fontFamily: Platform.OS === "ios" ? "System" : "sans-serif",
  },
  exerciseCalories: {
    fontSize: 12,
    fontWeight: "500",
    color: "#636e72",
    letterSpacing: 0.1,
    fontFamily: Platform.OS === "ios" ? "System" : "sans-serif",
  },
  exerciseInputs: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2d3436",
    marginBottom: 6,
    letterSpacing: 0.1,
    fontFamily: Platform.OS === "ios" ? "System" : "sans-serif",
  },
  durationContainer: {
    marginBottom: 12,
  },
  durationStepper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 2,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  stepperButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#ffffff",
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
  durationInput: {
    flex: 1,
    height: 28,
    fontSize: 14,
    fontWeight: "600",
    color: "#2d3436",
    textAlign: "center",
    backgroundColor: "transparent",
    marginHorizontal: 6,
  },
  durationUnit: {
    fontSize: 10,
    fontWeight: "500",
    color: "#636e72",
    marginTop: 4,
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "System" : "sans-serif",
  },
  effortContainer: {
    marginBottom: 12,
  },
  effortDropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  effortDropdownText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2d3436",
    fontFamily: Platform.OS === "ios" ? "System" : "sans-serif",
  },
  terrainContainer: {
    marginBottom: 12,
  },
  terrainDropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  terrainDropdownText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2d3436",
    fontFamily: Platform.OS === "ios" ? "System" : "sans-serif",
  },
  errorText: {
    fontSize: 10,
    fontWeight: "500",
    color: "#e74c3c",
    marginBottom: 12,
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "System" : "sans-serif",
  },
  exerciseActions: {
    alignItems: "stretch",
  },
  addExerciseButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.darkGreen.color,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 6,
    ...Platform.select({
      ios: {
        shadowColor: Colors.darkGreen.color,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
      android: { elevation: 3 },
    }),
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
    letterSpacing: 0.1,
    fontFamily: Platform.OS === "ios" ? "System" : "sans-serif",
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

  heartButtonAbsolute: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 10,
    borderRadius: 16,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#eee",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    width: 28,
    height: 28,
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

  categoryGradientBackground: {
    flex: 1,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  // New styles for floating sparkles
  sparkleContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",
  },
  sparkle: {
    position: "absolute",
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
});

export default TrackExerciseView;
