import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
} from "react-native";
import { useRouter } from "expo-router";
import * as Font from "expo-font";
import AppLoading from "expo-app-loading";

const backgroundImage = require("../assets/images/LoginBackground.jpeg");

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fontsLoaded, setFontsLoaded] = useState(false);


  const loadFonts = async () => {
    await Font.loadAsync({
      Pacifico: require("../assets/fonts/Pacifico-Regular.ttf"),
    });
    setFontsLoaded(true);
  };

  if (!fontsLoaded) {
    return <AppLoading startAsync={loadFonts} onFinish={() => setFontsLoaded(true)} onError={console.warn} />;
  }

  const handleLogin = () => {
    if (email === "test@example.com" && password === "password123") {
      router.push("/HomePage"); // Navigate to the HomePage on successful login
    } else {
      alert("Invalid email or password. Please try again.");
    }
  };

  return (
    <ImageBackground source={backgroundImage} style={styles.background}>
      <View style={styles.container}>
        <Text style={styles.title}>wanderbook</Text>
        <View style={styles.formContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="#888"
            value={email}
            onChangeText={setEmail}
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
            <TouchableOpacity style={styles.signInButton} onPress={handleLogin}>
              <Text style={styles.buttonText}>Sign in</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.registerButton}
              onPress={() => alert("Registration not implemented yet.")}
            >
              <Text style={styles.buttonText}>Register</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => alert("Forgot password feature coming soon!")}>
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
