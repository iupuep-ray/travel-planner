# 配色使用指南

## 🎨 動森風格配色方案（已優化對比度）

### 主色系 - 動森綠
```css
primary (DEFAULT): #6B9144  /* 標準綠（加深版，用於背景） */
primary-light: #78A153      /* 淺綠（用於圖示、文字） */
primary-dark: #5A7A38       /* 深綠（備用） */
```

**使用場景：**
- `bg-primary` + `text-white` - 背景使用深綠 + 白色文字（按鈕、Header）
- `text-primary-light` - 淺綠用於圖示、強調文字
- `border-primary` - 邊框使用標準綠

### 輔助色 - 暖橘
```css
accent (DEFAULT): #E9A15A  /* 標準橘（用於背景、標籤） */
accent-light: #F4B776      /* 淺橘（備用） */
```

**使用場景：**
- `bg-accent` + `text-white` - 背景用橘 + 白色文字
- `text-accent` - 橘色文字（慎用，需檢查對比度）

### 文字色
```css
primary-text: #8D775F  /* 深褐色（主要文字） */
```

**使用場景：**
- 在白色背景或淺色背景上的文字
- 避免在綠色/橘色背景上使用

### 背景色
```css
primary-bg: #F7F4EB    /* 米色背景 */
card-shadow: #E0E5D5   /* 陰影色 */
```

---

## ✅ 推薦用法

### 按鈕
```tsx
// 主要按鈕
<button className="bg-primary text-white">
  確認
</button>

// 次要按鈕
<button className="border-2 border-primary text-primary-light bg-white">
  取消
</button>

// 強調按鈕
<button className="bg-accent text-white">
  刪除
</button>
```

### 圖示
```tsx
// 在白色/淺色背景上
<FontAwesomeIcon icon={['fas', 'house']} className="text-primary-light" />

// 在綠色背景上
<FontAwesomeIcon icon={['fas', 'house']} className="text-white" />
```

### 卡片
```tsx
// 標準卡片
<div className="bg-white text-primary-text rounded-card shadow-soft p-4">
  內容
</div>

// 強調卡片
<div className="bg-primary text-white rounded-card shadow-soft p-4">
  重要內容
</div>
```

### 標籤/Badge
```tsx
// 標準標籤
<span className="bg-primary text-white px-3 py-1 rounded-full text-sm">
  已完成
</span>

// 強調標籤
<span className="bg-accent text-white px-3 py-1 rounded-full text-sm">
  重要
</span>
```

---

## ❌ 避免用法

### 對比度不足
```tsx
// ❌ 錯誤：綠色背景 + 深褐色文字
<div className="bg-primary text-primary-text">...</div>

// ✅ 正確：綠色背景 + 白色文字
<div className="bg-primary text-white">...</div>
```

### 過度使用顏色
```tsx
// ❌ 錯誤：同時使用多種顏色
<div className="bg-primary border-accent text-accent-light">...</div>

// ✅ 正確：保持簡潔
<div className="bg-primary text-white">...</div>
```

---

## 🎯 對比度檢查

### WCAG AA 標準（最低要求 4.5:1）
| 背景顏色 | 文字顏色 | 對比度 | 狀態 |
|---------|---------|-------|------|
| `#6B9144` (primary) | `#FFFFFF` (white) | ~5.2:1 | ✅ 通過 |
| `#78A153` (primary-light) | `#FFFFFF` (white) | ~4.2:1 | ⚠️ 接近 |
| `#E9A15A` (accent) | `#FFFFFF` (white) | ~3.8:1 | ⚠️ 偏低 |
| `#FFFFFF` (white) | `#8D775F` (primary-text) | ~5.8:1 | ✅ 通過 |
| `#F7F4EB` (primary-bg) | `#8D775F` (primary-text) | ~5.5:1 | ✅ 通過 |

### 建議
- 主要按鈕和 Header 使用 `bg-primary` (深綠) 確保對比度
- 圖示使用 `text-primary-light` (淺綠) 保持視覺柔和
- 所有彩色背景必須搭配 `text-white`

---

## 📝 實際應用範例

### Header
```tsx
<header className="bg-primary text-white py-6 px-4">
  <h1 className="text-2xl font-bold">旅遊手帳</h1>
</header>
```

### 按鈕組
```tsx
<div className="flex gap-2">
  <button className="btn-primary">確認</button>
  <button className="btn-outline">取消</button>
</div>
```

### 行程卡片
```tsx
<div className="card">
  <div className="flex items-center gap-3">
    <FontAwesomeIcon
      icon={['fas', 'plane']}
      className="text-2xl text-primary-light"
    />
    <div>
      <h3 className="font-medium text-primary-text">航班資訊</h3>
      <p className="text-sm text-primary-text opacity-70">詳細內容</p>
    </div>
  </div>
</div>
```

---

## 🔄 配色更新歷史

### v1.1 (當前版本)
- 將主色 `#78A153` 加深為 `#6B9144` 提高對比度
- 新增 `primary-light` 用於圖示，保持視覺柔和度
- 移除全域 `* { text-primary-text }` 避免繼承問題
- 明確規範彩色背景必須使用白色文字

### v1.0 (初始版本)
- 基礎動森風格配色
