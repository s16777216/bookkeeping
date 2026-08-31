## 1. 容器化環境與伺服器配置

- [ ] 1.1 建立 `.dockerignore` 與多階段 `Dockerfile`（Node 20 編譯 + Nginx Alpine 靜態託管）
- [ ] 1.2 建立 `nginx.conf`，配置 SPA 路由回退與 PWA Service Worker `no-cache` 規則
- [ ] 1.3 建立 `docker-compose.yml` 容器編排檔供 Komodo Stack 部署使用

## 2. 應用路徑與自動化部署調整

- [ ] 2.1 修改 `vite.config.ts` 將 `base` 及 PWA manifest 相關路徑由 `/bookkeeping/` 調整為根路徑 `/`
- [ ] 2.2 更新 `.github/workflows/deploy.yml` 為 push main 分支時發送 Webhook 請求觸發地端 Komodo

## 3. 本地建置與配置驗證

- [ ] 3.1 執行 `npm run build` 驗證根路徑打包與 PWA manifest 生成正常
- [ ] 3.2 檢查 Dockerfile、Nginx 與 Compose 配置語法正確
