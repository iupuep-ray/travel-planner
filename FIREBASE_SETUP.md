# Firebase 設定指南

本專案使用 Firebase 作為後端服務，提供 Authentication、Firestore Database 和 Storage 功能。請按照以下步驟完成設定。

## 步驟 1：建立 Firebase 專案

1. 前往 [Firebase Console](https://console.firebase.google.com/)
2. 點擊「新增專案」或「Add project」
3. 輸入專案名稱（例如：`travel-planner`）
4. 選擇是否啟用 Google Analytics（建議啟用）
5. 點擊「建立專案」

## 步驟 2：註冊 Web 應用程式

1. 在 Firebase 專案首頁，點擊「Web」圖示（</>）
2. 輸入應用程式暱稱（例如：`Travel Planner Web`）
3. 勾選「同時為此應用程式設定 Firebase Hosting」（選填）
4. 點擊「註冊應用程式」
5. 複製顯示的 Firebase 配置資訊

## 步驟 3：設定環境變數

1. 在專案根目錄複製 \`.env.example\` 為 \`.env\`
2. 填入從 Firebase Console 複製的配置資訊

## 後續步驟

完成設定後重新啟動開發伺服器即可使用 Firebase 功能。
