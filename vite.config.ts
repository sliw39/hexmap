/* generates a pure js lib */
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
    plugins: [
        dts({
          insertTypesEntry: true,
        }),
      ],
    build: {
        lib: {
            entry: 'src/hexmap.ts',
            name: 'HexMap',
            fileName: (format) => `hexmap.${format}.js`
        }
    }
})