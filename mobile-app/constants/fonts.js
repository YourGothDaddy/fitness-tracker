// Font family constants with fallbacks
export const FONT_FAMILIES = {
  // Primary fonts (Poppins)
  "Poppins-Black": "Poppins-Black",
  "Poppins-Bold": "Poppins-Bold",
  "Poppins-ExtraBold": "Poppins-ExtraBold",
  "Poppins-ExtraLight": "Poppins-ExtraLight",
  "Poppins-Light": "Poppins-Light",
  "Poppins-Medium": "Poppins-Medium",
  "Poppins-Regular": "Poppins-Regular",
  "Poppins-SemiBold": "Poppins-SemiBold",
  "Poppins-Thin": "Poppins-Thin",
};

// Fallback fonts for production
export const FONT_FALLBACKS = {
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

// Helper function to get font with fallback
export const getFontFamily = (fontName, useFallback = false) => {
  if (useFallback) {
    return FONT_FALLBACKS[fontName] || "System";
  }
  return FONT_FAMILIES[fontName] || "System";
};
