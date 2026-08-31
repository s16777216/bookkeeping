## Why

目前專案透過 GitHub Pages 進行前端靜態部署，受限於固定的子目錄路徑（`/bookkeeping/`）以及公共雲端託管。為了落實純粹的 Local-first 私人記帳隱私，並整合使用者地端伺服器現有的 Docker、Komodo 容器管理平台與 Cloudflare Tunnel（自動提供安全 HTTPS 以完整支援 PWA 離線存取），本提案將部署方式轉換為：地端 Multi-stage Docker 容器化運行，並透過 GitHub Action / Webhook 觸發地端 Komodo 自動構建與部署。

## What Changes

- **新增多階段 Docker 構建設定（`Dockerfile`）**：
  - 第一階段使用 `node:20-alpine` 執行依賴安裝與 `npm run build`。
  - 第二階段使用輕量 `nginx:alpine`，僅複製 `./dist` 產物，產出體積小於 20MB 的純淨運作容器。
- **新增 Nginx 靜態伺服器配置（`nginx.conf`）**：
  - 支援 SPA 前端路由回退（`try_files $uri $uri/ /index.html`）。
  - 為 PWA 核心檔案（如 `sw.js`）設置 `no-cache` 標頭，防止快取鎖死更新。
- **新增 Docker Compose 編排配置（`docker-compose.yml`）**：
  - 提供 Komodo 容器平台一鍵導入或 Stack 部署之標準定義。
- **調整 Vite 與 PWA 根路徑（`vite.config.ts`）**：
  - 將原本專為 GitHub Pages 設置的 `base: '/bookkeeping/'` 改為獨立網域標準的根路徑 `base: '/'`。
  - 同步將 PWA manifest 的 `start_url`、`scope` 與 `id` 調整為 `/`。
- **改寫自動化部署工作流程（`.github/workflows/deploy.yml`）**：
  - 移除原先推送到 GitHub Pages 的工作流程。
  - 改為在 push 到 `main` 分支時，發送 Webhook 請求通知地端 Komodo 執行拉取與 Multi-stage 構建。

## Capabilities

### New Capabilities
<!-- 純部署與運維工具鏈配置，不更動業務規範，由 .openspec.yaml 的 skip_specs: true 聲明 -->

### Modified Capabilities
<!-- 無既有 specs 修改 -->

## Impact

- **Affected Files**:
  - `Dockerfile` [NEW]
  - `nginx.conf` [NEW]
  - `docker-compose.yml` [NEW]
  - `vite.config.ts` [MODIFY]
  - `.github/workflows/deploy.yml` [MODIFY]
- **系統影響**:
  - 移除對 GitHub Pages 雲端託管的依賴。
  - 本地開發（`npm run dev`）與本地建置（`npm run build`）完全不受影響且路徑更乾淨。
