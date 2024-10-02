import { Text, View, ScrollView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../constants/Colors";
import { router } from "expo-router";
import CustomButton from "./components/CustomButton";

export default function Index() {
  return (
    <>
      <StatusBar style="dark" />
      <SafeAreaView className="bg-white h-full w-full">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View
            className="flex-1 justify-end items-center"
            style={{ position: "relative", top: "-70%" }}
          >
            <Text className="text-4xl font-pextrabold text-center text-green pt-2">
              Fitlicious
            </Text>
            <Text className="text-2xl font-psemibold text-center">
              Яж вкусно
            </Text>
            <Text className="text-2xl font-psemibold text-center">
              Живей здравословно
            </Text>
            <CustomButton
              title="Регистрация"
              containerStyles={{
                borderWidth: 2,
                borderColor: "transparent",
                backgroundColor: Colors.green.color,
                borderRadius: 30,

                position: "relative",
                top: "60%",
                width: "80%",
                height: "8%",
              }}
              containerClasses="justify-center items-center"
              TextStyles={{
                color: Colors.white.color,
                fontSize: 20,
              }}
              handleOnPress={() => {
                router.push("/sign-up");
              }}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
