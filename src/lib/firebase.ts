import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyB5NDsTyj0zaFVrCsa11NaXQtwx5b6-Qvs",
    authDomain: "atpayments-99495.firebaseapp.com",
    projectId: "atpayments-99495",
    storageBucket: "atpayments-99495.firebasestorage.app",
    messagingSenderId: "180886094774",
    appId: "1:180886094774:web:6062e496f4fce97bcdb717"
};

// Initialize Firebase (Singleton pattern to avoid re-initialization)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

// Enable Offline Persistence for Mobile App feel
if (typeof window !== 'undefined') {
    enableIndexedDbPersistence(db)
        .catch((err) => {
            if (err.code == 'failed-precondition') {
                console.warn('Persistence failed: Multiple tabs open');
            } else if (err.code == 'unimplemented') {
                console.warn('Persistence not supported by browser');
            }
        });

    // Auto-sign in anonymously to allow database access (if rules require auth)
    signInAnonymously(auth)
        .then(() => console.log("🔥 Firebase: Signed in anonymously"))
        .catch((error) => console.error("🔥 Firebase Auth Error:", error));
}

export { db, auth };
