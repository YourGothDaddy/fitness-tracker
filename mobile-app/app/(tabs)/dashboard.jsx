import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState, useRef, useMemo, useCallback } from "react";
import { Colors } from "@/constants/Colors";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import GeneralView from "../components/tabviews/generalView";
import ChartsView from "../components/tabviews/chartsView";
import TargetsView from "../components/tabviews/targetsView";
import { MaterialIcons } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { Animated } from "react-native";
import { FadeInDown } from "react-native-reanimated";

const { width } = Dimensions.get("window");

const Dashboard = () => {
  const tabs = useMemo(() => ["General", "Charts", "Targets"], []);
  const [activeTab, setActiveTab] = useState("General");
  const translateX = useRef(new Animated.Value(0)).current;
  const lineWidth = useRef(new Animated.Value(0)).current;
  const tabLayouts = useRef([]).current;
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [initialLoad, setInitialLoad] = useState(false);

  const onTabPress = useCallback(
    (index, tab) => {
      setSelectedIndex(index);
      animateLine(index);
      setActiveTab(tab);
    },
    [animateLine]
  );

  const animateLine = useCallback(
    (index) => {
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
    },
    [lineWidth, translateX, tabLayouts]
  );

  const onTabLayout = useCallback(
    (event, index) => {
      const { x, width } = event.nativeEvent.layout;
      tabLayouts[index] = { x, width };

      if (!initialLoad) {
        setInitialLoad(true);
        animateLine(selectedIndex);
      }
    },
    [animateLine, initialLoad, selectedIndex, tabLayouts]
  );

  const renderContent = useCallback(() => {
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
  }, [activeTab]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Decorative Background Elements */}
      <View style={styles.backgroundDecoration} />
      <View style={styles.backgroundCircle1} />
      <View style={styles.backgroundCircle2} />

      {/* Hero Section */}
      <LinearGradient
        colors={["#8cc63f", "#619819"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroSection}
      >
        <Animated.View
          entering={FadeInDown.duration(1000)}
          style={styles.headerContent}
        >
          <Text style={styles.dateText}>
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </Text>
        </Animated.View>
      </LinearGradient>

      {/* Fixed Navigation Tabs */}
      <View style={styles.tabsWrapper}>
        <LinearGradient
          colors={["rgba(255,255,255,0.9)", "rgba(255,255,255,0.8)"]}
          style={styles.tabContainer}
        >
          {tabs.map((tab, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => onTabPress(index, tab)}
              onLayout={(event) => onTabLayout(event, index)}
              style={[
                styles.tabButton,
                activeTab === tab && styles.activeTabButton,
              ]}
            >
              <LinearGradient
                colors={
                  activeTab === tab
                    ? ["#8cc63f", "#619819"]
                    : ["transparent", "transparent"]
                }
                style={[
                  styles.tabButtonGradient,
                  activeTab === tab && styles.activeTabButtonGradient,
                ]}
              >
                <MaterialIcons
                  name={
                    tab === "General"
                      ? "dashboard"
                      : tab === "Charts"
                      ? "insert-chart"
                      : "track-changes"
                  }
                  size={24}
                  color={activeTab === tab ? "#FFFFFF" : "#619819"}
                  style={styles.tabIcon}
                />
                <Text
                  style={[
                    styles.tabButtonText,
                    activeTab === tab && styles.activeTabButtonText,
                  ]}
                >
                  {tab}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </LinearGradient>
      </View>

      {/* Scrollable Content Area */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentWrapper}>{renderContent()}</View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8faf5",
  },
  backgroundDecoration: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 200, // Reduced height since we removed stats
    backgroundColor: "#8cc63f",
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
    transform: [{ scaleX: 1.2 }],
  },
  backgroundCircle1: {
    position: "absolute",
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  backgroundCircle2: {
    position: "absolute",
    top: 50,
    left: -100,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  heroSection: {
    paddingTop: 20,
    paddingBottom: 20, // Reduced padding further
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  headerContent: {
    paddingHorizontal: 24,
    alignItems: "center", // Center the date text
  },
  dateText: {
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  tabsWrapper: {
    position: "relative",
    zIndex: 2,
    marginTop: -20,
    paddingHorizontal: 20,
    backgroundColor: "transparent",
  },
  tabContainer: {
    flexDirection: "row",
    borderRadius: 20,
    padding: 8,
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    ...Platform.select({
      ios: {
        shadowColor: "#619819",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  tabButton: {
    flex: 1,
    borderRadius: 15,
    overflow: "hidden",
  },
  tabButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  activeTabButtonGradient: {
    borderRadius: 15,
  },
  tabIcon: {
    marginRight: 4,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#619819",
  },
  activeTabButtonText: {
    color: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
    marginTop: 20,
  },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: 20,
  },
});

export default Dashboard;
