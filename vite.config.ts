import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import project from "./package.json";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    assetsDir: project.name,
  }
})
