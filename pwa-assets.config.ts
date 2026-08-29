import {
  defineConfig,
  minimal2023Preset,
  combinePresetAndAppleSplashScreens
} from '@vite-pwa/assets-generator/config';

export default defineConfig({
  head: true,
  preset: combinePresetAndAppleSplashScreens(
    minimal2023Preset,
    {
      padding: 0.3,
      resizeOptions: {
        background: '#FBFBFA',
        fit: 'contain'
      },
      linkMediaOptions: {
        basePath: '/bookkeeping/',
        xhtml: false
      }
    },
    [
      'iPhone 13 mini',
      'iPhone 13',
      'iPhone 13 Pro Max',
      'iPhone 14 Pro',
      'iPhone 14 Pro Max',
      'iPhone 11',
      'iPhone 11 Pro Max',
      'iPhone SE 4.7"'
    ]
  ),
  images: ['public/icon.png']
});
