const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

const isWatchMode = process.argv.includes('--watch');

const commonConfig = {
  bundle: true,
  minify: !isWatchMode, // Minify in production builds
  sourcemap: isWatchMode, // Generate sourcemaps in watch mode
  target: 'es6', // Target ES6 for broader FiveM compatibility
  format: 'iife', // Use IIFE format for direct execution in FiveM global scope
  globalName: 'FiveMEcsFramework', // Global name for the IIFE bundle
  logLevel: 'info',
  splitting: false,
  keepNames: true, // Keep class and function names for debugging
  // No banner needed, IIFE handles global scope
};

async function build() {
  // Ensure dist directory exists
  const distDir = path.resolve(__dirname, 'dist');
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir);
  }

  // Build main server-side bundle
  await esbuild.build({
    ...commonConfig,
    entryPoints: ['./src/index.ts'],
    outfile: path.resolve(distDir, 'server.js'),
  });

  // Build main client-side bundle
  await esbuild.build({
    ...commonConfig,
    entryPoints: ['./src/client.ts'],
    outfile: path.resolve(distDir, 'client.js'),
  });

  // Build server-side benchmark bundle
  await esbuild.build({
    ...commonConfig,
    entryPoints: ['./tests/benchmarks/entity-creation.benchmark.ts'],
    outfile: path.resolve(distDir, 'tests/benchmarks/entity-creation.benchmark.js'),
  });

  // Build server-side stress test bundle
  await esbuild.build({
    ...commonConfig,
    entryPoints: ['./tests/stress/stress-test.ts'],
    outfile: path.resolve(distDir, 'tests/stress/stress-test.js'),
  });

  console.log('Build complete!');

  if (isWatchMode) {
    console.log('Watching for changes...');
  }
}

build().catch(() => process.exit(1));