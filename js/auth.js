// js/auth.js

// Import functions from the Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { 
    getAuth, 
    onAuthStateChanged, 
    setPersistence, 
    browserLocalPersistence,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyADfl-XJ7atFkgJSas2l2ucOvSk4t_9iLY",
    authDomain: "puja-parikrama-10c49.firebaseapp.com",
    projectId: "puja-parikrama-10c49",
    storageBucket: "puja-parikrama-10c49.appspot.com",
    messagingSenderId: "158658583532",
    appId: "1:158658583532:web:6f997a14c8814c59b47ec9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// DOM Elements
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const googleLoginBtn = document.getElementById('google-login');
const googleSignupBtn = document.getElementById('google-signup');
const loginError = document.getElementById('login-error');
const loginSuccess = document.getElementById('login-success');
const signupError = document.getElementById('signup-error');
const signupSuccess = document.getElementById('signup-success');

const redirectUrl = 'planner.html';

// --- Check if user is already logged in ---
// Redirects to planner if a session is found.
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("User is already signed in. Redirecting...");
        window.location.href = redirectUrl;
    } else {
        console.log("No active user session found.");
    }
});

// --- Set Session Persistence ---
// This makes the user's login session last even after they close the browser.
// It will persist until they explicitly sign out.
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("Authentication persistence set to 'local'.");
  })
  .catch((error) => {
    console.error("Error setting persistence:", error);
  });

// --- Event Listeners for Authentication ---

// Email/Password Login
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                loginSuccess.textContent = 'Login successful! Redirecting...';
                loginSuccess.classList.add('active');
                loginError.classList.remove('active');
                // The onAuthStateChanged listener will handle the redirect automatically
            })
            .catch((error) => {
                loginError.textContent = error.message;
                loginError.classList.add('active');
                loginSuccess.classList.remove('active');
            });
    });
}

// Email/Password Signup
if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;

        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // After creating the user, update their profile with the name
                return updateProfile(userCredential.user, { displayName: name });
            })
            .then(() => {
                signupSuccess.textContent = 'Account created successfully! Please login.';
                signupSuccess.classList.add('active');
                signupError.classList.remove('active');
                setTimeout(() => {
                    document.querySelector('.auth-tab[data-tab="login"]').click();
                    document.getElementById('login-email').value = email;
                    document.getElementById('login-password').value = '';
                }, 2000);
            })
            .catch((error) => {
                signupError.textContent = error.message;
                signupError.classList.add('active');
                signupSuccess.classList.remove('active');
            });
    });
}

// Google Sign-In Logic
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

const handleGoogleAuth = (button, successEl, errorEl) => {
    button.classList.add('loading');
    button.disabled = true;

    signInWithPopup(auth, googleProvider)
        .then((result) => {
            successEl.textContent = 'Success! Redirecting...';
            successEl.classList.add('active');
            errorEl.classList.remove('active');
            // The onAuthStateChanged listener will handle the redirect automatically
        })
        .catch((error) => {
            errorEl.textContent = `Google Sign-In Error: ${error.message}`;
            errorEl.classList.add('active');
            successEl.classList.remove('active');
        })
        .finally(() => {
            button.classList.remove('loading');
            button.disabled = false;
        });
};

if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', () => handleGoogleAuth(googleLoginBtn, loginSuccess, loginError));
}
if (googleSignupBtn) {
    googleSignupBtn.addEventListener('click', () => handleGoogleAuth(googleSignupBtn, signupSuccess, signupError));
}
