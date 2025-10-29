const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Virtual resolution
const GAME_WIDTH = 800;
const GAME_HEIGHT = 500;

// Load assets (reuses your resources)
const bgImage = new Image(); bgImage.src = "Resources/Bg.jpg";
const playerImageIdle = new Image(); playerImageIdle.src = "Resources/Anger.png";
const playerImageJump = new Image(); playerImageJump.src = "Resources/AngerJumping.png";
const brickTexture = new Image(); brickTexture.src = "Resources/BrickTexture.jpg";
const mouthImage = new Image(); mouthImage.src = "Resources/Dee_Mouth.png";
const headImage = new Image(); headImage.src = "Resources/Dee_Head.png";
const ThesisImage = new Image(); ThesisImage.src = "Resources/ThesisImage.png";
const Level2Image = new Image(); Level2Image.src = "Resources/Level2Text.png";
const refreshImage = new Image(); refreshImage.src = "Resources/Refresh.png";
const LeftButtonImage = new Image(); LeftButtonImage.src = "Resources/leftbutton.png";
const RightButtonImage = new Image(); RightButtonImage.src = "Resources/rightbutton.png";
const JumpButtonImage = new Image(); JumpButtonImage.src = "Resources/jumpbutton.png";
const ButtonImage = new Image(); ButtonImage.src = "Resources/Button.png";
const DoorImage = new Image(); DoorImage.src = "Resources/DoorExit.png";
const DeadlineImage = new Image(); DeadlineImage.src = "Resources/Deadline.png";
const OfficeWorkImage = new Image(); OfficeWorkImage.src = "Resources/Homeworks.png";
const SchoolWorkImage = new Image(); SchoolWorkImage.src = "Resources/OfficeWorks.png";


// Sounds
const bgMusic = new Audio("resources/BgMusic.mp3");
bgMusic.loop = true;
bgMusic.volume = 0.25;
const clickSound = new Audio("resources/Click.mp3");
clickSound.volume = 1;

const hoverSound = new Audio("resources/Hover.mp3");
hoverSound.volume = 0.7;

const deathSound = new Audio("resources/Death.mp3");
deathSound.volume = 1;

const jumpSound = new Audio("resources/Jump.mp3");
jumpSound.volume = 0.4;

const groundRumbleSound = new Audio("resources/GroundRumble.mp3");
groundRumbleSound.volume = 0.9;

const groundHitSound = new Audio("resources/GroundHit.mp3");
groundHitSound.volume = 0.8;


window.addEventListener("touchmove", () => {
  timerStarted = true;
  ChaseStarted = true;
  startTime = Date.now();
  bgMusic.play().catch(err => console.log("Autoplay blocked:", err));
}, { once: true });


document.addEventListener("keydown", () => {
  timerStarted = true;
  ChaseStarted = true;
  startTime = Date.now();
  bgMusic.play().catch(err => console.log("Autoplay blocked:", err));
}, { once: true });

// 📱 Virtual Buttons
const MoveLeftButton = { x: 10, y: GAME_HEIGHT - 110, width: 100, height: 100 };
const MoveRightButton = { x: 120, y: GAME_HEIGHT - 110, width: 100, height: 100 };
const MoveJumpButton = { x: GAME_WIDTH - 110, y: GAME_HEIGHT - 110, width: 100, height: 100 };
const resetButton = {
  x: 735, // same position as in Level 1
  y: 10,
  width: 50,
  height: 50,
  hovered: false
};


// 🎮 Controls
const keys = { left: false, right: false, jump: false };

// 🎮 Keyboard start & movement
document.addEventListener("keydown", e => {
  if (e.key === "ArrowRight") keys.right = true;
  if (e.key === "ArrowLeft") keys.left = true;
  if (e.key === " " || e.key === "ArrowUp") keys.jump = true;

  // ✅ Start timer and chase again every time player moves after reset
  if (!ChaseStarted) {
    ChaseStarted = true;
  }
});

