const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "gymbag-29586.firebaseapp.com",
    projectId: "gymbag-29586",
    storageBucket: "gymbag-29586.appspot.com",
    messagingSenderId: "67536575856",
    appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

function getCurrentUser() {
    return new Promise((resolve, reject) => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            unsubscribe();
            resolve(user);
        }, reject);
    });
}