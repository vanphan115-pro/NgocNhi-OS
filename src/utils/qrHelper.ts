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

export interface LabeledQROptions {
  type: QrTargetType;
  title: string;
  badge: string;
  badgeColor?: string;
  subtitle?: string;
  extraDetails?: string;
  idLabel?: string;
  url?: string;
  farmName?: string;
  subFarmName?: string;
  hotline?: string;
  copyrightText?: string;
  instructionText?: string;
}

/**
 * Sinh mã QR Code ĐÃ CÓ TÊN & THÔNG TIN ĐẦY ĐỦ (Labeled QR Tag/Card).
 * Tạo một thẻ ảnh PNG sắc nét (800x1100 px, 300 DPI) gồm:
 * - Header thương hiệu: Phân biệt rõ Hệ Thống Dịch Vụ Ngọc Nhi (3 phân hệ) và Trại Dúi KaKa
 * - Huy hiệu phân loại (QR Ô Chuồng, QR Dãy, QR Phân Khu, QR Tổng Hệ Thống)
 * - TÊN QR NỔI BẬT (In hoa đậm nét, cỡ chữ lớn)
 * - Thông tin vị trí & trạng thái chi tiết
 * - Khối mã QR Code thực tế (Sửa lỗi mức H 30%, chống mờ bẩn)
 * - Hướng dẫn quét camera & Mã ID vật lý cố định
 * 
 * Giúp người dùng in ra decal dán chuồng có thể phân biệt chính xác từng loại QR.
 */
