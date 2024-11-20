import React from "react";
import { View, Text, StyleSheet } from "react-native";

const MapViewPage = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Map View Page</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF5E4",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
});

export default MapViewPage;
