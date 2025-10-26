import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
     tailwindcss()
  ],theme: {
  extend: {
    colors: {
        'primary': 'var(--color-primary)',
        'secondary': 'var(--color-secondary)',
        'accent': 'var(--color-accent)',
        'bg-default': 'var(--color-bg-default)',
        'text-on-dark': 'var(--color-text-on-dark)',
    },
  },
}

})

