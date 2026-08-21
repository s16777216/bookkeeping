## Context

`QuickEntrySheet` 採用底部向上滑出的 Drawer / Sheet 互動模式。目前使用者在手機上若想取消記帳，需精準點擊右上角 `✕` 或尋找頂部殘留的狹小遮罩區域。原生行動端標準設計通常配備頂部拖把條（Drag Handle），並允許使用者直接向下滑動收起。

## Goals / Non-Goals

**Goals:**
- 在 `QuickEntrySheet` 頂部區域（Drag Handle 與 Header）支援流暢的 Touch 下拉手勢。
- 下拉時面板應具有即時位移反饋（`transform: translateY(Npx)`），放開時具備閥值判定（> 80px 關閉，否則彈回原位）。
- 監聽全域 `keydown` 事件，在 `isOpen === true` 時按下 `Escape` 即關閉抽屜。
- 確保事件監聽在面板關閉及組件卸載時正確銷毀，避免記憶體洩漏。

**Non-Goals:**
- 不影響表單內部（如數字鍵盤、文字輸入框）的正常滑動與點擊。

## Decisions

1. **手勢作用範圍綁定於 Header 與 Drag Handle**
   - **決定**：將 Touch 事件綁定於 `.sheet-header`。
   - **原因**：避免與表單內容區域（`.sheet-content`）內部的垂直捲動產生事件搶佔或誤觸。

2. **響應式位移狀態與過渡控制**
   - **決定**：
     - 使用 `dragOffsetY` 響應式變數。
     - 拖曳過程中面板樣式綁定 `:style="{ transform: isDragging ? \`translateY(\${dragOffsetY}px)\` : undefined, transition: isDragging ? 'none' : undefined }"`。
     - 閾值定為 80px。

3. **Escape 全域監聽機制**
   - **決定**：透過 `watch(() => props.isOpen)` 動態註冊與移除 `window` 級別的 `keydown` 處理函式，並在 `onUnmounted` 中作為防禦性清理。

## Risks / Trade-offs

- **[誤觸防範]** → 僅當手指**向下滑動** (`deltaY > 0`) 時才響應位移，向上滑動不觸發位移。
