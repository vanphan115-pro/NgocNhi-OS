import React, { useState } from 'react';
import { 
  FarmArea, 
  FarmRow,
  FarmCage, 
  FarmTask, 
  DisinfectionLogItem 
} from './farmTypes';
import { 
  FARM_METADATA, 
  FARM_PHOTOS, 
  formatDateVN 
} from './farmData';
import { 
  Building2, 
  Store,
  QrCode, 
  Plus, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Heart, 
  ShieldAlert, 
  Sparkles, 
  Calendar, 
  ChevronRight, 
  TrendingUp, 
  RotateCcw,
  Activity,
  Check,
  Scale,
  Layers,
  ChevronDown,
  ChevronUp,
  Info,
  Lock,
  ShoppingBag
} from 'lucide-react';
import { UserRole } from '../../types';

interface FarmOverviewViewProps {
  areas: FarmArea[];
  rows?: FarmRow[];
  cages: FarmCage[];
  tasks: FarmTask[];
  onNavigateToArea: (areaId?: string) => void;
  onNavigateToTasks: () => void;
  onSelectCage: (cage: FarmCage) => void;
  onOpenFarmQR: () => void;
  onOpenAreaQR: (area: FarmArea) => void;
  onOpenAddCage: () => void;
  onOpenAddArea: () => void;
  onQuickCleanToday: () => void;
  onOpenSanitationModal: () => void;
  userRole?: UserRole;
  onOpenAdminLogin?: (reason?: string) => void;
  onNavigateToMarketplace?: () => void;
}

