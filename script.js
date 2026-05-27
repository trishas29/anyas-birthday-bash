const confettiLayer = document.getElementById("confettiLayer");
const revealItems = document.querySelectorAll(".reveal");
const startButton = document.getElementById("startButton");
const musicToggle = document.getElementById("musicToggle");
const secret67 = document.getElementById("secret67");
const vibeText = document.getElementById("vibeText");
const winCount = document.getElementById("winCount");
const candleBoard = document.getElementById("candlesBoard");
const candleStatus = document.getElementById("candleStatus");
const candleTimer = document.getElementById("candleTimer");
const candleReset = document.getElementById("candleReset");
const giftBoard = document.getElementById("giftBoard");
const giftReset = document.getElementById("giftReset");
const giftStatus = document.getElementById("giftStatus");
const cakeTop = document.getElementById("cakeTop");
const cakeMiddle = document.getElementById("cakeMiddle");
const cakeBottom = document.getElementById("cakeBottom");
const cakeStatus = document.getElementById("cakeStatus");
const awardPills = document.querySelectorAll(".award-pill");
const awardStatus = document.getElementById("awardStatus");
const soundStatus = document.getElementById("soundStatus");
const soundChips = document.querySelectorAll(".sound-chip");
const finaleButton = document.getElementById("finaleButton");
const finaleText = document.getElementById("finaleText");
const cakeOverlay = document.getElementById("cakeOverlay");
const overlayText = document.getElementById("overlayText");
const overlayEncore = document.getElementById("overlayEncore");
const overlayClose = document.getElementById("overlayClose");

const confettiColors = ["#ff4fa3", "#ffd96d", "#ffffff", "#9cf7d5", "#ff9bc9"];
const soundPool = {
  random: [
    { name: "bruh", url: "https://www.myinstants.com/media/sounds/movie_1.mp3" },
    { name: "vine boom", url: "https://www.myinstants.com/media/sounds/vine-boom.mp3" },
    { name: "fahh", url: "https://www.myinstants.com/media/sounds/fahh-but-louder.mp3" },
    { name: "67", url: "https://www.myinstants.com/media/sounds/67_SQlv2Xv.mp3" },
    { name: "tung tung tung sahur", url: "https://www.myinstants.com/media/sounds/tung-tung-tung-tung-sahur.mp3" }
  ],
  exact: {
    "67": "https://www.myinstants.com/media/sounds/67_SQlv2Xv.mp3",
    bruh: "https://www.myinstants.com/media/sounds/movie_1.mp3",
    vine: "https://www.myinstants.com/media/sounds/vine-boom.mp3",
    fahh: "https://www.myinstants.com/media/sounds/fahh-but-louder.mp3",
    sahur: "https://www.myinstants.com/media/sounds/tung-tung-tung-tung-sahur.mp3",
    fortyone: "https://www.myinstants.com/media/sounds/41.mp3"
  }
};

const birthdayMelody = [
  [392, 0.2], [392, 0.2], [440, 0.42], [392, 0.42], [523, 0.42], [494, 0.72],
  [392, 0.2], [392, 0.2], [440, 0.42], [392, 0.42], [587, 0.42], [523, 0.72]
];

const cakeThemes = {
  top: [
    "linear-gradient(135deg, #ffe2f0, #fff4bf)",
    "linear-gradient(135deg, #fff4a8, #ffd36a)",
    "linear-gradient(135deg, #d4ffe8, #7de7c2)"
  ],
  middle: [
    "linear-gradient(135deg, #ff6ab2, #ff9fcb)",
    "linear-gradient(135deg, #f78b3d, #ffd36f)",
    "linear-gradient(135deg, #7be7c4, #b0fff0)"
  ],
  bottom: [
    "linear-gradient(135deg, #ffd96d, #ffbd4a)",
    "linear-gradient(135deg, #ffc0de, #ff82ba)",
    "linear-gradient(135deg, #daf7ea, #97efcf)"
  ]
};

let audioContext;
let musicInterval;
let musicEnabled = false;
let activeAudio;
let lastRandomSound = -1;
let candleTimerId;
let candleTimeLeft = 12;
let candlesLit = 0;
let giftWinner = 0;
let giftLocked = false;
const clearedGames = new Set();
const cakeState = { top: 0, middle: 0, bottom: 0 };

function ensureAudio() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
}

function playTone(frequency, duration, type = "triangle", volume = 0.08, when = 0) {
  ensureAudio();

  const startAt = audioContext.currentTime + when;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startAt);
  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(volume, startAt + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start(startAt);
  oscillator.stop(startAt + duration + 0.03);
}

function playBirthdayLoop() {
  let offset = 0;
  birthdayMelody.forEach(([frequency, duration]) => {
    playTone(frequency, duration, "triangle", 0.06, offset);
    offset += duration;
  });
}

