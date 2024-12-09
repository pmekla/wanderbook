import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { FAB, IconButton } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useFonts } from "expo-font"; // Add this import
import { Kalam_400Regular } from "@expo-google-fonts/kalam";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { v4 as uuidv4 } from "uuid";
import { AUTH_KEYS, getCurrentUser } from "../../services/authService";
import {
  collection,
  doc,
  updateDoc,
  arrayUnion,
  getDoc,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { cloudinaryUpload } from "../../cloudinaryConfig";

const BucketListPage = () => {
  const [bucketLists, setBucketLists] = useState<
    {
      id: string;
      name: string;
      privacy: string;
      completed: boolean;
      images?: string[];
    }[]
  >([]);
  const [newListName, setNewListName] = useState("");
  const [privacy, setPrivacy] = useState("private");
  const [selectedTab, setSelectedTab] = useState("inProgress");
  const [images, setImages] = useState<string[]>([]);
  const [imageData, setImageData] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const [fontsLoaded] = useFonts({
    Kalam_400Regular,
  });

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
    const fetchBucketListItems = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          setBucketLists(currentUser.bucketListItems);
        }
      } catch (error) {
        console.error("Error fetching bucket list items:", error);
      }
    };

    fetchBucketListItems();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const createBucketList = async () => {
    if (newListName.trim() === "") {
      alert("Please enter a name for your bucket list.");
      return;
    }

    const newBucketList = {
      id: Date.now().toString(),
      name: newListName,
      privacy,
      completed: false,
      images: imageData.length > 0 ? imageData : [],
    };

    setBucketLists((prev) => [...prev, newBucketList]);

    setNewListName("");
    setImages([]);
    setImageData([]);

    try {
      const userID = await AsyncStorage.getItem(AUTH_KEYS.USER_ID);
      if (userID) {
        const userRef = doc(db, "users", userID);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const updatedBucketListItems = [
            ...(userData.bucketListItems || []),
            newBucketList,
          ];
          console.log(updatedBucketListItems);
          await updateDoc(userRef, {
            bucketListItems: updatedBucketListItems,
          });
        }
      }
    } catch (error) {
      console.error("Error adding bucket list item:", error);
    }
  };

  const toggleComplete = (id: string) => {
    setBucketLists((prev) =>
      prev.map((list) =>
        list.id === id ? { ...list, completed: !list.completed } : list
      )
    );
  };

  const deleteBucketListItem = async (id: string) => {
    try {
      const userID = await AsyncStorage.getItem(AUTH_KEYS.USER_ID);
      if (userID) {
        const userRef = doc(db, "users", userID);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const updatedBucketListItems = userData.bucketListItems.filter(
            (item: { id: string }) => item.id !== id
          );
          await updateDoc(userRef, {
            bucketListItems: updatedBucketListItems,
          });
          setBucketLists(updatedBucketListItems);
        }
      }
    } catch (error) {
      console.error("Error deleting bucket list item:", error);
    }
  };

  const confirmDeleteBucketListItem = (id: string) => {
    Alert.alert(
      "Delete Bucket List",
      "Are you sure you want to delete this bucket list item?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteBucketListItem(id),
        },
      ]
    );
  };

  const renderBucketLists = () => {
    const filteredLists = bucketLists.filter(
      (list) => list.completed === (selectedTab === "completed")
    );

    return (
      <FlatList
        data={filteredLists}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.bucketListItem}
            onLongPress={() => confirmDeleteBucketListItem(item.id)}
          >
            <TouchableOpacity onPress={() => toggleComplete(item.id)}>
              <View style={styles.checkbox}>
                {item.completed && <View style={styles.checked} />}
              </View>
            </TouchableOpacity>
            <View style={styles.bucketListTextContainer}>
              <Text style={styles.bucketListText}>{item.name}</Text>
              <Text style={styles.privacyTag}>{item.privacy}</Text>
            </View>
            {item.images && (
              <View style={styles.miniImageContainer}>
                {item.images.map((url, index) => (
                  <Image
                    key={index}
                    source={{ uri: url }}
                    style={styles.miniImage}
                  />
                ))}
              </View>
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => (
          <Text style={styles.emptyText}>
            {selectedTab === "inProgress"
              ? "No bucket lists in progress."
              : "No completed bucket lists."}
          </Text>
        )}
      />
    );
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets[0].uri) {
      setIsUploading(true);
      const imageUri = result.assets[0].uri;
      const cloudinaryUrl = await cloudinaryUpload(imageUri);

      if (cloudinaryUrl) {
        setImages([...images, cloudinaryUrl]);
        setImageData([...imageData, cloudinaryUrl]);
      }
      setIsUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    const updatedImages = [...images];
    const updatedImageData = [...imageData];
    updatedImages.splice(index, 1);
    updatedImageData.splice(index, 1);
    setImages(updatedImages);
    setImageData(updatedImageData);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>create your bucketlist</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Enter bucket list name"
            value={newListName}
            onChangeText={setNewListName}
          />
          <IconButton icon="image-plus" size={24} onPress={pickImage} />
        </View>
        <View style={styles.privacyContainer}>
          <TouchableOpacity
            style={styles.privacyOption}
            onPress={() => setPrivacy("private")}
          >
            <View
              style={[
                styles.circle,
                privacy === "private" && styles.activeCircle,
              ]}
            />
            <Text
              style={[styles.radioText, { fontFamily: "Kalam_400Regular" }]}
            >
              Private
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.privacyOption}
            onPress={() => setPrivacy("friends")}
          >
            <View
              style={[
                styles.circle,
                privacy === "friends" && styles.activeCircle,
              ]}
            />
            <Text
              style={[styles.radioText, { fontFamily: "Kalam_400Regular" }]}
            >
              Friends
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.privacyOption}
            onPress={() => setPrivacy("public")}
          >
            <View
              style={[
                styles.circle,
                privacy === "public" && styles.activeCircle,
              ]}
            />
            <Text
              style={[styles.radioText, { fontFamily: "Kalam_400Regular" }]}
            >
              Public
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.imageContainer}>
          {imageData.map((url, index) => (
            <TouchableOpacity
              key={index}
              style={styles.imagePlaceholder}
              onPress={images.length < 3 ? pickImage : undefined}
              onLongPress={() => handleRemoveImage(index)}
            >
              {url ? (
                <Image
                  source={{ uri: url }}
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
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              selectedTab === "inProgress" && styles.activeTab,
            ]}
            onPress={() => setSelectedTab("inProgress")}
          >
            <Text style={[styles.tabText, { fontFamily: "Kalam_400Regular" }]}>
              In Progress
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              selectedTab === "completed" && styles.activeTab,
            ]}
            onPress={() => setSelectedTab("completed")}
          >
            <Text style={[styles.tabText, { fontFamily: "Kalam_400Regular" }]}>
              Completed
            </Text>
          </TouchableOpacity>
        </View>
        {renderBucketLists()}
        {isUploading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        )}
        <FAB icon="plus" style={styles.fab} onPress={createBucketList} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFF5E4",
  },
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 25,
    paddingHorizontal: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  textInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  privacyContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  privacyOption: {
    flexDirection: "row",
    alignItems: "center",
  },
  circle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "#333",
    marginRight: 10,
  },
  activeCircle: {
    backgroundColor: "#3399FF",
  },
  radioText: {
    fontSize: 16,
    color: "#333",
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
  tabContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f4f4f4",
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  activeTab: {
    backgroundColor: "#3399FF",
  },
  tabText: {
    color: "#333",
    fontWeight: "bold",
  },
  bucketListItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 10,
    borderColor: "#333",
    marginRight: 10,
  },
  checked: {
    width: 16,
    height: 16,
    backgroundColor: "#3399FF",
    borderRadius: 30,
    alignSelf: "center",
  },
  bucketListTextContainer: {
    flex: 1,
    flexDirection: "column",
  },
  bucketListText: {
    fontSize: 16,
  },
  privacyTag: {
    fontSize: 12,
    color: "#888",
  },
  emptyText: {
    textAlign: "center",
    color: "#888",
  },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#FFFFFF",
  },
  miniImageContainer: {
    flexDirection: "row",
    marginLeft: 10,
  },
  miniImage: {
    width: 30,
    height: 30,
    borderRadius: 4,
    marginRight: 5,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default BucketListPage;

