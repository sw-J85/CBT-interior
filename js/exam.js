let questions = [];
let index = 0;

let startTime = 0;      // 세션 시작 시간
let totalTime = 0;      // 누적 학습 시간
let correctCount = 0;   // 정답 개수
let wrongCount = 0;     // 오답 개수

console.log("loadCSV start");


// ======================
//  CSV 안전 파서
//  (따옴표 안 콤마 처리)
// ======================
function parseCSVLine(line) {
  const result = [];
  let insideQuotes = false;
  let value = "";

  for (let char of line) {
    if (char === '"') {
      insideQuotes = !insideQuotes;
      continue;
    }
    if (char === "," && !insideQuotes) {
      result.push(value.trim());
      value = "";
      continue;
    }
    value += char;
  }
  result.push(value.trim());
  return result;
}


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

  const rows = lines.map(line => parseCSVLine(line));

  // 🎯 creator가 항상 row[5]에 오도록 보장
  return rows.slice(1).map(row => ({
    id: row[0] || "",
    question: row[1] || "",
    answer: row[2] || "",
    book: row[3] || "",
    page: row[4] || "",
    creator: row[5] || ""
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
    <div class="creator-tag">출제자: ${q.creator}</div>
  `;

  document.getElementById("hint").innerHTML = "";
  document.getElementById("result").style.display = "none";
  document.getElementById("answer").value = "";
}



// ======================
//  정답 제출
// ======================
function submitAnswer() {
  const q = questions[index];
  const userInput = document.getElementById("answer").value.trim();
  const resultBox = document.getElementById("result");

  if (!q) {
    resultBox.style.display = "block";
    resultBox.innerHTML = "문제가 로드되지 않았습니다.";
    return;
  }

  if (userInput === q.answer) {
      resultBox.style.display = "block";
      resultBox.style.color = "#CFAF3D";
      resultBox.style.borderLeft = "4px solid #CFAF3D";
      resultBox.innerHTML = "정답입니다!";
      correctCount++;
  } else {
      resultBox.style.display = "block";
      resultBox.style.color = "#FF5A5A";
      resultBox.style.borderLeft = "4px solid #FF5A5A";
      resultBox.innerHTML = `오답입니다. 정답: ${q.answer}`;
      wrongCount++;
  }

  updateStatsUI();
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

  const hours = String(Math.floor(totalTime / 3600)).padStart(2, "0");
  const mins = String(Math.floor((totalTime % 3600) / 60)).padStart(2, "0");
  const secs = String(totalTime % 60).padStart(2, "0");

  document.getElementById("stats").innerHTML = `
    📊 정답률: ${rate}% 
    | ✔ 정답: ${correctCount} 
    | ✖ 오답: ${wrongCount} 
    | ⏱ 누적 학습시간: ${hours}:${mins}:${secs}
  `;
}


// ======================
//  ⏱ 누적 시간 증가 타이머
// ======================
setInterval(() => {
  totalTime++;
  updateStatsUI();
}, 1000);



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
