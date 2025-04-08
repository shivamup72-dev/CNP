// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 4200, // Change this to 5000 or 8000 if needed
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // <- THIS is important
    },
  },
});
