const confettiLayer = document.getElementById("confettiLayer");
const chaosLayer = document.getElementById("chaosLayer");
const revealItems = document.querySelectorAll(".reveal");
const startButton = document.getElementById("startButton");
const musicToggle = document.getElementById("musicToggle");
const secret67 = document.getElementById("secret67");
const vibeText = document.getElementById("vibeText");
const winCount = document.getElementById("winCount");
const relicRow = document.getElementById("relicRow");
const candleBoard = document.getElementById("candlesBoard");
const candleStatus = document.getElementById("candleStatus");
const candleTimer = document.getElementById("candleTimer");
const candleReset = document.getElementById("candleReset");
const giftBoard = document.getElementById("giftBoard");
const giftReset = document.getElementById("giftReset");
const giftStatus = document.getElementById("giftStatus");
const memoryPads = document.querySelectorAll(".memory-pad");
const memoryStart = document.getElementById("memoryStart");
const memoryStatus = document.getElementById("memoryStatus");
const wordleGrid = document.getElementById("wordleGrid");
const wordleInput = document.getElementById("wordleInput");
const wordleSubmit = document.getElementById("wordleSubmit");
const wordleStatus = document.getElementById("wordleStatus");
const cakeTop = document.getElementById("cakeTop");
const cakeMiddle = document.getElementById("cakeMiddle");
const cakeBottom = document.getElementById("cakeBottom");
const cakeStatus = document.getElementById("cakeStatus");
const finaleButton = document.getElementById("finaleButton");
const finaleText = document.getElementById("finaleText");
const cakeOverlay = document.getElementById("cakeOverlay");
const overlayText = document.getElementById("overlayText");
const overlayEncore = document.getElementById("overlayEncore");
const overlayClose = document.getElementById("overlayClose");

const confettiColors = ["#b6ff00", "#00e5ff", "#ff4d6d", "#ffe66d", "#f2fff8"];
const soundPool = [
  { name: "67", url: "https://www.myinstants.com/media/sounds/67_SQlv2Xv.mp3" },
  { name: "bruh", url: "https://www.myinstants.com/media/sounds/movie_1.mp3" },
  { name: "vine boom", url: "https://www.myinstants.com/media/sounds/vine-boom.mp3" },
  { name: "fahh", url: "https://www.myinstants.com/media/sounds/fahh-but-louder.mp3" },
  { name: "tung tung sahur", url: "https://www.myinstants.com/media/sounds/tung-tung-sahur.mp3" },
  { name: "tung tung tung sahur", url: "https://www.myinstants.com/media/sounds/tung-tung-tung-tung-sahur.mp3" },
  { name: "forty one", url: "https://www.myinstants.com/media/sounds/41.mp3" },
  { name: "chill guy", url: "https://www.myinstants.com/media/sounds/chill-guy.mp3" },
  { name: "chicken jockey", url: "https://www.myinstants.com/media/sounds/chicken-jockey.mp3" },
  { name: "tralalero tralala", url: "https://www.myinstants.com/media/sounds/tralalero-tralala.mp3" },
  { name: "bombardino crocodilo", url: "https://www.myinstants.com/media/sounds/bombardino-crocodilo.mp3" },
  { name: "boowomp", url: "https://www.myinstants.com/media/sounds/spongebob-boowomp.mp3" }
];

const exactSounds = {
  67: soundPool[0].url,
  vine: soundPool[2].url,
  sahur: soundPool[5].url,
  finale: soundPool[9].url
};

const imagePool = {
  nyan: [
    "./assets/memes/nyan/nyan-1.gif",
    "./assets/memes/nyan/nyan-2.png",
    "https://commons.wikimedia.org/wiki/Special:Redirect/file/NyanCat.gif",
    "https://commons.wikimedia.org/wiki/Special:Redirect/file/Nyan_cat_250px_frame.PNG"
  ],
  brainrot: [
    "./assets/memes/brainrot/brainrot-1.png",
    "./assets/memes/brainrot/brainrot-2.png",
    "./assets/memes/brainrot/brainrot-3.png",
    "https://commons.wikimedia.org/wiki/Special:Redirect/file/Full_image_of_Tung_Tung_Tung_Sahur.png",
    "https://static.wikia.nocookie.net/brainrotnew/images/3/3f/Tralalero_tralala.png",
    "https://static.wikia.nocookie.net/brainrotnew/images/f/f2/Bombardino_Crocodilo.png"
  ]
};

