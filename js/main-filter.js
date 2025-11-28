async function loadFilterOptions() {
  const snap = await db.collection("problems").get();

  const books = new Set();
  const creators = new Set();

  snap.forEach(doc => {
    const data = doc.data();
    if (data.book) books.add(data.book);
    if (data.creator) creators.add(data.creator);
  });

  // DOM 출력 영역
  const subjectDiv = document.getElementById("subject-list");
  const creatorDiv = document.getElementById("creator-list");

  // ======================
  // 과목(book) 목록 출력
  // ======================
  books.forEach(book => {
    subjectDiv.innerHTML += `
      <label>
        <input type="checkbox" class="subject" value="${book}">
        ${book}
      </label><br>
    `;
  });

  // 전체 선택 옵션 추가
  subjectDiv.innerHTML += `
    <label>
      <input type="checkbox" class="subject" value="all"> 전체
    </label>
  `;

  // ======================
  // 출제자 목록 출력
  // ======================
  creators.forEach(c => {
    creatorDiv.innerHTML += `
      <label>
        <input type="checkbox" class="creator" value="${c}">
        ${c}
      </label><br>
    `;
  });

  creatorDiv.innerHTML += `
    <label>
      <input type="checkbox" class="creator" value="all"> 전체
    </label>
  `;
}

loadFilterOptions();


// =========================
// 시험 시작 시 선택값 저장
// =========================
function startCustomExam() {
  const subjects = [...document.querySelectorAll(".subject:checked")].map(s => s.value);
  const creators = [...document.querySelectorAll(".creator:checked")].map(c => c.value);

  localStorage.setItem("selectedSubjects", JSON.stringify(subjects));
  localStorage.setItem("selectedCreators", JSON.stringify(creators));
  localStorage.setItem("mode", "normal");

  window.location.href = "exam.html";
}

function startMockTest() {
  localStorage.setItem("selectedSubjects", JSON.stringify(["all"]));
  localStorage.setItem("selectedCreators", JSON.stringify(["all"]));
  localStorage.setItem("mode", "mock");

  window.location.href = "exam.html";
}
