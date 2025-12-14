import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'a3328c77-30ec-47da-b7f5-4272b6de7997-00-3ig221athbn06.pike.replit.dev'
    ]
  }
})
