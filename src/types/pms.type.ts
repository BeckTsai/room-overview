/** 入住狀態 */
export enum OrderStatus {
  /** 即將入住 */
  UPCOMING = 'UPCOMING',
  /** 已取消 */
  CANCELED = 'CANCELED',
  /** 已入住 */
  CHECKED_IN = 'CHECKED_IN',
  /** 已退房 */
  CHECKED_OUT = 'CHECKED_OUT',
}

/** 金流狀態 */
export enum PaymentStatus {
  /** 未付 */
  UNPAID = 'UNPAID',
  /** 部分付款 */
  PAID_IN_PART = 'PAID_IN_PART',
  /** 已付清 */
  PAID_IN_FULL = 'PAID_IN_FULL',
}

export enum PaymentMethod {
  /** 現金 */
  CASH = 15,
  /** 信用卡 */
  CREDIT_CARD = 4,
};

/** 訂房類型 */
export enum BookingRoomType {
  /** 一般訂房 */
  ORDER = 'ORDER',
  /** 維修房 */
  MAINTAIN = 'MAINTAIN',
  /** 保留房 */
  KEEPING = 'KEEPING',
}

/** 訂單資料 */
export interface Order {
  /** 訂單 ID */
  booking_id: number;
  /** 訂單入住狀態 */
  status: OrderStatus;
  /** 訂單來源 */
  source: string;
  /** 訂單編號 */
  number: string;
  /** 平台編號 */
  platform_id: number | null;
  /** 平台訂單編號 */
  platform_number: string;
  /** 訂購人姓名 */
  name: string;
  /** 電話 */
  phone: string;
  /** 信箱 */
  email: string;
  /** 入住日期。YYYY-MM-DD */
  check_in: string;
  /** 退房日期。YYYY-MM-DD */
  check_out: string;
  /** 總價 */
  price: string;
  /** 已收金額 */
  income: string;
  /** 實付金額 (收款＋退款) */
  paid: string;
  /** 未付金額 */
  unpaid: string;
  /** 未付金額（數值） */
  unpaid_raw: string;
  /** 國籍別 */
  nationality: string;
  /** 出發地 */
  departure: string;
  /** 是否開立發票。true 該開立；false 不須開立。 */
  invoice: boolean;
  /** 備註 */
  comment: string;
  /** 金流狀態 */
  payment_status: PaymentStatus;
  /** 訂購房間 */
  rooms: OrderRoom[];
  /** 已開立發票 */
  invoices: OrderInvoice[];
  /** 休息資料 */
  microstay?: OrderMicrostay;
  parking_space: ParkingSpace[];
}

export interface OrderRoom {
  /** 訂房 ID */
  id: number;
  /** 訂房類型 */
  booking_room_type: BookingRoomType;
  /** 房型名稱 */
  type: string;
  /** 棟別 (未配房則無資料) */
  building: string | null;
  /** 房號 (未配房則無資料) */
  number: string | null;
  /** 入住日期。YYYY-MM-DD */
  start_date: string;
  /** 退房日期。YYYY-MM-DD */
  check_out: string;
  /** 入住狀態 */
  status: OrderStatus;
  /** 房況，true 可入住；false 不可入住 */
  clear: boolean;
  /** 緊急通報內容 */
  report: string;
}

/** 訂單休息內容 */
export interface OrderMicrostay {
  /** 訂房 ID */
  id: number;
  /** 方案 ID */
  plan_id: number;
  /** 方案 */
  plan: string;
  /** 時數 */
  hours: number;
  /** 入住時間。YYYY-MM-DD HH:mm */
  check_in: string;
  /** 預計退房時間。YYYY-MM-DD HH:mm */
  est_check_out: string;
  /** 退房時間。YYYY-MM-DD HH:mm */
  check_out: string;
}

/** 訂單發票內容 */
export interface OrderInvoice {
  /** 發票號碼。ex: CA64839684 */
  number: string;
  /** 開立日期。YYYY-MM-DD */
  date: string;
  /** 開立時間。HH:mm:ss */
  time: string;
  /** 開立金額 */
  amount: string;
  /** 隨機碼。ex: 8886 */
  random: number;
  /** 品項 */
  items: OrderInvoiceItem[];
}

export interface OrderInvoiceItem {
  /** 商品名稱 */
  name: string;
  /** 商品數量 */
  count: number;
  /** 商品價格 */
  price: number;
}

