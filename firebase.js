// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAZfz7UvyfiKPnN6AQ1cFrkeThlQeg06uk",
  authDomain: "inventory-managment-79166.firebaseapp.com",
  projectId: "inventory-managment-79166",
  storageBucket: "inventory-managment-79166.appspot.com",
  messagingSenderId: "483316174496",
  appId: "1:483316174496:web:c54a5f4e03dfd629adc3c5",
  measurementId: "G-X71M8KTY0M"
};

// Initialize Firebase

const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);
export const auth = getAuth(app);