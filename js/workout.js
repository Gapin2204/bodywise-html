const workoutStyle = document.createElement("style");
document.title = "BODYWISE — Latihan";
workoutStyle.textContent =
  ".day-tabs{display:flex;gap:8px;overflow:auto;margin-bottom:15px;padding-bottom:3px}.day-tab{border:1px solid var(--line);background:#fff;border-radius:10px;padding:10px 14px;white-space:nowrap;font-size:11px;font-weight:800;color:var(--muted);cursor:pointer;transition:.2s}.day-tab:hover{border-color:var(--green-2);color:var(--green)}.day-tab.active{background:var(--green);border-color:var(--green);color:#fff}.workout-item{display:flex;align-items:center;gap:12px;padding:14px 0;border-top:1px solid var(--line)}.workout-item>div{flex:1}.workout-item small{display:block;color:var(--muted);font-size:10px}.edit-workout{border:1px solid var(--line);background:#fff;color:var(--green);border-radius:8px;padding:7px 10px;font-size:10px;font-weight:800;cursor:pointer}.edit-workout:hover{background:var(--green-light)}.workout-editor{display:grid;grid-template-columns:1fr 1fr auto;gap:8px;margin-top:16px;padding-top:16px;border-top:1px solid var(--line)}.workout-editor input{min-width:0;border:1px solid var(--line);border-radius:9px;padding:10px;font-size:11px;outline:none}.workout-editor input:focus{border-color:var(--green);box-shadow:0 0 0 3px rgba(36,115,67,.1)}.workout-editor button{border:0;cursor:pointer}.empty-workout{padding:18px 0;color:var(--muted);font-size:12px}.workout-modal{position:fixed;inset:0;background:rgba(18,63,40,.48);display:grid;place-items:center;padding:20px;z-index:30;backdrop-filter:blur(5px)}.workout-modal form{width:min(440px,100%);background:#fff;border-radius:20px;padding:24px;box-shadow:0 24px 70px rgba(18,63,40,.24)}.workout-modal h2{font-size:20px;margin-bottom:4px}.workout-modal p{font-size:11px;color:var(--muted);margin-bottom:18px}.workout-modal label{display:block;font-size:11px;font-weight:800;margin-top:12px}.workout-modal input{display:block;width:100%;height:42px;margin-top:6px;border:1px solid var(--line);border-radius:9px;padding:0 10px;outline:none}.workout-modal input:focus{border-color:var(--green);box-shadow:0 0 0 3px rgba(36,115,67,.1)}.workout-modal .modal-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:20px}.workout-modal button{cursor:pointer;border:0}@media(max-width:600px){.workout-editor{grid-template-columns:1fr 1fr}.workout-editor button{grid-column:span 2}.workout-modal .modal-actions{display:grid;grid-template-columns:1fr 1fr}.workout-modal .modal-actions button{width:100%}}";
