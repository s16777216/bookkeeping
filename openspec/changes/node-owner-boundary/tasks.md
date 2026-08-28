## 1. 資料模型與資料庫升級

- [ ] 1.1 更新 `src/types/finance.ts` 加入 `owner` 與 `is_account` 定義
- [ ] 1.2 更新 `src/db/seeds.ts` 賦予預設節點 `owner: 'me'` 或 `owner: 'external'` 屬性

## 2. 圖論邊界運算引擎升級

- [ ] 2.1 重構 `useGraphEngine.ts` 實作基於 `owner` 邊界跨越之自動收支與轉帳判定邏輯
- [ ] 2.2 實作以 `'me'` 為觀測邊界之資產結餘、總收入與總支出指標運算

## 3. UI 介面整合與流向標示

- [ ] 3.1 升級 `ReceiptCard.vue` 依據 `owner` 邊界動態呈現「收入 / 支出 / 內部轉帳」識別標記
- [ ] 3.2 升級 `QuickEntrySheet.vue` 整合無模式連線記帳選單
- [ ] 3.3 升級 `NodesView.vue` 支援檢視與設定節點擁有者（預設為 `me`）

## 4. 驗證與測試

- [ ] 4.1 測試各種流向（外部➔我、我➔外部、我➔我）之自動判定與餘額計算
- [ ] 4.2 驗證端到端記帳流向與 PWA 運行無誤
