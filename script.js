const audioFileInput = document.getElementById('audioFile');
const visualizationCanvas = document.getElementById('visualization');
const playButton = document.getElementById('playButton');
const pauseButton = document.getElementById('pauseButton');
const resumeButton = document.getElementById('resumeButton');
const ctx = visualizationCanvas.getContext('2d');

let audioContext;
let source;
let analyser;
let dataArray;
let isPlaying = false;
let startTime = 0;
let pausedTime = 0;

function handleAudioFile(e) {
  const file = e.target.files[0];
  const reader = new FileReader();

  reader.onload = function(event) {
    processAudio(event.target.result);
  };

  reader.readAsArrayBuffer(file);
}

function processAudio(fileData) {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  audioContext = new AudioContext();

  audioContext.decodeAudioData(fileData, function(buffer) {
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    const bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    playButton.addEventListener('click', playAudio);
    pauseButton.addEventListener('click', pauseAudio);
    resumeButton.addEventListener('click', resumeAudio);

    playButton.disabled = false;
    pauseButton.disabled = true;
    resumeButton.disabled = true;

    createSource(buffer);

    renderVisualization();
  });
}

function createSource(buffer) {
  source = audioContext.createBufferSource();
  source.buffer = buffer;

  source.connect(analyser);
  analyser.connect(audioContext.destination);
}

function playAudio() {
  if (!isPlaying) {
    source.start(0, pausedTime);
    startTime = audioContext.currentTime - pausedTime;
    isPlaying = true;

    playButton.disabled = true;
    pauseButton.disabled = false;
    resumeButton.disabled = true;
  }
}

function pauseAudio() {
  if (isPlaying) {
    source.stop(0);
    pausedTime = audioContext.currentTime - startTime;
    isPlaying = false;

    playButton.disabled = true;
    pauseButton.disabled = true;
    resumeButton.disabled = false;
  }
}

function resumeAudio() {
  if (!isPlaying) {
    createSource(source.buffer);
    playAudio();
  }
}

function renderVisualization() {
  requestAnimationFrame(renderVisualization);
  analyser.getByteFrequencyData(dataArray);

  ctx.clearRect(0, 0, visualizationCanvas.width, visualizationCanvas.height);

  //Visualization rendering
  const barWidth = (visualizationCanvas.width / dataArray.length) * 2.5;
  let x = 0;
  for (let i = 0; i < dataArray.length; i++) {
    const barHeight = dataArray[i] ;

    ctx.fillStyle = `rgb(${barHeight + 100}, 50, 50)`;
    ctx.fillRect(x, visualizationCanvas.height - barHeight / 2, barWidth, barHeight / 2);

    x += barWidth + 1;
  }
}

//event listener for audio file selection
audioFileInput.addEventListener('change', handleAudioFile);


// Inside your script.js

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ canvas: visualizationCanvas });
renderer.setSize(window.innerWidth, window.innerHeight);

const geometry = new THREE.SphereGeometry(1, 32, 32); // Create a sphere geometry
const material = new THREE.MeshBasicMaterial({ color: 0x3498db }); // Set the material color

const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  sphere.rotation.x += 0.005;
  sphere.rotation.y += 0.005;
  renderer.render(scene, camera);
}

animate();