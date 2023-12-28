import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import eslintPlugin from 'vite-plugin-eslint';
import { quasar, transformAssetUrls } from '@quasar/vite-plugin';

export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return defineConfig({
    plugins: [
      vue({
        template: { transformAssetUrls },
      }),
      eslintPlugin(),
      quasar({
        sassVariables: 'src/quasar-variables.sass',
      }),
    ],
    server: {
      proxy: {
        '/ci': {
          target: env.VITE_PMS_DEV_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/ci/, ''),
        },
      },
    },
  });
};
