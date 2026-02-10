# Supabase Storage 設定指南

## 📋 步驟 1：註冊 Supabase 帳號

1. **前往 Supabase**
   - 開啟瀏覽器訪問：https://supabase.com/
   - 點擊右上角「Start your project」或「Sign In」

2. **使用 GitHub 登入**
   - 點擊「Continue with GitHub」
   - 授權 Supabase 存取你的 GitHub 帳號

## 🚀 步驟 2：建立新專案

1. **建立組織（如果是第一次使用）**
   - 輸入組織名稱（例如：Personal）
   - 選擇免費方案（Free tier）

2. **建立新專案**
   - 點擊「New Project」
   - 填寫以下資訊：
     - **Name**：`travel-planner`（或你喜歡的名稱）
     - **Database Password**：設定一個強密碼（請記住這個密碼）
     - **Region**：選擇 **Northeast Asia (Tokyo)** 或 **Southeast Asia (Singapore)**
     - **Pricing Plan**：Free（免費）
   - 點擊「Create new project」

3. **等待專案建立**
   - 通常需要 1-2 分鐘
   - 完成後會自動跳轉到專案控制台

## 🔑 步驟 3：取得 API 金鑰

1. **進入專案設定**
   - 在左側選單最下方，點擊「⚙️ Settings」
   - 點擊「API」

2. **複製以下資訊**
   - **Project URL**（看起來像：`https://xxxxx.supabase.co`）
   - **anon public key**（一長串的 token）

   保留這個頁面，我們馬上會用到！

## 📦 步驟 4：建立 Storage Bucket

1. **進入 Storage**
   - 在左側選單點擊「🗄️ Storage」

2. **建立新的 Bucket**
   - 點擊「New bucket」
   - 填寫資訊：
     - **Name**：`travel-images`
     - **Public bucket**：✅ 勾選（讓圖片可以公開存取）
   - 點擊「Create bucket」

3. **設定 Bucket 政策（重要）**
   - 點擊剛建立的 `travel-images` bucket
   - 點擊右上角「Configuration」
   - 在「Policies」區域，點擊「New policy」
   - 選擇「For full customization」
   - 填寫以下資訊：

   **Policy name**: `Allow public uploads and reads`

   **Policy definition**:
   ```sql
   -- 允許所有人讀取
   CREATE POLICY "Public Access"
   ON storage.objects FOR SELECT
   USING ( bucket_id = 'travel-images' );

   -- 允許所有人上傳
   CREATE POLICY "Public Upload"
   ON storage.objects FOR INSERT
   WITH CHECK ( bucket_id = 'travel-images' );
   ```

   或者更簡單的方式：
   - 回到 bucket 頁面
   - 點擊「Policies」標籤
   - 點擊「Add policy」
   - 選擇模板「Allow public read access」
   - 再新增一個 policy，選擇「Allow public write access」

## 🔧 步驟 5：更新環境變數

將以下內容**加入**到你的 `.env` 檔案（保留原有的 Firebase 設定）：

```env
# Supabase Configuration
VITE_SUPABASE_URL=你的_Project_URL
VITE_SUPABASE_ANON_KEY=你的_anon_public_key
```

例如：
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## ✅ 驗證設定

完成後：
1. 重新啟動開發伺服器
2. 在 Console 應該會看到 Supabase 連接成功的訊息

## 📊 免費額度

Supabase 免費方案包含：
- ✅ 1GB 儲存空間
- ✅ 2GB 流量/月
- ✅ 無限制的 API 請求
- ✅ 完全不需要信用卡

對於個人專案來說綽綽有餘！

## 🆘 常見問題

### Q: 找不到 API 金鑰？
A: Settings > API > Project API keys

### Q: Bucket 無法上傳？
A: 檢查 Policies 是否正確設定，確保有 INSERT 和 SELECT 權限

### Q: 圖片無法存取？
A: 確認 bucket 是 Public，並且有 SELECT policy

---

準備好後，把你的 **Project URL** 和 **anon public key** 貼給我，我會幫你更新 `.env` 檔案！
