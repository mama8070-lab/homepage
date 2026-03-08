import { initializeApp }    from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
import { getFirestore }     from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";
import { getAnalytics }     from "https://www.gstatic.com/firebasejs/12.10.0/firebase-analytics.js";

const firebaseConfig = {
  apiKey:            "AIzaSyAFOb75rlr0GQQs5EX_6XvQZayi4ya3ago",
  authDomain:        "choiyoungmi-homepage.firebaseapp.com",
  projectId:         "choiyoungmi-homepage",
  storageBucket:     "choiyoungmi-homepage.firebasestorage.app",
  messagingSenderId: "44112463493",
  appId:             "1:44112463493:web:e0898c56fa95380f3f0bec",
  measurementId:     "G-4MW22J2082"
};

const app = initializeApp(firebaseConfig);

export const auth     = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db       = getFirestore(app);

getAnalytics(app);
