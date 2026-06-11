from pathlib import Path

import joblib as jb
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware


BASE_DIR = Path(__file__).resolve().parent
MODEL_CONFIGS = {
  "churn_model": {
    "name": "Churn Prediction",
    "description": "Predict whether a customer is likely to churn.",
    "input_fields": [
      "days_since_last_purchase",
      "satisfaction_score",
      "total_orders",
    ],
  },
}


app = FastAPI(title="E-Commerce Customer Analytics API")
app.add_middleware(
  CORSMiddleware,
  allow_origins=["*"],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)


def discover_models():
  discovered_models = []

  for model_path in sorted(BASE_DIR.glob("*.pkl")):
    model_id = model_path.stem
    model_config = MODEL_CONFIGS.get(model_id, {})
    discovered_models.append(
      {
        "id": model_id,
        "name": model_config.get("name", model_id.replace("_", " ").title()),
        "description": model_config.get(
          "description",
          "Uploaded predictive model ready for selection.",
        ),
        "file_name": model_path.name,
        "input_fields": model_config.get("input_fields", []),
        "available": True,
      }
    )

  return discovered_models


def load_model(model_id: str):
  model_info = next((item for item in discover_models() if item["id"] == model_id), None)
  if model_info is None:
    raise HTTPException(status_code=404, detail="Model not found")

  model_path = BASE_DIR / model_info["file_name"]
  if not model_path.exists():
    raise HTTPException(status_code=404, detail=f'Model file "{model_info["file_name"]}" is missing')

  return model_info, jb.load(model_path)


@app.get("/models")
def list_models():
  return {"models": discover_models()}


@app.post("/predict/{model_id}")
def predict(model_id: str, data: dict):
  model_info, model = load_model(model_id)

  if not model_info["input_fields"]:
    raise HTTPException(
      status_code=400,
      detail="This model does not have configured input fields yet.",
    )

  try:
    features = [[data[field] for field in model_info["input_fields"]]]
  except KeyError as exc:
    raise HTTPException(status_code=400, detail=f"Missing required field: {exc.args[0]}") from exc

  prediction = model.predict(features)

  return {
    "model_id": model_info["id"],
    "prediction": int(prediction[0]),
  }