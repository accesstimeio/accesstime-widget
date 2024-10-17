import { defineConfig } from 'tsup';

export default defineConfig({
	entry: ['src/index.tsx'],
	format: ['cjs', 'esm'],
	dts: true,
	sourcemap: true,
	minify: true,
	clean: true,
	external: ['react', 'react-dom'],
});
