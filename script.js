const quoteButton = document.getElementById("quoteButton");
const quoteText = document.getElementById("quoteText");
const chaosButton = document.getElementById("chaosButton");
const heroConfetti = document.getElementById("heroConfetti");
const confettiLayer = document.getElementById("confettiLayer");
const musicToggle = document.getElementById("musicToggle");
const revealItems = document.querySelectorAll(".reveal");
const interactiveItems = document.querySelectorAll(".interactive, .photo-card, .award-card");
const quizProgress = document.getElementById("quizProgress");
const quizQuestion = document.getElementById("quizQuestion");
const quizOptions = document.getElementById("quizOptions");
const cakeReveal = document.getElementById("cakeReveal");
const cakeButton = document.getElementById("cakeButton");

const quotes = [
  '"Anya is proof that being iconic and slightly unhinged can coexist beautifully."',
  '"If fabulous was taxable, Anya would owe the government everything."',
  '"Anya does not chase the vibe. The vibe updates its resume and applies to her."',
  '"Some people age gracefully. Anya ages like a sequel with a bigger budget."',
  '"Every party needs snacks, music, and one Anya for quality control."',
  '"Scientists still cannot explain how one person can be this glam and this chaotic."'
];

const quizQuestions = [
  {
    prompt: "When Anya arrives to the function, what changes first?",
    answers: [
      "The lighting gets better",
      "The group chat gets louder",
      "The room files a glamour report"
    ]
  },
  {
    prompt: "What is Anya's strongest birthday superpower?",
    answers: [
      "Making chaos look premium",
      "Turning side-eyes into art",
      "Causing compliments to form naturally"
    ]
  },
  {
    prompt: "What should you do when Anya says, 'be calm'?",
    answers: [
      "Absolutely do not believe that",
      "Prepare for glitter-related events",
      "Accept your fate and bring cake"
    ]
  }
];

const confettiColors = ["#ff4fb3", "#ffd76b", "#ffffff", "#ff8fd1", "#ff9f1c"];
const memeSoundUrls = [
  "https://www.myinstants.com/media/sounds/bruh.mp3",
  "https://www.myinstants.com/media/sounds/vine-boom-sound-effect_KT89XIq.mp3",
  "https://www.myinstants.com/media/sounds/67_1.mp3",
  "https://www.myinstants.com/media/sounds/fahh-but-louder.mp3"
];

let audioContext;
let musicInterval;
let musicEnabled = false;
let quizIndex = 0;
let activeMemeAudio;

const memeAudios = memeSoundUrls.map((url) => new Audio(url));
memeAudios.forEach((audio) => {
  audio.preload = "auto";
  audio.volume = 0.5;
});

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

function playRandomMemeSound() {
  const selected = memeAudios[Math.floor(Math.random() * memeAudios.length)];

  try {
    if (activeMemeAudio && activeMemeAudio !== selected) {
      activeMemeAudio.pause();
      activeMemeAudio.currentTime = 0;
    }

    selected.currentTime = 0;
    selected.play().catch(() => {
      playTone(660, 0.12, "square", 0.08);
    });
    activeMemeAudio = selected;
  } catch {
    playTone(660, 0.12, "square", 0.08);
  }
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

function renderQuizQuestion() {
  const current = quizQuestions[quizIndex];

  quizProgress.textContent = `Question ${quizIndex + 1} of ${quizQuestions.length}`;
  quizQuestion.textContent = current.prompt;
  quizOptions.innerHTML = "";

  current.answers.forEach((answer, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "quiz-option interactive";
    button.textContent = answer;

    button.addEventListener("click", () => {
      playRandomMemeSound();
      burstConfetti(20 + index * 5);
      button.classList.add("correct");

      window.setTimeout(() => {
        quizIndex += 1;
        if (quizIndex < quizQuestions.length) {
          renderQuizQuestion();
        } else {
          quizProgress.textContent = "Exam complete";
          quizQuestion.textContent = "The council has reviewed your answers and found them delightfully unserious.";
          quizOptions.innerHTML = "";
          cakeReveal.classList.remove("hidden");
          burstConfetti(100);
        }
      }, 550);
    });

    quizOptions.appendChild(button);
  });
}

function activateChaosMode() {
  document.body.classList.add("chaos-mode");
  burstConfetti(120);

  for (let i = 0; i < 5; i += 1) {
    window.setTimeout(playRandomMemeSound, i * 180);
  }

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

function attachAmbientClicks() {
  interactiveItems.forEach((item) => {
    item.addEventListener("click", () => {
      playRandomMemeSound();
    });
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
  { threshold: 0.18 }
);

revealItems.forEach((item) => observer.observe(item));

quoteButton.addEventListener("click", () => {
  generateQuote();
});

heroConfetti.addEventListener("click", () => burstConfetti(80));
chaosButton.addEventListener("click", activateChaosMode);
musicToggle.addEventListener("click", toggleMusic);

if (cakeButton) {
  cakeButton.addEventListener("click", () => {
    burstConfetti(90);
    playRandomMemeSound();
  });
}

attachAmbientClicks();
renderQuizQuestion();

window.addEventListener("load", () => {
  setTimeout(() => burstConfetti(60), 300);
});
