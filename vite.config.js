import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';

function copyAssetsFolderPlugin() {
  return {
    name: 'copy-assets-folder',
    closeBundle() {
      const srcDir = resolve(__dirname, 'assets');
      const destDir = resolve(__dirname, 'dist', 'assets');
      if (fs.existsSync(srcDir)) {
        fs.cpSync(srcDir, destDir, { recursive: true });
      }
    },
  };
}

export default defineConfig({
  plugins: [copyAssetsFolderPlugin()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'admin.html'),
      },
      output: {
        manualChunks: {
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
        },
      },
    },
  },
  server: {
    port: 5173,
    open: false,
  },
  preview: {
    allowedHosts: true,
  },
});
