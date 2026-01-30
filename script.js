const URL = "./model/";

let model = null;
let webcam = null;
let isRunning = false;

async function init() {
  if (isRunning) return; // กันกดซ้ำ
  isRunning = true;

  const resultEl = document.getElementById("result");
  resultEl.innerText = "กำลังโหลดโมเดล...";

  // โหลดโมเดล
  model = await tmImage.load(
    URL + "model.json",
    URL + "metadata.json"
  );

  console.log("model loaded");

  // สร้าง webcam
  webcam = new tmImage.Webcam(300, 300, true);
  await webcam.setup();
  await webcam.play();

  console.log("webcam ready", webcam.canvas);

  // แสดง canvas
  const container = document.getElementById("camera-container");
  container.innerHTML = "";
  container.appendChild(webcam.canvas);

  resultEl.innerText = "กำลังตรวจจับ...";
  window.requestAnimationFrame(loop);
}

async function loop() {
  // 🔒 กันกรณี canvas ยังไม่พร้อม
  if (!webcam || !webcam.canvas) {
    window.requestAnimationFrame(loop);
    return;
  }

  webcam.update();
  await predict();
  window.requestAnimationFrame(loop);
}

async function predict() {
  if (!model || !webcam || !webcam.canvas) return;

  const predictions = await model.predict(webcam.canvas);

  // 🔍 debug ดูค่าจริง
  console.log("predictions:", predictions);

  if (!predictions || predictions.length === 0) {
    document.getElementById("result").innerText = "ไม่พบผลการทำนาย";
    return;
  }

  predictions.sort((a, b) => b.probability - a.probability);

  const best = predictions[0];
  const percent = (best.probability * 100).toFixed(2);

  document.getElementById("result").innerHTML =
    `ผลลัพธ์: <b>${best.className}</b><br>
     ความมั่นใจ: <b>${percent}%</b>`;
}


