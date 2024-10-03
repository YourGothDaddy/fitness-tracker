import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Keyboard,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import CustomField from "@/app/components/CustomField";
import CustomButton from "@/app/components/CustomButton";
import { router } from "expo-router";
import React, { useState, useEffect } from "react";
import { Colors } from "@/constants/Colors";
import Slider from "@react-native-community/slider";
import Checkbox from "expo-checkbox";

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
          <>
            <CustomField
              styles={styles.customField}
              placeholder="Въведете своите килограми"
              placeHolderTextColor={Colors.gray.color}
              numeric={true}
              allowDecimal={true}
              value={weight}
              onChangeText={setWeight}
            />
            <CustomField
              styles={styles.customField}
              placeholder="Въведете своят ръст"
              placeHolderTextColor={Colors.gray.color}
              numeric={true}
              value={height}
              onChangeText={setHeight}
            />
            <CustomField
              styles={styles.customField}
              placeholder="Изберете своя пол"
              placeHolderTextColor={Colors.gray.color}
              value={gender}
              onChangeText={setGender}
            />
            <CustomField
              styles={styles.customField}
              placeholder="Изберете своята възраст"
              placeHolderTextColor={Colors.gray.color}
              numeric={true}
              value={age}
              onChangeText={setAge}
            />
          </>
        );
      case 2:
        return (
          <View style={styles.activityContainer}>
            <Text style={styles.activityLabel}>
              Изберете вашето ниво на активност:
            </Text>
            <Text style={styles.activityValue}>{activityLevels[activity]}</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={4}
              step={1}
              value={activity}
              onValueChange={setActivity}
              minimumTrackTintColor={Colors.green.color}
              maximumTrackTintColor={Colors.lightGreen.color}
              thumbTintColor={Colors.darkGreen.color}
            />
          </View>
        );
      case 3:
        return (
          <View style={styles.weightGoalContainer}>
            <Text style={styles.weightGoalLabel}>
              Изберете вашата седмична цел за тегло:
            </Text>
            {!manualKcal && (
              <>
                <Text style={styles.weightGoalValue}>
                  {weightGoal === 0
                    ? "Maintain"
                    : weightGoal < 0
                    ? `Lose ${Math.abs(weightGoal).toFixed(1)}kg/week`
                    : `Gain ${weightGoal.toFixed(1)}kg/week`}
                </Text>
                <Slider
                  style={styles.slider}
                  minimumValue={-1}
                  maximumValue={1}
                  step={0.1}
                  value={weightGoal}
                  onValueChange={setWeightGoal}
                  minimumTrackTintColor={Colors.red.color}
                  maximumTrackTintColor={Colors.green.color}
                  thumbTintColor={Colors.darkGreen.color}
                  disabled={manualKcal}
                />
                <View style={styles.sliderLabels}>
                  <Text style={styles.sliderLabel}>-1kg</Text>
                  <Text style={styles.sliderLabel}>Maintain</Text>
                  <Text style={styles.sliderLabel}>+1kg</Text>
                </View>
              </>
            )}
            <View style={styles.checkboxContainer}>
              <Checkbox
                value={manualKcal}
                onValueChange={setManualKcal}
                color={manualKcal ? Colors.green.color : undefined}
              />
              <Text style={styles.checkboxLabel}>
                Ръчно въведете месечните калории, които желаете
              </Text>
            </View>
            {manualKcal && (
              <CustomField
                styles={styles.customField}
                placeholder="Въведете месечните си калории"
                placeHolderTextColor={Colors.gray.color}
                numeric={true}
                value={kcalGoal}
                onChangeText={setKcalGoal}
              />
            )}
          </View>
        );
      case 4:
        return (
          <>
            <CustomField
              styles={styles.customField}
              placeholder="Име"
              placeHolderTextColor={Colors.gray.color}
              value={name}
              onChangeText={setName}
            />
            <CustomField
              styles={styles.customField}
              placeholder="Е-майл"
              placeHolderTextColor={Colors.gray.color}
              value={email}
              onChangeText={setEmail}
            />
            <CustomField
              styles={styles.customField}
              placeholder="Парола"
              placeHolderTextColor={Colors.gray.color}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={true}
            />
            <CustomField
              styles={styles.customField}
              placeholder="Повторна парола"
              placeHolderTextColor={Colors.gray.color}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={true}
            />
          </>
        );
      default:
        return null;
    }
  };

  const handleContinue = () => {
    if (currentStage < 4) {
      setCurrentStage(currentStage + 1);
    } else {
      router.push("/dashboard");
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
    <SafeAreaView className="bg-white h-full w-full">
      <ScrollView contentContainerStyle={{ flex: 1 }}>
        <View style={styles.topContainer}>
          <Text className="text-4xl font-pextrabold text-center text-green pt-10">
            Fitlicious
          </Text>
        </View>
        <View style={styles.middleContainer}>
          <Text className="text-3xl font-extrabold text-green text-center pb-2">
            Регистрация
          </Text>
          <Text className="text-xl font-extrabold text-green text-center pb-2">
            (Стъпка {currentStage} от 4)
          </Text>
          <Text className="font-pregular text-black text-center pb-5">
            Въведете своите данни, за да можем да персонализираме плана Ви
          </Text>
          <View style={styles.fieldsContainer} className="items-center">
            {renderStageContent()}
          </View>
        </View>
        {!isKeyboardVisible && (
          <View
            className="justify-center items-center"
            style={styles.bottomContainer}
          >
            <CustomButton
              title={currentStage === 4 ? "Завърши" : "Продължи"}
              containerStyles={styles.customButton}
              textStyles={styles.customButtonText}
              handleOnPress={handleContinue}
            />
            <CustomButton
              title="Назад"
              containerStyles={styles.goBackButton}
              textStyles={styles.goBackButtonText}
              handleOnPress={handleGoBack}
            />
          </View>
        )}
      </ScrollView>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
};

export default SignUp;

const styles = StyleSheet.create({
  topContainer: {
    flex: 0.3,
  },
  middleContainer: {
    flex: 1,
    alignItems: "center",
  },
  fieldsContainer: {
    borderWidth: 2,
    borderColor: Colors.darkGreen.color,
    borderRadius: 30,
    width: "95%",
    paddingVertical: "3%",
  },
  bottomContainer: {
    flex: 0.3,
  },
  customButton: {
    borderWidth: 2,
    borderColor: "transparent",
    backgroundColor: Colors.green.color,
    borderRadius: 30,
    width: "80%",
    height: 50,
    position: "relative",
    top: "7%",
  },
  customButtonText: {
    color: Colors.white.color,
    fontSize: 20,
  },
  customField: {
    width: "90%",
    height: 50,
    borderWidth: 2,
    borderColor: "transparent",
    borderRadius: 30,
    backgroundColor: Colors.lightGreen.color,
    marginTop: 10,
  },
  goBackButton: {
    borderWidth: 2,
    borderColor: "transparent",
    backgroundColor: Colors.darkGreen.color,
    borderRadius: 30,
    width: "40%",
    height: 25,
    position: "relative",
    top: "10%",
  },
  goBackButtonText: {
    color: Colors.white.color,
    fontSize: 13,
  },
  activityContainer: {
    width: "90%",
    alignItems: "center",
  },
  activityLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: Colors.darkGreen.color,
  },
  activityValue: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    color: Colors.green.color,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  weightGoalContainer: {
    width: "90%",
    alignItems: "center",
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
});
