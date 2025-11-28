// =====================================================================
// HIVEWORKS CBT - MAIN FILTER (2-컬럼 UI 완전체)
// DOM 안정성, 필터 정규화, 전체선택 규칙, UI 전용 클래스 적용 버전
// =====================================================================

// DOM 로드 보장 (display:none, async 로딩 등 문제 해결)
window.addEventListener("load", () => {
  loadFilterOptions();
  setupFilterEvents();
});


// =====================================================================
// 🔥 1. Firestore에서 과목/출제자 목록 자동 로딩
// =====================================================================
async function loadFilterOptions() {
  try {
    const snap = await db.collection("problems").get();

    const books = new Set();
    const creators = new Set();

    snap.forEach(doc => {
      const data = doc.data();

      // BOOK 정규화
      if (data.book && typeof data.book === "string") {
        const cleanBook = data.book.trim();
        if (cleanBook !== "") books.add(cleanBook);
      }

      // CREATOR 정규화
      if (data.creator && typeof data.creator === "string") {
        const cleanCreator = data.creator.trim();
        if (cleanCreator !== "") creators.add(cleanCreator);
      }
    });

    // UI 반영
    renderSubjectList([...books]);
    renderCreatorList([...creators]);

  } catch (err) {
    console.error("🔥 필터 옵션 로딩 오류:", err);
  }
}


// =====================================================================
// 🔥 2. 과목 목록 렌더링 (2-컬럼 UI용)
// =====================================================================
function renderSubjectList(bookArray) {
  const div = document.getElementById("subject-list");
  div.innerHTML = "";

  // 🔸 전체 먼저 넣기 (항상 맨 위)
  div.innerHTML += createFilterItemHTML("subject", "all", "전체");

  // 🔸 나머지 항목
  bookArray.forEach(book => {
    div.innerHTML += createFilterItemHTML("subject", book, book);
  });
}


// =====================================================================
// 🔥 3. 출제자 목록 렌더링 (2-컬럼 UI용)
// =====================================================================
function renderCreatorList(creatorArray) {
  const div = document.getElementById("creator-list");
  div.innerHTML = "";

  // 🔸 전체 먼저
  div.innerHTML += createFilterItemHTML("creator", "all", "전체");

  // 🔸 나머지 출제자
  creatorArray.forEach(creator => {
    div.innerHTML += createFilterItemHTML("creator", creator, creator);
  });
}


// =====================================================================
// 🔥 4. 공용 UI 체크박스 생성 HTML
// (HIVEWORKS UI 스타일에 맞는 클래스 적용)
// =====================================================================
function createFilterItemHTML(type, value, label) {
  return `
    <label class="hw-check">
      <input type="checkbox" class="${type}" value="${value}">
      ${label}
    </label>
  `;
}


// =====================================================================
// 🔥 5. 전체 버튼 단일 선택 규칙 + 교차 선택 방지
// =====================================================================
function setupFilterEvents() {
  document.addEventListener("change", (e) => {

    // 과목 필터
    if (e.target.classList.contains("subject")) {
      const list = [...document.querySelectorAll(".subject")];
      const all = list.find(i => i.value === "all");

      if (e.target.value === "all") {
        if (e.target.checked) {
          // 전체 선택 → 나머지 모두 해제
          list.forEach(i => { if (i.value !== "all") i.checked = false; });
        }
      } else {
        // 개별 선택 시 전체 선택 해제
        if (all.checked) all.checked = false;
      }
    }

    // 출제자 필터
    if (e.target.classList.contains("creator")) {
      const list = [...document.querySelectorAll(".creator")];
      const all = list.find(i => i.value === "all");

      if (e.target.value === "all") {
        if (e.target.checked) {
          list.forEach(i => { if (i.value !== "all") i.checked = false; });
        }
      } else {
        if (all.checked) all.checked = false;
      }
    }

  });
}


// =====================================================================
// 🔥 6. 선택 저장 → exam.html 이동
// =====================================================================
function startCustomExam() {
  const subjects = [...document.querySelectorAll(".subject:checked")].map(i => i.value);
  const creators = [...document.querySelectorAll(".creator:checked")].map(i => i.value);

  const s = subjects.length > 0 ? subjects : ["all"];
  const c = creators.length > 0 ? creators : ["all"];

  localStorage.setItem("selectedSubjects", JSON.stringify(s));
  localStorage.setItem("selectedCreators", JSON.stringify(c));
  localStorage.setItem("mode", "normal");

  window.location.href = "exam.html";
}


// =====================================================================
// 🔥 7. 모의고사 모드: 전과목 + 전체 출제자 고정
// =====================================================================
function startMockTest() {
  localStorage.setItem("selectedSubjects", JSON.stringify(["all"]));
  localStorage.setItem("selectedCreators", JSON.stringify(["all"]));
  localStorage.setItem("mode", "mock");

  window.location.href = "exam.html";
}
