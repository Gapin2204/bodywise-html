document.querySelectorAll(".habit input").forEach(input => {
  input.addEventListener("change", () => {
    const habit = input.closest(".habit");
    const icon = habit.querySelector("i");
    habit.classList.toggle("done", input.checked);
    icon.textContent = input.checked ? "✓" : "○";
    updateHabitSummary();
  });
});

const habitInputs = [...document.querySelectorAll(".habit input")];
const localDate = new Date();
const habitStorageKey = `bodywiseHabits:${localDate.getFullYear()}-${String(localDate.getMonth() + 1).padStart(2, "0")}-${String(localDate.getDate()).padStart(2, "0")}`;

try {
  const savedHabits = JSON.parse(localStorage.getItem(habitStorageKey) || "null");
  if (Array.isArray(savedHabits) && savedHabits.length === habitInputs.length) {
    habitInputs.forEach((input, index) => {
      input.checked = Boolean(savedHabits[index]);
      input.closest(".habit").classList.toggle("done", input.checked);
      input.closest(".habit").querySelector("i").textContent = input.checked ? "✓" : "○";
    });
  } else {
    habitInputs.forEach(input => {
      input.checked = false;
      input.closest(".habit").classList.remove("done");
      input.closest(".habit").querySelector("i").textContent = "○";
    });
  }
} catch {
  habitInputs.forEach(input => { input.checked = false; });
}

function updateHabitSummary() {
  const completed = habitInputs.filter(input => input.checked).length;
  const percentage = habitInputs.length ? Math.round((completed / habitInputs.length) * 100) : 0;
  const badge = habitInputs[0]?.closest(".dashboard-card")?.querySelector(".green-tag");
  const progress = document.querySelector(".circle-progress");

  if (badge) badge.textContent = `${completed}/${habitInputs.length}`;
  if (progress) {
    progress.querySelector("strong").textContent = `${percentage}%`;
    progress.setAttribute("aria-label", `Progres harian ${percentage} persen`);
  }

  try {
    localStorage.setItem(habitStorageKey, JSON.stringify(habitInputs.map(input => input.checked)));
  } catch {
    if (badge) badge.title = "Perubahan ini tidak dapat disimpan di browser";
  }
}

updateHabitSummary();

const dateLabel = document.querySelector("#dashboardDate");
dateLabel.textContent = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "long",
}).format(new Date()).toLocaleUpperCase("id-ID");

const greeting = document.querySelector("#dashboardGreeting");
const hour = new Date().getHours();
const salutation = hour < 11 ? "Selamat pagi" : hour < 15 ? "Selamat siang" : hour < 18 ? "Selamat sore" : "Selamat malam";
const user = localStorage.getItem("bodywiseUser");
let profileName = "";
try {
  const profile = JSON.parse(localStorage.getItem("bodywiseProfile") || "null") || {};
  const settings = JSON.parse(localStorage.getItem("bodywiseSettings") || "null") || {};
  const profileMatchesUser = !user || profile.email?.toLowerCase() === user.toLowerCase();
  profileName = settings.name || (profileMatchesUser ? profile.name : "") || "";
} catch {
  profileName = "";
}
const userName = profileName || (user && !["undefined", "null"].includes(user.toLowerCase()) ? user.split("@")[0] : "");
const formattedName = userName ? userName.charAt(0).toUpperCase() + userName.slice(1) : "teman";
greeting.textContent = `${salutation}, ${formattedName}!`;

let latestWeight = null;
let weightDescription = "Belum ada catatan";
try {
  const measurements = JSON.parse(localStorage.getItem("bodywiseMeasurements") || "[]");
  if (Array.isArray(measurements) && measurements.length) {
    latestWeight = measurements.sort((a, b) => a.date.localeCompare(b.date)).at(-1)?.weight;
    if (latestWeight) weightDescription = "Pengukuran terakhir";
  }
} catch {
  latestWeight = null;
}
if (!latestWeight) {
  try {
    latestWeight = JSON.parse(localStorage.getItem("bodywiseAssessment") || "null")?.weight || null;
    if (latestWeight) weightDescription = "Dari asesmen terakhir";
  } catch {
    latestWeight = null;
  }
}
const weightCard = document.querySelector(".stats-grid .stat-card");
weightCard.querySelector("strong").textContent = latestWeight ? `${latestWeight} kg` : "— kg";
weightCard.querySelector("small").textContent = weightDescription;

