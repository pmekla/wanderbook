import React, { useState, useEffect } from "react";
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
} from "react-native";

import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebaseConfig.js";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import * as FileSystem from "expo-file-system";

type RootStackParamList = {
  HomePage: undefined;
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
  const [userID, setUserID] = useState("1"); // Placeholder for user ID
  const [images, setImages] = useState<string[]>([]);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [imageData, setImageData] = useState<string[]>([]); // State for base64 images

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
      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
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
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets[0].uri) {
      // Generate a unique ID for the image
      const imageID = `image_${uuidv4()}`;

      // Read the image file as base64
      const imageUri = result.assets[0].uri;
      const base64Data = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Store image in AsyncStorage
      await AsyncStorage.setItem(imageID, base64Data);

      // Update state with image ID and data
      setImages([...images, imageID]);
      setImageData([...imageData, base64Data]);
    }
  };

  // Function to handle removing an image
  const handleRemoveImage = (index: number) => {
    const updatedImages = [...images];
    const updatedImageData = [...imageData];

    // Remove the image at the specified index
    updatedImages.splice(index, 1);
    updatedImageData.splice(index, 1);

    // Update the state
    setImages(updatedImages);
    setImageData(updatedImageData);
  };

  const savePost = async () => {
    try {
      const postData = {
        postID: uuidv4(),
        userID: userID,
        title: name,
        description: description,
        rating: rating,
        visibility: visibility.toLowerCase(),
        location: location || { latitude: 0, longitude: 0 },
        createdAt: serverTimestamp(),
        imageIDs: images, // Add image IDs to post data
      };

      await addDoc(collection(db, "posts"), postData); // Using imported db
      // Clear images from AsyncStorage
      for (const imageID of images) {
        await AsyncStorage.removeItem(imageID);
      }
      setImages([]);
      setImageData([]);

      console.log("Post added successfully!");
      navigation.navigate("HomePage");
    } catch (error) {
      console.error("Error occurred:", error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            <Text style={styles.header}>New Adventure</Text>

            {/* Name Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Name"
                value={name}
                onChangeText={setName}
              />
              <TouchableOpacity
                onPress={() => navigation.navigate("MapViewPage")}
              >
                <Text style={styles.icon}>📍</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={openDatePicker}>
                <Text style={styles.icon}>📅</Text>
              </TouchableOpacity>
            </View>

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

            {/* Image Upload Section */}
            <View style={styles.imageContainer}>
              {imageData.map((base64Data, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.imagePlaceholder}
                  onPress={images.length < 3 ? pickImage : undefined}
                  onLongPress={() => handleRemoveImage(index)}
                >
                  {base64Data ? (
                    <Image
                      source={{ uri: `data:image/jpeg;base64,${base64Data}` }}
                      style={{ width: "100%", height: "100%", borderRadius: 8 }}
                    />
                  ) : (
                    <Ionicons name="image" size={40} color="#ccc" />
                  )}
                </TouchableOpacity>
              ))}
              {images.length < 3 && (
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
});