const birthdayMelody = [
  [392, 0.2], [392, 0.2], [440, 0.38], [392, 0.38], [523, 0.38], [494, 0.62],
  [392, 0.2], [392, 0.2], [440, 0.38], [392, 0.38], [587, 0.38], [523, 0.62]
];

const cakeThemes = {
  top: ["#f2fff8", "#b6ff00", "#ffe66d"],
  middle: ["#00e5ff", "#ff4d6d", "#b6ff00"],
  bottom: ["#ff4d6d", "#00e5ff", "#ffe66d"]
};

const cakeCombo = { top: 1, middle: 2, bottom: 1 };
const clearedGames = new Set();
const cakeState = { top: 0, middle: 0, bottom: 0 };

let audioContext;
let musicInterval;
let musicEnabled = false;
let lastRandomSound = -1;
let candleTimerId;
let candleTimeLeft = 9;
let candlesLit = 0;
let giftWinner = 0;
let giftLocked = false;
let memorySequence = [];
let memoryInputIndex = 0;
let memoryAcceptingInput = false;
let wordleRow = 0;
let wordleSolved = false;
let cakeTouched = false;
const wordleAnswer = "LEGAL";

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
  try {
    const audio = new Audio(url);
    audio.preload = "auto";
    audio.volume = 0.42;
    audio.play().catch(() => {
      playTone(660, 0.08, "square", 0.05);
    });
  } catch {
    playTone(660, 0.08, "square", 0.05);
  }
}

function playRandomSound() {
  let nextIndex = Math.floor(Math.random() * soundPool.length);
  if (soundPool.length > 1 && nextIndex === lastRandomSound) {
    nextIndex = (nextIndex + 1) % soundPool.length;
  }

  lastRandomSound = nextIndex;
  playAudioUrl(soundPool[nextIndex].url);
}

function playExactSound(name) {
  playAudioUrl(exactSounds[name] || soundPool[0].url);
}

function burstConfetti(amount = 40) {
  for (let index = 0; index < amount; index += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = confettiColors[Math.floor(Math.random() * confettiColors.length)];
    piece.style.animationDuration = `${2.3 + Math.random() * 2.2}s`;
    piece.style.setProperty("--drift", `${(Math.random() - 0.5) * 260}px`);
    piece.style.transform = `scale(${0.8 + Math.random() * 0.8}) rotate(${Math.random() * 360}deg)`;
    confettiLayer.appendChild(piece);
    window.setTimeout(() => piece.remove(), 5200);
  }
}

function spawnFloater(forceCat = false) {
  const floater = document.createElement("span");
  const isCat = forceCat || Math.random() > 0.55;
  const words = ["TUNG", "SAHUR", "41", "CAKE", "DIODE", "NYAN", "BRAINROT", "RUN"];
  floater.className = `chaos-floater${isCat ? " cat" : ""}`;
  if (isCat || Math.random() > 0.45) {
    const img = document.createElement("img");
    const pool = isCat ? imagePool.nyan : imagePool.brainrot;
    img.src = pool[Math.floor(Math.random() * pool.length)];
    img.alt = "";
    img.addEventListener("error", () => {
      floater.textContent = isCat ? "NYAN CAT >>>" : words[Math.floor(Math.random() * words.length)];
    }, { once: true });
    floater.appendChild(img);
  } else {
    floater.textContent = words[Math.floor(Math.random() * words.length)];
  }
  floater.style.setProperty("--top", `${8 + Math.random() * 82}vh`);
  floater.style.setProperty("--speed", `${8 + Math.random() * 8}s`);
  floater.style.setProperty("--tilt", `${-10 + Math.random() * 20}deg`);
  floater.style.setProperty("--color", confettiColors[Math.floor(Math.random() * confettiColors.length)]);
  chaosLayer.appendChild(floater);
  window.setTimeout(() => floater.remove(), 17000);
}

