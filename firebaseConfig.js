// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDEM_9XcUWv1xWQk9i-Q967HxdzaBDCiRE",
  authDomain: "wanderbook-407.firebaseapp.com",
  projectId: "wanderbook-407",
  storageBucket: "wanderbook-407.firebasestorage.app",
  messagingSenderId: "616772782333",
  appId: "1:616772782333:web:4cef3c8b07680af3489694",
  measurementId: "G-QLH0TC5SL3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export {db};