document.addEventListener("keyup", e => {
  if (e.key === "ArrowRight") keys.right = false;
  if (e.key === "ArrowLeft") keys.left = false;
  if (e.key === " ") keys.jump = false;
      if (e.key === "ArrowUp") keys.jump = false;

});

window.addEventListener("touchmove", () => {
  // ✅ Start timer and chase again when player moves again

  if (!ChaseStarted) {
    ChaseStarted = true;
  }
});

// 📱 Touch Controls
canvas.addEventListener("touchstart", handleTouch);
canvas.addEventListener("touchmove", handleTouch);
document.addEventListener("touchend", handleTouchEnd);
document.addEventListener("touchcancel", handleTouchEnd);

function handleTouch(e) {
  ChaseStarted = true;
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();

  keys.left = keys.right = keys.jump = false;
  const touches = e.touches;

  for (let t of touches) {
    const mx = (t.clientX - rect.left) / scale;
    const my = (t.clientY - rect.top) / scale;

    if (inside(mx, my, MoveLeftButton)) keys.left = true;
    if (inside(mx, my, MoveRightButton)) keys.right = true;
    if (inside(mx, my, MoveJumpButton)) keys.jump = true;
  }
}

function handleTouchEnd(e) {
  if (e.touches.length === 0) {
    keys.left = keys.right = keys.jump = false;
  } else {
    handleTouch(e);
  }
}

function inside(x, y, btn) {
  return x >= btn.x && x <= btn.x + btn.width && y >= btn.y && y <= btn.y + btn.height;
}

// ⚙️ Game Variables
let scale = 1;
let cameraX = 0;
let gravity = 0.2;

let levelComplete = false;
let levelCompleteTime = 0;


// 🕒 TIMER SETUP
let timerDisplay = document.getElementById("timerDisplay");
let timerStarted = false;
let ChaseStarted = false;

// Load previous time from Level 1 if it exists
// Load previous time from Level 1 if it exists
let previousTime = localStorage.getItem("previousLevelTime");

// Convert previous time (MM:SS) to seconds
let previousSeconds = 0;
if (previousTime) {
  const [mins, secs] = previousTime.split(":").map(Number);
  previousSeconds = mins * 60 + secs;
}

// Helper to format seconds -> MM:SS
function formatTime(totalSeconds) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}



let player = {
  x: 100,
  y: 215,
  width: 35,
  height: 35,
  dx: 0,
  dy: 0,
  speed: 3,
  jumping: false,
  canJump: true,
  gravity: 0.3,
  jumpForce: -6,
  currentImage: playerImageIdle
};

const button = {
  x: 660, // position on map
  y: 220,
  width: 30,
  height: 30,
  pressed: false,
  image: ButtonImage
};



// 🌀 Multiple Chasers (orbit around each other)
let chasers = [
  {
    image: DeadlineImage,
    offsetAngle: 0, // starting angle
    orbitRadius: 40,
    speed: 5
  },
  {
    image: SchoolWorkImage,
    offsetAngle: 120, // degrees offset
    orbitRadius: 40,
    speed: 5
  },
  {
    image: OfficeWorkImage,
    offsetAngle: 240, // degrees offset
    orbitRadius: 40,
    speed: 5
  }
];

// Shared chase center (they orbit around this point)
let chaseCenter = {
  x: -200,
  y: 300,
  speed: 2.15
};


