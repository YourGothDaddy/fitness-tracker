import { Stack, SplashScreen } from "expo-router";
import React, { useEffect, useState } from "react";
import { AuthProvider } from "./context/AuthContext";
import FontService from "../services/fontService";
import * as Font from "expo-font";
import {
  MaterialIcons,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadResources = async () => {
      try {
        setIsLoading(true);
        await Promise.all([
          FontService.loadFonts(3),
          Font.loadAsync({
            ...MaterialIcons.font,
            ...Ionicons.font,
            ...MaterialCommunityIcons.font,
          }),
        ]);
        setFontsLoaded(true);
      } catch (error) {
        setFontsLoaded(true);
      } finally {
        setIsLoading(false);
        SplashScreen.hideAsync();
      }
    };

    loadResources();
  }, []);

  if (isLoading) {
    return null;
  }

  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </AuthProvider>
  );
};

export default RootLayout;
