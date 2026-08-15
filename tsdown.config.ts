import { defineConfig } from 'tsdown'

// The shell's shared browser platform modules (packages/client/web/src/platform.ts):
// these stay external so the loader module table answers them at runtime.
const PLATFORM_MODULES = [
  'react',
  'react/jsx-runtime',
  'react-dom',
  'react-dom/client',
  '@deepseek-ai/cordis',
  '@deepseek-ai/dsh-client-ui-slots',
  '@deepseek-ai/dsh-client-web-react',
  '@deepseek-ai/dsh-client-ui-primitives',
  '@deepseek-ai/dsh-client-ui-attachment',
  '@deepseek-ai/dsh-client-schema-form',
] as const

// Plus the documented runtime-store exemption (value imports of runtime/client
// resolve from the runtime plugin's factory through the module table).
const CLIENT_EXTERNALS = [...PLATFORM_MODULES, '@deepseek-ai/dsh-client-runtime/client'] as const

export default defineConfig([
  {
    // Node half: a governed, near-empty host entry.
    name: 'dsh-board',
    entry: ['src/index.ts'],
    outDir: 'lib',
    format: ['esm'],
    platform: 'node',
    target: 'es2024',
    dts: false,
    clean: false,
    fixedExtension: false,
  },
  {
    // Browser half: a closure-factory CJS bundle registering itself with the
    // loader module table — the exact artifact shape the web plugin registry
    // serves under /plugins/dsh-board/client.js.
    name: 'dsh-board/client',
    entry: { client: 'src/client/index.ts' },
    outDir: 'lib',
    format: ['cjs'],
    platform: 'browser',
    dts: false,
    sourcemap: true,
    clean: false,
    external: [...CLIENT_EXTERNALS],
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? 'production'),
      'import.meta.env.MODE': JSON.stringify(process.env.NODE_ENV ?? 'production'),
      'import.meta.env': JSON.stringify({ MODE: process.env.NODE_ENV ?? 'production' }),
    },
    // Everything not in the module table must inline; a require() the table
    // cannot answer is a guaranteed runtime throw.
    noExternal: (id: string) => !CLIENT_EXTERNALS.includes(id),
    outputOptions: {
      entryFileNames: 'client.js',
      banner: 'window.__ModuleLoader__.load({ id: "dsh-board", factory: (require) => {',
      footer: 'return module.exports; } });',
      intro: 'var module = { exports: {} }; var exports = module.exports;',
    },
  },
])
