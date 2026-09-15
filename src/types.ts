export type AppView = 'portal' | 'farm' | 'restaurant' | 'wedding' | 'operations';

export type UserRole = 'guest' | 'admin';

export interface AdminUser {
  username: string;
  name: string;
  role: 'admin' | 'manager';
  phone: string;
}

export type ActiveTab = 'overview' | 'menu' | 'booking' | 'admin';

export interface ManagerProfile {
  name: string;
  title: string;
  phones: string[];
  responsibilities: string[];
  avatarBg: string;
}

export type TableBookingStatus = 'new' | 'confirmed' | 'serving' | 'completed' | 'cancelled';

export interface TableBooking {
  id: string;
  code: string;
  customerName: string;
  phone: string;
  bookingDate: string;
  bookingTime: string;
  guestCount: number;
  tableArea?: string;
  tableNumber?: string; // Bàn gán cụ thể ví dụ "Bàn SV-02"
  notes?: string;
  adminNote?: string; // Phản hồi / lời nhắn từ Quản trị viên gửi cho khách
  status: TableBookingStatus;
  createdAt: string;
  updatedAt?: string;
  preOrderItems?: RestaurantOrderItem[];
  preOrderTotal?: number;
  kitchenStatus?: 'pending' | 'preparing' | 'ready' | 'served';
  dishesConfirmed?: boolean; // Admin đã duyệt nguyên liệu/món cho khách
  customerNotified?: boolean; // Đã liên hệ Zalo/SMS đồng bộ khách
  lastSyncAt?: string;
  rejectionReason?: string; // Lý do không tiếp nhận (admin chọn)
  rejectionCustomNote?: string; // Ghi chú chi tiết lý do từ chối
  rejectedAt?: string; // Thời gian từ chối
  customerAction?: 'reorder' | 'dismissed'; // Phản hồi của khách: chọn món đặt lại hoặc bỏ qua
}

export type MenuItemCategory = 
  | 'specialty' // Đặc sản Dúi
  | 'appetizer' // Khai vị & Gỏi nhậu
  | 'main' // Món chính & Nướng than
  | 'hotpot_grill' // Lẩu & Nướng
  | 'seafood' // Hải sản tươi sống
  | 'drink' // Đồ uống & Bia
  | 'dessert' // Tráng miệng
  | 'wedding_appetizer' // Khai vị tiệc cưới
  | 'wedding_main' // Món chính tiệc cưới
  | 'wedding_hotpot' // Lẩu & Cơm tiệc cưới
  | 'wedding_dessert'; // Tráng miệng tiệc cưới

export type MenuServiceType = 'restaurant' | 'wedding' | 'both';

export interface MenuItem {
  id: string;
  name: string;
  category: MenuItemCategory;
  price: number;
  description: string;
  image: string;
  isPopular?: boolean;
  isSpecialty?: boolean;
  isDuiDish?: boolean;
  serviceType?: MenuServiceType; // 'restaurant' (Quán nhậu/quán ăn) | 'wedding' (Tiệc cưới) | 'both'
  available: boolean;
  portion?: string;
  unit?: string;
}

export type WeddingStatus = 'new' | 'consulting' | 'confirmed' | 'preparing' | 'completed' | 'cancelled';

export interface WeddingInquiry {
  id: string;
  code: string;
  customerName: string;
  phone: string;
  eventDate: string;
  eventTime: 'noon' | 'evening';
  expectedGuests: number;
  expectedTables: number;
  venueLocation: 'hall_ngocnhi' | 'outdoor_garden' | 'home_catering';
  eventType: 'wedding' | 'engagement' | 'birthday' | 'corporate';
  packageId?: string;
  packageName?: string;
  notes?: string;
  status: WeddingStatus;
  createdAt: string;
  depositAmount?: number;
}

export interface WeddingPackage {
  id: string;
  name: string;
  tier: 'silver' | 'gold' | 'diamond';
  tagline: string;
  pricePerTable: number;
  menuItemCount: number;
  highlights: string[];
  includes: string[];
  recommendedFor: string;
  image: string;
  badge?: string;
}

// ----------------------------------------------------
// DÚI CON GIỐNG & DÚI THỊT THƯƠNG PHẨM ORDER TYPES
// ----------------------------------------------------
export type DuiProductType = 
  | 'giong_3_4_lang'      // Dúi giống (3–4 lạng): 1.500.000đ/cặp
  | 'giong_5_6_lang'      // Dúi giống (5–6 lạng): 1.700.000đ/cặp
  | 'giong_8_lang_1kg'    // Dúi giống (8 lạng – 1 kg): 2.400.000đ/cặp
  | 'giong_hau_bi'        // Dúi giống hậu bị (1,2 – 1,4 kg): 3.000.000đ/cặp (Đồng bộ Khu Hậu Bị)
  | 'giong_1_2_1_4kg'     // Alias cho Dúi giống hậu bị (1,2 – 1,4 kg)
  | 'giong_bo_me_bao_de'  // Dúi bố mẹ bao đẻ: 4.000.000đ/cặp (Đồng bộ Khu Sinh Sản)
  | 'dui_thuong_pham';    // Dúi thương phẩm: 700.000đ/kg (Đồng bộ Khu Thương Phẩm)

