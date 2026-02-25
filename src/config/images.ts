// 本地動森風格圖片素材配置
// 所有圖片位於 /pic 資料夾

// 獲取基礎路徑（支援 GitHub Pages 子路徑）
const BASE_URL = import.meta.env.BASE_URL;
const getImagePath = (path: string) => `${BASE_URL}${path.startsWith('/') ? path.slice(1) : path}`;

export const LOCAL_IMAGES = {
  // 首頁裝飾圖片
  homepage: {
    // 天氣相關
    weather: getImagePath('/newpic/weather_cloudy.png'),
    // 裝飾元素
    leaves: getImagePath('/pic/icon-leaves.png'),
    plant1: getImagePath('/pic/icon-plant1.png'),
    plant2: getImagePath('/pic/icon-plant2.png'),
    cat: getImagePath('/pic/icon-cat.png'),
    frog1: getImagePath('/pic/icon-frog1.png'),
    frog2: getImagePath('/pic/icon-frog2.png'),
  },

  // 功能頁面圖示
  features: {
    // 首頁
    house: getImagePath('/pic/icon-house.png'),
    calendar: getImagePath('/pic/icon-calender.png'),

    // 行程相關
    paperAirplane: getImagePath('/pic/icon-paper-airplane.png'),  // 航班
    tent: getImagePath('/pic/icon-tent.png'),                      // 住宿/露營
    food: getImagePath('/pic/icon-food.png'),                      // 餐廳
    map: getImagePath('/pic/icon-map.png'),                        // 景點/地圖
    passport: getImagePath('/pic/icon-passport.png'),              // 旅遊/護照
    flag: getImagePath('/pic/icon-flag.png'),                      // 旗幟/景點
    earth: getImagePath('/pic/icon-earth.png'),                    // 地球/旅行

    // 記帳相關
    wallet: getImagePath('/pic/icon-wallet.png'),                  // 錢包
    money: getImagePath('/pic/icon-money.png'),                    // 金錢
    creditCard: getImagePath('/pic/icon-creditcard.png'),          // 信用卡

    // 準備清單
    notes: getImagePath('/pic/icon-notes.png'),                    // 筆記/清單
    notes1: getImagePath('/pic/icon-notes1.png'),                  // 筆記本
    tools: getImagePath('/pic/icon-tools.png'),                    // 工具/準備
    tools2: getImagePath('/pic/icon-tools2.png'),                  // 工具箱
    apple: getImagePath('/pic/icon-apple.png'),                    // 蘋果/食物

    // 其他裝飾
    star: getImagePath('/pic/icon-star.png'),                      // 星星
    dialog: getImagePath('/pic/icon-dialog.png'),                  // 對話框
    laugh: getImagePath('/pic/icon-laugh.png'),                    // 笑臉
    fossil: getImagePath('/pic/icon-fossil.png'),                  // 化石/收藏
  },

  // 行程類型對應的裝飾圖（多樣化選項）
  scheduleDecorations: {
    flight: [getImagePath('/pic/icon-paper-airplane.png'), getImagePath('/pic/icon-earth.png'), getImagePath('/pic/icon-passport.png')],
    lodging: [getImagePath('/pic/icon-tent.png'), getImagePath('/pic/icon-house.png')],
    restaurant: [getImagePath('/pic/icon-food.png'), getImagePath('/pic/icon-apple.png')],
    spot: [getImagePath('/pic/icon-flag.png'), getImagePath('/pic/icon-map.png'), getImagePath('/pic/icon-earth.png')],
    shopping: [getImagePath('/pic/icon-wallet.png'), getImagePath('/pic/icon-money.png'), getImagePath('/pic/icon-creditcard.png')],
  },

  // 空狀態插圖
  emptyStates: {
    noSchedule: getImagePath('/pic/icon-map.png'),
    noExpense: getImagePath('/pic/icon-money.png'),
    noPlan: getImagePath('/pic/icon-notes.png'),
    general: getImagePath('/pic/icon-dialog.png'),
  },

  // 通用裝飾圖示
  decorative: {
    general1: getImagePath('/pic/icon-1.png'),
    general2: getImagePath('/pic/icon2.png'),
    leaves: getImagePath('/pic/icon-leaves.png'),
    plant1: getImagePath('/pic/icon-plant1.png'),
    plant2: getImagePath('/pic/icon-plant2.png'),
    cat: getImagePath('/pic/icon-cat.png'),
    frog1: getImagePath('/pic/icon-frog1.png'),
    frog2: getImagePath('/pic/icon-frog2.png'),
  },
};

// 圖片載入輔助函數
export const getLocalImage = (imagePath: string) => {
  return imagePath;
};

// 隨機選擇裝飾圖片（基於 ID 保持一致性）
export const getRandomDecoration = (type: keyof typeof LOCAL_IMAGES.scheduleDecorations, id: string) => {
  const images = LOCAL_IMAGES.scheduleDecorations[type];
  const index = parseInt(id, 36) % images.length;
  return images[index];
};
