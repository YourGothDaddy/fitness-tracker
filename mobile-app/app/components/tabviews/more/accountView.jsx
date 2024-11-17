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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { Colors } from "../../../../constants/Colors";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";

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
  ({ activeField, fieldValues, onChangeText, onSave }) => {
    switch (activeField) {
      case "changePassword":
        return (
          <>
            <Text style={styles.modalTitle}>Change Password</Text>
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
              style={styles.modalButton}
              onPress={() =>
                onSave({
                  newPassword: fieldValues.newPassword,
                  confirmNewPassword: fieldValues.confirmNewPassword,
                })
              }
            >
              <Text style={styles.modalButtonText}>Save</Text>
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
            />
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => onSave(fieldValues[activeField])}
            >
              <Text style={styles.modalButtonText}>Save</Text>
            </TouchableOpacity>
          </>
        );
    }
  }
);

const AccountView = () => {
  const router = useRouter();
  const { hideHeader } = useLocalSearchParams();

  useEffect(() => {
    if (hideHeader === "true") {
      router.setParams({ hideHeader: "true" });
    }
  }, [hideHeader]);

  const [modalVisible, setModalVisible] = useState(false);
  const [activeField, setActiveField] = useState(null);
  const [fieldValues, setFieldValues] = useState({
    name: "",
    email: "",
    phone: "",
    newPassword: "",
    confirmNewPassword: "",
    notifications: false,
  });

  const handleFieldPress = useCallback((field) => {
    setActiveField(field);
    setModalVisible(true);
  }, []);

  const handleModalClose = useCallback(
    (newValue) => {
      if (newValue !== undefined) {
        setFieldValues((prevValues) => {
          if (activeField === "changePassword") {
            return {
              ...prevValues,
              newPassword: newValue.newPassword,
              confirmNewPassword: newValue.confirmNewPassword,
            };
          } else if (activeField === "notifications") {
            return { ...prevValues, notifications: newValue };
          } else {
            return { ...prevValues, [activeField]: newValue };
          }
        });
      }
      setModalVisible(false);
    },
    [activeField]
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
              <Text style={styles.avatarText}>JD</Text>
            </View>
          </View>
          <View style={styles.fieldsContainer}>
            {renderField("Name", fieldValues.name, "name", "person")}
            {renderField("Email", fieldValues.email, "email", "email")}
            {renderField("Phone", fieldValues.phone, "phone", "phone")}
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
    justifyContent: "flex-end", // Changed to slide from bottom
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
});
