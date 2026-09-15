import React, { useState, useEffect } from 'react';
import { FarmArea, FarmRow, FarmCage } from './farmTypes';
import { FARM_METADATA } from './farmData';
import { SYSTEM_INFO } from '../../data/initialData';
import { 
  QrTargetType, 
  buildQrUrl, 
  generateQRCodeDataUrl,
  generateLabeledQRCodeDataUrl,
  LabeledQROptions
} from '../../utils/qrHelper';
import {
  buildPrintHtml,
  printViaHiddenIframe,
  openDirectPrintWindow
} from '../../utils/printHelper';
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
  RefreshCw,
  Tag,
  QrCode,
  Sliders,
  CheckCircle2,
  AlertCircle
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
  const [labeledQrDataUrl, setLabeledQrDataUrl] = useState<string>('');
  const [rawQrDataUrl, setRawQrDataUrl] = useState<string>('');
  const [qrUrl, setQrUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(true);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const [previewMode, setPreviewMode] = useState<'labeled' | 'raw'>('labeled');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  // Trạng thái cấu hình & kết nối máy in
  const [printSize, setPrintSize] = useState<'decal' | 'a4'>('decal');
  const [isPrinting, setIsPrinting] = useState<boolean>(false);
  const [printStatus, setPrintStatus] = useState<{ message: string; type: 'info' | 'success' | 'warning' } | null>(null);

  // Thông tin hiển thị theo từng cấp độ
  const getBadgeInfo = () => {
    switch (activeType) {
      case 'system':
        return {
          badge: 'CẤP 1 • TỔNG HỆ THỐNG',
          badgeColor: '#0f172a',
          title: 'HỆ THỐNG DỊCH VỤ NGỌC NHI',
          subtitle: 'Trại Dúi (KaKa • Phan Dũng) • Quán Ăn • Tiệc Cưới',
          extraDetails: '',
          idLabel: 'phys-system-root',
          desc: 'Chuỗi dịch vụ đa ngành hàng đầu tại KP 9, phường Lộc Ninh, TP. Đồng Nai. Giao thoa hoàn hảo giữa ẩm thực đặc sản cao cấp, dịch vụ tiệc cưới hội nghị trọn gói sang trọng và Trang trại dúi hiện đại.',
          farmName: 'HỆ THỐNG DỊCH VỤ NGỌC NHI',
          subFarmName: 'Chuỗi dịch vụ đa ngành hàng đầu tại KP 9, phường Lộc Ninh, TP. Đồng Nai\nGiao thoa hoàn hảo giữa ẩm thực đặc sản cao cấp, dịch vụ tiệc cưới và Trang trại dúi hiện đại',
          hotline: 'Hotline: 0967.823.801 - 0969.310.601 • Hệ Thống Dịch Vụ Ngọc Nhi'
        };
      case 'area':
        return {
          badge: 'CẤP 2 • PHÂN KHU CHUỒNG TRẠI',
          badgeColor: '#047857',
          title: `PHÂN KHU: ${(currentArea?.name || 'Khu Chuồng Trại').toUpperCase()}`,
          subtitle: `Mã Khu: ${currentArea?.code || 'KHU'} • ${currentArea?.kindLabel || 'Khu Chăn Nuôi'}`,
          extraDetails: `Trại Dúi KaKa • Quy mô: ${currentArea?.rowCount || 0} Dãy chuồng • Dúi Mốc`,
          idLabel: currentArea?.physicalId || `phys-area-${(currentArea?.code || 'khu').toLowerCase()}`,
          desc: 'Mã QR đại diện Vị trí vật lý Phân khu thuộc Trại Dúi KaKa (Hệ Thống Dịch Vụ Ngọc Nhi).',
          farmName: 'TRẠI DÚI KAKA • PHAN DŨNG',
          subFarmName: 'HỆ THỐNG DỊCH VỤ NGỌC NHI • KP 9, PHƯỜNG LỘC NINH, TP. ĐỒNG NAI',
          hotline: 'Hotline Kỹ Thuật: 0969.310.601 • Trại Dúi KaKa (Phan Dũng)'
        };
      case 'row':
        return {
          badge: 'CẤP 3 • DÃY CHUỒNG TIÊU CHUẨN',
          badgeColor: '#1d4ed8',
          title: `DÃY CHUỒNG: ${currentRow?.code || 'D1'}`.toUpperCase(),
          subtitle: `Mã Dãy: ${currentRow?.code || 'D1'} • Thuộc ${currentArea?.name || 'Phân khu'} • Trại Dúi KaKa`,
          extraDetails: `Trại Dúi KaKa • ${currentRow?.tierCount || 2} Hàng chuồng • ${currentRow?.genderBadge || 'Khu chuồng phối giống tiêu chuẩn'}`,
          idLabel: currentRow?.physicalId || `phys-row-${(currentArea?.code || 'k1').toLowerCase()}-${(currentRow?.code || 'd1').toLowerCase()}`,
          desc: `Thuộc ${currentArea?.name || 'Phân khu'}. Mã QR đại diện Vị trí vật lý Dãy chuồng dán cố định thực tế.`,
          farmName: 'TRẠI DÚI KAKA • PHAN DŨNG',
          subFarmName: 'HỆ THỐNG DỊCH VỤ NGỌC NHI • KP 9, PHƯỜNG LỘC NINH, TP. ĐỒNG NAI',
          hotline: 'Hotline Kỹ Thuật: 0969.310.601 • Trại Dúi KaKa (Phan Dũng)'
        };
      case 'cage':
      default: {
        const areaNameStr = currentArea?.name || currentCage?.areaCode || 'Khu Chăn Nuôi';
        const rowCodeStr = currentRow?.code || currentCage?.rowCode || 'Dãy Chuồng';

        return {
          badge: 'CẤP 4 • Ô CHUỒNG CHI TIẾT',
          badgeColor: '#be123c',
          title: `Ô CHUỒNG: ${currentCage?.code || ''}`.toUpperCase(),
          subtitle: `Vị trí: Hàng ${currentCage?.tier || 1} • Vị trí: ${currentCage?.slotNumber || currentCage?.code || 'Chuẩn'} • ${rowCodeStr} • ${areaNameStr}`,
          extraDetails: '',
          idLabel: currentCage?.physicalId || `phys-cage-${(currentCage?.code || '').toLowerCase()}`,
          desc: `Mã QR đại diện Vị trí vật lý Ô chuồng ${currentCage?.code || ''}. Dán cố định lâu dài ngoài thực tế; quét QR để xem hồ sơ và trạng thái động cập nhật mới nhất.`,
          farmName: 'TRẠI DÚI KAKA • PHAN DŨNG',
          subFarmName: 'HỆ THỐNG DỊCH VỤ NGỌC NHI • KP 9, PHƯỜNG LỘC NINH, TP. ĐỒNG NAI',
          hotline: 'Hotline Kỹ Thuật: 0969.310.601 • Trại Dúi KaKa (Phan Dũng)'
        };
      }
    }
  };

  const currentInfo = getBadgeInfo();

  // Sinh URL động và tạo mã QR THỰC (cả thẻ có tên & QR vuông)
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

    // Tạo cả 2 bản: Labeled QR có Tên & Thông tin (Canvas 800x1100) và Raw QR Code
    generateLabeledQRCodeDataUrl(url, {
      type: activeType,
      title: currentInfo.title,
      badge: currentInfo.badge,
      badgeColor: currentInfo.badgeColor,
      subtitle: currentInfo.subtitle,
      extraDetails: currentInfo.extraDetails,
      idLabel: currentInfo.idLabel,
      url: url,
      farmName: currentInfo.farmName,
      subFarmName: currentInfo.subFarmName,
      hotline: currentInfo.hotline
    })
      .then(res => {
        if (isSubscribed) {
          setLabeledQrDataUrl(res.labeledDataUrl);
          setRawQrDataUrl(res.rawQrDataUrl);
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

  // Tải thẻ QR hoàn chỉnh (PNG có TÊN & PHÂN LOẠI - Chuẩn in dán chuồng)
  const handleDownloadLabeledQR = () => {
    const targetUrl = labeledQrDataUrl || rawQrDataUrl;
    if (!targetUrl) return;
    const a = document.createElement('a');
    a.href = targetUrl;
    let fileName = 'The_QR_Tong_NgocNhi.png';
    if (activeType === 'area' && currentArea) {
      fileName = `The_QR_Khu_${currentArea.code || currentArea.id}.png`;
    } else if (activeType === 'row' && currentRow) {
      fileName = `The_QR_Day_${currentRow.code || currentRow.id}.png`;
    } else if (activeType === 'cage' && currentCage) {
      fileName = `The_QR_O_${currentCage.code || currentCage.id}.png`;
    }
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setDownloadSuccess('labeled');
    setTimeout(() => setDownloadSuccess(null), 2500);
  };

  // Tải ảnh QR Code vuông gốc (nếu chỉ cần mã QR trần)
  const handleDownloadRawQR = () => {
    if (!rawQrDataUrl) return;
    const a = document.createElement('a');
    a.href = rawQrDataUrl;
    let fileName = 'QR_Vuong_Tong_NgocNhi.png';
    if (activeType === 'area' && currentArea) {
      fileName = `QR_Vuong_Khu_${currentArea.code || currentArea.id}.png`;
    } else if (activeType === 'row' && currentRow) {
      fileName = `QR_Vuong_Day_${currentRow.code || currentRow.id}.png`;
    } else if (activeType === 'cage' && currentCage) {
      fileName = `QR_Vuong_O_${currentCage.code || currentCage.id}.png`;
    }
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setDownloadSuccess('raw');
    setTimeout(() => setDownloadSuccess(null), 2500);
  };

  // Kích hoạt kết nối máy in và in trực tiếp không cần tải về
  const handleDirectPrint = async (targetSize: 'decal' | 'a4' = printSize) => {
    const imageToPrint = labeledQrDataUrl || rawQrDataUrl;
    if (!imageToPrint) {
      setPrintStatus({ message: 'Đang khởi tạo thẻ QR, vui lòng đợi 1 giây...', type: 'warning' });
      return;
    }

    setIsPrinting(true);
    setPrintStatus({ message: 'Đang gửi lệnh đến máy in...', type: 'info' });

    const htmlContent = buildPrintHtml({
      title: currentInfo.title,
      imageDataUrl: imageToPrint,
      size: targetSize,
      idLabel: currentInfo.idLabel,
      extraInfo: currentInfo.subtitle
    });

    try {
      // 1. In qua iframe ẩn chuyên dụng
      const success = await printViaHiddenIframe(htmlContent);
      if (success) {
        setPrintStatus({ 
          message: 'Đã mở hộp thoại máy in! Hãy chọn máy in (Decal hoặc A4) rồi bấm In.', 
          type: 'success' 
        });
      } else {
        // 2. Nếu iframe bị chặn do sandbox trình duyệt, mở tab in chuyên dụng
        setPrintStatus({ 
          message: 'Đang mở cửa sổ in chuyên dụng để kết nối máy in...', 
          type: 'info' 
        });
        const winOpened = openDirectPrintWindow(htmlContent);
        if (winOpened) {
          setPrintStatus({ 
            message: 'Đã mở cửa sổ in! Vui lòng chọn máy in để in thẻ.', 
            type: 'success' 
          });
        } else {
          // Fallback cuối cùng
          window.print();
        }
      }
    } catch (err) {
      console.warn('Lỗi khi in:', err);
      openDirectPrintWindow(htmlContent);
    } finally {
      setTimeout(() => {
        setIsPrinting(false);
      }, 1200);
      setTimeout(() => {
        setPrintStatus(null);
      }, 6000);
    }
  };

  // Mở riêng một tab/cửa sổ in độc lập để in trực tiếp
  const handleOpenPrintTab = () => {
    const imageToPrint = labeledQrDataUrl || rawQrDataUrl;
    if (!imageToPrint) return;

    const htmlContent = buildPrintHtml({
      title: currentInfo.title,
      imageDataUrl: imageToPrint,
      size: printSize,
      idLabel: currentInfo.idLabel,
      extraInfo: currentInfo.subtitle
    });

    openDirectPrintWindow(htmlContent);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static">
      
      {/* ------------------------------------------------------------- */}
      {/* GIAO DIỆN IN CHUYÊN NGHIỆP DÀNH CHO MÁY IN (@media print)      */}
      {/* IN SẮC NÉT THẺ TEM CÓ TÊN ĐỂ PHÂN BIỆT RÕ RÀNG TỪNG LOẠI QR  */}
      {/* ------------------------------------------------------------- */}
      <div className="hidden print:block w-full max-w-[105mm] mx-auto p-0 bg-white text-black font-sans">
        {labeledQrDataUrl ? (
          <div className="w-full flex flex-col items-center justify-center">
            <img 
              src={labeledQrDataUrl} 
              alt={`Thẻ In Mã QR ${currentInfo.title}`} 
              className="w-full h-auto object-contain mx-auto"
            />
          </div>
        ) : (
          <div className="w-full p-4 border-2 border-dashed border-black rounded-2xl text-center space-y-2">
            <h1 className="font-extrabold text-sm uppercase tracking-wider">{currentInfo.farmName}</h1>
            <h2 className="font-bold text-xs uppercase text-slate-800 whitespace-pre-line">{currentInfo.subFarmName}</h2>
            <div className="inline-block px-3 py-1 border border-black rounded-md text-xs font-bold uppercase">
              {currentInfo.badge}
            </div>
            <div className="text-xl font-black">{currentInfo.title}</div>
            <div className="text-xs font-semibold">{currentInfo.subtitle}</div>
            {currentInfo.extraDetails && (
              <div className="text-[11px] text-slate-600">{currentInfo.extraDetails}</div>
            )}
            {rawQrDataUrl && (
              <div className="w-48 h-48 mx-auto my-2 border-2 border-black p-2 rounded-xl flex items-center justify-center">
                <img src={rawQrDataUrl} alt="Mã QR" className="w-full h-full object-contain" />
              </div>
            )}
            <div className="text-[10px] text-slate-600">{currentInfo.hotline}</div>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MODAL GIAO DIỆN TƯƠNG TÁC BÌNH THƯỜNG (SCREEN) */}
      {/* ------------------------------------------------------------- */}
      <div 
        className={`bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col transition-all duration-300 print:hidden ${
          isZoomed 
            ? 'w-full max-w-4xl max-h-[96vh]' 
            : 'w-full max-w-xl max-h-[94vh]'
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
                  Hệ Thống Thẻ QR Có Tên & Phân Loại
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500 text-slate-950 uppercase">
                  Có Tên In Decal
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Mỗi mã QR đều có tên và thông tin phân loại rõ ràng, dễ dàng phân biệt khi in
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
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          
          {/* CARD THÔNG TIN ĐỐI TƯỢNG */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-50 to-emerald-50/50 border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1 min-w-0 flex-1">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold text-[10px] tracking-wide border border-emerald-300">
                {currentInfo.badge}
              </span>
              <h4 className="text-base sm:text-lg font-extrabold text-slate-900 truncate">
                {currentInfo.title}
              </h4>
              <p className="text-xs text-slate-600 truncate">
                {currentInfo.subtitle}
              </p>
              {currentInfo.extraDetails && (
                <p className="text-[11px] text-slate-500 truncate">
                  {currentInfo.extraDetails}
                </p>
              )}
            </div>
          </div>

          {/* CHẾ ĐỘ HIỂN THỊ: THẺ CÓ TÊN (KHUYÊN DÙNG IN) vs QR VUÔNG GỐC */}
          <div className="flex items-center justify-between gap-2 px-1">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-emerald-600" />
              <span>Xem trước bản in:</span>
            </span>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setPreviewMode('labeled')}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  previewMode === 'labeled'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-300/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ⭐ Thẻ In Có Tên (Khuyên Dùng)
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode('raw')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  previewMode === 'raw'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-300/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                QR Vuông Thuần
              </button>
            </div>
          </div>

          {/* VÙNG HIỂN THỊ MÃ QR THỰC (ZOOMABLE / PRINTABLE) */}
          <div className="flex flex-col items-center justify-center p-4 sm:p-5 rounded-3xl bg-slate-950 border border-slate-800 text-center relative overflow-hidden shadow-inner">
            
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 via-transparent to-slate-900 pointer-events-none" />

            {/* Khung viền Thẻ QR */}
            <div 
              className={`bg-white rounded-2xl shadow-2xl border-4 border-slate-100 transition-all duration-300 flex flex-col items-center justify-center relative overflow-hidden ${
                previewMode === 'labeled'
                  ? isZoomed 
                    ? 'w-full max-w-md p-2' 
                    : 'w-64 sm:w-72 p-2'
                  : isZoomed 
                    ? 'w-72 h-72 sm:w-96 sm:h-96 p-4' 
                    : 'w-56 h-56 sm:w-64 sm:h-64 p-4'
              }`}
            >
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-2 text-slate-400">
                  <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
                  <span className="text-xs font-semibold">Đang sinh thẻ QR ma trận có tên...</span>
                </div>
              ) : previewMode === 'labeled' && labeledQrDataUrl ? (
                <div className="w-full flex flex-col items-center">
                  <img 
                    src={labeledQrDataUrl} 
                    alt={`Thẻ In Mã QR ${currentInfo.title}`} 
                    className="w-full h-auto object-contain rounded-xl shadow-xs"
                  />
                </div>
              ) : rawQrDataUrl ? (
                <>
                  <img 
                    src={rawQrDataUrl} 
                    alt={`Mã QR ${currentInfo.title}`} 
                    className="w-full h-full object-contain rounded-lg"
                  />
                  <div className="absolute bottom-1 right-2 px-1.5 py-0.5 rounded bg-slate-900/90 text-white font-mono text-[8px] font-bold">
                    NGOC NHI
                  </div>
                </>
              ) : (
                <div className="text-xs text-rose-500 font-bold py-8">
                  Không thể sinh mã QR
                </div>
              )}
            </div>

            {/* Nhãn dưới mã QR */}
            <div className="mt-3 space-y-0.5 relative z-10">
              <div className="font-mono text-xs font-bold text-emerald-400 tracking-wider">
                {currentInfo.title}
              </div>
              <p className="text-[11px] text-slate-400 max-w-md mx-auto">
                {previewMode === 'labeled'
                  ? 'Đã gắn sẵn tiêu đề, loại QR và thông tin vị trí vào ảnh để khi in ra dán chuồng phân biệt được ngay.'
                  : currentInfo.desc}
              </p>
            </div>

            {/* Nút phóng to / thu nhỏ */}
            <button
              type="button"
              onClick={() => setIsZoomed(!isZoomed)}
              className="mt-2.5 px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 cursor-pointer transition-all active:scale-95"
            >
              {isZoomed ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5" />
                  <span>Thu nhỏ lại</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Phóng to thẻ QR</span>
                </>
              )}
            </button>
          </div>

          {/* KHU VỰC KẾT NỐI MÁY IN VÀ IN TRỰC TIẾP (KHÔNG CẦN TẢI VỀ) */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50/70 border border-emerald-300 space-y-3 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-start sm:items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-emerald-700 text-white shadow-sm shrink-0">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-xs sm:text-sm text-slate-900 flex items-center gap-2 flex-wrap">
                    <span>KẾT NỐI MÁY IN ĐỂ IN THẺ LUÔN</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200/80 text-emerald-900 border border-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                      Trực tiếp • Không cần tải
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Gửi thẳng thẻ QR sang máy in tem nhiệt Decal hoặc máy in A4/A5 để in dán chuồng ngay.
                  </p>
                </div>
              </div>

              {/* Tùy chọn khổ in */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-300 self-start sm:self-auto shrink-0 shadow-xs">
                <button
                  type="button"
                  onClick={() => setPrintSize('decal')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    printSize === 'decal'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  title="Chuẩn tem dán chuồng trại (75x105mm hoặc 80x100mm)"
                >
                  🏷️ Tem Decal Chuồng
                </button>
                <button
                  type="button"
                  onClick={() => setPrintSize('a4')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    printSize === 'a4'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  title="Khổ giấy A4 hoặc A5 cho máy in văn phòng thông thường"
                >
                  📄 Giấy A4 / A5
                </button>
              </div>
            </div>

            {/* Thông báo trạng thái in */}
            {printStatus && (
              <div className={`px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2.5 transition-all ${
                printStatus.type === 'success' 
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-400 font-semibold'
                  : printStatus.type === 'warning'
                  ? 'bg-amber-100 text-amber-900 border border-amber-400'
                  : 'bg-blue-100 text-blue-900 border border-blue-400'
              }`}>
                {printStatus.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700" />
                ) : (
                  <RefreshCw className={`w-4 h-4 shrink-0 text-emerald-700 ${isPrinting ? 'animate-spin' : ''}`} />
                )}
                <span>{printStatus.message}</span>
              </div>
            )}

            {/* Các nút hành động in */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleDirectPrint(printSize)}
                disabled={isPrinting || (!labeledQrDataUrl && !rawQrDataUrl)}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 disabled:bg-slate-400 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-all active:scale-98"
                title="Gửi lệnh in ngay đến máy in đang kết nối"
              >
                <Printer className={`w-4 h-4 ${isPrinting ? 'animate-bounce' : ''}`} />
                <span>{isPrinting ? 'Đang gọi máy in...' : '🖨️ KẾT NỐI MÁY IN & IN NGAY'}</span>
              </button>

              <button
                type="button"
                onClick={handleOpenPrintTab}
                className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-xs"
                title="Mở tab in riêng siêu nét (Khắc phục triệt để nếu trình duyệt chặn hộp thoại in)"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
                <span>Mở Trang In Riêng (Tab Mới)</span>
              </button>
            </div>

            <div className="text-[11px] text-slate-600 flex items-start gap-1">
              <span>💡</span>
              <span>Hệ thống tương thích tất cả máy in: <b>Máy in nhiệt decal (Xprinter, HPRT, Gprinter, Brother...)</b> hoặc máy in văn phòng (Canon, HP, Epson). Chỉ cần bấm <b>In Ngay</b>, chọn tên máy in trên màn hình là xong!</span>
            </div>
          </div>

          {/* HỘP HIỂN THỊ URL THỰC TẾ & NÚT SAO CHÉP / TEST LINK */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-bold text-slate-700">
                <Info className="w-3.5 h-3.5 text-blue-600" />
                <span>URL Đích Khi Quét QR (Mở đúng đối tượng):</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                Domain động
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={qrUrl}
                className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-[11px] text-slate-800 select-all focus:outline-none"
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

        {/* FOOTER ACTIONS: IN & TẢI ẢNH (CÓ TÊN ĐỂ PHÂN BIỆT) */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0">
          <div className="text-[11px] text-slate-500 text-center sm:text-left">
            <span>Thẻ in có sẵn tên ô, phân khu & dãy giúp dán decal không bị nhầm lẫn.</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Nút In Thẻ QR */}
            <button
              type="button"
              onClick={() => handleDirectPrint(printSize)}
              disabled={isPrinting}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-98 transition-all"
              title="In trực tiếp ra máy in nhiệt decal hoặc máy in giấy"
            >
              <Printer className={`w-4 h-4 ${isPrinting ? 'animate-bounce' : ''}`} />
              <span>{isPrinting ? 'Đang gọi máy in...' : 'In Thẻ Mã QR'}</span>
            </button>

            {/* Nút Tải Thẻ In Decal (PNG có Tên) */}
            <button
              type="button"
              onClick={handleDownloadLabeledQR}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-98 transition-all"
              title="Tải ảnh thẻ tem đã có tên & vị trí để in ấn dán chuồng"
            >
              <Download className="w-4 h-4" />
              <span>{downloadSuccess === 'labeled' ? 'Đã tải thẻ!' : 'Tải Thẻ QR (Có Tên)'}</span>
            </button>

            {/* Nút Tải QR Vuông (Gốc) */}
            <button
              type="button"
              onClick={handleDownloadRawQR}
              className="px-3 py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              title="Tải mã QR vuông trần (không viền tên)"
            >
              <QrCode className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">{downloadSuccess === 'raw' ? 'Đã tải!' : 'QR Vuông'}</span>
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
