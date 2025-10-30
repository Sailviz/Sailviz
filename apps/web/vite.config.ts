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
    ],
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    'react-vendor': ['react', 'react-dom'],
                    tanstack: ['@tanstack/react-router', '@tanstack/react-query', '@tanstack/react-table'],
                    'radix-ui': [
                        '@radix-ui/react-accordion',
                        '@radix-ui/react-alert-dialog',
                        '@radix-ui/react-avatar',
                        '@radix-ui/react-checkbox',
                        '@radix-ui/react-collapsible',
                        '@radix-ui/react-dialog',
                        '@radix-ui/react-dropdown-menu',
                        '@radix-ui/react-label',
                        '@radix-ui/react-navigation-menu',
                        '@radix-ui/react-popover',
                        '@radix-ui/react-progress',
                        '@radix-ui/react-radio-group',
                        '@radix-ui/react-scroll-area',
                        '@radix-ui/react-select',
                        '@radix-ui/react-separator',
                        '@radix-ui/react-slider',
                        '@radix-ui/react-slot',
                        '@radix-ui/react-switch',
                        '@radix-ui/react-tabs',
                        '@radix-ui/react-tooltip'
                    ],
                    icons: ['lucide-react', '@radix-ui/react-icons'],
                    utilities: ['clsx', 'tailwind-merge', 'class-variance-authority', 'tailwind-variants'],
                    animations: ['framer-motion']
                }
            }
        }
    }
})
