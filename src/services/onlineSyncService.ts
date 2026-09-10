/**
 * Dịch vụ đồng bộ dữ liệu Online thời gian thực (Firebase Realtime Database)
 * Hệ thống Dịch Vụ Ngọc Nhi (Trang Trại Dúi • Quán Ăn • Tiệc Cưới • Điều Hành)
 * 
 * Kết nối trực tiếp vào:
 * https://hethongdichvungocnhi-default-rtdb.asia-southeast1.firebasedatabase.app
 * 
 * Ưu điểm của Firebase Realtime Database:
 * 1. Đồng bộ tức thì (Latency cực thấp < 100ms) giữa máy tính, máy tính bảng và điện thoại.
 * 2. Không bị giới hạn domain (chạy mượt mà trên Vercel, localhost, custom domain).
 * 3. Tách nhánh độc lập theo từng phân hệ (/nn_modules/{moduleName}).
 * 4. Tự động chuyển đổi và migration dữ liệu từ LocalStorage lên Cloud Realtime Database khi chạy lần đầu.
 */

import { 
  ref, 
  onValue, 
  set, 
  get, 
  Unsubscribe 
} from 'firebase/database';
import { rtdb, ensureAuth } from './firebase';
import { 
  TableBooking, 
  WeddingInquiry, 
  MenuItem, 
  RestaurantOrder, 
  DuiProductOrder, 
  ExternalFinanceRecord 
} from '../types';
import { FarmArea, FarmRow, FarmCage, DisinfectionLogItem, FarmTask } from '../components/farm/farmTypes';
import { PhysicalLocationRecord, getPhysicalRegistry, savePhysicalRegistry } from '../utils/qrHelper';
import { 
  INITIAL_MENU_ITEMS 
} from '../data/initialData';
import { 
  INITIAL_AREAS, 
  INITIAL_ROWS, 
  INITIAL_CAGES, 
  INITIAL_DISINFECTION_LOGS 
} from '../components/farm/farmData';
import { AdminAlertPayload } from '../utils/notificationSound';

// Đường dẫn nhánh gốc lưu trữ các phân hệ trong Realtime Database
export const MODULES_COLLECTION = 'nn_modules';
export const MODULES_PATH = 'nn_modules';

export interface SystemDataPayload {
  menuItems: MenuItem[];
  bookings: TableBooking[];
  weddingInquiries: WeddingInquiry[];
  restaurantOrders: RestaurantOrder[];
  duiOrders: DuiProductOrder[];
  externalRecords: ExternalFinanceRecord[];
  adminNotifications: AdminAlertPayload[];
  farmAreas: FarmArea[];
  farmRows: FarmRow[];
  farmCages: FarmCage[];
  farmDisinfection: DisinfectionLogItem[];
  farmTasks: FarmTask[];
  physicalRegistry: Record<string, PhysicalLocationRecord>;
}

// Trạng thái kiểm soát vòng đời Cloud Sync
let isCloudReady = false;
let isInitializing = false;
const lastKnownHashes: Record<string, string> = {};

// Debounce queue quản lý ghi dữ liệu Realtime Database để gom cụm các thao tác liên tiếp
let debounceTimer: any = null;
let pendingSyncPayload: Partial<SystemDataPayload> = {};

/**
 * Kiểm tra trạng thái quota (giữ hàm để tương thích giao diện và module khác)
 */
export function isFirestoreQuotaExhausted(): boolean {
  return false;
}

/**
 * Báo lỗi thao tác Realtime Database ra console và CustomEvent cho ứng dụng
 */
function reportDatabaseError(contextMsg: string, err?: any) {
  const errMsg = err?.message || String(err || 'Không rõ lỗi');
  console.warn(`⚠️ [Realtime Database Error - ${contextMsg}]:`, errMsg);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('nn_sync_error', { 
      detail: { context: contextMsg, error: err, message: errMsg } 
    }));
  }
}

/**
 * Kiểm tra xem thiết bị đã kết nối và tải dữ liệu từ Realtime Database hay chưa
 */
export function isOnlineSyncReady(): boolean {
  return isCloudReady;
}

/**
 * Hàm tính chuỗi đại diện để nhận diện thay đổi thực sự, tránh vòng lặp echo giữa local và remote
 */
function fastHash(data: any): string {
  try {
    return JSON.stringify(data);
  } catch (e) {
    return '';
  }
}

/**
 * Đọc dữ liệu cục bộ từ localStorage để dự phòng hoặc phục vụ migration lần đầu
 */