// 🌉 Easy-to-edit platform layout
let platforms = [
  { name: "P1", x: 50, y: 250, width: 150, height: 300, visible: true, active: true, shake: 0, falling: false, fallSpeed: 0 , rumble: false, shakeTimer: 0},
  { name: "P2", x: 275, y: 225, width: 100, height: 300, visible: true, active: true, shake: 0, falling: false, fallSpeed: 0 , rumble: false, shakeTimer: 0},
  { name: "P3", x: 450, y: 275, width: 100, height: 300, visible: true, active: true, shake: 0, falling: false, fallSpeed: 0 , rumble: false, shakeTimer: 0},
  { name: "P4", x: 625, y: 250, width: 100, height: 300, visible: true, active: true, shake: 0, falling: false, fallSpeed: 0 , rumble: false, shakeTimer: 0},
  { name: "P5", x: 1500, y: 275, width: 100, height: 300, visible: true, active: true, shake: 0, falling: false, fallSpeed: 0 , rumble: true, shakeTimer: 0},
  { name: "P6", x: 1675, y: 275, width: 100, height: 300, visible: true, active: true, shake: 0, falling: false, fallSpeed: 0 , rumble: true, shakeTimer: 0},
  { name: "P7", x: 1850, y: 275, width: 100, height: 300, visible: true, active: true, shake: 0, falling: false, fallSpeed: 0 , rumble: true, shakeTimer: 0},
  { name: "P8", x: 2025, y: 250, width: 100, height: 300, visible: true, active: true, shake: 0, falling: false, fallSpeed: 0 , rumble: false, shakeTimer: 0},
  { name: "P9", x: 2200, y: 225, width: 100, height: 300, visible: true, active: true, shake: 0, falling: false, fallSpeed: 0 , rumble: false, shakeTimer: 0},
  { name: "P10", x: 2375, y: 270, width: 100, height: 300, visible: true, active: true, shake: 0, falling: false, fallSpeed: 0 , rumble: false, shakeTimer: 0},
  { name: "P11", x: 2550, y: 250, width: 100, height: 300, visible: true, active: true, shake: 0, falling: false, fallSpeed: 0 , rumble: false, shakeTimer: 0},
  { name: "P12", x: 2725, y: 225, width: 1000, height: 300, visible: true, active: true, shake: 0, falling: false, fallSpeed: 0 , rumble: false, shakeTimer: 0}
];

// Save original Y for reset
for (const p of platforms) {
  p.originalY = p.y;
}

// Predefined spawn platforms
const spawnPositions = [
  { x: 800, y: 250, width: 100, height: 300, visible: false, active: false, shake: 0, falling: false, fallSpeed: 0},
  { x: 975, y: 250, width: 100, height: 300, visible: false, active: false, shake: 0, falling: false, fallSpeed: 0},
  { x: 1150, y: 250, width: 100, height: 300, visible: false, active: false, shake: 0, falling: false, fallSpeed: 0},
  { x: 1325, y: 250, width: 100, height: 300, visible: false, active: false, shake: 0, falling: false, fallSpeed: 0}
];
let spawnedPlatforms = [];
let spawning = false;
let spawnTimeouts = []; // store active timeouts for cleanup

let Exit = { x: 3650, y: 145, width: 50, height: 80, active: true };

// --- Begin spawning sequence ---
function startPlatformSpawn() {
  if (spawning) return;
  spawning = true;

  const spawnDelay = 600; // delay between each platform (ms)
  spawnPositions.forEach((pos, i) => {
    const id = setTimeout(() => spawnPlatform(pos), i * spawnDelay);
    
    spawnTimeouts.push(id);
  });
}

// --- Create a new rising platform ---
function spawnPlatform(pos) {
  const startY = GAME_HEIGHT + 100;
  const platform = {
    x: pos.x,
    y: startY,
    width: pos.width,
    height: pos.height,
    targetY: pos.y,
    speed: 6,
    active: true,
    rising: true
  };
  spawnedPlatforms.push(platform);
}

// --- Animate platforms rising ---
function updateSpawnedPlatforms() {
  for (const p of spawnedPlatforms) {
    if (p.rising) {
      p.y -= p.speed;
      if (p.y <= p.targetY) {
        p.y = p.targetY;
        p.rising = false;
        groundHitSound.currentTime = 0;
    groundHitSound.play();
      }
    }
  }
}

