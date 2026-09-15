import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  UtensilsCrossed, 
  Sparkles, 
  Phone, 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Search, 
  Scale, 
  ArrowRight, 
  ExternalLink, 
  ChefHat, 
  Users, 
  Tag,
  ShieldCheck,
  RotateCw,
  SlidersHorizontal,
  Home,
  XCircle,
  RotateCcw,
  AlertTriangle,
  QrCode
} from 'lucide-react';
import { 
  AppView, 
  MenuItem,
  RestaurantOrder, 
  RestaurantOrderStatus, 
  TableBooking, 
  TableBookingStatus, 
  WeddingInquiry, 
  WeddingStatus,
  AIDecisionRequest
} from '../../types';
import { 
  resolveMenuItemAvailability, 
  getCommercialDuiInventory, 
  checkIsDuiDish 
} from '../../data/inventoryHelper';
import { BookingActionSyncPanel } from './BookingActionSyncPanel';
import { subscribeToDecisions, updateDecisionStatus } from '../../services/aiDecisionService';

const ORDER_REJECTION_REASONS = [
  'Tạm hết món ăn hoặc nguyên liệu tươi khách yêu cầu',
  'Ngoài khung giờ hoặc khoảng cách giao hàng khả dụng',
  'Bếp đang quá tải đơn tiệc, không kịp phục vụ đúng giờ',
  'Không liên hệ được số điện thoại người nhận để xác nhận đơn',
  'Thông tin địa chỉ hoặc số điện thoại chưa chính xác',
  'Lý do khác (tự nhập cụ thể)'
];

interface MasterAdminHubProps {
  orders: RestaurantOrder[];
  bookings: TableBooking[];
  weddingInquiries: WeddingInquiry[];
  onNavigate: (view: AppView) => void;
  onUpdateOrderStatus: (orderId: string, status: RestaurantOrderStatus, additionalData?: Partial<RestaurantOrder>) => void;
  onUpdateBookingStatus: (bookingId: string, status: TableBookingStatus, additionalData?: Partial<TableBooking>) => void;
  onUpdateWeddingStatus: (inquiryId: string, status: WeddingStatus) => void;
  onOpenSystemQR?: () => void;
}

export type AdminManagementTab = 'orders' | 'bookings' | 'weddings' | 'menu' | 'ai_decisions';

