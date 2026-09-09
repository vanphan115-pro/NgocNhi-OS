import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  UtensilsCrossed, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  Check, 
  Copy, 
  X, 
  Sparkles, 
  ShoppingBag, 
  ChefHat, 
  Info, 
  Phone, 
  User,
  ArrowRight,
  Flame,
  AlertCircle,
  CheckCircle2,
  Filter,
  RefreshCw
} from 'lucide-react';
import { MenuItem, RestaurantOrderItem, TableBooking } from '../types';
import { 
  getCommercialDuiInventory, 
  checkIsDuiDish, 
  resolveMenuItemAvailability, 
  CommercialDuiInventory 
} from '../data/inventoryHelper';

interface TableBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  menuItems: MenuItem[];
  cart?: RestaurantOrderItem[];
  defaultArea?: string;
  onConfirmBooking: (bookingData: Omit<TableBooking, 'id' | 'code' | 'createdAt' | 'status'>) => TableBooking;
  onSuccess?: (booking: TableBooking) => void;
}

export const TableBookingModal: React.FC<TableBookingModalProps> = ({
  isOpen,
  onClose,
  menuItems,
  cart = [],
  defaultArea = 'Khu sân vườn',
  onConfirmBooking,
  onSuccess
}) => {
  // Form fields
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [bookingDate, setBookingDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  const [bookingTime, setBookingTime] = useState('18:30');
  const [guestCount, setGuestCount] = useState<number>(6);
  const [tableArea, setTableArea] = useState(defaultArea);
  const [notes, setNotes] = useState('');

  // Live synchronized Menu Items & Farm Commercial Inventory state
  const [liveMenuItems, setLiveMenuItems] = useState<MenuItem[]>(() => {
    try {
      const saved = localStorage.getItem('nn_menu_items_v6');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return menuItems;
  });

  const [commercialInventory, setCommercialInventory] = useState<CommercialDuiInventory>(() => 
    getCommercialDuiInventory()
  );

  // Sync with prop updates
  useEffect(() => {
    if (menuItems && menuItems.length > 0) {
      setLiveMenuItems(menuItems);
    }
  }, [menuItems]);

  // Real-time synchronization with localStorage and cross-tab/cross-component events
  useEffect(() => {
    const handleSync = () => {
      try {
        const saved = localStorage.getItem('nn_menu_items_v6');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setLiveMenuItems(parsed);
          }
        }
      } catch (e) {}
      setCommercialInventory(getCommercialDuiInventory());
    };

    window.addEventListener('storage', handleSync);
    window.addEventListener('nn_data_sync', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('nn_data_sync', handleSync);
    };
  }, []);

  // Selected dishes state
  const [selectedDishes, setSelectedDishes] = useState<RestaurantOrderItem[]>([]);
  const [dishSearch, setDishSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<'available_only' | 'all' | 'out_of_stock'>('available_only');
  const [activeTab, setActiveTab] = useState<'info' | 'dishes'>('info');

  // Success ticket state
  const [successBooking, setSuccessBooking] = useState<TableBooking | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Available restaurant dishes (filter out purely wedding dishes)
  const restaurantDishes = useMemo(() => {
    return liveMenuItems.filter(item => {
      if (item.serviceType === 'wedding') return false;
      if (item.category.startsWith('wedding_')) return false;
      return true;
    });
  }, [liveMenuItems]);

  // Count available vs out of stock stats
  const { inStockCount, outOfStockCount } = useMemo(() => {
    let inStock = 0;
    let outStock = 0;
    restaurantDishes.forEach(d => {
      const { isAvailable } = resolveMenuItemAvailability(d, commercialInventory);
      if (isAvailable) inStock++;
      else outStock++;
    });
    return { inStockCount: inStock, outOfStockCount: outStock };
  }, [restaurantDishes, commercialInventory]);

  // Filtered dishes according to search, category, and availability status
  const filteredDishes = useMemo(() => {
    return restaurantDishes.filter(item => {
      const { isAvailable } = resolveMenuItemAvailability(item, commercialInventory);

      // Filter by availability
      if (availabilityFilter === 'available_only' && !isAvailable) return false;
      if (availabilityFilter === 'out_of_stock' && isAvailable) return false;

      // Filter by category
      const matchCat = activeCategory === 'all' || item.category === activeCategory;

      // Filter by search query
      const matchQuery = !dishSearch.trim() || 
        item.name.toLowerCase().includes(dishSearch.toLowerCase()) ||
        item.description.toLowerCase().includes(dishSearch.toLowerCase());

      return matchCat && matchQuery;
    });
  }, [restaurantDishes, commercialInventory, availabilityFilter, activeCategory, dishSearch]);

  // Track any already selected dishes that have become out of stock
  const unavailableSelectedDishes = useMemo(() => {
    return selectedDishes.filter(selected => {
      const dish = liveMenuItems.find(m => m.id === selected.menuItemId || m.name === selected.name);
      if (!dish) return false;
      const { isAvailable } = resolveMenuItemAvailability(dish, commercialInventory);
      return !isAvailable;
    });
  }, [selectedDishes, liveMenuItems, commercialInventory]);

  // Selected dishes stats
  const preOrderTotal = useMemo(() => {
    return selectedDishes.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [selectedDishes]);

  const totalItemsCount = useMemo(() => {
    return selectedDishes.reduce((sum, item) => sum + item.quantity, 0);
  }, [selectedDishes]);

  // Dish quantity handlers with strict availability validation
  const handleAddDish = (item: MenuItem) => {
    const { isAvailable } = resolveMenuItemAvailability(item, commercialInventory);
    if (!isAvailable) {
      alert(`Món "${item.name}" hiện quán đang báo TẠM HẾT. Quý khách vui lòng chọn món khác trong thực đơn đang phục vụ!`);
      return;
    }

    setSelectedDishes(prev => {
      const existing = prev.find(d => d.menuItemId === item.id);
      if (existing) {
        return prev.map(d => d.menuItemId === item.id ? { ...d, quantity: d.quantity + 1 } : d);
      }
      return [
        ...prev,
        {
          menuItemId: item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
          image: item.image,
        }
      ];
    });
  };

  const handleUpdateQuantity = (menuItemId: string, delta: number) => {
    setSelectedDishes(prev => {
      return prev
        .map(d => {
          if (d.menuItemId === menuItemId) {
            const nextQty = d.quantity + delta;
            return nextQty > 0 ? { ...d, quantity: nextQty } : null;
          }
          return d;
        })
        .filter(Boolean) as RestaurantOrderItem[];
    });
  };

  const handleRemoveDish = (menuItemId: string) => {
    setSelectedDishes(prev => prev.filter(d => d.menuItemId !== menuItemId));
  };

  // Remove all unavailable items from current selection
  const handleRemoveAllUnavailable = () => {
    setSelectedDishes(prev => 
      prev.filter(d => !unavailableSelectedDishes.some(u => u.menuItemId === d.menuItemId || u.name === d.name))
    );
  };

  // Import dishes from current cart with out-of-stock safety filtering
  const handleImportFromCart = () => {
    if (cart.length === 0) return;
    
    const validItems: RestaurantOrderItem[] = [];
    const skippedItems: string[] = [];

    cart.forEach(cartItem => {
      const foundDish = liveMenuItems.find(m => m.id === cartItem.menuItemId || m.name === cartItem.name);
      if (foundDish) {
        const { isAvailable } = resolveMenuItemAvailability(foundDish, commercialInventory);
        if (isAvailable) {
          validItems.push(cartItem);
        } else {
          skippedItems.push(cartItem.name);
        }
      } else {
        validItems.push(cartItem);
      }
    });

    if (skippedItems.length > 0) {
      alert(`Đã tự động loại bỏ ${skippedItems.length} món do quán đang báo TẠM HẾT: ${skippedItems.join(', ')}.`);
    }

    if (validItems.length === 0) {
      alert('Tất cả các món trong giỏ hàng hiện tại đều đã tạm hết hoặc không hợp lệ.');
      return;
    }

    setSelectedDishes(prev => {
      const merged = [...prev];
      validItems.forEach(cartItem => {
        const idx = merged.findIndex(m => m.menuItemId === cartItem.menuItemId);
        if (idx >= 0) {
          merged[idx] = { ...merged[idx], quantity: merged[idx].quantity + cartItem.quantity };
        } else {
          merged.push({ ...cartItem });
        }
      });
      return merged;
    });
  };

  // Form submission
  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();

    if (unavailableSelectedDishes.length > 0) {
      alert(`Trong danh sách món đặt trước có ${unavailableSelectedDishes.length} món quán báo TẠM HẾT (${unavailableSelectedDishes.map(d => d.name).join(', ')}). Quý khách vui lòng bấm nút "Xóa món tạm hết" để tiếp tục đặt bàn!`);
      return;
    }

    const guestName = customerName.trim() || 'Khách đặt qua Website';
    const guestPhone = phone.trim() || '0967823801';

    let finalNotes = notes.trim();
    if (selectedDishes.length > 0) {
      const dishSummary = selectedDishes.map(d => `${d.quantity}x ${d.name}`).join(', ');
      finalNotes = finalNotes ? `${finalNotes} | [Món đặt trước: ${dishSummary}]` : `[Món đặt trước: ${dishSummary}]`;
    }

    const newBooking = onConfirmBooking({
      customerName: guestName,
      phone: guestPhone,
      bookingDate,
      bookingTime,
      guestCount: Number(guestCount) || 2,
      tableArea,
      notes: finalNotes || 'Khách đặt bàn qua hệ thống trực tuyến',
      preOrderItems: selectedDishes.length > 0 ? [...selectedDishes] : undefined,
      preOrderTotal: selectedDishes.length > 0 ? preOrderTotal : undefined,
    });

    setSuccessBooking(newBooking);
    if (onSuccess) onSuccess(newBooking);
  };

  // Copy code handler
  const handleCopyCode = () => {
    if (!successBooking) return;
    navigator.clipboard.writeText(successBooking.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-4xl w-full my-auto overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* ========================================================= */}
        {/* MODAL HEADER */}
        {/* ========================================================= */}
        <div className="px-5 py-3.5 sm:px-6 sm:py-4 bg-gradient-to-r from-orange-600 via-amber-600 to-amber-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
              <Calendar className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold">Đặt Bàn & Chọn Món Trước</h2>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-amber-950 uppercase tracking-wider">
                  Ẩm Thực Ngọc Nhi
                </span>
              </div>
              <p className="text-xs text-amber-100/90 line-clamp-1">
                Giữ chỗ ưu tiên • Chọn món lên ngay khi tới • Không lo chờ đợi
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/25 text-white/90 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ========================================================= */}
        {/* SUCCESS VIEW (When Booking Completed) */}
        {/* ========================================================= */}
        {successBooking ? (
          <div className="p-6 sm:p-8 space-y-6 overflow-y-auto text-center flex-1">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-inner">
              <Check className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                ✓ Đặt Bàn Thành Công!
              </span>
              <h3 className="text-xl font-bold text-slate-900 pt-2">
                Cảm ơn quý khách {successBooking.customerName}!
              </h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Nhà hàng Ẩm Thực Sinh Thái Ngọc Nhi đã tiếp nhận phiếu đặt bàn và chuyển thông tin cho quản lý & bếp để sẵn sàng phục vụ.
              </p>
            </div>

            {/* Ticket Card */}
            <div className="max-w-md mx-auto bg-amber-50/70 border border-amber-200 rounded-2xl p-4 sm:p-5 text-left space-y-3.5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-amber-200/70">
                <div>
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Mã số phiếu</span>
                  <span className="font-mono text-lg font-black text-amber-900">{successBooking.code}</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-amber-900 text-xs font-bold hover:bg-amber-100 flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Đã sao chép' : 'Sao chép mã'}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">Thời gian đến:</span>
                  <strong className="text-slate-900">{successBooking.bookingTime} • {successBooking.bookingDate}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Số lượng khách:</span>
                  <strong className="text-slate-900">{successBooking.guestCount} người</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Khu vực bàn:</span>
                  <strong className="text-slate-900">{successBooking.tableArea}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Số điện thoại:</span>
                  <strong className="text-slate-900">{successBooking.phone}</strong>
                </div>
              </div>

              {/* Pre-ordered items breakdown */}
              {successBooking.preOrderItems && successBooking.preOrderItems.length > 0 ? (
                <div className="pt-3 border-t border-amber-200/70 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-950">
                    <span className="flex items-center gap-1.5">
                      <ChefHat className="w-3.5 h-3.5 text-orange-600" />
                      Món ăn đặt trước ({successBooking.preOrderItems.length} món):
                    </span>
                    <span className="font-mono text-orange-700">
                      {(successBooking.preOrderTotal || 0).toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                  <div className="bg-white rounded-xl p-2.5 border border-amber-100 space-y-1.5 text-xs max-h-36 overflow-y-auto">
                    {successBooking.preOrderItems.map((dish, idx) => (
                      <div key={idx} className="flex justify-between items-center text-slate-700">
                        <span>{dish.quantity}x {dish.name}</span>
                        <span className="font-mono font-semibold text-slate-900">
                          {(dish.price * dish.quantity).toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-emerald-700 font-medium">
                    ✓ Bếp sẽ chuẩn bị trước nguyên liệu để quý khách đến nơi có món thưởng thức ngay!
                  </p>
                </div>
              ) : (
                <div className="pt-2 border-t border-amber-200/70 text-[11px] text-slate-600 italic">
                  Chưa chọn món trước — Quý khách sẽ gọi món trực tiếp tại bàn khi đến nhà hàng.
                </div>
              )}
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md transition-all active:scale-95"
              >
                Hoàn Tất & Đóng
              </button>
            </div>
          </div>
        ) : (
          /* ========================================================= */
          /* BOOKING & DISH SELECTION FORM */
          /* ========================================================= */
          <form onSubmit={handleSubmitBooking} className="flex flex-col flex-1 overflow-hidden">
            
            {/* Mobile Tab Switcher */}
            <div className="sm:hidden flex border-b border-slate-200 bg-slate-50 text-xs font-bold shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('info')}
                className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
                  activeTab === 'info'
                    ? 'border-orange-600 text-orange-600 bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>1. Thông tin bàn</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('dishes')}
                className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
                  activeTab === 'dishes'
                    ? 'border-orange-600 text-orange-600 bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <UtensilsCrossed className="w-3.5 h-3.5" />
                <span>2. Chọn món ({totalItemsCount})</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
              
              {/* ------------------------------------------------------------- */}
              {/* LEFT COLUMN: TABLE & CUSTOMER DETAILS (lg:col-span-5) */}
              {/* ------------------------------------------------------------- */}
              <div className={`p-4 sm:p-5 space-y-4 lg:col-span-5 ${activeTab === 'dishes' ? 'hidden lg:block' : 'block'}`}>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-4 h-4 text-orange-600" />
                    Thông tin người đặt
                  </h3>
                  <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-medium border border-amber-200">
                    Bắt buộc
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  {/* Customer Name */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Họ và tên quý khách <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="Ví dụ: Anh Hoàng / Chị Mai"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
                      />
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Số điện thoại nhận xác nhận <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        required
                        placeholder="Ví dụ: 0918 234 567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
                      />
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    {/* Date */}
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Ngày dùng bữa
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          value={bookingDate}
                          onChange={(e) => setBookingDate(e.target.value)}
                          className="w-full pl-8 pr-2 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:ring-2 focus:ring-orange-500"
                        />
                        <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
                      </div>
                    </div>

                    {/* Time */}
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Giờ đến dự kiến
                      </label>
                      <div className="relative">
                        <select
                          value={bookingTime}
                          onChange={(e) => setBookingTime(e.target.value)}
                          className="w-full pl-8 pr-2 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:ring-2 focus:ring-orange-500"
                        >
                          <option value="11:00">11:00 (Trưa)</option>
                          <option value="11:30">11:30 (Trưa)</option>
                          <option value="12:00">12:00 (Trưa)</option>
                          <option value="12:30">12:30 (Trưa)</option>
                          <option value="17:00">17:00 (Chiều)</option>
                          <option value="17:30">17:30 (Chiều)</option>
                          <option value="18:00">18:00 (Tối)</option>
                          <option value="18:30">18:30 (Tối cao điểm)</option>
                          <option value="19:00">19:00 (Tối)</option>
                          <option value="19:30">19:30 (Tối)</option>
                          <option value="20:00">20:00 (Tối muộn)</option>
                        </select>
                        <Clock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    {/* Guest Count */}
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Số lượng khách
                      </label>
                      <div className="relative">
                        <select
                          value={guestCount}
                          onChange={(e) => setGuestCount(Number(e.target.value))}
                          className="w-full pl-8 pr-2 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:ring-2 focus:ring-orange-500"
                        >
                          {[2, 4, 6, 8, 10, 12, 15, 20, 25, 30].map(g => (
                            <option key={g} value={g}>{g} người</option>
                          ))}
                        </select>
                        <Users className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
                      </div>
                    </div>

                    {/* Table Area */}
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Khu vực bàn
                      </label>
                      <div className="relative">
                        <select
                          value={tableArea}
                          onChange={(e) => setTableArea(e.target.value)}
                          className="w-full pl-8 pr-2 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:ring-2 focus:ring-orange-500"
                        >
                          <option value="Khu sân vườn">Khu sân vườn thoáng mát</option>
                          <option value="Phòng VIP Hoàng Gia">Phòng VIP Hoàng Gia riêng tư</option>
                          <option value="Sảnh chính ẩm thực">Sảnh chính ẩm thực</option>
                          <option value="Chòi lá sinh thái">Chòi lá sinh thái view hồ</option>
                        </select>
                        <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Yêu cầu đặc biệt
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Ví dụ: Cần ghế trẻ em, tiệc sinh nhật, ít cay, vị trí gần quạt gió..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white resize-none text-xs"
                    />
                  </div>
                </div>

                {/* Mobile switch to dishes button */}
                <div className="pt-2 lg:hidden">
                  <button
                    type="button"
                    onClick={() => setActiveTab('dishes')}
                    className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                  >
                    <span>Tiếp theo: Chọn món trước ({totalItemsCount} món)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* RIGHT COLUMN: PRE-ORDER DISHES (lg:col-span-7) */}
              {/* ------------------------------------------------------------- */}
              <div className={`p-4 sm:p-5 flex flex-col lg:col-span-7 h-full ${activeTab === 'info' ? 'hidden lg:flex' : 'flex'}`}>
                
                {/* Header & Quick Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <ChefHat className="w-4 h-4 text-orange-600" />
                      Chọn Món Lên Trước (Pre-order)
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Đồng bộ thời gian thực với thực đơn quán • Bếp sơ chế trước, lên món ngay khi đến
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Import from cart button if available */}
                    {cart.length > 0 && (
                      <button
                        type="button"
                        onClick={handleImportFromCart}
                        className="px-2.5 py-1 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-[11px] font-bold flex items-center gap-1 transition-colors border border-amber-300 shadow-xs"
                        title="Lấy các món đang còn phục vụ trong giỏ hàng đưa vào đặt bàn"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 text-amber-700" />
                        <span>Nhập từ Giỏ ({cart.length})</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Warning Banner: When selected items are or became out of stock */}
                {unavailableSelectedDishes.length > 0 && (
                  <div className="my-2 p-2.5 rounded-xl bg-red-50 border border-red-300 text-red-900 text-xs flex flex-wrap items-center justify-between gap-2 shadow-xs animate-in fade-in">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                      <div>
                        <span className="font-bold text-red-800">Cảnh báo thực đơn: </span>
                        <span>
                          Có <strong>{unavailableSelectedDishes.length}</strong> món quý khách chọn quán đã báo <strong>TẠM HẾT</strong>: {unavailableSelectedDishes.map(d => d.name).join(', ')}.
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveAllUnavailable}
                      className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] transition-colors shadow-xs"
                    >
                      Xóa món tạm hết ({unavailableSelectedDishes.length})
                    </button>
                  </div>
                )}

                {/* Availability Filter & Search */}
                <div className="py-2.5 space-y-2">
                  {/* Availability Filter Tabs */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl text-[11px]">
                      <button
                        type="button"
                        onClick={() => setAvailabilityFilter('available_only')}
                        className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                          availabilityFilter === 'available_only'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                        <span>Đang phục vụ ({inStockCount})</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setAvailabilityFilter('all')}
                        className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                          availabilityFilter === 'all'
                            ? 'bg-white text-slate-900 font-bold shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <span>Tất cả ({restaurantDishes.length})</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setAvailabilityFilter('out_of_stock')}
                        className={`px-2 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                          availabilityFilter === 'out_of_stock'
                            ? 'bg-rose-600 text-white font-bold shadow-xs'
                            : 'text-rose-700 hover:text-rose-800'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        <span>Tạm hết ({outOfStockCount})</span>
                      </button>
                    </div>

                    <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-slate-600 font-medium">
                      <RefreshCw className="w-3 h-3 text-emerald-500 animate-spin" />
                      Đồng bộ trực tiếp
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Tìm món ăn nhanh: Dúi nướng, gà quay lu, lẩu gà lá é..."
                      value={dishSearch}
                      onChange={(e) => setDishSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2 pointer-events-none" />
                    {dishSearch && (
                      <button
                        type="button"
                        onClick={() => setDishSearch('')}
                        className="text-slate-400 hover:text-slate-600 absolute right-2.5 top-2 text-xs"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Category Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px]">
                    {[
                      { id: 'all', label: 'Tất cả nhóm' },
                      { id: 'specialty', label: 'Đặc sản Dúi', icon: Flame },
                      { id: 'appetizer', label: 'Khai vị & Gỏi' },
                      { id: 'main', label: 'Món chính & Nướng' },
                      { id: 'hotpot_grill', label: 'Lẩu & Nướng' },
                      { id: 'seafood', label: 'Hải sản' },
                      { id: 'drink', label: 'Nước uống' },
                    ].map((cat) => {
                      const Icon = cat.icon;
                      const active = activeCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setActiveCategory(cat.id)}
                          className={`px-2.5 py-1 rounded-lg shrink-0 font-medium transition-all flex items-center gap-1 ${
                            active
                              ? 'bg-orange-600 text-white font-bold shadow-xs'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          {Icon && <Icon className="w-3 h-3 text-amber-300" />}
                          <span>{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Dish Grid List */}
                <div className="flex-1 overflow-y-auto pr-1 space-y-2 max-h-[300px] sm:max-h-[340px]">
                  {filteredDishes.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-xs">
                      {availabilityFilter === 'out_of_stock'
                        ? 'Hiện tại quán không có món nào bị tạm hết.'
                        : 'Không tìm thấy món ăn phù hợp với bộ lọc.'}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {filteredDishes.map((dish) => {
                        const { isAvailable, reason } = resolveMenuItemAvailability(dish, commercialInventory);
                        const selected = selectedDishes.find(d => d.menuItemId === dish.id);
                        const qty = selected ? selected.quantity : 0;
                        return (
                          <div 
                            key={dish.id} 
                            className={`p-2 rounded-xl border flex gap-2.5 items-center transition-all ${
                              !isAvailable
                                ? 'bg-slate-50/80 border-rose-200 opacity-80'
                                : qty > 0 
                                  ? 'border-orange-400 ring-1 ring-orange-400/40 bg-orange-50/20' 
                                  : 'border-slate-200 hover:border-slate-300 bg-white'
                            }`}
                          >
                            <div className="relative shrink-0">
                              <img
                                src={dish.image}
                                alt={dish.name}
                                className={`w-14 h-14 rounded-lg object-cover border border-slate-100 ${
                                  !isAvailable ? 'grayscale opacity-60' : ''
                                }`}
                                referrerPolicy="no-referrer"
                              />
                              {!isAvailable && (
                                <span className="absolute inset-x-0 bottom-0 py-0.5 text-[8px] font-black uppercase text-center bg-rose-600 text-white rounded-b-lg">
                                  Tạm hết
                                </span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1">
                                {dish.isSpecialty && (
                                  <span className="px-1 py-0.2 text-[9px] font-bold bg-amber-100 text-amber-800 rounded">
                                    Đặc sản
                                  </span>
                                )}
                                <h4 className="text-xs font-bold text-slate-900 truncate" title={dish.name}>
                                  {dish.name}
                                </h4>
                              </div>
                              <p className="text-[11px] font-mono font-bold text-orange-700">
                                {dish.price.toLocaleString('vi-VN')}đ
                                {dish.unit && <span className="text-[10px] text-slate-500 font-normal"> /{dish.unit}</span>}
                              </p>

                              {/* Availability Notice & Action */}
                              <div className="mt-1">
                                {!isAvailable ? (
                                  <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                      <span className="px-2 py-0.5 rounded-lg bg-rose-100 text-rose-800 font-bold text-[10px] border border-rose-200 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3 text-rose-600" />
                                        <span>{reason || 'Tạm hết món'}</span>
                                      </span>
                                    </div>
                                    {qty > 0 && (
                                      <div className="flex items-center justify-between text-[10px] bg-rose-100/80 text-rose-900 px-1.5 py-0.5 rounded border border-rose-300">
                                        <span className="font-semibold">Đã chọn trước đó</span>
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveDish(dish.id)}
                                          className="text-rose-800 font-bold underline hover:text-rose-950 ml-1"
                                        >
                                          Xóa
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  /* Action Stepper for Available Dishes */
                                  <div className="flex items-center justify-between">
                                    {qty === 0 ? (
                                      <button
                                        type="button"
                                        onClick={() => handleAddDish(dish)}
                                        className="px-2 py-0.5 rounded-lg bg-orange-50 hover:bg-orange-600 hover:text-white text-orange-700 font-bold text-[10px] border border-orange-200 transition-all flex items-center gap-1 active:scale-95"
                                      >
                                        <Plus className="w-3 h-3" />
                                        <span>Chọn món</span>
                                      </button>
                                    ) : (
                                      <div className="flex items-center gap-1 bg-orange-100/70 border border-orange-300 rounded-lg p-0.5">
                                        <button
                                          type="button"
                                          onClick={() => handleUpdateQuantity(dish.id, -1)}
                                          className="w-5 h-5 rounded bg-white hover:bg-orange-200 text-orange-800 flex items-center justify-center font-bold text-xs shadow-xs"
                                        >
                                          <Minus className="w-3 h-3" />
                                        </button>
                                        <span className="w-6 text-center font-mono font-bold text-orange-950 text-xs">
                                          {qty}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => handleUpdateQuantity(dish.id, 1)}
                                          className="w-5 h-5 rounded bg-orange-600 hover:bg-orange-700 text-white flex items-center justify-center font-bold text-xs shadow-xs"
                                        >
                                          <Plus className="w-3 h-3" />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Selected Dishes Drawer Preview */}
                {selectedDishes.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        Đã chọn {totalItemsCount} phần ({selectedDishes.length} món):
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedDishes([])}
                        className="text-[11px] text-red-600 hover:text-red-700 hover:underline flex items-center gap-0.5"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Xóa tất cả món</span>
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto pr-1">
                      {selectedDishes.map((dish) => (
                        <span 
                          key={dish.menuItemId} 
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-orange-50 border border-orange-200 text-[11px] text-orange-950 font-medium"
                        >
                          <span className="font-bold text-orange-700">{dish.quantity}x</span>
                          <span className="truncate max-w-[120px]">{dish.name}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveDish(dish.menuItemId)}
                            className="text-slate-400 hover:text-red-600 ml-0.5"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ========================================================= */}
            {/* MODAL FOOTER BAR */}
            {/* ========================================================= */}
            <div className="px-4 py-3 sm:px-6 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-600">
                    Bàn {guestCount} khách • {tableArea}
                  </span>
                  {selectedDishes.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800 border border-orange-200">
                      {totalItemsCount} món lên trước
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500">
                  {selectedDishes.length > 0 ? (
                    <span>Tạm tính món ăn: <strong className="text-orange-700 font-mono text-xs">{preOrderTotal.toLocaleString('vi-VN')}đ</strong> (Thanh toán tại quán sau bữa ăn)</span>
                  ) : (
                    <span>Chưa chọn món trước • Quý khách có thể gọi món khi đến</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors"
                >
                  Đóng
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Xác Nhận Đặt Bàn Ngay</span>
                </button>
              </div>
            </div>

          </form>
        )}
      </div>
    </div>
  );
};
