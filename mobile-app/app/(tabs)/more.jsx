import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants/Colors";
import React from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const Tab = ({ icon, title, href }) => {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.tabContainer}
      onPress={() => router.push(href)}
    >
      <MaterialIcons name={icon} size={24} />
      <Text style={styles.tabTitle}>{title}</Text>
      <MaterialIcons
        name="arrow-forward-ios"
        size={24}
        style={styles.arrowIcon}
      />
    </TouchableOpacity>
  );
};

const More = () => {
  return (
    <SafeAreaView style={styles.safeAreaViewContainer}>
      <Text className="text-4xl font-pextrabold text-center text-green pt-10">
        Fitlicious
      </Text>
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        <View style={styles.tabsContainer}>
          <Tab icon="account-circle" title="Account" href="/" />
          <Tab icon="person" title="Profile" href="/" />
          <Tab icon="flag" title="Targets" href="/" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default More;

const styles = StyleSheet.create({
  safeAreaViewContainer: {
    flex: 1,
    backgroundColor: Colors.white.color,
  },
  scrollViewContainer: {
    flexGrow: 1,
    alignItems: "center",
    paddingVertical: 10,
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
  },
  tabTitle: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  arrowContainer: {
    justifyContent: "flex-end",
  },
});
