import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { Colors } from "../../../../constants/Colors";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";

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
    return (
      <>
        <Text style={styles.modalTitle}>{`Enter ${activeField}`}</Text>
        <TextInput
          style={styles.modalInput}
          value={fieldValues[activeField].toString()}
          onChangeText={(text) => onChangeText(activeField, text)}
          keyboardType={activeField === "sex" ? "default" : "numeric"}
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
);

const ProfileView = () => {
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
    age: "",
    sex: "",
    weight: "",
    height: "",
    bmi: "",
    bodyFat: "",
  });

  const handleFieldPress = useCallback((field) => {
    setActiveField(field);
    setModalVisible(true);
  }, []);

  const handleModalClose = useCallback(
    (newValue) => {
      if (newValue !== undefined) {
        setFieldValues((prevValues) => ({
          ...prevValues,
          [activeField]:
            typeof newValue === "object" ? newValue.nativeEvent.text : newValue,
        }));
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
    <>
      <Stack.Screen
        options={{
          headerShown: hideHeader !== "true",
          title: "Profile",
        }}
      />
      <SafeAreaView style={styles.safeAreaViewContainer}>
        {hideHeader === "true" && (
          <View>
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
          <View style={styles.fieldsContainer}>
            {renderField("Age", fieldValues.age, "age")}
            {renderField("Sex", fieldValues.sex, "sex")}
            {renderField("Weight (kg)", fieldValues.weight, "weight")}
            {renderField("Height (cm)", fieldValues.height, "height")}
            {renderField("Body Mass Index (BMI)", fieldValues.bmi, "bmi")}
            {renderField("Body Fat (%)", fieldValues.bodyFat, "bodyFat")}
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

export default ProfileView;

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
});