export async function generateLabeledQRCodeDataUrl(
  text: string,
  options: LabeledQROptions
): Promise<{ labeledDataUrl: string; rawQrDataUrl: string }> {
  // 1. Sinh mã QR raw độ phân giải cao
  const rawQrDataUrl = await generateQRCodeDataUrl(text, {
    width: 600,
    margin: 2,
    errorCorrectionLevel: 'H'
  });

  // Nếu môi trường không có document/canvas (SSR), trả về raw
  if (typeof document === 'undefined') {
    return { labeledDataUrl: rawQrDataUrl, rawQrDataUrl };
  }

  try {
    const canvas = document.createElement('canvas');
    const W = 800;
    const H = 1100;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return { labeledDataUrl: rawQrDataUrl, rawQrDataUrl };
    }

    const isSystem = options.type === 'system';

    // Helper vẽ hình chữ nhật bo góc
    const drawRoundedRect = (
      x: number,
      y: number,
      width: number,
      height: number,
      radius: number,
      fill?: string,
      stroke?: string,
      lineWidth: number = 1
    ) => {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      ctx.lineTo(x + width, y + height - radius);
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      ctx.lineTo(x + radius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
      if (fill) {
        ctx.fillStyle = fill;
        ctx.fill();
      }
      if (stroke) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
      }
      ctx.restore();
    };

    // 1. Nền trắng tinh khiết
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);

    // 2. Viền ngoài thẻ tem dán (Khung decal chuyên nghiệp)
    drawRoundedRect(24, 24, W - 48, H - 48, 28, undefined, '#0f172a', 4);

    // Đường viền phụ mỏng bên trong
    drawRoundedRect(34, 34, W - 68, H - 68, 20, undefined, '#e2e8f0', 1.5);

    // 3. HEADER THƯƠNG HIỆU
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const brandMain = (options.farmName || (isSystem ? 'HỆ THỐNG DỊCH VỤ NGỌC NHI' : 'TRẠI DÚI KAKA • PHAN DŨNG')).toUpperCase();
    ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#1e293b';
    ctx.fillText(brandMain, W / 2, 58);

    const defaultSub = isSystem 
      ? 'Chuỗi dịch vụ đa ngành hàng đầu tại KP 9, phường Lộc Ninh, TP. Đồng Nai\nGiao thoa hoàn hảo giữa ẩm thực đặc sản cao cấp, dịch vụ tiệc cưới và Trang trại dúi hiện đại'
      : 'HỆ THỐNG DỊCH VỤ NGỌC NHI • KP 9, PHƯỜNG LỘC NINH, TP. ĐỒNG NAI';
    const rawBrandSub = options.subFarmName || defaultSub;

    const subLines = rawBrandSub.split('\n').map(s => s.trim()).filter(Boolean);
    if (subLines.length <= 1) {
      ctx.font = '600 13px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.fillText(subLines[0] || '', W / 2, 85);
    } else {
      ctx.font = '600 11.5px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#475569';
      ctx.fillText(subLines[0], W / 2, 79);
      ctx.font = '500 11px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.fillText(subLines[1], W / 2, 95);
    }

    // Đường kẻ phân cách header
    ctx.beginPath();
    ctx.moveTo(60, 110);
    ctx.lineTo(W - 60, 110);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 4. HUY HIỆU PHÂN LOẠI QR (Type Badge)
    const badgeColor = options.badgeColor || (
      options.type === 'system' ? '#0f172a' :
      options.type === 'area' ? '#047857' :
      options.type === 'row' ? '#1d4ed8' : '#be123c'
    );

    ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
    const badgeText = options.badge.toUpperCase();
    const badgeWidth = Math.max(ctx.measureText(badgeText).width + 36, 260);
    const badgeHeight = 36;
    const badgeX = (W - badgeWidth) / 2;
    const badgeY = 124;

    drawRoundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 18, badgeColor);

    ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(badgeText, W / 2, badgeY + badgeHeight / 2);

    // 5. TÊN QR CODE LỚN & NỔI BẬT (Main Title)
    let titleFontSize = 38;
    ctx.font = `bold ${titleFontSize}px system-ui, -apple-system, sans-serif`;
    let titleWidth = ctx.measureText(options.title).width;
    while (titleWidth > W - 140 && titleFontSize > 22) {
      titleFontSize -= 2;
      ctx.font = `bold ${titleFontSize}px system-ui, -apple-system, sans-serif`;
      titleWidth = ctx.measureText(options.title).width;
    }
    ctx.fillStyle = '#0f172a';
    ctx.fillText(options.title, W / 2, 195);

    // 6. DÒNG VỊ TRÍ / PHỤ ĐỀ (Subtitle)
    if (options.subtitle) {
      let subFontSize = 18;
      ctx.font = `600 ${subFontSize}px system-ui, -apple-system, sans-serif`;
      let subWidth = ctx.measureText(options.subtitle).width;
      while (subWidth > W - 140 && subFontSize > 14) {
        subFontSize -= 1;
        ctx.font = `600 ${subFontSize}px system-ui, -apple-system, sans-serif`;
        subWidth = ctx.measureText(options.subtitle).width;
      }
      ctx.fillStyle = '#334155';
      ctx.fillText(options.subtitle, W / 2, options.extraDetails ? 236 : 246);
    }

    // 7. DÒNG THÔNG TIN BỔ SUNG / TRẠNG THÁI (Extra Details)
    // Nếu nội dung đã xuất hiện ở phần trên (Header) thì bỏ qua để tránh trùng lặp
    const trimmedExtra = (options.extraDetails || '').trim();
    const isDuplicateOfHeader = Boolean(trimmedExtra && (
      rawBrandSub.toLowerCase().includes(trimmedExtra.toLowerCase().slice(0, 20)) ||
      (options.subtitle && options.subtitle.toLowerCase().includes(trimmedExtra.toLowerCase().slice(0, 20)))
    ));

    if (trimmedExtra && !isDuplicateOfHeader) {
      ctx.font = '500 15px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.fillText(trimmedExtra, W / 2, 268);
    }

    // 8. ĐƯỜNG PHÂN CÁCH TRƯỚC MÃ QR
    ctx.beginPath();
    ctx.moveTo(80, 288);
    ctx.lineTo(W - 80, 288);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 9. VẼ KHUNG & ẢNH MÃ QR CODE
    const qrSize = 470;
    const qrX = (W - qrSize) / 2;
    const qrY = 305;

    // Khung viền hộp QR
    drawRoundedRect(qrX - 12, qrY - 12, qrSize + 24, qrSize + 24, 20, '#ffffff', '#cbd5e1', 2);

    // Tải ảnh QR vào canvas
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = (e) => reject(e);
      img.src = rawQrDataUrl;
    });

    ctx.drawImage(img, qrX, qrY, qrSize, qrSize);

    // Logo / Nhãn nhỏ thương hiệu góc dưới QR
    const brandTagW = isSystem ? 96 : 86;
    const brandTagH = 22;
    drawRoundedRect(qrX + qrSize - brandTagW - 8, qrY + qrSize - brandTagH - 8, brandTagW, brandTagH, 6, '#0f172a');
    ctx.font = 'bold 11px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(isSystem ? 'NGỌC NHI' : 'KAKA DÚI', qrX + qrSize - brandTagW / 2 - 8, qrY + qrSize - brandTagH / 2 - 8);

    // 10. HƯỚNG DẪN QUÉT BẰNG CAMERA / ZALO
    ctx.font = 'bold 17px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.fillText(options.instructionText || '📱 Quét bằng Camera điện thoại hoặc Zalo để mở hồ sơ', W / 2, 840);

    // 11. DÒNG LIÊN HỆ & HOTLINE KỸ THUẬT
    const contactText = options.hotline || (isSystem
      ? 'Hotline: 0967.823.801 - 0969.310.601 • Hệ Thống Dịch Vụ Ngọc Nhi'
      : 'Hotline Kỹ Thuật: 0969.310.601 • Trại Dúi KaKa (Phan Dũng)');
    ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#334155';
    ctx.fillText(contactText, W / 2, 882);

    // 12. DÒNG CHỈ DẪN CẮT TEM DECAL (Dashed Cut Guide)
    ctx.save();
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.moveTo(50, 930);
    ctx.lineTo(W - 50, 930);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    ctx.font = 'italic 13px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText(
      isSystem 
        ? '✂ Tem quét Cổng Hệ Thống Ngọc Nhi • 3 Phân hệ: Trại Dúi - Quán Ăn - Tiệc Cưới'
        : '✂ Tem dán chuồng trại tiêu chuẩn • In decal nhựa hoặc giấy ép plastic chống nước', 
      W / 2, 
      958
    );

    const copyright = options.copyrightText || (isSystem
      ? 'Bản quyền Hệ Thống Dịch Vụ Ngọc Nhi (3 Phân Hệ Thống Nhất)'
      : 'Bản quyền Trại Dúi KaKa - Thuộc Hệ Thống Dịch Vụ Ngọc Nhi');
    ctx.font = '11.5px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`Ngày tạo: ${new Date().toLocaleDateString('vi-VN')} • ${copyright}`, W / 2, 995);

    const labeledDataUrl = canvas.toDataURL('image/png');
    return { labeledDataUrl, rawQrDataUrl };
  } catch (err) {
    console.error('Lỗi khi vẽ thẻ QR có tên:', err);
    return { labeledDataUrl: rawQrDataUrl, rawQrDataUrl };
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
