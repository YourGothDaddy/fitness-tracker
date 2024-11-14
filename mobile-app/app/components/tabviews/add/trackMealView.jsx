import React, { useState, useCallback } from "react";
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

const FoodItem = ({ name, calories, protein, carbs, fat }) => {
  return (
    <Animated.View style={styles.foodItemContainer}>
      <View style={styles.foodItemLeft}>
        <Text style={styles.foodName}>{name}</Text>
        <View style={styles.macrosContainer}>
          <Text style={styles.macroText}>🔥 {calories}kcal</Text>
          <Text style={styles.macroText}>🥩 {protein}g</Text>
          <Text style={styles.macroText}>🌾 {carbs}g</Text>
          <Text style={styles.macroText}>🥑 {fat}g</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.addFoodButton}>
        <Ionicons name="add-circle" size={28} color={Colors.darkGreen.color} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const TrackMealView = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const foodItems = [
    { name: "Chicken Breast", calories: 165, protein: 31, carbs: 0, fat: 3.6 },
    { name: "Brown Rice", calories: 111, protein: 2.6, carbs: 23, fat: 0.9 },
    { name: "Avocado", calories: 160, protein: 2, carbs: 8.5, fat: 14.7 },
    { name: "Salmon", calories: 208, protein: 22, carbs: 0, fat: 13 },
    { name: "Sweet Potato", calories: 86, protein: 1.6, carbs: 20, fat: 0.1 },
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
          {foodItems.map((item, index) => (
            <FoodItem key={index} {...item} />
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
});

export default TrackMealView;
