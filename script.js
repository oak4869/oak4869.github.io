const URL = "./model/";

let model, webcam, maxPredictions;
let faceDetection;
let currentLabel = "";

async function init() {
  model = await tmImage.load(
    URL + "model.json",
    URL + "metadata.json"
  );

  webcam = new tmImage.Webcam(300, 300, true);
  await webcam.setup();
  await webcam.play();

  document.getElementById("camera-container").appendChild(webcam.canvas);

  const overlay = document.getElementById("overlay");
  overlay.width = 300;
  overlay.height = 300;

  faceDetection = new FaceDetection({
    locateFile: file =>
      `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`
  });

  faceDetection.setOptions({
    model: "short",
    minDetectionConfidence: 0.5
  });

  faceDetection.onResults(onFaceResults);

  window.requestAnimationFrame(loop);
}


async function loop() {
  webcam.update();
  await predict();
  await faceDetection.send({ image: webcam.canvas });
  window.requestAnimationFrame(loop);
}



async function predict() {
  const predictions = await model.predict(webcam.canvas);
  predictions.sort((a, b) => b.probability - a.probability);

  const best = predictions[0];
  currentLabel = best.className;

  const percent = (best.probability * 100).toFixed(2);

  document.getElementById("result").innerHTML =
    `ผลการตรวจจับ: <b>${best.className}</b><br>
     ความมั่นใจ: <b>${percent}%</b>`;
}


function onFaceResults(results) {
  const canvas = document.getElementById("overlay");
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (results.detections.length > 0) {
    results.detections.forEach(detection => {
      const box = detection.boundingBox;

      let color = "red";
      if (currentLabel.toLowerCase().includes("mask")) {
        color = "green";
      }

      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
      ctx.strokeRect(
        box.xCenter * canvas.width - (box.width * canvas.width) / 2,
        box.yCenter * canvas.height - (box.height * canvas.height) / 2,
        box.width * canvas.width,
        box.height * canvas.height
      );
    });
  }
}


init();
