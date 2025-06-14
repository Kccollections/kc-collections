import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react({
    include: "**/*.{jsx,js}",
    jsxRuntime: 'automatic',
    babel: {
      plugins: [
        ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }]
      ]
    }
  })
  , tailwindcss()],
  resolve: {
    extensions: ['.jsx', '.js', '.json']
  },
  esbuild: {
    loader: 'jsx',
    include: /\.jsx?$/,
    exclude: [],
  }
})
