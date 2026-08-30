## Purpose

為全站提供標準統一的底部滑出抽屜（BaseSheet）元件，封裝 Teleport 根節點渲染、毛玻璃遮罩、頂部把手與標題拖曳手勢、大中小尺寸自適應與固定 Footer 操作列。

## Requirements

### Requirement: 統一抽屜架構與根節點 Teleport 渲染
系統 SHALL 提供 `BaseSheet.vue` 元件，透過 `<Teleport to="body">` 進行渲染，保證抽屜及其半透明遮罩能 100% 覆蓋所有頁面元素（包含底部導覽列 `BottomNavBar`），並突破任何父層容器之 CSS Stacking Context 隔離。

#### Scenario: 開啟節點編輯抽屜覆蓋導覽列
- **WHEN** 使用者在帳戶管理分頁點擊任一節點卡片開啟抽屜
- **THEN** 抽屜與遮罩平滑自螢幕底部滑出，並完全覆蓋位於底部的 `BottomNavBar`

#### Scenario: 開啟新增收據抽屜覆蓋導覽列
- **WHEN** 使用者在任何分頁點擊快捷記帳開啟新增收據抽屜
- **THEN** 抽屜與遮罩自螢幕底部滑出，並完全覆蓋底部的 `BottomNavBar`

### Requirement: 下拉手勢拖曳關閉與平滑回彈
`BaseSheet` SHALL 支援頂部把手區域觸控拖曳下拉（Swipe Down to Dismiss）互動，並具備智慧門檻、防止背景連動拉動（touch-action: none 與 preventDefault）與物理回彈效果。

#### Scenario: 拖曳下拉超過門檻自動關閉
- **WHEN** 使用者在頂部把手或標題列向下拖曳距離超過 120px 並釋放
- **THEN** 抽屜觸發關閉事件（emit `close`），流暢滑出螢幕

#### Scenario: 拖曳未達門檻平滑回彈
- **WHEN** 使用者向下拖曳距離小於 120px 並釋放
- **THEN** 抽屜以平滑過渡動畫（`0.25s ease-out`）回彈至展開原位

### Requirement: 多尺寸高度控制 (Size Prop)
`BaseSheet` SHALL 支援 `size` 屬性，提供 `'sm'`、`'md'`、`'lg'`、`'auto'` 四種尺寸規格以適配不同長度之表單。

#### Scenario: 節點編輯採用中尺寸 (size="md")
- **WHEN** `EditNodeSheet` 以 `size="md"` 渲染 `BaseSheet`
- **THEN** 抽屜容器最大高度限制在約 72dvh，精準包覆表單內容與 Emoji 宮格

#### Scenario: 新增收據採用大尺寸 (size="lg")
- **WHEN** `QuickEntrySheet` 以 `size="lg"` 渲染 `BaseSheet`
- **THEN** 抽屜容器展開至約 92dvh 高度，內部計算機、歷史算式條與標籤支援平滑滾動

### Requirement: 統一插槽與視覺質感規範
`BaseSheet` SHALL 內建標準遮罩（`rgba(0,0,0,0.45)` 與 `backdrop-filter: blur(2px)`）、頂部 20px 圓角與深邃陰影，並提供 `#title`、`#default`（可滾動主體）與 `#footer`（固定底部操作列）插槽。

#### Scenario: 底部操作列釘選固定
- **WHEN** 抽屜內容長度超出螢幕可見區域並在內部滾動時
- **THEN** `#footer` 插槽內的儲存與主要操作按鈕保持釘選固定於抽屜最底部，不隨內容捲動而消失
