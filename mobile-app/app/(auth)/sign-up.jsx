import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Keyboard,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import React, { useState, useEffect } from "react";
import { Colors } from "@/constants/Colors";
import Slider from "@react-native-community/slider";
import Checkbox from "expo-checkbox";
import CustomField from "@/app/components/CustomField";
import CustomButton from "@/app/components/CustomButton";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { BlurView } from "expo-blur";
import axios from "axios";
import { API_URL } from "@/constants/Config";

const validateStage = (stage, data) => {
  switch (stage) {
    case 1:
      if (!data.gender) return "Please select your gender";
      if (!data.weight) return "Please enter your weight";
      if (!data.height) return "Please enter your height";
      if (!data.age) return "Please enter your age";
      if (isNaN(data.weight) || data.weight <= 0)
        return "Please enter a valid weight";
      if (isNaN(data.height) || data.height <= 0)
        return "Please enter a valid height";
      if (isNaN(data.age) || data.age <= 0) return "Please enter a valid age";
      break;
    case 4:
      if (!data.name.trim()) return "Please enter your full name";
      if (!data.email.trim()) return "Please enter your email";
      if (!data.password) return "Please enter a password";
      if (!data.confirmPassword) return "Please confirm your password";
      if (data.password !== data.confirmPassword)
        return "Passwords do not match";
      if (data.password.length < 6)
        return "Password must be at least 6 characters long";
      if (!/\S+@\S+\.\S+/.test(data.email))
        return "Please enter a valid email address";
      break;
  }
  return null;
};

