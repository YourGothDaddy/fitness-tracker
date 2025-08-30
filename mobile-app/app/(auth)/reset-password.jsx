import { View, Text, TextInput, StyleSheet } from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { BlurView } from "expo-blur";
import CustomButton from "@/app/components/CustomButton";
import axios from "axios";
import { API_URL, API_TIMEOUT } from "@/constants/Config";

const ResetPassword = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const email = useMemo(
    () =>
      typeof params.email === "string"
        ? params.email
        : Array.isArray(params.email)
        ? params.email[0]
        : "",
    [params.email]
  );
  const token = useMemo(
    () =>
      typeof params.token === "string"
        ? params.token
        : Array.isArray(params.token)
        ? params.token[0]
        : "",
    [params.token]
  );

  useEffect(() => {
    if (!email || !token) {
      setError("Invalid or missing reset link.");
    }
  }, [email, token]);

  const handleSubmit = async () => {
    if (!email || !token) {
      setError("Invalid or missing reset link.");
      return;
    }
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      await axios.post(
        `${API_URL}/api/auth/reset-password`,
        { email, token, newPassword: password },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          timeout: API_TIMEOUT,
        }
      );
      setMessage("Password reset successful. You can now sign in.");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError("Failed to reset password. The link may be invalid or expired.");
    } finally {
      setLoading(false);
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
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <View style={styles.logoCircle}>
              <MaterialCommunityIcons
                name="leaf"
                size={60}
                color={Colors.darkGreen.color}
              />
            </View>
            <Text style={styles.appTitle}>Fitlicious</Text>
          </View>

          <View style={styles.contentContainer}>
            <BlurView intensity={20} tint="light" style={styles.glassCard}>
              <View style={styles.contentWrapper}>
                <View style={styles.decorativeCircle} />
                <View style={styles.decorativeCircle2} />

                <Text style={styles.title}>Set New Password</Text>
                <Text style={styles.subtitle}>
                  Enter and confirm your new password
                </Text>

                <View style={styles.formContainer}>
                  <View style={styles.inputContainer}>
                    <MaterialCommunityIcons
                      name="lock"
                      size={24}
                      color={Colors.darkGreen.color}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="New Password"
                      placeholderTextColor={Colors.darkGreen.color}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
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
                      secureTextEntry
                    />
                  </View>

                  {error ? (
                    <View style={styles.errorContainer}>
                      <Text style={styles.errorText}>{error}</Text>
                    </View>
                  ) : null}

                  {message ? (
                    <View style={styles.messageContainer}>
                      <Text style={styles.messageText}>{message}</Text>
                    </View>
                  ) : null}

                  <View style={styles.buttonContainer}>
                    <CustomButton
                      title={loading ? "Resetting..." : "Reset Password"}
                      containerStyles={styles.resetButton}
                      textStyles={styles.resetButtonText}
                      handleOnPress={handleSubmit}
                      disabled={loading}
                    />

                    <CustomButton
                      title="Back to Sign In"
                      containerStyles={styles.backButton}
                      textStyles={styles.backButtonText}
                      handleOnPress={() => router.push("/sign-in")}
                    />
                  </View>
                </View>
              </View>
            </BlurView>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
};

export default ResetPassword;

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 0 },
  gradient: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: 20 },
  header: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 40,
  },
  appTitle: {
    fontSize: 36,
    fontWeight: "800",
    color: Colors.darkGreen.color,
    letterSpacing: 1,
    marginTop: 16,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  contentContainer: { paddingBottom: 40 },
  glassCard: {
    overflow: "hidden",
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderWidth: 1,
    borderColor: "rgba(129, 199, 132, 0.15)",
  },
  contentWrapper: {
    padding: 30,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    position: "relative",
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
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.darkGreen.color,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.green.color,
    textAlign: "center",
    marginBottom: 30,
    opacity: 0.8,
    lineHeight: 22,
  },
  formContainer: { width: "100%" },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
    padding: 3,
    marginBottom: 20,
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: Colors.darkGreen.color,
    opacity: 0.8,
    paddingVertical: 12,
  },
  errorContainer: {
    backgroundColor: "rgba(231, 76, 60, 0.1)",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(231, 76, 60, 0.3)",
  },
  errorText: {
    color: "#e74c3c",
    fontSize: 14,
    textAlign: "center",
    fontWeight: "500",
  },
  messageContainer: {
    backgroundColor: "rgba(129, 199, 132, 0.1)",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(129, 199, 132, 0.3)",
  },
  messageText: {
    color: Colors.green.color,
    fontSize: 14,
    textAlign: "center",
    fontWeight: "500",
    lineHeight: 20,
  },
  buttonContainer: { width: "100%", gap: 16 },
  backButton: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderWidth: 2,
    borderColor: Colors.darkGreen.color,
    borderRadius: 30,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
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
  resetButton: {
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
  },
  resetButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
