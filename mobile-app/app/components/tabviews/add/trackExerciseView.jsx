import React, { useState, useEffect } from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../../constants/Colors";
import { useRouter } from "expo-router";
import { Stack } from "expo-router";
import { activityService } from "@/app/services/activityService";

const ExerciseItem = ({
  category,
  subcategory,
  caloriesPerMinute,
  caloriesPerHalfHour,
  caloriesPerHour,
  effortLevels = [],
  terrainTypes = [],
}) => {
  const [duration, setDuration] = useState("");
  const [effort, setEffort] = useState("");
  const [terrain, setTerrain] = useState("");
  const [effortModalVisible, setEffortModalVisible] = useState(false);
  const [terrainModalVisible, setTerrainModalVisible] = useState(false);

  // Determine which buttons to show
  let showDuration = effortLevels.length > 0 || terrainTypes.length > 0;
  let showEffort = effortLevels.length > 0;
  let showTerrain = terrainTypes.length > 0;

  return (
    <Animated.View style={styles.exerciseItemContainer}>
      <View style={styles.exerciseItemLeft}>
        <Text style={styles.exerciseName}>{subcategory}</Text>
        <View style={styles.caloriesContainer}>
          <Text style={styles.calorieText}>
            ⏱️ {caloriesPerMinute?.toFixed(1)} kcal/min
          </Text>
          <Text style={styles.calorieText}>
            🔥 {caloriesPerHalfHour?.toFixed(1)} kcal/30min
          </Text>
          <Text style={styles.calorieText}>
            ⚡ {caloriesPerHour?.toFixed(1)} kcal/hour
          </Text>
        </View>
        {/* Additional Buttons */}
        <View
          style={{
            flexDirection: "row",
            gap: 10,
            marginTop: 10,
            flexWrap: "wrap",
          }}
        >
          {showDuration && (
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
                value={duration}
                onChangeText={setDuration}
                keyboardType="numeric"
              />
            </View>
          )}
          {showEffort && (
            <>
              <TouchableOpacity
                style={styles.badgeContainer}
                onPress={() => setEffortModalVisible(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.badgeText}>{effort || "Effort level"}</Text>
                <MaterialIcons
                  name="arrow-drop-down"
                  size={20}
                  color={Colors.darkGreen.color}
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
      <TouchableOpacity style={styles.addExerciseButton}>
        <Ionicons name="add-circle" size={28} color={Colors.darkGreen.color} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const TrackExerciseView = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [exerciseItems, setExerciseItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await activityService.getExerciseMetaData();
        setExerciseItems(data);
      } catch (err) {
        setError("Failed to load exercise data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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

        {/* Exercises List */}
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
            {exerciseItems
              .filter(
                (item) =>
                  item.subcategory
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                  item.category
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())
              )
              .map((item, index) => (
                <ExerciseItem key={index} {...item} />
              ))}
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
});

export default TrackExerciseView;