function updateWins() {
  winCount.textContent = `${clearedGames.size} / 5`;
  Array.from(relicRow.children).forEach((relic, index) => {
    relic.classList.toggle("active", index < clearedGames.size);
  });

  const statuses = ["asleep", "sparking", "unstable", "loud", "critical", "fully awake"];
  vibeText.textContent = statuses[clearedGames.size];

  if (clearedGames.size === 5) {
    finaleButton.disabled = false;
    finaleText.textContent = "All relics collected. The cake reactor is begging for bad decisions.";
  }
}

function markGameCleared(id) {
  if (clearedGames.has(id)) {
    return;
  }

  clearedGames.add(id);
  document.querySelector(`[data-game-card="${id}"]`)?.classList.add("cleared");
  updateWins();
  burstConfetti(90);
  playRandomSound();
  spawnFloater(true);
}

function createCandles() {
  candleBoard.innerHTML = "";
  candlesLit = 0;
  candleTimeLeft = 9;
  candleStatus.textContent = "12 candles waiting";
  candleTimer.textContent = "9.0s";

  for (let index = 0; index < 12; index += 1) {
    const candle = document.createElement("button");
    candle.type = "button";
    candle.className = "candle interactive";
    candle.setAttribute("aria-label", `Light candle ${index + 1}`);

    candle.addEventListener("click", () => {
      if (candle.classList.contains("lit") || candle.disabled) {
        return;
      }

      candle.classList.add("lit");
      candlesLit += 1;
      playRandomSound();
      candleStatus.textContent = `${12 - candlesLit} candles waiting`;

      if (candlesLit === 12) {
        window.clearInterval(candleTimerId);
        candleStatus.textContent = "Candle trial cleared. Relic obtained.";
        markGameCleared("candles");
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
      candleStatus.textContent = "Too slow. The candles filed a complaint.";
      Array.from(candleBoard.children).forEach((candle) => {
        candle.disabled = true;
      });
      playRandomSound();
      spawnFloater();
    }
  }, 100);
}

function buildGiftBoard() {
  giftBoard.innerHTML = "";
  giftWinner = Math.floor(Math.random() * 16);
  giftLocked = false;
  giftStatus.textContent = "Diode is currently off-grid.";

  for (let index = 0; index < 16; index += 1) {
    const gift = document.createElement("button");
    gift.type = "button";
    gift.className = "gift interactive";
    gift.textContent = "box";
    gift.setAttribute("aria-label", `Open gift ${index + 1}`);

    gift.addEventListener("click", () => {
      if (giftLocked || gift.classList.contains("open")) {
        return;
      }

      gift.classList.add("open");

      if (index === giftWinner) {
        gift.innerHTML = '<img src="./assets/photos/diode/diode-find.jpeg" alt="Diode">';
        gift.querySelector("img")?.addEventListener("error", () => {
          gift.textContent = "add diode-find.jpeg";
        }, { once: true });
        giftLocked = true;
        giftStatus.textContent = "Diode located. Relic obtained.";
        markGameCleared("diode");
      } else {
        const img = document.createElement("img");
        img.src = imagePool.brainrot[Math.floor(Math.random() * imagePool.brainrot.length)];
        img.alt = "brainrot decoy";
        img.addEventListener("error", () => {
          gift.textContent = "decoy";
        }, { once: true });
        gift.textContent = "";
        gift.appendChild(img);
        giftStatus.textContent = "Incorrect. The gift pile becomes more suspicious.";
        playRandomSound();
      }
    });

    giftBoard.appendChild(gift);
  }
}

function buildWordleBoard() {
  wordleGrid.innerHTML = "";
  wordleRow = 0;
  wordleSolved = false;
  wordleStatus.textContent = "Six tries. The answer is birthday-adjacent.";
  wordleInput.value = "";
  wordleInput.disabled = false;
  wordleSubmit.disabled = false;

  for (let index = 0; index < 30; index += 1) {
    const cell = document.createElement("div");
    cell.className = "wordle-cell";
    wordleGrid.appendChild(cell);
  }
}

function submitWordleGuess() {
  if (wordleSolved || wordleRow >= 6) {
    return;
  }

  const guess = wordleInput.value.toUpperCase().replace(/[^A-Z]/g, "");
  if (guess.length !== 5) {
    wordleStatus.textContent = "Five letters. The reactor is picky.";
    playRandomSound();
    return;
  }

  const answerLetters = wordleAnswer.split("");
  const start = wordleRow * 5;

  guess.split("").forEach((letter, index) => {
    const cell = wordleGrid.children[start + index];
    cell.textContent = letter;
    if (letter === answerLetters[index]) {
      cell.classList.add("correct");
    } else if (answerLetters.includes(letter)) {
      cell.classList.add("present");
    } else {
      cell.classList.add("absent");
    }
  });

  wordleInput.value = "";
  playRandomSound();

  if (guess === wordleAnswer) {
    wordleSolved = true;
    wordleInput.disabled = true;
    wordleSubmit.disabled = true;
    wordleStatus.textContent = "Level 21 word solved. Relic obtained.";
    markGameCleared("wordle");
    return;
  }

  wordleRow += 1;
  if (wordleRow >= 6) {
    wordleStatus.textContent = "Wordle failed. The answer was LEGAL. Try again.";
    wordleInput.disabled = true;
    wordleSubmit.disabled = true;
    window.setTimeout(buildWordleBoard, 1200);
  } else {
    wordleStatus.textContent = `${6 - wordleRow} tries left.`;
  }
}

function showMemorySequence() {
  memorySequence = Array.from({ length: 6 }, () => Math.floor(Math.random() * 4));
  memoryInputIndex = 0;
  memoryAcceptingInput = false;
  memoryStatus.textContent = "Watch closely.";

  memorySequence.forEach((padIndex, sequenceIndex) => {
    window.setTimeout(() => {
      const pad = memoryPads[padIndex];
      pad.classList.add("flash");
      playRandomSound();
      window.setTimeout(() => pad.classList.remove("flash"), 360);

      if (sequenceIndex === memorySequence.length - 1) {
        window.setTimeout(() => {
          memoryAcceptingInput = true;
          memoryStatus.textContent = "Repeat it exactly.";
        }, 450);
      }
    }, 620 * sequenceIndex);
  });
}

function handleMemoryInput(padIndex) {
  if (!memoryAcceptingInput || clearedGames.has("memory")) {
    return;
  }

  playRandomSound();

  if (memorySequence[memoryInputIndex] !== padIndex) {
    memoryInputIndex = 0;
    memoryAcceptingInput = false;
    memoryStatus.textContent = "Wrong. Pattern reset. Try again.";
    spawnFloater();
    return;
  }

  memoryInputIndex += 1;
  memoryStatus.textContent = `${memoryInputIndex} / ${memorySequence.length} correct`;

  if (memoryInputIndex === memorySequence.length) {
    memoryStatus.textContent = "Brainrot sequence cleared. Relic obtained.";
    memoryAcceptingInput = false;
    markGameCleared("memory");
  }
}

function paintCake() {
  cakeTop.style.background = cakeThemes.top[cakeState.top];
  cakeMiddle.style.background = cakeThemes.middle[cakeState.middle];
  cakeBottom.style.background = cakeThemes.bottom[cakeState.bottom];

  const complete = Object.keys(cakeCombo).every((part) => cakeState[part] === cakeCombo[part]);
  if (!cakeTouched) {
    cakeStatus.textContent = "Reactor is cold.";
  } else {
    cakeStatus.textContent = complete
      ? "Secret combo locked. Relic obtained."
      : "Wrong combo. Keep tuning the reactor.";
  }

  if (complete) {
    markGameCleared("cake");
  }
}

function cycleCakePart(part) {
  cakeTouched = true;
  cakeState[part] = (cakeState[part] + 1) % cakeThemes[part].length;
  paintCake();
  playRandomSound();
}

function openCakeOverlay() {
  cakeOverlay.classList.add("visible");
  cakeOverlay.setAttribute("aria-hidden", "false");
  overlayText.textContent = "Anya has cleared Level 21. The cake has left normal reality.";
  document.body.classList.add("party-surge");

  for (let index = 0; index < 8; index += 1) {
    window.setTimeout(() => {
      burstConfetti(95);
      spawnFloater(true);
      playRandomSound();
    }, index * 240);
  }

  window.setTimeout(() => document.body.classList.remove("party-surge"), 1900);
}

function closeCakeOverlay() {
  cakeOverlay.classList.remove("visible");
  cakeOverlay.setAttribute("aria-hidden", "true");
}

function finaleDrop() {
  if (finaleButton.disabled) {
    return;
  }

  finaleText.textContent = "Cake reactor detonated. There is no going back.";
  playExactSound("finale");
  window.setTimeout(() => playExactSound("67"), 280);
  window.setTimeout(() => playExactSound("sahur"), 560);
  openCakeOverlay();
}

function toggleMusic() {
  musicEnabled = !musicEnabled;
  musicToggle.textContent = musicEnabled ? "Pause Music" : "Birthday Music";

  if (musicEnabled) {
    playBirthdayLoop();
    musicInterval = window.setInterval(playBirthdayLoop, 6000);
  } else {
    window.clearInterval(musicInterval);
  }
}

function preparePhotoSlots() {
  document.querySelectorAll(".photo-tile img").forEach((image) => {
    const showPlaceholder = () => {
      if (image.classList.contains("missing")) {
        return;
      }

      image.classList.add("missing");
      const placeholder = document.createElement("div");
      placeholder.className = "photo-placeholder";
      placeholder.textContent = `Add ${image.getAttribute("src").replace("./assets/photos/", "")}`;
      image.after(placeholder);
    };

    image.addEventListener("error", showPlaceholder, { once: true });
    if (image.complete && image.naturalWidth === 0) {
      showPlaceholder();
    }
  });
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
  button.addEventListener("click", () => cycleCakePart(button.dataset.cakePart));
});

