const measurementKey = "bodywiseMeasurements";
document.title = "BODYWISE — Progres";
const progressHeader = document.querySelector(".page-header");
const progressMetrics = document.querySelectorAll(".app-grid-3 .metric");
const chartContainer = document.querySelector(".chart-placeholder");
const measurementDialog = document.createElement("dialog");
measurementDialog.className = "nutrition-dialog";
measurementDialog.innerHTML = `
	<form id="measurementForm">
		<h2>Catat berat badan</h2>
		<p>Catatan ini disimpan di browser perangkat ini.</p>
		<label for="measurementWeight">Berat badan (kg)<input id="measurementWeight" name="weight" type="number" min="30" max="300" step="0.1" required></label>
		<label for="measurementDate">Tanggal<input id="measurementDate" name="date" type="date" required></label>
		<div class="dialog-actions"><button class="outline-btn" type="button" data-close>Batalkan</button><button class="btn" type="submit">Simpan catatan</button></div>
	</form>`;
document.body.append(measurementDialog);

const measurementForm = measurementDialog.querySelector("#measurementForm");
const today = new Date();
measurementForm.elements.date.value = [today.getFullYear(), String(today.getMonth() + 1).padStart(2, "0"), String(today.getDate()).padStart(2, "0")].join("-");

function readMeasurements() {
	try {
		const measurements = JSON.parse(localStorage.getItem(measurementKey) || "[]");
		return Array.isArray(measurements)
			? measurements.filter(item => Number.isFinite(Number(item.weight)) && /^\d{4}-\d{2}-\d{2}$/.test(item.date)).sort((a, b) => a.date.localeCompare(b.date))
			: [];
	} catch {
		return [];
	}
}

function formatDate(date) {
	return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short" }).format(new Date(`${date}T00:00:00`));
}

