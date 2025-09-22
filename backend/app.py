from pathlib import Path
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import joblib
from tensorflow.keras.models import load_model
import numpy as np

BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR.parent / "model"

app = Flask(__name__, static_folder="static", template_folder="templates")
CORS(app)

# Load model & scaler
model = load_model(str(MODEL_DIR / "model.h5"))
scaler = joblib.load(str(MODEL_DIR / "scaler.save"))

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json(force=True)
        features = np.array([data["features"]], dtype=float)  # shape (1, 8)
        features = scaler.transform(features)
        pred = model.predict(features)
        prob = float(pred[0][0])
        return jsonify({"prediction": int(prob > 0.5), "probability": prob})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route("/health")
def health():
    return jsonify({"status": "ok"})

if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5000)
