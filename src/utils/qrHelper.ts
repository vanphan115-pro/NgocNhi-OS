import QRCode from 'qrcode';
import { FarmArea, FarmRow, FarmCage } from '../components/farm/farmTypes';

export type QrTargetType = 'system' | 'area' | 'row' | 'cage';

/**
 * Bản ghi định danh Vị Trí Vật Lý (Physical Location Record).
 * Đây là registry vật lý bền vững, độc lập với các bản ghi dữ liệu tạm thời.
 * Mã QR dán thực tế trên chuồng/dãy/khu dựa trên `physicalId` này và giữ nguyên lâu dài.
 */
export interface PhysicalLocationRecord {
  physicalId: string;        // ID vật lý cố định mã hóa trong QR (VD: "phys-cage-k1-a-001")
  targetType: QrTargetType;  // 'system' | 'area' | 'row' | 'cage'
  locationKey: string;       // Khóa chuẩn hóa duy nhất (VD: "cage:K1-A-001", "row:K1:D1", "area:K1", "system:root")
  code: string;              // Mã hiển thị thực tế (VD: "K1-A-001", "D1", "K1", "SYSTEM")
  name: string;              // Tên/Mô tả vị trí (VD: "Ô K1-A-001", "Dãy D1", "Khu Sinh Sản")
  areaId?: string;
  areaCode?: string;
  areaName?: string;
  rowId?: string;
  rowCode?: string;
  rowName?: string;
  tier?: number;
  slotNumber?: string;
  hasActiveData: boolean;    // true nếu đang có dữ liệu trong đàn/hệ thống; false nếu dữ liệu đã bị xóa
  dataId?: string;           // ID dữ liệu hiện tại trong DB/State
  createdAt: string;
  updatedAt: string;
}

const PHYSICAL_REGISTRY_KEY = 'farm_physical_registry_v1';

/**
 * Lấy toàn bộ Registry định danh vị trí vật lý từ localStorage
 */
export function getPhysicalRegistry(): Record<string, PhysicalLocationRecord> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(PHYSICAL_REGISTRY_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (e) {
    console.error('Lỗi khi đọc physical registry:', e);
    return {};
  }
}

/**
 * Lưu Registry định danh vị trí vật lý vào localStorage và phát event đồng bộ
 */
export function savePhysicalRegistry(registry: Record<string, PhysicalLocationRecord>, emitRemoteSync: boolean = true): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PHYSICAL_REGISTRY_KEY, JSON.stringify(registry));
    if (emitRemoteSync) {
      window.dispatchEvent(new CustomEvent('nn_physical_registry_updated', { detail: registry }));
    }
    window.dispatchEvent(new CustomEvent('nn_data_sync'));
  } catch (e) {
    console.error('Lỗi khi ghi physical registry:', e);
  }
}

/**
 * Chuẩn hóa chuỗi mã (viết hoa, bỏ khoảng trắng dư, thay khoảng trắng bằng gạch nối)
 */
export function normalizeCode(code?: string): string {
  if (!code) return '';
  return code.trim().toUpperCase().replace(/\s+/g, '-');
}

/**
 * Xây dựng khóa vị trí vật lý (locationKey) chuẩn hóa:
 * - Hệ thống: system:root
 * - Khu:      area:K1
 * - Dãy:      row:K1:D1
 * - Ô:        cage:K1-A-001
 */
export function buildPhysicalLocationKey(
  type: QrTargetType,
  details: {
    code?: string;
    areaCode?: string;
    rowCode?: string;
    tier?: number;
    slotNumber?: string;
  }
): string {
  switch (type) {
    case 'system':
      return 'system:root';
    case 'area':
      return `area:${normalizeCode(details.code || details.areaCode)}`;
    case 'row': {
      const aCode = normalizeCode(details.areaCode) || 'AREA';
      const rCode = normalizeCode(details.code || details.rowCode);
      return `row:${aCode}:${rCode}`;
    }
    case 'cage':
      return `cage:${normalizeCode(details.code)}`;
  }
}

