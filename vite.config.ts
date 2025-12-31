import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import componentTagger from './plugins/component-tagger';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import { visualizer } from 'rollup-plugin-visualizer';
import viteCompression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    react(),
    componentTagger(),
    // Compression plugin for gzip and brotli
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240, // Only compress files > 10KB
      algorithm: 'gzip',
      ext: '.gz',
    }),
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240,
      algorithm: 'brotliCompress',
      ext: '.br',
    }),
    // Bundle analyzer
    visualizer({
      filename: './dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
    // Sentry plugin for source maps upload
    sentryVitePlugin({
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      sourcemaps: {
        assets: './dist/**',
      },
      telemetry: false,
      disable: process.env.NODE_ENV !== 'production',
    }),
  ],
  build: {
    sourcemap: true,
    // Optimize chunk splitting
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            if (id.includes('framer-motion') || id.includes('lucide-react')) {
              return 'ui-vendor';
            }
            if (id.includes('wagmi') || id.includes('viem') || id.includes('rainbowkit')) {
              return 'web3-vendor';
            }
            if (id.includes('@radix-ui')) {
              return 'radix-vendor';
            }
            return 'vendor';
          }
          // Feature chunks
          if (id.includes('NFTGallery')) {
            return 'gallery';
          }
          if (id.includes('Dashboard')) {
            return 'dashboard';
          }
          if (id.includes('TraitMarketplace')) {
            return 'marketplace';
          }
        },
      },
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 500,
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    hmr: {
      overlay: false,
      timeout: 15000,
    },
    watch: {
      usePolling: true,
      interval: 500,
      binaryInterval: 500,
    },
  },
});
