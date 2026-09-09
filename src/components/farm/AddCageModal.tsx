import React, { useState, useMemo, useEffect } from 'react';
import { FarmArea, FarmRow, FarmCage, CageStatus, DuiSpecies } from './farmTypes';
import { findGapAndNextCageCodes } from './farmData';
import { 
  FarmStatusBusinessForm, 
  BusinessFormData, 
  getStatusOptionsByAreaKind, 
  getCageStatusLabel 
} from './FarmStatusBusinessForm';
import { registerOrRecoverPhysicalLocation } from '../../utils/qrHelper';
import { X, Plus, Sparkles, Check, AlertCircle } from 'lucide-react';

interface AddCageModalProps {
  areas: FarmArea[];
  rows: FarmRow[];
  existingCages: FarmCage[];
  initialAreaId?: string;
  initialRowId?: string;
  initialTier?: number;
  initialCageCode?: string;
  onClose: () => void;
  onAddCage: (newCage: FarmCage) => void;
}

export const AddCageModal: React.FC<AddCageModalProps> = ({
  areas,
  rows,
  existingCages,
  initialAreaId,
  initialRowId,
  initialTier,
  initialCageCode,
  onClose,
  onAddCage
}) => {
  const [selectedAreaId, setSelectedAreaId] = useState<string>(initialAreaId || areas[0]?.id || '');
  const selectedArea = areas.find(a => a.id === selectedAreaId) || areas[0];
  const areaRows = rows.filter(r => r.areaId === selectedArea?.id);

  const [selectedRowId, setSelectedRowId] = useState<string>(
    initialRowId && areaRows.some(r => r.id === initialRowId) ? initialRowId : (areaRows[0]?.id || '')
  );

  const selectedRow = areaRows.find(r => r.id === selectedRowId) || areaRows[0];
  const rowTierCount = selectedRow?.tierCount || 2;

  const [selectedTier, setSelectedTier] = useState<number>(initialTier || 1);
  const [slotNumber, setSlotNumber] = useState<string>('');
  const [cageCode, setCageCode] = useState<string>(initialCageCode || '');
  const [notes, setNotes] = useState<string>('Chuồng mới tạo sạch sẽ');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const todayStr = new Date().toISOString().split('T')[0];

  // Danh sách trạng thái ban đầu khả dụng theo phân khu
  const statusOptions = useMemo(() => {
    return getStatusOptionsByAreaKind(selectedArea?.kind || 'sinh_san');
  }, [selectedArea?.kind]);

  // Form data nghiệp vụ chi tiết
  const [formData, setFormData] = useState<BusinessFormData>({
    status: 'trong',
    ratCount: selectedArea?.kind === 'sinh_san' ? 1 : 4,
    species: 'moc_dai',
    gender: selectedRow?.kind === 'duc' ? 'duc' : selectedArea?.kind === 'sinh_san' ? 'cai' : 'dan',
    
    // Theo dõi chung
    currentWeightKg: selectedArea?.kind === 'sinh_san' ? '1.85' : selectedArea?.kind === 'baby' ? '0.45' : '1.5',
    weightDate: todayStr,
    healthStatus: 'khoe_manh',
    healthDate: todayStr,
    healthSymptoms: '',
    healthNotes: 'Thể trạng tốt, ăn tre khỏe',
    
    // Ghép đôi
    matingDate: todayStr,
    partnerCageCode: '',
    
    // Tách đực / Tách cái
    matingSeparationDate: todayStr,
    followupDurationDays: 60,
    expectedEvaluationDate: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 60);
      return d.toISOString().split('T')[0];
    })(),
    
    // Mới tách con
    weaningDate: todayStr,
    weanedBabyCount: '',
    weanedBabyWeightAvg: '',
    weanedBabyGroup: '3_4_lang',
    targetBabyCageCode: 'BB1-01',
    transferredCount: '',
    transferDate: todayStr,
    
    // Đang nuôi con
    birthDate: todayStr,
    totalBornCount: '',
    livingBabyCount: '',
    abandonedBabyCount: '',
    nursingCondition: 'Mẹ nuôi tốt, sữa đều',
    
    // Baby
    entryDate: todayStr,
    babyGroup: '3_4_lang',
    readyToTransferDate: todayStr,
    
    // Hậu bị
    hauBiEntryDate: todayStr,
    hauBiEvaluationDate: todayStr,
    hauBiPassed: true,
    
    // Thương phẩm
    commercialEntryDate: todayStr,
    readyToExportDate: todayStr,
    exportDate: todayStr,
    exportedCount: '',
    exportedWeightAvg: '',
    
    // Điều trị
    treatmentDiseaseType: 'Viêm phổi / Thở khò khè',
    treatmentDetectionDate: todayStr,
    treatmentTransferDate: todayStr,
    sourceAreaCode: '',
    sourceRowCode: '',
    sourceCageCode: '',
    treatmentProtocol: 'Tiêm bắp 1 lần/ngày x 3 ngày',
    treatmentMedicine: 'Enrofloxacin 10% + B.Complex',
    treatmentDuration: '5 – 7 ngày',
    treatmentNextExamDate: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 5);
      return d.toISOString().split('T')[0];
    })(),
    
    // Theo dõi
    progression: 'Bớt thở khò khè, ăn tre tốt trở lại',
    treatmentFollowupNote: '',
    
    // Khỏi
    recoveryAction: 've_cu',
    recoveryDate: todayStr,
    
    // Chết
    deathDate: todayStr,
    deathCount: '',
    deathReason: 'Suy hô hấp nặng do viêm phổi'
  });

  // Cập nhật khi đổi Phân khu
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      status: 'trong',
      gender: selectedRow?.kind === 'duc' ? 'duc' : selectedArea?.kind === 'sinh_san' ? 'cai' : 'dan',
      ratCount: selectedArea?.kind === 'sinh_san' ? 1 : 4
    }));
  }, [selectedAreaId]);

  // Cập nhật khi đổi Dãy
  useEffect(() => {
    if (selectedRow?.kind === 'duc') {
      setFormData(prev => ({ ...prev, gender: 'duc' }));
    } else if (selectedRow?.kind === 'cai') {
      setFormData(prev => ({ ...prev, gender: 'cai' }));
    }
  }, [selectedRowId]);

  // Lấy các ô hiện tại trong Dãy đã chọn để phân tích mã khuyết & mã kế tiếp
  const currentRowCages = useMemo(() => {
    return existingCages.filter(c => selectedRow?.id ? c.rowId === selectedRow.id : c.areaId === selectedArea?.id);
  }, [existingCages, selectedArea?.id, selectedRow?.id]);

  // Tiền tố mặc định theo Khu và Dãy
  const defaultPrefix = useMemo(() => {
    const row = areaRows.find(r => r.id === selectedRowId);
    if (selectedArea?.kind === 'sinh_san') {
      if (row?.code.includes('C1') || row?.name.includes('Cái 1')) return 'C1-';
      if (row?.code.includes('C2') || row?.name.includes('Cái 2')) return 'C2-';
      if (row?.code.includes('D1') || row?.name.includes('Đực 1')) return 'D1-';
      if (row?.code.includes('Cái') || row?.name.includes('Cái')) return 'C1-';
      if (row?.code.includes('Đực') || row?.name.includes('Đực')) return 'D1-';
      return 'C1-';
    }
    if (selectedArea?.kind === 'baby') {
      if (row?.name.includes('3–4') || row?.name.includes('3-4') || row?.code.includes('3-4')) return 'BB1-';
      if (row?.name.includes('5–7') || row?.name.includes('5-7') || row?.code.includes('5-7')) return 'BB2-';
      if (row?.name.includes('8') || row?.code.includes('8-11')) return 'BB3-';
      return 'BB1-';
    }
    if (selectedArea?.kind === 'hau_bi') {
      if (row?.name.includes('1') || row?.code.includes('1')) return 'HB1-';
      if (row?.name.includes('2') || row?.code.includes('2')) return 'HB2-';
      return 'HB1-';
    }
    if (selectedArea?.kind === 'thuong_pham') {
      if (row?.name.includes('1') || row?.code.includes('1')) return 'TP1-';
      if (row?.name.includes('2') || row?.code.includes('2')) return 'TP2-';
      return 'TP1-';
    }
    if (selectedArea?.kind === 'dieu_tri') {
      if (row?.name.includes('1') || row?.code.includes('1')) return 'DT1-';
      if (row?.name.includes('2') || row?.code.includes('2')) return 'DT2-';
      return 'DT1-';
    }
    return selectedArea?.code ? `${selectedArea.code.replace('KHU-', '')}-` : 'O-';
  }, [selectedArea, selectedRowId, areaRows]);

  // Tìm mã khuyết và mã tiếp theo
  const { gapCodes, nextCodes } = useMemo(() => {
    return findGapAndNextCageCodes(currentRowCages, defaultPrefix, 4);
  }, [currentRowCages, defaultPrefix]);

  // Kiểm tra trùng lặp mã ô thời gian thực THEO PHẠM VI DÃY
  const isDuplicateInRow = useMemo(() => {
    if (!cageCode.trim() || !selectedRow) return false;
    const formatted = cageCode.trim().toUpperCase();
    return existingCages.some(
      c => c.rowId === selectedRow.id && c.code.trim().toUpperCase() === formatted
    );
  }, [cageCode, selectedRow, existingCages]);

  // Tự động gán mã gợi ý đầu tiên nếu chưa nhập và không có initialCageCode
  useEffect(() => {
    if (!cageCode && !initialCageCode) {
      if (gapCodes.length > 0) {
        setCageCode(gapCodes[0]);
      } else if (nextCodes.length > 0) {
        setCageCode(nextCodes[0]);
      }
    }
  }, [gapCodes, nextCodes, initialCageCode]);

  // Tự động tính số thứ tự vị trí tiếp theo V1, V2, V3, V4...
  useEffect(() => {
    const cagesInThisTier = currentRowCages.filter(c => (c.tier || 1) === selectedTier);
    
    // Tìm các số V hiện có trong Hàng/Tầng này
    const existingVNums = cagesInThisTier.map(c => {
      if (c.slotNumber) {
        const match = c.slotNumber.match(/\d+/);
        if (match) return parseInt(match[0], 10);
      }
      return 0;
    }).filter(n => n > 0);

    if (existingVNums.length > 0) {
      const maxV = Math.max(...existingVNums);
      setSlotNumber(`V${maxV + 1}`);
    } else {
      // Nếu hàng này chưa có ô nào:
      if (selectedTier === 2) {
        // Hàng 2 bắt đầu sau vị trí lớn nhất của Hàng 1
        const tier1Cages = currentRowCages.filter(c => (c.tier || 1) === 1);
        const t1Nums = tier1Cages.map(c => {
          const m = c.slotNumber?.match(/\d+/);
          return m ? parseInt(m[0], 10) : 0;
        }).filter(n => n > 0);
        const t1Max = t1Nums.length > 0 ? Math.max(...t1Nums) : (tier1Cages.length || 3);
        setSlotNumber(`V${t1Max + 1}`);
      } else {
        setSlotNumber('V1');
      }
    }
  }, [currentRowCages, selectedTier]);

  const handleFormDataChange = (updates: Partial<BusinessFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cageCode.trim()) return;

    const formattedCode = cageCode.trim().toUpperCase();
    const row = areaRows.find(r => r.id === selectedRowId) || areaRows[0] || { id: 'row-default', code: 'Dãy 1', name: 'Dãy 1' };

    const existsInRow = existingCages.some(
      c => c.rowId === row.id && c.code.trim().toUpperCase() === formattedCode
    );

    if (existsInRow) {
      setErrorMessage(`Mã ô "${formattedCode}" đã tồn tại trong ${row.name} (${selectedArea.name})! Vui lòng chọn mã khác.`);
      return;
    }

    const isTrống = formData.status === 'trong';
    const isDead = formData.status === 'chet';

    const statusLabel = getCageStatusLabel(formData.status);
    const weightNum = !isTrống && formData.currentWeightKg ? parseFloat(formData.currentWeightKg) : undefined;

    const parseNum = (val: number | string | undefined, fallback?: number) => {
      if (val === '' || val === undefined || val === null) return fallback;
      const num = typeof val === 'number' ? val : parseInt(String(val), 10);
      return isNaN(num) ? fallback : num;
    };

    const parsedRatCount = isTrống ? 0 : isDead ? 0 : Math.max(1, parseNum(formData.ratCount, 1) || 1);

    const physicalReg = registerOrRecoverPhysicalLocation('cage', {
      code: formattedCode,
      name: `Ô ${formattedCode}`,
      areaId: selectedArea.id,
      areaCode: selectedArea.code,
      areaName: selectedArea.name,
      rowId: row.id,
      rowCode: row.code,
      rowName: row.name,
      tier: selectedTier,
      slotNumber: slotNumber.trim() || undefined,
    });

    const newCage: FarmCage = {
      id: `cage-${Date.now()}`,
      physicalId: physicalReg.physicalId,
      code: formattedCode,
      areaId: selectedArea.id,
      areaCode: selectedArea.code,
      areaKind: selectedArea.kind,
      rowId: row.id,
      rowCode: row.code,
      tier: selectedTier,
      slotNumber: slotNumber.trim() || undefined,
      status: formData.status,
      statusLabel,
      gender: !isTrống ? formData.gender : undefined,
      species: formData.species,
      ratCount: parsedRatCount,
      currentWeightKg: weightNum,
      healthStatus: !isTrống && !isDead ? formData.healthStatus : undefined,
      
      // Ghép đôi
      matingDate: formData.status === 'ghep_doi' ? formData.matingDate : undefined,
      partnerCageCode: (formData.status === 'ghep_doi' || formData.status === 'moi_tach_duc' || formData.status === 'moi_tach_cai') ? formData.partnerCageCode : undefined,
      
      // Tách đực / tách cái
      matingSeparationDate: (formData.status === 'moi_tach_duc' || formData.status === 'moi_tach_cai') ? formData.matingSeparationDate : undefined,
      followupDurationDays: (formData.status === 'moi_tach_duc' || formData.status === 'moi_tach_cai') ? parseNum(formData.followupDurationDays, 10) : undefined,
      expectedEvaluationDate: (formData.status === 'moi_tach_duc' || formData.status === 'moi_tach_cai') ? formData.expectedEvaluationDate : undefined,
      
      // Tách con
      weaningDate: formData.status === 'moi_tach_con' ? formData.weaningDate : undefined,
      weanedBabyCount: formData.status === 'moi_tach_con' ? parseNum(formData.weanedBabyCount, 0) : undefined,
      weanedBabyWeightAvg: formData.status === 'moi_tach_con' && formData.weanedBabyWeightAvg ? parseFloat(formData.weanedBabyWeightAvg) : undefined,
      weanedBabyGroup: formData.status === 'moi_tach_con' ? formData.weanedBabyGroup : undefined,
      targetBabyCageCode: (formData.status === 'moi_tach_con' || formData.status === 'dat_dieu_kien_chuyen' || formData.status === 'da_chuyen') ? formData.targetBabyCageCode : undefined,
      transferredCount: formData.status === 'moi_tach_con' ? parseNum(formData.transferredCount, 0) : undefined,
      transferDate: formData.status === 'moi_tach_con' ? formData.transferDate : undefined,
      
      // Nuôi con
      birthDate: formData.status === 'dang_nuoi_con' ? formData.birthDate : undefined,
      totalBornCount: formData.status === 'dang_nuoi_con' ? parseNum(formData.totalBornCount, 0) : undefined,
      livingBabyCount: formData.status === 'dang_nuoi_con' ? parseNum(formData.livingBabyCount, 0) : undefined,
      abandonedBabyCount: formData.status === 'dang_nuoi_con' ? parseNum(formData.abandonedBabyCount, 0) : undefined,
      nursingCondition: formData.status === 'dang_nuoi_con' ? formData.nursingCondition : undefined,
      
      // Baby
      entryDate: selectedArea.kind === 'baby' ? formData.entryDate : undefined,
      babyGroup: selectedArea.kind === 'baby' ? formData.babyGroup : undefined,
      readyToTransferDate: selectedArea.kind === 'baby' ? formData.readyToTransferDate : undefined,
      
      // Hậu bị
      hauBiEntryDate: selectedArea.kind === 'hau_bi' ? formData.hauBiEntryDate : undefined,
      hauBiEvaluationDate: selectedArea.kind === 'hau_bi' ? formData.hauBiEvaluationDate : undefined,
      hauBiPassed: selectedArea.kind === 'hau_bi' ? formData.hauBiPassed : undefined,
      
      // Thương phẩm
      commercialEntryDate: selectedArea.kind === 'thuong_pham' ? formData.commercialEntryDate : undefined,
      readyToExportDate: selectedArea.kind === 'thuong_pham' ? formData.readyToExportDate : undefined,
      exportDate: (formData.status === 'da_xuat' || formData.status === 'cho_xuat') ? formData.exportDate : undefined,
      exportedCount: (formData.status === 'da_xuat' || formData.status === 'cho_xuat') ? parseNum(formData.exportedCount, 1) : undefined,
      exportedWeightAvg: (formData.status === 'da_xuat' || formData.status === 'cho_xuat') && formData.exportedWeightAvg ? parseFloat(formData.exportedWeightAvg) : undefined,
      
      // Điều trị
      treatmentDiseaseType: formData.status === 'dang_dieu_tri' ? formData.treatmentDiseaseType : undefined,
      treatmentDetectionDate: formData.status === 'dang_dieu_tri' ? formData.treatmentDetectionDate : undefined,
      treatmentTransferDate: formData.status === 'dang_dieu_tri' ? formData.treatmentTransferDate : undefined,
      sourceCageCode: (formData.status === 'dang_dieu_tri' || formData.status === 'da_khoi') ? formData.sourceCageCode : undefined,
      treatmentProtocol: formData.status === 'dang_dieu_tri' ? formData.treatmentProtocol : undefined,
      treatmentMedicine: (formData.status === 'dang_dieu_tri' || formData.status === 'theo_doi') ? formData.treatmentMedicine : undefined,
      treatmentDuration: formData.status === 'dang_dieu_tri' ? formData.treatmentDuration : undefined,
      treatmentNextExamDate: (formData.status === 'dang_dieu_tri' || formData.status === 'theo_doi') ? formData.treatmentNextExamDate : undefined,
      
      // Khỏi / Chết
      recoveryAction: formData.status === 'da_khoi' ? formData.recoveryAction : undefined,
      recoveryDate: formData.status === 'da_khoi' ? formData.recoveryDate : undefined,
      deathDate: formData.status === 'chet' ? formData.deathDate : undefined,
      deathCount: formData.status === 'chet' ? formData.deathCount : undefined,
      deathReason: formData.status === 'chet' ? formData.deathReason : undefined,
      
      weightHistory: weightNum ? [{
        id: `wt-${Date.now()}`,
        date: formData.weightDate || todayStr,
        weightKg: weightNum,
        note: 'Cân ban đầu khi tạo ô'
      }] : [],
      healthHistory: !isTrống && !isDead ? [{
        id: `hl-${Date.now()}`,
        date: formData.healthDate || todayStr,
        status: formData.healthStatus,
        symptoms: formData.healthSymptoms || undefined,
        notes: formData.healthNotes || undefined
      }] : [],
      treatmentFollowups: formData.status === 'theo_doi' ? [{
        id: `tf-${Date.now()}`,
        date: todayStr,
        progression: formData.progression,
        medicine: formData.treatmentMedicine,
        healthState: 'Có tiến triển',
        nextFollowupDate: formData.treatmentNextExamDate,
        notes: notes || undefined
      }] : [],
      history: [
        {
          id: `his-${Date.now()}`,
          timestamp: `${todayStr} ${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`,
          eventType: 'tao_o',
          summary: `Khởi tạo ô chuồng mới ${formattedCode} (${slotNumber}) - Trạng thái: ${statusLabel}`,
          actor: 'Phan Dũng'
        }
      ],
      lastCleanDate: todayStr,
      notes: notes || undefined
    };

    onAddCage(newCage);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Modal */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Thêm Ô Chuồng Mới Vào Cấu Trúc</h3>
              <p className="text-xs text-slate-500">Tự động chọn Hàng (Tầng), mã khuyết và form nghiệp vụ tương ứng</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-200 text-slate-400 hover:text-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 text-xs overflow-y-auto">
          {/* CẤU TRÚC VỊ TRÍ: KHU & DÃY */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Chọn Khu */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">1. Phân Khu *</label>
              <select
                value={selectedAreaId}
                onChange={e => {
                  const newAreaId = e.target.value;
                  setSelectedAreaId(newAreaId);
                  const matchingRows = rows.filter(r => r.areaId === newAreaId);
                  setSelectedRowId(matchingRows[0]?.id || '');
                  setCageCode('');
                }}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium"
              >
                {areas.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.code}) — {a.kindLabel}
                  </option>
                ))}
              </select>
            </div>

            {/* Chọn Dãy */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">2. Dãy Nuôi Thuộc Khu *</label>
              <select
                value={selectedRowId}
                onChange={e => {
                  setSelectedRowId(e.target.value);
                  setCageCode('');
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium"
              >
                {areaRows.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.genderBadge || r.code}) — Đang có {existingCages.filter(c => c.rowId === r.id).length} ô
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Chọn Tầng / Hàng chuồng & Vị trí */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">3. Chọn Hàng (Tầng)</label>
              <select
                value={selectedTier}
                onChange={e => setSelectedTier(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium"
              >
                <option value={1}>Hàng 1 (Hàng Trên / Tầng 1)</option>
                {rowTierCount > 1 && (
                  <option value={2}>Hàng 2 (Hàng Dưới / Tầng 2)</option>
                )}
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Mã vị trí (V1, V2...)</label>
              <input
                type="text"
                placeholder="VD: V1, V2, V3..."
                value={slotNumber}
                onChange={e => setSlotNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-mono font-bold"
              />
            </div>
          </div>

          {/* Gợi ý Mã Ô Khuyết & Mã Kế Tiếp */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 text-[11px] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Gợi ý Mã Ô Chuồng ({selectedRow?.name}):</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                Đang có {currentRowCages.length} ô trong dãy
              </span>
            </div>

            {gapCodes.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-amber-700 block uppercase">
                  ⚡ Mã ô khuyết (vừa xóa/bỏ trống):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {gapCodes.map(code => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => setCageCode(code)}
                      className={`px-2.5 py-1 rounded-lg font-mono text-xs font-bold transition-all border flex items-center gap-1 ${
                        cageCode === code
                          ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                          : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                      }`}
                    >
                      <span>{code}</span>
                      {cageCode === code && <Check className="w-3 h-3" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-600 block uppercase">
                Mã số tiếp theo:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {nextCodes.map(code => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setCageCode(code)}
                    className={`px-2.5 py-1 rounded-lg font-mono text-xs font-bold transition-all border flex items-center gap-1 ${
                      cageCode === code
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>{code}</span>
                    {cageCode === code && <Check className="w-3 h-3" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Mã Ô Chuồng Xác Nhận */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-700 block">
                4. Mã Ô Chuồng Xác Nhận *
              </label>
              <span className="text-[10px] text-slate-500">
                Phạm vi duy nhất: <strong className="text-slate-700">{selectedRow?.name || 'Dãy đang chọn'}</strong>
              </span>
            </div>
            <input
              type="text"
              placeholder="VD: C1-01, C2-01, D1-01..."
              value={cageCode}
              onChange={e => {
                setCageCode(e.target.value);
                setErrorMessage('');
              }}
              required
              className={`w-full px-3 py-2 rounded-xl border bg-white font-mono uppercase font-bold text-sm transition-colors ${
                isDuplicateInRow || errorMessage
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-200 bg-rose-50/20'
                  : 'border-slate-300 focus:border-emerald-500'
              }`}
            />
            {isDuplicateInRow && (
              <p className="mt-1.5 text-xs text-rose-600 font-semibold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Mã ô "{cageCode.trim().toUpperCase()}" đã có trong {selectedRow?.name}. Vui lòng chọn mã khác cho dãy này!</span>
              </p>
            )}
            {errorMessage && !isDuplicateInRow && (
              <p className="mt-1.5 text-xs text-rose-600 font-semibold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMessage}</span>
              </p>
            )}
          </div>

          {/* 5. DROPDOWN TRẠNG THÁI BAN ĐẦU (TỰ ĐỘNG THEO PHÂN KHU) */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-emerald-950 block text-xs">
                5. TRẠNG THÁI BAN ĐẦU CỦA Ô *
              </label>
              <span className="text-[10px] font-semibold text-emerald-700 px-2 py-0.5 rounded-full bg-emerald-100">
                {selectedArea.name} ({statusOptions.length} trạng thái)
              </span>
            </div>
            <select
              value={formData.status}
              onChange={e => {
                const newStatus = e.target.value as CageStatus;
                handleFormDataChange({ 
                  status: newStatus,
                  ratCount: newStatus === 'trong' ? 0 : (newStatus === 'ghep_doi' ? 2 : 1)
                });
              }}
              className="w-full px-3 py-2.5 rounded-xl border border-emerald-400 bg-white font-bold text-emerald-950 text-sm shadow-2xs"
            >
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* 6. FORM NGHIỆP VỤ TƯƠNG ỨNG THEO TRẠNG THÁI */}
          <FarmStatusBusinessForm
            areaKind={selectedArea.kind}
            data={formData}
            onChange={handleFormDataChange}
            existingCages={existingCages}
            allAreas={areas}
          />

          {/* Ghi chú chuồng */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Ghi chú chuồng</label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
              placeholder="VD: Chuồng sạch, thoáng mát, gạch men 50x50"
            />
          </div>

          {/* Footer nút hành động */}
          <div className="pt-3 border-t border-slate-100 flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isDuplicateInRow}
              className={`px-5 py-2 rounded-xl font-bold shadow-xs flex items-center gap-1.5 transition-all ${
                isDuplicateInRow
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-[#15803d] hover:bg-[#166534] text-white'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Tạo Ô Chuồng</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

