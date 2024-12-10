import React, { useState, useRef, useEffect } from "react";
import MapView, { Marker, Region, Callout } from "react-native-maps";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  SafeAreaView,
  StatusBar,
  Alert,
} from "react-native";
import * as Location from "expo-location";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebaseConfig.js";
import { Ionicons } from "@expo/vector-icons"; // Add this import
import { getCurrentUserID } from "../../services/authService";
import PostViewer from "./PostViewer"; // Add this import

// Add this helper function before the MapViewPage component
const generateRandomCoordinate = (center: number, range: number) => {
  return center + (Math.random() - 0.5) * range;
};

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
  const [markers, setMarkers] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<Region | null>(null);
  const [visitedLocations, setVisitedLocations] = useState<any[]>([]);
  const [topLocations, setTopLocations] = useState<any[][]>([[], [], [], []]);
  const [postViewerVisible, setPostViewerVisible] = useState(false); // Add this line
  const [selectedPost, setSelectedPost] = useState(null); // Add this line

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location permission is required.");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
      setRegion(newRegion);
      setUserLocation(newRegion);
    })();
    fetchAllVisitedLocations();
  }, []);

  const fetchAllVisitedLocations = async () => {
    try {
      const userID = await getCurrentUserID();
      if (!userID) return;

      const postsQuery = query(
        collection(db, "posts"),
        where("userID", "==", userID)
      );
      const querySnapshot = await getDocs(postsQuery);
      const locations = querySnapshot.docs
        .map((doc) => {
          const data = doc.data();
          const lat = data.location?.latitude || data.latitude;
          const lng = data.location?.longitude || data.longitude;

          return {
            id: data.postID,
            title: data.title || "Visited Location",
            latitude: typeof lat === "number" ? lat : parseFloat(lat),
            longitude: typeof lng === "number" ? lng : parseFloat(lng),
            description: data.description || "",
            category: data.category || "Other",
            imageURLs: data.imageURLs || [],
            rating: data.rating || 0, // Added rating
            visibility: data.visibility || "public", // Added visibility
          };
        })
        .filter((loc) => !isNaN(loc.latitude) && !isNaN(loc.longitude));

      console.log("Processed visited locations:", locations);
      setVisitedLocations(locations);
    } catch (error) {
      console.error("Error fetching visited locations:", error);
    }
  };

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

  const handleMapLongPress = (e: any) => {
    const { coordinate } = e.nativeEvent;
    setSelectedLocation({
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
    });
    Alert.alert(
      "Location Selected",
      `Lat: ${coordinate.latitude}, Lng: ${coordinate.longitude}`
    );
  };

  const fetchLocationsByCategory = async (category: string) => {
    setSelectedCategory(category);
    try {
      if (category === "Visited") {
        const locationQuery = query(collection(db, "posts"));
        const querySnapshot = await getDocs(locationQuery);
        const locations = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
          title: "Visited Location",
        }));
        setMarkers(locations);
      } else {
        // Generate random locations within ~2km range
        const dummyLocations = Array.from({ length: 3 }, (_, index) => ({
          latitude: generateRandomCoordinate(region.latitude, 0.02),
          longitude: generateRandomCoordinate(region.longitude, 0.02),
          title: `${category} ${index + 1}`,
        }));
        setMarkers(dummyLocations);
      }
    } catch (error) {
      console.error("Error fetching locations:", error);
      Alert.alert("Error", "Failed to fetch locations");
    }
  };

  const handleZoomIn = () => {
    const newRegion = {
      ...region,
      latitudeDelta: region.latitudeDelta / 2,
      longitudeDelta: region.longitudeDelta / 2,
    };
    setRegion(newRegion);
    mapRef.current?.animateToRegion(newRegion);
  };

  const handleZoomOut = () => {
    const maxDelta = 100; // Maximum zoom out level
    const newLatDelta = region.latitudeDelta * 2;
    const newLongDelta = region.longitudeDelta * 2;

    if (newLatDelta > maxDelta || newLongDelta > maxDelta) {
      return; // Prevent zooming out further
    }

    const newRegion = {
      ...region,
      latitudeDelta: newLatDelta,
      longitudeDelta: newLongDelta,
    };
    setRegion(newRegion);
    mapRef.current?.animateToRegion(newRegion);
  };

  const handleMarkerLongPress = (post: any) => {
    // Ensure post includes rating and visibility
    setSelectedPost({
      ...post,
      rating: post.rating || 0,
      visibility: post.visibility || "public",
    });
    setPostViewerVisible(true);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.header}>find spots!</Text>

        <MapView
          ref={mapRef}
          style={styles.map}
          region={region}
          onLongPress={handleMapLongPress}
          minZoomLevel={2} // Add minimum zoom level
          maxZoomLevel={20} // Add maximum zoom level
        >
          {userLocation && (
            <Marker
              coordinate={{
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
              }}
              title="You are here"
              pinColor="blue"
            />
          )}

          {selectedCategory === "Visited" &&
            visitedLocations.map((location, index) => (
              <Marker
                key={`visited-${location.id || index}`}
                coordinate={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                }}
                pinColor="green"
                onPress={() => handleMarkerLongPress(location)} // Add this line
              >
                <Callout>
                  <Text>{location.title}</Text>
                  {location.description && <Text>{location.description}</Text>}
                </Callout>
              </Marker>
            ))}

          {selectedCategory !== "Visited" &&
            markers.map((marker, index) => (
              <Marker
                key={`category-${index}`}
                coordinate={{
                  latitude: marker.latitude,
                  longitude: marker.longitude,
                }}
                title={marker.title}
                pinColor="yellow"
              >
                <Callout>
                  <Text>{marker.title}</Text>
                </Callout>
              </Marker>
            ))}

          {selectedLocation && (
            <Marker
              coordinate={selectedLocation}
              pinColor="red"
              title="Selected Location"
            />
          )}
        </MapView>

        {/* Add Zoom Controls */}
        <View style={styles.zoomControls}>
          <TouchableOpacity style={styles.zoomButton} onPress={handleZoomIn}>
            <Ionicons name="add" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.zoomButton} onPress={handleZoomOut}>
            <Ionicons name="remove" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={styles.categoryContainer}>
          {["Food", "Nature", "Urban", "Landmarks", "Visited"].map(
            (category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  selectedCategory === category && styles.categoryButtonActive,
                ]}
                onPress={() => fetchLocationsByCategory(category)}
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
      </SafeAreaView>
      {selectedPost && (
        <PostViewer // Add this block
          visible={postViewerVisible}
          onClose={() => setPostViewerVisible(false)}
          post={selectedPost}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF5E4", // Light beige background
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#FFF5E4",
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
    borderRadius: 20, // Add rounded corners
    overflow: "hidden", // Ensure content respects border radius
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
  zoomControls: {
    position: "absolute",
    right: 30,
    top: "50%",
    backgroundColor: "white",
    borderRadius: 8,
    padding: 5,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  zoomButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 5,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  thumbnailText: {
    fontSize: 12,
    color: "#333",
  },
});
