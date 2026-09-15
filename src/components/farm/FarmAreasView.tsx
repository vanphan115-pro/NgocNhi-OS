import React, { useState } from 'react';
import { UserRole } from '../../types';
import { FarmArea, FarmRow, FarmCage } from './farmTypes';
import { 
  Plus, 
  QrCode, 
  Smartphone,
  Trash2, 
  Edit3, 
  Check, 
  X,
  AlertTriangle,
  Lock
} from 'lucide-react';
import { EditCageModal } from './EditCageModal';
import { computeNextRowSuggestion } from './farmData';

interface FarmAreasViewProps {
  areas: FarmArea[];
  rows: FarmRow[];
  cages: FarmCage[];
  selectedAreaId?: string;
  onSelectArea: (areaId?: string) => void;
  onSelectCage: (cage: FarmCage) => void;
  onOpenAddCage: (options?: { areaId?: string; rowId?: string; tier?: number }) => void;
  onOpenAreaQR: (area: FarmArea) => void;
  onOpenRowQR?: (row: FarmRow, area?: FarmArea) => void;
  onOpenCageQR?: (cage: FarmCage) => void;
  onDeleteCage?: (cageId: string) => void;
  onEditCage?: (updatedCage: FarmCage, secondCageUpdate?: FarmCage) => void;
  onAddRow?: (areaId: string, rowName: string, rowCode: string, kind?: 'cai' | 'duc' | 'chung', tierCount?: number) => void;
  onEditRow?: (row: FarmRow) => void;
  onDeleteRow?: (rowId: string) => void;
  onEditArea?: (area: FarmArea) => void;
  onDeleteArea?: (areaId: string) => void;
  onOpenManageStructure?: () => void;
  userRole?: UserRole;
  onOpenAdminLogin?: (reason?: string) => void;
}

