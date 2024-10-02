import {
  Text,
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../constants/Colors";
import { router } from "expo-router";
import CustomButton from "./components/CustomButton";

export default function Index() {
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
  },
  customButtonText: {
    color: Colors.white.color,
    fontSize: 20,
  },
});
