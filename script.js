const URL = "./model/";

let model, webcam;
let currentLabel = "";

async function init() {
  console.log("init started");

  model = await tmImage.load(
    URL + "model.json",
    URL + "metadata.json"
  );

  webcam = new tmImage.Webcam(300, 300, true);
  await webcam.setup();
  await webcam.play();

  document.getElementById("camera-container").appendChild(webcam.canvas);

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
  currentLabel = best.className;

  document.getElementById("result").innerHTML =
    `ผลการตรวจจับ: <b>${best.className}</b><br>
     ความมั่นใจ: <b>${(best.probability * 100).toFixed(2)}%</b>`;
}

init();
