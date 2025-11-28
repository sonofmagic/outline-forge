import type { UserConfig } from 'vite'
import Tailwindcss from '@tailwindcss/vite'
import path from 'pathe'
import { mergeConfig } from 'vite'
import DTS from 'vite-plugin-dts'
import { sharedConfig } from './vite.shared.config'

export default mergeConfig(sharedConfig, {
  plugins: [
    DTS(
      {
        tsconfigPath: './tsconfig.app.json',
        entryRoot: './lib',
      },
    ),
    Tailwindcss(),
  ],
  // https://vite.dev/guide/build.html#library-mode
  build: {
    lib: {
      entry: path.resolve(import.meta.dirname, 'lib/index'),
      name: 'icebreaker',
      // the proper extensions will be added
      fileName: 'index',
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {

        },
      },
    },
  },
} satisfies UserConfig)
