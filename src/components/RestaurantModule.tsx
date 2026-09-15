import React, { useState, useEffect, useMemo } from 'react';
import { 
  MenuItem, 
  TableBooking, 
  MenuItemCategory, 
  UserRole, 
  TableBookingStatus, 
  RestaurantOrder, 
  RestaurantOrderItem,
  AppView 
} from '../types';
import { SYSTEM_INFO, MANAGERS, RESTAURANT_SPACES } from '../data/initialData';
import { 
  getCommercialDuiInventory, 
  checkIsDuiDish, 
  resolveMenuItemAvailability,
  replenishCommercialDuiStock,
  CommercialDuiInventory 
} from '../data/inventoryHelper';
import { 
  UtensilsCrossed, 
  Calendar, 
  Clock, 
  Users, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  Search, 
  Sparkles, 
  Check, 
  X, 
  ChefHat, 
  FileText, 
  AlertCircle,
  AlertTriangle,
  Eye,
  Plus,
  Minus,
  Trash2,
  Share2,
  ShoppingBag,
  ShoppingCart,
  Tag,
  Star,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Boxes,
  Truck,
  Gift,
  Home,
  MessageCircle,
  HelpCircle,
  Radio,
  Layers,
  Flame,
  ArrowRight,
  Map,
  CheckCircle,
  ShieldCheck,
  RefreshCw,
  PlusCircle,
  Edit3,
  Copy,
  Receipt,
  Upload,
  Image as ImageIcon,
  ToggleLeft,
  ToggleRight,
  Power,
  Pencil,
  Scale,
  Send,
  RotateCcw,
  Calculator,
  Sliders,
  Info,
  Bell
} from 'lucide-react';
import { triggerAdminNotification } from '../utils/notificationSound';
import { createDecisionRequest, getLocalDecisions, subscribeToDecisions } from '../services/aiDecisionService';
import { AIDecisionRequest } from '../types';
import { TableBookingModal } from './TableBookingModal';
import { ModuleChatWidget, QuickPrompt } from './chat/ModuleChatWidget';

const RESTAURANT_QUICK_PROMPTS: QuickPrompt[] = [
  {
    label: '🍖 Đặc sản Dúi tươi sống',
    question: 'Quán có những món đặc sản Dúi nào ngon nhất?',
    answer: 'Ngọc Nhi nổi tiếng với Dúi tươi sống bắt tại chuồng:\n• Dúi nướng mọi / muối ớt thơm lừng\n• Dúi xào lăn nước cốt dừa béo ngậy\n• Dúi hấp lá tía tô giữ trọn vị ngọt thanh\n• Rượu tiết dúi / mật dúi tráng dương bồi bổ sức khỏe.'
  },
  {
    label: '🪑 Đặt bàn tiệc trước',
    question: 'Tôi muốn đặt bàn tiệc cho nhóm gia đình/bạn bè thì làm sao?',
    answer: 'Quý khách có thể bấm nút "Mở form đặt bàn nhanh" ngay phía trên hoặc liên hệ Hotline 0967.823.801 để chọn phòng VIP riêng tư hoặc không gian sảnh tiệc sân vườn thoáng mát.'
  },
  {
    label: '🚗 Giao món tận nơi',
    question: 'Quán có nhận giao món ăn đóng hộp mang về tận nhà không?',
    answer: 'Quán có nhận giao hàng tận nơi qua hotline 0967.823.801. Món ăn được đóng hộp giữ nhiệt chuyên dụng, đảm bảo nóng sốt và chuẩn vị như thưởng thức tại quán!'
  },
  {
    label: '🍲 Món lẩu & nướng đặc sản',
    question: 'Thực đơn lẩu và nướng tại quán có những món gì?',
    answer: 'Quán phục vụ đa dạng: Lẩu Dúi lá giang chua cay, Lẩu gà ta tiềm ớt hiểm, Lẩu cá lăng măng chua, Cá lăng nướng muối ớt và các món nướng than hoa thơm nức.'
  },
  {
    label: '📍 Địa chỉ & Giờ mở cửa',
    question: 'Quán mở cửa từ mấy giờ và địa chỉ chính xác ở đâu?',
    answer: 'Quán Ăn Ngọc Nhi mở cửa phục vụ từ 09:00 đến 22:30 tất cả các ngày trong tuần tại:\n📍 Khu phố 9, phường Lộc Ninh, TP. Đồng Nai.\n📞 Hotline đặt bàn: 0967.823.801 - 0969.310.601.'
  }
];

const handleRestaurantChatResponse = (text: string): string | null => {
  const lower = text.toLowerCase();
  if (lower.includes('dúi') || lower.includes('đặc sản') || lower.includes('món ngon')) {
    return `Đặc sản Dúi tại Ngọc Nhi được chế biến từ dúi tươi sống tuyển chọn từ Trại Dúi KaKa:\n• Dúi nướng mọi / muối ớt\n• Dúi xào lăn ăn kèm bánh mì\n• Dúi hấp lá tía tô\n• Dúi om măng chua cay\nQuý khách muốn đặt món nào trước để bếp chuẩn bị nóng sốt ạ?`;
  }
  if (lower.includes('bàn') || lower.includes('đặt chỗ') || lower.includes('giữ chỗ') || lower.includes('phòng vip')) {
    return `Quán có sẵn phòng VIP máy lạnh riêng tư và sảnh tiệc sân vườn rộng thoáng.\nQuý khách có thể bấm nút "Mở form đặt bàn nhanh" ở phía trên khung chat để gửi thông tin giữ bàn ngay nhé!`;
  }
  if (lower.includes('giờ') || lower.includes('mở cửa') || lower.includes('địa chỉ') || lower.includes('ở đâu')) {
    return `Quán Ăn Ngọc Nhi phục vụ từ 09:00 - 22:30 mỗi ngày.\n📍 Địa chỉ: Khu phố 9, phường Lộc Ninh, TP. Đồng Nai.\n📞 Hotline hỗ trợ: 0967.823.801 - 0969.310.601.`;
  }
  return null;
};

