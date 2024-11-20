import React from "react";
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity } from "react-native";

const HomePage = () => {
  const recentLists = ["List 1", "List 2", "List 3", "List 4"];
  const topSpots = [
    { id: 1, title: "Annapolis Rock", image: "https://via.placeholder.com/150", details: "Length: 5 miles\nElevation: 840 ft\nDifficulty: Moderate\nPermit Required: None" },
    { id: 2, title: "Annapolis Rock", image: "https://via.placeholder.com/150", details: "Length: 5 miles\nElevation: 840 ft\nDifficulty: Moderate\nPermit Required: None" },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.header}>home</Text>

      {/* Recent Lists */}
      <Text style={styles.sectionTitle}>Recent Lists</Text>
      <View style={styles.listContainer}>
        {recentLists.map((item, index) => (
          <View key={index} style={styles.card}>
            <Text>—</Text>
          </View>
        ))}
      </View>

      {/* Top Spots */}
      <Text style={styles.sectionTitle}>Top Spots</Text>
      <FlatList
        data={topSpots}
        horizontal
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.spotCard}>
            <Image source={{ uri: item.image }} style={styles.spotImage} />
            <Text style={styles.spotTitle}>{item.title}</Text>
            <Text style={styles.spotDetails}>{item.details}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#FFF5E4",
  },
  header: {
    fontSize: 36,
    textAlign: "center",
    marginBottom: 16,
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 18,
    fontStyle: "italic",
    marginBottom: 8,
  },
  listContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  card: {
    width: "22%",
    height: 100,
    backgroundColor: "#e0e0e0",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  spotCard: {
    width: 150,
    marginRight: 16,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    overflow: "hidden",
    elevation: 2,
  },
  spotImage: {
    width: "100%",
    height: 100,
  },
  spotTitle: {
    fontWeight: "bold",
    fontSize: 16,
    margin: 8,
  },
  spotDetails: {
    fontSize: 12,
    marginHorizontal: 8,
    marginBottom: 8,
    color: "#555",
  },
});

export default HomePage;
