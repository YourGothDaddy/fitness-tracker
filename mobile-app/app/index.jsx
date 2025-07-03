import { Text, View, ScrollView, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../constants/Colors";
import { router, useRouter } from "expo-router";
import CustomButton from "./components/CustomButton";
import { useEffect } from "react";
import * as SecureStore from "expo-secure-store";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const accessToken = await SecureStore.getItemAsync("accessToken");
      console.log("[Auth Debug] accessToken:", accessToken);
      if (accessToken) {
        router.replace("/dashboard");
      }
    } catch (error) {
      console.error(
        "[Auth Debug] Error checking auth status:",
        error,
        error?.stack
      );
    }
  };

  return (
    <>
      <SafeAreaView className="bg-white h-full w-full">
        <ScrollView contentContainerStyle={{ flex: 1 }}>
          <View style={styles.topContainer}>
            <Text className="text-4xl font-pextrabold text-center text-green pt-10">
              Fitlicious
            </Text>
            <Text className="text-2xl font-semibold text-center">
              Яж вкусно
            </Text>
            <Text className="text-2xl font-semibold text-center">
              Живей здравословно
            </Text>
          </View>
          <View style={styles.middleContainer}></View>
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
            <CustomButton
              title="Влизане"
              containerStyles={[styles.customButton]}
              textStyles={styles.customButtonText}
              handleOnPress={() => {
                router.push("/sign-in");
              }}
            />
          </View>
        </ScrollView>
        <StatusBar style="dark" />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  topContainer: {
    flex: 0.4,
  },
  middleContainer: {
    flex: 0.9,
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
    marginVertical: 5,
  },
  signInButton: {
    backgroundColor: "transparent",
    borderColor: Colors.green.color,
  },
  customButtonText: {
    color: Colors.white.color,
    fontSize: 20,
  },
});
