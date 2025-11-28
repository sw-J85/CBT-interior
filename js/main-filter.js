// =============================
// HIVEWORKS CBT - MAIN FILTER
// 안정화 버전 (DOM 보장 + 정규화 + 오류 방지)
// =============================

// DOM 로드 후 실행 (display:none 영역 문제 해결)
window.addEventListener("load", () => {
  loadFilterOptions();
  setupEvents();
});


// =============================
// 필터 옵션 자동 로딩
// =============================
async function loadFilterOptions() {
  try {
    const snap = await db.collection("problems").get();

    const books = new Set();
    const creators = new Set();

    snap.forEach(doc => {
      const data = doc.data();

      // ---------------------
      // BOOK 정규화
      // ---------------------
      if (data.book && typeof data.book === "string") {
        const cleanBook = data.book.trim();
        if (cleanBook !== "") books.add(cleanBook);
      }

      // ---------------------
      // CREATOR 정규화
      // ---------------------
      if (data.creator && typeof data.creator === "string") {
        const cleanCreator = data.creator.trim();
        if (cleanCreator !== "") creators.add(cleanCreator);
      }
    });

    renderSubjectList([...books]);
    renderCreatorList([...creators]);

  } catch (err) {
    console.error("필터 로딩 오류:", err);
  }
}


// =============================
// 과목 목록 출력
// =============================
function renderSubjectList(bookArray) {
  const div = document.getElementById("subject-list");
  div.innerHTML = "";

  bookArray.forEach(book => {
    div.innerHTML += `
      <label>
        <input type="checkbox" class="subject" value="${book}">
        ${book}
      </label><br>
    `;
  });

  // 전체 옵션
  div.innerHTML += `
    <label>
      <input type="checkbox" class="subject" value="all">
      전체
    </label>
  `;
}


// =============================
// 출제자 목록 출력
// =============================
function renderCreatorList(creatorArray) {
  const div = document.getElementById("creator-list");
  div.innerHTML = "";

  creatorArray.forEach(c => {
    div.innerHTML += `
      <label>
        <input type="checkbox" class="creator" value="${c}">
        ${c}
      </label><br>
    `;
  });

  div.innerHTML += `
    <label>
      <input type="checkbox" class="creator" value="all">
      전체
    </label>
  `;
}


// =============================
// 전체 선택 규칙 처리
// =============================
function setupEvents() {
  document.addEventListener("change", e => {

    // 과목 전체 체크
    if (e.target.classList.contains("subject")) {
      const list = [...document.querySelectorAll(".subject")];
      const all = list.find(i => i.value === "all");

      if (e.target.value === "all" && e.target.checked) {
        list.forEach(i => { if (i.value !== "all") i.checked = false; });
      } else {
        if (all.checked) all.checked = false;
      }
    }

    // 출제자 전체 체크
    if (e.target.classList.contains("creator")) {
      const list = [...document.querySelectorAll(".creator")];
      const all = list.find(i => i.value === "all");

      if (e.target.value === "all" && e.target.checked) {
        list.forEach(i => { if (i.value !== "all") i.checked = false; });
      } else {
        if (all.checked) all.checked = false;
      }
    }
  });
}


// =============================
// 사용자 선택 저장 → exam.html 이동
// =============================
function startCustomExam() {
  const subjects = [...document.querySelectorAll(".subject:checked")].map(i => i.value);
  const creators = [...document.querySelectorAll(".creator:checked")].map(i => i.value);

  // 빈 선택 방지 → 자동 전체 처리
  const s = subjects.length > 0 ? subjects : ["all"];
  const c = creators.length > 0 ? creators : ["all"];

  localStorage.setItem("selectedSubjects", JSON.stringify(s));
  localStorage.setItem("selectedCreators", JSON.stringify(c));
  localStorage.setItem("mode", "normal");

  window.location.href = "exam.html";
}


// =============================
// 모의고사: 전과목 + 전체 출제자 고정
// =============================
function startMockTest() {
  localStorage.setItem("selectedSubjects", JSON.stringify(["all"]));
  localStorage.setItem("selectedCreators", JSON.stringify(["all"]));
  localStorage.setItem("mode", "mock");

  window.location.href = "exam.html";
}