export type DuiOrderStatus = 'new' | 'confirmed' | 'shipping' | 'completed' | 'cancelled';

export interface DuiProductOrder {
  id: string;
  code: string; // Mã đơn NN-DUI-xxxx
  customerName: string;
  phone: string;
  deliveryAddress: string;
  deliveryType: 'at_farm' | 'ship_home'; // Nhận tại trại KaKa hoặc Giao tận nơi
  productType: DuiProductType;
  productName: string;
  quantity: number;
  unit: string; // 'cặp', 'con', 'kg'
  pricePerUnit: number;
  estimatedTotal: number;
  expectedDate?: string;
  notes?: string;
  status: DuiOrderStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface SystemNotification {
  id: string;
  type: 'farm' | 'restaurant' | 'wedding' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionView?: AppView;
}

// ----------------------------------------------------
// RESTAURANT ORDERS & CART
// ----------------------------------------------------
export interface RestaurantOrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  notes?: string;
}

export type RestaurantOrderStatus = 
  | 'waiting_weighing' // CHỜ CÂN DÚI (Khách đã gửi yêu cầu, chờ admin cân và báo giá)
  | 'quoted'           // ĐÃ BÁO GIÁ (Admin đã cân và gửi giá, chờ khách xác nhận)
  | 'pending' 
  | 'confirmed' 
  | 'cooking' 
  | 'serving' 
  | 'completed' 
  | 'cancelled';

export interface RestaurantOrder {
  id: string;
  code: string;
  customerName: string;
  phone: string;
  tableNumber?: string;
  tableArea?: string;
  address?: string;
  deliveryAddress?: string;
  orderType: 'dine_in' | 'takeaway' | 'delivery';
  items: RestaurantOrderItem[];
  subtotal: number;
  discount: number;
  discountCode?: string;
  total: number;
  notes?: string;
  paymentStatus: 'unpaid' | 'paid';
  status: RestaurantOrderStatus;
  createdAt: string;
  updatedAt?: string;
  // Dúi custom quote details
  hasDuiItems?: boolean;
  duiWeightKg?: number;          // Trọng lượng thực tế sau khi cân (kg)
  duiPricePerKg?: number;        // Giá dúi / kg (mặc định 650.000đ - 700.000đ/kg)
  duiDishesCount?: number;       // Số lượng món dúi đã chọn
  duiDishesList?: string[];      // Tên các món dúi đã chọn
  duiCookingFeePerDish?: number; // 250.000đ/món (chỉ nội bộ admin thấy)
  duiRawMeatCost?: number;       // Trọng lượng * Giá/kg (chỉ nội bộ admin)
  duiCookingTotalCost?: number;  // Số món * 250k (chỉ nội bộ admin)
  adminQuotedAt?: string;
  quoteMessage?: string;
  customerDecision?: 'accepted' | 'reselect'; // Khách chọn Đồng ý đặt / Chọn lại món
  rejectionReason?: string; // Lý do không tiếp nhận
  rejectionCustomNote?: string; // Ghi chú chi tiết lý do từ chối
  adminNote?: string; // Lời nhắn gửi khách từ admin
  rejectedAt?: string; // Thời gian từ chối
  customerAction?: 'reorder' | 'dismissed'; // Phản hồi của khách
}

// ----------------------------------------------------
// EXTERNAL / MANUAL FINANCIAL TRANSACTIONS
// ----------------------------------------------------
export type FinanceEntryType = 'THU' | 'CHI';

export type FinanceCategory = 
  | 'quan_an'
  | 'trang_trai'
  | 'tiec_cuoi'
  | 'thue_mat_bang'
  | 'dien_nuoc_tien_ich'
  | 'luong_nhan_su'
  | 'tiep_thi_quang_cao'
  | 'trang_thiet_bi'
  | 'vat_tu_kho'
  | 'nguon_khac';

export interface ExternalFinanceRecord {
  id: string;
  code: string;
  type: FinanceEntryType; // 'THU' (Doanh thu ngoài) | 'CHI' (Chi phí ngoài)
  category: FinanceCategory;
  categoryName: string;
  title: string;
  amount: number;
  paymentMethod: 'Chuyển khoản' | 'Tiền mặt' | 'Thẻ tín dụng' | 'Khác';
  recordDate: string; // YYYY-MM-DD
  time?: string;
  recordedBy: string;
  notes?: string;
  invoiceCode?: string;
  createdAt: string;
}

// ----------------------------------------------------
// AI ASSISTANT & ADMIN DECISION APPROVALS
// ----------------------------------------------------
export type AIDecisionType = 
  | 'chot_don_giong' 
  | 'chot_don_tiec' 
  | 'chot_ban_an' 
  | 'giam_gia_dac_biet' 
  | 'khieu_nai_bao_hanh' 
  | 'nghiep_vu_khac';

export interface AIDecisionRequest {
  id: string;
  code: string; // VD: DEC-1234
  customerName: string;
  phone: string;
  module: 'farm' | 'restaurant' | 'wedding' | 'general';
  decisionType: AIDecisionType;
  title: string;
  summary: string;
  customerMessage: string;
  estimatedValue?: number;
  status: 'pending' | 'approved' | 'rejected' | 'contacted';
  createdAt: string;
  adminNote?: string;
  resolvedAt?: string;
}


