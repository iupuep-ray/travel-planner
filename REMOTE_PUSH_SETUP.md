# 遠端推播（FCM）設定步驟

目標：Todo 即使在使用者沒開 App 時也能收到提醒，且只通知「建立者帳號 + 被指派者」。

## 1. Firebase Console 開啟 Cloud Messaging

1. 到 Firebase Console -> 你的專案（`ray-travel-japan`）。
2. 進入 `Project settings` -> `Cloud Messaging`。
3. 在 `Web configuration` 建立一組 `Web Push certificates`（VAPID key）。
4. 複製 `Key pair` 的 Public Key。

## 2. 設定前端環境變數

在專案根目錄 `.env` 補上：

```env
VITE_FIREBASE_VAPID_KEY=你在 Cloud Messaging 複製的 Public Key
```

## 3. 安裝並部署 Cloud Functions

本專案已新增 `functions/` 排程函式（每 15 分鐘執行一次）。

在專案根目錄執行：

```bash
cd functions
npm install
npm run build
cd ..
firebase deploy --only functions
```

> 若 Firebase 專案尚未升級 Blaze（無法部署 functions），可改用下方「3A」的 GitHub Actions 排程替代方案。

## 3A.（替代）用 GitHub Actions 排程推播（免 Blaze）

此方案會每 15 分鐘在 GitHub Actions 執行一次 `functions/src/cronTodoReminder.ts`。

### A. 設定 GitHub Secret

在 GitHub repo 設定：

- `FIREBASE_SERVICE_ACCOUNT`：Firebase Service Account JSON（整段字串）

Service Account 建議權限：
- `Cloud Datastore User`（讀寫 Firestore）
- `Firebase Admin SDK Administrator Service Agent` 或等效可發送 FCM 權限

### B. 啟用 Workflow

專案已提供：

- `.github/workflows/todo-reminder-cron.yml`

可手動觸發一次驗證（Actions -> Todo Reminder Cron -> Run workflow）。

## 4. 部署前端（含 FCM Service Worker）

```bash
npm run build
firebase deploy --only hosting
```

## 5. Firestore 索引（若部署後 logs 提示缺索引）

排程函式查詢條件：
- `planning.type == "todo"`
- `planning.isDone == false`
- `planning.notificationEnabled == true`

若 logs 出現缺索引連結，點擊連結建立 composite index 後等待完成。

## 6. 實機驗證流程

1. 用帳號 A 登入，新增 Todo：
   - 開啟推播
   - 設定 15 分鐘級距時間（例如 18:30）
   - 指派給帳號 B
2. 帳號 A 與 B 都允許通知權限（各自裝置）。
3. 關閉 App（背景或關閉分頁）。
4. 到時間後應收到遠端推播；若未勾選完成，隔天同一時分會再次收到。

## 7. 資料流說明

- 前端登入後會註冊 FCM token，寫入 `pushTokens/{token}`，並帶 `authUid`。
- 排程函式掃描未完成且開啟通知的 Todo。
- 命中時間時，通知目標為：
  - `createdByAuthUid`（建立者帳號）
  - `assigneeIds` 對應之 `members.authUid`（被指派者）
- 每個 Todo 每個時分會記錄在 `todoReminderDeliveries`，避免同時分重複發送。
