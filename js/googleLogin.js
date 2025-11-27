// ==========================================
// HIVEWORKS CBT — Google Login System
// PC + Mobile 100% 호환 완성본
// Firebase v8 전용
// ==========================================


// -----------------------------
// Google 로그인 실행 (버튼 클릭 시)
// -----------------------------
function googleLogin() {
  const provider = new firebase.auth.GoogleAuthProvider();

  // 팝업 로그인은 모바일에서 차단됨 → 사용 금지
  // auth.signInWithPopup(provider);

  // PC / 모바일 모두 정상 로그인
  auth.signInWithRedirect(provider);
}



// -----------------------------
// Google 로그인 결과 처리
// (로그인 후 redirect 복귀 시 실행됨)
// -----------------------------
auth.getRedirectResult()
  .then(async (result) => {

    // 로그인 성공
    if (result.user) {
      const user = result.user;
      const docRef = db.collection("users").doc(user.uid);
      const doc = await docRef.get();

      // 최초 로그인 사용자 → 기본 데이터 초기 셋팅
      if (!doc.exists) {
        await docRef.set({
          createdAt: new Date(),
          total_time: 0,
          solved: 0,
          wrong: 0
        });
      }

      // 메인 페이지로 이동
      window.location.href = "main.html";
    }

  })
  .catch((error) => {
    alert("로그인 실패: " + error.message);
  });



// -----------------------------
// 이미 로그인된 상태라면 자동으로 main.html로 이동
// (로그인 페이지를 다시 오지 않아도 됨)
// -----------------------------
auth.onAuthStateChanged((user) => {
  if (user) {
    window.location.href = "main.html";
  }
});
