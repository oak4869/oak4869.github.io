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
  // 🔒 กันซ้ำอีกชั้น
  if (!model || !webcam || !webcam.canvas) return;

  const predictions = awa
