import React, { useMemo } from 'react';
import { 
  AreaKind, 
  CageStatus, 
  DuiSpecies, 
  BabyWeightGroup, 
  FarmArea, 
  FarmCage 
} from './farmTypes';
import { 
  Activity, 
  Scale, 
  Heart, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  ShieldAlert, 
  FileText, 
  Tag
} from 'lucide-react';

export interface StatusOption {
  value: CageStatus;
  label: string;
  badgeColor?: string;
  description?: string;
}

export function getStatusOptionsByAreaKind(areaKind: AreaKind): StatusOption[] {
  switch (areaKind) {
    case 'sinh_san':
      return [
        { value: 'trong', label: 'Trống' },
        { value: 'san_sang_ghep', label: 'Sẵn sàng ghép' },
        { value: 'ghep_doi', label: 'Ghép đôi' },
        { value: 'moi_tach_duc', label: 'Mới tách đực / Chờ kết quả' },
        { value: 'moi_tach_duc_khong_ro', label: 'Tách đực (Không rõ đực) / Chờ kết quả' },
        { value: 'moi_tach_cai', label: 'Mới tách cái / Chờ đánh giá' },
        { value: 'moi_tach_con', label: 'Mới tách con / Đang dưỡng' },
        { value: 'dang_nuoi_con', label: 'Đang nuôi con' },
        { value: 'dang_dieu_tri', label: 'Đang điều trị bệnh' },
      ];
    case 'baby':
      return [
        { value: 'trong', label: 'Trống' },
        { value: 'dang_nuoi_baby', label: 'Đang nuôi Baby' },
        { value: 'dat_dieu_kien_chuyen', label: 'Đạt điều kiện chuyển' },
        { value: 'da_chuyen', label: 'Đã chuyển' },
        { value: 'dang_dieu_tri', label: 'Đang điều trị bệnh' },
      ];
    case 'hau_bi':
      return [
        { value: 'trong', label: 'Trống' },
        { value: 'dang_nuoi_hau_bi', label: 'Đang nuôi hậu bị' },
        { value: 'dat_dieu_kien', label: 'Đạt điều kiện' },
        { value: 'cho_chuyen', label: 'Chờ chuyển' },
        { value: 'da_chuyen', label: 'Đã chuyển' },
        { value: 'dang_dieu_tri', label: 'Đang điều trị bệnh' },
      ];
    case 'thuong_pham':
      return [
        { value: 'trong', label: 'Trống' },
        { value: 'dang_nuoi_thuong_pham', label: 'Đang nuôi thương phẩm' },
        { value: 'dat_trong_luong', label: 'Đạt trọng lượng' },
        { value: 'cho_xuat', label: 'Chờ xuất' },
        { value: 'da_xuat', label: 'Đã xuất' },
        { value: 'dang_dieu_tri', label: 'Đang điều trị bệnh' },
      ];
    case 'dieu_tri':
      return [
        { value: 'trong', label: 'Trống' },
        { value: 'dang_dieu_tri', label: 'Đang điều trị' },
        { value: 'theo_doi', label: 'Theo dõi' },
        { value: 'da_khoi', label: 'Đã khỏi' },
        { value: 'chet', label: 'Chết' },
      ];
    default:
      return [
        { value: 'trong', label: 'Trống' },
        { value: 'san_sang_ghep', label: 'Sẵn sàng ghép' },
      ];
  }
}

export function getCageStatusLabel(status: CageStatus): string {
  switch (status) {
    case 'trong':
      return 'Trống';
    case 'san_sang_ghep':
      return 'Sẵn sàng ghép';
    case 'ghep_doi':
      return 'Ghép đôi';
    case 'moi_tach_duc':
      return 'Mới tách đực / Chờ kết quả';
    case 'moi_tach_duc_khong_ro':
      return 'Tách đực (Không rõ đực) / Chờ kết quả';
    case 'moi_tach_cai':
      return 'Mới tách cái / Chờ đánh giá';
    case 'moi_tach_con':
      return 'Mới tách con / Đang dưỡng';
    case 'dang_nuoi_con':
      return 'Đang nuôi con';
    case 'dang_nuoi_baby':
      return 'Đang nuôi Baby';
    case 'dat_dieu_kien_chuyen':
      return 'Đạt điều kiện chuyển';
    case 'da_chuyen':
      return 'Đã chuyển';
    case 'dang_nuoi_hau_bi':
      return 'Đang nuôi hậu bị';
    case 'dat_dieu_kien':
      return 'Đạt điều kiện';
    case 'cho_chuyen':
      return 'Chờ chuyển';
    case 'dang_nuoi_thuong_pham':
      return 'Đang nuôi thương phẩm';
    case 'dat_trong_luong':
      return 'Đạt trọng lượng';
    case 'cho_xuat':
      return 'Chờ xuất';
    case 'da_xuat':
      return 'Đã xuất';
    case 'dang_dieu_tri':
      return 'Đang điều trị';
    case 'theo_doi':
      return 'Theo dõi';
    case 'da_khoi':
      return 'Đã khỏi';
    case 'chet':
      return 'Chết';
    default:
      return 'Khác';
  }
}

export interface BusinessFormData {
  status: CageStatus;
  ratCount: number | string;
  species: DuiSpecies;
  gender: 'duc' | 'cai' | 'doi' | 'dan';
  
  // Theo dõi chung
  currentWeightKg: string;
  weightDate: string;
  healthStatus: 'khoe_manh' | 'binh_thuong' | 'kem' | 'dau_om';
  healthDate: string;
  healthSymptoms: string;
  healthNotes: string;
  
  // Ghép đôi
  matingDate: string;
  partnerCageCode: string;
  
  // Mới tách đực / Mới tách cái
  matingSeparationDate: string;
  followupDurationDays: number | string;
  expectedEvaluationDate: string;
  
  // Mới tách con
  weaningDate: string;
  weanedBabyCount: number | string;
  weanedBabyWeightAvg: string;
  weanedBabyGroup: BabyWeightGroup;
  targetBabyCageCode: string;
  transferredCount: number | string;
  transferDate: string;
  
  // Đang nuôi con
  birthDate: string;
  totalBornCount: number | string;
  livingBabyCount: number | string;
  abandonedBabyCount: number | string;
  nursingCondition: string;
  
  // Baby
  entryDate: string;
  babyGroup: BabyWeightGroup;
  readyToTransferDate: string;
  
  // Hậu bị
  hauBiEntryDate: string;
  hauBiEvaluationDate: string;
  hauBiPassed: boolean;
  
  // Thương phẩm
  commercialEntryDate: string;
  readyToExportDate: string;
  exportDate: string;
  exportedCount: number | string;
  exportedWeightAvg: string;
  
