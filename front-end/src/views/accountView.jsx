import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { TextInput, Switch } from "react-native-paper";
import userService from "../services/userService";

const AccountView = () => {
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    notificationsEnabled: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const profileData = await userService.getProfile();
      setProfile(profileData);
    } catch (err) {
      setError(err.message);
      Alert.alert(
        "Error",
        "Failed to load profile information. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      await userService.updateProfile(profile);
      Alert.alert("Success", "Profile updated successfully");
    } catch (err) {
      setError(err.message);
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleNotifications = async (value) => {
    try {
      setLoading(true);
      setError(null);
      await userService.updateNotifications(value);
      setProfile((prev) => ({ ...prev, notificationsEnabled: value }));
      Alert.alert("Success", "Notification preferences updated");
    } catch (err) {
      setError(err.message);
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile.email) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile Information</Text>

        <TextInput
          label="Full Name"
          value={profile.fullName}
          onChangeText={(text) =>
            setProfile((prev) => ({ ...prev, fullName: text }))
          }
          style={styles.input}
          mode="outlined"
        />

        <TextInput
          label="Email"
          value={profile.email}
          onChangeText={(text) =>
            setProfile((prev) => ({ ...prev, email: text }))
          }
          style={styles.input}
          mode="outlined"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          label="Phone Number"
          value={profile.phoneNumber}
          onChangeText={(text) =>
            setProfile((prev) => ({ ...prev, phoneNumber: text }))
          }
          style={styles.input}
          mode="outlined"
          keyboardType="phone-pad"
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleUpdateProfile}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Update Profile</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>

        <View style={styles.preferenceRow}>
          <Text style={styles.preferenceLabel}>Enable Notifications</Text>
          <Switch
            value={profile.notificationsEnabled}
            onValueChange={handleToggleNotifications}
            disabled={loading}
          />
        </View>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  section: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  input: {
    marginBottom: 12,
    backgroundColor: "white",
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  preferenceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  preferenceLabel: {
    fontSize: 16,
    color: "#333",
  },
  errorContainer: {
    backgroundColor: "#ffebee",
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  errorText: {
    color: "#c62828",
    fontSize: 14,
  },
});

export default AccountView;