function playAudioUrl(url) {
  return new Promise((resolve) => {
    try {
      if (activeAudio) {
        activeAudio.pause();
        activeAudio.currentTime = 0;
      }

      const audio = new Audio(url);
      audio.preload = "auto";
      audio.volume = 0.45;
      audio.addEventListener("ended", () => resolve(true), { once: true });
      audio.addEventListener("error", () => resolve(false), { once: true });
      audio.play().then(() => resolve(true)).catch(() => {
        playTone(660, 0.08, "square", 0.05);
        resolve(false);
      });
      activeAudio = audio;
    } catch {
      playTone(660, 0.08, "square", 0.05);
      resolve(false);
    }
  });
}

function playRandomSound() {
  let nextIndex = Math.floor(Math.random() * soundPool.random.length);
  if (soundPool.random.length > 1 && nextIndex === lastRandomSound) {
    nextIndex = (nextIndex + 1) % soundPool.random.length;
  }
  lastRandomSound = nextIndex;
  playAudioUrl(soundPool.random[nextIndex].url);
}

async function playExactSound(name) {
  const url = soundPool.exact[name];
  if (url) {
    const worked = await playAudioUrl(url);
    if (!worked && soundStatus) {
      soundStatus.textContent = `${name} was dramatic and failed to load, so the page improvised.`;
    }
  } else {
    playRandomSound();
  }
}

function addRandomSoundOnClick(selector) {
  document.querySelectorAll(selector).forEach((item) => {
    item.addEventListener("click", () => {
      playRandomSound();
    });
  });
}

function burstConfetti(amount = 40) {
  for (let index = 0; index < amount; index += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = confettiColors[Math.floor(Math.random() * confettiColors.length)];
    piece.style.animationDuration = `${2.8 + Math.random() * 2.2}s`;
    piece.style.setProperty("--drift", `${(Math.random() - 0.5) * 240}px`);
    piece.style.transform = `scale(${0.8 + Math.random() * 0.8}) rotate(${Math.random() * 360}deg)`;
    confettiLayer.appendChild(piece);
    window.setTimeout(() => piece.remove(), 5500);
  }
}

function setVibe(text) {
  vibeText.textContent = text;
}

function updateWins() {
  winCount.textContent = `${clearedGames.size} / 3`;

  if (clearedGames.size === 0) {
    setVibe("warming up");
  } else if (clearedGames.size === 1) {
    setVibe("officially moving");
  } else if (clearedGames.size === 2) {
    setVibe("alarmingly good");
  } else {
    setVibe("full birthday engine");
    finaleButton.disabled = false;
    finaleText.textContent = "All games cleared. The giant cake drop is now available.";
  }
}

function markGameCleared(id) {
  if (!clearedGames.has(id)) {
    clearedGames.add(id);
    updateWins();
  }
}

function createCandles() {
  candleBoard.innerHTML = "";
  candlesLit = 0;
  candleTimeLeft = 12;
  candleStatus.textContent = "8 candles waiting";
  candleTimer.textContent = "12.0s";

  for (let index = 0; index < 8; index += 1) {
    const candle = document.createElement("button");
    candle.type = "button";
    candle.className = "candle interactive";
    candle.setAttribute("aria-label", `Light candle ${index + 1}`);

    candle.addEventListener("click", () => {
      if (candle.classList.contains("lit")) {
        return;
      }

      candle.classList.add("lit");
      candlesLit += 1;
      playRandomSound();
      burstConfetti(10);
      candleStatus.textContent = `${8 - candlesLit} candles waiting`;

      if (candlesLit === 8) {
        window.clearInterval(candleTimerId);
        candleStatus.textContent = "Every candle is on. Excellent work.";
        markGameCleared("candles");
        burstConfetti(70);
        playExactSound("vine");
      }
    });

    candleBoard.appendChild(candle);
  }

  window.clearInterval(candleTimerId);
  candleTimerId = window.setInterval(() => {
    candleTimeLeft -= 0.1;
    candleTimer.textContent = `${Math.max(candleTimeLeft, 0).toFixed(1)}s`;

    if (candleTimeLeft <= 0) {
      window.clearInterval(candleTimerId);
      candleStatus.textContent = "Timer expired. The candles are judging you.";
      Array.from(candleBoard.children).forEach((candle) => {
        candle.disabled = true;
      });
      playExactSound("bruh");
    }
  }, 100);
}