  // Điều trị bệnh
  treatmentDiseaseType: string;
  treatmentDetectionDate: string;
  treatmentTransferDate: string;
  sourceAreaCode: string;
  sourceRowCode: string;
  sourceCageCode: string;
  treatmentProtocol: string;
  treatmentMedicine: string;
  treatmentDuration: string;
  treatmentNextExamDate: string;
  
  // Theo dõi điều trị
  progression: string;
  treatmentFollowupNote: string;
  
  // Đã khỏi
  recoveryAction: 've_cu' | 'chuyen_thuong_pham';
  recoveryDate: string;
  
  // Chết
  deathDate: string;
  deathCount: number | string;
  deathReason: string;
}

interface FarmStatusBusinessFormProps {
  areaKind: AreaKind;
  data: BusinessFormData;
  onChange: (updates: Partial<BusinessFormData>) => void;
  existingCages?: FarmCage[];
  allAreas?: FarmArea[];
  currentCageId?: string;
  currentAreaId?: string;
  currentCageCode?: string;
  currentCageGender?: 'duc' | 'cai' | 'doi' | 'dan';
}

// Helper kiểm tra ô cái (chuồng cái)
export function isFemaleCageCheck(c: { code?: string; gender?: string; rowCode?: string }): boolean {
  if (c.gender === 'cai') return true;
  const code = (c.code || '').toUpperCase();
  const row = (c.rowCode || '').toUpperCase();
  if (code.startsWith('DC') || code.startsWith('C') || row.startsWith('DC') || row.startsWith('C') || code.includes('CAI')) return true;
  return false;
}

// Helper kiểm tra ô đực (chuồng đực)
export function isMaleCageCheck(c: { code?: string; gender?: string; rowCode?: string }): boolean {
  if (c.gender === 'duc') return true;
  const code = (c.code || '').toUpperCase();
  const row = (c.rowCode || '').toUpperCase();
  if (code.startsWith('DĐ') || code.startsWith('DD') || (code.startsWith('D') && !code.startsWith('DC')) || row.startsWith('DĐ') || row.startsWith('DD') || (row.startsWith('D') && !row.startsWith('DC')) || code.includes('DUC')) return true;
  return false;
}

