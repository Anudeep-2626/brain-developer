const quizData = [
  {
    question: "What does CSS stand for?",
    options: [
      "Computer Style Sheets",
      "Cascading Style Sheets",
      "Creative Style System",
      "Colorful Style Sheets"
    ],
    correct: 1
  },
  {
    question: "Which JavaScript method is used to select an element by its ID?",
    options: [
      "document.querySelectorAll()",
      "document.getElementById()",
      "document.getElementsByClassName()",
      "document.createElement()"
    ],
    correct: 1
  },
  {
    question: "What is the result of typeof [] in JavaScript?",
    options: [
      "array",
      "list",
      "object",
      "undefined"
    ],
    correct: 2
  },
  {
    question: "Which CSS property controls the space inside an element's border?",
    options: [
      "margin",
      "padding",
      "gap",
      "outline"
    ],
    correct: 1
  },
  {
    question: "Which HTTP status code means 'Not Found'?",
    options: [
      "200",
      "301",
      "404",
      "500"
    ],
    correct: 2
  },
  {
    question: "Which array method creates a new array by transforming each item?",
    options: [
      "map()",
      "filter()",
      "reduce()",
      "forEach()"
    ],
    correct: 0
  },
  {
    question: "Which HTML attribute connects a label to an input?",
    options: [
      "name",
      "for",
      "target",
      "rel"
    ],
    correct: 1
  },
  {
    question: "What does JSON stand for?",
    options: [
      "JavaScript Object Notation",
      "Java Source Open Network",
      "Joined Syntax Object Nodes",
      "JavaScript Ordered Numbers"
    ],
    correct: 0
  },
  {
    question: "Which keyword declares a block-scoped variable in JavaScript?",
    options: [
      "var",
      "let",
      "static",
      "global"
    ],
    correct: 1
  },
  {
    question: "Which CSS layout system is best for two-dimensional rows and columns?",
    options: [
      "Float",
      "Grid",
      "Inline",
      "Position fixed"
    ],
    correct: 1
  }
];

const QUESTION_TIME = 15;
const LEADERBOARD_KEY = "advancedQuizLeaderboard";

const screens = {
  start: document.getElementById("startScreen"),
  quiz: document.getElementById("quizScreen"),
  result: document.getElementById("resultScreen")
};

const startForm = document.getElementById("startForm");
const playerNameInput = document.getElementById("playerName");
const activePlayer = document.getElementById("activePlayer");
const progressText = document.getElementById("progressText");
const progressFill = document.getElementById("progressFill");
const questionText = document.getElementById("questionText");
const timerText = document.getElementById("timerText");
const timerCard = document.querySelector(".timer-card");
const scoreText = document.getElementById("scoreText");
const optionsGrid = document.getElementById("optionsGrid");
const resultName = document.getElementById("resultName");
const finalScore = document.getElementById("finalScore");
const correctCount = document.getElementById("correctCount");
const playAgainBtn = document.getElementById("playAgainBtn");
const leaderboardList = document.getElementById("leaderboardList");
const clearLeaderboardBtn = document.getElementById("clearLeaderboardBtn");

let playerName = "";
let currentQuestionIndex = 0;
let score = 0;
let correctAnswers = 0;
let timeLeft = QUESTION_TIME;
let timerId = null;
let acceptingAnswer = false;

function showScreen(screenName) {
  Object.values(screens).forEach((screen) => screen.classList.remove("active"));
  screens[screenName].classList.add("active");
}

function startQuiz(name) {
  playerName = name.trim() || "Player";
  currentQuestionIndex = 0;
  score = 0;
  correctAnswers = 0;
  activePlayer.textContent = playerName;
  scoreText.textContent = score;
  showScreen("quiz");
  loadQuestion();
}

