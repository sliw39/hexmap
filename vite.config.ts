/* generates a pure js lib */
import { defineConfig } from 'vite'

export default defineConfig({
    build: {
        lib: {
            entry: 'src/hexmap.ts',
            name: 'HexMap',
            fileName: (format) => `hexmap.${format}.js`
        }
    }
})