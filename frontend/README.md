# Frontend Setup

This is an Expo-based React Native web frontend that can be deployed on Vercel.

## Local Run

1. Install dependencies inside `frontend`.
2. Set `EXPO_PUBLIC_API_BASE_URL` to your Render API URL.
3. Run `npm run web`.

## Vercel Deploy

1. Set the Vercel project root directory to `frontend`.
2. Add `EXPO_PUBLIC_API_BASE_URL` to the Vercel environment variables.
3. Build command: `npm run build:web`.
4. Output directory: `dist`.

## Render Deploy

1. Deploy the FastAPI app from the repository root.
2. Make sure the Render service exposes the `/models` and `/predict/{model_id}` routes.
3. Keep the model pickle files in the same directory as `app.py`, or update the file lookup path in the backend.
