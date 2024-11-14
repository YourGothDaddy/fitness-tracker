import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Animated,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../../constants/Colors";
import { useRouter } from "expo-router";
import { Stack } from "expo-router";

const ExerciseItem = ({
  name,
  caloriesPerMin,
  caloriesPerHalfHour,
  caloriesPerHour,
}) => {
  return (
    <Animated.View style={styles.exerciseItemContainer}>
      <View style={styles.exerciseItemLeft}>
        <Text style={styles.exerciseName}>{name}</Text>
        <View style={styles.caloriesContainer}>
          <Text style={styles.calorieText}>⏱️ {caloriesPerMin} kcal/min</Text>
          <Text style={styles.calorieText}>
            🔥 {caloriesPerHalfHour} kcal/30min
          </Text>
          <Text style={styles.calorieText}>⚡ {caloriesPerHour} kcal/hour</Text>
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

  const exerciseItems = [
    {
      name: "Running (8 km/h)",
      caloriesPerMin: 11,
      caloriesPerHalfHour: 330,
      caloriesPerHour: 660,
    },
    {
      name: "Swimming",
      caloriesPerMin: 10,
      caloriesPerHalfHour: 300,
      caloriesPerHour: 600,
    },
    {
      name: "Cycling",
      caloriesPerMin: 8,
      caloriesPerHalfHour: 240,
      caloriesPerHour: 480,
    },
    {
      name: "Jump Rope",
      caloriesPerMin: 12,
      caloriesPerHalfHour: 360,
      caloriesPerHour: 720,
    },
    {
      name: "Weight Training",
      caloriesPerMin: 6,
      caloriesPerHalfHour: 180,
      caloriesPerHour: 360,
    },
    {
      name: "Yoga",
      caloriesPerMin: 4,
      caloriesPerHalfHour: 120,
      caloriesPerHour: 240,
    },
    {
      name: "HIIT",
      caloriesPerMin: 14,
      caloriesPerHalfHour: 420,
      caloriesPerHour: 840,
    },
  ];

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
        <ScrollView
          style={styles.exercisesList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.exercisesListContent}
        >
          {exerciseItems.map((item, index) => (
            <ExerciseItem key={index} {...item} />
          ))}
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
});

export default TrackExerciseView;
