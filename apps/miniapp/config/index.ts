import { defineConfig } from '@tarojs/cli';

export default defineConfig({
  projectName: 'jlpt-practice',
  date: '2026-06-16',
  designWidth: 750,
  deviceRatio: {
    640: 2.34 / 2,
    750: 1,
    828: 1.81 / 2,
  },
  sourceRoot: 'src',
  outputRoot: 'dist',
  plugins: ['@tarojs/plugin-framework-vue3'],
  framework: 'vue3',
  compiler: 'vite',
  mini: {},
  h5: {},
});
