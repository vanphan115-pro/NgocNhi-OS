import React, { useState } from 'react';
import { FarmArea, FarmRow, FarmCage, AreaKind } from './farmTypes';
import { createStandardBreedingAreaStructure } from './farmData';
import { X, Plus, Trash2, Edit3, Building2, Layers, Grid3X3, Check, AlertTriangle, Sparkles } from 'lucide-react';

interface ManageStructureModalProps {
  areas: FarmArea[];
  rows: FarmRow[];
  cages: FarmCage[];
  onClose: () => void;
  onAddArea: (newArea: FarmArea) => void;
  onEditArea?: (area: FarmArea) => void;
  onDeleteArea: (areaId: string) => void;
  onAddRow: (areaId: string, rowName: string, rowCode: string, kind?: 'cai' | 'duc' | 'chung', tierCount?: number) => void;
  onDeleteRow: (rowId: string) => void;
  onAddFullBreedingStructure?: (area: FarmArea, rows: FarmRow[], cages: FarmCage[]) => void;
}

export const ManageStructureModal: React.FC<ManageStructureModalProps> = ({
  areas,
  rows,
  cages,
  onClose,
  onAddArea,
  onEditArea,
  onDeleteArea,
  onAddRow,
  onDeleteRow,
  onAddFullBreedingStructure
}) => {
  const [activeTab, setActiveTab] = useState<'areas' | 'rows'>('areas');
  const [selectedAreaId, setSelectedAreaId] = useState<string>(areas[0]?.id || '');

  // Form Thêm Khu
  const [newAreaName, setNewAreaName] = useState('');
  const [newAreaCode, setNewAreaCode] = useState('');
  const [newAreaKind, setNewAreaKind] = useState<AreaKind>('sinh_san');
  const [newAreaDesc, setNewAreaDesc] = useState('');

  // Form Thêm Dãy
  const [newRowName, setNewRowName] = useState('');
  const [newRowCode, setNewRowCode] = useState('');
  const [newRowKind, setNewRowKind] = useState<'cai' | 'duc' | 'chung'>('cai');
  const [newRowTierCount, setNewRowTierCount] = useState<number>(2);

  // State cho Xác Nhận Xóa
  const [areaToDelete, setAreaToDelete] = useState<FarmArea | null>(null);
  const [rowToDelete, setRowToDelete] = useState<FarmRow | null>(null);

  const currentArea = areas.find(a => a.id === selectedAreaId) || areas[0];
  const areaRows = rows.filter(r => r.areaId === currentArea?.id);

  const handleCreateArea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAreaName.trim() || !newAreaCode.trim()) return;

    const areaId = `area-${Date.now()}`;
    const areaCode = newAreaCode.trim().toUpperCase();
    const areaName = newAreaName.trim();

    if (newAreaKind === 'sinh_san') {
      // Tự động tạo trọn gói Cấu Trúc Khu Sinh Sản Chuẩn (3 Dãy, 2 Tầng, 12 Ô)
      const standard = createStandardBreedingAreaStructure(
        areaId,
        areaCode,
        areaName,
        newAreaDesc.trim() || `Khu sinh sản phối ghép, mang thai và nuôi con dòng Dúi Mốc Đại`
      );

      if (onAddFullBreedingStructure) {
        onAddFullBreedingStructure(standard.area, standard.rows, standard.cages);
      } else {
        onAddArea(standard.area);
        standard.rows.forEach(r => onAddRow(r.areaId, r.name, r.code, r.kind, r.tierCount));
      }
    } else {
      const kindLabels: Record<AreaKind, string> = {
        sinh_san: 'Sinh sản',
        baby: 'Baby',
        hau_bi: 'Hậu bị',
        thuong_pham: 'Thương phẩm',
        dieu_tri: 'Điều trị'
      };

      const newArea: FarmArea = {
        id: areaId,
        code: areaCode,
        name: areaName,
        kind: newAreaKind,
        kindLabel: kindLabels[newAreaKind] || 'Phân khu',
        rowCount: 1,
        totalCages: 0,
        occupiedCages: 0,
        occupancyRate: 0,
        image: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=600&q=80',
        description: newAreaDesc.trim() || `Phân khu ${areaName}`
      };

      onAddArea(newArea);
      onAddRow(newArea.id, 'Dãy 1', 'D1', 'chung', 1);
    }

    setNewAreaName('');
    setNewAreaCode('');
    setNewAreaDesc('');
  };

  const handleCreateRow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRowName.trim() || !newRowCode.trim() || !currentArea) return;

    onAddRow(currentArea.id, newRowName.trim(), newRowCode.trim().toUpperCase(), newRowKind, newRowTierCount);
    setNewRowName('');
    setNewRowCode('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Quản Lý Cấu Trúc Trại (Khu → Dãy)</h3>
              <p className="text-xs text-slate-500">Tùy chỉnh phân khu, dãy chuồng và cấu trúc chuẩn</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-200 text-slate-400 hover:text-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab chuyển đổi */}
        <div className="flex border-b border-slate-100 bg-slate-50/50 px-4 pt-2 gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('areas')}
            className={`px-4 py-2 rounded-t-xl border-t border-x transition-all flex items-center gap-1.5 ${
              activeTab === 'areas'
                ? 'bg-white border-slate-200 text-emerald-800 shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>1. Danh Sách Phân Khu ({areas.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('rows')}
            className={`px-4 py-2 rounded-t-xl border-t border-x transition-all flex items-center gap-1.5 ${
              activeTab === 'rows'
                ? 'bg-white border-slate-200 text-emerald-800 shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>2. Danh Sách Dãy Chuồng ({rows.length})</span>
          </button>
        </div>

        {/* Nội dung Tab */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
          {activeTab === 'areas' && (
            <div className="space-y-4">
              {/* Form Thêm Khu mới */}
              <form onSubmit={handleCreateArea} className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-900 text-xs flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm Phân Khu Mới</span>
                  </span>
                  {newAreaKind === 'sinh_san' && (
                    <span className="text-[11px] text-emerald-700 bg-emerald-100 font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Tự động tạo Cấu trúc chuẩn 3 Dãy (12 Ô)
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Tên khu (VD: Khu Sinh sản 2)"
                    value={newAreaName}
                    onChange={e => setNewAreaName(e.target.value)}
                    required
                    className="px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Mã khu (VD: KHU-SS2)"
                    value={newAreaCode}
                    onChange={e => setNewAreaCode(e.target.value)}
                    required
                    className="px-3 py-2 rounded-xl border border-slate-300 bg-white uppercase font-mono"
                  />
                  <select
                    value={newAreaKind}
                    onChange={e => setNewAreaKind(e.target.value as AreaKind)}
                    className="px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium"
                  >
                    <option value="sinh_san">Khu Sinh sản (Chuẩn 3 dãy / 12 ô)</option>
                    <option value="baby">Khu Nuôi Baby</option>
                    <option value="hau_bi">Khu Hậu bị</option>
                    <option value="thuong_pham">Khu Thương phẩm</option>
                    <option value="dieu_tri">Khu Điều trị Thú y</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Mô tả chức năng phân khu..."
                    value={newAreaDesc}
                    onChange={e => setNewAreaDesc(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold whitespace-nowrap shadow-xs"
                  >
                    + Tạo Khu Mới
                  </button>
                </div>
              </form>

              {/* Danh sách các khu hiện có */}
              <div className="space-y-2">
                <span className="font-bold text-slate-700 block">Các Phân Khu Hiện Có Trong Trại:</span>
                <div className="grid grid-cols-1 gap-2">
                  {areas.map(area => {
                    const areaCagesCount = cages.filter(c => c.areaId === area.id).length;
                    const areaRowsCount = rows.filter(r => r.areaId === area.id).length;

                    return (
                      <div
                        key={area.id}
                        className="p-3 rounded-2xl border border-slate-200 bg-white flex items-center justify-between hover:border-slate-300 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-mono font-bold text-xs">
                            {area.code}
                          </span>
                          <div>
                            <strong className="text-slate-900 text-xs font-bold block">{area.name}</strong>
                            <span className="text-[11px] text-slate-500">
                              Loại: <span className="font-semibold text-emerald-700">{area.kindLabel}</span> • {areaRowsCount} dãy • {areaCagesCount} ô chuồng
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedAreaId(area.id);
                              setActiveTab('rows');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px]"
                          >
                            Xem Dãy
                          </button>
                          {areas.length > 1 && (
                            <button
                              onClick={() => setAreaToDelete(area)}
                              className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                              title="Xóa khu"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rows' && (
            <div className="space-y-4">
              {/* Chọn khu để quản lý dãy */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-700 text-xs">Chọn Khu Quản Lý:</span>
                <select
                  value={selectedAreaId}
                  onChange={e => setSelectedAreaId(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-bold text-xs"
                >
                  {areas.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({a.code})</option>
                  ))}
                </select>
              </div>

              {/* Form Thêm Dãy mới */}
              <form onSubmit={handleCreateRow} className="p-3.5 rounded-2xl bg-sky-50/60 border border-sky-200 space-y-2.5">
                <span className="font-bold text-sky-900 text-xs block flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm Dãy Mới Cho {currentArea?.name}</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <input
                    type="text"
                    placeholder="Tên dãy (VD: Dãy Cái 3)"
                    value={newRowName}
                    onChange={e => setNewRowName(e.target.value)}
                    required
                    className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Mã dãy (VD: DC3)"
                    value={newRowCode}
                    onChange={e => setNewRowCode(e.target.value)}
                    required
                    className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white uppercase font-mono"
                  />
                  <select
                    value={newRowKind}
                    onChange={e => {
                      const k = e.target.value as 'cai' | 'duc' | 'chung';
                      setNewRowKind(k);
                      setNewRowTierCount(k === 'cai' ? 2 : 1);
                    }}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-medium"
                  >
                    <option value="cai">♀ Dãy Cái (2 Tầng)</option>
                    <option value="duc">♂ Dãy Đực (1 Tầng)</option>
                    <option value="chung">Dãy Chung / Khác</option>
                  </select>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold shadow-xs"
                  >
                    + Thêm Dãy
                  </button>
                </div>
              </form>

              {/* Danh sách dãy của khu */}
              <div className="space-y-2">
                <span className="font-bold text-slate-700 block">Danh Sách Dãy Thuộc {currentArea?.name}:</span>
                <div className="grid grid-cols-1 gap-2">
                  {areaRows.map(row => {
                    const rowCages = cages.filter(c => c.rowId === row.id);
                    return (
                      <div
                        key={row.id}
                        className="p-3 rounded-2xl border border-slate-200 bg-white flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <span className="px-2.5 py-1 rounded-lg bg-sky-100 text-sky-900 font-mono font-bold text-xs">
                            {row.code}
                          </span>
                          <div>
                            <strong className="text-slate-900 text-xs font-bold block">{row.name}</strong>
                            <span className="text-[11px] text-slate-500">
                              {row.genderBadge || (row.kind === 'cai' ? '♀ Dãy Cái' : row.kind === 'duc' ? '♂ Dãy Đực' : 'Dãy Nuôi')} • {row.tierCount || 2} tầng • Đang có {rowCages.length} ô chuồng
                            </span>
                          </div>
                        </div>

                        {areaRows.length > 1 && (
                          <button
                            onClick={() => setRowToDelete(row)}
                            className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                            title="Xóa dãy"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex justify-end bg-slate-50">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs"
          >
            Đóng Cửa Sổ
          </button>
        </div>
      </div>

      {/* Dialog Xác nhận Xóa Khu trong ManageStructureModal */}
      {areaToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Xác Nhận Xóa Khu</h3>
                <p className="text-xs text-slate-500 font-bold text-rose-600">
                  {areaToDelete.name} ({areaToDelete.code})
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-600">
              Bạn có chắc muốn xóa phân khu <strong>{areaToDelete.name}</strong> cùng toàn bộ các ô chuồng bên trong?
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setAreaToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  onDeleteArea(areaToDelete.id);
                  setAreaToDelete(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
              >
                Xác nhận xóa khu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog Xác nhận Xóa Dãy trong ManageStructureModal */}
      {rowToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Xác Nhận Xóa Dãy</h3>
                <p className="text-xs text-slate-500 font-bold text-rose-600">
                  {rowToDelete.name} ({rowToDelete.code})
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-600">
              Bạn có chắc muốn xóa dãy <strong>{rowToDelete.name}</strong> cùng toàn bộ các ô chuồng thuộc dãy này?
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setRowToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  onDeleteRow(rowToDelete.id);
                  setRowToDelete(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
              >
                Xác nhận xóa dãy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
