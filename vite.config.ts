import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/M-Comp-Generator/',
  plugins: [react()],
});
