const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Virtual resolution
const GAME_WIDTH = 800;
const GAME_HEIGHT = 500;

// Load images
const bgImage = new Image(); bgImage.src = "Resources/Bg.jpg";
const playerImageIdle = new Image(); playerImageIdle.src = "Resources/Anger.png";
const playerImageJump = new Image(); playerImageJump.src = "Resources/AngerJumping.png";
const brickTexture = new Image(); brickTexture.src = "Resources/BrickTexture.jpg";
const mouthImage = new Image(); mouthImage.src = "Resources/Dee_Mouth.png";
const headImage = new Image(); headImage.src = "Resources/Dee_Head.png";
const ThesisImage = new Image(); ThesisImage.src = "Resources/ThesisImage.png";
const Level = new Image(); Level.src = "Resources/Level1Text.png";
const refreshImage = new Image(); refreshImage.src = "Resources/Refresh.png";
const LeftButtonImage = new Image(); LeftButtonImage.src = "Resources/leftbutton.png";
const RightButtonImage = new Image(); RightButtonImage.src = "Resources/rightbutton.png";
const JumpButtonImage = new Image(); JumpButtonImage.src = "Resources/jumpbutton.png";
const ButtonImage = new Image(); ButtonImage.src = "Resources/Button.png";
const DoorImage = new Image(); DoorImage.src = "Resources/DoorExit.png";



// Load sounds
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

const eatSound = new Audio("resources/Eat.mp3");
eatSound.volume = 1;



// Background music 🎵
const bgMusic = new Audio("resources/BgMusic.mp3");
bgMusic.volume = 0.25; // lower volume
bgMusic.loop = true;

// Start music after user interaction (to bypass autoplay restriction)
window.addEventListener("touchmove", () => {
  timerStarted = true;
  startTime = Date.now();
  bgMusic.play().catch(err => console.log("Autoplay blocked:", err));
}, { once: true });


document.addEventListener("keydown", () => {
  timerStarted = true;
  startTime = Date.now();
  bgMusic.play().catch(err => console.log("Autoplay blocked:", err));
}, { once: true });


// 🆕 Reset button setup
const resetButton = {
  x: GAME_WIDTH - 60,
  y: 10,
  width: 50,
  height: 50,
  hovered: false // track hover state
};

// 🆕 Move Buttons
const MoveLeftButton = {
  x: GAME_WIDTH - 790,
  y: GAME_HEIGHT - 110,
  width: 100,
  height: 100,
  hovered: false // track hover state
};
const MoveRightButton = {
  x: GAME_WIDTH - 685,
  y: GAME_HEIGHT - 110,
  width: 100,
  height: 100,
  hovered: false // track hover state
};
const MoveJumpButton = {
  x: GAME_WIDTH - 110,
  y: GAME_HEIGHT - 110,
  width: 100,
  height: 100,
  hovered: false // track hover state
};

