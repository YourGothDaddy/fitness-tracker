import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { BlurView } from "expo-blur";
import { Colors } from "@/constants/Colors";
import Icon from "../../components/Icon";

const PremiumGate = ({
  enabled,
  message = "Unlock with Premium",
  children,
}) => {
  if (enabled) return <>{children}</>;
  return (
    <View style={styles.lockContainer}>
      {children}
      <View style={styles.blurContainer} pointerEvents="auto">
        <BlurView
          intensity={15}
          tint="light"
          experimentalBlurMethod="dimezisBlurView"
          style={StyleSheet.absoluteFill}
        />
      </View>
      <View style={styles.overlayCenter} pointerEvents="auto">
        <View style={styles.overlayCard}>
          <Icon name="lock" size={16} color={Colors.white.color} />
          <Text style={styles.overlayText}>{message}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  lockContainer: {
    position: "relative",
    flex: 1,
  },
  overlayCenter: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  blurContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
  },
  overlayCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(97,153,25,0.9)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  overlayText: {
    color: Colors.white.color,
    fontWeight: "700",
    fontSize: 12,
  },
});

export default PremiumGate;
