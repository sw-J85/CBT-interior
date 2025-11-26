let questions = [];
let index = 0;

let startTime = 0;      // 세션 시작 시간
let totalTime = 0;      // 누적 학습 시간
let correctCount = 0;   // 정답 개수
let wrongCount = 0;     // 오답 개수

console.log("loadCSV start");


// ======================
//  CSV/TXT 파일 로드
// ======================
async function loadCSV() {
  const response = await fetch("./data/questions.txt");
  const text = await response.text();

  const lines = text
    .trim()
    .replace(/^\uFEFF/, "") // BOM 제거
    .split("\n")
    .filter(line => line.trim() !== "");

  const rows = lines.map(line => line.split(","));

  return rows.slice(1).map(row => ({
    id: row[0]?.trim(),
    question: row[1]?.trim(),
    answer: row[2]?.trim(),
    book: row[3]?.trim(),
    page: row[4]?.trim(),
    creator: row[5]?.trim()
  }));
}



// ======================
//  로그인 후 데이터 로드
// ======================
auth.onAuthStateChanged(async user => {
  if (!user) return location.href = "index.html";

  const docRef = db.collection("users").doc(user.uid);
  const snap = await docRef.get();

  if (snap.exists) {
    const data = snap.data();
    totalTime = data.totalTime || 0;
    correctCount = data.correctCount || 0;
    wrongCount = data.wrongCount || 0;
  }

  questions = await loadCSV();

  startTime = Date.now();    // 세션 시작
  showQuestion();
  updateStatsUI();
});



// ======================
//  문제 표시
// ======================
function showQuestion() {
  const q = questions[index];

  document.getElementById("question").innerHTML = `
    <b>Q${index + 1}.</b> ${q.question}
  `;

  document.getElementById("hint").innerHTML = "";
  document.getElementById("answer").value = "";
}



// ======================
//  정답 제출
// ======================
async function submitAnswer() {
  const user = auth.currentUser;
  const q = questions[index];
  const input = document.getElementById("answer").value.trim();

  const isCorrect = (input === q.answer);

  if (isCorrect) {
    correctCount++;
  } else {
    wrongCount++;
  }

  alert(isCorrect ? "정답입니다!" : `오답입니다.\n정답: ${q.answer}`);

  // Firestore에 기록 저장
  await db.collection("users").doc(user.uid).set({
    correctCount,
    wrongCount,
    totalTime
  }, { merge: true });

  updateStatsUI();
// nextQuestion();   // 자동 넘김 제거

}



// ======================
//  다음 문제
// ======================
function nextQuestion() {
  index++;

  if (index >= questions.length) {
    alert("모든 문제를 완료했습니다!");
    saveStudyTime();
    return location.href = "main.html";
  }

  showQuestion();
}



// ======================
//  힌트 표시
// ======================
function showHint() {
  const q = questions[index];
  document.getElementById("hint").innerHTML = `
    📘 <b>힌트:</b> ${q.book} / p.${q.page}
  `;
}



// ======================
//  UI: 정답률, 시간 출력
// ======================
function updateStatsUI() {
  const rate = (correctCount + wrongCount === 0)
    ? 0
    : Math.floor((correctCount / (correctCount + wrongCount)) * 100);

  const hours = Math.floor(totalTime / 3600);
  const mins = Math.floor((totalTime % 3600) / 60);

  document.getElementById("stats").innerHTML = `
    📊 정답률: ${rate}% 
    | ✔ 정답: ${correctCount} 
    | ✖ 오답: ${wrongCount} 
    | ⏱ 누적 학습시간: ${hours}시간 ${mins}분
  `;
}



// ======================
//  학습시간 저장
// ======================
async function saveStudyTime() {
  const user = auth.currentUser;
  if (!user || startTime === 0) return;

  const sessionTime = Math.floor((Date.now() - startTime) / 1000);
  totalTime += sessionTime;

  await db.collection("users").doc(user.uid).set({
    totalTime
  }, { merge: true });

  startTime = Date.now();
}

window.addEventListener("beforeunload", saveStudyTime);



// ======================
//  기록 초기화
// ======================
async function resetStats() {
  const user = auth.currentUser;
  if (!user) return;

  correctCount = 0;
  wrongCount = 0;
  totalTime = 0;

  await db.collection("users").doc(user.uid).set({
    correctCount: 0,
    wrongCount: 0,
    totalTime: 0
  });

  updateStatsUI();
  alert("기록이 초기화되었습니다.");
}



// ======================
//  로그아웃
// ======================
function logout() {
  saveStudyTime();
  auth.signOut().then(() => {
    location.href = "index.html";
  });
}

