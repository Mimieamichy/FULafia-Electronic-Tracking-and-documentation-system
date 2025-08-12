import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
const PORT = process.env.PORT ? Number(process.env.PORT) : 8080;

export default defineConfig(({ mode }) => ({
  server: {
    // This is for the development server (npm run dev)
    port: PORT,
    host: true, // Listen on all network interfaces
  },
  preview: {
    // This is for the preview server (npm run preview or npm start)
    port: PORT,
    host: true, // Listen on all network interfaces
    // Allow the specific host provided by the deployment service
    allowedHosts: [
      'fulafia-electronic-tracking-and-8x35.onrender.com'
    ],
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));