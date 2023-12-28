const keyDefine = {
  orderStatus: {
    UPCOMING: '即將入住',
    CANCELED: '已取消',
    CHECKED_IN: '已入住',
    CHECKED_OUT: '退房',
  },
  platformId: {
    '104': 'Airbnb',
    '105': 'Agoda',
    '106': 'booking',
    '107': 'expedia',
    '108': 'Hotels',
    '109': 'Hostelworld',
    '110': 'Homeaway',
    '111': '攜程',
    '112': '藝龍',
    '113': '自在客',
    '114': '悠悠(淘寶網)',
    '115': '台灣自由行',
    '116': 'HopeTrip旅遊網',
    '117': '百酷網',
    '118': '游多多',
    '119': '窮游網',
    '120': 'Waka',
    '121': '易遊網',
    '122': '四方通行',
    '123': 'EZ訂',
    '124': '愛台風',
    '125': 'asiayo',
    '126': '完全台灣okgo',
    '127': 'i台灣',
    '128': '可樂旅遊',
    '129': '東南旅遊',
    '130': '雄獅旅遊',
    '131': '旅遊王travelking',
    '132': 'Gomaji',
    '133': '17life',
    '134': '美美網',
    '135': '易飛網',
    '136': '台灣好玩',
    '137': '燦星',
    '138': '旅圖',
    '139': 'AsiaRooms',
    '140': 'HotelsCombined',
    '141': '台灣島旅遊',
  },
};

export const keyToText = (type: keyof typeof keyDefine, val: string) => {
  const keyType = keyDefine[type];
  if (!keyType) {
    return null;
  }

  return keyType[val as keyof typeof keyType] || null;
};

/** 打開 PMS 金流頁面
 * @param {String} domain
 * @param {String} orderNum
 * @param {String} config Window 設定
 */

const windowConfig = [
  'toolbar=no',
  'status=no',
  'menubar=no',
  'location=no',
  `width=${screen.width}`,
  `height=${screen.height}`,
  'fullscreen=yes',
].join(',');

export const openTransactionWindow = (domain: string, orderNum: string, config = null) => {
  const openingUrlConfig = !config ? windowConfig : config;
  const url = `https://${domain}.mastripms.com/bookings/lists?number=${orderNum}#transaction`;
  return window.open(url, '', openingUrlConfig);
};

/** 打開 PMS 發票頁面
 * @param {String} domain
 * @param {String} bookingId
 * @param {String} config Window 設定
 */

export const openInvoiveWindow = (domain: string, bookingId: string, config = null) => {
  const openingUrlConfig = !config ? windowConfig : config;
  const url = `https://${domain}.mastripms.com/bookings/invoice/${bookingId}`;
  return window.open(url, '', openingUrlConfig);
};

/** 打開 PMS 編輯訂單畫面
 * @param {String} domain
 * @param {String} bookingId
 * @param {String} config Window 設定
 */
export const openEditOrderWindow = (domain: string, bookingId: string, config = null) => {
  const openingUrlConfig = !config ? windowConfig : config;
  const url = `https://${domain}.mastripms.com/booking/edit/${bookingId}`;
  return window.open(url, '', openingUrlConfig);
};

/** 打開 PMS 配房表
 * @param {String} domain
 * @param {String} config Window 設定
 */
export const openRoomSchedulerWindow = (domain: string, config = null) => {
  const openingUrlConfig = !config ? windowConfig : config;
  const url = `https://${domain}.mastripms.com/bookings/room_scheduler`;

  return window.open(url, '', openingUrlConfig);
};

/** 打開 PMS 配房
 * @param {String} domain
 * @param {String} orderNum 訂單編號，可以自動搜尋指定訂單。為空則顯示全部訂單。
 * @param {String} config Window 設定
 */
export const openOrderSetRoomWindow = (domain: string, orderNum: string, config = null) => {
  const openingUrlConfig = !config ? windowConfig : config;
  const url = `https://${domain}.mastripms.com/bookings/lists?number=${orderNum}#assignment`;
  return window.open(url, '', openingUrlConfig);
};

/** 打開 PMS 訂單總表
 * @param {String} domain
 * @param {String} orderNum 訂單編號，可以自動搜尋指定訂單。為空則顯示全部訂單。
 * @param {String} config Window 設定
 */
export const openOrderListWindow = (domain: string, orderNum: string, config = null) => {
  const openingUrlConfig = !config ? windowConfig : config;
  const url = `https://${domain}.mastripms.com/bookings/lists?number=${orderNum}`;
  return window.open(url, '', openingUrlConfig);
};
