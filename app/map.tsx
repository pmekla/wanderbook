import React from "react";
import MapView from "react-native-maps";
import { StyleSheet, View, Text } from "react-native";
import Navbar from "@/components/navigation/NavBar";

export default function App() {
  return (
    <View style={styles.container}>
      <Text>Find spots!</Text>
      <MapView style={styles.map} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: "100%",
  },
});
