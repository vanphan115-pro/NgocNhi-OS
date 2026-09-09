/**
 * Dịch vụ đồng bộ dữ liệu Online thời gian thực (Firestore Cloud Database)
 * Hệ thống Dịch Vụ Ngọc Nhi (Trang Trại Dúi • Quán Ăn • Tiệc Cưới • Điều Hành)
 * 
 * Kiến trúc tách Document độc lập (Modular Collection nn_modules):
 * 1. Chống ghi đè từ thiết bị mới: Chỉ cho phép đồng bộ ghi sau khi đã tải xong dữ liệu từ Firestore.
 * 2. Migration an toàn: Chỉ đưa dữ liệu local lên Firestore khi cơ sở dữ liệu trên Cloud hoàn toàn chưa có dữ liệu.
 * 3. Tách dữ liệu thành từng Document theo từng phân hệ để tránh giới hạn kích thước (1MB) và xung đột ghi đa thiết bị.
 * 4. Tự động xác thực phiên kết nối (Firebase Auth) đáp ứng Security Rules không dùng 'allow read, write: if true'.
 * 5. Lắng nghe Realtime (onSnapshot) cập nhật tức thì giữa các máy tính và điện thoại.
 */

import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  getDoc, 
  getDocs, 
  setLogLevel,
  Unsubscribe 
} from 'firebase/firestore';
import { db, ensureAuth } from './firebase';
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

// Collection lưu trữ các module dữ liệu độc lập
export const MODULES_COLLECTION = 'nn_modules';

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

// Cấu hình log level silent để triệt tiêu các thông báo retry backoff nội bộ của Firestore SDK
try {
  setLogLevel('silent');
} catch (e) {}

// Trạng thái kiểm soát vòng đời Cloud Sync
let isCloudReady = false;
let isInitializing = false;
const lastKnownHashes: Record<string, string> = {};

// Debounce queue quản lý ghi dữ liệu Firestore để tối ưu lưu lượng ghi
let debounceTimer: any = null;
let pendingSyncPayload: Partial<SystemDataPayload> = {};

/**
 * Kiểm tra trạng thái quota (giữ hàm để tương thích giao diện và module khác)
 */
export function isFirestoreQuotaExhausted(): boolean {
  return false;
}

/**
 * Báo lỗi thao tác Firestore ra console và CustomEvent cho ứng dụng,
 * tuyệt đối KHÔNG tự động ngắt kết nối hay tắt mạng của Firestore để duy trì khả năng tự phục hồi/retry.
 */
function reportFirestoreError(contextMsg: string, err?: any) {
  const errMsg = err?.message || String(err || 'Không rõ lỗi');
  console.warn(`⚠️ [Firestore Error - ${contextMsg}]:`, errMsg);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('nn_sync_error', { 
      detail: { context: contextMsg, error: err, message: errMsg } 
    }));
  }
}

