import { initializeApp, getApps, getApp } from 'firebase/app';
// Removed: import { getAuth } from 'firebase/auth';
// Removed: import { getFirestore } from 'firebase/firestore';
// import { getAnalytics } from "firebase/analytics"; // Optional: If you want Analytics

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // Optional
};

// Initialize Firebase (still needed if other Firebase services are used)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
// Removed: const auth = getAuth(app);
// Removed: const db = getFirestore(app);
// const analytics = getAnalytics(app); // Optional

// Export only the app instance if needed, otherwise this file might be removable
// if no other Firebase services are used.
export { app };