export function getLocalFallbackData(): SystemDataPayload {
  let menuItems: MenuItem[] = INITIAL_MENU_ITEMS;
  try {
    const s = localStorage.getItem('nn_menu_items_v6');
    if (s) {
      const p = JSON.parse(s);
      if (Array.isArray(p) && p.length > 0) menuItems = p;
    }
  } catch (e) {}

  let bookings: TableBooking[] = [];
  try {
    const s = localStorage.getItem('nn_table_bookings');
    if (s) {
      const p = JSON.parse(s);
      if (Array.isArray(p)) {
        bookings = p.filter((b: any) => !['tb-001', 'tb-002', 'tb-003', 'tb-3048'].includes(b.id) && b.code !== 'NN-TB-3048');
      }
    }
  } catch (e) {}

  let weddingInquiries: WeddingInquiry[] = [];
  try {
    const s = localStorage.getItem('nn_wedding_inquiries');
    if (s) {
      const p = JSON.parse(s);
      if (Array.isArray(p)) {
        weddingInquiries = p.filter((w: any) => !['wd-001', 'wd-002', 'wd-003'].includes(w.id));
      }
    }
  } catch (e) {}

  let restaurantOrders: RestaurantOrder[] = [];
  try {
    const s = localStorage.getItem('nn_restaurant_orders');
    if (s) {
      const p = JSON.parse(s);
      if (Array.isArray(p)) restaurantOrders = p;
    }
  } catch (e) {}

  let duiOrders: DuiProductOrder[] = [];
  try {
    const s = localStorage.getItem('nn_dui_orders');
    if (s) {
      const p = JSON.parse(s);
      if (Array.isArray(p)) duiOrders = p;
    }
  } catch (e) {}

  let externalRecords: ExternalFinanceRecord[] = [];
  try {
    const s = localStorage.getItem('nn_external_finance_transactions');
    if (s) {
      const p = JSON.parse(s);
      if (Array.isArray(p)) externalRecords = p;
    }
  } catch (e) {}

  let adminNotifications: AdminAlertPayload[] = [];
  try {
    const s = localStorage.getItem('nn_admin_notifications');
    if (s) {
      const p = JSON.parse(s);
      if (Array.isArray(p)) adminNotifications = p.filter((n: any) => !n.code?.includes('3048') && !n.id?.includes('3048'));
    }
  } catch (e) {}

  let farmAreas: FarmArea[] = INITIAL_AREAS;
  try {
    const s = localStorage.getItem('farm_areas_real_v3');
    if (s) {
      const p = JSON.parse(s);
      if (Array.isArray(p) && p.length > 0) farmAreas = p;
    }
  } catch (e) {}

  let farmRows: FarmRow[] = INITIAL_ROWS;
  try {
    const s = localStorage.getItem('farm_rows_real_v3');
    if (s) {
      const p = JSON.parse(s);
      if (Array.isArray(p) && p.length > 0) farmRows = p;
    }
  } catch (e) {}

  let farmCages: FarmCage[] = INITIAL_CAGES;
  try {
    const s = localStorage.getItem('farm_cages_real_v3');
    if (s) {
      const p = JSON.parse(s);
      if (Array.isArray(p) && p.length > 0) farmCages = p;
    }
  } catch (e) {}

  let farmDisinfection: DisinfectionLogItem[] = INITIAL_DISINFECTION_LOGS;
  try {
    const s = localStorage.getItem('farm_disinfection_real_v3');
    if (s) {
      const p = JSON.parse(s);
      if (Array.isArray(p)) farmDisinfection = p;
    }
  } catch (e) {}

  let farmTasks: FarmTask[] = [];
  try {
    const s = localStorage.getItem('farm_custom_tasks_v3');
    if (s) {
      const p = JSON.parse(s);
      if (Array.isArray(p)) farmTasks = p;
    }
  } catch (e) {}

  const physicalRegistry = getPhysicalRegistry();

  return {
    menuItems,
    bookings,
    weddingInquiries,
    restaurantOrders,
    duiOrders,
    externalRecords,
    adminNotifications,
    farmAreas,
    farmRows,
    farmCages,
    farmDisinfection,
    farmTasks,
    physicalRegistry
  };
}

/**
 * Đăng ký lắng nghe Realtime từ Firebase Realtime Database
 */
