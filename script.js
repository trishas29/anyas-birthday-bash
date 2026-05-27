const quoteButton = document.getElementById("quoteButton");
const quoteText = document.getElementById("quoteText");
const chaosButton = document.getElementById("chaosButton");
const heroConfetti = document.getElementById("heroConfetti");
const confettiLayer = document.getElementById("confettiLayer");
const musicToggle = document.getElementById("musicToggle");
const soundButtons = document.querySelectorAll(".sound-button");
const revealItems = document.querySelectorAll(".reveal");

const quotes = [
  '"Anya is proof that being iconic and slightly unhinged can coexist beautifully."',
  '"If fabulous was taxable, Anya would owe the government everything."',
  '"Anya does not chase the vibe. The vibe updates its resume and applies to her."',
  '"Some people age gracefully. Anya ages like a sequel with a bigger budget."',
  '"Every party needs snacks, music, and one Anya for quality control."',
  '"Scientists still cannot explain how one person can be this glam and this chaotic."'
];

const confettiColors = ["#ff4fb3", "#ffd76b", "#ffffff", "#ff8fd1", "#ff9f1c"];
let audioContext;
let musicInterval;
let musicEnabled = false;

function ensureAudio() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
}

function playTone(frequency, duration, type = "sine", volume = 0.18, when = 0) {
  ensureAudio();

  const startAt = audioContext.currentTime + when;
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startAt);

  gainNode.gain.setValueAtTime(0.0001, startAt);
  gainNode.gain.exponentialRampToValueAtTime(volume, startAt + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.start(startAt);
  oscillator.stop(startAt + duration + 0.02);
}

function playSoundboard(name) {
  const recipes = {
    "67": () => {
      playTone(660, 0.12, "square", 0.18, 0);
      playTone(880, 0.12, "square", 0.15, 0.1);
    },
    fahh: () => {
      playTone(420, 0.25, "sawtooth", 0.18, 0);
      playTone(280, 0.3, "triangle", 0.14, 0.08);
    },
    "vine-boom": () => {
      playTone(110, 0.45, "sawtooth", 0.25, 0);
      playTone(73, 0.5, "triangle", 0.18, 0.03);
    },
    bruh: () => {
      playTone(240, 0.18, "triangle", 0.18, 0);
      playTone(180, 0.22, "sine", 0.12, 0.06);
    }
  };

  recipes[name]?.();
}

function burstConfetti(intensity = 40) {
  for (let i = 0; i < intensity; i += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = confettiColors[Math.floor(Math.random() * confettiColors.length)];
    piece.style.animationDuration = `${3 + Math.random() * 2.5}s`;
    piece.style.animationDelay = `${Math.random() * 0.2}s`;
    piece.style.setProperty("--drift", `${(Math.random() - 0.5) * 220}px`);
    piece.style.transform = `scale(${0.7 + Math.random() * 0.8}) rotate(${Math.random() * 360}deg)`;
    confettiLayer.appendChild(piece);

    window.setTimeout(() => piece.remove(), 6000);
  }
}

function generateQuote() {
  const next = quotes[Math.floor(Math.random() * quotes.length)];
  quoteText.textContent = next;
  quoteText.animate(
    [
      { transform: "scale(0.96)", opacity: 0.5 },
      { transform: "scale(1)", opacity: 1 }
    ],
    { duration: 260, easing: "ease-out" }
  );
}

function playBirthdayLoop() {
  const melody = [
    [392, 0.22], [392, 0.22], [440, 0.45], [392, 0.45], [523, 0.45], [494, 0.8],
    [392, 0.22], [392, 0.22], [440, 0.45], [392, 0.45], [587, 0.45], [523, 0.8]
  ];

  let offset = 0;
  melody.forEach(([frequency, duration]) => {
    playTone(frequency, duration, "triangle", 0.07, offset);
    offset += duration;
  });
}

function toggleMusic() {
  musicEnabled = !musicEnabled;
  musicToggle.textContent = musicEnabled ? "Pause Birthday Music" : "Toggle Birthday Music";

  if (musicEnabled) {
    playBirthdayLoop();
    musicInterval = window.setInterval(playBirthdayLoop, 6500);
    burstConfetti(25);
  } else {
    window.clearInterval(musicInterval);
  }
}

function activateChaosMode() {
  document.body.classList.add("chaos-mode");
  burstConfetti(120);

  ["67", "fahh", "vine-boom", "bruh"].forEach((sound, index) => {
    window.setTimeout(() => playSoundboard(sound), index * 160);
  });

  const colors = [
    "linear-gradient(135deg, #16001f, #32053f)",
    "linear-gradient(135deg, #390019, #6a00f4)",
    "linear-gradient(135deg, #4d002a, #b8860b)"
  ];

  let cycle = 0;
  const flash = window.setInterval(() => {
    document.body.style.background = colors[cycle % colors.length];
    cycle += 1;
    if (cycle > 7) {
      window.clearInterval(flash);
      document.body.style.background =
        "radial-gradient(circle at top, rgba(255, 215, 107, 0.18), transparent 28%), radial-gradient(circle at 20% 20%, rgba(255, 79, 179, 0.2), transparent 24%), linear-gradient(135deg, #16001f, #32053f)";
    }
  }, 220);

  window.setTimeout(() => {
    document.body.classList.remove("chaos-mode");
  }, 1700);
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  { threshold: 0.18 }
);

revealItems.forEach((item) => observer.observe(item));

quoteButton.addEventListener("click", () => {
  generateQuote();
  playTone(700, 0.12, "square", 0.08);
});

heroConfetti.addEventListener("click", () => burstConfetti(80));
chaosButton.addEventListener("click", activateChaosMode);
musicToggle.addEventListener("click", toggleMusic);

soundButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const { sound } = button.dataset;
    playSoundboard(sound);
    burstConfetti(18);
    button.classList.remove("is-playing");
    void button.offsetWidth;
    button.classList.add("is-playing");
  });
});

window.addEventListener("load", () => {
  setTimeout(() => burstConfetti(60), 300);
});