export const FarmAreasView: React.FC<FarmAreasViewProps> = ({
  areas,
  rows,
  cages,
  selectedAreaId,
  onSelectArea,
  onSelectCage,
  onOpenAddCage,
  onOpenAreaQR,
  onOpenRowQR,
  onOpenCageQR,
  onDeleteCage,
  onEditCage,
  onAddRow,
  onEditRow,
  onDeleteRow,
  onEditArea,
  onDeleteArea,
  onOpenManageStructure,
  userRole = 'guest',
  onOpenAdminLogin
}) => {

  // Tìm khu đang được chọn (nếu có)
  const currentArea = selectedAreaId ? areas.find(a => a.id === selectedAreaId) : undefined;

  // State cho Modal/Dialog Sửa Khu
  const [showEditAreaModal, setShowEditAreaModal] = useState(false);
  const [editAreaName, setEditAreaName] = useState('');
  const [editAreaDesc, setEditAreaDesc] = useState('');

  // State cho Modal Thêm Dãy
  const [showAddRowModal, setShowAddRowModal] = useState(false);
  const [newRowName, setNewRowName] = useState('');
  const [newRowCode, setNewRowCode] = useState('');
  const [newRowKind, setNewRowKind] = useState<'cai' | 'duc' | 'chung'>('cai');
  const [newRowTierCount, setNewRowTierCount] = useState<number>(2);

  // State cho Modal Sửa Dãy
  const [editingRow, setEditingRow] = useState<FarmRow | null>(null);

  // State cho Modal Sửa Ô Chuồng
  const [editingCage, setEditingCage] = useState<FarmCage | null>(null);

  // State cho Dialog Xác Nhận Xóa (Tránh lỗi window.confirm trong iframe)
  const [cageToDelete, setCageToDelete] = useState<FarmCage | null>(null);
  const [rowToDelete, setRowToDelete] = useState<FarmRow | null>(null);
  const [areaToDelete, setAreaToDelete] = useState<FarmArea | null>(null);

  const [editRowName, setEditRowName] = useState('');
  const [editRowKind, setEditRowKind] = useState<'cai' | 'duc' | 'chung'>('cai');
  const [editRowTierCount, setEditRowTierCount] = useState<number>(2);

  // Lấy các Dãy thuộc Khu đang chọn (nếu đang ở bên trong một khu)
  const areaRows = currentArea ? rows.filter(r => r.areaId === currentArea.id) : [];

  // Handler mở sửa Khu
  const handleOpenEditArea = () => {
    if (!currentArea) return;
    setEditAreaName(currentArea.name);
    setEditAreaDesc(currentArea.description || '');
    setShowEditAreaModal(true);
  };

  // Handler lưu sửa Khu
  const handleSaveEditArea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentArea || !editAreaName.trim()) return;
    if (onEditArea) {
      onEditArea({
        ...currentArea,
        name: editAreaName.trim(),
        description: editAreaDesc.trim()
      });
    }
    setShowEditAreaModal(false);
  };

  // Handler xóa Khu
  const handleConfirmDeleteArea = () => {
    if (areaToDelete && onDeleteArea) {
      onDeleteArea(areaToDelete.id);
      if (currentArea && currentArea.id === areaToDelete.id) {
        onSelectArea(undefined);
      }
    }
    setAreaToDelete(null);
  };

  // Mở modal thêm Dãy với gợi ý tự động đồng bộ (Dãy Cái -> DC{n}, Dãy Đực -> DĐ{n})
  const handleOpenAddRowModal = (defaultKind: 'cai' | 'duc' | 'chung' = 'cai') => {
    if (!currentArea) return;
    const existingInArea = rows.filter(r => r.areaId === currentArea.id);
    const suggestion = computeNextRowSuggestion(existingInArea, defaultKind);
    setNewRowKind(defaultKind);
    setNewRowName(suggestion.name);
    setNewRowCode(suggestion.code);
    setNewRowTierCount(suggestion.tierCount);
    setShowAddRowModal(true);
  };

  // Đổi phân loại dãy: tự động đồng bộ tên và mã dãy tiếp theo
  const handleSelectRowKind = (kind: 'cai' | 'duc' | 'chung') => {
    setNewRowKind(kind);
    if (!currentArea) return;
    const existingInArea = rows.filter(r => r.areaId === currentArea.id);
    const suggestion = computeNextRowSuggestion(existingInArea, kind);
    setNewRowName(suggestion.name);
    setNewRowCode(suggestion.code);
    setNewRowTierCount(suggestion.tierCount);
  };

  // Handler thêm Dãy
  const handleSaveAddRow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentArea || !newRowName.trim()) return;
    let finalCode = newRowCode.trim().toUpperCase();
    if (!finalCode) {
      const existingInArea = rows.filter(r => r.areaId === currentArea.id);
      finalCode = computeNextRowSuggestion(existingInArea, newRowKind).code;
    }
    if (onAddRow) {
      onAddRow(currentArea.id, newRowName.trim(), finalCode, newRowKind, newRowTierCount);
    }
    setNewRowName('');
    setNewRowCode('');
    setShowAddRowModal(false);
  };

  // Handler mở sửa Dãy
  const handleOpenEditRow = (row: FarmRow) => {
    setEditingRow(row);
    setEditRowName(row.name);
    setEditRowKind(row.kind || 'cai');
    setEditRowTierCount(row.tierCount || 2);
  };

  // Handler lưu sửa Dãy
  const handleSaveEditRow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRow || !editRowName.trim()) return;
    if (onEditRow) {
      onEditRow({
        ...editingRow,
        name: editRowName.trim(),
        kind: editRowKind,
        tierCount: editRowTierCount,
        genderBadge: editRowKind === 'cai' ? '♀ Dãy Cái' : editRowKind === 'duc' ? '♂ Dãy Đực' : undefined
      });
    }
    setEditingRow(null);
  };

  // Handler xóa Dãy
  const handleConfirmDeleteRow = () => {
    if (rowToDelete && onDeleteRow) {
      onDeleteRow(rowToDelete.id);
    }
    setRowToDelete(null);
  };

  // Handler xóa Ô
  const handleConfirmDeleteCage = () => {
    if (cageToDelete && onDeleteCage) {
      onDeleteCage(cageToDelete.id);
    }
    setCageToDelete(null);
  };

  // Helper tính màu nền & viền của Thẻ Ô khớp 100% hình tham chiếu
  const getCageCardStyle = (cage: FarmCage) => {
    switch (cage.status) {
      case 'san_sang_ghep':
        return {
          card: 'bg-[#f0fdf4] border-[#86efac] text-slate-800 hover:border-emerald-500',
          statusText: 'text-[#15803d]'
        };
      case 'ghep_doi':
        return {
          card: 'bg-[#fdf2f8] border-[#f472b6] text-slate-800 hover:border-pink-400',
          statusText: 'text-[#9333ea]'
        };
      case 'moi_tach_duc':
      case 'moi_tach_duc_khong_ro':
        return {
          card: 'bg-[#fefce8] border-[#fde047] text-slate-800 hover:border-yellow-400',
          statusText: 'text-[#ca8a04]'
        };
      case 'moi_tach_cai':
        return {
          card: 'bg-[#eff6ff] border-[#93c5fd] text-slate-800 hover:border-blue-400',
          statusText: 'text-[#2563eb]'
        };
      case 'dang_nuoi_con':
        return {
          card: 'bg-[#ecfdf5] border-[#6ee7b7] text-slate-800 hover:border-teal-400',
          statusText: 'text-[#0d9488]'
        };
      case 'moi_tach_con':
        return {
          card: 'bg-[#fff7ed] border-[#fdba74] text-slate-800 hover:border-orange-400',
          statusText: 'text-[#ea580c]'
        };
      case 'dang_nuoi_baby':
      case 'dat_dieu_kien_chuyen':
        return {
          card: 'bg-[#f0f9ff] border-[#7dd3fc] text-slate-800 hover:border-sky-400',
          statusText: 'text-[#0284c7]'
        };
      case 'dang_nuoi_hau_bi':
      case 'dat_dieu_kien':
      case 'cho_chuyen':
        return {
          card: 'bg-[#eef2ff] border-[#a5b4fc] text-slate-800 hover:border-indigo-400',
          statusText: 'text-[#4f46e5]'
        };
      case 'dang_nuoi_thuong_pham':
      case 'dat_trong_luong':
      case 'cho_xuat':
        return {
          card: 'bg-[#fffbeb] border-[#fcd34d] text-slate-800 hover:border-amber-400',
          statusText: 'text-[#d97706]'
        };
      case 'da_chuyen':
      case 'da_xuat':
        return {
          card: 'bg-slate-50 border-slate-300 text-slate-600 hover:border-slate-400',
          statusText: 'text-slate-500'
        };
      case 'dang_dieu_tri':
        return {
          card: 'bg-[#fff1f2] border-[#fca5a5] text-slate-800 hover:border-rose-400',
          statusText: 'text-[#e11d48]'
        };
      case 'theo_doi':
        return {
          card: 'bg-[#fefce8] border-[#fde047] text-slate-800 hover:border-amber-400',
          statusText: 'text-[#b45309]'
        };
      case 'da_khoi':
        return {
          card: 'bg-[#f0fdf4] border-[#86efac] text-slate-800 hover:border-emerald-500',
          statusText: 'text-[#15803d]'
        };
      case 'chet':
        return {
          card: 'bg-zinc-100 border-zinc-400 text-zinc-600 hover:border-zinc-500',
          statusText: 'text-zinc-700'
        };
      case 'trong':
      default:
        if (cage.partnerCageCode || cage.statusLabel?.includes('chuyển ghép')) {
          return {
            card: 'bg-[#fffbfa] border-dashed border-pink-300/90 text-slate-700 hover:border-pink-400',
            statusText: 'text-pink-600'
          };
        }
        return {
          card: 'bg-white border-dashed border-slate-300 text-slate-400 hover:border-slate-400',
          statusText: 'text-slate-400'
        };
    }
  };

  // Helper hiển thị phụ đề bên dưới trạng thái (tối ưu ngắn gọn, sắc nét cho kích thước 60%)
  const renderCageSubtitle = (cage: FarmCage) => {
    if (cage.status === 'trong') {
      if (cage.partnerCageCode) {
        return <span className="text-pink-600 font-semibold text-[9.5px] truncate">♀ Ghép tại {cage.partnerCageCode}</span>;
      }
      return <span className="text-slate-400 text-[9.5px]">Trống (0 con)</span>;
    }
    if (cage.status === 'ghep_doi') {
      return <span className="text-purple-700 text-[9.5px] font-bold truncate">⚤ Cặp 2c ({cage.partnerCageCode || '---'})</span>;
    }
    if (cage.status === 'moi_tach_duc') {
      return <span className="text-amber-800 text-[9.5px] font-semibold truncate">⏳ Chờ KQ ({cage.partnerCageCode || '---'})</span>;
    }
    if (cage.status === 'moi_tach_duc_khong_ro') {
      return <span className="text-amber-800 text-[9.5px] font-semibold truncate">⏳ Chờ KQ (Không rõ đực)</span>;
    }
    if (cage.status === 'moi_tach_cai') {
      return <span className="text-blue-800 text-[9.5px] font-semibold truncate">⏳ Dưỡng 10n ({cage.partnerCageCode || '---'})</span>;
    }
    if (cage.status === 'dang_nuoi_con') {
      return <span className="text-emerald-700 text-[9.5px] font-semibold truncate">🦔 Nuôi {cage.livingBabyCount || cage.totalBornCount || 4}c ({cage.currentWeightKg || 1.8}kg)</span>;
    }
    if (cage.status === 'moi_tach_con') {
      return <span className="text-amber-700 text-[9.5px] font-semibold truncate">⏳ Tách {cage.weanedBabyCount || 4}c ({cage.weanedBabyWeightAvg || 0.35}kg)</span>;
    }
    if (cage.status === 'dang_nuoi_baby') {
      return <span className="text-sky-700 text-[9.5px] font-medium truncate">🍼 {cage.ratCount}c {cage.currentWeightKg ? `• ${cage.currentWeightKg}kg` : ''}</span>;
    }
    if (cage.status === 'dat_dieu_kien_chuyen') {
      return <span className="text-sky-800 text-[9.5px] font-bold truncate">✓ Đạt chuyển ({cage.ratCount}c)</span>;
    }
    if (cage.status === 'dang_nuoi_hau_bi') {
      return <span className="text-indigo-700 text-[9.5px] font-medium truncate">🌟 {cage.ratCount}c {cage.currentWeightKg ? `• ${cage.currentWeightKg}kg` : ''}</span>;
    }
    if (cage.status === 'dat_dieu_kien') {
      return <span className="text-indigo-800 text-[9.5px] font-bold truncate">★ Đạt chuẩn sinh sản</span>;
    }
    if (cage.status === 'dang_nuoi_thuong_pham') {
      return <span className="text-amber-700 text-[9.5px] font-medium truncate">🥩 {cage.ratCount}c {cage.currentWeightKg ? `• ${cage.currentWeightKg}kg` : ''}</span>;
    }
    if (cage.status === 'dat_trong_luong') {
      return <span className="text-amber-800 text-[9.5px] font-bold truncate">⚖️ Đạt {cage.currentWeightKg || 2.0}kg</span>;
    }
    if (cage.status === 'cho_xuat') {
      return <span className="text-amber-800 text-[9.5px] font-semibold truncate">📦 Chờ xuất ({cage.ratCount}c)</span>;
    }
    if (cage.status === 'da_xuat') {
      return <span className="text-slate-500 text-[9.5px] truncate">✓ Đã xuất ({cage.exportedCount || cage.ratCount}c)</span>;
    }
    if (cage.status === 'dang_dieu_tri') {
      return <span className="text-rose-700 text-[9.5px] font-semibold truncate">🏥 {cage.treatmentDiseaseType ? cage.treatmentDiseaseType.split('/')[0].trim() : 'Đang trị'}</span>;
    }
    if (cage.status === 'theo_doi') {
      return <span className="text-amber-700 text-[9.5px] font-semibold truncate">🩺 Đang theo dõi</span>;
    }
    if (cage.status === 'da_khoi') {
      return <span className="text-emerald-700 text-[9.5px] font-semibold truncate">💚 Đã khỏi ({cage.recoveryAction === 've_cu' ? 'Về cũ' : 'TP'})</span>;
    }
    if (cage.status === 'chet') {
      return <span className="text-zinc-600 text-[9.5px] font-semibold truncate">⚰️ Đã chết ({cage.deathCount || 1}c)</span>;
    }
    if (cage.currentWeightKg) {
      return <span className="text-slate-600 text-[9.5px] font-medium truncate">{cage.currentWeightKg} kg</span>;
    }
    return <span className="text-slate-500 text-[9.5px] truncate">{cage.notes || '---'}</span>;
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      {/* 0. DANH SÁCH TỔNG QUAN CƠ CẤU PHÂN KHU (CHỈ HIỂN THỊ KHI Ở NGOÀI) */}
      {!currentArea && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-sm sm:text-base font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <span className="text-lg">🏡</span>
                <span>CẤU TRÚC PHÂN KHU TRANG TRẠI</span>
              </span>
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-0.5 rounded-full">
                Khu → Dãy → Ô
              </span>
            </div>
            {onOpenManageStructure && (
              <button
                onClick={onOpenManageStructure}
                className="text-xs font-bold text-[#15803d] hover:text-[#166534] hover:underline flex items-center gap-1.5 transition-colors"
              >
                <span>⚙️</span>
                <span>Quản lý & Thêm Khu</span>
              </button>
            )}
          </div>

          <p className="text-xs text-slate-500 font-medium">
            💡 Bấm vào bất kỳ ô thẻ phân khu bên dưới để <strong>đi vào bên trong</strong> quản lý chi tiết từng Dãy chuồng và từng Ô chuồng.
          </p>

          {/* LƯỚI / DANH SÁCH CÁC Ô PHÂN KHU HIỂN THỊ SỐ LIỆU SƠ LƯỢC REAL-TIME */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 pt-1">
            {areas.map((area) => {
              // Tìm tất cả các ô chuồng thuộc phân khu này (dựa trên areaId hoặc areaCode hoặc areaKind)
              const areaCages = cages.filter(c => 
                c.areaId === area.id || 
                (c.areaCode && area.code && c.areaCode === area.code) ||
                (!c.areaId && c.areaKind === area.kind)
              );
              // Tìm các dãy thuộc phân khu này (dựa trên areaId hoặc rowId xuất hiện trong cages)
              const directAreaRows = rows.filter(r => r.areaId === area.id);
              const distinctRowKeysFromCages = new Set(
                areaCages.map(c => c.rowId || c.rowCode).filter(Boolean)
              );
              const areaRowCount = Math.max(
                directAreaRows.length, 
                distinctRowKeysFromCages.size, 
                (directAreaRows.length > 0 ? directAreaRows.length : (area.rowCount || 0))
              );
              const areaCageCount = areaCages.length;
              const emptyCageCount = areaCages.filter(c => c.status === 'trong').length;
              const occupiedCageCount = areaCages.filter(c => c.status !== 'trong' && (c.ratCount || 0) > 0).length;
              const occupancyRate = areaCageCount > 0 ? Math.round((occupiedCageCount / areaCageCount) * 100) : 0;

              const icon = area.kind === 'sinh_san' ? '🐾' : area.kind === 'baby' ? '🍼' : area.kind === 'hau_bi' ? '🌟' : area.kind === 'thuong_pham' ? '🥩' : area.kind === 'dieu_tri' ? '🏥' : '🏡';

              // Tính toán chi tiết số liệu từng khu dựa theo loại khu
              const renderAreaDetailedStats = () => {
                if (area.kind === 'sinh_san' || area.name.toLowerCase().includes('sinh sản')) {
                  // Thống kê Khu Sinh Sản
                  const maleCount = areaCages.filter(c => c.status !== 'trong' && (c.gender === 'duc' || c.status === 'duc_giong' || c.status === 'ghep_doi')).length;
                  const femaleCount = areaCages.filter(c => c.status !== 'trong' && (c.gender === 'cai' || c.gender === 'doi' || c.status === 'ghep_doi' || c.status === 'dang_nuoi_con')).length;
                  const nursingMoms = areaCages.filter(c => c.status === 'dang_nuoi_con').length;
                  const nursingBabies = areaCages
                    .filter(c => c.status === 'dang_nuoi_con')
                    .reduce((sum, c) => sum + (c.livingBabyCount || c.totalBornCount || 0), 0);
                  const matingOrWaiting = areaCages.filter(c => 
                    c.status === 'ghep_doi' || 
                    c.status === 'moi_tach_duc' || 
                    c.status === 'moi_tach_duc_khong_ro' || 
                    c.status === 'moi_tach_con' || 
                    c.status === 'moi_tach_cai'
                  ).length;

                  return (
                    <div className="space-y-1.5 text-[11px]">
                      <div className="flex items-center justify-between gap-1 text-slate-600">
                        <span className="flex items-center gap-1">
                          <span className="text-blue-600 font-bold">♂ {maleCount} Đực</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-pink-600 font-bold">♀ {femaleCount} Cái</span>
                        </span>
                        <span className="text-slate-500 font-medium">Trống: <b className="text-slate-700">{emptyCageCount}</b></span>
                      </div>

                      <div className="flex items-center justify-between gap-1 bg-emerald-50/70 text-emerald-800 px-2 py-1 rounded-lg border border-emerald-100/80">
                        <span className="font-semibold flex items-center gap-1">
                          <span>🦔</span>
                          <span>Đang nuôi con: <b>{nursingMoms} mẹ</b></span>
                        </span>
                        <span className="text-[10.5px] font-bold bg-white text-emerald-700 px-1.5 py-0.5 rounded shadow-2xs">
                          🍼 {nursingBabies} con non
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-slate-500 text-[10.5px]">
                        <span>⏳ Ghép đôi & Dưỡng: <b className="text-amber-700">{matingOrWaiting} ô</b></span>
                        <span>Đang nuôi: <b className="text-slate-700">{occupiedCageCount}/{areaCageCount} ô</b></span>
                      </div>
                    </div>
                  );
                }

                if (area.kind === 'baby' || area.name.toLowerCase().includes('baby')) {
                  // Thống kê Khu Baby chi tiết theo 3 nhóm trọng lượng
                  const occupiedBabyCages = areaCages.filter(c => c.status !== 'trong');
                  const totalBabies = occupiedBabyCages.reduce((sum, c) => sum + (c.ratCount || 1), 0);
                  
                  const b34Count = occupiedBabyCages
                    .filter(c => c.babyGroup === '3_4_lang' || ((c.currentWeightKg || 0) > 0 && (c.currentWeightKg || 0) <= 0.45))
                    .reduce((sum, c) => sum + (c.ratCount || 1), 0);

                  const b57Count = occupiedBabyCages
                    .filter(c => c.babyGroup === '5_7_lang' || ((c.currentWeightKg || 0) > 0.45 && (c.currentWeightKg || 0) <= 0.75))
                    .reduce((sum, c) => sum + (c.ratCount || 1), 0);

                  const b811Count = occupiedBabyCages
                    .filter(c => c.babyGroup === '8_lang_1_1_kg' || (c.currentWeightKg || 0) > 0.75)
                    .reduce((sum, c) => sum + (c.ratCount || 1), 0);

                  const readyToMoveCages = areaCages.filter(c => c.status === 'dat_dieu_kien_chuyen');
                  const readyToMoveCount = readyToMoveCages.reduce((sum, c) => sum + (c.ratCount || 1), 0);

                  return (
                    <div className="space-y-1.5 text-[11px]">
                      <div className="flex items-center justify-between gap-1 text-slate-600">
                        <span className="text-sky-700 font-bold flex items-center gap-1">
                          <span>🍼</span>
                          <span>Tổng: <b>{totalBabies} con</b></span>
                        </span>
                        <span className="text-slate-500 font-medium">Trống: <b className="text-slate-700">{emptyCageCount} ô</b></span>
                      </div>

                      {/* Phân bổ 3 nhóm trọng lượng baby */}
                      <div className="grid grid-cols-3 gap-1 text-center text-[10px] py-1 px-1 bg-sky-50/70 rounded-lg border border-sky-100">
                        <div>
                          <span className="text-slate-500 block text-[9px]">3–4 lạng</span>
                          <b className="text-teal-700 font-mono">{b34Count}c</b>
                        </div>
                        <div className="border-x border-sky-200/60">
                          <span className="text-slate-500 block text-[9px]">5–7 lạng</span>
                          <b className="text-blue-700 font-mono">{b57Count}c</b>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[9px]">8l–1.1kg</span>
                          <b className="text-indigo-700 font-mono">{b811Count}c</b>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-slate-500 text-[10.5px]">
                        <span>Đạt chuẩn chuyển: <b className="text-sky-800">{readyToMoveCount} con</b></span>
                        <span>Đang dùng: <b className="text-slate-700">{occupiedCageCount}/{areaCageCount} ô</b></span>
                      </div>
                    </div>
                  );
                }

                if (area.kind === 'hau_bi' || area.name.toLowerCase().includes('hậu bị')) {
                  // Thống kê Khu Hậu bị (Tự động cập nhật Đực & Cái)
                  const totalHauBi = areaCages
                    .filter(c => c.status !== 'trong')
                    .reduce((sum, c) => sum + (c.ratCount || 1), 0);
                  const maleHBCages = areaCages.filter(c => c.gender === 'duc' && c.status !== 'trong');
                  const femaleHBCages = areaCages.filter(c => (c.gender === 'cai' || !c.gender) && c.status !== 'trong');
                  
                  const maleHB = maleHBCages.reduce((sum, c) => sum + (c.ratCount || 1), 0);
                  const femaleHB = femaleHBCages.reduce((sum, c) => sum + (c.ratCount || 1), 0);
                  
                  const readyBreedCagesList = areaCages.filter(c => 
                    (c.status === 'dat_dieu_kien' || c.hauBiPassed === true || (c.gender === 'duc' ? ((c.currentWeightKg || 0) >= 2.0) : ((c.currentWeightKg || 0) >= 1.8))) && 
                    c.status !== 'trong'
                  );
                  const readyBreedCount = readyBreedCagesList.reduce((sum, c) => sum + (c.ratCount || 1), 0);
                  const readyBreedCages = readyBreedCagesList.length;

                  return (
                    <div className="space-y-2 text-[11px]">
                      <div className="flex items-center justify-between gap-1 text-slate-600">
                        <span className="text-purple-900 font-bold flex items-center gap-1">
                          <span>🌟</span>
                          <span>Tổng: <b className="text-purple-950 font-mono text-xs">{totalHauBi} con</b></span>
                        </span>
                        <span className="flex items-center gap-1.5 text-[10.5px]">
                          <span className="text-blue-700 font-bold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                            ♂ {maleHB} Đực ({maleHBCages.length} ô)
                          </span>
                          <span className="text-pink-700 font-bold bg-pink-50 px-1.5 py-0.5 rounded border border-pink-200">
                            ♀ {femaleHB} Cái ({femaleHBCages.length} ô)
                          </span>
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-1 bg-emerald-50/80 text-emerald-900 px-2 py-1 rounded-lg border border-emerald-200">
                        <span className="font-semibold flex items-center gap-1">
                          <span>★</span>
                          <span>Đạt chuẩn ghép F1:</span>
                        </span>
                        <span className="text-[10.5px] font-bold bg-white text-emerald-700 px-1.5 py-0.5 rounded shadow-2xs border border-emerald-100 font-mono">
                          {readyBreedCount} con ({readyBreedCages} ô)
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-slate-500 text-[10.5px]">
                        <span>Trống: <b className="text-slate-700">{emptyCageCount} ô</b></span>
                        <span>Đang dùng: <b className="text-slate-700">{occupiedCageCount}/{areaCageCount} ô</b></span>
                      </div>
                    </div>
                  );
                }

                if (area.kind === 'thuong_pham' || area.name.toLowerCase().includes('thương phẩm')) {
                  // Thống kê Khu Thương phẩm
                  const totalCommercial = areaCages
                    .filter(c => c.status !== 'trong' && c.status !== 'da_xuat')
                    .reduce((sum, c) => sum + (c.ratCount || 1), 0);
                  const readyWeightCages = areaCages.filter(c => c.status === 'dat_trong_luong' || c.status === 'cho_xuat').length;
                  const exportedTotal = areaCages.reduce((sum, c) => sum + (c.exportedCount || (c.status === 'da_xuat' ? (c.ratCount || 1) : 0)), 0);

                  return (
                    <div className="space-y-1.5 text-[11px]">
                      <div className="flex items-center justify-between gap-1 text-slate-600">
                        <span className="text-amber-800 font-bold flex items-center gap-1">
                          <span>🥩</span>
                          <span>Nuôi thịt: <b>{totalCommercial} con</b></span>
                        </span>
                        <span className="text-slate-500 font-medium">Trống: <b className="text-slate-700">{emptyCageCount}</b></span>
                      </div>

                      <div className="flex items-center justify-between gap-1 bg-amber-50/80 text-amber-900 px-2 py-1 rounded-lg border border-amber-100">
                        <span className="font-semibold flex items-center gap-1">
                          <span>⚖️</span>
                          <span>Đạt trọng lượng / Chờ xuất:</span>
                        </span>
                        <span className="text-[10.5px] font-bold bg-white text-amber-800 px-1.5 py-0.5 rounded shadow-2xs">
                          {readyWeightCages} ô
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-slate-500 text-[10.5px]">
                        <span>Đã xuất bán: <b className="text-emerald-700">{exportedTotal} con</b></span>
                        <span>Đang dùng: <b className="text-slate-700">{occupiedCageCount}/{areaCageCount} ô</b></span>
                      </div>
                    </div>
                  );
                }

                if (area.kind === 'dieu_tri' || area.name.toLowerCase().includes('điều trị') || area.name.toLowerCase().includes('cách ly')) {
                  // Thống kê Khu Điều trị / Cách ly
                  const treatingCages = areaCages.filter(c => c.status === 'dang_dieu_tri').length;
                  const monitoringCages = areaCages.filter(c => c.status === 'theo_doi').length;
                  const recoveredCages = areaCages.filter(c => c.status === 'da_khoi').length;
                  const deathCages = areaCages.filter(c => c.status === 'chet').length;

                  return (
                    <div className="space-y-1.5 text-[11px]">
                      <div className="flex items-center justify-between gap-1 text-slate-600">
                        <span className="text-rose-700 font-bold flex items-center gap-1">
                          <span>🏥</span>
                          <span>Đang trị: <b>{treatingCages} ô</b></span>
                        </span>
                        <span className="text-amber-700 font-medium">Theo dõi: <b>{monitoringCages} ô</b></span>
                      </div>

                      <div className="flex items-center justify-between gap-1 bg-rose-50/80 text-rose-900 px-2 py-1 rounded-lg border border-rose-100">
                        <span className="font-semibold flex items-center gap-1">
                          <span>💚</span>
                          <span>Đã khỏi bệnh:</span>
                        </span>
                        <span className="text-[10.5px] font-bold bg-white text-emerald-700 px-1.5 py-0.5 rounded shadow-2xs">
                          {recoveredCages} ca khỏi
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-slate-500 text-[10.5px]">
                        <span>Ca tử vong: <b className="text-slate-700">{deathCages}</b></span>
                        <span>Trống: <b className="text-slate-700">{emptyCageCount} ô</b></span>
                      </div>
                    </div>
                  );
                }

                // Mặc định cho phân khu khác
                return (
                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Đang nuôi: <b className="text-slate-900">{occupiedCageCount} ô</b></span>
                      <span>Trống: <b className="text-slate-500">{emptyCageCount} ô</b></span>
                    </div>
                    <div className="text-slate-500 text-[10.5px]">
                      Lấp đầy: <b className="text-emerald-700">{occupancyRate}%</b>
                    </div>
                  </div>
                );
              };

              return (
                <div
                  key={area.id}
                  onClick={() => onSelectArea(area.id)}
                  className="p-4 rounded-2xl transition-all cursor-pointer border flex flex-col justify-between select-none relative overflow-hidden bg-white hover:bg-emerald-50/30 border-slate-200 hover:border-emerald-500 hover:shadow-md group"
                >
                  <div>
                    {/* Header của ô Khu - Rộng rãi trọn vẹn tên khu không bị khuyết */}
                    <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <span className="text-xl p-1.5 rounded-xl bg-slate-100/80 border border-slate-200/60 leading-none shrink-0">
                          {icon}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="text-sm font-bold leading-snug text-slate-900 group-hover:text-[#15803d] transition-colors">
                              {area.name}
                            </h3>
                          </div>
                          <p className="text-[11px] text-slate-400 font-medium">
                            {area.kindLabel || 'Phân khu'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Phần thân: Dòng Dãy - Ô nằm ngay trên phần thông số đực/cái + Sơ lược số liệu */}
                    <div className="py-2.5 space-y-2">
                      {/* Dòng Dãy • Ô hiển thị rõ ràng không bị xuống dòng ngắt quãng */}
                      <div className="flex items-center justify-between text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-slate-100/90 text-slate-700 border border-slate-200/80 gap-1.5">
                        <div className="flex items-center gap-1.5 whitespace-nowrap shrink-0">
                          <span className="text-slate-500 font-normal">Quy mô:</span>
                          <span className="font-bold text-slate-900 font-mono">{areaRowCount} Dãy</span>
                          <span className="text-slate-400">•</span>
                          <span className="font-bold text-slate-900 font-mono">{areaCageCount} Ô</span>
                        </div>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap shrink-0 ${
                          emptyCageCount > 0 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {emptyCageCount > 0 ? `Còn ${emptyCageCount} ô trống` : 'Đã hết ô trống'}
                        </span>
                      </div>

                      {/* Chi tiết số liệu (Đực, Cái, Đang nuôi con, Con non...) */}
                      {renderAreaDetailedStats()}
                    </div>
                  </div>

                  <div>
                    {/* Thanh tiến độ lấp đầy trực quan */}
                    <div className="pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium mb-1">
                        <span>Tỷ lệ lấp đầy ({occupiedCageCount}/{areaCageCount} ô)</span>
                        <span className="font-bold text-slate-700">{occupancyRate}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            occupancyRate >= 90 
                              ? 'bg-rose-500' 
                              : occupancyRate >= 60 
                              ? 'bg-[#15803d]' 
                              : 'bg-amber-500'
                          }`}
                          style={{ width: `${Math.min(100, Math.max(0, occupancyRate))}%` }}
                        />
                      </div>
                    </div>

                    {/* Nút hành động vào xem chi tiết dãy & ô */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#15803d] group-hover:text-[#166534]">
                      <span>Vào quản lý Dãy & Ô</span>
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* NỘI DUNG BÊN TRONG PHÂN KHU (CHỈ HIỂN THỊ KHI ĐÃ BẤM VÀO MỘT KHU) */}
      {currentArea && (
        <>
          {/* THANH ĐIỀU HƯỚNG QUAY LẠI & CHUYỂN KHU NHANH */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-3.5 sm:px-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-3 shrink-0 flex-wrap">
              <button
                onClick={() => onSelectArea(undefined)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs group cursor-pointer"
                title="Quay lại danh sách các phân khu"
              >
                <span className="text-emerald-700 group-hover:-translate-x-0.5 transition-transform font-bold text-sm">←</span>
                <span>Tất cả Phân khu</span>
              </button>

              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span>/</span>
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  <span>{currentArea.kind === 'sinh_san' ? '🐾' : currentArea.kind === 'baby' ? '🍼' : currentArea.kind === 'hau_bi' ? '🌟' : currentArea.kind === 'thuong_pham' ? '🥩' : currentArea.kind === 'dieu_tri' ? '🏥' : '🏡'}</span>
                  <span>{currentArea.name}</span>
                </span>
              </div>
            </div>

            {/* Chuyển nhanh giữa các khu khác - Tự động xuống dòng khi nhiều khu để thấy trọn vẹn tên tất cả các khu */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-slate-400 font-medium shrink-0 mr-0.5">Chuyển khu:</span>
              {areas.map(a => (
                <button
                  key={a.id}
                  onClick={() => onSelectArea(a.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    a.id === currentArea.id
                      ? 'bg-[#15803d] text-white shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {a.name}
                </button>
              ))}
            </div>
          </div>

          {/* 1. HEADER KHU CHUỒNG TRẠI (KHỚP 100% HÌNH THAM CHIẾU) */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Bên trái: Icon, Tên Khu, Badge, Mô tả */}
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-xl">
                  {currentArea.kind === 'sinh_san' ? '🐾' : currentArea.kind === 'baby' ? '🍼' : currentArea.kind === 'hau_bi' ? '🌟' : currentArea.kind === 'thuong_pham' ? '🥩' : currentArea.kind === 'dieu_tri' ? '🏥' : '🏡'}
                </span>
                <h1 className="text-lg sm:text-xl font-bold text-slate-900">{currentArea.name}</h1>
                <span className="bg-[#f0fdf4] text-[#166534] border border-[#bbf7d0] text-xs font-semibold px-2.5 py-0.5 rounded-md">
                  {currentArea.kindLabel || 'Sinh sản'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {currentArea.description || 'Khu sinh sản phối ghép, mang thai và nuôi con dòng Dúi Mốc Đại'}
              </p>
            </div>

            {/* Bên phải: 4 Nút hành động chuẩn */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Nút Thẻ QR Khu */}
              <button
                onClick={() => onOpenAreaQR(currentArea)}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
              >
                <span>📱</span>
                <span>Thẻ QR Khu</span>
              </button>

              {userRole === 'admin' ? (
                <>
                  {/* Nút + Thêm Dãy (Xanh lá đậm #15803d) */}
                  <button
                    onClick={() => handleOpenAddRowModal('cai')}
                    className="px-4 py-2 rounded-xl bg-[#15803d] hover:bg-[#166534] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                  >
                    <span>+</span>
                    <span>Thêm Dãy</span>
                  </button>

                  {/* Nút Sửa Khu */}
                  <button
                    onClick={handleOpenEditArea}
                    className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                  >
                    <span>✏️</span>
                    <span>Sửa Khu</span>
                  </button>

                  {/* Nút Xóa Khu (Đỏ #dc2626) */}
                  <button
                    onClick={() => setAreaToDelete(currentArea)}
                    className="px-3.5 py-2 rounded-xl bg-[#dc2626] hover:bg-[#b91c1c] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                  >
                    <span>🗑️</span>
                    <span>Xóa Khu</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => onOpenAdminLogin?.('Quản lý phân khu, dãy chuồng và ô nuôi yêu cầu quyền Quản Trị Viên')}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-amber-50 text-slate-600 hover:text-amber-800 text-xs font-semibold flex items-center gap-1.5 border border-slate-200 shadow-2xs cursor-pointer"
                  title="Đăng nhập quản trị để chỉnh sửa cấu trúc chuồng trại"
                >
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Đăng Nhập Quản Trị</span>
                </button>
              )}
            </div>
          </div>

          {/* 2. DANH SÁCH CÁC DÃY CHUỒNG (DÃY CÁI 1, DÃY CÁI 2, DÃY ĐỰC 1...) */}
          <div className="space-y-6">
        {areaRows.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
            <p className="text-slate-500 text-sm">Khu này hiện chưa có dãy chuồng nào.</p>
            <button
              onClick={() => setShowAddRowModal(true)}
              className="px-4 py-2 bg-[#15803d] text-white text-xs font-bold rounded-xl hover:bg-[#166534]"
            >
              + Tạo Dãy Chuồng Đầu Tiên
            </button>
          </div>
        ) : (
          areaRows.map((row) => {
            // Lấy tất cả các ô thuộc Dãy này (kèm tương thích ngược rowId cũ nếu có)
            const rowCages = cages.filter(c => 
              c.rowId === row.id ||
              (c.rowId === 'row-area-ss1-c1' && row.id === 'row-ss1-c1') ||
              (c.rowId === 'row-area-ss1-c2' && row.id === 'row-ss1-c2') ||
              (c.rowId === 'row-area-ss1-d1' && row.id === 'row-ss1-d1') ||
              (c.areaId === currentArea.id && (c.rowCode === row.name || c.rowCode === row.code)) ||
              (c.areaId === currentArea.id && c.code.toUpperCase().startsWith(row.code.toUpperCase()))
            );
            const totalCagesInRow = rowCages.length;

            // Xác định số tầng/hàng của Dãy (mặc định 2 tầng nếu là Cái, 1 tầng nếu là Đực hoặc theo row.tierCount)
            const tierCount = row.tierCount || (row.kind === 'duc' || row.code.includes('DD') ? 1 : 2);

            // Hàm sắp xếp các ô trong Hàng theo đúng thứ tự Vị trí (V1, V2, V3, V4...) và mã số tăng dần
            const sortTierCages = (list: FarmCage[]): FarmCage[] => {
              return [...list].sort((a, b) => {
                // 1. So sánh theo số thứ tự vị trí slotNumber (V1, V2, V3, V4, V10...)
                const numA = a.slotNumber ? parseInt(a.slotNumber.replace(/\D/g, ''), 10) : NaN;
                const numB = b.slotNumber ? parseInt(b.slotNumber.replace(/\D/g, ''), 10) : NaN;

                if (!isNaN(numA) && !isNaN(numB)) {
                  if (numA !== numB) return numA - numB;
                } else if (!isNaN(numA)) {
                  return -1;
                } else if (!isNaN(numB)) {
                  return 1;
                }

                // 2. So sánh theo phần số của mã ô (ví dụ: C1-01, C1-02, BB1-05...)
                const codeNumA = parseInt(a.code.replace(/\D/g, ''), 10);
                const codeNumB = parseInt(b.code.replace(/\D/g, ''), 10);
                if (!isNaN(codeNumA) && !isNaN(codeNumB) && codeNumA !== codeNumB) {
                  return codeNumA - codeNumB;
                }

                // 3. Dự phòng: so sánh chuỗi tự nhiên
                return a.code.localeCompare(b.code, undefined, { numeric: true, sensitivity: 'base' });
              });
            };

            // Phân loại ô theo từng Tầng/Hàng và sắp xếp thứ tự:
            let displayTiers: { tierIndex: number; title: string; cages: FarmCage[] }[] = [];
            if (tierCount === 1) {
              displayTiers = [
                {
                  tierIndex: 1,
                  title: 'HÀNG 1',
                  cages: sortTierCages(rowCages)
                }
              ];
            } else {
              // 2 Tầng: Hàng 1 (Tầng 1) và Hàng 2 (Tầng 2)
              const t1Raw = rowCages.filter(c => (c.tier === 1) || (!c.tier && (c.slotNumber === 'V1' || c.slotNumber === 'V2' || c.slotNumber === 'V3' || rowCages.indexOf(c) < Math.ceil(rowCages.length / 2))));
              const t2Raw = rowCages.filter(c => (c.tier === 2) || (!c.tier && (c.slotNumber === 'V4' || c.slotNumber === 'V5' || c.slotNumber === 'V6' || rowCages.indexOf(c) >= Math.ceil(rowCages.length / 2))));

              displayTiers = [
                {
                  tierIndex: 1,
                  title: 'HÀNG 1 (HÀNG TRÊN / TẦNG 1)',
                  cages: sortTierCages(t1Raw)
                },
                {
                  tierIndex: 2,
                  title: 'HÀNG 2 (HÀNG DƯỚI / TẦNG 2)',
                  cages: sortTierCages(t2Raw)
                }
              ];
            }

            // Giới tính badge
            const isFemaleRow = row.kind === 'cai' || row.name.includes('Cái') || row.code.includes('C');
            const isMaleRow = row.kind === 'duc' || row.name.includes('Đực') || row.code.includes('D');

            return (
              <div
                key={row.id}
                className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-4"
              >
                {/* HEADER DÃY (KHỚP CHÍNH XÁC HÌNH THAM CHIẾU) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2.5 border-b border-slate-100">
                  {/* Left: Tên Dãy + Badge Giới Tính + Thông số hàng/ô */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-sm sm:text-base font-bold text-slate-900">{row.name}</h2>
                    {isFemaleRow ? (
                      <span className="bg-[#fdf2f8] text-[#db2777] border border-[#fbcfe8] text-[11px] font-semibold px-2 py-0.5 rounded-md">
                        ♀ Dãy Cái
                      </span>
                    ) : isMaleRow ? (
                      <span className="bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe] text-[11px] font-semibold px-2 py-0.5 rounded-md">
                        ♂ Dãy Đực
                      </span>
                    ) : (
                      <span className="bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-semibold px-2 py-0.5 rounded-md">
                        Dãy Nuôi
                      </span>
                    )}
                    <span className="text-[11px] text-slate-400 font-medium">
                      {tierCount} Hàng chuồng • Tổng {totalCagesInRow} Ô
                    </span>
                  </div>

                  {/* Right: QR Dãy + Thêm Ô vào Dãy, Sửa Dãy, Xóa Dãy */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onOpenRowQR?.(row, currentArea)}
                      className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-bold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                      title="Xem, phóng to & in thẻ mã QR cho Dãy này"
                    >
                      <QrCode className="w-3.5 h-3.5 text-blue-700" />
                      <span>QR Dãy</span>
                    </button>

                    {userRole === 'admin' ? (
                      <>
                        <button
                          onClick={() => onOpenAddCage({ areaId: currentArea.id, rowId: row.id })}
                          className="px-3 py-1.5 rounded-lg bg-[#15803d] hover:bg-[#166534] text-white text-xs font-bold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                        >
                          <span>+</span>
                          <span>Thêm Ô vào Dãy</span>
                        </button>
                        <button
                          onClick={() => handleOpenEditRow(row)}
                          className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                        >
                          <span>✏️</span>
                          <span>Sửa Dãy</span>
                        </button>
                        <button
                          onClick={() => setRowToDelete(row)}
                          className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-rose-50 hover:text-rose-600 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                        >
                          <span>✕</span>
                          <span>Xóa Dãy</span>
                        </button>
                      </>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-medium px-2 py-0.5 rounded bg-slate-50 border border-slate-100">
                        Chế độ xem
                      </span>
                    )}
                  </div>
                </div>

                {/* THÂN DÃY: HIỂN THỊ THEO TỪNG HÀNG (TẦNG) */}
                <div className="space-y-4">
                  {displayTiers.map((tier) => (
                    <div key={tier.tierIndex} className="space-y-2.5">
                      {/* Tiêu đề Hàng + Nút + Thêm Ô vào Hàng */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-slate-800 tracking-wide uppercase">
                            {tier.title}
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium">
                            {tier.cages.length} Ô
                          </span>
                        </div>
                        {userRole === 'admin' && (
                          <button
                            onClick={() => onOpenAddCage({ areaId: currentArea.id, rowId: row.id, tier: tier.tierIndex })}
                            className="px-2.5 py-0.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 text-[11px] font-medium flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                          >
                            <span>+</span>
                            <span>Thêm Ô vào {tier.title.split(' ')[0]} {tier.tierIndex}</span>
                          </button>
                        )}
                      </div>

                      {/* LƯỚI CÁC THẺ Ô CHUỒNG (ĐÃ THU NHỎ GỌN CÒN 60% KÍCH THƯỚC) */}
                      <div className="flex flex-wrap gap-2 sm:gap-2.5">
                        {tier.cages.length === 0 ? (
                          <div className="w-full py-3 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                            <span className="text-xs text-slate-400 italic">Chưa có ô chuồng trong hàng này</span>
                          </div>
                        ) : (
                          tier.cages.map((cage) => {
                            const style = getCageCardStyle(cage);
                            const slotDisplay = cage.slotNumber || `V${tier.cages.indexOf(cage) + 1 + (tier.tierIndex === 2 ? 3 : 0)}`;

                            return (
                              <div
                                key={cage.id}
                                onClick={() => onSelectCage(cage)}
                                className={`w-[102px] sm:w-[108px] min-w-[98px] h-[68px] sm:h-[70px] p-1.5 rounded-xl border transition-all cursor-pointer hover:shadow-md flex flex-col justify-between select-none ${style.card}`}
                              >
                                {/* Dòng 1: Mã Ô, Badge Vị Trí, Giới Tính */}
                                <div className="flex items-center justify-between gap-1">
                                  <div className="flex items-center gap-1 min-w-0">
                                    <span className="font-bold text-xs text-slate-900 tracking-tight truncate">
                                      {cage.code}
                                    </span>
                                    <span className="text-[8.5px] font-mono font-bold px-1 py-0.2 rounded bg-white/90 border border-slate-200/80 text-slate-600 shrink-0">
                                      {slotDisplay}
                                    </span>
                                  </div>

                                  {/* Icon Giới Tính */}
                                  {cage.status === 'ghep_doi' ? (
                                    <span className="text-[9px] font-black flex items-center shrink-0 bg-purple-100/90 text-purple-900 px-1 py-0.5 rounded border border-purple-200">
                                      <span className="text-pink-600">♀</span>
                                      <span className="text-blue-600">♂</span>
                                      <span className="ml-0.5 text-[8.5px] font-mono">2</span>
                                    </span>
                                  ) : (cage.status === 'trong' && cage.partnerCageCode) ? (
                                    <span className="text-[9px] font-bold text-pink-600 bg-pink-50 px-1 py-0.5 rounded border border-pink-200 shrink-0" title={`Đang ghép tại ${cage.partnerCageCode}`}>
                                      ♀→
                                    </span>
                                  ) : cage.gender === 'duc' ? (
                                    <span className="text-blue-500 font-bold text-[9.5px] shrink-0">♂</span>
                                  ) : cage.gender === 'cai' ? (
                                    <span className="text-pink-500 font-bold text-[9.5px] shrink-0">♀</span>
                                  ) : cage.areaKind === 'baby' || cage.status === 'dang_nuoi_baby' ? (
                                    <span className="text-sky-600 font-bold text-[9.5px] shrink-0">🍼</span>
                                  ) : (
                                    <span className="text-slate-400 font-bold text-[9.5px] shrink-0">⚥</span>
                                  )}
                                </div>

                                {/* Dòng 2 & 3: Trạng thái & Ghi chú thông số */}
                                <div className="space-y-0.5 min-w-0">
                                  <p className={`text-[10px] font-bold truncate leading-tight ${style.statusText}`}>
                                    {cage.status === 'trong' && (cage.partnerCageCode || cage.statusLabel?.includes('chuyển ghép'))
                                      ? 'Trống do chuyển ghép'
                                      : cage.statusLabel}
                                  </p>
                                  <p className="text-[8.5px] truncate leading-tight">
                                    {renderCageSubtitle(cage)}
                                  </p>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
        </>
      )}

      {/* MODAL 1: SỬA KHU */}
      {showEditAreaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Chỉnh Sửa Thông Tin Phân Khu</h3>
              <button onClick={() => setShowEditAreaModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveEditArea} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tên Phân Khu</label>
                <input
                  type="text"
                  value={editAreaName}
                  onChange={(e) => setEditAreaName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium"
                  required
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Mô tả phân khu</label>
                <textarea
                  value={editAreaDesc}
                  onChange={(e) => setEditAreaDesc(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditAreaModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#15803d] text-white font-bold hover:bg-[#166534]"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: THÊM DÃY MỚI VÀO KHU */}
      {showAddRowModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Thêm Dãy Chuồng Mới Vào {currentArea?.name || ''}</h3>
              <button onClick={() => setShowAddRowModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveAddRow} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">1. Phân loại Dãy</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectRowKind('cai')}
                    className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                      newRowKind === 'cai' ? 'bg-[#fdf2f8] border-[#f472b6] text-[#db2777]' : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    ♀ Dãy Cái
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectRowKind('duc')}
                    className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                      newRowKind === 'duc' ? 'bg-[#eff6ff] border-[#60a5fa] text-[#2563eb]' : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    ♂ Dãy Đực
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectRowKind('chung')}
                    className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                      newRowKind === 'chung' ? 'bg-emerald-50 border-emerald-400 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    Chung / Khác
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">2. Tên Dãy</label>
                <input
                  type="text"
                  placeholder="VD: Dãy Cái 3, Dãy Đực 2..."
                  value={newRowName}
                  onChange={(e) => setNewRowName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">3. Mã Dãy (Quy định mã ô chuồng con)</label>
                <input
                  type="text"
                  placeholder="VD: DC3, DĐ2..."
                  value={newRowCode}
                  onChange={(e) => setNewRowCode(e.target.value.toUpperCase())}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-mono font-bold uppercase text-emerald-950"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">4. Số tầng / Hàng chuồng</label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="tierCount"
                      checked={newRowTierCount === 2}
                      onChange={() => setNewRowTierCount(2)}
                      className="text-[#15803d]"
                    />
                    <span>2 Tầng (Hàng Trên & Hàng Dưới)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="tierCount"
                      checked={newRowTierCount === 1}
                      onChange={() => setNewRowTierCount(1)}
                      className="text-[#15803d]"
                    />
                    <span>1 Tầng (Đơn hàng)</span>
                  </label>
                </div>
              </div>

              {/* Xem trước mã ô chuồng tự sinh */}
              <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                <span className="text-[10px] font-bold text-emerald-800 uppercase block">
                  ✨ Tự động đồng bộ mã ô chuồng con:
                </span>
                <p className="font-mono text-xs font-bold text-emerald-900">
                  {newRowCode ? `${newRowCode}-H1-001, ${newRowCode}-H1-002, ${newRowCode}-H1-003...` : 'DĐ1-H1-001...'}
                </p>
                <p className="text-[11px] text-emerald-700">
                  Khi tạo ô mới trong dãy này, mã ô sẽ tự sinh theo đúng chuẩn ({newRowKind === 'duc' ? 'DĐ... cho đực' : 'DC... cho cái'}).
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddRowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#15803d] text-white font-bold hover:bg-[#166534]"
                >
                  + Thêm Dãy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: SỬA DÃY */}
      {editingRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Chỉnh Sửa Dãy Chuồng: {editingRow.name}</h3>
              <button onClick={() => setEditingRow(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveEditRow} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tên Dãy</label>
                <input
                  type="text"
                  value={editRowName}
                  onChange={(e) => setEditRowName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Phân loại Dãy</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditRowKind('cai')}
                    className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                      editRowKind === 'cai' ? 'bg-[#fdf2f8] border-[#f472b6] text-[#db2777]' : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    ♀ Dãy Cái
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditRowKind('duc')}
                    className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                      editRowKind === 'duc' ? 'bg-[#eff6ff] border-[#60a5fa] text-[#2563eb]' : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    ♂ Dãy Đực
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditRowKind('chung')}
                    className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                      editRowKind === 'chung' ? 'bg-emerald-50 border-emerald-400 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    Chung / Khác
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Số tầng / Hàng chuồng</label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="editTierCount"
                      checked={editRowTierCount === 2}
                      onChange={() => setEditRowTierCount(2)}
                      className="text-[#15803d]"
                    />
                    <span>2 Tầng (Hàng Trên & Hàng Dưới)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="editTierCount"
                      checked={editRowTierCount === 1}
                      onChange={() => setEditRowTierCount(1)}
                      className="text-[#15803d]"
                    />
                    <span>1 Tầng (Đơn hàng)</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingRow(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#15803d] text-white font-bold hover:bg-[#166534]"
                >
                  Lưu cập nhật
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal Sửa Thông Tin Ô Chuồng */}
      {editingCage && (
        <EditCageModal
          cage={editingCage}
          allAreas={areas}
          allCages={cages}
          onClose={() => setEditingCage(null)}
          onSave={(updatedCage, secondCageUpdate) => {
            if (onEditCage) {
              onEditCage(updatedCage, secondCageUpdate);
            }
            setEditingCage(null);
          }}
        />
      )}

      {/* MODAL XÁC NHẬN XÓA Ô CHUỒNG (ĐẢM BẢO CHẠY 100% TRONG IFRAME) */}
      {cageToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Xác Nhận Xóa Ô Chuồng</h3>
                <p className="text-xs text-slate-500 font-mono font-bold text-rose-600">
                  Mã ô: {cageToDelete.code}
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-slate-700 space-y-2">
              <p className="font-semibold text-amber-900">
                Bạn có chắc chắn muốn xóa ô chuồng <strong className="font-mono text-amber-950">{cageToDelete.code}</strong> khỏi {currentArea.name}?
              </p>
              <ul className="space-y-1 text-[11px] text-amber-800 list-disc pl-4">
                <li>Mã <strong className="font-mono">{cageToDelete.code}</strong> sẽ chuyển thành <strong>Ô KHUYẾT</strong> trong Dãy này.</li>
                <li>Mã các ô chuồng khác trong Dãy vẫn được <strong>giữ nguyên</strong>.</li>
                <li>Khi bấm <strong>"+ Thêm Ô"</strong>, hệ thống sẽ đề xuất chọn lại mã khuyết này.</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCageToDelete(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteCage}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Xác nhận xóa ô này</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL XÁC NHẬN XÓA DÃY */}
      {rowToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Xác Nhận Xóa Dãy Chuồng</h3>
                <p className="text-xs text-slate-500 font-bold text-rose-600">
                  {rowToDelete.name} ({rowToDelete.code})
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Toàn bộ các ô chuồng thuộc <strong>{rowToDelete.name}</strong> sẽ bị xóa khỏi phân khu {currentArea?.name || ''}. Bạn có muốn tiếp tục?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRowToDelete(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteRow}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Xóa Dãy Chuồng</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL XÁC NHẬN XÓA KHU */}
      {areaToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Xác Nhận Xóa Phân Khu</h3>
                <p className="text-xs text-slate-500 font-bold text-rose-600">
                  {areaToDelete.name} ({areaToDelete.code})
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Xóa phân khu <strong>{areaToDelete.name}</strong> sẽ đồng thời xóa toàn bộ dãy nuôi và các ô chuồng thuộc phân khu này. Thao tác này không thể hoàn tác.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAreaToDelete(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteArea}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Xóa Toàn Bộ Phân Khu</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
