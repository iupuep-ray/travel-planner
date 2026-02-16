#  專案開發規格書：團體旅遊規劃 Web App (動森手帳風)

> **Current Version:** v1.0.2 🎉
> **Last Updated:** 2026-02-12

---

## 版本歷程 (Version History)

### v1.0.1 (2026-02-12) 功能增強與介面優化

**已完成功能：**

✅ **狀態列顯示優化**
- 在 `index.html` 的 viewport meta 標籤中加入 `viewport-fit=cover`，使頁面內容延伸至安全區域之外。
- 在 `MainLayout.tsx` 的 `main` 元素上新增 `padding-top: env(safe-area-inset-top)`，確保 Header 內容不會被狀態列遮擋。

✅ **頁面 Header 全寬顯示修正**
- 重構 `MainLayout.tsx`，將內容區域限制 `md:max-w-lg mx-auto` 應用到 `Outlet` 的容器上，讓頁面級別的 Header 能實現全寬。
- 修正 `Home.tsx`, `Expense.tsx`, `Planning.tsx`, `Members.tsx` 等核心頁面，使其 Header 元素不再受限於 `md:max-w-lg` 而能全寬顯示。

✅ **BottomSheet 顯示與滾動行為優化**
- `BottomSheet.tsx` 的白色內容區域（控制整個彈窗內容高度的 `div`）恢復整體滾動能力 (`overflow-y-auto`)。
- `BottomSheet.tsx` 的滾動內容容器 (`div class="px-6 ..."`) 中的 `overflow-y-auto` 被移除，讓滾動統一由外部白色區域控制。
- `BottomSheet.tsx` 的滾動內容容器 (`div class="px-6 ..."`) 的 `padding-bottom` 調整為 `pb-32` (對應 `8rem`)。

✅ **ExpenseDetail 與表單底部間距修正**
- `ExpenseDetail.tsx` 最外層有顏色背景的 `div` (`bg-cream-light`) 調整 `padding-bottom` 為 `pb-32` (對應 `8rem`)。
- `PlanningForm.tsx`, `ExpenseForm.tsx`, `MemberForm.tsx`, `ScheduleForm.tsx` 等表單的最外層 `div` (有 `bg-cream-light`) 的 `padding` 從 `p-6` 調整為 `pt-6 px-6 pb-32` (底部填充 `8rem`)，以確保表單按鈕不被底部導航欄遮擋。

---

### v1.0.0 (2026-02-11) 🎉 正式版發布

**已完成功能：**

✅ **購物模組連動**
- 新增購物行程時，自動在準備清單建立對應購物項目
- 編輯購物行程時，自動更新準備清單中的購物項目
- 刪除購物行程時，自動刪除準備清單中的相關項目
- 使用 Firestore 批次操作優化效能

✅ **成員頭像上傳功能**
- 上傳自訂頭像（支援 JPG、PNG、GIF，限制 5MB）
- 照片縮放與裁切功能（react-easy-crop）
  - 拖曳調整位置、滑桿縮放（1x-3x）、圓形裁切預覽
- 選擇預設頭像（3 個動森風格選項）
- 自動壓縮為 WebP 格式、頭像預覽與移除功能

✅ **離線持久化功能**
- 使用 Firebase 最新的 `persistentLocalCache` API
- 支援多分頁同步（`persistentMultipleTabManager`）
- 確保海外旅遊訊號不穩或離線時，核心行程與清單仍可讀取

✅ **Google Maps 連結整合**
- 所有行程類型都有 Google Maps 按鈕
- 自動將地址轉換為 Google Maps 搜尋連結

✅ **多圖展示優化**
- 2x2 網格佈局展示行程照片、顯示照片數量標籤
- 點擊照片可在新視窗中放大查看
- 圖片使用懶加載（lazy loading）優化效能

✅ **PWA 功能配置**
- 配置 manifest.json、自動更新模式
- Service Worker 快取策略（靜態資源 + Firebase Storage 圖片快取）
- 支援離線使用、可安裝到主螢幕

✅ **載入骨架屏系統**
- 通用 Skeleton 組件（支援多種變體與動畫）
- 專用骨架屏：ScheduleCardSkeleton、ExpenseCardSkeleton、MemberCardSkeleton
- 整合到所有主要頁面（Home、Members、Expense）

