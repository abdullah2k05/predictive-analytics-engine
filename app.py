from pathlib import Path
import os

import joblib as jb
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware


BASE_DIR = Path(__file__).resolve().parent
ALLOWED_ORIGINS = [
  origin.strip()
  for origin in os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:19006").split(",")
  if origin.strip()
]
MODEL_CONFIGS = {
  "churn_model": {
    "name": "Churn Prediction",
    "description": "Predict whether a customer is likely to churn.",
    "schema": {
      "fields": [
        {
          "name": "days_since_last_purchase",
          "label": "Days Since Last Purchase",
          "type": "number",
          "placeholder": "e.g. 14",
          "required": True,
        },
        {
          "name": "satisfaction_score",
          "label": "Satisfaction Score",
          "type": "number",
          "placeholder": "e.g. 4.2",
          "required": True,
        },
        {
          "name": "customer_lifetime_days",
          "label": "Customer Lifetime Days",
          "type": "number",
          "placeholder": "e.g. 365",
          "required": True,
        },
        {
          "name": "total_orders",
          "label": "Total Orders",
          "type": "number",
          "placeholder": "e.g. 8",
          "required": True,
        },
        {
          "name": "total_spent_usd",
          "label": "Total Spent (USD)",
          "type": "number",
          "placeholder": "e.g. 1240.50",
          "required": True,
        },
        {
          "name": "discount_usage_rate",
          "label": "Discount Usage Rate",
          "type": "number",
          "placeholder": "e.g. 0.3",
          "required": True,
        },
        {
          "name": "return_rate",
          "label": "Return Rate",
          "type": "number",
          "placeholder": "e.g. 0.05",
          "required": True,
        },
        {
          "name": "avg_order_value_usd",
          "label": "Average Order Value (USD)",
          "type": "number",
          "placeholder": "e.g. 120.00",
          "required": True,
        },
        {
          "name": "avg_session_duration_min",
          "label": "Average Session Duration (Min)",
          "type": "number",
          "placeholder": "e.g. 7.5",
          "required": True,
        },
        {
          "name": "avg_pages_per_session",
          "label": "Average Pages Per Session",
          "type": "number",
          "placeholder": "e.g. 4.2",
          "required": True,
        },
      ]
    },
  },
}


app = FastAPI(title="E-Commerce Customer Analytics API")
app.add_middleware(
  CORSMiddleware,
  allow_origins=ALLOWED_ORIGINS,
  allow_origin_regex=os.getenv("ALLOWED_ORIGIN_REGEX", r"https://.*\.vercel\.app"),
  allow_credentials=False,
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
        "input_fields": [field["name"] for field in model_config.get("schema", {}).get("fields", [])],
        "available": True,
      }
    )

  return discovered_models


def load_model(model_id: str):
  model_info = next((item for item in discover_models() if item["id"] == model_id), None)
  if model_info is None:
    raise HTTPException(status_code=404, detail="Model not found")

  model_path = BASE_DIR / f"{model_info['id']}.pkl"
  if not model_path.exists():
    raise HTTPException(status_code=404, detail="Model file is missing")

  return model_info, jb.load(model_path)


@app.get("/models/{model_id}")
def get_model_schema(model_id: str):
  model_info = next((item for item in discover_models() if item["id"] == model_id), None)
  if model_info is None:
    raise HTTPException(status_code=404, detail="Model not found")

  model_config = MODEL_CONFIGS.get(model_id)
  if model_config is None or "schema" not in model_config:
    raise HTTPException(status_code=404, detail="Model schema not found")

  return {
    "id": model_info["id"],
    "name": model_info["name"],
    "description": model_info["description"],
    "schema": model_config["schema"],
  }


@app.get("/models")
def list_models():
  return {"models": discover_models()}


@app.post("/predict/{model_id}")
def predict(model_id: str, data: dict):
  model_info, model = load_model(model_id)
  model_config = MODEL_CONFIGS.get(model_id, {})
  schema = model_config.get("schema", {})
  fields = schema.get("fields", [])

  if not fields:
    raise HTTPException(
      status_code=400,
      detail="This model does not have configured input fields yet.",
    )

  try:
    features = []

    for field in fields:
      value = data[field["name"]]
      if field.get("type") == "number":
        value = float(value)
      features.append(value)

    features = [features]
  except KeyError as exc:
    raise HTTPException(status_code=400, detail=f"Missing required field: {exc.args[0]}") from exc
  except ValueError as exc:
    raise HTTPException(status_code=400, detail="Invalid numeric value in request") from exc

  prediction = model.predict(features)

  return {
    "model_id": model_info["id"],
    "prediction": int(prediction[0]),
  }