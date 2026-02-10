# 旅遊手帳 - 動森風格團體旅遊規劃 App

> **Version:** v0.0.6
> **Last Updated:** 2026-02-11

一個具備日系手帳感、高質感的 Mobile-first 團體旅遊規劃 PWA。

## 🎨 設計風格

- **視覺主題**：動物森友會風格
- **配色方案**：
  - 主色：`#78A153` (動森綠)
  - 輔助：`#E9A15A` (暖橘)
  - 文字：`#8D775F` (深褐)
  - 背景：`#F7F4EB` (米色紋理)
- **設計語彙**：24px 大圓角、4px 軟陰影、點狀背景紋理

## 🛠️ 技術棧

- **框架**：React 18 + TypeScript
- **建置工具**：Vite
- **樣式**：Tailwind CSS
- **後端**：Firebase (Auth/Firestore/Storage)
- **路由**：React Router v6

## 🚀 快速開始

### 安裝依賴
```bash
npm install
```

### 啟動開發伺服器
```bash
npm run dev
```

開啟瀏覽器訪問：http://localhost:5173/

### 建置專案
```bash
npm run build
```

## 🔖 版本歷程

### v0.0.6 (2026-02-11)

**✅ 已完成功能：**

- Firebase 資料持久化完整實作
  - Firebase Authentication 登入/註冊系統
  - 登入頁面 UI（Email/Password 驗證）
  - Protected Routes（路由保護機制）
  - 所有資料模組的 Firestore CRUD 操作
    - Members（成員管理）
    - Schedules（行程管理）
    - Expenses（記帳管理）
    - Planning（準備清單管理）
  - Firebase Storage 圖片上傳
    - 自動圖片壓縮（WebP 格式，最大 1200px，500KB 以下）
    - 成員頭像上傳功能
    - 行程圖片上傳功能
  - Firestore 即時監聽（Real-time updates）
  - IndexedDB 離線持久化支援

**🔧 技術架構：**

- **服務層架構**：
  - `src/services/memberService.ts` - 成員資料服務
  - `src/services/scheduleService.ts` - 行程資料服務
  - `src/services/expenseService.ts` - 記帳資料服務
  - `src/services/planningService.ts` - 準備清單資料服務
  - `src/services/storageService.ts` - 圖片上傳服務

- **React Hooks**：
  - `src/hooks/useMembers.ts` - 成員管理 Hook
  - `src/hooks/useSchedules.ts` - 行程管理 Hook
  - `src/hooks/useExpenses.ts` - 記帳管理 Hook
  - `src/hooks/usePlanning.ts` - 準備清單 Hook

- **Authentication**：
  - `src/contexts/AuthContext.tsx` - 認證 Context
  - `src/pages/Login.tsx` - 登入/註冊頁面
  - `src/components/ProtectedRoute.tsx` - 路由保護組件

- **圖片處理**：
  - 使用 `browser-image-compression` 自動壓縮
  - 強制轉換為 WebP 格式優化載入速度
  - 長邊上限 1200px，檔案大小 500KB 以下

**📝 設定文件：**

- 新增 `FIREBASE_SETUP.md` - Firebase 設定指南

### v0.0.5 (2026-02-11)

**✅ 已完成功能：**

- 成員管理優化
  - 預設頭像選擇功能（3個預設頭像可選）
  - 頭像選擇 UI（Grid 佈局 + 選中高亮）
  - 支援上傳自訂頭像和預設頭像切換