// --- Reset button & platforms ---
function resetSpawnPlatforms() {
  button.pressed = false;
  spawning = false;

  // stop scheduled spawn animations
  spawnTimeouts.forEach(id => clearTimeout(id));
  spawnTimeouts = [];

  // remove spawned platforms
  spawnedPlatforms = [];
}



// Mouse hover detection for reset button
// --- Mouse click for reset button ---
// --- Mouse hover for reset button ---
canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  const mx = (e.clientX - rect.left);
  const my = (e.clientY - rect.top);

  const resetBaseX = GAME_WIDTH - resetButton.width - 10;
  const resetBaseY = 10;
  const scaledX = resetBaseX * scale;
  const scaledY = resetBaseY * scale;
  const scaledW = resetButton.width * scale;
  const scaledH = resetButton.height * scale;

  const s = 1.15;
  const newW = scaledW * s;
  const newH = scaledH * s;
  const offsetX = (newW - scaledW) / 2;
  const offsetY = (newH - scaledH) / 2;

  // Check if mouse is inside hover area
  if (
    mx >= scaledX - offsetX &&
    mx <= scaledX - offsetX + newW &&
    my >= scaledY - offsetY &&
    my <= scaledY - offsetY + newH
  ) {
    if (!resetButton.hovered) {
      hoverSound.currentTime = 0;
      hoverSound.play();
    }
    resetButton.hovered = true;
  } else {
    resetButton.hovered = false;
  }
});

canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const mx = (e.clientX - rect.left) / scale;
  const my = (e.clientY - rect.top) / scale;

  const scaleHover = resetButton.hovered ? 1.15 : 1;
  const newWidth = resetButton.width * scaleHover;
  const newHeight = resetButton.height * scaleHover;
  const offsetX = (newWidth - resetButton.width) / 2;
  const offsetY = (newHeight - resetButton.height) / 2;
  const bx = resetButton.x - offsetX;
  const by = resetButton.y - offsetY;

  if (
    mx >= bx &&
    mx <= bx + newWidth &&
    my >= by &&
    my <= by + newHeight
  ) {
    clickSound.currentTime = 0;
    clickSound.play();
    resetLevel(); // ✅ restart the level
  }
});


// --- Reset button & platforms ---
function spawnPlatform(pos) {
  const startY = GAME_HEIGHT + 100; // start offscreen
  const platform = {
    x: pos.x,
    y: startY,
    width: pos.width,
    height: pos.height,
    targetY: pos.y,
    speed: 6,
    active: true,
    rising: true,
    visible: true // ✅ this makes it renderable
  };
  spawnedPlatforms.push(platform);
}





