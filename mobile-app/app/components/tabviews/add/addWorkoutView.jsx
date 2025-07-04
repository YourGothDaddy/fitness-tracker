import React, { useState } from "react";
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
  const [time, setTime] = useState(() => {
    const now = new Date();
    return now.toTimeString().slice(0, 5);
  });
  const [notes, setNotes] = useState("");
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [subcategoryModalVisible, setSubcategoryModalVisible] = useState(false);
  const [dateError, setDateError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

  const handleTimeChange = (text) => {
    setTime(text);
  };

  const handleSubmit = async () => {
    setDateError("");
    if (!category || !subcategory || !duration || !energy || !date || !time) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }
    // Validate date (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      setDateError("Invalid date format. Use YYYY-MM-DD.");
      return;
    }
    const dateObj = new Date(date + "T" + time);
    if (isNaN(dateObj.getTime())) {
      setDateError("Invalid date or time.");
      return;
    }
    setIsLoading(true);
    try {
      // Here you would send the workout data to the backend
      // For now, just show a success alert
      Alert.alert("Success", "Workout added successfully!");
      router.back();
    } catch (err) {
      Alert.alert("Error", err.message || "An error occurred.");
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

          <Text style={styles.label}>Start Time (HH:MM):</Text>
          <CustomField
            styles={styles.input}
            placeholder="HH:MM"
            value={time}
            onChangeText={handleTimeChange}
            keyboardType="default"
            textInputStyle={{ fontSize: 14 }}
          />

          <Text style={styles.label}>Notes (optional):</Text>
          <TextInput
            style={[styles.input, { height: 80, textAlignVertical: "top" }]}
            placeholder="Key notes about the workout"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
          />

          <CustomButton
            title={isLoading ? "Adding..." : "Add Workout"}
            handleOnPress={handleSubmit}
            containerStyles={styles.saveButton}
            textStyles={styles.saveButtonText}
            isLoading={isLoading}
          />
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
