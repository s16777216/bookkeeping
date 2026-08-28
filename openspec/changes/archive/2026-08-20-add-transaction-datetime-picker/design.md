## Context

參見 `proposal.md`。目前 `QuickEntrySheet.vue` 透過 emit `submit` 將表單資料送至 `App.vue`，再呼叫 `useGraphEngine.ts` 的 `createEdge` 寫入 Dexie DB（IndexedDB）。底層 `FinanceEdge` 與 `createEdge` 函式本已支援 `timestamp: number` 欄位，只需在 UI 層提供日期時間狀態輸入並與事件接軌。

## Goals / Non-Goals

**Goals:**
- 在 `QuickEntrySheet.vue` 中（位於金額鍵盤下方、交易備註上方）支援自訂日期與時分（`YYYY-MM-DDTHH:mm` 格式）。
- 提供「⚡ 現在」、「昨天」、「前天」三個快捷標籤按鈕，支援雙向狀態連動（點擊快捷按鍵平移日期並保留時分；手動挑選日期時即時比對並高亮對應快捷標籤）。
- 開啟抽屜時生命週期策略：每次開啟抽屜一律重設為當前本地時區最新時刻，預設高亮「⚡ 現在」。
- 支援自由選取過去或未來日期時間（無未來時間限制），送出時轉換為 Unix 毫秒時間戳記，確保收據清單按正確時間倒序排列。

**Non-Goals:**
- 不在此次變更中引入額外龐大的第三方日期選擇套件，優先使用原生 HTML5 `datetime-local` 配合專屬樣式包裝，維持極速載入與輕量特性。
- 不修改既有 IndexedDB 資料表 schema（已有 `timestamp` 欄位）。

## Decisions

### 1. 採用 HTML5 `<input type="datetime-local">` 配合雙向快捷標籤
- **決策內容**：在 `QuickEntrySheet.vue` 中配置 `datetime-local` 輸入框，並在其上方配置「⚡ 現在」、「昨天」、「前天」快捷按鍵。
- **佈局順序**：置於「3. 金額 (AMOUNT)」與數字鍵盤之後、「4. 交易備註」之前。
- **雙向連動邏輯**：
  - 點擊「⚡ 現在」：重設為點擊時的當下精確時刻。
  - 點擊「昨天」/「前天」：保留當前選擇的「時:分」，將年份與月日位移 -1 或 -2 天。
  - 手動修改原生日期時間選擇器：透過計算屬性（Computed）即時比對日期是否為今天、昨天或前天，若是則自動啟用對應標籤的高亮選中樣式，若為其他日期則無標籤高亮。

### 2. 時區與時間格式轉換處理
- **決策內容**：
  - 本地時間格式化工具函式：`toLocalISOString(date: Date)`，產生符合 `<input type="datetime-local">` 要求的 `YYYY-MM-DDTHH:mm` 字串（避免 `toISOString()` 產生的 UTC 時間偏移）。
  - 送出轉換：`new Date(dateTimeStr).getTime()` 取得毫秒時間戳記。
  - 防呆校驗：若使用者輸入格式異常或無效（`isNaN`），自動 fallback 回 `Date.now()`。
  - 未來時間政策：允許使用者選取未來時間（不設 `max` 上限）。

### 3. 抽屜狀態生命週期 (Lifecycle)
- **決策內容**：
  - 透過 `watch(() => props.isOpen, (open) => { ... })`，每次抽屜開啟時一律將時間欄位重設為 `toLocalISOString(new Date())`，確保即時記帳的時間準確無殘留。

### 4. Payload 介面擴充
- **決策內容**：
  - `QuickEntrySheet` 的 `submit` emit payload 擴充為：
    ```ts
    {
      from_node_id: string;
      to_node_id: string;
      amount: number;
      memo: string;
      timestamp: number;
    }
    ```
  - `App.vue` 接收 payload 並直接傳遞給 `createEdge(payload)`。

## Risks / Trade-offs

- **[Risk] 使用者在桌面端瀏覽器輸入格式不一致** → Mitigation: 使用標準 `datetime-local` 並設置預設值，送出前做 `isNaN(timestamp)` 防呆校驗，若時間無效則 fallback 回 `Date.now()`。
- **[Risk] 快捷按鈕切換後使用者不清楚當前日期** → Mitigation: 快捷按鈕與下方 `datetime-local` 雙向連動即時同步高亮與數值。
