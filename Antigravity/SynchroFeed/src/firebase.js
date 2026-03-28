import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, enableMultiTabIndexedDbPersistence } from "firebase/firestore";

// Replace these values with your Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyCz4HC4X7iTz4Wtgy9HOWtz_wAeMrrbSak",
  authDomain: "synchrofeed.firebaseapp.com",
  projectId: "synchrofeed",
  storageBucket: "synchrofeed.firebasestorage.app",
  messagingSenderId: "48298490200",
  appId: "1:48298490200:web:1cd48f88cf5c7552e88d2d"
};

// Initialize Firebase
let app;
try {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    console.log("Firebase initialized successfully with project:", firebaseConfig.projectId);
  } else {
    app = getApp();
    console.log("Using existing Firebase app instance.");
  }
} catch (error) {
  console.error("Firebase Initialization Error:", error);
  app = getApp();
}

export const db = getFirestore(app);

// Enable persistence (offline cache and sync reliability)
try {
  enableMultiTabIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn("Persistence failed: multiple tabs open");
    } else if (err.code === 'unimplemented') {
      console.warn("Persistence failed: browser not supported");
    }
  });
} catch (e) {
  console.warn("Persistence could not be enabled.");
}