export const MasterAdminHub: React.FC<MasterAdminHubProps> = ({
  orders: initialOrders,
  bookings: initialBookings,
  weddingInquiries: initialWeddingInquiries,
  onNavigate,
  onUpdateOrderStatus,
  onUpdateBookingStatus,
  onUpdateWeddingStatus,
  onOpenSystemQR,
}) => {
  // Local state that synchronizes with props and localStorage
  const [orders, setOrders] = useState<RestaurantOrder[]>(() => {
    if (initialOrders && initialOrders.length > 0) return initialOrders;
    try {
      const saved = localStorage.getItem('nn_restaurant_orders');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  });

  const [bookings, setBookings] = useState<TableBooking[]>(() => {
    if (initialBookings && initialBookings.length > 0) return initialBookings;
    try {
      const saved = localStorage.getItem('nn_table_bookings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const realOnly = parsed.filter(b => !['tb-001', 'tb-002', 'tb-003', 'tb-3048'].includes(b.id) && b.code !== 'NN-TB-3048');
          return realOnly;
        }
      }
    } catch (e) {}
    return [];
  });

  const [weddingInquiries, setWeddingInquiries] = useState<WeddingInquiry[]>(() => {
    if (initialWeddingInquiries && initialWeddingInquiries.length > 0) return initialWeddingInquiries;
    try {
      const saved = localStorage.getItem('nn_wedding_inquiries');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const realOnly = parsed.filter(w => !['wd-001', 'wd-002', 'wd-003'].includes(w.id));
          return realOnly;
        }
      }
    } catch (e) {}
    return [];
  });

  // Modal active tab state
  const [activeModalTab, setActiveModalTab] = useState<AdminManagementTab | null>(null);

  // Search and Filter states inside modal
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Dúi Weighing Calculator State inside Orders tab
  const [weighingOrder, setWeighingOrder] = useState<RestaurantOrder | null>(null);
  const [weighKg, setWeighKg] = useState<number>(1.8);
  const [pricePerKg, setPricePerKg] = useState<number>(650000);
  const [weighNotes, setWeighNotes] = useState<string>('');

  // Real-time synchronization of Menu Items and Dúi Inventory
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    try {
      const saved = localStorage.getItem('nn_menu_items_v6');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });
  const [commercialInventory, setCommercialInventory] = useState(getCommercialDuiInventory());

  // AI Decisions & Order Closing Approvals (For Administrator Phan Dung)
  const [aiDecisions, setAiDecisions] = useState<AIDecisionRequest[]>([]);
  const [decisionNotes, setDecisionNotes] = useState<{ [id: string]: string }>({});
  const [decisionModuleFilter, setDecisionModuleFilter] = useState<'all' | 'farm' | 'restaurant' | 'wedding'>('all');

  useEffect(() => {
    const unsub = subscribeToDecisions((list) => {
      setAiDecisions(list);
    });
    return () => unsub();
  }, []);

  const pendingDecisionsCount = aiDecisions.filter(d => d.status === 'pending').length;

  // Toggle dish availability directly from Admin Hub
  const handleToggleDishAvailability = (dishId: string) => {
    const updated = menuItems.map(m => {
      if (m.id === dishId) {
        return { ...m, available: m.available === false ? true : false };
      }
      return m;
    });
    setMenuItems(updated);
    localStorage.setItem('nn_menu_items_v6', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('nn_data_sync'));
  };

  // Keep local state in sync with props without accidentally clobbering with empty array
  useEffect(() => {
    if (initialOrders && initialOrders.length > 0) {
      setOrders(initialOrders);
    }
  }, [initialOrders]);

  useEffect(() => {
    if (initialBookings && initialBookings.length > 0) {
      setBookings(initialBookings);
    }
  }, [initialBookings]);

  useEffect(() => {
    if (initialWeddingInquiries && initialWeddingInquiries.length > 0) {
      setWeddingInquiries(initialWeddingInquiries);
    }
  }, [initialWeddingInquiries]);

  // Derive resilient and real-time datasets (props prioritized, falling back to local storage state)
  const currentOrders = (initialOrders && initialOrders.length > 0) ? initialOrders : orders;
  const currentBookings = (initialBookings && initialBookings.length > 0) ? initialBookings : bookings;
  const currentWeddingInquiries = (initialWeddingInquiries && initialWeddingInquiries.length > 0) ? initialWeddingInquiries : weddingInquiries;

  // Listen to cross-tab BroadcastChannel for instant real-time sync
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel('nn_cross_tab_sync');
        bc.onmessage = (ev) => {
          if (!ev.data) return;
          if (ev.data.type === 'BOOKINGS_SYNC' && Array.isArray(ev.data.payload)) {
            const clean = ev.data.payload.filter((b: any) => !['tb-001', 'tb-002', 'tb-003', 'tb-3048'].includes(b.id) && b.code !== 'NN-TB-3048');
            setBookings(clean);
          }
          if (ev.data.type === 'ORDERS_SYNC' && Array.isArray(ev.data.payload)) {
            setOrders(ev.data.payload);
          }
          if (ev.data.type === 'WEDDING_SYNC' && Array.isArray(ev.data.payload)) {
            setWeddingInquiries(ev.data.payload);
          }
        };
        return () => {
          bc.close();
        };
      }
    } catch (e) {}
  }, []);

  // Real-time synchronization listeners for storage and custom sync events
  useEffect(() => {
    const syncFromStorage = () => {
      try {
        const savedOrders = localStorage.getItem('nn_restaurant_orders');
        if (savedOrders) {
          const parsed = JSON.parse(savedOrders);
          if (Array.isArray(parsed)) setOrders(parsed);
        }
        const savedBookings = localStorage.getItem('nn_table_bookings');
        if (savedBookings) {
          const parsed = JSON.parse(savedBookings);
          if (Array.isArray(parsed)) {
            const realOnly = parsed.filter(b => !['tb-001', 'tb-002', 'tb-003', 'tb-3048'].includes(b.id) && b.code !== 'NN-TB-3048');
            setBookings(realOnly);
          }
        }
        const savedWeddings = localStorage.getItem('nn_wedding_inquiries');
        if (savedWeddings) {
          const parsed = JSON.parse(savedWeddings);
          if (Array.isArray(parsed)) {
            const realOnly = parsed.filter(w => !['wd-001', 'wd-002', 'wd-003'].includes(w.id));
            setWeddingInquiries(realOnly);
          }
        }
        const savedMenu = localStorage.getItem('nn_menu_items_v6');
        if (savedMenu) {
          const parsed = JSON.parse(savedMenu);
          if (Array.isArray(parsed)) setMenuItems(parsed);
        }
        setCommercialInventory(getCommercialDuiInventory());
      } catch (e) {
        console.error('Error syncing admin data from storage:', e);
      }
    };

    // Run immediately once on component mount
    syncFromStorage();

    window.addEventListener('storage', syncFromStorage);
    window.addEventListener('nn_data_sync', syncFromStorage);
    window.addEventListener('nn_admin_alert', syncFromStorage);

    return () => {
      window.removeEventListener('storage', syncFromStorage);
      window.removeEventListener('nn_data_sync', syncFromStorage);
      window.removeEventListener('nn_admin_alert', syncFromStorage);
    };
  }, []);

  // Compute live counts and alerts using current robust state
  const newOrdersCount = currentOrders.filter(
    o => o.status === 'waiting_weighing' || o.status === 'pending' || o.status === 'confirmed'
  ).length;
  const waitingWeighingCount = currentOrders.filter(o => o.status === 'waiting_weighing').length;

  const newBookingsCount = currentBookings.filter(b => b.status === 'new').length;
  const preOrderBookingsCount = currentBookings.filter(
    b => b.preOrderItems && b.preOrderItems.length > 0
  ).length;

  const newWeddingsCount = currentWeddingInquiries.filter(w => w.status === 'new' || w.status === 'pending').length;
  const outOfStockDishesCount = menuItems.filter(m => {
    const { isAvailable } = resolveMenuItemAvailability(m, commercialInventory);
    return !isAvailable;
  }).length;

  // Handle Dúi Weigh & Quote Submission
  const handleSaveWeighingQuote = () => {
    if (!weighingOrder) return;
    const dishCount = weighingOrder.duiDishesCount || (weighingOrder.duiDishesList?.length || 1);
    const weight = Number(weighKg) || 1.8;
    const unitPrice = Number(pricePerKg) || 650000;
    const cookingFeeTotal = dishCount * 250000;
    const rawMeatCost = weight * unitPrice;
    const calculatedDuiTotal = rawMeatCost + cookingFeeTotal;

    const nonDuiItemsCost = weighingOrder.items
      ? weighingOrder.items
          .filter(it => !it.notes?.includes('Món chế biến từ Dúi'))
          .reduce((sum, it) => sum + (it.price * it.quantity), 0)
      : 0;

    const newGrandTotal = calculatedDuiTotal + nonDuiItemsCost;

    const additionalData: Partial<RestaurantOrder> = {
      status: 'quoted',
      duiWeightKg: weight,
      duiPricePerKg: unitPrice,
      duiRawMeatCost: rawMeatCost,
      duiCookingFeePerDish: 250000,
      total: newGrandTotal,
      notes: weighNotes ? `${weighingOrder.notes || ''} [Báo giá: ${weighNotes}]`.trim() : weighingOrder.notes,
    };

    onUpdateOrderStatus(weighingOrder.id, 'quoted', additionalData);
    setWeighingOrder(null);
  };

  // Order Rejection States & Handlers
  const [rejectingOrder, setRejectingOrder] = useState<RestaurantOrder | null>(null);
  const [orderRejectReason, setOrderRejectReason] = useState<string>(ORDER_REJECTION_REASONS[0]);
  const [customOrderRejectReason, setCustomOrderRejectReason] = useState<string>('');
  const [orderRejectNote, setOrderRejectNote] = useState<string>('');

  const handleConfirmRejectOrder = () => {
    if (!rejectingOrder) return;
    const finalReason = orderRejectReason === 'Lý do khác (tự nhập cụ thể)' && customOrderRejectReason.trim()
      ? customOrderRejectReason.trim()
      : orderRejectReason;

    const nowStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString('vi-VN');
    const finalNote = orderRejectNote.trim() || `Quán chưa thể tiếp nhận đơn vì: ${finalReason}. Quý khách vui lòng chọn lại món khác hoặc liên hệ hotline để được phục vụ tốt nhất!`;

    const updates: Partial<RestaurantOrder> = {
      rejectionReason: finalReason,
      rejectionCustomNote: orderRejectNote.trim() || undefined,
      adminNote: finalNote,
      rejectedAt: nowStr,
      customerAction: undefined
    };

    onUpdateOrderStatus(rejectingOrder.id, 'cancelled', updates);
    setOrders(prev => prev.map(o => o.id === rejectingOrder.id ? { ...o, status: 'cancelled', ...updates } : o));

    setRejectingOrder(null);
    setCustomOrderRejectReason('');
    setOrderRejectNote('');
  };

  const handleReopenOrder = (order: RestaurantOrder) => {
    const nowStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString('vi-VN');
    const updates: Partial<RestaurantOrder> = {
      rejectionReason: undefined,
      rejectionCustomNote: undefined,
      adminNote: `Quán đã tiếp nhận lại đơn hàng #${order.code} và sẵn sàng phục vụ!`,
      rejectedAt: undefined,
      customerAction: undefined
    };
    onUpdateOrderStatus(order.id, 'pending', updates);
    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'pending', ...updates } : o));
  };

  return (
    <div className="pt-2 space-y-3 w-full animate-fadeIn">
      {/* Admin Status Live Indicator Banner */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-amber-400 text-xs font-bold shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>BẢNG ĐIỀU HÀNH QUẢN TRỊ VIÊN</span>
            <span className="flex h-2 w-2 relative ml-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] text-emerald-400 font-medium">Đồng bộ trực tiếp</span>
          </div>

          {onOpenSystemQR && (
            <button
              type="button"
              onClick={onOpenSystemQR}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold transition-all shadow-2xs cursor-pointer hover:scale-105"
              title="Xem & in mã QR Tổng của toàn bộ Hệ thống Dịch vụ Ngọc Nhi"
            >
              <QrCode className="w-3.5 h-3.5 text-amber-700" />
              <span>01 QR Tổng Hệ Thống</span>
            </button>
          )}
        </div>

        <div className="text-[11px] text-slate-600 font-medium flex items-center gap-1.5">
          <RotateCw className="w-3 h-3 text-slate-400" />
          <span>Tự động cập nhật tức thì khi khách đặt</span>
        </div>
      </div>

      {/* 4 Dedicated Management Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* 1. Quản lý đơn đặt hàng online */}
        <div
          onClick={() => {
            setActiveModalTab('orders');
            setSearchQuery('');
            setStatusFilter('all');
          }}
          className="p-4 rounded-2xl bg-white hover:bg-amber-50/40 border-2 border-amber-300/90 hover:border-amber-500 shadow-md hover:shadow-lg transition-all cursor-pointer group text-left relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-5 h-5 text-amber-700" />
            </div>
            {newOrdersCount > 0 ? (
              <span className="px-2.5 py-1 rounded-full bg-red-600 text-white text-[11px] font-black animate-pulse flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                {newOrdersCount} đơn mới
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold">
                {currentOrders.length} đơn
              </span>
            )}
          </div>
          <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-amber-900 transition-colors flex items-center justify-between">
            <span>Quản lý đơn đặt hàng online</span>
            <ArrowRight className="w-4 h-4 text-amber-600 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" />
          </h4>
          <p className="text-[11px] text-slate-600 mt-1 font-medium line-clamp-1">
            {waitingWeighingCount > 0 
              ? `⚠️ Có ${waitingWeighingCount} đơn chờ cân Dúi & gửi giá` 
              : `${currentOrders.length} đơn hàng trực tuyến • Giao tận nơi`}
          </p>
          <div className="mt-2.5 pt-2 border-t border-amber-100 flex items-center justify-between text-[10px] text-amber-800 font-bold">
            <span>Mở bảng quản lý & xử lý</span>
            <span className="underline">Chi tiết →</span>
          </div>
        </div>

        {/* 2. Quản lý đặt bàn ăn */}
        <div
          onClick={() => {
            setActiveModalTab('bookings');
            setSearchQuery('');
            setStatusFilter('all');
          }}
          className="p-4 rounded-2xl bg-white hover:bg-blue-50/40 border-2 border-blue-300/90 hover:border-blue-500 shadow-md hover:shadow-lg transition-all cursor-pointer group text-left relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <UtensilsCrossed className="w-5 h-5 text-blue-700" />
            </div>
            {newBookingsCount > 0 ? (
              <span className="px-2.5 py-1 rounded-full bg-red-600 text-white text-[11px] font-black animate-pulse flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                {newBookingsCount} bàn mới
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold">
                {currentBookings.length} lượt
              </span>
            )}
          </div>
          <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-blue-900 transition-colors flex items-center justify-between">
            <span>Quản lý đặt bàn ăn</span>
            <ArrowRight className="w-4 h-4 text-blue-600 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" />
          </h4>
          <p className="text-[11px] text-slate-600 mt-1 font-medium line-clamp-1">
            {preOrderBookingsCount > 0 
              ? `🍲 Có ${preOrderBookingsCount} bàn chọn món trước` 
              : `${currentBookings.length} lượt đặt bàn • Sơ đồ & Giờ đến`}
          </p>
          <div className="mt-2.5 pt-2 border-t border-blue-100 flex items-center justify-between text-[10px] text-blue-800 font-bold">
            <span>Mở danh sách bàn & món trước</span>
            <span className="underline">Chi tiết →</span>
          </div>
        </div>

        {/* 3. Quản lý đặt tiệc cưới */}
        <div
          onClick={() => {
            setActiveModalTab('weddings');
            setSearchQuery('');
            setStatusFilter('all');
          }}
          className="p-4 rounded-2xl bg-white hover:bg-rose-50/40 border-2 border-rose-300/90 hover:border-rose-500 shadow-md hover:shadow-lg transition-all cursor-pointer group text-left relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-2.5">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5 text-rose-700" />
            </div>
            {newWeddingsCount > 0 ? (
              <span className="px-2.5 py-1 rounded-full bg-red-600 text-white text-[11px] font-black animate-pulse flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                {newWeddingsCount} tiệc mới
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold">
                {currentWeddingInquiries.length} hợp đồng
              </span>
            )}
          </div>
          <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-rose-900 transition-colors flex items-center justify-between">
            <span>Quản lý đặt tiệc cưới</span>
            <ArrowRight className="w-4 h-4 text-rose-600 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" />
          </h4>
          <p className="text-[11px] text-slate-600 mt-1 font-medium line-clamp-1">
            {newWeddingsCount > 0 
              ? `💌 Có ${newWeddingsCount} yêu cầu tư vấn tiệc mới` 
              : `${currentWeddingInquiries.length} hợp đồng tiệc cưới & hội nghị`}
          </p>
          <div className="mt-2.5 pt-2 border-t border-rose-100 flex items-center justify-between text-[10px] text-rose-800 font-bold">
            <span>Mở danh sách tiệc cưới & sảnh</span>
            <span className="underline">Chi tiết →</span>
          </div>
        </div>

        {/* 4. Duyệt Chốt Đơn & Quyết Định AI (Anh Phan Dũng) */}
        <div
          onClick={() => {
            setActiveModalTab('ai_decisions');
            setSearchQuery('');
            setStatusFilter('all');
          }}
          className="p-4 rounded-2xl bg-white hover:bg-purple-50/40 border-2 border-purple-300/90 hover:border-purple-500 shadow-md hover:shadow-lg transition-all cursor-pointer group text-left relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-5 h-5 text-purple-700" />
            </div>
            {pendingDecisionsCount > 0 ? (
              <span className="px-2.5 py-1 rounded-full bg-purple-600 text-white text-[11px] font-black animate-pulse flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                {pendingDecisionsCount} cần duyệt
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold">
                {aiDecisions.length} hồ sơ
              </span>
            )}
          </div>
          <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-purple-900 transition-colors flex items-center justify-between">
            <span>Duyệt chốt đơn AI</span>
            <ArrowRight className="w-4 h-4 text-purple-600 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" />
          </h4>
          <p className="text-[11px] text-slate-600 mt-1 font-medium line-clamp-1">
            {pendingDecisionsCount > 0 
              ? `⚡ ${pendingDecisionsCount} yêu cầu chốt đơn / nghiệp vụ chờ Anh Dũng` 
              : `${aiDecisions.length} yêu cầu tư vấn AI đã tiếp nhận`}
          </p>
          <div className="mt-2.5 pt-2 border-t border-purple-100 flex items-center justify-between text-[10px] text-purple-800 font-bold">
            <span>Quản trị viên Phan Dũng</span>
            <span className="underline">Xem & Duyệt →</span>
          </div>
        </div>
      </div>

      {/* Synchronized Menu Availability Alert Banner */}
      <div className="mt-3 p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md border border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center shrink-0">
            <ChefHat className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h5 className="text-xs sm:text-sm font-bold text-white">Đồng bộ Thực đơn & Trạng thái Hết món</h5>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-bold">
                Tự động đồng bộ khách
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              {outOfStockDishesCount > 0 ? (
                <span className="text-amber-300 font-semibold">
                  ⚠️ Có {outOfStockDishesCount} món đang báo TẠM HẾT. Khách đặt bàn & giỏ hàng online sẽ tự động khóa món này.
                </span>
              ) : (
                <span>Tất cả {menuItems.length} món trong thực đơn đang mở bán. Bấm để báo tạm hết món nhanh khi quán hết nguyên liệu.</span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <button
            onClick={() => {
              setActiveModalTab('menu');
              setStatusFilter('all');
              setSearchQuery('');
            }}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <ChefHat className="w-3.5 h-3.5" />
            <span>Quản lý Báo Hết Món</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SYNCHRONIZED ADMIN MANAGEMENT MODAL */}
      {/* ========================================================= */}
      {activeModalTab && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col border border-slate-200 animate-scaleUp overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <span>Trung Tâm Điều Hành Quản Trị</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                      Realtime Sync
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Dữ liệu được đồng bộ trực tiếp khi khách hàng đặt hàng, đặt bàn và đặt tiệc
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (activeModalTab === 'orders' || activeModalTab === 'bookings') {
                      onNavigate('restaurant');
                    } else {
                      onNavigate('wedding');
                    }
                    setActiveModalTab(null);
                  }}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Mở giao diện module</span>
                </button>
                <button
                  onClick={() => setActiveModalTab(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 3 Main Management Tabs */}
            <div className="flex border-b border-slate-200 bg-white px-4 sm:px-6 overflow-x-auto gap-2 sm:gap-4">
              <button
                onClick={() => {
                  setActiveModalTab('orders');
                  setStatusFilter('all');
                  setSearchQuery('');
                }}
                className={`py-3.5 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
                  activeModalTab === 'orders'
                    ? 'border-amber-600 text-amber-900'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>1. Quản lý đơn hàng online</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  newOrdersCount > 0 ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-100 text-slate-700'
                }`}>
                  {currentOrders.length}
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveModalTab('bookings');
                  setStatusFilter('all');
                  setSearchQuery('');
                }}
                className={`py-3.5 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
                  activeModalTab === 'bookings'
                    ? 'border-blue-600 text-blue-900'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <UtensilsCrossed className="w-4 h-4" />
                <span>2. Quản lý đặt bàn ăn</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  newBookingsCount > 0 ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-100 text-slate-700'
                }`}>
                  {currentBookings.length}
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveModalTab('weddings');
                  setStatusFilter('all');
                  setSearchQuery('');
                }}
                className={`py-3.5 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
                  activeModalTab === 'weddings'
                    ? 'border-rose-600 text-rose-900'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>3. Quản lý đặt tiệc cưới</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  newWeddingsCount > 0 ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-100 text-slate-700'
                }`}>
                  {currentWeddingInquiries.length}
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveModalTab('menu');
                  setStatusFilter('all');
                  setSearchQuery('');
                }}
                className={`py-3.5 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
                  activeModalTab === 'menu'
                    ? 'border-emerald-600 text-emerald-900'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <ChefHat className="w-4 h-4" />
                <span>4. Đồng bộ Thực đơn & Báo hết</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  outOfStockDishesCount > 0 ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-100 text-slate-700'
                }`}>
                  {outOfStockDishesCount > 0 ? `${outOfStockDishesCount} tạm hết` : `${menuItems.length} món`}
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveModalTab('ai_decisions');
                  setStatusFilter('all');
                  setSearchQuery('');
                }}
                className={`py-3.5 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
                  activeModalTab === 'ai_decisions'
                    ? 'border-purple-600 text-purple-900 bg-purple-50/50'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                <span>5. Duyệt chốt đơn & Nghiệp vụ AI</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  pendingDecisionsCount > 0 ? 'bg-purple-600 text-white animate-pulse' : 'bg-slate-100 text-slate-700'
                }`}>
                  {pendingDecisionsCount > 0 ? `${pendingDecisionsCount} chờ duyệt` : `${aiDecisions.length}`}
                </span>
              </button>
            </div>

            {/* Filter and Search Bar */}
            <div className="p-3 sm:p-4 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder={
                    activeModalTab === 'orders' 
                      ? 'Tìm theo tên khách, SĐT, mã đơn #ORD-...'
                      : activeModalTab === 'bookings'
                      ? 'Tìm theo tên khách, SĐT, mã bàn #NN-TB-...'
                      : activeModalTab === 'weddings'
                      ? 'Tìm theo tên khách, SĐT, mã tiệc #WD-...'
                      : activeModalTab === 'ai_decisions'
                      ? 'Tìm theo tên khách, SĐT, mã yêu cầu #DEC-...'
                      : 'Tìm theo tên món ăn...'
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white rounded-xl border border-slate-200 text-slate-800 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Status Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                    statusFilter === 'all'
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Tất cả
                </button>

                {activeModalTab === 'orders' && (
                  <>
                    <button
                      onClick={() => setStatusFilter('waiting_weighing')}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                        statusFilter === 'waiting_weighing'
                          ? 'bg-amber-600 text-white'
                          : 'bg-white text-amber-800 border border-amber-200 hover:bg-amber-50'
                      }`}
                    >
                      Chờ cân Dúi ({waitingWeighingCount})
                    </button>
                    <button
                      onClick={() => setStatusFilter('quoted')}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                        statusFilter === 'quoted'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-blue-800 border border-blue-200 hover:bg-blue-50'
                      }`}
                    >
                      Đã báo giá
                    </button>
                    <button
                      onClick={() => setStatusFilter('confirmed')}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                        statusFilter === 'confirmed'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Đã xác nhận
                    </button>
                    <button
                      onClick={() => setStatusFilter('completed')}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                        statusFilter === 'completed'
                          ? 'bg-purple-600 text-white'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Hoàn tất
                    </button>
                  </>
                )}

                {activeModalTab === 'bookings' && (
                  <>
                    <button
                      onClick={() => setStatusFilter('new')}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                        statusFilter === 'new'
                          ? 'bg-red-600 text-white'
                          : 'bg-white text-red-700 border border-red-200 hover:bg-red-50'
                      }`}
                    >
                      Mới nhận ({newBookingsCount})
                    </button>
                    <button
                      onClick={() => setStatusFilter('confirmed')}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                        statusFilter === 'confirmed'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white text-emerald-800 border border-emerald-200 hover:bg-emerald-50'
                      }`}
                    >
                      Đã xác nhận
                    </button>
                    <button
                      onClick={() => setStatusFilter('serving')}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                        statusFilter === 'serving'
                          ? 'bg-amber-600 text-white'
                          : 'bg-white text-amber-800 border border-amber-200 hover:bg-amber-50'
                      }`}
                    >
                      Đang phục vụ
                    </button>
                    <button
                      onClick={() => setStatusFilter('has_preorder')}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                        statusFilter === 'has_preorder'
                          ? 'bg-orange-600 text-white'
                          : 'bg-white text-orange-800 border border-orange-200 hover:bg-orange-50'
                      }`}
                    >
                      Có món đặt trước ({preOrderBookingsCount})
                    </button>
                  </>
                )}

                {activeModalTab === 'weddings' && (
                  <>
                    <button
                      onClick={() => setStatusFilter('new')}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                        statusFilter === 'new'
                          ? 'bg-red-600 text-white'
                          : 'bg-white text-red-700 border border-red-200 hover:bg-red-50'
                      }`}
                    >
                      Yêu cầu mới ({newWeddingsCount})
                    </button>
                    <button
                      onClick={() => setStatusFilter('confirmed')}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                        statusFilter === 'confirmed'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white text-emerald-800 border border-emerald-200 hover:bg-emerald-50'
                      }`}
                    >
                      Đã đặt cọc
                    </button>
                    <button
                      onClick={() => setStatusFilter('completed')}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                        statusFilter === 'completed'
                          ? 'bg-purple-600 text-white'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Đã hoàn tất
                    </button>
                  </>
                )}

                {activeModalTab === 'ai_decisions' && (
                  <>
                    <button
                      onClick={() => setStatusFilter('pending')}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                        statusFilter === 'pending'
                          ? 'bg-purple-600 text-white'
                          : 'bg-white text-purple-800 border border-purple-200 hover:bg-purple-50'
                      }`}
                    >
                      Chờ Anh Dũng duyệt ({pendingDecisionsCount})
                    </button>
                    <button
                      onClick={() => setStatusFilter('approved')}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                        statusFilter === 'approved'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white text-emerald-800 border border-emerald-200 hover:bg-emerald-50'
                      }`}
                    >
                      Đã duyệt chốt đơn
                    </button>
                    <button
                      onClick={() => setStatusFilter('contacted')}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                        statusFilter === 'contacted'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-blue-800 border border-blue-200 hover:bg-blue-50'
                      }`}
                    >
                      Đã liên hệ khách
                    </button>
                    <button
                      onClick={() => setStatusFilter('rejected')}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                        statusFilter === 'rejected'
                          ? 'bg-slate-700 text-white'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Từ chối
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Modal Body: Active Tab Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {/* ==================================================== */}
              {/* TAB 1: QUẢN LÝ ĐƠN ĐẶT HÀNG ONLINE */}
              {/* ==================================================== */}
              {activeModalTab === 'orders' && (
                <div className="space-y-3">
                  {(() => {
                    const filtered = orders.filter(o => {
                      const matchQuery = 
                        o.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        o.phone.includes(searchQuery);
                      const matchStatus = statusFilter === 'all' || o.status === statusFilter;
                      return matchQuery && matchStatus;
                    });

                    if (filtered.length === 0) {
                      return (
                        <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                          <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                          <p className="text-sm font-bold text-slate-700">Chưa có đơn hàng online nào phù hợp.</p>
                          <p className="text-xs text-slate-400 mt-1">Khi khách đặt món online từ thực đơn, đơn hàng sẽ đồng bộ ngay tại đây.</p>
                        </div>
                      );
                    }

                    return filtered.map(order => {
                      const isWaitingWeighing = order.status === 'waiting_weighing';
                      const isQuoted = order.status === 'quoted';

                      return (
                        <div
                          key={order.id}
                          className={`p-4 rounded-2xl border transition-all ${
                            isWaitingWeighing
                              ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-400/20'
                              : isQuoted
                              ? 'bg-blue-50/50 border-blue-200'
                              : 'bg-white border-slate-200 hover:border-amber-200'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md text-xs border border-slate-200">
                                  #{order.code}
                                </span>
                                <span className="font-bold text-slate-900 text-sm">{order.customerName}</span>
                                <a href={`tel:${order.phone}`} className="text-orange-600 hover:underline font-semibold text-xs flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {order.phone}
                                </a>
                                {order.orderType === 'delivery' ? (
                                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                                    Giao tận nơi
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                                    {order.orderType === 'dine_in' ? 'Dùng tại quán' : 'Mang về'}
                                  </span>
                                )}

                                {isWaitingWeighing && (
                                  <span className="px-2 py-0.5 rounded-full bg-amber-600 text-white text-[10px] font-black uppercase tracking-wider animate-pulse flex items-center gap-1">
                                    <Scale className="w-3 h-3" />
                                    CHỜ CÂN DÚI
                                  </span>
                                )}
                                {isQuoted && (
                                  <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider">
                                    ĐÃ BÁO GIÁ
                                  </span>
                                )}
                              </div>

                              <p className="text-xs text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
                                <span>⏰ {order.createdAt}</span>
                                {order.deliveryAddress && (
                                  <span className="flex items-center gap-1 text-slate-600">
                                    <MapPin className="w-3 h-3 text-red-500" />
                                    {order.deliveryAddress}
                                  </span>
                                )}
                              </p>
                            </div>

                            {/* Status Selector & Rejection Action */}
                            <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                              <select
                                value={order.status}
                                onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as RestaurantOrderStatus)}
                                className="text-xs py-1.5 px-2.5 rounded-xl border border-slate-300 font-bold bg-white text-slate-800 focus:ring-2 focus:ring-amber-500 cursor-pointer shadow-2xs"
                              >
                                <option value="waiting_weighing">⏳ Chờ Cân Dúi</option>
                                <option value="quoted">💬 Đã Báo Giá</option>
                                <option value="pending">Mới nhận</option>
                                <option value="confirmed">Đã xác nhận</option>
                                <option value="cooking">Đang nấu</option>
                                <option value="serving">Đang giao / Phục vụ</option>
                                <option value="completed">Đã hoàn tất</option>
                                <option value="cancelled">Đã hủy / Từ chối</option>
                              </select>

                              {order.status !== 'cancelled' ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setRejectingOrder(order);
                                    setOrderRejectReason(ORDER_REJECTION_REASONS[0]);
                                    setCustomOrderRejectReason('');
                                    setOrderRejectNote(`Rất tiếc quán chưa thể tiếp nhận đơn hàng #${order.code} lúc này. Kính mời quý khách chọn lại món khác hoặc liên hệ hotline để được phục vụ tốt nhất!`);
                                  }}
                                  className="text-xs py-1.5 px-2.5 rounded-xl border border-rose-300 font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                                  title="Không tiếp nhận đơn và thông báo lý do cho khách"
                                >
                                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                  <span>Không tiếp nhận</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleReopenOrder(order)}
                                  className="text-xs py-1.5 px-2.5 rounded-xl border border-amber-300 font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                                >
                                  <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
                                  <span>Mở lại đơn</span>
                                </button>
                              )}
                            </div>
                          </div>

                          {/* REJECTION REASON BANNER IF CANCELLED */}
                          {(order.status === 'cancelled' || order.rejectionReason) && (
                            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs space-y-1.5 text-rose-950">
                              <div className="flex items-center justify-between font-bold text-rose-900">
                                <span className="flex items-center gap-1.5">
                                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                                  <span>Đơn đã xử lý: Không tiếp nhận</span>
                                </span>
                                {order.rejectedAt && (
                                  <span className="text-[10px] text-rose-600 font-mono">Từ chối lúc: {order.rejectedAt}</span>
                                )}
                              </div>
                              {order.rejectionReason && (
                                <p className="text-rose-900">
                                  <strong>Lý do từ chối:</strong> {order.rejectionReason}
                                </p>
                              )}
                              {order.adminNote && (
                                <p className="text-rose-800 italic bg-white/80 p-2 rounded-lg border border-rose-200">
                                  "{order.adminNote}"
                                </p>
                              )}
                              <p className="text-[10px] text-rose-600">
                                Khách hàng khi tra cứu sẽ thấy lý do này kèm các tùy chọn để tiếp tục chọn món đặt lại.
                              </p>
                            </div>
                          )}

                          {/* Items List */}
                          <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                            <div className="font-bold text-slate-800 flex justify-between text-[11px]">
                              <span>Danh sách món ({order.items.reduce((s, i) => s + i.quantity, 0)} phần):</span>
                              <span className="font-mono text-amber-900 font-black text-sm">
                                {order.total.toLocaleString('vi-VN')}đ
                              </span>
                            </div>
                            <div className="bg-slate-50 p-2.5 rounded-xl space-y-1 max-h-28 overflow-y-auto">
                              {order.items.map((it, idx) => {
                                const matchingDish = menuItems.find(m => m.id === it.menuItemId || m.name === it.name);
                                const availability = matchingDish ? resolveMenuItemAvailability(matchingDish, commercialInventory) : { isAvailable: true };
                                const isOutOfStock = !availability.isAvailable;

                                return (
                                  <div key={idx} className="flex justify-between items-center text-slate-700">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span>{it.quantity}x {it.name}</span>
                                      {isOutOfStock && (
                                        <span className="text-[9px] bg-rose-100 text-rose-700 font-bold px-1.5 py-0.2 rounded border border-rose-200">
                                          🔴 Quán báo tạm hết
                                        </span>
                                      )}
                                    </div>
                                    <span className="font-mono">{(it.price * it.quantity).toLocaleString('vi-VN')}đ</span>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Dúi Weighing Section if applicable */}
                            {(isWaitingWeighing || isQuoted || order.hasDuiItems) && (
                              <div className="p-3 rounded-xl bg-amber-100/60 border border-amber-300 space-y-2 text-xs">
                                <div className="flex items-center justify-between font-bold text-amber-950">
                                  <span className="flex items-center gap-1.5">
                                    <Scale className="w-4 h-4 text-amber-700" />
                                    <span>Xử lý cân Dúi &amp; Báo giá cho khách</span>
                                  </span>
                                  {order.duiWeightKg && (
                                    <span className="text-[11px] font-mono text-amber-800">
                                      Đã lưu: {order.duiWeightKg}kg • {(order.duiPricePerKg || 650000).toLocaleString('vi-VN')}đ/kg
                                    </span>
                                  )}
                                </div>

                                {weighingOrder?.id === order.id ? (
                                  <div className="space-y-2 pt-1 border-t border-amber-200">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                      <div>
                                        <label className="text-[10px] text-amber-900 font-bold block mb-0.5">Trọng lượng (kg):</label>
                                        <input
                                          type="number"
                                          step="0.1"
                                          value={weighKg}
                                          onChange={(e) => setWeighKg(parseFloat(e.target.value) || 0)}
                                          className="w-full px-2 py-1 text-xs rounded border border-amber-300 bg-white font-mono"
                                        />
                                      </div>
                                      <div>
                                        <label className="text-[10px] text-amber-900 font-bold block mb-0.5">Giá / kg:</label>
                                        <input
                                          type="number"
                                          step="10000"
                                          value={pricePerKg}
                                          onChange={(e) => setPricePerKg(parseInt(e.target.value) || 650000)}
                                          className="w-full px-2 py-1 text-xs rounded border border-amber-300 bg-white font-mono"
                                        />
                                      </div>
                                      <div className="col-span-2 sm:col-span-1">
                                        <label className="text-[10px] text-amber-900 font-bold block mb-0.5">Ghi chú gửi khách:</label>
                                        <input
                                          type="text"
                                          placeholder="VD: Dúi 1.8kg bao béo khỏe..."
                                          value={weighNotes}
                                          onChange={(e) => setWeighNotes(e.target.value)}
                                          className="w-full px-2 py-1 text-xs rounded border border-amber-300 bg-white"
                                        />
                                      </div>
                                    </div>

                                    <div className="flex items-center justify-end gap-2 pt-1">
                                      <button
                                        type="button"
                                        onClick={() => setWeighingOrder(null)}
                                        className="px-2.5 py-1 text-xs rounded bg-slate-200 text-slate-700 font-medium hover:bg-slate-300"
                                      >
                                        Hủy
                                      </button>
                                      <button
                                        type="button"
                                        onClick={handleSaveWeighingQuote}
                                        className="px-3 py-1 text-xs rounded bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-xs"
                                      >
                                        Lưu &amp; Gửi Báo Giá Cho Khách
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setWeighingOrder(order);
                                      setWeighKg(order.duiWeightKg || 1.8);
                                      setPricePerKg(order.duiPricePerKg || 650000);
                                      setWeighNotes('');
                                    }}
                                    className="w-full py-1.5 px-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                                  >
                                    <Scale className="w-3.5 h-3.5" />
                                    <span>{order.duiWeightKg ? 'Sửa cân nặng & Cập nhật giá Dúi' : 'Nhập kết quả cân Dúi & Gửi báo giá'}</span>
                                  </button>
                                )}
                              </div>
                            )}

                            {order.notes && (
                              <div className="text-[11px] text-slate-500 italic">
                                <strong>Ghi chú của khách:</strong> {order.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              )}

              {/* ==================================================== */}
              {/* TAB 2: QUẢN LÝ ĐẶT BÀN ĂN */}
              {/* ==================================================== */}
              {activeModalTab === 'bookings' && (
                <div className="space-y-3">
                  {(() => {
                    const filtered = currentBookings.filter(b => {
                      const matchQuery = 
                        b.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        b.phone.includes(searchQuery);
                      
                      if (!matchQuery) return false;

                      if (statusFilter === 'all') return true;
                      if (statusFilter === 'has_preorder') return b.preOrderItems && b.preOrderItems.length > 0;
                      return b.status === statusFilter;
                    });

                    if (filtered.length === 0) {
                      return (
                        <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                          <UtensilsCrossed className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                          <p className="text-sm font-bold text-slate-700">Chưa có lượt đặt bàn nào phù hợp.</p>
                          <p className="text-xs text-slate-400 mt-1">Khi khách đặt bàn hoặc chọn món trước, dữ liệu sẽ đồng bộ tại đây.</p>
                        </div>
                      );
                    }

                    return filtered.map(booking => {
                      return (
                        <div
                          key={booking.id}
                          className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 transition-all space-y-2.5 shadow-2xs"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono font-bold text-blue-950 bg-blue-50 px-2 py-0.5 rounded-md text-xs border border-blue-200">
                                  #{booking.code}
                                </span>
                                <span className="font-bold text-slate-900 text-sm">{booking.customerName}</span>
                                <a href={`tel:${booking.phone}`} className="text-blue-600 hover:underline font-semibold text-xs flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {booking.phone}
                                </a>
                                {booking.preOrderItems && booking.preOrderItems.length > 0 && (
                                  <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-900 text-[10px] font-bold border border-orange-200">
                                    Đã chọn trước {booking.preOrderItems.length} món
                                  </span>
                                )}
                              </div>

                              <p className="text-xs text-slate-600 mt-1.5 flex items-center gap-3 flex-wrap">
                                <span>⏰ <strong>{booking.bookingTime}</strong> ngày <strong>{booking.bookingDate}</strong></span>
                                <span>👥 <strong>{booking.guestCount}</strong> khách</span>
                                <span>📍 <strong>{booking.tableArea || 'Khu sân vườn'}</strong></span>
                                {booking.tableNumber && (
                                  <span className="font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 text-[11px] flex items-center gap-1">
                                    🪑 {booking.tableNumber}
                                  </span>
                                )}
                                {booking.dishesConfirmed && (
                                  <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-[10px] flex items-center gap-1">
                                    ✓ Đã duyệt 2 món
                                  </span>
                                )}
                              </p>
                            </div>

                            {/* Status Selector */}
                            <div className="flex items-center gap-2 shrink-0">
                              <select
                                value={booking.status}
                                onChange={(e) => onUpdateBookingStatus(booking.id, e.target.value as TableBookingStatus)}
                                className="text-xs py-1.5 px-3 rounded-xl border border-slate-300 font-bold bg-slate-50 text-slate-800 focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-2xs"
                              >
                                <option value="new">Mới nhận</option>
                                <option value="confirmed">Đã xác nhận</option>
                                <option value="serving">Đang phục vụ</option>
                                <option value="completed">Đã hoàn tất</option>
                                <option value="cancelled">Đã hủy</option>
                              </select>
                            </div>
                          </div>

                          {/* Pre-ordered Dishes Box */}
                          {booking.preOrderItems && booking.preOrderItems.length > 0 && (
                            <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1.5 text-xs">
                              <div className="flex items-center justify-between font-bold text-amber-950 text-[11px]">
                                <span className="flex items-center gap-1.5">
                                  <ChefHat className="w-3.5 h-3.5 text-amber-700" />
                                  <span>Món ăn khách chọn lên trước ({booking.preOrderItems.length} món):</span>
                                </span>
                                <span className="font-mono text-amber-900 font-black">
                                  {(booking.preOrderTotal || 0).toLocaleString('vi-VN')}đ
                                </span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                                {booking.preOrderItems.map((dish, idx) => {
                                  const matchingDish = menuItems.find(m => m.id === dish.menuItemId || m.name === dish.name);
                                  const availability = matchingDish ? resolveMenuItemAvailability(matchingDish, commercialInventory) : { isAvailable: true };
                                  const isOutOfStock = !availability.isAvailable && !booking.dishesConfirmed;

                                  return (
                                    <div key={idx} className={`flex justify-between items-center px-2 py-1 rounded border ${
                                      booking.dishesConfirmed
                                        ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                                        : isOutOfStock 
                                        ? 'bg-rose-50 border-rose-200 text-rose-900' 
                                        : 'bg-white border-amber-200/80 text-slate-800'
                                    }`}>
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span>{dish.quantity}x {dish.name}</span>
                                        {booking.dishesConfirmed ? (
                                          <span className="text-[9px] bg-emerald-600 text-white font-bold px-1.5 py-0.2 rounded">
                                            ✓ Bếp nhận nấu
                                          </span>
                                        ) : isOutOfStock ? (
                                          <span className="text-[9px] bg-rose-600 text-white font-bold px-1.5 py-0.2 rounded">
                                            Tạm hết
                                          </span>
                                        ) : null}
                                      </div>
                                      <span className="font-mono text-slate-500">{(dish.price * dish.quantity).toLocaleString('vi-VN')}đ</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {booking.notes && (
                            <div className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                              <strong>Ghi chú của khách:</strong> {booking.notes}
                            </div>
                          )}

                          {/* ACTION SYNC PANEL: THAO TÁC TIẾP THEO & ĐỒNG BỘ KHÁCH HÀNG */}
                          <BookingActionSyncPanel
                            booking={booking}
                            menuItems={menuItems}
                            onUpdateBooking={(bId, status, updates) => {
                              onUpdateBookingStatus(bId, status, updates);
                              setBookings(prev => prev.map(b => b.id === bId ? { ...b, status, ...(updates || {}), updatedAt: new Date().toISOString() } : b));
                            }}
                          />
                        </div>
                      );
                    });
                  })()}
                </div>
              )}

              {/* ==================================================== */}
              {/* TAB 3: QUẢN LÝ ĐẶT TIỆC CƯỚI */}
              {/* ==================================================== */}
              {activeModalTab === 'weddings' && (
                <div className="space-y-3">
                  {(() => {
                    const filtered = currentWeddingInquiries.filter(w => {
                      const matchQuery = 
                        w.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        w.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        w.phone.includes(searchQuery);
                      const matchStatus = statusFilter === 'all' || w.status === statusFilter;
                      return matchQuery && matchStatus;
                    });

                    if (filtered.length === 0) {
                      return (
                        <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                          <Sparkles className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                          <p className="text-sm font-bold text-slate-700">Chưa có hợp đồng tiệc cưới nào phù hợp.</p>
                          <p className="text-xs text-slate-400 mt-1">Khi khách gửi yêu cầu đặt tiệc cưới &amp; hội nghị, dữ liệu sẽ tự động đồng bộ.</p>
                        </div>
                      );
                    }

                    return filtered.map(inquiry => {
                      return (
                        <div
                          key={inquiry.id}
                          className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-rose-300 transition-all space-y-2.5 shadow-2xs"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono font-bold text-rose-950 bg-rose-50 px-2 py-0.5 rounded-md text-xs border border-rose-200">
                                  #{inquiry.code}
                                </span>
                                <span className="font-bold text-slate-900 text-sm">{inquiry.customerName}</span>
                                <a href={`tel:${inquiry.phone}`} className="text-rose-600 hover:underline font-semibold text-xs flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {inquiry.phone}
                                </a>
                                <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold">
                                  {inquiry.eventType === 'wedding' ? 'Tiệc Cưới' : inquiry.eventType === 'engagement' ? 'Đám Hỏi' : 'Tiệc / Hội Nghị'}
                                </span>
                              </div>

                              <p className="text-xs text-slate-600 mt-1.5 flex items-center gap-3 flex-wrap">
                                <span>📅 Ngày tổ chức: <strong>{inquiry.eventDate}</strong> ({inquiry.eventTime === 'evening' ? 'Buổi Tối' : 'Buổi Trưa'})</span>
                                <span>👥 Quy mô: <strong>{inquiry.expectedTables} bàn</strong> (~{inquiry.expectedGuests || inquiry.expectedTables * 10} khách)</span>
                              </p>

                              <p className="text-xs text-slate-600 mt-1 flex items-center gap-2 flex-wrap">
                                <span>📍 Sảnh: <strong>{inquiry.venueLocation === 'hall_ngocnhi' ? 'Sảnh Hoàng Gia Ngọc Nhi' : inquiry.venueLocation === 'outdoor_garden' ? 'Vườn Sinh Thái' : 'Phục Vụ Tận Nhà'}</strong></span>
                                {inquiry.packageName && (
                                  <span>• Gói: <strong className="text-rose-700">{inquiry.packageName}</strong></span>
                                )}
                              </p>
                            </div>

                            {/* Status Selector */}
                            <div className="flex items-center gap-2 shrink-0">
                              <select
                                value={inquiry.status}
                                onChange={(e) => onUpdateWeddingStatus(inquiry.id, e.target.value as WeddingStatus)}
                                className="text-xs py-1.5 px-3 rounded-xl border border-slate-300 font-bold bg-slate-50 text-slate-800 focus:ring-2 focus:ring-rose-500 cursor-pointer shadow-2xs"
                              >
                                <option value="new">Yêu cầu mới</option>
                                <option value="consulting">Đang tư vấn</option>
                                <option value="confirmed">Đã chốt cọc</option>
                                <option value="preparing">Đang chuẩn bị</option>
                                <option value="completed">Đã hoàn tất</option>
                                <option value="cancelled">Đã hủy</option>
                              </select>
                            </div>
                          </div>

                          {inquiry.notes && (
                            <div className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                              <strong>Ghi chú dâu rể:</strong> {inquiry.notes}
                            </div>
                          )}
                        </div>
                      );
                    });
                  })()}
                </div>
              )}

              {/* ==================================================== */}
              {/* TAB 4: ĐỒNG BỘ THỰC ĐƠN & BÁO TẠM HẾT MÓN */}
              {/* ==================================================== */}
              {activeModalTab === 'menu' && (
                <div className="space-y-4">
                  {/* Summary Banner */}
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <ChefHat className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div>
                        <p className="font-bold">Đồng bộ tức thì với Khách đặt bàn & Giỏ hàng online</p>
                        <p className="text-[11px] text-emerald-700">
                          Khi bấm chuyển sang "🔴 Tạm hết", hệ thống sẽ tự động gỡ món khỏi form đặt trước của khách và ngăn không cho thêm vào giỏ.
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[11px] font-semibold text-slate-600">Dúi thương phẩm: </span>
                      <strong className="text-amber-800">{commercialInventory.commercialCount} con</strong>
                    </div>
                  </div>

                  {/* Filter by availability */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500 font-semibold">Lọc nhanh:</span>
                    <button
                      onClick={() => setStatusFilter('all')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                        statusFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Tất cả ({menuItems.length})
                    </button>
                    <button
                      onClick={() => setStatusFilter('available')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                        statusFilter === 'available' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                      }`}
                    >
                      🟢 Còn món ({menuItems.filter(m => resolveMenuItemAvailability(m, commercialInventory).isAvailable).length})
                    </button>
                    <button
                      onClick={() => setStatusFilter('unavailable')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                        statusFilter === 'unavailable' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
                      }`}
                    >
                      🔴 Tạm hết ({menuItems.filter(m => !resolveMenuItemAvailability(m, commercialInventory).isAvailable).length})
                    </button>
                  </div>

                  {/* Menu Dishes Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[55vh] overflow-y-auto pr-1">
                    {(() => {
                      const filtered = menuItems.filter(item => {
                        const { isAvailable } = resolveMenuItemAvailability(item, commercialInventory);
                        if (statusFilter === 'available' && !isAvailable) return false;
                        if (statusFilter === 'unavailable' && isAvailable) return false;

                        if (searchQuery.trim()) {
                          const q = searchQuery.toLowerCase();
                          return item.name.toLowerCase().includes(q) || (item.description && item.description.toLowerCase().includes(q));
                        }
                        return true;
                      });

                      if (filtered.length === 0) {
                        return (
                          <div className="col-span-full py-8 text-center text-slate-400 text-xs">
                            <ChefHat className="w-8 h-8 mx-auto mb-1 opacity-40" />
                            <p>Không tìm thấy món ăn phù hợp với bộ lọc</p>
                          </div>
                        );
                      }

                      return filtered.map(dish => {
                        const isDui = checkIsDuiDish(dish);
                        const availability = resolveMenuItemAvailability(dish, commercialInventory);
                        const isAvailable = availability.isAvailable;

                        return (
                          <div
                            key={dish.id}
                            className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                              isAvailable 
                                ? 'bg-white border-slate-200 hover:border-slate-300' 
                                : 'bg-rose-50/60 border-rose-200'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <img
                                src={dish.image}
                                alt={dish.name}
                                className={`w-12 h-12 rounded-lg object-cover shrink-0 ${!isAvailable ? 'grayscale opacity-60' : ''}`}
                              />
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <h5 className="font-bold text-slate-900 text-xs truncate">{dish.name}</h5>
                                  {isDui && (
                                    <span className="text-[9px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.2 rounded">
                                      Đặc sản Dúi
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] font-mono text-amber-900 font-bold">
                                  {dish.price.toLocaleString('vi-VN')}đ
                                </p>
                                <span className={`text-[10px] font-bold ${isAvailable ? 'text-emerald-600' : 'text-rose-600'}`}>
                                  {isAvailable ? '🟢 Đang phục vụ' : `🔴 ${availability.reason || 'Tạm hết món'}`}
                                </span>
                              </div>
                            </div>

                            {/* Toggle Button */}
                            <button
                              onClick={() => handleToggleDishAvailability(dish.id)}
                              className={`px-3 py-1.5 rounded-xl font-bold text-xs shrink-0 transition-colors ${
                                isAvailable
                                  ? 'bg-rose-100 hover:bg-rose-200 text-rose-800'
                                  : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                              }`}
                            >
                              {isAvailable ? 'Báo tạm hết' : 'Mở bán lại'}
                            </button>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              )}

              {/* ==================================================== */}
              {/* TAB 5: DUYỆT CHỐT ĐƠN & QUYẾT ĐỊNH NGHIỆP VỤ AI */}
              {/* ==================================================== */}
              {activeModalTab === 'ai_decisions' && (
                <div className="space-y-4">
                  {/* Explanatory Banner */}
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white shadow-md border border-purple-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/40 text-purple-300 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="text-xs sm:text-sm font-bold text-white">
                            Trung Tâm Duyệt Quyết Định Nghiệp Vụ & Chốt Đơn Của AI
                          </h5>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-200 border border-purple-400/30 font-bold">
                            Chỉ định: Anh Phan Dũng
                          </span>
                        </div>
                        <p className="text-[11px] text-purple-200/90 mt-0.5">
                          Trợ lý ảo AI tự động tra cứu dữ liệu & mạng để trả lời tư vấn thay quản trị viên. Mọi yêu cầu chốt đơn, con giống, đặt cọc tiệc cưới hoặc chính sách giá đều được chuyển trực tiếp về đây để xin ý kiến của Anh.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Module Filter Chips */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      Phân hệ:
                    </span>
                    <button
                      type="button"
                      onClick={() => setDecisionModuleFilter('all')}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                        decisionModuleFilter === 'all'
                          ? 'bg-purple-700 text-white shadow-xs'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Tất cả ({aiDecisions.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setDecisionModuleFilter('farm')}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                        decisionModuleFilter === 'farm'
                          ? 'bg-orange-600 text-white shadow-xs'
                          : 'bg-white text-orange-800 border border-orange-200 hover:bg-orange-50'
                      }`}
                    >
                      🦔 Trại Dúi ({aiDecisions.filter(d => d.module === 'farm').length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setDecisionModuleFilter('restaurant')}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                        decisionModuleFilter === 'restaurant'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-white text-amber-800 border border-amber-200 hover:bg-amber-50'
                      }`}
                    >
                      🍲 Quán Ăn ({aiDecisions.filter(d => d.module === 'restaurant').length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setDecisionModuleFilter('wedding')}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                        decisionModuleFilter === 'wedding'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-white text-rose-800 border border-rose-200 hover:bg-rose-50'
                      }`}
                    >
                      💍 Tiệc Cưới ({aiDecisions.filter(d => d.module === 'wedding').length})
                    </button>
                  </div>

                  {/* List of Decision Requests */}
                  <div className="space-y-3">
                    {(() => {
                      const filtered = aiDecisions.filter(d => {
                        const matchModule = decisionModuleFilter === 'all' || d.module === decisionModuleFilter;
                        const matchStatus = statusFilter === 'all' || d.status === statusFilter;
                        const matchQuery = 
                          d.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          d.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          d.phone.includes(searchQuery) ||
                          d.summary.toLowerCase().includes(searchQuery.toLowerCase());
                        return matchModule && matchStatus && matchQuery;
                      });

                      if (filtered.length === 0) {
                        return (
                          <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-300 text-slate-500">
                            <ShieldCheck className="w-10 h-10 mx-auto mb-2 text-slate-400" />
                            <p className="font-bold text-slate-700">Chưa có yêu cầu nào trong danh mục này</p>
                            <p className="text-xs text-slate-500 mt-1">
                              Khi khách hàng trò chuyện với Trợ lý AI và có ý định chốt đơn, hệ thống sẽ tự động tổng hợp hồ sơ và hiển thị tại đây.
                            </p>
                          </div>
                        );
                      }

                      return filtered.map(item => {
                        const rawPhone = item.phone.replace(/\D/g, '');
                        const noteVal = decisionNotes[item.id] !== undefined ? decisionNotes[item.id] : (item.adminNote || '');

                        return (
                          <div 
                            key={item.id}
                            className={`p-4 rounded-2xl border transition-all bg-white shadow-xs ${
                              item.status === 'pending'
                                ? 'border-purple-300 ring-2 ring-purple-100'
                                : item.status === 'approved'
                                ? 'border-emerald-200 bg-emerald-50/20'
                                : 'border-slate-200'
                            }`}
                          >
                            {/* Card Top Header */}
                            <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded-md text-[11px] font-extrabold uppercase tracking-wide border ${
                                  item.module === 'farm'
                                    ? 'bg-orange-100 text-orange-800 border-orange-200'
                                    : item.module === 'wedding'
                                    ? 'bg-rose-100 text-rose-800 border-rose-200'
                                    : 'bg-amber-100 text-amber-800 border-amber-200'
                                }`}>
                                  {item.module === 'farm' ? '🦔 Trại Dúi KaKa' : item.module === 'wedding' ? '💍 Tiệc Cưới Ngọc Nhi' : '🍲 Quán Ăn Ngọc Nhi'}
                                </span>
                                <span className="font-mono font-bold text-xs text-slate-900">
                                  #{item.code}
                                </span>
                                <span className="text-[11px] text-slate-400">
                                  • {item.createdAt}
                                </span>
                              </div>

                              {/* Status Badge */}
                              <div>
                                {item.status === 'pending' && (
                                  <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-900 border border-purple-300 text-[11px] font-black flex items-center gap-1 animate-pulse">
                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-ping" />
                                    ⏳ Chờ Anh Phan Dũng Duyệt
                                  </span>
                                )}
                                {item.status === 'approved' && (
                                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-[11px] font-extrabold flex items-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                    ✅ Đã Duyệt Chốt Đơn
                                  </span>
                                )}
                                {item.status === 'contacted' && (
                                  <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-900 border border-blue-300 text-[11px] font-extrabold flex items-center gap-1">
                                    <Phone className="w-3.5 h-3.5 text-blue-600" />
                                    📞 Đã Liên Hệ Khách
                                  </span>
                                )}
                                {item.status === 'rejected' && (
                                  <span className="px-2.5 py-1 rounded-full bg-slate-200 text-slate-700 border border-slate-300 text-[11px] font-bold flex items-center gap-1">
                                    <XCircle className="w-3.5 h-3.5 text-slate-500" />
                                    Đã từ chối
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Customer Information & Actions */}
                            <div className="py-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                              {/* Customer Contact */}
                              <div className="space-y-1">
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                  Khách hàng liên hệ
                                </p>
                                <h4 className="font-extrabold text-sm text-slate-900">
                                  {item.customerName}
                                </h4>
                                <div className="flex items-center gap-2 pt-1">
                                  {rawPhone ? (
                                    <>
                                      <a
                                        href={`tel:${rawPhone}`}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition-colors"
                                        title="Bấm gọi số khách"
                                      >
                                        <Phone className="w-3 h-3" />
                                        <span>{item.phone}</span>
                                      </a>
                                      <a
                                        href={`https://zalo.me/${rawPhone}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-2xs transition-colors"
                                        title="Nhắn tin Zalo"
                                      >
                                        <span>Zalo</span>
                                        <ExternalLink className="w-2.5 h-2.5 opacity-80" />
                                      </a>
                                    </>
                                  ) : (
                                    <span className="text-xs text-slate-500 italic">
                                      Chưa để lại số điện thoại (qua chat trực tiếp)
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Order & Decision Content */}
                              <div className="md:col-span-2 space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200">
                                <div className="flex items-center justify-between">
                                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                    Tóm tắt nhu cầu do AI ghi nhận:
                                  </p>
                                  {item.estimatedValue ? (
                                    <span className="text-xs font-bold text-emerald-700 font-mono">
                                      Ước tính: {item.estimatedValue.toLocaleString('vi-VN')}đ
                                    </span>
                                  ) : null}
                                </div>
                                <p className="font-bold text-slate-900 text-xs sm:text-sm">
                                  {item.summary}
                                </p>
                                {item.customerMessage && item.customerMessage !== item.summary && (
                                  <p className="text-[11.5px] text-slate-600 italic pt-1 border-t border-slate-200/60 mt-1.5">
                                    "{item.customerMessage}"
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Admin Note and Actions Bar */}
                            <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                              {/* Admin note input */}
                              <div className="flex-1">
                                <input
                                  type="text"
                                  placeholder="Ghi chú của Anh Phan Dũng (VD: Đã chốt 5 cặp 3-4 lạng, hẹn thứ 7 ship...)"
                                  value={noteVal}
                                  onChange={(e) => {
                                    setDecisionNotes(prev => ({ ...prev, [item.id]: e.target.value }));
                                  }}
                                  className="w-full px-3 py-1.5 text-xs bg-slate-50 rounded-lg border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500 text-slate-800"
                                />
                              </div>

                              {/* Approval Action Buttons */}
                              <div className="flex items-center gap-1.5 shrink-0">
                                {item.status !== 'approved' && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      updateDecisionStatus(item.id, 'approved', noteVal || 'Đã duyệt chốt đơn thành công');
                                    }}
                                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Duyệt chốt đơn</span>
                                  </button>
                                )}

                                {item.status !== 'contacted' && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      updateDecisionStatus(item.id, 'contacted', noteVal || 'Đã liên hệ trao đổi với khách');
                                    }}
                                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                                  >
                                    <Phone className="w-3 h-3" />
                                    <span>Đã liên hệ</span>
                                  </button>
                                )}

                                {item.status !== 'rejected' && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      updateDecisionStatus(item.id, 'rejected', noteVal || 'Từ chối / Chưa đáp ứng');
                                    }}
                                    className="px-2.5 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                                  >
                                    <span>Từ chối</span>
                                  </button>
                                )}

                                {item.status !== 'pending' && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      updateDecisionStatus(item.id, 'pending', noteVal);
                                    }}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 text-xs transition-colors"
                                    title="Chuyển lại về trạng thái Chờ duyệt"
                                  >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Hệ thống tự động đồng bộ khi có khách hàng đặt mới.
              </span>
              <button
                onClick={() => setActiveModalTab(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* ORDER REJECTION CONFIRMATION MODAL */}
      {/* ==================================================== */}
      {rejectingOrder && (
        <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-rose-300 w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="p-4 bg-rose-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-white/20">
                  <XCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base">Không Tiếp Nhận Đơn Hàng #{rejectingOrder.code}</h3>
                  <p className="text-[11px] text-rose-100 font-medium">Chọn lý do và gửi phản hồi trực tiếp tới màn hình tra cứu của khách</p>
                </div>
              </div>
              <button
                onClick={() => setRejectingOrder(null)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
              {/* Order summary pill */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between flex-wrap gap-2 text-slate-700">
                <div>
                  <div className="font-bold text-slate-900">{rejectingOrder.customerName}</div>
                  <div className="text-[11px] text-slate-500">{rejectingOrder.phone} • {rejectingOrder.items.length} món</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-black text-amber-900 text-sm">
                    {rejectingOrder.total.toLocaleString('vi-VN')}đ
                  </div>
                  <div className="text-[10px] text-slate-500">{rejectingOrder.createdAt}</div>
                </div>
              </div>

              {/* Predefined Reasons */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2">
                  1. Chọn lý do không tiếp nhận <span className="text-rose-600">*</span>
                </label>
                <div className="space-y-1.5">
                  {ORDER_REJECTION_REASONS.map((reason, idx) => (
                    <label
                      key={idx}
                      className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer ${
                        orderRejectReason === reason
                          ? 'border-rose-500 bg-rose-50/70 text-rose-950 font-bold'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="orderRejectReason"
                        value={reason}
                        checked={orderRejectReason === reason}
                        onChange={(e) => setOrderRejectReason(e.target.value)}
                        className="mt-0.5 text-rose-600 focus:ring-rose-500"
                      />
                      <span className="text-xs leading-snug">{reason}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Custom reason input if "Lý do khác" is selected */}
              {orderRejectReason === 'Lý do khác (tự nhập cụ thể)' && (
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Nhập chi tiết lý do từ chối: <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Quán tạm nghỉ đột xuất phục vụ đám tiệc lớn..."
                    value={customOrderRejectReason}
                    onChange={(e) => setCustomOrderRejectReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 text-xs"
                    autoFocus
                  />
                </div>
              )}

              {/* Custom Note to Customer */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  2. Lời nhắn gửi riêng cho khách hàng (hiển thị khi khách tra cứu):
                </label>
                <textarea
                  rows={3}
                  value={orderRejectNote}
                  onChange={(e) => setOrderRejectNote(e.target.value)}
                  placeholder="VD: Rất tiếc quán chưa thể phục vụ đơn hàng này của quý khách. Quý khách vui lòng chọn lại món khác hoặc liên hệ hotline..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 text-xs text-slate-800"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  💡 Sau khi xác nhận, bên phía khách hàng tra cứu sẽ thấy lý do từ chối này kèm nút <strong>"Tiếp tục chọn món & Đặt lại"</strong> hoặc <strong>"Đóng / Không đặt nữa"</strong>.
                </p>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectingOrder(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
              >
                Hủy bỏ / Quay lại
              </button>
              <button
                type="button"
                onClick={handleConfirmRejectOrder}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
                <span>Xác Nhận Không Tiếp Nhận & Gửi Phản Hồi</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
