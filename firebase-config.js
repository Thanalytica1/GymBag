const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY || "AIzaSyDGK8z9XvY5x8QgZrF2mP7nV3bJ4cH9wL1",
    authDomain: "gymbag-29586.firebaseapp.com",
    projectId: "gymbag-29586",
    storageBucket: "gymbag-29586.appspot.com",
    messagingSenderId: "67536575856",
    appId: process.env.FIREBASE_APP_ID || "1:67536575856:web:8f7a6b5c4d3e2f1a9b8c7d",
    measurementId: "G-1234567890"
};

let app, auth, db, storage;

try {
    app = firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db = firebase.firestore();
    storage = firebase.storage();
    
    db.enablePersistence({ synchronizeTabs: true }).catch((err) => {
        if (err.code === 'failed-precondition') {
            console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
        } else if (err.code === 'unimplemented') {
            console.warn('The current browser does not support all of the features required to enable persistence');
        }
    });
    
    console.log('Firebase initialized successfully');
} catch (error) {
    console.error('Firebase initialization failed:', error);
    throw new Error('Failed to initialize Firebase. Please check your configuration.');
}

auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch((error) => {
    console.error('Failed to set auth persistence:', error);
});

let currentUserPromise = null;

function getCurrentUser() {
    if (currentUserPromise) {
        return currentUserPromise;
    }
    
    currentUserPromise = new Promise((resolve, reject) => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            unsubscribe();
            resolve(user);
        }, reject);
    });
    
    return currentUserPromise;
}

function clearUserCache() {
    currentUserPromise = null;
}

function isFirebaseInitialized() {
    return !!(app && auth && db && storage);
}

function getErrorMessage(error) {
    const errorMessages = {
        'auth/user-not-found': 'No user found with this email address.',
        'auth/wrong-password': 'Incorrect password.',
        'auth/email-already-in-use': 'An account with this email already exists.',
        'auth/weak-password': 'Password should be at least 6 characters.',
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
        'auth/network-request-failed': 'Network error. Please check your connection.',
        'permission-denied': 'You do not have permission to perform this action.',
        'unavailable': 'Service temporarily unavailable. Please try again.',
        'unauthenticated': 'Please sign in to continue.'
    };
    
    return errorMessages[error.code] || error.message || 'An unexpected error occurred.';
}