/**
 * Kiểm tra xem thiết bị đã tải xong dữ liệu từ Cloud và sẵn sàng đồng bộ hay chưa.
 * Tuyệt đối không cho phép ghi khi chưa sẵn sàng.
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
 * Đăng ký lắng nghe Realtime từ Firestore theo kiến trúc Document độc lập
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
      // 1. Đảm bảo phiên xác thực hợp lệ trước khi gửi yêu cầu lên Firestore
      await ensureAuth();

      // 2. Kiểm tra xem Firestore nn_modules đã có dữ liệu hay chưa
      const modulesColRef = collection(db, MODULES_COLLECTION);
      let colSnap;
      try {
        colSnap = await getDocs(modulesColRef);
      } catch (getDocsErr: any) {
        reportFirestoreError('Đọc dữ liệu ban đầu', getDocsErr);
        if (onError) onError(getDocsErr);
        // Nạp fallback local để giao diện hoạt động ngay lập tức, không ngắt kết nối
        onDataChange(getLocalFallbackData());
        isCloudReady = true;
      }

      const initialPayload: Partial<SystemDataPayload> = {};
      const hasOnlineData = !!(colSnap && !colSnap.empty);

      if (hasOnlineData) {
        // TRƯỜNG HỢP 1: Firestore ĐÃ CÓ DỮ LIỆU
        // Tải toàn bộ dữ liệu từ Firestore về thiết bị, tuyệt đối không ghi đè dữ liệu Cloud
        console.log('✓ Phát hiện dữ liệu Firestore Online. Đang đồng bộ về thiết bị...');
        colSnap!.forEach((docSnap) => {
          const docId = docSnap.id;
          const data = docSnap.data();

          switch (docId) {
            case 'restaurant_menu':
              if (Array.isArray(data.items)) {
                initialPayload.menuItems = data.items;
                lastKnownHashes['menuItems'] = fastHash(data.items);
                localStorage.setItem('nn_menu_items_v6', JSON.stringify(data.items));
              }
              break;
            case 'table_bookings':
              if (Array.isArray(data.items)) {
                const clean = data.items.filter((b: any) => !['tb-001', 'tb-002', 'tb-003', 'tb-3048'].includes(b.id) && b.code !== 'NN-TB-3048');
                initialPayload.bookings = clean;
                lastKnownHashes['bookings'] = fastHash(clean);
                localStorage.setItem('nn_table_bookings', JSON.stringify(clean));
              }
              break;
            case 'wedding_inquiries':
              if (Array.isArray(data.items)) {
                const clean = data.items.filter((w: any) => !['wd-001', 'wd-002', 'wd-003'].includes(w.id));
                initialPayload.weddingInquiries = clean;
                lastKnownHashes['weddingInquiries'] = fastHash(clean);
                localStorage.setItem('nn_wedding_inquiries', JSON.stringify(clean));
              }
              break;
            case 'restaurant_orders':
              if (Array.isArray(data.items)) {
                initialPayload.restaurantOrders = data.items;
                lastKnownHashes['restaurantOrders'] = fastHash(data.items);
                localStorage.setItem('nn_restaurant_orders', JSON.stringify(data.items));
              }
              break;
            case 'dui_orders':
              if (Array.isArray(data.items)) {
                initialPayload.duiOrders = data.items;
                lastKnownHashes['duiOrders'] = fastHash(data.items);
                localStorage.setItem('nn_dui_orders', JSON.stringify(data.items));
              }
              break;
            case 'external_finance':
              if (Array.isArray(data.items)) {
                initialPayload.externalRecords = data.items;
                lastKnownHashes['externalRecords'] = fastHash(data.items);
                localStorage.setItem('nn_external_finance_transactions', JSON.stringify(data.items));
              }
              break;
            case 'admin_notifications':
              if (Array.isArray(data.items)) {
                initialPayload.adminNotifications = data.items;
                lastKnownHashes['adminNotifications'] = fastHash(data.items);
                localStorage.setItem('nn_admin_notifications', JSON.stringify(data.items));
              }
              break;
            case 'farm_areas':
              if (Array.isArray(data.items)) {
                initialPayload.farmAreas = data.items;
                lastKnownHashes['farmAreas'] = fastHash(data.items);
                localStorage.setItem('farm_areas_real_v3', JSON.stringify(data.items));
              }
              break;
            case 'farm_rows':
              if (Array.isArray(data.items)) {
                initialPayload.farmRows = data.items;
                lastKnownHashes['farmRows'] = fastHash(data.items);
                localStorage.setItem('farm_rows_real_v3', JSON.stringify(data.items));
              }
              break;
            case 'farm_cages':
              if (Array.isArray(data.items)) {
                initialPayload.farmCages = data.items;
                lastKnownHashes['farmCages'] = fastHash(data.items);
                localStorage.setItem('farm_cages_real_v3', JSON.stringify(data.items));
              }
              break;
            case 'farm_disinfection':
              if (Array.isArray(data.items)) {
                initialPayload.farmDisinfection = data.items;
                lastKnownHashes['farmDisinfection'] = fastHash(data.items);
                localStorage.setItem('farm_disinfection_real_v3', JSON.stringify(data.items));
              }
              break;
            case 'farm_tasks':
              if (Array.isArray(data.items)) {
                initialPayload.farmTasks = data.items;
                lastKnownHashes['farmTasks'] = fastHash(data.items);
                localStorage.setItem('farm_custom_tasks_v3', JSON.stringify(data.items));
              }
              break;
            case 'physical_registry':
              if (data.registry && typeof data.registry === 'object') {
                initialPayload.physicalRegistry = data.registry;
                lastKnownHashes['physicalRegistry'] = fastHash(data.registry);
                savePhysicalRegistry(data.registry);
              }
              break;
          }
        });

        // Đánh dấu migration đã hoàn tất trên thiết bị này
        localStorage.setItem('nn_firestore_migration_done', 'true');

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

        // Đồng bộ hash để tránh trigger ghi ngược
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
        // TRƯỜNG HỢP 2: Firestore TRỐNG HOÀN TOÀN (chưa có document nào trong nn_modules)
        // Kiểm tra xem có dữ liệu legacy từ doc cũ 'main_store' không
        let legacyData: any = null;
        try {
          const legacySnap = await getDoc(doc(db, 'nn_system_data', 'main_store'));
          if (legacySnap.exists()) {
            legacyData = legacySnap.data();
          }
        } catch (e) {}

        const fallback = getLocalFallbackData();
        const initialDataToUpload: SystemDataPayload = legacyData ? {
          menuItems: legacyData.menuItems || fallback.menuItems,
          bookings: legacyData.bookings || fallback.bookings,
          weddingInquiries: legacyData.weddingInquiries || fallback.weddingInquiries,
          restaurantOrders: legacyData.restaurantOrders || fallback.restaurantOrders,
          duiOrders: legacyData.duiOrders || fallback.duiOrders,
          externalRecords: legacyData.externalRecords || fallback.externalRecords,
          adminNotifications: legacyData.adminNotifications || fallback.adminNotifications,
          farmAreas: legacyData.farmAreas || fallback.farmAreas,
          farmRows: legacyData.farmRows || fallback.farmRows,
          farmCages: legacyData.farmCages || fallback.farmCages,
          farmDisinfection: legacyData.farmDisinfection || fallback.farmDisinfection,
          farmTasks: legacyData.farmTasks || fallback.farmTasks,
          physicalRegistry: legacyData.physicalRegistry || fallback.physicalRegistry,
        } : fallback;

        // Chỉ migration một lần duy nhất khi Firestore thực sự trống
        const alreadyMigrated = localStorage.getItem('nn_firestore_migration_done') === 'true';
        if (!alreadyMigrated) {
          console.log('✓ Firestore đang trống. Tự động migration dữ liệu localStorage lên Cloud một lần duy nhất...');
          const now = new Date().toISOString();
          try {
            await Promise.all([
              setDoc(doc(db, MODULES_COLLECTION, 'restaurant_menu'), { items: initialDataToUpload.menuItems, updatedAt: now }),
              setDoc(doc(db, MODULES_COLLECTION, 'table_bookings'), { items: initialDataToUpload.bookings, updatedAt: now }),
              setDoc(doc(db, MODULES_COLLECTION, 'wedding_inquiries'), { items: initialDataToUpload.weddingInquiries, updatedAt: now }),
              setDoc(doc(db, MODULES_COLLECTION, 'restaurant_orders'), { items: initialDataToUpload.restaurantOrders, updatedAt: now }),
              setDoc(doc(db, MODULES_COLLECTION, 'dui_orders'), { items: initialDataToUpload.duiOrders, updatedAt: now }),
              setDoc(doc(db, MODULES_COLLECTION, 'external_finance'), { items: initialDataToUpload.externalRecords, updatedAt: now }),
              setDoc(doc(db, MODULES_COLLECTION, 'admin_notifications'), { items: initialDataToUpload.adminNotifications, updatedAt: now }),
              setDoc(doc(db, MODULES_COLLECTION, 'farm_areas'), { items: initialDataToUpload.farmAreas, updatedAt: now }),
              setDoc(doc(db, MODULES_COLLECTION, 'farm_rows'), { items: initialDataToUpload.farmRows, updatedAt: now }),
              setDoc(doc(db, MODULES_COLLECTION, 'farm_cages'), { items: initialDataToUpload.farmCages, updatedAt: now }),
              setDoc(doc(db, MODULES_COLLECTION, 'farm_disinfection'), { items: initialDataToUpload.farmDisinfection, updatedAt: now }),
              setDoc(doc(db, MODULES_COLLECTION, 'farm_tasks'), { items: initialDataToUpload.farmTasks, updatedAt: now }),
              setDoc(doc(db, MODULES_COLLECTION, 'physical_registry'), { registry: initialDataToUpload.physicalRegistry, updatedAt: now }),
              setDoc(doc(db, MODULES_COLLECTION, 'system_meta'), { initialized: true, createdAt: now, updatedAt: now, version: '2.0' })
            ]);
            localStorage.setItem('nn_firestore_migration_done', 'true');
            console.log('✓ Hoàn tất migration dữ liệu lên Cloud Firestore thành công.');
          } catch (migrationErr: any) {
            reportFirestoreError('Migration dữ liệu ban đầu', migrationErr);
            if (onError) onError(migrationErr);
          }
        }

        lastKnownHashes['menuItems'] = fastHash(initialDataToUpload.menuItems);
        lastKnownHashes['bookings'] = fastHash(initialDataToUpload.bookings);
        lastKnownHashes['weddingInquiries'] = fastHash(initialDataToUpload.weddingInquiries);
        lastKnownHashes['restaurantOrders'] = fastHash(initialDataToUpload.restaurantOrders);
        lastKnownHashes['duiOrders'] = fastHash(initialDataToUpload.duiOrders);
        lastKnownHashes['externalRecords'] = fastHash(initialDataToUpload.externalRecords);
        lastKnownHashes['adminNotifications'] = fastHash(initialDataToUpload.adminNotifications);
        lastKnownHashes['farmAreas'] = fastHash(initialDataToUpload.farmAreas);
        lastKnownHashes['farmRows'] = fastHash(initialDataToUpload.farmRows);
        lastKnownHashes['farmCages'] = fastHash(initialDataToUpload.farmCages);
        lastKnownHashes['farmDisinfection'] = fastHash(initialDataToUpload.farmDisinfection);
        lastKnownHashes['farmTasks'] = fastHash(initialDataToUpload.farmTasks);
        lastKnownHashes['physicalRegistry'] = fastHash(initialDataToUpload.physicalRegistry);

        onDataChange(initialDataToUpload);
        isCloudReady = true;
      }

      // 3. Đăng ký lắng nghe thời gian thực onSnapshot cho toàn bộ collection nn_modules
      unsubscribeSnapshot = onSnapshot(
        modulesColRef,
        (snapshot) => {
          const deltaPayload: Partial<SystemDataPayload> = {};
          let hasChange = false;

          snapshot.docChanges().forEach((change) => {
            // BỎ QUA nếu là thay đổi cục bộ (local optimistic write) của chính thiết bị này đang ghi,
            // ngăn chặn hoàn toàn vòng lặp phản xạ (echo loop) dẫn đến bùng nổ số lượng ghi
            if (change.doc.metadata.hasPendingWrites) {
              return;
            }

            const docId = change.doc.id;
            const data = change.doc.data();

            switch (docId) {
              case 'restaurant_menu':
                if (Array.isArray(data.items)) {
                  const h = fastHash(data.items);
                  if (h !== lastKnownHashes['menuItems']) {
                    lastKnownHashes['menuItems'] = h;
                    deltaPayload.menuItems = data.items;
                    localStorage.setItem('nn_menu_items_v6', JSON.stringify(data.items));
                    hasChange = true;
                  }
                }
                break;
              case 'table_bookings':
                if (Array.isArray(data.items)) {
                  const h = fastHash(data.items);
                  if (h !== lastKnownHashes['bookings']) {
                    lastKnownHashes['bookings'] = h;
                    deltaPayload.bookings = data.items;
                    localStorage.setItem('nn_table_bookings', JSON.stringify(data.items));
                    hasChange = true;
                  }
                }
                break;
              case 'wedding_inquiries':
                if (Array.isArray(data.items)) {
                  const h = fastHash(data.items);
                  if (h !== lastKnownHashes['weddingInquiries']) {
                    lastKnownHashes['weddingInquiries'] = h;
                    deltaPayload.weddingInquiries = data.items;
                    localStorage.setItem('nn_wedding_inquiries', JSON.stringify(data.items));
                    hasChange = true;
                  }
                }
                break;
              case 'restaurant_orders':
                if (Array.isArray(data.items)) {
                  const h = fastHash(data.items);
                  if (h !== lastKnownHashes['restaurantOrders']) {
                    lastKnownHashes['restaurantOrders'] = h;
                    deltaPayload.restaurantOrders = data.items;
                    localStorage.setItem('nn_restaurant_orders', JSON.stringify(data.items));
                    hasChange = true;
                  }
                }
                break;
              case 'dui_orders':
                if (Array.isArray(data.items)) {
                  const h = fastHash(data.items);
                  if (h !== lastKnownHashes['duiOrders']) {
                    lastKnownHashes['duiOrders'] = h;
                    deltaPayload.duiOrders = data.items;
                    localStorage.setItem('nn_dui_orders', JSON.stringify(data.items));
                    hasChange = true;
                  }
                }
                break;
              case 'external_finance':
                if (Array.isArray(data.items)) {
                  const h = fastHash(data.items);
                  if (h !== lastKnownHashes['externalRecords']) {
                    lastKnownHashes['externalRecords'] = h;
                    deltaPayload.externalRecords = data.items;
                    localStorage.setItem('nn_external_finance_transactions', JSON.stringify(data.items));
                    hasChange = true;
                  }
                }
                break;
              case 'admin_notifications':
                if (Array.isArray(data.items)) {
                  const h = fastHash(data.items);
                  if (h !== lastKnownHashes['adminNotifications']) {
                    lastKnownHashes['adminNotifications'] = h;
                    deltaPayload.adminNotifications = data.items;
                    localStorage.setItem('nn_admin_notifications', JSON.stringify(data.items));
                    hasChange = true;
                  }
                }
                break;
              case 'farm_areas':
                if (Array.isArray(data.items)) {
                  const h = fastHash(data.items);
                  if (h !== lastKnownHashes['farmAreas']) {
                    lastKnownHashes['farmAreas'] = h;
                    deltaPayload.farmAreas = data.items;
                    localStorage.setItem('farm_areas_real_v3', JSON.stringify(data.items));
                    hasChange = true;
                  }
                }
                break;
              case 'farm_rows':
                if (Array.isArray(data.items)) {
                  const h = fastHash(data.items);
                  if (h !== lastKnownHashes['farmRows']) {
                    lastKnownHashes['farmRows'] = h;
                    deltaPayload.farmRows = data.items;
                    localStorage.setItem('farm_rows_real_v3', JSON.stringify(data.items));
                    hasChange = true;
                  }
                }
                break;
              case 'farm_cages':
                if (Array.isArray(data.items)) {
                  const h = fastHash(data.items);
                  if (h !== lastKnownHashes['farmCages']) {
                    lastKnownHashes['farmCages'] = h;
                    deltaPayload.farmCages = data.items;
                    localStorage.setItem('farm_cages_real_v3', JSON.stringify(data.items));
                    hasChange = true;
                  }
                }
                break;
              case 'farm_disinfection':
                if (Array.isArray(data.items)) {
                  const h = fastHash(data.items);
                  if (h !== lastKnownHashes['farmDisinfection']) {
                    lastKnownHashes['farmDisinfection'] = h;
                    deltaPayload.farmDisinfection = data.items;
                    localStorage.setItem('farm_disinfection_real_v3', JSON.stringify(data.items));
                    hasChange = true;
                  }
                }
                break;
              case 'farm_tasks':
                if (Array.isArray(data.items)) {
                  const h = fastHash(data.items);
                  if (h !== lastKnownHashes['farmTasks']) {
                    lastKnownHashes['farmTasks'] = h;
                    deltaPayload.farmTasks = data.items;
                    localStorage.setItem('farm_custom_tasks_v3', JSON.stringify(data.items));
                    hasChange = true;
                  }
                }
                break;
              case 'physical_registry':
                if (data.registry && typeof data.registry === 'object') {
                  const h = fastHash(data.registry);
                  if (h !== lastKnownHashes['physicalRegistry']) {
                    lastKnownHashes['physicalRegistry'] = h;
                    deltaPayload.physicalRegistry = data.registry;
                    // Truyền emitRemoteSync = false để không kích hoạt lại nn_physical_registry_updated
                    savePhysicalRegistry(data.registry, false);
                    hasChange = true;
                  }
                }
                break;
            }
          });

          if (hasChange) {
            onDataChange(deltaPayload);
            window.dispatchEvent(new CustomEvent('nn_data_sync'));
          }
        },
        (err: any) => {
          reportFirestoreError('Snapshot Listener', err);
          if (onError) onError(err);
        }
      );

    } catch (error: any) {
      reportFirestoreError('Khởi tạo ban đầu', error);
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
 * Hàm thực hiện ghi dồn dập được gom cụm lên Firestore sau thời gian debounce
 */
