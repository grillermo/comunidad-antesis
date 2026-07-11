import react from '@vitejs/plugin-react'
import inertia from '@inertiajs/vite'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import RubyPlugin from 'vite-plugin-ruby'
import { createReadStream, statSync } from 'node:fs'
import { basename, resolve } from 'node:path'
import { fileURLToPath, URL } from 'node:url'

function developmentBuildAssets() {
  return {
    name: 'development-build-assets',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/vite-dev/assets/', (request, response, next) => {
        const filename = basename(request.url?.split('?')[0] || '')
        const path = resolve('public/vite-dev/assets', filename)

        try {
          if (!filename || !statSync(path).isFile()) return next()
        } catch {
          return next()
        }

        const extension = filename.split('.').pop()
        const contentTypes = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif', svg: 'image/svg+xml' }
        response.setHeader('Content-Type', contentTypes[extension] || 'application/octet-stream')
        createReadStream(path).pipe(response)
      })
    },
  }
}

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./app/frontend', import.meta.url)),
    },
  },
  plugins: [
    tailwindcss(),
    RubyPlugin(),
    inertia(),
    react(),
    developmentBuildAssets(),
  ],
})
