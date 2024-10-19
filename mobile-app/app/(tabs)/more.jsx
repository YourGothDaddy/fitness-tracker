import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants/Colors";
import React, { useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AccountView from "../components/tabviews/more/accountView";

const Tab = ({ icon, title, href, component, onPress }) => {
  return (
    <TouchableOpacity style={styles.tabContainer} onPress={onPress}>
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
  const [activeComponent, setActiveComponent] = useState(null);
  const router = useRouter();

  const handleTabPress = (href, Component) => {
    if (href) {
      router.push(href);
    } else if (Component) {
      setActiveComponent(<Component />);
    }
  };

  return (
    <SafeAreaView style={styles.safeAreaViewContainer}>
      <Text className="text-4xl font-pextrabold text-center text-green pt-10">
        Fitlicious
      </Text>
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        <View style={styles.tabsContainer}>
          <Tab
            icon="account-circle"
            title="Account"
            component={AccountView}
            onPress={() => handleTabPress(null, AccountView)}
          />
          <Tab
            icon="person"
            title="Profile"
            href="/"
            onPress={() => handleTabPress("/", null)}
          />
          <Tab
            icon="flag"
            title="Targets"
            href="/"
            onPress={() => handleTabPress("/", null)}
          />
        </View>
        {activeComponent}
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