let meals = [];
try {
  const storedMeals = JSON.parse(localStorage.getItem("bodywiseMeals") || "[]");
  if (Array.isArray(storedMeals)) meals = storedMeals;
} catch {
  meals = [];
}
const todayKey = habitStorageKey.slice("bodywiseHabits:".length);
const todaysMeals = meals.filter(meal => meal.date === todayKey);
const calorieTotal = todaysMeals.reduce((total, meal) => total + (Number(meal.calories) || 0), 0);
const calorieCards = [
  document.querySelector(".stats-grid .stat-card:nth-child(2) strong"),
  document.querySelector(".dashboard-card .metric strong"),
];
calorieCards.forEach(value => {
  if (value) value.innerHTML = todaysMeals.length ? `${calorieTotal.toLocaleString("id-ID")} <small>/ 2.100 kkal</small>` : "— <small>/ 2.100 kkal</small>";
});
document.querySelector(".stats-grid .stat-card:nth-child(2) small").textContent = todaysMeals.length ? "Asupan tercatat hari ini" : "Belum ada catatan";
const nutritionMetric = document.querySelector(".dashboard-card .metric");
let calorieNote = nutritionMetric.querySelector(".calorie-note");
if (!calorieNote) {
  calorieNote = document.createElement("small");
  calorieNote.className = "calorie-note";
  nutritionMetric.append(calorieNote);
}
calorieNote.textContent = todaysMeals.length ? "Target contoh 2.100 kkal; sesuaikan dengan asesmen" : "Catat makanan untuk melihat total";
document.querySelectorAll(".macro-labels span").forEach((label, index) => {
  label.textContent = [`Protein — g`, `Karbohidrat — g`, `Lemak — g`][index];
});

const reminderCard = document.querySelector(".dash-grid .dashboard-card:last-child");
let savedReminders = [];
try {
  const storedReminders = JSON.parse(localStorage.getItem("bodywiseReminders") || "[]");
  if (Array.isArray(storedReminders)) savedReminders = storedReminders.filter(reminder => reminder.enabled);
} catch {
  savedReminders = [];
}
reminderCard.querySelectorAll(".reminder").forEach(row => row.remove());
if (savedReminders.length) {
  savedReminders.sort((a, b) => a.time.localeCompare(b.time)).slice(0, 3).forEach(reminder => {
    const row = document.createElement("div");
    row.className = "reminder";
    const icon = document.createElement("span");
    icon.className = "reminder-icon";
    icon.textContent = "◷";
    const details = document.createElement("div");
    const name = document.createElement("b");
    name.textContent = reminder.name;
    const time = document.createElement("small");
    time.textContent = `${reminder.note || "Setiap hari"} · ${reminder.time}`;
    details.append(name, time);
    row.append(icon, details);
    reminderCard.append(row);
  });
} else {
  const emptyReminder = document.createElement("div");
  emptyReminder.className = "reminder";
  const reminderText = document.createElement("div");
  const reminderTitle = document.createElement("b");
  reminderTitle.textContent = "Belum ada pengingat";
  const reminderHint = document.createElement("small");
  reminderHint.textContent = "Tambahkan jadwal yang ingin kamu ingat";
  reminderText.append(reminderTitle, reminderHint);
  emptyReminder.append(reminderText);
  reminderCard.append(emptyReminder);
}

const workoutCard = document.querySelector(".dash-grid .dashboard-card:nth-child(3)");
const exerciseList = workoutCard.querySelector(".exercise-list");
const todayName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][new Date().getDay()];
let todaysWorkout = [];
try {
  const savedWorkouts = JSON.parse(localStorage.getItem("bodywiseWorkouts") || "null");
  if (Array.isArray(savedWorkouts?.[todayName])) todaysWorkout = savedWorkouts[todayName];
} catch {
  todaysWorkout = [];
}
exerciseList.replaceChildren();
workoutCard.querySelector(".tag").textContent = todaysWorkout.length ? "Rencana tersimpan" : "Atur rencana";
if (todaysWorkout.length) {
  todaysWorkout.slice(0, 3).forEach((exercise, index) => {
    const row = document.createElement("div");
    const number = document.createElement("span");
    number.textContent = String(index + 1).padStart(2, "0");
    const name = document.createElement("b");
    name.textContent = exercise.name;
    const detail = document.createElement("small");
    detail.textContent = exercise.detail;
    row.append(number, name, detail);
    exerciseList.append(row);
  });
} else {
  const emptyPlan = document.createElement("div");
  emptyPlan.className = "empty-workout";
  emptyPlan.textContent = "Belum ada rencana latihan untuk hari ini.";
  exerciseList.append(emptyPlan);
}
