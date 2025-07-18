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
import React, { useState, useEffect } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { API_URL } from "../../constants/Config";
import { authService } from "@/app/services/authService";
import userService from "@/app/services/userService";
import * as ImagePicker from "expo-image-picker";

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
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [avatarUri, setAvatarUri] = useState(null);
  const [avatarLoadError, setAvatarLoadError] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await userService.getProfile();
        setProfile(data);
      } catch (err) {
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

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
      Alert.alert(
        "Logout Failed",
        "There was an issue logging out. Please try again."
      );
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Handler to pick image from gallery
  const handlePickAvatar = async () => {
    try {
      // Ask for permission
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "We need access to your gallery to set a profile picture."
        );
        return;
      }
      // Open image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const localUri = result.assets[0].uri;
        // Upload to backend
        try {
          const uploadedUrl = await userService.uploadAvatar(localUri);
          setAvatarUri(uploadedUrl);
          Alert.alert("Success", "Profile image updated!");
        } catch (uploadErr) {
          Alert.alert(
            "Upload Failed",
            uploadErr.message || "Could not upload image."
          );
        }
      }
    } catch (err) {
      Alert.alert("Error", "Could not open image picker.");
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
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={handlePickAvatar}
            activeOpacity={0.7}
          >
            {avatarUri && !avatarLoadError ? (
              <Image
                source={{ uri: avatarUri }}
                style={styles.avatarImage}
                onError={() => setAvatarLoadError(true)}
              />
            ) : profile?.avatarUrl && !avatarLoadError ? (
              <Image
                source={{
                  uri: profile.avatarUrl.startsWith("http")
                    ? profile.avatarUrl
                    : `${API_URL}${profile.avatarUrl}`,
                }}
                style={styles.avatarImage}
                onError={() => setAvatarLoadError(true)}
              />
            ) : loading ? (
              <Text style={styles.avatarText}>--</Text>
            ) : (
              <Text style={styles.avatarText}>{profile?.initials || "--"}</Text>
            )}
          </TouchableOpacity>
          <Text style={styles.welcomeText}>Welcome back!</Text>
          {loading ? (
            <Text style={styles.nameText}>Loading...</Text>
          ) : error ? (
            <Text style={styles.nameText}>Error</Text>
          ) : (
            <Text style={styles.nameText}>
              {profile?.fullName || "No Name"}
            </Text>
          )}
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
    overflow: "hidden", // Ensure image is clipped to circle
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    resizeMode: "cover",
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
