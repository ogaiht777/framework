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
  // Robust console redirection for FiveM
  banner: {
    js: `
      if (typeof print === 'undefined') {
        var print = console.log; // Fallback for non-FiveM environments
      }
      global.console = {
        log: print,
        warn: print,
        error: print,
        info: print,
        debug: print,
      };
    `,
  },
};

async function build() {
  // Ensure dist directory exists
  const distDir = path.resolve(__dirname, 'dist');
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir);
  }

  // Build server-side bundle
  await esbuild.build({
    ...commonConfig,
    entryPoints: ['./src/index.ts'],
    outfile: path.resolve(distDir, 'server.js'),
  });

  // Build client-side bundle
  await esbuild.build({
    ...commonConfig,
    entryPoints: ['./src/client.ts'],
    outfile: path.resolve(distDir, 'client.js'),
  });

  console.log('Build complete!');

  if (isWatchMode) {
    console.log('Watching for changes...');
  }
}

build().catch(() => process.exit(1));
