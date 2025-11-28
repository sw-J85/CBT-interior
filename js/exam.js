// =============================
// 전역 변수
// =============================
let questions = [];
let current = 0;
let correctCount = 0;
let wrongCount = 0;
let totalTime = 0;
let timer = null;

let mockTime = 3600;
let mockInterval;


// =============================
// 문제 불러오기 (필터 안정화 버전)
// =============================
async function loadProblems() {

  let subjects = JSON.parse(localStorage.getItem("selectedSubjects") || "[]");
  let creators = JSON.parse(localStorage.getItem("selectedCreators") || "[]");
  const mode = localStorage.getItem("mode") || "normal";

  // 🔥 1) 필터 값이 없으면 자동으로 전체 처리
  if (!Array.isArray(subjects) || subjects.length === 0) {
    subjects = ["all"];
  }
  if (!Array.isArray(creators) || creators.length === 0) {
    creators = ["all"];
  }

  let query = db.collection("problems");

  // 🔥 2) 과목 필터
  if (!subjects.includes("all")) {
    query = query.where("book", "in", subjects);
  }

  // 🔥 3) 출제자 필터
  if (!creators.includes("all")) {
    query = query.where("creator", "in", creators);
  }

  const snap = await query.get();
  questions = snap.docs.map(doc => doc.data());

  // 🔥 4) 모의고사 처리 (40문제 제한)
  if (mode === "mock") {
    shuffle(questions);
    questions = questions.slice(0, 40);
    totalTime = 0;
    startMockTimer();
  } else {
    startTimer();
  }

  shuffle(questions);
  current = 0;

  showQuestion();
  updateStats();
}


// =============================
// 배열 섞기
// =============================
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}


// =============================
// 문제 표시
// =============================
function showQuestion() {
  const q = questions[current];

  document.getElementById("question").innerText = q.question;

  document.getElementById("creator").innerText =
    q.creator ? `출제자: ${q.creator}` : "";

  document.getElementById("answer").value = "";
  document.getElementById("hint").innerText = "";
  document.getElementById("result").innerHTML = "";

  loadComments(q.id);
}


// =============================
// 정답 제출
// =============================
function submitAnswer() {
  const input = document.getElementById("answer").value.trim();
  const correct = String(questions[current].answer).trim();
  const resultBox = document.getElementById("result");

  showHint(); // 힌트 자동 표시

  if (!input) {
    wrongCount++;
    resultBox.innerHTML = `
      <span style="color:#F44336;font-weight:bold;">✖ 오답입니다!</span>
      <br><span style="color:#bbb;">정답: ${correct}</span>
    `;
    updateStats();
    return;
  }

  // CBT-style 정답 비교
  const u = input.replace(/[\s\(\)]/g, "").toLowerCase();
  const c = correct.replace(/[\s\(\)]/g, "").toLowerCase();

  const isCorrect =
    u === c ||
    c.includes(u) ||
    u.includes(c);

  if (isCorrect) {
    correctCount++;
    resultBox.innerHTML = `<span style="color:#4CAF50;font-weight:bold;">✔ 정답입니다!</span>`;
  } else {
    wrongCount++;
    resultBox.innerHTML = `
      <span style="color:#F44336;font-weight:bold;">✖ 오답입니다!</span>
      <br><span style="color:#bbb;">정답: ${correct}</span>
    `;
  }

  updateStats();
}


// =============================
// Enter 키로 정답 제출
// =============================
document.getElementById("answer").addEventListener("keydown", function (event) {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    submitAnswer();
  }
});


// =============================
// 다음 문제
// =============================
function nextQuestion() {
  document.getElementById("result").innerHTML = "";
  current++;

  if (current >= questions.length) {
    finishExam();
    return;
  }
  showQuestion();
}


// =============================
// 힌트(book + page)
// =============================
function showHint() {
  const q = questions[current];
  const hintText = `📘 교재: ${q.book} | 📄 페이지: ${q.page}`;
  document.getElementById("hint").innerText = hintText;
}


// =============================
// 정답률 / 시간
// =============================
function updateStats() {
  const total = correctCount + wrongCount;
  const rate = total === 0 ? 0 : Math.floor((correctCount / total) * 100);

  const hrs = Math.floor(totalTime / 3600);
  const mins = Math.floor((totalTime % 3600) / 60);
  const secs = totalTime % 60;

  document.getElementById("stats").innerText =
    `정답률: ${rate}% | ✔ ${correctCount} | ✖ ${wrongCount} | ⏱ ${hrs}h ${mins}m ${secs}s`;
}


// =============================
// 일반 모드 타이머
// =============================
function startTimer() {
  timer = setInterval(() => {
    totalTime++;
    updateStats();
  }, 1000);
}


// =============================
// 모의고사 타이머
// =============================
function startMockTimer() {
  mockInterval = setInterval(() => {

    mockTime--;
    const m = Math.floor(mockTime / 60);
    const s = mockTime % 60;

    document.getElementById("stats").innerText =
      `모의고사 | 남은시간: ${m}분 ${String(s).padStart(2, "0")}초`;

    if (mockTime <= 0) {
      clearInterval(mockInterval);
      finishExam();
    }

  }, 1000);
}


// =============================
// 기록 초기화
// =============================
function resetStats() {
  if (!confirm("기록을 초기화할까요?")) return;

  correctCount = 0;
  wrongCount = 0;
  totalTime = 0;

  updateStats();
  showQuestion();
}


// =============================
// 시험 종료
// =============================
function finishExam() {
  clearInterval(timer);
  clearInterval(mockInterval);

  document.getElementById("question").innerText =
    "🎉 모든 문제를 풀었습니다!";

  saveRecord();
}


// =============================
// Firestore 기록 저장
// =============================
async function saveRecord() {
  const mode = localStorage.getItem("mode");

  await db.collection("records").add({
    date: new Date(),
    mode: mode,
    total: questions.length,
    correct: correctCount,
    wrong: wrongCount,
    time: totalTime
  });

  document.getElementById("result").innerText =
    "📌 기록이 저장되었습니다.";
}


// =============================
// LOGOUT
// =============================
function logout() {
  firebase.auth().signOut().then(() => {
    location.href = "index.html";
  });
}


// =============================
// 시작
// =============================
window.onload = () => {
  loadProblems();
};


// =============================
// Firestore 댓글 추가
// =============================
async function addComment() {
  const commentText = document.getElementById("comment-input").value.trim();
  if (!commentText) return;

  const problemId = questions[current].id;

  await db
    .collection("problems")
    .doc(problemId)
    .collection("comments")
    .add({
      text: commentText,
      writer: "마스터",
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

  document.getElementById("comment-input").value = "";
  loadComments(problemId);
}


// =============================
// Firestore 댓글 로딩
// =============================
async function loadComments(problemId) {
  const listBox = document.getElementById("comment-list");
  listBox.innerHTML = "로딩중...";

  const snap = await db
    .collection("problems")
    .doc(problemId)
    .collection("comments")
    .orderBy("createdAt", "asc")
    .get();

  listBox.innerHTML = "";

  snap.forEach(doc => {
    const c = doc.data();
    listBox.innerHTML += `
      <div class="hw-comment">
        <div>${c.text}</div>
        <div style="color:#777;font-size:13px;">작성자: ${c.writer}</div>
      </div>
    `;
  });
}
