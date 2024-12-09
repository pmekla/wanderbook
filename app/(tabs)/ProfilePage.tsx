import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  FlatList,
  RefreshControl,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  arrayUnion,
  addDoc,
  doc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../firebaseConfig.js";
import ImageComponent from "../../components/ImageComponent";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AUTH_KEYS, User } from "../../services/authService";
import { cloudinaryUpload } from "../../cloudinaryConfig";
import { Ionicons } from "@expo/vector-icons";
import { getCurrentUser } from "../../services/authService";
import { useRouter } from "expo-router";
import { logoutUser } from "../../services/authService";
import PostViewer from "./PostViewer";

// Update Post type
type Post = {
  postID: string;
  title: string;
  imageURLs: string[]; // Array of Cloudinary URLs
  description?: string;
  rating?: number;
  location?: {
    latitude: number;
    longitude: number;
  };
};

// Update User type for FriendRequests
type UserWithID = User & {
  userID: string;
};

const ProfilePage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Lists");
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editedUsername, setEditedUsername] = useState("");
  const [editedBio, setEditedBio] = useState("");
  const [editedLocation, setEditedLocation] = useState("");
  const [editedProfilePicture, setEditedProfilePicture] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [friendsModalVisible, setFriendsModalVisible] = useState(false);
  const [friends, setFriends] = useState<string[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<string[]>([]);
  const [searchUsername, setSearchUsername] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [friendsData, setFriendsData] = useState<User[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [userBadges, setUserBadges] = useState<string[]>([]);
  const [bucketListItems, setBucketListItems] = useState<
    {
      id: string;
      name: string;
      privacy: string;
      completed: boolean;
      images?: string[];
    }[]
  >([]);
  const [incomingRequestsData, setIncomingRequestsData] = useState<User[]>([]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchUserPosts().then(() => setRefreshing(false));
  }, []);

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
        description: doc.data().description,
        rating: doc.data().rating,
        location: doc.data().location,
      }));

      setUserPosts(postsData);
    } catch (error) {
      console.error("Error fetching user posts:", error);
    }
  };

  const fetchUserData = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        setUsername(currentUser.username || "");
        setBio(currentUser.bio || "");
        setLocation(String(currentUser.location) || "");
        setProfilePicture(currentUser.profilePicture || "");
        setFriends(currentUser.friends || []);
        setIncomingRequests(currentUser.incomingRequests || []);
        setBucketListItems(currentUser.bucketListItems || []);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    fetchUserData();
    if (activeTab === "Posts") {
      fetchUserPosts();
    }
  }, [activeTab]);

  useEffect(() => {
    if (modalVisible) {
      setEditedUsername(username);
      setEditedBio(bio);
      setEditedLocation(location);
      setEditedProfilePicture(profilePicture);
    }
  }, [modalVisible]);

  useEffect(() => {
    fetchUserData();
    fetchUserPosts();
  }, []);

  const openImagePicker = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets[0].uri) {
        const imageUri = result.assets[0].uri;
        const cloudinaryUrl = await cloudinaryUpload(imageUri);
        if (cloudinaryUrl) {
          setEditedProfilePicture(cloudinaryUrl);
        }
      }
    } catch (error) {
      console.error("Error picking profile image:", error);
    }
  };

  const saveProfileChanges = async () => {
    try {
      const userID = await AsyncStorage.getItem(AUTH_KEYS.USER_ID);
      if (userID) {
        const userRef = doc(db, "users", userID);
        await updateDoc(userRef, {
          username: editedUsername,
          bio: editedBio,
          location: editedLocation,
          profilePicture: editedProfilePicture,
        });
        // Update local state
        setUsername(editedUsername);
        setBio(editedBio);
        setLocation(editedLocation);
        setProfilePicture(editedProfilePicture);
        setModalVisible(false);
        // Reset edited fields
        setEditedUsername("");
        setEditedBio("");
        setEditedLocation("");
        setEditedProfilePicture("");
      }
      Alert.alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const searchUsers = async () => {
    if (!searchUsername.trim()) {
      Alert.alert("Please enter a username to search");
      return;
    }

    try {
      setIsLoading(true);
      const currentUserID = await AsyncStorage.getItem(AUTH_KEYS.USER_ID);
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("username", "==", searchUsername.trim()));
      const querySnapshot = await getDocs(q);

      const results = querySnapshot.docs
        .map((doc) => ({
          ...(doc.data() as User),
          userID: doc.id,
        }))
        .filter((user) => user.userID !== currentUserID); // Exclude current user

      setSearchResults(results);

      if (results.length === 0) {
        Alert.alert("No users found");
      }
    } catch (error) {
      Alert.alert("Error searching users");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendFriendRequest = async (targetUserID: string) => {
    try {
      setIsLoading(true);
      const currentUserID = await AsyncStorage.getItem(AUTH_KEYS.USER_ID);
      if (!currentUserID) {
        Alert.alert("Error", "You must be logged in to send friend requests");
        return;
      }
      if (currentUserID === targetUserID) {
        Alert.alert("Error", "You cannot send a friend request to yourself");
        return;
      }

      const userRef = doc(db, "users", targetUserID);
      await updateDoc(userRef, {
        incomingRequests: arrayUnion(currentUserID),
      });
      Alert.alert("Success", "Friend request sent!");
    } catch (error) {
      Alert.alert("Error", "Failed to send friend request");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const acceptFriendRequest = async (requesterID: string) => {
    try {
      const currentUserID = await AsyncStorage.getItem(AUTH_KEYS.USER_ID);
      if (currentUserID) {
        const currentUserRef = doc(db, "users", currentUserID);
        const requesterRef = doc(db, "users", requesterID);

        await updateDoc(currentUserRef, {
          friends: arrayUnion(requesterID),
          incomingRequests: incomingRequests.filter((id) => id !== requesterID),
        });

        await updateDoc(requesterRef, {
          friends: arrayUnion(currentUserID),
        });

        setFriends([...friends, requesterID]);
        setIncomingRequests(
          incomingRequests.filter((id) => id !== requesterID)
        );
        Alert.alert("Friend request accepted!");
      }
    } catch (error) {
      console.error("Error accepting friend request:", error);
    }
  };

  const fetchFriendsData = async () => {
    try {
      const friendsPromises = friends.map(async (friendID) => {
        const userDoc = await getDoc(doc(db, "users", friendID));
        if (userDoc.exists()) {
          return { ...userDoc.data(), userID: userDoc.id } as User;
        }
        return null;
      });

      const friendsResults = await Promise.all(friendsPromises);
      setFriendsData(
        friendsResults.filter((friend): friend is User => friend !== null)
      );
    } catch (error) {
      console.error("Error fetching friends data:", error);
    }
  };

  const fetchIncomingRequestsData = async () => {
    try {
      const requestsPromises = incomingRequests.map(async (requesterId) => {
        const userDoc = await getDoc(doc(db, "users", requesterId));
        if (userDoc.exists()) {
          return { ...userDoc.data(), userID: userDoc.id } as User;
        }
        return null;
      });

      const requestsResults = await Promise.all(requestsPromises);
      setIncomingRequestsData(
        requestsResults.filter(
          (requester): requester is User => requester !== null
        )
      );
    } catch (error) {
      console.error("Error fetching incoming requests data:", error);
    }
  };

  useEffect(() => {
    if (friendsModalVisible) {
      if (friends.length > 0) {
        fetchFriendsData();
      }
      if (incomingRequests.length > 0) {
        fetchIncomingRequestsData();
      }
    }
  }, [friendsModalVisible, friends, incomingRequests]);

  const handleLogout = async () => {
    try {
      await logoutUser();
      router.replace("/");
    } catch (error) {
      console.error("Logout error:", error);
      Alert.alert("Error logging out");
    }
  };

  const confirmDeleteBucketListItem = (id: string) => {
    console.log("Delete bucket list item:", id);
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
          setBucketListItems(updatedBucketListItems);
        }
      }
    } catch (error) {
      console.error("Error deleting bucket list item:", error);
    }
  };

  // Add this function after other function declarations
  const checkFriendStatus = (targetUserID: string) => {
    // Check if already friends
    if (friends.includes(targetUserID)) {
      return "friends";
    }
    // Check if request is pending
    if (incomingRequests.includes(targetUserID)) {
      return "pending";
    }
    return "none";
  };

  // Add these new functions after other function declarations
  const confirmDeleteFriend = (friendID: string, friendName: string) => {
    Alert.alert(
      "Remove Friend",
      `Are you sure you want to remove ${friendName} from your friends?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => deleteFriend(friendID),
        },
      ]
    );
  };

  const deleteFriend = async (friendID: string) => {
    try {
      const currentUserID = await AsyncStorage.getItem(AUTH_KEYS.USER_ID);
      if (currentUserID) {
        const currentUserRef = doc(db, "users", currentUserID);
        const friendRef = doc(db, "users", friendID);

        // Remove friend from current user's friends list
        await updateDoc(currentUserRef, {
          friends: friends.filter((id) => id !== friendID),
        });

        // Remove current user from friend's friends list
        const friendDoc = await getDoc(friendRef);
        if (friendDoc.exists()) {
          const friendData = friendDoc.data();
          await updateDoc(friendRef, {
            friends: (friendData.friends || []).filter(
              (id: string) => id !== currentUserID
            ),
          });
        }

        // Update local state
        setFriends(friends.filter((id) => id !== friendID));
        setFriendsData(
          friendsData.filter((friend) => friend.userID !== friendID)
        );

        Alert.alert("Success", "Friend removed successfully");
      }
    } catch (error) {
      console.error("Error deleting friend:", error);
      Alert.alert("Error", "Failed to remove friend");
    }
  };

  // Add confirmation before deleting a post
  const confirmDeletePost = (postID: string) => {
    Alert.alert("Delete Post", "Are you sure you want to delete this post?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deletePost(postID),
      },
    ]);
  };

  // Implement the deletePost function
  const deletePost = async (postID: string) => {
    try {
      await deleteDoc(doc(db, "posts", postID));
      setUserPosts(userPosts.filter((post) => post.postID !== postID));
      Alert.alert("Success", "Post deleted successfully");
    } catch (error) {
      console.error("Error deleting post:", error);
      Alert.alert("Error", "Failed to delete post");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header Section */}
        <View style={styles.header}>
          {/* Name Centered */}
          <Text style={styles.name}>{username}</Text>
          {/* Settings Icon */}
          <TouchableOpacity
            style={styles.settingsIcon}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="settings-outline" size={24} color="black" />
          </TouchableOpacity>

          {/* Profile Image and Stats */}
          <View style={styles.profileRow}>
            <Image
              style={styles.profileImage}
              source={{
                uri: profilePicture || "https://via.placeholder.com/150",
              }}
            />
            <View style={styles.statsContainer}>
              <TouchableOpacity
                style={styles.stat}
                onPress={() => setActiveTab("Posts")}
              >
                <Text style={styles.statNumber}>{userPosts.length}</Text>
                <Text style={styles.statLabel}>posts</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.stat}
                onPress={() => setFriendsModalVisible(true)}
              >
                <Text style={styles.statNumber}>{friends.length}</Text>
                <Text style={styles.statLabel}>friends</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Username, Bio, and Location */}
          <View style={styles.infoSection}>
            <Text style={styles.username}>@{username}</Text>
            <Text style={styles.bio}>{bio}</Text>
            <Text style={styles.location}>📍 {location}</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={
              activeTab === "Lists" ? styles.activeTab : styles.inactiveTab
            }
            onPress={() => setActiveTab("Lists")}
          >
            <Text style={styles.tabText}>Lists</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={
              activeTab === "Posts" ? styles.activeTab : styles.inactiveTab
            }
            onPress={() => setActiveTab("Posts")}
          >
            <Text style={styles.tabText}>Posts</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={
              activeTab === "Badges" ? styles.activeTab : styles.inactiveTab
            }
            onPress={() => setActiveTab("Badges")}
          >
            <Text style={styles.tabText}>Badges</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {activeTab === "Lists" && (
          <View style={styles.grid}>
            {bucketListItems.length === 0 ? (
              <View style={styles.emptyStateContainer}>
                <Text style={styles.emptyStateText}>
                  No lists to see here! Try creating one.
                </Text>
              </View>
            ) : (
              bucketListItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.gridItem}
                  onLongPress={() => confirmDeleteBucketListItem(item.id)}
                >
                  {item.images && item.images.length > 0 ? (
                    <Image
                      source={{ uri: item.images[0] }}
                      style={styles.gridImage}
                    />
                  ) : (
                    <View style={styles.placeholderBox} />
                  )}
                  <Text style={styles.gridText}>{item.name}</Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {activeTab === "Posts" && (
          <View style={styles.grid}>
            {userPosts.length === 0 ? (
              <View style={styles.emptyStateContainer}>
                <Text style={styles.emptyStateText}>
                  No posts to see here! Try creating one.
                </Text>
              </View>
            ) : (
              userPosts.map((item) => (
                <TouchableOpacity
                  key={item.postID}
                  style={styles.gridItem}
                  onPress={() => setSelectedPost(item)}
                  onLongPress={() => confirmDeletePost(item.postID)} // Add onLongPress handler
                >
                  {item.imageURLs && item.imageURLs.length > 0 ? (
                    <Image
                      source={{ uri: item.imageURLs[0] }}
                      style={styles.gridImage}
                    />
                  ) : (
                    <View style={styles.placeholderBox} />
                  )}
                  <Text style={styles.gridText}>{item.title}</Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

{activeTab === "Badges" && (
  <View style={styles.badgesContainer}>
    {userBadges.length === 0 ? (
      <View style={styles.emptyBadges}>
        <Text style={styles.badgesEmptyText}>
          No badges yet, see below on how to collect badges!
        </Text>
        {/* Placeholder Badges */}
        <View style={styles.badgesGrid}>
          <View style={styles.badgeBox}>
            <Ionicons name="medal-outline" size={40} color="#aaa" />
            <Text style={styles.badgeText}>First Post</Text>
          </View>
          <View style={styles.badgeBox}>
            <Ionicons name="medal-outline" size={40} color="#aaa" />
            <Text style={styles.badgeText}>50 Friends</Text>
          </View>
          <View style={styles.badgeBox}>
            <Ionicons name="medal-outline" size={40} color="#aaa" />
            <Text style={styles.badgeText}>Completed Hike</Text>
          </View>
        </View>
      </View>
    ) : (
      // Render actual badges if available
      <View style={styles.badgesGrid}>
        {userBadges.map((badge, index) => (
          <View key={index} style={styles.badgeBox}>
            <Ionicons name="medal" size={40} color="#ffd700" />
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        ))}
      </View>
    )}
  </View>
)}
      </ScrollView>

      {/* Post Viewer Modal */}
      {selectedPost && (
        <PostViewer
          visible={!!selectedPost}
          onClose={() => setSelectedPost(null)}
          post={selectedPost}
        />
      )}

      <Modal visible={modalVisible} animationType="slide">
        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
          >
            <ScrollView
              contentContainerStyle={{ flexGrow: 1 }}
              showsVerticalScrollIndicator={false}
            >
              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.modalContainer}>
                  {/* Header */}
                  <Text style={styles.modalHeader}>Edit Profile</Text>

                  {/* Profile Picture */}
                  <TouchableOpacity
                    onPress={openImagePicker}
                    style={styles.imageWrapper}
                  >
                    {editedProfilePicture ? (
                      <Image
                        source={{ uri: editedProfilePicture }}
                        style={styles.profileImageEdit}
                      />
                    ) : (
                      <Ionicons
                        name="person-circle-outline"
                        size={120}
                        color="#ccc"
                      />
                    )}
                    <Text style={styles.changePhotoText}>
                      Change Profile Picture
                    </Text>
                  </TouchableOpacity>

                  {/* Username Input */}
                  <TextInput
                    style={styles.input}
                    placeholder="Username"
                    value={editedUsername}
                    onChangeText={setEditedUsername}
                  />

                  {/* Bio Input */}
                  <TextInput
                    style={styles.textArea}
                    placeholder="Bio"
                    multiline
                    value={editedBio}
                    onChangeText={setEditedBio}
                  />

                  {/* Location Input */}
                  <TextInput
                    style={styles.input}
                    placeholder="Location"
                    value={editedLocation}
                    onChangeText={setEditedLocation}
                  />

                  {/* Save and Cancel Buttons */}
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={saveProfileChanges}
                  >
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                  >
                    <Text style={styles.logoutButtonText}>Logout</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

      <Modal visible={friendsModalVisible} animationType="slide">
        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
          >
            <ScrollView
              contentContainerStyle={{ flexGrow: 1 }}
              showsVerticalScrollIndicator={false}
            >
              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.modalContainer}>
                  {/* Header */}
                  <Text style={styles.modalHeader}>Friends</Text>

                  {/* Search Input */}
                  <TextInput
                    style={styles.input}
                    placeholder="Search by username"
                    value={searchUsername}
                    onChangeText={setSearchUsername}
                  />
                  <TouchableOpacity
                    style={styles.searchButton}
                    onPress={searchUsers}
                  >
                    <Text style={styles.searchButtonText}>Search</Text>
                  </TouchableOpacity>

                  {/* Search Results */}
                  {searchResults.map((user) => {
                    const friendStatus = checkFriendStatus(user.userID);
                    return (
                      <View key={user.userID} style={styles.friendItem}>
                        <View style={styles.friendInfo}>
                          <Image
                            source={{
                              uri:
                                user.profilePicture ||
                                "https://via.placeholder.com/50",
                            }}
                            style={styles.friendAvatar}
                          />
                          <Text>{user.username}</Text>
                        </View>
                        <TouchableOpacity
                          style={[
                            styles.addButton,
                            (isLoading || friendStatus !== "none") &&
                              styles.disabledButton,
                          ]}
                          onPress={() => sendFriendRequest(user.userID)}
                          disabled={isLoading || friendStatus !== "none"}
                        >
                          <Text style={styles.addButtonText}>
                            {isLoading
                              ? "..."
                              : friendStatus === "friends"
                              ? "Friends"
                              : friendStatus === "pending"
                              ? "Pending"
                              : "Add"}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })}

                  {/* Friends List */}
                  <Text style={styles.sectionHeader}>Your Friends</Text>
                  {friendsData.map((friend) => (
                    <TouchableOpacity
                      key={friend.userID}
                      style={styles.friendItem}
                      onLongPress={() =>
                        confirmDeleteFriend(friend.userID, friend.username)
                      }
                    >
                      <View style={styles.friendInfo}>
                        <Image
                          source={{
                            uri:
                              friend.profilePicture ||
                              "https://via.placeholder.com/50",
                          }}
                          style={styles.friendAvatar}
                        />
                        <Text>{friend.username}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}

                  {/* Incoming Friend Requests */}
                  <Text style={styles.sectionHeader}>Incoming Requests</Text>
                  {incomingRequestsData.map((requester) => (
                    <View key={requester.userID} style={styles.friendItem}>
                      <View style={styles.friendInfo}>
                        <Image
                          source={{
                            uri:
                              requester.profilePicture ||
                              "https://via.placeholder.com/50",
                          }}
                          style={styles.friendAvatar}
                        />
                        <Text>{requester.username}</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.acceptButton}
                        onPress={() => acceptFriendRequest(requester.userID)}
                      >
                        <Text style={styles.acceptButtonText}>Accept</Text>
                      </TouchableOpacity>
                    </View>
                  ))}

                  {/* Close Button */}
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setFriendsModalVisible(false)}
                  >
                    <Text style={styles.cancelButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF5E4",
  },
  header: {
    alignItems: "center", // Centers everything horizontally
    paddingVertical: 20,
    backgroundColor: "#FFF5E4",
  },
  profileImage: {
    width: 120, // Larger size for profile photo
    height: 120,
    borderRadius: 60, // Makes it circular
    marginRight: 20, // Adds spacing between the image and info
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
  },
  profileRow: {
    flexDirection: "row", // Align profile picture and stats side by side
    alignItems: "center", // Aligns them vertically
    justifyContent: "center", // Centers the row
    width: "90%", // Limits the width of the content
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    flex: 1,
    marginLeft: 10, // Adjusted spacing
  },
  stat: {
    alignItems: "center",
    marginHorizontal: 30, // Adjusted spacing
  },
  infoSection: {
    marginTop: 15,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 14,
    color: "#555",
  },
  username: {
    fontSize: 16,
    fontStyle: "italic",
    color: "#555",
    marginBottom: 5,
  },
  bio: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 5,
  },
  location: {
    fontSize: 14,
    color: "#555",
  },
  tabs: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderBottomWidth: 1,
    borderColor: "#ccc",
    marginBottom: 10,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderColor: "#000",
    padding: 10,
  },
  inactiveTab: {
    padding: 10,
  },
  tabText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    padding: 10,
  },
  gridItem: {
    width: "30%",
    alignItems: "center",
    marginBottom: 15,
    marginHorizontal: "1.5%",
  },
  gridImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  placeholderBox: {
    width: 100,
    height: 100,
    backgroundColor: "#ccc",
    borderRadius: 10,
  },
  gridText: {
    marginTop: 5,
    fontSize: 12,
    textAlign: "center",
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#FFF5E4",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  modalContainer: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: "#FFF5E4",
  },
  modalHeader: {
    fontSize: 24,
    textAlign: "center",
    marginBottom: 16,
    fontWeight: "bold",
  },
  imageWrapper: {
    alignItems: "center",
    marginBottom: 16,
  },
  profileImageEdit: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  changePhotoText: {
    marginTop: 8,
    color: "#007bff",
    textDecorationLine: "underline",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  textArea: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    height: 100,
    textAlignVertical: "top",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  saveButton: {
    backgroundColor: "#B4CDE6",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  cancelButton: {
    backgroundColor: "#ccc",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  settingsIcon: {
    position: "absolute",
    top: 10,
    right: 10, // Changed from left to right
    padding: 10,
  },
  searchButton: {
    backgroundColor: "#B4CDE6",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  searchButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  friendItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  friendInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  friendAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  addButton: {
    backgroundColor: "#28a745",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    minWidth: 80,
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
  },
  acceptButton: {
    backgroundColor: "#28a745",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  acceptButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  disabledButton: {
    opacity: 0.5,
  },
  logoutButton: {
    backgroundColor: "#ff4444",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  logoutButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    width: "100%",
    marginTop: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  badgesContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyBadges: {
    alignItems: "center",
    marginVertical: 20,
  },
  badgesEmptyText: {
    fontSize: 16,
    textAlign: "center",
    color: "#555",
    marginBottom: 20,
  },
  badgesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 20,
  },
  badgeBox: {
    width: 80,
    alignItems: "center",
    marginBottom: 15,
  },
  badgeText: {
    marginTop: 5,
    fontSize: 12,
    textAlign: "center",
    color: "#555",
  },  
});

export default ProfilePage;