// js/auth.js

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
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// DOM Elements for Auth
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const googleLoginBtn = document.getElementById('google-login');
const googleSignupBtn = document.getElementById('google-signup');
const loginError = document.getElementById('login-error');
const loginSuccess = document.getElementById('login-success');
const signupError = document.getElementById('signup-error');
const signupSuccess = document.getElementById('signup-success');

// Redirect URL on successful login/signup
const redirectUrl = 'planner.html';

// Google Auth Provider
const googleProvider = new firebase.auth.GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Event Listeners for Auth Forms
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        auth.signInWithEmailAndPassword(email, password)
            .then(() => {
                loginSuccess.textContent = 'Login successful! Redirecting...';
                loginSuccess.classList.add('active');
                loginError.classList.remove('active');
                setTimeout(() => { window.location.href = redirectUrl; }, 1500);
            })
            .catch((error) => {
                loginError.textContent = error.message;
                loginError.classList.add('active');
                loginSuccess.classList.remove('active');
            });
    });
}

if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => userCredential.user.updateProfile({ displayName: name }))
            .then(() => {
                signupSuccess.textContent = 'Account created successfully! Please login.';
                signupSuccess.classList.add('active');
                signupError.classList.remove('active');
                setTimeout(() => {
                    document.querySelector('.auth-tab[data-tab="login"]').click();
                    document.getElementById('login-email').value = email;
                    document.getElementById('login-password').value = '';
                }, 1500);
            })
            .catch((error) => {
                signupError.textContent = error.message;
                signupError.classList.add('active');
                signupSuccess.classList.remove('active');
            });
    });
}

const handleGoogleAuth = (button, successMessageElement, errorMessageElement) => {
    button.classList.add('loading');
    button.disabled = true;
    auth.signInWithPopup(googleProvider)
        .then(() => {
            successMessageElement.textContent = 'Success! Redirecting...';
            successMessageElement.classList.add('active');
            errorMessageElement.classList.remove('active');
            setTimeout(() => { window.location.href = redirectUrl; }, 1500);
        })
        .catch((error) => {
            errorMessageElement.textContent = error.message;
            errorMessageElement.classList.add('active');
            successMessageElement.classList.remove('active');
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