- 視覺設計優化
  - 所有頁面 Header 使用不同主題色
    - 首頁：動森綠 (#78A153)
    - 行程：暖橘 (#E9A15A)
    - 記帳：深褐 (#8B6F47)
    - 準備清單：青綠 (#7AC5AD)
    - 成員管理：粉紫 (#C88EA7)
  - Floating Add Button 顏色與 Header 同步

**🔧 技術改進：**

- 預設頭像資源管理（使用 public/pic 資料夾）
- 頁面主題色系統化管理

### v0.0.4 (2026-02-11)

**✅ 已完成功能：**

- 準備清單完整實作
  - Todo、行李、購物三大分類
  - 購物清單依商店名稱分組顯示
  - 項目編輯功能（僅限手動新增的項目）
  - 多選成員指派系統（checkbox 介面）
  - 成員頭像圓圈顯示（支援多個成員並排）
  - 項目完成狀態切換
  - 刪除功能（含確認對話框）

**🔧 技術改進：**

- PlanningItem 資料模型更新（assigneeId → assigneeIds[]）
- 表單組件支援編輯模式（initialData 參數）
- 多選 checkbox 介面實作
- 成員頭像圓圈系統改進（支援多個成員）

### v0.0.3 (2026-02-11)

**✅ 已完成功能：**

- 記帳功能完整實作
  - 費用記錄列表（顯示總額、每人應付、已還款狀態）
  - 費用記錄表單（項目、金額、幣別、代墊者、分攤對象）
  - 費用詳情頁面（完整資訊展示）
  - 費用刪除功能（含確認對話框）
  - 清算功能 (Netting 債務抵銷算法)
  - 清算結果展示（誰應付給誰多少錢）
  - 匯率自動轉換（NTD ⇄ JPY，固定匯率 1:5）

- 行程刪除功能
  - 行程詳情頁面新增刪除按鈕
  - 僅能在「行程」頁面刪除（非機票類型）
  - 刪除確認對話框

**🔧 技術改進：**

- 清算算法實作（貪婪配對法，最小化轉帳次數）
- 費用表單優化（移除時間欄位，自動使用新增時間）
- 成員頭像圓圈系統（首字母顯示）

### v0.0.2 (2026-02-11)

**✅ 已完成功能：**

- 行程管理完整功能
  - 新增/編輯住宿、餐廳、景點、購物行程
  - 行程表單支援編輯模式
  - 購物清單動態管理
  - 行程卡片彩色標籤（住宿/餐廳/景點/購物）

- 視覺優化
  - 行程卡片裝飾圖片多樣化
  - 時間顯示優化（首頁僅顯示時:分，行程頁顯示月/日 時:分）
  - z-index 圖層結構優化（確保內容在格線上方）

- 機票行程展示
  - 登機證風格設計
  - 去程/回程切換功能
  - 半圓形缺口視覺效果

**🔧 技術改進：**

- 圖層管理系統優化（背景 z-0, 格線 z-1, 內容 z-10+）
- 行程裝飾圖片隨機選擇機制（基於 ID 保持一致性）
- 時間格式化工具函數擴充

### v0.0.1 (2026-02-11)

**✅ 已完成功能：**

- 專案初始化與配置
  - React 18 + TypeScript + Vite 開發環境
  - Tailwind CSS 動森風格配置
  - Firebase & Supabase 整合設定
  - 路由系統與 Bottom Navigation

- 首頁 (Homepage) 完整實作
  - 天氣資訊顯示區
  - 橫向滾動日期選擇器（自動捲動至選中日期）
  - 時間軸行程卡片展示
  - 行程詳情 Bottom Sheet
  - 跨日住宿顯示邏輯
  - 自動排序功能（依時間與建立順序）
  - Google Maps 連結整合

- 視覺優化
  - 動森風格配色系統（綠色 #7AC5AD、橘色 #E9A15A、棕色 #8B6F47）
  - 本地 PNG 素材整合（/public/pic）
  - 動態格線背景（使用 Framer Motion 的 Tiles 組件）
  - 圓角與軟陰影設計語彙
  - 觸控反饋動畫（active:scale-95）

**🔧 技術亮點：**

- 使用 Framer Motion 實現動態格線背景動畫
- 實作跨日行程顯示演算法（住宿在入住期間每日顯示）
- 自訂 Tailwind 主題與組件樣式系統
- 模組化圖片資源管理系統（LOCAL_IMAGES 配置）

## ✅ 開發進度

### 已完成（v0.0.1）
- [x] 專案初始化與配置
- [x] Tailwind CSS 動森風格設定
- [x] 路由系統與 Bottom Navigation
- [x] 首頁功能完整實作
- [x] 動態格線背景整合
- [x] 本地素材圖片系統

### 待開發

**核心功能整合：**
- [x] Firebase 配置與整合
  - [x] 建立 Firebase 專案
  - [x] 配置 Authentication（Email/Password）
  - [x] 配置 Firestore Database
  - [x] 配置 Storage（圖片儲存）
  - [x] 實作所有 CRUD 操作（行程、記帳、準備清單、成員）
  - [x] 實作圖片上傳與壓縮功能

**進階功能：**
- [ ] PWA 功能
  - [ ] Service Worker 配置
  - [ ] 離線持久化（Firestore Persistence）
  - [ ] 安裝提示（Add to Home Screen）
  - [ ] 推播通知（行程提醒）

**功能增強：**
- [ ] 圖片裁切功能（頭像、行程圖片）
- [ ] 匯出功能（行程表 PDF、費用清單 Excel）
- [ ] 行程分享功能（生成分享連結）
- [ ] 多語系支援（繁中、英文、日文）

**測試與部署：**
- [ ] 單元測試撰寫
- [ ] E2E 測試
- [ ] 部署至 Firebase Hosting
- [ ] 設定 CI/CD Pipeline

## 🔥 Firebase 設定

### 建立 Firebase 專案步驟：

1. 前往 [Firebase Console](https://console.firebase.google.com/)
2. 點擊「新增專案」
3. 輸入專案名稱（例如：travel-planner）
4. 建立專案後，點擊「網頁」圖示新增應用程式
5. 複製 Firebase 配置資訊

### 啟用 Firebase 服務：

- **Authentication**：啟用 Email/Password 登入
- **Firestore Database**：選擇「以測試模式開始」
- **Storage**：用於圖片儲存

### 環境變數設定：

複製 `.env.example` 為 `.env`，並填入 Firebase 配置：

```bash
cp .env.example .env
```

編輯 `.env` 檔案，填入你的 Firebase 配置資訊。

## 📱 功能說明

### 首頁（已完成）
- **日期選擇器**：橫向捲動選擇日期，自動捲動到選中日期
- **時間軸**：
  - 自動排序：優先根據行程開始時間排序
  - 跨日顯示：住宿行程在入住期間的每一天都會顯示
- **天氣資訊**：顯示當日天氣狀況（模擬資料）
- **行程卡片**：點擊卡片彈出詳情 Bottom Sheet
- **詳情頁面**：顯示完整行程資訊、Google Maps 連結、備註等

### 其他頁面（開發中）
目前其他頁面顯示佔位文字，待後續開發。

## 📝 資料模型

完整的 TypeScript 類型定義請參考 `src/types/index.ts`

主要資料模型：
- `Schedule`：行程資料（機票、住宿、餐廳、景點、購物）
- `PlanningItem`：準備清單項目
- `Expense`：費用記錄
- `Member`：成員資訊

## 🎯 下一步建議

1. **建立 Firebase 專案**：按照上述步驟建立並配置 Firebase
2. **測試首頁功能**：在瀏覽器中查看已完成的首頁功能
3. **繼續開發其他模組**：依序實作行程、記帳、準備、成員等功能

## 📄 授權

此專案為私人專案。
