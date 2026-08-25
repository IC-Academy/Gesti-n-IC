import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/Gesti-n-IC/',
  plugins: [react(), tailwindcss()],
  build: {
    // El bundle único (React + Recharts + carta Gantt propia) ronda ~240 kB
    // gzip, razonable para una SPA de este alcance; se ajusta el límite de
    // advertencia en lugar de forzar un code-splitting manual innecesario.
    chunkSizeWarningLimit: 900,
  },
})
