const form = document.getElementById("prediction-form");
const resultBox = document.getElementById("result");
const predChip = document.getElementById("pred-chip");
const predLabel = document.getElementById("pred-label");
const probBar = document.getElementById("prob-bar");
const probText = document.getElementById("prob-text");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // collect the 8 inputs in order
  const inputs = Array.from(form.querySelectorAll("input"));
  const features = inputs.map(i => Number(i.value));

  // quick front-end validation
  if (features.some(v => Number.isNaN(v))) {
    showError("Please enter valid numbers in all fields.");
    return;
  }

  try {
    const res = await fetch("/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ features })
    });

    const data = await res.json();
    if (!res.ok || data.error) {
      const msg = data?.error || `Server error (${res.status})`;
      showError(msg);
      return;
    }

    const prob = Math.max(0, Math.min(1, Number(data.probability)));
    const percent = (prob * 100).toFixed(2);

    // Update UI
    resultBox.classList.remove("hidden");
    probBar.style.width = `${percent}%`;
    probText.textContent = `${percent}%`;

    const isPositive = data.prediction === 1;
    predChip.textContent = isPositive ? "Diabetic risk" : "Not diabetic";
    predChip.style.background = isPositive ? "var(--chip-red)" : "var(--chip-green)";
    predLabel.textContent = "Prediction";

  } catch (err) {
    showError("Network error. Is the server running?");
  }
});

function showError(message){
  resultBox.classList.remove("hidden");
  probBar.style.width = "0%";
  probText.textContent = "—%";
  predChip.textContent = "Error";
  predChip.style.background = "#999";
  predLabel.textContent = message;
}
