import React from "react";
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
    title: string;
    imageURLs: string[];
    description?: string;
  };
};

const PostViewer: React.FC<PostViewerProps> = ({ visible, onClose, post }) => {
  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={30} color="#000" />
          </TouchableOpacity>
          <Text style={styles.title}>{post.title}</Text>
          {post.imageURLs.map((url, index) => (
            <Image key={index} source={{ uri: url }} style={styles.image} />
          ))}
          {post.description && (
            <Text style={styles.description}>{post.description}</Text>
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
    alignItems: "center",
  },
  closeButton: {
    alignSelf: "flex-end",
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 10,
  },
});

export default PostViewer;
