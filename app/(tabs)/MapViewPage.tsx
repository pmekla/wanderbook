import React, { useState, useRef } from "react";
import MapView, { Marker, Region } from "react-native-maps";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  TextInput,
  Text,
  Image,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function MapViewPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Food");
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const mapRef = useRef<MapView>(null);

  const handleSearch = (data: any, details: any = null) => {
    if (details) {
      const newRegion = {
        latitude: details.geometry.location.lat,
        longitude: details.geometry.location.lng,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
      setRegion(newRegion);
      mapRef.current?.animateToRegion(newRegion);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.header}>find spots!</Text>

        {/* Replace the search container with GooglePlacesAutocomplete */}

        {/* Update MapView with ref and region */}
        <MapView ref={mapRef} style={styles.map} region={region}>
          <Marker
            coordinate={{
              latitude: region.latitude,
              longitude: region.longitude,
            }}
          />
        </MapView>

        {/* Category Filters */}
        <View style={styles.categoryContainer}>
          {["Food", "Nature", "Urban", "Landmarks", "Visited"].map(
            (category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  selectedCategory === category && styles.categoryButtonActive,
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === category && styles.categoryTextActive,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            )
          )}
        </View>
        {/* Thumbnail Section */}
        <View style={styles.thumbnailContainer}>
          <View style={styles.thumbnailBox} />
          <View style={styles.thumbnailBox} />
          <View style={styles.thumbnailBox} />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDF5E6", // Light beige background
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 20,
    color: "#333",
  },
  searchContainer: {
    zIndex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 25,
    marginHorizontal: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  map: {
    flex: 1,
    margin: 20,
    borderWidth: 2,
    borderColor: "#333",
  },
  categoryContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 10,
  },
  categoryButton: {
    marginHorizontal: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 15,
  },
  categoryButtonActive: {
    backgroundColor: "#333",
  },
  categoryText: {
    fontSize: 14,
    color: "#333",
  },
  categoryTextActive: {
    color: "#FFF",
  },
  thumbnailContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginHorizontal: 20,
    marginBottom: 20,
  },
  thumbnailBox: {
    width: 70,
    height: 70,
    backgroundColor: "#DDD",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#AAA",
  },
});