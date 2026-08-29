import {
  defineConfig,
  createAppleSplashScreens
} from '@vite-pwa/assets-generator/config';

export default defineConfig({
  head: true,
  preset: {
    // 空陣列：不生成或覆蓋任何 App Icons，保留原始滿版高解析圖示
    transparent: { sizes: [] },
    maskable: { sizes: [] },
    apple: { sizes: [] },
    // 僅負責生成 Apple iOS 開屏畫面（Splash Screens）
    appleSplashScreens: createAppleSplashScreens(
      {
        padding: 0.3,
        resizeOptions: {
          background: '#F3F0DF',
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
    )
  },
  images: ['public/icon.png']
});
