import React, { useState, useEffect, useRef } from "react";
import {
  View,
  SafeAreaView,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
  StatusBar,
  Image,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from "react-native";

import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  arrayUnion,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../../firebaseConfig.js";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import * as FileSystem from "expo-file-system";
import MapView, { Marker, Region } from "react-native-maps";
import { cloudinaryUpload } from "../../cloudinaryConfig";
import { AUTH_KEYS } from "../../services/authService";

type RootStackParamList = {
  HomePage: { refresh: number } | undefined;
  MapViewPage: undefined;
  AddItemPage: undefined;
  BucketListPage: undefined;
  ProfilePage: undefined;
};

export type NavigationProps = NativeStackScreenProps<RootStackParamList>;

export default function AddItemPage() {
  const navigation = useNavigation<NavigationProps["navigation"]>();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [rating, setRating] = useState(0);
  const [visibility, setVisibility] = useState("Private");
  const [date, setDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [userID, setUserID] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [imageData, setImageData] = useState<string[]>([]); // State for base64 images
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [userLocation, setUserLocation] = useState<Region | null>(null);
  const mapRef = useRef<MapView>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  type Post = {
    postID: string;
    title: string;
    imageURLs: string[];
  };

  const [userPosts, setUserPosts] = useState<Post[]>([]);

  useEffect(() => {
    (async () => {
      // Request permission to access location
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return;
      }
      // Get current location
      let currentLocation = await Location.getCurrentPositionAsync({});
      const newRegion = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };

      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
      setUserLocation(newRegion);
    })();
  }, []);

  // Request camera & media library permissions
  useEffect(() => {
    (async () => {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        alert("Sorry, we need camera roll permissions to upload images!");
      }
    })();
  }, []);

  useEffect(() => {
    const fetchUserID = async () => {
      const id = await AsyncStorage.getItem(AUTH_KEYS.USER_ID);
      if (id) setUserID(id);
    };
    fetchUserID();
  }, []);

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        const userID = await AsyncStorage.getItem(AUTH_KEYS.USER_ID); // Get the actual user ID
        if (!userID) {
          console.error("User ID not found");
          return;
        }
        const postsRef = collection(db, "posts");
        const q = query(postsRef, where("userID", "==", userID));
        const querySnapshot = await getDocs(q);

        const postsData = querySnapshot.docs.map((doc) => ({
          postID: doc.id,
          title: doc.data().title,
          imageURLs: doc.data().imageURLs || [], // Use Cloudinary URLs
        }));

        setUserPosts(postsData);
      } catch (error) {
        console.error("Error fetching user posts:", error);
      }
    };

    fetchUserPosts();
  }, []);

  // Function to handle date selection
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  // Function to open the date picker
  const openDatePicker = () => {
    setShowDatePicker(true);
  };

  // Function to handle rating
  const handleRating = (index: number) => {
    setRating(index + 1);
  };

  // Function to handle visibility
  const handleVisibility = (option: string) => {
    setVisibility(option);
  };

  //function to generate a unique ID
  const generateID = () => {
    return Math.random().toString(36).substr(2, 9);
  };

  // Handle image picking
  const pickImage = async () => {
    try {
      console.log("Starting image picker...");
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      console.log("Image picker result:", result);

      if (!result.canceled && result.assets[0].uri) {
        const imageUri = result.assets[0].uri;
        console.log("Selected image URI:", imageUri);

        console.log("Uploading to Cloudinary...");
        const cloudinaryUrl = await cloudinaryUpload(imageUri);
        console.log("Cloudinary response:", cloudinaryUrl);

        if (cloudinaryUrl) {
          console.log("Current imageUrls:", imageUrls);
          console.log("Current imageData:", imageData);

          setImageUrls((prev) => {
            console.log("Setting new imageUrls:", [...prev, cloudinaryUrl]);
            return [...prev, cloudinaryUrl];
          });

          setImageData((prev) => {
            console.log("Setting new imageData:", [...prev, imageUri]);
            return [...prev, imageUri];
          });
        }
      }
    } catch (error) {
      console.error("Error in pickImage:", error);
    }
  };

  // Function to handle removing an image
  const handleRemoveImage = (index: number) => {
    console.log("Removing image at index:", index);
    console.log("Current imageUrls:", imageUrls);
    console.log("Current imageData:", imageData);

    const updatedUrls = [...imageUrls];
    const updatedImageData = [...imageData];
    updatedUrls.splice(index, 1);
    updatedImageData.splice(index, 1);

    console.log("Updated imageUrls:", updatedUrls);
    console.log("Updated imageData:", updatedImageData);

    setImageUrls(updatedUrls);
    setImageData(updatedImageData);
  };

  const handleMapLongPress = (e: any) => {
    const { coordinate } = e.nativeEvent;
    setLocation({
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
    });
    setSelectedLocation({
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
    });
  };

  const savePost = async () => {
    try {
      const userID = await AsyncStorage.getItem(AUTH_KEYS.USER_ID);
      if (!userID) {
        alert("User not logged in");
        return;
      }
      // Validate required fields
      if (!name.trim()) {
        alert("Please enter a name for your adventure");
        return;
      }

      // Ensure all fields have valid values
      const postData = {
        postID: uuidv4(),
        userID: userID || "1", // Fallback to default user
        title: name.trim(),
        description: description.trim() || "", // Empty string if no description
        rating: rating || 0,
        visibility: (visibility || "private").toLowerCase(),
        location: location || { latitude: 0, longitude: 0 },
        createdAt: serverTimestamp(),
        imageURLs: imageUrls, // Store Cloudinary URLs
        date: date ? date.toISOString() : null, // Store date if selected
      };

      // Log the data being sent (for debugging)
      console.log("Saving post data:", postData);

      const docRef = await addDoc(collection(db, "posts"), postData);
      console.log("Post added with ID:", docRef.id);

      // Add postID to user's posts array
      const userRef = doc(db, "users", userID);
      await updateDoc(userRef, {
        posts: arrayUnion(docRef.id),
      });

      // Clear form data
      setImageUrls([]);
      setImageData([]);
      setName("");
      setDescription("");
      setRating(0);
      setDate(null);

      // Navigate back to trigger refresh
      navigation.navigate("HomePage", { refresh: Date.now() });
    } catch (error) {
      console.error("Error details:", error);
      alert("Failed to save post. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <Text style={styles.header}>New Adventure</Text>

        {/* Name Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Name"
            value={name}
            onChangeText={setName}
          />

          <TouchableOpacity onPress={openDatePicker}>
            <Text style={styles.icon}>📅</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
              {/* Display Selected Date */}
              {date && (
                <Text style={styles.dateText}>
                  Adventure Date: {date.toDateString()}
                </Text>
              )}

              {/* Date Picker */}
              {showDatePicker && (
                <DateTimePicker
                  value={date || new Date()}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                />
              )}

              {/* Add Map View */}
              <View style={styles.mapContainer}>
                <MapView
                  ref={mapRef}
                  style={styles.map}
                  region={userLocation || undefined}
                  onLongPress={handleMapLongPress}
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
                  {selectedLocation && (
                    <Marker
                      coordinate={selectedLocation}
                      title="Selected Location"
                      pinColor="red"
                    />
                  )}
                </MapView>
              </View>

              {/* Image Upload Section */}
              <View style={styles.imageContainer}>
                {imageData.map((uri, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.imagePlaceholder}
                    onLongPress={() => handleRemoveImage(index)}
                  >
                    <Image
                      source={{ uri }}
                      style={styles.previewImage}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                ))}
                {imageData.length < 3 && (
                  <TouchableOpacity
                    style={styles.imagePlaceholder}
                    onPress={pickImage}
                  >
                    <Ionicons name="add" size={40} color="#ccc" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Description Input */}
              <TextInput
                style={styles.textArea}
                placeholder="Write about your adventure..."
                multiline
                value={description}
                onChangeText={setDescription}
              />

              {/* Rating Section */}
              <View style={styles.ratingContainer}>
                {[...Array(5)].map((_, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleRating(index)}
                  >
                    <Ionicons
                      name={index < rating ? "star" : "star-outline"}
                      size={32}
                      color={index < rating ? "#FFD700" : "#ccc"}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              {/* Visibility Options */}
              <View style={styles.visibilityContainer}>
                {["Private", "Friends", "Public"].map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={styles.visibilityOption}
                    onPress={() => handleVisibility(option)}
                  >
                    <Ionicons
                      name={
                        visibility === option
                          ? "radio-button-on"
                          : "radio-button-off"
                      }
                      size={20}
                      color="#000"
                    />
                    <Text style={styles.visibilityText}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Save Button */}
              <TouchableOpacity style={styles.saveButton} onPress={savePost}>
                <Text style={styles.saveButtonText}>POST ADVENTURE 🏔️ </Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFF5E4",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  container: {
    flexGrow: 1, // Changed from flex: 1
    padding: 16,
    backgroundColor: "#FFF5E4",
  },
  header: {
    fontSize: 36,
    textAlign: "center",
    marginBottom: 16,
    fontWeight: "bold",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 2,
    padding: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  icon: {
    fontSize: 24,
    marginHorizontal: 10,
  },
  dateText: {
    textAlign: "center",
    fontSize: 16,
    marginBottom: 16,
    color: "#555",
  },
  imageContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  imagePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: "#eee",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  mapContainer: {
    height: 200,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  map: {
    flex: 1,
  },
  textArea: {
    backgroundColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    height: 120,
    textAlignVertical: "top",
    marginBottom: 16,
  },
  ratingContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
  },
  visibilityContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginBottom: 16,
  },
  visibilityOption: {
    flexDirection: "row",
    alignItems: "center",
  },
  visibilityText: {
    marginLeft: 4,
    fontSize: 16,
    fontWeight: "500",
  },
  saveButton: {
    backgroundColor: "#B4CDE6",
    paddingVertical: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  userPostsContainer: {
    marginTop: 20,
  },
  userPostsHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  userPostTitle: {
    fontSize: 16,
    marginBottom: 5,
  },
});
