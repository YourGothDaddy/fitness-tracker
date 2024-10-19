import React, { useState, useCallback } from "react";
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

const Field = React.memo(({ title, value, onPress }) => (
  <TouchableOpacity style={styles.fieldContainer} onPress={onPress}>
    <Text style={styles.fieldTitle}>{title}</Text>
    <Text style={styles.fieldValue}>{value}</Text>
    <MaterialIcons
      name="arrow-forward-ios"
      size={24}
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
            <TouchableOpacity style={styles.modalButton} onPress={onSave}>
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
            <TouchableOpacity style={styles.modalButton} onPress={onSave}>
              <Text style={styles.modalButtonText}>Save</Text>
            </TouchableOpacity>
          </>
        );
    }
  }
);

const AccountView = () => {
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
    (title, value, field) => (
      <Field
        key={field}
        title={title}
        value={value}
        onPress={() => handleFieldPress(field)}
      />
    ),
    [handleFieldPress]
  );

  return (
    <SafeAreaView style={styles.safeAreaViewContainer}>
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        <View style={styles.fieldsContainer}>
          {renderField("Name", fieldValues.name, "name")}
          {renderField("Email", fieldValues.email, "email")}
          {renderField("Phone", fieldValues.phone, "phone")}
          {renderField("Change Password", "********", "changePassword")}
          {renderField(
            "Notifications",
            fieldValues.notifications ? "On" : "Off",
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
  );
};

const styles = StyleSheet.create({
  safeAreaViewContainer: {
    height: "100%",
    width: "100%",
    backgroundColor: Colors.white.color,
  },
  scrollViewContainer: {
    flexGrow: 1,
    alignItems: "center",
  },
  fieldsContainer: {
    width: "90%",
    backgroundColor: Colors.lightGreen.color,
    padding: 15,
    borderRadius: 15,
  },
  fieldContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: Colors.lightGreen.color,
    borderBottomWidth: 1,
    borderBottomColor: Colors.white.color,
  },
  fieldTitle: {
    flex: 1,
    fontSize: 16,
  },
  fieldValue: {
    marginRight: 10,
    fontSize: 16,
    color: Colors.darkGreen.color,
  },
  arrowIcon: {
    color: Colors.darkGreen.color,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: Colors.white.color,
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: Colors.lightGreen.color,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  modalButton: {
    backgroundColor: Colors.green.color,
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  modalButtonText: {
    color: Colors.white.color,
    fontWeight: "bold",
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
});

export default AccountView;
