/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  AppView, 
  UserRole, 
  TableBooking, 
  WeddingInquiry, 
  MenuItem, 
  TableBookingStatus, 
  WeddingStatus,
  RestaurantOrder,
  RestaurantOrderStatus
} from './types';
import { 
  INITIAL_MENU_ITEMS, 
  INITIAL_RESERVATIONS, 
  INITIAL_WEDDING_INQUIRIES, 
  SYSTEM_INFO,
  MANAGERS 
} from './data/initialData';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { MasterPortal } from './components/MasterPortal';
import { FarmModule } from './components/FarmModule';
import { RestaurantModule } from './components/RestaurantModule';
import { WeddingModule } from './components/WeddingModule';
import { OperationsCenter } from './components/OperationsCenter';
import { BookingLookupModal } from './components/BookingLookupModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminToastAlert } from './components/AdminToastAlert';
import { AdminAlertPayload, triggerAdminNotification } from './utils/notificationSound';
import { subscribeToOnlineDatabase, syncOnlinePayload, isOnlineSyncReady, SystemDataPayload } from './services/onlineSyncService';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>(() => {
    try {
      if (typeof window !== 'undefined' && window.location.search) {
        const params = new URLSearchParams(window.location.search);
        const view = params.get('view');
        const qrType = params.get('qrType');
        const cageId = params.get('cageId');
        const rowId = params.get('rowId');
        const areaId = params.get('areaId');

        if (cageId || rowId || areaId || view === 'farm') {
          return 'farm';
        }
        if (view === 'restaurant') return 'restaurant';
        if (view === 'wedding') return 'wedding';
        if (view === 'operations') return 'operations';
        if (view === 'portal' || qrType === 'system') return 'portal';
      }
    } catch (e) {}
    return 'portal';
  });
  const [userRole, setUserRole] = useState<UserRole>(() => {
    try {
      const saved = localStorage.getItem('nn_user_role');
      if (saved === 'admin' || saved === 'guest') return saved;
    } catch (e) {}
    return 'guest';
  });
  const [lookupModalOpen, setLookupModalOpen] = useState(false);
  const [adminLoginModalOpen, setAdminLoginModalOpen] = useState(false);
  const [adminLoginReason, setAdminLoginReason] = useState<string>('');

  // Đồng bộ view khi người dùng quét mã QR hoặc điều hướng qua URL
  useEffect(() => {
    const handleUrlChange = () => {
      try {
        if (!window.location.search) return;
        const params = new URLSearchParams(window.location.search);
        const view = params.get('view');
        const qrType = params.get('qrType');
        const cageId = params.get('cageId');
        const rowId = params.get('rowId');
        const areaId = params.get('areaId');

        if (cageId || rowId || areaId || view === 'farm') {
          setCurrentView('farm');
        } else if (view === 'restaurant') {
          setCurrentView('restaurant');
        } else if (view === 'wedding') {
          setCurrentView('wedding');
        } else if (view === 'operations') {
          setCurrentView('operations');
        } else if (view === 'portal' || qrType === 'system') {
          setCurrentView('portal');
        }
      } catch (e) {}
    };

    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, []);

  // -------------------------------------------------------------
  // ADMIN NOTIFICATIONS ENGINE (Sound Chime + Toasts + Bell List)
  // -------------------------------------------------------------
  const [adminNotifications, setAdminNotifications] = useState<AdminAlertPayload[]>(() => {
    try {
      const saved = localStorage.getItem('nn_admin_notifications');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const realOnly = parsed.filter(n => !n.code?.includes('3048') && !n.id?.includes('3048'));
          return realOnly;
        }
      }
    } catch (e) {}
    return [];
  });

  const [toastNotification, setToastNotification] = useState<AdminAlertPayload | null>(null);
  const [isOnlineConnected, setIsOnlineConnected] = useState<boolean>(true);

  // Lắng nghe Realtime Database Online (Firestore) toàn hệ thống
  useEffect(() => {
    const unsubscribe = subscribeToOnlineDatabase(
      (onlineData) => {
        setIsOnlineConnected(true);
        if (onlineData.menuItems && onlineData.menuItems.length > 0) {
          setMenuItems(onlineData.menuItems);
        }
        if (onlineData.bookings) {
          const clean = onlineData.bookings.filter(b => !['tb-001', 'tb-002', 'tb-003', 'tb-3048'].includes(b.id) && b.code !== 'NN-TB-3048');
          setBookings(clean);
        }
        if (onlineData.weddingInquiries) {
          const clean = onlineData.weddingInquiries.filter(w => !['wd-001', 'wd-002', 'wd-003'].includes(w.id));
          setWeddingInquiries(clean);
        }
        if (onlineData.restaurantOrders) {
          setRestaurantOrders(onlineData.restaurantOrders);
        }
        if (onlineData.duiOrders) {
          setDuiOrders(onlineData.duiOrders);
        }
        if (onlineData.adminNotifications) {
          setAdminNotifications(onlineData.adminNotifications);
        }
        // Phát event thông báo để các view độc lập (Farm, Operations) nhận diện cập nhật
        window.dispatchEvent(new CustomEvent('nn_data_sync'));
      },
      (error) => {
        console.warn('Firestore offline hoặc đang kết nối lại:', error);
        setIsOnlineConnected(false);
      }
    );

    // Lắng nghe sự kiện cập nhật Physical Registry để đồng bộ Online Firestore ngay lập tức
    const handlePhysicalRegistryUpdate = (e: any) => {
      const reg = e?.detail;
      if (reg) {
        syncOnlinePayload({ physicalRegistry: reg });
      }
    };
    window.addEventListener('nn_physical_registry_updated', handlePhysicalRegistryUpdate);

    return () => {
      unsubscribe();
      window.removeEventListener('nn_physical_registry_updated', handlePhysicalRegistryUpdate);
    };
  }, []);

  // Sync notifications with localStorage & custom broadcast events
  useEffect(() => {
    const handleAdminAlertEvent = (e: any) => {
      const notif = e?.detail;
      if (notif) {
        setAdminNotifications(prev => [notif, ...prev.slice(0, 49)]);
        setToastNotification(notif);
      }
    };

    const handleStorageSync = (e: StorageEvent) => {
      if (!e.key || e.key === 'nn_admin_notifications') {
        try {
          const raw = localStorage.getItem('nn_admin_notifications');
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              setAdminNotifications(parsed);
            }
          }
        } catch (err) {}
      }
    };

    window.addEventListener('nn_admin_alert', handleAdminAlertEvent);
    window.addEventListener('storage', handleStorageSync);
    return () => {
      window.removeEventListener('nn_admin_alert', handleAdminAlertEvent);
      window.removeEventListener('storage', handleStorageSync);
    };
  }, []);

  const handleClearNotifications = () => {
    setAdminNotifications([]);
    localStorage.setItem('nn_admin_notifications', JSON.stringify([]));
  };

  const handleMarkNotificationRead = (id: string) => {
    setAdminNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      localStorage.setItem('nn_admin_notifications', JSON.stringify(updated));
      return updated;
    });
  };

  const handleMarkAllNotificationsRead = () => {
    setAdminNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      localStorage.setItem('nn_admin_notifications', JSON.stringify(updated));
      return updated;
    });
  };

  const handleOpenAdminLogin = (reason?: string) => {
    setAdminLoginReason(reason || 'Vui lòng đăng nhập quyền Quản Trị Viên');
    setAdminLoginModalOpen(true);
  };

  // Synchronize role across windows/components
  useEffect(() => {
    const handleRoleSync = (e: any) => {
      const newRole = e?.detail?.role || localStorage.getItem('nn_user_role');
      if (newRole === 'admin' || newRole === 'guest') {
        setUserRole(newRole);
      }
    };
    window.addEventListener('nn_role_sync', handleRoleSync);
    window.addEventListener('storage', handleRoleSync);
    return () => {
      window.removeEventListener('nn_role_sync', handleRoleSync);
      window.removeEventListener('storage', handleRoleSync);
    };
  }, []);

  // Handle role toggle with safety check & broadcast
  const handleSetUserRole = (role: UserRole) => {
    setUserRole(role);
    localStorage.setItem('nn_user_role', role);
    window.dispatchEvent(new CustomEvent('nn_role_sync', { detail: { role } }));
    window.dispatchEvent(new CustomEvent('nn_data_sync'));
    if (role === 'guest' && currentView === 'operations') {
      setCurrentView('portal');
    }
  };

  // Dui Product Orders State (Persisted)
  const [duiOrders, setDuiOrders] = useState<any[]>(() => {
    const saved = localStorage.getItem('nn_dui_orders');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return [];
  });

  const isDuiMounted = useRef(false);
  useEffect(() => {
    if (!isDuiMounted.current) {
      isDuiMounted.current = true;
      return;
    }
    localStorage.setItem('nn_dui_orders', JSON.stringify(duiOrders));
    window.dispatchEvent(new CustomEvent('nn_data_sync'));
    if (isOnlineSyncReady()) {
      syncOnlinePayload({ duiOrders });
    }
  }, [duiOrders]);

  const handleAddDuiOrder = (newOrderData: any) => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newOrder = {
      ...newOrderData,
      id: `dui-ord-${Date.now()}`,
      code: `NN-DUI-${randomNum}`,
      status: 'new',
      createdAt: new Date().toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    setDuiOrders(prev => [newOrder, ...prev]);

    // Dispatch instant admin sound chime & notification alert
    triggerAdminNotification({
      id: `notif-${newOrder.id}`,
      type: 'farm_order',
      title: '🦔 Đơn Đặt Mua Dúi Con Giống / Thịt Mới',
      message: `Khách: ${newOrder.customerName} (${newOrder.phone}) • ${newOrder.productName} (${newOrder.quantity} ${newOrder.unit}) • Tạm tính: ${(newOrder.estimatedTotal || 0).toLocaleString('vi-VN')}đ`,
      code: newOrder.code,
      customerName: newOrder.customerName,
      phone: newOrder.phone,
      amount: newOrder.estimatedTotal,
      view: 'farm',
    });

    return newOrder;
  };

  const handleUpdateDuiOrderStatus = (orderId: string, status: any) => {
    setDuiOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  // Application Data States
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('nn_menu_items_v6');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 20) {
          return parsed;
        }
      } catch (e) {}
    }
    return INITIAL_MENU_ITEMS;
  });

  const [bookings, setBookings] = useState<TableBooking[]>(() => {
    const saved = localStorage.getItem('nn_table_bookings');
    let loaded: TableBooking[] = [];
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Filter out legacy mock/test seeds to ensure true clean data
          loaded = parsed.filter(b => !['tb-001', 'tb-002', 'tb-003', 'tb-3048'].includes(b.id) && b.code !== 'NN-TB-3048');
        }
      } catch (e) {}
    }
    return loaded;
  });

  const [weddingInquiries, setWeddingInquiries] = useState<WeddingInquiry[]>(() => {
    const saved = localStorage.getItem('nn_wedding_inquiries');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Filter out legacy mock data to ensure clean 0-based start
          const realOnly = parsed.filter(w => !['wd-001', 'wd-002', 'wd-003'].includes(w.id));
          return realOnly;
        }
      } catch (e) {}
    }
    return [];
  });

  // Online Food & Restaurant Orders State (Synchronized)
  const [restaurantOrders, setRestaurantOrders] = useState<RestaurantOrder[]>(() => {
    const saved = localStorage.getItem('nn_restaurant_orders');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return [];
  });

  // Cross-tab real-time BroadcastChannel to sync bookings & orders instantly across windows/tabs
  const syncChannelRef = useRef<BroadcastChannel | null>(null);
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel('nn_cross_tab_sync');
        syncChannelRef.current = bc;
        bc.onmessage = (ev) => {
          if (!ev.data) return;
          if (ev.data.type === 'BOOKINGS_SYNC' && Array.isArray(ev.data.payload)) {
            const clean = ev.data.payload.filter((b: any) => !['tb-001', 'tb-002', 'tb-003', 'tb-3048'].includes(b.id) && b.code !== 'NN-TB-3048');
            setBookings(clean);
          }
          if (ev.data.type === 'ORDERS_SYNC' && Array.isArray(ev.data.payload)) {
            setRestaurantOrders(ev.data.payload);
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

  // Synchronize data across other browser windows/tabs and custom data events
  useEffect(() => {
    const handleStorageSync = () => {
      try {
        const savedOrders = localStorage.getItem('nn_restaurant_orders');
        if (savedOrders) {
          const parsed = JSON.parse(savedOrders);
          if (Array.isArray(parsed)) {
            setRestaurantOrders(prev => JSON.stringify(prev) !== JSON.stringify(parsed) ? parsed : prev);
          }
        }
        const savedMenu = localStorage.getItem('nn_menu_items_v6');
        if (savedMenu) {
          const parsed = JSON.parse(savedMenu);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMenuItems(prev => JSON.stringify(prev) !== JSON.stringify(parsed) ? parsed : prev);
          }
        }
        const savedBookings = localStorage.getItem('nn_table_bookings');
        if (savedBookings) {
          const parsed = JSON.parse(savedBookings);
          if (Array.isArray(parsed)) {
            const realOnly = parsed.filter(b => !['tb-001', 'tb-002', 'tb-003', 'tb-3048'].includes(b.id) && b.code !== 'NN-TB-3048');
            setBookings(prev => JSON.stringify(prev) !== JSON.stringify(realOnly) ? realOnly : prev);
          }
        }
        const savedInquiries = localStorage.getItem('nn_wedding_inquiries');
        if (savedInquiries) {
          const parsed = JSON.parse(savedInquiries);
          if (Array.isArray(parsed)) {
            const realOnly = parsed.filter(w => !['wd-001', 'wd-002', 'wd-003'].includes(w.id));
            setWeddingInquiries(prev => JSON.stringify(prev) !== JSON.stringify(realOnly) ? realOnly : prev);
          }
        }
      } catch (err) {}
    };

    window.addEventListener('storage', handleStorageSync);
    window.addEventListener('nn_data_sync', handleStorageSync);
    return () => {
      window.removeEventListener('storage', handleStorageSync);
      window.removeEventListener('nn_data_sync', handleStorageSync);
    };
  }, []);

  // Handler to update online restaurant orders
  const handleUpdateRestaurantOrderStatus = (
    orderId: string, 
    status: RestaurantOrderStatus, 
    additionalData?: Partial<RestaurantOrder>
  ) => {
    setRestaurantOrders(prev => {
      const next = prev.map(o => o.id === orderId ? { ...o, status, ...additionalData, updatedAt: new Date().toISOString() } : o);
      try {
        localStorage.setItem('nn_restaurant_orders', JSON.stringify(next));
        syncChannelRef.current?.postMessage({ type: 'ORDERS_SYNC', payload: next });
      } catch (e) {}
      window.dispatchEvent(new CustomEvent('nn_data_sync'));
      return next;
    });
  };

  // Safe persistence refs to prevent wiping localStorage on initial mount
  const isMenuMounted = useRef(false);
  const isBookingsMounted = useRef(false);
  const isWeddingsMounted = useRef(false);

  useEffect(() => {
    if (!isMenuMounted.current) {
      isMenuMounted.current = true;
      return;
    }
    try {
      localStorage.setItem('nn_menu_items_v6', JSON.stringify(menuItems));
    } catch (e) {}
    window.dispatchEvent(new CustomEvent('nn_data_sync'));
    if (isOnlineSyncReady()) {
      syncOnlinePayload({ menuItems });
    }
  }, [menuItems]);

  useEffect(() => {
    if (!isBookingsMounted.current) {
      isBookingsMounted.current = true;
      return;
    }
    try {
      localStorage.setItem('nn_table_bookings', JSON.stringify(bookings));
      syncChannelRef.current?.postMessage({ type: 'BOOKINGS_SYNC', payload: bookings });
    } catch (e) {}
    window.dispatchEvent(new CustomEvent('nn_data_sync'));
    if (isOnlineSyncReady()) {
      syncOnlinePayload({ bookings });
    }
  }, [bookings]);

  useEffect(() => {
    if (!isWeddingsMounted.current) {
      isWeddingsMounted.current = true;
      return;
    }
    try {
      localStorage.setItem('nn_wedding_inquiries', JSON.stringify(weddingInquiries));
      syncChannelRef.current?.postMessage({ type: 'WEDDING_SYNC', payload: weddingInquiries });
    } catch (e) {}
    window.dispatchEvent(new CustomEvent('nn_data_sync'));
    if (isOnlineSyncReady()) {
      syncOnlinePayload({ weddingInquiries });
    }
  }, [weddingInquiries]);

  const isRestaurantOrdersMounted = useRef(false);
  useEffect(() => {
    if (!isRestaurantOrdersMounted.current) {
      isRestaurantOrdersMounted.current = true;
      return;
    }
    if (isOnlineSyncReady()) {
      syncOnlinePayload({ restaurantOrders });
    }
  }, [restaurantOrders]);

  // Scroll to top on navigation & protect admin views
  const handleNavigate = (view: AppView) => {
    if (view === 'operations' && userRole !== 'admin') {
      handleOpenAdminLogin('Vui lòng đăng nhập tài khoản Quản Trị để truy cập Trung Tâm Điều Hành');
      return;
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handlers for Restaurant Data
  const handleAddBooking = (newBookingData: Omit<TableBooking, 'id' | 'code' | 'createdAt' | 'status'>): TableBooking => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newBooking: TableBooking = {
      ...newBookingData,
      id: `tb-${Date.now()}`,
      code: `NN-TB-${randomNum}`,
      status: 'new',
      createdAt: new Date().toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    // Atomic persistence to LocalStorage first to eliminate race conditions
    let currentBookings: TableBooking[] = [];
    try {
      const saved = localStorage.getItem('nn_table_bookings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          currentBookings = parsed.filter(b => !['tb-001', 'tb-002', 'tb-003'].includes(b.id));
        }
      }
    } catch (e) {}

    const updated = [newBooking, ...currentBookings.filter(b => b.id !== newBooking.id && b.code !== newBooking.code)];
    try {
      localStorage.setItem('nn_table_bookings', JSON.stringify(updated));
      syncChannelRef.current?.postMessage({ type: 'BOOKINGS_SYNC', payload: updated });
    } catch (e) {}

    setBookings(updated);
    window.dispatchEvent(new CustomEvent('nn_data_sync'));

    const preOrderMsg = newBooking.preOrderItems && newBooking.preOrderItems.length > 0
      ? ` • Đặt trước ${newBooking.preOrderItems.length} món (${(newBooking.preOrderTotal || 0).toLocaleString('vi-VN')}đ)`
      : '';

    // Dispatch instant admin sound chime & notification alert
    triggerAdminNotification({
      id: `notif-${newBooking.id}`,
      type: 'booking',
      title: newBooking.preOrderItems && newBooking.preOrderItems.length > 0 
        ? '🍽️ Khách Vừa Đặt Bàn & Chọn Món Trước' 
        : '🍽️ Khách Hàng Vừa Đặt Bàn Mới',
      message: `Khách: ${newBooking.customerName} (${newBooking.phone}) • ${newBooking.guestCount} khách • ${newBooking.bookingTime} ngày ${newBooking.bookingDate} (${newBooking.tableArea || 'Khu sân vườn'})${preOrderMsg}`,
      code: newBooking.code,
      customerName: newBooking.customerName,
      phone: newBooking.phone,
      amount: newBooking.preOrderTotal,
      view: 'restaurant',
    });

    return newBooking;
  };

  const handleUpdateBookingStatus = (bookingId: string, status: TableBookingStatus, updates?: Partial<TableBooking>) => {
    setBookings(prev => {
      const updated = prev.map(b => b.id === bookingId ? { ...b, status, ...(updates || {}), updatedAt: new Date().toISOString() } : b);
      try {
        localStorage.setItem('nn_table_bookings', JSON.stringify(updated));
        syncChannelRef.current?.postMessage({ type: 'BOOKINGS_SYNC', payload: updated });
      } catch (e) {}
      window.dispatchEvent(new CustomEvent('nn_data_sync'));
      return updated;
    });
  };

  const handleAddRestaurantOrder = (orderData: Omit<RestaurantOrder, 'id' | 'code' | 'createdAt'> | RestaurantOrder): RestaurantOrder => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newOrder: RestaurantOrder = {
      ...orderData,
      id: ('id' in orderData && orderData.id) ? orderData.id : `ord-${Date.now()}`,
      code: ('code' in orderData && orderData.code) ? orderData.code : `NN-DH-${randomNum}`,
      createdAt: ('createdAt' in orderData && orderData.createdAt) ? orderData.createdAt : new Date().toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    let currentOrders: RestaurantOrder[] = [];
    try {
      const saved = localStorage.getItem('nn_restaurant_orders');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) currentOrders = parsed;
      }
    } catch (e) {}

    const updated = [newOrder, ...currentOrders.filter(o => o.id !== newOrder.id && o.code !== newOrder.code)];
    try {
      localStorage.setItem('nn_restaurant_orders', JSON.stringify(updated));
    } catch (e) {}

    setRestaurantOrders(updated);
    window.dispatchEvent(new CustomEvent('nn_data_sync'));
    return newOrder;
  };

  const handleUpdateMenuItem = (updatedItem: MenuItem) => {
    setMenuItems(prev => prev.map(m => m.id === updatedItem.id ? updatedItem : m));
  };

  const handleAddMenuItem = (newItem: MenuItem) => {
    setMenuItems(prev => [newItem, ...prev]);
  };

  const handleDeleteMenuItem = (itemId: string) => {
    setMenuItems(prev => prev.filter(m => m.id !== itemId));
  };

  const handleBatchReplaceMenuItems = (newItems: MenuItem[]) => {
    setMenuItems(newItems);
  };

  const handleResetDefaultMenuItems = () => {
    setMenuItems(INITIAL_MENU_ITEMS);
  };

  // Handlers for Wedding Data
  const handleAddWeddingInquiry = (newInquiryData: Omit<WeddingInquiry, 'id' | 'code' | 'createdAt' | 'status'>): WeddingInquiry => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newInquiry: WeddingInquiry = {
      ...newInquiryData,
      id: `wd-${Date.now()}`,
      code: `NN-WD-${randomNum}`,
      status: 'new',
      createdAt: new Date().toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    let currentInquiries: WeddingInquiry[] = [];
    try {
      const saved = localStorage.getItem('nn_wedding_inquiries');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          currentInquiries = parsed.filter(w => !['wd-001', 'wd-002', 'wd-003'].includes(w.id));
        }
      }
    } catch (e) {}

    const updated = [newInquiry, ...currentInquiries.filter(w => w.id !== newInquiry.id && w.code !== newInquiry.code)];
    try {
      localStorage.setItem('nn_wedding_inquiries', JSON.stringify(updated));
    } catch (e) {}

    setWeddingInquiries(updated);
    window.dispatchEvent(new CustomEvent('nn_data_sync'));

    // Dispatch instant admin sound chime & notification alert
    triggerAdminNotification({
      id: `notif-${newInquiry.id}`,
      type: 'wedding',
      title: '💍 Yêu Cầu Tư Vấn Tiệc Cưới Mới',
      message: `Khách: ${newInquiry.customerName} (${newInquiry.phone}) • ${newInquiry.expectedTables} bàn (${newInquiry.expectedGuests} khách) • Ngày ${newInquiry.eventDate} • Gói: ${newInquiry.packageName || 'Tự chọn'}`,
      code: newInquiry.code,
      customerName: newInquiry.customerName,
      phone: newInquiry.phone,
      view: 'wedding',
    });

    return newInquiry;
  };

  const handleUpdateWeddingStatus = (inquiryId: string, status: WeddingStatus, deposit?: number) => {
    setWeddingInquiries(prev => {
      const updated = prev.map(w =>
        w.id === inquiryId
          ? { 
              ...w, 
              status, 
              depositAmount: deposit !== undefined ? deposit : w.depositAmount,
              updatedAt: new Date().toISOString()
            }
          : w
      );
      try {
        localStorage.setItem('nn_wedding_inquiries', JSON.stringify(updated));
      } catch (e) {}
      window.dispatchEvent(new CustomEvent('nn_data_sync'));
      return updated;
    });
  };

  // Pending counts for admin alerts
  const pendingBookingsCount = bookings.filter(b => b.status === 'new').length;
  const pendingWeddingCount = weddingInquiries.filter(w => w.status === 'new').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-amber-500 selection:text-white">
      {/* Unified Master Header */}
      <Header
        currentView={currentView}
        onNavigate={handleNavigate}
        userRole={userRole}
        onToggleRole={handleSetUserRole}
        onOpenLookupModal={() => setLookupModalOpen(true)}
        onOpenAdminLogin={handleOpenAdminLogin}
        pendingBookingsCount={pendingBookingsCount}
        pendingWeddingCount={pendingWeddingCount}
        notifications={adminNotifications}
        onClearNotifications={handleClearNotifications}
        onMarkNotificationRead={handleMarkNotificationRead}
        onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
        isOnlineConnected={isOnlineConnected}
      />

      {/* Real-time Admin Live Toast Popup */}
      <AdminToastAlert
        notification={toastNotification}
        onClose={() => setToastNotification(null)}
        onNavigate={handleNavigate}
      />

      {/* Main Dynamic View Content */}
      <main className={`flex-1 w-full mx-auto ${
        currentView === 'restaurant' ? 'max-w-[1740px] px-2 sm:px-4 pt-3' : 'max-w-7xl px-4 sm:px-6 lg:px-8 pt-8'
      }`}>
        {currentView === 'portal' && (
          <MasterPortal
            onNavigate={handleNavigate}
            userRole={userRole}
            pendingBookingsCount={pendingBookingsCount}
            pendingWeddingCount={pendingWeddingCount}
            orders={restaurantOrders}
            bookings={bookings}
            weddingInquiries={weddingInquiries}
            onUpdateOrderStatus={handleUpdateRestaurantOrderStatus}
            onUpdateBookingStatus={handleUpdateBookingStatus}
            onUpdateWeddingStatus={handleUpdateWeddingStatus}
          />
        )}

        {currentView === 'farm' && (
          <FarmModule 
            onBackToPortal={() => handleNavigate('portal')} 
            userRole={userRole}
            duiOrders={duiOrders}
            onAddDuiOrder={handleAddDuiOrder}
            onUpdateDuiOrderStatus={handleUpdateDuiOrderStatus}
            onOpenAdminLogin={handleOpenAdminLogin}
          />
        )}

        {currentView === 'restaurant' && (
          <RestaurantModule
            userRole={userRole}
            menuItems={menuItems}
            onUpdateMenuItem={handleUpdateMenuItem}
            onAddMenuItem={handleAddMenuItem}
            onDeleteMenuItem={handleDeleteMenuItem}
            onBatchReplaceMenuItems={handleBatchReplaceMenuItems}
            onResetDefaultMenuItems={handleResetDefaultMenuItems}
            bookings={bookings}
            onAddBooking={handleAddBooking}
            onUpdateBookingStatus={handleUpdateBookingStatus}
            orders={restaurantOrders}
            onAddRestaurantOrder={handleAddRestaurantOrder}
            onOpenAdminLogin={handleOpenAdminLogin}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'wedding' && (
          <WeddingModule
            userRole={userRole}
            menuItems={menuItems}
            onUpdateMenuItem={handleUpdateMenuItem}
            onAddMenuItem={handleAddMenuItem}
            onDeleteMenuItem={handleDeleteMenuItem}
            onBatchReplaceMenuItems={handleBatchReplaceMenuItems}
            weddingInquiries={weddingInquiries}
            onAddWeddingInquiry={handleAddWeddingInquiry}
            onUpdateWeddingStatus={handleUpdateWeddingStatus}
          />
        )}

        {currentView === 'operations' && (
          <OperationsCenter
            userRole={userRole}
            onNavigate={handleNavigate}
            bookings={bookings}
            weddingInquiries={weddingInquiries}
            menuItems={menuItems}
            onUpdateBookingStatus={handleUpdateBookingStatus}
            onUpdateWeddingStatus={handleUpdateWeddingStatus}
          />
        )}
      </main>

      {/* Customer Self-Lookup Modal */}
      <BookingLookupModal
        isOpen={lookupModalOpen}
        onClose={() => setLookupModalOpen(false)}
        bookings={bookings}
        weddingInquiries={weddingInquiries}
        onReorderBooking={() => {
          handleNavigate('restaurant');
        }}
      />

      {/* Admin Authentication & Credential Management Modal */}
      <AdminLoginModal
        isOpen={adminLoginModalOpen}
        onClose={() => setAdminLoginModalOpen(false)}
        onLoginSuccess={() => {
          handleSetUserRole('admin');
          if (adminLoginReason.includes('Trung Tâm Điều Hành')) {
            setCurrentView('operations');
          }
        }}
        requiredActionNote={adminLoginReason}
      />

      {/* Unified Master Footer */}
      <Footer onNavigate={handleNavigate} userRole={userRole} />
    </div>
  );
}
