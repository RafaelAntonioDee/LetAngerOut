const bgMusic = document.getElementById("bgMusic");
const clickSound = new Audio("resources/Click.mp3");
clickSound.volume = 1;

const hoverSound = new Audio("resources/Hover.mp3");
hoverSound.volume = 0.7;

const playButton = document.getElementById("playButton");
const creditsButton = document.getElementById("creditsButton");
const continueText = document.getElementById("continueText");

bgMusic.volume = 0.5;
bgMusic.loop = true;

// Start everything on first click
window.addEventListener("click", () => {
  bgMusic.play().catch(() => console.log("Autoplay blocked by browser"));
  continueText.style.opacity = 0;

  setTimeout(() => {
    continueText.style.display = "none";
    playButton.style.display = "block";
    creditsButton.style.display = "block";
    setTimeout(() => {
      playButton.style.opacity = 1;
      creditsButton.style.opacity = 1;
    }, 100);
  }, 400);
}, { once: true });

// 🔊 Add sound effects AFTER buttons appear
function enableButtonSounds() {
  const buttons = [playButton, creditsButton];
  buttons.forEach(button => {
    button.addEventListener("mouseenter", () => {
      hoverSound.currentTime = 0;
      hoverSound.play();
    });

    button.addEventListener("click", () => {
      clickSound.currentTime = 0;
      clickSound.play();
    });
  });
}

// Activate button sounds slightly after reveal
setTimeout(enableButtonSounds, 100);

// 🎮 Play button goes to Level 1 (wait for click sound first)
playButton.addEventListener("click", () => {
  clickSound.currentTime = 0;
  clickSound.play();

  const menuContainer = document.getElementById("menuContainer");

  const bgVideo = document.getElementById("bgVideo");

  // Apply fade-out to both
  menuContainer.classList.add("fade-out");
  bgVideo.classList.add("fade-out");

  // Fade out background music
  let volume = bgMusic.volume;
  const fadeInterval = setInterval(() => {
    volume -= 0.05;
    if (volume <= 0) {
      bgMusic.pause();
      clearInterval(fadeInterval);
    } else {
      bgMusic.volume = volume;
    }
  }, 80);

  // Wait for fade animation to finish, then switch page
  setTimeout(() => {
    window.location.href = "Level1.html";
  }, 900); // slightly longer than CSS transition (0.8s)
});


const menuContainer = document.getElementById("menuContainer");
const creditsContainer = document.getElementById("creditsContainer");

function scaleMenu() {
  const scale = Math.min(window.innerWidth / 1200, window.innerHeight / 800);
  menuContainer.style.transform = `scale(${scale})`;
  creditsContainer.style.transform = `translate(-50%, -50%) scale(${scale})`;
}

window.addEventListener("resize", scaleMenu);
window.addEventListener("load", scaleMenu);


const backButton = new Image(); backButton.src = "Resources/backButton.png";

// 🎵 Open Credits
creditsButton.addEventListener("click", () => {
  clickSound.currentTime = 0;
  clickSound.play();

  // Fade out menu
  menuContainer.classList.add("fade-out");

  setTimeout(() => {
    menuContainer.style.display = "none";

    // Show credits properly
    creditsContainer.style.display = "flex"; // use flex for centering
    setTimeout(() => {
      creditsContainer.style.opacity = 1;
    }, 50);
  }, 800);
});

// 🔙 Exit credits when clicking anywhere (even on inner text)
creditsContainer.addEventListener("click", () => {
  clickSound.currentTime = 0;
  clickSound.play();

  creditsContainer.style.opacity = 0;

  setTimeout(() => {
    creditsContainer.style.display = "none";
    menuContainer.style.display = "flex";
    setTimeout(() => {
      menuContainer.classList.remove("fade-out");
    }, 50);
  }, 800);
});
