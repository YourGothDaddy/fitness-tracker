import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState } from "react";
import { Colors } from "@/constants/Colors";
import GeneralView from "../components/tabviews/generalView";
import ChartsView from "../components/tabviews/chartsView";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("general");

  const renderContent = () => {
    switch (activeTab) {
      case "general":
        return <GeneralView />;
      case "charts":
        return <ChartsView />;
      default:
        return <GeneralView />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentWrapper}>
        <View>
          <Text style={styles.appTitle}>Fitlicious</Text>
        </View>
        <View>
          <Text style={styles.pageTitle}>Charts</Text>
        </View>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            onPress={() => setActiveTab("general")}
            style={[
              styles.tabButton,
              activeTab === "general" && styles.activeTabButton,
            ]}
          >
            <Text style={styles.tabButtonText}>General</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("charts")}
            style={[
              styles.tabButton,
              activeTab === "charts" && styles.activeTabButton,
            ]}
          >
            <Text style={styles.tabButtonText}>Charts</Text>
          </TouchableOpacity>
        </View>
        {renderContent()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white.color,
  },
  contentWrapper: {
    flex: 1,
  },
  appTitle: {
    fontSize: 36,
    fontWeight: "800",
    textAlign: "center",
    color: Colors.green.color,
    paddingTop: 40,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    color: Colors.green.color,
    paddingBottom: 40,
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  tabButton: {
    padding: 10,
    backgroundColor: Colors.lightGreen.color,
    borderRadius: 5,
  },
  activeTabButton: {
    backgroundColor: Colors.green.color,
  },
  tabButtonText: {
    color: Colors.white.color,
  },
});

export default Dashboard;