function readTodayHabits() {
	const dateKey = `bodywiseHabits:${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
	try {
		const habits = JSON.parse(localStorage.getItem(dateKey) || "[]");
		return Array.isArray(habits) ? habits : [];
	} catch {
		return [];
	}
}

function renderChart(measurements) {
	chartContainer.replaceChildren();
	const grid = document.createElement("div");
	grid.className = "chart-grid";
	chartContainer.append(grid);

	if (measurements.length < 2) {
		const empty = document.createElement("p");
		empty.className = "progress-empty-state";
		empty.textContent = "Catat setidaknya dua pengukuran untuk melihat tren berat badan.";
		chartContainer.append(empty);
		return;
	}

	const values = measurements.map(item => Number(item.weight));
	const min = Math.min(...values);
	const max = Math.max(...values);
	const spread = max - min || 1;
	const points = values.map((value, index) => {
		const x = (index / (values.length - 1)) * 420;
		const y = 132 - ((value - min) / spread) * 104;
		return `${x},${y}`;
	}).join(" ");
	const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	svg.setAttribute("viewBox", "0 0 420 150");
	svg.setAttribute("preserveAspectRatio", "none");
	const line = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
	line.setAttribute("points", points);
	line.setAttribute("fill", "none");
	line.setAttribute("stroke", "currentColor");
	line.setAttribute("stroke-width", "4");
	line.setAttribute("stroke-linecap", "round");
	line.setAttribute("stroke-linejoin", "round");
	svg.append(line);
	chartContainer.append(svg);
	const labels = document.createElement("div");
	labels.className = "progress-chart-labels";
	const firstDate = document.createElement("span");
	firstDate.textContent = formatDate(measurements[0].date);
	const lastDate = document.createElement("span");
	lastDate.textContent = formatDate(measurements.at(-1).date);
	labels.append(firstDate, lastDate);
	chartContainer.append(labels);
}

function renderProgress() {
	const measurements = readMeasurements();
	const latest = measurements.at(-1);
	const cutoff = new Date();
	cutoff.setDate(cutoff.getDate() - 30);
	const recent = measurements.filter(item => new Date(`${item.date}T23:59:59`) >= cutoff);
	const weightMetric = progressMetrics[0];
	const trendMetric = progressMetrics[1];

	weightMetric.querySelector("strong").textContent = latest ? `${Number(latest.weight).toLocaleString("id-ID")} kg` : "— kg";
	weightMetric.querySelector("small").textContent = latest ? `Catatan terakhir · ${formatDate(latest.date)}` : "Belum ada catatan";

	if (recent.length >= 2) {
		const difference = Number(recent.at(-1).weight) - Number(recent[0].weight);
		const sign = difference > 0 ? "+" : "";
		trendMetric.querySelector("strong").textContent = `${sign}${difference.toLocaleString("id-ID", { maximumFractionDigits: 1 })} kg`;
		trendMetric.querySelector("small").textContent = "Perubahan dari catatan pertama dalam 30 hari";
	} else {
		trendMetric.querySelector("strong").textContent = "—";
		trendMetric.querySelector("small").textContent = "Perlu dua catatan dalam 30 hari";
	}

	const habitMetric = progressMetrics[2];
	const habits = readTodayHabits();
	const completed = habits.filter(Boolean).length;
	const percentage = habits.length ? Math.round(completed / habits.length * 100) : 0;
	habitMetric.querySelector("strong").textContent = `${percentage}%`;
	habitMetric.querySelector("small").textContent = `${completed} kebiasaan selesai hari ini`;
	const legend = document.querySelector(".chart-legend");
	legend.querySelector("span").textContent = "BERAT BADAN";
	legend.querySelector("strong").textContent = recent.length >= 2
		? `${Number(recent[0].weight).toLocaleString("id-ID")} kg → ${Number(recent.at(-1).weight).toLocaleString("id-ID")} kg`
		: "Belum cukup catatan untuk melihat tren";
	renderChart(recent);
}

progressHeader.querySelector(".eyebrow").textContent = "PROGRES";
progressHeader.querySelector("h1").textContent = "Lihat perubahanmu.";
progressHeader.querySelector("p").textContent = "Catat pengukuran dan amati perkembanganmu dari waktu ke waktu.";
progressHeader.querySelector(".btn").textContent = "+ Catat berat badan";
progressMetrics[0].querySelector(".metric-label").textContent = "BERAT TERAKHIR";
progressMetrics[0].querySelector("small").textContent = "Belum ada catatan";
progressMetrics[1].querySelector(".metric-label").textContent = "TREN 30 HARI";
progressMetrics[2].querySelector(".metric-label").textContent = "KEBIASAAN HARI INI";
const progressCards = document.querySelectorAll(".app-grid-2 .section-card");
progressCards[0].querySelector("h2").textContent = "Tren berat badan";
progressCards[0].querySelector(".section-title p").textContent = "30 hari terakhir";
progressCards[1].querySelector("h2").textContent = "Ukuran tubuh lainnya";
progressCards[1].querySelector(".section-title p").textContent = "Catatan ukuran tambahan belum tersedia.";
document.querySelectorAll(".app-grid-2 .section-card:nth-child(2) .info-row > span").forEach((label, index) => {
	label.textContent = ["Pinggang", "Dada", "Lengan", "Paha"][index] || label.textContent;
});
const reviewSection = document.querySelector("main > .section-card:last-of-type");
if (reviewSection) {
	reviewSection.querySelector(".section-title h2").textContent = "Ringkasan kebiasaan";
	reviewSection.querySelector(".section-title span").textContent = "Hari ini";
	const reviewMetrics = reviewSection.querySelectorAll(".metric");
	if (reviewMetrics[0]) {
		const habits = readTodayHabits();
		reviewMetrics[0].querySelector(".metric-label").textContent = "KEBIASAAN";
		reviewMetrics[0].querySelector("strong").textContent = `${habits.filter(Boolean).length}/${habits.length || 4}`;
		reviewMetrics[0].querySelector("small").textContent = "Selesai hari ini";
	}
	if (reviewMetrics[1]) {
		reviewMetrics[1].querySelector(".metric-label").textContent = "CATATAN";
		reviewMetrics[1].querySelector("strong").textContent = String(readMeasurements().length);
		reviewMetrics[1].querySelector("small").textContent = "Pengukuran tersimpan";
	}
	if (reviewMetrics[2]) {
		reviewMetrics[2].querySelector(".metric-label").textContent = "TREN";
		reviewMetrics[2].querySelector("strong").textContent = recentTrendLabel();
		reviewMetrics[2].querySelector("small").textContent = "Butuh dua catatan untuk melihat tren";
	}
}

function recentTrendLabel() {
	const measurements = readMeasurements();
	const cutoff = new Date();
	cutoff.setDate(cutoff.getDate() - 30);
	const recent = measurements.filter(item => new Date(`${item.date}T23:59:59`) >= cutoff);
	return recent.length >= 2 ? "Terlihat" : "Menunggu";
}

progressHeader.querySelector(".btn").addEventListener("click", () => measurementDialog.showModal());
measurementDialog.querySelector("[data-close]").addEventListener("click", () => measurementDialog.close());
measurementForm.addEventListener("submit", event => {
	event.preventDefault();
	if (!measurementForm.reportValidity()) return;
	const data = new FormData(measurementForm);
	const measurements = readMeasurements();
	measurements.push({ weight: Number(data.get("weight")), date: String(data.get("date")) });
	try {
		localStorage.setItem(measurementKey, JSON.stringify(measurements));
		measurementDialog.close();
		measurementForm.reset();
		measurementForm.elements.date.value = [today.getFullYear(), String(today.getMonth() + 1).padStart(2, "0"), String(today.getDate()).padStart(2, "0")].join("-");
		renderProgress();
	} catch {
		measurementDialog.querySelector("p").textContent = "Catatan tidak dapat disimpan. Periksa pengaturan penyimpanan browser.";
	}
});
renderProgress();
