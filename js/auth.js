function googleLogin() {
  const provider = new firebase.auth.GoogleAuthProvider();

  auth.signInWithPopup(provider)
    .then(async result => {
      const user = result.user;

      const docRef = db.collection("users").doc(user.uid);
      const doc = await docRef.get();

      if (!doc.exists) {
        // 최초 로그인 사용자 기록 초기 셋팅
        await docRef.set({
          createdAt: new Date(),
          total_time: 0,
          solved: 0,
          wrong: 0
        });
      }

      window.location.href = "main.html";
    })
    .catch(error => {
      alert("로그인 실패: " + error.message);
    });
}
