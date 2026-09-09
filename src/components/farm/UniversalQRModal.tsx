import React, { useState, useEffect, useRef } from 'react';
import { FarmArea, FarmRow, FarmCage } from './farmTypes';
import { FARM_METADATA } from './farmData';
import { 
  QrTargetType, 
  buildQrUrl, 
  generateQRCodeDataUrl 
} from '../../utils/qrHelper';
import { 
  X, 
  Printer, 
  Download, 
  Maximize2, 
  Minimize2, 
  Copy, 
  Check, 
  ExternalLink, 
  Sparkles, 
  Building2, 
  MapPin, 
  Layers, 
  Grid3X3, 
  ShieldCheck, 
  Info,
  RefreshCw
} from 'lucide-react';

interface UniversalQRModalProps {
  initialType?: QrTargetType;
  area?: FarmArea | null;
  row?: FarmRow | null;
  cage?: FarmCage | null;
  allAreas?: FarmArea[];
  allRows?: FarmRow[];
  onClose: () => void;
  onNavigateToTarget?: (type: QrTargetType, payload: { area?: FarmArea; row?: FarmRow; cage?: FarmCage }) => void;
}

export const UniversalQRModal: React.FC<UniversalQRModalProps> = ({
  initialType = 'system',
  area,
  row,
  cage,
  allAreas = [],
  allRows = [],
  onClose,
  onNavigateToTarget
}) => {
  // Xác định cấp độ QR ban đầu
  const [activeType, setActiveType] = useState<QrTargetType>(() => {
    if (cage) return 'cage';
    if (row) return 'row';
    if (area) return 'area';
    return initialType;
  });

  // State dữ liệu thực tế theo cấp độ đang chọn
  const [currentArea, setCurrentArea] = useState<FarmArea | null>(() => {
    if (area) return area;
    if (cage && allAreas.length > 0) {
      return allAreas.find(a => a.id === cage.areaId) || null;
    }
    if (row && allAreas.length > 0) {
      return allAreas.find(a => a.id === row.areaId) || null;
    }
    return null;
  });

  const [currentRow, setCurrentRow] = useState<FarmRow | null>(() => {
    if (row) return row;
    if (cage && allRows.length > 0) {
      return allRows.find(r => r.id === cage.rowId) || null;
    }
    return null;
  });

  const [currentCage, setCurrentCage] = useState<FarmCage | null>(cage || null);

  // Trạng thái QR Code thực tế
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [qrUrl, setQrUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(true);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  // Sinh URL động và tạo QR Code THỰC bằng thư viện `qrcode`
  useEffect(() => {
    let isSubscribed = true;
    setIsGenerating(true);

    let url = '';
    switch (activeType) {
      case 'system':
        url = buildQrUrl('system', { physicalId: 'phys-system-root' });
        break;
      case 'area':
        if (currentArea) {
          url = buildQrUrl('area', { 
            physicalId: currentArea.physicalId,
            areaId: currentArea.id,
            code: currentArea.code
          });
        } else {
          url = buildQrUrl('system', {});
        }
        break;
      case 'row':
        if (currentRow) {
          url = buildQrUrl('row', { 
            physicalId: currentRow.physicalId,
            areaId: currentRow.areaId || currentArea?.id, 
            rowId: currentRow.id,
            code: currentRow.code,
            areaCode: currentArea?.code
          });
        } else {
          url = buildQrUrl('system', {});
        }
        break;
      case 'cage':
        if (currentCage) {
          url = buildQrUrl('cage', { 
            physicalId: currentCage.physicalId,
            cageId: currentCage.id,
            code: currentCage.code,
            areaCode: currentCage.areaCode || currentArea?.code,
            rowCode: currentCage.rowCode || currentRow?.code
          });
        } else {
          url = buildQrUrl('system', {});
        }
        break;
    }

    setQrUrl(url);

    generateQRCodeDataUrl(url, {
      width: 600,
      margin: 2,
      errorCorrectionLevel: 'H'
    })
      .then(dataUrl => {
        if (isSubscribed) {
          setQrDataUrl(dataUrl);
          setIsGenerating(false);
        }
      })
      .catch(err => {
        console.error('Lỗi khi sinh mã QR thực:', err);
        if (isSubscribed) {
          setIsGenerating(false);
        }
      });

    return () => {
      isSubscribed = false;
    };
  }, [activeType, currentArea, currentRow, currentCage]);

  // Sao chép liên kết URL
  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(qrUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (e) {
      // Fallback
      const input = document.createElement('input');
      input.value = qrUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Tải ảnh QR Code (PNG độ nét cao)
  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    let fileName = 'QR_Tong_NgocNhi.png';
    if (activeType === 'area' && currentArea) {
      fileName = `QR_Khu_${currentArea.code || currentArea.id}.png`;
    } else if (activeType === 'row' && currentRow) {
      fileName = `QR_Day_${currentRow.code || currentRow.id}.png`;
    } else if (activeType === 'cage' && currentCage) {
      fileName = `QR_O_${currentCage.code || currentCage.id}.png`;
    }
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  // Kích hoạt lệnh In (Print)
  const handlePrint = () => {
    window.print();
  };

  // Thông tin hiển thị theo từng cấp độ
  const getBadgeInfo = () => {
    switch (activeType) {
      case 'system':
        return {
          badge: 'CẤP 1 • TỔNG HỆ THỐNG',
          title: 'Hệ Thống Dịch Vụ Ngọc Nhi',
          subtitle: 'Trang Trại Dúi Mốc Đại • Nhà Hàng Ẩm Thực • Tiệc Cưới',
          idLabel: 'phys-system-root',
          desc: 'Mã QR đại diện cho Vị trí gốc toàn hệ thống. Quét mã QR để truy cập trực tiếp Cổng dịch vụ Ngọc Nhi.'
        };
      case 'area':
        return {
          badge: `CẤP 2 • PHÂN KHU CHUỒNG TRẠI`,
          title: currentArea?.name || 'Phân Khu Trang Trại',
          subtitle: `Mã Khu: ${currentArea?.code || 'KHU'} • ${currentArea?.kindLabel || 'Khu Chăn Nuôi'}`,
          idLabel: currentArea?.physicalId || `phys-area-${(currentArea?.code || 'khu').toLowerCase()}`,
          desc: 'Mã QR đại diện Vị trí vật lý Phân khu. Giữ nguyên lâu dài ngay cả khi chỉnh sửa hoặc tạo lại.'
        };
      case 'row':
        return {
          badge: `CẤP 3 • DÃY CHUỒNG TIÊU CHUẨN`,
          title: currentRow?.name || 'Dãy Chuồng',
          subtitle: `Mã Dãy: ${currentRow?.code || 'D1'} • ${currentRow?.genderBadge || 'Dãy chung'} • ${currentRow?.tierCount || 2} Hàng chuồng`,
          idLabel: currentRow?.physicalId || `phys-row-${(currentArea?.code || 'k1').toLowerCase()}-${(currentRow?.code || 'd1').toLowerCase()}`,
          desc: `Thuộc ${currentArea?.name || 'Phân khu'}. Mã QR đại diện Vị trí vật lý Dãy chuồng dán cố định thực tế.`
        };
      case 'cage':
        return {
          badge: `CẤP 4 • HỒ SƠ Ô CHUỒNG CHI TIẾT`,
          title: `Ô Chuồng ${currentCage?.code || ''}`,
          subtitle: `Vị trí: ${currentCage?.slotNumber || 'Chuẩn'} • Hàng ${currentCage?.tier || 1} • ${currentCage?.rowCode || ''} • ${currentCage?.areaCode || ''}`,
          idLabel: currentCage?.physicalId || `phys-cage-${(currentCage?.code || '').toLowerCase()}`,
          desc: `Mã QR đại diện Vị trí vật lý Ô chuồng ${currentCage?.code || ''}. Dán ngoài thực tế giữ nguyên lâu dài; khi xóa và tạo lại đúng vị trí, QR cũ sẽ tự phục hồi.`
        };
    }
  };

  const currentInfo = getBadgeInfo();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static">
      
      {/* ------------------------------------------------------------- */}
      {/* GIAO DIỆN IN CHUYÊN NGHIỆP DÀNH RIÊNG CHO MÁY IN (@media print) */}
      {/* ------------------------------------------------------------- */}
      <div className="hidden print:block w-full max-w-[120mm] mx-auto p-4 bg-white text-black font-sans border-2 border-dashed border-black rounded-2xl">
        <div className="text-center space-y-1 pb-3 border-b border-black">
          <h1 className="font-extrabold text-sm uppercase tracking-wider">HỆ THỐNG DỊCH VỤ NGỌC NHI</h1>
          <h2 className="font-bold text-xs uppercase text-slate-800">{FARM_METADATA.name}</h2>
          <p className="text-[9px] text-slate-600">{FARM_METADATA.location} • Hotline: {FARM_METADATA.hotline}</p>
        </div>

        <div className="py-3 text-center space-y-2">
          <div className="inline-block px-2.5 py-0.5 border border-black rounded-md text-[10px] font-bold uppercase tracking-wider">
            {currentInfo.badge}
          </div>
          <div className="text-lg font-black">{currentInfo.title}</div>
          <div className="text-xs font-semibold text-slate-700">{currentInfo.subtitle}</div>

          {/* QR Code THẬT kích thước in sắc nét */}
          <div className="w-48 h-48 mx-auto my-2 border-2 border-black p-2 rounded-xl flex items-center justify-center bg-white">
            {qrDataUrl && (
              <img 
                src={qrDataUrl} 
                alt="Mã QR Code Thật" 
                className="w-full h-full object-contain" 
              />
            )}
          </div>

          <div className="font-mono text-[10px] font-bold text-slate-900 break-all">
            ID NỘI BỘ: {currentInfo.idLabel}
          </div>
          <div className="font-mono text-[9px] text-slate-600 break-all px-2">
            URL: {qrUrl}
          </div>
        </div>

        <div className="pt-2 border-t border-dashed border-black flex justify-between items-center text-[9px] text-slate-600">
          <span>Ngày in: {new Date().toLocaleString('vi-VN')}</span>
          <span>Hệ thống tạo mã QR tự động bằng thư viện qrcode</span>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MODAL GIAO DIỆN TƯƠNG TÁC BÌNH THƯỜNG (SCREEN) */}
      {/* ------------------------------------------------------------- */}
      <div 
        className={`bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col transition-all duration-300 print:hidden ${
          isZoomed 
            ? 'w-full max-w-4xl max-h-[96vh]' 
            : 'w-full max-w-lg max-h-[92vh]'
        }`}
      >
        {/* HEADER MODAL */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-white tracking-wide">
                  Hệ Thống Thẻ QR Thực 4 Cấp
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500 text-slate-950 uppercase">
                  qrcode Live
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Mã QR 2D ma trận thực tế • Tự động điều hướng theo URL & ID
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsZoomed(!isZoomed)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title={isZoomed ? 'Thu nhỏ cửa sổ' : 'Phóng to cửa sổ'}
            >
              {isZoomed ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Đóng modal QR"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 4-LEVEL TABS SWITCHER */}
        <div className="px-4 py-2.5 bg-slate-100/90 border-b border-slate-200 shrink-0 flex items-center gap-1.5 overflow-x-auto text-xs font-bold scrollbar-thin">
          {/* Cấp 1 */}
          <button
            type="button"
            onClick={() => setActiveType('system')}
            className={`px-3 py-2 rounded-xl flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
              activeType === 'system'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-amber-400" />
            <span>1. QR Tổng Hệ Thống</span>
          </button>

          {/* Cấp 2 */}
          <button
            type="button"
            onClick={() => setActiveType('area')}
            className={`px-3 py-2 rounded-xl flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
              activeType === 'area'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-500" />
            <span>2. QR Khu ({currentArea?.code || 'Khu'})</span>
          </button>

          {/* Cấp 3 */}
          <button
            type="button"
            onClick={() => setActiveType('row')}
            className={`px-3 py-2 rounded-xl flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
              activeType === 'row'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-blue-500" />
            <span>3. QR Dãy ({currentRow?.code || 'Dãy'})</span>
          </button>

          {/* Cấp 4 */}
          <button
            type="button"
            onClick={() => setActiveType('cage')}
            className={`px-3 py-2 rounded-xl flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
              activeType === 'cage'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200'
            }`}
          >
            <Grid3X3 className="w-3.5 h-3.5 text-rose-500" />
            <span>4. QR Ô ({currentCage?.code || 'Ô'})</span>
          </button>
        </div>

        {/* BODY CONTAINER */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {/* Card Thông tin đối tượng */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-emerald-50/50 border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold text-[10px] tracking-wide border border-emerald-300">
                {currentInfo.badge}
              </span>
              <h4 className="text-base sm:text-lg font-extrabold text-slate-900">
                {currentInfo.title}
              </h4>
              <p className="text-xs text-slate-600">
                {currentInfo.subtitle}
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-right sm:text-right shrink-0">
              <div className="text-[10px] text-slate-400 font-semibold">ID NỘI BỘ ỔN ĐỊNH:</div>
              <div className="font-mono text-xs font-bold text-slate-800 select-all" title={currentInfo.idLabel}>
                {currentInfo.idLabel}
              </div>
            </div>
          </div>

          {/* VÙNG HIỂN THỊ MÃ QR THỰC (ZOOMABLE / PRINTABLE) */}
          <div className="flex flex-col items-center justify-center p-5 sm:p-6 rounded-3xl bg-slate-950 border border-slate-800 text-center relative overflow-hidden shadow-inner">
            
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 via-transparent to-slate-900 pointer-events-none" />

            {/* Khung viền Thẻ QR */}
            <div 
              className={`bg-white p-4 rounded-2xl shadow-2xl border-4 border-slate-100 transition-all duration-300 flex flex-col items-center justify-center relative ${
                isZoomed 
                  ? 'w-72 h-72 sm:w-96 sm:h-96' 
                  : 'w-56 h-56 sm:w-64 sm:h-64'
              }`}
            >
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center space-y-2 text-slate-400">
                  <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
                  <span className="text-xs font-semibold">Đang sinh mã QR ma trận...</span>
                </div>
              ) : qrDataUrl ? (
                <>
                  <img 
                    src={qrDataUrl} 
                    alt={`Mã QR ${currentInfo.title}`} 
                    className="w-full h-full object-contain rounded-lg"
                  />
                  {/* Badge logo nhỏ góc dưới */}
                  <div className="absolute bottom-1 right-2 px-1.5 py-0.5 rounded bg-slate-900/90 text-white font-mono text-[8px] font-bold">
                    NGOC NHI
                  </div>
                </>
              ) : (
                <div className="text-xs text-rose-500 font-bold">
                  Không thể sinh mã QR
                </div>
              )}
            </div>

            {/* Nhãn dưới mã QR */}
            <div className="mt-3.5 space-y-1 relative z-10">
              <div className="font-mono text-xs font-bold text-emerald-400 tracking-wider">
                {currentInfo.title}
              </div>
              <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                {currentInfo.desc}
              </p>
            </div>

            {/* Nút phóng to / thu nhỏ nhanh ngay trên khung QR */}
            <button
              type="button"
              onClick={() => setIsZoomed(!isZoomed)}
              className="mt-3 px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 cursor-pointer transition-all active:scale-95"
            >
              {isZoomed ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5" />
                  <span>Thu nhỏ lại</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Phóng to toàn màn hình để quét</span>
                </>
              )}
            </button>
          </div>

          {/* HỘP HIỂN THỊ URL THỰC TẾ & NÚT SAO CHÉP / TEST LINK */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-bold text-slate-700">
                <Info className="w-3.5 h-3.5 text-blue-600" />
                <span>URL Đích Khi Quét QR (Hoạt động trên mọi thiết bị):</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                Domain động: {typeof window !== 'undefined' ? window.location.origin : ''}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={qrUrl}
                className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-[11.5px] text-slate-800 select-all focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCopyUrl}
                className={`px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                  copiedLink
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
                title="Sao chép URL"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Đã chép!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Sao chép</span>
                  </>
                )}
              </button>
              <a
                href={qrUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs flex items-center gap-1 shrink-0 transition-all"
                title="Mở liên kết trong tab mới để kiểm tra"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mở thử</span>
              </a>
            </div>
          </div>
        </div>

        {/* FOOTER ACTIONS: IN & TẢI ẢNH */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0">
          <div className="text-[11px] text-slate-500 text-center sm:text-left">
            <span>Dùng camera điện thoại bất kỳ để quét mở đúng trang.</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Nút In Thẻ QR */}
            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-98 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>In Thẻ Mã QR</span>
            </button>

            {/* Nút Tải Ảnh QR PNG */}
            <button
              type="button"
              onClick={handleDownloadQR}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-98 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>{downloadSuccess ? 'Đã tải ảnh!' : 'Tải Ảnh PNG'}</span>
            </button>

            {/* Nút Đóng */}
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-semibold text-xs cursor-pointer transition-all"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
