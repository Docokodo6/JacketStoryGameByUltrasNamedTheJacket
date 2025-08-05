document.addEventListener("click", () => {
  const music = document.getElementById("bgMusic");
  music.muted = false;
  music.play();
});

const narratorLines = [
  "It's getting darker...",
  "Why does this jacket feel so heavy...",
  "Almost there...",
  "Is this really goodbye?",
  "Grandma's house is just ahead..."
];

let narratorIndex = 0;
const narratorText = document.getElementById("narratorText");

function typeNarratorLine(line, speed = 30) {
  narratorText.textContent = "";
  let i = 0;
  function type() {
    if (i < line.length) {
      narratorText.textContent += line.charAt(i);
      i++;
      setTimeout(type, speed);
    }
  }
  type();
}

function showNarratorLine(index) {
  if (index < narratorLines.length) {
    typeNarratorLine(narratorLines[index]);
  }
}

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const loadedImages = {
  background: new Image(),
  ground: new Image(),
  idle: new Image(),
  walk: [],
  house: new Image()
};

loadedImages.background.src = "Home.JPG";
loadedImages.ground.src = "Ground.png";
loadedImages.idle.src = "Subject 3.png";
["Subject.png", "Subject 2.png", "Subject.png"].forEach((src, i) => {
  const img = new Image();
  img.src = src;
  loadedImages.walk[i] = img;
});
loadedImages.house.src = "Subject 4.png";

const girl = {
  x: 50,
  y: 260,
  width: 32,
  height: 48,
  frameIndex: 0,
  frameTimer: 0,
  frameDelay: 10,
  dir: "right",
  moving: false,
};

const houseX = 550, houseY = 230;
let keys = {}, joyX = 0;
let stepsTriggered = [];

function loadFrame() {
  if (girl.moving) {
    girl.frameTimer++;
    if (girl.frameTimer >= girl.frameDelay) {
      girl.frameTimer = 0;
      girl.frameIndex = (girl.frameIndex + 1) % loadedImages.walk.length;
    }
  } else {
    girl.frameIndex = 0;
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(loadedImages.background, 0, 0, canvas.width, canvas.height);
  ctx.drawImage(loadedImages.ground, 0, canvas.height - 80, canvas.width, 80);
  ctx.drawImage(loadedImages.house, houseX, houseY, 64, 64);

  ctx.save();
  if (girl.dir === "left") {
    ctx.translate(girl.x + girl.width / 2, girl.y);
    ctx.scale(-1, 1);
    ctx.drawImage(
      girl.moving ? loadedImages.walk[girl.frameIndex] : loadedImages.idle,
      -girl.width / 2,
      0,
      girl.width,
      girl.height
    );
  } else {
    ctx.drawImage(
      girl.moving ? loadedImages.walk[girl.frameIndex] : loadedImages.idle,
      girl.x,
      girl.y,
      girl.width,
      girl.height
    );
  }
  ctx.restore();
}

function update() {
  girl.moving = false;

  if (keys["ArrowRight"] || keys["d"] || joyX > 0.3) {
    girl.x += 2;
    girl.dir = "right";
    girl.moving = true;
  }
  if (keys["ArrowLeft"] || keys["a"] || joyX < -0.3) {
    girl.x -= 2;
    girl.dir = "left";
    girl.moving = true;
  }

  // Trigger narrator line every 100 pixels
  let stepIndex = Math.floor(girl.x / 100);
  if (!stepsTriggered.includes(stepIndex) && narratorIndex < narratorLines.length) {
    showNarratorLine(narratorIndex++);
    stepsTriggered.push(stepIndex);
  }

  if (girl.x > houseX - girl.width) {
    endGame();
    return;
  }

  loadFrame();
  draw();
  requestAnimationFrame(update);
}

function endGame() {
  document.getElementById("blackOverlay").style.opacity = 1;
  setTimeout(() => {
    window.location.href = "scene2.html";
  }, 2000);
}

document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

const joystick = document.getElementById("joystick");
const stick = document.getElementById("stick");
let dragging = false;

joystick.addEventListener("touchstart", () => dragging = true);
joystick.addEventListener("touchmove", (e) => {
  if (!dragging) return;
  const rect = joystick.getBoundingClientRect();
  const touch = e.touches[0];
  const dx = touch.clientX - rect.left - 50;
  const dy = touch.clientY - rect.top - 50;
  const dist = Math.min(Math.sqrt(dx * dx + dy * dy), 40);
  const angle = Math.atan2(dy, dx);
  const x = Math.cos(angle) * dist;
  const y = Math.sin(angle) * dist;
  stick.style.left = 30 + x + "px";
  stick.style.top = 30 + y + "px";
  joyX = x / 40;
});
joystick.addEventListener("touchend", () => {
  dragging = false;
  stick.style.left = "30px";
  stick.style.top = "30px";
  joyX = 0;
});

update(); // Start immediately>