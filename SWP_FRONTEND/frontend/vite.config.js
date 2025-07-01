import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      }
    },
    // Thêm cấu hình historyApiFallback để xử lý client-side routing
    historyApiFallback: true,
    // Fix WebSocket connection issues
    hmr: {
      port: 5174,
    },
    watch: {
      usePolling: true,
    }
  },
  // Thêm cấu hình base để tránh lỗi routing khi reload
  base: '/'
})