memoryPads.forEach((pad) => {
  pad.addEventListener("click", () => handleMemoryInput(Number(pad.dataset.pad)));
});

startButton.addEventListener("click", () => {
  burstConfetti(120);
  playRandomSound();
  document.getElementById("games")?.scrollIntoView({ behavior: "smooth", block: "start" });
});

musicToggle.addEventListener("click", toggleMusic);
secret67.addEventListener("click", () => {
  playRandomSound();
  spawnFloater(true);
});
candleReset.addEventListener("click", createCandles);
giftReset.addEventListener("click", buildGiftBoard);
memoryStart.addEventListener("click", showMemorySequence);
wordleSubmit.addEventListener("click", submitWordleGuess);
wordleInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    submitWordleGuess();
  }
});
finaleButton.addEventListener("click", finaleDrop);
overlayEncore.addEventListener("click", openCakeOverlay);
overlayClose.addEventListener("click", closeCakeOverlay);

document.querySelectorAll(".photo-tile").forEach((tile) => {
  tile.addEventListener("click", () => {
    playRandomSound();
    spawnFloater();
  });
});

createCandles();
buildGiftBoard();
buildWordleBoard();
paintCake();
updateWins();
preparePhotoSlots();

window.setInterval(() => spawnFloater(), 2800);
window.addEventListener("load", () => {
  window.setTimeout(() => burstConfetti(70), 260);
  window.setTimeout(() => spawnFloater(true), 700);
});
