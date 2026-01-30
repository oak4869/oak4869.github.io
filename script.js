const URL = "./model/";

let model, webcam;

async function init() {
  document.getElementById("result").innerText = "กำลังโหลดโมเดล...";

  model = await tmImage.load(
    URL + "model.json",
    URL + "metadata.json"
  );

  webcam = new tmImage.Webcam(300, 300, true);
  await webcam.setup();
  await webcam.play();

  document.getElementById("camera-container").innerHTML = "";
  document.getElementById("camera-container").appendChild(webcam.canvas);

  document.getElementById("result").innerText = "กำลังตรวจจับ...";
  window.requestAnimationFrame(loop);
}

async function loop() {
  webcam.update();
  await predict();
  window.requestAnimationFrame(loop);
}

async function predict() {
  const predictions = await model.predict(webcam.canvas);
  predictions.sort((a, b) => b.probability - a.probability);

  const best = predictions[0];
  const percent = (best.probability * 100).toFixed(2);

  document.getElementById("result").innerHTML =
    `ผลลัพธ์: <b>${best.className}</b><br>
     ความมั่นใจ: <b>${percent}%</b>`;
}
