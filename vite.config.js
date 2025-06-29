import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/vet-flashcards/',   //  <-- exakt Repo-Name mit führenden / und abschließendem /
  build: {
    outDir: 'docs',
  },
});
