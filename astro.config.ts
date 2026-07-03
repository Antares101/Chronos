import node from '@astrojs/node';
import react from '@astrojs/react';
import type { AstroIntegration } from 'astro';
import { defineConfig } from 'astro/config';

function isolateViteCacheByCommand(): AstroIntegration {
  return {
    name: 'chronos-vite-cache-isolation',
    hooks: {
      'astro:config:setup': ({ command, updateConfig }) => {
        updateConfig({
          vite: {
            cacheDir: `node_modules/.vite-${command}`,
          },
        });
      },
    },
  };
}

export default defineConfig({
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
  integrations: [isolateViteCacheByCommand(), react()],
});
