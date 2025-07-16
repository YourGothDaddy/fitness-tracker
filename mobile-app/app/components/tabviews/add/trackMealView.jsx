import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Animated,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../../constants/Colors";
import { useRouter } from "expo-router";
import { Stack } from "expo-router";
import { mealService } from "@/app/services/mealService";
import {
  getAllPublicConsumableItems,
  addFavoriteConsumable,
  removeFavoriteConsumable,
  isFavoriteConsumable,
  getFavoriteConsumables,
} from "@/app/services/foodService";

const FoodItem = ({
  name,
  calories,
  protein,
  carbs,
  fat,
  onAdd,
  consumableItemId,
  favoriteConsumableIds = [],
  onFavoriteToggle,
}) => {
  // Heart animation state and logic (copied from trackExerciseView.jsx, local only)
  const [isFavorite, setIsFavorite] = React.useState(
    favoriteConsumableIds.includes(consumableItemId)
  );
  const heartAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const rotateAnim = React.useRef(new Animated.Value(0)).current;
  const PARTICLE_COUNT = 10;
  const PARTICLE_COLOR = "#e74c3c";
  const [showParticles, setShowParticles] = React.useState(false);
  const [particleConfigs, setParticleConfigs] = React.useState(() =>
    Array.from({ length: PARTICLE_COUNT }, () => {
      const angle = Math.random() * 2 * Math.PI;
      const distance = 14 + Math.random() * 16;
      const rotation = Math.random() * 60 - 30;
      return { angle, distance, rotation };
    })
  );
  const particleAnims = React.useRef(
    Array.from({ length: PARTICLE_COUNT }, () => ({
      scale: new Animated.Value(0),
      opacity: new Animated.Value(1),
    }))
  ).current;

  React.useEffect(() => {
    setIsFavorite(favoriteConsumableIds.includes(consumableItemId));
  }, [favoriteConsumableIds, consumableItemId]);

  React.useEffect(() => {
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
      // Particle explosion
      setParticleConfigs(
        Array.from({ length: PARTICLE_COUNT }, () => {
          const angle = Math.random() * 2 * Math.PI;
          const distance = 14 + Math.random() * 16;
          const rotation = Math.random() * 60 - 30;
          return { angle, distance, rotation };
        })
      );
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

  const handleFavoritePress = async () => {
    try {
      if (isFavorite) {
        await removeFavoriteConsumable(consumableItemId);
        setIsFavorite(false);
        onFavoriteToggle && onFavoriteToggle(consumableItemId, false);
      } else {
        await addFavoriteConsumable(consumableItemId);
        setIsFavorite(true);
        onFavoriteToggle && onFavoriteToggle(consumableItemId, true);
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

  return (
    <Animated.View style={styles.foodItemContainer}>
      {/* Heart button in upper right corner */}
      <TouchableOpacity
        style={styles.heartButtonAbsolute}
        onPress={handleFavoritePress}
        activeOpacity={0.7}
      >
        {/* Particle explosion */}
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
        {/* Outline heart (gray), fades out as red heart fades in */}
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
        {/* Filled heart (red), opacity, scale, and rotation animated, always above outline */}
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
      <View style={styles.foodItemLeft}>
        <Text style={styles.foodName}>{name}</Text>
        <View style={styles.macrosContainer}>
          <Text style={[styles.macroText, styles.caloriesText]}>
            <Text style={styles.macroLabel}>Calories:</Text> {calories}kcal
          </Text>
          <Text style={[styles.macroText, styles.proteinText]}>
            <Text style={styles.macroLabel}>Protein:</Text> {protein}g
          </Text>
          <Text style={[styles.macroText, styles.carbsText]}>
            <Text style={styles.macroLabel}>Carbs:</Text> {carbs}g
          </Text>
          <Text style={[styles.macroText, styles.fatText]}>
            <Text style={styles.macroLabel}>Fat:</Text> {fat}g
          </Text>
        </View>
      </View>
      <TouchableOpacity style={styles.addFoodButton} onPress={onAdd}>
        <Ionicons name="add-circle" size={28} color={Colors.darkGreen.color} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const TrackMealView = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [foods, setFoods] = useState([]);
  const [filteredFoods, setFilteredFoods] = useState([]);
  const [favoriteConsumableIds, setFavoriteConsumableIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFoods = useCallback(async () => {
    try {
      setLoading(true);
      const [data, favorites] = await Promise.all([
        getAllPublicConsumableItems(),
        getFavoriteConsumables(),
      ]);
      setFoods(data);
      setFavoriteConsumableIds(favorites.map((f) => f.id));
      setFilteredFoods(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching foods:", err);
      setError("Failed to load foods. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFoods();
  }, [fetchFoods]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredFoods(foods);
    } else {
      const filtered = foods.filter((food) =>
        food.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredFoods(filtered);
    }
  }, [searchQuery, foods]);

  const handleFavoriteToggle = (consumableItemId, isNowFavorite) => {
    setFavoriteConsumableIds((prev) => {
      if (isNowFavorite) return [...prev, consumableItemId];
      return prev.filter((id) => id !== consumableItemId);
    });
  };

  // Filter for favorites tab
  const displayedFoods = filteredFoods.filter((food) => {
    if (activeTab === "favorites") {
      return favoriteConsumableIds.includes(food.id);
    }
    return true;
  });

  const handleAddMeal = async (food) => {
    try {
      const now = new Date();
      await mealService.addMeal({
        name: food.name,
        calories: food.caloriesPer100g,
        protein: food.proteinPer100g,
        carbs: food.carbohydratePer100g,
        fat: food.fatPer100g,
        date: now,
        mealOfTheDay: 0, // Default to breakfast, can be changed later
      });
      Alert.alert("Success", "Meal added successfully!");
    } catch (err) {
      console.error("Error adding meal:", err);
      Alert.alert("Error", "Failed to add meal. Please try again.");
    }
  };

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

        {/* Search Section */}
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
              placeholder="Search foods..."
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

        {/* Tabs Section */}
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
            style={[styles.tab, activeTab === "common" && styles.activeTab]}
            onPress={() => setActiveTab("common")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "common" && styles.activeTabText,
              ]}
            >
              Common
            </Text>
          </TouchableOpacity>
        </View>

        {/* Foods List */}
        <ScrollView
          style={styles.foodsList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.foodsListContent}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.darkGreen.color} />
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={fetchFoods}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : displayedFoods.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No foods found</Text>
            </View>
          ) : (
            displayedFoods.map((food) => (
              <FoodItem
                key={food.id}
                name={food.name}
                calories={food.caloriesPer100g}
                protein={food.proteinPer100g}
                carbs={food.carbohydratePer100g}
                fat={food.fatPer100g}
                onAdd={() => handleAddMeal(food)}
                consumableItemId={food.id}
                favoriteConsumableIds={favoriteConsumableIds}
                onFavoriteToggle={handleFavoriteToggle}
              />
            ))
          )}
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
  foodsList: {
    flex: 1,
  },
  foodsListContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  foodItemContainer: {
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
  foodItemLeft: {
    flex: 1,
  },
  foodName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  macrosContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  macroText: {
    fontSize: 14,
    color: "#666",
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  addFoodButton: {
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  errorText: {
    color: "#666",
    fontSize: 16,
    marginBottom: 10,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: Colors.darkGreen.color,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: Colors.white.color,
    fontSize: 16,
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  emptyText: {
    color: "#666",
    fontSize: 16,
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
  macroLabel: {
    fontWeight: "bold",
  },
  caloriesText: {
    backgroundColor: "#FFF4E0", // soft orange/yellow
    color: "#E67E22", // readable orange
    borderColor: "#FFE0B2",
    borderWidth: 1,
  },
  proteinText: {
    backgroundColor: "#E8F5E9", // soft green
    color: "#388E3C", // readable green
    borderColor: "#C8E6C9",
    borderWidth: 1,
  },
  carbsText: {
    backgroundColor: "#E3F2FD", // soft blue
    color: "#1976D2", // readable blue
    borderColor: "#BBDEFB",
    borderWidth: 1,
  },
  fatText: {
    backgroundColor: "#FCE4EC", // soft pink
    color: "#D81B60", // readable pink
    borderColor: "#F8BBD0",
    borderWidth: 1,
  },
});

export default TrackMealView;
