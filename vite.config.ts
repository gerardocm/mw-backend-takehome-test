/// <reference types="vitest" />
import { defineConfig } from 'vite'
import { VitePluginNode } from 'vite-plugin-node'
import * as path from 'path'
import swc from 'unplugin-swc';

export default defineConfig({
  server: {
    port: 3000
  },
  plugins: [
    ...VitePluginNode({
      adapter: 'fastify',
      appPath: './src/server.ts',
      exportName: 'viteNodeApp',
      tsCompiler: 'esbuild'
    }),
    swc.vite()
  ],
  resolve: {
    alias: {
      '@app': path.resolve(__dirname, './src'),
      '~root': path.resolve(__dirname, '.')
    }
  }
})
