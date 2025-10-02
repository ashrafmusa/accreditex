// vite.config.ts
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load environment variables based on the current mode (development, production, etc.)
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    define: {
      // Expose all environment variables prefixed with VITE_ via import.meta.env
      'process.env': env,
    },
    resolve: {
      alias: {
        // Use '@' to refer to the 'src' directory for cleaner imports
        '@': path.resolve(__dirname, ''),
      },
    },
    server: {
      port: 5173,       // Optional: customize dev server port
      open: true,       // Optional: auto-open browser on dev start
    },
    build: {
      outDir: 'dist',   // Optional: customize build output directory
      sourcemap: true,  // Optional: enable source maps for debugging
    },
  };
});
