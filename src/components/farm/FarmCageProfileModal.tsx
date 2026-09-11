import React, { useState, useMemo } from 'react';
import { UserRole } from '../../types';
import { 
  FarmCage, 
  FarmArea, 
  BabyWeightGroup, 
  DuiSpecies, 
  HistoryItem,
  TreatmentFollowupRecord
} from './farmTypes';
import { 
  formatDateVN, 
  addDays,
  normalizeFarmCage 
} from './farmData';
import { 
  X, 
  Heart, 
  Scale, 
  Activity, 
  Calendar, 
  Plus, 
  History, 
  ShieldAlert, 
  CheckCircle2, 
  QrCode, 
  ArrowRightLeft, 
  User, 
  Check, 
  AlertTriangle,
  Info,
  ChevronRight,
  Edit3,
  Trash2,
  Lock,
  Crown
} from 'lucide-react';
import { EditCageModal } from './EditCageModal';

interface FarmCageProfileModalProps {
  cage: FarmCage;
  allCages?: FarmCage[];
  allAreas?: FarmArea[];
  onClose: () => void;
  onUpdateCage: (updatedCage: FarmCage, secondCageUpdate?: FarmCage) => void;
  onDeleteCage?: (cageId: string) => void;
  onOpenQR: (cage: FarmCage) => void;
  userRole?: UserRole;
  onOpenAdminLogin?: (reason?: string) => void;
}

type TabType = 'overview' | 'actions' | 'weight' | 'health' | 'treatment' | 'history';

