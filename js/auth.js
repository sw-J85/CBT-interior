// ============================
// PC + 모바일 완전 호환 Google 로그인
// ============================

function googleLogin() {
  const provider = new firebase.auth.GoogleAuthProvider();

  // 🔥 팝업 방식 금지 (모바일 100% 실패)
  // auth.signInWithPopup(provider);

  // 🔥 PC + 모바일 모두 성공하는 방식
  auth.signInWithRedirect(provider);
}


// ============================
// Redirect 결과 처리
// (로그인 후 사이트로 다시 돌아왔을 때 실행됨)
// ============================

auth.getRedirectResult()
  .then(async (result) => {

    // 이미 로그인된 사용자 처리
    if (result.user) {

      const user = result.user;
      const docRef = db.collection("users").doc(user.uid);
      const doc = await docRef.get();

      // 최초 로그인 유저 초기 세팅
      if (!doc.exists) {
        await docRef.set({
          createdAt: new Date(),
          total_time: 0,
          solved: 0,
          wrong: 0
        });
      }

      // 🔥 메인 페이지로 이동
      window.location.href = "main.html";
    }

  })
  .catch((error) => {
    alert("로그인 실패: " + error.message);
  });


// ============================
// 이미 로그인된 사용자라면 main.html로 이동 처리
// ============================
auth.onAuthStateChanged((user) => {
  if (user) {
    // 이미 로그인된 상태라면 바로 진입
    window.location.href = "main.html";
  }
});