/**
 * Tạo physicalId ổn định và mang tính ngữ nghĩa, dễ nhận diện vật lý:
 * VD: phys-cage-k1-a-001, phys-row-k1-d1, phys-area-k1, phys-system-root
 */
export function generatePhysicalId(
  type: QrTargetType,
  details: {
    code?: string;
    areaCode?: string;
    rowCode?: string;
  }
): string {
  if (type === 'system') return 'phys-system-root';

  const cleanSlug = (str?: string) =>
    (str || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

  if (type === 'area') {
    const aSlug = cleanSlug(details.code || details.areaCode) || 'area';
    return `phys-area-${aSlug}`;
  }

  if (type === 'row') {
    const aSlug = cleanSlug(details.areaCode) || 'area';
    const rSlug = cleanSlug(details.code || details.rowCode) || 'row';
    return `phys-row-${aSlug}-${rSlug}`;
  }

  // Cấp Ô chuồng
  const cSlug = cleanSlug(details.code) || 'cage';
  return `phys-cage-${cSlug}`;
}

/**
 * Đăng ký mới HOẶC phục hồi Vị trí vật lý cũ từ Registry:
 * 1. Nếu vị trí/mã vật lý đã có trong registry -> Tự động dùng lại `physicalId` cũ -> QR đã in tự động phục hồi!
 * 2. Nếu là vị trí vật lý mới -> Tạo `physicalId` mới và ghi vào registry.
 */
export function registerOrRecoverPhysicalLocation(
  type: QrTargetType,
  details: {
    code: string;
    name?: string;
    areaId?: string;
    areaCode?: string;
    areaName?: string;
    rowId?: string;
    rowCode?: string;
    rowName?: string;
    tier?: number;
    slotNumber?: string;
    dataId?: string;
  }
): { physicalId: string; isRecovered: boolean; record: PhysicalLocationRecord } {
  const registry = getPhysicalRegistry();
  const locationKey = buildPhysicalLocationKey(type, details);
  const nowStr = new Date().toISOString();

  // Tìm kiếm xem locationKey hoặc physicalId đã có trong registry chưa
  let existingRecord: PhysicalLocationRecord | undefined = registry[locationKey];

  if (!existingRecord) {
    // Thử tìm theo physicalId tương ứng
    const expectedId = generatePhysicalId(type, details);
    existingRecord = Object.values(registry).find(
      r => r.physicalId === expectedId || r.locationKey === locationKey
    );
  }

  // Nếu tìm ô: còn kiểm tra thêm mã code trùng khớp
  if (!existingRecord && type === 'cage' && details.code) {
    const norm = normalizeCode(details.code);
    existingRecord = Object.values(registry).find(
      r => r.targetType === 'cage' && normalizeCode(r.code) === norm
    );
  }

  if (existingRecord) {
    // PHỤC HỒI QR CŨ: Vị trí vật lý này đã từng có QR!
    // Cập nhật lại thông tin mới nhất và đánh dấu có dữ liệu hoạt động
    existingRecord.hasActiveData = true;
    existingRecord.dataId = details.dataId || existingRecord.dataId;
    if (details.name) existingRecord.name = details.name;
    if (details.areaId) existingRecord.areaId = details.areaId;
    if (details.areaCode) existingRecord.areaCode = details.areaCode;
    if (details.areaName) existingRecord.areaName = details.areaName;
    if (details.rowId) existingRecord.rowId = details.rowId;
    if (details.rowCode) existingRecord.rowCode = details.rowCode;
    if (details.rowName) existingRecord.rowName = details.rowName;
    if (details.tier !== undefined) existingRecord.tier = details.tier;
    if (details.slotNumber) existingRecord.slotNumber = details.slotNumber;
    existingRecord.updatedAt = nowStr;

    registry[locationKey] = existingRecord;
    registry[existingRecord.physicalId] = existingRecord;
    savePhysicalRegistry(registry);

    return {
      physicalId: existingRecord.physicalId,
      isRecovered: true,
      record: existingRecord
    };
  }

  // VỊ TRÍ VẬT LÝ MỚI HOÀN TOÀN: Tạo physicalId mới
  const newPhysicalId = generatePhysicalId(type, details);
  const newRecord: PhysicalLocationRecord = {
    physicalId: newPhysicalId,
    targetType: type,
    locationKey,
    code: details.code,
    name: details.name || (type === 'cage' ? `Ô ${details.code}` : type === 'row' ? `Dãy ${details.code}` : type === 'area' ? `Khu ${details.code}` : 'Hệ Thống'),
    areaId: details.areaId,
    areaCode: details.areaCode,
    areaName: details.areaName,
    rowId: details.rowId,
    rowCode: details.rowCode,
    rowName: details.rowName,
    tier: details.tier,
    slotNumber: details.slotNumber,
    hasActiveData: true,
    dataId: details.dataId,
    createdAt: nowStr,
    updatedAt: nowStr
  };

  registry[locationKey] = newRecord;
  registry[newPhysicalId] = newRecord;
  savePhysicalRegistry(registry);

  return {
    physicalId: newPhysicalId,
    isRecovered: false,
    record: newRecord
  };
}

/**
 * Khi xóa dữ liệu (Ô, Dãy, Khu):
 * TUYỆT ĐỐI KHÔNG XÓA `physicalId` và mapping QR trong registry!
 * Chỉ cập nhật `hasActiveData = false` để khi quét QR dán ngoài thực tế vẫn nhận diện đúng vị trí.
 */
export function markPhysicalLocationDeleted(
  type: QrTargetType,
  identifier: {
    physicalId?: string;
    code?: string;
    dataId?: string;
    areaCode?: string;
    rowCode?: string;
  }
): void {
  const registry = getPhysicalRegistry();
  let targetRecord: PhysicalLocationRecord | undefined;

  if (identifier.physicalId && registry[identifier.physicalId]) {
    targetRecord = registry[identifier.physicalId];
  } else if (identifier.dataId) {
    targetRecord = Object.values(registry).find(r => r.dataId === identifier.dataId);
  } else if (identifier.code) {
    const norm = normalizeCode(identifier.code);
    targetRecord = Object.values(registry).find(r => r.targetType === type && normalizeCode(r.code) === norm);
  }

  if (targetRecord) {
    targetRecord.hasActiveData = false;
    targetRecord.updatedAt = new Date().toISOString();
    registry[targetRecord.locationKey] = targetRecord;
    registry[targetRecord.physicalId] = targetRecord;
    savePhysicalRegistry(registry);
  }
}

/**
 * Lấy URL gốc (origin + pathname) động từ trình duyệt
 * Không bao giờ hard-code domain, hoạt động chính xác trên mọi môi trường và sau khi xuất bản
 */
export function getAppBaseUrl(): string {
  if (typeof window !== 'undefined' && window.location) {
    const origin = window.location.origin || '';
    const pathname = window.location.pathname || '/';
    return `${origin}${pathname}`.replace(/\/+$/, '');
  }
  return '';
}

/**
 * Sinh URL thật theo 4 cấp bậc dựa trên `physicalId` định danh vị trí vật lý
 * 1. QR Tổng Hệ thống -> ?view=portal&qrType=system&physId=phys-system-root
 * 2. QR Khu -> ?view=farm&tab=areas&physId=<physicalId>
 * 3. QR Dãy -> ?view=farm&tab=areas&physId=<physicalId>
 * 4. QR Ô -> ?view=farm&tab=areas&physId=<physicalId>
 */
export function buildQrUrl(
  type: QrTargetType,
  params: {
    physicalId?: string;
    areaId?: string;
    rowId?: string;
    cageId?: string;
    code?: string;
    areaCode?: string;
    rowCode?: string;
  }
): string {
  const baseUrl = getAppBaseUrl();
  const searchParams = new URLSearchParams();

  // Đảm bảo luôn có physicalId ổn định
  let physId = params.physicalId;
  if (!physId) {
    physId = generatePhysicalId(type, {
      code: params.code,
      areaCode: params.areaCode,
      rowCode: params.rowCode
    });
  }

  switch (type) {
    case 'system':
      searchParams.set('view', 'portal');
      searchParams.set('qrType', 'system');
      searchParams.set('physId', 'phys-system-root');
      break;

    case 'area':
      searchParams.set('view', 'farm');
      searchParams.set('tab', 'areas');
      searchParams.set('physId', physId);
      if (params.areaId) searchParams.set('areaId', params.areaId);
      break;

    case 'row':
      searchParams.set('view', 'farm');
      searchParams.set('tab', 'areas');
      searchParams.set('physId', physId);
      if (params.areaId) searchParams.set('areaId', params.areaId);
      if (params.rowId) searchParams.set('rowId', params.rowId);
      break;

    case 'cage':
      searchParams.set('view', 'farm');
      searchParams.set('tab', 'areas');
      searchParams.set('physId', physId);
      if (params.cageId) searchParams.set('cageId', params.cageId);
      break;
  }

  const queryStr = searchParams.toString();
  return queryStr ? `${baseUrl}/?${queryStr}` : `${baseUrl}/`;
}

/**
 * Sinh mã QR Code THẬT (Base64 PNG Data URL) sử dụng thư viện `qrcode`
 * Độ sửa lỗi mức H (High - 30%) giúp tem QR dán chuồng dễ quét ngay cả khi mờ bẩn
 */
export async function generateQRCodeDataUrl(
  text: string,
  options?: QRCode.QRCodeToDataURLOptions
): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      width: options?.width || 512,
      margin: options?.margin !== undefined ? options.margin : 2,
      errorCorrectionLevel: options?.errorCorrectionLevel || 'H',
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      },
      ...options
    });
  } catch (err) {
    console.error('Lỗi khi sinh mã QR bằng qrcode:', err);
    throw err;
  }
}

