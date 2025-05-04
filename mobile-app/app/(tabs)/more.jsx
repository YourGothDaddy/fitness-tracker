import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants/Colors";
import React, { useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { API_URL } from "../../constants/Config";
import { authService } from "@/app/services/authService";

const MenuCard = ({ icon, title, description, href, onPress }) => (
  <TouchableOpacity
    style={styles.menuCard}
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

const More = () => {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleCardPress = (href) => {
    router.push({
      pathname: href,
      params: { hideHeader: "true" },
    });
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;

    try {
      setIsLoggingOut(true);
      await authService.logout();
      router.replace("/");
    } catch (error) {
      console.error("Logout error:", error);
      Alert.alert(
        "Logout Failed",
        "There was an issue logging out. Please try again."
      );
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeAreaViewContainer}>
      <View style={styles.header}>
        <Text className="text-4xl font-pextrabold text-center text-green pt-10">
          Fitlicious
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        <View style={styles.profilePreview}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>JD</Text>
          </View>
          <Text style={styles.welcomeText}>Welcome back!</Text>
          <Text style={styles.nameText}>John Doe</Text>
        </View>

        <View style={styles.menuContainer}>
          <MenuCard
            icon="account-circle"
            title="Account Settings"
            description="Manage your account details and preferences"
            href="/components/tabviews/more/accountView"
            onPress={() =>
              handleCardPress("/components/tabviews/more/accountView")
            }
          />

          <MenuCard
            icon="person"
            title="Profile Information"
            description="Update your personal and fitness details"
            href="/profile"
            onPress={() =>
              handleCardPress("/components/tabviews/more/profileView")
            }
          />

          <MenuCard
            icon="flag"
            title="Fitness Targets"
            description="Set and track your fitness goals"
            href="/"
            onPress={() =>
              handleCardPress("/components/tabviews/more/targetsView")
            }
          />
        </View>

        <TouchableOpacity
          style={[styles.logoutButton, isLoggingOut && styles.disabledButton]}
          onPress={handleLogout}
          disabled={isLoggingOut}
          activeOpacity={0.8}
        >
          <MaterialIcons name="logout" size={24} color={Colors.white.color} />
          <Text style={styles.logoutText}>
            {isLoggingOut ? "Logging Out..." : "Log Out"}
          </Text>
        </TouchableOpacity>
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
  header: {
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGreen.color,
  },
  scrollViewContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  profilePreview: {
    alignItems: "center",
    paddingVertical: 30,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.green.color,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  avatarText: {
    fontSize: 32,
    color: Colors.white.color,
    fontWeight: "bold",
  },
  welcomeText: {
    fontSize: 16,
    color: "#666",
    marginTop: 15,
  },
  nameText: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.darkGreen.color,
    marginTop: 5,
  },
  menuContainer: {
    gap: 15,
  },
  menuCard: {
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
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.darkGreen.color,
    padding: 15,
    borderRadius: 12,
    marginTop: 30,
    marginBottom: 20,
    gap: 10,
  },
  disabledButton: {
    opacity: 0.7,
  },
  logoutText: {
    color: Colors.white.color,
    fontSize: 16,
    fontWeight: "600",
  },
});
