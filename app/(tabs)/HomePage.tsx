import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  RefreshControl,
} from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig.js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ImageComponent from "../../components/ImageComponent";

// Update Post interface
interface Post {
  postID: string;
  title: string;
  imageURLs: string[]; // Array of Cloudinary URLs
}

const HomePage = () => {
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPosts = async () => {
    try {
      const postsSnapshot = await getDocs(collection(db, "posts"));
      const postsData = postsSnapshot.docs.map((doc) => ({
        postID: doc.id,
        title: doc.data().title,
        imageURLs: doc.data().imageURLs || [], // Use Cloudinary URLs
      }));
      setRecentPosts(postsData);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPosts().then(() => setRefreshing(false));
  }, []);

  useEffect(() => {
    fetchPosts();
  }, []);

  const recentLists = ["List 1", "List 2", "List 3", "List 4"];
  const topSpots = [
    {
      id: 1,
      title: "Annapolis Rock",
      image: "https://via.placeholder.com/150",
      details:
        "Length: 5 miles\nElevation: 840 ft\nDifficulty: Moderate\nPermit Required: None",
    },
    {
      id: 2,
      title: "Annapolis Rock",
      image: "https://via.placeholder.com/150",
      details:
        "Length: 5 miles\nElevation: 840 ft\nDifficulty: Moderate\nPermit Required: None",
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.container}>
          <Text style={styles.header}>home</Text>

          {/* Recent Lists */}
          <Text style={styles.sectionTitle}>Recent Lists</Text>
          <View style={styles.listContainer}>
            <FlatList
              data={recentPosts}
              horizontal
              keyExtractor={(item) => item.postID}
              renderItem={({ item }) => (
                // Update the card rendering
                <View style={styles.card}>
                  {item.imageURLs && item.imageURLs.length > 0 ? (
                    <Image
                      source={{ uri: item.imageURLs[0] }}
                      style={{ width: 150, height: 100 }}
                    />
                  ) : (
                    <View style={styles.noImagePlaceholder}>
                      <Text>No Image</Text>
                    </View>
                  )}
                  <Text style={styles.cardTitle}>{item.title}</Text>
                </View>
              )}
            />
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
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFF5E4", // Same as your container background to maintain consistency
  },
  container: {
    flex: 1,
    padding: 16,
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
    marginBottom: 16,
  },
  card: {
    width: 150,
    marginRight: 16,
    backgroundColor: "#e0e0e0",
    borderRadius: 8,
    overflow: "hidden",
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
  noImagePlaceholder: {
    width: "100%",
    height: 100,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  cardTitle: {
    marginTop: 8,
    textAlign: "center",
    fontWeight: "bold",
  },
});

export default HomePage;
