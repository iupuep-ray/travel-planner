// 本地動森風格圖片素材配置
// 所有圖片位於 /pic 資料夾

export const LOCAL_IMAGES = {
  // 首頁裝飾圖片
  homepage: {
    // 天氣相關
    weather: '/pic/icon-weather.png',
    // 裝飾元素
    leaves: '/pic/icon-leaves.png',
    plant1: '/pic/icon-plant1.png',
    plant2: '/pic/icon-plant2.png',
    cat: '/pic/icon-cat.png',
    frog1: '/pic/icon-frog1.png',
    frog2: '/pic/icon-frog2.png',
  },

  // 功能頁面圖示
  features: {
    // 首頁
    house: '/pic/icon-house.png',
    calendar: '/pic/icon-calender.png',

    // 行程相關
    paperAirplane: '/pic/icon-paper-airplane.png',  // 航班
    tent: '/pic/icon-tent.png',                      // 住宿/露營
    food: '/pic/icon-food.png',                      // 餐廳
    map: '/pic/icon-map.png',                        // 景點/地圖
    passport: '/pic/icon-passport.png',              // 旅遊/護照
    flag: '/pic/icon-flag.png',                      // 旗幟/景點
    earth: '/pic/icon-earth.png',                    // 地球/旅行

    // 記帳相關
    wallet: '/pic/icon-wallet.png',                  // 錢包
    money: '/pic/icon-money.png',                    // 金錢
    creditCard: '/pic/icon-creditcard.png',          // 信用卡

    // 準備清單
    notes: '/pic/icon-notes.png',                    // 筆記/清單
    notes1: '/pic/icon-notes1.png',                  // 筆記本
    tools: '/pic/icon-tools.png',                    // 工具/準備
    tools2: '/pic/icon-tools2.png',                  // 工具箱
    apple: '/pic/icon-apple.png',                    // 蘋果/食物

    // 其他裝飾
    star: '/pic/icon-star.png',                      // 星星
    dialog: '/pic/icon-dialog.png',                  // 對話框
    laugh: '/pic/icon-laugh.png',                    // 笑臉
    fossil: '/pic/icon-fossil.png',                  // 化石/收藏
  },

  // 行程類型對應的裝飾圖（多樣化選項）
  scheduleDecorations: {
    flight: ['/pic/icon-paper-airplane.png', '/pic/icon-earth.png', '/pic/icon-passport.png'],
    lodging: ['/pic/icon-tent.png', '/pic/icon-house.png'],
    restaurant: ['/pic/icon-food.png', '/pic/icon-apple.png'],
    spot: ['/pic/icon-flag.png', '/pic/icon-map.png', '/pic/icon-earth.png'],
    shopping: ['/pic/icon-wallet.png', '/pic/icon-money.png', '/pic/icon-creditcard.png'],
  },

  // 空狀態插圖
  emptyStates: {
    noSchedule: '/pic/icon-map.png',
    noExpense: '/pic/icon-money.png',
    noPlan: '/pic/icon-notes.png',
    general: '/pic/icon-dialog.png',
  },

  // 通用裝飾圖示
  decorative: {
    general1: '/pic/icon-1.png',
    general2: '/pic/icon2.png',
    leaves: '/pic/icon-leaves.png',
    plant1: '/pic/icon-plant1.png',
    plant2: '/pic/icon-plant2.png',
    cat: '/pic/icon-cat.png',
    frog1: '/pic/icon-frog1.png',
    frog2: '/pic/icon-frog2.png',
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
