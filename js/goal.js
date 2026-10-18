const goalForm = document.getElementById("goalForm");
const assessmentData = JSON.parse(localStorage.getItem("bodywiseAssessment") || "null") || {
  weight: 76,
  goal: "lose",
};
const savedGoal = assessmentData.goal || "lose";
const currentWeight = Number(assessmentData.weight) || 76;
const goalTargets = {
  lose: Math.max(30, currentWeight - 4),
  maintain: currentWeight,
  gain: currentWeight + 3,
};
const targetInput = document.getElementById("targetWeight");
const goalSuccess = document.getElementById("goalSuccess");
const successSummary = document.getElementById("successSummary");

document.querySelector(`input[name="goal"][value="${savedGoal}"]`).checked = true;
targetInput.value = assessmentData.targetWeight || goalTargets[savedGoal];

document.querySelectorAll('input[name="goal"]').forEach((input) => {
  input.addEventListener("change", () => {
    if (!assessmentData.targetWeight) targetInput.value = goalTargets[input.value];
  });
});

goalForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!goalForm.reportValidity()) return;

  const formData = new FormData(goalForm);
  const nextAssessment = {
    ...assessmentData,
    goal: formData.get("goal"),
    targetWeight: Number(formData.get("targetWeight")),
    goalDuration: Number(formData.get("goalDuration")),
  };
  localStorage.setItem("bodywiseAssessment", JSON.stringify(nextAssessment));

  const goalNames = {
    lose: "menurunkan berat badan",
    maintain: "mempertahankan berat badan",
    gain: "meningkatkan massa tubuh",
  };
  successSummary.textContent = `Fokusmu: ${goalNames[nextAssessment.goal]}, dengan target ${nextAssessment.targetWeight} kg dalam ${nextAssessment.goalDuration} minggu.`;
  goalSuccess.hidden = false;
  goalSuccess.querySelector("a").focus();
});

goalSuccess.addEventListener("click", (event) => {
  if (event.target === goalSuccess) goalSuccess.hidden = true;
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !goalSuccess.hidden) goalSuccess.hidden = true;
});