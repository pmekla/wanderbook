import React from "react";
import { View, Text, StyleSheet } from "react-native";

const ProfilePage = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile Page</Text>
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

export default ProfilePage;
