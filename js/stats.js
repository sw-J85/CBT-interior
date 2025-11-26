auth.onAuthStateChanged(user => {
  if (!user) return location.href = "index.html";

  db.collection("users").doc(user.uid).get().then(doc => {
    if (!doc.exists) return;

    const data = doc.data();

    let correct = 0;
    let wrong = 0;
    let totalTime = 0;

    Object.values(data).forEach(q => {
      if (!q.correct) wrong++;
      else correct++;

      totalTime += q.time;
    });

    const accuracy = ((correct / (correct + wrong)) * 100).toFixed(1);

    document.getElementById("stats").innerHTML = `
      총 공부 시간: ${totalTime}초<br>
      정답: ${correct}문제<br>
      오답: ${wrong}문제<br>
      정답률: ${accuracy}%<br>
    `;
  });
});
