import { defineConfig } from 'tsup';
import path from 'path';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  outDir: 'dist',
  esbuildOptions(options) {
    options.alias = {
      ...(options.alias || {}),
      '@': path.resolve(process.cwd(), 'src')
    };
  }
});