export const FarmStatusBusinessForm: React.FC<FarmStatusBusinessFormProps> = ({
  areaKind,
  data,
  onChange,
  existingCages = [],
  allAreas = [],
  currentCageId,
  currentAreaId,
  currentCageCode,
  currentCageGender,
}) => {
  const isTrống = data.status === 'trong';
  const isDead = data.status === 'chet';

  if (isTrống) {
    return (
      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-500 text-xs flex items-center gap-2">
        <Tag className="w-4 h-4 text-slate-400 shrink-0" />
        <span>
          Ô chuồng ở trạng thái <strong>Trống</strong> (chưa thả dúi). Không cần nhập dữ liệu theo dõi cá thể.
        </span>
      </div>
    );
  }

  // Xác định khu vực hiện tại
  const currentArea = allAreas.find(a => a.id === currentAreaId) || 
                      allAreas.find(a => a.kind === areaKind);
  const currentAreaName = currentArea ? currentArea.name : 'Khu hiện tại';

  // Kiểm tra ô hiện tại là Ô Cái hay Ô Đực
  const isCurrentFemale = useMemo(() => {
    if (currentCageGender === 'cai') return true;
    if (currentCageGender === 'duc') return false;
    if (data.gender === 'cai') return true;
    if (data.gender === 'duc') return false;
    if (currentCageCode && isFemaleCageCheck({ code: currentCageCode })) return true;
    if (currentCageCode && isMaleCageCheck({ code: currentCageCode })) return false;
    if (currentCageId) {
      const current = existingCages.find(c => c.id === currentCageId);
      if (current) return isFemaleCageCheck(current);
    }
    return false;
  }, [currentCageGender, data.gender, currentCageCode, currentCageId, existingCages]);

  const isCurrentMale = useMemo(() => {
    if (currentCageGender === 'duc') return true;
    if (currentCageGender === 'cai') return false;
    if (data.gender === 'duc') return true;
    if (data.gender === 'cai') return false;
    if (currentCageCode && isMaleCageCheck({ code: currentCageCode })) return true;
    if (currentCageCode && isFemaleCageCheck({ code: currentCageCode })) return false;
    if (currentCageId) {
      const current = existingCages.find(c => c.id === currentCageId);
      if (current) return isMaleCageCheck(current);
    }
    return !isCurrentFemale;
  }, [currentCageGender, data.gender, currentCageCode, currentCageId, existingCages, isCurrentFemale]);

  // Lọc danh sách ô thuộc đúng khu này ("Khu nào thì chỉ hiện ô của khu đấy")
  const areaCages = useMemo(() => {
    if (currentAreaId) {
      return existingCages.filter(c => c.areaId === currentAreaId);
    }
    // Fallback nếu không có currentAreaId: lọc theo areaKind
    return existingCages.filter(c => c.areaKind === areaKind);
  }, [existingCages, currentAreaId, areaKind]);

  // Lọc danh sách ứng viên đối ứng cho ghép đôi theo đúng quy tắc người dùng yêu cầu:
  // - Khi thêm/sửa thông tin Ô Cái: CHỈ CẦN HIỆN Ô ĐỰC SẴN SÀNG GHÉP (TUYỆT ĐỐI KHÔNG HIỆN Ô TRỐNG)
  // - Khi thêm/sửa thông tin Ô Đực: CHỈ CẦN HIỆN Ô CÁI TRỐNG
  const partnerCandidates = useMemo(() => {
    const candidateMap = new Map<string, FarmCage>();

    areaCages.forEach(c => {
      // 1. Không cho phép tự chọn chính ô này
      if (currentCageId && c.id === currentCageId) return;
      if (currentCageCode && c.code.toUpperCase() === currentCageCode.toUpperCase()) return;

      const codeKey = c.code.trim().toUpperCase();
      const isSelectedPartner = Boolean(
        data.partnerCageCode && codeKey === data.partnerCageCode.trim().toUpperCase()
      );

      // 2. Quy tắc cốt lõi khi thao tác tại Ô Cái:
      if (isCurrentFemale) {
        // Thao tác tại ô Cái -> CHỈ ĐƯỢC PHÉP CHỌN Ô ĐỰC SẴN SÀNG GHÉP (hoặc ô đực đã ghép trước đó nếu đang sửa)
        // TUYỆT ĐỐI BỎ QUA Ô TRỐNG!
        if (!isMaleCageCheck(c)) return;

        if (isSelectedPartner) {
          if (c.status === 'san_sang_ghep' || c.status === 'ghep_doi') {
            const existing = candidateMap.get(codeKey);
            if (!existing || existing.status === 'trong') {
              candidateMap.set(codeKey, c);
            }
          }
          // Nếu c.status === 'trong', TUYỆT ĐỐI KHÔNG THÊM VÀO ĐỂ KHÔNG HIỆN RA Ô TRỐNG!
          return;
        }

        if (c.status === 'san_sang_ghep') {
          candidateMap.set(codeKey, c);
        }
        return;
      }

      // 3. Quy tắc cốt lõi khi thao tác tại Ô Đực:
      if (isCurrentMale) {
        // Thao tác tại ô Đực -> CHỈ CẦN HIỆN Ô CÁI TRỐNG (hoặc ô cái đã ghép trước đó)
        if (!isFemaleCageCheck(c)) return;

        if (isSelectedPartner) {
          if (c.status === 'trong' || c.status === 'ghep_doi') {
            candidateMap.set(codeKey, c);
          }
          return;
        }

        if (c.status === 'trong') {
          candidateMap.set(codeKey, c);
        }
        return;
      }

      // Fallback an toàn:
      const isMaleReady = isMaleCageCheck(c) && c.status === 'san_sang_ghep';
      const isFemaleEmpty = isFemaleCageCheck(c) && c.status === 'trong';
      if (isMaleReady || isFemaleEmpty) {
        candidateMap.set(codeKey, c);
      }
    });

    return Array.from(candidateMap.values()).sort((a, b) => {
      // Đưa ô đang chọn lên đầu (nếu có)
      const aIsCurrent = data.partnerCageCode && a.code.toUpperCase() === data.partnerCageCode.trim().toUpperCase();
      const bIsCurrent = data.partnerCageCode && b.code.toUpperCase() === data.partnerCageCode.trim().toUpperCase();
      if (aIsCurrent && !bIsCurrent) return -1;
      if (!aIsCurrent && bIsCurrent) return 1;

      // Sắp xếp tự nhiên theo mã ô (VD: DĐ1-H1-001, DC1-H1-001...)
      return a.code.localeCompare(b.code, undefined, { numeric: true, sensitivity: 'base' });
    });
  }, [areaCages, currentCageId, currentCageCode, data.partnerCageCode, isCurrentFemale, isCurrentMale]);

  // Tìm thông tin chi tiết của ô đối tác đã chọn (nếu có)
  const selectedPartnerCage = useMemo(() => {
    if (!data.partnerCageCode) return null;
    const targetCode = data.partnerCageCode.trim().toUpperCase();

    const resolveBestMatch = (candidates: FarmCage[]): FarmCage | null => {
      if (!candidates || candidates.length === 0) return null;
      // 1. Ưu tiên tuyệt đối ô đang ghép đôi (ghep_doi) hoặc có thông tin liên kết trực tiếp
      const paired = candidates.find(c => c.status === 'ghep_doi' || (c.partnerCageCode && c.partnerCageCode.trim().toUpperCase() === (currentCageCode || '').trim().toUpperCase()));
      if (paired) return paired;

      // 2. Ưu tiên ô đang hoạt động / sẵn sàng ghép / có dúi / có lịch sử
      const active = candidates.find(c => c.status !== 'trong' || (c.ratCount || 0) > 0 || (c.history && c.history.length > 0));
      if (active) return active;

      // 3. Nếu không có ô nào có dữ liệu mới trả về ô trống đầu tiên
      return candidates[0];
    };

    // 1. Tìm trong khu vực hiện tại
    const inArea = areaCages.filter(c => c.code.trim().toUpperCase() === targetCode);
    const bestInArea = resolveBestMatch(inArea);
    if (bestInArea) return bestInArea;

    // 2. Tìm trong toàn bộ trang trại nếu không tìm thấy trong khu
    const inFarm = existingCages.filter(c => c.code.trim().toUpperCase() === targetCode);
    return resolveBestMatch(inFarm);
  }, [data.partnerCageCode, areaCages, existingCages, currentCageCode]);

  // Lọc danh sách ô đực / cái theo đúng khu vực để gợi ý cho tách đực / tách cái
  const maleCages = areaCages.filter(c => c.gender === 'duc' || c.code.startsWith('DĐ') || c.code.startsWith('D'));
  const femaleCages = areaCages.filter(c => c.gender === 'cai' || c.code.startsWith('DC') || c.code.startsWith('C'));
  const babyCages = existingCages.filter(c => c.areaKind === 'baby' || c.code.startsWith('BB'));

  return (
    <div className="space-y-4">
      {/* 1. KHỐI THEO DÕI CHUNG (Dành cho mọi Ô có Dúi) */}
      {!isDead && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-emerald-100">
            <span className="font-bold text-emerald-900 text-xs flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>THEO DÕI CƠ BẢN (DÀNH CHO MỌI Ô CÓ DÚI)</span>
            </span>
            <span className="text-[10px] text-emerald-700 font-semibold px-2 py-0.5 rounded-full bg-emerald-100/70">
              Bắt buộc
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Số lượng cá thể */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Số lượng (con) *
              </label>
              <input
                type="number"
                min="1"
                max="50"
                placeholder="1"
                value={data.ratCount ?? ''}
                onChange={e => {
                  const v = e.target.value;
                  onChange({ ratCount: v === '' ? '' : (parseInt(v, 10) || '') });
                }}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-bold text-slate-900"
                required
              />
            </div>

            {/* Giới tính */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Giới tính *
              </label>
              <select
                value={data.gender}
                onChange={e => onChange({ gender: e.target.value as any })}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-medium"
              >
                <option value="cai">♀ Dúi Cái</option>
                <option value="duc">♂ Dúi Đực</option>
                <option value="doi">⚤ Cặp phối</option>
                <option value="dan">Đàn / Tập trung</option>
              </select>
            </div>

            {/* Dòng giống */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Dòng giống Dúi
              </label>
              <select
                value={data.species === 'ma_dao' ? 'ma_dao' : 'moc_dai'}
                onChange={e => onChange({ species: e.target.value as DuiSpecies })}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-medium"
              >
                <option value="moc_dai">Dúi Mốc</option>
                <option value="ma_dao">Dúi Má Đào</option>
              </select>
            </div>

            {/* Trọng lượng hiện tại */}
            <div>
              <label className="font-bold text-slate-700 block mb-1 flex items-center justify-between">
                <span>Cân nặng (kg) *</span>
                <Scale className="w-3 h-3 text-emerald-600" />
              </label>
              <input
                type="number"
                step="0.05"
                min="0.1"
                placeholder="VD: 1.85"
                value={data.currentWeightKg}
                onChange={e => onChange({ currentWeightKg: e.target.value })}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-bold text-emerald-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            {/* Ngày cân */}
            <div>
              <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-500" />
                <span>Ngày cân gần nhất</span>
              </label>
              <input
                type="date"
                value={data.weightDate}
                onChange={e => onChange({ weightDate: e.target.value })}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-medium"
              />
            </div>

            {/* Tình trạng sức khỏe */}
            <div>
              <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1">
                <Heart className="w-3 h-3 text-rose-500" />
                <span>Tình trạng sức khỏe *</span>
              </label>
              <select
                value={data.healthStatus}
                onChange={e => onChange({ healthStatus: e.target.value as any })}
                className={`w-full px-3 py-1.5 rounded-xl border font-bold ${
                  data.healthStatus === 'khoe_manh'
                    ? 'border-emerald-300 bg-emerald-50/50 text-emerald-800'
                    : data.healthStatus === 'dau_om'
                    ? 'border-rose-300 bg-rose-50/50 text-rose-800'
                    : 'border-slate-300 bg-white text-slate-800'
                }`}
              >
                <option value="khoe_manh">🟢 Khỏe mạnh (Ăn tốt, lanh lợi)</option>
                <option value="binh_thuong">🟡 Bình thường</option>
                <option value="kem">🟠 Thể trạng kém / Gầy</option>
                <option value="dau_om">🔴 Đau ốm / Có triệu chứng bệnh</option>
              </select>
            </div>

            {/* Ngày kiểm tra sức khỏe */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Ngày kiểm tra sức khỏe
              </label>
              <input
                type="date"
                value={data.healthDate}
                onChange={e => onChange({ healthDate: e.target.value })}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-medium"
              />
            </div>
          </div>

          {/* Triệu chứng & Ghi chú theo dõi sức khỏe */}
          {data.healthStatus !== 'khoe_manh' && (
            <div className="pt-1">
              <label className="font-bold text-rose-800 block mb-1">
                Triệu chứng sức khỏe phát hiện:
              </label>
              <input
                type="text"
                placeholder="VD: Mắt hơi ướt, thở nhanh, phân mềm..."
                value={data.healthSymptoms}
                onChange={e => onChange({ healthSymptoms: e.target.value })}
                className="w-full px-3 py-1.5 rounded-xl border border-rose-300 bg-rose-50/30 text-slate-800"
              />
            </div>
          )}
        </div>
      )}

      {/* 2. KHỐI NGHIỆP VỤ RIÊNG THEO ĐÚNG TRẠNG THÁI */}

      {/* Nghiệp vụ 1: Ghép đôi (ghep_doi) */}
      {data.status === 'ghep_doi' && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-pink-50/70 border border-pink-200 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-pink-100">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-pink-600" />
              <span className="font-bold text-pink-950 text-xs">NGHIỆP VỤ PHỐI GHÉP ĐÔI</span>
            </div>
            <span className="text-[10px] font-bold text-pink-700 bg-pink-100/90 px-2 py-0.5 rounded-md border border-pink-200">
              {currentAreaName}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Ngày bắt đầu ghép phối *
              </label>
              <input
                type="date"
                value={data.matingDate}
                onChange={e => onChange({ matingDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium"
                required
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-700 block text-xs">
                  {isCurrentFemale 
                    ? 'Chọn Ô Đực Đối Ứng (Sẵn sàng ghép) *' 
                    : (isCurrentMale ? 'Chọn Ô Cái Trống Đối Ứng *' : 'Chọn Ô Đối Ứng *')}
                </label>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-md border border-emerald-200">
                  {partnerCandidates.length} {isCurrentFemale ? 'ô đực sẵn sàng' : (isCurrentMale ? 'ô cái trống' : 'ô khả dụng')} trong khu
                </span>
              </div>

              {partnerCandidates.length > 0 ? (
                <select
                  value={data.partnerCageCode || ''}
                  onChange={e => onChange({ partnerCageCode: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-pink-300 bg-white font-bold text-slate-900 text-xs focus:border-pink-500 focus:outline-hidden shadow-2xs"
                  required
                >
                  <option value="">
                    {isCurrentFemale 
                      ? '-- Chọn ô đực sẵn sàng ghép trong khu --' 
                      : (isCurrentMale ? '-- Chọn ô cái trống trong khu --' : '-- Chọn ô đối ứng trong khu --')}
                  </option>
                  {partnerCandidates.map(c => {
                    const isTrong = c.status === 'trong';
                    const genderBadge = isMaleCageCheck(c) ? '♂ Đực' : (isFemaleCageCheck(c) ? '♀ Cái' : 'Cá thể');
                    const weightBadge = c.currentWeightKg ? ` • ${c.currentWeightKg}kg` : '';
                    const statusText = isTrong 
                      ? (isFemaleCageCheck(c) ? '📦 Ô Cái trống' : '📦 Ô trống') 
                      : `${genderBadge} • Sẵn sàng ghép${weightBadge}`;
                    return (
                      <option key={c.id} value={c.code}>
                        Ô {c.code} [{statusText}]
                      </option>
                    );
                  })}
                </select>
              ) : (
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      {isCurrentFemale 
                        ? 'Không có ô đực nào trong khu đang "Sẵn sàng ghép"!' 
                        : (isCurrentMale 
                            ? 'Không có ô cái nào trong khu đang "Trống"!' 
                            : 'Không có ô đối ứng phù hợp trong khu!')}
                    </span>
                  </div>
                  <input
                    type="text"
                    placeholder={isCurrentFemale ? 'Nhập mã ô đực (VD: DĐ1-H1-001)' : 'Nhập mã ô cái trống (VD: DC1-H1-001)'}
                    value={data.partnerCageCode || ''}
                    onChange={e => onChange({ partnerCageCode: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-1.5 rounded-lg border border-amber-300 bg-white font-mono font-bold uppercase text-xs"
                    required
                  />
                </div>
              )}

              {/* Thẻ hiển thị ô đối ứng đã chọn */}
              {selectedPartnerCage && (
                <div className="p-2.5 rounded-xl bg-white/95 border border-pink-200 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] shadow-2xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-pink-500 shrink-0"></span>
                    <span className="font-bold font-mono text-pink-950">
                      Ô {selectedPartnerCage.code}
                    </span>
                    <span className="text-slate-600 truncate">
                      {isCurrentFemale ? (
                        `(${isMaleCageCheck(selectedPartnerCage) ? '♂ Đực' : 'Đối tác'} • ${
                          selectedPartnerCage.status === 'san_sang_ghep'
                            ? 'Sẵn sàng ghép'
                            : selectedPartnerCage.status === 'ghep_doi'
                            ? 'Đang ghép đôi'
                            : selectedPartnerCage.statusLabel || 'Sẵn sàng ghép'
                        }${selectedPartnerCage.currentWeightKg ? ` • ${selectedPartnerCage.currentWeightKg}kg` : ''})`
                      ) : selectedPartnerCage.status === 'trong' ? (
                        `(📦 Ô Cái trống - Sẽ chuyển sang Ghép đôi cùng Ô ${currentCageCode || 'này'})`
                      ) : (
                        `(${isMaleCageCheck(selectedPartnerCage) ? '♂ Đực' : '♀ Cái'} • ${selectedPartnerCage.statusLabel || 'Sẵn sàng ghép'}${selectedPartnerCage.currentWeightKg ? ` • ${selectedPartnerCage.currentWeightKg}kg` : ''})`
                      )}
                    </span>
                  </div>
                  <span className="text-[10px] text-pink-700 font-bold px-1.5 py-0.5 rounded bg-pink-50 self-start sm:self-auto shrink-0">
                    {currentAreaName}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Nghiệp vụ 2: Mới tách đực / Chờ kết quả (moi_tach_duc) */}
      {data.status === 'moi_tach_duc' && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-amber-100">
            <Calendar className="w-4 h-4 text-amber-700" />
            <span className="font-bold text-amber-950 text-xs">NGHIỆP VỤ THEO DÕI SAU TÁCH ĐỰC (45 - 60 NGÀY)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Ngày tách đực *
              </label>
              <input
                type="date"
                value={data.matingSeparationDate}
                onChange={e => {
                  const sepDate = e.target.value;
                  const dur = data.followupDurationDays || 60;
                  const d = new Date(sepDate);
                  d.setDate(d.getDate() + dur);
                  onChange({
                    matingSeparationDate: sepDate,
                    expectedEvaluationDate: d.toISOString().split('T')[0]
                  });
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Ô Đực đã phối giống *
              </label>
              <input
                type="text"
                placeholder="VD: D1-01"
                value={data.partnerCageCode}
                onChange={e => onChange({ partnerCageCode: e.target.value.toUpperCase() })}
                list="male-cages-list"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-mono font-bold uppercase"
              />
              <datalist id="male-cages-list">
                {maleCages.map(c => (
                  <option key={c.id} value={c.code}>
                    {c.code} ({c.species === 'ma_dao' ? 'Dúi Má Đào' : 'Dúi Mốc'} - {c.currentWeightKg || 2.0}kg)
                  </option>
                ))}
              </datalist>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Thời gian theo dõi (ngày)
              </label>
              <input
                type="number"
                min="1"
                max="120"
                placeholder="60"
                value={data.followupDurationDays ?? ''}
                onChange={e => {
                  const raw = e.target.value;
                  const dur = raw === '' ? '' : (parseInt(raw, 10) || '');
                  const sepDate = data.matingSeparationDate || new Date().toISOString().split('T')[0];
                  const d = new Date(sepDate);
                  if (typeof dur === 'number') {
                    d.setDate(d.getDate() + dur);
                  }
                  onChange({
                    followupDurationDays: dur,
                    expectedEvaluationDate: typeof dur === 'number' ? d.toISOString().split('T')[0] : data.expectedEvaluationDate
                  });
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Ngày dự kiến đánh giá / Kiểm tra kết quả
              </label>
              <input
                type="date"
                value={data.expectedEvaluationDate}
                onChange={e => onChange({ expectedEvaluationDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-white font-bold text-amber-900"
              />
            </div>
          </div>
        </div>
      )}

      {/* Nghiệp vụ 2B: Tách đực (Không rõ đực) / Chờ kết quả (moi_tach_duc_khong_ro) */}
      {data.status === 'moi_tach_duc_khong_ro' && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-50/80 border-2 border-amber-300 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between pb-2 border-b border-amber-200">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-700" />
              <span className="font-bold text-amber-950 text-xs">NGHIỆP VỤ THEO DÕI SAU TÁCH ĐỰC (KHÔNG RÕ ĐỰC) • 45 - 60 NGÀY</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-200 text-amber-900 border border-amber-300">
              Chưa rõ đực phối
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-white/90 border border-amber-200 text-slate-700 text-[11px] leading-relaxed">
            💡 <strong>Ghi chú nghiệp vụ:</strong> Dúi cái thực tế đã tách đực nhưng chưa rõ thông tin ô đực phối giống. Hệ thống sẽ bỏ qua yêu cầu liên kết ô đực và tự động theo dõi chu kỳ mang thai, nhắc lịch kiểm tra thai (+45 đến 60 ngày) tương tự các ô cái khác.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Ngày tách đực *
              </label>
              <input
                type="date"
                value={data.matingSeparationDate}
                onChange={e => {
                  const sepDate = e.target.value;
                  const dur = data.followupDurationDays || 60;
                  const d = new Date(sepDate);
                  d.setDate(d.getDate() + dur);
                  onChange({
                    matingSeparationDate: sepDate,
                    expectedEvaluationDate: d.toISOString().split('T')[0]
                  });
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Ô Đực đã phối giống
              </label>
              <input
                type="text"
                disabled
                value="Không rõ đực / Chưa xác định"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 font-medium italic cursor-not-allowed"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Thời gian theo dõi (ngày)
              </label>
              <input
                type="number"
                min="1"
                max="120"
                placeholder="60"
                value={data.followupDurationDays ?? ''}
                onChange={e => {
                  const raw = e.target.value;
                  const dur = raw === '' ? '' : (parseInt(raw, 10) || '');
                  const sepDate = data.matingSeparationDate || new Date().toISOString().split('T')[0];
                  const d = new Date(sepDate);
                  if (typeof dur === 'number') {
                    d.setDate(d.getDate() + dur);
                  }
                  onChange({
                    followupDurationDays: dur,
                    expectedEvaluationDate: typeof dur === 'number' ? d.toISOString().split('T')[0] : data.expectedEvaluationDate
                  });
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Ngày dự kiến đánh giá / Kiểm tra kết quả
              </label>
              <input
                type="date"
                value={data.expectedEvaluationDate}
                onChange={e => onChange({ expectedEvaluationDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-white font-bold text-amber-900"
              />
            </div>
          </div>
        </div>
      )}

      {/* Nghiệp vụ 3: Mới tách cái / Chờ đánh giá (moi_tach_cai) */}
      {data.status === 'moi_tach_cai' && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-blue-100">
            <Calendar className="w-4 h-4 text-blue-700" />
            <span className="font-bold text-blue-950 text-xs">NGHIỆP VỤ DƯỠNG ĐỰC SAU PHỐI (10 NGÀY)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Ngày tách cái *
              </label>
              <input
                type="date"
                value={data.matingSeparationDate}
                onChange={e => {
                  const sepDate = e.target.value;
                  const dur = data.followupDurationDays || 10;
                  const d = new Date(sepDate);
                  d.setDate(d.getDate() + dur);
                  onChange({
                    matingSeparationDate: sepDate,
                    expectedEvaluationDate: d.toISOString().split('T')[0]
                  });
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Ô Cái đã phối trước đó
              </label>
              <input
                type="text"
                placeholder="VD: C1-02"
                value={data.partnerCageCode}
                onChange={e => onChange({ partnerCageCode: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-mono font-bold uppercase"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Thời gian theo dõi / Dưỡng (ngày)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                placeholder="10"
                value={data.followupDurationDays ?? ''}
                onChange={e => {
                  const raw = e.target.value;
                  const dur = raw === '' ? '' : (parseInt(raw, 10) || '');
                  const sepDate = data.matingSeparationDate || new Date().toISOString().split('T')[0];
                  const d = new Date(sepDate);
                  if (typeof dur === 'number') {
                    d.setDate(d.getDate() + dur);
                  }
                  onChange({
                    followupDurationDays: dur,
                    expectedEvaluationDate: typeof dur === 'number' ? d.toISOString().split('T')[0] : data.expectedEvaluationDate
                  });
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Ngày dự kiến đánh giá / Sẵn sàng ghép lại
              </label>
              <input
                type="date"
                value={data.expectedEvaluationDate}
                onChange={e => onChange({ expectedEvaluationDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-blue-300 bg-white font-bold text-blue-900"
              />
            </div>
          </div>
        </div>
      )}

      {/* Nghiệp vụ 4: Mới tách con / Đang dưỡng (moi_tach_con) */}
      {data.status === 'moi_tach_con' && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-orange-50/70 border border-orange-200 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-orange-100">
            <ArrowRight className="w-4 h-4 text-orange-600" />
            <span className="font-bold text-orange-950 text-xs">NGHIỆP VỤ TÁCH CON & CHUYỂN KHU BABY</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Ngày tách con *
              </label>
              <input
                type="date"
                value={data.weaningDate}
                onChange={e => onChange({ weaningDate: e.target.value })}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-medium"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Số con đã tách *
              </label>
              <input
                type="number"
                min="1"
                placeholder="4"
                value={data.weanedBabyCount ?? ''}
                onChange={e => {
                  const v = e.target.value;
                  const count = v === '' ? '' : (parseInt(v, 10) || '');
                  onChange({ weanedBabyCount: count, transferredCount: count });
                }}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-bold"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Trọng lượng TB (kg)
              </label>
              <input
                type="number"
                step="0.05"
                placeholder="VD: 0.35"
                value={data.weanedBabyWeightAvg}
                onChange={e => onChange({ weanedBabyWeightAvg: e.target.value })}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Nhóm Baby *
              </label>
              <select
                value={data.weanedBabyGroup}
                onChange={e => onChange({ weanedBabyGroup: e.target.value as BabyWeightGroup })}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-medium"
              >
                <option value="3_4_lang">3 – 4 lạng</option>
                <option value="5_7_lang">5 – 7 lạng</option>
                <option value="8_lang_1_1_kg">8 lạng – 1.1 kg</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Ô Baby đích nhận đàn *
              </label>
              {babyCages.length > 0 ? (
                <select
                  value={data.targetBabyCageCode || (babyCages.find(c => c.status === 'trong')?.code || babyCages[0]?.code || '')}
                  onChange={e => onChange({ targetBabyCageCode: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-mono font-bold uppercase"
                  required
                >
                  <option value="">-- Chọn Ô Baby nhận đàn --</option>
                  {babyCages.map(c => (
                    <option key={c.id} value={c.code}>
                      Ô {c.code} ({c.status === 'trong' ? 'Trống - Sẵn sàng nhận' : `${c.statusLabel} • ${c.ratCount}c`})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  placeholder="VD: BB1-01"
                  value={data.targetBabyCageCode}
                  onChange={e => onChange({ targetBabyCageCode: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-mono font-bold uppercase"
                  required
                />
              )}
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Số lượng chuyển (con)
              </label>
              <input
                type="number"
                min="1"
                placeholder="4"
                value={data.transferredCount ?? ''}
                onChange={e => {
                  const v = e.target.value;
                  onChange({ transferredCount: v === '' ? '' : (parseInt(v, 10) || '') });
                }}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Ngày chuyển sang Baby
              </label>
              <input
                type="date"
                value={data.transferDate}
                onChange={e => onChange({ transferDate: e.target.value })}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-medium"
              />
            </div>
          </div>
        </div>
      )}

      {/* Nghiệp vụ 5: Đang nuôi con (dang_nuoi_con) */}
      {data.status === 'dang_nuoi_con' && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-teal-50/70 border border-teal-200 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-teal-100">
            <Heart className="w-4 h-4 text-teal-700" />
            <span className="font-bold text-teal-950 text-xs">NGHIỆP VỤ THEO DÕI ĐẺ CON & NUÔI CON</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Ngày sinh con *
              </label>
              <input
                type="date"
                value={data.birthDate}
                onChange={e => onChange({ birthDate: e.target.value })}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-medium"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Tổng số con sinh *
              </label>
              <input
                type="number"
                min="0"
                max="20"
                placeholder="Nhập số sinh"
                value={data.totalBornCount ?? ''}
                onChange={e => {
                  const raw = e.target.value;
                  if (raw === '') {
                    onChange({ totalBornCount: '', abandonedBabyCount: '' });
                    return;
                  }
                  const born = parseInt(raw, 10);
                  if (isNaN(born)) {
                    onChange({ totalBornCount: '' });
                    return;
                  }
                  // Nếu đã có số con sống
                  const livingRaw = data.livingBabyCount;
                  if (livingRaw !== '' && livingRaw !== undefined && livingRaw !== null) {
                    const living = parseInt(String(livingRaw), 10) || 0;
                    onChange({ 
                      totalBornCount: born, 
                      abandonedBabyCount: Math.max(0, born - living) 
                    });
                  } else {
                    onChange({ 
                      totalBornCount: born, 
                      livingBabyCount: born, 
                      abandonedBabyCount: 0 
                    });
                  }
                }}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-bold"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Số con sống hiện tại *
              </label>
              <input
                type="number"
                min="0"
                max="20"
                placeholder="Nhập số sống"
                value={data.livingBabyCount ?? ''}
                onChange={e => {
                  const raw = e.target.value;
                  if (raw === '') {
                    onChange({ livingBabyCount: '', abandonedBabyCount: '' });
                    return;
                  }
                  const living = parseInt(raw, 10);
                  if (isNaN(living)) {
                    onChange({ livingBabyCount: '' });
                    return;
                  }
                  // Tự động tính Hao hụt = Tổng sinh - Số sống
                  const bornRaw = data.totalBornCount;
                  let autoLoss: number | string = '';
                  if (bornRaw !== '' && bornRaw !== undefined && bornRaw !== null) {
                    const born = parseInt(String(bornRaw), 10) || 0;
                    autoLoss = Math.max(0, born - living);
                  }
                  onChange({ 
                    livingBabyCount: living, 
                    abandonedBabyCount: autoLoss !== '' ? autoLoss : 0 
                  });
                }}
                className="w-full px-3 py-1.5 rounded-xl border border-teal-300 bg-white font-bold text-teal-900"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1 flex items-center justify-between">
                <span>Số con bỏ / Hao hụt</span>
                <span className="text-[10px] text-teal-700 font-normal">(Tự trừ)</span>
              </label>
              <input
                type="number"
                min="0"
                max="20"
                placeholder="0"
                value={data.abandonedBabyCount ?? ''}
                onChange={e => {
                  const raw = e.target.value;
                  onChange({ abandonedBabyCount: raw === '' ? '' : (parseInt(raw, 10) || 0) });
                }}
                className="w-full px-3 py-1.5 rounded-xl border border-amber-300 bg-amber-50/50 font-bold text-amber-900"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Tình trạng nuôi & Sức khỏe mẹ con:
            </label>
            <input
              type="text"
              placeholder="VD: Mẹ nhiều sữa, ủ ấm tốt, đàn con phát triển đều"
              value={data.nursingCondition}
              onChange={e => onChange({ nursingCondition: e.target.value })}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white"
            />
          </div>
        </div>
      )}

      {/* Nghiệp vụ 6: Khu Baby (dang_nuoi_baby, dat_dieu_kien_chuyen, da_chuyen) */}
      {areaKind === 'baby' && (data.status === 'dang_nuoi_baby' || data.status === 'dat_dieu_kien_chuyen' || data.status === 'da_chuyen') && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-sky-50/70 border border-sky-200 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-sky-100">
            <Activity className="w-4 h-4 text-sky-700" />
            <span className="font-bold text-sky-950 text-xs">NGHIỆP VỤ THEO DÕI KHU DÚI BABY</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Ngày nhập / Tách mẹ *
              </label>
              <input
                type="date"
                value={data.entryDate}
                onChange={e => onChange({ entryDate: e.target.value })}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-medium"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Nhóm Baby phân loại *
              </label>
              <select
                value={data.babyGroup}
                onChange={e => onChange({ babyGroup: e.target.value as BabyWeightGroup })}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-bold"
              >
                <option value="3_4_lang">3 – 4 lạng (Mới tách mẹ)</option>
                <option value="5_7_lang">5 – 7 lạng (Tập ăn & Đang lớn)</option>
                <option value="8_lang_1_1_kg">8 lạng – 1.1 kg (Tiền hậu bị/thương phẩm)</option>
              </select>
            </div>
          </div>

          {(data.status === 'dat_dieu_kien_chuyen' || data.status === 'da_chuyen') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 border-t border-sky-100">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Ngày đạt / Ngày chuyển *
                </label>
                <input
                  type="date"
                  value={data.readyToTransferDate}
                  onChange={e => onChange({ readyToTransferDate: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-medium"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Ô đích chuyển đến
                </label>
                <input
                  type="text"
                  placeholder="VD: HB1-01 hoặc TP1-01"
                  value={data.targetBabyCageCode}
                  onChange={e => onChange({ targetBabyCageCode: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-mono uppercase"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Nghiệp vụ 7: Khu Hậu bị (dang_nuoi_hau_bi, dat_dieu_kien, cho_chuyen, da_chuyen) */}
      {areaKind === 'hau_bi' && (data.status === 'dang_nuoi_hau_bi' || data.status === 'dat_dieu_kien' || data.status === 'cho_chuyen' || data.status === 'da_chuyen') && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-indigo-100">
            <CheckCircle2 className="w-4 h-4 text-indigo-700" />
            <span className="font-bold text-indigo-950 text-xs">NGHIỆP VỤ NUÔI DƯỠNG & TUYỂN CHỌN HẬU BỊ</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Ngày nhập tuyển chọn *
              </label>
              <input
                type="date"
                value={data.hauBiEntryDate}
                onChange={e => onChange({ hauBiEntryDate: e.target.value })}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-medium"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Ngày đánh giá tuyển sinh sản
              </label>
              <input
                type="date"
                value={data.hauBiEvaluationDate}
                onChange={e => onChange({ hauBiEvaluationDate: e.target.value })}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-medium"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="hau-bi-passed"
              checked={data.hauBiPassed}
              onChange={e => onChange({ hauBiPassed: e.target.checked })}
              className="w-4 h-4 text-indigo-600 rounded-sm"
            />
            <label htmlFor="hau-bi-passed" className="font-bold text-indigo-900 text-xs">
              Đạt tiêu chuẩn sinh sản (Thể trạng tốt, chuẩn ngoại hình, phát dục rõ ràng)
            </label>
          </div>
        </div>
      )}

      {/* Nghiệp vụ 8: Khu Thương phẩm (dang_nuoi_thuong_pham, dat_trong_luong, cho_xuat, da_xuat) */}
      {(data.status === 'dang_nuoi_thuong_pham' || data.status === 'dat_trong_luong' || data.status === 'cho_xuat' || data.status === 'da_xuat') && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-amber-100">
            <Scale className="w-4 h-4 text-amber-700" />
            <span className="font-bold text-amber-950 text-xs">NGHIỆP VỤ NUÔI THƯƠNG PHẨM & XUẤT CHUỒNG</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Ngày nhập vỗ béo *
              </label>
              <input
                type="date"
                value={data.commercialEntryDate}
                onChange={e => onChange({ commercialEntryDate: e.target.value })}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-medium"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Ngày dự kiến xuất chuồng
              </label>
              <input
                type="date"
                value={data.readyToExportDate}
                onChange={e => onChange({ readyToExportDate: e.target.value })}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-medium"
              />
            </div>
          </div>

          {(data.status === 'da_xuat' || data.status === 'cho_xuat') && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-amber-200">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Ngày xuất bán *
                </label>
                <input
                  type="date"
                  value={data.exportDate}
                  onChange={e => onChange({ exportDate: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Số lượng xuất (con) *
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="1"
                  value={data.exportedCount ?? ''}
                  onChange={e => {
                    const v = e.target.value;
                    onChange({ exportedCount: v === '' ? '' : (parseInt(v, 10) || '') });
                  }}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Trọng lượng xuất TB (kg)
                </label>
                <input
                  type="number"
                  step="0.05"
                  placeholder="VD: 2.2"
                  value={data.exportedWeightAvg}
                  onChange={e => onChange({ exportedWeightAvg: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-bold text-amber-900"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Nghiệp vụ 9: Đang điều trị (dang_dieu_tri) */}
      {data.status === 'dang_dieu_tri' && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-rose-100">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span className="font-bold text-rose-950 text-xs">HỒ SƠ BỆNH ÁN & PHÁC ĐỒ ĐIỀU TRỊ THÚ Y</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Tên bệnh / Vấn đề phát hiện *
              </label>
              <input
                type="text"
                placeholder="VD: Viêm phổi, Rối loạn tiêu hóa..."
                value={data.treatmentDiseaseType}
                onChange={e => onChange({ treatmentDiseaseType: e.target.value })}
                list="disease-list"
                className="w-full px-3 py-1.5 rounded-xl border border-rose-300 bg-white font-bold text-rose-900"
                required
              />
              <datalist id="disease-list">
                <option value="Viêm phổi / Thở khò khè" />
                <option value="Rối loạn tiêu hóa / Ỉa chảy" />
                <option value="Cắn nhau rách da / Áp xe" />
                <option value="Đau mắt / Viêm giác mạc" />
                <option value="Kém ăn / Gầy yếu suy nhược" />
              </datalist>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Ngày phát hiện bệnh *
              </label>
              <input
                type="date"
                value={data.treatmentDetectionDate}
                onChange={e => onChange({ treatmentDetectionDate: e.target.value })}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-medium"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Ngày chuyển vào điều trị *
              </label>
              <input
                type="date"
                value={data.treatmentTransferDate}
                onChange={e => onChange({ treatmentTransferDate: e.target.value })}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-medium"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Ô nguồn phát hiện (Khu/Dãy/Ô)
              </label>
              <input
                type="text"
                placeholder="VD: C1-03 (Dãy Cái 1)"
                value={data.sourceCageCode}
                onChange={e => onChange({ sourceCageCode: e.target.value.toUpperCase() })}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-mono uppercase"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Phác đồ điều trị *
              </label>
              <input
                type="text"
                placeholder="VD: Tiêm bắp 1 lần/ngày x 3 ngày"
                value={data.treatmentProtocol}
                onChange={e => onChange({ treatmentProtocol: e.target.value })}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Thuốc sử dụng *
              </label>
              <input
                type="text"
                placeholder="VD: Enrofloxacin 10% + B.Complex"
                value={data.treatmentMedicine}
                onChange={e => onChange({ treatmentMedicine: e.target.value })}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Thời gian điều trị dự kiến
              </label>
              <input
                type="text"
                placeholder="VD: 5 – 7 ngày"
                value={data.treatmentDuration}
                onChange={e => onChange({ treatmentDuration: e.target.value })}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Ngày đánh giá / Tái khám *
              </label>
              <input
                type="date"
                value={data.treatmentNextExamDate}
                onChange={e => onChange({ treatmentNextExamDate: e.target.value })}
                className="w-full px-3 py-1.5 rounded-xl border border-rose-300 bg-white font-bold text-rose-900"
                required
              />
            </div>
          </div>
        </div>
      )}

      {/* Nghiệp vụ 10: Theo dõi điều trị (theo_doi) */}
      {data.status === 'theo_doi' && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-amber-100">
            <Activity className="w-4 h-4 text-amber-700" />
            <span className="font-bold text-amber-950 text-xs">THEO DÕI DIỄN BIẾN & TÁI KHÁM</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Diễn biến bệnh *
              </label>
              <input
                type="text"
                placeholder="VD: Đã bớt khò khè, phân sệt, tự ăn tre được..."
                value={data.progression}
                onChange={e => onChange({ progression: e.target.value })}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-medium"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Ngày hẹn tái khám tiếp theo *
              </label>
              <input
                type="date"
                value={data.treatmentNextExamDate}
                onChange={e => onChange({ treatmentNextExamDate: e.target.value })}
                className="w-full px-3 py-1.5 rounded-xl border border-amber-300 bg-white font-bold"
                required
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Thuốc / Phác đồ tiếp tục:
            </label>
            <input
              type="text"
              placeholder="VD: Giảm liều kháng sinh, bổ sung điện giải Gluco-KC"
              value={data.treatmentMedicine}
              onChange={e => onChange({ treatmentMedicine: e.target.value })}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white"
            />
          </div>
        </div>
      )}

      {/* Nghiệp vụ 11: Đã khỏi (da_khoi) */}
      {data.status === 'da_khoi' && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50/80 border border-emerald-300 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-bold text-emerald-950 text-xs">ĐÁNH GIÁ HỒI PHỤC & HƯỚNG ĐIỀU CHUYỂN</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Ngày đánh giá khỏi bệnh *
              </label>
              <input
                type="date"
                value={data.recoveryDate}
                onChange={e => onChange({ recoveryDate: e.target.value })}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-medium"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Hướng xử lý sau hồi phục *
              </label>
              <select
                value={data.recoveryAction}
                onChange={e => onChange({ recoveryAction: e.target.value as any })}
                className="w-full px-3 py-1.5 rounded-xl border border-emerald-400 bg-white font-bold text-emerald-900"
              >
                <option value="ve_cu">🔄 Hồi phục tốt → Trả về đúng Ô cũ</option>
                <option value="chuyen_thuong_pham">🥩 Hồi phục nhưng hết khả năng sinh sản → Chuyển Thương phẩm</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Ô đích tiếp nhận sau điều trị:
            </label>
            <input
              type="text"
              placeholder="VD: C1-03 hoặc TP1-02"
              value={data.sourceCageCode}
              onChange={e => onChange({ sourceCageCode: e.target.value.toUpperCase() })}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-mono uppercase font-bold"
            />
          </div>
        </div>
      )}

      {/* Nghiệp vụ 12: Chết (chet) */}
      {data.status === 'chet' && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-zinc-100 border border-zinc-300 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-zinc-200">
            <AlertTriangle className="w-4 h-4 text-zinc-700" />
            <span className="font-bold text-zinc-950 text-xs">GHI NHẬN HAO HỤT & NGUYÊN NHÂN CHẾT</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Ngày chết *
              </label>
              <input
                type="date"
                value={data.deathDate}
                onChange={e => onChange({ deathDate: e.target.value })}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-medium"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Số lượng chết (con) *
              </label>
              <input
                type="number"
                min="1"
                placeholder="1"
                value={data.deathCount ?? ''}
                onChange={e => {
                  const v = e.target.value;
                  onChange({ deathCount: v === '' ? '' : (parseInt(v, 10) || ''), ratCount: 0 });
                }}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-bold"
                required
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Nguyên nhân chết *
            </label>
            <input
              type="text"
              placeholder="VD: Suy hô hấp nặng do viêm phổi, kiệt sức..."
              value={data.deathReason}
              onChange={e => onChange({ deathReason: e.target.value })}
              list="death-reason-list"
              className="w-full px-3 py-1.5 rounded-xl border border-zinc-400 bg-white font-bold text-zinc-900"
              required
            />
            <datalist id="death-reason-list">
              <option value="Suy hô hấp nặng do viêm phổi" />
              <option value="Rối loạn tiêu hóa cấp tính / Chướng hơi" />
              <option value="Kiệt sức sau sinh / Mất máu" />
              <option value="Nhiễm trùng máu / Cắn nhau" />
            </datalist>
          </div>
        </div>
      )}
    </div>
  );
};
