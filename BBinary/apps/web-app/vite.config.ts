import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import dotenv from 'dotenv'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env from UnifierBBinary root (Adjust path as needed: web-app -> apps -> BBinary -> UnifierBBinary)
  const envPath = path.resolve(__dirname, '../../../.env');
  const envResult = dotenv.config({ path: envPath, override: true });
  const parsedEnv = envResult.parsed || {};

  // Also check process.env in case it was passed down (fallback)
  const googleApiKey = parsedEnv.GOOGLE_API_KEY || process.env.GOOGLE_API_KEY;
  const modelName = parsedEnv.VITE_MODEL_NAME || process.env.VITE_MODEL_NAME;

  return {
    plugins: [react()],
    define: {
      'process.env.GOOGLE_API_KEY': JSON.stringify(googleApiKey),
      'process.env.MODEL_NAME': JSON.stringify(modelName),
    }
  }
})
