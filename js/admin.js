// ==============================
// 관리자 인증 & Firestore 연결
// ==============================

// 로그인 여부 감시
firebase.auth().onAuthStateChanged(async (user) => {
  const adminCheck = document.getElementById("admin-check");
  const uploadArea = document.getElementById("upload-area");

  if (!user) {
    adminCheck.innerText = "⚠ 로그인 필요 (관리자만 접근 가능)";
    uploadArea.style.display = "none";
    return;
  }

  // Firestore의 admins 문서에 uid가 있어야 관리자
  const adminDoc = await firebase.firestore()
    .collection("admins")
    .doc(user.uid)
    .get();

  if (adminDoc.exists) {
    adminCheck.innerText = `✔ 관리자 인증 완료: ${user.email}`;
    uploadArea.style.display = "block";
  } else {
    adminCheck.innerText = "❌ 관리자 권한 없음";
    uploadArea.style.display = "none";
  }
});

// ==============================
//  엑셀 업로드 기능
// ==============================

async function uploadExcel() {
  const fileInput = document.getElementById("excelFile");
  const preview = document.getElementById("preview");

  if (!fileInput.files.length) {
    alert("엑셀 파일을 선택해주세요.");
    return;
  }

  const file = fileInput.files[0];
  preview.innerText = "엑셀 파일 읽는 중... 잠시만 기다려주세요.";

  const reader = new FileReader();

  reader.onload = async (e) => {
    try {
      // xlsx 파싱
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];

      const json = XLSX.utils.sheet_to_json(sheet);

      preview.innerText =
        `총 ${json.length}개의 문제가 감지됨\n` +
        JSON.stringify(json, null, 2);

      // Firestore 업로드
      for (let item of json) {
        await firebase.firestore().collection("problems").add(item);
      }

      alert("🔥 Firestore 업로드 완료!");
    } catch (err) {
      console.error(err);
      preview.innerText = "엑셀 읽기 실패: " + err.message;
    }
  };

  reader.readAsArrayBuffer(file);
}
