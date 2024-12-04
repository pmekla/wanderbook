import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from "react-native";

const ProfilePage = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView style={styles.container}>
        {/* Header Section */}
        <View style={styles.header}>
          {/* Name Centered at the Top */}
          <Text style={styles.name}>Jennifer Doe</Text>

          {/* Profile Image and Stats */}
          <View style={styles.profileRow}>
            <Image
              style={styles.profileImage}
              source={{
                uri: "https://via.placeholder.com/150", // Replace with actual profile image URL
              }}
            />
            <View style={styles.statsContainer}>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>100</Text>
                <Text style={styles.statLabel}>posts</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>100</Text>
                <Text style={styles.statLabel}>followers</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>100</Text>
                <Text style={styles.statLabel}>following</Text>
              </View>
            </View>
          </View>

          {/* Username, Bio, and Location */}
          <View style={styles.infoSection}>
            <Text style={styles.username}>@jendoelovestohike</Text>
            <Text style={styles.bio}>Hiker, Biker, Love to Adventure</Text>
            <Text style={styles.location}>📍 All Around</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity style={styles.activeTab}>
            <Text style={styles.tabText}>Lists</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.inactiveTab}>
            <Text style={styles.tabText}>Posts</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.inactiveTab}>
            <Text style={styles.tabText}>Badges</Text>
          </TouchableOpacity>
        </View>

        {/* Content Grid */}
        <View style={styles.grid}>
          <View style={styles.gridItem}>
            <Image
              style={styles.gridImage}
              source={{
                uri: "https://via.placeholder.com/100", // Replace with actual list image URL
              }}
            />
            <Text style={styles.gridText}>Whitewater Rafting</Text>
          </View>
          {Array(8)
            .fill(null)
            .map((_, index) => (
              <View key={index} style={styles.gridItem}>
                <View style={styles.placeholderBox} />
                <Text style={styles.gridText}>Placeholder</Text>
              </View>
            ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF5E4",
  },
  header: {
    alignItems: "center", // Centers everything horizontally
    paddingVertical: 20,
    backgroundColor: "#FFF5E4",
  },
  profileImage: {
    width: 120, // Larger size for profile photo
    height: 120,
    borderRadius: 60, // Makes it circular
    marginRight: 20, // Adds spacing between the image and info
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
  },
  profileRow: {
    flexDirection: "row", // Align profile picture and stats side by side
    alignItems: "center", // Aligns them vertically
    justifyContent: "center", // Centers the row
    width: "90%", // Limits the width of the content
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    flex: 1,
  },
  stat: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
  },
  infoSection: {
    marginTop: 15,
    alignItems: "center",
  },
  statLabel: {
    fontSize: 14,
    color: "#555",
  },
  username: {
    fontSize: 16,
    fontStyle: "italic",
    color: "#555",
    marginBottom: 5,
  },
  bio: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 5,
  },
  location: {
    fontSize: 14,
    color: "#555",
  },
  tabs: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderBottomWidth: 1,
    borderColor: "#ccc",
    marginBottom: 10,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderColor: "#000",
    padding: 10,
  },
  inactiveTab: {
    padding: 10,
  },
  tabText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    padding: 10,
  },
  gridItem: {
    width: "30%",
    alignItems: "center",
    marginBottom: 15,
  },
  gridImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  placeholderBox: {
    width: 100,
    height: 100,
    backgroundColor: "#ccc",
    borderRadius: 10,
  },
  gridText: {
    marginTop: 5,
    fontSize: 12,
    textAlign: "center",
  },
});

export default ProfilePage;