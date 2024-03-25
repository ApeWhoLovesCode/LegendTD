import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path';
import vueJsx from '@vitejs/plugin-vue-jsx';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(), 
    vueJsx()
  ],
  server: {
    // 允许局域网访问 (package.json中 ( "dev": "vite --host 0.0.0.0" ) 这样也行)
    host: "0.0.0.0",
    port: 16666,
    proxy: {
      '/api':{
        target: 'http://codeape.site:3030',
        // target: 'http://localhost:3030',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, "src")
    }
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true, // less 中使用 js
      }
    }
  }
})