function buildGiftBoard() {
  giftBoard.innerHTML = "";
  giftWinner = Math.floor(Math.random() * 9);
  giftLocked = false;
  giftStatus.textContent = "Diode has not been located yet.";

  for (let index = 0; index < 9; index += 1) {
    const gift = document.createElement("button");
    gift.type = "button";
    gift.className = "gift interactive";
    gift.textContent = "🎁";
    gift.setAttribute("aria-label", `Open gift ${index + 1}`);

    gift.addEventListener("click", () => {
      if (giftLocked || gift.classList.contains("open")) {
        return;
      }

      gift.classList.add("open");

      if (index === giftWinner) {
        gift.textContent = "🐶";
        giftLocked = true;
        giftStatus.textContent = "Diode found. Strong investigative instincts.";
        markGameCleared("gift");
        burstConfetti(80);
        playExactSound("67");
      } else {
        gift.textContent = "🧦";
        giftStatus.textContent = "Not Diode. Just an emotionally confusing gift.";
        playRandomSound();
      }
    });

    giftBoard.appendChild(gift);
  }
}

function paintCake() {
  cakeTop.style.background = cakeThemes.top[cakeState.top];
  cakeMiddle.style.background = cakeThemes.middle[cakeState.middle];
  cakeBottom.style.background = cakeThemes.bottom[cakeState.bottom];

  const complete = cakeState.top > 0 && cakeState.middle > 0 && cakeState.bottom > 0;
  cakeStatus.textContent = complete
    ? "Cake locked in. Suspiciously elegant."
    : "Cake is currently under fashionable construction.";

  if (complete) {
    markGameCleared("cake");
  }
}

function cycleCakePart(part) {
  const optionsCount = cakeThemes[part].length;
  cakeState[part] = (cakeState[part] + 1) % optionsCount;
  paintCake();
  burstConfetti(14);
  playRandomSound();
}

function finaleDrop() {
  if (finaleButton.disabled) {
    return;
  }

  document.body.classList.add("party-surge");
  finaleText.textContent = "Cake mode engaged. Please remain seated.";
  burstConfetti(180);
  playExactSound("fahh");
  window.setTimeout(() => playExactSound("67"), 260);
  window.setTimeout(() => playExactSound("sahur"), 620);
  window.setTimeout(() => playExactSound("vine"), 940);
  openCakeOverlay();

  window.setTimeout(() => {
    document.body.classList.remove("party-surge");
  }, 1400);
}

function openCakeOverlay() {
  cakeOverlay.classList.add("visible");
  cakeOverlay.setAttribute("aria-hidden", "false");
  overlayText.textContent = "Anya's birthday cake has escalated into a full-screen event.";

  for (let index = 0; index < 5; index += 1) {
    window.setTimeout(() => burstConfetti(90), index * 260);
  }
}

function closeCakeOverlay() {
  cakeOverlay.classList.remove("visible");
  cakeOverlay.setAttribute("aria-hidden", "true");
}

function toggleMusic() {
  musicEnabled = !musicEnabled;
  musicToggle.textContent = musicEnabled ? "Pause Birthday Music" : "Toggle Birthday Music";

  if (musicEnabled) {
    playBirthdayLoop();
    musicInterval = window.setInterval(playBirthdayLoop, 6200);
  } else {
    window.clearInterval(musicInterval);
  }
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  { threshold: 0.14 }
);

revealItems.forEach((item) => observer.observe(item));

document.querySelectorAll("[data-cake-part]").forEach((button) => {
  button.addEventListener("click", () => {
    cycleCakePart(button.dataset.cakePart);
  });
});

awardPills.forEach((pill) => {
  pill.addEventListener("click", () => {
    awardPills.forEach((item) => item.classList.remove("active"));
    pill.classList.add("active");
    awardStatus.textContent = `${pill.dataset.award}. Approved unanimously by the committee.`;
    playRandomSound();
  });
});

soundChips.forEach((chip) => {
  chip.addEventListener("click", async () => {
    const soundName = chip.dataset.soundName;
    soundStatus.textContent = `Deploying ${chip.textContent}.`;
    await playExactSound(soundName);
  });
});

startButton.addEventListener("click", () => {
  burstConfetti(110);
  playExactSound("67");
  setVibe("broadcasting");
  document.getElementById("games")?.scrollIntoView({ behavior: "smooth", block: "start" });
});

musicToggle.addEventListener("click", toggleMusic);
secret67.addEventListener("click", () => playExactSound("67"));
candleReset.addEventListener("click", createCandles);
giftReset.addEventListener("click", buildGiftBoard);
finaleButton.addEventListener("click", finaleDrop);
overlayEncore.addEventListener("click", () => {
  openCakeOverlay();
  playExactSound("67");
  window.setTimeout(() => playExactSound("sahur"), 240);
});
overlayClose.addEventListener("click", closeCakeOverlay);

addRandomSoundOnClick(".photo-tile");
addRandomSoundOnClick(".diode-card");

createCandles();
buildGiftBoard();
paintCake();
updateWins();

window.addEventListener("load", () => {
  window.setTimeout(() => burstConfetti(70), 260);
});
