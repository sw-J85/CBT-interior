// firebase-config.js
// Firebase SDK 로드 (모듈 방식 X, CDN 방식 사용 권장)

const firebaseConfig = {
  apiKey: "AIzaSyATDdD5nRd9krNdfM9GUB8eki4WG01Y_Vc",
  authDomain: "interior-cbt.firebaseapp.com",
  projectId: "interior-cbt",
  storageBucket: "interior-cbt.firebasestorage.app",
  messagingSenderId: "910430085286",
  appId: "1:910430085286:web:232c61cd8f4a0a72dc9467"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
