# FontAwesome 使用指南

## 📦 已安裝套件

```json
{
  "@fortawesome/fontawesome-svg-core": "^6.x",
  "@fortawesome/free-solid-svg-icons": "^6.x",
  "@fortawesome/free-regular-svg-icons": "^6.x",
  "@fortawesome/react-fontawesome": "^0.2.x"
}
```

## 🎨 使用方式

### 1. 基本用法

```tsx
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '@/utils/fontawesome'; // 引入配置

function MyComponent() {
  return (
    <FontAwesomeIcon icon={['fas', 'house']} />
  );
}
```

### 2. 調整大小

```tsx
// 使用 Tailwind CSS
<FontAwesomeIcon icon={['fas', 'house']} className="text-xl" />
<FontAwesomeIcon icon={['fas', 'house']} className="text-2xl" />
<FontAwesomeIcon icon={['fas', 'house']} className="text-3xl" />

// 使用 FontAwesome 內建大小
<FontAwesomeIcon icon={['fas', 'house']} size="lg" />
<FontAwesomeIcon icon={['fas', 'house']} size="2x" />
<FontAwesomeIcon icon={['fas', 'house']} size="3x" />
```

### 3. 調整顏色

```tsx
// 使用 Tailwind CSS 配色
<FontAwesomeIcon icon={['fas', 'house']} className="text-primary" />
<FontAwesomeIcon icon={['fas', 'house']} className="text-accent" />
<FontAwesomeIcon icon={['fas', 'house']} className="text-primary-text" />
```

### 4. 旋轉與動畫

```tsx
// 旋轉
<FontAwesomeIcon icon={['fas', 'sync']} spin />
<FontAwesomeIcon icon={['fas', 'spinner']} pulse />

// 翻轉
<FontAwesomeIcon icon={['fas', 'shield']} flip="horizontal" />
<FontAwesomeIcon icon={['fas', 'shield']} flip="vertical" />
```

## 📚 常用圖示參考

已在 `src/utils/fontawesome.ts` 中預載入常用圖示：

### 導航類
- `house` - 首頁
- `calendar-days` - 行程
- `wallet` - 記帳
- `list-check` - 準備清單
- `users` - 成員

### 行程類別
- `plane` - 機票 ✈️
- `hotel` - 住宿 🏨
- `utensils` - 餐廳 🍴
- `map-location-dot` - 景點 📍
- `bag-shopping` - 購物 🛍️

### 操作類
- `circle-plus` - 新增
- `circle-check` - 確認
- `circle-xmark` - 關閉
- `pen-to-square` - 編輯
- `trash-can` - 刪除
- `ellipsis-vertical` - 更多選項

### 外部連結
- `map-marker-alt` - 地圖標記
- `external-link-alt` - 外部連結
- `image` - 圖片

### 天氣
- `sun` - 晴天 ☀️
- `cloud-sun` - 多雲 ⛅
- `cloud-rain` - 雨天 🌧️

## 🔍 尋找更多圖示

前往 FontAwesome 官網搜尋：https://fontawesome.com/icons

### 使用新圖示的步驟：

1. 在 FontAwesome 網站找到你想要的圖示
2. 確認它屬於 **Free** 版本
3. 在 `src/utils/fontawesome.ts` 中 import：
   ```ts
   import { faYourIcon } from '@fortawesome/free-solid-svg-icons';
   ```
4. 加入 library：
   ```ts
   library.add(faYourIcon);
   ```
5. 在組件中使用：
   ```tsx
   <FontAwesomeIcon icon={['fas', 'your-icon']} />
   ```

## 💡 使用建議

### ✅ 推薦做法
- 優先使用 FontAwesome 圖示保持視覺一致性
- 使用 Tailwind 的 `text-*` 類別控制大小和顏色
- 將常用圖示預先加入 library
- 使用 `ICON_NAMES` 常數避免拼寫錯誤

### ⚠️ 避免做法
- 不要混用太多不同風格的圖示
- 不要使用過多動畫效果（會影響效能）
- 不要在每個組件都 import 圖示（使用 library）

## 📝 範例：行程卡片圖示

```tsx
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ICON_NAMES } from '@/utils/fontawesome';
import type { Schedule } from '@/types';

const getScheduleIcon = (type: Schedule['type']) => {
  const iconMap = {
    flight: ICON_NAMES.PLANE,
    lodging: ICON_NAMES.HOTEL,
    restaurant: ICON_NAMES.UTENSILS,
    spot: ICON_NAMES.MAP_LOCATION,
    shopping: ICON_NAMES.SHOPPING,
  };
  return iconMap[type];
};

function ScheduleCard({ schedule }: { schedule: Schedule }) {
  return (
    <div className="card">
      <FontAwesomeIcon
        icon={['fas', getScheduleIcon(schedule.type)]}
        className="text-2xl text-primary"
      />
      {/* 其他內容 */}
    </div>
  );
}
```

## 🎯 動森風格配色

記得使用專案配色來保持動森風格：

```tsx
// 主色 - 動森綠
<FontAwesomeIcon icon={['fas', 'house']} className="text-primary" />

// 輔助色 - 暖橘
<FontAwesomeIcon icon={['fas', 'house']} className="text-accent" />

// 文字色 - 深褐
<FontAwesomeIcon icon={['fas', 'house']} className="text-primary-text" />
```