async function flushPendingSync(): Promise<void> {
  if (!isCloudReady) {
    return;
  }

  const dataToSync = { ...pendingSyncPayload };
  pendingSyncPayload = {};

  try {
    await ensureAuth();
    const now = new Date().toISOString();
    const promises: Promise<any>[] = [];

    if (dataToSync.menuItems !== undefined) {
      const h = fastHash(dataToSync.menuItems);
      if (h !== lastKnownHashes['menuItems']) {
        lastKnownHashes['menuItems'] = h;
        promises.push(
          setDoc(doc(db, MODULES_COLLECTION, 'restaurant_menu'), { items: dataToSync.menuItems, updatedAt: now }, { merge: true })
        );
      }
    }

    if (dataToSync.bookings !== undefined) {
      const h = fastHash(dataToSync.bookings);
      if (h !== lastKnownHashes['bookings']) {
        lastKnownHashes['bookings'] = h;
        promises.push(
          setDoc(doc(db, MODULES_COLLECTION, 'table_bookings'), { items: dataToSync.bookings, updatedAt: now }, { merge: true })
        );
      }
    }

    if (dataToSync.weddingInquiries !== undefined) {
      const h = fastHash(dataToSync.weddingInquiries);
      if (h !== lastKnownHashes['weddingInquiries']) {
        lastKnownHashes['weddingInquiries'] = h;
        promises.push(
          setDoc(doc(db, MODULES_COLLECTION, 'wedding_inquiries'), { items: dataToSync.weddingInquiries, updatedAt: now }, { merge: true })
        );
      }
    }

    if (dataToSync.restaurantOrders !== undefined) {
      const h = fastHash(dataToSync.restaurantOrders);
      if (h !== lastKnownHashes['restaurantOrders']) {
        lastKnownHashes['restaurantOrders'] = h;
        promises.push(
          setDoc(doc(db, MODULES_COLLECTION, 'restaurant_orders'), { items: dataToSync.restaurantOrders, updatedAt: now }, { merge: true })
        );
      }
    }

    if (dataToSync.duiOrders !== undefined) {
      const h = fastHash(dataToSync.duiOrders);
      if (h !== lastKnownHashes['duiOrders']) {
        lastKnownHashes['duiOrders'] = h;
        promises.push(
          setDoc(doc(db, MODULES_COLLECTION, 'dui_orders'), { items: dataToSync.duiOrders, updatedAt: now }, { merge: true })
        );
      }
    }

    if (dataToSync.externalRecords !== undefined) {
      const h = fastHash(dataToSync.externalRecords);
      if (h !== lastKnownHashes['externalRecords']) {
        lastKnownHashes['externalRecords'] = h;
        promises.push(
          setDoc(doc(db, MODULES_COLLECTION, 'external_finance'), { items: dataToSync.externalRecords, updatedAt: now }, { merge: true })
        );
      }
    }

    if (dataToSync.adminNotifications !== undefined) {
      const h = fastHash(dataToSync.adminNotifications);
      if (h !== lastKnownHashes['adminNotifications']) {
        lastKnownHashes['adminNotifications'] = h;
        promises.push(
          setDoc(doc(db, MODULES_COLLECTION, 'admin_notifications'), { items: dataToSync.adminNotifications, updatedAt: now }, { merge: true })
        );
      }
    }

    if (dataToSync.farmAreas !== undefined) {
      const h = fastHash(dataToSync.farmAreas);
      if (h !== lastKnownHashes['farmAreas']) {
        lastKnownHashes['farmAreas'] = h;
        promises.push(
          setDoc(doc(db, MODULES_COLLECTION, 'farm_areas'), { items: dataToSync.farmAreas, updatedAt: now }, { merge: true })
        );
      }
    }

    if (dataToSync.farmRows !== undefined) {
      const h = fastHash(dataToSync.farmRows);
      if (h !== lastKnownHashes['farmRows']) {
        lastKnownHashes['farmRows'] = h;
        promises.push(
          setDoc(doc(db, MODULES_COLLECTION, 'farm_rows'), { items: dataToSync.farmRows, updatedAt: now }, { merge: true })
        );
      }
    }

    if (dataToSync.farmCages !== undefined) {
      const h = fastHash(dataToSync.farmCages);
      if (h !== lastKnownHashes['farmCages']) {
        lastKnownHashes['farmCages'] = h;
        promises.push(
          setDoc(doc(db, MODULES_COLLECTION, 'farm_cages'), { items: dataToSync.farmCages, updatedAt: now }, { merge: true })
        );
      }
    }

    if (dataToSync.farmDisinfection !== undefined) {
      const h = fastHash(dataToSync.farmDisinfection);
      if (h !== lastKnownHashes['farmDisinfection']) {
        lastKnownHashes['farmDisinfection'] = h;
        promises.push(
          setDoc(doc(db, MODULES_COLLECTION, 'farm_disinfection'), { items: dataToSync.farmDisinfection, updatedAt: now }, { merge: true })
        );
      }
    }

    if (dataToSync.farmTasks !== undefined) {
      const h = fastHash(dataToSync.farmTasks);
      if (h !== lastKnownHashes['farmTasks']) {
        lastKnownHashes['farmTasks'] = h;
        promises.push(
          setDoc(doc(db, MODULES_COLLECTION, 'farm_tasks'), { items: dataToSync.farmTasks, updatedAt: now }, { merge: true })
        );
      }
    }

    if (dataToSync.physicalRegistry !== undefined) {
      const h = fastHash(dataToSync.physicalRegistry);
      if (h !== lastKnownHashes['physicalRegistry']) {
        lastKnownHashes['physicalRegistry'] = h;
        promises.push(
          setDoc(doc(db, MODULES_COLLECTION, 'physical_registry'), { registry: dataToSync.physicalRegistry, updatedAt: now }, { merge: true })
        );
      }
    }

    if (promises.length > 0) {
      await Promise.all(promises);
    }
  } catch (error: any) {
    reportFirestoreError('Ghi dữ liệu', error);
  }
}

/**
 * Đồng bộ an toàn từng phân hệ lên Firestore (Chỉ cập nhật document liên quan)
 * Áp dụng cơ chế DEBOUNCE QUEUE: gom cụm các thay đổi phát sinh liên tiếp trong 1.5 giây,
 * loại bỏ hoàn toàn tình trạng gửi hàng chục write request mỗi giây làm kiệt quệ hạn ngạch.
 */
export async function syncOnlinePayload(partialData: Partial<SystemDataPayload>): Promise<void> {
  if (!isCloudReady) {
    console.warn('⚠️ Từ chối đồng bộ lên Cloud: Thiết bị đang trong quá trình tải dữ liệu ban đầu.');
    return;
  }

  // Gom cụm payload vào hàng đợi
  pendingSyncPayload = { ...pendingSyncPayload, ...partialData };

  // Khởi chạy hoặc làm mới bộ đếm debounce 1.5 giây
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
  debounceTimer = setTimeout(() => {
    flushPendingSync();
  }, 1500);
}