// Mouse hover detection for reset button
canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  const mx = (e.clientX - rect.left) / scale;
  const my = (e.clientY - rect.top) / scale;

  const scaleHover = 1.15;
  const newWidth = resetButton.width * scaleHover;
  const newHeight = resetButton.height * scaleHover;
  const offsetX = (newWidth - resetButton.width) / 2;
  const offsetY = (newHeight - resetButton.height) / 2;
  const bx = resetButton.x - offsetX;
  const by = resetButton.y - offsetY;

  // check previous state so we only play sound on hover start
  const wasHovered = resetButton.hovered;

  resetButton.hovered =
    mx >= bx &&
    mx <= bx + newWidth &&
    my >= by &&
    my <= by + newHeight;

  if (resetButton.hovered && !wasHovered) {
    hoverSound.currentTime = 0;
    hoverSound.play();
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

// Mouse click for move buttons
canvas.addEventListener("touchstart", handleTouch);
canvas.addEventListener("touchmove", handleTouch);
document.addEventListener("touchend", handleTouchEnd);
document.addEventListener("touchcancel", handleTouchEnd);

function handleTouch(e) {
  e.preventDefault();

  const rect = canvas.getBoundingClientRect();

  // Reset first
  keys.right = false;
  keys.left = false;
  keys.jump = false;

  // Go through all current touches
  const touches = e.touches.length ? e.touches : e.changedTouches;

  for (let i = 0; i < touches.length; i++) {
    const touch = touches[i];
    const mx = (touch.clientX - rect.left) / scale;
    const my = (touch.clientY - rect.top) / scale;

    if (
      mx >= MoveRightButton.x &&
      mx <= MoveRightButton.x + MoveRightButton.width &&
      my >= MoveRightButton.y &&
      my <= MoveRightButton.y + MoveRightButton.height
    ) {
      keys.right = true;
    }

    if (
      mx >= MoveLeftButton.x &&
      mx <= MoveLeftButton.x + MoveLeftButton.width &&
      my >= MoveLeftButton.y &&
      my <= MoveLeftButton.y + MoveLeftButton.height
    ) {
      keys.left = true;
    }

    if (
      mx >= MoveJumpButton.x &&
      mx <= MoveJumpButton.x + MoveJumpButton.width &&
      my >= MoveJumpButton.y &&
      my <= MoveJumpButton.y + MoveJumpButton.height
    ) {
      keys.jump = true;
    }
  }
}

function handleTouchEnd(e) {
  e.preventDefault();

  // If no touches left, stop everything
  if (e.touches.length === 0) {
    keys.right = false;
    keys.left = false;
    keys.jump = false;
    return;
  }

  // Otherwise, re-check which buttons are still pressed
  handleTouch(e);
}



let doorVisible = false;
let buttons = []; // array of spawned button objects (on platforms)
let temporaryObjects = []; // temporary debug objects (death zone etc.)

// Player setup
let player = {
  x: 10,
  y: 120,
  width: 30,
  height: 30,
  dx: 0,
  dy: 0,
  speed: 2,
  jumping: false,
  currentImage: playerImageIdle,
  // jump cooldown
  canJump: true,
  lastJumpTime: 0,
  jumpCooldownMs: 300 // ms
};

let gravity = 0.2;

// Platforms initial state
const initialPlatforms = [
  { name: "Ground", x: 0, y: 250, width: 100, height: 300, visible: true, active: true, shake: 0, falling: false, fallSpeed: 0 },
  { name: "Platform1", x: 175, y: 250, width: 50, height: 300, visible: true, active: true, shake: 0, falling: false, fallSpeed: 0 },
  { name: "Platform2", x: 280, y: 250, width: 50, height: 300, visible: true, active: true, shake: 0, falling: false, fallSpeed: 0 },
  { name: "Platform3", x: 445, y: 250, width: 50, height: 300, visible: true, active: true, shake: 0, falling: false, fallSpeed: 0 },
  { name: "Platform4", x: 280, y: 285, width: 215, height: 250, visible: true, active: true, shake: 0, falling: false, fallSpeed: 0 },
  { name: "Platform5", x: 540, y: 250, width: 50, height: 300, visible: true, active: true, shake: 0, falling: false, fallSpeed: 0 },
  { name: "Platform6", x: 660, y: 250, width: 150, height: 25, visible: true, active: false, shake: 0, falling: false, fallSpeed: 0 },
  { name: "Platform7", x: 680, y: 360, width: 150, height: 300, visible: true, active: true, shake: 0, falling: false, fallSpeed: 0 },
  { name: "Platform9", x: 660, y: 250, width: 150, height: 300, visible: true, active: true, shake: 0, falling: false, fallSpeed: 0 }
];

// Working platforms array (cloned on reset)
let platforms = JSON.parse(JSON.stringify(initialPlatforms));

// Triggers & Exit
let triggerBox = { x: 120, y: 150, width: 75, height: 75, active: true };
let triggerBox2 = { x: 100, y: 330, width: 25, height: 20, active: false };
let triggerBox3 = { x: 345, y: 240, width: 85, height: 75, active: true };
let triggerBox4 = { x: 620, y: 180, width: 75, height: 75, active: true };
let Exit = { x: 725, y: 280, width: 50, height: 80, active: true };
let DeathBox = { x: 0, y: GAME_HEIGHT - 25, width: GAME_WIDTH, height: 25, active: true };


let timerDisplay = document.getElementById("timerDisplay");
let timerStarted = false;
let startTime = 0;
let elapsedTime = 0;

// Face object (unchanged behavior)
let face = {
  x: 120,
  y: GAME_HEIGHT,
  width: 200,
  height: 200,
  rising: false,
  stopY: GAME_HEIGHT - 150,
  riseSpeed: 4.5,
  fallSpeed: 2,
  rotation: 0,
  targetRotation: -85 * Math.PI / 180,
  rotationSpeed: 0.035,
  startedAt: null,
  delayBeforeOpen: 0,
  movingDown: false,
  targetY: null
};

// Thesis object (unchanged)
let thesis = {
  x: 345,
  y: -90,
  width: 90,
  height: 90,
  active: false,
  peeking: false,
  dropping: false,
  peekY: 1,
  dropSpeed: 0.25,
  targetY: 340
};

// Canvas scaling
let scale = 1;
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

// Movement controls
const keys = { left: false, right: false, jump: false };
document.addEventListener("keydown", e => {
  if (e.key === "ArrowRight") keys.right = true;
  if (e.key === "ArrowLeft") keys.left = true;
  if (e.key === " ") keys.jump = true;
  if (e.key === "ArrowUp") keys.jump = true;
});

document.addEventListener("keyup", e => {
  if (e.key === "ArrowRight") keys.right = false;
  if (e.key === "ArrowLeft") keys.left = false;
  if (e.key === " ") keys.jump = false;
        if (e.key === "ArrowUp") keys.jump = false;

});




// Collision helper
function isColliding(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function resetLevel() {
  // Reset player motion
  player.dx = 0;
  player.dy = 0;

  // Reset platforms to original (removes spawned ones)
  platforms = JSON.parse(JSON.stringify(initialPlatforms));

  // 🧼 Reset buttons (remove spawned ones)
  buttons = [];

  // Reset triggers, face, and exit state
  triggerBox.active = true;
  triggerBox2.active = false;
  triggerBox3.active = true;
  triggerBox4.active = true;
  Exit.active = true;
  DeathBox.active = true;
  doorVisible = false;

  face.rising = false;
  face.movingDown = false;
  face.rotation = 0;
  face.y = GAME_HEIGHT;
  face.startedAt = null;

  // Reset thesis
  thesis.active = false;
  thesis.y = -90;
  thesis.peeking = false;
  thesis.dropping = false;
  thesis.dropSpeed = 0.25;

  // Reset temporary objects
  temporaryObjects = [];

  // Teleport player back to spawn
  player.x = 10;
  player.y = 120;

  // Reset jump state
  player.canJump = true;
  player.jumping = false;

  console.log("Level reset!");
}



// Main update loop
function update() {
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
  
  // 🕒 Timer update
if (timerStarted) {
  elapsedTime = Math.floor((Date.now() - startTime) / 1000);
  let minutes = Math.floor(elapsedTime / 60);
  let seconds = elapsedTime % 60;
  timerDisplay.textContent = 
    `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

  // --- Trigger 1 ---
  if (triggerBox.active && isColliding(player, triggerBox)) {
    groundRumbleSound.currentTime = 0;
    groundRumbleSound.play();
    console.log("Trigger hit!");

    const platform1 = platforms.find(p => p.name === "Platform1");
    if (platform1) {
      platform1.active = false;
      platform1.shake = 1;
      platform1.falling = false;
      platform1.fallSpeed = 0;
      platform1.shakeTimer = 0;
    }

    // Spawn new platform
    const newPlatform = {
      name: "SpawnedPlatform",
      x: 100,
      y: 350,
      width: 25,
      height: 20,
      visible: true,
      active: true,
      shake: 0,
      falling: false,
      fallSpeed: 0
    };
    platforms.push(newPlatform);

    // Invisible platform for logic/collision
    const InvisiblePlatform = {
      name: "InvisiblePlatform",
      x: 77,
      y: 100,
      width: 25,
      height: 200,
      visible: false,
      debugColor: "rgba(0,255,0,0.4)",
      active: true,
      shake: 0,
      falling: false,
      fallSpeed: 0
    };
    platforms.push(InvisiblePlatform);

    // Spawn a button object on top of the new platform
    const button = {
      name: "PlatformButton",
      x: newPlatform.x + (newPlatform.width / 2) - 10, // center above
      y: newPlatform.y - 20, // slightly above platform
      width: 20,
      height: 20,
      active: true,
      pressed: false,
      image: new Image()
    };
    button.image.src = "Resources/Button.png";
    buttons.push(button);

    // enable second trigger and start face rising
    triggerBox2.active = true;
    if (!face.rising && !face.movingDown) {
      face.rising = true;
      face.rotation = 0;
      face.y = GAME_HEIGHT;
      face.startedAt = performance.now();
    }

    triggerBox.active = false;
  }

  // --- Trigger 2 ---
  if (triggerBox2.active && isColliding(player, triggerBox2)) {
    clickSound.currentTime = 0;
    clickSound.play();
    console.log("Second trigger hit!");

    const newPlatform2 = { name: "SpawnedPlatform2", x: 155, y: 325, width: 20, height: 20, visible: true, active: true, shake: 0, falling: false, fallSpeed: 0 };
    const newPlatform3 = { name: "SpawnedPlatform3", x: 205, y: 300, width: 20, height: 20, visible: true, active: true, shake: 0, falling: false, fallSpeed: 0 };
    const newPlatform4 = { name: "SpawnedPlatform4", x: 255, y: 275, width: 25, height: 20, visible: true, active: true, shake: 0, falling: false, fallSpeed: 0 };
    platforms.push(newPlatform2, newPlatform3, newPlatform4);

    // Remove spawned button if it exists
    const index = buttons.findIndex(btn => btn.name === "PlatformButton");
    if (index !== -1) {
      buttons.splice(index, 1);
      console.log("🗑️ PlatformButton removed after triggerBox2 collision");
    }

    // delay before moving face down
    setTimeout(() => {
      if (!face.movingDown) {
        face.movingDown = true;
        face.rising = false;
        face.targetY = GAME_HEIGHT + 300;
        face.fallSpeed = 2;
      }
    }, 200);

    triggerBox2.active = false;
  }

  // --- Trigger 3 (Thesis) ---
  if (triggerBox3.active && isColliding(player, triggerBox3)) {
    console.log("📚 Thesis trigger hit!");
    thesis.x = triggerBox3.x + triggerBox3.width / 2 - thesis.width / 2;
    thesis.y = -thesis.height;
    thesis.targetY = triggerBox3.y - 45;
    thesis.active = true;
    thesis.peeking = true;
    thesis.dropping = false;
    triggerBox3.active = false;
  }

  // --- Trigger 4 (Door spawn + platforms) ---
  if (triggerBox4.active && isColliding(player, triggerBox4)) {
    doorVisible = true;
    groundHitSound.currentTime = 0;
    groundHitSound.play();

    const newPlatform5 = { name: "SpawnedPlatform5", x: 660, y: 0, width: 25, height: 275, visible: true, active: true, shake: 0, falling: false, fallSpeed: 0 };
    const newPlatform6 = { name: "SpawnedPlatform6", x: 590, y: 360, width: 25, height: 20, visible: true, active: true, shake: 0, falling: false, fallSpeed: 0 };
    platforms.push(newPlatform5, newPlatform6);

    const platform9 = platforms.find(p => p.name === "Platform9");
    if (platform9) {
      platform9.active = false;
      platform9.visible = false;
    }

    triggerBox4.active = false;
  }

  // --- Exit collision: go to next level page ---
if (Exit.active && isColliding(player, Exit)) {
  // Stop the timer

  timerStarted = false;

  // Save current timer (MM:SS) to localStorage
  localStorage.setItem("previousLevelTime", timerDisplay.textContent);

  // Then go to next level
  window.location.href = "Level2.html";
}


  // --- DeathBox trigger (reset with delay) ---
  if (DeathBox.active && isColliding(player, DeathBox)) {
    deathSound.currentTime = 0;
    deathSound.play();
    console.log("💀 Deathbox hit! Resetting level...");
    DeathBox.active = false;
    setTimeout(() => {
      resetLevel();
      DeathBox.active = true;
    }, 700);
  }

  // --- Boundaries ---
  if (player.x < 0) player.x = 0;
  if (player.x + player.width > GAME_WIDTH) player.x = GAME_WIDTH - player.width;

  // --- Platform collisions ---
  for (const p of platforms) {
    if (!p.active) continue;

    if (isColliding(player, p)) {
      const playerBottom = player.y + player.height;
      const playerPrevBottom = player.y + player.height - player.dy;
      const platformTop = p.y;

      // landing on top
      if (playerPrevBottom <= platformTop && player.dy >= 0) {
        player.y = platformTop - player.height;
        player.dy = 0;
        player.jumping = false;
        player.currentImage = playerImageIdle;
      } else {
        // side collisions
        const playerCenterX = player.x + player.width / 2;
        const platformCenterX = p.x + p.width / 2;

        if (playerCenterX < platformCenterX) {
          player.x = p.x - player.width;
        } else {
          player.x = p.x + p.width;
        }
        player.dx = 0;
      }
    }
  }

  // --- Thesis animation logic ---
  if (thesis.active) {
    if (thesis.peeking) {
      thesis.y += 5.5;
      if (thesis.y >= thesis.peekY) {
        thesis.y = thesis.peekY;
        thesis.peeking = false;

        groundHitSound.currentTime = 0;
        groundHitSound.play();

        // wait then drop
        setTimeout(() => {
          thesis.dropping = true;
          thesis.dropSpeed = 0;
        }, 150);
      }
    }

    if (thesis.dropping) {
      thesis.dropSpeed += 1.5;
      thesis.y += thesis.dropSpeed;

      if (thesis.y >= thesis.targetY) {
        thesis.y = thesis.targetY;
        thesis.dropping = false;
        console.log("💥 Thesis landed on triggerBox3!");

        // Temporary death box (invisible by default here)
        const tempDeath = {
          x: thesis.x,
          y: thesis.y + thesis.height - 65,
          width: thesis.width + 15,
          height: 70,
          active: true,
          visible: false,
          debugColor: "rgba(255,0,0,0.4)"
        };

        DeathBox.active = false; // disable main one briefly

        // After short duration, spawn invisible platform (invisible by default)
        setTimeout(() => {
          tempDeath.active = false;
          tempDeath.visible = false;
          DeathBox.active = true;

          const thesisPlatform = {
            name: "ThesisPlatform",
            x: 345,
            y: 220,
            width: 85,
            height: 25,
            visible: false,
            debugColor: "rgba(0,255,0,0.4)",
            active: true,
            shake: 0,
            falling: false,
            fallSpeed: 0
          };
          platforms.push(thesisPlatform);
        }, 100);

        // track & render the temp death object if needed
        temporaryObjects.push(tempDeath);

        // collision checking for temp death (with a small delay before reset)
        const deathCheck = setInterval(() => {
          if (tempDeath.active && isColliding(player, tempDeath)) {
            clearInterval(deathCheck);
            deathSound.currentTime = 0;
            deathSound.play();
            console.log("💀 Player hit temporary death zone!");

            // wait a tiny bit so platform spawn can happen
            setTimeout(() => {
              resetLevel();
            }, 101);
          }
        }, 16);
      }
    }
  }

  // --- Face rising/down behavior ---
  if (face.rising) {
    if (face.y > face.stopY) {
      face.y -= face.riseSpeed;
      if (face.y < face.stopY) face.y = face.stopY;
    }
    const elapsed = performance.now() - (face.startedAt || 0);
    if (elapsed > face.delayBeforeOpen) {
      if (face.rotation > face.targetRotation) {
        eatSound.currentTime = 0;
        eatSound.play();
        face.rotation -= face.rotationSpeed;
        if (face.rotation < face.targetRotation) face.rotation = face.targetRotation;
      }
    }
  }

  if (face.movingDown) {
    if (face.y < face.targetY) {
      face.y += (face.fallSpeed || 2);
      if (face.rotation < 0) {
        eatSound.currentTime = 0;
        eatSound.play();
        face.rotation += 0.02;
        if (face.rotation > 0) face.rotation = 0;
      }
    } else {
      face.movingDown = false;
    }
  }

  // --- DRAW ---
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.scale(scale, scale);

  // background
  ctx.drawImage(bgImage, 0, 0, GAME_WIDTH, GAME_HEIGHT);

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

  // draw temporary debug objects (only if visible)
  for (const obj of temporaryObjects) {
    if (obj.visible) {
      ctx.fillStyle = obj.debugColor || "rgba(255,255,255,0.3)";
      ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
    }
  }

  // draw buttons spawned on platforms
  for (const b of buttons) {
    if (b.active) {
      ctx.drawImage(b.image, b.x, b.y, b.width, b.height);
    }
  }

  // always draw door background and optionally visible door
  ctx.drawImage(DoorImage, 725, 170, 50, 80);
  if (doorVisible) {
    ctx.drawImage(DoorImage, 725, 280, 50, 80);
  }

  // draw thesis
  if (thesis.active) {
    ctx.drawImage(ThesisImage, thesis.x, thesis.y, thesis.width, thesis.height);
  }

  // level text
  ctx.drawImage(Level, 5, 5, 175, 75);

  // player
  ctx.drawImage(player.currentImage, player.x, player.y, player.width, player.height);

  // face (draw last)
  if (face.rising || face.movingDown || face.y < GAME_HEIGHT) {
    ctx.save();
    const pivotX = face.x + face.width / 2;
    const pivotY = face.y + face.height / 1.9;
    ctx.translate(pivotX, pivotY);
    ctx.rotate((-40 * Math.PI) / 180);

    const mouthYOffset = 5;
    ctx.drawImage(mouthImage, -face.width / 2, mouthYOffset, face.width, face.height / 2);

    ctx.save();
    ctx.rotate(face.rotation);
    const openRatio = Math.abs(face.rotation / face.targetRotation);
    const baseYOffset = -face.height / 2 + 5;
    const baseXOffset = -face.width / 2 + 2;
    const dynamicYOffset = baseYOffset - 30 * openRatio;
    const dynamicXOffset = baseXOffset + 8 * openRatio;
    ctx.drawImage(headImage, dynamicXOffset, dynamicYOffset, face.width, face.height / 2);
    ctx.restore();

    ctx.restore();
  }

  // draw reset button (with hover scale)
  if (resetButton.hovered) {
    const s = 1.15;
    const newWidth = resetButton.width * s;
    const newHeight = resetButton.height * s;
    const offsetX = (newWidth - resetButton.width) / 2;
    const offsetY = (newHeight - resetButton.height) / 2;
    ctx.drawImage(
      refreshImage,
      resetButton.x - offsetX,
      resetButton.y - offsetY,
      newWidth,
      newHeight
    );
  } else {
    ctx.drawImage(refreshImage, resetButton.x, resetButton.y, resetButton.width, resetButton.height);
  }


  ctx.drawImage(LeftButtonImage, MoveLeftButton.x, MoveLeftButton.y, MoveLeftButton.width, MoveLeftButton.height);
  ctx.drawImage(JumpButtonImage, MoveJumpButton.x, MoveJumpButton.y, MoveJumpButton.width, MoveJumpButton.height);
  ctx.drawImage(RightButtonImage, MoveRightButton.x, MoveRightButton.y, MoveRightButton.width, MoveRightButton.height);


  ctx.restore();
  requestAnimationFrame(update);
}

// Start the game loop when brick texture is ready
brickTexture.onload = () => update();
