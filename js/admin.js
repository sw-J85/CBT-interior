// ==========================
// 관리자 설정
// ==========================
const adminEmail = "rupit85@gmail.com";  // ⭐ 여기를 마스터님 이메일로 변경
const db = firebase.firestore();


// ==========================
// 페이지 로드시 관리자 체크
// ==========================
auth.onAuthStateChanged(user => {
  if (!user) {
    location.href = "index.html";
    return;
  }

  if (user.email !== adminEmail) {
    alert("관리자만 접근할 수 있습니다.");
    location.href = "main.html";
    return;
  }

  document.getElementById("admin-check").innerText = 
    `관리자 인증 완료: ${user.email}`;
  document.getElementById("upload-area").style.display = "block";
});


// ==========================
// 엑셀 파일 파싱 (xlsx → JSON)
// ==========================
function uploadExcel() {
  const fileInput = document.getElementById("excelFile");
  if (!fileInput.files.length) {
    alert("엑셀 파일을 선택해주세요.");
    return;
  }

  const file = fileInput.files[0];
  const reader = new FileReader();

  reader.onload = async (e) => {
    const data = new Uint8Array(e.target.result);

    // xlsx 파서 사용 (Browser)
    const workbook = XLSX.read(data, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // JSON 변환
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    // Firestore 저장
    await uploadToFirestore(rows);

    document.getElementById("preview").innerText = 
      JSON.stringify(rows, null, 2);
  };

  reader.readAsArrayBuffer(file);
}


// ==========================
// Firestore에 문제 저장
// ==========================
async function uploadToFirestore(rows) {
  for (const row of rows) {
    const id = row["id"];

    if (!id) continue;

    // Firestore 문서 구조
    const problemData = {
      id: id,
      question: row["question"] || "",
      answer: row["answer"] || "",
      book: row["book"] || "",
      page: String(row["page"] || ""),
      creator: row["creator"] || ""
    };

    await db.collection("problems").doc(id).set(problemData);
  }

  alert("문제가 Firestore에 업로드 완료되었습니다.");
}
