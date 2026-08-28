## Purpose

提供基於 Dexie.js (IndexedDB) 的圖論記帳引擎核心，負責節點與款項流向邊的本地儲存、軟刪除與動態餘額計算。

## ADDED Requirements

### Requirement: 本地圖資料庫儲存模型與索引
系統 SHALL 使用 Dexie.js (IndexedDB) 提供 `nodes` 與 `edges` 的持久化儲存，並支援時間戳排序與軟刪除機制。

#### Scenario: 建立具有 ULID 與時間戳的節點
- **GIVEN** Dexie 資料庫已完成初始化
- **WHEN** 呼叫建立節點函式，指定名稱 `玉山銀行`、型別 `asset`
- **THEN** 系統生成唯一的 ULID 作為 `id`，設定 `is_deleted = false`，並記錄毫秒級 `updated_at` 時間戳記儲存於 `nodes` 資料表

#### Scenario: 建立資金流向有向邊
- **GIVEN** 資料庫中已存在來源節點 $A$ 與目標節點 $B$
- **WHEN** 呼叫建立邊函式，指定 `from_node_id = A`、`to_node_id = B`、`amount = 150`、`timestamp = 1779840000000`
- **THEN** 系統建立一筆 `edges` 紀錄，設定 `is_deleted = false` 與當前 `updated_at`

### Requirement: 節點與邊的軟刪除機制 (Tombstone)
系統 SHALL 支援對 `FinanceNode` 與 `FinanceEdge` 進行軟刪除，將 `is_deleted` 設為 `true` 並更新 `updated_at`，以保留 LWW 同步標記。

#### Scenario: 刪除特定交易紀錄 (Edge)
- **GIVEN** 一筆存在且有效（`is_deleted = false`）的交易紀錄
- **WHEN** 執行刪除該交易邊操作
- **THEN** 該筆交易紀錄的 `is_deleted` 被更新為 `true`，`updated_at` 更新為當前時間，且後續統計計算時自動排除該筆紀錄

### Requirement: 基於圖論的入度、出度與資產餘額計算
系統 SHALL 依據有向邊的流入（In-degree）與流出（Out-degree）即時動態計算節點餘額與各類別合計。

#### Scenario: 計算資產帳戶餘額
- **GIVEN** 節點 `錢包`（型別 `asset`）
- **AND** 存在流入邊（薪資 $\to$ 錢包，金額 $1000$）與流出邊（錢包 $\to$ 午餐，金額 $200$），且皆未被刪除
- **WHEN** 查詢節點 `錢包` 的餘額
- **THEN** 系統回傳計算結果為 $800$ ($1000 - 200$)

#### Scenario: 計算指定時間區間的支出總額
- **GIVEN** 系統中存在多筆不同時間點流向 `expense` 類別節點的交易邊
- **WHEN** 指定時間區間查詢支出合計
- **THEN** 系統僅加總該時間區間內、未被軟刪除的支出流入金額總和
