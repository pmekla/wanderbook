import { collection, addDoc, getDoc, doc, updateDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import bcrypt from 'bcryptjs';
import { Alert } from 'react-native';

// User type definition based on user.json schema
export interface User {
  
  username: string;
  bio: string;
  password?: string;
  location: string;
  profilePicture: string;
  posts: string[];
  friends: string[];
  incomingRequests?: string[];
  bucketListItems: {
    id: string;
    name: string;
    privacy: string;
    completed: boolean;
    images?: string[];
  }[];
}

// Authentication state keys
export const AUTH_KEYS = {
  USER_ID: 'userID',
  IS_LOGGED_IN: 'isLoggedIn',
};

// Login function
export const loginUser = async (user: string, password: string): Promise<User | null> => {
  try {
    // Query users collection for matching email/password
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('username', '==', user));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data() as User & { password: string };
      const isPasswordValid = bcrypt.compareSync(password, userData.password);
      if (isPasswordValid) {
        // Store auth state
        await AsyncStorage.setItem(AUTH_KEYS.USER_ID, userDoc.id);
        await AsyncStorage.setItem(AUTH_KEYS.IS_LOGGED_IN, 'true');

        return userData;
      }
    }
    return null;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Register function
export const registerUser = async (
  password: string,
  username: string
): Promise<User | null> => {
  try {
    // Check if username already exists
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('username', '==', username));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // Username is taken
      Alert.alert('Username is taken. Please choose another one.');
      return null;
    }

    // Generate hashed password
    const saltRounds = 10;
    var bcrypt = require('bcryptjs');
    let salt = bcrypt.genSaltSync(saltRounds);
      
    const hashedPassword = bcrypt.hashSync(password, salt);
    const newUser = {
      username,
      password: hashedPassword, 
      bio: '',
      location: '',
      profilePicture: '',
      posts: [],
      friends: [],
      incomingRequests: [],
      bucketListItems: [],
    };

    const docRef = await addDoc(collection(db, 'users'), newUser);
    
    // Store auth state
    await AsyncStorage.setItem(AUTH_KEYS.USER_ID, docRef.id);
    await AsyncStorage.setItem(AUTH_KEYS.IS_LOGGED_IN, 'true');

    return { ...newUser};
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

// Logout function
export const logoutUser = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(AUTH_KEYS.USER_ID);
    await AsyncStorage.setItem(AUTH_KEYS.IS_LOGGED_IN, 'false');
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

// Get current user
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const userID = await AsyncStorage.getItem(AUTH_KEYS.USER_ID);
    if (!userID) return null;

    const userDoc = await getDoc(doc(db, 'users', userID));
    if (userDoc.exists()) {
      const userData = userDoc.data() as User;
      return { ...userData, userID: userDoc.id } as User;
    }
    return null;
  } catch (error) {
    console.error('Get current user error:', error);
    throw error;
  }
};

// Define 'isLoggedIn' function properly
export const isLoggedIn = async (): Promise<boolean> => {
  try {
    const status = await AsyncStorage.getItem(AUTH_KEYS.IS_LOGGED_IN);
    return status === 'true';
  } catch (error) {
    return false;
  }
};

// Add post to user's posts array
export const addPostToUser = async (userID: string, postID: string): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userID);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data() as User;
      const updatedPosts = [...userData.posts, postID];
      
      await updateDoc(userRef, {
        posts: updatedPosts
      });
    }
  
  } catch (error) {
    console.error('Add post to user error:', error);
    throw error;
  }
};

export const getCurrentUserID = async (): Promise<string | null> => {
  try {
    const userID = await AsyncStorage.getItem(AUTH_KEYS.USER_ID);
    return userID;
  } catch (error) {
    console.error('Get current user ID error:', error);
    return null;
  }
};