import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-oxc'
import tailwindcss from '@tailwindcss/vite'
import { sentryVitePlugin } from '@sentry/vite-plugin'

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    tailwindcss(),
    // Faz upload de source maps para o Sentry apenas no build de produção
    mode === 'production' && sentryVitePlugin({
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      telemetry: false,
    }),
  ].filter(Boolean),
  build: {
    // Source maps necessários para o Sentry mapear erros ao código original
    sourcemap: true,
  },
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
    },
  },
}))
