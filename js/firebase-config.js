// firebase-config.js
// Firebase SDK 로드 (v8 CDN 방식)

var firebaseConfig = {
  apiKey: "AIzaSyATDdD5nRd9krNdfM9GUB8eki4WG01Y_Vc",
  authDomain: "interior-cbt.firebaseapp.com",
  projectId: "interior-cbt",
  storageBucket: "interior-cbt.appspot.com",   // 🔥 올바른 값
  messagingSenderId: "910430085286",
  appId: "1:910430085286:web:232c61cd8f4a0a72dc9467"
};

// Firebase 초기화
firebase.initializeApp(firebaseConfig);

// Auth & Firestore 레퍼런스
const auth = firebase.auth();
const db = firebase.firestore();
