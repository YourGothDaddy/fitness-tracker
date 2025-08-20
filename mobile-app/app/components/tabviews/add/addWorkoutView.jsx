import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Stack } from "expo-router";
import Icon from "../../../../components/Icon";
import CustomField from "../../CustomField";
import CustomButton from "../../CustomButton";
import { Colors } from "../../../../constants/Colors";
import activityService from "@/app/services/activityService";

// Category/Subcategory constants removed

const AddWorkoutView = () => {
  const router = useRouter();
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [duration, setDuration] = useState("");
  const [energy, setEnergy] = useState("");
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().slice(0, 10);
  });
  // Notes removed
  // Category/Subcategory modals removed
  const [dateError, setDateError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [activityTypes, setActivityTypes] = useState([]);
  // Custom workout toggle removed
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
        const res = await activityService.getActivityLevels();
        setCategories(res);
      } catch {
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  // Category/Subcategory selection removed

  const handleDateChange = (text) => {
    setDate(text);
    setDateError("");
  };

  const findMatchingActivityType = (types, input) => {
    if (!input) return null;
    const needle = String(input).trim().toLowerCase();
    if (needle.length === 0) return null;
    const normalized = (t) =>
      String(t?.name ?? t?.Name ?? "")
        .trim()
        .toLowerCase();
    // exact match
    let match = types.find((t) => normalized(t) === needle);
    if (match) return match;
    // unique startsWith
    const starts = types.filter((t) => normalized(t).startsWith(needle));
    if (starts.length === 1) return starts[0];
    // unique includes
    const includes = types.filter((t) => normalized(t).includes(needle));
    if (includes.length === 1) return includes[0];
    return null;
  };

  const handleSubmit = async () => {
    setDateError("");
    setError("");
    setSuccess("");
    if (!subcategory || !duration || !energy || !date) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      setDateError("Invalid date format. Use YYYY-MM-DD.");
      return;
    }
    setIsLoading(true);
    try {
      const foundType = findMatchingActivityType(activityTypes, subcategory);
      const activityTypeId = foundType ? foundType.id ?? foundType.Id : 0; // allow backend to create by title
      const now = new Date();
      const selectedDate = new Date(date);
      const dateWithCurrentTime = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        now.getHours(),
        now.getMinutes(),
        now.getSeconds(),
        now.getMilliseconds()
      );
      const payload = {
        durationInMinutes: duration,
        caloriesBurned: energy,
        activityTypeId,
        title: subcategory,
        date: dateWithCurrentTime,
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

  // Custom workout creation removed

  // currentCategory removed

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
              <Icon
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

          {/* Workout Title only (Category/Subcategory removed) */}
          <Text style={styles.label}>Workout Title</Text>
          <CustomField
            styles={[styles.input]}
            placeholder="e.g., Running, Cycling"
            value={subcategory}
            onChangeText={setSubcategory}
            textInputStyle={{ fontSize: 14 }}
          />

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

          {/* Notes removed */}

          <CustomButton
            title={isLoading ? "Adding..." : "Add Workout"}
            handleOnPress={handleSubmit}
            containerStyles={styles.saveButton}
            textStyles={styles.saveButtonText}
            isLoading={isLoading}
          />
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