// 🪜 Resize & scaling
function resizeCanvas() {
  const windowRatio = window.innerWidth / window.innerHeight;
  const gameRatio = GAME_WIDTH / GAME_HEIGHT;
  if (windowRatio > gameRatio) {
    canvas.height = window.innerHeight;
    canvas.width = window.innerHeight * gameRatio;
  } else {
    canvas.width = window.innerWidth;
    canvas.height = window.innerWidth / gameRatio;
  }
  scale = canvas.width / GAME_WIDTH;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// 🧱 Collision helper
function isColliding(a, b) {
  return a.x < b.x + b.width &&
         a.x + a.width > b.x &&
         a.y < b.y + b.height &&
         a.y + a.height > b.y;
}

// 🧩 Reset
function resetLevel() {
  // Reset player position & movement
  player.x = 100;
  player.y = 215;
  player.dx = 0;
  player.dy = 0;

  // Reset chase state
  ChaseStarted = false;
  cameraX = 0;

  // Reset orbit center (the middle point they follow)
  chaseCenter.x = -200;
  chaseCenter.y = 300;

  // Reset chasers’ angles and positions
  for (let c of chasers) {
    c.offsetAngle = c.offsetAngle; // keep original spacing (0, 120, 240)
    c.orbitRadius = 40; // or your chosen orbit distance
    c.x = chaseCenter.x;
    c.y = chaseCenter.y;
  }

  // Reset any spawned platforms or environment
  resetSpawnPlatforms();

  // Reset all static platforms
  for (const p of platforms) {
    p.active = true;
    p.visible = true;
    p.falling = false;
    p.shake = 0;
    p.fallSpeed = 0;
    p.shakeOffsetX = 0;
    p.shakeOffsetY = 0;
    p.shakeTimer = 0;

    // ✅ Restore Y to original position if stored
    if (p.originalY !== undefined) {
      p.y = p.originalY;
    }
  }
}


function showWinMessage(levelCompleteTime) {

  const blurOverlay = document.getElementById("blurOverlay");
  const winMessage = document.getElementById("winMessage");
  const winTime = document.getElementById("winTime");

  blurOverlay.style.display = "flex"; // show blur + text
  winMessage.textContent = "Congratulations! You controlled your emotions well and managed to bounce back even when facing challenges.";
  winTime.textContent = `Your Time: ${levelCompleteTime}`;
}




// 🎬 Main update
function update() {
  

updateSpawnedPlatforms();

if (timerStarted) {
  const currentSeconds = Math.floor((Date.now() - startTime) / 1000);
  const totalElapsedSeconds = previousSeconds + currentSeconds;
  timerDisplay.textContent = formatTime(totalElapsedSeconds);
}


 // --- Player movement & jump logic ---
  player.dx = 0;
  if (keys.left) player.dx = -player.speed;
  if (keys.right) player.dx = player.speed;

  const now = performance.now();
  const grounded = player.dy === 0;

  if (keys.jump && grounded && player.canJump) {
    jumpSound.currentTime = 0;
    jumpSound.play();
    player.dy = -4;
    player.jumping = true;
    player.currentImage = playerImageJump;

    player.canJump = false;
    player.lastJumpTime = now;
  }

  if (!player.canJump && now - player.lastJumpTime >= player.jumpCooldownMs) {
    player.canJump = true;
  }

  player.dy += gravity;
  player.x += player.dx;
  player.y += player.dy;
  // --- Boundaries ---
if (player.x < 0) player.x = 0;
  // 🕒 Timer update

// --- Exit collision: go to next level page ---
if (Exit.active && isColliding(player, Exit)) {
  
  // Stop the timer
  timerStarted = false;

  // Store the current timer text (MM:SS)
  const levelCompleteTime = timerDisplay.textContent;

  // Show win message
  showWinMessage(levelCompleteTime);
}

// --- Platform collisions ---
let onGround = false;
for (const p of [...platforms, ...spawnedPlatforms]) {
  if (!p.active) continue;

  if (isColliding(player, p)) {
    const playerBottom = player.y + player.height;
    const playerPrevBottom = player.y + player.height - player.dy;
    const platformTop = p.y;
    const platformBottom = p.y + p.height;
    const playerTop = player.y;

    // --- Landing on top ---
    if (
      playerPrevBottom <= platformTop &&
      playerBottom > platformTop &&
      player.dy >= 0
    ) {
      player.y = platformTop - player.height;
      player.dy = 0;
      player.jumping = false;
      player.canJump = true;
      player.currentImage = playerImageIdle;
      onGround = true;

      // 🧱 Trigger rumble/fall platforms (with 0.5s delay)
if (p.rumble && !p.falling && p.shake === 0 && !p.pendingRumble) {
  p.pendingRumble = true; // prevent retriggering multiple times

  setTimeout(() => {
    if (p.visible && !p.falling) { // make sure it's still active
      p.shake = 1;
      p.fallSpeed = 0;
      groundRumbleSound.currentTime = 0;
    groundRumbleSound.play();
      console.log("rumble start");
    }
    p.pendingRumble = false; // clear pending state
  }, 200); // 0.5 second delay
}

    }

    // --- Hitting head underneath the platform ---
    else if (
      playerTop < platformBottom &&
      playerTop > platformTop &&
      player.dy < 0
    ) {
      player.y = platformBottom;
      player.dy = 0;
    }

    // --- Side collisions ---
    else {
      const overlapX = Math.min(
        player.x + player.width - p.x,
        p.x + p.width - player.x
      );
      const overlapY = Math.min(
        playerBottom - p.y,
        p.y + p.height - player.y
      );

      if (overlapX < overlapY) {
        if (player.x + player.width / 2 < p.x + p.width / 2) {
          player.x = p.x - player.width;
        } else {
          player.x = p.x + p.width;
        }
        player.dx = 0;
      }
    }
  }
}




// --- Button trigger ---
if (
  player.x + player.width > button.x &&
  player.x < button.x + button.width &&
  player.y + player.height > button.y &&
  player.y < button.y + button.height
) {
  if (!button.pressed) {
    clickSound.currentTime = 0;
    clickSound.play();
    button.pressed = true;
  startPlatformSpawn();
  
  }
}






  // Prevent falling below floor
  if (player.y > GAME_HEIGHT) {
    deathSound.play();
    resetLevel();
  }

  // Camera follows player
  cameraX = player.x - GAME_WIDTH / 3;

// --- Multiple chasers orbiting while chasing ---
if (ChaseStarted) {
  // Move the chase center toward the player
  const dx = player.x - chaseCenter.x;
  const dy = player.y - chaseCenter.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist > 0) {
    const dirX = dx / dist;
    const dirY = dy / dist;
    chaseCenter.x += dirX * chaseCenter.speed;
    chaseCenter.y += dirY * (chaseCenter.speed * 0.7);
  }

  // Orbiting effect
  const time = performance.now() / 500; // controls spin speed
  for (let c of chasers) {
    const angle = (time + (c.offsetAngle * Math.PI / 180));
    c.x = chaseCenter.x + Math.cos(angle) * c.orbitRadius;
    c.y = chaseCenter.y + Math.sin(angle) * c.orbitRadius;

    // Collision check
    if (isColliding(player, { x: c.x, y: c.y, width: 80, height: 80 })) {
      deathSound.play();
      resetLevel();
    }
  }
}



  draw();
  requestAnimationFrame(update);
}

