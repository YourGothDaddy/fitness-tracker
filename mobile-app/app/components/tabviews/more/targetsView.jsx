import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { Colors } from "../../../../constants/Colors";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";

const Tab = ({ title, onPress }) => {
  return (
    <TouchableOpacity style={styles.tabContainer} onPress={onPress}>
      <Text style={styles.tabTitle}>{title}</Text>
      <MaterialIcons
        name="arrow-forward-ios"
        size={24}
        style={styles.arrowIcon}
      />
    </TouchableOpacity>
  );
};

const TargetsView = () => {
  const router = useRouter();
  const { hideHeader } = useLocalSearchParams();

  const handleTabPress = useCallback(
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
          <View style={styles.tabsContainer}>
            <Tab
              title="Macro Targets"
              onPress={() =>
                handleTabPress("/components/tabviews/more/targets/macroView")
              }
            />
            <Tab
              title="Energy Settings"
              onPress={() =>
                handleTabPress(
                  "/components/tabviews/more/targets/energySettingsView"
                )
              }
            />
            <Tab
              title="Nutrient Targets"
              onPress={() =>
                handleTabPress(
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
  backButton: {
    paddingLeft: 20,
    paddingBottom: 30,
  },
  safeAreaViewContainer: {
    height: "100%",
    width: "100%",
    backgroundColor: Colors.white.color,
  },
  scrollViewContainer: {
    flexGrow: 1,
    alignItems: "center",
  },
  tabsContainer: {
    width: "90%",
    backgroundColor: Colors.lightGreen.color,
    padding: 15,
    borderRadius: 15,
  },
  tabContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: Colors.lightGreen.color,
    borderBottomWidth: 1,
    borderBottomColor: Colors.white.color,
  },
  tabTitle: {
    flex: 1,
    fontSize: 16,
  },
  arrowIcon: {
    color: Colors.darkGreen.color,
  },
});
