import path from "path"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const rateMyProfessorsProxy = {
  "/api/ratemyprofessors": {
    target: "https://www.ratemyprofessors.com",
    changeOrigin: true,
    rewrite: () => "/graphql",
    headers: {
      Authorization: "Basic dGVzdDp0ZXN0",
    },
  },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    historyFallback: true,
    proxy: rateMyProfessorsProxy,
  },
  preview: {
    proxy: rateMyProfessorsProxy,
  },
})