export const FarmOverviewView: React.FC<FarmOverviewViewProps> = ({
  areas,
  rows = [],
  cages,
  tasks,
  onNavigateToArea,
  onNavigateToTasks,
  onSelectCage,
  onOpenFarmQR,
  onOpenAreaQR,
  onOpenAddCage,
  onOpenAddArea,
  onQuickCleanToday,
  onOpenSanitationModal,
  userRole = 'guest',
  onOpenAdminLogin,
  onNavigateToMarketplace
}) => {
  const [selectedBabyTab, setSelectedBabyTab] = useState<'all' | 'nursing' | '3_4_lang' | '5_7_lang' | '8_lang_1_1_kg'>('all');
  const [isBabySectionExpanded, setIsBabySectionExpanded] = useState<boolean>(true);
  const [selectedHauBiTab, setSelectedHauBiTab] = useState<'all' | 'duc' | 'cai' | 'dat_dieu_kien' | 'dang_nuoi'>('all');
  const [isHauBiSectionExpanded, setIsHauBiSectionExpanded] = useState<boolean>(true);

  // Thống kê cơ cấu đàn theo chuẩn đặc tả
  const totalCages = cages.length || areas.reduce((sum, a) => sum + a.totalCages, 0);
  const totalRats = cages.reduce((sum, c) => sum + c.ratCount, 0);
  
  // Đực giống sinh sản (khu sinh sản)
  const breedingMaleCount = cages
    .filter(c => c.areaKind === 'sinh_san' && c.gender === 'duc')
    .reduce((sum, c) => sum + c.ratCount, 0);

  // Tổng đực toàn trại (Đực giống SS + Đực Hậu bị + Đực khác)
  const totalFarmMales = cages
    .filter(c => c.gender === 'duc' && c.ratCount > 0)
    .reduce((sum, c) => sum + c.ratCount, 0);

  // Cái sinh sản (khu sinh sản)
  const femaleBreedingCount = cages
    .filter(c => c.areaKind === 'sinh_san' && (c.gender === 'cai' || c.gender === 'doi'))
    .reduce((sum, c) => sum + (c.gender === 'doi' ? 1 : c.ratCount), 0);

  // Con non (Khu Baby hoặc đang nuôi con)
  const babyCount = cages
    .filter(c => c.areaKind === 'baby' || c.status === 'dang_nuoi_con')
    .reduce((sum, c) => sum + (c.livingBabyCount ?? c.ratCount ?? 0), 0);

  // PHÂN TÍCH CHI TIẾT DÚI BABY THEO CÁC NHÓM TRỌNG LƯỢNG NGHIỆP VỤ:
  // 1. Dúi con bú mẹ (< 3 lạng / dưới 45 ngày tại các ô Mẹ đang nuôi con)
  const nursingMothersCages = cages.filter(c => c.status === 'dang_nuoi_con' && c.status !== 'trong');
  const nursingPupsCount = nursingMothersCages.reduce((sum, c) => sum + (c.livingBabyCount ?? c.totalBornCount ?? (c.ratCount || 0)), 0);

  // 2. Dúi Baby tại các Ô Baby
  const babyAreaCages = cages.filter(c => c.areaKind === 'baby' && c.status !== 'trong');
  
  // Nhóm 3 - 4 lạng (0.30 - 0.45 kg)
  const baby34Cages = babyAreaCages.filter(c => c.babyGroup === '3_4_lang' || ((c.currentWeightKg || 0) > 0 && (c.currentWeightKg || 0) <= 0.45));
  const baby34Count = baby34Cages.reduce((sum, c) => sum + (c.ratCount || 1), 0);

  // Nhóm 5 - 7 lạng (0.50 - 0.75 kg)
  const baby57Cages = babyAreaCages.filter(c => c.babyGroup === '5_7_lang' || ((c.currentWeightKg || 0) > 0.45 && (c.currentWeightKg || 0) <= 0.75));
  const baby57Count = baby57Cages.reduce((sum, c) => sum + (c.ratCount || 1), 0);

  // Nhóm 8 lạng - 1.1 kg (0.80 - 1.10 kg)
  const baby811Cages = babyAreaCages.filter(c => c.babyGroup === '8_lang_1_1_kg' || (c.currentWeightKg || 0) > 0.75);
  const baby811Count = baby811Cages.reduce((sum, c) => sum + (c.ratCount || 1), 0);

  // Tổng số cá thể Baby toàn trại
  const totalAllBabies = nursingPupsCount + baby34Count + baby57Count + baby811Count;

  // Lọc danh sách ô baby hiển thị theo tab được chọn
  const getFilteredBabyCages = () => {
    switch (selectedBabyTab) {
      case 'nursing':
        return nursingMothersCages;
      case '3_4_lang':
        return baby34Cages;
      case '5_7_lang':
        return baby57Cages;
      case '8_lang_1_1_kg':
        return baby811Cages;
      case 'all':
      default:
        return [...nursingMothersCages, ...babyAreaCages];
    }
  };

  const filteredBabyCages = getFilteredBabyCages();

  // PHÂN TÍCH CHI TIẾT ĐÀN DÚI HẬU BỊ THEO GIỚI TÍNH (ĐỰC & CÁI) VÀ CHUẨN SINH SẢN:
  const hauBiAreaCages = cages.filter(c => c.areaKind === 'hau_bi' && c.status !== 'trong');
  const hauBiMaleCages = hauBiAreaCages.filter(c => c.gender === 'duc');
  const hauBiFemaleCages = hauBiAreaCages.filter(c => c.gender === 'cai' || (!c.gender && c.areaKind === 'hau_bi'));

  const hauBiMaleCount = hauBiMaleCages.reduce((sum, c) => sum + (c.ratCount || 1), 0);
  const hauBiFemaleCount = hauBiFemaleCages.reduce((sum, c) => sum + (c.ratCount || 1), 0);
  const totalHauBiCount = hauBiMaleCount + hauBiFemaleCount;

  // Hậu bị đạt điều kiện tuyển sinh sản F1
  const hauBiReadyCages = hauBiAreaCages.filter(c => 
    c.status === 'dat_dieu_kien' || 
    c.hauBiPassed === true || 
    (c.gender === 'duc' ? ((c.currentWeightKg || 0) >= 2.0) : ((c.currentWeightKg || 0) >= 1.8))
  );
  const hauBiReadyCount = hauBiReadyCages.reduce((sum, c) => sum + (c.ratCount || 1), 0);

  // Hậu bị đang nuôi dưỡng phát triển
  const hauBiGrowingCages = hauBiAreaCages.filter(c => !hauBiReadyCages.includes(c));
  const hauBiGrowingCount = hauBiGrowingCages.reduce((sum, c) => sum + (c.ratCount || 1), 0);

  // Lọc danh sách ô Hậu bị theo tab được chọn
  const getFilteredHauBiCages = () => {
    switch (selectedHauBiTab) {
      case 'duc':
        return hauBiMaleCages;
      case 'cai':
        return hauBiFemaleCages;
      case 'dat_dieu_kien':
        return hauBiReadyCages;
      case 'dang_nuoi':
        return hauBiGrowingCages;
      case 'all':
      default:
        return hauBiAreaCages;
    }
  };

  const filteredHauBiCages = getFilteredHauBiCages();

  // Hậu bị chọn lọc (backward compatibility)
  const selectionCount = totalHauBiCount;

  // Xuất bán (Khu thương phẩm)
  const commercialCount = cages
    .filter(c => c.areaKind === 'thuong_pham')
    .reduce((sum, c) => sum + c.ratCount, 0);

  // Đang điều trị / cách ly
  const quarantineCount = cages
    .filter(c => c.status === 'dang_dieu_tri' || c.areaKind === 'dieu_tri')
    .reduce((sum, c) => sum + c.ratCount, 0);

  // Phân loại công việc
  const urgentTasks = tasks.filter(t => t.urgency === 'qua_han');
  const dueTodayTasks = tasks.filter(t => t.urgency === 'den_han');
  const upcomingTasks = tasks.filter(t => t.urgency === 'sap_den_han');

  // Nhóm phân loại & tổng hợp số lượng phân khu
  const areaCategories = [
    {
      key: 'sinh_san',
      name: 'Khu Sinh Sản',
      icon: '🕯️',
      roleDesc: 'Phối ghép, mang thai & nuôi con bú mẹ',
      themeBorder: 'border-emerald-200 hover:border-emerald-400',
      themeBg: 'bg-emerald-50/50',
      tagBadge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      btnBg: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      accentColor: 'text-emerald-800',
    },
    {
      key: 'baby',
      name: 'Khu Dúi Baby',
      icon: '🍼',
      roleDesc: 'Nuôi dưỡng tách mẹ theo 4 nhóm trọng lượng',
      themeBorder: 'border-amber-200 hover:border-amber-400',
      themeBg: 'bg-amber-50/50',
      tagBadge: 'bg-amber-100 text-amber-800 border-amber-300',
      btnBg: 'bg-amber-600 hover:bg-amber-700 text-white',
      accentColor: 'text-amber-800',
    },
    {
      key: 'hau_bi',
      name: 'Khu Dúi Hậu Bị',
      icon: '🌟',
      roleDesc: 'Tuyển chọn cá thể đực/cái chuẩn giống F1',
      themeBorder: 'border-purple-200 hover:border-purple-400',
      themeBg: 'bg-purple-50/50',
      tagBadge: 'bg-purple-100 text-purple-800 border-purple-300',
      btnBg: 'bg-purple-600 hover:bg-purple-700 text-white',
      accentColor: 'text-purple-800',
    },
    {
      key: 'thuong_pham',
      name: 'Khu Dúi Thương Phẩm',
      icon: '🥩',
      roleDesc: 'Nuôi vỗ béo xuất bán thịt thương phẩm đặc sản',
      themeBorder: 'border-blue-200 hover:border-blue-400',
      themeBg: 'bg-blue-50/50',
      tagBadge: 'bg-blue-100 text-blue-800 border-blue-300',
      btnBg: 'bg-blue-600 hover:bg-blue-700 text-white',
      accentColor: 'text-blue-800',
    },
    {
      key: 'dieu_tri',
      name: 'Khu Điều Trị & Cách Ly',
      icon: '🏥',
      roleDesc: 'Cách ly thú y, theo dõi sức khỏe & phục hồi',
      themeBorder: 'border-rose-200 hover:border-rose-400',
      themeBg: 'bg-rose-50/50',
      tagBadge: 'bg-rose-100 text-rose-800 border-rose-300',
      btnBg: 'bg-rose-600 hover:bg-rose-700 text-white',
      accentColor: 'text-rose-800',
    },
  ];

  // Tính toán dữ liệu chi tiết cho từng loại phân khu (tự động đồng bộ thời gian thực theo dữ liệu người dùng nhập)
  const areaSummaryStats = areaCategories.map(cat => {
    const matchedAreas = areas.filter(a => a.kind === cat.key);
    const matchedAreaIds = new Set(matchedAreas.map(a => a.id));
    const matchedCages = cages.filter(c => 
      matchedAreaIds.has(c.areaId) || 
      c.areaKind === cat.key ||
      matchedAreas.some(a => a.code && c.areaCode === a.code)
    );
    
    const countAreas = matchedAreas.length;
    const directRows = (rows && rows.length > 0) ? rows.filter(r => matchedAreaIds.has(r.areaId)) : [];
    const distinctRowKeys = new Set(matchedCages.map(c => c.rowId || c.rowCode).filter(Boolean));
    const totalRows = Math.max(
      directRows.length, 
      distinctRowKeys.size, 
      (directRows.length > 0 ? directRows.length : matchedAreas.reduce((sum, a) => sum + (a.rowCount || 0), 0))
    );
    const totalCagesInCat = matchedCages.length;
    const occupiedCages = matchedCages.filter(c => c.status !== 'trong' && (c.ratCount || 0) > 0).length;
    const totalRatsInCat = matchedCages.reduce((sum, c) => sum + (c.status !== 'trong' ? (c.ratCount || 0) : 0), 0);

    return {
      ...cat,
      matchedAreas,
      countAreas,
      totalRows,
      totalCagesInCat,
      occupiedCages,
      totalRatsInCat,
      primaryAreaId: matchedAreas[0]?.id
    };
  });

  // Dữ liệu phân loại khu vực đồng bộ tự động 100% từ danh sách phân khu thực tế
  const totalAreasCount = areas.length;
  const sinhSanAreas = areas.filter(a => a.kind === 'sinh_san');
  const babyAreas = areas.filter(a => a.kind === 'baby');
  const hauBiAreas = areas.filter(a => a.kind === 'hau_bi');
  const thuongPhamAreas = areas.filter(a => a.kind === 'thuong_pham');
  const dieuTriAreas = areas.filter(a => a.kind === 'dieu_tri');

  const sinhSanAreaCount = sinhSanAreas.length;
  const babyAreaCount = babyAreas.length;
  const hauBiAreaCount = hauBiAreas.length;
  const thuongPhamAreaCount = thuongPhamAreas.length;
  const dieuTriAreaCount = dieuTriAreas.length;

  return (
    <div className="space-y-6">
      {/* 1. TỔNG QUAN PHÂN KHU CHUỒNG TRẠI (GIAO DIỆN HÌNH 1 ĐỒNG BỘ 100% KHÔNG MẶC ĐỊNH) */}
      <section className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-4">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-[#0f532e] shrink-0">
              <Store className="w-4.5 h-4.5 text-[#0f532e]" />
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight font-serif uppercase">
              TỔNG QUAN PHÂN KHU CHUỒNG TRẠI
            </h2>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {onNavigateToMarketplace && (
              <button
                onClick={onNavigateToMarketplace}
                className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-amber-700" />
                <span>Đặt Mua Con Giống / Thịt</span>
              </button>
            )}
            <button
              onClick={onOpenFarmQR}
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5 text-slate-600" />
              <span>Thẻ QR Trang Trại</span>
            </button>
            {userRole === 'admin' ? (
              <button
                onClick={onOpenAddArea}
                className="px-4 py-2 rounded-xl bg-[#0f532e] hover:bg-[#0c4325] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Thêm Phân Khu Mới</span>
              </button>
            ) : (
              <button
                onClick={() => onOpenAdminLogin?.('Thêm phân khu chuồng trại yêu cầu quyền Quản Trị')}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-amber-50 text-slate-600 hover:text-amber-800 text-xs font-semibold flex items-center gap-1.5 border border-slate-200 shadow-2xs cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Đăng Nhập Quản Trị</span>
              </button>
            )}
          </div>
        </div>

        {/* 6 Metric Cards Row theo đúng thiết kế Hình 1 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-3.5">
          {/* Card 1: TỔNG SỐ KHU */}
          <div
            onClick={() => onNavigateToArea()}
            className="rounded-2xl bg-[#0f532e] text-white p-4 sm:p-4.5 flex flex-col justify-between cursor-pointer hover:bg-[#0c4325] transition-all shadow-xs group"
          >
            <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-emerald-100 mb-3 group-hover:scale-105 transition-transform">
              <Store className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-emerald-200 block mb-1">
                TỔNG SỐ KHU
              </span>
              <div className="text-3xl sm:text-4xl font-black font-mono leading-none tracking-tight text-white mb-1.5">
                {totalAreasCount}
              </div>
              <p className="text-[11px] text-emerald-200/90 leading-tight">
                Khu đang có trên Firebase
              </p>
            </div>
          </div>

          {/* Card 2: SINH SẢN */}
          <div
            onClick={() => onNavigateToArea(sinhSanAreas[0]?.id)}
            className="rounded-2xl bg-[#eafaf1] border border-emerald-200/70 p-4 sm:p-4.5 flex flex-col justify-between cursor-pointer hover:shadow-md hover:border-emerald-400 transition-all group"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-100/80 flex items-center justify-center text-emerald-700 mb-3 group-hover:scale-105 transition-transform">
              <Store className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-emerald-700 block mb-1">
                SINH SẢN
              </span>
              <div className="text-3xl sm:text-4xl font-black font-mono leading-none tracking-tight text-slate-900 mb-1.5">
                {sinhSanAreaCount}
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                Khu theo loại thực tế
              </p>
            </div>
          </div>

          {/* Card 3: BABY / CON NON */}
          <div
            onClick={() => onNavigateToArea(babyAreas[0]?.id)}
            className="rounded-2xl bg-[#fef9e7] border border-amber-200/70 p-4 sm:p-4.5 flex flex-col justify-between cursor-pointer hover:shadow-md hover:border-amber-400 transition-all group"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-100/80 flex items-center justify-center text-amber-700 mb-3 group-hover:scale-105 transition-transform">
              <Store className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-amber-700 block mb-1">
                BABY / CON NON
              </span>
              <div className="text-3xl sm:text-4xl font-black font-mono leading-none tracking-tight text-slate-900 mb-1.5">
                {babyAreaCount}
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                Khu theo loại thực tế
              </p>
            </div>
          </div>

          {/* Card 4: HẬU BỊ */}
          <div
            onClick={() => onNavigateToArea(hauBiAreas[0]?.id)}
            className="rounded-2xl bg-[#f4f0fd] border border-purple-200/70 p-4 sm:p-4.5 flex flex-col justify-between cursor-pointer hover:shadow-md hover:border-purple-400 transition-all group"
          >
            <div className="w-8 h-8 rounded-xl bg-purple-100/80 flex items-center justify-center text-purple-700 mb-3 group-hover:scale-105 transition-transform">
              <Store className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-purple-700 block mb-1">
                HẬU BỊ
              </span>
              <div className="text-3xl sm:text-4xl font-black font-mono leading-none tracking-tight text-slate-900 mb-1.5">
                {hauBiAreaCount}
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                Khu theo loại thực tế
              </p>
            </div>
          </div>

          {/* Card 5: THƯƠNG PHẨM */}
          <div
            onClick={() => onNavigateToArea(thuongPhamAreas[0]?.id)}
            className="rounded-2xl bg-[#e8f6fc] border border-sky-200/70 p-4 sm:p-4.5 flex flex-col justify-between cursor-pointer hover:shadow-md hover:border-sky-400 transition-all group"
          >
            <div className="w-8 h-8 rounded-xl bg-sky-100/80 flex items-center justify-center text-sky-700 mb-3 group-hover:scale-105 transition-transform">
              <Store className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-sky-700 block mb-1">
                THƯƠNG PHẨM
              </span>
              <div className="text-3xl sm:text-4xl font-black font-mono leading-none tracking-tight text-slate-900 mb-1.5">
                {thuongPhamAreaCount}
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                Khu theo loại thực tế
              </p>
            </div>
          </div>

          {/* Card 6: ĐIỀU TRỊ / CÁCH LY */}
          <div
            onClick={() => onNavigateToArea(dieuTriAreas[0]?.id)}
            className="rounded-2xl bg-[#fdedec] border border-rose-200/70 p-4 sm:p-4.5 flex flex-col justify-between cursor-pointer hover:shadow-md hover:border-rose-400 transition-all group"
          >
            <div className="w-8 h-8 rounded-xl bg-rose-100/80 flex items-center justify-center text-rose-700 mb-3 group-hover:scale-105 transition-transform">
              <Store className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-rose-700 block mb-1">
                ĐIỀU TRỊ / CÁCH LY
              </span>
              <div className="text-3xl sm:text-4xl font-black font-mono leading-none tracking-tight text-slate-900 mb-1.5">
                {dieuTriAreaCount}
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                Khu theo loại thực tế
              </p>
            </div>
          </div>
        </div>

        {/* LƯỚI HIỂN THỊ CHI TIẾT SỐ DÃY & Ô TỪNG LOẠI PHÂN KHU */}
        <div className="pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
            {areaSummaryStats.map((item) => (
              <div
                key={item.key}
                onClick={() => onNavigateToArea(item.primaryAreaId)}
                className={`rounded-2xl border ${item.themeBorder} bg-slate-50/50 p-4 shadow-2xs hover:shadow-md hover:bg-white transition-all flex flex-col justify-between cursor-pointer group relative overflow-hidden`}
              >
                {/* Header card: Icon + Badge số khu */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl p-1.5 rounded-xl bg-white shadow-2xs group-hover:scale-110 transition-transform">
                      {item.icon}
                    </span>
                    <div>
                      <h3 className="font-black text-slate-900 text-xs leading-tight group-hover:text-emerald-700 transition-colors">
                        {item.name}
                      </h3>
                      <span className="text-[10px] text-slate-500 line-clamp-1 font-mono">
                        {item.matchedAreas.map(a => a.code).join(', ') || 'Chưa tạo'}
                      </span>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${item.tagBadge} shrink-0 font-mono`}>
                    {item.countAreas} Khu
                  </span>
                </div>

                {/* Thống kê chi tiết bên trong phân khu */}
                <div className="my-2.5 py-2 border-y border-slate-200/60 space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between text-slate-600 gap-2">
                    <span className="whitespace-nowrap">Quy mô:</span>
                    <span className="font-bold text-slate-800 font-mono whitespace-nowrap">
                      {item.totalRows} Dãy • {item.totalCagesInCat} Ô
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 gap-2">
                    <span className="whitespace-nowrap">{item.key === 'dieu_tri' ? 'Đang chữa:' : 'Đang nuôi:'}</span>
                    <span className={`font-black font-mono whitespace-nowrap ${item.key === 'dieu_tri' ? 'text-rose-700' : 'text-emerald-700'}`}>
                      {item.totalRatsInCat} Con <span className="font-normal text-[10px] text-slate-500">({item.occupiedCages} ô)</span>
                    </span>
                  </div>
                </div>

                {/* Nút xem chi tiết nhỏ trên từng card */}
                <div className="pt-0.5 flex items-center justify-between text-[11px] font-bold text-slate-600 group-hover:text-emerald-700 transition-colors">
                  <span>Chi tiết phân khu</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DÒNG CUỐI CÙNG: THAO TÁC ĐI VÀO CHI TIẾT CHUYỂN SANG MỤC KHU VỰC CHUỒNG NUÔI */}
        <div
          onClick={() => onNavigateToArea()}
          className="rounded-2xl border-2 border-emerald-300 bg-gradient-to-r from-emerald-50 via-emerald-50/60 to-teal-50/50 p-3.5 sm:p-4 shadow-xs hover:shadow-md hover:border-emerald-500 transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-between gap-3 group"
        >
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-10 h-10 rounded-xl bg-[#0f532e] text-white flex items-center justify-center text-xl shadow-xs shrink-0 group-hover:scale-105 transition-transform">
              🏢
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                <h4 className="font-black text-slate-900 text-sm">
                  Đi vào chi tiết sơ đồ từng dãy & ô chuồng
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-200/80 text-emerald-900 border border-emerald-300 font-mono whitespace-nowrap">
                  {totalAreasCount} Khu • {Math.max(rows?.length || 0, (new Set(cages.map(c => c.rowId || c.rowCode).filter(Boolean))).size)} Dãy • {cages.length} Ô
                </span>
              </div>
              <p className="text-[11px] text-slate-600">
                Xem toàn bộ sơ đồ ô chuồng, chuyển trạng thái, thẻ QR và lịch chăm sóc
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-white border border-emerald-300 px-3.5 py-2 rounded-xl shadow-2xs group-hover:bg-[#0f532e] group-hover:text-white group-hover:border-[#0f532e] transition-all shrink-0">
            <span>Mở sơ đồ chuồng nuôi</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </section>

      {/* 2. CƠ CẤU ĐÀN DÚI & THỐNG KÊ QUY MÔ (ĐẶT NGAY DƯỚI SƠ ĐỒ CHUỒNG THEO THAM CHIẾU) */}
      <section className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg">📊</span>
              <h2 className="text-base font-black text-slate-900 tracking-tight">
                CƠ CẤU ĐÀN DÚI & THỐNG KÊ QUY MÔ
              </h2>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono">
                {totalRats} Cá Thể
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Phân bổ chi tiết số lượng cá thể theo từng nhóm sinh học và mục đích nuôi ({totalCages} Ô chuồng)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateToArea()}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition-colors"
            >
              <span>Xem theo từng Ô</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 7 thẻ chỉ số tinh gọn, màu sắc rõ nét */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-center flex flex-col justify-between">
            <span className="text-[10px] font-bold text-emerald-800 uppercase block">TỔNG ĐÀN</span>
            <span className="text-xl font-black text-emerald-900 font-mono my-1 block">{totalRats}</span>
            <span className="text-[10px] text-emerald-700 font-semibold">{cages.filter(c => c.ratCount > 0).length}/{totalCages} Ô</span>
          </div>

          <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 text-center flex flex-col justify-between">
            <span className="text-[10px] font-bold text-blue-800 uppercase block">ĐỰC GIỐNG SS</span>
            <span className="text-xl font-black text-blue-900 font-mono my-1 block">{breedingMaleCount}</span>
            <span className="text-[10px] text-blue-600">Đực phối F1</span>
          </div>

          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-center flex flex-col justify-between">
            <span className="text-[10px] font-bold text-rose-800 uppercase block">CÁI SINH SẢN</span>
            <span className="text-xl font-black text-rose-900 font-mono my-1 block">{femaleBreedingCount}</span>
            <span className="text-[10px] text-rose-600">Ghép/Mang thai</span>
          </div>

          <div 
            onClick={() => {
              setIsBabySectionExpanded(true);
              setSelectedBabyTab('all');
            }}
            className="p-3 rounded-2xl bg-sky-50 hover:bg-sky-100/70 border border-sky-200 text-center flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.02] shadow-2xs"
            title="Bấm để xem chi tiết từng nhóm trọng lượng Baby (3-4 lạng, 5-7 lạng, 8l-1.1kg)"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-sky-800 uppercase">DÚI BABY</span>
              <span className="text-[8px] bg-sky-200/80 text-sky-900 font-bold px-1.5 py-0.2 rounded-full">4 Nhóm ▾</span>
            </div>
            <span className="text-xl font-black text-sky-900 font-mono my-1 block">{totalAllBabies}</span>
            <div className="text-[9px] text-sky-700 font-semibold flex items-center justify-center gap-1 flex-wrap leading-tight">
              <span>Bú mẹ: {nursingPupsCount}</span>
              <span>•</span>
              <span>3-4l: {baby34Count}</span>
              <span>•</span>
              <span>5-7l: {baby57Count}</span>
              <span>•</span>
              <span>8l-1.1k: {baby811Count}</span>
            </div>
          </div>

          <div 
            onClick={() => {
              setIsHauBiSectionExpanded(true);
              setSelectedHauBiTab('all');
            }}
            className="p-3 rounded-2xl bg-purple-50 hover:bg-purple-100/70 border border-purple-200 text-center flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.02] shadow-2xs"
            title="Bấm để xem chi tiết Đàn Hậu Bị (Đực, Cái, Chuẩn ghép giống)"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-purple-900 uppercase">HẬU BỊ TUYỂN</span>
              <span className="text-[8px] bg-purple-200/80 text-purple-900 font-bold px-1.5 py-0.2 rounded-full">♂ ♀ ▾</span>
            </div>
            <span className="text-xl font-black text-purple-900 font-mono my-1 block">{totalHauBiCount}</span>
            <div className="text-[9.5px] font-bold flex items-center justify-center gap-1 flex-wrap leading-tight">
              <span className="text-blue-700">♂ {hauBiMaleCount} Đực</span>
              <span className="text-purple-300">•</span>
              <span className="text-pink-700">♀ {hauBiFemaleCount} Cái</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-orange-50 border border-orange-200 text-center flex flex-col justify-between">
            <span className="text-[10px] font-bold text-orange-900 uppercase block">THƯƠNG PHẨM</span>
            <span className="text-xl font-black text-orange-900 font-mono my-1 block">{commercialCount}</span>
            <span className="text-[10px] text-orange-700">Xuất thịt vỗ béo</span>
          </div>

          <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-center flex flex-col justify-between">
            <span className="text-[10px] font-bold text-red-800 uppercase block">ĐANG ĐIỀU TRỊ</span>
            <span className="text-xl font-black text-red-900 font-mono my-1 block">{quarantineCount}</span>
            <span className="text-[10px] text-red-600">Cách ly thú y</span>
          </div>
        </div>

        {/* Thanh tỷ lệ phân bổ cơ cấu đàn toàn trại (Multi-segment Progress Bar) */}
        {totalRats > 0 && (
          <div className="space-y-2 pt-2">
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex shadow-2xs">
              {femaleBreedingCount > 0 && (
                <div
                  className="bg-rose-500 h-full transition-all"
                  style={{ width: `${(femaleBreedingCount / totalRats) * 100}%` }}
                  title={`Cái sinh sản: ${femaleBreedingCount} con (${Math.round((femaleBreedingCount / totalRats) * 100)}%)`}
                />
              )}
              {breedingMaleCount > 0 && (
                <div
                  className="bg-blue-500 h-full transition-all"
                  style={{ width: `${(breedingMaleCount / totalRats) * 100}%` }}
                  title={`Đực giống SS: ${breedingMaleCount} con (${Math.round((breedingMaleCount / totalRats) * 100)}%)`}
                />
              )}
              {totalAllBabies > 0 && (
                <div
                  className="bg-sky-400 h-full transition-all"
                  style={{ width: `${(totalAllBabies / totalRats) * 100}%` }}
                  title={`Dúi baby các nhóm: ${totalAllBabies} con (${Math.round((totalAllBabies / totalRats) * 100)}%)`}
                />
              )}
              {totalHauBiCount > 0 && (
                <div
                  className="bg-purple-500 h-full transition-all"
                  style={{ width: `${(totalHauBiCount / totalRats) * 100}%` }}
                  title={`Hậu bị: ${totalHauBiCount} con (♂ ${hauBiMaleCount} đực, ♀ ${hauBiFemaleCount} cái) (${Math.round((totalHauBiCount / totalRats) * 100)}%)`}
                />
              )}
              {commercialCount > 0 && (
                <div
                  className="bg-orange-400 h-full transition-all"
                  style={{ width: `${(commercialCount / totalRats) * 100}%` }}
                  title={`Thương phẩm: ${commercialCount} con (${Math.round((commercialCount / totalRats) * 100)}%)`}
                />
              )}
              {quarantineCount > 0 && (
                <div
                  className="bg-red-500 h-full transition-all"
                  style={{ width: `${(quarantineCount / totalRats) * 100}%` }}
                  title={`Điều trị: ${quarantineCount} con (${Math.round((quarantineCount / totalRats) * 100)}%)`}
                />
              )}
            </div>

            {/* Chú thích màu sắc tỷ lệ */}
            <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                <span>Cái SS ({Math.round((femaleBreedingCount / totalRats) * 100)}%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                <span>Đực giống SS ({Math.round((breedingMaleCount / totalRats) * 100)}%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block" />
                <span>Baby ({Math.round((totalAllBabies / totalRats) * 100)}%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" />
                <span>Hậu bị ({totalHauBiCount}c • ♂{hauBiMaleCount}/♀{hauBiFemaleCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-400 inline-block" />
                <span>Thương phẩm ({Math.round((commercialCount / totalRats) * 100)}%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
                <span>Điều trị ({Math.round((quarantineCount / totalRats) * 100)}%)</span>
              </div>
            </div>
          </div>
        )}

        {/* 2.1 BỔ SUNG: PHÂN MỤC CHI TIẾT CƠ CẤU ĐÀN DÚI BABY THEO TRỌNG LƯỢNG NGHIỆP VỤ */}
        <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-base">🍼</span>
              <div>
                <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                  <span>CHI TIẾT ĐÀN DÚI BABY THEO TRỌNG LƯỢNG NGHIỆP VỤ</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-mono">
                    {totalAllBabies} Con Non
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Phân nhóm theo các mốc kỹ thuật chuẩn: Bú mẹ • 3–4 lạng • 5–7 lạng • 8 lạng đến 1,1 kg
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsBabySectionExpanded(!isBabySectionExpanded)}
              className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <span>{isBabySectionExpanded ? 'Thu gọn' : 'Xem chi tiết'}</span>
              {isBabySectionExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {isBabySectionExpanded && (
            <div className="space-y-4">
              {/* 4 Thẻ Phân Khúc Trọng Lượng Chuẩn Nghiệp Vụ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Nhóm 1: Bú mẹ */}
                <div 
                  onClick={() => setSelectedBabyTab('nursing')}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer select-none ${
                    selectedBabyTab === 'nursing'
                      ? 'bg-sky-50/90 border-sky-400 ring-2 ring-sky-300/40 shadow-xs'
                      : 'bg-white hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-[10.5px] font-bold text-sky-800 uppercase flex items-center gap-1">
                      <span>🍼</span>
                      <span>BÚ MẸ (&lt; 3 LẠNG)</span>
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 font-mono">
                      {nursingPupsCount} con
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-slate-500">Quy mô ô mẹ:</span>
                      <strong className="text-xs font-bold text-slate-800">{nursingMothersCages.length} Ổ sinh sản</strong>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-slate-500">Trọng lượng:</span>
                      <span className="text-xs font-semibold text-slate-700">&lt; 0.30 kg / con</span>
                    </div>
                    <div className="text-[10px] text-sky-700 bg-sky-50 px-2 py-1 rounded-lg border border-sky-100/80 mt-1">
                      Nuôi theo mẹ dưới 45 ngày, bú sữa & tập liếm bột cám.
                    </div>
                  </div>
                </div>

                {/* Nhóm 2: Baby 3 - 4 Lạng */}
                <div 
                  onClick={() => setSelectedBabyTab('3_4_lang')}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer select-none ${
                    selectedBabyTab === '3_4_lang'
                      ? 'bg-teal-50/90 border-teal-400 ring-2 ring-teal-300/40 shadow-xs'
                      : 'bg-white hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-[10.5px] font-bold text-teal-800 uppercase flex items-center gap-1">
                      <span>🥗</span>
                      <span>BABY 3 – 4 LẠNG</span>
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 font-mono">
                      {baby34Count} con
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-slate-500">Số ô nuôi:</span>
                      <strong className="text-xs font-bold text-slate-800">{baby34Cages.length} Ô Baby</strong>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-slate-500">Trọng lượng:</span>
                      <span className="text-xs font-semibold text-teal-800">0.30 – 0.45 kg</span>
                    </div>
                    <div className="text-[10px] text-teal-700 bg-teal-50 px-2 py-1 rounded-lg border border-teal-100/80 mt-1">
                      Mới tách mẹ, tập ăn tre non mềm, mía róc vỏ, men tiêu hóa.
                    </div>
                  </div>
                </div>

                {/* Nhóm 3: Baby 5 - 7 Lạng */}
                <div 
                  onClick={() => setSelectedBabyTab('5_7_lang')}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer select-none ${
                    selectedBabyTab === '5_7_lang'
                      ? 'bg-blue-50/90 border-blue-400 ring-2 ring-blue-300/40 shadow-xs'
                      : 'bg-white hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-[10.5px] font-bold text-blue-800 uppercase flex items-center gap-1">
                      <span>🎋</span>
                      <span>BABY 5 – 7 LẠNG</span>
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-mono">
                      {baby57Count} con
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-slate-500">Số ô nuôi:</span>
                      <strong className="text-xs font-bold text-slate-800">{baby57Cages.length} Ô Baby</strong>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-slate-500">Trọng lượng:</span>
                      <span className="text-xs font-semibold text-blue-800">0.50 – 0.75 kg</span>
                    </div>
                    <div className="text-[10px] text-blue-700 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100/80 mt-1">
                      Lớn nhanh, phát triển khung xương, ăn tre già vừa, ngô hạt.
                    </div>
                  </div>
                </div>

                {/* Nhóm 4: Baby 8 Lạng - 1.1 Kg */}
                <div 
                  onClick={() => setSelectedBabyTab('8_lang_1_1_kg')}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer select-none ${
                    selectedBabyTab === '8_lang_1_1_kg'
                      ? 'bg-indigo-50/90 border-indigo-400 ring-2 ring-indigo-300/40 shadow-xs'
                      : 'bg-white hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-[10.5px] font-bold text-indigo-900 uppercase flex items-center gap-1">
                      <span>⚖️</span>
                      <span>8 LẠNG – 1,1 KG</span>
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 font-mono">
                      {baby811Count} con
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-slate-500">Số ô nuôi:</span>
                      <strong className="text-xs font-bold text-slate-800">{baby811Cages.length} Ô Baby</strong>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-slate-500">Trọng lượng:</span>
                      <span className="text-xs font-semibold text-indigo-900">0.80 – 1.10 kg</span>
                    </div>
                    <div className="text-[10px] text-indigo-700 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100/80 mt-1">
                      Đạt chuẩn phân đàn: Tuyển chọn giống Hậu bị hoặc Thương phẩm.
                    </div>
                  </div>
                </div>
              </div>

              {/* Thanh tiến trình phân bổ nội bộ đàn Baby */}
              {totalAllBabies > 0 && (
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">Tỷ lệ phân bổ nội bộ Đàn Baby ({totalAllBabies} con):</span>
                    <span className="text-[11px] text-slate-500 font-mono font-semibold">100%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden flex">
                    {nursingPupsCount > 0 && (
                      <div
                        className="bg-sky-400 h-full transition-all"
                        style={{ width: `${(nursingPupsCount / totalAllBabies) * 100}%` }}
                        title={`Bú mẹ: ${nursingPupsCount} con (${Math.round((nursingPupsCount / totalAllBabies) * 100)}%)`}
                      />
                    )}
                    {baby34Count > 0 && (
                      <div
                        className="bg-teal-500 h-full transition-all"
                        style={{ width: `${(baby34Count / totalAllBabies) * 100}%` }}
                        title={`Baby 3-4 lạng: ${baby34Count} con (${Math.round((baby34Count / totalAllBabies) * 100)}%)`}
                      />
                    )}
                    {baby57Count > 0 && (
                      <div
                        className="bg-blue-600 h-full transition-all"
                        style={{ width: `${(baby57Count / totalAllBabies) * 100}%` }}
                        title={`Baby 5-7 lạng: ${baby57Count} con (${Math.round((baby57Count / totalAllBabies) * 100)}%)`}
                      />
                    )}
                    {baby811Count > 0 && (
                      <div
                        className="bg-indigo-600 h-full transition-all"
                        style={{ width: `${(baby811Count / totalAllBabies) * 100}%` }}
                        title={`Baby 8l-1.1kg: ${baby811Count} con (${Math.round((baby811Count / totalAllBabies) * 100)}%)`}
                      />
                    )}
                  </div>
                  <div className="flex flex-wrap items-center justify-between text-[10.5px] text-slate-500 pt-0.5">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-sky-400" />
                      <span>Bú mẹ: {Math.round((nursingPupsCount / totalAllBabies) * 100)}%</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-teal-500" />
                      <span>3–4 lạng: {Math.round((baby34Count / totalAllBabies) * 100)}%</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-blue-600" />
                      <span>5–7 lạng: {Math.round((baby57Count / totalAllBabies) * 100)}%</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-indigo-600" />
                      <span>8l–1,1kg: {Math.round((baby811Count / totalAllBabies) * 100)}%</span>
                    </span>
                  </div>
                </div>
              )}

              {/* Bộ lọc tab xem danh sách Ô chuồng tương ứng */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => setSelectedBabyTab('all')}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                        selectedBabyTab === 'all'
                          ? 'bg-slate-900 text-white shadow-2xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      Tất Cả ({totalAllBabies} con / {filteredBabyCages.length} ô)
                    </button>
                    <button
                      onClick={() => setSelectedBabyTab('nursing')}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                        selectedBabyTab === 'nursing'
                          ? 'bg-sky-600 text-white shadow-2xs'
                          : 'bg-sky-50 hover:bg-sky-100 text-sky-800'
                      }`}
                    >
                      🍼 Bú Mẹ ({nursingPupsCount} con)
                    </button>
                    <button
                      onClick={() => setSelectedBabyTab('3_4_lang')}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                        selectedBabyTab === '3_4_lang'
                          ? 'bg-teal-700 text-white shadow-2xs'
                          : 'bg-teal-50 hover:bg-teal-100 text-teal-800'
                      }`}
                    >
                      🥗 3 – 4 Lạng ({baby34Count} con)
                    </button>
                    <button
                      onClick={() => setSelectedBabyTab('5_7_lang')}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                        selectedBabyTab === '5_7_lang'
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'bg-blue-50 hover:bg-blue-100 text-blue-800'
                      }`}
                    >
                      🎋 5 – 7 Lạng ({baby57Count} con)
                    </button>
                    <button
                      onClick={() => setSelectedBabyTab('8_lang_1_1_kg')}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                        selectedBabyTab === '8_lang_1_1_kg'
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-800'
                      }`}
                    >
                      ⚖️ 8 Lạng – 1,1 Kg ({baby811Count} con)
                    </button>
                  </div>

                  <button
                    onClick={() => onNavigateToArea('area-bb')}
                    className="text-xs font-bold text-sky-700 hover:text-sky-800 flex items-center gap-1"
                  >
                    <span>Vào Khu Baby</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Danh sách các Ô chuồng thuộc nhóm Baby */}
                {filteredBabyCages.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    Chưa có ô chuồng nào trong phân nhóm này.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
                    {filteredBabyCages.map((cage) => {
                      const isNursingMom = cage.status === 'dang_nuoi_con';
                      const pupCount = isNursingMom 
                        ? (cage.livingBabyCount ?? cage.totalBornCount ?? cage.ratCount ?? 0)
                        : (cage.ratCount || 1);
                      
                      const weightLabel = isNursingMom
                        ? 'Đang bú mẹ (< 45 ngày)'
                        : cage.currentWeightKg 
                          ? `${cage.currentWeightKg} kg (${Math.round(cage.currentWeightKg * 10)} lạng)`
                          : cage.babyGroup === '3_4_lang' 
                            ? '3–4 lạng (0.35kg)'
                            : cage.babyGroup === '5_7_lang'
                              ? '5–7 lạng (0.65kg)'
                              : '8l–1.1kg (0.95kg)';

                      return (
                        <div
                          key={cage.id}
                          onClick={() => onSelectCage(cage)}
                          className="p-2.5 rounded-2xl bg-white border border-slate-200 hover:border-sky-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-1.5 select-none group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-black text-xs text-slate-900 group-hover:text-sky-700">
                              {cage.code}
                            </span>
                            <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-100 text-slate-600">
                              {cage.slotNumber || 'Ô'}
                            </span>
                          </div>

                          <div>
                            <div className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
                              <span>{isNursingMom ? '🍼' : '🐾'}</span>
                              <span>{pupCount} Con</span>
                            </div>
                            <div className="text-[10px] text-slate-500 truncate font-medium">
                              {weightLabel}
                            </div>
                          </div>

                          <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[9px]">
                            <span className="text-slate-400 truncate">{cage.rowCode || cage.areaCode}</span>
                            <span className="text-sky-600 font-bold group-hover:underline">Chi tiết →</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 2.2 BỔ SUNG: PHÂN MỤC CHI TIẾT CƠ CẤU ĐÀN DÚI HẬU BỊ (PHÂN RÕ ĐỰC & CÁI) */}
        <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-base">🌟</span>
              <div>
                <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2 flex-wrap">
                  <span>CHI TIẾT ĐÀN DÚI HẬU BỊ (ĐỰC & CÁI)</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 font-mono">
                    Tổng {totalHauBiCount} Con
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-mono">
                    ♂ {hauBiMaleCount} Đực
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-100 text-pink-800 font-mono">
                    ♀ {hauBiFemaleCount} Cái
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Số liệu cập nhật tự động toàn trại: Phân định giới tính ♂/♀ • Đạt chuẩn ghép F1 • Đang nuôi dưỡng
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsHauBiSectionExpanded(!isHauBiSectionExpanded)}
              className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <span>{isHauBiSectionExpanded ? 'Thu gọn' : 'Xem chi tiết'}</span>
              {isHauBiSectionExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {isHauBiSectionExpanded && (
            <div className="space-y-4">
              {/* 4 Thẻ Phân Tích Nghiệp Vụ Hậu Bị */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* 1. Hậu Bị Đực */}
                <div 
                  onClick={() => setSelectedHauBiTab('duc')}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer select-none ${
                    selectedHauBiTab === 'duc'
                      ? 'bg-blue-50/90 border-blue-400 ring-2 ring-blue-300/40 shadow-xs'
                      : 'bg-white hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-[10.5px] font-bold text-blue-800 uppercase flex items-center gap-1">
                      <span>♂</span>
                      <span>HẬU BỊ ĐỰC TUYỂN</span>
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-mono">
                      {hauBiMaleCount} con
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-slate-500">Quy mô ô nuôi:</span>
                      <strong className="text-xs font-bold text-slate-800">{hauBiMaleCages.length} ô chuồng</strong>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-slate-500">Đạt chuẩn ghép (≥2kg):</span>
                      <strong className="text-xs font-bold text-blue-700">
                        {hauBiMaleCages.filter(c => c.status === 'dat_dieu_kien' || ((c.currentWeightKg || 0) >= 2.0)).length} con
                      </strong>
                    </div>
                    <div className="text-[10.5px] text-slate-600 bg-blue-50/80 p-1.5 rounded-lg border border-blue-100 mt-1">
                      <strong>Mục tiêu:</strong> Thay thế & bổ sung đàn đực phối giống F1, ngoại hình lực lưỡng, tinh hoàn cân đối.
                    </div>
                  </div>
                </div>

                {/* 2. Hậu Bị Cái */}
                <div 
                  onClick={() => setSelectedHauBiTab('cai')}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer select-none ${
                    selectedHauBiTab === 'cai'
                      ? 'bg-pink-50/90 border-pink-400 ring-2 ring-pink-300/40 shadow-xs'
                      : 'bg-white hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-[10.5px] font-bold text-pink-800 uppercase flex items-center gap-1">
                      <span>♀</span>
                      <span>HẬU BỊ CÁI TUYỂN</span>
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-pink-100 text-pink-800 font-mono">
                      {hauBiFemaleCount} con
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-slate-500">Quy mô ô nuôi:</span>
                      <strong className="text-xs font-bold text-slate-800">{hauBiFemaleCages.length} ô chuồng</strong>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-slate-500">Đạt chuẩn ghép (≥1.8kg):</span>
                      <strong className="text-xs font-bold text-pink-700">
                        {hauBiFemaleCages.filter(c => c.status === 'dat_dieu_kien' || ((c.currentWeightKg || 0) >= 1.8)).length} con
                      </strong>
                    </div>
                    <div className="text-[10.5px] text-slate-600 bg-pink-50/80 p-1.5 rounded-lg border border-pink-100 mt-1">
                      <strong>Mục tiêu:</strong> Bổ sung dàn nái sinh sản lứa đầu, 8–10 núm vú đều, xương chậu nở, tính hiền.
                    </div>
                  </div>
                </div>

                {/* 3. Đạt Chuẩn Ghép Giống */}
                <div 
                  onClick={() => setSelectedHauBiTab('dat_dieu_kien')}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer select-none ${
                    selectedHauBiTab === 'dat_dieu_kien'
                      ? 'bg-emerald-50/90 border-emerald-400 ring-2 ring-emerald-300/40 shadow-xs'
                      : 'bg-white hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-[10.5px] font-bold text-emerald-800 uppercase flex items-center gap-1">
                      <span>★</span>
                      <span>ĐẠT CHUẨN GHÉP GIỐNG</span>
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-mono">
                      {hauBiReadyCount} con
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-slate-500">Cơ cấu giới tính:</span>
                      <strong className="text-xs font-bold text-emerald-800">
                        ♂ {hauBiReadyCages.filter(c => c.gender === 'duc').reduce((s,c)=>s+(c.ratCount||1),0)} • ♀ {hauBiReadyCages.filter(c => c.gender !== 'duc').reduce((s,c)=>s+(c.ratCount||1),0)}
                      </strong>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-slate-500">Độ tuổi đạt chuẩn:</span>
                      <strong className="text-xs font-bold text-slate-800">8 – 10 tháng</strong>
                    </div>
                    <div className="text-[10.5px] text-slate-600 bg-emerald-50/80 p-1.5 rounded-lg border border-emerald-100 mt-1">
                      <strong>Thao tác:</strong> Sẵn sàng chuyển sang Khu Sinh Sản để phân dãy và ghép đôi chu kỳ mới.
                    </div>
                  </div>
                </div>

                {/* 4. Đang Nuôi Dưỡng */}
                <div 
                  onClick={() => setSelectedHauBiTab('dang_nuoi')}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer select-none ${
                    selectedHauBiTab === 'dang_nuoi'
                      ? 'bg-purple-50/90 border-purple-400 ring-2 ring-purple-300/40 shadow-xs'
                      : 'bg-white hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-[10.5px] font-bold text-purple-900 uppercase flex items-center gap-1">
                      <span>⏳</span>
                      <span>ĐANG NUÔI DƯỠNG</span>
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-900 font-mono">
                      {hauBiGrowingCount} con
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-slate-500">Quy mô nuôi:</span>
                      <strong className="text-xs font-bold text-slate-800">{hauBiGrowingCages.length} ô chuồng</strong>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-slate-500">Chu kỳ kiểm tra:</span>
                      <strong className="text-xs font-bold text-purple-800">15 ngày/lần</strong>
                    </div>
                    <div className="text-[10.5px] text-slate-600 bg-purple-50/80 p-1.5 rounded-lg border border-purple-100 mt-1">
                      <strong>Khẩu phần:</strong> Bổ sung đạm, bột bắp, men tiêu hóa, tre bánh tẻ để tạo khung hoàn chỉnh.
                    </div>
                  </div>
                </div>
              </div>

              {/* Thanh Tỷ Lệ Đực ♂ / Cái ♀ Hậu Bị Toàn Trại */}
              {totalHauBiCount > 0 && (
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                      <span>Tỷ Lệ Giới Tính Đàn Hậu Bị:</span>
                      <span className="text-blue-700 font-semibold">♂ {hauBiMaleCount} Đực ({Math.round((hauBiMaleCount / totalHauBiCount) * 100)}%)</span>
                      <span className="text-slate-300">vs</span>
                      <span className="text-pink-700 font-semibold">♀ {hauBiFemaleCount} Cái ({Math.round((hauBiFemaleCount / totalHauBiCount) * 100)}%)</span>
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Tỷ lệ phối chuẩn: 1 Đực ghép luân chuyển 3–4 Cái
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden flex">
                    <div 
                      className="bg-blue-500 h-full transition-all" 
                      style={{ width: `${(hauBiMaleCount / totalHauBiCount) * 100}%` }}
                      title={`Hậu bị Đực: ${hauBiMaleCount} con (${Math.round((hauBiMaleCount / totalHauBiCount) * 100)}%)`}
                    />
                    <div 
                      className="bg-pink-500 h-full transition-all" 
                      style={{ width: `${(hauBiFemaleCount / totalHauBiCount) * 100}%` }}
                      title={`Hậu bị Cái: ${hauBiFemaleCount} con (${Math.round((hauBiFemaleCount / totalHauBiCount) * 100)}%)`}
                    />
                  </div>
                </div>
              )}

              {/* Tabs Lọc Danh Sách Ô Chuồng Hậu Bị */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
                    <button
                      onClick={() => setSelectedHauBiTab('all')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                        selectedHauBiTab === 'all'
                          ? 'bg-purple-700 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      Tất Cả Hậu Bị ({totalHauBiCount} Con / {hauBiAreaCages.length} Ô)
                    </button>

                    <button
                      onClick={() => setSelectedHauBiTab('duc')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1 ${
                        selectedHauBiTab === 'duc'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200'
                      }`}
                    >
                      <span>♂ Hậu Bị Đực</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-white/30">
                        {hauBiMaleCount}
                      </span>
                    </button>

                    <button
                      onClick={() => setSelectedHauBiTab('cai')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1 ${
                        selectedHauBiTab === 'cai'
                          ? 'bg-pink-600 text-white shadow-xs'
                          : 'bg-pink-50 hover:bg-pink-100 text-pink-800 border border-pink-200'
                      }`}
                    >
                      <span>♀ Hậu Bị Cái</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-white/30">
                        {hauBiFemaleCount}
                      </span>
                    </button>

                    <button
                      onClick={() => setSelectedHauBiTab('dat_dieu_kien')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1 ${
                        selectedHauBiTab === 'dat_dieu_kien'
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      <span>★ Đạt Chuẩn Ghép</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-white/30">
                        {hauBiReadyCount}
                      </span>
                    </button>

                    <button
                      onClick={() => setSelectedHauBiTab('dang_nuoi')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1 ${
                        selectedHauBiTab === 'dang_nuoi'
                          ? 'bg-slate-800 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <span>⏳ Đang Nuôi</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700">
                        {hauBiGrowingCount}
                      </span>
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      const hbArea = areas.find(a => a.kind === 'hau_bi');
                      if (hbArea) onNavigateToArea(hbArea.id);
                      else onNavigateToArea();
                    }}
                    className="text-xs font-bold text-purple-700 hover:text-purple-800 flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors"
                  >
                    <span>Vào Khu Hậu Bị</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Danh sách các Ô chuồng thuộc nhóm Hậu Bị */}
                {filteredHauBiCages.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    Chưa có ô chuồng nào trong phân nhóm hậu bị này.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
                    {filteredHauBiCages.map((cage) => {
                      const isMale = cage.gender === 'duc';
                      const isReady = cage.status === 'dat_dieu_kien' || 
                        cage.hauBiPassed === true || 
                        (isMale ? ((cage.currentWeightKg || 0) >= 2.0) : ((cage.currentWeightKg || 0) >= 1.8));

                      return (
                        <div
                          key={cage.id}
                          onClick={() => onSelectCage(cage)}
                          className={`p-2.5 rounded-2xl bg-white border transition-all cursor-pointer flex flex-col justify-between space-y-1.5 select-none group hover:shadow-md ${
                            isMale ? 'hover:border-blue-400' : 'hover:border-pink-400'
                          } ${isReady ? 'border-emerald-300 ring-1 ring-emerald-200' : 'border-slate-200'}`}
                        >
                          <div className="flex items-center justify-between">
                            <span className={`font-mono font-black text-xs group-hover:underline ${
                              isMale ? 'text-blue-900' : 'text-pink-900'
                            }`}>
                              {cage.code}
                            </span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                              isMale ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
                            }`}>
                              {isMale ? '♂ Đực' : '♀ Cái'}
                            </span>
                          </div>

                          <div>
                            <div className="text-[11px] font-bold text-slate-800 flex items-center justify-between">
                              <span>{cage.ratCount || 1} Con</span>
                              <span className="text-emerald-700 font-mono font-bold">
                                {cage.currentWeightKg ? `${cage.currentWeightKg} kg` : '--- kg'}
                              </span>
                            </div>
                            <div className="text-[9.5px] mt-0.5">
                              {isReady ? (
                                <span className="text-emerald-700 font-bold bg-emerald-50 px-1 py-0.2 rounded">
                                  ★ Đạt chuẩn ghép
                                </span>
                              ) : (
                                <span className="text-slate-500 font-medium">
                                  ⏳ Đang nuôi dưỡng
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[9px]">
                            <span className="text-slate-400 truncate">{cage.rowCode || cage.areaCode}</span>
                            <span className={`${isMale ? 'text-blue-600' : 'text-pink-600'} font-bold group-hover:underline`}>
                              Hồ sơ →
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 2. LỊCH CÔNG VIỆC & CẢNH BÁO TỰ ĐỘNG THEO ĐẶC TẢ */}
      <section className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">
                Lịch Công Việc & Cảnh Báo Tự Động
              </h2>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                tasks.length > 0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {tasks.length} việc cần xử lý
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Tự động tổng hợp từ việc dự kiến tiếp theo + ngày hẹn thực tế (Ưu tiên Quá hạn → Đến hạn → Sắp đến hạn)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onQuickCleanToday}
              className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold transition-colors"
            >
              🧹 Ghi nhận vệ sinh hôm nay
            </button>
            <button
              onClick={onNavigateToTasks}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
            >
              Xem chi tiết công việc →
            </button>
          </div>
        </div>

        {/* Danh sách việc cần làm */}
        {tasks.length === 0 ? (
          <div className="py-8 text-center bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-2">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-lg font-bold">
              ✓
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Toàn Trại Đang Đúng Quy Trình Kỹ Thuật</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Không có công việc nào bị quá hạn hay đến hạn tồn đọng. Hệ thống sẽ tự động nhắc khi đến chu kỳ.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {tasks.slice(0, 6).map((task) => {
              const targetCage = cages.find(c => c.id === task.cageId);

              return (
                <div
                  key={task.id}
                  className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                    task.urgency === 'qua_han'
                      ? 'bg-rose-50/70 border-rose-200'
                      : task.urgency === 'den_han'
                      ? 'bg-amber-50/70 border-amber-200'
                      : 'bg-blue-50/50 border-blue-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-xs ${
                      task.urgency === 'qua_han'
                        ? 'bg-rose-200 text-rose-800'
                        : task.urgency === 'den_han'
                        ? 'bg-amber-200 text-amber-900'
                        : 'bg-blue-200 text-blue-800'
                    }`}>
                      {task.urgency === 'qua_han' ? '!' : task.urgency === 'den_han' ? 'HÔM NAY' : 'SẮP'}
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{task.title}</span>
                        {task.cageCode && (
                          <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-white border border-slate-200 text-slate-700">
                            Ô {task.cageCode}
                          </span>
                        )}
                        <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                          task.urgency === 'qua_han'
                            ? 'bg-rose-100 text-rose-800'
                            : task.urgency === 'den_han'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {task.urgency === 'qua_han' ? 'QUÁ HẠN' : task.urgency === 'den_han' ? 'ĐẾN HẠN HÔM NAY' : 'SẮP ĐẾN HẠN'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">{task.description}</p>
                      <span className="text-[10px] text-slate-400 block">
                        Ngày hẹn: <strong>{formatDateVN(task.dueDate)}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Nút Tới Ô theo chuẩn đặc tả: chỉ mở Hồ sơ Ô, không tự hoàn thành */}
                  {targetCage && (
                    <button
                      onClick={() => onSelectCage(targetCage)}
                      className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-emerald-700 text-xs font-bold flex items-center justify-center gap-1 transition-colors shadow-2xs whitespace-nowrap self-end sm:self-center"
                    >
                      <span>Tới Ô {targetCage.code}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
