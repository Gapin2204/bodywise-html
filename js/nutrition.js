const foodDialog = document.createElement("dialog");
document.title = "BODYWISE — Nutrisi";
foodDialog.className = "nutrition-dialog";
foodDialog.innerHTML = `
  <form id="foodForm">
    <h2>Tambah makanan</h2>
    <p>Catat makanan untuk memperbarui ringkasan nutrisimu.</p>
    <label>Nama makanan<input name="name" type="text" maxlength="70" placeholder="Contoh: Salad ayam" required></label>
    <label>Waktu makan<select name="meal"><option>Sarapan</option><option>Makan siang</option><option>Camilan</option><option>Makan malam</option></select></label>
    <label>Kalori (kkal)<input name="calories" type="number" min="1" max="3000" placeholder="350" required></label>
    <div class="dialog-actions"><button class="outline-btn" type="button" data-close>Batalkan</button><button class="btn" type="submit">Simpan</button></div>
  </form>`;
document.body.append(foodDialog);

const foodForm = foodDialog.querySelector("#foodForm");
const foodLog = document.querySelector(".food-log").parentElement;
const calorieValue = document.querySelector(".app-grid-3 .metric strong");
const today = new Date();
const todayKey = [today.getFullYear(), String(today.getMonth() + 1).padStart(2, "0"), String(today.getDate()).padStart(2, "0")].join("-");
let allMeals = [];
try {
  const storedMeals = JSON.parse(localStorage.getItem("bodywiseMeals") || "[]");
  if (Array.isArray(storedMeals)) allMeals = storedMeals;
} catch {
  allMeals = [];
}
const savedMeals = allMeals.filter(meal => meal.date === todayKey);

document.querySelector(".page-header .eyebrow").textContent = "NUTRISI";
document.querySelector(".page-header h1").textContent = "Nutrisi seimbang.";
document.querySelector(".page-header p").textContent = "Catat makanan dan pahami kebutuhan harianmu.";
document.querySelector(".page-header .btn").innerHTML = "+ Tambah makanan";
document.querySelectorAll(".app-grid-3 .metric-label").forEach((label, index) => {
  label.textContent = ["KALORI", "PROTEIN", "AIR"][index];
});
document.querySelector(".app-grid-3 .metric:nth-child(2) strong").textContent = "— g";
document.querySelector(".app-grid-3 .metric:nth-child(2) > small:last-child").textContent = "Belum dicatat";
document.querySelector(".app-grid-3 .metric:nth-child(3) strong").textContent = "— L";
document.querySelector(".app-grid-3 .metric:nth-child(3) > small:last-child").textContent = "Pencatatan air belum tersedia";
const mealSection = document.querySelector(".food-log").parentElement;
mealSection.querySelector(".section-title h2").textContent = "Makan hari ini";
mealSection.querySelector(".section-title p").textContent = new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long" }).format(new Date());
mealSection.querySelectorAll(".food-log").forEach(row => row.remove());
const sectionHeadings = document.querySelectorAll(".app-grid-2 .section-title");
sectionHeadings[1].querySelector("h2").textContent = "Keseimbangan makro";
sectionHeadings[1].querySelector("p").textContent = "Makronutrien belum dicatat.";
document.querySelector(".metric-label");
document.querySelectorAll(".macro-labels span").forEach((label, index) => {
  label.textContent = [`Protein — g`, `Karbohidrat — g`, `Lemak — g`][index];
});
document.querySelector(".metric.yellow-metric .muted").closest(".metric").querySelector(".metric-label").textContent = "TAMBAH CEPAT";
document.querySelector(".metric.yellow-metric .muted").textContent = "Gunakan pilihan makanan untuk mencatat lebih cepat.";
document.querySelector(".metric.yellow-metric .btn").innerHTML = "Telusuri makanan <span>→</span>";

function renderMeal(meal, prepend = false) {
  foodLog.querySelector(".food-empty")?.remove();
  const row = document.createElement("div");
  row.className = "food-log";
  const icon = document.createElement("span");
  icon.className = "food-icon";
  icon.textContent = "◉";
  const description = document.createElement("div");
  const title = document.createElement("b");
  title.textContent = meal.meal;
  const name = document.createElement("small");
  name.textContent = meal.name;
  description.append(title, name);
  const calories = document.createElement("span");
  calories.className = "food-cal";
  calories.textContent = `${meal.calories.toLocaleString("id-ID")} kkal`;
  row.append(icon, description, calories);
  const firstMeal = foodLog.querySelector(".food-log");
  if (prepend && firstMeal) firstMeal.before(row);
  else foodLog.append(row);
}

function updateCalories() {
  const total = savedMeals.reduce((sum, meal) => sum + (Number(meal.calories) || 0), 0);
  calorieValue.innerHTML = `${savedMeals.length ? total.toLocaleString("id-ID") : "—"} <small>/ 2.100 kkal</small>`;
  const remaining = document.querySelector(".app-grid-3 .metric:first-child > small:last-child");
  remaining.textContent = savedMeals.length
    ? `${Math.max(0, 2100 - total).toLocaleString("id-ID")} kkal tersisa · target contoh`
    : "Catat makanan untuk melihat total";
}

savedMeals.forEach((meal) => renderMeal(meal));
if (!savedMeals.length) {
  const emptyState = document.createElement("p");
  emptyState.className = "food-empty";
  emptyState.textContent = "Belum ada makanan yang dicatat hari ini.";
  foodLog.append(emptyState);
}
updateCalories();

document.querySelectorAll(".page-header .btn, .metric .btn").forEach((button) => {
  button.addEventListener("click", () => foodDialog.showModal());
});

foodDialog.querySelector("[data-close]").addEventListener("click", () => foodDialog.close());
foodForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!foodForm.reportValidity()) return;

  const data = new FormData(foodForm);
  const meal = {
    name: String(data.get("name")).trim(),
    meal: data.get("meal"),
    calories: Number(data.get("calories")),
    date: todayKey,
  };
  if (!meal.name || !Number.isFinite(meal.calories)) return;

  allMeals.push(meal);
  savedMeals.push(meal);
  localStorage.setItem("bodywiseMeals", JSON.stringify(allMeals));
  renderMeal(meal, true);
  updateCalories();
  foodForm.reset();
  foodDialog.close();
});