const URL = "./model/";

let model, webcam, maxPredictions;

async function init() {
  model = await tmImage.load(
    URL + "model.json",
    URL + "metadata.json"
  );
  maxPredictions = model.getTotalClasses();

  const flip = true;
  webcam = new tmImage.Webcam(300, 300, flip);
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
  const percent = (best.probability * 100).toFixed(2);

  document.getElementById("result").innerHTML =
    `ผลการตรวจจับ: <b>${best.className}</b><br>
     ความมั่นใจ: <b>${percent}%</b>`;
}

init();
