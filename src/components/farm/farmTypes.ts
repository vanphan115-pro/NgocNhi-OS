export type FarmNavTab = 'home' | 'areas' | 'marketplace' | 'tasks' | 'treatment' | 'reports' | 'sanitation';

export type AreaKind = 'sinh_san' | 'baby' | 'hau_bi' | 'thuong_pham' | 'dieu_tri';

export type DuiSpecies = 'moc_dai' | 'ma_dao' | 'moc_nho' | 'bach_tang';

export type BabyWeightGroup = '3_4_lang' | '5_7_lang' | '8_lang_1_1_kg';

// Bộ trạng thái Ô sinh sản
export type BreedingCageStatus = 
  | 'trong' 
  | 'san_sang_ghep' 
  | 'ghep_doi' 
  | 'moi_tach_duc'      // Mới tách đực / Chờ kết quả (Ô Cái, theo dõi 45-60 ngày)
  | 'moi_tach_cai'      // Mới tách cái / Chờ đánh giá (Ô Đực, sau đủ 10 ngày tự động Sẵn sàng ghép)
  | 'moi_tach_con'      // Mới tách con / Đang dưỡng (Ô Cái, chu kỳ 10 ngày kiểm tra sức khỏe)
  | 'dang_nuoi_con'     // Đang nuôi con
  | 'dang_dieu_tri';    // Đang điều trị bệnh

// Bộ trạng thái Ô Baby
export type BabyCageStatus =
  | 'trong'
  | 'dang_nuoi_baby'
  | 'dat_dieu_kien_chuyen'
  | 'da_chuyen'
  | 'dang_dieu_tri';

// Bộ trạng thái Ô Hậu bị
export type HauBiCageStatus =
  | 'trong'
  | 'dang_nuoi_hau_bi'
  | 'dat_dieu_kien'
  | 'cho_chuyen'
  | 'da_chuyen'
  | 'dang_dieu_tri';

// Bộ trạng thái Ô Thương phẩm
export type CommercialCageStatus =
  | 'trong'
  | 'dang_nuoi_thuong_pham'
  | 'dat_trong_luong'
  | 'cho_xuat'
  | 'da_xuat'
  | 'dang_dieu_tri';

// Bộ trạng thái Ô Điều trị
export type TreatmentCageStatus =
  | 'trong'
  | 'dang_dieu_tri'
  | 'theo_doi'
  | 'da_khoi'
  | 'chet';

// Tổng hợp trạng thái
export type CageStatus = 
  | BreedingCageStatus 
  | BabyCageStatus 
  | HauBiCageStatus 
  | CommercialCageStatus 
  | TreatmentCageStatus;

export interface WeightRecord {
  id: string;
  date: string;
  weightKg: number;
  note?: string;
}

export type HealthStatus = 'khoe_manh' | 'binh_thuong' | 'kem' | 'dau_om';

export interface HealthRecord {
  id: string;
  date: string;
  status: HealthStatus;
  symptoms?: string;
  notes?: string;
}

export interface TreatmentFollowupRecord {
  id: string;
  date: string;
  progression: string; // diễn biến bệnh
  medicine?: string;
  weightKg?: number;
  healthState: string;
  nextFollowupDate?: string;
  notes?: string;
}

export interface HistoryItem {
  id: string;
  timestamp: string;
  eventType: 
    | 'tao_o'
    | 'cap_nhat_trang_thai'
    | 'ghep_doi'
    | 'tach_duc'
    | 'tach_cai'
    | 'sinh_con'
    | 'bo_con'
    | 'tach_con'
    | 'chuyen_baby'
    | 'chuyen_hau_bi'
    | 'chuyen_dieu_tri'
    | 'hoi_phuc_ve_cu'
    | 'hoi_phuc_chuyen_thuong_pham'
    | 'ghi_nhan_chet'
    | 'can_trong_luong'
    | 'kham_suc_khoe'
    | 'hoan_thanh_cong_viec'
    | 'tu_dong_chuyen_trang_thai';
  summary: string;
  details?: string;
  actor?: string;
  oldStatus?: string;
  newStatus?: string;
  relatedCageCode?: string;
}

export interface FarmArea {
  id: string;
  physicalId?: string; // Định danh vị trí vật lý cố định cho tem QR
  code: string;
  name: string;
  kind: AreaKind;
  kindLabel: string;
  rowCount: number;
  totalCages: number;
  occupiedCages: number;
  occupancyRate: number;
  image: string;
  description?: string;
}

export interface FarmRow {
  id: string;
  physicalId?: string; // Định danh vị trí vật lý cố định cho tem QR
  areaId: string;
  code: string;
  name: string;
  kind?: 'cai' | 'duc' | 'chung';
  genderBadge?: string; // "♀ Dãy Cái" | "♂ Dãy Đực"
  tierCount?: number;   // 2 hàng chuồng, 1 hàng chuồng...
  cageCount: number;
}

export interface FarmCage {
  id: string;
  physicalId?: string; // Định danh vị trí vật lý cố định cho tem QR
  code: string;               // VD: C1-01, C2-01, D1-01, SS1-01...
  areaId: string;
  areaCode: string;
  areaKind: AreaKind;
  rowId: string;
  rowCode: string;
  tier?: number;              // 1: Hàng trên / Tầng 1, 2: Hàng dưới / Tầng 2
  slotNumber?: string;        // V1, V2, V3, V4, V5...
  
  status: CageStatus;
  statusLabel: string;
  
  gender?: 'duc' | 'cai' | 'doi' | 'dan';
  species: DuiSpecies;
  ratCount: number;
  healthStatus?: HealthStatus;
  
