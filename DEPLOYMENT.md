# 🚀 部署指南 - 動森旅行規劃 v1.0.0

本指南將教您如何將專案部署到 GitHub Pages，讓您的旅行規劃應用程式可以公開使用。

---

## 📋 部署前準備

### 1. 確認 Firebase 配置

在部署前，請確保您已經設定好 Firebase：

1. 前往 [Firebase Console](https://console.firebase.google.com/)
2. 建立新專案或使用現有專案
3. 啟用以下服務：
   - **Authentication** (Email/Password)
   - **Firestore Database**
   - **Storage**

4. 將 Firebase 配置資訊填入環境變數檔案

### 2. 設定環境變數

建立 `.env` 檔案（如果還沒有）：

```bash
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

> ⚠️ **重要安全提示**：
> - **不要將 `.env` 檔案提交到 GitHub**（已在 `.gitignore` 中排除）
> - 部署到 GitHub Pages 時，環境變數需要直接編譯到程式碼中
> - Firebase 的安全規則應該設定在 Firestore 和 Storage 端

---

## 🌐 部署到 GitHub Pages

### 方法一：使用 GitHub Actions（推薦）

#### 步驟 1：建立 GitHub Actions 工作流程

在專案根目錄建立 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]  # 當推送到 main 分支時觸發
  workflow_dispatch:  # 允許手動觸發

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
          VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
          VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
          VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.VITE_FIREBASE_STORAGE_BUCKET }}
          VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.VITE_FIREBASE_MESSAGING_SENDER_ID }}
          VITE_FIREBASE_APP_ID: ${{ secrets.VITE_FIREBASE_APP_ID }}
          VITE_FIREBASE_MEASUREMENT_ID: ${{ secrets.VITE_FIREBASE_MEASUREMENT_ID }}

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

#### 步驟 2：設定 GitHub Secrets

1. 前往您的 GitHub Repository
2. 點選 **Settings** > **Secrets and variables** > **Actions**
3. 點選 **New repository secret**
4. 依序新增以下 secrets（從您的 `.env` 檔案複製值）：
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_FIREBASE_MEASUREMENT_ID`

#### 步驟 3：啟用 GitHub Pages

1. 前往 Repository 的 **Settings**
2. 在左側選單找到 **Pages**
3. 在 **Source** 下拉選單選擇 **GitHub Actions**
4. 儲存設定

#### 步驟 4：推送程式碼並觸發部署

```bash
git add .
git commit -m "🚀 Release v1.0.0"
git push origin main
```

部署完成後，您的應用程式將可在以下網址訪問：
```
https://[你的GitHub用戶名].github.io/[repository名稱]/
```

---

### 方法二：使用 gh-pages 套件（手動部署）

如果您不想使用 GitHub Actions，可以使用 `gh-pages` 套件手動部署：

#### 步驟 1：更新 vite.config.ts

將 `base` 設定為您的 repository 名稱：

```typescript
export default defineConfig({
  base: '/[你的repository名稱]/',  // 例如：'/travel-planner/'
  // ...其他配置
})
```

#### 步驟 2：建立 .env.production

建立生產環境的環境變數檔案 `.env.production`，並填入 Firebase 配置。

#### 步驟 3：執行部署指令

```bash
# 建置並部署
npm run deploy
```

這會自動：
1. 執行 `npm run build` 建置專案
2. 將 `dist` 資料夾的內容推送到 `gh-pages` 分支

#### 步驟 4：啟用 GitHub Pages

1. 前往 Repository 的 **Settings** > **Pages**
2. 在 **Source** 選擇 **Deploy from a branch**
3. 選擇 **gh-pages** 分支和 **/ (root)** 資料夾
4. 點擊 **Save**

---

## 🔒 Firebase 安全規則設定

為了保護您的資料，請設定適當的 Firestore 和 Storage 安全規則：

### Firestore Rules

前往 Firebase Console > Firestore Database > Rules，設定以下規則：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 只允許已登入的使用者存取
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Storage Rules

前往 Firebase Console > Storage > Rules，設定以下規則：

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // 只允許已登入的使用者上傳和讀取
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## ✅ 驗證部署

部署完成後，請檢查以下項目：

- [ ] 網站可以正常訪問
- [ ] Firebase 連線正常（可以註冊和登入）
- [ ] 圖片可以正常上傳和顯示
- [ ] PWA 功能正常（可以安裝到主螢幕）
- [ ] 離線功能運作正常

---

## 🔄 更新部署

### 使用 GitHub Actions

只需推送到 main 分支即可自動部署：

```bash
git add .
git commit -m "✨ 新功能: 描述"
git push origin main
```

### 使用 gh-pages 套件

執行部署指令：

```bash
npm run deploy
```

---

## 🐛 常見問題

### Q1: 部署後頁面空白或顯示 404

**解決方法**：
1. 確認 `vite.config.ts` 中的 `base` 設定正確
2. 使用 GitHub Actions 時，`base` 應該設為 `'/'`
3. 使用 gh-pages 時，`base` 應該設為 `'/[repository名稱]/'`

### Q2: Firebase 連線失敗

**解決方法**：
1. 確認 GitHub Secrets 已正確設定
2. 檢查 Firebase 專案的授權網域設定
   - 前往 Firebase Console > Authentication > Settings
   - 在「授權網域」中新增您的 GitHub Pages 網址

### Q3: 圖片無法上傳

**解決方法**：
1. 確認 Firebase Storage 已啟用
2. 檢查 Storage 安全規則是否正確設定

---

## 📞 需要協助？

如果遇到問題，請：
1. 檢查 GitHub Actions 的執行日誌
2. 查看瀏覽器的 Console 錯誤訊息
3. 確認 Firebase 設定是否正確

---

**祝您部署順利！** 🎉
