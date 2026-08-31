## Context

參見 `proposal.md`。原專案依賴 GitHub Pages 與 `.github/workflows/deploy.yml` 執行雲端發布，並在 `vite.config.ts` 指定 `/bookkeeping/` 子路徑。現在地端已建置 Cloudflare Tunnel 與 Komodo 容器管理平台，需要將應用封裝為自給自足的 Docker 映像檔，並支援純地端 Multi-stage Build。

## Goals / Non-Goals

**Goals:**
- 提供高相容性的 Multi-stage `Dockerfile`，在容器內完成依賴安裝與 Vite 打包，並由 `nginx:alpine` 託管。
- 提供適配 SPA 與 PWA 快取策略的 `nginx.conf`。
- 提供簡潔的 `docker-compose.yml`，便於在 Komodo 中建立 Stack 或直接在本機 `docker compose up -d` 運行。
- 將 `vite.config.ts` 中的 `base` 與 PWA Manifest 規範更新為根路徑 `/`。
- 重寫 `.github/workflows/deploy.yml`，在 push 到 `main` 時以 Webhook 通知地端 Komodo 執行拉取與自動構建。

**Non-Goals:**
- 不推送到公共或私有 Container Registry（如 Docker Hub、GHCR），由地端 Komodo 直接依據 Git 原始碼在本地 build。
- 不在地端伺服器宿主機安裝 Node.js。

## Decisions

### 1. Multi-stage Dockerfile 設計
```dockerfile
# 階段 1：構建環境
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 階段 2：生產運行環境
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```
並搭配 `.dockerignore`（排除 `node_modules`、`dist`、`.git`、`.agent`），確保 build context 輕量快速。

### 2. `nginx.conf` 快取與 SPA 回退策略
- **SPA 路由回退**：`try_files $uri $uri/ /index.html`，防止任意子路徑或未來路由刷新出現 404。
- **PWA Service Worker 防快取死鎖**：`location = /sw.js { add_header Cache-Control "no-cache, no-store, must-revalidate"; }`，確保每次打開 App 都能檢查並套用最新發布版本。
- **靜態資源長期快取**：為帶有 hash 的 `/assets/` 設置 `Cache-Control "public, max-age=31536000, immutable"`。

### 3. `docker-compose.yml` 規範
```yaml
services:
  bookkeeping:
    build: .
    container_name: bookkeeping
    restart: unless-stopped
    ports:
      - "8080:80"
```
地端 Cloudflare Tunnel 可直接將目標指向 `http://localhost:8080` 或 Docker 網路內部服務名稱。

### 4. `vite.config.ts` 根路徑調整
- `base: '/'`
- Manifest:
  - `start_url: '/'`
  - `scope: '/'`
  - `id: '/'`

### 5. `.github/workflows/deploy.yml` 輕量化
- 移除肥大的 node 安裝與 pages 部署 action。
- 保留 push `main` 與 `workflow_dispatch` 觸發。
- 使用 `curl` 發送 POST 請求至 `${{ secrets.KOMODO_WEBHOOK_URL }}`，由地端 Komodo 響應並完成本地 Build & Deploy。

## Risks / Trade-offs

- **[Risk] Cloudflare Tunnel 連接埠衝突** → Mitigation: 在 `docker-compose.yml` 中預設使用 `8080:80`，可根據地端實際環境透過環境變數或 compose 覆寫修改。
- **[Risk] PWA 圖示路徑遺失** → Mitigation: 將 `base` 改為 `/` 後，`pwa-192x192.png` 等圖示從根路徑載入，符合標準獨立網域規範。

## Migration Plan

1. 建立 `.dockerignore`、`Dockerfile`、`nginx.conf`、`docker-compose.yml`。
2. 更新 `vite.config.ts` 根路徑。
3. 更新 `.github/workflows/deploy.yml`。
4. 本地執行 `npm run build` 驗證根路徑打包結果。
