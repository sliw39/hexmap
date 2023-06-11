/* generates a pure js lib */
import { defineConfig } from 'vite'

export default defineConfig({
    build: {
        lib: {
            entry: 'dist/hexmap.js',
            name: 'HexMap',
            fileName: (format) => `hexmap.${format}.js`
        }
    }
})