export function subscribeToOnlineDatabase(
  onDataChange: (data: Partial<SystemDataPayload>) => void,
  onError?: (error: any) => void
): Unsubscribe {
  let unsubscribeSnapshot: Unsubscribe = () => {};

  async function initAndListen() {
    if (isInitializing) return;
    isInitializing = true;

    try {
      // 1. Kích hoạt phiên xác thực nếu cần
      try {
        await Promise.race([
          ensureAuth(),
          new Promise((r) => setTimeout(r, 800))
        ]);
      } catch (e) {}

      // 2. Lắng nghe trạng thái kết nối mạng của Realtime Database
      try {
        const connectedRef = ref(rtdb, '.info/connected');
        onValue(connectedRef, (snap) => {
          const isConnected = snap.val() === true;
          if (isConnected) {
            console.log('✓ Đã kết nối Firebase Realtime Database thành công (hethongdichvungocnhi-default-rtdb)');
          }
        });
      } catch (e) {}

      // 3. Đọc dữ liệu ban đầu hoặc kiểm tra xem Realtime Database đã có dữ liệu chưa
      const rootModulesRef = ref(rtdb, MODULES_PATH);
      let initialSnap: any = null;
      try {
        initialSnap = await get(rootModulesRef);
      } catch (getErr: any) {
        reportDatabaseError('Đọc dữ liệu ban đầu', getErr);
        if (onError) onError(getErr);
        onDataChange(getLocalFallbackData());
        isCloudReady = true;
      }

      const hasOnlineData = initialSnap && initialSnap.exists() && initialSnap.val();

      if (hasOnlineData) {
        // TRƯỜNG HỢP 1: Realtime Database ĐÃ CÓ DỮ LIỆU
        console.log('✓ Phát hiện dữ liệu trên Firebase Realtime Database. Đang đồng bộ về thiết bị...');
        const modulesData = initialSnap.val();
        const initialPayload: Partial<SystemDataPayload> = {};

        if (modulesData.restaurant_menu?.items && Array.isArray(modulesData.restaurant_menu.items)) {
          initialPayload.menuItems = modulesData.restaurant_menu.items;
          lastKnownHashes['menuItems'] = fastHash(modulesData.restaurant_menu.items);
          localStorage.setItem('nn_menu_items_v6', JSON.stringify(modulesData.restaurant_menu.items));
        }

        if (modulesData.table_bookings?.items && Array.isArray(modulesData.table_bookings.items)) {
          const clean = modulesData.table_bookings.items.filter((b: any) => !['tb-001', 'tb-002', 'tb-003', 'tb-3048'].includes(b.id) && b.code !== 'NN-TB-3048');
          initialPayload.bookings = clean;
          lastKnownHashes['bookings'] = fastHash(clean);
          localStorage.setItem('nn_table_bookings', JSON.stringify(clean));
        }

        if (modulesData.wedding_inquiries?.items && Array.isArray(modulesData.wedding_inquiries.items)) {
          const clean = modulesData.wedding_inquiries.items.filter((w: any) => !['wd-001', 'wd-002', 'wd-003'].includes(w.id));
          initialPayload.weddingInquiries = clean;
          lastKnownHashes['weddingInquiries'] = fastHash(clean);
          localStorage.setItem('nn_wedding_inquiries', JSON.stringify(clean));
        }

        if (modulesData.restaurant_orders?.items && Array.isArray(modulesData.restaurant_orders.items)) {
          initialPayload.restaurantOrders = modulesData.restaurant_orders.items;
          lastKnownHashes['restaurantOrders'] = fastHash(modulesData.restaurant_orders.items);
          localStorage.setItem('nn_restaurant_orders', JSON.stringify(modulesData.restaurant_orders.items));
        }

        if (modulesData.dui_orders?.items && Array.isArray(modulesData.dui_orders.items)) {
          initialPayload.duiOrders = modulesData.dui_orders.items;
          lastKnownHashes['duiOrders'] = fastHash(modulesData.dui_orders.items);
          localStorage.setItem('nn_dui_orders', JSON.stringify(modulesData.dui_orders.items));
        }

        if (modulesData.external_finance?.items && Array.isArray(modulesData.external_finance.items)) {
          initialPayload.externalRecords = modulesData.external_finance.items;
          lastKnownHashes['externalRecords'] = fastHash(modulesData.external_finance.items);
          localStorage.setItem('nn_external_finance_transactions', JSON.stringify(modulesData.external_finance.items));
        }

        if (modulesData.admin_notifications?.items && Array.isArray(modulesData.admin_notifications.items)) {
          initialPayload.adminNotifications = modulesData.admin_notifications.items;
          lastKnownHashes['adminNotifications'] = fastHash(modulesData.admin_notifications.items);
          localStorage.setItem('nn_admin_notifications', JSON.stringify(modulesData.admin_notifications.items));
        }

        if (modulesData.farm_areas?.items && Array.isArray(modulesData.farm_areas.items)) {
          initialPayload.farmAreas = modulesData.farm_areas.items;
          lastKnownHashes['farmAreas'] = fastHash(modulesData.farm_areas.items);
          localStorage.setItem('farm_areas_real_v3', JSON.stringify(modulesData.farm_areas.items));
        }

        if (modulesData.farm_rows?.items && Array.isArray(modulesData.farm_rows.items)) {
          initialPayload.farmRows = modulesData.farm_rows.items;
          lastKnownHashes['farmRows'] = fastHash(modulesData.farm_rows.items);
          localStorage.setItem('farm_rows_real_v3', JSON.stringify(modulesData.farm_rows.items));
        }

        if (modulesData.farm_cages?.items && Array.isArray(modulesData.farm_cages.items)) {
          initialPayload.farmCages = modulesData.farm_cages.items;
          lastKnownHashes['farmCages'] = fastHash(modulesData.farm_cages.items);
          localStorage.setItem('farm_cages_real_v3', JSON.stringify(modulesData.farm_cages.items));
        }

        if (modulesData.farm_disinfection?.items && Array.isArray(modulesData.farm_disinfection.items)) {
          initialPayload.farmDisinfection = modulesData.farm_disinfection.items;
          lastKnownHashes['farmDisinfection'] = fastHash(modulesData.farm_disinfection.items);
          localStorage.setItem('farm_disinfection_real_v3', JSON.stringify(modulesData.farm_disinfection.items));
        }

        if (modulesData.farm_tasks?.items && Array.isArray(modulesData.farm_tasks.items)) {
          initialPayload.farmTasks = modulesData.farm_tasks.items;
          lastKnownHashes['farmTasks'] = fastHash(modulesData.farm_tasks.items);
          localStorage.setItem('farm_custom_tasks_v3', JSON.stringify(modulesData.farm_tasks.items));
        }

        if (modulesData.physical_registry?.registry && typeof modulesData.physical_registry.registry === 'object') {
          initialPayload.physicalRegistry = modulesData.physical_registry.registry;
          lastKnownHashes['physicalRegistry'] = fastHash(modulesData.physical_registry.registry);
          savePhysicalRegistry(modulesData.physical_registry.registry, false);
        }

        localStorage.setItem('nn_rtdb_migration_done', 'true');

        const fallback = getLocalFallbackData();
        const finalPayload: SystemDataPayload = {
          menuItems: initialPayload.menuItems || fallback.menuItems,
          bookings: initialPayload.bookings || fallback.bookings,
          weddingInquiries: initialPayload.weddingInquiries || fallback.weddingInquiries,
          restaurantOrders: initialPayload.restaurantOrders || fallback.restaurantOrders,
          duiOrders: initialPayload.duiOrders || fallback.duiOrders,
          externalRecords: initialPayload.externalRecords || fallback.externalRecords,
          adminNotifications: initialPayload.adminNotifications || fallback.adminNotifications,
          farmAreas: initialPayload.farmAreas || fallback.farmAreas,
          farmRows: initialPayload.farmRows || fallback.farmRows,
          farmCages: initialPayload.farmCages || fallback.farmCages,
          farmDisinfection: initialPayload.farmDisinfection || fallback.farmDisinfection,
          farmTasks: initialPayload.farmTasks || fallback.farmTasks,
          physicalRegistry: initialPayload.physicalRegistry || fallback.physicalRegistry,
        };

        // Cập nhật hash
        lastKnownHashes['menuItems'] = fastHash(finalPayload.menuItems);
        lastKnownHashes['bookings'] = fastHash(finalPayload.bookings);
        lastKnownHashes['weddingInquiries'] = fastHash(finalPayload.weddingInquiries);
        lastKnownHashes['restaurantOrders'] = fastHash(finalPayload.restaurantOrders);
        lastKnownHashes['duiOrders'] = fastHash(finalPayload.duiOrders);
        lastKnownHashes['externalRecords'] = fastHash(finalPayload.externalRecords);
        lastKnownHashes['adminNotifications'] = fastHash(finalPayload.adminNotifications);
        lastKnownHashes['farmAreas'] = fastHash(finalPayload.farmAreas);
        lastKnownHashes['farmRows'] = fastHash(finalPayload.farmRows);
        lastKnownHashes['farmCages'] = fastHash(finalPayload.farmCages);
        lastKnownHashes['farmDisinfection'] = fastHash(finalPayload.farmDisinfection);
        lastKnownHashes['farmTasks'] = fastHash(finalPayload.farmTasks);
        lastKnownHashes['physicalRegistry'] = fastHash(finalPayload.physicalRegistry);

        onDataChange(finalPayload);
        isCloudReady = true;

      } else {
        // TRƯỜNG HỢP 2: Realtime Database TRỐNG HOÀN TOÀN
        // Tự động migration dữ liệu cục bộ hiện tại lên Realtime Database một lần duy nhất
        const fallback = getLocalFallbackData();
        const now = new Date().toISOString();

        console.log('✓ Firebase Realtime Database đang trống. Đang tự động tải dữ liệu hệ thống lên Cloud...');
        try {
          const uploadPayload: Record<string, any> = {
            restaurant_menu: { items: fallback.menuItems, updatedAt: now },
            table_bookings: { items: fallback.bookings, updatedAt: now },
            wedding_inquiries: { items: fallback.weddingInquiries, updatedAt: now },
            restaurant_orders: { items: fallback.restaurantOrders, updatedAt: now },
            dui_orders: { items: fallback.duiOrders, updatedAt: now },
            external_finance: { items: fallback.externalRecords, updatedAt: now },
            admin_notifications: { items: fallback.adminNotifications, updatedAt: now },
            farm_areas: { items: fallback.farmAreas, updatedAt: now },
            farm_rows: { items: fallback.farmRows, updatedAt: now },
            farm_cages: { items: fallback.farmCages, updatedAt: now },
            farm_disinfection: { items: fallback.farmDisinfection, updatedAt: now },
            farm_tasks: { items: fallback.farmTasks, updatedAt: now },
            physical_registry: { registry: fallback.physicalRegistry, updatedAt: now },
            system_meta: { initialized: true, createdAt: now, updatedAt: now, version: '3.0' }
          };

          await set(rootModulesRef, uploadPayload);
          localStorage.setItem('nn_rtdb_migration_done', 'true');
          console.log('✓ Đã khởi tạo và tải dữ liệu lên Firebase Realtime Database thành công.');
        } catch (migrationErr: any) {
          reportDatabaseError('Migration dữ liệu ban đầu', migrationErr);
          if (onError) onError(migrationErr);
        }

        lastKnownHashes['menuItems'] = fastHash(fallback.menuItems);
        lastKnownHashes['bookings'] = fastHash(fallback.bookings);
        lastKnownHashes['weddingInquiries'] = fastHash(fallback.weddingInquiries);
        lastKnownHashes['restaurantOrders'] = fastHash(fallback.restaurantOrders);
        lastKnownHashes['duiOrders'] = fastHash(fallback.duiOrders);
        lastKnownHashes['externalRecords'] = fastHash(fallback.externalRecords);
        lastKnownHashes['adminNotifications'] = fastHash(fallback.adminNotifications);
        lastKnownHashes['farmAreas'] = fastHash(fallback.farmAreas);
        lastKnownHashes['farmRows'] = fastHash(fallback.farmRows);
        lastKnownHashes['farmCages'] = fastHash(fallback.farmCages);
        lastKnownHashes['farmDisinfection'] = fastHash(fallback.farmDisinfection);
        lastKnownHashes['farmTasks'] = fastHash(fallback.farmTasks);
        lastKnownHashes['physicalRegistry'] = fastHash(fallback.physicalRegistry);

        onDataChange(fallback);
        isCloudReady = true;
      }

      // 4. Đăng ký lắng nghe thời gian thực onValue cho nhánh nn_modules
      unsubscribeSnapshot = onValue(
        rootModulesRef,
        (snapshot) => {
          if (!snapshot.exists()) return;
          const modulesData = snapshot.val();
          if (!modulesData || typeof modulesData !== 'object') return;

          const deltaPayload: Partial<SystemDataPayload> = {};
          let hasChange = false;

          // Phân hệ Thực đơn
          if (modulesData.restaurant_menu?.items && Array.isArray(modulesData.restaurant_menu.items)) {
            const h = fastHash(modulesData.restaurant_menu.items);
            if (h !== lastKnownHashes['menuItems']) {
              lastKnownHashes['menuItems'] = h;
              deltaPayload.menuItems = modulesData.restaurant_menu.items;
              localStorage.setItem('nn_menu_items_v6', JSON.stringify(modulesData.restaurant_menu.items));
              hasChange = true;
            }
          }

          // Phân hệ Đặt bàn
          if (modulesData.table_bookings?.items && Array.isArray(modulesData.table_bookings.items)) {
            const h = fastHash(modulesData.table_bookings.items);
            if (h !== lastKnownHashes['bookings']) {
              lastKnownHashes['bookings'] = h;
              deltaPayload.bookings = modulesData.table_bookings.items;
              localStorage.setItem('nn_table_bookings', JSON.stringify(modulesData.table_bookings.items));
              hasChange = true;
            }
          }

          // Phân hệ Tiệc cưới
          if (modulesData.wedding_inquiries?.items && Array.isArray(modulesData.wedding_inquiries.items)) {
            const h = fastHash(modulesData.wedding_inquiries.items);
            if (h !== lastKnownHashes['weddingInquiries']) {
              lastKnownHashes['weddingInquiries'] = h;
              deltaPayload.weddingInquiries = modulesData.wedding_inquiries.items;
              localStorage.setItem('nn_wedding_inquiries', JSON.stringify(modulesData.wedding_inquiries.items));
              hasChange = true;
            }
          }

          // Phân hệ Đơn hàng quán ăn
          if (modulesData.restaurant_orders?.items && Array.isArray(modulesData.restaurant_orders.items)) {
            const h = fastHash(modulesData.restaurant_orders.items);
            if (h !== lastKnownHashes['restaurantOrders']) {
              lastKnownHashes['restaurantOrders'] = h;
              deltaPayload.restaurantOrders = modulesData.restaurant_orders.items;
              localStorage.setItem('nn_restaurant_orders', JSON.stringify(modulesData.restaurant_orders.items));
              hasChange = true;
            }
          }

          // Phân hệ Đơn hàng dúi
          if (modulesData.dui_orders?.items && Array.isArray(modulesData.dui_orders.items)) {
            const h = fastHash(modulesData.dui_orders.items);
            if (h !== lastKnownHashes['duiOrders']) {
              lastKnownHashes['duiOrders'] = h;
              deltaPayload.duiOrders = modulesData.dui_orders.items;
              localStorage.setItem('nn_dui_orders', JSON.stringify(modulesData.dui_orders.items));
              hasChange = true;
            }
          }

          // Phân hệ Thu chi ngoài luồng
          if (modulesData.external_finance?.items && Array.isArray(modulesData.external_finance.items)) {
            const h = fastHash(modulesData.external_finance.items);
            if (h !== lastKnownHashes['externalRecords']) {
              lastKnownHashes['externalRecords'] = h;
              deltaPayload.externalRecords = modulesData.external_finance.items;
              localStorage.setItem('nn_external_finance_transactions', JSON.stringify(modulesData.external_finance.items));
              hasChange = true;
            }
          }

          // Phân hệ Thông báo quản trị
          if (modulesData.admin_notifications?.items && Array.isArray(modulesData.admin_notifications.items)) {
            const h = fastHash(modulesData.admin_notifications.items);
            if (h !== lastKnownHashes['adminNotifications']) {
              lastKnownHashes['adminNotifications'] = h;
              deltaPayload.adminNotifications = modulesData.admin_notifications.items;
              localStorage.setItem('nn_admin_notifications', JSON.stringify(modulesData.admin_notifications.items));
              hasChange = true;
            }
          }

          // Phân hệ Trang trại: Khu
          if (modulesData.farm_areas?.items && Array.isArray(modulesData.farm_areas.items)) {
            const h = fastHash(modulesData.farm_areas.items);
            if (h !== lastKnownHashes['farmAreas']) {
              lastKnownHashes['farmAreas'] = h;
              deltaPayload.farmAreas = modulesData.farm_areas.items;
              localStorage.setItem('farm_areas_real_v3', JSON.stringify(modulesData.farm_areas.items));
              hasChange = true;
            }
          }

          // Phân hệ Trang trại: Dãy
          if (modulesData.farm_rows?.items && Array.isArray(modulesData.farm_rows.items)) {
            const h = fastHash(modulesData.farm_rows.items);
            if (h !== lastKnownHashes['farmRows']) {
              lastKnownHashes['farmRows'] = h;
              deltaPayload.farmRows = modulesData.farm_rows.items;
              localStorage.setItem('farm_rows_real_v3', JSON.stringify(modulesData.farm_rows.items));
              hasChange = true;
            }
          }

          // Phân hệ Trang trại: Chuồng
          if (modulesData.farm_cages?.items && Array.isArray(modulesData.farm_cages.items)) {
            const h = fastHash(modulesData.farm_cages.items);
            if (h !== lastKnownHashes['farmCages']) {
              lastKnownHashes['farmCages'] = h;
              deltaPayload.farmCages = modulesData.farm_cages.items;
              localStorage.setItem('farm_cages_real_v3', JSON.stringify(modulesData.farm_cages.items));
              hasChange = true;
            }
          }

          // Phân hệ Trang trại: Khử trùng
          if (modulesData.farm_disinfection?.items && Array.isArray(modulesData.farm_disinfection.items)) {
            const h = fastHash(modulesData.farm_disinfection.items);
            if (h !== lastKnownHashes['farmDisinfection']) {
              lastKnownHashes['farmDisinfection'] = h;
              deltaPayload.farmDisinfection = modulesData.farm_disinfection.items;
              localStorage.setItem('farm_disinfection_real_v3', JSON.stringify(modulesData.farm_disinfection.items));
              hasChange = true;
            }
          }

          // Phân hệ Trang trại: Nhiệm vụ
          if (modulesData.farm_tasks?.items && Array.isArray(modulesData.farm_tasks.items)) {
            const h = fastHash(modulesData.farm_tasks.items);
            if (h !== lastKnownHashes['farmTasks']) {
              lastKnownHashes['farmTasks'] = h;
              deltaPayload.farmTasks = modulesData.farm_tasks.items;
              localStorage.setItem('farm_custom_tasks_v3', JSON.stringify(modulesData.farm_tasks.items));
              hasChange = true;
            }
          }

          // Bảng đăng ký vị trí QR
          if (modulesData.physical_registry?.registry && typeof modulesData.physical_registry.registry === 'object') {
            const h = fastHash(modulesData.physical_registry.registry);
            if (h !== lastKnownHashes['physicalRegistry']) {
              lastKnownHashes['physicalRegistry'] = h;
              deltaPayload.physicalRegistry = modulesData.physical_registry.registry;
              savePhysicalRegistry(modulesData.physical_registry.registry, false);
              hasChange = true;
            }
          }

          if (hasChange) {
            onDataChange(deltaPayload);
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('nn_data_sync'));
            }
          }
        },
        (err: any) => {
          reportDatabaseError('Lắng nghe thời gian thực (onValue)', err);
          if (onError) onError(err);
        }
      );

    } catch (error: any) {
      reportDatabaseError('Khởi tạo ban đầu', error);
      isCloudReady = true;
      if (onError) onError(error);
    }
  }

  initAndListen();

  return () => {
    unsubscribeSnapshot();
  };
}