✅ **動畫效果系統**
- 新增動畫：shimmer、fadeIn、slideInRight、slideInLeft、scaleIn、slideUp
- 應用到卡片組件與 BottomSheet
- 流暢的使用者體驗與視覺回饋

**🎯 v1.0.0 功能總覽：**
- 完整的旅遊規劃功能（首頁時間軸、行程管理、記帳清算、準備清單、成員管理）
- 購物模組智能連動
- 圖片上傳與裁切
- 離線支援與 PWA 功能
- 載入骨架屏與動畫效果
- 動森手帳風格設計

### v0.0.3 (2026-02-11)

**已完成功能：**

✅ **記帳功能完整實作（Expense）**
- 記帳頁面基礎架構
  - Tab Bar 切換（記帳 / 清算）
  - 橘色主題設計
  - 匯率顯示（1 NTD = 5 JPY）
- 費用記錄列表
  - 費用卡片（項目、代墊者、總額、每人應付）
  - 已還款狀態標籤
  - 自動幣別換算顯示
  - 點擊開啟詳情
- 費用記錄表單（ExpenseForm）
  - 費用項目輸入
  - 金額 & 幣別選擇（JPY/NTD）
  - 代墊者下拉選單
  - 分攤對象多選（Checkbox + 全選功能）
  - 自動使用新增時間（移除手動時間欄位）
- 費用詳情頁面（ExpenseDetail）
  - 完整資訊展示
  - 成員頭像圓圈（首字母）
  - 代墊者與分攤對象視覺區分
  - 刪除功能（含確認對話框）
- 清算功能 (Netting)
  - 債務抵銷算法（settlement.ts）
  - 自動計算淨額（應收/應付）
  - 貪婪配對法（最小化轉帳次數）
  - 清算結果展示（雙向箭頭、成員頭像、金額換算）
  - 標記為已還款按鈕（待 Firebase 整合）

✅ **行程刪除功能**
- ScheduleDetail 組件更新
  - 雙按鈕設計（編輯 + 刪除）
  - 僅非機票類型顯示
  - 刪除確認對話框（顯示行程名稱）
- 整合到 Schedule 頁面
  - 僅能在「行程」頁面刪除
  - 機票類型不可刪除

**🔧 技術亮點：**
- Netting 清算算法實作（債權債務配對）
- 成員頭像圓圈系統（基於首字母）
- 多選分攤對象介面（視覺回饋）
- 自動幣別轉換工具函數

### v0.0.2 (2026-02-11)

**已完成功能：**

✅ **行程管理完整功能（Schedule）**
- 行程表單組件（ScheduleForm）
  - 支援新增/編輯模式
  - 住宿：Check-in/Check-out 日期
  - 餐廳/景點/購物：開始/結束時間
  - 購物清單動態管理（新增/刪除物品）
  - 動森風格表單設計
- 行程卡片優化
  - 彩色標籤系統（住宿粉、餐廳橘、景點綠、購物黃）
  - 裝飾圖片多樣化（每種類型 2-3 種圖示）
  - 時間顯示優化（首頁僅時:分，行程頁月/日 時:分）
- 行程編輯功能
  - 詳情頁「編輯行程」按鈕（僅非機票類型）
  - 編輯模式自動載入現有資料
  - 表單標題動態切換

✅ **機票行程展示優化**
- 登機證風格設計
  - 藍綠漸層背景
  - BOARDING PASS 標題
  - 白色內卡設計
  - 虛線分隔與半圓缺口效果
- 去程/回程切換按鈕
- Mock data 完整展示（無編輯功能）

✅ **視覺系統優化**
- z-index 圖層管理優化
  - 背景顏色：z-0
  - 格線：z-1
  - 頁面內容：z-10+
  - 確保所有元素正確顯示在格線上方
- 裝飾圖片隨機選擇機制
  - 基於行程 ID 的穩定隨機算法
  - 同一行程始終顯示相同圖示
- Tab Bar 圓角設計優化

**🔧 技術改進：**
- 時間格式化工具擴充（formatDateTimeShort）
- 圖片配置系統重構（支援多圖隨機選擇）
- 行程表單 useEffect 資料載入機制

### v0.0.1 (2026-02-11)

**已完成功能：**

✅ **基礎架構**
- React 18 + TypeScript + Vite 開發環境配置
- Tailwind CSS 動森風格主題系統
- Firebase (Auth/Firestore) 與 Supabase (Storage) 初始化
- React Router v6 路由系統
- Bottom Navigation 導航系統

