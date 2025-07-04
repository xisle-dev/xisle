import { resolve } from 'path';
import { defineConfig } from 'vite';
import { hugoPlugin} from 'vite-hugo-plugin'
import { cloudflare } from '@cloudflare/vite-plugin';
import honoBuild from '@hono/vite-build/cloudflare-workers';

const hugoOutDir = resolve('_output');
const appDir = __dirname;

export default defineConfig(({ mode }) => {
  if (mode === 'client') {
    return {
      build: {
        outDir: 'dist/client',
        emptyOutDir: true,
        rollupOptions: {
          input: 'hugo_output/index.html', // Or other main HTML files
        },
      },
      plugins: [
        hugoPlugin({ appDir, hugoOutDir }),
      ],
      publicDir: './hugo_output',
    };
  } else {
    return {
      build: {
        ssr: true,
        outDir: 'dist/worker',
        emptyOutDir: true,
        rollupOptions: {
          input: './src/index.ts',
        },
      },
      plugins: [
        honoBuild({
          entry: './src/index.ts',
        }),
        cloudflare(),
      ],
    };
  }
});