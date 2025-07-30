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
import Icon from "../../../../components/Icon";
import { Colors } from "../../../../constants/Colors";
import { useRouter } from "expo-router";
import { Stack } from "expo-router";
import { mealService } from "@/app/services/mealService";
import {
  addFavoriteConsumable,
  removeFavoriteConsumable,
  getFavoriteConsumables,
  searchConsumableItems,
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
  disableAnimations = false, // Add this prop
}) => {
  // Heart animation state and logic (copied from trackExerciseView.jsx, local only)
  const [isFavorite, setIsFavorite] = React.useState(
    favoriteConsumableIds.includes(consumableItemId)
  );
  const heartAnim = React.useRef(
    new Animated.Value(favoriteConsumableIds.includes(consumableItemId) ? 1 : 0)
  ).current;
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

  // Cleanup function for animations
  const cleanupAnimations = React.useCallback(() => {
    heartAnim.stopAnimation();
    scaleAnim.stopAnimation();
    rotateAnim.stopAnimation();
    particleAnims.forEach((anim) => {
      anim.scale.stopAnimation();
      anim.opacity.stopAnimation();
    });
  }, [heartAnim, scaleAnim, rotateAnim, particleAnims]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      cleanupAnimations();
    };
  }, [cleanupAnimations]);

  React.useEffect(() => {
    const wasFavorite = isFavorite;
    const newIsFavorite = favoriteConsumableIds.includes(consumableItemId);

    if (wasFavorite !== newIsFavorite) {
      setIsFavorite(newIsFavorite);
    }

    // Initialize heart animation value based on favorite status
    if (disableAnimations) {
      heartAnim.setValue(newIsFavorite ? 1 : 0);
    }
  }, [favoriteConsumableIds, consumableItemId, disableAnimations, heartAnim]);

  // Only run animations if not disabled
  React.useEffect(() => {
    if (disableAnimations) {
      // Set static values without animations
      heartAnim.setValue(isFavorite ? 1 : 0);
      scaleAnim.setValue(1);
      rotateAnim.setValue(0);
      return;
    }

    if (isFavorite) {
      // Stop any ongoing animations first
      cleanupAnimations();

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
      // Stop any ongoing animations first
      cleanupAnimations();

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
  }, [
    isFavorite,
    heartAnim,
    scaleAnim,
    rotateAnim,
    particleAnims,
    cleanupAnimations,
    disableAnimations,
  ]);

  const handleFavoritePress = React.useCallback(async () => {
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
  }, [isFavorite, consumableItemId, onFavoriteToggle]);

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
        {/* Particle explosion - only show if animations are enabled */}
        {!disableAnimations && showParticles && (
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
          <Icon name="heart-outline" size={26} color="#bbb" />
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
          <Icon name="heart" size={26} color="#e74c3c" />
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
        <Icon name="add-circle" size={28} color={Colors.darkGreen.color} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  // Helper to generate page numbers for best UX
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(
          1,
          "...",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        );
      } else {
        pages.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages
        );
      }
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <View style={styles.paginationContainer}>
      {/* Left Arrow */}
      <TouchableOpacity
        style={styles.arrowButton}
        onPress={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
      >
        <Icon
          name="chevron-back"
          size={24}
          color={currentPage === 1 ? "#ccc" : Colors.darkGreen.color}
        />
      </TouchableOpacity>
      {/* Dynamic Page Buttons */}
      {pageNumbers.map((page, idx) =>
        page === "..." ? (
          <Text key={"ellipsis-" + idx} style={styles.ellipsis}>
            ...
          </Text>
        ) : (
          <TouchableOpacity
            key={page}
            style={[
              styles.pageButton,
              currentPage === page && styles.activePageButton,
            ]}
            onPress={() => onPageChange(page)}
            disabled={currentPage === page}
          >
            <Text
              style={[
                styles.pageButtonText,
                currentPage === page && styles.activePageButtonText,
              ]}
            >
              {page}
            </Text>
          </TouchableOpacity>
        )
      )}
      {/* Right Arrow */}
      <TouchableOpacity
        style={styles.arrowButton}
        onPress={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
      >
        <Icon
          name="chevron-forward"
          size={24}
          color={currentPage === totalPages ? "#ccc" : Colors.darkGreen.color}
        />
      </TouchableOpacity>
    </View>
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
  const [customFoods, setCustomFoods] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [favoritesPage, setFavoritesPage] = useState(1);
  const [pageSize] = useState(20); // You can adjust this as needed
  const [totalPages, setTotalPages] = useState(5); // For 'all' tab
  const [favoritesTotalPages, setFavoritesTotalPages] = useState(1); // For 'favorites' tab

  const fetchFoods = useCallback(async () => {
    console.log("[TrackMealView] Starting fetchFoods:", {
      activeTab,
      currentPage,
      pageSize,
      searchQuery,
    });

    try {
      setLoading(true);
      setError(null);

      // Always fetch favorite IDs regardless of tab
      console.log("[TrackMealView] Fetching favorite items");
      const favoriteItems = await getFavoriteConsumables();
      console.log(
        `[TrackMealView] Received ${favoriteItems.length} favorite items`
      );
      setFavoriteConsumableIds(favoriteItems.map((f) => f.id));

      // Use the new search endpoint for all cases
      const filter =
        activeTab === "all"
          ? "All"
          : activeTab === "favorites"
          ? "Favorites"
          : activeTab === "custom"
          ? "Custom"
          : "All";

      // Ensure searchQuery is never undefined
      const query = searchQuery || "";

      console.log("[TrackMealView] Executing search:", {
        filter,
        query,
        currentPage,
        pageSize,
      });

      const searchResult = await searchConsumableItems(
        query,
        currentPage,
        pageSize,
        filter
      );

      console.log("[TrackMealView] Search completed:", {
        itemsReceived: searchResult.items?.length || 0,
        totalCount: searchResult.totalCount,
        currentPage: searchResult.pageNumber,
      });

      if (!searchResult.items) {
        console.warn(
          "[TrackMealView] No items array in search result:",
          searchResult
        );
        throw new Error("Invalid response format from server");
      }

      setFoods(searchResult.items);
      setFilteredFoods(searchResult.items);
      setTotalPages(Math.max(1, Math.ceil(searchResult.totalCount / pageSize)));

      if (activeTab === "favorites") {
        setFavoritesTotalPages(
          Math.max(1, Math.ceil(searchResult.totalCount / pageSize))
        );
      }
    } catch (err) {
      console.error("[TrackMealView] Error in fetchFoods:", {
        error: err,
        message: err.message,
        stack: err.stack,
        activeTab,
        searchQuery,
      });

      let errorMessage = "Failed to load foods. Please try again.";

      if (err.message.includes("Authentication required")) {
        errorMessage = "Please log in to view foods.";
      } else if (err.message.includes("No response from server")) {
        errorMessage =
          "Cannot connect to server. Please check your internet connection.";
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
      console.log("[TrackMealView] fetchFoods completed");
    }
  }, [activeTab, currentPage, pageSize, searchQuery]);

  const fetchCustomFoods = useCallback(async () => {
    try {
      setLoading(true);

      // Always fetch favorite IDs regardless of tab
      const favoriteItems = await getFavoriteConsumables();
      setFavoriteConsumableIds(favoriteItems.map((f) => f.id));

      const data = await getAllCustomConsumableItems();
      setCustomFoods(data);
      setError(null);
    } catch (err) {
      setError("Failed to load custom foods. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch favorite IDs on component mount
  useEffect(() => {
    const fetchFavoriteIds = async () => {
      try {
        const favoriteItems = await getFavoriteConsumables();
        setFavoriteConsumableIds(favoriteItems.map((f) => f.id));
      } catch (err) {
        console.error("Failed to fetch favorite IDs:", err);
      }
    };

    fetchFavoriteIds();
  }, []);

  useEffect(() => {
    if (activeTab === "custom") {
      fetchCustomFoods();
    } else {
      fetchFoods();
    }
  }, [activeTab, fetchFoods, fetchCustomFoods]);

  // When page changes, fetch new foods (only for 'all' tab)
  useEffect(() => {
    if (activeTab === "all") {
      fetchFoods();
    }
  }, [currentPage, activeTab, fetchFoods]);

  // When favorites page changes, update displayed foods
  useEffect(() => {
    if (activeTab === "favorites") {
      // No need to refetch, just update displayed foods
      const start = (favoritesPage - 1) * pageSize;
      const end = start + pageSize;
      setFilteredFoods(foods.slice(start, end));
    }
  }, [favoritesPage, foods, activeTab, pageSize]);

  // When tab changes, reset page to 1
  useEffect(() => {
    setCurrentPage(1);
    setFavoritesPage(1);
  }, [activeTab]);

  // Search is now handled by the server
  useEffect(() => {
    fetchFoods();
  }, [searchQuery, fetchFoods]);

  const handleFavoriteToggle = (consumableItemId, isNowFavorite) => {
    setFavoriteConsumableIds((prev) => {
      if (isNowFavorite) {
        // Add to favorites if not already present
        return prev.includes(consumableItemId)
          ? prev
          : [...prev, consumableItemId];
      } else {
        // Remove from favorites
        return prev.filter((id) => id !== consumableItemId);
      }
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
      Alert.alert("Error", "Failed to add meal. Please try again.");
    }
  };

  // Pagination controls logic
  const paginationProps =
    activeTab === "all"
      ? {
          currentPage,
          totalPages,
          onPageChange: setCurrentPage,
        }
      : activeTab === "favorites"
      ? {
          currentPage: favoritesPage,
          totalPages: favoritesTotalPages,
          onPageChange: setFavoritesPage,
        }
      : null;

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

        {/* Search Section */}
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
                <Icon name="close-circle" size={24} color="#666" />
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
                key={`${food.id}-${currentPage}-${activeTab}`}
                name={food.name}
                calories={food.caloriesPer100g}
                protein={food.proteinPer100g}
                carbs={food.carbohydratePer100g}
                fat={food.fatPer100g}
                onAdd={() => handleAddMeal(food)}
                consumableItemId={food.id}
                favoriteConsumableIds={favoriteConsumableIds}
                onFavoriteToggle={handleFavoriteToggle}
                disableAnimations={activeTab !== "all"}
              />
            ))
          )}
        </ScrollView>
        {/* Pagination below the list */}
        {(activeTab === "all" || activeTab === "favorites") && (
          <Pagination {...paginationProps} />
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
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 16,
    gap: 4,
  },
  arrowButton: {
    padding: 8,
  },
  pageButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#f5f5f5",
    marginHorizontal: 2,
  },
  activePageButton: {
    backgroundColor: Colors.darkGreen.color,
  },
  pageButtonText: {
    color: "#666",
    fontSize: 16,
  },
  activePageButtonText: {
    color: Colors.white.color,
    fontWeight: "bold",
  },
  ellipsis: {
    color: "#888",
    fontSize: 18,
    marginHorizontal: 4,
    paddingHorizontal: 2,
  },
});

export default TrackMealView;
