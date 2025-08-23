import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Keyboard,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import React, { useState, useEffect, useCallback } from "react";
import { Colors } from "@/constants/Colors";
import Slider from "@react-native-community/slider";
import CustomField from "@/app/components/CustomField";
import CustomButton from "@/app/components/CustomButton";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { authService } from "@/app/services/authService";
import { useAuth } from "@/app/context/AuthContext";

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
      if (data.name.trim().length < 2)
        return "Name must be at least 2 characters";
      if (data.name.trim().length > 100)
        return "Name must be at most 100 characters";
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
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Weight goal state
  const [goalWeight, setGoalWeight] = useState("");
  const [weightChangePerWeek, setWeightChangePerWeek] = useState(0.5);
  const [forecastDate, setForecastDate] = useState("-");
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState(null);

  const { login } = useAuth();

  const activityLevels = [
    "No activity",
    "Sedentary",
    "Lightly Active",
    "Moderately Active",
    "Very Active",
  ];

  const calculateForecast = useCallback(() => {
    console.log("calculateForecast called with:", {
      weight,
      goalWeight,
      weightChangePerWeek,
    });

    const curr = parseFloat(weight);
    const goal = parseFloat(goalWeight);
    const wc = parseFloat(weightChangePerWeek);

    console.log("Parsed values:", { curr, goal, wc });

    if (isNaN(curr) || isNaN(goal) || isNaN(wc) || wc === 0) {
      console.log('Invalid values, setting forecast to "-"');
      setForecastDate("-");
      return;
    }

    try {
      setIsCalculating(true);
      setError(null);

      // Calculate forecast using the same formula as backend
      const totalWeightChange = goal - curr;
      const absTotalWeightChange = Math.abs(totalWeightChange);
      const absWeightChangePerWeek = Math.abs(wc);
      const exactWeeksToGoal = absTotalWeightChange / absWeightChangePerWeek;

      console.log("Calculation:", { totalWeightChange, exactWeeksToGoal });

      if (exactWeeksToGoal <= 0 || !isFinite(exactWeeksToGoal)) {
        console.log('Invalid weeks calculation, setting forecast to "-"');
        setForecastDate("-");
        return;
      }

      const forecastDate = new Date();
      forecastDate.setDate(
        forecastDate.getDate() + Math.ceil(exactWeeksToGoal * 7)
      );
      const forecastString = forecastDate.toLocaleDateString();
      console.log("Setting forecast to:", forecastString);
      setForecastDate(forecastString);
      setError(null);
    } catch (err) {
      console.log("Error in calculateForecast:", err);
      setError("Failed to calculate forecast");
      setForecastDate("-");
    } finally {
      setIsCalculating(false);
    }
  }, [weight, goalWeight, weightChangePerWeek]);

  // Calculate forecast when inputs change
  useEffect(() => {
    console.log("useEffect triggered with:", {
      weight,
      goalWeight,
      weightChangePerWeek,
    });

    if (weight && goalWeight && weightChangePerWeek !== 0) {
      console.log("Calculating forecast with:", {
        weight,
        goalWeight,
        weightChangePerWeek,
      });
      const timeoutId = setTimeout(() => {
        calculateForecast();
      }, 100);
      return () => clearTimeout(timeoutId);
    } else {
      console.log("Not calculating forecast:", {
        weight,
        goalWeight,
        weightChangePerWeek,
      });
      setForecastDate("-");
    }
  }, [weight, goalWeight, weightChangePerWeek, calculateForecast]);

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
                      allowDecimal={true}
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
                      allowDecimal={true}
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
                <View style={styles.decorativeCircle} />
                <View style={styles.decorativeCircle2} />

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
                <View style={styles.decorativeCircle} />
                <View style={styles.decorativeCircle2} />

                <Text style={styles.stageTitle}>Weight Goal</Text>
                <View style={styles.weightGoalContainer}>
                  <Text style={styles.weightGoalDescription}>
                    Set your weight goal to help us calculate your personalized
                    daily calorie target
                  </Text>

                  {/* Current Weight Display */}
                  <View style={styles.currentWeightDisplay}>
                    <Text style={styles.currentWeightText}>
                      Current Weight: {weight} kg
                    </Text>
                  </View>

                  {/* Goal Weight Label */}
                  <Text style={styles.goalWeightLabel}>Goal Weight (kg)</Text>

                  {/* Goal Weight Input */}
                  <View style={styles.goalWeightContainer}>
                    <MaterialCommunityIcons
                      name="target"
                      size={24}
                      color={Colors.darkGreen.color}
                    />
                    <CustomField
                      styles={styles.goalWeightContainer}
                      textInputStyle={styles.goalWeightInput}
                      placeholder="___"
                      value={goalWeight}
                      onChangeText={setGoalWeight}
                      numeric={true}
                      allowDecimal={true}
                    />
                  </View>

                  {/* Weight Change per Week */}
                  <Text style={styles.sliderValue}>
                    Weight Change:{" "}
                    {(() => {
                      const curr = parseFloat(weight);
                      const goal = parseFloat(goalWeight);
                      const isLosing = goal < curr;
                      const displayValue = isLosing
                        ? -Math.abs(weightChangePerWeek)
                        : Math.abs(weightChangePerWeek);
                      return (
                        (displayValue > 0 ? "+" : "") + displayValue.toFixed(1)
                      );
                    })()}{" "}
                    kg/week
                  </Text>
                  <Slider
                    style={styles.customSlider}
                    minimumValue={0.1}
                    maximumValue={2}
                    step={0.1}
                    value={Math.abs(weightChangePerWeek)}
                    minimumTrackTintColor={Colors.darkGreen.color}
                    maximumTrackTintColor={Colors.lightGreen.color}
                    thumbTintColor={Colors.darkGreen.color}
                    onValueChange={(v) => {
                      // Determine if losing or gaining based on goal vs current weight
                      const curr = parseFloat(weight);
                      const goal = parseFloat(goalWeight);
                      const isLosing = goal < curr;
                      // Always store as positive, sign is determined by isLosing
                      setWeightChangePerWeek(isLosing ? -v : v);
                    }}
                  />

                  {/* Forecast Display */}
                  <View style={styles.forecastContainer}>
                    <Text style={styles.forecastLabel}>
                      Estimated Goal Date:
                    </Text>
                    <Text style={styles.forecastValue}>
                      {isCalculating ? "Calculating..." : forecastDate}
                    </Text>
                  </View>

                  {error && <Text style={styles.errorText}>{error}</Text>}
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
                <View style={styles.decorativeCircle} />
                <View style={styles.decorativeCircle2} />

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
                      maxLength={100}
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
                      keyboardType="email-address"
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <MaterialCommunityIcons
                      name="lock"
                      size={24}
                      color={Colors.darkGreen.color}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Password"
                      placeholderTextColor={Colors.darkGreen.color}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={true}
                      maxLength={64}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <MaterialCommunityIcons
                      name="lock-check"
                      size={24}
                      color={Colors.darkGreen.color}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Confirm Password"
                      placeholderTextColor={Colors.darkGreen.color}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={true}
                      maxLength={64}
                      autoCapitalize="none"
                      autoCorrect={false}
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
    // Run validation for the current stage before proceeding
    const validationError = validateStage(currentStage, {
      gender,
      weight,
      height,
      age,
      name,
      email,
      password,
      confirmPassword,
    });

    if (validationError) {
      Alert.alert("Validation", validationError);
      return;
    }

    if (currentStage === 4) {
      try {
        // Prepare registration data
        const safeGoalWeight = goalWeight === "" ? 0 : parseFloat(goalWeight);
        const safeWeeklyChange =
          goalWeight === "" || isNaN(parseFloat(goalWeight))
            ? 0
            : weightChangePerWeek || 0;

        const registrationData = {
          fullName: name,
          email: email,
          password: password,
          gender: gender === "male" ? 1 : 2,
          weight: parseFloat(weight),
          height: parseFloat(height),
          age: parseInt(age),
          activityLevelId: activity + 1,
          goalWeight: safeGoalWeight,
          weeklyWeightChangeGoal: safeWeeklyChange,
        };

        // Register the user
        await authService.register(registrationData);

        // Auto-login via AuthContext after successful registration
        await login(email, password);

        Alert.alert("Success", "Registration successful!", [
          { text: "OK", onPress: () => router.replace("/dashboard") },
        ]);
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
    <View style={styles.container}>
      <StatusBar
        style="light"
        backgroundColor="transparent"
        translucent={true}
      />
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
              <React.Fragment key={stage}>
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
              </React.Fragment>
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
    </View>
  );
};

