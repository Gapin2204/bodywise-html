const assessmentStyle = document.createElement("style");
document.title = "BODYWISE — Asesmen";
assessmentStyle.textContent =
  ".edit-panel{position:fixed;inset:0;background:rgba(18,63,40,.48);display:grid;place-items:center;padding:20px;z-index:30;backdrop-filter:blur(5px)}.edit-panel form{width:min(500px,100%);background:#fff;border-radius:22px;padding:28px;box-shadow:0 24px 70px rgba(18,63,40,.24)}.edit-panel .modal-head{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:22px}.edit-panel h2{font-size:22px;letter-spacing:-.5px}.edit-panel .modal-head p{font-size:11px;color:var(--muted);margin-top:4px}.edit-panel .close-modal{border:0;background:var(--green-light);color:var(--green);width:32px;height:32px;border-radius:10px;cursor:pointer;font-size:18px}.edit-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.edit-panel label{font-size:11px;font-weight:800}.edit-panel input,.edit-panel select{display:block;width:100%;height:44px;margin-top:6px;border:1px solid var(--line);border-radius:10px;padding:0 11px;background:#fbfdfb;outline:none}.edit-panel input:focus,.edit-panel select:focus{border-color:var(--green);box-shadow:0 0 0 3px rgba(36,115,67,.1)}.edit-panel .form-actions{display:flex;justify-content:flex-end;gap:9px;margin-top:24px}.edit-panel .outline-btn{cursor:pointer}.assessment-main .btn{border:0;cursor:pointer}@media(max-width:500px){.edit-grid{grid-template-columns:1fr}.edit-panel form{padding:22px}.edit-panel .form-actions{display:grid;grid-template-columns:1fr 1fr}.edit-panel .form-actions button{width:100%}}";
document.head.appendChild(assessmentStyle);

const assessmentDefaults = {
  age: 21,
  gender: "Pria",
  height: 175,
  weight: 76,
  activity: 1.55,
  activityLabel: "Cukup aktif",
  goal: "lose",
};
const storedAssessment = JSON.parse(
  localStorage.getItem("bodywiseAssessment") || "null",
);
const assessment = { ...assessmentDefaults, ...(storedAssessment || {}) };
assessment.gender = assessment.gender === "Female" ? "Wanita" : assessment.gender === "Male" ? "Pria" : assessment.gender;
assessment.activityLabel = {
  Sedentary: "Minim bergerak",
  "Lightly active": "Sedikit aktif",
  "Moderately active": "Cukup aktif",
  "Very active": "Sangat aktif",
}[assessment.activityLabel] || assessment.activityLabel;
document.querySelector(".page-header .eyebrow").textContent = "BODY ASSESSMENT";
document.querySelector(".page-header h1").textContent = "Kenali kondisi tubuhmu.";
document.querySelector(".page-header p").textContent = "Lihat metrik tubuh dan estimasi kebutuhan energimu.";
document.querySelector(".page-header .btn").innerHTML = "Perbarui asesmen <span>→</span>";
document.querySelector(".assessment-main .eyebrow").textContent = "PROFIL SAAT INI";
document.querySelector(".assessment-main h2").textContent = "Pahami titik awal sebelum menentukan tujuan.";
document.querySelector(".assessment-hero .section-title h2").textContent = "Informasi tubuh";
document.querySelector(".assessment-hero .section-title p").textContent = "Asesmen terakhir";
document.querySelectorAll(".goal-option").forEach((option, index) => {
  const labels = [
    ["Turunkan berat badan", "Turunkan berat secara bertahap dan sehat."],
    ["Pertahankan berat", "Jaga kondisi tubuh tetap stabil."],
    ["Tingkatkan massa", "Bangun massa otot dan kekuatan tubuh."],
  ][index];
  option.querySelector("b").textContent = labels[0];
  option.querySelector("small").textContent = labels[1];
});
const sectionHeadings = document.querySelectorAll(".app-grid-3 .section-title h2");
sectionHeadings[0].textContent = "Kebutuhan energi";
sectionHeadings[1].textContent = "Status BMI";
sectionHeadings[2].textContent = "Langkah berikutnya";
document.querySelector(".app-grid-3 .muted").textContent = "Gunakan asesmen ini sebagai titik awal untuk mengatur nutrisi dan program latihanmu.";
document.querySelector(".app-grid-3 .btn").innerHTML = "Buka program nutrisi <span>→</span>";
const number = (value) => Number(value).toLocaleString("id-ID");
const bmiStatus = (bmi) =>
  bmi < 18.5 ? "Berat kurang" : bmi < 25 ? "Normal" : bmi < 30 ? "Berat berlebih" : "Obesitas";