✅ **首頁功能（Homepage）- 完整實作**
- 天氣資訊顯示區（使用 FontAwesome 圖示）
- 橫向滾動日期選擇器
  - 自動捲動至選中日期
  - 動森風格按鈕設計
- 時間軸行程展示
  - 自動排序：依 `startDateTime` 與 `createdAt` 排序
  - 跨日顯示：住宿在入住期間每日顯示
  - 空狀態處理（附本地圖示）
- 行程卡片（ScheduleCard）
  - 右側置中裝飾圖示（50% 透明度）
  - 類型對應圖示（機票、住宿、餐廳、景點、購物）
  - 觸控反饋動畫
- 行程詳情 Bottom Sheet
  - Google Maps 連結整合
  - 完整資訊展示
  - 滑動關閉功能

✅ **視覺系統優化**
- 本地 PNG 素材整合（/public/pic）
- 圖片配置管理系統（LOCAL_IMAGES）
- 動態格線背景（Framer Motion Tiles 組件）
  - 30x20 格線
  - 隨機延遲淡入動畫
  - 動森棕色 8% 透明度邊框
- 全域樣式規範
  - 24px / 32px / 40px 大圓角系統
  - 軟陰影效果
  - 觸控反饋動畫

**技術亮點：**
- Framer Motion 動畫系統
- 跨日行程演算法
- 模組化圖片資源管理
- TypeScript 完整類型定義
- Tailwind 自訂主題擴展

---

## 1. 專案概述 (Project Overview)
* **目標**：開發一個具備日系手帳感、高質感的 Mobile-first 團體旅遊規劃 PWA。
* **視覺風格**：動物森友會風。視覺強調溫暖色調、24px 大圓角與 4px 軟陰影 (Soft Shadow)。
* **技術棧**：
    * 前端框架：React (TypeScript) + Vite
    * 樣式系統：Tailwind CSS
    * 圖示庫：FontAwesome (React)
    * 後端服務：Firebase (Auth/Firestore) + Supabase (Storage)
    * 圖片處理：browser-image-compression
    * 視覺素材：本地動森風格 PNG 圖示（位於 public/pic 資料夾）

## 2. UI/UX 視覺規範 (Visual Standards)
* **全域背景**：使用米色紋理背景 (`#F7F4EB`)，帶有 20px 間距的淡色點狀圖案 (`#E0E5D5`)。
* **配色方案（已優化對比度）**：
    * 主色：`#6B9144` (動森綠 - 用於背景)
    * 主色淺：`#78A153` (淺綠 - 用於圖示)
    * 輔助：`#E9A15A` (暖橘)
    * 文字：`#8D775F` (深褐)
* **配色使用規範**：
    * **彩色背景必須搭配白色文字**：所有使用綠色或橘色背景的元素，文字必須使用白色以確保對比度
    * **圖示顏色**：在白色/淺色背景上使用淺綠 (`#78A153`)，在彩色背景上使用白色
    * **文字可讀性**：確保所有文字與背景的對比度符合 WCAG AA 標準（至少 4.5:1）
* **組件語彙**：
    * **卡片**：白色底色、`rounded-[24px]`、`box-shadow: 4px 4px 0px #E0E5D5`。
    * **回饋**：所有點擊動作（按鈕、卡片）需具備 `active:scale-95` 的縮放反饋感。
    * **導航**：手機版固定於底部 (Bottom Navigation)，整合圓潤圖示與導覽標籤。
* **圖示使用規範**：
    * **優先使用**：FontAwesome 圖示庫，保持視覺一致性與專業度。
    * **輔助使用**：原生 Emoji 僅在特定情境使用（如：天氣顯示、特殊裝飾）。
    * **圖示風格**：優先使用 Solid 風格，特殊情況可使用 Regular 風格。
    * **圖示顏色**：遵循配色方案，主要使用主色 (`#78A153`) 或文字色 (`#8D775F`)。

## 3. 核心功能模組 (Core Modules)

### 3.1 首頁 (Homepage) - 每日情報中心
* **日期選擇器**：橫向捲動 UI，點選後即時切換時間軸內容。
* **時間軸邏輯**：
    * **自動排序**：優先根據行程的 `startDateTime` 排序；時間相同時則依「建立時間」先後排列。
    * **跨日顯示**：若「住宿」行程跨越多天，在該日期區間內的每一天時間軸頂部皆需顯示該行程卡片。
