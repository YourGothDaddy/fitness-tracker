import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState, useRef, useEffect } from "react";
import { Colors } from "@/constants/Colors";
import GeneralView from "../components/tabviews/generalView";
import ChartsView from "../components/tabviews/chartsView";
import TargetsView from "../components/tabviews/targetsView";

const Dashboard = () => {
  const tabs = ["General", "Charts", "Targets"];

  const [activeTab, setActiveTab] = useState("General");
  const translateX = useRef(new Animated.Value(0)).current;
  const lineWidth = useRef(new Animated.Value(0)).current;
  const tabLayouts = useRef([]).current;
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [initialLoad, setInitialLoad] = useState(false);

  const onTabPress = (index, tab) => {
    setSelectedIndex(index);
    animateLine(index);
    setActiveTab(tab);
  };

  const animateLine = (index) => {
    const { x, width } = tabLayouts[index];

    Animated.parallel([
      Animated.timing(translateX, {
        toValue: x,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(lineWidth, {
        toValue: width,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const onTabLayout = (event, index) => {
    const { x, width } = event.nativeEvent.layout;
    tabLayouts[index] = { x, width };

    if (!initialLoad) {
      setInitialLoad(true);
      animateLine(selectedIndex);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "General":
        return <GeneralView />;
      case "Charts":
        return <ChartsView />;
      case "Targets":
        return <TargetsView />;
      default:
        return <GeneralView />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navigationContainer}>
        <Text className="text-4xl font-pextrabold text-center text-green pt-10">
          Fitlicious
        </Text>
        <Text style={styles.pageTitle}>Dashboard</Text>
        <View style={styles.tabContainer}>
          {tabs.map((tab, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => onTabPress(index, tab)}
              onLayout={(event) => onTabLayout(event, index)}
              style={styles.tabButton}
            >
              <Text
                style={[
                  styles.tabButtonText,
                  activeTab === tab && styles.activeTabButtonText,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Animated.View
          style={[
            styles.activeTabIndicator,
            {
              width: lineWidth,
              transform: [{ translateX }],
            },
          ]}
        />
      </View>
      <View style={styles.contentWrapper}>{renderContent()}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white.color,
  },
  navigationContainer: {
    backgroundColor: Colors.white.color,
    paddingBottom: 15,
    borderWidth: 2,
    borderTopWidth: 0,
    borderLeftWidth: 0.5,
    borderRightWidth: 0.5,
    borderBottomRightRadius: 50,
    borderBottomLeftRadius: 50,
  },
  contentWrapper: {
    flex: 1,
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
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    paddingBottom: 10,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  tabButtonText: {
    color: Colors.green.color,
    fontWeight: "600",
    fontSize: 16,
  },
  activeTabButtonText: {
    color: Colors.green.color,
    fontWeight: "700",
  },
  activeTabIndicator: {
    position: "relative",
    bottom: 0,
    height: 2,
    backgroundColor: Colors.green.color,
  },
});

export default Dashboard;
