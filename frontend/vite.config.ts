import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    // Add these new configurations
    allowedHosts: [
      "fulafia-electronic-tracking-and-x643.onrender.com",
      "localhost"
    ],
    proxy: {
      '/api': {
        target: 'https://fulafia-electronic-tracking-and.onrender.com', // Replace with your actual backend URL
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Add base URL configuration for production
  base: mode === 'production' 
    ? 'https://fulafia-electronic-tracking-and-x643.onrender.com' 
    : '/'
}));