function calculateAssessment() {
  const bmi = assessment.weight / (assessment.height / 100) ** 2;
  const bmr =
    assessment.gender === "Wanita"
      ? 10 * assessment.weight +
        6.25 * assessment.height -
        5 * assessment.age -
        161
      : 10 * assessment.weight +
        6.25 * assessment.height -
        5 * assessment.age +
        5;
  const tdee = bmr * assessment.activity;
  const goalEstimate =
    assessment.goal === "lose"
      ? tdee - 500
      : assessment.goal === "gain"
        ? tdee + 300
        : tdee;
  document.querySelector(".assessment-stats").innerHTML =
    `<div><b>${bmi.toFixed(1)}</b><small>BMI · ${bmiStatus(bmi)}</small></div><div><b>${number(Math.round(bmr))}</b><small>BMR · kkal/hari</small></div><div><b>${number(Math.round(tdee))}</b><small>TDEE · kkal/hari</small></div>`;
  document.querySelector(".info-list").innerHTML =
    `<div class="info-row"><span>Usia</span><b>${assessment.age} tahun</b></div><div class="info-row"><span>Jenis kelamin</span><b>${assessment.gender}</b></div><div class="info-row"><span>Tinggi badan</span><b>${assessment.height} cm</b></div><div class="info-row"><span>Berat badan</span><b>${assessment.weight} kg</b></div><div class="info-row"><span>Aktivitas</span><b>${assessment.activityLabel}</b></div>`;
  const energy = document.querySelector(".app-grid-3 .section-card .info-list");
  energy.innerHTML = `<div class="info-row"><span>BMR</span><b>${number(Math.round(bmr))} kkal</b></div><div class="info-row"><span>TDEE</span><b>${number(Math.round(tdee))} kkal</b></div><div class="info-row"><span>Estimasi tujuan</span><b>${number(Math.round(goalEstimate))} kkal</b></div>`;
  const score = document.querySelector(".score strong");
  const scoreLabel = document.querySelector(".score small");
  score.textContent = bmi.toFixed(1);
  scoreLabel.textContent = bmiStatus(bmi);
  document
    .querySelectorAll(".goal-option")
    .forEach((option) =>
      option.classList.toggle(
        "active",
        option.dataset.goal === assessment.goal,
      ),
    );
}

function openEditor() {
  const panel = document.createElement("div");
  panel.className = "edit-panel";
  panel.innerHTML = `<form><div class="modal-head"><div><h2>Perbarui asesmen</h2><p>Jaga data profil tetap akurat untuk rekomendasi yang lebih sesuai.</p></div><button type="button" class="close-modal" aria-label="Tutup">×</button></div><div class="edit-grid"><label>Usia<input name="age" type="number" min="13" max="100" value="${assessment.age}" required></label><label>Jenis kelamin<select name="gender"><option ${assessment.gender === "Pria" ? "selected" : ""}>Pria</option><option ${assessment.gender === "Wanita" ? "selected" : ""}>Wanita</option></select></label><label>Tinggi badan (cm)<input name="height" type="number" min="100" max="250" value="${assessment.height}" required></label><label>Berat badan (kg)<input name="weight" type="number" min="30" max="300" value="${assessment.weight}" required></label><label>Tingkat aktivitas<select name="activity"><option value="1.2">Minim bergerak</option><option value="1.375">Sedikit aktif</option><option value="1.55">Cukup aktif</option><option value="1.725">Sangat aktif</option></select></label></div><div class="form-actions"><button type="button" class="outline-btn">Batal</button><button class="btn" type="submit">Simpan asesmen</button></div></form>`;
  panel.querySelector('[name="activity"]').value = assessment.activity;
  panel.querySelector("form").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    assessment.age = Number(data.get("age"));
    assessment.gender = data.get("gender");
    assessment.height = Number(data.get("height"));
    assessment.weight = Number(data.get("weight"));
    assessment.activity = Number(data.get("activity"));
    assessment.activityLabel = {
      1.2: "Minim bergerak",
      1.375: "Sedikit aktif",
      1.55: "Cukup aktif",
      1.725: "Sangat aktif",
    }[assessment.activity];
    localStorage.setItem("bodywiseAssessment", JSON.stringify(assessment));
    panel.remove();
    calculateAssessment();
  });
  panel
    .querySelector(".outline-btn")
    .addEventListener("click", () => panel.remove());
  panel
    .querySelector(".close-modal")
    .addEventListener("click", () => panel.remove());
  panel.addEventListener("click", (event) => {
    if (event.target === panel) panel.remove();
  });
  document.body.appendChild(panel);
}

document
  .querySelector(".page-header .btn")
  .addEventListener("click", openEditor);
calculateAssessment();

const goalOptions = document.querySelector(".goal-options");
if (goalOptions) {
  goalOptions.closest(".section-card").querySelector(".section-title h2").textContent = "Tujuanmu";
  goalOptions.closest(".section-card").querySelector(".section-title p").textContent = "Pilih arah perjalananmu";
  goalOptions.querySelectorAll(".goal-option").forEach((option) => {
    option.addEventListener("click", () => {
      assessment.goal = option.dataset.goal;
      localStorage.setItem("bodywiseAssessment", JSON.stringify(assessment));
      calculateAssessment();
    });
  });
  const goalLink = document.createElement("a");
  goalLink.className = "btn";
  goalLink.href = "goal.html";
  goalLink.textContent = "Lanjut atur tujuan →";
  goalOptions.after(goalLink);
}
