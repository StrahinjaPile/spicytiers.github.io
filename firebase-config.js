const firebaseConfig = {
    apiKey: "AIzaSyCewZk_Lqvt1saMUjZcz-_m5p3BItbwC0A",
    authDomain: "spicytiers.firebaseapp.com",
    projectId: "spicytiers",
    storageBucket: "spicytiers.firebasestorage.app",
    messagingSenderId: "994847851057",
    appId: "1:994847851057:web:3929f76d35324c299a0b10"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
