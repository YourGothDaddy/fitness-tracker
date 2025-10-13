import React, { useState, useCallback, useEffect, useRef } from "react";
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
  Image,
  Animated,
  Easing,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "../../../../components/Icon";
import { Colors } from "../../../../constants/Colors";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import userService from "@/app/services/userService";
import { API_URL } from "../../../../constants/Config";
import * as Notifications from "expo-notifications";
import { mealService } from "@/app/services/mealService";

// Configure Android channel for local notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const Field = React.memo(({ title, value, onPress, icon }) => (
  <TouchableOpacity
    style={styles.fieldContainer}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.fieldIconContainer}>
      <Icon name={icon} size={24} color={Colors.darkGreen.color} />
    </View>
    <View style={styles.fieldTextContainer}>
      <Text style={styles.fieldTitle}>{title}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
    <Icon
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
  const [profile, setProfile] = useState({
    initials: "",
    fullName: "",
    avatarUrl: null,
  });
  const [avatarLoadError, setAvatarLoadError] = useState(false);
  const [fieldValues, setFieldValues] = useState({
    name: "",
    email: "",
    phone: "",
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
    notifications: false,
  });

  // Success check animation state
  const [showSuccess, setShowSuccess] = useState(false);
  const successOpacity = useRef(new Animated.Value(0)).current;
  const successScale = useRef(new Animated.Value(0.8)).current;
  const successTranslateY = useRef(new Animated.Value(10)).current;

  const runSuccessAnimation = useCallback(() => {
    setShowSuccess(true);
    successOpacity.setValue(0);
    successScale.setValue(0.8);
    successTranslateY.setValue(10);
    Animated.sequence([
      Animated.parallel([
        Animated.timing(successOpacity, {
          toValue: 1,
          duration: 260,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(successScale, {
          toValue: 1,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(successTranslateY, {
          toValue: 0,
          duration: 260,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(successOpacity, {
          toValue: 0,
          duration: 500,
          delay: 900,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(successTranslateY, {
          toValue: -6,
          duration: 500,
          delay: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      setShowSuccess(false);
    });
  }, [successOpacity, successScale, successTranslateY]);

  const fetchUserProfile = useCallback(async () => {
    try {
      setIsProfileLoading(true);
      const profileData = await userService.getProfile();
      setProfile({
        initials: profileData.initials || "",
        fullName: profileData.fullName || "",
        avatarUrl: profileData.avatarUrl || null,
      });
      setAvatarLoadError(false);
      setFieldValues((prev) => ({
        ...prev,
        name: profileData.fullName || "",
        email: profileData.email || "",
        phone: profileData.phoneNumber || "",
        notifications: profileData.notificationsEnabled,
      }));
    } catch (error) {
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

  // Request permissions and check meals for today, send friendly notification if none
  const checkMealsAndNotify = useCallback(async () => {
    try {
      if (!fieldValues.notifications) return;

      const { status } = await Notifications.getPermissionsAsync();
      let finalStatus = status;
      if (status !== "granted") {
        const request = await Notifications.requestPermissionsAsync();
        finalStatus = request.status;
      }
      if (finalStatus !== "granted") {
        return;
      }

      const todayMeals = await mealService.getMealsForDate(new Date());
      if (!Array.isArray(todayMeals) || todayMeals.length === 0) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Friend, aren't you starving?",
            body: "You haven't logged any meals today.",
          },
          trigger: null,
        });
      }
    } catch (e) {
      // avoid noisy alerts here; this is a silent helper
      console.warn("Notification check failed", e?.message || e);
    }
  }, [fieldValues.notifications]);

  useEffect(() => {
    if (hideHeader === "true") {
      router.setParams({ hideHeader: "true" });
    }
  }, [hideHeader]);

  // Run check after profile fetch completes
  useEffect(() => {
    if (!isProfileLoading) {
      checkMealsAndNotify();
    }
  }, [isProfileLoading, checkMealsAndNotify]);

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
              runSuccessAnimation();
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
              runSuccessAnimation();
              break;

            case "notifications":
              await userService.updateNotifications(newValue);
              await fetchUserProfile();
              if (newValue) {
                // When toggled on, run immediate check and notify if zero meals today
                await checkMealsAndNotify();
              }
              runSuccessAnimation();
              break;
          }
        } catch (error) {
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
          animation: "none",
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
              <Icon
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
              {profile.avatarUrl && !avatarLoadError ? (
                <Image
                  source={{
                    uri: profile.avatarUrl.startsWith("http")
                      ? profile.avatarUrl
                      : `${API_URL}${profile.avatarUrl}`,
                  }}
                  style={styles.avatarImage}
                  onError={() => setAvatarLoadError(true)}
                />
              ) : (
                <Text style={styles.avatarText}>
                  {profile.initials || "--"}
                </Text>
              )}
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
        {/* Success check overlay */}
        {showSuccess && (
          <View pointerEvents="none" style={styles.successOverlay}>
            <Animated.View
              style={[
                styles.successContainer,
                {
                  opacity: successOpacity,
                  transform: [
                    { scale: successScale },
                    { translateY: successTranslateY },
                  ],
                },
              ]}
            >
              <View style={styles.successCircle}>
                <Icon name="checkmark" size={48} color={Colors.white.color} />
              </View>
            </Animated.View>
          </View>
        )}
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
    overflow: "hidden", // Ensure image is clipped to circle
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    resizeMode: "cover",
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
  successOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  successContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  successCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.darkGreen.color,
    alignItems: "center",
    justifyContent: "center",
    // No shadow/elevation to avoid polygon-like fade artifacts on Android
  },
});
