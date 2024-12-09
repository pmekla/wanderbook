import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type PostViewerProps = {
  visible: boolean;
  onClose: () => void;
  post: {
    postID: string;
    title: string;
    imageURLs: string[];
    description?: string;
    rating?: number;
    location?: {
      latitude: number;
      longitude: number;
    };
    visibility?: string;
  };
};

const PostViewer: React.FC<PostViewerProps> = ({ visible, onClose, post }) => {
  if (!post) return null; // Add this line

  const [rating, setRating] = useState(post.rating || 0);
  const [visibility, setVisibility] = useState(post.visibility || "private");

  const handleRating = (index: number) => {
    setRating(index + 1);
  };

  const handleVisibility = (option: string) => {
    setVisibility(option);
  };

  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={30} color="#000" />
          </TouchableOpacity>
          <Text style={styles.title}>{post.title}</Text>
          {post.imageURLs &&
            post.imageURLs.map(
              (
                url,
                index // Add null check
              ) => (
                <Image key={index} source={{ uri: url }} style={styles.image} />
              )
            )}
          {post.description && (
            <Text style={styles.description}>{post.description}</Text>
          )}
          <View style={styles.ratingContainer}>
            {[...Array(5)].map((_, index) => (
              <TouchableOpacity key={index} onPress={() => handleRating(index)}>
                <Ionicons
                  name={index < rating ? "star" : "star-outline"}
                  size={32}
                  color={index < rating ? "#FFD700" : "#ccc"}
                />
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.visibilityContainer}>
            {["private", "friends", "public"].map((option) => (
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
          {post.location && (
            <Text style={styles.location}>
              Location: {post.location.latitude}, {post.location.longitude}
            </Text>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFF5E4",
  },
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: "#FFF5E4",
    borderWidth: 2,
    borderColor: "#D3D3D3",
    borderRadius: 10,
    margin: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  closeButton: {
    alignSelf: "flex-end",
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    fontFamily: "Cochin",
    textAlign: "center",
    color: "#333",
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#D3D3D3",
  },
  description: {
    fontSize: 16,
    textAlign: "left",
    marginTop: 20,
    fontFamily: "Cochin",
    color: "#555",
    backgroundColor: "#FFF",
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D3D3D3",
  },
  ratingContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  visibilityContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginTop: 20,
  },
  visibilityOption: {
    flexDirection: "row",
    alignItems: "center",
  },
  visibilityText: {
    marginLeft: 4,
    fontSize: 16,
    fontWeight: "500",
    fontFamily: "Cochin",
    color: "#333",
  },
  rating: {
    fontSize: 16,
    textAlign: "left",
    marginTop: 30,
  },
  location: {
    fontSize: 16,
    textAlign: "left",
    marginTop: 40,
    fontFamily: "Cochin",
    color: "#555",
    backgroundColor: "#FFF",
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D3D3D3",
  },
});

export default PostViewer;
