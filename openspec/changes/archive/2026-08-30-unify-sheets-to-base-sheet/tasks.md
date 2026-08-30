## 1. 建立通用 BaseSheet 基礎元件

- [x] 1.1 在 `src/components/BaseSheet.vue` 建立元件架構，實作 `<Teleport to="body">`、`<Transition name="sheet">`、毛玻璃遮罩與圓角陰影
- [x] 1.2 在 `BaseSheet.vue` 實作下拉 120px 拖曳關閉手勢（`startDrag`, `moveDrag`, `endDrag`）、平滑回彈、ESC 按鍵監聽與視窗捲動鎖定
- [x] 1.3 實作 `size` 屬性（`'sm' | 'md' | 'lg' | 'auto'`）與 `#title`、`#default`、`#footer` 三大插槽

## 2. 重構 EditNodeSheet 接入 BaseSheet

- [x] 2.1 修改 `src/components/EditNodeSheet.vue`，改為使用 `<BaseSheet size="md">`，移除重複的手勢、Teleport 與外殼樣式
- [x] 2.2 驗證節點名稱、Emoji 選擇、主權設定與封存功能正常運作

## 3. 重構 QuickEntrySheet 接入 BaseSheet

- [x] 3.1 修改 `src/components/QuickEntrySheet.vue`，改為使用 `<BaseSheet size="lg">`，將原本的 form 抽屜替換為 `BaseSheet` 結構
- [x] 3.2 將小算盤、日期時間、標籤、備註放入預設插槽，將雙送出按鈕放入 `#footer` 插槽
- [x] 3.3 執行 `npm run build` 驗證 TypeScript 型別與全站打包