/**
 * Hàm thực hiện ghi dồn dập được gom cụm lên Firebase Realtime Database sau thời gian debounce
 */
async function flushPendingSync(): Promise<void> {
  if (!isCloudReady) {
    return;
  }

  const dataToSync = { ...pendingSyncPayload };
  pendingSyncPayload = {};

  try {
    const now = new Date().toISOString();
    const promises: Promise<any>[] = [];

    if (dataToSync.menuItems !== undefined) {
      const h = fastHash(dataToSync.menuItems);
      if (h !== lastKnownHashes['menuItems']) {
        lastKnownHashes['menuItems'] = h;
        promises.push(
          set(ref(rtdb, `${MODULES_PATH}/restaurant_menu`), { items: dataToSync.menuItems, updatedAt: now })
        );
      }
    }

    if (dataToSync.bookings !== undefined) {
      const h = fastHash(dataToSync.bookings);
      if (h !== lastKnownHashes['bookings']) {
        lastKnownHashes['bookings'] = h;
        promises.push(
          set(ref(rtdb, `${MODULES_PATH}/table_bookings`), { items: dataToSync.bookings, updatedAt: now })
        );
      }
    }

    if (dataToSync.weddingInquiries !== undefined) {
      const h = fastHash(dataToSync.weddingInquiries);
      if (h !== lastKnownHashes['weddingInquiries']) {
        lastKnownHashes['weddingInquiries'] = h;
        promises.push(
          set(ref(rtdb, `${MODULES_PATH}/wedding_inquiries`), { items: dataToSync.weddingInquiries, updatedAt: now })
        );
      }
    }

    if (dataToSync.restaurantOrders !== undefined) {
      const h = fastHash(dataToSync.restaurantOrders);
      if (h !== lastKnownHashes['restaurantOrders']) {
        lastKnownHashes['restaurantOrders'] = h;
        promises.push(
          set(ref(rtdb, `${MODULES_PATH}/restaurant_orders`), { items: dataToSync.restaurantOrders, updatedAt: now })
        );
      }
    }

    if (dataToSync.duiOrders !== undefined) {
      const h = fastHash(dataToSync.duiOrders);
      if (h !== lastKnownHashes['duiOrders']) {
        lastKnownHashes['duiOrders'] = h;
        promises.push(
          set(ref(rtdb, `${MODULES_PATH}/dui_orders`), { items: dataToSync.duiOrders, updatedAt: now })
        );
      }
    }

    if (dataToSync.externalRecords !== undefined) {
      const h = fastHash(dataToSync.externalRecords);
      if (h !== lastKnownHashes['externalRecords']) {
        lastKnownHashes['externalRecords'] = h;
        promises.push(
          set(ref(rtdb, `${MODULES_PATH}/external_finance`), { items: dataToSync.externalRecords, updatedAt: now })
        );
      }
    }

    if (dataToSync.adminNotifications !== undefined) {
      const h = fastHash(dataToSync.adminNotifications);
      if (h !== lastKnownHashes['adminNotifications']) {
        lastKnownHashes['adminNotifications'] = h;
        promises.push(
          set(ref(rtdb, `${MODULES_PATH}/admin_notifications`), { items: dataToSync.adminNotifications, updatedAt: now })
        );
      }
    }

    if (dataToSync.farmAreas !== undefined) {
      const h = fastHash(dataToSync.farmAreas);
      if (h !== lastKnownHashes['farmAreas']) {
        lastKnownHashes['farmAreas'] = h;
        promises.push(
          set(ref(rtdb, `${MODULES_PATH}/farm_areas`), { items: dataToSync.farmAreas, updatedAt: now })
        );
      }
    }

    if (dataToSync.farmRows !== undefined) {
      const h = fastHash(dataToSync.farmRows);
      if (h !== lastKnownHashes['farmRows']) {
        lastKnownHashes['farmRows'] = h;
        promises.push(
          set(ref(rtdb, `${MODULES_PATH}/farm_rows`), { items: dataToSync.farmRows, updatedAt: now })
        );
      }
    }

    if (dataToSync.farmCages !== undefined) {
      const h = fastHash(dataToSync.farmCages);
      if (h !== lastKnownHashes['farmCages']) {
        lastKnownHashes['farmCages'] = h;
        promises.push(
          set(ref(rtdb, `${MODULES_PATH}/farm_cages`), { items: dataToSync.farmCages, updatedAt: now })
        );
      }
    }

    if (dataToSync.farmDisinfection !== undefined) {
      const h = fastHash(dataToSync.farmDisinfection);
      if (h !== lastKnownHashes['farmDisinfection']) {
        lastKnownHashes['farmDisinfection'] = h;
        promises.push(
          set(ref(rtdb, `${MODULES_PATH}/farm_disinfection`), { items: dataToSync.farmDisinfection, updatedAt: now })
        );
      }
    }

    if (dataToSync.farmTasks !== undefined) {
      const h = fastHash(dataToSync.farmTasks);
      if (h !== lastKnownHashes['farmTasks']) {
        lastKnownHashes['farmTasks'] = h;
        promises.push(
          set(ref(rtdb, `${MODULES_PATH}/farm_tasks`), { items: dataToSync.farmTasks, updatedAt: now })
        );
      }
    }

    if (dataToSync.physicalRegistry !== undefined) {
      const h = fastHash(dataToSync.physicalRegistry);
      if (h !== lastKnownHashes['physicalRegistry']) {
        lastKnownHashes['physicalRegistry'] = h;
        promises.push(
          set(ref(rtdb, `${MODULES_PATH}/physical_registry`), { registry: dataToSync.physicalRegistry, updatedAt: now })
        );
      }
    }

    if (promises.length > 0) {
      await Promise.all(promises);
      console.log(`✓ Đã đồng bộ ${promises.length} phân hệ lên Firebase Realtime Database.`);
    }
  } catch (error: any) {
    reportDatabaseError('Ghi dữ liệu lên Realtime Database', error);
  }
}

/**
 * Đồng bộ an toàn từng phân hệ lên Firebase Realtime Database (Chỉ cập nhật nhánh liên quan)
 * Áp dụng cơ chế DEBOUNCE QUEUE: gom cụm các thay đổi phát sinh liên tiếp trong 1 giây để tối ưu
 */
export async function syncOnlinePayload(partialData: Partial<SystemDataPayload>): Promise<void> {
  if (!isCloudReady) {
    console.warn('⚠️ Từ chối đồng bộ lên Cloud: Thiết bị đang trong quá trình kết nối ban đầu.');
    return;
  }

  // Gom cụm payload vào hàng đợi
  pendingSyncPayload = { ...pendingSyncPayload, ...partialData };

  // Khởi chạy hoặc làm mới bộ đếm debounce 1 giây
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
  debounceTimer = setTimeout(() => {
    flushPendingSync();
  }, 1000);
}
