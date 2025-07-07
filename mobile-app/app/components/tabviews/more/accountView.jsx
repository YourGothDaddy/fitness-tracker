import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Switch,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { Colors } from "../../../../constants/Colors";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import userService from "@/app/services/userService";

const Field = React.memo(({ title, value, onPress, icon }) => (
  <TouchableOpacity
    style={styles.fieldContainer}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.fieldIconContainer}>
      <MaterialIcons name={icon} size={24} color={Colors.darkGreen.color} />
    </View>
    <View style={styles.fieldTextContainer}>
      <Text style={styles.fieldTitle}>{title}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
    <MaterialIcons
      name="chevron-right"
      size={24}
      color={Colors.darkGreen.color}
      style={styles.arrowIcon}
    />
  </TouchableOpacity>
));

const ModalContent = React.memo(
  ({ activeField, fieldValues, onChangeText, onSave, isLoading }) => {
    switch (activeField) {
      case "changePassword":
        return (
          <>
            <Text style={styles.modalTitle}>Change Password</Text>
            <TextInput
              style={styles.modalInput}
              value={fieldValues.currentPassword}
              onChangeText={(text) => onChangeText("currentPassword", text)}
              placeholder="Current Password"
              secureTextEntry
            />
            <TextInput
              style={styles.modalInput}
              value={fieldValues.newPassword}
              onChangeText={(text) => onChangeText("newPassword", text)}
              placeholder="New Password"
              secureTextEntry
            />
            <TextInput
              style={styles.modalInput}
              value={fieldValues.confirmNewPassword}
              onChangeText={(text) => onChangeText("confirmNewPassword", text)}
              placeholder="Confirm New Password"
              secureTextEntry
            />
            <TouchableOpacity
              style={[styles.modalButton, isLoading && styles.disabledButton]}
              onPress={() =>
                onSave({
                  currentPassword: fieldValues.currentPassword,
                  newPassword: fieldValues.newPassword,
                  confirmNewPassword: fieldValues.confirmNewPassword,
                })
              }
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={Colors.white.color} />
              ) : (
                <Text style={styles.modalButtonText}>Save</Text>
              )}
            </TouchableOpacity>
          </>
        );
      case "notifications":
        return (
          <>
            <Text style={styles.modalTitle}>Notifications</Text>
            <View style={styles.switchContainer}>
              <Text>Enable Notifications</Text>
              <Switch
                value={fieldValues.notifications}
                onValueChange={(value) => onSave(value)}
                disabled={isLoading}
              />
            </View>
          </>
        );
      default:
        return (
          <>
            <Text style={styles.modalTitle}>{`Enter ${activeField}`}</Text>
            <TextInput
              style={styles.modalInput}
              value={fieldValues[activeField]}
              onChangeText={(text) => onChangeText(activeField, text)}
              autoFocus
              placeholder={`Enter your ${activeField}`}
            />
            <TouchableOpacity
              style={[styles.modalButton, isLoading && styles.disabledButton]}
              onPress={() => onSave(fieldValues[activeField])}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={Colors.white.color} />
              ) : (
                <Text style={styles.modalButtonText}>Save</Text>
              )}
            </TouchableOpacity>
          </>
        );
    }
  }
);