// 🎨 Drawing
function draw() {
  

  ctx.save();
  ctx.globalAlpha = 0.3; // make it slightly transparent

  // Player hitbox
  ctx.fillStyle = "yellow";
  ctx.fillRect(player.x, player.y, player.width, player.height);

  // Static platforms
  ctx.fillStyle = "lime";
  for (const p of platforms) {
    if (p.active) ctx.fillRect(p.x, p.y, p.width, p.height);
  }

  // Spawned platforms
  ctx.fillStyle = "cyan";
  for (const sp of spawnedPlatforms) {
    if (sp.active) ctx.fillRect(sp.x, sp.y, sp.width, sp.height);
  }

  ctx.restore();



  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.scale(scale, scale);
  ctx.translate(-cameraX, 0);

  ctx.drawImage(bgImage, cameraX, 0, GAME_WIDTH, GAME_HEIGHT);

// update platforms (shake + slow fall)
  for (let p of platforms) {
    if (p.shake > 0 || p.falling) {
      p.shakeTimer = (p.shakeTimer || 0) + 1;
      const shakeMagnitude = 3;
      p.shakeOffsetX = Math.sin(p.shakeTimer * 0.6) * shakeMagnitude;
      p.shakeOffsetY = Math.cos(p.shakeTimer * 0.6) * shakeMagnitude;

      p.falling = true;
      p.fallSpeed = (p.fallSpeed || 0) + 0.08;
      p.y += p.fallSpeed;

      if (p.y > GAME_HEIGHT + 50) {
        p.visible = false;
        p.shake = 0;
        p.falling = false;
      }
    }
  }

  // draw visible platforms (tiled)
  for (let p of platforms) {
    if (!p.visible) continue;
    const offsetX = p.shakeOffsetX || 0;
    const offsetY = p.shakeOffsetY || 0;
    const pattern = ctx.createPattern(brickTexture, "repeat");
    ctx.save();
    const brickScale = 0.4;
    ctx.scale(brickScale, brickScale);
    ctx.fillStyle = pattern;
    ctx.translate((p.x + offsetX) / brickScale, (p.y + offsetY) / brickScale);
    ctx.fillRect(0, 0, p.width / brickScale, p.height / brickScale);
    ctx.restore();
  }

  // draw visible spawned platforms (tiled)
  for (let p of spawnedPlatforms) {
    if (!p.visible) continue;
    const offsetX = p.shakeOffsetX || 0;
    const offsetY = p.shakeOffsetY || 0;
    const pattern = ctx.createPattern(brickTexture, "repeat");
    ctx.save();
    const brickScale = 0.4;
    ctx.scale(brickScale, brickScale);
    ctx.fillStyle = pattern;
    ctx.translate((p.x + offsetX) / brickScale, (p.y + offsetY) / brickScale);
    ctx.fillRect(0, 0, p.width / brickScale, p.height / brickScale);
    ctx.restore();
  }

  
// update platforms (shake + slow fall)
  for (let p of spawnedPlatforms) {
    if (p.shake > 0 || p.falling) {
      p.shakeTimer = (p.shakeTimer || 0) + 1;
      const shakeMagnitude = 3;
      p.shakeOffsetX = Math.sin(p.shakeTimer * 0.6) * shakeMagnitude;
      p.shakeOffsetY = Math.cos(p.shakeTimer * 0.6) * shakeMagnitude;

      p.falling = true;
      p.fallSpeed = (p.fallSpeed || 0) + 0.08;
      p.y += p.fallSpeed;

      if (p.y > GAME_HEIGHT + 50) {
        p.visible = false;
        p.shake = 0;
        p.falling = false;
      }
    }
  }

    ctx.drawImage(DoorImage, 3650, 145, 50, 80);


    ctx.drawImage(button.image, button.x, button.y , button.width, button.height );


// Draw orbiting chasers
for (let c of chasers) {
  ctx.drawImage(c.image, c.x, c.y, 80, 80);
}

  // Player
  ctx.drawImage(player.currentImage, player.x, player.y, player.width, player.height);

  ctx.restore();
  ctx.drawImage(Level2Image, 5, 5, 250, 125);


 // 🧭 UI (fixed to screen)
// draw reset button (upper-right corner with hover scale)
const resetBaseX = GAME_WIDTH - resetButton.width - 10; // 10px padding from right edge
const resetBaseY = 10; // 10px from top
const scaledX = resetBaseX * scale;
const scaledY = resetBaseY * scale;
const scaledW = resetButton.width * scale;
const scaledH = resetButton.height * scale;

if (resetButton.hovered) {
  const s = 1.15;
  const newW = scaledW * s;
  const newH = scaledH * s;
  const offsetX = (newW - scaledW) / 2;
  const offsetY = (newH - scaledH) / 2;
  ctx.drawImage(
    refreshImage,
    scaledX - offsetX,
    scaledY - offsetY,
    newW,
    newH
  );
} else {
  ctx.drawImage(refreshImage, scaledX, scaledY, scaledW, scaledH);
}


    ctx.drawImage(LeftButtonImage, MoveLeftButton.x * scale, MoveLeftButton.y * scale, MoveLeftButton.width * scale, MoveLeftButton.height * scale);
  ctx.drawImage(RightButtonImage, MoveRightButton.x * scale, MoveRightButton.y * scale, MoveRightButton.width * scale, MoveRightButton.height * scale);
  ctx.drawImage(JumpButtonImage, MoveJumpButton.x * scale, MoveJumpButton.y * scale, MoveJumpButton.width * scale, MoveJumpButton.height * scale);
}

brickTexture.onload = () => update();
