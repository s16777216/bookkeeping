## Context

在記帳抽屜 [QuickEntrySheet.vue](file:///e:/works/記帳/src/components/QuickEntrySheet.vue) 中，單純的算式字串解析無法提供如原生計算機般自然流暢的輸入反饋。為提供極致的單手輸入手感，本設計在**維持目前專案極簡黑白紙本收據風格**的前提下，全面復刻 **iOS 計算機的核心狀態機架構與標準 5 列佈局**。

## Goals / Non-Goals

**Goals:**
- **功能 100% 復刻 iOS 計算機狀態機**：
  - 核心狀態：`displayValue` (主顯示字串)、`previousValue` (前操作數)、`activeOperator` (當前選中運算符)、`waitingForOperand` (是否等待下一個數字)。
  - 四則運算支援：`+`, `-`, `×`, `÷`, `%`。
  - 運算符按鍵選中時反色高亮（Active State），若連續點擊不同運算符則平滑切換高亮。
  - 連續鏈式計算（Chaining）：若輸入 `10 + 20` 後直接按 `+`，主螢幕即時結算為 `30` 並讓新運算符保持高亮。
  - `AC` 與 `C` 動態切換：輸入數字時顯示 `C`，重置或清除後顯示 `AC`。
- **算式可見與結算防呆 (iOS 18 Math History 風格)**：
  - 頂部保留淡雅的累進式算式軌跡條（例如 `10 + 20` 按 `+` 結算為 `30 +`，保持 iOS 經典累進風格）。
  - 按下 `=` 結算後，算式條固定顯示 `${prev} ${op} ${curr} =`，主螢幕顯示最終結果。
  - **嚴格結算保護（Grill 定案）**：無論是輸入算式或純單筆數字，**一律必須點擊過一次 `=` 結算確認**，未經 `=` 確認前點擊儲存，一律阻擋並提示「請先按 = 完成結算」。
  - **異常處理（Grill 定案）**：除以零（`÷ 0`）時顯示「錯誤」，運算符鎖定且清除鍵切換為 `AC`，禁止儲存交易直到點擊 `AC` 重置。
  - **退格撤銷（Grill 定案）**：當運算符處於反白高亮選中等待下一個操作數時，點擊 `⌫` 退格鍵直接撤銷運算符狀態並熄滅高亮，回到前一個數字。
- **標準 iOS 5 列佈局（樣式維持黑白極簡）**：
  - 5 列標準排版，底層 `0` 鍵跨兩欄寬度。
  - 按鍵高度緊湊化控制（每鍵約 38~42px），配合三段式佈局（Scrollable Body），在各種手機螢幕上完美適配。
- **維持原有佈局與輔助功能**：
  - 底部固定按鈕（Fixed Footer）適配 iOS 安全區 `env(safe-area-inset-bottom)`。
  - 標籤單行水平滑動（Horizontal Scroll Chips）。

**Non-Goals:**
- 不套用 iOS 橙灰彩色主題，維持專案現有高質感 Paperless Minimalist 黑白灰視覺。
- 不引入第三方大型計算機函式庫，純 Vue 3 + TypeScript 實現精準暫存器狀態機。

## Decisions & State Machine Architecture

### 1. 核心暫存器狀態機

```
┌─────────────────────────────────────────────────────────────┐
│                   iOS Register State Machine                │
├─────────────────────────────────────────────────────────────┤
│ displayValue       : string (例如 "85", "35", "120")         │
│ previousValue      : number | null                          │
│ activeOperator     : '+' | '-' | '×' | '÷' | null           │
│ waitingForOperand  : boolean                                │
│ isEvaluated        : boolean (是否剛剛按下 =)                 │
│ historyExpression  : string (例如 "85 + 35")                 │
└─────────────────────────────────────────────────────────────┘
```

#### 按鍵處理邏輯表 (Transition Table)

| 按鍵類型 | 條件 / 狀態 | 狀態機行為 (State Actions) |
| :--- | :--- | :--- |
| **數字 (0~9)** | `waitingForOperand === true` | `displayValue = key`, `waitingForOperand = false`, `activeOperator = null` |
| | `isEvaluated === true` | 開始新計算：`displayValue = key`, `previousValue = null`, `isEvaluated = false`, `historyExpression = ""` |
| | 正常輸入 | `displayValue === '0' ? key : displayValue + key` |
| **小數點 (.)** | `waitingForOperand === true` | `displayValue = '0.'`, `waitingForOperand = false` |
| | 正常輸入 | 若未包含 `.` 則追加 `.` |
| **運算符 (+, -, ×, ÷)** | `activeOperator !== null && waitingForOperand` | 使用者更換運算符：直接切換 `activeOperator = key`（不重複計算） |
| | `previousValue !== null && !waitingForOperand` | 鏈式計算：先執行上一運算 `result = calc(prev, op, current)`，`displayValue = result`, `previousValue = result`, `activeOperator = key`, `waitingForOperand = true` |
| | 首次輸入運算符 | `previousValue = parseFloat(displayValue)`, `activeOperator = key`, `waitingForOperand = true`, 更新 `historyExpression` |
| **等號 (=)** | `activeOperator !== null && previousValue !== null` | 結算：`result = calc(prev, op, current)`, `displayValue = result`, `isEvaluated = true`, `historyExpression = "${prev} ${op} ${current} ="`, `activeOperator = null`, `waitingForOperand = false` |
| **清除 (AC / C)** | 顯示為 `C` | 只清空當前輸入 `displayValue = '0'`，暫存器與 `activeOperator` 保留，按鈕變為 `AC` |
| | 顯示為 `AC` | 全部重置：`displayValue = '0'`, `previousValue = null`, `activeOperator = null`, `waitingForOperand = false`, `historyExpression = ""` |
| **退格 (⌫)** | 正在輸入數字時 | 刪除最後一位；若只剩一位則變為 `'0'`；支援數字區向左滑動手勢觸發 |

### 2. 標準 5 列佈局結構

```
Row 1: [ AC / C ] [  ⌫  ] [  %  ] [  ÷  ]
Row 2: [   7    ] [  8  ] [  9  ] [  ×  ]
Row 3: [   4    ] [  5  ] [  6  ] [  -  ]
Row 4: [   1    ] [  2  ] [  3  ] [  +  ]
Row 5: [     0 (span 2)     ] [  .  ] [  =  ]
```

## Risks / Trade-offs

- **[Risk] 5 列鍵盤在小尺寸手機（如 iPhone SE）上使抽屜內容變長**：
  - 透過將鍵盤按鈕高度自適應控制在 `38~40px`，且起點/終點帳戶選擇器採雙欄並排、標籤單行滑動，確保表單核心在小螢幕上捲動極小甚至免捲動即可見。
