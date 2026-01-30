const URL = "./model/";

let model, webcam, faceDetector;
let currentLabel = "Waiting";

async function init() {
  const result = document.getElementById("result");
  result.innerText = "กำลังโหลดโมเดล...";
  result.className = "result waiting";

  model = await tmImage.load(
    URL + "model.json",
    URL + "metadata.json"
  );

  webcam = new tmImage.Webcam(360, 360, true);
  await webcam.setup();
  await webcam.play();

  document.getElementById("camera-container").innerHTML = "";
  document.getElementById("camera-container").appendChild(webcam.canvas);

  const overlay = document.getElementById("overlay");
  overlay.width = webcam.canvas.width;
  overlay.height = webcam.canvas.height;

  faceDetector = new FaceDetection({
    locateFile: file =>
      `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`
  });

  faceDetector.setOptions({
    model: "short",
    minDetectionConfidence: 0.5
  });

  faceDetector.onResults(onFace);

  loop();
}

async function loop() {
  webcam.update();
  await predict();
  await faceDetector.send({ image: webcam.canvas });
  requestAnimationFrame(loop);
}

async function predict() {
  const predictions = await model.predict(webcam.canvas);
  predictions.sort((a, b) => b.probability - a.probability);

  const best = predictions[0];
  currentLabel = best.className;
  const percent = (best.probability * 100).toFixed(1);

  const result = document.getElementById("result");
  result.innerHTML = `${best.className} <br>${percent}%`;

  if (best.className === "Mask") {
    result.className = "result mask";
  } else {
    result.className = "result nomask";
  }
}

function onFace(results) {
  const canvas = document.getElementById("overlay");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (results.detections.length > 0) {
    results.detections.forEach(det => {
      const box = det.boundingBox;
      ctx.strokeStyle = currentLabel === "Mask" ? "green" : "red";
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



