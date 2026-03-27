import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, getDocs, collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, serverTimestamp, orderBy, limit } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "mock-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "mock-auth-domain",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "mock-project-id",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "mock-project-id"}.firebasestorage.app`,
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope("https://www.googleapis.com/auth/youtube.readonly");

export { 
  app, auth, db, storage, googleProvider, 
  signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, 
  doc, setDoc, getDoc, getDocs, collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, serverTimestamp, orderBy, limit,
  ref, uploadBytes, getDownloadURL, deleteObject
};
