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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../../constants/Colors";
import { useRouter } from "expo-router";
import { Stack } from "expo-router";
import { activityService } from "@/app/services/activityService";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { useFocusEffect } from "@react-navigation/native";

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

const ExerciseItem = ({
  category,
  subcategory,
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
        effortLevel: newEffort,
        durationInMinutes: newDuration,
        terrainType: newTerrain,
      });
      setCalories({
        caloriesPerMinute: res.caloriesPerMinute,
        caloriesPerHalfHour: res.caloriesPerHalfHour,
        caloriesPerHour: res.caloriesPerHour,
        totalCalories: res.caloriesPerMinute * newDuration,
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
      await activityService.trackExercise({
        category,
        subcategory,
        effortLevel: effort,
        durationInMinutes: duration,
        terrainType: terrainTypes.length > 0 ? terrain : undefined,
        date: selectedDate,
        isPublic: true,
        notes: "",
      });
      Alert.alert("Success", "Exercise tracked successfully!");
      setDuration(30);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Failed to track exercise"
      );
      Alert.alert(
        "Error",
        err?.response?.data?.message ||
          err.message ||
          "Failed to track exercise"
      );
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
            setDate(selectedDate);
            trackExercise(selectedDate);
          }
        },
        maximumDate: new Date(),
      });
    } else {
      setShowIOSPicker(true);
    }
  };

  return (
    <Animated.View style={styles.exerciseItemContainer}>
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
                  <Ionicons name="heart" size={12} color={PARTICLE_COLOR} />
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
          <Ionicons name="heart-outline" size={26} color="#bbb" />
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
          <Ionicons name="heart" size={26} color="#e74c3c" />
        </Animated.View>
      </TouchableOpacity>
      <View style={styles.exerciseItemLeft}>
        <Text style={styles.exerciseName}>{subcategory}</Text>
        <View style={styles.caloriesContainer}>
          <Text style={[styles.calorieText, styles.calTotalText]}>
            <Text style={styles.calorieLabel}>Total:</Text>{" "}
            {loading
              ? "..."
              : isCustomWorkout && typeof customCalories === "number"
              ? customCalories
              : calories.totalCalories?.toFixed(1)}{" "}
            kcal
          </Text>
          {isCustomWorkout && (
            <Text style={[styles.calorieText]}>
              <Text style={styles.calorieLabel}>Duration:</Text> {duration} min
            </Text>
          )}
          <Text style={[styles.calorieText]}>
            <Text style={styles.calorieLabel}>Length:</Text> (coming soon)
          </Text>
        </View>
        {error ? (
          <Text style={{ color: "red", fontSize: 12 }}>{error}</Text>
        ) : null}
        <View
          style={{
            flexDirection: "row",
            gap: 10,
            marginTop: 10,
            flexWrap: "nowrap", // Prevent wrapping
            alignItems: "center", // Align vertically
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
                <MaterialIcons
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
                <MaterialIcons
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
          <Ionicons
            name="add-circle"
            size={28}
            color={Colors.darkGreen.color}
          />
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
                minWidth: 250,
                elevation: 5,
              }}
            >
              <Text
                style={{ fontSize: 16, fontWeight: "600", marginBottom: 10 }}
              >
                Select Date
              </Text>
              <View style={{ alignItems: "center" }}>
                <DateTimePickerAndroid
                  value={date}
                  mode="date"
                  display="spinner"
                  onChange={(event, selectedDate) => {
                    if (event.type === "set" && selectedDate) {
                      setDate(selectedDate);
                      setShowIOSPicker(false);
                      trackExercise(selectedDate);
                    } else if (event.type === "dismissed") {
                      setShowIOSPicker(false);
                    }
                  }}
                  maximumDate={new Date()}
                  style={{ width: 250 }}
                />
              </View>
              <TouchableOpacity
                style={{ marginTop: 16, alignSelf: "flex-end" }}
                onPress={() => setShowIOSPicker(false)}
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
  const [exerciseMetaData, setExerciseMetaData] = useState([]); // NEW

  useEffect(() => {
    const fetchMetaData = async () => {
      try {
        const meta = await activityService.getExerciseMetaData();
        setExerciseMetaData(meta);
      } catch (err) {
        // ignore for now
      }
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
        } else if (activeTab === "custom") {
          items = await activityService.getUserCustomActivityTypes();
        } else if (activeTab === "favorites") {
          // For favorites, fetch all public and custom, then filter by favorite ids
          const [publicTypes, customTypes] = await Promise.all([
            activityService.getPublicActivityTypes(),
            activityService.getUserCustomActivityTypes(),
          ]);
          items = [...publicTypes, ...customTypes].filter((t) =>
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

  // Helper to get effortLevels and terrainTypes from meta
  const getMetaForItem = (item) => {
    return (
      exerciseMetaData.find(
        (meta) =>
          meta.category === item.category && meta.subcategory === item.name
      ) || {}
    );
  };

  // Helper to determine if an item is a custom workout in the current tab
  const isCustomOrFavoriteCustom = (item) => {
    // In 'custom' tab, all are custom
    if (activeTab === "custom") return true;
    // In 'favorites' tab, check if item is custom (not public)
    if (activeTab === "favorites" && item.isPublic === false) return true;
    return false;
  };

  // Determine if the current tab is 'custom'
  const isCustomTab = activeTab === "custom";

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
            <MaterialIcons
              name="arrow-back"
              size={36}
              color={Colors.darkGreen.color}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Ionicons
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
                <Ionicons name="close-circle" size={24} color="#666" />
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
          <TouchableOpacity
            style={[styles.tab, activeTab === "custom" && styles.activeTab]}
            onPress={() => setActiveTab("custom")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "custom" && styles.activeTabText,
              ]}
            >
              Custom
            </Text>
          </TouchableOpacity>
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
            {filteredItems.map((item, index) => {
              const meta = getMetaForItem(item);
              const hideEffortAndDuration = isCustomOrFavoriteCustom(item);
              return (
                <ExerciseItem
                  key={item.id || index}
                  category={item.category}
                  subcategory={item.name}
                  activityTypeId={item.id}
                  favoriteActivityTypeIds={favoriteActivityTypeIds}
                  onFavoriteToggle={handleFavoriteToggle}
                  effortLevels={meta.effortLevels || []}
                  terrainTypes={meta.terrainTypes || []}
                  hideEffortAndDuration={hideEffortAndDuration}
                  isCustomWorkout={hideEffortAndDuration}
                  customCalories={item.calories}
                />
              );
            })}
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
    paddingBottom: 20,
  },
  exerciseItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 12,
    padding: 15,
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
  exerciseItemLeft: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  caloriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  calorieText: {
    fontSize: 14,
    color: "#666",
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
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
});

export default TrackExerciseView;
