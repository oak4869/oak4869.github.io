console.log("script.js loaded");

const URL = "./model/";

let model, webcam;

async function init() {
  console.log("init started");

  model = await tmImage.load(
    URL + "model.json",
    URL + "metadata.json"
  );

  console.log("model loaded");

  webcam = new tmImage.Webcam(300, 300, true);
  await webcam.setup();
  await webcam.play();

  document.getElementById("camera-container").appendChild(webcam.canvas);
}

init();
