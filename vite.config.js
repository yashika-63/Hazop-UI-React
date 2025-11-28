import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'] 
  },
  css: {
    postcss: {
      plugins: [
        // You can add custom PostCSS plugins here if needed, e.g., autoprefixer
      ]
    },
  },

  server: {
    open: true,  
    port: 5174,  
  },
});