export const FarmCageProfileModal: React.FC<FarmCageProfileModalProps> = ({
  cage: rawCage,
  allCages = [],
  allAreas = [],
  onClose,
  onUpdateCage,
  onDeleteCage,
  onOpenQR,
  userRole = 'guest',
  onOpenAdminLogin
}) => {
  const cage = useMemo(() => normalizeFarmCage(rawCage), [rawCage]);

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Form states cho Cân nặng & Sức khỏe nền
  const [newWeight, setNewWeight] = useState<string>('');
  const [weightNote, setWeightNote] = useState<string>('');
  const [healthStatus, setHealthStatus] = useState<'khoe_manh' | 'binh_thuong' | 'kem' | 'dau_om'>('khoe_manh');
  const [healthSymptoms, setHealthSymptoms] = useState<string>('');
  const [healthNote, setHealthNote] = useState<string>('');

  // Form states cho Ghép đôi
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>('');
  const [matingDate, setMatingDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Form states cho Tách ghép
  const [separationDate, setSeparationDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Form states cho Sinh con
  const [birthDate, setBirthDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [totalBorn, setTotalBorn] = useState<number>(3);
  const [livingBorn, setLivingBorn] = useState<number>(3);

  // Form states cho Tách con (Cai sữa)
  const [weaningDate, setWeaningDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [weanedCount, setWeanedCount] = useState<number>(cage.livingBabyCount || 3);
  const [weanedWeightAvg, setWeanedWeightAvg] = useState<number>(0.35);
  const [weanedGroup, setWeanedGroup] = useState<BabyWeightGroup>('3_4_lang');
  const [targetBabyCageId, setTargetBabyCageId] = useState<string>('');

  // Form states cho Chuyển Điều Trị Bệnh
  const [diseaseType, setDiseaseType] = useState<string>('Rối loạn tiêu hóa / Bỏ ăn');
  const [detectionDate, setDetectionDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [targetTreatmentCageId, setTargetTreatmentCageId] = useState<string>('');
  const [treatmentQuantity, setTreatmentQuantity] = useState<number>(1);
  const [treatmentProtocol, setTreatmentProtocol] = useState<string>('Cách ly, cho ăn tre già phơi ráo + Bio-Gut');
  const [treatmentMedicine, setTreatmentMedicine] = useState<string>('Bio-Gut + Florfenicol 10%');
  const [treatmentDuration, setTreatmentDuration] = useState<string>('5 ngày');
  const [treatmentExamDate, setTreatmentExamDate] = useState<string>(addDays(new Date().toISOString().split('T')[0], 5));

  // Form states cho Theo dõi Điều trị
  const [followupProgression, setFollowupProgression] = useState<string>('Phân đã se lại, gặm tre tốt hơn');
  const [followupMedicine, setFollowupMedicine] = useState<string>('Bio-Gut 2ml/ngày');
  const [followupState, setFollowupState] = useState<string>('Đang phục hồi tốt');
  const [followupNextDate, setFollowupNextDate] = useState<string>(addDays(new Date().toISOString().split('T')[0], 3));

  // Form states cho Đánh giá sau Điều trị (3 hướng: Về ô cũ, Thương phẩm, Chết)
  const [recoveryReturnCount, setRecoveryReturnCount] = useState<number>(cage.ratCount || 1);
  const [targetCommercialCageId, setTargetCommercialCageId] = useState<string>('');
  const [deathCount, setDeathCount] = useState<number>(1);
  const [deathReason, setDeathReason] = useState<string>('Kiệt sức / không đáp ứng phác đồ');

  // Danh sách các Ô gợi ý
  const availablePartners = (allCages || []).filter(c => 
    c.areaKind === 'sinh_san' && 
    c.id !== cage.id && 
    c.status === 'san_sang_ghep' &&
    ((cage.gender === 'cai' && c.gender === 'duc') || (cage.gender === 'duc' && c.gender === 'cai'))
  );

  const availableBabyCages = (allCages || []).filter(c => c.areaKind === 'baby');
  const availableTreatmentCages = (allCages || []).filter(c => c.areaKind === 'dieu_tri');
  const availableCommercialCages = (allCages || []).filter(c => c.areaKind === 'thuong_pham');

  const showSuccess = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  // 1. CẬP NHẬT TRỌNG LƯỢNG NỀN
  const handleAddWeight = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(newWeight);
    if (isNaN(val) || val <= 0) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const newRecord = {
      id: `w-${Date.now()}`,
      date: todayStr,
      weightKg: val,
      note: weightNote || undefined
    };

    const newHistoryItem: HistoryItem = {
      id: `his-${Date.now()}`,
      timestamp: `${todayStr} ${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`,
      eventType: 'can_trong_luong',
      summary: `Cập nhật trọng lượng: ${val} kg (${weightNote || 'Cân định kỳ'})`,
      actor: 'Phan Dũng'
    };

    const updated: FarmCage = {
      ...cage,
      currentWeightKg: val,
      weightHistory: [newRecord, ...(cage.weightHistory || [])],
      history: [newHistoryItem, ...(cage.history || [])]
    };

    onUpdateCage(updated);
    setNewWeight('');
    setWeightNote('');
    showSuccess(`Đã lưu trọng lượng ${val} kg cho Ô ${cage.code}`);
  };

  // 2. CẬP NHẬT SỨC KHỎE NỀN
  const handleAddHealth = (e: React.FormEvent) => {
    e.preventDefault();
    const todayStr = new Date().toISOString().split('T')[0];
    const newRecord = {
      id: `h-${Date.now()}`,
      date: todayStr,
      status: healthStatus,
      symptoms: healthSymptoms || undefined,
      notes: healthNote || undefined
    };

    const newHistoryItem: HistoryItem = {
      id: `his-${Date.now()}`,
      timestamp: `${todayStr} ${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`,
      eventType: 'kham_suc_khoe',
      summary: `Kiểm tra sức khỏe: ${healthStatus.toUpperCase()} - ${healthSymptoms || 'Không triệu chứng lạ'}`,
      actor: 'Phan Dũng'
    };

    const updated: FarmCage = {
      ...cage,
      healthHistory: [newRecord, ...(cage.healthHistory || [])],
      history: [newHistoryItem, ...(cage.history || [])]
    };

    onUpdateCage(updated);
    setHealthSymptoms('');
    setHealthNote('');
    showSuccess(`Đã ghi nhận tình trạng sức khỏe cho Ô ${cage.code}`);
  };

  // 3. NGHIỆP VỤ GHÉP ĐÔI (LIÊN KẾT HAI CHIỀU + TẠO MỐC +20 NGÀY)
  const handlePairMating = (e: React.FormEvent) => {
    e.preventDefault();
    const partner = allCages.find(c => c.id === selectedPartnerId);
    if (!partner) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const timestampStr = `${todayStr} ${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;

    // Ô hiện tại (Ví dụ Ô Cái)
    const updatedCurrent: FarmCage = {
      ...cage,
      status: 'ghep_doi',
      statusLabel: 'Ghép đôi',
      gender: 'doi',
      ratCount: 2,
      matingDate: matingDate,
      partnerCageId: partner.id,
      partnerCageCode: partner.code,
      history: [
        {
          id: `his-${Date.now()}-1`,
          timestamp: timestampStr,
          eventType: 'ghep_doi',
          summary: `Bắt đầu ghép đôi với Ô ${partner.code} (Ngày ghép: ${formatDateVN(matingDate)}). Lịch tách ghép: +20 ngày.`,
          relatedCageCode: partner.code,
          actor: 'Phan Dũng'
        },
        ...(cage.history || [])
      ]
    };

    // Ô đối tác (Ví dụ Ô Đực)
    const updatedPartner: FarmCage = {
      ...partner,
      status: 'ghep_doi',
      statusLabel: 'Ghép đôi',
      gender: 'doi',
      ratCount: 0, // Đang mang sang chuồng cái
      matingDate: matingDate,
      partnerCageId: cage.id,
      partnerCageCode: cage.code,
      history: [
        {
          id: `his-${Date.now()}-2`,
          timestamp: timestampStr,
          eventType: 'ghep_doi',
          summary: `Ghép đôi cùng Ô ${cage.code}. Lịch tách ghép: +20 ngày.`,
          relatedCageCode: cage.code,
          actor: 'Phan Dũng'
        },
        ...(partner.history || [])
      ]
    };

    onUpdateCage(updatedCurrent, updatedPartner);
    showSuccess(`Đã bắt đầu ghép đôi giữa Ô ${cage.code} và Ô ${partner.code}`);
  };

  // 4. NGHIỆP VỤ TÁCH GHÉP (Ô CÁI -> THEO DÕI 45-60 NGÀY; Ô ĐỰC -> CHỜ ĐÁNH GIÁ 10 NGÀY TỰ ĐỘNG SẴN SÀNG GHÉP)
  const handleSeparateMating = () => {
    const todayStr = separationDate || new Date().toISOString().split('T')[0];
    const timestampStr = `${todayStr} ${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
    const partner = allCages.find(c => c.id === cage.partnerCageId);

    // Xác định ô nào là Cái, ô nào là Đực
    const isCurrentFemale = cage.code.includes('SS') || cage.gender === 'cai' || cage.gender === 'doi';

    const updatedCurrent: FarmCage = isCurrentFemale ? {
      ...cage,
      status: 'moi_tach_duc',
      statusLabel: 'Mới tách đực / Chờ kết quả',
      gender: 'cai',
      ratCount: 1,
      matingSeparationDate: todayStr,
      followupDurationDays: 45,
      expectedEvaluationDate: addDays(todayStr, 45),
      history: [
        {
          id: `his-${Date.now()}-sep1`,
          timestamp: timestampStr,
          eventType: 'tach_duc',
          summary: `Tách đực ${cage.partnerCageCode || ''}. Bắt đầu theo dõi kết quả thụ thai 45–60 ngày.`,
          relatedCageCode: cage.partnerCageCode,
          actor: 'Phan Dũng'
        },
        ...(cage.history || [])
      ]
    } : {
      ...cage,
      status: 'moi_tach_cai',
      statusLabel: 'Mới tách cái / Chờ đánh giá',
      gender: 'duc',
      ratCount: 1,
      matingSeparationDate: todayStr,
      history: [
        {
          id: `his-${Date.now()}-sep2`,
          timestamp: timestampStr,
          eventType: 'tach_cai',
          summary: `Tách cái ${cage.partnerCageCode || ''}. Nghỉ ngơi dưỡng sức (Sau 10 ngày hệ thống tự động Sẵn sàng ghép).`,
          relatedCageCode: cage.partnerCageCode,
          actor: 'Phan Dũng'
        },
        ...(cage.history || [])
      ]
    };

    let updatedPartner: FarmCage | undefined = undefined;
    if (partner) {
      updatedPartner = isCurrentFemale ? {
        ...partner,
        status: 'moi_tach_cai',
        statusLabel: 'Mới tách cái / Chờ đánh giá',
        gender: 'duc',
        ratCount: 1,
        matingSeparationDate: todayStr,
        history: [
          {
            id: `his-${Date.now()}-sep3`,
            timestamp: timestampStr,
            eventType: 'tach_cai',
            summary: `Đực trở về sau khi phối ở Ô ${cage.code}. Sau 10 ngày tự động Sẵn sàng ghép.`,
            relatedCageCode: cage.code,
            actor: 'Phan Dũng'
          },
          ...(partner.history || [])
        ]
      } : {
        ...partner,
        status: 'moi_tach_duc',
        statusLabel: 'Mới tách đực / Chờ kết quả',
        gender: 'cai',
        ratCount: 1,
        matingSeparationDate: todayStr,
        followupDurationDays: 45,
        expectedEvaluationDate: addDays(todayStr, 45),
        history: [
          {
            id: `his-${Date.now()}-sep4`,
            timestamp: timestampStr,
            eventType: 'tach_duc',
            summary: `Tách đực. Bắt đầu theo dõi thai 45–60 ngày.`,
            relatedCageCode: cage.code,
            actor: 'Phan Dũng'
          },
          ...(partner.history || [])
        ]
      };
    }

    onUpdateCage(updatedCurrent, updatedPartner);
    showSuccess(`Đã ghi nhận tách ghép. Ô Cái theo dõi 45–60 ngày, Ô Đực dưỡng sức 10 ngày.`);
  };

  // 5. XÁC NHẬN SINH CON (CHUYỂN SANG ĐANG NUOI CON)
  const handleConfirmBirth = (e: React.FormEvent) => {
    e.preventDefault();
    const todayStr = birthDate || new Date().toISOString().split('T')[0];
    const timestampStr = `${todayStr} ${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;

    const updated: FarmCage = {
      ...cage,
      status: 'dang_nuoi_con',
      statusLabel: 'Đang nuôi con',
      gender: 'cai',
      birthDate: todayStr,
      totalBornCount: totalBorn,
      livingBabyCount: livingBorn,
      ratCount: 1 + livingBorn,
      nursingCondition: 'Mẹ ôm con tốt, cho bú đều',
      history: [
        {
          id: `his-${Date.now()}-birth`,
          timestamp: timestampStr,
          eventType: 'sinh_con',
          summary: `Dúi mẹ sinh ${totalBorn} con (Sống khỏe: ${livingBorn} con). Bắt đầu quá trình nuôi con.`,
          actor: 'Phan Dũng'
        },
        ...cage.history
      ]
    };

    onUpdateCage(updated);
    showSuccess(`Đã ghi nhận sinh con thành công cho Ô ${cage.code} (${livingBorn} con non)`);
  };

  // 6. GHI NHẬN BỎ CON TRONG QUÁ TRÌNH NUÔI
  const handleRecordAbandonedBaby = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const currentLiving = cage.livingBabyCount || 0;
    if (currentLiving <= 0) return;

    const newLiving = currentLiving - 1;
    const updated: FarmCage = {
      ...cage,
      livingBabyCount: newLiving,
      abandonedBabyCount: (cage.abandonedBabyCount || 0) + 1,
      ratCount: 1 + newLiving,
      history: [
        {
          id: `his-${Date.now()}-abandon`,
          timestamp: `${todayStr} ${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`,
          eventType: 'bo_con',
          summary: `Ghi nhận hao hụt / mẹ bỏ 1 con non (Còn lại: ${newLiving} con non).`,
          actor: 'Phan Dũng'
        },
        ...cage.history
      ]
    };

    onUpdateCage(updated);
    showSuccess(`Đã cập nhật sự kiện hao hụt con non cho Ô ${cage.code}`);
  };

  // 7. TÁCH CON / CAI SỮA (CHUYỂN BABY SANG Ô BABY ĐÍCH + MẸ DƯỠNG 10 NGÀY)
  const handleWeanBabies = (e: React.FormEvent) => {
    e.preventDefault();
    let targetBabyCage = allCages.find(c => c.id === targetBabyCageId);
    if (!targetBabyCage) {
      targetBabyCage = allCages.find(c => c.areaKind === 'baby' && c.status === 'trong') ||
                       allCages.find(c => c.areaKind === 'baby');
    }

    const todayStr = weaningDate || new Date().toISOString().split('T')[0];
    const timestampStr = `${todayStr} ${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;

    // Ô Mẹ chuyển sang Mới tách con / Đang dưỡng (Chu kỳ 10 ngày kiểm tra sức khỏe)
    const updatedMother: FarmCage = {
      ...cage,
      status: 'moi_tach_con',
      statusLabel: 'Mới tách con / Đang dưỡng',
      gender: 'cai',
      ratCount: 1,
      livingBabyCount: 0,
      weaningDate: todayStr,
      weanedBabyCount: weanedCount,
      weanedBabyWeightAvg: weanedWeightAvg,
      weanedBabyGroup: weanedGroup,
      targetBabyCageCode: targetBabyCage?.code,
      postWeaningHealthChecked: false,
      history: [
        {
          id: `his-${Date.now()}-wean-mom`,
          timestamp: timestampStr,
          eventType: 'tach_con',
          summary: `Tách ${weanedCount} con non (${weanedWeightAvg}kg, nhóm ${weanedGroup}) ${targetBabyCage ? `chuyển sang Ô ${targetBabyCage.code}` : ''}. Mẹ bắt đầu chu kỳ dưỡng 10 ngày.`,
          relatedCageCode: targetBabyCage?.code,
          actor: 'Phan Dũng'
        },
        ...(cage.history || [])
      ]
    };

    // Ô Baby đích nếu có (Tự cộng số lượng theo chuẩn đặc tả)
    let updatedBabyCage: FarmCage | undefined = undefined;
    if (targetBabyCage && targetBabyCage.id !== cage.id) {
      const currentCount = targetBabyCage.status === 'trong' ? 0 : (targetBabyCage.ratCount || 0);
      updatedBabyCage = {
        ...targetBabyCage,
        status: 'dang_nuoi_baby',
        statusLabel: 'Đang nuôi Baby',
        gender: 'dan',
        babyGroup: weanedGroup,
        entryDate: todayStr,
        ratCount: currentCount + weanedCount,
        currentWeightKg: weanedWeightAvg,
        species: cage.species || 'moc_dai',
        history: [
          {
            id: `his-${Date.now()}-wean-baby`,
            timestamp: timestampStr,
            eventType: 'chuyen_baby',
            summary: `Tiếp nhận ${weanedCount} dúi con từ mẹ Ô ${cage.code} (Trọng lượng TB: ${weanedWeightAvg} kg, nhóm ${weanedGroup}).`,
            relatedCageCode: cage.code,
            actor: 'Phan Dũng'
          },
          ...(targetBabyCage.history || [])
        ]
      };
    }

    onUpdateCage(updatedMother, updatedBabyCage);
    showSuccess(`Đã tách ${weanedCount} con non sang Khu Baby (Ô ${targetBabyCage?.code || 'Baby'}). Mẹ chuyển sang chế độ dưỡng 10 ngày.`);
  };

  // 8. XÁC NHẬN KIỂM TRA SỨC KHỎE SAU TÁCH CON (NGÀY 10 ĐẠT -> SẴN SÀNG GHÉP)
  const handleConfirmPostWeaningHealthPassed = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const timestampStr = `${todayStr} ${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;

    const updated: FarmCage = {
      ...cage,
      status: 'san_sang_ghep',
      statusLabel: 'Sẵn sàng ghép',
      gender: 'cai',
      postWeaningHealthChecked: true,
      history: [
        {
          id: `his-${Date.now()}-pass`,
          timestamp: timestampStr,
          eventType: 'cap_nhat_trang_thai',
          summary: `Kiểm tra sức khỏe ngày thứ 10 sau tách con ĐẠT yêu cầu. Chuyển sang Sẵn sàng ghép.`,
          actor: 'Phan Dũng'
        },
        ...cage.history
      ]
    };

    onUpdateCage(updated);
    showSuccess(`Đã xác nhận sức khỏe đạt cho Ô Cái ${cage.code} -> Sẵn sàng ghép!`);
  };

  // 9. CHUYỂN VÀO KHU ĐIỀU TRỊ BỆNH
  const handleTransferToTreatment = (e: React.FormEvent) => {
    e.preventDefault();
    const targetTreatment = allCages.find(c => c.id === targetTreatmentCageId);
    if (!targetTreatment) return;

    const todayStr = detectionDate || new Date().toISOString().split('T')[0];
    const timestampStr = `${todayStr} ${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
    const remainingCount = Math.max(0, cage.ratCount - treatmentQuantity);

    // Ô Nguồn (Trừ đúng số lượng chuyển, nếu còn 0 thì tự Trống)
    const updatedSource: FarmCage = {
      ...cage,
      ratCount: remainingCount,
      status: remainingCount === 0 ? 'trong' : cage.status,
      statusLabel: remainingCount === 0 ? 'Trống' : cage.statusLabel,
      history: [
        {
          id: `his-${Date.now()}-treat-source`,
          timestamp: timestampStr,
          eventType: 'chuyen_dieu_tri',
          summary: `Phát hiện bệnh: ${diseaseType}. Chuyển ${treatmentQuantity} cá thể sang Ô Điều trị ${targetTreatment.code}.`,
          relatedCageCode: targetTreatment.code,
          actor: 'Phan Dũng'
        },
        ...(cage.history || [])
      ]
    };

    // Ô Điều trị (Tiếp nhận & lưu đầy đủ thông tin nguồn theo đặc tả 7.1)
    const updatedTreatment: FarmCage = {
      ...targetTreatment,
      status: 'dang_dieu_tri',
      statusLabel: 'Đang điều trị',
      gender: cage.gender,
      species: cage.species,
      ratCount: targetTreatment.ratCount + treatmentQuantity,
      treatmentDiseaseType: diseaseType,
      treatmentDetectionDate: detectionDate,
      treatmentTransferDate: todayStr,
      sourceAreaId: cage.areaId,
      sourceAreaCode: cage.areaCode,
      sourceRowId: cage.rowId,
      sourceRowCode: cage.rowCode,
      sourceCageId: cage.id,
      sourceCageCode: cage.code,
      treatmentProtocol: treatmentProtocol,
      treatmentMedicine: treatmentMedicine,
      treatmentDuration: treatmentDuration,
      treatmentNextExamDate: treatmentExamDate,
      history: [
        {
          id: `his-${Date.now()}-treat-dest`,
          timestamp: timestampStr,
          eventType: 'chuyen_dieu_tri',
          summary: `Tiếp nhận ${treatmentQuantity} cá thể từ Ô ${cage.code} (${cage.areaCode}). Bệnh: ${diseaseType}. Phác đồ: ${treatmentProtocol}. Tái khám: ${formatDateVN(treatmentExamDate)}.`,
          relatedCageCode: cage.code,
          actor: 'Phan Dũng'
        },
        ...(targetTreatment.history || [])
      ]
    };

    onUpdateCage(updatedSource, updatedTreatment);
    showSuccess(`Đã chuyển ${treatmentQuantity} cá thể sang Ô Điều trị ${targetTreatment.code}`);
  };

  // 10. THEO DÕI TRONG ĐIỀU TRỊ (LƯU NHIỀU LẦN VÀO LỊCH SỬ)
  const handleAddTreatmentFollowup = (e: React.FormEvent) => {
    e.preventDefault();
    const todayStr = new Date().toISOString().split('T')[0];
    const newFollowup: TreatmentFollowupRecord = {
      id: `tf-${Date.now()}`,
      date: todayStr,
      progression: followupProgression,
      medicine: followupMedicine,
      healthState: followupState,
      nextFollowupDate: followupNextDate
    };

    const updated: FarmCage = {
      ...cage,
      treatmentNextExamDate: followupNextDate,
      treatmentFollowups: [newFollowup, ...(cage.treatmentFollowups || [])],
      history: [
        {
          id: `his-${Date.now()}-followup`,
          timestamp: `${todayStr} ${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`,
          eventType: 'kham_suc_khoe',
          summary: `Theo dõi điều trị: ${followupProgression} (Trạng thái: ${followupState}, Ngày hẹn tiếp: ${formatDateVN(followupNextDate)})`,
          actor: 'Phan Dũng'
        },
        ...cage.history
      ]
    };

    onUpdateCage(updated);
    showSuccess(`Đã lưu nhật ký theo dõi ca bệnh Ô ${cage.code}`);
  };

  // 11. ĐÁNH GIÁ SAU ĐIỀU TRỊ (3 HƯỚNG CHỐT THEO ĐẶC TẢ 7.3)
  // Hướng 1: Hồi phục tốt -> về Ô cũ
  const handleReturnToOldCage = () => {
    const oldCage = allCages.find(c => c.id === cage.sourceCageId || c.code === cage.sourceCageCode);
    const todayStr = new Date().toISOString().split('T')[0];
    const timestampStr = `${todayStr} ${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
    const remainingInTreatment = Math.max(0, cage.ratCount - recoveryReturnCount);

    // Ô Điều trị hiện tại
    const updatedTreatment: FarmCage = {
      ...cage,
      ratCount: remainingInTreatment,
      status: remainingInTreatment === 0 ? 'trong' : 'dang_dieu_tri',
      statusLabel: remainingInTreatment === 0 ? 'Trống' : 'Đang điều trị',
      history: [
        {
          id: `his-${Date.now()}-ret-t`,
          timestamp: timestampStr,
          eventType: 'hoi_phuc_ve_cu',
          summary: `Hồi phục tốt. Chuyển ${recoveryReturnCount} cá thể trở về Ô cũ ${cage.sourceCageCode || ''}.`,
          relatedCageCode: cage.sourceCageCode,
          actor: 'Phan Dũng'
        },
        ...(cage.history || [])
      ]
    };

    // Ô cũ tiếp nhận lại
    let updatedOldCage: FarmCage | undefined = undefined;
    if (oldCage) {
      updatedOldCage = {
        ...oldCage,
        ratCount: oldCage.ratCount + recoveryReturnCount,
        status: oldCage.status === 'trong' ? 'san_sang_ghep' : oldCage.status,
        statusLabel: oldCage.status === 'trong' ? 'Sẵn sàng ghép' : oldCage.statusLabel,
        history: [
          {
            id: `his-${Date.now()}-ret-old`,
            timestamp: timestampStr,
            eventType: 'hoi_phuc_ve_cu',
            summary: `Đón ${recoveryReturnCount} cá thể đã điều trị hồi phục hoàn toàn từ Ô ${cage.code}.`,
            relatedCageCode: cage.code,
            actor: 'Phan Dũng'
          },
          ...(oldCage.history || [])
        ]
      };
    }

    onUpdateCage(updatedTreatment, updatedOldCage);
    showSuccess(`Đã chuyển cá thể hồi phục trở về Ô cũ ${cage.sourceCageCode || ''}`);
  };

  // Hướng 2: Hồi phục nhưng hết khả năng sinh sản -> Chuyển Thương Phẩm
  const handleTransferToCommercial = () => {
    const targetCommercial = allCages.find(c => c.id === targetCommercialCageId);
    if (!targetCommercial) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const timestampStr = `${todayStr} ${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
    const remainingInTreatment = Math.max(0, cage.ratCount - recoveryReturnCount);

    const updatedTreatment: FarmCage = {
      ...cage,
      ratCount: remainingInTreatment,
      status: remainingInTreatment === 0 ? 'trong' : 'dang_dieu_tri',
      statusLabel: remainingInTreatment === 0 ? 'Trống' : 'Đang điều trị',
      history: [
        {
          id: `his-${Date.now()}-comm-t`,
          timestamp: timestampStr,
          eventType: 'hoi_phuc_chuyen_thuong_pham',
          summary: `Hồi phục nhưng mất khả năng sinh sản. Chuyển ${recoveryReturnCount} cá thể sang Ô Thương phẩm ${targetCommercial.code}.`,
          relatedCageCode: targetCommercial.code,
          actor: 'Phan Dũng'
        },
        ...(cage.history || [])
      ]
    };

    const updatedCommercial: FarmCage = {
      ...targetCommercial,
      status: 'dang_nuoi_thuong_pham',
      statusLabel: 'Đang nuôi thương phẩm',
      ratCount: targetCommercial.ratCount + recoveryReturnCount,
      history: [
        {
          id: `his-${Date.now()}-comm-dest`,
          timestamp: timestampStr,
          eventType: 'hoi_phuc_chuyen_thuong_pham',
          summary: `Tiếp nhận ${recoveryReturnCount} cá thể hậu điều trị từ Ô ${cage.code} sang vỗ béo thương phẩm.`,
          relatedCageCode: cage.code,
          actor: 'Phan Dũng'
        },
        ...(targetCommercial.history || [])
      ]
    };

    onUpdateCage(updatedTreatment, updatedCommercial);
    showSuccess(`Đã chuyển cá thể sang Ô Thương phẩm ${targetCommercial.code}`);
  };

  // Hướng 3: Ghi nhận chết (Trừ số lượng chết, nếu còn 0 thì tự Trống)
  const handleRecordDeath = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const timestampStr = `${todayStr} ${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
    const remainingCount = Math.max(0, cage.ratCount - deathCount);

    const updated: FarmCage = {
      ...cage,
      ratCount: remainingCount,
      status: remainingCount === 0 ? 'trong' : cage.status,
      statusLabel: remainingCount === 0 ? 'Trống' : cage.statusLabel,
      history: [
        {
          id: `his-${Date.now()}-death`,
          timestamp: timestampStr,
          eventType: 'ghi_nhan_chet',
          summary: `Ghi nhận chết ${deathCount} cá thể. Nguyên nhân: ${deathReason}. Số lượng còn lại: ${remainingCount}.`,
          actor: 'Phan Dũng'
        },
        ...cage.history
      ]
    };

    onUpdateCage(updated);
    showSuccess(`Đã ghi nhận ${deathCount} cá thể tử vong cho Ô ${cage.code}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header Hồ Sơ Ô */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-mono font-black text-sm shadow-xs">
              {cage.code}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm">Hồ Sơ Ô Chuồng {cage.code}</h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  cage.status === 'trong'
                    ? 'bg-slate-200 text-slate-700'
                    : cage.status === 'dang_dieu_tri'
                    ? 'bg-rose-100 text-rose-800'
                    : cage.status === 'ghep_doi'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {cage.statusLabel}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono">
                {cage.areaCode} • {cage.rowCode} • {cage.ratCount} cá thể
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {userRole === 'admin' ? (
              <>
                <button
                  onClick={() => setShowEditModal(true)}
                  className="p-2 rounded-xl hover:bg-slate-200 text-slate-600 hover:text-emerald-700 transition-colors cursor-pointer"
                  title="Sửa thông tin ô này (Quản Trị)"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                {onDeleteCage && (
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="p-2 rounded-xl hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    title="Xóa ô này (Quản Trị)"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={() => onOpenAdminLogin?.('Chỉnh sửa thông tin ô chuồng yêu cầu quyền Quản Trị Viên')}
                className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-amber-50 text-slate-500 hover:text-amber-800 text-[11px] font-semibold flex items-center gap-1 border border-slate-200 cursor-pointer"
                title="Đăng nhập quản trị để sửa ô"
              >
                <Lock className="w-3 h-3 text-slate-400" />
                <span>Khách Xem</span>
              </button>
            )}
            <button
              onClick={() => onOpenQR(cage)}
              className="p-2 rounded-xl hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              title="Xem & in mã QR ô chuồng"
            >
              <QrCode className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Thông báo thành công nếu có */}
        {actionSuccessMsg && (
          <div className="px-4 py-2 bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 transition-all">
            <CheckCircle2 className="w-4 h-4" />
            <span>{actionSuccessMsg}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="px-4 border-b border-slate-200 flex gap-2 overflow-x-auto text-xs font-bold text-slate-600 bg-white">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'overview' ? 'border-emerald-600 text-emerald-700' : 'border-transparent hover:text-slate-900'
            }`}
          >
            📋 Tổng quan Ô
          </button>

          <button
            onClick={() => setActiveTab('actions')}
            className={`py-3 px-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'actions' ? 'border-emerald-600 text-emerald-700' : 'border-transparent hover:text-slate-900'
            }`}
          >
            ⚡ Nghiệp vụ chuyên sâu
          </button>

          <button
            onClick={() => setActiveTab('weight')}
            className={`py-3 px-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'weight' ? 'border-emerald-600 text-emerald-700' : 'border-transparent hover:text-slate-900'
            }`}
          >
            ⚖️ Trọng lượng ({(cage.weightHistory || []).length})
          </button>

          <button
            onClick={() => setActiveTab('health')}
            className={`py-3 px-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'health' ? 'border-emerald-600 text-emerald-700' : 'border-transparent hover:text-slate-900'
            }`}
          >
            🩺 Sức khỏe ({(cage.healthHistory || []).length})
          </button>

          {cage.areaKind === 'dieu_tri' && (
            <button
              onClick={() => setActiveTab('treatment')}
              className={`py-3 px-2 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'treatment' ? 'border-rose-600 text-rose-700' : 'border-transparent hover:text-slate-900'
              }`}
            >
              🏥 Bệnh án thú y
            </button>
          )}

          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 px-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'history' ? 'border-emerald-600 text-emerald-700' : 'border-transparent hover:text-slate-900'
            }`}
          >
            📜 Lịch sử ({(cage.history || []).length})
          </button>
        </div>

        {/* Tab Body Contents */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 text-xs space-y-4">
          {/* TAB 1: TỔNG QUAN Ô */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Số lượng</span>
                  <span className="text-lg font-black text-slate-900 font-mono">{cage.ratCount} cá thể</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Giới tính</span>
                  <span className="text-sm font-bold text-slate-800">
                    {cage.gender === 'duc' 
                      ? (cage.areaKind === 'hau_bi' ? '♂ Hậu bị Đực tuyển' : '♂ Đực giống') 
                      : cage.gender === 'cai' 
                        ? (cage.areaKind === 'hau_bi' ? '♀ Hậu bị Cái tuyển' : '♀ Cái sinh sản') 
                        : cage.gender === 'doi' 
                          ? '⚤ Cặp phối' 
                          : 'Đàn'}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Trọng lượng</span>
                  <span className="text-lg font-black text-emerald-800 font-mono">{cage.currentWeightKg || '---'} kg</span>
                </div>
              </div>

              {/* Thông tin nghiệp vụ phụ thuộc trạng thái */}
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
                <h4 className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-emerald-700" />
                  <span>Trạng thái kỹ thuật hiện tại: {cage.statusLabel}</span>
                </h4>

                {cage.status === 'ghep_doi' && (
                  <p className="text-slate-700">
                    Đang ghép đôi cùng Ô <strong>{cage.partnerCageCode || '---'}</strong> từ ngày <strong>{formatDateVN(cage.matingDate)}</strong>. 
                    {cage.matingDate ? (
                      <> Lịch tách ghép dự kiến (+20 ngày): <strong>{formatDateVN(addDays(cage.matingDate, 20))}</strong>.</>
                    ) : null}
                  </p>
                )}

                {cage.status === 'moi_tach_duc' && (
                  <p className="text-slate-700">
                    Đã tách đực ngày <strong>{formatDateVN(cage.matingSeparationDate)}</strong>. 
                    Đang theo dõi kết quả thai trong 45–60 ngày (Dự kiến đánh giá: <strong>{formatDateVN(cage.expectedEvaluationDate)}</strong>).
                  </p>
                )}

                {cage.status === 'moi_tach_cai' && (
                  <p className="text-slate-700">
                    Đực tách cái ngày <strong>{formatDateVN(cage.matingSeparationDate)}</strong>. 
                    Hệ thống sẽ <strong>tự động chuyển Sẵn sàng ghép</strong> sau đủ 10 ngày nghỉ ngơi.
                  </p>
                )}

                {cage.status === 'moi_tach_con' && (
                  <p className="text-slate-700">
                    Mẹ tách con ngày <strong>{formatDateVN(cage.weaningDate)}</strong> ({cage.weanedBabyCount} con non). 
                    Đang ở chu kỳ dưỡng 10 ngày. Ngày thứ 9 cảnh báo, ngày thứ 10 kiểm tra sức khỏe đạt mới xác nhận Sẵn sàng ghép.
                  </p>
                )}

                {cage.status === 'dang_nuoi_con' && (
                  <p className="text-slate-700">
                    Sinh ngày <strong>{formatDateVN(cage.birthDate)}</strong>. 
                    Tổng sinh: {cage.totalBornCount} con • Đang nuôi sống: <strong>{cage.livingBabyCount}</strong> con non.
                  </p>
                )}
              </div>

              {cage.notes && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold block mb-1">Ghi chú</span>
                  <p className="text-slate-700">{cage.notes}</p>
                </div>
              )}

              {/* Nút sửa thông tin nhanh & Nút xóa ô */}
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(true)}
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Sửa Thông Tin Ô ({cage.code})</span>
                </button>
                {onDeleteCage && (
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(true)}
                    className="w-full py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Xóa Ô Chuồng ({cage.code})</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: NGHIỆP VỤ CHUYÊN SÂU THEO ĐẶC TẢ */}
          {activeTab === 'actions' && (
            <div className="space-y-4">
              {/* KHU SINH SẢN ACTIONS */}
              {cage.areaKind === 'sinh_san' && (
                <div className="space-y-4">
                  {/* Action A: Ghép đôi nếu Sẵn sàng ghép */}
                  {cage.status === 'san_sang_ghep' && (
                    <form onSubmit={handlePairMating} className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/40 space-y-3">
                      <h4 className="font-bold text-emerald-900 flex items-center gap-1.5">
                        <Heart className="w-4 h-4 text-emerald-700" />
                        <span>Ghép Đôi Phối Giống (Tự Động Tạo Việc +20 Ngày)</span>
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">
                            Chọn Ô Đối Tác ({cage.gender === 'cai' ? '♂ Đực' : '♀ Cái'}) *
                          </label>
                          <select
                            value={selectedPartnerId}
                            onChange={e => setSelectedPartnerId(e.target.value)}
                            required
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:border-emerald-600 focus:outline-hidden"
                          >
                            <option value="">-- Chọn ô đối tác --</option>
                            {availablePartners.map(p => (
                              <option key={p.id} value={p.id}>
                                Ô {p.code} ({p.gender === 'duc' ? 'Đực' : 'Cái'} • {p.currentWeightKg || 0}kg)
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Ngày Bắt Đầu Ghép *</label>
                          <input
                            type="date"
                            value={matingDate}
                            onChange={e => setMatingDate(e.target.value)}
                            required
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:border-emerald-600 focus:outline-hidden"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={!selectedPartnerId}
                        className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold transition-colors shadow-xs"
                      >
                        Xác Nhận Ghép Đôi & Lên Lịch +20 Ngày
                      </button>
                    </form>
                  )}

                  {/* Action B: Tách ghép nếu đang Ghép đôi */}
                  {cage.status === 'ghep_doi' && (
                    <div className="p-4 rounded-2xl border border-purple-200 bg-purple-50/40 space-y-3">
                      <h4 className="font-bold text-purple-900 flex items-center gap-1.5">
                        <ArrowRightLeft className="w-4 h-4 text-purple-700" />
                        <span>Tách Ghép & Phân Luồng Theo Dõi</span>
                      </h4>
                      <p className="text-slate-600">
                        Khi tách: Ô Cái sẽ chuyển sang <em>Mới tách đực / Chờ kết quả (45-60 ngày)</em>; Ô Đực sẽ chuyển sang <em>Mới tách cái / Chờ đánh giá (Sau 10 ngày tự động Sẵn sàng ghép)</em>.
                      </p>

                      <div className="flex gap-2">
                        <input
                          type="date"
                          value={separationDate}
                          onChange={e => setSeparationDate(e.target.value)}
                          className="px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-hidden"
                        />
                        <button
                          onClick={handleSeparateMating}
                          className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition-colors"
                        >
                          Xác Nhận Tách Ghép Ngay
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Action C: Xác nhận Sinh con hoặc Không đậu thai nếu đang Mới tách đực */}
                  {cage.status === 'moi_tach_duc' && (
                    <form onSubmit={handleConfirmBirth} className="p-4 rounded-2xl border border-amber-200 bg-amber-50/40 space-y-3">
                      <h4 className="font-bold text-amber-900 flex items-center gap-1.5">
                        <span>🍼</span>
                        <span>Xác Nhận Kết Quả Sinh Con</span>
                      </h4>

                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Ngày sinh</label>
                          <input
                            type="date"
                            value={birthDate}
                            onChange={e => setBirthDate(e.target.value)}
                            required
                            className="w-full px-2 py-1.5 rounded-xl border border-slate-300 bg-white"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Tổng con sinh</label>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={totalBorn}
                            onChange={e => setTotalBorn(parseInt(e.target.value) || 1)}
                            required
                            className="w-full px-2 py-1.5 rounded-xl border border-slate-300 bg-white"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Số con sống</label>
                          <input
                            type="number"
                            min="0"
                            max={totalBorn}
                            value={livingBorn}
                            onChange={e => setLivingBorn(parseInt(e.target.value) || 0)}
                            required
                            className="w-full px-2 py-1.5 rounded-xl border border-slate-300 bg-white"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 pt-1">
                        <button
                          type="submit"
                          className="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition-colors"
                        >
                          Xác Nhận Sinh Con → Nuôi Con
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const updated: FarmCage = {
                              ...cage,
                              status: 'san_sang_ghep',
                              statusLabel: 'Sẵn sàng ghép',
                              history: [
                                {
                                  id: `his-${Date.now()}`,
                                  timestamp: `${new Date().toISOString().split('T')[0]} 08:00`,
                                  eventType: 'cap_nhat_trang_thai',
                                  summary: 'Đánh giá không đậu thai. Chuyển lại Sẵn sàng ghép.',
                                  actor: 'Phan Dũng'
                                },
                                ...cage.history
                              ]
                            };
                            onUpdateCage(updated);
                            showSuccess('Đã cập nhật: Không đậu thai -> Sẵn sàng ghép.');
                          }}
                          className="px-3 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold"
                        >
                          Không Đậu Thai
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Action D: Tách con (Cai sữa) nếu đang Đang nuôi con */}
                  {cage.status === 'dang_nuoi_con' && (
                    <form onSubmit={handleWeanBabies} className="p-4 rounded-2xl border border-teal-200 bg-teal-50/40 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-teal-900 flex items-center gap-1.5">
                          <span>📦</span>
                          <span>Tách Con / Cai Sữa (Chuyển Sang Khu Baby)</span>
                        </h4>
                        <button
                          type="button"
                          onClick={handleRecordAbandonedBaby}
                          className="text-[10px] text-rose-700 hover:underline font-bold"
                        >
                          Ghi nhận bỏ con (-1)
                        </button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Số con tách</label>
                          <input
                            type="number"
                            min="1"
                            value={weanedCount}
                            onChange={e => setWeanedCount(parseInt(e.target.value) || 1)}
                            className="w-full px-2 py-1.5 rounded-xl border border-slate-300 bg-white"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">TL TB (kg)</label>
                          <input
                            type="number"
                            step="0.05"
                            value={weanedWeightAvg}
                            onChange={e => setWeanedWeightAvg(parseFloat(e.target.value) || 0.35)}
                            className="w-full px-2 py-1.5 rounded-xl border border-slate-300 bg-white"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Nhóm Baby</label>
                          <select
                            value={weanedGroup}
                            onChange={e => setWeanedGroup(e.target.value as BabyWeightGroup)}
                            className="w-full px-2 py-1.5 rounded-xl border border-slate-300 bg-white"
                          >
                            <option value="3_4_lang">3–4 lạng</option>
                            <option value="5_7_lang">5–7 lạng</option>
                            <option value="8_lang_1_1_kg">8 lạng–1,1 kg</option>
                          </select>
                        </div>
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Ô Baby Đích</label>
                          <select
                            value={targetBabyCageId}
                            onChange={e => setTargetBabyCageId(e.target.value)}
                            className="w-full px-2 py-1.5 rounded-xl border border-slate-300 bg-white"
                          >
                            <option value="">-- Chọn ô Baby --</option>
                            {availableBabyCages.map(b => (
                              <option key={b.id} value={b.id}>Ô {b.code} ({b.ratCount} con)</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold transition-colors"
                      >
                        Xác Nhận Tách Con → Mẹ Dưỡng 10 Ngày
                      </button>
                    </form>
                  )}

                  {/* Action E: Xác nhận ngày 10 sau tách con đạt sức khỏe */}
                  {cage.status === 'moi_tach_con' && (
                    <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 space-y-2.5">
                      <h4 className="font-bold text-emerald-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                        <span>Kiểm Tra Sức Khỏe Phục Vụ Ghép Lại (Chu kỳ 10 ngày)</span>
                      </h4>
                      <p className="text-slate-600">
                        Theo đặc tả: Ngày 9 cảnh báo, ngày 10 đến hạn. Chỉ khi kiểm tra đạt và người quản lý xác nhận thì Ô Cái mới chuyển <em>Sẵn sàng ghép</em>.
                      </p>
                      <button
                        onClick={handleConfirmPostWeaningHealthPassed}
                        className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors shadow-xs"
                      >
                        Xác Nhận Sức Khỏe Đạt → Chuyển Sẵn Sàng Ghép
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* CHUYỂN ĐIỀU TRỊ BỆNH (Áp dụng cho mọi ô có cá thể khi phát hiện bệnh) */}
              {cage.ratCount > 0 && cage.areaKind !== 'dieu_tri' && (
                <form onSubmit={handleTransferToTreatment} className="p-4 rounded-2xl border border-rose-200 bg-rose-50/40 space-y-3">
                  <h4 className="font-bold text-rose-900 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-700" />
                    <span>Phát Hiện Bệnh & Chuyển Sang Khu Điều Trị (KHU-DT)</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Loại Bệnh / Vấn Đề *</label>
                      <input
                        type="text"
                        value={diseaseType}
                        onChange={e => setDiseaseType(e.target.value)}
                        required
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white"
                        placeholder="VD: Rối loạn tiêu hóa, viêm phổi..."
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Chọn Ô Điều Trị Đích *</label>
                      <select
                        value={targetTreatmentCageId}
                        onChange={e => setTargetTreatmentCageId(e.target.value)}
                        required
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white"
                      >
                        <option value="">-- Chọn ô tại KHU-DT --</option>
                        {availableTreatmentCages.map(t => (
                          <option key={t.id} value={t.id}>Ô {t.code} ({t.statusLabel})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Số lượng chuyển</label>
                      <input
                        type="number"
                        min="1"
                        max={cage.ratCount}
                        value={treatmentQuantity}
                        onChange={e => setTreatmentQuantity(parseInt(e.target.value) || 1)}
                        className="w-full px-2 py-1.5 rounded-xl border border-slate-300 bg-white"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Thời gian điều trị</label>
                      <input
                        type="text"
                        value={treatmentDuration}
                        onChange={e => setTreatmentDuration(e.target.value)}
                        className="w-full px-2 py-1.5 rounded-xl border border-slate-300 bg-white"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Ngày tái khám</label>
                      <input
                        type="date"
                        value={treatmentExamDate}
                        onChange={e => setTreatmentExamDate(e.target.value)}
                        className="w-full px-2 py-1.5 rounded-xl border border-slate-300 bg-white"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!targetTreatmentCageId}
                    className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold transition-colors shadow-xs"
                  >
                    Xác Nhận Cách Ly & Chuyển Sang KHU-DT
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: TRỌNG LƯỢNG NỀN (CÓ LỊCH SỬ NHIỀU LẦN) */}
          {activeTab === 'weight' && (
            <div className="space-y-4">
              <form onSubmit={handleAddWeight} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-emerald-700" />
                  <span>Cập Nhật Cân Nặng Mới</span>
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Trọng lượng (kg) *</label>
                    <input
                      type="number"
                      step="0.05"
                      placeholder="VD: 2.8"
                      value={newWeight}
                      onChange={e => setNewWeight(e.target.value)}
                      required
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Ghi chú</label>
                    <input
                      type="text"
                      placeholder="VD: Tăng 2 lạng sau 10 ngày"
                      value={weightNote}
                      onChange={e => setWeightNote(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors"
                >
                  Lưu Trọng Lượng
                </button>
              </form>

              <div className="space-y-2">
                <span className="font-bold text-slate-800 block">Lịch sử cân định kỳ ({(cage.weightHistory || []).length})</span>
                {(cage.weightHistory || []).length === 0 ? (
                  <p className="text-slate-400 italic">Chưa có bản ghi cân nặng nào.</p>
                ) : (
                  <div className="space-y-1.5">
                    {(cage.weightHistory || []).map(w => (
                      <div key={w.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                        <div>
                          <strong className="font-mono text-emerald-800 text-sm">{w.weightKg} kg</strong>
                          {w.note && <span className="text-slate-500 text-[11px] ml-2">({w.note})</span>}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">{formatDateVN(w.date)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: SỨC KHỎE NỀN (CÓ LỊCH SỬ) */}
          {activeTab === 'health' && (
            <div className="space-y-4">
              <form onSubmit={handleAddHealth} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-emerald-700" />
                  <span>Kiểm Tra Thể Trạng Sức Khỏe</span>
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Tình trạng</label>
                    <select
                      value={healthStatus}
                      onChange={e => setHealthStatus(e.target.value as any)}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white"
                    >
                      <option value="khoe_manh">Khỏe mạnh, lanh lợi</option>
                      <option value="binh_thuong">Bình thường</option>
                      <option value="kem">Hơi kém / Ăn ít</option>
                      <option value="dau_om">Đau ốm / Cần theo dõi</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Triệu chứng</label>
                    <input
                      type="text"
                      placeholder="VD: Răng mọc đều, mắt sáng..."
                      value={healthSymptoms}
                      onChange={e => setHealthSymptoms(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors"
                >
                  Lưu Đánh Giá Sức Khỏe
                </button>
              </form>

              <div className="space-y-2">
                <span className="font-bold text-slate-800 block">Lịch sử theo dõi sức khỏe ({(cage.healthHistory || []).length})</span>
                {(cage.healthHistory || []).length === 0 ? (
                  <p className="text-slate-400 italic">Chưa có bản ghi sức khỏe nào.</p>
                ) : (
                  (cage.healthHistory || []).map(h => (
                    <div key={h.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className={`font-bold px-2 py-0.5 rounded-md text-[10px] ${
                          h.status === 'khoe_manh' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {h.status.toUpperCase()}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{formatDateVN(h.date)}</span>
                      </div>
                      {h.notes && <p className="text-slate-600 text-[11px]">{h.notes}</p>}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 5: BỆNH ÁN THÚ Y (DÀNH RIÊNG CHO KHU ĐIỀU TRỊ - ĐẶC TẢ 7.1 -> 7.6) */}
          {activeTab === 'treatment' && cage.areaKind === 'dieu_tri' && (
            <div className="space-y-4">
              {/* Thông tin ca bệnh nguồn */}
              <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-2">
                <h4 className="font-bold text-rose-900 flex items-center justify-between">
                  <span>Ca bệnh: {cage.treatmentDiseaseType}</span>
                  <span className="text-[10px] font-normal text-rose-700">Tiếp nhận: {formatDateVN(cage.treatmentTransferDate)}</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-slate-700">
                  <div>Nguồn: <strong>Ô {cage.sourceCageCode}</strong> ({cage.sourceAreaCode})</div>
                  <div>Phác đồ: <strong>{cage.treatmentProtocol}</strong></div>
                  <div>Thuốc: <strong>{cage.treatmentMedicine}</strong></div>
                </div>
              </div>

              {/* Form ghi nhận theo dõi trong điều trị (Đặc tả 7.2) */}
              <form onSubmit={handleAddTreatmentFollowup} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                <h5 className="font-bold text-slate-900">Ghi Nhận Diễn Biến Điều Trị Mới</h5>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Diễn biến bệnh</label>
                    <input
                      type="text"
                      value={followupProgression}
                      onChange={e => setFollowupProgression(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-xl border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Ngày tái khám tiếp</label>
                    <input
                      type="date"
                      value={followupNextDate}
                      onChange={e => setFollowupNextDate(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-xl border border-slate-300 bg-white"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold transition-colors"
                >
                  Lưu Theo Dõi & Lên Lịch Tái Khám
                </button>
              </form>

              {/* 3 HƯỚNG ĐÁNH GIÁ SAU ĐIỀU TRỊ CHỐT THEO ĐẶC TẢ 7.3 */}
              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-3">
                <h5 className="font-bold text-amber-900">Đánh Giá & Xử Lý Sau Điều Trị (3 Hướng Chốt)</h5>

                <div className="space-y-2">
                  {/* Hướng 1: Hồi phục tốt -> về Ô cũ */}
                  <div className="p-3 rounded-xl bg-white border border-emerald-200 flex items-center justify-between">
                    <div>
                      <strong className="text-emerald-900 block font-bold">1. Hồi phục tốt → Trở về Ô cũ ({cage.sourceCageCode || 'Nguồn'})</strong>
                      <span className="text-[11px] text-slate-500">Cộng số lượng về ô cũ, trừ khỏi ô điều trị.</span>
                    </div>
                    <button
                      onClick={handleReturnToOldCage}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                    >
                      Chuyển Về Ô Cũ
                    </button>
                  </div>

                  {/* Hướng 2: Hết khả năng sinh sản -> Thương phẩm */}
                  <div className="p-3 rounded-xl bg-white border border-blue-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <strong className="text-blue-900 block font-bold">2. Hết khả năng sinh sản → Thương phẩm</strong>
                        <span className="text-[11px] text-slate-500">Chuyển vỗ béo thịt, ô cũ giữ 0 & trống.</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={targetCommercialCageId}
                        onChange={e => setTargetCommercialCageId(e.target.value)}
                        className="flex-1 px-2 py-1 rounded-xl border border-slate-300 text-[11px]"
                      >
                        <option value="">-- Chọn Ô Thương Phẩm --</option>
                        {availableCommercialCages.map(c => (
                          <option key={c.id} value={c.id}>Ô {c.code}</option>
                        ))}
                      </select>
                      <button
                        onClick={handleTransferToCommercial}
                        disabled={!targetCommercialCageId}
                        className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold"
                      >
                        Chuyển Thương Phẩm
                      </button>
                    </div>
                  </div>

                  {/* Hướng 3: Chết */}
                  <div className="p-3 rounded-xl bg-white border border-rose-200 flex items-center justify-between">
                    <div>
                      <strong className="text-rose-900 block font-bold">3. Ghi nhận Chết / Đào thải</strong>
                      <span className="text-[11px] text-slate-500">Tự động trừ số lượng chết, nếu còn 0 tự Trống.</span>
                    </div>
                    <button
                      onClick={handleRecordDeath}
                      className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold"
                    >
                      Ghi Nhận Chết
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: LỊCH SỬ KHÔNG BỊ XÓA (ĐẶC TẢ 11) */}
          {activeTab === 'history' && (
            <div className="space-y-2.5">
              <span className="font-bold text-slate-800 block">Dòng thời gian sự kiện ({(cage.history || []).length})</span>
              {(cage.history || []).length === 0 ? (
                <p className="text-slate-400 italic">Chưa có bản ghi sự kiện nào.</p>
              ) : (
                (cage.history || []).map(item => (
                  <div key={item.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="flex justify-between items-baseline">
                      <span className="font-mono text-[10px] text-emerald-800 font-bold">{item.timestamp}</span>
                      <span className="text-[10px] text-slate-400">Thực hiện: {item.actor || 'Phan Dũng'}</span>
                    </div>
                    <p className="text-slate-800 font-medium text-xs leading-relaxed">{item.summary}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal chỉnh sửa thông tin Ô */}
      {showEditModal && (
        <EditCageModal
          cage={cage}
          allAreas={allAreas}
          allCages={allCages}
          onClose={() => setShowEditModal(false)}
          onSave={(updated, secondCageUpdate) => {
            onUpdateCage(updated, secondCageUpdate);
            setShowEditModal(false);
            setActionSuccessMsg(`Đã cập nhật thông tin Ô chuồng ${updated.code} thành công!`);
            setTimeout(() => setActionSuccessMsg(null), 3000);
          }}
        />
      )}

      {/* Modal Xác nhận Xóa Ô */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Xác Nhận Xóa Ô Chuồng</h3>
                <p className="text-xs text-slate-500 font-mono font-bold text-rose-600">
                  Mã ô: {cage.code}
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-slate-700 space-y-2">
              <p className="font-semibold text-amber-900">
                Bạn có chắc chắn muốn xóa ô chuồng <strong className="font-mono text-amber-950">{cage.code}</strong>?
              </p>
              <ul className="space-y-1 text-[11px] text-amber-800 list-disc pl-4">
                <li>Mã <strong className="font-mono">{cage.code}</strong> sẽ thành <strong>Ô KHUYẾT</strong> trong Dãy.</li>
                <li>Các ô khác trong Dãy vẫn <strong>giữ nguyên mã</strong>, không bị xáo trộn.</li>
                <li>Bạn có thể tạo lại mã này bằng chức năng <strong>"+ Thêm Ô"</strong> bất cứ lúc nào.</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  if (onDeleteCage) {
                    onDeleteCage(cage.id);
                  }
                  onClose();
                }}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Xác nhận xóa ô này</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
