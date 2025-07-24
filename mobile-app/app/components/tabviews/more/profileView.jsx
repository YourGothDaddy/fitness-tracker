import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { Colors } from "../../../../constants/Colors";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import userService from "@/app/services/userService";
import weightService from "@/app/services/weightService";

const Field = React.memo(({ title, value, onPress, icon, unit }) => (
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
      <View style={styles.valueContainer}>
        <Text style={styles.fieldValue}>{value || "–"}</Text>
        {unit && <Text style={styles.unitText}>{unit}</Text>}
      </View>
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
  ({
    activeField,
    fieldValues,
    onChangeText,
    onSave,
    weightDate,
    setWeightDate,
    weightDateError,
  }) => {
    if (activeField === "sex") {
      return (
        <>
          <Text style={styles.modalTitle}>Select Sex</Text>
          <View style={styles.sexButtonsContainer}>
            <TouchableOpacity
              style={[
                styles.sexButton,
                fieldValues.sex === "Male" && styles.sexButtonSelected,
              ]}
              onPress={() => onSave("Male")}
            >
              <MaterialIcons
                name="male"
                size={24}
                color={
                  fieldValues.sex === "Male"
                    ? Colors.white.color
                    : Colors.darkGreen.color
                }
              />
              <Text
                style={[
                  styles.sexButtonText,
                  fieldValues.sex === "Male" && styles.sexButtonTextSelected,
                ]}
              >
                Male
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.sexButton,
                fieldValues.sex === "Female" && styles.sexButtonSelected,
              ]}
              onPress={() => onSave("Female")}
            >
              <MaterialIcons
                name="female"
                size={24}
                color={
                  fieldValues.sex === "Female"
                    ? Colors.white.color
                    : Colors.darkGreen.color
                }
              />
              <Text
                style={[
                  styles.sexButtonText,
                  fieldValues.sex === "Female" && styles.sexButtonTextSelected,
                ]}
              >
                Female
              </Text>
            </TouchableOpacity>
          </View>
        </>
      );
    }
    if (activeField === "weight") {
      return (
        <>
          <Text style={styles.modalTitle}>Enter Weight</Text>
          <TextInput
            style={styles.modalInput}
            value={fieldValues.weight.toString()}
            onChangeText={(text) => onChangeText("weight", text)}
            keyboardType="numeric"
            autoFocus
          />
          <Text style={{ marginBottom: 5, color: Colors.darkGreen.color }}>
            Date (YYYY-MM-DD):
          </Text>
          <TextInput
            style={[
              styles.modalInput,
              weightDateError && { borderColor: "red" },
            ]}
            value={weightDate}
            onChangeText={setWeightDate}
            placeholder="YYYY-MM-DD"
            keyboardType="default"
          />
          {weightDateError ? (
            <Text style={{ color: "red", marginBottom: 10 }}>
              {weightDateError}
            </Text>
          ) : null}
          <TouchableOpacity
            style={styles.modalButton}
            onPress={() => onSave(fieldValues.weight, weightDate)}
          >
            <Text style={styles.modalButtonText}>Save</Text>
          </TouchableOpacity>
        </>
      );
    }

    return (
      <>
        <Text style={styles.modalTitle}>{`Enter ${activeField}`}</Text>
        <TextInput
          style={styles.modalInput}
          value={fieldValues[activeField].toString()}
          onChangeText={(text) => onChangeText(activeField, text)}
          keyboardType="numeric"
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
    fullName: "",
    email: "",
    phoneNumber: "",
    age: "",
    sex: "",
    weight: "",
    height: "",
    bmi: "",
    bodyFat: "",
    activityLevelId: 1,
    includeTef: false,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [weightDate, setWeightDate] = useState(() => {
    const today = new Date();
    return today.toISOString().slice(0, 10);
  });
  const [weightDateError, setWeightDateError] = useState("");

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setIsLoading(true);
      const profileData = await userService.getProfileData();
      setFieldValues({
        fullName: profileData.fullName || "",
        email: profileData.email || "",
        phoneNumber: profileData.phoneNumber || "",
        age: profileData.age?.toString() || "",
        sex: profileData.sex || "",
        weight: profileData.weight?.toString() || "",
        height: profileData.height?.toString() || "",
        bmi: profileData.bmi?.toString() || "",
        bodyFat: profileData.bodyFat?.toString() || "",
        activityLevelId: profileData.activityLevelId ?? 1,
        includeTef: profileData.includeTef ?? false,
      });
    } catch (error) {
      if (error.response) {
      }
      Alert.alert(
        "Error",
        "Failed to load profile data. Please try again later."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFieldPress = useCallback((field) => {
    setActiveField(field);
    if (field === "weight") {
      const today = new Date();
      setWeightDate(today.toISOString().slice(0, 10));
      setWeightDateError("");
    }
    setModalVisible(true);
  }, []);

  const handleModalClose = useCallback(
    async (newValue, newDate) => {
      if (newValue !== undefined) {
        if (activeField === "weight") {
          // Validate date (YYYY-MM-DD)
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
          if (!dateRegex.test(newDate)) {
            setWeightDateError("Invalid date format. Use YYYY-MM-DD.");
            return;
          }
          const dateObj = new Date(newDate);
          if (isNaN(dateObj.getTime())) {
            setWeightDateError("Invalid date.");
            return;
          }
          setWeightDateError("");
          try {
            await weightService.addWeightRecord(dateObj, parseFloat(newValue));
            await loadProfileData();
          } catch (error) {
            Alert.alert("Error", "Failed to update weight. Please try again.");
          }
        } else {
          const updatedValues = {
            ...fieldValues,
            [activeField]:
              typeof newValue === "object"
                ? newValue.nativeEvent.text
                : newValue,
          };
          setFieldValues(updatedValues);
          try {
            await userService.updateProfileData({
              fullName: updatedValues.fullName || "",
              email: updatedValues.email || "",
              phoneNumber: updatedValues.phoneNumber || "",
              age: parseInt(updatedValues.age) || 0,
              sex: updatedValues.sex || "",
              weight: parseFloat(updatedValues.weight) || 0,
              height: parseFloat(updatedValues.height) || 0,
              activityLevelId: updatedValues.activityLevelId ?? 1,
              includeTef: updatedValues.includeTef ?? false,
            });
            await loadProfileData();
          } catch (error) {
            Alert.alert(
              "Error",
              "Failed to update profile data. Please try again."
            );
            await loadProfileData();
          }
        }
      }
      setModalVisible(false);
    },
    [activeField, fieldValues, weightDate]
  );

  const handleChangeText = useCallback((field, text) => {
    setFieldValues((prevValues) => ({ ...prevValues, [field]: text }));
  }, []);

  const renderField = useCallback(
    (title, value, field, icon, unit) => (
      <Field
        key={field}
        title={title}
        value={value}
        icon={icon}
        unit={unit}
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
          {isLoading ? (
            <View style={styles.loadingContentContainer}>
              <ActivityIndicator size="large" color={Colors.darkGreen.color} />
            </View>
          ) : (
            <>
              <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>
                    {fieldValues.bmi && !isNaN(Number(fieldValues.bmi))
                      ? Number(fieldValues.bmi).toFixed(1)
                      : "–"}
                  </Text>
                  <Text style={styles.statLabel}>BMI</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>
                    {fieldValues.bodyFat && !isNaN(Number(fieldValues.bodyFat))
                      ? Number(fieldValues.bodyFat).toFixed(1)
                      : "–"}
                    %
                  </Text>
                  <Text style={styles.statLabel}>Body Fat</Text>
                </View>
              </View>

              <View style={styles.sectionTitle}>
                <MaterialIcons
                  name="person-outline"
                  size={24}
                  color={Colors.darkGreen.color}
                />
                <Text style={styles.sectionTitleText}>Basic Information</Text>
              </View>

              <View style={styles.fieldsContainer}>
                {renderField("Age", fieldValues.age, "age", "cake", "years")}
                {renderField("Sex", fieldValues.sex, "sex", "wc")}
              </View>

              <View style={styles.sectionTitle}>
                <MaterialIcons
                  name="straighten"
                  size={24}
                  color={Colors.darkGreen.color}
                />
                <Text style={styles.sectionTitleText}>Body Measurements</Text>
              </View>

              <View style={styles.fieldsContainer}>
                {renderField(
                  "Weight",
                  fieldValues.weight,
                  "weight",
                  "monitor-weight",
                  "kg"
                )}
                {renderField(
                  "Height",
                  fieldValues.height,
                  "height",
                  "height",
                  "cm"
                )}
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => handleModalClose()}
      >
        <TouchableOpacity
          style={styles.modalContainer}
          activeOpacity={1}
          onPress={() => handleModalClose()}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <ModalContent
              activeField={activeField}
              fieldValues={fieldValues}
              onChangeText={handleChangeText}
              onSave={handleModalClose}
              weightDate={weightDate}
              setWeightDate={setWeightDate}
              weightDateError={weightDateError}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

export default ProfileView;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.white.color,
  },
  header: {
    position: "relative",
  },
  backButton: {
    paddingLeft: 20,
  },
  safeAreaViewContainer: {
    flex: 1,
    backgroundColor: Colors.white.color,
  },
  scrollViewContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 20,
    gap: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.lightGreen.color,
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.darkGreen.color,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
  },
  sectionTitle: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 15,
    gap: 10,
  },
  sectionTitleText: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.darkGreen.color,
  },
  fieldsContainer: {
    gap: 10,
    marginBottom: 20,
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
  valueContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  fieldValue: {
    fontSize: 16,
    color: Colors.darkGreen.color,
    fontWeight: "600",
  },
  unitText: {
    fontSize: 12,
    color: "#666",
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
  },
  modalButtonText: {
    color: Colors.white.color,
    fontWeight: "bold",
    fontSize: 16,
  },
  sexButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    gap: 15,
    marginBottom: 20,
  },
  sexButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 10,
    backgroundColor: Colors.lightGreen.color,
    gap: 10,
    borderWidth: 2,
    borderColor: Colors.darkGreen.color,
  },
  sexButtonSelected: {
    backgroundColor: Colors.darkGreen.color,
  },
  sexButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.darkGreen.color,
  },
  sexButtonTextSelected: {
    color: Colors.white.color,
  },
  loadingContentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 200,
  },
});
