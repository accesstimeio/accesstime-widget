import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/**/*.ts', 'src/**/*.tsx'],
    format: ['cjs', 'esm'],
    dts: true,
    clean: true,
    splitting: true,
    treeshake: true,
    bundle: true,
    external: ['react', 'react-dom'],
});
