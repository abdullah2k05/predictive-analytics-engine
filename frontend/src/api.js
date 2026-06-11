const RAW_API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

if (!RAW_API_BASE_URL) {
  throw new Error("EXPO_PUBLIC_API_BASE_URL is required");
}

let parsedBaseUrl;

try {
  parsedBaseUrl = new URL(RAW_API_BASE_URL);
} catch {
  throw new Error("EXPO_PUBLIC_API_BASE_URL must be a valid absolute URL");
}

if (parsedBaseUrl.pathname !== "/" && parsedBaseUrl.pathname !== "") {
  throw new Error(
    "EXPO_PUBLIC_API_BASE_URL must point to the API origin only, not a path like /models",
  );
}

const API_BASE_URL = parsedBaseUrl.origin;

export { API_BASE_URL };

async function requestJson(path, options, errorLabel) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, options);
  } catch (fetchError) {
    throw new Error(
      `${errorLabel}: failed to fetch ${API_BASE_URL}${path}. Check Render CORS, network access, and EXPO_PUBLIC_API_BASE_URL.`,
    );
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.detail || `${errorLabel} (${response.status})`);
  }

  return response.json();
}

export async function fetchModels() {
  return requestJson("/models", undefined, "Unable to load models");
}

export async function fetchModelSchema(modelId) {
  return requestJson(
    `/models/${modelId}`,
    undefined,
    "Unable to load model schema",
  );
}

export async function predictModel(modelId, payload) {
  return requestJson(
    `/predict/${modelId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
    "Prediction failed",
  );
}
