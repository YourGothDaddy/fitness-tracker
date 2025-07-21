import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Modal,
  Pressable,
  Alert,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Stack } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import CustomField from "../../CustomField";
import CustomButton from "../../CustomButton";
import { Colors } from "../../../../constants/Colors";
import activityService from "@/app/services/activityService";

const workoutCategories = [
  {
    name: "Cardio",
    subcategories: [
      "Cycling",
      "Jumping Rope",
      "Running",
      "Swimming",
      "Walking",
    ],
  },
  {
    name: "Gym",
    subcategories: ["Resistance Training", "Circuit Training"],
  },
  {
    name: "Outdoor Activity",
    subcategories: ["Hiking", "Cycling"],
  },
];

const timeOfDayOptions = ["Morning", "Afternoon", "Evening", "Night"];

const AddWorkoutView = () => {
  const router = useRouter();
  const [category, setCategory] = useState(workoutCategories[0].name);
  const [subcategory, setSubcategory] = useState(
    workoutCategories[0].subcategories[0]
  );
  const [duration, setDuration] = useState("");
  const [energy, setEnergy] = useState("");
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().slice(0, 10);
  });
  const [timeOfDay, setTimeOfDay] = useState(timeOfDayOptions[0]);
  const [notes, setNotes] = useState("");
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [subcategoryModalVisible, setSubcategoryModalVisible] = useState(false);
  const [timeOfDayModalVisible, setTimeOfDayModalVisible] = useState(false);
  const [dateError, setDateError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [activityTypes, setActivityTypes] = useState([]);
  const [isCustom, setIsCustom] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const types = await activityService.getActivityTypes();
        setActivityTypes(types);
      } catch (err) {}
    };
    fetchTypes();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Try to fetch categories from backend if available
        const res = await activityService.getActivityLevels(); // Replace with getActivityCategories if available
        setCategories(res);
      } catch {
        setCategories(workoutCategories);
      }
    };
    fetchCategories();
  }, []);

  const handleCategorySelect = (cat) => {
    setCategory(cat.name);
    setSubcategory(cat.subcategories[0]);
    setCategoryModalVisible(false);
  };

  const handleSubcategorySelect = (sub) => {
    setSubcategory(sub);
    setSubcategoryModalVisible(false);
  };

  const handleDateChange = (text) => {
    setDate(text);
    setDateError("");
  };

  const handleSubmit = async () => {
    setDateError("");
    setError("");
    setSuccess("");
    if (
      !category ||
      !subcategory ||
      !duration ||
      !energy ||
      !date ||
      !timeOfDay
    ) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }
    // Validate date (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      setDateError("Invalid date format. Use YYYY-MM-DD.");
      return;
    }
    setIsLoading(true);
    try {
      // Find the correct activityTypeId from the fetched types
      const foundType = activityTypes.find(
        (t) => t.name === subcategory && t.category === category
      );
      const activityTypeId = foundType ? foundType.id : null;
      if (!activityTypeId) {
        setError("Could not find a matching activity type.");
        setIsLoading(false);
        return;
      }
      const payload = {
        durationInMinutes: duration,
        timeOfDay,
        caloriesBurned: energy,
        activityTypeId,
        date,
        notes,
        isPublic: true,
      };
      await activityService.addActivity(payload);
      setSuccess("Workout added successfully!");
      Alert.alert("Success", "Workout added successfully!");
      router.back();
    } catch (err) {
      setError(
        err?.response?.data?.message || err.message || "An error occurred."
      );
      Alert.alert(
        "Error",
        err?.response?.data?.message || err.message || "An error occurred."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomCreate = async () => {
    setError("");
    setSuccess("");
    if (!category || !subcategory) {
      Alert.alert("Error", "Please select category and subcategory.");
      return;
    }
    setIsLoading(true);
    try {
      // Find categoryId (simulate or map if needed)
      let activityCategoryId = 1;
      if (categories && categories.length > 0) {
        const found = categories.find(
          (c) => c.name === category || c.Name === category
        );
        activityCategoryId = found?.id || found?.Id || 1;
      }
      const payload = {
        name: subcategory,
        activityCategoryId,
        calories: energy ? parseInt(energy) : null,
      };
      console.log("Creating custom activity type with:", payload);
      await activityService.createCustomActivityType(payload);
      setSuccess("Custom workout created! It will appear in your Custom tab.");
      Alert.alert(
        "Success",
        "Custom workout created! It will appear in your Custom tab."
      );
      setIsCustom(false);
    } catch (err) {
      setError(
        err?.response?.data?.message || err.message || "An error occurred."
      );
      Alert.alert(
        "Error",
        err?.response?.data?.message || err.message || "An error occurred."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const currentCategory = workoutCategories.find(
    (cat) => cat.name === category
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safeAreaView}>
        <View style={styles.header}>
          <Text style={styles.appTitle}>Fitlicious</Text>
          <View style={styles.arrowRow}>
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
        </View>
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Add Workout</Text>

          {/* Category Picker */}
          <Text style={styles.label}>Workout Category</Text>
          <Pressable
            onPress={() => setCategoryModalVisible(true)}
            style={[styles.input, { justifyContent: "center" }]}
          >
            <Text style={styles.pickerValue}>{category}</Text>
          </Pressable>
          <Modal
            visible={categoryModalVisible}
            transparent
            animationType="fade"
          >
            <Pressable
              style={styles.modalOverlay}
              onPress={() => setCategoryModalVisible(false)}
            >
              <View style={styles.modalContent}>
                {workoutCategories.map((cat) => (
                  <TouchableOpacity
                    key={cat.name}
                    style={styles.modalOption}
                    onPress={() => handleCategorySelect(cat)}
                  >
                    <Text style={styles.modalOptionText}>{cat.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Pressable>
          </Modal>

          {/* Subcategory Picker */}
          <Text style={styles.label}>Workout Subcategory</Text>
          <Pressable
            onPress={() => setSubcategoryModalVisible(true)}
            style={[styles.input, { justifyContent: "center" }]}
          >
            <Text style={styles.pickerValue}>{subcategory}</Text>
          </Pressable>
          <Modal
            visible={subcategoryModalVisible}
            transparent
            animationType="fade"
          >
            <Pressable
              style={styles.modalOverlay}
              onPress={() => setSubcategoryModalVisible(false)}
            >
              <View style={styles.modalContent}>
                {currentCategory.subcategories.map((sub) => (
                  <TouchableOpacity
                    key={sub}
                    style={styles.modalOption}
                    onPress={() => handleSubcategorySelect(sub)}
                  >
                    <Text style={styles.modalOptionText}>{sub}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Pressable>
          </Modal>

          <View style={styles.row}>
            <CustomField
              styles={[styles.input, { flex: 1 }]}
              placeholder="Duration (minutes)"
              value={duration}
              onChangeText={setDuration}
              numeric
              allowDecimal={false}
              textInputStyle={{ fontSize: 14 }}
            />
            <CustomField
              styles={[styles.input, { flex: 1, marginLeft: 8 }]}
              placeholder="Energy burned (kcal)"
              value={energy}
              onChangeText={setEnergy}
              numeric
              allowDecimal={false}
              textInputStyle={{ fontSize: 14 }}
            />
          </View>

          <Text style={styles.label}>Date (YYYY-MM-DD):</Text>
          <CustomField
            styles={[styles.input, dateError && { borderColor: "red" }]}
            placeholder="YYYY-MM-DD"
            value={date}
            onChangeText={handleDateChange}
            keyboardType="default"
            textInputStyle={{ fontSize: 14 }}
          />
          {dateError ? (
            <Text style={{ color: "red", marginBottom: 10 }}>{dateError}</Text>
          ) : null}

          {/* Time of Day Picker */}
          <Text style={styles.label}>Time of Day</Text>
          <Pressable
            onPress={() => setTimeOfDayModalVisible(true)}
            style={[styles.input, { justifyContent: "center" }]}
          >
            <Text style={styles.pickerValue}>{timeOfDay}</Text>
          </Pressable>
          <Modal
            visible={timeOfDayModalVisible}
            transparent
            animationType="fade"
          >
            <Pressable
              style={styles.modalOverlay}
              onPress={() => setTimeOfDayModalVisible(false)}
            >
              <View style={styles.modalContent}>
                {timeOfDayOptions.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={styles.modalOption}
                    onPress={() => {
                      setTimeOfDay(option);
                      setTimeOfDayModalVisible(false);
                    }}
                  >
                    <Text style={styles.modalOptionText}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Pressable>
          </Modal>

          <Text style={styles.label}>Notes (optional):</Text>
          <TextInput
            style={[styles.input, { height: 80, textAlignVertical: "top" }]}
            placeholder="Key notes about the workout"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
          />

          <Text style={styles.label}>Add as Custom Workout?</Text>
          <TouchableOpacity
            style={{
              marginBottom: 14,
              backgroundColor: isCustom ? Colors.darkGreen.color : "#eee",
              borderRadius: 8,
              padding: 10,
            }}
            onPress={() => setIsCustom((prev) => !prev)}
          >
            <Text
              style={{
                color: isCustom ? "#fff" : Colors.darkGreen.color,
                textAlign: "center",
              }}
            >
              {isCustom
                ? "Will be added as custom workout"
                : "Tap to add as custom workout"}
            </Text>
          </TouchableOpacity>
          {isCustom ? (
            <CustomButton
              title={isLoading ? "Adding..." : "Add Custom Workout"}
              handleOnPress={handleCustomCreate}
              containerStyles={styles.saveButton}
              textStyles={styles.saveButtonText}
              isLoading={isLoading}
            />
          ) : (
            <CustomButton
              title={isLoading ? "Adding..." : "Add Workout"}
              handleOnPress={handleSubmit}
              containerStyles={styles.saveButton}
              textStyles={styles.saveButtonText}
              isLoading={isLoading}
            />
          )}
          {error ? (
            <Text style={{ color: "red", textAlign: "center", marginTop: 10 }}>
              {error}
            </Text>
          ) : null}
          {success ? (
            <Text
              style={{ color: "green", textAlign: "center", marginTop: 10 }}
            >
              {success}
            </Text>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: Colors.white.color,
  },
  header: {
    position: "relative",
  },
  appTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: Colors.green.color,
    textAlign: "center",
    marginTop: 30,
    marginBottom: 10,
  },
  arrowRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  backButton: {
    paddingLeft: 20,
    paddingBottom: 10,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.darkGreen.color,
    marginBottom: 20,
    marginTop: 10,
    textAlign: "center",
  },
  input: {
    marginBottom: 14,
    backgroundColor: "#F8FAF5",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  saveButton: {
    marginTop: 24,
    backgroundColor: Colors.darkGreen.color,
    borderRadius: 14,
    paddingVertical: 16,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  label: {
    fontSize: 12,
    color: Colors.darkGreen.color,
    marginBottom: 4,
    fontWeight: "500",
  },
  pickerValue: {
    fontSize: 16,
    color: Colors.darkGreen.color,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: Colors.white.color,
    borderRadius: 16,
    padding: 20,
    minWidth: "70%",
    elevation: 5,
  },
  modalOption: {
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  modalOptionText: {
    fontSize: 16,
    color: Colors.darkGreen.color,
  },
});

export default AddWorkoutView;
