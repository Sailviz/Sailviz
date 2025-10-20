import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import { barrel } from 'vite-plugin-barrel'
import mdx from '@mdx-js/rollup'
// https://vite.dev/config/
export default defineConfig({
    plugins: [
        barrel({
            packages: ['lucide-react']
        }),
        tanstackRouter({
            target: 'react',
            autoCodeSplitting: true
        }),
        tsconfigPaths(),
        tailwindcss(),
        mdx(),
        react()
    ]
})
