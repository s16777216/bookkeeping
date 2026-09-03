## Context

GitHub Pages 根據倉庫路徑 `https://<username>.github.io/<repo>/` 託管靜態站點。當前遠端倉庫為 `s16777216/bookeeping`。先前設定將基底路徑設為 `/bookkeeping/`，導致所有相對於基底的靜態資源尋址錯誤。

## Goals / Non-Goals

**Goals:**
- 將所有靜態資源與 PWA 相關路徑校準為 `/bookeeping/`。
- 在 `index.html` 補上現代標準 `<meta name="mobile-web-app-capable" content="yes" />`。
- 通過 `npm run build` 驗證生成的 HTML 與 PWA manifest 均具備正確的 `/bookeeping/` 路徑。

**Non-Goals:**
- 不變更 GitHub 倉庫名稱，維持目前的 `bookeeping`。

## Decisions

1. **統一 Base Path 為 `/bookeeping/`**
   - 在 `vite.config.ts`、`pwa-assets.config.ts`、`index.html` 中統一以 `/bookeeping/` 作為靜態資源前綴。
2. **現代 PWA Meta 標籤更新**
   - 保留 `<meta name="apple-mobile-web-app-capable" content="yes" />` 以相容舊版 iOS WebKit，並在緊鄰行增加 `<meta name="mobile-web-app-capable" content="yes" />` 符合新標準規範。
