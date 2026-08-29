## Context

專案目前有兩組底部抽屜（Bottom Sheet）：
1. `QuickEntrySheet.vue`：負責記帳流向、iOS 計算機輸入、歷史算式條與標籤。原本直接位於 `App.vue`。
2. `EditNodeSheet.vue`：負責節點名稱、Emoji 選擇、主權設定與封存。原本包在 `NodesView.vue` 中。

兩者在外殼陰影、遮罩、圓角、把手結構與手勢回彈細節各有實作，且 `QuickEntrySheet` 未使用毛玻璃遮罩。透過抽取通用 `BaseSheet.vue`，將兩者統一至以 `EditNodeSheet` 的高質感外殼標準為範本的體系。

## Goals / Non-Goals

**Goals:**
- 建立通用抽屜基底元件 `BaseSheet.vue`。
- 封裝 `<Teleport to="body">`，保證 100% 覆蓋所有導覽列與突破父層 Stacking Context。
- 支援 `size: 'sm' | 'md' | 'lg' | 'auto'` 彈性高度規範：
  - `'sm'`: `max-height: min(45dvh, 420px)`
  - `'md'`: `max-height: min(70dvh, 580px)`（節點編輯專用）
  - `'lg'`: `height: min(92dvh, 800px)`（收據長表單專用）
  - `'auto'`: `max-height: 90dvh`
- 封裝整合式頂部把手觸控拖曳熱區（`sheet-handle-area`），支援下拉 120px 自動觸發關閉。
- 封裝固定於底部的 `sheet-footer` 容器與 `<template #footer>` 插槽。
- 重構 `EditNodeSheet.vue` 與 `QuickEntrySheet.vue` 接入 `BaseSheet`。

**Non-Goals:**
- 不改變 `QuickEntrySheet` 內部已實作之 iOS 5 列小算盤狀態機與金額輸入邏輯。
- 不改變 `EditNodeSheet` 內部的 Emoji 宮格與資料更新邏輯。

## Decisions

### 1. `BaseSheet.vue` API 設計
- **Props**:
  - `isOpen: boolean`
  - `title?: string`
  - `size?: 'sm' | 'md' | 'lg' | 'auto'` (預設 `'auto'`)
- **Emits**:
  - `close: () => void`
- **Slots**:
  - `#title`: 自定義標題區域（預設顯示 `props.title` 與 ✕ 關閉按鈕）
  - `#default`: 可滾動表單主體（`sheet-body`）
  - `#footer`: 底部固定操作列（`sheet-footer`）

### 2. 手勢與樣式架構
- 遮罩：`rgba(0, 0, 0, 0.45)` + `backdrop-filter: blur(2px)`。
- 抽屜頂部圓角：`20px`。
- 陰影：`0 -10px 30px rgba(0, 0, 0, 0.15)`。
- 拖曳手勢：透過 inline style 綁定 `translateY(${dragOffset}px)`，未達 120px 時平滑過渡回彈（`transition: 0.25s ease-out`）。
- 鍵盤與鎖屏：開啟時自動將 `document.body.style.overflow = "hidden"`，支援 `Escape` 按鍵退出。

## Risks / Trade-offs

- **[Risk] QuickEntrySheet 內部的小算盤與長表單在全新 BaseSheet 容器中高度推擠** → 透過 `size="lg"` 與 `height: min(92dvh, 800px)` 給予充裕空間，內部 `sheet-body` 支援流暢滾動（`-webkit-overflow-scrolling: touch; overscroll-behavior: contain`）。