document.head.appendChild(workoutStyle);
const weekdayLabels = {
  Monday: "Senin",
  Tuesday: "Selasa",
  Wednesday: "Rabu",
  Thursday: "Kamis",
  Friday: "Jumat",
  Saturday: "Sabtu",
  Sunday: "Minggu",
};
document.querySelector(".page-header .eyebrow").textContent = "WORKOUT";
document.querySelector(".page-header h1").textContent = "Bergerak dengan tujuan.";
document.querySelector(".page-header p").textContent = "Atur latihan mingguanmu. Program awal dapat disesuaikan.";
document.querySelector(".page-header .btn").innerHTML = "Tambah gerakan <span>+</span>";
document.querySelector(".section-title .eyebrow").textContent = "RENCANA MINGGUAN";
document.querySelector(".tag.green-tag").textContent = "Dapat diubah";
document.querySelectorAll(".app-grid-3 .metric-label").forEach((label, index) => {
  label.textContent = ["MINGGU INI", "WAKTU AKTIF", "STREAK"][index];
});
document.querySelectorAll(".app-grid-3 .metric > small").forEach((label, index) => {
  label.textContent = ["Sesi latihan selesai", "Total durasi latihan", "Hari beruntun"][index];
});
document.querySelectorAll(".app-grid-3 .metric strong")[1].textContent = "1j 35m";
document.querySelectorAll(".app-grid-3 .metric strong")[2].textContent = "6 hari";
const defaultWorkouts = {
  Monday: [
    { name: "Bodyweight Squat", detail: "3 set × 12 repetisi · Kaki" },
    { name: "Push Up", detail: "3 set × 8 repetisi · Dada & lengan" },
    { name: "Reverse Lunge", detail: "3 set × 10 repetisi · Kaki" },
    { name: "Plank", detail: "3 set × 30 detik · Inti tubuh" },
  ],
  Tuesday: [],
  Wednesday: [{ name: "Jalan kaki", detail: "25 menit · Kardio" }],
  Thursday: [],
  Friday: [{ name: "Latihan seluruh tubuh", detail: "25 menit · Di rumah" }],
  Saturday: [],
  Sunday: [],
};
const savedWorkouts = JSON.parse(
  localStorage.getItem("bodywiseWorkouts") || "null",
);
const workouts = savedWorkouts || defaultWorkouts;
if (!savedWorkouts) localStorage.setItem("bodywiseWorkouts", JSON.stringify(defaultWorkouts));
const workoutMetrics = document.querySelectorAll(".app-grid-3 .metric");
const plannedDays = Object.values(workouts).filter(day => day.length).length;
const plannedMoves = Object.values(workouts).reduce((total, day) => total + day.length, 0);
workoutMetrics[0].querySelector(".metric-label").textContent = "SESI TERJADWAL";
workoutMetrics[0].querySelector("strong").textContent = String(plannedDays);
workoutMetrics[0].querySelector("small").textContent = "Hari dengan rencana latihan";
workoutMetrics[1].querySelector(".metric-label").textContent = "GERAKAN TERJADWAL";
workoutMetrics[1].querySelector("strong").textContent = String(plannedMoves);
workoutMetrics[1].querySelector("small").textContent = "Gerakan dalam rencana mingguan";
workoutMetrics[2].querySelector(".metric-label").textContent = "SESI SELESAI";
workoutMetrics[2].querySelector("strong").textContent = "—";
workoutMetrics[2].querySelector("small").textContent = "Pencatatan sesi selesai belum tersedia";
let selectedDay = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
][new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
const workoutList = document.querySelector(".workout-list");
const title = document.querySelector(".section-title h2");
const subtitle = document.querySelector(".section-title p");
function renderWorkout() {
  document
    .querySelectorAll(".day-tab")
    .forEach((tab) =>
      tab.classList.toggle("active", tab.dataset.day === selectedDay),
    );
  title.textContent = workouts[selectedDay].length
    ? `Latihan ${weekdayLabels[selectedDay]}`
    : `Hari istirahat · ${weekdayLabels[selectedDay]}`;
  subtitle.textContent = workouts[selectedDay].length
    ? `${workouts[selectedDay].length} gerakan · Ubah rencanamu kapan saja`
    : "Tambahkan gerakan untuk menyusun rencana latihan";
  workoutList.replaceChildren();
  if (workouts[selectedDay].length) {
    workouts[selectedDay].forEach((item, index) => {
      const row = document.createElement("div");
      row.className = "workout-item";
      const number = document.createElement("span");
      number.className = "workout-icon";
      number.textContent = String(index + 1);
      const details = document.createElement("div");
      const name = document.createElement("b");
      name.textContent = item.name;
      const description = document.createElement("small");
      description.textContent = item.detail;
      details.append(name, description);
      const editButton = document.createElement("button");
      editButton.className = "edit-workout";
      editButton.type = "button";
      editButton.dataset.index = String(index);
      editButton.textContent = "Ubah";
      row.append(number, details, editButton);
      workoutList.append(row);
    });
  } else {
    const emptyState = document.createElement("div");
    emptyState.className = "empty-workout";
    emptyState.textContent = "Belum ada gerakan untuk hari ini.";
    workoutList.append(emptyState);
  }
  document.querySelector(".workout-editor").reset();
}
function save() {
  localStorage.setItem("bodywiseWorkouts", JSON.stringify(workouts));
  renderWorkout();
}
const days = Object.keys(workouts);
const tabs = document.createElement("div");
tabs.className = "day-tabs";
tabs.innerHTML = days
  .map(
    (day) =>
    `<button class="day-tab" data-day="${day}">${weekdayLabels[day].slice(0, 3)}</button>`,
  )
  .join("");
document.querySelector(".section-card").prepend(tabs);
const editor = document.createElement("form");
editor.className = "workout-editor";
editor.innerHTML = `<input name="name" placeholder="Nama gerakan" required><input name="detail" placeholder="Set, repetisi, kelompok otot" required><button class="btn btn-small" type="submit">Tambah</button>`;
document.querySelector(".section-card").append(editor);
tabs.addEventListener("click", (event) => {
  if (event.target.matches(".day-tab")) {
    selectedDay = event.target.dataset.day;
    renderWorkout();
  }
});
editor.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(editor);
  workouts[selectedDay].push({
    name: data.get("name"),
    detail: data.get("detail"),
  });
  save();
});
workoutList.addEventListener("click", (event) => {
  const button = event.target.closest(".edit-workout");
  if (!button) return;
  const item = workouts[selectedDay][Number(button.dataset.index)];
  const panel = document.createElement("div");
  panel.className = "workout-modal";
  const form = document.createElement("form");
  const heading = document.createElement("h2");
  heading.textContent = "Edit gerakan";
  const description = document.createElement("p");
  description.textContent = `Sesuaikan latihan untuk rencana hari ${weekdayLabels[selectedDay]}.`;
  const nameLabel = document.createElement("label");
  nameLabel.append("Nama gerakan");
  const nameInput = document.createElement("input");
  nameInput.name = "name";
  nameInput.value = item.name;
  nameInput.required = true;
  nameLabel.append(nameInput);
  const detailLabel = document.createElement("label");
  detailLabel.append("Set, repetisi, dan kelompok otot");
  const detailInput = document.createElement("input");
  detailInput.name = "detail";
  detailInput.value = item.detail;
  detailInput.required = true;
  detailLabel.append(detailInput);
  const actions = document.createElement("div");
  actions.className = "modal-actions";
  const cancelButton = document.createElement("button");
  cancelButton.className = "outline-btn";
  cancelButton.type = "button";
  cancelButton.textContent = "Batal";
  const saveButton = document.createElement("button");
  saveButton.className = "btn";
  saveButton.type = "submit";
  saveButton.textContent = "Simpan perubahan";
  actions.append(cancelButton, saveButton);
  form.append(heading, description, nameLabel, detailLabel, actions);
  panel.append(form);
  form.addEventListener("submit", (formEvent) => {
    formEvent.preventDefault();
    const data = new FormData(formEvent.currentTarget);
    item.name = data.get("name");
    item.detail = data.get("detail");
    panel.remove();
    save();
  });
  cancelButton.addEventListener("click", () => panel.remove());
  panel.addEventListener("click", (clickEvent) => {
    if (clickEvent.target === panel) panel.remove();
  });
  document.body.appendChild(panel);
  nameInput.focus();
});
renderWorkout();
