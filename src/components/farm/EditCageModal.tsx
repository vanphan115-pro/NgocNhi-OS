import React, { useState, useMemo } from 'react';
import { FarmCage, CageStatus, FarmArea } from './farmTypes';
import { normalizeFarmCage } from './farmData';
import { 
  FarmStatusBusinessForm, 
  BusinessFormData, 
  getStatusOptionsByAreaKind, 
  getCageStatusLabel 
} from './FarmStatusBusinessForm';
import { X, Edit3, Save, Tag } from 'lucide-react';

interface EditCageModalProps {
  cage: FarmCage;
  allAreas?: FarmArea[];
  allCages?: FarmCage[];
  onClose: () => void;
  onSave: (updatedCage: FarmCage, secondCageUpdate?: FarmCage) => void;
}

export const EditCageModal: React.FC<EditCageModalProps> = ({
  cage,
  allAreas = [],
  allCages = [],
  onClose,
  onSave
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const statusOptions = useMemo(() => {
    return getStatusOptionsByAreaKind(cage.areaKind);
  }, [cage.areaKind]);

  const [cageCode, setCageCode] = useState<string>(cage.code || '');
  const [slotNumber, setSlotNumber] = useState<string>(cage.slotNumber || '');
  const [tier, setTier] = useState<number>(cage.tier || 1);
  const [notes, setNotes] = useState<string>(cage.notes || '');
  const [lastCleanDate, setLastCleanDate] = useState<string>(
    cage.lastCleanDate || todayStr
  );

  // Form data nghiệp vụ chi tiết khởi tạo từ cage
  const [formData, setFormData] = useState<BusinessFormData>({
    status: cage.status,
    ratCount: cage.ratCount !== undefined ? cage.ratCount : '',
    species: cage.species || 'moc_dai',
    gender: cage.gender || (cage.areaKind === 'sinh_san' ? 'cai' : 'dan'),
    
    // Theo dõi chung
    currentWeightKg: cage.currentWeightKg !== undefined ? String(cage.currentWeightKg) : '',
    weightDate: todayStr,
    healthStatus: cage.healthStatus || 'khoe_manh',
    healthDate: todayStr,
    healthSymptoms: '',
    healthNotes: '',
    
    // Ghép đôi
    matingDate: cage.matingDate || todayStr,
    partnerCageCode: cage.partnerCageCode || '',
    
    // Tách đực / Tách cái
    matingSeparationDate: cage.matingSeparationDate || todayStr,
    followupDurationDays: cage.followupDurationDays !== undefined ? cage.followupDurationDays : (cage.status === 'moi_tach_duc' ? 60 : cage.status === 'moi_tach_cai' ? 10 : ''),
    expectedEvaluationDate: cage.expectedEvaluationDate || todayStr,
    
    // Mới tách con
    weaningDate: cage.weaningDate || todayStr,
    weanedBabyCount: cage.weanedBabyCount !== undefined ? cage.weanedBabyCount : '',
    weanedBabyWeightAvg: cage.weanedBabyWeightAvg !== undefined ? String(cage.weanedBabyWeightAvg) : '',
    weanedBabyGroup: cage.weanedBabyGroup || '3_4_lang',
    targetBabyCageCode: cage.targetBabyCageCode || (allCages.find(c => c.areaKind === 'baby' && (c.status === 'trong' || (c.ratCount || 0) === 0))?.code || allCages.find(c => c.areaKind === 'baby')?.code || 'BB1-01'),
    transferredCount: cage.transferredCount !== undefined ? cage.transferredCount : (cage.weanedBabyCount !== undefined ? cage.weanedBabyCount : ''),
    transferDate: cage.transferDate || todayStr,
    
    // Đang nuôi con
    birthDate: cage.birthDate || todayStr,
    totalBornCount: cage.totalBornCount !== undefined ? cage.totalBornCount : '',
    livingBabyCount: cage.livingBabyCount !== undefined ? cage.livingBabyCount : '',
    abandonedBabyCount: cage.abandonedBabyCount !== undefined ? cage.abandonedBabyCount : (cage.totalBornCount !== undefined && cage.livingBabyCount !== undefined ? Math.max(0, cage.totalBornCount - cage.livingBabyCount) : ''),
    nursingCondition: cage.nursingCondition || 'Mẹ nuôi tốt, sữa đều',
    
    // Baby
    entryDate: cage.entryDate || todayStr,
    babyGroup: cage.babyGroup || '3_4_lang',
    readyToTransferDate: cage.readyToTransferDate || todayStr,
    
    // Hậu bị
    hauBiEntryDate: cage.hauBiEntryDate || todayStr,
    hauBiEvaluationDate: cage.hauBiEvaluationDate || todayStr,
    hauBiPassed: cage.hauBiPassed !== undefined ? cage.hauBiPassed : true,
    
    // Thương phẩm
    commercialEntryDate: cage.commercialEntryDate || todayStr,
    readyToExportDate: cage.readyToExportDate || todayStr,
    exportDate: cage.exportDate || todayStr,
    exportedCount: cage.exportedCount !== undefined ? cage.exportedCount : '',
    exportedWeightAvg: cage.exportedWeightAvg !== undefined ? String(cage.exportedWeightAvg) : '',
    
    // Điều trị
    treatmentDiseaseType: cage.treatmentDiseaseType || 'Viêm phổi / Thở khò khè',
    treatmentDetectionDate: cage.treatmentDetectionDate || todayStr,
    treatmentTransferDate: cage.treatmentTransferDate || todayStr,
    sourceAreaCode: cage.sourceAreaCode || '',
    sourceRowCode: cage.sourceRowCode || '',
    sourceCageCode: cage.sourceCageCode || '',
    treatmentProtocol: cage.treatmentProtocol || 'Tiêm bắp 1 lần/ngày x 3 ngày',
    treatmentMedicine: cage.treatmentMedicine || 'Enrofloxacin 10% + B.Complex',
    treatmentDuration: cage.treatmentDuration || '5 – 7 ngày',
    treatmentNextExamDate: cage.treatmentNextExamDate || todayStr,
    
    // Theo dõi
    progression: 'Tiến triển ổn định',
    treatmentFollowupNote: '',
    
    // Khỏi
    recoveryAction: cage.recoveryAction || 've_cu',
    recoveryDate: cage.recoveryDate || todayStr,
    
    // Chết
    deathDate: cage.deathDate || todayStr,
    deathCount: cage.deathCount !== undefined ? cage.deathCount : '',
    deathReason: cage.deathReason || 'Suy hô hấp nặng do viêm phổi'
  });

  const handleFormDataChange = (updates: Partial<BusinessFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const isTrống = formData.status === 'trong';
    const isDead = formData.status === 'chet';
    const statusLabel = getCageStatusLabel(formData.status);
    const weightNum = !isTrống && formData.currentWeightKg ? parseFloat(formData.currentWeightKg) : undefined;
    const finalCode = cageCode.trim() || cage.code;
    const isCodeChanged = finalCode !== cage.code;

    const parseNum = (val: number | string | undefined, fallback?: number) => {
      if (val === '' || val === undefined || val === null) return fallback;
      const num = typeof val === 'number' ? val : parseInt(String(val), 10);
      return isNaN(num) ? fallback : num;
    };

    const parsedRatCount = isTrống ? 0 : isDead ? 0 : Math.max(1, parseNum(formData.ratCount, 1) || 1);

    const updatedCage: FarmCage = {
      ...cage,
      code: finalCode,
      status: formData.status,
      statusLabel,
      ratCount: parsedRatCount,
      gender: !isTrống ? formData.gender : undefined,
      species: formData.species,
      currentWeightKg: weightNum,
      healthStatus: !isTrống && !isDead ? formData.healthStatus : undefined,
      slotNumber: slotNumber.trim() || undefined,
      tier,
      notes: notes.trim() || undefined,
      lastCleanDate: lastCleanDate || undefined,
      
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
      entryDate: cage.areaKind === 'baby' ? formData.entryDate : undefined,
      babyGroup: cage.areaKind === 'baby' ? formData.babyGroup : undefined,
      readyToTransferDate: cage.areaKind === 'baby' ? formData.readyToTransferDate : undefined,
      
      // Hậu bị
      hauBiEntryDate: cage.areaKind === 'hau_bi' ? formData.hauBiEntryDate : undefined,
      hauBiEvaluationDate: cage.areaKind === 'hau_bi' ? formData.hauBiEvaluationDate : undefined,
      hauBiPassed: cage.areaKind === 'hau_bi' ? formData.hauBiPassed : undefined,
      
      // Thương phẩm
      commercialEntryDate: cage.areaKind === 'thuong_pham' ? formData.commercialEntryDate : undefined,
      readyToExportDate: cage.areaKind === 'thuong_pham' ? formData.readyToExportDate : undefined,
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
      deathCount: formData.status === 'chet' ? parseNum(formData.deathCount, 1) : undefined,
      deathReason: formData.status === 'chet' ? formData.deathReason : undefined,
      
      history: [
        {
          id: `his-${Date.now()}`,
          timestamp: `${todayStr} ${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`,
          eventType: 'cap_nhat_trang_thai',
          summary: isCodeChanged
            ? `Đổi tên ô: ${cage.code} ➔ ${finalCode} • Trạng thái: ${statusLabel}${weightNum ? ` • ${weightNum}kg` : ''}`
            : `Cập nhật trạng thái: ${statusLabel}${weightNum ? ` • ${weightNum}kg` : ''}`,
          actor: 'Phan Dũng',
          oldStatus: cage.status,
          newStatus: formData.status
        },
        ...(cage.history || [])
      ]
    };

    // ĐỒNG BỘ NGHIỆP VỤ TÁCH CON SANG KHU BABY
    let updatedBabyCage: FarmCage | undefined = undefined;
    if (formData.status === 'moi_tach_con') {
      const weanedCount = formData.weanedBabyCount || 4;
      const weanedWeightAvg = formData.weanedBabyWeightAvg ? parseFloat(formData.weanedBabyWeightAvg) : 0.35;
      const weanedGroup = formData.weanedBabyGroup || '3_4_lang';
      const targetCode = (formData.targetBabyCageCode || '').trim().toUpperCase();

      // Tìm ô baby đích
      let targetCage = allCages.find(c => targetCode && c.code.toUpperCase() === targetCode);
      if (!targetCage) {
        // Tự động tìm ô baby trống hoặc ô baby cùng phân khu
        targetCage = allCages.find(c => c.areaKind === 'baby' && c.status === 'trong') ||
                     allCages.find(c => c.areaKind === 'baby');
      }

      if (targetCage && targetCage.id !== cage.id) {
        const currentCount = targetCage.status === 'trong' ? 0 : (targetCage.ratCount || 0);
        updatedBabyCage = normalizeFarmCage({
          ...targetCage,
          status: 'dang_nuoi_baby',
          statusLabel: 'Đang nuôi Baby',
          gender: 'dan',
          babyGroup: weanedGroup,
          entryDate: formData.weaningDate || todayStr,
          ratCount: currentCount + weanedCount,
          currentWeightKg: weanedWeightAvg,
          species: formData.species || cage.species || 'moc_dai',
          history: [
            {
              id: `his-${Date.now()}-baby-sync`,
              timestamp: `${todayStr} ${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`,
              eventType: 'chuyen_baby',
              summary: `Tiếp nhận ${weanedCount} con non tách từ mẹ Ô ${cage.code} (Trọng lượng TB: ${weanedWeightAvg}kg, nhóm ${weanedGroup}).`,
              relatedCageCode: cage.code,
              actor: 'Phan Dũng'
            },
            ...(targetCage.history || [])
          ]
        });
        updatedCage.targetBabyCageCode = targetCage.code;
      }
    }

    onSave(normalizeFarmCage(updatedCage), updatedBabyCage);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Modal */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#0f532e] text-white flex items-center justify-center shadow-2xs">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Chỉnh Sửa Thông Tin & Trạng Thái Ô Chuồng</h3>
              <p className="text-xs text-slate-500">Đổi tên/mã ô • Cập nhật trạng thái kỹ thuật • Ghi chép vị trí & lịch nuôi</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 text-xs overflow-y-auto">
          {/* TÊN / MÃ Ô CHUỒNG (HỖ TRỢ CHỈNH SỬA TÊN Ô) */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-300 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-emerald-700" />
                <span>TÊN / MÃ Ô CHUỒNG *</span>
              </label>
              <span className="text-[10px] font-bold text-emerald-800 px-2.5 py-0.5 rounded-full bg-emerald-100/90 border border-emerald-200 font-mono">
                {cage.areaCode} • {cage.rowCode}
              </span>
            </div>
            
            <div className="relative">
              <input
                type="text"
                required
                value={cageCode}
                onChange={e => setCageCode(e.target.value)}
                placeholder="VD: C1-01, D1-01, SS1-01, Ô 01..."
                className="w-full px-3.5 py-2 rounded-xl border border-emerald-400 bg-white font-mono font-black text-emerald-950 text-base shadow-2xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden"
              />
            </div>
            <p className="text-[11px] text-emerald-700 flex items-center justify-between">
              <span>💡 Bạn có thể chỉnh sửa tên/mã ô tùy ý để dễ dàng quản lý</span>
              <span className="text-[10px] text-slate-500">Vị trí: {cage.slotNumber || 'V1'}</span>
            </p>
          </div>

          {/* DROPDOWN CHỌN TRẠNG THÁI NGHIỆP VỤ */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-emerald-950 block text-xs">
                TRẠNG THÁI KỸ THUẬT CỦA Ô *
              </label>
              <span className="text-[10px] font-semibold text-emerald-700 px-2 py-0.5 rounded-full bg-emerald-100">
                Phân khu: {cage.areaCode}
              </span>
            </div>
            <select
              value={formData.status}
              onChange={e => {
                const newStatus = e.target.value as CageStatus;
                handleFormDataChange({ 
                  status: newStatus,
                  ratCount: newStatus === 'trong' ? 0 : (newStatus === 'ghep_doi' ? 2 : Math.max(1, formData.ratCount))
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

          {/* FORM NGHIỆP VỤ TƯƠNG ỨNG THEO TRẠNG THÁI */}
          <FarmStatusBusinessForm
            areaKind={cage.areaKind}
            data={formData}
            onChange={handleFormDataChange}
            existingCages={allCages}
            allAreas={allAreas}
          />

          {/* Vị trí V1, V2... & Tầng */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Mã vị trí
              </label>
              <input
                type="text"
                placeholder="VD: V1, V2, V3..."
                value={slotNumber}
                onChange={e => setSlotNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-mono font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Hàng (Tầng)
              </label>
              <select
                value={tier}
                onChange={e => setTier(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium"
              >
                <option value={1}>Hàng 1 (Hàng Trên / Tầng 1)</option>
                <option value={2}>Hàng 2 (Hàng Dưới / Tầng 2)</option>
              </select>
            </div>
          </div>

          {/* Ngày vệ sinh gần nhất */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Ngày vệ sinh dọn chuồng gần nhất
            </label>
            <input
              type="date"
              value={lastCleanDate}
              onChange={e => setLastCleanDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium"
            />
          </div>

          {/* Ghi chú ô */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Ghi chú thêm cho Ô chuồng
            </label>
            <textarea
              rows={2}
              placeholder="Nhập ghi chú đặc điểm, thể trạng..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
            />
          </div>

          {/* Footer nút hành động */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#15803d] hover:bg-[#166534] text-white font-bold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Lưu Thông Tin Ô</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
