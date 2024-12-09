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
import {
  collection,
  getDocs,
  query,
  where,
  getDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AUTH_KEYS } from "../../services/authService";
import PostViewer from "./PostViewer";

// Update Post interface
interface Post {
  postID: string;
  title: string;
  imageURLs: string[];
  description?: string;
  rating?: number;
  location?: {
    latitude: number;
    longitude: number;
  };
}

const HomePage = () => {
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [friendsPosts, setFriendsPosts] = useState<
    (Post & { username: string })[]
  >([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const fetchPosts = async () => {
    try {
      const userID = await AsyncStorage.getItem(AUTH_KEYS.USER_ID);
      if (!userID) return;

      const userPostsQuery = query(
        collection(db, "posts"),
        where("userID", "==", userID)
      );
      const userPostsSnapshot = await getDocs(userPostsQuery);
      const userPostsData = userPostsSnapshot.docs.map((doc) => ({
        postID: doc.id,
        title: doc.data().title,
        imageURLs: doc.data().imageURLs || [],
        description: doc.data().description,
        rating: doc.data().rating,
        location: doc.data().location,
      }));
      setRecentPosts(userPostsData);

      const userDoc = await getDoc(doc(db, "users", userID));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const friends = userData.friends || [];

        const friendsPostsPromises = friends.map(async (friendID: string) => {
          const friendDoc = await getDoc(doc(db, "users", friendID));
          const friendUsername = friendDoc.exists()
            ? friendDoc.data().username
            : "Unknown";

          const friendPostsQuery = query(
            collection(db, "posts"),
            where("userID", "==", friendID),
            where("visibility", "in", ["friends", "public"])
          );
          const friendPostsSnapshot = await getDocs(friendPostsQuery);
          return friendPostsSnapshot.docs.map((doc) => ({
            postID: doc.id,
            title: doc.data().title,
            imageURLs: doc.data().imageURLs || [],
            description: doc.data().description,
            rating: doc.data().rating,
            location: doc.data().location,
            username: friendUsername,
          }));
        });

        const friendsPostsData = (
          await Promise.all(friendsPostsPromises)
        ).flat();
        setFriendsPosts(friendsPostsData);
      }
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

  const topSpots = [
    {
      id: 1,
      title: "Annapolis Rock",
      image: require("../../assets/images/annapolisrock.jpg"),
      details:
        "Length: 5 miles\nElevation: 840 ft\nDifficulty: Moderate\nPermit Required: None",
    },
    {
      id: 2,
      title: "Annapolis Rock",
      image: require("../../assets/images/niagFalls.jpeg"),
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

          {/* World Posts */}
          <Text style={styles.sectionTitle}>World Posts</Text>
          <FlatList
            data={recentPosts}
            horizontal
            keyExtractor={(item) => item.postID}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.spotCard}>
                {item.imageURLs && item.imageURLs.length > 0 ? (
                  <Image
                    source={{ uri: item.imageURLs[0] }}
                    style={styles.spotImage}
                  />
                ) : (
                  <View style={styles.noImagePlaceholder}>
                    <Text>No Image</Text>
                  </View>
                )}
                <Text style={styles.spotTitle}>{item.title}</Text>
              </TouchableOpacity>
            )}
          />

          {/* Friends' Posts */}
          <Text style={styles.sectionTitle}>Friends' Posts</Text>
          <FlatList
  data={friendsPosts}
  horizontal
  keyExtractor={(item) => item.postID}
  renderItem={({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => setSelectedPost(item)}>
      {item.imageURLs && item.imageURLs.length > 0 ? (
        <Image source={{ uri: item.imageURLs[0] }} style={styles.cardImage} />
      ) : (
        <View style={styles.noImagePlaceholder}>
          <Text>No Image</Text>
        </View>
      )}
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardSubtitle}>by {item.username}</Text>
    </TouchableOpacity>
  )}
/>

          {/* Top Spots */}
          <Text style={styles.sectionTitle}>Top Spots</Text>
          <FlatList
  data={topSpots}
  horizontal
  keyExtractor={(item) => item.id.toString()}
  renderItem={({ item }) => (
    <TouchableOpacity style={styles.spotCard}>
      <Image source={item.image} style={styles.spotImage} />
      <Text style={styles.spotTitle}>{item.title}</Text>
      <Text style={styles.spotDetails}>{item.details}</Text>
    </TouchableOpacity>
  )}
/>
        </View>
      </ScrollView>

      {/* Post Viewer Modal */}
      {selectedPost && (
        <PostViewer
          visible={!!selectedPost}
          onClose={() => setSelectedPost(null)}
          post={selectedPost}
        />
      )}
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
  resizeMode: "cover", // Ensures the image fits
  borderRadius: 8,
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
  cardSubtitle: {
    textAlign: "center",
    color: "#555",
  },
  card: {
    width: 150,
    marginRight: 16,
    backgroundColor: "#e0e0e0", // Light gray background
    borderRadius: 8, // Rounded corners
    overflow: "hidden",
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  cardImage: {
    width: 150,
    height: 100,
    resizeMode: "cover", // Ensures the image fits within the bounds
    borderRadius: 8,
  },
});

export default HomePage;
