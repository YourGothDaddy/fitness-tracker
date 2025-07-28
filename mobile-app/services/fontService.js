import * as Font from "expo-font";

const FONT_FAMILIES = {
  "Poppins-Black": require("../assets/fonts/Poppins-Black.ttf"),
  "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
  "Poppins-ExtraBold": require("../assets/fonts/Poppins-ExtraBold.ttf"),
  "Poppins-ExtraLight": require("../assets/fonts/Poppins-ExtraLight.ttf"),
  "Poppins-Light": require("../assets/fonts/Poppins-Light.ttf"),
  "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
  "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
  "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
  "Poppins-Thin": require("../assets/fonts/Poppins-Thin.ttf"),
};

class FontService {
  static async loadFonts(maxRetries = 3) {
    let lastError = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Font loading attempt ${attempt}/${maxRetries}`);

        await Font.loadAsync(FONT_FAMILIES);

        console.log("Fonts loaded successfully");
        return { success: true, error: null };
      } catch (error) {
        lastError = error;
        console.warn(`Font loading attempt ${attempt} failed:`, error);

        if (attempt < maxRetries) {
          // Wait before retry
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    console.error("All font loading attempts failed");
    return { success: false, error: lastError };
  }

  static getFallbackFonts() {
    return {
      "Poppins-Black": "System",
      "Poppins-Bold": "System",
      "Poppins-ExtraBold": "System",
      "Poppins-ExtraLight": "System",
      "Poppins-Light": "System",
      "Poppins-Medium": "System",
      "Poppins-Regular": "System",
      "Poppins-SemiBold": "System",
      "Poppins-Thin": "System",
    };
  }
}

export default FontService;