const AccountView = () => {
  const router = useRouter();
  const { hideHeader } = useLocalSearchParams();

  const [modalVisible, setModalVisible] = useState(false);
  const [activeField, setActiveField] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [profile, setProfile] = useState({ initials: "", fullName: "" });
  const [fieldValues, setFieldValues] = useState({
    name: "",
    email: "",
    phone: "",
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
    notifications: false,
  });

  const fetchUserProfile = useCallback(async () => {
    try {
      setIsProfileLoading(true);
      const profileData = await userService.getProfile();
      setProfile({
        initials: profileData.initials || "",
        fullName: profileData.fullName || "",
      });
      setFieldValues((prev) => ({
        ...prev,
        name: profileData.fullName || "",
        email: profileData.email || "",
        phone: profileData.phoneNumber || "",
        notifications: profileData.notificationsEnabled,
      }));
    } catch (error) {
      console.error("Profile fetch error:", error);
      if (error.message === "Please log in again") {
        Alert.alert(
          "Session Expired",
          "Your session has expired. Please log in again.",
          [
            {
              text: "OK",
              onPress: () => {
                router.replace("/login");
              },
            },
          ]
        );
      } else {
        Alert.alert(
          "Error",
          "Failed to load profile information. Please try again later."
        );
      }
    } finally {
      setIsProfileLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  useEffect(() => {
    if (hideHeader === "true") {
      router.setParams({ hideHeader: "true" });
    }
  }, [hideHeader]);

  const handleFieldPress = useCallback((field) => {
    setActiveField(field);
    setModalVisible(true);
  }, []);

  const handleModalClose = useCallback(
    async (newValue) => {
      if (newValue !== undefined) {
        setIsLoading(true);
        try {
          switch (activeField) {
            case "name":
            case "email":
            case "phone":
              await userService.updateProfile({
                fullName: activeField === "name" ? newValue : fieldValues.name,
                email: activeField === "email" ? newValue : fieldValues.email,
                phoneNumber:
                  activeField === "phone" ? newValue : fieldValues.phone,
              });
              await fetchUserProfile();
              Alert.alert("Success", "Profile updated successfully");
              break;

            case "changePassword":
              if (newValue.newPassword !== newValue.confirmNewPassword) {
                Alert.alert("Error", "New passwords do not match");
                setIsLoading(false);
                return;
              }
              if (newValue.newPassword.length < 6) {
                Alert.alert(
                  "Error",
                  "Password must be at least 6 characters long"
                );
                setIsLoading(false);
                return;
              }
              await userService.changePassword({
                currentPassword: newValue.currentPassword,
                newPassword: newValue.newPassword,
                confirmNewPassword: newValue.confirmNewPassword,
              });
              Alert.alert("Success", "Password changed successfully");
              break;

            case "notifications":
              await userService.updateNotifications(newValue);
              await fetchUserProfile();
              Alert.alert("Success", "Notification preferences updated");
              break;
          }
        } catch (error) {
          console.error("Update error:", error);
          if (error.message === "Please log in again") {
            Alert.alert(
              "Session Expired",
              "Your session has expired. Please log in again.",
              [
                {
                  text: "OK",
                  onPress: () => {
                    router.replace("/login");
                  },
                },
              ]
            );
          } else {
            const errorMessage =
              error.response?.data?.message ||
              error.message ||
              "An error occurred";
            Alert.alert("Error", errorMessage);
          }
        } finally {
          setIsLoading(false);
          setModalVisible(false);
        }
      } else {
        setModalVisible(false);
      }
    },
    [activeField, fieldValues, fetchUserProfile, router]
  );

  const handleChangeText = useCallback((field, text) => {
    setFieldValues((prevValues) => ({ ...prevValues, [field]: text }));
  }, []);

  const renderField = useCallback(
    (title, value, field, icon) => (
      <Field
        key={field}
        title={title}
        value={value}
        icon={icon}
        onPress={() => handleFieldPress(field)}
      />
    ),
    [handleFieldPress]
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: hideHeader !== "true",
          title: "Account",
          headerStyle: {
            backgroundColor: Colors.white.color,
          },
          headerTitleStyle: {
            color: Colors.darkGreen.color,
            fontSize: 24,
            fontWeight: "bold",
          },
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
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>{profile.initials || "--"}</Text>
            </View>
          </View>
          {isProfileLoading ? (
            <View style={styles.loadingContentContainer}>
              <ActivityIndicator size="large" color={Colors.darkGreen.color} />
            </View>
          ) : (
            <View style={styles.fieldsContainer}>
              {renderField("Name", profile.fullName, "name", "person")}
              {renderField("Email", fieldValues.email, "email", "email")}
              {renderField(
                "Phone",
                fieldValues.phone || "Not set",
                "phone",
                "phone"
              )}
              {renderField(
                "Change Password",
                "********",
                "changePassword",
                "lock"
              )}
              {renderField(
                "Notifications",
                fieldValues.notifications ? "On" : "Off",
                "notifications",
                "notifications"
              )}
            </View>
          )}
        </ScrollView>
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => handleModalClose()}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <ModalContent
                activeField={activeField}
                fieldValues={fieldValues}
                onChangeText={handleChangeText}
                onSave={handleModalClose}
                isLoading={isLoading}
              />
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </>
  );
};

export default AccountView;

const styles = StyleSheet.create({
  safeAreaViewContainer: {
    flex: 1,
    backgroundColor: Colors.white.color,
  },
  header: {
    position: "relative",
  },
  backButton: {
    paddingLeft: 20,
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: 30,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
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
    fontSize: 36,
    color: Colors.white.color,
    fontWeight: "bold",
  },
  scrollViewContainer: {
    flexGrow: 1,
  },
  fieldsContainer: {
    paddingHorizontal: 20,
    gap: 10,
  },
  fieldContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: Colors.white.color,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  fieldIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.lightGreen.color,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  fieldTextContainer: {
    flex: 1,
  },
  fieldTitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  fieldValue: {
    fontSize: 16,
    color: Colors.darkGreen.color,
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: Colors.white.color,
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    width: "100%",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: Colors.darkGreen.color,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: Colors.lightGreen.color,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  modalButton: {
    backgroundColor: Colors.green.color,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  disabledButton: {
    opacity: 0.7,
  },
  modalButtonText: {
    color: Colors.white.color,
    fontWeight: "bold",
    fontSize: 16,
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.lightGreen.color,
    padding: 15,
    borderRadius: 10,
  },
  loadingContentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 200,
  },
});
