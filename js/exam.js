// =============================
// 전역 변수
// =============================
let questions = [];
let current = 0;
let correctCount = 0;
let wrongCount = 0;
let totalTime = 0;
let timer = null;

// =============================
// 문제 불러오기 (async 필수)
// =============================
async function loadProblems() {
  const snap = await db.collection("problems").get();
  questions = snap.docs.map(doc => doc.data());

  shuffle(questions);
  current = 0;

  startTimer();
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
  document.getElementById("answer").value = "";

  document.getElementById("hint").innerText = "";
}

// =============================
// 정답 제출
// =============================
function submitAnswer() {
  const input = document.getElementById("answer").value.trim();
  const correct = String(questions[current].answer).trim();
  const resultBox = document.getElementById("result");

  if (input === correct) {
    correctCount++;
    resultBox.innerHTML = `<span style="color:#4CAF50; font-weight:bold;">✔ 정답입니다!</span>`;
  } else {
    wrongCount++;
    resultBox.innerHTML = `
      <span style="color:#F44336; font-weight:bold;">✖ 오답입니다!</span>
      <br><span style="color:#bbb;">정답: ${correct}</span>
    `;
  }

  updateStats();
}


// =============================
// 다음 문제
// =============================
function nextQuestion() {
  document.getElementById("result").innerHTML = ""; // 여기에만 초기화
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
// 정답률 / 시간 업데이트
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
// 타이머
// =============================
function startTimer() {
  timer = setInterval(() => {
    totalTime++;
    updateStats();
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
// 시험 종료 + 기록 저장
// =============================
function finishExam() {
  clearInterval(timer);

  document.getElementById("question").innerText =
    "🎉 모든 문제를 풀었습니다!";

  saveRecord();
}

// =============================
// Firestore 기록 저장
// =============================
async function saveRecord() {
  await db.collection("records").add({
    date: new Date(),
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


