const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("EXPO_PUBLIC_API_BASE_URL is required");
}

export { API_BASE_URL };

export async function fetchModels() {
  const response = await fetch(`${API_BASE_URL}/models`);

  if (!response.ok) {
    throw new Error("Unable to load models");
  }

  return response.json();
}

export async function fetchModelSchema(modelId) {
  const response = await fetch(`${API_BASE_URL}/models/${modelId}`);

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.detail || "Unable to load model schema");
  }

  return response.json();
}

export async function predictModel(modelId, payload) {
  const response = await fetch(`${API_BASE_URL}/predict/${modelId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.detail || "Prediction failed");
  }

  return response.json();
}
