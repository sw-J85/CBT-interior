let questions = [];
let index = 0;
let startTime;

async function loadCSV() {
  const response = await fetch("./data/questions.csv");
  const data = await response.text();
  const rows = data.split("\n").map(r => r.split(","));

  rows.shift(); // 헤더 제거
  return rows.map(r => ({
    id: r[0],
    type: r[1],
    text: r[2],
    answer: r[3],
    hint: r[4],
    book: r[5],
    page: r[6]
  }));
}

auth.onAuthStateChanged(async user => {
  if (!user) return location.href = "index.html";

  questions = await loadCSV();
  startTime = Date.now();
  showQuestion();
});

function showQuestion() {
  const q = questions[index];
  document.getElementById("question").innerText = q.text;
}

function submitAnswer() {
  const user = auth.currentUser;
  const q = questions[index];

  const input = document.getElementById("answer").value.trim();

  const correct = (input === q.answer);

  const timeSpent = Math.floor((Date.now() - startTime) / 1000);

  db.collection("users").doc(user.uid).set({
    [q.id]: {
      correct: correct,
      time: timeSpent
    }
  }, { merge: true });

  alert(correct ? "정답!" : "오답!");

  nextQuestion();
}

function nextQuestion() {
  index++;
  if (index >= questions.length) {
    alert("문제가 끝났습니다.");
    location.href = "main.html";
  }
  showQuestion();
}

function showHint() {
  const q = questions[index];
  document.getElementById("hint").innerText =
    `${q.book} / ${q.page} 페이지 참고`;
}