function loadQuestion() {
  clearInterval(timerId);
  acceptingAnswer = true;
  timeLeft = QUESTION_TIME;

  const question = quizData[currentQuestionIndex];
  progressText.textContent = `Question ${currentQuestionIndex + 1} / ${quizData.length}`;
  progressFill.style.width = `${((currentQuestionIndex + 1) / quizData.length) * 100}%`;
  questionText.textContent = question.question;
  timerText.textContent = timeLeft;
  timerCard.classList.remove("warning");

  optionsGrid.innerHTML = "";
  question.options.forEach((option, index) => {
    const button = document.createElement("button");
    const letter = document.createElement("span");
    const text = document.createElement("span");

    button.type = "button";
    button.className = `option-button option-${index + 1}`;
    letter.className = "option-letter";
    letter.textContent = String.fromCharCode(65 + index);
    text.textContent = option;
    button.append(letter, text);
    button.addEventListener("click", () => selectAnswer(index));
    optionsGrid.appendChild(button);
  });

  timerId = setInterval(updateTimer, 1000);
}

function updateTimer() {
  timeLeft -= 1;
  timerText.textContent = timeLeft;
  timerCard.classList.toggle("warning", timeLeft <= 5);

  if (timeLeft <= 0) {
    clearInterval(timerId);
    handleAnswer(null);
  }
}

function selectAnswer(selectedIndex) {
  if (!acceptingAnswer) {
    return;
  }

  clearInterval(timerId);
  handleAnswer(selectedIndex);
}

function handleAnswer(selectedIndex) {
  acceptingAnswer = false;
  const question = quizData[currentQuestionIndex];
  const buttons = Array.from(optionsGrid.children);
  const isCorrect = selectedIndex === question.correct;

  if (isCorrect) {
    score += 1;
    correctAnswers += 1;
    scoreText.textContent = score;
  }

  buttons.forEach((button, index) => {
    button.disabled = true;
    if (index === question.correct) {
      button.classList.add("correct");
    }
    if (index === selectedIndex && !isCorrect) {
      button.classList.add("wrong");
    }
  });

  setTimeout(moveToNextQuestion, 850);
}

function moveToNextQuestion() {
  currentQuestionIndex += 1;

  if (currentQuestionIndex < quizData.length) {
    loadQuestion();
    return;
  }

  finishQuiz();
}

function finishQuiz() {
  clearInterval(timerId);
  resultName.textContent = playerName;
  finalScore.textContent = `${score} / ${quizData.length}`;
  correctCount.textContent = correctAnswers;
  saveScore();
  renderLeaderboard();
  showScreen("result");
}

function getLeaderboard() {
  const savedScores = localStorage.getItem(LEADERBOARD_KEY);

  if (!savedScores) {
    return [];
  }

  try {
    return JSON.parse(savedScores);
  } catch {
    return [];
  }
}

function saveScore() {
  const leaderboard = getLeaderboard();
  leaderboard.push({
    name: playerName,
    score,
    date: new Date().toISOString()
  });

  const topScores = leaderboard
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(topScores));
}

function renderLeaderboard() {
  const leaderboard = getLeaderboard()
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  leaderboardList.innerHTML = "";

  if (leaderboard.length === 0) {
    const emptyState = document.createElement("li");
    emptyState.className = "empty-state";
    emptyState.textContent = "No scores yet.";
    leaderboardList.appendChild(emptyState);
    return;
  }

  leaderboard.forEach((entry) => {
    const item = document.createElement("li");
    const row = document.createElement("div");
    const name = document.createElement("span");
    const scoreValue = document.createElement("span");

    row.className = "leaderboard-row";
    name.textContent = entry.name;
    scoreValue.textContent = entry.score;
    row.append(name, scoreValue);
    item.appendChild(row);
    leaderboardList.appendChild(item);
  });
}

startForm.addEventListener("submit", (event) => {
  event.preventDefault();
  startQuiz(playerNameInput.value);
});

playAgainBtn.addEventListener("click", () => {
  playerNameInput.value = playerName;
  showScreen("start");
  playerNameInput.focus();
});

clearLeaderboardBtn.addEventListener("click", () => {
  localStorage.removeItem(LEADERBOARD_KEY);
  renderLeaderboard();
});

renderLeaderboard();
