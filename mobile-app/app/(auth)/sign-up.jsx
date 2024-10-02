import { View, Text, ScrollView, StyleSheet, Keyboard } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import CustomField from "@/app/components/CustomField";
import CustomButton from "@/app/components/CustomButton";
import { router } from "expo-router";
import React, { useState, useEffect } from "react";
import { Colors } from "@/constants/Colors";

const SignUp = () => {
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [age, setAge] = useState("");

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
          <Text className="font-pregular text-black text-center pb-5">
            Въведете своите данни, за да можем да персонализираме плана Ви
          </Text>
          <View style={styles.fieldsContainer} className="items-center">
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
            />
            <CustomField
              styles={styles.customField}
              placeholder="Изберете своята възраст"
              placeHolderTextColor={Colors.gray.color}
              numeric={true}
              value={age}
              onChangeText={setAge}
            />
          </View>
        </View>
        {!isKeyboardVisible && (
          <View
            className="justify-center items-center"
            style={styles.bottomContainer}
          >
            <CustomButton
              title="Регистрация"
              containerStyles={styles.customButton}
              textStyles={styles.customButtonText}
              handleOnPress={() => {
                router.push("/sign-up");
              }}
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
});

// <View className="flex-1 justify-start items-center">
//   <View className="pt-10">
//     <Text className="text-4xl font-pextrabold text-center text-green pt-1">
//       Fitlicious
//     </Text>
//   </View>
//   <View className="w-full justify-between items-center pt-10">
//     <Text className="text-2xl font-extrabold text-green">
//       Регистрация
//     </Text>
//   </View>
//   <View
//     className="w-full justify-start items-center pt-20 flex-2"
//     style={{ rowGap: 15, height: "100%" }}
//   >
//     <CustomField
//       styles={{
//         width: "90%",
//         borderWidth: 2,
//         borderColor: Colors.green.color,
//         borderRadius: 10,
//       }}
//       placeholder="Въведете своите килограми"
//     />
//     <CustomField
//       styles={{
//         width: "90%",
//         borderWidth: 2,
//         borderColor: Colors.green.color,
//         borderRadius: 10,
//         position: "relative",
//         top: "-15%",
//         marginTop: 10,
//       }}
//       placeholder="Въведете своят ръст"
//     />
//     <CustomButton
//       title="Напред"
//       containerStyles={{
//         borderWidth: 2,
//         borderColor: "transparent",
//         backgroundColor: Colors.green.color,
//         borderRadius: 30,

//         width: "80%",
//         height: "8%",
//       }}
//       containerClasses="justify-center items-center"
//       TextStyles={{
//         color: Colors.white.color,
//         fontSize: 20,
//       }}
//       handleOnPress={() => {
//         router.push("/sign-up");
//       }}
//     />
//   </View>
// </View>;
