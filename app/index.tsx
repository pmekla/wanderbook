import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import * as Font from "expo-font";
import AppLoading from "expo-app-loading";
import { loginUser } from "../services/authService";

const backgroundImage = require("../assets/images/LoginBackground.jpeg");

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loadFonts = async () => {
    await Font.loadAsync({
      Pacifico: require("../assets/fonts/Pacifico-Regular.ttf"),
    });
    setFontsLoaded(true);
  };

  if (!fontsLoaded) {
    return (
      <AppLoading
        startAsync={loadFonts}
        onFinish={() => setFontsLoaded(true)}
        onError={console.warn}
      />
    );
  }

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const user = await loginUser(username, password);
      if (user) {
        router.push("/(tabs)/ProfilePage");
      } else {
        Alert.alert("Invalid username or password. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("An error occurred during login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ImageBackground source={backgroundImage} style={styles.background}>
      <View style={styles.container}>
        <Text style={styles.title}>wanderbook</Text>
        <View style={styles.formContainer}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your username"
            placeholderTextColor="#888"
            value={username}
            onChangeText={setUsername}
          />
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor="#888"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.signInButton}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.buttonText}>Sign in</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.registerButton}
              onPress={() => router.push("/RegisterPage")}
            >
              <Text style={styles.buttonText}>Register</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={() => alert("Forgot password feature coming soon!")}
          >
            <Text style={styles.forgotPassword}>Forgot password?</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontFamily: "Pacifico",
    fontSize: 64,
    color: "#ffffff",
    textShadowColor: "rgba(0, 0, 0, 0.7)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    position: "absolute",
    top: "20%",
    textAlign: "center",
  },
  formContainer: {
    width: "100%",
    padding: 20,
    borderRadius: 12,
    backgroundColor: "#FEF2E5",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    marginTop: "30%",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  input: {
    backgroundColor: "#f7f7f7",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  signInButton: {
    flex: 1,
    backgroundColor: "#6c757d",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginRight: 5,
  },
  registerButton: {
    flex: 1,
    backgroundColor: "#17a2b8",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginLeft: 5,
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  forgotPassword: {
    textAlign: "center",
    color: "#007bff",
    textDecorationLine: "underline",
  },
});
