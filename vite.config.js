import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
base: '/google-ads-sandbox/',

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
  },
});