/** 發票詳細資訊（來自綠界資料） */
export interface OrderInvoiceInfo {
  /** "BEBE9D876B89891F75F5DA40C6D8A33B" */
  CheckMacValue: string;
  /**  */
  IIS_Award_Flag: string;
  /**  */
  IIS_Award_Type: string;
  /**  */
  IIS_Carruer_Num: string;
  /**  */
  IIS_Carruer_Type: string;
  /** B2C */
  IIS_Category: string;
  /** P */
  IIS_Check_Number: string;
  /**  */
  IIS_Clearance_Mark: string;
  /** 開立時間。YYYY-MM-DD HH:mm:ss */
  IIS_Create_Date: string;
  /**  */
  IIS_Customer_Addr: string;
  /** ex: empty@empty.com */
  IIS_Customer_Email: string;
  /**  */
  IIS_Customer_ID: string;
  /**  */
  IIS_Customer_Name: string;
  /**  */
  IIS_Customer_Phone: string;
  /**  */
  IIS_IP: string;
  /**  */
  IIS_Identifier: string;
  /**  */
  IIS_Invalid_Status: string;
  /**  */
  IIS_Issue_Status: string;
  /**  */
  IIS_Love_Code: string;
  /** ex: 3169929 */
  IIS_Mer_ID: string;
  /** 發票編號。XX00000000 */
  IIS_Number: string;
  /**  */
  IIS_Print_Flag: string;
  /** 隨機碼。4 碼 */
  IIS_Random_Number: string;
  /**  */
  IIS_Relate_Number: string;
  /**  */
  IIS_Remain_Allowance_Amt: string;
  /** 開立金額。3800 */
  IIS_Sales_Amount: string;
  /**  */
  IIS_Tax_Amount: string;
  /**  */
  IIS_Tax_Rate: string;
  /**  */
  IIS_Tax_Type: string;
  /**  */
  IIS_Turnkey_Status: string;
  /**  */
  IIS_Type: string;
  /** 上傳時間。YYYY-MM-DD HH:mm:ss */
  IIS_Upload_Date: string;
  /**  */
  IIS_Upload_Status: string;
  /** 發票備註 */
  InvoiceRemark: string;
  /** 品項金額。「|」分隔 */
  ItemAmount: string;
  /** 品項數量。「|」分隔 */
  ItemCount: string;
  /** 品項名稱。「|」分隔 */
  ItemName: string;
  /** 品項價格。「|」分隔 */
  ItemPrice: string;
  /** 品項備註。「|」分隔 */
  ItemRemark: string;
  /**  */
  ItemTaxType: string;
  /** 品項單位。「|」分隔 */
  ItemWord: string;
  /** 條碼內容 */
  PosBarCode: string;
  /** 左 QRCode 內容 */
  QRCode_Left: string;
  /** 右 QRCode 內容 */
  QRCode_Right: string;
}

/** 訂單停車資訊 */
export interface ParkingSpace {
  /** 格式 YYYY-MM-DD */
  start_date: string;
  /** 格式 YYYY-MM-DD */
  check_out: string;
  /** 數量 */
  qty: number;
  price: number;
  /** 停車備註 */
  remark: string;
}

export interface AvailableRoom {
  /** 房型 ID */
  id: number;
  name: string;
  en_name: string;
  /** 床型。ex: 一大床 */
  bed_type: string;
  images: string[];
  /** 最多入住人數 */
  guests: number;
  /** 房型介紹 */
  intro: string;
  /** 房號清單 */
  room_no: string[];
  properties: AvailableRoomProperty[];
}

export interface AvailableRoomProperty {
  /** 日期。格式 YYYY-MM-DD */
  date: string;
  price: string;
  /** 可訂購房間數 */
  rooms: number;
}

export interface MicrostayPlan {
  id: number;
  name: string;
  hours: number;
  prices: MicrostayPlanPrice[];
}

export interface MicrostayPlanPrice {
  room_type_id: number;
  room_type_name: string;
  price: string;
  rooms: number;
}

export interface DomainInfo {
  hotel: {
    id: number;
    /** 場域中文名稱 */
    name: string;
  }
}

// 房間訂單跟著訂單資訊
export interface OrderData extends Order {
  room: OrderRoom;
}