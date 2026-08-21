## Context

目前 [NodesView.vue](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/components/NodesView.vue) 以 2 欄網格展示所有財務節點，但點擊卡片無反應，僅能透過右側 `✕` 刪除。底層 [useGraphEngine.ts](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/composables/useGraphEngine.ts) 已提供 `updateNode(id, updates)`，需要補齊 UI 互動介面。

## Goals / Non-Goals

**Goals:**
- 點擊任意節點卡片時，由底部滑出「編輯節點」抽屜面板（Edit Node Sheet）。
- 抽屜內預填該節點既有之名稱、代表 Emoji 與分類類型。
- 支援使用者修改後點擊「儲存修改」，透過 `updateNode` 寫入 IndexedDB 並即時刷新介面與資產指標。
- 在抽屜內整合「刪除此節點」危險動作按鈕（含二次確認）。
- 支援向下拖曳收起（Swipe to Dismiss）、按 `Esc` 鍵關閉與 Body Scroll Lock。

**Non-Goals:**
- 不在此次變更中更動既有交易邊（Edge）的關聯，僅更新節點本身屬性。

## Decisions

1. **抽屜式編輯面板架構**
   - **決定**：在 `NodesView.vue` 內部整合 `<Transition name="sheet">` 底部抽屜，當 `editingNode` 為非空時開啟。
   - **原因**：避免跳頁，維持行動端一致的 Bottom Sheet 體驗。

2. **卡片點擊觸發編輯，分離獨立刪除按鈕**
   - **決定**：整張節點卡片皆為點擊區域（cursor: pointer），卡片右側保留或在抽屜內提供明確的刪除按鈕。

3. **雙向連動與狀態重置**
   - **決定**：當選取節點時將資料複製到本地 ref（`editName`, `editType`, `editIcon`），儲存時校驗非空後送出。

## Risks / Trade-offs

- **[節點類型變更影響餘額指標]** → `updateNode` 內部已封裝 `refreshData()`，儲存後會自動重新計算入度/出度與總資產指標，資料保持一致。