const SignUp = () => {
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [currentStage, setCurrentStage] = useState(1);

  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [activity, setActivity] = useState(0);
  const [weightGoal, setWeightGoal] = useState(0);
  const [manualKcal, setManualKcal] = useState(false);
  const [kcalGoal, setKcalGoal] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const activityLevels = [
    "No activity",
    "Sedentary",
    "Lightly Active",
    "Moderately Active",
    "Very Active",
  ];

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  const renderStageContent = () => {
    switch (currentStage) {
      case 1:
        return (
          <Animated.View
            entering={FadeIn}
            exiting={FadeOut}
            style={styles.stageWrapper}
          >
            <BlurView intensity={20} tint="light" style={styles.glassCard}>
              <View style={styles.contentWrapper}>
                <View style={styles.decorativeCircle} />
                <View style={styles.decorativeCircle2} />

                <Text style={styles.stageTitle}>Basic Information</Text>
                <View style={styles.inputWrapper}>
                  <View style={styles.genderContainer}>
                    <Text style={styles.genderLabel}>Gender</Text>
                    <View style={styles.genderButtonsContainer}>
                      <TouchableOpacity
                        style={[
                          styles.genderButton,
                          gender === "male" && styles.genderButtonActive,
                        ]}
                        onPress={() => setGender("male")}
                      >
                        <MaterialCommunityIcons
                          name="gender-male"
                          size={24}
                          color={
                            gender === "male" ? "#fff" : Colors.darkGreen.color
                          }
                        />
                        <Text
                          style={[
                            styles.genderButtonText,
                            gender === "male" && styles.genderButtonTextActive,
                          ]}
                        >
                          Male
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.genderButton,
                          gender === "female" && styles.genderButtonActive,
                        ]}
                        onPress={() => setGender("female")}
                      >
                        <MaterialCommunityIcons
                          name="gender-female"
                          size={24}
                          color={
                            gender === "female"
                              ? "#fff"
                              : Colors.darkGreen.color
                          }
                        />
                        <Text
                          style={[
                            styles.genderButtonText,
                            gender === "female" &&
                              styles.genderButtonTextActive,
                          ]}
                        >
                          Female
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.inputContainer}>
                    <MaterialCommunityIcons
                      name="scale"
                      size={24}
                      color={Colors.darkGreen.color}
                    />
                    <CustomField
                      styles={styles.input}
                      placeholder="Weight (kg)"
                      value={weight}
                      onChangeText={setWeight}
                      numeric={true}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <MaterialCommunityIcons
                      name="human-male-height"
                      size={24}
                      color={Colors.darkGreen.color}
                    />
                    <CustomField
                      styles={styles.input}
                      placeholder="Height (cm)"
                      value={height}
                      onChangeText={setHeight}
                      numeric={true}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <MaterialCommunityIcons
                      name="calendar"
                      size={24}
                      color={Colors.darkGreen.color}
                    />
                    <CustomField
                      styles={styles.input}
                      placeholder="Age"
                      value={age}
                      onChangeText={setAge}
                      numeric={true}
                    />
                  </View>
                </View>
              </View>
            </BlurView>
          </Animated.View>
        );
      case 2:
        return (
          <Animated.View
            entering={FadeIn}
            exiting={FadeOut}
            style={styles.stageWrapper}
          >
            <BlurView intensity={20} tint="light" style={styles.glassCard}>
              <View style={styles.contentWrapper}>
                <Text style={styles.stageTitle}>Activity Level</Text>
                <View style={styles.activityDisplay}>
                  <Text style={styles.activityText}>
                    {activityLevels[activity]}
                  </Text>

                  <View style={styles.activityVisualization}>
                    {[0, 1, 2, 3, 4].map((level) => (
                      <View
                        key={level}
                        style={[
                          styles.activityBar,
                          level <= activity && styles.activityBarActive,
                        ]}
                      />
                    ))}
                  </View>

                  <Slider
                    style={styles.customSlider}
                    minimumValue={0}
                    maximumValue={4}
                    step={1}
                    value={activity}
                    onValueChange={setActivity}
                    minimumTrackTintColor={Colors.green.color}
                    maximumTrackTintColor={Colors.lightGreen.color}
                    thumbTintColor={Colors.darkGreen.color}
                  />

                  <View style={styles.activityIconsRow}>
                    {activityLevels.map((_, index) => (
                      <MaterialCommunityIcons
                        key={index}
                        name={
                          index === 0
                            ? "sleep"
                            : index === 1
                            ? "walk"
                            : index === 2
                            ? "run"
                            : index === 3
                            ? "bike"
                            : "weight-lifter"
                        }
                        size={24}
                        color={
                          index <= activity
                            ? Colors.darkGreen.color
                            : Colors.lightGreen.color
                        }
                      />
                    ))}
                  </View>
                </View>
              </View>
            </BlurView>
          </Animated.View>
        );
      case 3:
        return (
          <Animated.View
            entering={FadeIn.duration(400)}
            exiting={FadeOut.duration(400)}
            style={styles.stageWrapper}
          >
            <BlurView intensity={20} tint="light" style={styles.glassCard}>
              <View style={styles.contentWrapper}>
                <Text style={styles.stageTitle}>Weight Goal</Text>
                <View style={styles.weightGoalContainer}>
                  {!manualKcal && (
                    <>
                      <Text style={styles.weightGoalValue}>
                        {weightGoal === 0
                          ? "Maintain Weight"
                          : weightGoal < 0
                          ? `Lose ${Math.abs(weightGoal).toFixed(1)}kg/week`
                          : `Gain ${weightGoal.toFixed(1)}kg/week`}
                      </Text>

                      <View style={styles.goalVisualization}>
                        <MaterialCommunityIcons
                          name={
                            weightGoal < 0
                              ? "trending-down"
                              : weightGoal > 0
                              ? "trending-up"
                              : "trending-neutral"
                          }
                          size={32}
                          color={Colors.darkGreen.color}
                        />
                      </View>

                      <Slider
                        style={styles.customSlider}
                        minimumValue={-1}
                        maximumValue={1}
                        step={0.1}
                        value={weightGoal}
                        onValueChange={setWeightGoal}
                        minimumTrackTintColor={Colors.red.color}
                        maximumTrackTintColor={Colors.green.color}
                        thumbTintColor={Colors.darkGreen.color}
                      />

                      <View style={styles.sliderLabels}>
                        <Text style={styles.sliderLabel}>Loss</Text>
                        <Text style={styles.sliderLabel}>Maintain</Text>
                        <Text style={styles.sliderLabel}>Gain</Text>
                      </View>
                    </>
                  )}

                  <View style={styles.checkboxContainer}>
                    <Checkbox
                      value={manualKcal}
                      onValueChange={setManualKcal}
                      color={manualKcal ? Colors.darkGreen.color : undefined}
                    />
                    <Text style={styles.checkboxLabel}>
                      Set custom calorie goal
                    </Text>
                  </View>

                  {manualKcal && (
                    <View style={styles.manualKcalContainer}>
                      <View style={styles.inputContainer}>
                        <MaterialCommunityIcons
                          name="fire"
                          size={24}
                          color={Colors.darkGreen.color}
                        />
                        <CustomField
                          styles={styles.input}
                          placeholder="Daily calorie goal"
                          value={kcalGoal}
                          onChangeText={setKcalGoal}
                          numeric={true}
                        />
                      </View>
                    </View>
                  )}
                </View>
              </View>
            </BlurView>
          </Animated.View>
        );
      case 4:
        return (
          <Animated.View
            entering={FadeIn.duration(400)}
            exiting={FadeOut.duration(400)}
            style={styles.stageWrapper}
          >
            <BlurView intensity={20} tint="light" style={styles.glassCard}>
              <View style={styles.contentWrapper}>
                <Text style={styles.stageTitle}>Create Account</Text>
                <View style={styles.accountInputs}>
                  <View style={styles.inputContainer}>
                    <MaterialCommunityIcons
                      name="account"
                      size={24}
                      color={Colors.darkGreen.color}
                    />
                    <CustomField
                      styles={styles.input}
                      placeholder="Full Name"
                      value={name}
                      onChangeText={setName}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <MaterialCommunityIcons
                      name="email"
                      size={24}
                      color={Colors.darkGreen.color}
                    />
                    <CustomField
                      styles={styles.input}
                      placeholder="Email Address"
                      value={email}
                      onChangeText={setEmail}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <MaterialCommunityIcons
                      name="lock"
                      size={24}
                      color={Colors.darkGreen.color}
                    />
                    <CustomField
                      styles={styles.input}
                      placeholder="Password"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={true}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <MaterialCommunityIcons
                      name="lock-check"
                      size={24}
                      color={Colors.darkGreen.color}
                    />
                    <CustomField
                      styles={styles.input}
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={true}
                    />
                  </View>
                </View>
              </View>
            </BlurView>
          </Animated.View>
        );
      default:
        return null;
    }
  };

  const handleContinue = async () => {
    if (currentStage === 4) {
      try {
        // Prepare registration data
        const registrationData = {
          fullName: name,
          email: email,
          password: password,
          gender: gender === "male" ? 1 : 2,
          weight: parseFloat(weight),
          height: parseFloat(height),
          age: parseInt(age),
          activityLevelId: activity + 1,
          weeklyWeightChangeGoal: manualKcal ? 0 : weightGoal,
          dailyCalorieGoal: manualKcal ? parseInt(kcalGoal) : null,
        };

        // Add explicit headers
        const response = await axios.post(
          `${API_URL}/api/auth/register`,
          registrationData,
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            timeout: 5000, // 5 second timeout
          }
        );

        if (response.status === 200) {
          Alert.alert("Success", "Registration successful!", [
            { text: "OK", onPress: () => router.push("/dashboard") },
          ]);
        }
      } catch (error) {
        Alert.alert(
          "Registration Failed",
          `Error: ${
            error.response?.data?.message || error.message || "Network error"
          }`
        );
      }
    } else {
      setCurrentStage(currentStage + 1);
    }
  };

  const handleGoBack = () => {
    if (currentStage > 1) {
      setCurrentStage(currentStage - 1);
    } else {
      router.push("/");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#e8f5e9", "#ffffff", "#e8f5e9"]}
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.logoCircle}>
              <MaterialCommunityIcons
                name="leaf"
                size={40}
                color={Colors.darkGreen.color}
              />
            </View>
            <Text style={styles.appTitle}>Fitlicious</Text>
          </View>

          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            {[1, 2, 3, 4].map((stage) => (
              <View key={stage} style={styles.progressItem}>
                <View
                  style={[
                    styles.progressCircle,
                    currentStage >= stage && styles.activeProgress,
                  ]}
                >
                  <Text
                    style={[
                      styles.progressNumber,
                      currentStage >= stage && styles.activeProgressNumber,
                    ]}
                  >
                    {stage}
                  </Text>
                </View>
                {stage < 4 && (
                  <View
                    style={[
                      styles.progressLine,
                      currentStage > stage && styles.activeProgressLine,
                    ]}
                  />
                )}
              </View>
            ))}
          </View>

          {/* Main Content */}
          {renderStageContent()}

          {/* Navigation Buttons */}
          {!isKeyboardVisible && (
            <View style={styles.buttonContainer}>
              <CustomButton
                title={currentStage === 4 ? "Start Journey" : "Next Step"}
                containerStyles={styles.nextButton}
                textStyles={styles.nextButtonText}
                handleOnPress={handleContinue}
              />
              <CustomButton
                title="Go Back"
                containerStyles={styles.backButton}
                textStyles={styles.backButtonText}
                handleOnPress={handleGoBack}
              />
            </View>
          )}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default SignUp;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 30,
  },
  appTitle: {
    fontSize: 36,
    fontWeight: "800",
    color: Colors.darkGreen.color,
    letterSpacing: 1,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 15,
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  progressItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  progressCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: Colors.lightGreen.color,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activeProgress: {
    backgroundColor: Colors.darkGreen.color,
    borderColor: Colors.darkGreen.color,
  },
  progressNumber: {
    color: Colors.lightGreen.color,
    fontSize: 16,
    fontWeight: "600",
  },
  activeProgressNumber: {
    color: "#ffffff",
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: Colors.lightGreen.color,
    marginHorizontal: 5,
  },
  activeProgressLine: {
    backgroundColor: Colors.darkGreen.color,
  },
  stageWrapper: {
    marginBottom: 30,
  },
  glassCard: {
    overflow: "hidden",
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  contentWrapper: {
    padding: 25,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  stageTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.darkGreen.color,
    textAlign: "center",
    marginBottom: 25,
  },
  inputWrapper: {
    gap: 15,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
    width: "100%",
  },
  input: {
    flex: 1,
    marginLeft: 15,
    fontSize: 16,
    color: Colors.darkGreen.color,
    opacity: 0.8,
  },
  nextButton: {
    backgroundColor: Colors.darkGreen.color,
    borderRadius: 30,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.darkGreen.color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    marginTop: 20,
  },
  nextButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  backButton: {
    marginTop: 15,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderWidth: 2,
    borderColor: Colors.darkGreen.color,
    borderRadius: 30,
    height: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  backButtonText: {
    color: Colors.darkGreen.color,
    fontSize: 16,
    fontWeight: "600",
  },
  weightGoalContainer: {
    width: "100%",
    alignItems: "center",
    padding: 20,
  },
  weightGoalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: Colors.darkGreen.color,
    textAlign: "center",
  },
  weightGoalValue: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    color: Colors.green.color,
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 10,
    marginTop: 5,
  },
  sliderLabel: {
    fontSize: 12,
    color: Colors.gray.color,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 16,
    color: Colors.darkGreen.color,
  },
  kcalInput: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: Colors.green.color,
    borderRadius: 10,
    marginTop: 10,
  },
  decorativeCircle: {
    position: "absolute",
    top: -50,
    right: -50,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(129, 199, 132, 0.3)",
  },

  decorativeCircle2: {
    position: "absolute",
    bottom: -30,
    left: -30,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(129, 199, 132, 0.2)",
  },
  activityDisplay: {
    alignItems: "center",
    padding: 20,
  },
  activityText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: Colors.darkGreen.color,
  },
  activityVisualization: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 10,
  },
  activityBar: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.lightGreen.color,
  },
  activityBarActive: {
    backgroundColor: Colors.green.color,
  },
  customSlider: {
    width: "100%",
    height: 40,
  },
  activityIconsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 10,
  },
  goalVisualization: {
    alignItems: "center",
    marginBottom: 10,
  },
  customFieldPlaceholder: {
    color: Colors.darkGreen.color,
    opacity: 0.5,
  },
  manualKcalContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 20,
  },
  genderContainer: {
    marginBottom: 20,
  },
  genderLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.darkGreen.color,
    marginBottom: 10,
    textAlign: "center",
  },
  genderButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 15,
  },
  genderButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 15,
    padding: 15,
    paddingHorizontal: 25,
    borderWidth: 1,
    borderColor: Colors.darkGreen.color,
  },
  genderButtonActive: {
    backgroundColor: Colors.darkGreen.color,
  },
  genderButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: Colors.darkGreen.color,
    fontWeight: "600",
  },
  genderButtonTextActive: {
    color: "#ffffff",
  },
});
