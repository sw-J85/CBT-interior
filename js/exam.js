let questions = [];
let index = 0;
let startTime = 0;

console.log("loadCSV start");


// CSV 로드 (id,question,answer,book,page,creator)
async function loadCSV() {
  const response = await fetch("./data/questions.txt");
  const text = await response.text();

  const lines = text
    .trim()                         // 빈 줄 제거
    .replace(/^\uFEFF/, "")         // BOM 제거
    .split("\n")                    // 줄 단위로 나누기
    .filter(line => line.trim() !== "");  // 완전 빈 줄 제거

  const rows = lines.map(line => line.split(","));

  return rows.map(row => ({
    id: row[0]?.trim(),
    question: row[1]?.trim(),
    answer: row[2]?.trim(),
    book: row[3]?.trim(),
    page: row[4]?.trim(),
    creator: row[5]?.trim()
  }));
}


// 로그인 확인 후 문제 시작
auth.onAuthStateChanged(async user => {
  if (!user) return location.href = "index.html";
  
  questions = await loadCSV();
  
  // 랜덤 셔플 가능 → 원하는 경우 활성화
  // questions.sort(() => Math.random() - 0.5);

  startTime = Date.now();
  showQuestion();
});

function showQuestion() {
  const q = questions[index];

  document.getElementById("question").innerHTML = `
    <b>Q${index + 1}.</b> ${q.question}
  `;

  document.getElementById("hint").innerHTML = ""; // 이전 힌트 제거
  document.getElementById("answer").value = "";
}

function submitAnswer() {
  const user = auth.currentUser;
  const q = questions[index];
  const input = document.getElementById("answer").value.trim();

  const correct = (input === q.answer.trim());

  const timeSpent = Math.floor((Date.now() - startTime) / 1000);

  // Firestore 저장
  db.collection("users").doc(user.uid).set({
    [q.id]: {
      correct: correct,
      answer: input,
      time: timeSpent
    }
  }, { merge: true });

  alert(correct ? "정답입니다!" : `오답입니다.\n정답: ${q.answer}`);

  nextQuestion();
}

function nextQuestion() {
  index++;

  if (index >= questions.length) {
    alert("모든 문제를 풀었습니다.");
    return (location.href = "main.html");
  }

  showQuestion();
}

function showHint() {
  const q = questions[index];

  document.getElementById("hint").innerHTML = `
    📘 <b>힌트:</b> ${q.book} / p.${q.page}
  `;
}



