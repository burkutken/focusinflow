
const authContainer = document.getElementById("auth-container");
const planner = document.getElementById("planner");
const userEmailSpan = document.getElementById("user-email");
const taskList = document.getElementById("task-list");
const taskInput = document.getElementById("task-input");
const importanceSelect = document.getElementById("importance");

let timerInterval = null;
let timeRemaining = 0;
let isWorkPhase = true;

const bip = new Audio ("https://www.soundjay.com/buttons/sounds/beep-07a.mp3");

if (Notification.permission === "granted") {
  new Notification(isWorkPhase ? "Work Time Started!" : "Break Time Started!");
}

window.addEventListener("load", () => {
  if ("Notification" in window && Notification.permission !== "granted") {
    Notification.requestPermission();
  }
});


// Firebase Auth
auth.onAuthStateChanged((user) => {
  if (user) {
    authContainer.style.display = "none";
    planner.style.display = "block";
    userEmailSpan.textContent = user.email;
    loadTasks();
  } else {
    authContainer.style.display = "block";
    planner.style.display = "none";
  }
});

function signup() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  auth.createUserWithEmailAndPassword(email, password).catch(alert);
}

function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  auth.signInWithEmailAndPassword(email, password).catch(alert);
}

function logout() {
  firebase.auth().signOut().then(() => {
  window.location.href = "login.html";
  });
}

// Task Handling
function addTask() {
  const taskInput = document.getElementById("task-input");
  const importance = document.getElementById("importance").value;
  const taskText = taskInput.value.trim();

  if (!taskText) return;

  const task = {
    id: Date.now(),
    text: taskText,
    importance: importance
  };

  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks.push(task);
  localStorage.setItem("tasks", JSON.stringify(tasks));

  taskInput.value = "";
  renderTasks();
}

function deleteTask(id) {
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks = tasks.filter(task => task.id !== id);
  localStorage.setItem("tasks", JSON.stringify(tasks));
  renderTasks();
}

function renderTasks() {
  const taskList = document.getElementById("task-list");
  taskList.innerHTML = "";

  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];

  tasks.forEach(task => {
    const li = document.createElement("li");
    li.classList.add("task-item", task.importance);

    const span = document.createElement("span");
    span.textContent = task.text;

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "🗑️";
    deleteBtn.classList.add("delete-btn");
    deleteBtn.onclick = () => deleteTask(task.id);

    li.appendChild(span);
    li.appendChild(deleteBtn);
    taskList.appendChild(li);
  });
}

function saveTasks() {
  const items = [];
  document.querySelectorAll("#task-list li").forEach((li) => {
    items.push({ text: li.textContent, importance: li.className });
  });
  localStorage.setItem("tasks", JSON.stringify(items));
  localStorage.setItem("lastSaved", Date.now());
}

function loadTasks() {
  const lastSaved = parseInt(localStorage.getItem("lastSaved") || 0);
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;

  if (now - lastSaved > oneDay) {
    localStorage.removeItem("tasks");
    return;
  }

  const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
  taskList.innerHTML = "";
  for (const task of tasks) {
    const li = document.createElement("li");
    li.className = task.importance;
    li.textContent = task.text;
    taskList.appendChild(li);
  }
}

// Pomodoro
function startPomodoro() {
  const workTime = parseInt(document.getElementById("work-time").value) * 60;
  const restTime = parseInt(document.getElementById("rest-time").value) * 60;

  const duration = isWorkPhase ? workTime : restTime;
  const endTime = Date.now() + duration * 1000;

  bip.play();

  if (Notification.permission === "granted") {
    new Notification(isWorkPhase ? "Work Time Started!" : "Break Time Started!");
  }

  function tick() {
    const now = Date.now();
    const timeLeft = Math.max(0, Math.floor((endTime - now) / 1000));
    timeRemaining = timeLeft;
    updateTimerDisplay();

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      isWorkPhase = !isWorkPhase;
      if (!isWorkPhase) incrementPomodoroCount();
      startPomodoro(); // start the next phase
    }
  }

  tick(); // immediately update once
  clearInterval(timerInterval);
  timerInterval = setInterval(tick, 1000);
}


window.addEventListener("load", () => {
  if ("Notification" in window && Notification.permission !== "granted") {
    Notification.requestPermission();
  }
});


function stopPomodoro() {
  clearInterval(timerInterval);
  timerInterval = null;
  document.getElementById("timer-display").textContent = "Timer Stopped";
}

function updateTimerDisplay() {
  const min = Math.floor(timeRemaining / 60);
  const sec = timeRemaining % 60;
  const label = isWorkPhase ? "Work" : "Rest";
  document.getElementById("timer-display").textContent =
    `${label}: ${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}


function toggleTheme() {
  document.body.classList.toggle("dark");
  localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
}

// Restore theme on load
window.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") document.body.classList.add("dark");
});

function incrementPomodoroCount() {
  const today = new Date().toISOString().slice(0, 10);
  const stats = JSON.parse(localStorage.getItem("pomodoroStats") || "{}");
  if (!stats[today]) stats[today] = 0;
  stats[today]++;

  localStorage.setItem("pomodoroStats", JSON.stringify(stats));
  updatePomodoroUI();
}

function updatePomodoroUI() {
  const stats = JSON.parse(localStorage.getItem("pomodoroStats") || "{}");
  const today = new Date().toISOString().split("T")[0];

  const now = Date.now();
  const last7 = Object.entries(stats)
    .filter(([date]) => new Date(date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
  const weeklyTotal = last7.reduce((sum, [, count]) => sum + count, 0);
  const dailyTotal = stats[today] || 0;

  document.getElementById("weekly-count").textContent = weeklyTotal;
  document.getElementById("daily-count").textContent = dailyTotal;
}
