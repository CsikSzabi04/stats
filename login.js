import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { getFirestore, collection, doc, setDoc } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDc1kwgKvlsMpOzz9CQaEXm8Y8RWFlVefY",
    authDomain: "login-5a17c.firebaseapp.com",
    projectId: "login-5a17c",
    storageBucket: "login-5a17c.appspot.com",
    messagingSenderId: "1001870477104",
    appId: "1:1001870477104:web:383f5b7bd6c0e71df12af5",
    measurementId: "G-KTEJG562LL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Get elements
const loginFormDiv = document.getElementById("login-form");
const signupFormDiv = document.getElementById("signup-form");

// Toggle between Login and Signup
document.getElementById("show-signup").addEventListener("click", () => {
    loginFormDiv.classList.add("hidden");
    signupFormDiv.classList.remove("hidden");
});

document.getElementById("show-login").addEventListener("click", () => {
    signupFormDiv.classList.add("hidden");
    loginFormDiv.classList.remove("hidden");
});

// Handle Login
document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        alert(`Welcome back, ${userCredential.user.email}!`);
        console.log("Logged in user:", userCredential.user);
    } catch (error) {
        console.error("Error during login:", error.message);
        alert(`Login failed: ${error.message}`);
    }
});

// Handle Signup
document.getElementById("signupForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value.trim();

    try {
        // Create user in Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const userId = userCredential.user.uid;

        // Save user data to Firestore
        const usersRef = collection(db, "users");
        await setDoc(doc(usersRef, userId), {
            email: email,
            password: password // Typically, you wouldn't store passwords in plaintext!
        });

        alert(`Account created successfully for ${email}!`);
        console.log("User saved to Firestore:", { email, userId });
    } catch (error) {
        console.error("Error during signup:", error.message);
        alert(`Signup failed: ${error.message}`);
    }
});
