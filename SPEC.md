# 🎯 專案簡報（給 Claude CLI）

**專案名稱**：`sumu-machi-backend`
**目標**：為「首都圈・通勤導向的一頁式入口」提供後端 API。MVP 重點：

1. 使用者輸入 **勤務地駅**（路線記號/站名，日文）
2. 回傳「30 分內直達的候補駅（依沿線分組）」＋ **SUUMO 連結**
3. 紀錄 **行為事件**（輸入、檢視、外連、詳しく見る）以利後續 B2B 數據產品

> **注意**：註解＝繁體中文；對前端/DB 的字串＝日文；命名與架構遵循 FAANG 標準。

---

## 🧱 Tech Stack & 規範

- **Node.js** LTS
- **NestJS**
- **TypeORM** + **PostgreSQL 16**
- **Docker Compose**（Postgres + App）
- **dotenv** 管理環境變數
- **ESLint + Prettier**
- **commitlint**（Conventional Commits）
- **Jest**：單元＋E2E 測試
- **Logger**：Nest Logger + JSON 結構化（pino-like）

---

## 📂 專案結構（建議）

```
/src
  /modules
    /stations          // 駅・路線相關 API
    /commutes          // 通勤計算邏輯
    /events            // 行為事件追蹤
    /users             // 使用者（未來登入預留）
  /common              // 共用常數、filter、interceptor
  /database            // TypeORM entities, migrations
  /config              // 環境設定、validation schema
/test                  // 單元 & e2e 測試
```

---

## 🗄️ 資料庫設計（Postgres / TypeORM Entities）

- **stations**
  - id (uuid)
  - name_ja (text)
  - line_code (varchar)
  - geo (geometry / latlng)

- **commute_candidates**
  - id (uuid)
  - origin_station_id (fk → stations)
  - candidate_station_id (fk → stations)
  - minutes (int)

- **events**
  - id (uuid)
  - event_type (varchar) // input, view, click, detail
  - payload (jsonb)
  - created_at (timestamptz)

- **users**（預留）

---

## 🔌 API 設計（REST, 可日後加 GraphQL）

### 1. 候補駅検索

- **POST** `/commutes/search`
- Body: `{ origin: "渋谷" }`
- Res: `[ { station: "恵比寿", line: "山手線", minutes: 4, suumo_url: "..." }, ... ]`

### 2. 行為事件紀錄

- **POST** `/events`
- Body: `{ type: "click", payload: { station: "恵比寿" } }`
- Res: `{ status: "ok" }`

### 3. （預留）使用者登入

---

## ✅ 驗收標準

- 測試覆蓋率 >80%
- Docker Compose 一鍵啟動：`docker-compose up`
- Swagger (`/docs`) 自動生成 API 說明（日文表示）
- CI: lint + test 全通過

---

## 📌 任務切分（建議交給 Claude CLI 的 prompt）

1. 初始化 Nest 專案 + 設定 eslint/prettier/commitlint
2. 設定 TypeORM + Postgres + Docker
3. 建立 entities（stations, commute_candidates, events, users）
4. 撰寫 `commutes` 模組：輸入勤務地駅 → 查找候補駅（mock data 或以假資料庫實作）
5. 撰寫 `events` 模組：收集行為事件
6. 加上 Swagger（日文描述）
7. 撰寫測試（Jest）

---

## 📖 註解規範

- **程式內註解**：繁體中文，方便自己維護
- **前端回傳字串 / DB 欄位**：日文，方便未來 pitch/用戶使用

---

👉 將這份 spec 全部交給 Claude CLI，它就能自動 scaffold 並生成相應程式碼。
