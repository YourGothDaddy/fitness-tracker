import React, { useCallback, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { Colors } from "../../../../constants/Colors";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import goalsService from "@/app/services/goalsService";

const TargetCard = ({ title, description, icon, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.targetCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.menuIconContainer}>
        <MaterialIcons name={icon} size={32} color={Colors.darkGreen.color} />
      </View>
      <View style={styles.menuTextContainer}>
        <Text style={styles.menuTitle}>{title}</Text>
        <Text style={styles.menuDescription}>{description}</Text>
      </View>
      <MaterialIcons
        name="chevron-right"
        size={24}
        color={Colors.darkGreen.color}
      />
    </TouchableOpacity>
  );
};

const GoalBadge = ({ value, label, onPress }) => {
  return (
    <TouchableOpacity style={styles.statCard} onPress={onPress}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </TouchableOpacity>
  );
};

const EditGoalModal = ({ visible, onClose, title, value, onSave }) => {
  const [inputValue, setInputValue] = useState(value.toString());

  const handleSave = () => {
    const numericValue = parseInt(inputValue);
    if (isNaN(numericValue) || numericValue < 0) {
      Alert.alert("Invalid Value", "Please enter a valid positive number");
      return;
    }
    onSave(numericValue);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{title}</Text>
          <TextInput
            style={styles.input}
            value={inputValue}
            onChangeText={setInputValue}
            keyboardType="numeric"
            placeholder="Enter value"
            placeholderTextColor="#666"
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton]}
              onPress={handleSave}
            >
              <Text style={[styles.buttonText, styles.saveButtonText]}>
                Save
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const TargetsView = () => {
  const router = useRouter();
  const { hideHeader } = useLocalSearchParams();
  const [goals, setGoals] = useState({
    dailyCaloriesGoal: 0,
    dailyProteinGoal: 0,
  });
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState({
    visible: false,
    type: null,
    value: 0,
  });

  const fetchGoals = useCallback(async () => {
    try {
      const data = await goalsService.getUserGoals();
      setGoals(data);
    } catch (error) {
      setError("Failed to fetch goals");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const handleTargetPress = useCallback(
    (href) => {
      router.push({
        pathname: href,
        params: { hideHeader: "true" },
      });
    },
    [router]
  );

  const handleGoalPress = (type) => {
    setEditModal({
      visible: true,
      type,
      value:
        type === "calories" ? goals.dailyCaloriesGoal : goals.dailyProteinGoal,
    });
  };

  const handleSaveGoal = async (value) => {
    try {
      const updatedGoals = {
        dailyCaloriesGoal:
          editModal.type === "calories" ? value : goals.dailyCaloriesGoal,
        dailyProteinGoal:
          editModal.type === "protein" ? value : goals.dailyProteinGoal,
      };
      await goalsService.updateUserGoals(updatedGoals);
      setGoals(updatedGoals);
    } catch (error) {
      setError("Failed to update goals");
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: hideHeader !== "true",
          title: "Targets",
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
          <View style={styles.profilePreview}>
            <View style={styles.statsContainer}>
              <GoalBadge
                value={goals.dailyCaloriesGoal}
                label="Daily Calories"
                onPress={() => handleGoalPress("calories")}
              />
              <GoalBadge
                value={goals.dailyProteinGoal}
                label="Protein Goal"
                onPress={() => handleGoalPress("protein")}
              />
            </View>
          </View>

          <View style={styles.sectionTitle}>
            <MaterialIcons
              name="track-changes"
              size={24}
              color={Colors.darkGreen.color}
            />
            <Text style={styles.sectionTitleText}>Customize Your Targets</Text>
          </View>

          <View style={styles.menuContainer}>
            <TargetCard
              title="Macro Targets"
              description="Set your protein, carbs, and fat goals"
              icon="pie-chart"
              onPress={() =>
                handleTargetPress("/components/tabviews/more/targets/macroView")
              }
            />

            <TargetCard
              title="Energy Settings"
              description="Configure your daily calorie targets"
              icon="flash-on"
              onPress={() =>
                handleTargetPress(
                  "/components/tabviews/more/targets/energySettingsView"
                )
              }
            />

            <TargetCard
              title="Nutrient Targets"
              description="Customize vitamin and mineral goals"
              icon="local-dining"
              onPress={() =>
                handleTargetPress(
                  "/components/tabviews/more/targets/nutrientTargetsView"
                )
              }
            />
          </View>
        </ScrollView>

        <EditGoalModal
          visible={editModal.visible}
          onClose={() => setEditModal({ visible: false, type: null, value: 0 })}
          title={`Edit ${
            editModal.type === "calories" ? "Daily Calories" : "Protein"
          } Goal`}
          value={editModal.value}
          onSave={handleSaveGoal}
        />
      </SafeAreaView>
    </>
  );
};

export default TargetsView;

const styles = StyleSheet.create({
  safeAreaViewContainer: {
    flex: 1,
    backgroundColor: Colors.white.color,
  },
  header: {
    position: "relative",
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGreen.color,
  },
  backButton: {
    paddingLeft: 20,
  },
  scrollViewContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  profilePreview: {
    paddingVertical: 30,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.lightGreen.color,
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
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
    textAlign: "center",
  },
  sectionTitle: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 10,
  },
  sectionTitleText: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.darkGreen.color,
  },
  menuContainer: {
    gap: 15,
  },
  targetCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    backgroundColor: Colors.white.color,
    borderRadius: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  menuIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.lightGreen.color,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.darkGreen.color,
    marginBottom: 5,
  },
  menuDescription: {
    fontSize: 14,
    color: "#666",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: Colors.white.color,
    borderRadius: 15,
    padding: 20,
    width: "80%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.darkGreen.color,
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.lightGreen.color,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
  },
  saveButton: {
    backgroundColor: Colors.darkGreen.color,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  saveButtonText: {
    color: Colors.white.color,
  },
});