export default SignUp;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 0,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  header: {
    alignItems: "center",
    marginTop: 15,
    marginBottom: 10,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.darkGreen.color,
    letterSpacing: 1,
  },
  logoCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  progressItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  progressCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
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
    fontSize: 12,
    fontWeight: "600",
  },
  activeProgressNumber: {
    color: "#ffffff",
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: Colors.lightGreen.color,
    marginHorizontal: 5,
  },
  activeProgressLine: {
    backgroundColor: Colors.darkGreen.color,
  },
  stageWrapper: {
    marginBottom: 10,
  },
  glassCard: {
    overflow: "hidden",
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  contentWrapper: {
    padding: 6,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  stageTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.darkGreen.color,
    textAlign: "center",
    marginBottom: 6,
  },
  inputWrapper: {
    gap: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
    padding: 3,
    marginBottom: 3,
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
    width: "100%",
  },
  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
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
    padding: 7.5,
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
  customFieldPlaceholder: {
    color: Colors.darkGreen.color,
    opacity: 0.5,
  },
  genderContainer: {
    marginBottom: 4,
  },
  genderLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.darkGreen.color,
    marginBottom: 2,
    textAlign: "center",
  },
  genderButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  genderButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
    padding: 4,
    paddingHorizontal: 6,
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
  weightGoalDescription: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 16,
  },
  currentWeightDisplay: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    borderRadius: 8,
    padding: 2,
    marginBottom: 4,
    gap: 4,
    borderWidth: 0,
  },
  currentWeightText: {
    fontSize: 11,
    fontWeight: "400",
    color: "#999",
  },
  sliderLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.darkGreen.color,
    marginBottom: 6,
    textAlign: "center",
  },
  sliderValue: {
    fontSize: 15,
    fontWeight: "bold",
    color: Colors.darkGreen.color,
    textAlign: "center",
    marginBottom: 8,
  },

  forecastContainer: {
    alignItems: "center",
    marginTop: 7.5,
    padding: 6,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  forecastLabel: {
    fontSize: 11,
    color: Colors.darkGreen.color,
    marginBottom: 2,
  },
  forecastValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.green.color,
  },
  goalWeightContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
    padding: 3,
    marginBottom: 3,
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
    width: "40%",
    alignSelf: "center",
  },
  goalWeightLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.darkGreen.color,
    textAlign: "center",
    marginBottom: 8,
  },
  goalWeightInput: {
    marginLeft: 8,
    fontSize: 18,
    color: Colors.darkGreen.color,
    opacity: 0.8,
    width: 40,
    textAlign: "center",
  },

  errorText: {
    fontSize: 14,
    color: "#e74c3c",
    textAlign: "center",
    marginBottom: 16,
    marginTop: 8,
  },
});
