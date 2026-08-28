# Delta Spec: Graph Engine (圖論記帳引擎)

## MODIFIED Requirements

### Requirement: 本地圖資料庫儲存模型與索引
系統 SHALL 使用 Dexie.js (IndexedDB) 提供 `nodes` 與 `edges` 的持久化儲存，節點 SHALL 包含 `owner`（擁有者）屬性（預設為 `'me'` 或 `'external'`）與 `is_account`（是否為實體蓄水池帳戶），並支援時間戳排序與軟刪除機制。

#### Scenario: 建立具有 ULID 與時間戳的節點
- **GIVEN** Dexie 資料庫已完成初始化
- **WHEN** 呼叫建立節點函式，指定名稱 `玉山銀行`、`owner = 'me'`、`is_account = true`
- **THEN** 系統生成唯一的 ULID 作為 `id`，儲存 `owner = 'me'`，設定 `is_deleted = false`，並記錄毫秒級 `updated_at` 時間戳記儲存於 `nodes` 資料表

#### Scenario: 建立資金流向有向邊
- **GIVEN** 資料庫中已存在來源節點 $A$ 與目標節點 $B$
- **WHEN** 呼叫建立邊函式，指定 `from_node_id = A`、`to_node_id = B`、`amount = 150`、`timestamp = 1779840000000`
- **THEN** 系統建立一筆 `edges` 紀錄，設定 `is_deleted = false` 與當前 `updated_at`

### Requirement: 基於圖論的入度、出度與資產餘額計算
系統 SHALL 依據節點的擁有者邊界（`owner`）與有向邊流向，動態計算特定視角（預設為 `'me'`）下的資產餘額、總收入、總支出與內部轉帳。

#### Scenario: 計算資產帳戶餘額
- **GIVEN** 節點 `錢包`（`owner = 'me'`, `is_account = true`）
- **AND** 存在流入邊（薪資 $\to$ 錢包，金額 $1000$）與流出邊（錢包 $\to$ 午餐，金額 $200$），且皆未被刪除
- **WHEN** 查詢節點 `錢包` 的餘額
- **THEN** 系統回傳計算結果為 $800$ ($1000 - 200$)

#### Scenario: 計算指定時間區間的支出總額
- **GIVEN** 存在邊 $E_1$（`玉山銀行 (me)` $\to$ `一蘭拉麵 (external)`，金額 $290$）
- **WHEN** 指定時間區間查詢支出合計
- **THEN** 系統依據邊界判定從 `me` 流向 `external` 之款項加總為支出總額

#### Scenario: 依據邊界跨越自動判定收入與支出總額
- **GIVEN** 存在邊 $E_1$（`科技公司 (external)` $\to$ `玉山銀行 (me)`，金額 $65000$）
- **AND** 存在邊 $E_2$（`玉山銀行 (me)` $\to$ `一蘭拉麵 (external)`，金額 $290$）
- **AND** 存在邊 $E_3$（`玉山銀行 (me)` $\to$ `現金皮夾 (me)`，金額 $5000$）
- **WHEN** 結算 `'me'` 視角之收支概覽
- **THEN** 系統判定 $E_1$ 為收入（+$65,000$）、$E_2$ 為支出（-$290$）、$E_3$ 為內部轉帳（不影響總資產淨值）
