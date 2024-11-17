import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { Colors } from "../../../../constants/Colors";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";

const TargetCard = ({ title, description, icon, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.targetCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.menuIconContainer}>
        <MaterialIcons name={icon} size={32} color={Colors.darkGreen.color} />
      </View>
      <View style={styles.menuTextContainer}>
        <Text style={styles.menuTitle}>{title}</Text>
        <Text style={styles.menuDescription}>{description}</Text>
      </View>
      <MaterialIcons
        name="chevron-right"
        size={24}
        color={Colors.darkGreen.color}
      />
    </TouchableOpacity>
  );
};

const TargetsView = () => {
  const router = useRouter();
  const { hideHeader } = useLocalSearchParams();

  const handleTargetPress = useCallback(
    (href) => {
      router.push({
        pathname: href,
        params: { hideHeader: "true" },
      });
    },
    [router]
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: hideHeader !== "true",
          title: "Targets",
        }}
      />
      <SafeAreaView style={styles.safeAreaViewContainer}>
        {hideHeader === "true" && (
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
        )}

        <ScrollView contentContainerStyle={styles.scrollViewContainer}>
          <View style={styles.profilePreview}>
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>2400</Text>
                <Text style={styles.statLabel}>Daily Calories</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>150g</Text>
                <Text style={styles.statLabel}>Protein Goal</Text>
              </View>
            </View>
          </View>

          <View style={styles.sectionTitle}>
            <MaterialIcons
              name="track-changes"
              size={24}
              color={Colors.darkGreen.color}
            />
            <Text style={styles.sectionTitleText}>Customize Your Targets</Text>
          </View>

          <View style={styles.menuContainer}>
            <TargetCard
              title="Macro Targets"
              description="Set your protein, carbs, and fat goals"
              icon="pie-chart"
              onPress={() =>
                handleTargetPress("/components/tabviews/more/targets/macroView")
              }
            />

            <TargetCard
              title="Energy Settings"
              description="Configure your daily calorie targets"
              icon="flash-on"
              onPress={() =>
                handleTargetPress(
                  "/components/tabviews/more/targets/energySettingsView"
                )
              }
            />

            <TargetCard
              title="Nutrient Targets"
              description="Customize vitamin and mineral goals"
              icon="local-dining"
              onPress={() =>
                handleTargetPress(
                  "/components/tabviews/more/targets/nutrientTargetsView"
                )
              }
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

export default TargetsView;

const styles = StyleSheet.create({
  safeAreaViewContainer: {
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
  scrollViewContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  profilePreview: {
    paddingVertical: 30,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.lightGreen.color,
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.darkGreen.color,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  sectionTitle: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 10,
  },
  sectionTitleText: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.darkGreen.color,
  },
  menuContainer: {
    gap: 15,
  },
  targetCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    backgroundColor: Colors.white.color,
    borderRadius: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  menuIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.lightGreen.color,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.darkGreen.color,
    marginBottom: 5,
  },
  menuDescription: {
    fontSize: 14,
    color: "#666",
  },
});