// Curated culinary images for quick one-click replacement
const CURATED_DISH_IMAGES = [
  { label: 'Dúi nướng mọi', url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80' },
  { label: 'Dúi hấp sả', url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80' },
  { label: 'Dúi xào lăn', url: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80' },
  { label: 'Dúi xào sả ớt', url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80' },
  { label: 'Dúi hầm thuốc bắc / Lẩu măng', url: 'https://images.unsplash.com/photo-1547928576-a4a33237cbc3?auto=format&fit=crop&w=800&q=80' },
  { label: 'Dúi rựa mận', url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80' },
  { label: 'Rau rừng xào tỏi', url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80' },
  { label: 'Hải sản / Mực tươi', url: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80' },
  { label: 'Gỏi khai vị đặc sản', url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80' },
  { label: 'Đồ uống & Bia lạnh', url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80' },
  { label: 'Tráng miệng trái cây', url: 'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&w=800&q=80' }
];

interface RestaurantModuleProps {
  userRole: UserRole;
  menuItems: MenuItem[];
  onUpdateMenuItem: (item: MenuItem) => void;
  onAddMenuItem: (item: MenuItem) => void;
  onDeleteMenuItem?: (itemId: string) => void;
  onBatchReplaceMenuItems?: (items: MenuItem[]) => void;
  onResetDefaultMenuItems?: () => void;
  bookings: TableBooking[];
  onAddBooking: (booking: Omit<TableBooking, 'id' | 'code' | 'createdAt' | 'status'>) => TableBooking;
  onUpdateBookingStatus: (bookingId: string, status: TableBookingStatus) => void;
  orders?: RestaurantOrder[];
  onAddRestaurantOrder?: (order: RestaurantOrder) => RestaurantOrder;
  onOpenAdminLogin?: (reason?: string) => void;
  onNavigate?: (view: AppView) => void;
}

export const RestaurantModule: React.FC<RestaurantModuleProps> = ({
  userRole,
  menuItems,
  onUpdateMenuItem,
  onAddMenuItem,
  onDeleteMenuItem,
  onBatchReplaceMenuItems,
  onResetDefaultMenuItems,
  bookings,
  onAddBooking,
  onUpdateBookingStatus,
  orders: propOrders,
  onAddRestaurantOrder,
  onOpenAdminLogin,
  onNavigate,
}) => {
  // Navigation & View Sub-states
  const [activeNav, setActiveNav] = useState<'home' | 'menu' | 'booking' | 'order_online' | 'promotions' | 'news' | 'reviews' | 'about' | 'contact'>('home');
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>('all');
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  // Cart State (Persisted in localStorage)
  const [cart, setCart] = useState<RestaurantOrderItem[]>(() => {
    try {
      const saved = localStorage.getItem('nn_restaurant_cart');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    // Initial appetizing items matching reference image
    return [
      {
        menuItemId: 'm-dui-02',
        name: 'Dúi nướng mọi',
        price: 350000,
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80'
      },
      {
        menuItemId: 'm-veg-01',
        name: 'Rau rừng xào tỏi',
        price: 60000,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80'
      },
      {
        menuItemId: 'm-drk-01',
        name: 'Nước sấu',
        price: 30000,
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80'
      }
    ];
  });

  // Commercial Dúi Inventory (Live synchronized with Farm's Khu Thương Phẩm)
  const [commercialInventory, setCommercialInventory] = useState<CommercialDuiInventory>(() => getCommercialDuiInventory());

  useEffect(() => {
    const syncCommercialStock = () => {
      const fresh = getCommercialDuiInventory();
      setCommercialInventory(prev => {
        if (
          prev.totalDuiCount === fresh.totalDuiCount &&
          prev.activeCageCount === fresh.activeCageCount &&
          prev.hasStock === fresh.hasStock
        ) {
          return prev;
        }
        return fresh;
      });
    };
    window.addEventListener('nn_data_sync', syncCommercialStock);
    window.addEventListener('storage', syncCommercialStock);
    return () => {
      window.removeEventListener('nn_data_sync', syncCommercialStock);
      window.removeEventListener('storage', syncCommercialStock);
    };
  }, []);

  // Promo Code State
  const [promoCode, setPromoCode] = useState<string>('NGOCNHI10');
  const [promoApplied, setPromoApplied] = useState<boolean>(true);

  // Orders State (Persisted in localStorage for real-time aggregation)
  const [orders, setOrders] = useState<RestaurantOrder[]>(() => {
    if (propOrders && propOrders.length > 0) return propOrders;
    try {
      const saved = localStorage.getItem('nn_restaurant_orders');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  });

  // Track pending decisions for restaurant module
  const [restaurantPendingDecisions, setRestaurantPendingDecisions] = useState<AIDecisionRequest[]>(() => {
    return getLocalDecisions().filter(d => d.module === 'restaurant' && d.status === 'pending');
  });

  useEffect(() => {
    const unsub = subscribeToDecisions((all) => {
      setRestaurantPendingDecisions(all.filter(d => d.module === 'restaurant' && d.status === 'pending'));
    });
    return unsub;
  }, []);

  // Keep orders in sync with props
  useEffect(() => {
    if (propOrders) {
      setOrders(propOrders);
    }
  }, [propOrders]);

  // Save Cart to LocalStorage
  useEffect(() => {
    localStorage.setItem('nn_restaurant_cart', JSON.stringify(cart));
  }, [cart]);

  // Save Orders to LocalStorage & Dispatch Sync Event
  const saveOrders = (newOrders: RestaurantOrder[]) => {
    setOrders(newOrders);
    try {
      localStorage.setItem('nn_restaurant_orders', JSON.stringify(newOrders));
    } catch (e) {}
    window.dispatchEvent(new CustomEvent('nn_data_sync'));
  };

  // Quick Table Booking Form State
  const [bookingDate, setBookingDate] = useState<string>(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  const [bookingTime, setBookingTime] = useState<string>('18:30');
  const [bookingGuests, setBookingGuests] = useState<number>(8);
  const [bookingArea, setBookingArea] = useState<string>('Khu sân vườn');
  const [bookingNotes, setBookingNotes] = useState<string>('');
  const [bookingCustomerName, setBookingCustomerName] = useState<string>('');
  const [bookingPhone, setBookingPhone] = useState<string>('');
  const [showBookingModal, setShowBookingModal] = useState<boolean>(false);
  const [bookingTicketSuccess, setBookingTicketSuccess] = useState<TableBooking | null>(null);
  const [bookingSelectedDishes, setBookingSelectedDishes] = useState<RestaurantOrderItem[]>([]);

  // Order Lookup State (By Customer Phone Number & Order Code)
  const [lookupQuery, setLookupQuery] = useState<string>('');
  const [lookupPhoneResult, setLookupPhoneResult] = useState<{
    query: string;
    orders: RestaurantOrder[];
    bookings: TableBooking[];
    duiOrders: any[];
  } | null>(null);
  const [showLookupModal, setShowLookupModal] = useState<boolean>(false);

  // Checkout Modal State
  const [showCheckoutModal, setShowCheckoutModal] = useState<boolean>(false);
  const [checkoutName, setCheckoutName] = useState<string>('');
  const [checkoutPhone, setCheckoutPhone] = useState<string>('');
  const [checkoutTable, setCheckoutTable] = useState<string>('Bàn 06 (Sân vườn)');
  const [checkoutType, setCheckoutType] = useState<'dine_in' | 'takeaway' | 'delivery'>('dine_in');
  const [checkoutAddress, setCheckoutAddress] = useState<string>('');
  const [checkoutNotes, setCheckoutNotes] = useState<string>('');
  const [checkoutSuccessOrder, setCheckoutSuccessOrder] = useState<RestaurantOrder | null>(null);

  // =========================================================================
  // DÚI QUOTE & WEIGHING WORKFLOW STATES (NGHIỆP VỤ MÓN DÚI TƯƠI SỐNG)
  // =========================================================================
  const [activeDuiQuote, setActiveDuiQuote] = useState<RestaurantOrder | null>(() => {
    try {
      const saved = localStorage.getItem('nn_active_dui_quote');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {}
    return null;
  });

  // Modal: Khách yêu cầu báo giá món Dúi
  const [showDuiQuoteModal, setShowDuiQuoteModal] = useState<boolean>(false);
  const [duiQuoteCustomerName, setDuiQuoteCustomerName] = useState<string>('');
  const [duiQuotePhone, setDuiQuotePhone] = useState<string>('');
  const [duiQuoteTable, setDuiQuoteTable] = useState<string>('Bàn 06 (Sân vườn)');
  const [duiQuoteOrderType, setDuiQuoteOrderType] = useState<'dine_in' | 'takeaway' | 'delivery'>('dine_in');
  const [duiQuoteAddress, setDuiQuoteAddress] = useState<string>('');
  const [duiQuoteNotes, setDuiQuoteNotes] = useState<string>('');
  const [duiQuoteSuccessOrder, setDuiQuoteSuccessOrder] = useState<RestaurantOrder | null>(null);

  // Modal: Admin bắt và cân dúi, nhập trọng lượng thực tế & gửi báo giá
  const [adminWeighingOrder, setAdminWeighingOrder] = useState<RestaurantOrder | null>(null);
  const [adminWeighKg, setAdminWeighKg] = useState<number>(1.8);
  const [adminPricePerKg, setAdminPricePerKg] = useState<number>(650000);
  const [adminWeighNotes, setAdminWeighNotes] = useState<string>('');

  // Modal: Khách xem báo giá tổng + quyết định (Đồng ý đặt / Chọn lại món)
  const [customerDecisionOrder, setCustomerDecisionOrder] = useState<RestaurantOrder | null>(null);

  // Sync active Dúi quote with localStorage and external events
  useEffect(() => {
    const handleSync = () => {
      try {
        const savedQuote = localStorage.getItem('nn_active_dui_quote');
        if (savedQuote) {
          const parsed = JSON.parse(savedQuote);
          setActiveDuiQuote(prev => JSON.stringify(prev) !== JSON.stringify(parsed) ? parsed : prev);
        }
        const savedOrders = localStorage.getItem('nn_restaurant_orders');
        if (savedOrders) {
          const parsed = JSON.parse(savedOrders);
          if (Array.isArray(parsed)) {
            setOrders(prev => JSON.stringify(prev) !== JSON.stringify(parsed) ? parsed : prev);
          }
        }
      } catch (e) {}
    };

    window.addEventListener('storage', handleSync);
    window.addEventListener('nn_data_sync', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('nn_data_sync', handleSync);
    };
  }, []);

  // Floor Plan / Sơ đồ bàn Modal
  const [showFloorPlanModal, setShowFloorPlanModal] = useState<boolean>(false);

  // Map Modal
  const [showMapModal, setShowMapModal] = useState<boolean>(false);

  // Manager Management Modals
  const [managerActiveTab, setManagerActiveTab] = useState<'orders' | 'bookings' | 'menu' | 'revenue' | null>(null);
  const [editMenuItem, setEditMenuItem] = useState<MenuItem | null>(null);
  const [showAddDishModal, setShowAddDishModal] = useState<boolean>(false);
  const [newDishData, setNewDishData] = useState<Partial<MenuItem>>({
    name: '',
    category: 'specialty',
    price: 350000,
    description: '',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80',
    portion: 'Phần 3-4 người',
    isSpecialty: true,
    isPopular: true,
    available: true,
    serviceType: 'restaurant'
  });

  // Calculate Cart Totals
  const duiItemsInCart = useMemo(() => {
    return cart.filter(item => {
      const menuItem = menuItems.find(m => m.id === item.menuItemId);
      if (menuItem) return checkIsDuiDish(menuItem);
      return item.name.toLowerCase().includes('dúi') || item.name.toLowerCase().includes('tiết canh');
    });
  }, [cart, menuItems]);

  const hasDuiInCart = duiItemsInCart.length > 0;

  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const discountAmount = useMemo(() => {
    if (!promoApplied || !promoCode) return 0;
    if (cartSubtotal >= 500000) {
      return 50000; // 50.000đ reduction as shown in reference or 10%
    }
    return 0;
  }, [cartSubtotal, promoApplied, promoCode]);

  const cartTotal = Math.max(0, cartSubtotal - discountAmount);

  // Edit Dish Modal & Form State
  const [editingDish, setEditingDish] = useState<MenuItem | null>(null);
  const [isNewDishModal, setIsNewDishModal] = useState<boolean>(false);
  const [editForm, setEditForm] = useState<{
    id: string;
    name: string;
    price: number;
    image: string;
    available: boolean;
    description: string;
    category: MenuItemCategory;
    portion: string;
    unit: string;
    isSpecialty: boolean;
  }>({
    id: '',
    name: '',
    price: 0,
    image: '',
    available: true,
    description: '',
    category: 'specialty',
    portion: '1 phần',
    unit: 'phần',
    isSpecialty: false
  });
  const [editDishNotification, setEditDishNotification] = useState<string | null>(null);
  const [dishToDelete, setDishToDelete] = useState<{ id: string; name: string } | null>(null);

  // Request to delete a dish with confirmation
  const handleRequestDeleteDish = (dish: { id: string; name: string }, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (userRole !== 'admin') {
      if (onOpenAdminLogin) onOpenAdminLogin();
      return;
    }
    setDishToDelete({ id: dish.id, name: dish.name });
  };

  // Confirm delete dish action
  const handleConfirmDeleteDish = () => {
    if (userRole !== 'admin') {
      if (onOpenAdminLogin) onOpenAdminLogin();
      return;
    }
    if (!dishToDelete) return;
    const dishId = dishToDelete.id;
    const dishName = dishToDelete.name;

    // Call parent handler
    if (onDeleteMenuItem) {
      onDeleteMenuItem(dishId);
    }

    // Remove from cart if it was present
    setCart(prev => prev.filter(item => item.menuItemId !== dishId && item.name !== dishName));

    // Close edit modal if currently editing this dish
    if (editingDish && editingDish.id === dishId) {
      setEditingDish(null);
      setIsNewDishModal(false);
    }

    setDishToDelete(null);
    setEditDishNotification(`Đã xóa món "${dishName}" khỏi thực đơn thành công!`);
    setTimeout(() => setEditDishNotification(null), 3500);
  };

  // Open Edit Modal for a dish
  const handleOpenEditDish = (dish: MenuItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (userRole !== 'admin') {
      if (onOpenAdminLogin) onOpenAdminLogin();
      return;
    }
    setIsNewDishModal(false);
    setEditingDish(dish);
    setEditForm({
      id: dish.id,
      name: dish.name,
      price: dish.price,
      image: dish.image,
      available: dish.available !== false,
      description: dish.description || '',
      category: dish.category || 'specialty',
      portion: dish.portion || '1 phần',
      unit: dish.unit || 'phần',
      isSpecialty: !!dish.isSpecialty
    });
  };

  // Open Modal to Create New Dish
  const handleOpenCreateDish = () => {
    if (userRole !== 'admin') {
      if (onOpenAdminLogin) onOpenAdminLogin();
      return;
    }
    const newId = `m-custom-${Date.now()}`;
    setIsNewDishModal(true);
    const initialNewDish: MenuItem = {
      id: newId,
      name: '',
      price: 150000,
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
      available: true,
      description: '',
      category: 'specialty',
      serviceType: 'restaurant',
      portion: '1 phần',
      unit: 'phần'
    };
    setEditingDish(initialNewDish);
    setEditForm({
      id: newId,
      name: '',
      price: 150000,
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
      available: true,
      description: '',
      category: 'specialty',
      portion: '1 phần',
      unit: 'phần',
      isSpecialty: false
    });
  };

  // Quick toggle availability (Còn món / Tạm hết)
  const handleToggleAvailability = (dish: MenuItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (userRole !== 'admin') {
      if (onOpenAdminLogin) onOpenAdminLogin();
      return;
    }
    const isCurrentlyAvailable = dish.available !== false;
    const updated: MenuItem = {
      ...dish,
      available: !isCurrentlyAvailable
    };
    
    const exists = menuItems.some(m => m.id === updated.id);
    if (exists) {
      onUpdateMenuItem(updated);
    } else {
      onAddMenuItem(updated);
    }

    setEditDishNotification(`Đã chuyển "${dish.name}" sang: ${updated.available ? '🟢 Còn món' : '🔴 Tạm hết món'}`);
    setTimeout(() => setEditDishNotification(null), 3000);
  };

  // Save Dish Changes
  const handleSaveEditDish = (e: React.FormEvent) => {
    e.preventDefault();
    if (userRole !== 'admin') {
      if (onOpenAdminLogin) onOpenAdminLogin();
      return;
    }
    if (!editForm.name.trim()) {
      alert('Vui lòng nhập tên món ăn!');
      return;
    }
    if (editForm.price < 0) {
      alert('Giá món ăn không hợp lệ!');
      return;
    }

    const updatedDish: MenuItem = {
      id: editForm.id,
      name: editForm.name.trim(),
      price: Number(editForm.price),
      image: editForm.image.trim() || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
      available: editForm.available,
      description: editForm.description.trim(),
      category: editForm.category,
      portion: editForm.portion.trim() || '1 phần',
      unit: editForm.unit.trim() || 'phần',
      isSpecialty: editForm.isSpecialty,
      serviceType: 'restaurant'
    };

    if (isNewDishModal) {
      onAddMenuItem(updatedDish);
      setEditDishNotification(`Đã thêm món mới: "${updatedDish.name}"`);
    } else {
      const exists = menuItems.some(m => m.id === updatedDish.id);
      if (exists) {
        onUpdateMenuItem(updatedDish);
      } else {
        onAddMenuItem(updatedDish);
      }
      setEditDishNotification(`Đã cập nhật món ăn "${updatedDish.name}" thành công!`);
    }

    setEditingDish(null);
    setIsNewDishModal(false);
    setTimeout(() => setEditDishNotification(null), 3500);
  };

  // Handle local image file upload
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert('Vui lòng chọn ảnh dung lượng dưới 3MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setEditForm(prev => ({ ...prev, image: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Add to Cart with availability check & Farm commercial stock validation
  const handleAddToCart = (dish: { id: string; name: string; price: number; image: string; available?: boolean; description?: string; category?: any }) => {
    const isDui = checkIsDuiDish(dish as MenuItem);
    if (isDui && !commercialInventory.hasStock) {
      alert(`Món "${dish.name}" hiện đang TẠM HẾT vì Trang trại Dúi KaKa (Khu Thương phẩm) đang có 0 con. Quý khách vui lòng chọn món khác hoặc liên hệ hotline để đặt trước!`);
      return;
    }

    if (dish.available === false) {
      alert(`Món "${dish.name}" hiện đang TẠM HẾT. Quý khách vui lòng chọn món khác hoặc liên hệ nhân viên!`);
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.menuItemId === dish.id || item.name === dish.name);
      if (existing) {
        return prev.map(item => 
          (item.menuItemId === dish.id || item.name === dish.name)
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          menuItemId: dish.id,
          name: dish.name,
          price: dish.price,
          quantity: 1,
          image: dish.image
        }
      ];
    });
  };

  // Handle Quantity Change
  const handleUpdateCartQty = (index: number, delta: number) => {
    setCart(prev => {
      const next = [...prev];
      const newQty = next[index].quantity + delta;
      if (newQty <= 0) {
        next.splice(index, 1);
      } else {
        next[index] = { ...next[index], quantity: newQty };
      }
      return next;
    });
  };

  // Handle Clear Cart
  const handleClearCart = () => {
    setCart([]);
  };

  // Quick Table Booking Submission
  const handleQuickBookSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Check if any selected dish is unavailable
    const unavailableInBooking = bookingSelectedDishes.filter(item => {
      const dish = menuItems.find(m => m.id === item.menuItemId || m.name === item.name);
      if (!dish) return false;
      const { isAvailable } = resolveMenuItemAvailability(dish, commercialInventory);
      return !isAvailable;
    });

    if (unavailableInBooking.length > 0) {
      alert(`Trong danh sách món đặt trước có món "${unavailableInBooking.map(i => i.name).join(', ')}" hiện quán đang báo TẠM HẾT. Quý khách vui lòng xóa món này trước khi đặt bàn!`);
      return;
    }

    const guestName = bookingCustomerName.trim() || 'Khách đặt qua Website';
    const guestPhone = bookingPhone.trim() || '0967823801';

    let finalNotes = bookingNotes.trim();
    if (bookingSelectedDishes.length > 0) {
      const dishSummary = bookingSelectedDishes.map(d => `${d.quantity}x ${d.name}`).join(', ');
      finalNotes = finalNotes ? `${finalNotes} | [Món đặt trước: ${dishSummary}]` : `[Món đặt trước: ${dishSummary}]`;
    }

    const preOrderTotal = bookingSelectedDishes.reduce((s, i) => s + (i.price * i.quantity), 0);

    const newBooking = onAddBooking({
      customerName: guestName,
      phone: guestPhone,
      bookingDate: bookingDate,
      bookingTime: bookingTime,
      guestCount: Number(bookingGuests) || 2,
      tableArea: bookingArea,
      notes: finalNotes || 'Đặt bàn nhanh qua trang chủ',
      preOrderItems: bookingSelectedDishes.length > 0 ? [...bookingSelectedDishes] : undefined,
      preOrderTotal: bookingSelectedDishes.length > 0 ? preOrderTotal : undefined,
    });

    setBookingTicketSuccess(newBooking);
    setShowBookingModal(false);
    // Reset fields
    setBookingNotes('');
    setBookingCustomerName('');
    setBookingPhone('');
    setBookingSelectedDishes([]);
  };

  // Checkout Order Submission
  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    // Check if any dish in cart is unavailable
    const unavailableInCart = cart.filter(item => {
      const menuItem = menuItems.find(m => m.id === item.menuItemId || m.name === item.name);
      if (!menuItem) return false;
      const { isAvailable } = resolveMenuItemAvailability(menuItem, commercialInventory);
      return !isAvailable;
    });

    if (unavailableInCart.length > 0) {
      alert(`Rất tiếc! Trong giỏ hàng của quý khách có món "${unavailableInCart.map(i => i.name).join(', ')}" hiện quán đang báo TẠM HẾT. Quý khách vui lòng xóa món này khỏi giỏ hàng trước khi đặt món!`);
      return;
    }

    const orderId = `ord-${Date.now()}`;
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const newOrder: RestaurantOrder = {
      id: orderId,
      code: `NN-DH-${randomCode}`,
      customerName: checkoutName.trim() || 'Khách tại quán',
      phone: checkoutPhone.trim() || '0967823801',
      tableNumber: checkoutType === 'dine_in' ? checkoutTable : undefined,
      deliveryAddress: checkoutType === 'delivery' ? checkoutAddress : undefined,
      orderType: checkoutType,
      items: [...cart],
      subtotal: cartSubtotal,
      discount: discountAmount,
      discountCode: promoApplied ? promoCode : undefined,
      total: cartTotal,
      notes: checkoutNotes,
      paymentStatus: 'paid',
      status: 'serving',
      createdAt: new Date().toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    if (onAddRestaurantOrder) {
      onAddRestaurantOrder(newOrder);
    } else {
      saveOrders([newOrder, ...orders]);
    }
    setCheckoutSuccessOrder(newOrder);
    setCart([]);
    setShowCheckoutModal(false);

    // Trigger instant chime and notification for admin
    const orderTypeLabel = newOrder.orderType === 'dine_in' 
      ? `Ăn tại bàn ${newOrder.tableNumber || ''}` 
      : newOrder.orderType === 'delivery' 
      ? 'Giao hàng tận nơi' 
      : 'Mang về (Takeaway)';

    triggerAdminNotification({
      id: `notif-${newOrder.id}`,
      type: 'order',
      title: '🛎️ Đơn Món Nhà Hàng Mới',
      message: `Khách: ${newOrder.customerName} (${newOrder.phone}) • ${newOrder.items.length} món • ${orderTypeLabel} • Tổng: ${(newOrder.total || 0).toLocaleString('vi-VN')}đ`,
      code: newOrder.code,
      customerName: newOrder.customerName,
      phone: newOrder.phone,
      amount: newOrder.total,
      view: 'restaurant',
    });
  };

  // =========================================================================
  // DÚI QUOTE WORKFLOW HANDLERS (9 BƯỚC NGHIỆP VỤ MÓN DÚI)
  // =========================================================================

  // Mở modal yêu cầu báo giá
  const handleOpenDuiQuoteModal = () => {
    setShowDuiQuoteModal(true);
  };

  // Khách bấm "NHẬN BÁO GIÁ" -> Chuyển trạng thái sang "CHỜ CÂN DÚI"
  const handleSubmitDuiQuoteRequest = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (cart.length === 0) return;

    const orderId = `dq-${Date.now()}`;
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const guestName = duiQuoteCustomerName.trim() || 'Khách đặt món Dúi tươi';
    const guestPhone = duiQuotePhone.trim() || '0967823801';

    // Lấy danh sách các món dúi đã chọn
    const duiDishes = duiItemsInCart.map(item => item.name);
    const distinctDuiCount = duiItemsInCart.reduce((sum, item) => sum + item.quantity, 0);

    // Tính tiền các món phụ khác (nước uống, rau, khai vị...) nếu có
    const nonDuiSubtotal = cart
      .filter(item => !duiItemsInCart.some(d => d.menuItemId === item.menuItemId))
      .reduce((sum, item) => sum + item.price * item.quantity, 0);

    const newQuoteOrder: RestaurantOrder = {
      id: orderId,
      code: `NN-DQ-${randomCode}`,
      customerName: guestName,
      phone: guestPhone,
      tableNumber: duiQuoteOrderType === 'dine_in' ? duiQuoteTable : undefined,
      deliveryAddress: duiQuoteOrderType === 'delivery' ? duiQuoteAddress : undefined,
      orderType: duiQuoteOrderType,
      items: [...cart],
      subtotal: nonDuiSubtotal,
      discount: 0,
      total: nonDuiSubtotal, // Chưa tính tiền dúi, chờ Admin cân
      notes: duiQuoteNotes,
      paymentStatus: 'unpaid',
      status: 'waiting_weighing', // TRẠNG THÁI 3: CHỜ CÂN DÚI
      hasDuiItems: true,
      duiDishesCount: distinctDuiCount,
      duiDishesList: duiDishes,
      createdAt: new Date().toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    const updatedOrders = [newQuoteOrder, ...orders];
    saveOrders(updatedOrders);
    setActiveDuiQuote(newQuoteOrder);
    localStorage.setItem('nn_active_dui_quote', JSON.stringify(newQuoteOrder));
    
    // Trigger instant chime and notification for admin
    triggerAdminNotification({
      id: `notif-${newQuoteOrder.id}`,
      type: 'dui_quote',
      title: '🦔 Yêu Cầu Cân Dúi & Báo Giá Mới',
      message: `Khách: ${newQuoteOrder.customerName} (${newQuoteOrder.phone}) • ${newQuoteOrder.duiDishesCount} món dúi (${newQuoteOrder.duiDishesList?.join(', ') || 'Chế biến tươi'}) • Vui lòng cân dúi & gửi báo giá`,
      code: newQuoteOrder.code,
      customerName: newQuoteOrder.customerName,
      phone: newQuoteOrder.phone,
      view: 'restaurant',
    });

    // Reset giỏ hàng và mở thông báo chờ cân
    setCart([]);
    setShowDuiQuoteModal(false);
    setDuiQuoteSuccessOrder(newQuoteOrder);
  };

  // Admin mở modal bắt và cân Dúi
  const handleOpenAdminWeighing = (order: RestaurantOrder) => {
    setAdminWeighingOrder(order);
    setAdminWeighKg(order.duiWeightKg || 1.8);
    setAdminPricePerKg(order.duiPricePerKg || 650000);
    setAdminWeighNotes(order.quoteMessage || '');
  };

  // Admin nhập trọng lượng thực tế, hệ thống tính tiền và gửi báo giá cho khách
  // CÔNG THỨC: Tổng tiền = (Trọng lượng × Giá dúi/kg) + (Số món × 250.000đ) + Món phụ khác (nếu có)
  const handleAdminSubmitQuote = () => {
    if (!adminWeighingOrder) return;

    const dishCount = adminWeighingOrder.duiDishesCount || (adminWeighingOrder.duiDishesList?.length || 1);
    const weight = Number(adminWeighKg) || 1.8;
    const pricePerKg = Number(adminPricePerKg) || 650000;
    const cookingFeePerDish = 250000; // 250.000đ/món nội bộ (không hiển thị chi tiết cho khách)

    const rawMeatCost = Math.round(weight * pricePerKg);
    const cookingTotalCost = dishCount * cookingFeePerDish;

    // Tiền các món phụ khác (nếu khách có gọi thêm nước ngọt, bia, gỏi khai vị...)
    const nonDuiCost = adminWeighingOrder.items
      ? adminWeighingOrder.items
          .filter(item => {
            const isD = menuItems.find(m => m.id === item.menuItemId);
            return isD ? !checkIsDuiDish(isD) : !item.name.toLowerCase().includes('dúi');
          })
          .reduce((sum, item) => sum + item.price * item.quantity, 0)
      : 0;

    const grandTotal = rawMeatCost + cookingTotalCost + nonDuiCost;

    const updatedOrder: RestaurantOrder = {
      ...adminWeighingOrder,
      status: 'quoted', // Chuyển trạng thái: ĐÃ BÁO GIÁ
      duiWeightKg: weight,
      duiPricePerKg: pricePerKg,
      duiCookingFeePerDish: cookingFeePerDish,
      duiRawMeatCost: rawMeatCost,
      duiCookingTotalCost: cookingTotalCost,
      subtotal: rawMeatCost + cookingTotalCost + nonDuiCost,
      total: grandTotal,
      quoteMessage: adminWeighNotes,
      adminQuotedAt: new Date().toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    const updatedOrders = orders.map(o => o.id === updatedOrder.id ? updatedOrder : o);
    saveOrders(updatedOrders);

    // Cập nhật quote active cho khách hàng
    if (activeDuiQuote && (activeDuiQuote.id === updatedOrder.id || activeDuiQuote.code === updatedOrder.code)) {
      setActiveDuiQuote(updatedOrder);
      localStorage.setItem('nn_active_dui_quote', JSON.stringify(updatedOrder));
    }

    setAdminWeighingOrder(null);
    window.dispatchEvent(new CustomEvent('nn_data_sync'));
  };

  // Khách hàng đưa ra quyết định: "ĐỒNG Ý ĐẶT" hoặc "CHỌN LẠI MÓN"
  const handleCustomerDecision = (orderId: string, decision: 'accepted' | 'reselect') => {
    const targetOrder = orders.find(o => o.id === orderId) || activeDuiQuote;
    if (!targetOrder) return;

    if (decision === 'accepted') {
      const updated: RestaurantOrder = {
        ...targetOrder,
        status: 'confirmed', // Đã duyệt đơn -> chuyển bếp chế biến
        customerDecision: 'accepted',
        notes: targetOrder.notes ? `${targetOrder.notes} (Khách đã đồng ý báo giá)` : 'Khách đã đồng ý báo giá'
      };
      const updatedOrders = orders.map(o => o.id === orderId ? updated : o);
      saveOrders(updatedOrders);
      setActiveDuiQuote(updated);
      localStorage.setItem('nn_active_dui_quote', JSON.stringify(updated));
      setCustomerDecisionOrder(null);
      window.dispatchEvent(new CustomEvent('nn_data_sync'));

      // Escalate to admin only after customer has confirmed decision
      createDecisionRequest({
        customerName: targetOrder.customerName || 'Khách quán ăn',
        phone: targetOrder.phone || '',
        module: 'restaurant',
        decisionType: 'chot_ban_an',
        title: `Khách đã chốt đặt món Dúi [${targetOrder.code}]`,
        summary: `Khách ${targetOrder.customerName} (${targetOrder.phone}) đã bấm ĐỒNG Ý ĐẶT MÓN đơn #${targetOrder.code} (${(targetOrder.total || 0).toLocaleString('vi-VN')}đ). Chuyển quản trị viên phê duyệt.`,
        customerMessage: `Khách đã xem báo giá cân dúi và bấm ĐỒNG Ý ĐẶT MÓN. Mã đơn: ${targetOrder.code}, SĐT: ${targetOrder.phone}`,
        estimatedValue: targetOrder.total || 0
      }).catch(console.error);

      triggerAdminNotification({
        id: `notif-confirmed-${targetOrder.id}`,
        type: 'order',
        title: 'CẢNH BÁO: Khách Đã Chốt Đặt Món',
        message: `Khách ${targetOrder.customerName} (${targetOrder.phone}) đã chốt đơn #${targetOrder.code} (${(targetOrder.total || 0).toLocaleString('vi-VN')}đ). Vui lòng kiểm tra duyệt phục vụ.`,
        code: targetOrder.code,
        customerName: targetOrder.customerName,
        phone: targetOrder.phone,
        amount: targetOrder.total || 0,
        view: 'restaurant'
      });
    } else {
      // Khách chọn lại món -> Hủy báo giá hiện tại để khách chọn lại từ thực đơn
      const updated: RestaurantOrder = {
        ...targetOrder,
        status: 'cancelled',
        customerDecision: 'reselect'
      };
      const updatedOrders = orders.map(o => o.id === orderId ? updated : o);
      saveOrders(updatedOrders);
      setActiveDuiQuote(null);
      localStorage.removeItem('nn_active_dui_quote');
      setCustomerDecisionOrder(null);
      window.dispatchEvent(new CustomEvent('nn_data_sync'));

      triggerAdminNotification({
        id: `notif-reselect-${targetOrder.id}`,
        type: 'order',
        title: 'Khách Chọn Lại Món',
        message: `Khách ${targetOrder.customerName} (${targetOrder.phone}) đã hủy báo giá đơn #${targetOrder.code} để chọn lại món.`,
        code: targetOrder.code,
        customerName: targetOrder.customerName,
        phone: targetOrder.phone,
        view: 'restaurant'
      });
    }
  };

  // Order & Booking Lookup Handler (Primarily by Customer Phone Number, also supports Order Code)
  const handleLookupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rawQuery = lookupQuery.trim();
    if (!rawQuery) return;

    const cleanDigits = rawQuery.replace(/[^0-9]/g, '');
    const upperCode = rawQuery.toUpperCase();

    // 1. Search restaurant orders (by phone digits or code)
    const matchedOrders = orders.filter(o => {
      const orderPhoneDigits = (o.phone || '').replace(/[^0-9]/g, '');
      const matchPhone = cleanDigits.length >= 3 && (orderPhoneDigits.includes(cleanDigits) || cleanDigits.includes(orderPhoneDigits));
      const matchCode = (o.code || '').toUpperCase().includes(upperCode);
      return matchPhone || matchCode;
    });

    // 2. Search restaurant bookings (by phone digits or code)
    const matchedBookings = bookings.filter(b => {
      const bookingPhoneDigits = (b.phone || '').replace(/[^0-9]/g, '');
      const matchPhone = cleanDigits.length >= 3 && (bookingPhoneDigits.includes(cleanDigits) || cleanDigits.includes(bookingPhoneDigits));
      const matchCode = (b.code || '').toUpperCase().includes(upperCode);
      return matchPhone || matchCode;
    });

    // 3. Search Dui breeding / commercial meat orders from localStorage
    let savedDuiOrders: any[] = [];
    try {
      const rawDui = localStorage.getItem('nn_dui_orders');
      if (rawDui) {
        const parsed = JSON.parse(rawDui);
        if (Array.isArray(parsed)) {
          savedDuiOrders = parsed;
        }
      }
    } catch (err) {}

    const matchedDui = savedDuiOrders.filter(d => {
      const duiPhoneDigits = (d.phone || '').replace(/[^0-9]/g, '');
      const matchPhone = cleanDigits.length >= 3 && (duiPhoneDigits.includes(cleanDigits) || cleanDigits.includes(duiPhoneDigits));
      const matchCode = (d.code || '').toUpperCase().includes(upperCode);
      return matchPhone || matchCode;
    });

    setLookupPhoneResult({
      query: rawQuery,
      orders: matchedOrders,
      bookings: matchedBookings,
      duiOrders: matchedDui,
    });
    setShowLookupModal(true);
  };

  // Live Today Metrics Calculation for Restaurant Management Card (Zero-Based)
  const todayStr = new Date().toISOString().split('T')[0];
  const todayOrdersList = orders.filter(o => o.status !== 'cancelled' && (o.createdAt.includes(todayStr) || o.createdAt.startsWith(todayStr)));
  const todayBookingsList = bookings.filter(b => b.status !== 'cancelled' && (b.bookingDate === todayStr || b.createdAt.startsWith(todayStr)));

  const todayOrdersRevenue = todayOrdersList.reduce((sum, o) => sum + o.total, 0);
  const todayServingBookingsRevenue = todayBookingsList
    .filter(b => b.status === 'serving' || b.status === 'completed')
    .reduce((sum, b) => {
      if (b.preOrderTotal && b.preOrderTotal > 0) return sum + b.preOrderTotal;
      return sum + (b.guestCount * 250000);
    }, 0);

  const todayTotalRestaurantRevenue = todayOrdersRevenue + todayServingBookingsRevenue;
  const todayTotalOrdersCount = todayOrdersList.length;
  const todayTotalBookingsCount = todayBookingsList.length;
  const todayTotalGuestsCount = todayBookingsList.reduce((sum, b) => sum + b.guestCount, 0);

  // 4 Featured Specialty Dishes dynamically linked to menuItems for live real-time editing
  const featuredSpecialties: (MenuItem & { badge?: string | null; rating: number; reviewCount: number })[] = useMemo(() => {
    const findDish = (id: string, nameSearch: string, fallback: MenuItem & { badge?: string | null; rating: number; reviewCount: number }) => {
      const match = menuItems.find(m => m.id === id || m.name.toLowerCase().includes(nameSearch.toLowerCase()));
      if (match) {
        return {
          ...match,
          badge: fallback.badge,
          rating: fallback.rating,
          reviewCount: fallback.reviewCount
        };
      }
      return fallback;
    };

    return [
      findDish('m-feat-01', 'nướng mọi', {
        id: 'm-feat-01',
        name: 'Dúi nướng mọi',
        category: 'specialty',
        badge: 'Đặc sản',
        description: 'Đặc sản trứ danh - Thịt thơm, ngọt, dai',
        price: 350000,
        rating: 4.9,
        reviewCount: 128,
        image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80',
        available: true,
        isSpecialty: true
      }),
      findDish('m-feat-02', 'hấp sả', {
        id: 'm-feat-02',
        name: 'Dúi hấp sả',
        category: 'specialty',
        badge: null,
        description: 'Thơm ngon, giữ trọn vị ngọt tự nhiên',
        price: 350000,
        rating: 4.8,
        reviewCount: 96,
        image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
        available: true,
        isSpecialty: true
      }),
      findDish('m-feat-03', 'xào lăn', {
        id: 'm-feat-03',
        name: 'Dúi xào lăn',
        category: 'specialty',
        badge: null,
        description: 'Đậm đà hương vị miền quê',
        price: 350000,
        rating: 4.8,
        reviewCount: 84,
        image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=600&q=80',
        available: true,
        isSpecialty: true
      }),
      findDish('m-feat-04', 'hầm thuốc bắc', {
        id: 'm-feat-04',
        name: 'Dúi hầm thuốc bắc',
        category: 'specialty',
        badge: 'Bán chạy',
        description: 'Bổ dưỡng, tốt cho sức khỏe',
        price: 400000,
        rating: 4.9,
        reviewCount: 156,
        image: 'https://images.unsplash.com/photo-1547928576-a4a33237cbc3?auto=format&fit=crop&w=600&q=80',
        available: true,
        isSpecialty: true
      })
    ];
  }, [menuItems]);

  // Filtered Menu Items
  const filteredMenuItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchSearch = searchKeyword === '' || 
        item.name.toLowerCase().includes(searchKeyword.toLowerCase()) || 
        item.description.toLowerCase().includes(searchKeyword.toLowerCase());
      
      if (!matchSearch) return false;

      if (selectedCategoryTab === 'all') return true;
      if (selectedCategoryTab === 'specialty') return item.category === 'specialty' || checkIsDuiDish(item);
      if (selectedCategoryTab === 'main') return item.category === 'main' || item.category === 'hotpot_grill';
      if (selectedCategoryTab === 'side') return item.category === 'appetizer' || item.category === 'seafood';
      if (selectedCategoryTab === 'appetizer') return item.category === 'appetizer';
      if (selectedCategoryTab === 'drink') return item.category === 'drink';
      if (selectedCategoryTab === 'dessert') return item.category === 'dessert';
      return true;
    });
  }, [menuItems, searchKeyword, selectedCategoryTab]);

  return (
    <div className="w-full min-h-screen bg-slate-100 text-slate-900 pb-16 font-sans">
      {/* 3-COLUMN MAIN DASHBOARD CONTAINER */}
      <div className="w-full max-w-[1720px] mx-auto px-2 sm:px-4 py-2 flex flex-col lg:flex-row gap-4 items-start">
        
        {/* ========================================================= */}
        {/* 1. LEFT SIDEBAR: DARK WOOD BRANDING & NAVIGATION */}
        {/* ========================================================= */}
        <aside className="w-full lg:w-[270px] shrink-0 bg-[#28130C] text-amber-50 rounded-2xl shadow-xl p-4 flex flex-col justify-between border border-amber-950/60 sticky top-20 z-20">
          <div>
            {/* Brand Logo & Tagline */}
            <div className="flex items-center gap-3 pb-4 mb-3 border-b border-amber-900/60">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-700 flex items-center justify-center text-white shadow-lg border border-amber-400/40">
                <ChefHat className="w-7 h-7 text-amber-100 drop-shadow" />
              </div>
              <div>
                <h1 className="text-base font-black tracking-wide text-white flex items-center gap-1">
                  Quán Ăn <span className="text-amber-400 font-extrabold">NGỌC NHI</span>
                </h1>
                <p className="text-[11px] text-amber-300/80 font-medium italic">
                  Hương vị quê nhà – Ngon từ tâm
                </p>
              </div>
            </div>

            {/* Navigation List */}
            <nav className="space-y-1">
              <button
                onClick={() => setActiveNav('home')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeNav === 'home'
                    ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md shadow-orange-950/40 border border-orange-400/30'
                    : 'text-amber-100/90 hover:bg-amber-950/70 hover:text-white'
                }`}
              >
                <Home className="w-4 h-4 text-amber-300" />
                <span>Trang chủ</span>
              </button>

              <button
                onClick={() => {
                  setActiveNav('menu');
                  setSelectedCategoryTab('all');
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  activeNav === 'menu'
                    ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md font-bold'
                    : 'text-amber-100/90 hover:bg-amber-950/70 hover:text-white'
                }`}
              >
                <UtensilsCrossed className="w-4 h-4 text-amber-400" />
                <span>Thực đơn</span>
              </button>

              <button
                onClick={() => {
                  setActiveNav('booking');
                  setShowBookingModal(true);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  activeNav === 'booking'
                    ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md font-bold'
                    : 'text-amber-100/90 hover:bg-amber-950/70 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span>Đặt bàn</span>
                </div>
                {bookings && bookings.length > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-extrabold shadow-xs animate-pulse">
                    {bookings.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  setActiveNav('order_online');
                  setShowCheckoutModal(true);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  activeNav === 'order_online'
                    ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md font-bold'
                    : 'text-amber-100/90 hover:bg-amber-950/70 hover:text-white'
                }`}
              >
                <Gift className="w-4 h-4 text-amber-400" />
                <span>Đặt món online</span>
              </button>

              <button
                onClick={() => setActiveNav('promotions')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  activeNav === 'promotions'
                    ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md font-bold'
                    : 'text-amber-100/90 hover:bg-amber-950/70 hover:text-white'
                }`}
              >
                <Tag className="w-4 h-4 text-amber-400" />
                <span>Ưu đãi - Khuyến mãi</span>
              </button>

              <button
                onClick={() => setActiveNav('news')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  activeNav === 'news'
                    ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md font-bold'
                    : 'text-amber-100/90 hover:bg-amber-950/70 hover:text-white'
                }`}
              >
                <FileText className="w-4 h-4 text-amber-400" />
                <span>Tin tức - Sự kiện</span>
              </button>

              <button
                onClick={() => setActiveNav('reviews')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  activeNav === 'reviews'
                    ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md font-bold'
                    : 'text-amber-100/90 hover:bg-amber-950/70 hover:text-white'
                }`}
              >
                <Star className="w-4 h-4 text-amber-400" />
                <span>Đánh giá khách hàng</span>
              </button>

              <button
                onClick={() => setShowFloorPlanModal(true)}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-amber-100/90 hover:bg-amber-950/70 hover:text-white transition-all"
              >
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <span>Giới thiệu quán</span>
              </button>

              <button
                onClick={() => setShowMapModal(true)}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-amber-100/90 hover:bg-amber-950/70 hover:text-white transition-all"
              >
                <Phone className="w-4 h-4 text-amber-400" />
                <span>Liên hệ</span>
              </button>
            </nav>

            {/* KẾT NỐI HỆ THỐNG SECTION */}
            <div className="mt-5 pt-4 border-t border-amber-900/60">
              <h4 className="text-[10px] uppercase font-bold tracking-wider text-amber-400/80 mb-2 px-1">
                KẾT NỐI HỆ THỐNG
              </h4>
              <div className="space-y-1.5">
                <button
                  onClick={() => onNavigate && onNavigate('farm')}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-amber-950/40 hover:bg-amber-900/70 text-amber-200 text-xs font-medium transition-all border border-amber-900/40 text-left"
                >
                  <span className="text-sm">🐗</span>
                  <div>
                    <p className="font-semibold text-[11px] text-white">Trang trại dúi PhanDung Farm</p>
                    <p className="text-[9px] text-amber-400">Nguồn con giống & thịt sạch</p>
                  </div>
                </button>

                <button
                  onClick={() => onNavigate && onNavigate('wedding')}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-amber-950/40 hover:bg-amber-900/70 text-amber-200 text-xs font-medium transition-all border border-amber-900/40 text-left"
                >
                  <span className="text-sm">💍</span>
                  <div>
                    <p className="font-semibold text-[11px] text-white">Dịch vụ tiệc cưới Ngọc Nhi</p>
                    <p className="text-[9px] text-amber-400">Trọn gói & Hội nghị sự kiện</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Social Media Icons */}
            <div className="flex items-center justify-around mt-4 pt-3 border-t border-amber-900/50">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center hover:scale-110 transition-transform text-xs font-bold shadow-xs">
                f
              </a>
              <a href="https://tiktok.com" target="_blank" rel="noreferrer" className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center hover:scale-110 transition-transform text-xs font-bold shadow-xs">
                ♪
              </a>
              <a href="https://zalo.me" target="_blank" rel="noreferrer" className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center hover:scale-110 transition-transform text-[9px] font-extrabold shadow-xs">
                Zalo
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center hover:scale-110 transition-transform text-xs font-bold shadow-xs">
                ▶
              </a>
            </div>
          </div>

          {/* Bottom Ambient Promo Card */}
          <div className="mt-5 relative rounded-xl overflow-hidden border border-amber-700/50 shadow-md group">
            <img 
              src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80" 
              alt="Quán ăn Ngọc Nhi"
              className="w-full h-28 object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-2.5">
              <p className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">QUÁN ĂN NGỌC NHI</p>
              <p className="text-[10px] text-white/90 font-medium">Không gian ấm cúng • Món ngon khó quên</p>
            </div>
          </div>
        </aside>

        {/* ========================================================= */}
        {/* 2. CENTER COLUMN: HERO, FEATURED DISHES & MENU */}
        {/* ========================================================= */}
        <main className="flex-1 w-full min-w-0 space-y-4">
          {/* Top Search & Information Header Bar */}
          <header className="bg-white rounded-2xl shadow-xs border border-slate-200 p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3">
            {/* Location */}
            <div className="flex items-center gap-1.5 text-xs text-slate-700">
              <MapPin className="w-4 h-4 text-orange-600 shrink-0" />
              <span className="font-medium truncate max-w-[200px] sm:max-w-xs">{SYSTEM_INFO.address}</span>
            </div>

            {/* Search Box */}
            <div className="flex-1 max-w-md min-w-[200px]">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm món ăn, đồ uống..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="w-full pl-9 pr-10 py-1.5 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all text-slate-800"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <button
                  onClick={() => setActiveNav('menu')}
                  className="absolute right-1 top-1 px-2.5 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-[10px] font-bold transition-all shadow-xs"
                >
                  <Search className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Hotline & Working Hours */}
            <div className="flex items-center gap-3">
              <a 
                href={`tel:${SYSTEM_INFO.phoneHotline}`}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 border border-orange-200 text-orange-800 hover:bg-orange-100 transition-all text-xs font-semibold"
              >
                <Phone className="w-3.5 h-3.5 text-orange-600" />
                <span>Hotline: <strong className="text-orange-700">{SYSTEM_INFO.phoneHotline}</strong></span>
              </a>

              <div className="hidden md:flex items-center gap-1 text-[11px] text-slate-500">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>06:00 - 22:00</span>
              </div>

              {/* Shopping Cart Button */}
              <button
                onClick={() => setShowCheckoutModal(true)}
                className="relative p-2 rounded-xl bg-slate-100 hover:bg-orange-50 text-slate-700 hover:text-orange-700 transition-all border border-slate-200"
                title="Xem giỏ hàng"
              >
                <ShoppingCart className="w-4 h-4" />
                {cart.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-xs animate-pulse">
                    {cart.reduce((s, i) => s + i.quantity, 0)}
                  </span>
                )}
              </button>

              {/* Manager Avatar */}
              <div 
                onClick={() => onOpenAdminLogin && onOpenAdminLogin('Đăng nhập Quản Trị Hệ Thống')}
                className="flex items-center gap-2 cursor-pointer p-1 rounded-xl hover:bg-slate-50 transition-all"
                title="Giám Đốc Ngọc Nhi"
              >
                <img
                  src={MANAGERS.ngocNhi.avatar}
                  alt="Ngọc Nhi"
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-orange-500/50"
                />
              </div>
            </div>
          </header>

          {/* CẢNH BÁO QUÁN ĂN: KHI CÓ ĐƠN ĐẶT, BÀN MỚI HOẶC QUYẾT ĐỊNH CHỐT TỪ KHÁCH HÀNG */}
          {(bookings.filter(b => b.status === 'new').length + orders.filter(o => o.status === 'pending' || o.status === 'waiting_weighing' || (o.status as string) === 'weighing_required').length + restaurantPendingDecisions.length) > 0 && (
            <div className="rounded-2xl p-4 bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-amber-500/25 border-2 border-amber-500 text-slate-900 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in duration-300">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-sm animate-bounce">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider animate-pulse">
                      Cảnh Báo Quán Ăn
                    </span>
                    <span className="text-xs sm:text-sm font-extrabold text-slate-900">
                      Có {bookings.filter(b => b.status === 'new').length + orders.filter(o => o.status === 'pending' || o.status === 'waiting_weighing' || (o.status as string) === 'weighing_required').length + restaurantPendingDecisions.length} yêu cầu chốt đặt / đơn món cần phê duyệt tiếp nhận
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-700 font-medium">
                    Khách hàng đã xác nhận chốt đặt ({bookings.filter(b => b.status === 'new').length} bàn mới, {orders.filter(o => o.status === 'pending' || o.status === 'waiting_weighing').length} đơn món, {restaurantPendingDecisions.length} yêu cầu chốt). Vui lòng kiểm tra và duyệt phục vụ.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    if (orders.some(o => o.status === 'waiting_weighing')) {
                      const firstWaiting = orders.find(o => o.status === 'waiting_weighing');
                      if (firstWaiting) handleOpenAdminWeighing(firstWaiting);
                    } else {
                      setActiveNav('manager');
                    }
                  }}
                  className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                >
                  <span>Xem & Duyệt Ngay</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Active Customer Booking Notification Banner */}
          {bookings && bookings.length > 0 && (
            <div className="rounded-2xl p-4 bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 border-2 border-amber-500/60 text-white shadow-lg space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold shrink-0 border border-amber-500/40">
                    <UtensilsCrossed className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-black text-amber-300 bg-black/50 px-2 py-0.5 rounded-md text-xs border border-amber-500/40">
                        #{bookings[0].code}
                      </span>
                      <h4 className="text-sm font-bold text-white">
                        Lịch Đặt Bàn Của Quý Khách Đã Tiếp Nhận Thành Công
                      </h4>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        bookings[0].status === 'new' 
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                          : bookings[0].status === 'confirmed'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : bookings[0].status === 'serving'
                          ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                          : 'bg-slate-700 text-slate-300 border-slate-600'
                      }`}>
                        {bookings[0].status === 'new' ? '⚡ Mới tiếp nhận • Quán đang chuẩn bị' :
                         bookings[0].status === 'confirmed' ? '✓ Đã xác nhận bàn • Sẵn sàng đón' :
                         bookings[0].status === 'serving' ? 'Đang phục vụ tại bàn' :
                         bookings[0].status === 'completed' ? 'Đã hoàn tất' : 'Đã hủy'}
                      </span>
                    </div>
                    <div className="text-xs text-amber-200/90 mt-1 flex items-center gap-2 flex-wrap">
                      <span>👤 <strong>{bookings[0].customerName}</strong> ({bookings[0].phone})</span>
                      <span>•</span>
                      <span>⏰ <strong>{bookings[0].bookingTime}</strong> ngày <strong>{bookings[0].bookingDate}</strong></span>
                      <span>•</span>
                      <span>👥 <strong>{bookings[0].guestCount}</strong> khách ({bookings[0].tableArea || 'Sân vườn'})</span>
                      {bookings[0].tableNumber && (
                        <span className="font-bold text-amber-200 bg-amber-900/60 px-2 py-0.5 rounded border border-amber-500/30 text-[11px]">
                          Bàn số: {bookings[0].tableNumber}
                        </span>
                      )}
                      {bookings[0].preOrderItems && bookings[0].preOrderItems.length > 0 && (
                        <span className="font-bold text-orange-300 bg-orange-950/80 px-2 py-0.5 rounded border border-orange-500/30 text-[11px]">
                          🍲 Đặt trước {bookings[0].preOrderItems.length} món
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setShowBookingModal(true)}
                    className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <span>+ Đặt thêm bàn</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Hero Banner Carousel (Culinary Theme) */}
          <div className="relative rounded-2xl overflow-hidden shadow-lg border border-amber-950/20 bg-gradient-to-r from-[#1C0D08] via-[#33180F] to-[#261009] min-h-[220px] sm:min-h-[260px] flex items-center p-6 sm:p-8 text-white">
            {/* Background image overlay */}
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay"
              style={{ backgroundImage: `url('https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=80')` }}
            />

            <div className="relative z-10 max-w-xl space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-600/90 text-white text-[11px] font-bold tracking-wide shadow-xs border border-orange-400/40">
                <Flame className="w-3.5 h-3.5 text-amber-300" />
                <span>Ẩm Thực Đặc Sản Núi Rừng Nam Bộ</span>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black tracking-tight text-white drop-shadow">
                  Quán Ăn <span className="text-amber-400">NGỌC NHI</span>
                </h2>
                <p className="text-sm sm:text-base text-amber-200 font-medium italic mt-0.5">
                  Đặc sản dúi – Hương vị núi rừng
                </p>
              </div>

              {/* 4 Value Checkmarks */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 pt-1 text-xs text-amber-100 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Nguyên liệu tươi ngon</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Chế biến sạch sẽ</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Không gian thoáng mát</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Phục vụ tận tâm</span>
                </div>
              </div>
            </div>

            {/* Slider Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
              <span className="w-6 h-1.5 rounded-full bg-orange-500"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/40"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/40"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/40"></span>
            </div>
          </div>

          {/* 4 Highlight Value Props Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white p-3 rounded-2xl shadow-xs border border-slate-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Thực đơn phong phú</p>
                <p className="text-[10px] text-slate-500">Hơn 50+ món ngon</p>
              </div>
            </div>

            <div 
              onClick={() => setShowBookingModal(true)}
              className="bg-white p-3 rounded-2xl shadow-xs border border-slate-200 flex items-center gap-3 cursor-pointer hover:border-orange-300 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Đặt bàn nhanh</p>
                <p className="text-[10px] text-slate-500">Giữ chỗ ưu tiên</p>
              </div>
            </div>

            <div className="bg-white p-3 rounded-2xl shadow-xs border border-slate-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Giao món tận nơi</p>
                <p className="text-[10px] text-slate-500">Trong bán kính 10km</p>
              </div>
            </div>

            <div 
              onClick={() => setActiveNav('promotions')}
              className="bg-white p-3 rounded-2xl shadow-xs border border-slate-200 flex items-center gap-3 cursor-pointer hover:border-orange-300 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Ưu đãi hấp dẫn</p>
                <p className="text-[10px] text-slate-500">Nhiều chương trình hot</p>
              </div>
            </div>
          </div>

          {/* Live Farm Commercial Zone (Khu Thương Phẩm) Synchronization Banner - ADMIN ONLY */}
          {userRole === 'admin' && (
            <div className={`p-4 rounded-2xl border transition-all ${
              commercialInventory.hasStock 
                ? 'bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 border-emerald-500/40 text-white shadow-md' 
                : 'bg-gradient-to-r from-rose-950 via-slate-900 to-amber-950 border-rose-500/50 text-white shadow-md'
            }`}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-xl border shadow-inner ${
                    commercialInventory.hasStock 
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' 
                      : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                  }`}>
                    🦔
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${commercialInventory.hasStock ? 'bg-emerald-400 animate-ping' : 'bg-rose-500 animate-pulse'}`}></span>
                        Đồng bộ Trang trại Dúi KaKa (Khu Thương Phẩm)
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                        commercialInventory.hasStock 
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40' 
                          : 'bg-rose-500/20 text-rose-300 border-rose-400/40'
                      }`}>
                        {commercialInventory.hasStock ? `Còn ${commercialInventory.totalDuiCount} con` : 'Tạm hết 0 con'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 mt-1 font-medium leading-relaxed">
                      {commercialInventory.hasStock
                        ? `Trang trại hiện có sẵn ${commercialInventory.totalDuiCount} con Dúi sống đạt chuẩn thương phẩm tại ${commercialInventory.activeCageCount} ô chuồng. Thực đơn các món Dúi luôn tươi ngon chuẩn vị!`
                        : 'Khu Thương phẩm tại trang trại hiện đang có 0 con. Toàn bộ các món Dúi đã được hệ thống tự động khóa tạm ngưng để đảm bảo tính minh bạch!'}
                    </p>
                  </div>
                </div>

                {onNavigate && (
                  <button
                    type="button"
                    onClick={() => onNavigate('farm')}
                    className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 border border-amber-400/30 shrink-0 self-end sm:self-center shadow-xs cursor-pointer active:scale-95"
                    title="Chuyển sang phân hệ Quản lý trang trại Dúi để xem chi tiết các ô chuồng Khu Thương Phẩm"
                  >
                    <span>Xem ô chuồng trại</span>
                    <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Danh mục món ăn Tabs */}
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900">Danh mục món ăn</h3>
              <button 
                onClick={() => setSelectedCategoryTab('all')}
                className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-0.5"
              >
                <span>Xem tất cả</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: 'all', label: 'Tất cả' },
                { id: 'specialty', label: 'Món đặc biệt' },
                { id: 'main', label: 'Món chính' },
                { id: 'side', label: 'Món phụ' },
                { id: 'appetizer', label: 'Khai vị' },
                { id: 'drink', label: 'Đồ uống' },
                { id: 'dessert', label: 'Tráng miệng' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategoryTab(tab.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCategoryTab === tab.id
                      ? 'bg-orange-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Món ngon đặc biệt Section (4 Featured items matching image) */}
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900">Món ngon đặc biệt</h3>
                <span className="px-2 py-0.5 rounded-md bg-orange-100 text-orange-800 text-[10px] font-bold">
                  Bản sắc Ngọc Nhi
                </span>
              </div>
              <button 
                onClick={() => setSelectedCategoryTab('specialty')}
                className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-0.5"
              >
                <span>Xem tất cả</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 4 Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
              {featuredSpecialties.map(dish => {
                const isDui = checkIsDuiDish(dish);
                const isDuiInStock = commercialInventory.hasStock && commercialInventory.totalDuiCount > 0;
                const isAvailable = (dish.available !== false) && (isDui ? isDuiInStock : true);

                return (
                  <div 
                    key={dish.id}
                    className={`bg-white rounded-xl border overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group relative ${
                      isAvailable ? 'border-slate-200 hover:border-orange-300' : 'border-red-200 bg-slate-50/70'
                    }`}
                  >
                    {/* Image container */}
                    <div className="relative h-40 overflow-hidden bg-slate-100">
                      <img 
                        src={dish.image} 
                        alt={dish.name}
                        className={`w-full h-full object-cover transition-transform duration-300 ${
                          isAvailable ? 'group-hover:scale-105' : 'grayscale-50 opacity-75'
                        }`}
                      />
                      
                      {/* Top Badges */}
                      <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                        {/* Status Badge: Simple 'Còn hàng' or 'Tạm hết' */}
                        {!isAvailable ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black text-white bg-red-600 shadow-md flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                            Tạm hết
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold text-emerald-800 bg-emerald-100/90 shadow-2xs backdrop-blur-xs flex items-center gap-1 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                            Còn hàng
                          </span>
                        )}

                        {/* Quick Edit & Delete Trigger Buttons - ADMIN ONLY */}
                        {userRole === 'admin' && (
                          <div className="pointer-events-auto flex items-center gap-1">
                            <button
                              type="button"
                              onClick={(e) => handleOpenEditDish(dish, e)}
                              className="p-1.5 rounded-lg bg-black/60 hover:bg-orange-600 text-white backdrop-blur-xs shadow-md transition-all flex items-center gap-1 text-[10px] font-bold active:scale-95 cursor-pointer"
                              title="Chỉnh sửa món ăn (Tên, Ảnh, Giá, Tình trạng)"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Sửa</span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleRequestDeleteDish(dish, e)}
                              className="p-1.5 rounded-lg bg-black/60 hover:bg-red-600 text-white backdrop-blur-xs shadow-md transition-all flex items-center text-[10px] font-bold active:scale-95 cursor-pointer"
                              title="Xóa món ăn này khỏi thực đơn"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Out of Stock Overlay Text */}
                      {!isAvailable && (
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
                          <span className="px-3 py-1 rounded-full bg-red-600 text-white text-xs font-black tracking-wider uppercase shadow-lg border border-white/30 text-center">
                            Tạm hết
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Body content */}
                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-1.5">
                          <h4 className="text-sm font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                            {dish.name}
                          </h4>
                          {userRole === 'admin' && (
                            <button
                              type="button"
                              onClick={(e) => handleToggleAvailability(dish, e)}
                              className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold shrink-0 transition-colors cursor-pointer ${
                                isAvailable ? 'text-emerald-700 bg-emerald-50 hover:bg-red-50 hover:text-red-600' : 'text-red-600 hover:text-emerald-600 bg-red-50'
                              }`}
                              title={isAvailable ? "Nhấn để chuyển sang Tạm hết" : "Nhấn để chuyển sang Còn hàng"}
                            >
                              {isAvailable ? 'Còn' : 'Hết'}
                            </button>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 min-h-[30px]">
                          {dish.description}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-100">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            {isDui ? (
                              <div className="flex items-center gap-1 text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                                <Scale className="w-3 h-3 text-amber-600 shrink-0" />
                                <span className="text-[11px] font-bold">Cân sống • Báo giá sau cân</span>
                              </div>
                            ) : (
                              <div>
                                <span className="text-sm font-extrabold text-orange-600">
                                  {dish.price.toLocaleString('vi-VN')}đ
                                </span>
                                <span className="text-[10px] text-slate-400 ml-1">/{dish.unit || 'phần'}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                            <span>{dish.rating}</span>
                            <span className="text-[10px] text-slate-400 font-normal">({dish.reviewCount})</span>
                          </div>
                        </div>

                        {/* Action Buttons Row */}
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleAddToCart(dish)}
                            disabled={!isAvailable}
                            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 active:scale-95 ${
                              isAvailable
                                ? isDui
                                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white cursor-pointer'
                                  : 'bg-orange-600 hover:bg-orange-700 text-white cursor-pointer'
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            }`}
                          >
                            {isAvailable ? (
                              isDui ? (
                                <>
                                  <Scale className="w-3.5 h-3.5" />
                                  <span>+ Chọn món Dúi</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>+ Thêm vào giỏ</span>
                                </>
                              )
                            ) : (
                              <>
                                <AlertCircle className="w-3.5 h-3.5" />
                                <span>Tạm hết</span>
                              </>
                            )}
                          </button>

                          {userRole === 'admin' && (
                            <button
                              type="button"
                              onClick={(e) => handleOpenEditDish(dish, e)}
                              className="px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-orange-50 text-slate-600 hover:text-orange-600 text-xs font-bold border border-slate-200 transition-colors cursor-pointer"
                              title="Sửa tên, giá, ảnh, trạng thái"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Full Menu Grid (Dynamic Filter or Menu Tab) */}
          {(selectedCategoryTab !== 'all' || activeNav === 'menu') && (
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">
                    Danh sách thực đơn ({filteredMenuItems.length} món)
                  </h3>
                  {selectedCategoryTab !== 'all' && (
                    <span className="px-2 py-0.5 rounded-md bg-orange-100 text-orange-800 text-[10px] font-bold">
                      Đang lọc danh mục
                    </span>
                  )}
                </div>
                {userRole === 'admin' && (
                  <button
                    onClick={handleOpenCreateDish}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Thêm món mới</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {filteredMenuItems.map(dish => {
                  const isDui = checkIsDuiDish(dish);
                  const isDuiInStock = commercialInventory.hasStock && commercialInventory.totalDuiCount > 0;
                  const isAvailable = (dish.available !== false) && (isDui ? isDuiInStock : true);

                  return (
                    <div 
                      key={dish.id} 
                      className={`p-2.5 rounded-xl border transition-all flex gap-3 relative group ${
                        isAvailable ? 'border-slate-200 hover:border-orange-300 bg-white' : 'border-red-200 bg-slate-50/80'
                      }`}
                    >
                      <div className="relative w-18 h-18 rounded-lg overflow-hidden shrink-0 bg-slate-100">
                        <img 
                          src={dish.image} 
                          alt={dish.name} 
                          className={`w-full h-full object-cover ${!isAvailable ? 'grayscale-50 opacity-70' : ''}`} 
                        />
                        {!isAvailable && (
                          <span className="absolute bottom-0 inset-x-0 bg-red-600 text-white text-[8px] font-black text-center py-0.5">
                            TẠM HẾT
                          </span>
                        )}
                        {isAvailable && (
                          <span className="absolute top-0 right-0 bg-emerald-700 text-white text-[8px] font-bold px-1 rounded-bl">
                            Còn hàng
                          </span>
                        )}
                      </div>

                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-1">
                            <h5 className="text-xs font-bold text-slate-800 line-clamp-1">{dish.name}</h5>
                            {userRole === 'admin' && (
                              <div className="flex items-center gap-0.5">
                                <button
                                  type="button"
                                  onClick={(e) => handleOpenEditDish(dish, e)}
                                  className="p-1 rounded-md text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition-colors cursor-pointer"
                                  title="Sửa món ăn này"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => handleRequestDeleteDish(dish, e)}
                                  className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                  title="Xóa món ăn này khỏi thực đơn"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 line-clamp-1">{dish.description}</p>
                        </div>

                        <div className="flex items-center justify-between mt-1">
                          <div>
                            {isDui ? (
                              <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                                <Scale className="w-3 h-3 text-amber-600" />
                                Báo giá sau cân
                              </span>
                            ) : (
                              <div>
                                <span className="text-xs font-extrabold text-orange-600">
                                  {dish.price.toLocaleString('vi-VN')}đ
                                </span>
                                <span className="text-[9px] text-slate-400 ml-0.5">/{dish.unit || 'phần'}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            {userRole === 'admin' && (
                              <button
                                type="button"
                                onClick={(e) => handleToggleAvailability(dish, e)}
                                className={`px-1.5 py-0.5 rounded text-[9px] font-bold cursor-pointer ${
                                  isAvailable 
                                    ? 'bg-emerald-50 text-emerald-700 hover:bg-red-50 hover:text-red-700' 
                                    : 'bg-red-100 text-red-700 hover:bg-emerald-50 hover:text-emerald-700'
                                }`}
                                title={isAvailable ? "Nhấn để đánh dấu Tạm hết" : "Nhấn để đánh dấu Còn hàng"}
                              >
                                {isAvailable ? '🟢 Còn' : '🔴 Hết'}
                              </button>
                            )}

                            <button
                              onClick={() => handleAddToCart(dish)}
                              disabled={!isAvailable}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                isAvailable
                                  ? isDui
                                    ? 'bg-amber-100 hover:bg-amber-600 text-amber-800 hover:text-white'
                                    : 'bg-orange-50 hover:bg-orange-600 text-orange-600 hover:text-white'
                                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                              }`}
                              title={isAvailable ? (isDui ? "Chọn món Dúi tươi" : "Thêm vào giỏ") : "Món đang tạm hết"}
                            >
                              {isDui ? <Scale className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Khách hàng nói gì về chúng tôi (Testimonials) */}
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="text-sm font-bold text-slate-900">Khách hàng nói gì về chúng tôi</h3>
              <span className="text-xs font-semibold text-orange-600 cursor-pointer hover:underline">Xem tất cả &gt;</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold text-xs">
                    HM
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-800">Hoàng Minh</h5>
                    <div className="flex text-amber-500 text-xs">
                      {'★'.repeat(5)}
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600 italic">
                  "Món ăn rất ngon, không gian thoáng mát, phục vụ nhiệt tình. Sẽ quay lại nhiều lần!"
                </p>
                <span className="text-[9px] text-slate-400 block mt-2">28/08/2026</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold text-xs">
                    TH
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-800">Thu Hương</h5>
                    <div className="flex text-amber-500 text-xs">
                      {'★'.repeat(5)}
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600 italic">
                  "Dúi nướng mọi ăn rất ngon, đặc sản thực sự. Quán sạch sẽ, giá cả hợp lý."
                </p>
                <span className="text-[9px] text-slate-400 block mt-2">27/08/2026</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                    QB
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-800">Quốc Bảo</h5>
                    <div className="flex text-amber-500 text-xs">
                      {'★'.repeat(5)}
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600 italic">
                  "Tổ chức tiệc sinh nhật ở đây rất tuyệt vời. Không gian đẹp, món ăn chất lượng!"
                </p>
                <span className="text-[9px] text-slate-400 block mt-2">26/08/2026</span>
              </div>
            </div>
          </div>
        </main>

        {/* ========================================================= */}
        {/* 3. RIGHT SIDEBAR: BOOKING, CART, PROMO & MANAGEMENT WIDGETS */}
        {/* ========================================================= */}
        <aside className="w-full lg:w-[320px] shrink-0 space-y-3.5">
          
          {/* WIDGET 1: ĐẶT BÀN NHANH */}
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-orange-600" />
                <span>Đặt bàn nhanh</span>
              </h3>
              <button 
                onClick={() => setShowFloorPlanModal(true)}
                className="text-[11px] text-orange-600 hover:text-orange-700 font-semibold"
              >
                Xem sơ đồ bàn &gt;
              </button>
            </div>

            <form onSubmit={handleQuickBookSubmit} className="space-y-2.5">
              {/* Date */}
              <div className="relative">
                <input
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 text-slate-800 font-medium focus:ring-2 focus:ring-orange-500"
                />
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              </div>

              {/* Time */}
              <div className="relative">
                <select
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 text-slate-800 font-medium focus:ring-2 focus:ring-orange-500"
                >
                  <option value="11:00">11:00 (Trưa)</option>
                  <option value="11:30">11:30 (Trưa)</option>
                  <option value="12:00">12:00 (Trưa)</option>
                  <option value="17:30">17:30 (Chiều)</option>
                  <option value="18:00">18:00 (Tối)</option>
                  <option value="18:30">18:30 (Tối cao điểm)</option>
                  <option value="19:00">19:00 (Tối)</option>
                  <option value="19:30">19:30 (Tối)</option>
                  <option value="20:00">20:00 (Tối muộn)</option>
                </select>
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              </div>

              {/* Guests */}
              <div className="relative">
                <select
                  value={bookingGuests}
                  onChange={(e) => setBookingGuests(Number(e.target.value))}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 text-slate-800 font-medium focus:ring-2 focus:ring-orange-500"
                >
                  {[2, 4, 6, 8, 10, 12, 15, 20, 30].map(g => (
                    <option key={g} value={g}>{g} người</option>
                  ))}
                </select>
                <Users className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              </div>

              {/* Space Area */}
              <div className="relative">
                <select
                  value={bookingArea}
                  onChange={(e) => setBookingArea(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 text-slate-800 font-medium focus:ring-2 focus:ring-orange-500"
                >
                  <option value="Khu sân vườn">Khu sân vườn thoáng mát</option>
                  <option value="Phòng VIP Hoàng Gia">Phòng VIP Hoàng Gia riêng tư</option>
                  <option value="Sảnh chính ẩm thực">Sảnh chính ẩm thực ấm cúng</option>
                  <option value="Chòi lá sinh thái">Chòi lá sinh thái view hồ</option>
                </select>
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              </div>

              {/* Customer Name & Phone */}
              <div className="grid grid-cols-2 gap-1.5">
                <input
                  type="text"
                  placeholder="Tên của bạn"
                  value={bookingCustomerName}
                  onChange={(e) => setBookingCustomerName(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 text-slate-800 focus:ring-2 focus:ring-orange-500"
                />
                <input
                  type="tel"
                  placeholder="Số điện thoại"
                  value={bookingPhone}
                  onChange={(e) => setBookingPhone(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 text-slate-800 focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Pre-order Dishes Trigger Section */}
              <div className="space-y-1.5 pt-0.5">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(true)}
                  className="w-full py-2 px-2.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-950 text-xs font-bold border border-orange-200 flex items-center justify-between transition-all"
                >
                  <span className="flex items-center gap-1.5 truncate">
                    <UtensilsCrossed className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                    <span className="truncate">
                      {bookingSelectedDishes.length > 0 
                        ? `Đã chọn ${bookingSelectedDishes.length} món (${bookingSelectedDishes.reduce((s, i) => s + (i.price * i.quantity), 0).toLocaleString('vi-VN')}đ)`
                        : 'Chọn món lên trước khi đến'}
                    </span>
                  </span>
                  <span className="text-[11px] text-orange-600 underline shrink-0">
                    {bookingSelectedDishes.length > 0 ? 'Sửa' : '+ Món'}
                  </span>
                </button>

                {/* Quick Attach from Cart */}
                {cart.length > 0 && bookingSelectedDishes.length === 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const validItems = cart.filter(c => {
                        const dish = menuItems.find(m => m.id === c.menuItemId || m.name === c.name);
                        if (!dish) return true;
                        const { isAvailable } = resolveMenuItemAvailability(dish, commercialInventory);
                        return isAvailable;
                      });
                      if (validItems.length < cart.length) {
                        alert(`Đã tự động loại bỏ ${cart.length - validItems.length} món do quán đang báo TẠM HẾT.`);
                      }
                      if (validItems.length === 0) {
                        alert('Các món trong giỏ hàng hiện tại đều đang tạm hết tại quán.');
                        return;
                      }
                      setBookingSelectedDishes(validItems);
                    }}
                    className="w-full py-1.5 px-2 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-[10px] font-bold flex items-center justify-center gap-1 transition-colors border border-amber-300"
                  >
                    <ShoppingBag className="w-3 h-3 text-amber-700" />
                    <span>Lấy món đang phục vụ từ Giỏ ({cart.length})</span>
                  </button>
                )}

                {bookingSelectedDishes.length > 0 && (
                  <div className="p-2 rounded-xl bg-amber-50/80 border border-amber-200 text-[11px] space-y-1">
                    <div className="flex items-center justify-between text-amber-900 text-[10px] font-bold">
                      <span>Món đặt trước ({bookingSelectedDishes.length}):</span>
                      <button 
                        type="button" 
                        onClick={() => setBookingSelectedDishes([])}
                        className="text-red-500 hover:underline font-normal"
                      >
                        Bỏ chọn
                      </button>
                    </div>
                    <div className="max-h-16 overflow-y-auto space-y-0.5">
                      {bookingSelectedDishes.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-slate-700 text-[10px]">
                          <span className="truncate max-w-[130px]">{item.quantity}x {item.name}</span>
                          <span className="font-mono text-orange-800">{(item.price * item.quantity).toLocaleString('vi-VN')}đ</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Notes */}
              <input
                type="text"
                placeholder="Ghi chú (nếu có)"
                value={bookingNotes}
                onChange={(e) => setBookingNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 text-slate-800 focus:ring-2 focus:ring-orange-500"
              />

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Calendar className="w-4 h-4" />
                <span>Đặt bàn ngay</span>
              </button>
            </form>

            {/* Booking Ticket Alert if newly booked */}
            {bookingTicketSuccess && (
              <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs animate-fadeIn space-y-1.5">
                <div className="flex items-center justify-between font-bold text-emerald-800">
                  <span>✓ Đặt bàn thành công!</span>
                  <button onClick={() => setBookingTicketSuccess(null)} className="text-slate-400 hover:text-slate-600">✕</button>
                </div>
                <p className="text-[11px]">Mã bàn: <strong className="font-mono">{bookingTicketSuccess.code}</strong></p>
                {bookingTicketSuccess.preOrderItems && bookingTicketSuccess.preOrderItems.length > 0 && (
                  <div className="pt-1 border-t border-emerald-200/60 text-[10px] space-y-0.5">
                    <p className="font-bold text-emerald-950">
                      Món đặt trước ({bookingTicketSuccess.preOrderItems.length} món): {(bookingTicketSuccess.preOrderTotal || 0).toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                )}
                <p className="text-[10px] text-emerald-700">Dữ liệu đã tự động đồng bộ sang Trung Tâm Điều Hành.</p>
              </div>
            )}
          </div>

          {/* WIDGET 2: GIỎ HÀNG CỦA BẠN */}
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <ShoppingCart className="w-4 h-4 text-orange-600" />
                <span>Giỏ hàng của bạn</span>
              </h3>
              {cart.length > 0 && (
                <button
                  onClick={handleClearCart}
                  className="text-[11px] text-red-600 hover:text-red-700 font-semibold"
                >
                  Xóa tất cả
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs">
                <ShoppingBag className="w-8 h-8 mx-auto mb-1.5 opacity-40 text-slate-300" />
                <p>Giỏ hàng đang trống</p>
                <p className="text-[10px] text-slate-400">Chọn món ngon từ thực đơn để thêm vào giỏ</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {/* Cart Items List */}
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {cart.map((item, idx) => {
                    const menuItem = menuItems.find(m => m.id === item.menuItemId || m.name === item.name);
                    const isDui = menuItem ? checkIsDuiDish(menuItem) : checkIsDuiDish({ name: item.name, category: 'specialty' } as any);
                    const availability = menuItem ? resolveMenuItemAvailability(menuItem, commercialInventory) : { isAvailable: true, reason: '' };
                    const isOutStock = !availability.isAvailable;

                    return (
                      <div key={idx} className={`flex items-center justify-between gap-2 p-2 rounded-lg border ${
                        isOutStock
                          ? 'bg-rose-50/90 border-rose-300 ring-1 ring-rose-200'
                          : isDui 
                          ? 'bg-amber-50/70 border-amber-200/80' 
                          : 'bg-slate-50 border-slate-100'
                      }`}>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1 flex-wrap">
                            {isDui && <Scale className="w-3 h-3 text-amber-600 shrink-0" />}
                            <p className={`text-xs font-bold truncate ${isOutStock ? 'text-rose-900 line-through' : 'text-slate-800'}`}>
                              {item.name}
                            </p>
                            {isOutStock && (
                              <span className="text-[9px] bg-rose-600 text-white font-black px-1.5 py-0.2 rounded uppercase tracking-wider shrink-0">
                                Tạm hết
                              </span>
                            )}
                          </div>
                          <p className={`text-[10px] ${isOutStock ? 'text-rose-600 font-semibold' : 'text-slate-500'}`}>
                            {isOutStock 
                              ? (availability.reason || 'Quán đang báo tạm hết món') 
                              : isDui 
                              ? 'Cân sống tại chuồng (chờ báo giá)' 
                              : `${item.price.toLocaleString('vi-VN')}đ`}
                          </p>
                        </div>

                        {/* Quantity Controls / Remove if out of stock */}
                        {isOutStock ? (
                          <button
                            onClick={() => handleUpdateCartQty(idx, -item.quantity)}
                            title="Xóa món tạm hết"
                            className="text-xs text-rose-600 hover:text-rose-800 font-bold px-2 py-1 bg-white rounded-md border border-rose-200 flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Xóa</span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-1.5 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                            <button
                              onClick={() => handleUpdateCartQty(idx, -1)}
                              className="text-slate-500 hover:text-red-600 font-bold text-xs"
                            >
                              -
                            </button>
                            <span className="text-xs font-bold text-slate-800 min-w-[14px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleUpdateCartQty(idx, 1)}
                              className="text-slate-500 hover:text-orange-600 font-bold text-xs"
                            >
                              +
                            </button>
                          </div>
                        )}

                        {/* Line Total */}
                        {!isOutStock && (
                          <div className="shrink-0 min-w-[65px] text-right">
                            {isDui ? (
                              <span className="text-[10px] font-bold text-amber-700 bg-amber-100/70 px-1.5 py-0.5 rounded">
                                Chờ báo giá
                              </span>
                            ) : (
                              <span className="text-xs font-bold text-slate-900">
                                {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Unavailable Dishes Alert in Cart */}
                {(() => {
                  const unavailableInCart = cart.filter(item => {
                    const menuItem = menuItems.find(m => m.id === item.menuItemId || m.name === item.name);
                    if (!menuItem) return false;
                    const { isAvailable } = resolveMenuItemAvailability(menuItem, commercialInventory);
                    return !isAvailable;
                  });

                  if (unavailableInCart.length === 0) return null;

                  return (
                    <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-xs space-y-1.5 animate-pulse">
                      <div className="flex items-center gap-1.5 font-bold text-rose-700">
                        <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                        <span>Có {unavailableInCart.length} món quán báo TẠM HẾT:</span>
                      </div>
                      <p className="text-[11px] text-rose-700 leading-tight">
                        {unavailableInCart.map(u => u.name).join(', ')}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setCart(prev => prev.filter(c => {
                            const m = menuItems.find(x => x.id === c.menuItemId || x.name === c.name);
                            if (!m) return true;
                            const { isAvailable } = resolveMenuItemAvailability(m, commercialInventory);
                            return isAvailable;
                          }));
                        }}
                        className="w-full py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Xóa các món tạm hết khỏi giỏ</span>
                      </button>
                    </div>
                  );
                })()}

                {/* Dui Alert info if present */}
                {hasDuiInCart && (
                  <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-1.5">
                    <Scale className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Đang có {duiItemsInCart.length} món Dúi tươi sống</p>
                      <p className="text-[10px] text-amber-700">Giá phụ thuộc vào cân nặng thực tế. Bấm "NHẬN BÁO GIÁ" để chuyển sang trạng thái <strong>CHỜ CÂN DÚI</strong>.</p>
                    </div>
                  </div>
                )}

                {/* Subtotal & Discount breakdown */}
                <div className="pt-2 border-t border-slate-100 space-y-1 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Tạm tính (món phụ):</span>
                    <span className="font-semibold text-slate-800">{cartSubtotal.toLocaleString('vi-VN')}đ</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 items-center">
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        <span className="text-[11px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-mono font-bold">
                          {promoCode}
                        </span>
                      </span>
                      <span className="font-semibold">-{discountAmount.toLocaleString('vi-VN')}đ</span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-1 border-t border-slate-200">
                    <span>{hasDuiInCart ? 'Tổng tiền tạm tính:' : 'Tổng cộng:'}</span>
                    <span className="text-orange-600 font-black">
                      {hasDuiInCart && cartTotal === 0 ? 'Báo giá sau cân Dúi' : `${cartTotal.toLocaleString('vi-VN')}đ`}
                    </span>
                  </div>
                </div>

                {/* Action Button: NHẬN BÁO GIÁ (nếu có Dúi) hoặc Thanh toán (món thường) */}
                {(() => {
                  const hasUnavailable = cart.some(item => {
                    const menuItem = menuItems.find(m => m.id === item.menuItemId || m.name === item.name);
                    if (!menuItem) return false;
                    const { isAvailable } = resolveMenuItemAvailability(menuItem, commercialInventory);
                    return !isAvailable;
                  });

                  if (hasUnavailable) {
                    return (
                      <button
                        disabled
                        className="w-full py-2.5 rounded-xl bg-slate-200 text-slate-400 font-bold text-xs cursor-not-allowed flex items-center justify-center gap-1.5"
                      >
                        <AlertCircle className="w-4 h-4" />
                        <span>Vui lòng xóa món tạm hết để đặt món</span>
                      </button>
                    );
                  }

                  return hasDuiInCart ? (
                    <div className="space-y-1">
                      <button
                        onClick={handleOpenDuiQuoteModal}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                      >
                        <Scale className="w-4 h-4" />
                        <span>NHẬN BÁO GIÁ</span>
                      </button>
                      <p className="text-[10px] text-slate-400 text-center">
                        * Chuyển trạng thái sang <strong>CHỜ CÂN DÚI</strong> để Admin cân & gửi báo giá
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowCheckoutModal(true)}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                    >
                      <Receipt className="w-4 h-4" />
                      <span>Thanh toán & Đặt món</span>
                    </button>
                  );
                })()}
              </div>
            )}
          </div>

          {/* WIDGET 3: ƯU ĐÃI ĐẶC BIỆT BANNER */}
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-red-700 to-rose-900 text-white p-4 shadow-md">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-300">Ưu đãi đặc biệt</span>
              <span className="text-[10px] text-amber-200 hover:underline cursor-pointer">Xem thêm &gt;</span>
            </div>
            <h4 className="text-base font-extrabold text-white">Giảm 10%</h4>
            <p className="text-[11px] text-rose-100">Cho đơn từ 500.000đ</p>
            <div className="mt-2 inline-flex items-center gap-1.5 bg-black/30 border border-amber-300/40 px-2.5 py-1 rounded-lg">
              <span className="text-[10px] text-amber-200">Mã:</span>
              <strong className="text-xs font-mono font-bold text-amber-300 tracking-wider">NGOCNHI10</strong>
            </div>
          </div>

          {/* WIDGET 4: TRA CỨU ĐƠN HÀNG BẰNG SỐ ĐIỆN THOẠI KHÁCH HÀNG */}
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-1.5">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-orange-600" />
                <span>Tra cứu đơn hàng</span>
              </h3>
              <span className="text-[10px] text-orange-700 bg-orange-50 font-semibold px-2 py-0.5 rounded-full border border-orange-200/70">
                Bằng SĐT
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mb-2.5">
              Nhập số điện thoại khách hàng để kiểm tra nhanh tiến độ món & đơn đặt
            </p>
            <form onSubmit={handleLookupSubmit} className="space-y-2">
              <div className="relative">
                <input
                  type="tel"
                  placeholder="Nhập số điện thoại khách hàng..."
                  value={lookupQuery}
                  onChange={(e) => setLookupQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
                />
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-orange-600 hover:bg-orange-700 active:scale-[0.98] text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Tra cứu</span>
              </button>
            </form>
          </div>

          {/* WIDGET 5: THÔNG TIN LIÊN HỆ */}
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-4 space-y-2.5">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Home className="w-4 h-4 text-orange-600" />
              <span>Thông tin liên hệ</span>
            </h3>

            <div className="space-y-1.5 text-xs text-slate-600">
              <p className="font-bold text-slate-800">Quán Ăn Ngọc Nhi</p>
              <div className="flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span className="text-[11px]">{SYSTEM_INFO.address}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-[11px] font-semibold text-slate-800">{SYSTEM_INFO.phoneHotline}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-[11px]">06:00 - 22:00 (Tất cả các ngày)</span>
              </div>
            </div>

            <button
              onClick={() => setShowMapModal(true)}
              className="w-full py-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-800 text-xs font-bold transition-all border border-orange-200 flex items-center justify-center gap-1.5"
            >
              <MapPin className="w-3.5 h-3.5 text-orange-600" />
              <span>Xem bản đồ</span>
            </button>

            {/* Thumbnail */}
            <div className="relative rounded-xl overflow-hidden h-24 border border-slate-200 mt-2">
              <img
                src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80"
                alt="Không gian quán"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
                <span className="text-[10px] text-white font-medium">Không gian ấm cúng thoáng mát</span>
              </div>
            </div>
          </div>

          {/* WIDGET 6: QUẢN LÝ QUÁN ĂN (DÀNH CHO NHÂN VIÊN / QUẢN LÝ - NAVY THEME) - ADMIN ONLY */}
          {userRole === 'admin' && (
            <div className="bg-[#141E30] text-slate-100 rounded-2xl shadow-xl border border-slate-800 p-4 space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-600/30 text-blue-400 flex items-center justify-center border border-blue-500/30">
                    <ChefHat className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-white">QUẢN LÝ QUÁN ĂN</h4>
                    <p className="text-[9px] text-slate-400">(Dành cho nhân viên/quản lý)</p>
                  </div>
                </div>
              </div>

              {/* 6 Action Tiles */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <button
                  onClick={() => setManagerActiveTab('menu')}
                  className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 transition-all flex flex-col items-center justify-center relative group"
                >
                  <UtensilsCrossed className="w-4 h-4 text-blue-400 mb-1" />
                  <span className="text-[10px] text-slate-200 font-medium">Quản lý thực đơn</span>
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {menuItems.length}
                  </span>
                </button>

                <button
                  onClick={() => setManagerActiveTab('orders')}
                  className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 transition-all flex flex-col items-center justify-center relative group"
                >
                  <ShoppingBag className="w-4 h-4 text-blue-400 mb-1" />
                  <span className="text-[10px] text-slate-200 font-medium">Quản lý đơn hàng</span>
                  {todayTotalOrdersCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {todayTotalOrdersCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setManagerActiveTab('bookings')}
                  className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 transition-all flex flex-col items-center justify-center relative group"
                >
                  <Calendar className="w-4 h-4 text-blue-400 mb-1" />
                  <span className="text-[10px] text-slate-200 font-medium">Quản lý đặt bàn</span>
                  {todayTotalBookingsCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {todayTotalBookingsCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveNav('promotions')}
                  className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 transition-all flex flex-col items-center justify-center"
                >
                  <Tag className="w-4 h-4 text-emerald-400 mb-1" />
                  <span className="text-[10px] text-slate-200 font-medium">Quản lý khuyến mãi</span>
                </button>

                <button
                  onClick={() => onNavigate && onNavigate('farm')}
                  className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 transition-all flex flex-col items-center justify-center"
                >
                  <Boxes className="w-4 h-4 text-amber-400 mb-1" />
                  <span className="text-[10px] text-slate-200 font-medium">Quản lý kho Dúi</span>
                </button>

                <button
                  onClick={() => onNavigate && onNavigate('operations')}
                  className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 transition-all flex flex-col items-center justify-center"
                >
                  <TrendingUp className="w-4 h-4 text-purple-400 mb-1" />
                  <span className="text-[10px] text-slate-200 font-medium">Báo cáo doanh thu</span>
                </button>
              </div>

              {/* Live Zero-Based Today Revenue */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-slate-400">Doanh thu hôm nay</p>
                    <p className="text-lg font-black text-white tracking-tight">
                      {todayTotalRestaurantRevenue.toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 text-[10px] font-bold">
                    🟢 Live Sync
                  </span>
                </div>

                {/* Zero-Based Real Stats */}
                <div className="grid grid-cols-3 gap-1.5 text-[11px] bg-slate-900/60 p-2 rounded-xl border border-slate-800 text-slate-300">
                  <div>
                    <span className="text-[9px] text-slate-500 block">Đơn hàng:</span>
                    <strong className="text-white font-bold">{todayTotalOrdersCount}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block">Đặt bàn:</span>
                    <strong className="text-white font-bold">{todayTotalBookingsCount}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block">Khách tại quán:</span>
                    <strong className="text-white font-bold">{todayTotalGuestsCount}</strong>
                  </div>
                </div>

                {/* Go to Operations Center */}
                <button
                  onClick={() => onNavigate && onNavigate('operations')}
                  className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md"
                >
                  <span>Vào trang quản trị</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

        </aside>
      </div>

      {/* ========================================================= */}
      {/* MODAL: CHECKOUT / ĐẶT MÓN ONLINE */}
      {/* ========================================================= */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-5 sm:p-6 border border-slate-200 max-h-[90vh] overflow-y-auto animate-scaleUp">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-orange-600" />
                <h3 className="text-base font-bold text-slate-900">Xác nhận thanh toán &amp; Đặt món</h3>
              </div>
              <button 
                onClick={() => setShowCheckoutModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="py-8 text-center text-slate-500">
                <ShoppingBag className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-semibold">Giỏ hàng của bạn đang trống!</p>
                <button
                  onClick={() => setShowCheckoutModal(false)}
                  className="mt-3 px-4 py-2 rounded-xl bg-orange-600 text-white text-xs font-bold"
                >
                  Xem thực đơn
                </button>
              </div>
            ) : (
              <form onSubmit={handleCheckoutSubmit} className="space-y-3.5">
                {/* Order Type Selection */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'dine_in', label: 'Ăn tại quán' },
                    { id: 'takeaway', label: 'Mang về' },
                    { id: 'delivery', label: 'Giao tận nơi' }
                  ].map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setCheckoutType(t.id as any)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                        checkoutType === t.id
                          ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Họ tên khách hàng</label>
                    <input
                      type="text"
                      required
                      placeholder="Nguyễn Văn A"
                      value={checkoutName}
                      onChange={(e) => setCheckoutName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Số điện thoại</label>
                    <input
                      type="tel"
                      required
                      placeholder="0988xxxxxx"
                      value={checkoutPhone}
                      onChange={(e) => setCheckoutPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                {checkoutType === 'dine_in' && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Vị trí / Số bàn</label>
                    <input
                      type="text"
                      value={checkoutTable}
                      onChange={(e) => setCheckoutTable(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                )}

                {checkoutType === 'delivery' && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Địa chỉ giao hàng (Bán kính 10km)</label>
                    <input
                      type="text"
                      required
                      placeholder="Số nhà, đường, khu phố..."
                      value={checkoutAddress}
                      onChange={(e) => setCheckoutAddress(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Ghi chú bếp / chế biến</label>
                  <input
                    type="text"
                    placeholder="VD: Cay ít, không ớt, nướng giòn..."
                    value={checkoutNotes}
                    onChange={(e) => setCheckoutNotes(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                {/* Items Summary in Modal */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <p className="text-xs font-bold text-slate-800">Chi tiết hóa đơn ({cart.length} món):</p>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {cart.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-[11px] text-slate-600">
                        <span>{item.name} x {item.quantity}</span>
                        <span className="font-semibold">{(item.price * item.quantity).toLocaleString('vi-VN')}đ</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex justify-between text-xs font-extrabold text-slate-900">
                    <span>Tổng tiền thanh toán:</span>
                    <span className="text-orange-600 text-sm font-black">{cartTotal.toLocaleString('vi-VN')}đ</span>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCheckoutModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md"
                  >
                    Xác nhận đặt hàng &amp; Đồng bộ
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: SƠ ĐỒ BÀN / KHÔNG GIAN QUÁN */}
      {/* ========================================================= */}
      {showFloorPlanModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-5 sm:p-6 border border-slate-200 max-h-[90vh] overflow-y-auto animate-scaleUp">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Map className="w-5 h-5 text-orange-600" />
                <h3 className="text-base font-bold text-slate-900">Sơ đồ không gian &amp; Bàn tiệc Quán Ăn Ngọc Nhi</h3>
              </div>
              <button onClick={() => setShowFloorPlanModal(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {RESTAURANT_SPACES.map(space => (
                <div key={space.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row gap-4 items-center">
                  <img src={space.image} alt={space.name} className="w-full sm:w-44 h-28 rounded-lg object-cover" />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900">{space.name}</h4>
                      <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-800 text-[10px] font-bold">{space.badge}</span>
                    </div>
                    <p className="text-xs text-orange-600 font-semibold">{space.capacity}</p>
                    <p className="text-xs text-slate-600">{space.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => {
                  setShowFloorPlanModal(false);
                  setShowBookingModal(true);
                }}
                className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold"
              >
                Đặt bàn ngay vào khu này
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ĐẶT BÀN & CHỌN MÓN TRƯỚC */}
      {/* ========================================================= */}
      {showBookingModal && (
        <TableBookingModal
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          menuItems={menuItems}
          cart={cart}
          defaultArea={bookingArea}
          onConfirmBooking={(data) => {
            const created = onAddBooking(data);
            setBookingTicketSuccess(created);
            return created;
          }}
        />
      )}

      {/* ========================================================= */}
      {/* MODAL: XEM BẢN ĐỒ & VỊ TRÍ QUÁN */}
      {/* ========================================================= */}
      {showMapModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-5 border border-slate-200 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                <MapPin className="w-5 h-5 text-orange-600" />
                <span>Vị trí Quán Ăn Ngọc Nhi</span>
              </h3>
              <button onClick={() => setShowMapModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="rounded-xl overflow-hidden border border-slate-200 h-60 bg-slate-100 flex items-center justify-center relative">
                <iframe
                  title="Google Map"
                  src="https://maps.google.com/maps?q=Loc+Ninh+Dong+Nai&t=&z=13&ie=UTF8&iwloc=&output=embed"
                  className="w-full h-full border-0"
                  loading="lazy"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1 text-slate-700">
                <p>📍 <strong>Địa chỉ:</strong> {SYSTEM_INFO.address}</p>
                <p>📞 <strong>Hotline chỉ đường:</strong> {SYSTEM_INFO.phoneHotline} - {SYSTEM_INFO.phoneTech}</p>
                <p>🚗 Có bãi đỗ xe ô tô và xe máy rộng rãi, an ninh 24/7.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: TRA CỨU ĐƠN HÀNG BẰNG SĐT KHÁCH HÀNG CHI TIẾT */}
      {/* ========================================================= */}
      {showLookupModal && lookupPhoneResult && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-5 sm:p-6 border border-slate-200 animate-scaleUp my-8 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                  <Search className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">Kết quả tra cứu đơn hàng</h3>
                  <p className="text-[11px] text-slate-500">
                    SĐT / Mã tra cứu: <span className="font-mono font-bold text-orange-700">{lookupPhoneResult.query}</span>
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowLookupModal(false)} 
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-xs">
              {lookupPhoneResult.orders.length === 0 && 
               lookupPhoneResult.bookings.length === 0 && 
               lookupPhoneResult.duiOrders.length === 0 ? (
                <div className="p-6 text-center rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Chưa tìm thấy đơn hàng nào</h4>
                    <p className="text-slate-500 mt-1 leading-relaxed">
                      Không tìm thấy đơn đặt món, đơn dúi hoặc bàn đặt khớp với số điện thoại / mã <strong className="text-slate-800">"{lookupPhoneResult.query}"</strong>.
                    </p>
                  </div>
                  <div className="pt-2 text-[11px] text-slate-500 bg-white p-3 rounded-xl border border-slate-100">
                    💡 Quý khách vui lòng kiểm tra lại số điện thoại đã dùng khi đặt hoặc gọi trực tiếp Hotline để nhân viên hỗ trợ tra cứu ngay:
                    <div className="mt-2 font-bold text-orange-700 font-mono text-xs">
                      Hotline: {SYSTEM_INFO.phoneHotline} - {SYSTEM_INFO.phoneTech}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* 1. ĐƠN MÓN ĂN QUÁN ĂN NGỌC NHI */}
                  {lookupPhoneResult.orders.length > 0 && (
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                        <span className="flex items-center gap-1.5 text-orange-700">
                          <ShoppingBag className="w-3.5 h-3.5" />
                          Đơn Đặt Món Quán Ăn ({lookupPhoneResult.orders.length})
                        </span>
                      </div>
                      
                      {lookupPhoneResult.orders.map((ord) => {
                        const statusConfig = {
                          waiting_weighing: { label: 'Chờ cân dúi & báo giá', bg: 'bg-amber-100 text-amber-800 border-amber-300' },
                          quoted: { label: 'Đã báo giá — Chờ chốt', bg: 'bg-blue-100 text-blue-800 border-blue-300' },
                          pending: { label: 'Mới tiếp nhận', bg: 'bg-amber-100 text-amber-800 border-amber-300' },
                          confirmed: { label: 'Đã xác nhận đơn', bg: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
                          cooking: { label: 'Bếp đang nấu', bg: 'bg-orange-100 text-orange-800 border-orange-300' },
                          serving: { label: 'Đang phục vụ / Đang giao', bg: 'bg-teal-100 text-teal-800 border-teal-300' },
                          completed: { label: 'Đã thanh toán & hoàn tất', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
                          cancelled: { label: 'Đã hủy đơn', bg: 'bg-slate-100 text-slate-600 border-slate-200' },
                        }[ord.status] || { label: ord.status, bg: 'bg-slate-100 text-slate-700 border-slate-200' };

                        return (
                          <div key={ord.id} className="p-3.5 rounded-2xl bg-orange-50/50 border border-orange-200 space-y-2.5">
                            <div className="flex items-center justify-between gap-2">
                              <div>
                                <span className="font-mono font-black text-orange-900 text-sm">
                                  #{ord.code}
                                </span>
                                <span className="text-[10px] text-slate-500 ml-2">
                                  {ord.createdAt}
                                </span>
                              </div>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusConfig.bg}`}>
                                {statusConfig.label}
                              </span>
                            </div>

                            <div className="bg-white/80 rounded-xl p-2.5 border border-orange-100 space-y-1.5">
                              <div className="text-[11px] text-slate-600 flex justify-between">
                                <span>Khách hàng: <strong>{ord.customerName}</strong> ({ord.phone})</span>
                                <span className="text-slate-500 font-medium">
                                  {ord.orderType === 'dine_in' ? `Tại bàn: ${ord.tableNumber || 'Chưa gán'}` :
                                   ord.orderType === 'takeaway' ? 'Mang về' : 'Giao tận nơi'}
                                </span>
                              </div>

                              {ord.items && ord.items.length > 0 && (
                                <div className="pt-1.5 border-t border-slate-100 space-y-1">
                                  {ord.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between text-[11px] text-slate-700">
                                      <span>• {item.name} <span className="text-slate-400">x{item.quantity}</span></span>
                                      <span className="font-mono font-semibold text-slate-800">
                                        {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {ord.notes && (
                                <p className="text-[10px] text-slate-500 italic pt-1 border-t border-slate-100">
                                  Ghi chú: {ord.notes}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center justify-between pt-1 text-xs">
                              <span className="text-slate-500 font-medium">Tổng thanh toán:</span>
                              <span className="font-mono font-black text-orange-600 text-sm">
                                {ord.total?.toLocaleString('vi-VN')}đ
                              </span>
                            </div>

                            {/* THÔNG BÁO TỪ CHỐI TIẾP NHẬN & PHẢN HỒI ĐỒNG BỘ */}
                            {(ord.status === 'cancelled' || ord.rejectionReason) && (
                              <div className="p-3 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-950 space-y-2 mt-2">
                                <div className="flex items-center gap-2 text-rose-900 font-extrabold text-xs">
                                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                                  <span>Rất tiếc: Quán chưa thể tiếp nhận đơn hàng này</span>
                                </div>

                                {ord.rejectionReason && (
                                  <div className="text-xs text-rose-900">
                                    <span className="font-bold">Lý do từ quán: </span>
                                    <span>{ord.rejectionReason}</span>
                                  </div>
                                )}

                                {ord.adminNote && (
                                  <div className="p-2.5 rounded-xl bg-white/90 border border-rose-200 text-rose-950 text-xs italic">
                                    "{ord.adminNote}"
                                  </div>
                                )}

                                {ord.rejectedAt && (
                                  <div className="text-[10px] text-rose-600 font-mono">
                                    Thời gian phản hồi: {ord.rejectedAt}
                                  </div>
                                )}

                                {/* Nút hành động của khách: Tiếp tục chọn món đặt tiếp tục hoặc không */}
                                <div className="pt-2 border-t border-rose-200 flex flex-col sm:flex-row gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setShowLookupModal(false);
                                      setActiveNav('menu');
                                      if (ord.items && ord.items.length > 0) {
                                        setCart(ord.items.map(it => ({ ...it })));
                                        setShowCheckoutModal(true);
                                      }
                                    }}
                                    className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg transition-all cursor-pointer"
                                  >
                                    <ShoppingBag className="w-3.5 h-3.5" />
                                    <span>Tiếp tục chọn món & Đặt lại</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => setShowLookupModal(false)}
                                    className="py-2 px-3 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                                  >
                                    Đóng / Không đặt nữa
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* 2. ĐƠN MUA DÚI GIỐNG / DÚI THỊT TỪ TRANG TRẠI */}
                  {lookupPhoneResult.duiOrders.length > 0 && (
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                        <span className="flex items-center gap-1.5 text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Đơn Đặt Mua Dúi Con Giống / Thịt ({lookupPhoneResult.duiOrders.length})
                        </span>
                      </div>

                      {lookupPhoneResult.duiOrders.map((dui) => (
                        <div key={dui.id} className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-mono font-black text-emerald-900 text-sm">
                                #{dui.code}
                              </span>
                              <span className="text-[10px] text-slate-500 ml-2">{dui.createdAt}</span>
                            </div>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              {dui.status === 'new' ? 'Tiếp nhận đơn mới' :
                               dui.status === 'confirmed' ? 'Đã duyệt con giống' :
                               dui.status === 'shipping' ? 'Đang gửi lồng giao' :
                               dui.status === 'completed' ? 'Giao thành công' : 'Đã hủy'}
                            </span>
                          </div>

                          <div className="bg-white/80 rounded-xl p-2.5 border border-emerald-100 text-[11px] text-slate-700 space-y-1">
                            <div className="font-bold text-slate-900">
                              {dui.productName} — {dui.quantity} {dui.unit}
                            </div>
                            <div className="text-slate-600">
                              Khách: <strong>{dui.customerName}</strong> ({dui.phone})
                            </div>
                            <div className="text-slate-500">
                              Hình thức: {dui.deliveryType === 'at_farm' ? 'Nhận trực tiếp tại Trại' : `Giao tận nơi: ${dui.deliveryAddress}`}
                            </div>
                            {dui.notes && <div className="text-[10px] text-slate-400 italic">Ghi chú: {dui.notes}</div>}
                          </div>

                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500">Tạm tính:</span>
                            <span className="font-mono font-black text-emerald-700 text-sm">
                              {dui.estimatedTotal?.toLocaleString('vi-VN')}đ
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 3. PHIẾU ĐẶT BÀN QUÁN ĂN */}
                  {lookupPhoneResult.bookings.length > 0 && (
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                        <span className="flex items-center gap-1.5 text-amber-800">
                          <UtensilsCrossed className="w-3.5 h-3.5" />
                          Phiếu Đặt Bàn Ăn ({lookupPhoneResult.bookings.length})
                        </span>
                      </div>

                      {lookupPhoneResult.bookings.map((bk) => (
                        <div key={bk.id} className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-black text-amber-900 text-sm">
                              #{bk.code}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                              {bk.status === 'new' ? 'Chờ xác nhận' :
                               bk.status === 'confirmed' ? 'Đã giữ chỗ bàn' :
                               bk.status === 'serving' ? 'Đang dùng bữa tại quán' :
                               bk.status === 'completed' ? 'Đã hoàn tất' : 'Đã hủy'}
                            </span>
                          </div>

                          <div className="bg-white/80 rounded-xl p-2.5 border border-amber-100 text-[11px] text-slate-700 space-y-1">
                            <div className="flex justify-between">
                              <span>Khách hàng: <strong>{bk.customerName}</strong></span>
                              <span className="text-amber-900 font-bold">{bk.guestCount} Khách</span>
                            </div>
                            <div>Thời gian: <strong>{bk.bookingTime}</strong> ngày <strong>{bk.bookingDate}</strong></div>
                            <div>Khu vực: <strong>{bk.tableArea}</strong></div>
                            {bk.tableNumber && (
                              <div className="flex justify-between items-center bg-blue-50 px-2 py-1 rounded-lg border border-blue-200">
                                <span className="text-blue-900 font-semibold">Vị trí bàn được xếp:</span>
                                <strong className="text-blue-900 font-bold">{bk.tableNumber}</strong>
                              </div>
                            )}
                            {bk.preOrderItems && bk.preOrderItems.length > 0 && (
                              <div className="pt-1.5 mt-1 border-t border-amber-200/60 space-y-1">
                                <div className="flex justify-between font-bold text-amber-950 text-[10px]">
                                  <span>Món đặt trước ({bk.preOrderItems.length} món):</span>
                                  <span className="font-mono text-orange-700">{(bk.preOrderTotal || 0).toLocaleString('vi-VN')}đ</span>
                                </div>
                                <div className="bg-amber-100/40 p-1.5 rounded-lg text-[10px] space-y-0.5">
                                  {bk.preOrderItems.map((item, idx) => (
                                    <div key={idx} className="flex justify-between text-slate-700">
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span>{item.quantity}x {item.name}</span>
                                        {bk.dishesConfirmed && (
                                          <span className="text-[9px] bg-emerald-600 text-white font-bold px-1.5 py-0.2 rounded">
                                            ✓ Bếp đã nhận nấu
                                          </span>
                                        )}
                                      </div>
                                      <span className="font-mono font-medium">{(item.price * item.quantity).toLocaleString('vi-VN')}đ</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {bk.adminNote && (
                              <div className="p-2 rounded-lg bg-blue-50 border border-blue-200 text-[10px] space-y-0.5">
                                <div className="font-bold text-blue-950">📩 Lời nhắn từ Quản Lý:</div>
                                <p className="text-blue-900 italic font-medium">"{bk.adminNote}"</p>
                              </div>
                            )}
                            {bk.notes && <div className="text-[10px] text-slate-500 italic">Ghi chú của quý khách: {bk.notes}</div>}
                            {bk.lastSyncAt && (
                              <div className="text-[9px] text-slate-400 text-right pt-0.5">
                                Đồng bộ lần cuối: {bk.lastSyncAt}
                              </div>
                            )}

                            {/* THÔNG BÁO TỪ CHỐI TIẾP NHẬN PHIẾU ĐẶT BÀN */}
                            {(bk.status === 'cancelled' || bk.rejectionReason) && (
                              <div className="p-3 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-950 space-y-2 mt-2">
                                <div className="flex items-center gap-2 text-rose-900 font-extrabold text-xs">
                                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                                  <span>Rất tiếc: Nhà hàng chưa thể tiếp nhận phiếu đặt bàn này</span>
                                </div>

                                {bk.rejectionReason && (
                                  <div className="text-xs text-rose-900">
                                    <span className="font-bold">Lý do từ chối: </span>
                                    <span>{bk.rejectionReason}</span>
                                  </div>
                                )}

                                {bk.adminNote && (
                                  <div className="p-2 rounded-xl bg-white/90 border border-rose-200 text-rose-950 text-xs italic">
                                    "{bk.adminNote}"
                                  </div>
                                )}

                                {bk.rejectedAt && (
                                  <div className="text-[10px] text-rose-600 font-mono">
                                    Thời gian phản hồi: {bk.rejectedAt}
                                  </div>
                                )}

                                {/* Nút hành động của khách: Tiếp tục chọn món/đặt bàn hoặc không */}
                                <div className="pt-2 border-t border-rose-200 flex flex-col sm:flex-row gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setShowLookupModal(false);
                                      setActiveNav('booking');
                                      setBookingCustomerName(bk.customerName);
                                      setBookingPhone(bk.phone);
                                      setBookingGuests(bk.guestCount);
                                      setBookingArea(bk.tableArea || 'Khu sân vườn');
                                      setShowBookingModal(true);
                                    }}
                                    className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg transition-all cursor-pointer"
                                  >
                                    <UtensilsCrossed className="w-3.5 h-3.5" />
                                    <span>Đổi giờ & Tiếp tục đặt bàn / Chọn món</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => setShowLookupModal(false)}
                                    className="py-2 px-3 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                                  >
                                    Đóng / Không đặt nữa
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between gap-2 shrink-0">
              <a
                href={`tel:${SYSTEM_INFO.phoneHotline}`}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-orange-600" />
                <span>Gọi Hotline</span>
              </a>

              <button
                type="button"
                onClick={() => setShowLookupModal(false)}
                className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* FLOATING CHAT TƯ VẤN TRỰC TUYẾN PHÂN HỆ QUÁN ĂN */}
      {/* ========================================================= */}
      <ModuleChatWidget
        module="restaurant"
        title="Tư Vấn Quán Ăn Ngọc Nhi"
        subtitle="Quản lý Ngọc Nhi • Hỗ trợ 24/7"
        avatarIcon={<ChefHat className="w-5 h-5 text-amber-200" />}
        headerGradientClass="bg-gradient-to-r from-orange-600 to-amber-600"
        accentColorClass="bg-orange-600 hover:bg-orange-700"
        hotline="0967823801"
        hotlineFormatted="0967.823.801 - 0969.310.601"
        initialMessage="Chào mừng quý khách đến với Quán Ăn Ngọc Nhi! Chúng tôi phục vụ đặc sản Dúi tươi sống bắt tại chuồng chế biến theo yêu cầu, các món lẩu nướng đồng quê và nhận đặt bàn tiệc. Quý khách cần hỗ trợ đặt bàn hoặc chọn món gì ạ?"
        quickPrompts={RESTAURANT_QUICK_PROMPTS}
        smartResponseHandler={handleRestaurantChatResponse}
        onSpecialAction={() => setShowBookingModal(true)}
        specialActionLabel="Mở form đặt bàn trước nhanh"
      />

      {/* ========================================================= */}
      {/* MODAL: MANAGER ORDERS & BOOKINGS POPUP */}
      {/* ========================================================= */}
      {userRole === 'admin' && managerActiveTab && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-5 sm:p-6 border border-slate-200 max-h-[90vh] overflow-y-auto animate-scaleUp">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {managerActiveTab === 'orders' && `Quản lý đơn hàng quán (${orders.length} đơn)`}
                {managerActiveTab === 'bookings' && `Quản lý bàn đặt (${bookings.length} lượt)`}
                {managerActiveTab === 'menu' && `Quản lý thực đơn (${menuItems.length} món)`}
              </h3>
              <button onClick={() => setManagerActiveTab(null)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {managerActiveTab === 'orders' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs text-slate-500">
                    Danh sách đơn hàng &amp; yêu cầu báo giá Dúi
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      {orders.filter(o => o.status === 'waiting_weighing').length} đơn Chờ Cân Dúi
                    </span>
                  </div>
                </div>

                {orders.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs">Chưa có đơn hàng nào được ghi nhận.</div>
                ) : (
                  <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
                    {orders.map(o => {
                      const isWaitingWeighing = o.status === 'waiting_weighing';
                      const isQuoted = o.status === 'quoted';

                      return (
                        <div 
                          key={o.id} 
                          className={`p-3.5 rounded-xl border transition-all ${
                            isWaitingWeighing 
                              ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-400/30' 
                              : isQuoted
                              ? 'bg-blue-50/50 border-blue-200'
                              : 'bg-white border-slate-200'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-slate-900">#{o.code}</span>
                                <span className="font-bold text-slate-800">• {o.customerName}</span>
                                <span className="text-slate-500 font-semibold">({o.phone})</span>
                                {isWaitingWeighing && (
                                  <span className="px-2 py-0.5 rounded-full bg-amber-600 text-white text-[10px] font-black uppercase tracking-wider animate-pulse flex items-center gap-1">
                                    <Scale className="w-3 h-3" />
                                    CHỜ CÂN DÚI
                                  </span>
                                )}
                                {isQuoted && (
                                  <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider">
                                    ĐÃ GỬI BÁO GIÁ
                                  </span>
                                )}
                              </div>

                              <p className="text-[11px] text-slate-500 mt-0.5">
                                {o.orderType === 'dine_in' ? `Ăn tại bàn: ${o.tableArea || 'Bàn chưa xếp'}` : `Giao hàng: ${o.address || 'Tại quán'}`} • {o.createdAt}
                              </p>

                              {/* Items list */}
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                {o.items.map((it, idx) => (
                                  <span 
                                    key={idx} 
                                    className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                                      it.name.toLowerCase().includes('dúi') || it.name.toLowerCase().includes('tiết canh')
                                        ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300'
                                        : 'bg-slate-100 text-slate-700'
                                    }`}
                                  >
                                    {it.name} x {it.quantity}
                                  </span>
                                ))}
                              </div>

                              {o.notes && (
                                <p className="text-[11px] text-amber-800 bg-amber-100/50 px-2 py-1 rounded-md mt-1.5 inline-block">
                                  <strong>Ghi chú khách:</strong> {o.notes}
                                </p>
                              )}

                              {o.duiWeightKg && (
                                <p className="text-[11px] text-slate-600 mt-1">
                                  Trọng lượng đã cân: <strong className="text-slate-900">{o.duiWeightKg} kg</strong> (Đơn giá: {o.duiPricePerKg?.toLocaleString('vi-VN')}đ/kg)
                                </p>
                              )}
                            </div>

                            <div className="flex flex-col sm:items-end justify-between gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                              <div className="text-left sm:text-right">
                                <p className="text-xs text-slate-500">Tổng tiền:</p>
                                <p className="text-base font-black text-orange-600">
                                  {isWaitingWeighing ? 'Chờ cân tính giá' : `${o.total.toLocaleString('vi-VN')}đ`}
                                </p>
                              </div>

                              <div className="flex items-center gap-1.5">
                                {isWaitingWeighing ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setAdminWeighingOrder(o);
                                      setManagerActiveTab(null);
                                    }}
                                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-black text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 animate-bounce"
                                  >
                                    <Scale className="w-3.5 h-3.5" />
                                    <span>BẮT &amp; CÂN DÚI NGAY</span>
                                  </button>
                                ) : isQuoted ? (
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setCustomerDecisionOrder(o);
                                        setManagerActiveTab(null);
                                      }}
                                      className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold cursor-pointer"
                                      title="Xem dưới góc nhìn khách hàng"
                                    >
                                      👁️ Xem báo giá khách
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setAdminWeighingOrder(o);
                                        setManagerActiveTab(null);
                                      }}
                                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold cursor-pointer"
                                    >
                                      Cân lại
                                    </button>
                                  </div>
                                ) : (
                                  <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                                    {o.status === 'completed' ? 'Hoàn tất' : o.status === 'confirmed' ? 'Đã xác nhận' : o.status}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {managerActiveTab === 'bookings' && (
              <div className="space-y-3">
                {bookings.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs">Chưa có lượt đặt bàn nào.</div>
                ) : (
                  <div className="space-y-2">
                    {bookings.map(b => (
                      <div key={b.id} className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-amber-300 space-y-2 text-xs transition-colors shadow-2xs">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                #{b.code}
                              </span>
                              <span className="font-bold text-slate-900 text-sm">{b.customerName}</span>
                              <a href={`tel:${b.phone}`} className="text-orange-600 hover:underline font-semibold">
                                ({b.phone})
                              </a>
                            </div>
                            <p className="text-slate-600 mt-1">
                              ⏰ <strong>{b.bookingTime}</strong> ngày <strong>{b.bookingDate}</strong> • 👥 <strong>{b.guestCount}</strong> khách • 📍 <strong>{b.tableArea}</strong>
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <select
                              value={b.status}
                              onChange={(e) => onUpdateBookingStatus(b.id, e.target.value as any)}
                              className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-300 font-bold bg-slate-50 focus:ring-2 focus:ring-orange-500 cursor-pointer"
                            >
                              <option value="new">Mới nhận</option>
                              <option value="confirmed">Đã xác nhận</option>
                              <option value="serving">Đang phục vụ</option>
                              <option value="completed">Hoàn tất</option>
                              <option value="cancelled">Hủy</option>
                            </select>
                          </div>
                        </div>

                        {/* Pre-ordered Dishes for Kitchen/Waitstaff */}
                        {b.preOrderItems && b.preOrderItems.length > 0 && (
                          <div className="pt-2 border-t border-slate-100 space-y-1.5 bg-orange-50/40 p-2.5 rounded-lg border border-orange-100">
                            <div className="flex items-center justify-between font-bold text-slate-900 text-[11px]">
                              <span className="flex items-center gap-1 text-orange-900">
                                <ChefHat className="w-3.5 h-3.5 text-orange-600" />
                                Món ăn khách chọn đặt trước ({b.preOrderItems.length} món):
                              </span>
                              <span className="font-mono text-orange-700 font-black">
                                {(b.preOrderTotal || 0).toLocaleString('vi-VN')}đ
                              </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px]">
                              {b.preOrderItems.map((dish, idx) => (
                                <div key={idx} className="flex justify-between bg-white px-2 py-1 rounded border border-orange-200/60 text-slate-800">
                                  <span className="font-medium">{dish.quantity}x {dish.name}</span>
                                  <span className="font-mono text-slate-500">{(dish.price * dish.quantity).toLocaleString('vi-VN')}đ</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {b.notes && (
                          <div className="text-[11px] text-slate-500 italic bg-slate-50 px-2 py-1 rounded border border-slate-100">
                            <strong>Ghi chú khách:</strong> {b.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {managerActiveTab === 'menu' && (
              <div className="space-y-3.5">
                <div className="flex flex-wrap justify-between items-center gap-2 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">Thực đơn nhà hàng ({menuItems.length} món)</span>
                    <button
                      type="button"
                      onClick={handleOpenCreateDish}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Thêm món mới</span>
                    </button>
                  </div>
                  <button
                    onClick={() => onResetDefaultMenuItems && onResetDefaultMenuItems()}
                    className="text-xs text-orange-600 font-semibold hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Khôi phục thực đơn gốc</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                  {menuItems.map(m => {
                    const isAvailable = m.available !== false;
                    return (
                      <div 
                        key={m.id} 
                        className={`p-2.5 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs ${
                          isAvailable ? 'border-slate-200 bg-white hover:border-orange-300' : 'border-red-200 bg-red-50/40'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img src={m.image} alt={m.name} className="w-12 h-12 rounded-lg object-cover shrink-0 border border-slate-200" />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="font-bold text-slate-900 truncate">{m.name}</p>
                              {!isAvailable && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-red-600 text-white">
                                  TẠM HẾT
                                </span>
                              )}
                            </div>
                            <p className="text-slate-500 text-[11px]">
                              {m.portion || '1 phần'} • <span className="text-orange-600 font-extrabold">{m.price.toLocaleString('vi-VN')}đ</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                          {/* Quick availability toggle */}
                          <button
                            type="button"
                            onClick={(e) => handleToggleAvailability(m, e)}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                              isAvailable
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                : 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-300'
                            }`}
                            title="Chuyển đổi trạng thái còn / tạm hết"
                          >
                            {isAvailable ? <ToggleRight className="w-4 h-4 text-emerald-600" /> : <ToggleLeft className="w-4 h-4 text-red-600" />}
                            <span>{isAvailable ? 'Còn món' : 'Tạm hết'}</span>
                          </button>

                          {/* Full Edit Modal button */}
                          <button
                            type="button"
                            onClick={(e) => handleOpenEditDish(m, e)}
                            className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-colors"
                            title="Sửa tên, hình ảnh, giá, và thông tin chi tiết"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Sửa chi tiết</span>
                          </button>

                          {/* Delete item button if provided */}
                          {onDeleteMenuItem && (
                            <button
                              type="button"
                              onClick={(e) => handleRequestDeleteDish(m, e)}
                              className="px-2 py-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors flex items-center gap-1 font-bold"
                              title="Xóa món này khỏi thực đơn"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Xóa</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: CHỈNH SỬA MÓN ĂN (TÊN, ẢNH, GIÁ, TÌNH TRẠNG CÒN/HẾT) */}
      {/* ========================================================= */}
      {userRole === 'admin' && editingDish && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-5 sm:p-6 border border-slate-200 my-auto animate-scaleUp">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {isNewDishModal ? 'Thêm Món Ăn Mới' : 'Chỉnh Sửa Món Ăn'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isNewDishModal ? 'Điền thông tin món mới vào thực đơn' : `Mã món: ${editForm.id}`}
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => {
                  setEditingDish(null);
                  setIsNewDishModal(false);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Edit Form */}
            <form onSubmit={handleSaveEditDish} className="space-y-4">
              
              {/* 1. TÊN MÓN ĂN */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên món ăn <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Dúi nướng mọi, Dúi hấp sả, Lẩu cua đồng..."
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 rounded-xl border border-slate-300 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-hidden font-semibold transition-all"
                />
              </div>

              {/* 2. ĐỒNG BỘ NGHIỆP VỤ GIÁ BÁN CHO MÓN DÚI HOẶC MÓN THƯỜNG */}
              {checkIsDuiDish({
                id: editForm.id,
                name: editForm.name,
                category: editForm.category,
                description: editForm.description,
                price: editForm.price,
                isDuiDish: editingDish?.isDuiDish
              } as MenuItem) ? (
                <div className="p-3.5 rounded-xl border border-amber-300 bg-amber-50/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="p-1 rounded-lg bg-amber-200 text-amber-900">
                        <Scale className="w-4 h-4" />
                      </span>
                      <div>
                        <span className="text-xs font-black text-amber-950 uppercase tracking-wide">
                          Cơ chế giá Món Dúi Tươi Sống
                        </span>
                        <span className="block text-[11px] text-amber-800 font-semibold">
                          Bán theo cân thực tế & Báo giá sau cân
                        </span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-amber-600 text-white text-[11px] font-extrabold shadow-2xs">
                      Cân sống • Báo giá sau cân
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white/90 border border-amber-200 text-[11.5px] text-amber-900 space-y-1">
                    <p className="font-bold flex items-center gap-1 text-amber-950">
                      <Calculator className="w-3.5 h-3.5 text-amber-700" />
                      Công thức tự động khi khách nhận báo giá:
                    </p>
                    <div className="font-mono text-xs font-extrabold text-amber-800 bg-amber-100/70 px-2 py-1 rounded border border-amber-200">
                      Tổng tiền = (Kg thực tế × Giá dúi/kg) + (Số món × 250.000đ)
                    </div>
                    <p className="text-[11px] text-slate-600">
                      💡 Món Dúi không bán giá cố định từng đĩa. Khách chọn món ➔ Bấm "NHẬN BÁO GIÁ" ➔ Admin bắt & cân Dúi thực tế ➔ Hệ thống tự tính và gửi báo giá cho khách.
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Giá bán (VNĐ) <span className="text-red-500">*</span>
                    </label>
                    <span className="text-xs font-extrabold text-orange-600">
                      {Number(editForm.price || 0).toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                  <input
                    type="number"
                    required
                    min="0"
                    step="5000"
                    placeholder="Nhập giá tiền món ăn"
                    value={editForm.price}
                    onChange={(e) => setEditForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 rounded-xl border border-slate-300 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-hidden font-bold text-orange-600 transition-all"
                  />

                  {/* Phím tắt gán giá nhanh */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span className="text-[10px] font-semibold text-slate-400">Chọn nhanh:</span>
                    {[50000, 100000, 150000, 250000, 350000, 400000, 700000, 950000].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setEditForm(prev => ({ ...prev, price: val }))}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-all ${
                          editForm.price === val
                            ? 'bg-orange-600 text-white border-orange-600 shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-orange-50 hover:text-orange-600 border-slate-200'
                        }`}
                      >
                        {val >= 1000000 ? `${val / 1000000}Tr` : `${val / 1000}k`}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. TÌNH TRẠNG PHỤC VỤ (CÒN HÀNG / TẠM HẾT) */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span>Tình trạng phục vụ:</span>
                    {editForm.available ? (
                      <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-extrabold flex items-center gap-1.5 border border-emerald-200">
                        <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                        🟢 CÒN HÀNG (Đang phục vụ)
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-md bg-red-100 text-red-800 text-[11px] font-extrabold flex items-center gap-1.5 border border-red-200">
                        <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                        🔴 TẠM HẾT (Ngưng nhận đơn)
                      </span>
                    )}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {editForm.available 
                      ? 'Khách hàng có thể nhìn thấy và thêm món vào danh sách chọn.'
                      : 'Món sẽ hiển thị nhãn "TẠM HẾT" và khách hàng không thể chọn món này.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setEditForm(prev => ({ ...prev, available: !prev.available }))}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    editForm.available
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  {editForm.available ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                  <span>{editForm.available ? 'Còn hàng' : 'Tạm hết'}</span>
                </button>
              </div>

              {/* 4. HÌNH ẢNH MÓN ĂN (URL, UPLOAD, HOẶC CHỌN TỪ BỘ MẪU) */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Hình ảnh món ăn
                </label>

                {/* Image Preview and Direct URL / Upload controls */}
                <div className="flex gap-3 items-start">
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                    <img
                      src={editForm.image || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80'}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 space-y-2">
                    <input
                      type="url"
                      placeholder="Dán đường dẫn ảnh (URL)..."
                      value={editForm.image}
                      onChange={(e) => setEditForm(prev => ({ ...prev, image: e.target.value }))}
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 rounded-xl border border-slate-300 focus:bg-white focus:border-orange-500 focus:outline-hidden"
                    />

                    <div className="flex items-center gap-2">
                      <label className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 cursor-pointer flex items-center gap-1.5 transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Tải ảnh từ máy</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileUpload}
                          className="hidden"
                        />
                      </label>
                      <span className="text-[10px] text-slate-400">Hỗ trợ JPG, PNG, WebP (&lt; 3MB)</span>
                    </div>
                  </div>
                </div>

                {/* Curated culinary image presets */}
                <div className="pt-1">
                  <p className="text-[11px] font-bold text-slate-600 mb-1.5">Hoặc chọn nhanh ảnh món ngon chất lượng cao:</p>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
                    {CURATED_DISH_IMAGES.slice(0, 6).map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setEditForm(prev => ({ ...prev, image: img.url }))}
                        className={`relative rounded-lg overflow-hidden border transition-all h-12 group ${
                          editForm.image === img.url ? 'ring-2 ring-orange-500 border-orange-500 scale-95' : 'border-slate-200 hover:border-orange-400'
                        }`}
                        title={img.label}
                      >
                        <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                        <span className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[8px] truncate px-1 py-0.5 text-center">
                          {img.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 5. DANH MỤC & KHẨU PHẦN */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Danh mục món
                  </label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value as MenuItemCategory }))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-300 focus:bg-white focus:border-orange-500 font-semibold"
                  >
                    <option value="specialty">Đặc sản Ngọc Nhi</option>
                    <option value="main">Món chính</option>
                    <option value="hotpot_grill">Lẩu & Nướng</option>
                    <option value="appetizer">Khai vị</option>
                    <option value="seafood">Hải sản</option>
                    <option value="drink">Đồ uống</option>
                    <option value="dessert">Tráng miệng</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Khẩu phần
                  </label>
                  <input
                    type="text"
                    placeholder="VD: 1 phần, 2-3 người ăn"
                    value={editForm.portion}
                    onChange={(e) => setEditForm(prev => ({ ...prev, portion: e.target.value }))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-300 focus:bg-white focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Đơn vị tính
                  </label>
                  <input
                    type="text"
                    placeholder="VD: phần, đĩa, con, kg"
                    value={editForm.unit}
                    onChange={(e) => setEditForm(prev => ({ ...prev, unit: e.target.value }))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-300 focus:bg-white focus:border-orange-500"
                  />
                </div>
              </div>

              {/* 6. MÔ TẢ MÓN ĂN */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mô tả món ăn
                </label>
                <textarea
                  rows={2}
                  placeholder="Nhập mô tả hương vị, nguyên liệu, cách chế biến đặc biệt..."
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-300 focus:bg-white focus:border-orange-500 focus:outline-hidden"
                ></textarea>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
                {!isNewDishModal ? (
                  <button
                    type="button"
                    onClick={() => handleRequestDeleteDish({ id: editForm.id, name: editForm.name || 'Món ăn này' })}
                    className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs border border-red-200 transition-colors flex items-center gap-1.5 active:scale-95"
                    title="Xóa món ăn này khỏi thực đơn"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Xóa món này</span>
                  </button>
                ) : (
                  <div></div>
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingDish(null);
                      setIsNewDishModal(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs shadow-md flex items-center gap-1.5 transition-all active:scale-95"
                  >
                    <Check className="w-4 h-4" />
                    <span>{isNewDishModal ? 'Thêm món vào thực đơn' : 'Lưu thay đổi món ăn'}</span>
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: XÁC NHẬN XÓA MÓN ĂN */}
      {/* ========================================================= */}
      {userRole === 'admin' && dishToDelete && (
        <div className="fixed inset-0 z-60 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 animate-scaleUp">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-base font-extrabold text-slate-900 text-center mb-1">
              Xác nhận xóa món ăn?
            </h3>
            <p className="text-xs text-slate-600 text-center mb-4 leading-relaxed">
              Bạn có chắc chắn muốn xóa món <span className="font-bold text-red-600">"{dishToDelete.name}"</span> khỏi thực đơn không? Món ăn sẽ được gỡ khỏi danh sách phục vụ và giỏ hàng.
            </p>

            <div className="bg-amber-50 rounded-xl p-3 border border-amber-200 text-[11px] text-amber-800 mb-5 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>Thao tác này sẽ gỡ bỏ món khỏi thực đơn hiện hành. Bạn có thể thêm lại món mới bất cứ lúc nào hoặc bấm "Khôi phục thực đơn gốc".</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDishToDelete(null)}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteDish}
                className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
                <span>Xác nhận xóa</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* FLOATING / STICKY DUI QUOTE TRACKER BAR FOR CUSTOMER */}
      {/* ========================================================= */}
      {activeDuiQuote && (activeDuiQuote.status === 'waiting_weighing' || activeDuiQuote.status === 'quoted') && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-40 animate-slideIn">
          <div className={`p-4 rounded-2xl shadow-2xl border backdrop-blur-md ${
            activeDuiQuote.status === 'waiting_weighing'
              ? 'bg-amber-900/95 text-amber-50 border-amber-500/50'
              : 'bg-emerald-900/95 text-emerald-50 border-emerald-400/50 ring-4 ring-emerald-500/30 animate-pulse'
          }`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  activeDuiQuote.status === 'waiting_weighing' ? 'bg-amber-700 text-amber-200' : 'bg-emerald-700 text-emerald-100'
                }`}>
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-black/40">
                      Đơn #{activeDuiQuote.orderCode}
                    </span>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                      activeDuiQuote.status === 'waiting_weighing' ? 'bg-amber-500 text-black' : 'bg-emerald-400 text-emerald-950 font-black'
                    }`}>
                      {activeDuiQuote.status === 'waiting_weighing' ? '⏳ CHỜ CÂN DÚI' : '🎉 ĐÃ CÓ BÁO GIÁ'}
                    </span>
                  </div>
                  <p className="text-xs font-bold mt-1 text-white">
                    {activeDuiQuote.status === 'waiting_weighing'
                      ? 'Đang chờ Admin bắt Dúi & nhập cân nặng...'
                      : `Tổng giá trọn gói: ${activeDuiQuote.total?.toLocaleString('vi-VN')}đ`}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between gap-2">
              {activeDuiQuote.status === 'waiting_weighing' ? (
                <div className="flex items-center justify-between w-full">
                  <span className="text-[11px] text-amber-200">Admin đang cân tại trại...</span>
                  <button
                    type="button"
                    onClick={() => {
                      const matchedOrder = orders.find(o => o.code === activeDuiQuote.orderCode);
                      if (matchedOrder) setAdminWeighingOrder(matchedOrder);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-amber-950 font-black text-xs transition-colors shadow-xs"
                    title="Mở bảng cân nhanh dành cho Admin"
                  >
                    ⚖️ Cân nhanh (Admin)
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    const matchedOrder = orders.find(o => o.code === activeDuiQuote.orderCode);
                    if (matchedOrder) setCustomerDecisionOrder(matchedOrder);
                  }}
                  className="w-full py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-black text-xs transition-all shadow-md flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Check className="w-4 h-4" />
                  <span>XEM BÁO GIÁ &amp; QUYẾT ĐỊNH NGAY</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: YÊU CẦU BÁO GIÁ MÓN DÚI (CUSTOMER) */}
      {/* ========================================================= */}
      {showDuiQuoteModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 border border-amber-200 max-h-[90vh] overflow-y-auto animate-scaleUp">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-amber-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-black">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Yêu cầu báo giá Món Dúi tươi sống</h3>
                  <p className="text-[11px] text-amber-700 font-semibold">Chuyển trạng thái sang CHỜ CÂN DÚI</p>
                </div>
              </div>
              <button 
                onClick={() => setShowDuiQuoteModal(false)} 
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 mb-4 text-xs text-amber-900 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <Info className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Quy trình phục vụ Dúi tươi sống tại Quán Ăn Ngọc Nhi:</span>
              </p>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-800 ml-1">
                <li>Dúi được bắt sống trực tiếp từ các ô chuồng thương phẩm.</li>
                <li>Admin/Nhân viên sẽ cân ký thực tế và tính tổng giá trọn gói cho quý khách.</li>
                <li>Sau khi nhận báo giá, quý khách có quyền <strong>Đồng ý đặt</strong> hoặc <strong>Chọn lại món</strong>.</li>
              </ul>
            </div>

            {/* Selected Dui Items List */}
            <div className="mb-4 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <p className="text-xs font-bold text-slate-800 mb-2">
                Các món Dúi quý khách đã chọn ({duiItemsInCart.length} món):
              </p>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {cart.map((it, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-200/60 last:border-0">
                    <span className="font-semibold text-slate-800">
                      {it.name} <span className="text-orange-600">x{it.quantity}</span>
                    </span>
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                      Báo giá sau cân
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmitDuiQuoteRequest} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tên của quý khách <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Anh Tuấn, Chị Lan..."
                    value={duiQuoteCustomerName}
                    onChange={(e) => setDuiQuoteCustomerName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-300 focus:bg-white focus:border-amber-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Số điện thoại nhận báo giá <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="VD: 0912 345 678"
                    value={duiQuotePhone}
                    onChange={(e) => setDuiQuotePhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-300 focus:bg-white focus:border-amber-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Hình thức phục vụ
                  </label>
                  <select
                    value={duiQuoteOrderType}
                    onChange={(e) => setDuiQuoteOrderType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-300 focus:bg-white focus:border-amber-500 font-semibold"
                  >
                    <option value="dine_in">Dùng bữa tại quán</option>
                    <option value="delivery">Giao tận nơi (Mang về)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {duiQuoteOrderType === 'dine_in' ? 'Số bàn / Khu vực' : 'Địa chỉ nhận hàng'}
                  </label>
                  <input
                    type="text"
                    placeholder={duiQuoteOrderType === 'dine_in' ? 'VD: Bàn 08 - Chòi sân vườn' : 'VD: 123 Đường Hùng Vương, Tuy Hòa'}
                    value={duiQuoteOrderType === 'dine_in' ? duiQuoteTable : duiQuoteAddress}
                    onChange={(e) => {
                      if (duiQuoteOrderType === 'dine_in') setDuiQuoteTable(e.target.value);
                      else setDuiQuoteAddress(e.target.value);
                    }}
                    className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-300 focus:bg-white focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Yêu cầu chế biến đặc biệt (Ghi chú)
                </label>
                <textarea
                  rows={2}
                  placeholder="VD: Dúi hấp lá lốt làm cay nhẹ, lòng xào mướp, tiết canh hãm đậm đà..."
                  value={duiQuoteNotes}
                  onChange={(e) => setDuiQuoteNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-300 focus:bg-white focus:border-amber-500"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowDuiQuoteModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-extrabold text-xs shadow-lg flex items-center gap-2 active:scale-95 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>GỬI YÊU CẦU &amp; CHỜ CÂN DÚI</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: THÔNG BÁO XÁC NHẬN CHUYỂN SANG CHỜ CÂN DÚI */}
      {/* ========================================================= */}
      {duiQuoteSuccessOrder && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-amber-200 animate-scaleUp text-center">
            <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-3 shadow-inner">
              <Scale className="w-8 h-8 animate-pulse" />
            </div>

            <span className="px-3 py-1 rounded-full bg-amber-600 text-white text-[11px] font-black uppercase tracking-wider">
              TRẠNG THÁI: CHỜ CÂN DÚI
            </span>

            <h3 className="text-lg font-extrabold text-slate-900 mt-3 mb-1">
              Đã gửi yêu cầu báo giá thành công!
            </h3>
            <p className="text-xs text-slate-600 mb-4">
              Mã yêu cầu: <strong className="font-mono text-orange-600 font-bold">#{duiQuoteSuccessOrder.code}</strong>
            </p>

            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-left text-xs text-amber-900 space-y-1.5 mb-5">
              <p className="font-bold text-amber-950">📋 Danh sách món đã chọn:</p>
              <ul className="list-disc list-inside text-[11px] text-amber-800 space-y-0.5">
                {duiQuoteSuccessOrder.items.map((it, idx) => (
                  <li key={idx}><strong>{it.name}</strong> x{it.quantity}</li>
                ))}
              </ul>
              <p className="text-[10px] text-amber-700 pt-1 border-t border-amber-200/60">
                Nhân viên trang trại đang tiến hành bắt và cân dúi thực tế. Báo giá tổng tiền sẽ hiển thị ngay khi Admin cân xong.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDuiQuoteSuccessOrder(null)}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
              >
                Đóng &amp; Theo dõi
              </button>
              <button
                type="button"
                onClick={() => {
                  setAdminWeighingOrder(duiQuoteSuccessOrder);
                  setDuiQuoteSuccessOrder(null);
                }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-1.5"
              >
                <Scale className="w-4 h-4" />
                <span>Cân ngay (Admin test)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: ADMIN BẮT & CÂN DÚI (NHẬP TRỌNG LƯỢNG THỰC TẾ) */}
      {/* ========================================================= */}
      {adminWeighingOrder && (() => {
        const modalDuiDishCount = adminWeighingOrder.duiDishesCount || (adminWeighingOrder.items ? adminWeighingOrder.items.filter(it => it.name.toLowerCase().includes('dúi') || it.name.toLowerCase().includes('tiết canh')).length : 1) || 1;
        const modalCalculatedTotal = Math.round((Number(adminWeighKg) || 1.8) * (Number(adminPricePerKg) || 650000)) + (modalDuiDishCount * 250000);

        return (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-slate-900 text-white rounded-3xl shadow-2xl max-w-xl w-full p-6 border border-amber-500/60 max-h-[90vh] overflow-y-auto animate-scaleUp">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
                    <Scale className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white">Bắt &amp; Cân Dúi - Lập Báo Giá</h3>
                    <p className="text-[11px] text-amber-400 font-semibold">Đơn #{adminWeighingOrder.code} - Khách: {adminWeighingOrder.customerName}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setAdminWeighingOrder(null)} 
                  className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Dish items overview */}
              <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700 mb-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">Các món khách đã chọn:</span>
                  <span className="px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 text-[11px] font-bold">
                    {modalDuiDishCount} món Dúi
                  </span>
                </div>
                <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
                  {adminWeighingOrder.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between text-xs py-0.5 text-slate-300 border-b border-slate-700/50 last:border-0">
                      <span className="font-semibold">{it.name} x{it.quantity}</span>
                      <span className="text-slate-400 text-[11px]">Chờ cân kg</span>
                    </div>
                  ))}
                </div>
                {adminWeighingOrder.notes && (
                  <p className="text-[11px] text-amber-300 bg-amber-950/50 p-2 rounded-lg border border-amber-800/60">
                    <strong>Ghi chú từ khách:</strong> {adminWeighingOrder.notes}
                  </p>
                )}
              </div>

              {/* Weighing Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="bg-slate-800 p-3.5 rounded-2xl border border-slate-700">
                  <label className="block text-xs font-bold text-amber-400 mb-1.5 flex items-center justify-between">
                    <span>Trọng lượng thực tế (kg):</span>
                    <span className="text-[10px] text-slate-400">Đơn vị: kg</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.05"
                      min="0.5"
                      max="10"
                      value={adminWeighKg}
                      onChange={(e) => setAdminWeighKg(parseFloat(e.target.value) || 0)}
                      className="w-full px-3.5 py-2.5 text-lg font-black bg-slate-900 rounded-xl border border-amber-500/80 text-amber-300 focus:ring-2 focus:ring-amber-400 text-center"
                    />
                    <span className="absolute right-3 top-3 text-xs font-bold text-slate-400">KG</span>
                  </div>
                </div>

                <div className="bg-slate-800 p-3.5 rounded-2xl border border-slate-700">
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Đơn giá Dúi tươi (/ kg):
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="10000"
                      min="100000"
                      value={adminPricePerKg}
                      onChange={(e) => setAdminPricePerKg(parseFloat(e.target.value) || 0)}
                      className="w-full px-3.5 py-2.5 text-base font-bold bg-slate-900 rounded-xl border border-slate-600 text-white focus:ring-2 focus:ring-orange-400 text-right pr-8"
                    />
                    <span className="absolute right-3 top-3 text-xs font-bold text-slate-400">đ</span>
                  </div>
                </div>
              </div>

              {/* Internal Formula Breakdown (ADMIN ONLY) */}
              <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 mb-4 space-y-2">
                <div className="flex items-center justify-between text-xs text-amber-300 font-bold">
                  <span>Công thức tính hệ thống (Nội bộ Admin):</span>
                  <span className="text-[10px] bg-amber-900/80 px-2 py-0.5 rounded text-amber-200 font-mono">
                    (Kg × Giá/kg) + (Số món × 250k)
                  </span>
                </div>
                <div className="text-xs space-y-1 text-slate-300">
                  <div className="flex justify-between">
                    <span>1. Tiền Dúi theo cân ({adminWeighKg} kg × {adminPricePerKg.toLocaleString('vi-VN')}đ):</span>
                    <span className="font-bold text-white">{(adminWeighKg * adminPricePerKg).toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="flex justify-between">
                    <span>2. Phí chế biến ({modalDuiDishCount} món × 250.000đ):</span>
                    <span className="font-bold text-white">{(modalDuiDishCount * 250000).toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="pt-2 border-t border-amber-500/30 flex justify-between text-sm font-black text-amber-300">
                    <span>TỔNG BÁO GIÁ GỬI KHÁCH:</span>
                    <span className="text-base text-amber-400">{modalCalculatedTotal.toLocaleString('vi-VN')}đ</span>
                  </div>
                </div>
              </div>

              {/* Privacy reminder */}
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-[11px] text-slate-400 mb-4 flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Khách chỉ thấy <strong>Danh sách món</strong> + <strong>Tổng tiền báo giá</strong>. Tuyệt đối không thấy công thức hay phí 250k.</span>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setAdminWeighingOrder(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={handleAdminSubmitQuote}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs shadow-lg flex items-center gap-2 active:scale-95 cursor-pointer"
                >
                  <Send className="w-4 h-4 text-slate-950" />
                  <span>GỬI BÁO GIÁ CHO KHÁCH</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ========================================================= */}
      {/* MODAL 4: KHÁCH XEM BÁO GIÁ & QUYẾT ĐỊNH (CUSTOMER DECISION) */}
      {/* ========================================================= */}
      {customerDecisionOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 max-h-[90vh] overflow-y-auto animate-scaleUp">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Báo Giá Món Dúi Tươi Sống</h3>
                  <p className="text-[11px] text-slate-500">Quán Ăn &amp; Trang Trại Dúi Ngọc Nhi</p>
                </div>
              </div>
              <button 
                onClick={() => setCustomerDecisionOrder(null)} 
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 mb-4 space-y-3">
              <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200">
                <span className="text-slate-500">Mã yêu cầu:</span>
                <span className="font-mono font-bold text-slate-900">#{customerDecisionOrder.code}</span>
              </div>
              <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200">
                <span className="text-slate-500">Khách hàng:</span>
                <span className="font-bold text-slate-800">{customerDecisionOrder.customerName} ({customerDecisionOrder.phone})</span>
              </div>
              <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200">
                <span className="text-slate-500">Trọng lượng Dúi cân thực tế:</span>
                <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {customerDecisionOrder.duiWeightKg || 1.8} kg
                </span>
              </div>

              {/* Danh sách món đã chọn */}
              <div>
                <p className="text-xs font-bold text-slate-800 mb-1.5">Danh sách món đã chọn:</p>
                <div className="space-y-1 bg-white p-2.5 rounded-xl border border-slate-200">
                  {customerDecisionOrder.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between text-xs py-1 border-b border-slate-100 last:border-0">
                      <span className="font-bold text-slate-800">{it.name}</span>
                      <span className="text-slate-600 font-semibold">x{it.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* TỔNG TIỀN BÁO GIÁ TRỌN GÓI */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-700">Tổng giá trọn gói:</p>
                  <p className="text-[10px] text-slate-500">Đã bao gồm công chế biến &amp; nguyên liệu</p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-orange-600">
                    {customerDecisionOrder.total.toLocaleString('vi-VN')}đ
                  </span>
                </div>
              </div>
            </div>

            {/* Decision Buttons (Requirement 8: Khách chọn Đồng ý đặt / Chọn lại món) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleCustomerDecision(customerDecisionOrder.id, 'reselect')}
                className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-slate-500" />
                <span>CHỌN LẠI MÓN</span>
              </button>

              <button
                type="button"
                onClick={() => handleCustomerDecision(customerDecisionOrder.id, 'accepted')}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs shadow-lg flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>ĐỒNG Ý ĐẶT MÓN</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* FLOATING TOAST NOTIFICATION BANNER */}
      {/* ========================================================= */}
      {editDishNotification && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-slideIn text-xs font-bold">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{editDishNotification}</span>
          <button
            onClick={() => setEditDishNotification(null)}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

    </div>
  );
};

