import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    chunkSizeWarningLimit: 1000, // Aumenta o limite de aviso de tamanho de chunk para 1MB devido aos ecrãs administrativos dinâmicos (Lazy)
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          // Removemos o chunk manual 'icons' da lucide-react para permitir o tree-shaking automático e reduzir o tamanho do bundle
        }
      }
    }
  },
  server: {
    proxy: {
      '/backend': {
        target: 'http://localhost:8000', // Update this to your local PHP server URL if needed
        changeOrigin: true,
      }
    }
  }
})
