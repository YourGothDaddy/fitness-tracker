import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from "react";
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
  Modal,
  Pressable,
  TouchableWithoutFeedback,
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
  getAllCustomConsumableItems,
} from "@/app/services/foodService";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";

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

const LogFoodModal = ({ visible, food, onClose, onLogFood }) => {
  const [grams, setGrams] = useState("100");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLogging, setIsLogging] = useState(false);

  useEffect(() => {
    if (visible) {
      setGrams("100");
      setSelectedDate(new Date());
      setIsLogging(false);
    }
  }, [visible]);

  const showDatePickerModal = useCallback(() => {
    try {
      DateTimePickerAndroid.open({
        value: selectedDate,
        mode: "date",
        is24Hour: true,
        onChange: (event, date) => {
          if (event.type === "set" && date) {
            date.setHours(0, 0, 0, 0);
            setSelectedDate(date);
          }
        },
        maximumDate: new Date(),
      });
    } catch (error) {
      console.error("DatePicker error:", error);
      Alert.alert("Error", "Failed to open date picker. Please try again.");
    }
  }, [selectedDate]);

  const handleLogFood = async () => {
    const gramsValue = parseFloat(grams);
    if (!gramsValue || gramsValue <= 0) {
      Alert.alert("Error", "Please enter a valid amount of grams.");
      return;
    }

    setIsLogging(true);

    try {
      const multiplier = gramsValue / 100;
      const mealData = {
        name: food.name,
        calories: Math.round(food.caloriesPer100g * multiplier),
        protein: Math.round(food.proteinPer100g * multiplier * 10) / 10,
        carbs: Math.round(food.carbohydratePer100g * multiplier * 10) / 10,
        fat: Math.round(food.fatPer100g * multiplier * 10) / 10,
        date: selectedDate,
        mealOfTheDay: 0,
      };

      await onLogFood(mealData);
      onClose();
      setGrams("100");
      setSelectedDate(new Date());
    } catch (error) {
      console.error("Error logging food:", error);
    } finally {
      setIsLogging(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  if (!food) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Pressable style={styles.modalBackdrop} onPress={onClose} />
        <View style={[styles.modalContent, { flexDirection: "column" }]}>
          <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
            <Icon name="close" size={24} color="#666" />
          </TouchableOpacity>
          <View style={styles.modalHandle} />

          <View style={styles.modalBody}>
            <ScrollView
              style={styles.modalScrollView}
              showsVerticalScrollIndicator={true}
              contentContainerStyle={styles.modalScrollContentContainer}
              nestedScrollEnabled={true}
              scrollEnabled={true}
              bounces={false}
              alwaysBounceVertical={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.foodInfoContainer}>
                <Text style={styles.modalFoodName}>{food.name}</Text>
                <Text style={styles.modalFoodSubtitle}>
                  {food.subTitle || food.SubTitle || food.subtitle || ""}
                </Text>
                <View style={styles.per100gBadge}>
                  <Text style={styles.per100gBadgeText}>Per 100g</Text>
                </View>

                <View style={styles.macrosGrid}>
                  <View style={[styles.macroItem, styles.macroItemCalories]}>
                    <Text style={styles.macroLabel}>Calories</Text>
                    <Text style={styles.macroValue}>
                      {food.caloriesPer100g} kcal
                    </Text>
                  </View>
                  <View style={[styles.macroItem, styles.macroItemProtein]}>
                    <Text style={styles.macroLabel}>Protein</Text>
                    <Text style={styles.macroValue}>
                      {food.proteinPer100g} g
                    </Text>
                  </View>
                  <View style={[styles.macroItem, styles.macroItemCarbs]}>
                    <Text style={styles.macroLabel}>Carbs</Text>
                    <Text style={styles.macroValue}>
                      {food.carbohydratePer100g} g
                    </Text>
                  </View>
                  <View style={[styles.macroItem, styles.macroItemFat]}>
                    <Text style={styles.macroLabel}>Fat</Text>
                    <Text style={styles.macroValue}>{food.fatPer100g} g</Text>
                  </View>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Amount (grams)</Text>
                <View style={styles.inputWithUnit}>
                  <TextInput
                    style={[styles.textInput, styles.textInputElevated]}
                    value={grams}
                    onChangeText={setGrams}
                    placeholder="Enter grams consumed"
                    keyboardType="numeric"
                    placeholderTextColor="#999"
                  />
                  <View style={styles.unitBadge}>
                    <Text style={styles.unitBadgeText}>g</Text>
                  </View>
                </View>
                {grams && parseFloat(grams) > 0 && (
                  <View style={styles.previewContainer}>
                    <Text style={styles.previewTitle}>Preview:</Text>
                    <View style={styles.previewMacros}>
                      <Text style={styles.previewText}>
                        Calories:{" "}
                        {Math.round(
                          (food.caloriesPer100g * parseFloat(grams)) / 100
                        )}{" "}
                        kcal
                      </Text>
                      <Text style={styles.previewText}>
                        Protein:{" "}
                        {Math.round(
                          ((food.proteinPer100g * parseFloat(grams)) / 100) * 10
                        ) / 10}
                        g
                      </Text>
                      <Text style={styles.previewText}>
                        Carbs:{" "}
                        {Math.round(
                          ((food.carbohydratePer100g * parseFloat(grams)) /
                            100) *
                            10
                        ) / 10}
                        g
                      </Text>
                      <Text style={styles.previewText}>
                        Fat:{" "}
                        {Math.round(
                          ((food.fatPer100g * parseFloat(grams)) / 100) * 10
                        ) / 10}
                        g
                      </Text>
                    </View>
                  </View>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Date</Text>
                <TouchableOpacity
                  style={styles.badgeContainer}
                  onPress={showDatePickerModal}
                  activeOpacity={0.8}
                >
                  <Text style={styles.badgeText}>
                    {formatDate(selectedDate)}
                  </Text>
                  <Icon
                    name="calendar-today"
                    size={20}
                    color="#619819"
                    style={{ marginLeft: 2 }}
                  />
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.logButton, isLogging && styles.logButtonDisabled]}
              onPress={handleLogFood}
              disabled={isLogging}
            >
              {isLogging ? (
                <ActivityIndicator size="small" color={Colors.white.color} />
              ) : (
                <Text style={styles.logButtonText}>Log Food</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const TrackMealView = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [foods, setFoods] = useState([]);
  const [filteredFoods, setFilteredFoods] = useState([]);
  const [favoriteConsumableIds, setFavoriteConsumableIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [favoritesPage, setFavoritesPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(5);
  const [favoritesTotalPages, setFavoritesTotalPages] = useState(1);
  const [logFoodModalVisible, setLogFoodModalVisible] = useState(false);
  const [foodToLog, setFoodToLog] = useState(null);

  // Refs for request deduplication and cleanup
  const requestIdRef = useRef(0);
  const searchTimeoutRef = useRef(null);

  // Debounce search query changes
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Separate function to fetch only favorites (called once on mount)
  const fetchFavorites = useCallback(async () => {
    try {
      const favoriteItems = await getFavoriteConsumables();
      setFavoriteConsumableIds(favoriteItems.map((f) => f.id));
    } catch (err) {
      console.error("[TrackMealView] Failed to fetch favorite IDs:", err);
    }
  }, []);

  // Optimized fetchFoods without favorites fetching
  const fetchFoods = useCallback(
    async (requestId) => {
      try {
        setLoading(true);
        setError(null);

        const filter =
          activeTab === "all"
            ? "All"
            : activeTab === "favorites"
            ? "Favorites"
            : activeTab === "custom"
            ? "Custom"
            : "All";

        const query = debouncedSearchQuery || "";

        const searchResult = await searchConsumableItems(
          query,
          currentPage,
          pageSize,
          filter
        );

        // Check if this request is still the latest one
        if (requestId !== requestIdRef.current) {
          return;
        }

        if (!searchResult.items) {
          console.warn(
            "[TrackMealView] No items array in search result:",
            searchResult
          );
          throw new Error("Invalid response format from server");
        }

        setFoods(searchResult.items);
        setFilteredFoods(searchResult.items);
        setTotalPages(
          Math.max(1, Math.ceil(searchResult.totalCount / pageSize))
        );

        if (activeTab === "favorites") {
          setFavoritesTotalPages(
            Math.max(1, Math.ceil(searchResult.totalCount / pageSize))
          );
        }
      } catch (err) {
        // Only set error if this is still the latest request
        if (requestId === requestIdRef.current) {
          console.error("[TrackMealView] Error in fetchFoods:", {
            error: err,
            message: err.message,
            activeTab,
            searchQuery: debouncedSearchQuery,
          });

          let errorMessage = "Failed to load foods. Please try again.";

          if (err.message.includes("Authentication required")) {
            errorMessage = "Please log in to view foods.";
          } else if (err.message.includes("No response from server")) {
            errorMessage =
              "Cannot connect to server. Please check your internet connection.";
          } else if (err.response?.data?.message) {
            errorMessage = err.response.data.message;
          } else if (err.message) {
            errorMessage = err.message;
          }

          if (activeTab === "custom" && err.response?.status === 404) {
            errorMessage = "No custom foods found. Try adding some first!";
          }

          setError(errorMessage);
        }
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    },
    [activeTab, currentPage, pageSize, debouncedSearchQuery]
  );

  // Fetch favorites only once on component mount
  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  // Main effect for fetching foods - consolidated from multiple useEffects
  useEffect(() => {
    requestIdRef.current += 1;
    const currentRequestId = requestIdRef.current;

    fetchFoods(currentRequestId);
  }, [fetchFoods]);

  // Reset pages when tab changes
  useEffect(() => {
    setCurrentPage(1);
    setFavoritesPage(1);
  }, [activeTab]);

  // Handle favorites pagination (client-side for now)
  useEffect(() => {
    if (activeTab === "favorites") {
      const start = (favoritesPage - 1) * pageSize;
      const end = start + pageSize;
      setFilteredFoods(foods.slice(start, end));
    }
  }, [favoritesPage, foods, activeTab, pageSize]);

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
    setFoodToLog(food);
    setLogFoodModalVisible(true);
  };

  const handleLogFood = async (mealData) => {
    try {
      await mealService.addMeal(mealData);
      Alert.alert("Success", "Meal logged successfully!");
      setLogFoodModalVisible(false);
      setFoodToLog(null);
    } catch (err) {
      Alert.alert("Error", "Failed to log meal. Please try again.");
      console.error("Error logging meal:", err);
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
      <LogFoodModal
        visible={logFoodModalVisible}
        food={foodToLog}
        onClose={() => setLogFoodModalVisible(false)}
        onLogFood={handleLogFood}
      />
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
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    position: "relative",
  },
  modalBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    width: "90%",
    height: "95%",
    backgroundColor: Colors.white.color,
    borderRadius: 15,
    marginVertical: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    overflow: "hidden",
  },
  modalHandle: {
    alignSelf: "center",
    width: 48,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#e5e5e5",
    marginTop: 6,
    marginBottom: 2,
  },
  // header removed; close button is absolute to save space
  modalTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.darkGreen.color,
  },
  closeButton: {
    padding: 5,
  },
  modalCloseButton: {
    position: "absolute",
    right: 10,
    top: 10,
    zIndex: 20,
    padding: 6,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  foodInfoContainer: {
    alignItems: "center",
    marginBottom: 20,
    width: "100%",
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  // foodAvatar removed in headerless design
  modalFoodName: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.darkGreen.color,
    marginBottom: 4,
    textAlign: "center",
  },
  modalFoodSubtitle: {
    fontSize: 13,
    color: "#8a8a8a",
    marginBottom: 10,
    fontWeight: "500",
    textAlign: "center",
  },
  per100gBadge: {
    alignSelf: "center",
    backgroundColor: "#f7faf3",
    borderWidth: 1,
    borderColor: "#e2efd4",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 8,
  },
  per100gBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.darkGreen.color,
    letterSpacing: 0.2,
  },
  macrosGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "100%",
  },
  macroItem: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 8,
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    paddingVertical: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  macroItemCalories: {
    borderColor: "#FFE0B2",
    backgroundColor: "#FFF9F0",
  },
  macroItemProtein: {
    borderColor: "#C8E6C9",
    backgroundColor: "#F4FBF4",
  },
  macroItemCarbs: {
    borderColor: "#BBDEFB",
    backgroundColor: "#F6FAFF",
  },
  macroItemFat: {
    borderColor: "#F8BBD0",
    backgroundColor: "#FFF5F9",
  },
  // icon badges removed; rely on colored card accents instead
  macroLabel: {
    fontSize: 12,
    color: "#777",
    marginBottom: 2,
    fontWeight: "600",
  },
  macroValue: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.darkGreen.color,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  inputWithUnit: {
    position: "relative",
    justifyContent: "center",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 18,
    color: "#333",
    backgroundColor: "#f9f9f9",
  },
  textInputElevated: {
    backgroundColor: "#fff",
    borderColor: "#e9e9e9",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  unitBadge: {
    position: "absolute",
    right: 10,
    top: 10,
    backgroundColor: "#f2f6ec",
    borderWidth: 1,
    borderColor: "#e0ecd3",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  unitBadgeText: {
    color: Colors.darkGreen.color,
    fontWeight: "700",
    fontSize: 12,
  },
  badgeContainer: {
    backgroundColor: "rgba(97, 152, 25, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#619819",
  },
  modalBody: {
    flex: 1,
    width: "100%",
    minHeight: 0,
    backgroundColor: "#fafafa",
  },
  modalScrollView: {
    flex: 1,
    width: "100%",
    backgroundColor: "transparent",
  },
  modalScrollContentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#fff",
  },
  cancelButton: {
    backgroundColor: "#f3f3f3",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e9e9e9",
    width: "48%",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    color: "#333",
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
  },
  logButton: {
    backgroundColor: Colors.darkGreen.color,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    width: "48%",
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: Colors.darkGreen.color,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  logButtonText: {
    color: Colors.white.color,
    fontSize: 15,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: 0.3,
  },
  logButtonDisabled: {
    backgroundColor: "#ccc",
  },
  previewContainer: {
    marginTop: 10,
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eaeaea",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  previewTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: Colors.darkGreen.color,
    marginBottom: 6,
  },
  previewMacros: {
    gap: 4,
  },
  previewText: {
    fontSize: 12,
    color: "#666",
  },
});

export default TrackMealView;
