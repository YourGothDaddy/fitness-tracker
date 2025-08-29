import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "@/app/context/AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { authService } from "@/app/services/authService";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { BlurView } from "expo-blur";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const isAuthenticated = await authService.isAuthenticated();
      if (isAuthenticated) {
        router.replace("/dashboard");
      }
    } catch (error) {}
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await login(email, password);
      router.replace("/dashboard");
    } catch (error) {
      setError("Invalid email or password. Please try again.");
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
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.logoCircle}>
              <MaterialCommunityIcons
                name="leaf"
                size={40}
                color={Colors.darkGreen.color}
              />
            </View>
            <Text style={styles.appTitle}>Fitlicious</Text>
          </View>

          {/* Main Content */}
          <View style={styles.contentContainer}>
            <BlurView intensity={20} tint="light" style={styles.glassCard}>
              <View style={styles.contentWrapper}>
                <View style={styles.decorativeCircle} />
                <View style={styles.decorativeCircle2} />

                <Text style={styles.welcomeTitle}>Welcome Back</Text>

                <View style={styles.formContainer}>
                  <View style={styles.inputContainer}>
                    <MaterialCommunityIcons
                      name="email"
                      size={24}
                      color={Colors.darkGreen.color}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Email Address"
                      placeholderTextColor={Colors.darkGreen.color}
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <MaterialCommunityIcons
                      name="lock"
                      size={24}
                      color={Colors.darkGreen.color}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Password"
                      placeholderTextColor={Colors.darkGreen.color}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={true}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>

                  <TouchableOpacity style={styles.forgotPassword}>
                    <Text style={styles.forgotPasswordText}>
                      Forgot Password?
                    </Text>
                  </TouchableOpacity>

                  {error ? (
                    <Animated.View
                      entering={FadeIn}
                      exiting={FadeOut}
                      style={styles.errorContainer}
                    >
                      <Text style={styles.errorText}>{error}</Text>
                    </Animated.View>
                  ) : null}

                  <TouchableOpacity
                    style={[
                      styles.signInButton,
                      loading && styles.signInButtonDisabled,
                    ]}
                    onPress={handleLogin}
                    disabled={loading}
                  >
                    <Text style={styles.signInButtonText}>
                      {loading ? "Signing in..." : "Sign In"}
                    </Text>
                  </TouchableOpacity>

                  <View style={styles.signUpContainer}>
                    <Text style={styles.signUpText}>
                      Don't have an account?{" "}
                    </Text>
                    <TouchableOpacity onPress={() => router.push("/sign-up")}>
                      <Text style={styles.signUpLink}>Sign Up</Text>
                    </TouchableOpacity>
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

export default SignIn;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 0,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  header: {
    alignItems: "center",
    marginTop: 15,
    marginBottom: 0,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.darkGreen.color,
    letterSpacing: 1,
  },
  logoCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 8,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "flex-start",
    paddingTop: 20,
    marginBottom: 40,
  },
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
  welcomeTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.darkGreen.color,
    textAlign: "center",
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: Colors.green.color,
    textAlign: "center",
    marginBottom: 30,
    opacity: 0.8,
  },
  formContainer: {
    width: "100%",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
    padding: 3,
    marginBottom: 16,
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
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: Colors.green.color,
    fontSize: 14,
    fontWeight: "500",
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
  signInButton: {
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
    marginBottom: 24,
  },
  signInButtonDisabled: {
    opacity: 0.7,
  },
  signInButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  signUpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signUpText: {
    color: "#666",
    fontSize: 14,
  },
  signUpLink: {
    color: Colors.darkGreen.color,
    fontSize: 14,
    fontWeight: "600",
  },
});
