# Design: 節點擁有者與邊界流向模型 (Node Owner Boundary Graph Model)

## Context

在先前的模型中，系統使用靜態的 `type: 'asset' | 'liability' | 'income' | 'expense'` 來分類節點。此設計雖然符合傳統記帳直覺，但在圖論本質上，任何分類都只是觀察者所處角度的投影。

透過引入 **節點擁有者（`owner`）** 與 **系統邊界理論（Boundary Cut）**，所有節點皆為平等的流動實體。系統預設以 `'me'`（我）為觀測視角，根據資金跨越邊界的方向（穿入、穿出、內部）全自動判定收支與轉帳性質。

## Goals / Non-Goals

### Goals
- 擴充 `FinanceNode` 資料模型，加入 `owner: string`（預設 `'me'` 或 `'external'`）與 `is_account: boolean`。
- 重構 `useGraphEngine.ts` 計算邏輯：以動態 `currentLens`（預設 `'me'`）作為觀察邊界，精準計算資產結餘、總收入、總支出與內部轉帳。
- 升級 `ReceiptCard` 與 `QuickEntrySheet`：無縫支援自動識別流向性質，使用者無需切換任何收支模式。
- 保留向後相容性，既有示範資料平滑升級。

### Non-Goals
- 複雜跨使用者雲端即時同步與權限角色（此於後續後端階段實現）。
- 多幣別即時匯率轉換。

## Decisions

### 1. 採用 `owner` 與邊界判定取代靜態收支分類
- **Decision**: 廢除以節點固定類型決定收支的硬性限制，改以 `owner` 集合的邊界跨越方向動態判定：
  $$\text{Income} = \sum_{(u \notin S, v \in S)} \text{amount}(u \to v)$$
  $$\text{Expense} = \sum_{(u \in S, v \notin S)} \text{amount}(u \to v)$$
  $$\text{Transfer} = \sum_{(u \in S, v \in S)} \text{amount}(u \to v)$$
- **Rationale**: 完美解決退款抵銷、公私分流、代墊借還款等傳統記帳痛點，且為未來的「多視角（個人 / 家庭 / 工作室）」奠定數學基礎。

### 2. 引入 `is_account` 屬性區分實體帳戶與概念對象
- **Decision**: 透過 `is_account: boolean` 標記該節點是否為具有蓄水池實體帳戶（如銀行、現金錢包、悠遊卡），便於在資產看板中聚合顯示淨資產。

## Technical Architecture

```
                    ┌──────────────────────────────┐
                    │ 外部世界 (owner !== 'me')     │
                    │ - 科技公司                   │
                    │ - 一蘭拉麵                   │
                    └───────┬──────────────▲───────┘
                            │              │
                    穿入邊界│              │穿出邊界
                  【＋ 收入】│              │【－ 支出】
                            ▼              │
         ╔═════════════════════════════════╪════════════════╗
         ║         【 "我" 的內部邊界 (owner === 'me') 】     ║
         ║                                                  ║
         ║    ┌──────────────┐     內部轉帳   ┌───────────┐ ║
         ║    │ 玉山銀行主帳戶│ ────────────▶ │ 現金零錢包│ ║
         ║    └──────────────┘                └───────────┘ ║
         ╚══════════════════════════════════════════════════╝
```

## Data Models

```typescript
export interface FinanceNode {
  id: string;          // ULID
  name: string;        // 帳戶或對象名稱
  owner: string;       // 擁有者 (預設 'me' 或 'external')
  is_account: boolean; // 是否為實體帳戶 (資產蓄水池)
  type?: NodeType;     // 語意相容標籤
  icon?: string;       // Emoji 圖示
  currency?: string;   // 預設 'TWD'
  updated_at: number;
  is_deleted: boolean;
}
```

## Risks & Mitigations

- **Risk**: 舊版 Dexie 資料庫缺少 `owner` 欄位。
  - **Mitigation**: 在讀取或初始化種子資料時，自動填補預設值（資產類設為 `owner: 'me', is_account: true`，其他設為 `owner: 'external', is_account: false`）。