  // Nghiệp vụ nền
  currentWeightKg?: number;
  weightHistory: WeightRecord[];
  healthHistory: HealthRecord[];
  history: HistoryItem[];

  // Nghiệp vụ Ghép đôi & Tách ghép
  matingDate?: string;                 // Ngày ghép
  partnerCageId?: string;              // Liên kết Ô đối tác
  partnerCageCode?: string;
  matingSeparationDate?: string;       // Ngày tách đực / Ngày tách cái
  
  // Ô Cái: Mới tách đực / Chờ kết quả (Theo dõi 45-60 ngày)
  followupDurationDays?: number;
  expectedEvaluationDate?: string;
  
  // Ô Cái: Đang nuôi con
  birthDate?: string;                  // Ngày sinh
  totalBornCount?: number;             // Số con
  livingBabyCount?: number;            // Số con sống
  abandonedBabyCount?: number;         // Bỏ con (nếu xảy ra thực tế)
  nursingCondition?: string;           // Tình trạng nuôi
  
  // Ô Cái: Mới tách con / Đang dưỡng (Chu kỳ 10 ngày kiểm tra sức khỏe)
  weaningDate?: string;                // Ngày tách con
  weanedBabyCount?: number;            // Số con tách
  weanedBabyWeightAvg?: number;        // Trọng lượng con
  weanedBabyGroup?: BabyWeightGroup;   // Nhóm baby
  targetBabyCageId?: string;           // Ô Baby đích nhận đàn
  targetBabyCageCode?: string;
  transferredCount?: number;           // Số lượng chuyển
  transferDate?: string;               // Ngày chuyển
  postWeaningHealthChecked?: boolean;  // Xác nhận kiểm tra sức khỏe ngày 10 đạt
  
  // Ô Baby (Khu Baby)
  babyGroup?: BabyWeightGroup;
  entryDate?: string;
  readyToTransferDate?: string;
  
  // Ô Hậu bị (Khu Hậu bị)
  hauBiEntryDate?: string;
  hauBiEvaluationDate?: string;
  hauBiPassed?: boolean;
  
  // Ô Thương phẩm (Khu Thương phẩm)
  commercialEntryDate?: string;
  readyToExportDate?: string;
  exportDate?: string;
  exportedCount?: number;
  exportedWeightAvg?: number;          // Trọng lượng xuất
  
  // Điều trị bệnh (Khi chuyển vào điều trị)
  treatmentDiseaseType?: string;       // Loại bệnh/vấn đề
  treatmentDetectionDate?: string;     // Ngày phát hiện bệnh
  treatmentTransferDate?: string;      // Ngày chuyển điều trị
  sourceAreaId?: string;               // Khu nguồn
  sourceAreaCode?: string;
  sourceRowId?: string;                // Dãy nguồn
  sourceRowCode?: string;
  sourceCageId?: string;               // Ô nguồn
  sourceCageCode?: string;
  treatmentProtocol?: string;          // Phác đồ
  treatmentMedicine?: string;          // Thuốc
  treatmentDuration?: string;          // Thời gian điều trị
  treatmentNextExamDate?: string;      // Ngày tái khám/đánh giá
  treatmentFollowups?: TreatmentFollowupRecord[];
  
  // Đánh giá xuất viện / Khỏi / Chết
  recoveryAction?: 've_cu' | 'chuyen_thuong_pham';
  recoveryDate?: string;
  deathDate?: string;
  deathCount?: number;
  deathReason?: string;
  
  // Vệ sinh
  lastCleanDate?: string;
  notes?: string;
}

export type TaskUrgency = 'qua_han' | 'den_han' | 'sap_den_han';

export type TaskSourceType = 
  | 'mating_separation'             // Tách ghép / kiểm tra kết quả (+20 ngày từ ngày ghép)
  | 'post_weaning_health_check'     // Kiểm tra sức khỏe phục vụ ghép lại (10 ngày sau tách con: ngày 9 báo, ngày 10 đến hạn, ngày 11+ quá hạn)
  | 'pregnancy_check'               // Theo dõi kết quả sau tách đực (khoảng 45-60 ngày / khám thai chuẩn bị ổ đẻ)
  | 'nursing_weaning'               // Tách đàn con non chuyển sang Khu Baby (45 ngày sau sinh)
  | 'male_rest_check'               // Kiểm tra đực sau chu kỳ nghỉ 10 ngày
  | 'baby_transfer_check'           // Cân trọng lượng & chuyển nhóm đàn Baby
  | 'hau_bi_evaluation'             // Đánh giá chọn giống F1 Hậu bị
  | 'commercial_export'             // Xuất chuồng thương phẩm
  | 'treatment_re_exam'             // Tái khám / đánh giá điều trị
  | 'health_alert'                  // Cảnh báo khẩn cấp cá thể ốm/thể trạng kém
  | 'cage_sanitation'               // Vệ sinh chuồng trại định kỳ (7 ngày)
  | 'disinfection'                  // Phun khử trùng định kỳ (07 ngày - trùng lịch vệ sinh)
  | 'general_custom';               // Việc dự kiến khác có ngày hẹn thực tế

export interface FarmTask {
  id: string;
  sourceType: TaskSourceType;
  title: string;
  description: string;
  dueDate: string;                    // Ngày hẹn thực tế
  
  cageId?: string;
  cageCode?: string;
  areaId?: string;
  areaCode?: string;
  areaName?: string;
  
  urgency: TaskUrgency;
  isCompleted: boolean;
  completedAt?: string;
  completedBy?: string;
  completionNote?: string;
  isCustom?: boolean;                 // Công việc do người dùng tự tạo thêm
}

export interface DisinfectionLogItem {
  id: string;
  date: string;
  areaName: string;
  chemical: string;
  dosage: string;
  executor: string;
  notes: string;
}