/**
 * Migration an toàn dữ liệu:
 * Gán `physicalId` cố định cho từng Khu, Dãy, Ô và đăng ký đầy đủ vào Physical Registry.
 */
export function migrateFarmEntities(
  areas: FarmArea[],
  rows: FarmRow[],
  cages: FarmCage[]
): {
  migratedAreas: FarmArea[];
  migratedRows: FarmRow[];
  migratedCages: FarmCage[];
  hasChanges: boolean;
} {
  let hasChanges = false;
  const registry = getPhysicalRegistry();

  // Đăng ký cấp Tổng Hệ Thống
  registerOrRecoverPhysicalLocation('system', { code: 'SYSTEM', name: 'Hệ Thống Dịch Vụ Ngọc Nhi' });

  // 1. Migration Khu (Area)
  const migratedAreas = areas.map(area => {
    let updatedArea = { ...area };
    if (!area.physicalId) {
      const reg = registerOrRecoverPhysicalLocation('area', {
        code: area.code,
        name: area.name,
        dataId: area.id
      });
      updatedArea.physicalId = reg.physicalId;
      hasChanges = true;
    } else {
      // Đảm bảo registry có bản ghi
      registerOrRecoverPhysicalLocation('area', {
        code: area.code,
        name: area.name,
        dataId: area.id
      });
    }
    return updatedArea;
  });

  const areaMap = new Map<string, FarmArea>();
  migratedAreas.forEach(a => areaMap.set(a.id, a));

  // 2. Migration Dãy (Row)
  const migratedRows = rows.map(row => {
    let updatedRow = { ...row };
    const parentArea = areaMap.get(row.areaId);
    const areaCode = parentArea ? parentArea.code : 'K1';

    if (!row.physicalId) {
      const reg = registerOrRecoverPhysicalLocation('row', {
        code: row.code,
        name: row.name,
        areaId: row.areaId,
        areaCode,
        areaName: parentArea?.name,
        dataId: row.id
      });
      updatedRow.physicalId = reg.physicalId;
      hasChanges = true;
    } else {
      registerOrRecoverPhysicalLocation('row', {
        code: row.code,
        name: row.name,
        areaId: row.areaId,
        areaCode,
        areaName: parentArea?.name,
        dataId: row.id
      });
    }
    return updatedRow;
  });

  const rowMap = new Map<string, FarmRow>();
  migratedRows.forEach(r => rowMap.set(r.id, r));

  // 3. Migration Ô (Cage)
  const migratedCages = cages.map(cage => {
    let updatedCage = { ...cage };
    const parentArea = areaMap.get(cage.areaId);
    const parentRow = rowMap.get(cage.rowId);

    if (!cage.physicalId) {
      const reg = registerOrRecoverPhysicalLocation('cage', {
        code: cage.code,
        name: `Ô ${cage.code}`,
        areaId: cage.areaId,
        areaCode: cage.areaCode || parentArea?.code,
        areaName: parentArea?.name,
        rowId: cage.rowId,
        rowCode: cage.rowCode || parentRow?.code,
        rowName: parentRow?.name,
        tier: cage.tier,
        slotNumber: cage.slotNumber,
        dataId: cage.id
      });
      updatedCage.physicalId = reg.physicalId;
      hasChanges = true;
    } else {
      registerOrRecoverPhysicalLocation('cage', {
        code: cage.code,
        name: `Ô ${cage.code}`,
        areaId: cage.areaId,
        areaCode: cage.areaCode || parentArea?.code,
        areaName: parentArea?.name,
        rowId: cage.rowId,
        rowCode: cage.rowCode || parentRow?.code,
        rowName: parentRow?.name,
        tier: cage.tier,
        slotNumber: cage.slotNumber,
        dataId: cage.id
      });
    }
    return updatedCage;
  });

  return {
    migratedAreas,
    migratedRows,
    migratedCages,
    hasChanges
  };
}