* **天氣資訊**：顯示假想天氣 (晴/雨/氣溫)。
* **詳情 Bottom Sheet**：點擊行程卡片彈出，整合 Google Maps 連結、備註內容、多圖牆展示。

### 3.2 行程 (Schedule) - 資料編輯器
* **分頁 Tab Bar**：大小適中、圓潤的頂部切換列。
* **機票模組**：類「登機證」視覺設計，包含航班號、航廈、登機門、座位號碼，支援去程/回程切換。
* **住宿/餐廳/景點**：支援名稱、日期時間區間、地址、URL、備註及多圖上傳。
* **購物 (模組連動)**：
    * **編輯欄位**：新增「購物物品」輸入框。
    * **自動化邏輯**：新增購物行程時，系統會自動在「準備」清單中建立對應物品；若行程被刪除，對應之清單項目也一併刪除。

### 3.3 記帳 (Expense) - 財務清算
* **匯率機制**：固定匯率 NTD:JPY = 1:5。
* **記帳列表**：顯示該筆費用總額，及平分後的個人應付金額。
* **清算功能 (Netting)**：
    * 執行債務抵銷計算（Netting），顯示成員間最終「誰該給誰多少」的淨額。
    * 支援「標記為已還款」狀態變更功能。

### 3.4 準備 (Planning) - 任務管理
* **分類系統**：透過分頁切換 Todo、行李清單、購物清單。
* **連動顯示**：由購物行程產生的物品需註明來源（如：來自「銀座 Uniqlo」）；手動新增者歸類在「一般購物」。
* **指派與標記**：支援指派特定成員（顯示頭像標記），提供互動式 Checkbox。

### 3.5 成員 (Members)
* **權限模型**：全體登入成員具備對等編輯權限，簡化團體協作流程。
* **個人化**：內建風格頭像庫，支援照片上傳、縮放與裁切功能。

## 4. 技術與資料規範 (Technical Specification)

### 4.1 資料模型 (Firestore)
* `schedules`: 包含 `type` (lodging/spot/shopping 等)、時段、詳細欄位 (gate/seat 等) 及 `shoppingItems` 陣列。
* `planning`: 具備 `relatedScheduleId` 與 `assigneeId` 用於跨模組連動。
* `expenses`: 包含 `payerId`、`splitIds` (分攤對象) 與 `isSettled` 狀態。

### 4.2 圖片處理策略
* **處理庫**：使用 `browser-image-compression`。
* **規格限制**：長邊上限 1200px、檔案大小控制在 500KB 以下、格式強制轉換為 WebP 以優化載入速度。

### 4.3 視覺素材使用策略 (Visual Assets)
* **素材來源**：使用本地動森風格 PNG 圖示，位於 `public/pic` 資料夾。
* **圖片配置**：統一管理於 `src/config/images.ts`（使用 `LOCAL_IMAGES` 物件），包含：
    * **首頁裝飾圖**：天氣圖示、葉子、植物、動森角色（貓、青蛙）
    * **功能圖示**：
        - 首頁相關：房子、月曆
        - 行程相關：紙飛機、帳篷、食物、地圖、護照、旗幟、地球
        - 記帳相關：錢包、金錢、信用卡
        - 準備清單：筆記本、工具箱、蘋果
        - 其他裝飾：星星、對話框、笑臉、化石
    * **行程類型裝飾圖**：flight（紙飛機）、lodging（帳篷）、restaurant（食物）、spot（旗幟）、shopping（錢包）
    * **空狀態插圖**：無行程（地圖）、無費用（金錢）、無清單（筆記）
* **視覺效果**：
    * 裝飾圖片使用 10-15% 低透明度，營造氛圍但不干擾閱讀
    * 所有圖片使用 `object-contain` 保持原始比例
    * 裝飾圖片使用 `pointer-events-none` 避免干擾互動
* **設計原則**：
    * 圖示主要用於氛圍營造與視覺點綴，不作為主要資訊載體
    * 保持動森風格的可愛、溫暖、手繪感
    * 避免過度裝飾影響使用體驗與效能

### 4.4 離線持久化 (Persistence)
* 啟動 Firestore `persistentLocalCache`，確保在海外旅遊訊號不穩或飛機上時，核心行程與清單仍可讀取。
