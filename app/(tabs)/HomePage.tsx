import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig.js";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Post {
  postID: string;
  title: string;
  imageIDs?: string[];
}

const HomePage = () => {
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [imageData, setImageData] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postsSnapshot = await getDocs(collection(db, "posts"));
        const postsData = postsSnapshot.docs.map((doc) => ({
          postID: doc.id,
          title: doc.data().title,
          imageIDs: doc.data().imageIDs,
        }));
        setRecentPosts(postsData);

        // Fetch images from AsyncStorage
        const images: { [key: string]: string } = {};
        await Promise.all(
          postsData.map(async (post) => {
            if (post.imageIDs && post.imageIDs.length > 0) {
              const imageID = post.imageIDs[0]; // Use first image ID
              const base64Data = await AsyncStorage.getItem(imageID);
              if (base64Data) {
                images[post.postID] = base64Data;
              }
            }
          })
        );
        setImageData(images);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

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
              <View style={styles.card}>
                {imageData[item.postID] ? (
                  <Image
                    source={{
                      uri: `data:image/jpeg;base64,${imageData[item.postID]}`,
                    }}
                    style={{ width: "100%", height: 100, borderRadius: 8 }}
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