/**
 * Kết quả phân tích quét QR từ URL:
 * - 'success': Tìm thấy dữ liệu hoạt động của vị trí -> Mở trực tiếp
 * - 'location_empty': Vị trí vật lý tồn tại/được nhận diện nhưng dữ liệu đã bị xóa hoặc chưa tạo lại -> Báo: “Vị trí này chưa có dữ liệu trên hệ thống”
 * - 'portal': Trở về tổng quan hệ thống
 */
export interface QrScanLookupResult {
  status: 'success' | 'location_empty' | 'portal';
  targetType?: QrTargetType;
  message?: string;
  physicalLocation?: PhysicalLocationRecord;
  area?: FarmArea;
  row?: FarmRow;
  cage?: FarmCage;
}

/**
 * Xử lý quét URL chứa QR:
 * Đọc theo `physId` hoặc `cageId`/`rowId`/`areaId`.
 * Nếu vị trí đã bị xóa dữ liệu nhưng chưa tạo lại:
 * Trả về thông báo chuẩn xác: “Vị trí này chưa có dữ liệu trên hệ thống”, KHÔNG báo QR không hợp lệ!
 */
export function resolveQrTargetFromUrl(
  searchQuery: string,
  data: { areas: FarmArea[]; rows: FarmRow[]; cages: FarmCage[] }
): QrScanLookupResult {
  const params = new URLSearchParams(searchQuery);
  const physId = params.get('physId');
  const cageId = params.get('cageId');
  const rowId = params.get('rowId');
  const areaId = params.get('areaId');
  const qrType = params.get('qrType') as QrTargetType | null;
  const view = params.get('view');

  const registry = getPhysicalRegistry();
  const EMPTY_DATA_MSG = 'Vị trí này chưa có dữ liệu trên hệ thống';

  // 1. Quét theo mã physId (ưu tiên chuẩn vật lý cao nhất)
  if (physId) {
    if (physId === 'phys-system-root' || qrType === 'system') {
      return { status: 'portal', targetType: 'system' };
    }

    // A. Tìm trong Ô Chuồng
    const activeCage = data.cages.find(c => c.physicalId === physId || `phys-cage-${normalizeCode(c.code).toLowerCase()}` === physId);
    if (activeCage) {
      const activeArea = data.areas.find(a => a.id === activeCage.areaId);
      const activeRow = data.rows.find(r => r.id === activeCage.rowId);
      return {
        status: 'success',
        targetType: 'cage',
        cage: activeCage,
        area: activeArea,
        row: activeRow
      };
    }

    // B. Tìm trong Dãy Chuồng
    const activeRow = data.rows.find(r => r.physicalId === physId);
    if (activeRow) {
      const activeArea = data.areas.find(a => a.id === activeRow.areaId);
      return {
        status: 'success',
        targetType: 'row',
        row: activeRow,
        area: activeArea
      };
    }

    // C. Tìm trong Phân Khu
    const activeArea = data.areas.find(a => a.physicalId === physId);
    if (activeArea) {
      return {
        status: 'success',
        targetType: 'area',
        area: activeArea
      };
    }

    // D. DỮ LIỆU ĐÃ BỊ XÓA HOẶC CHƯA TẠO LẠI TRÊN HỆ THỐNG:
    // Kiểm tra thông tin vị trí vật lý trong Registry định danh
    const physicalRec = registry[physId] || Object.values(registry).find(r => r.physicalId === physId);
    const targetTypeGuess: QrTargetType = physId.includes('cage') ? 'cage' : physId.includes('row') ? 'row' : physId.includes('area') ? 'area' : 'cage';

    return {
      status: 'location_empty',
      targetType: physicalRec?.targetType || targetTypeGuess,
      message: EMPTY_DATA_MSG,
      physicalLocation: physicalRec || {
        physicalId: physId,
        targetType: targetTypeGuess,
        locationKey: physId,
        code: physId.replace(/^phys-[a-z]+-/, '').toUpperCase(),
        name: `Vị trí ${physId.replace(/^phys-[a-z]+-/, '').toUpperCase()}`,
        hasActiveData: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };
  }

  // 2. Tương thích ngược: Quét qua cageId
  if (cageId) {
    const activeCage = data.cages.find(c => c.id === cageId);
    if (activeCage) {
      const activeArea = data.areas.find(a => a.id === activeCage.areaId);
      const activeRow = data.rows.find(r => r.id === activeCage.rowId);
      return {
        status: 'success',
        targetType: 'cage',
        cage: activeCage,
        area: activeArea,
        row: activeRow
      };
    }
    const physicalRec = Object.values(registry).find(r => r.dataId === cageId || r.physicalId === cageId);
    return {
      status: 'location_empty',
      targetType: 'cage',
      message: EMPTY_DATA_MSG,
      physicalLocation: physicalRec
    };
  }

  // 3. Tương thích ngược: Quét qua rowId
  if (rowId) {
    const activeRow = data.rows.find(r => r.id === rowId);
    if (activeRow) {
      const activeArea = data.areas.find(a => a.id === activeRow.areaId);
      return {
        status: 'success',
        targetType: 'row',
        row: activeRow,
        area: activeArea
      };
    }
    const physicalRec = Object.values(registry).find(r => r.dataId === rowId || r.physicalId === rowId);
    return {
      status: 'location_empty',
      targetType: 'row',
      message: EMPTY_DATA_MSG,
      physicalLocation: physicalRec
    };
  }

  // 4. Tương thích ngược: Quét qua areaId
  if (areaId) {
    const activeArea = data.areas.find(a => a.id === areaId);
    if (activeArea) {
      return {
        status: 'success',
        targetType: 'area',
        area: activeArea
      };
    }
    const physicalRec = Object.values(registry).find(r => r.dataId === areaId || r.physicalId === areaId);
    return {
      status: 'location_empty',
      targetType: 'area',
      message: EMPTY_DATA_MSG,
      physicalLocation: physicalRec
    };
  }

  // 5. Cấp 1: QR Tổng Hệ Thống
  if (qrType === 'system' || view === 'portal') {
    return { status: 'portal', targetType: 'system' };
  }

  return { status: 'portal' };
}
