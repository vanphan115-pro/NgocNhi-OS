import { 
  FarmArea, 
  FarmRow, 
  FarmCage, 
  FarmTask, 
  TaskUrgency,
  TaskSourceType,
  DisinfectionLogItem 
} from './farmTypes';

export const FARM_METADATA = {
  name: 'Trang trại Dúi Mốc Đại Phan Dũng Kaka',
  subName: 'Hệ thống chuồng trại khép kín',
  shortName: 'Dúi Phan Dũng Kaka',
  owner: 'Phan Dũng',
  ownerRole: 'Chủ trại & Kỹ thuật trưởng',
  hotline: '0969 310 601',
  location: 'KP 9, phường Lộc Ninh, TP. Đồng Nai',
  area: '1,200m² - Quy mô 200 ô chuồng gạch men tiêu chuẩn 50x50cm',
  temperature: '26°C',
  humidity: '68%',
};

export const FARM_PHOTOS = {
  youngSelect: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=600&q=80',
  breedingCage: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=600&q=80',
  babyPups: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?auto=format&fit=crop&w=600&q=80',
  highQualityMale: 'https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?auto=format&fit=crop&w=600&q=80',
  quarantine: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=600&q=80',
  feedStock: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=600&q=80',
};

export const INITIAL_AREAS: FarmArea[] = [
  {
    id: 'area-ss1',
    code: 'KHU-SS1',
    name: 'Khu Sinh sản 1',
    kind: 'sinh_san',
    kindLabel: 'Sinh sản',
    rowCount: 3,
    totalCages: 12,
    occupiedCages: 0,
    occupancyRate: 0,
    image: FARM_PHOTOS.breedingCage,
    description: 'Khu sinh sản phối ghép, mang thai và nuôi con dòng Dúi Mốc Đại'
  },
  {
    id: 'area-bb',
    code: 'KHU-BB',
    name: 'Khu Baby',
    kind: 'baby',
    kindLabel: 'Baby',
    rowCount: 3,
    totalCages: 12,
    occupiedCages: 0,
    occupancyRate: 0,
    image: FARM_PHOTOS.babyPups,
    description: 'Khu nuôi Dúi Baby phân theo từng dãy trọng lượng chuẩn'
  },
  {
    id: 'area-hb',
    code: 'KHU-HB',
    name: 'Khu Hậu bị',
    kind: 'hau_bi',
    kindLabel: 'Hậu bị',
    rowCount: 2,
    totalCages: 8,
    occupiedCages: 0,
    occupancyRate: 0,
    image: FARM_PHOTOS.youngSelect,
    description: 'Khu nuôi dưỡng tuyển chọn cá thể hậu bị đực/cái chuẩn gen'
  },
  {
    id: 'area-tp',
    code: 'KHU-TP',
    name: 'Khu Thương phẩm',
    kind: 'thuong_pham',
    kindLabel: 'Thương phẩm',
    rowCount: 2,
    totalCages: 8,
    occupiedCages: 0,
    occupancyRate: 0,
    image: FARM_PHOTOS.highQualityMale,
    description: 'Khu nuôi vỗ béo xuất thịt thương phẩm đặc sản'
  },
  {
    id: 'area-dt',
    code: 'KHU-DT',
    name: 'Khu Điều trị',
    kind: 'dieu_tri',
    kindLabel: 'Điều trị',
    rowCount: 2,
    totalCages: 8,
    occupiedCages: 0,
    occupancyRate: 0,
    image: FARM_PHOTOS.quarantine,
    description: 'Khu cách ly thú y, điều trị và phục hồi thể trạng'
  }
];

export const INITIAL_ROWS: FarmRow[] = [
  // 1. KHU SINH SẢN (Dãy Cái 1, Dãy Cái 2, Dãy Đực 1)
  { id: 'row-ss1-c1', areaId: 'area-ss1', code: 'DC1', name: 'Dãy Cái 1', kind: 'cai', genderBadge: '♀ Dãy Cái', tierCount: 2, cageCount: 5 },
  { id: 'row-ss1-c2', areaId: 'area-ss1', code: 'DC2', name: 'Dãy Cái 2', kind: 'cai', genderBadge: '♀ Dãy Cái', tierCount: 2, cageCount: 4 },
  { id: 'row-ss1-d1', areaId: 'area-ss1', code: 'DĐ1', name: 'Dãy Đực 1', kind: 'duc', genderBadge: '♂ Dãy Đực', tierCount: 1, cageCount: 3 },

  // 2. KHU BABY (Dãy Baby 3–4 lạng, Dãy Baby 5–7 lạng, Dãy Baby 8 lạng–1,1 kg)
  { id: 'row-bb-1', areaId: 'area-bb', code: 'DB-3-4', name: 'Dãy Baby 3–4 lạng', kind: 'chung', genderBadge: 'Dãy 3–4 lạng', tierCount: 1, cageCount: 4 },
  { id: 'row-bb-2', areaId: 'area-bb', code: 'DB-5-7', name: 'Dãy Baby 5–7 lạng', kind: 'chung', genderBadge: 'Dãy 5–7 lạng', tierCount: 1, cageCount: 4 },
  { id: 'row-bb-3', areaId: 'area-bb', code: 'DB-8-11', name: 'Dãy Baby 8 lạng–1,1 kg', kind: 'chung', genderBadge: 'Dãy 8 lạng–1,1 kg', tierCount: 1, cageCount: 4 },

  // 3. KHU HẬU BỊ (Dãy 1, Dãy 2...)
  { id: 'row-hb-1', areaId: 'area-hb', code: 'HB1', name: 'Dãy 1', kind: 'chung', genderBadge: 'Dãy 1', tierCount: 1, cageCount: 4 },
  { id: 'row-hb-2', areaId: 'area-hb', code: 'HB2', name: 'Dãy 2', kind: 'chung', genderBadge: 'Dãy 2', tierCount: 1, cageCount: 4 },

  // 4. KHU THƯƠNG PHẨM (Dãy 1, Dãy 2...)
  { id: 'row-tp-1', areaId: 'area-tp', code: 'TP1', name: 'Dãy 1', kind: 'chung', genderBadge: 'Dãy 1', tierCount: 1, cageCount: 4 },
  { id: 'row-tp-2', areaId: 'area-tp', code: 'TP2', name: 'Dãy 2', kind: 'chung', genderBadge: 'Dãy 2', tierCount: 1, cageCount: 4 },

  // 5. KHU ĐIỀU TRỊ (Dãy 1, Dãy 2...)
  { id: 'row-dt-1', areaId: 'area-dt', code: 'DT1', name: 'Dãy 1', kind: 'chung', genderBadge: 'Dãy 1', tierCount: 1, cageCount: 4 },
  { id: 'row-dt-2', areaId: 'area-dt', code: 'DT2', name: 'Dãy 2', kind: 'chung', genderBadge: 'Dãy 2', tierCount: 1, cageCount: 4 },
];

// Hàm tạo cấu trúc Khu Sinh Sản Tiêu Chuẩn (Dãy Cái 1 - 5 ô, Dãy Cái 2 - 4 ô, Dãy Đực 1 - 3 ô)
export function createStandardBreedingAreaStructure(
  areaId: string,
  areaCode: string,
  areaName: string,
  description?: string
): { area: FarmArea; rows: FarmRow[]; cages: FarmCage[] } {
  const rowC1Id = areaId === 'area-ss1' ? 'row-ss1-c1' : `row-${areaId}-c1`;
  const rowC2Id = areaId === 'area-ss1' ? 'row-ss1-c2' : `row-${areaId}-c2`;
  const rowD1Id = areaId === 'area-ss1' ? 'row-ss1-d1' : `row-${areaId}-d1`;

  const area: FarmArea = {
    id: areaId,
    code: areaCode,
    name: areaName,
    kind: 'sinh_san',
    kindLabel: 'Sinh sản',
    rowCount: 3,
    totalCages: 12,
    occupiedCages: 0,
    occupancyRate: 0,
    image: FARM_PHOTOS.breedingCage,
    description: description || 'Khu sinh sản phối ghép, mang thai và nuôi con dòng Dúi Mốc Đại'
  };

  const rows: FarmRow[] = [
    {
      id: rowC1Id,
      areaId,
      code: 'DC1',
      name: 'Dãy Cái 1',
      kind: 'cai',
      genderBadge: '♀ Dãy Cái',
      tierCount: 2,
      cageCount: 5
    },
    {
      id: rowC2Id,
      areaId,
      code: 'DC2',
      name: 'Dãy Cái 2',
      kind: 'cai',
      genderBadge: '♀ Dãy Cái',
      tierCount: 2,
      cageCount: 4
    },
    {
      id: rowD1Id,
      areaId,
      code: 'DĐ1',
      name: 'Dãy Đực 1',
      kind: 'duc',
      genderBadge: '♂ Dãy Đực',
      tierCount: 1,
      cageCount: 3
    }
  ];

  const cages: FarmCage[] = [
    // Dãy Cái 1 (5 ô: DC1-H1-001 -> 003, DC1-H2-001 -> 002)
    ...Array.from({ length: 5 }, (_, i) => {
      const tier = i < 3 ? 1 : 2;
      const tierIndex = i < 3 ? (i + 1) : (i - 2);
      return {
        id: `cage-${areaId}-dc1-${tier}-${String(tierIndex).padStart(3, '0')}`,
        code: `DC1-H${tier}-${String(tierIndex).padStart(3, '0')}`,
        areaId,
        areaCode,
        areaKind: 'sinh_san' as const,
        rowId: rowC1Id,
        rowCode: 'Dãy Cái 1',
        tier,
        slotNumber: `V${i + 1}`,
        status: 'trong' as const,
        statusLabel: 'Trống',
        gender: 'cai' as const,
        species: 'moc_dai' as const,
        ratCount: 0,
        weightHistory: [],
        healthHistory: [],
        history: [],
        notes: ''
      };
    }),

    // Dãy Cái 2 (4 ô: DC2-H1-001 -> 002, DC2-H2-001 -> 002)
    ...Array.from({ length: 4 }, (_, i) => {
      const tier = i < 2 ? 1 : 2;
      const tierIndex = i < 2 ? (i + 1) : (i - 1);
      return {
        id: `cage-${areaId}-dc2-${tier}-${String(tierIndex).padStart(3, '0')}`,
        code: `DC2-H${tier}-${String(tierIndex).padStart(3, '0')}`,
        areaId,
        areaCode,
        areaKind: 'sinh_san' as const,
        rowId: rowC2Id,
        rowCode: 'Dãy Cái 2',
        tier,
        slotNumber: `V${i + 1}`,
        status: 'trong' as const,
        statusLabel: 'Trống',
        gender: 'cai' as const,
        species: 'moc_dai' as const,
        ratCount: 0,
        weightHistory: [],
        healthHistory: [],
        history: [],
        notes: ''
      };
    }),

    // Dãy Đực 1 (3 ô: DĐ1-H1-001 -> DĐ1-H1-003)
    ...Array.from({ length: 3 }, (_, i) => ({
      id: `cage-${areaId}-dd1-1-${String(i + 1).padStart(3, '0')}`,
      code: `DĐ1-H1-${String(i + 1).padStart(3, '0')}`,
      areaId,
      areaCode,
      areaKind: 'sinh_san' as const,
      rowId: rowD1Id,
      rowCode: 'Dãy Đực 1',
      tier: 1,
      slotNumber: `V${i + 1}`,
      status: 'trong' as const,
      statusLabel: 'Trống',
      gender: 'duc' as const,
      species: 'moc_dai' as const,
      ratCount: 0,
      weightHistory: [],
      healthHistory: [],
      history: [],
      notes: ''
    }))
  ];

  return { area, rows, cages };
}

// Khởi tạo danh sách toàn bộ Ô chuồng thực tế ở trạng thái sạch (Trống, 0 cá thể ảo)
export function createRealEmptyCages(): FarmCage[] {
  const stdSS1 = createStandardBreedingAreaStructure('area-ss1', 'KHU-SS1', 'Khu Sinh sản 1');
  
  const babyCages: FarmCage[] = [
    // Dãy 1: Baby 3–4 lạng (4 ô: BB1-01 -> BB1-04)
    ...Array.from({ length: 4 }, (_, i) => ({
      id: `cage-bb-34-${String(i + 1).padStart(2, '0')}`,
      code: `BB1-${String(i + 1).padStart(2, '0')}`,
      areaId: 'area-bb',
      areaCode: 'KHU-BB',
      areaKind: 'baby' as const,
      rowId: 'row-bb-1',
      rowCode: 'Dãy Baby 3–4 lạng',
      tier: 1,
      slotNumber: `V${i + 1}`,
      status: 'trong' as const,
      statusLabel: 'Trống',
      gender: 'dan' as const,
      species: 'moc_dai' as const,
      ratCount: 0,
      babyGroup: '3_4_lang' as const,
      weightHistory: [],
      healthHistory: [],
      history: [],
      notes: ''
    })),
    // Dãy 2: Baby 5–7 lạng (4 ô: BB2-01 -> BB2-04)
    ...Array.from({ length: 4 }, (_, i) => ({
      id: `cage-bb-57-${String(i + 1).padStart(2, '0')}`,
      code: `BB2-${String(i + 1).padStart(2, '0')}`,
      areaId: 'area-bb',
      areaCode: 'KHU-BB',
      areaKind: 'baby' as const,
      rowId: 'row-bb-2',
      rowCode: 'Dãy Baby 5–7 lạng',
      tier: 1,
      slotNumber: `V${i + 1}`,
      status: 'trong' as const,
      statusLabel: 'Trống',
      gender: 'dan' as const,
      species: 'moc_dai' as const,
      ratCount: 0,
      babyGroup: '5_7_lang' as const,
      weightHistory: [],
      healthHistory: [],
      history: [],
      notes: ''
    })),
    // Dãy 3: Baby 8 lạng–1,1 kg (4 ô: BB3-01 -> BB3-04)
    ...Array.from({ length: 4 }, (_, i) => ({
      id: `cage-bb-811-${String(i + 1).padStart(2, '0')}`,
      code: `BB3-${String(i + 1).padStart(2, '0')}`,
      areaId: 'area-bb',
      areaCode: 'KHU-BB',
      areaKind: 'baby' as const,
      rowId: 'row-bb-3',
      rowCode: 'Dãy Baby 8 lạng–1,1 kg',
      tier: 1,
      slotNumber: `V${i + 1}`,
      status: 'trong' as const,
      statusLabel: 'Trống',
      gender: 'dan' as const,
      species: 'moc_dai' as const,
      ratCount: 0,
      babyGroup: '8_lang_1_1_kg' as const,
      weightHistory: [],
      healthHistory: [],
      history: [],
      notes: ''
    }))
  ];

  const hauBiCages: FarmCage[] = [
    // Dãy 1 (4 ô: HB1-01 -> HB1-04)
    ...Array.from({ length: 4 }, (_, i) => ({
      id: `cage-hb-1-${String(i + 1).padStart(2, '0')}`,
      code: `HB1-${String(i + 1).padStart(2, '0')}`,
      areaId: 'area-hb',
      areaCode: 'KHU-HB',
      areaKind: 'hau_bi' as const,
      rowId: 'row-hb-1',
      rowCode: 'Dãy 1',
      tier: 1,
      slotNumber: `V${i + 1}`,
      status: 'trong' as const,
      statusLabel: 'Trống',
      gender: 'duc' as const,
      species: 'moc_dai' as const,
      ratCount: 0,
      weightHistory: [],
      healthHistory: [],
      history: [],
      notes: ''
    })),
    // Dãy 2 (4 ô: HB2-01 -> HB2-04)
    ...Array.from({ length: 4 }, (_, i) => ({
      id: `cage-hb-2-${String(i + 1).padStart(2, '0')}`,
      code: `HB2-${String(i + 1).padStart(2, '0')}`,
      areaId: 'area-hb',
      areaCode: 'KHU-HB',
      areaKind: 'hau_bi' as const,
      rowId: 'row-hb-2',
      rowCode: 'Dãy 2',
      tier: 1,
      slotNumber: `V${i + 1}`,
      status: 'trong' as const,
      statusLabel: 'Trống',
      gender: 'cai' as const,
      species: 'moc_dai' as const,
      ratCount: 0,
      weightHistory: [],
      healthHistory: [],
      history: [],
      notes: ''
    }))
  ];

  const thuongPhamCages: FarmCage[] = [
    // Dãy 1 (4 ô: TP1-01 -> TP1-04)
    ...Array.from({ length: 4 }, (_, i) => ({
      id: `cage-tp-1-${String(i + 1).padStart(2, '0')}`,
      code: `TP1-${String(i + 1).padStart(2, '0')}`,
      areaId: 'area-tp',
      areaCode: 'KHU-TP',
      areaKind: 'thuong_pham' as const,
      rowId: 'row-tp-1',
      rowCode: 'Dãy 1',
      tier: 1,
      slotNumber: `V${i + 1}`,
      status: 'trong' as const,
      statusLabel: 'Trống',
      gender: 'dan' as const,
      species: 'moc_dai' as const,
      ratCount: 0,
      weightHistory: [],
      healthHistory: [],
      history: [],
      notes: ''
    })),
    // Dãy 2 (4 ô: TP2-01 -> TP2-04)
    ...Array.from({ length: 4 }, (_, i) => ({
      id: `cage-tp-2-${String(i + 1).padStart(2, '0')}`,
      code: `TP2-${String(i + 1).padStart(2, '0')}`,
      areaId: 'area-tp',
      areaCode: 'KHU-TP',
      areaKind: 'thuong_pham' as const,
      rowId: 'row-tp-2',
      rowCode: 'Dãy 2',
      tier: 1,
      slotNumber: `V${i + 1}`,
      status: 'trong' as const,
      statusLabel: 'Trống',
      gender: 'dan' as const,
      species: 'moc_dai' as const,
      ratCount: 0,
      weightHistory: [],
      healthHistory: [],
      history: [],
      notes: ''
    }))
  ];

  const dieuTriCages: FarmCage[] = [
    // Dãy 1 (4 ô: DT1-01 -> DT1-04)
    ...Array.from({ length: 4 }, (_, i) => ({
      id: `cage-dt-1-${String(i + 1).padStart(2, '0')}`,
      code: `DT1-${String(i + 1).padStart(2, '0')}`,
      areaId: 'area-dt',
      areaCode: 'KHU-DT',
      areaKind: 'dieu_tri' as const,
      rowId: 'row-dt-1',
      rowCode: 'Dãy 1',
      tier: 1,
      slotNumber: `V${i + 1}`,
      status: 'trong' as const,
      statusLabel: 'Trống',
      gender: 'duc' as const,
      species: 'moc_dai' as const,
      ratCount: 0,
      weightHistory: [],
      healthHistory: [],
      history: [],
      notes: ''
    })),
    // Dãy 2 (4 ô: DT2-01 -> DT2-04)
    ...Array.from({ length: 4 }, (_, i) => ({
      id: `cage-dt-2-${String(i + 1).padStart(2, '0')}`,
      code: `DT2-${String(i + 1).padStart(2, '0')}`,
      areaId: 'area-dt',
      areaCode: 'KHU-DT',
      areaKind: 'dieu_tri' as const,
      rowId: 'row-dt-2',
      rowCode: 'Dãy 2',
      tier: 1,
      slotNumber: `V${i + 1}`,
      status: 'trong' as const,
      statusLabel: 'Trống',
      gender: 'cai' as const,
      species: 'moc_dai' as const,
      ratCount: 0,
      weightHistory: [],
      healthHistory: [],
      history: [],
      notes: ''
    }))
  ];

  return [
    ...stdSS1.cages,
    ...babyCages,
    ...hauBiCages,
    ...thuongPhamCages,
    ...dieuTriCages
  ];
}

// Khởi tạo mặc định: Dữ liệu thật bắt đầu từ các ô sạch trống (0 cá thể ảo)
export const INITIAL_CAGES: FarmCage[] = createRealEmptyCages();

export const INITIAL_DISINFECTION_LOGS: DisinfectionLogItem[] = [];

// Dữ liệu mẫu (mẫu demo) để tham khảo nếu người dùng muốn trải nghiệm
export const SAMPLE_DEMO_CAGES: FarmCage[] = [
  // 1. CÁC Ô KHU SINH SẢN (Thuộc Dãy Cái 1, Dãy Cái 2, Dãy Đực 1)
  ...createStandardBreedingAreaStructure('area-ss1', 'KHU-SS1', 'Khu Sinh sản 1').cages,

  // 2. CÁC Ô KHU BABY
  // 2.1 Dãy Baby 3–4 lạng
  {
    id: 'cage-bb-34-01',
    code: 'BB1-01',
    areaId: 'area-bb',
    areaCode: 'KHU-BB',
    areaKind: 'baby',
    rowId: 'row-bb-1',
    rowCode: 'Dãy Baby 3–4 lạng',
    tier: 1,
    slotNumber: 'V1',
    status: 'dang_nuoi_baby',
    statusLabel: 'Đang nuôi',
    gender: 'dan',
    species: 'moc_dai',
    ratCount: 4,
    babyGroup: '3_4_lang',
    currentWeightKg: 0.38,
    weightHistory: [{ id: 'w-bb-1', date: '2026-08-24', weightKg: 0.38 }],
    healthHistory: [{ id: 'h-bb-1', date: '2026-08-24', status: 'khoe_manh' }],
    history: [],
    lastCleanDate: '2026-08-23',
    notes: 'Đàn 4 con F1'
  },
  {
    id: 'cage-bb-34-02',
    code: 'BB1-02',
    areaId: 'area-bb',
    areaCode: 'KHU-BB',
    areaKind: 'baby',
    rowId: 'row-bb-1',
    rowCode: 'Dãy Baby 3–4 lạng',
    tier: 1,
    slotNumber: 'V2',
    status: 'dang_nuoi_baby',
    statusLabel: 'Đang nuôi',
    gender: 'dan',
    species: 'moc_dai',
    ratCount: 3,
    babyGroup: '3_4_lang',
    currentWeightKg: 0.35,
    weightHistory: [],
    healthHistory: [],
    history: [],
    lastCleanDate: '2026-08-23',
    notes: 'Đàn 3 con'
  },
  {
    id: 'cage-bb-34-03',
    code: 'BB1-03',
    areaId: 'area-bb',
    areaCode: 'KHU-BB',
    areaKind: 'baby',
    rowId: 'row-bb-1',
    rowCode: 'Dãy Baby 3–4 lạng',
    tier: 1,
    slotNumber: 'V3',
    status: 'trong',
    statusLabel: 'Trống',
    gender: 'dan',
    species: 'moc_dai',
    ratCount: 0,
    weightHistory: [],
    healthHistory: [],
    history: [],
    lastCleanDate: '2026-08-20',
    notes: 'Trống'
  },
  {
    id: 'cage-bb-34-04',
    code: 'BB1-04',
    areaId: 'area-bb',
    areaCode: 'KHU-BB',
    areaKind: 'baby',
    rowId: 'row-bb-1',
    rowCode: 'Dãy Baby 3–4 lạng',
    tier: 1,
    slotNumber: 'V4',
    status: 'trong',
    statusLabel: 'Trống',
    gender: 'dan',
    species: 'moc_dai',
    ratCount: 0,
    weightHistory: [],
    healthHistory: [],
    history: [],
    lastCleanDate: '2026-08-20',
    notes: 'Trống'
  },

  // 2.2 Dãy Baby 5–7 lạng
  {
    id: 'cage-bb-57-01',
    code: 'BB2-01',
    areaId: 'area-bb',
    areaCode: 'KHU-BB',
    areaKind: 'baby',
    rowId: 'row-bb-2',
    rowCode: 'Dãy Baby 5–7 lạng',
    tier: 1,
    slotNumber: 'V1',
    status: 'dang_nuoi_baby',
    statusLabel: 'Đang nuôi',
    gender: 'dan',
    species: 'moc_dai',
    ratCount: 3,
    babyGroup: '5_7_lang',
    currentWeightKg: 0.65,
    weightHistory: [{ id: 'w-bb-4', date: '2026-08-20', weightKg: 0.65 }],
    healthHistory: [],
    history: [],
    lastCleanDate: '2026-08-21',
    notes: 'Đàn 3 con'
  },
  {
    id: 'cage-bb-57-02',
    code: 'BB2-02',
    areaId: 'area-bb',
    areaCode: 'KHU-BB',
    areaKind: 'baby',
    rowId: 'row-bb-2',
    rowCode: 'Dãy Baby 5–7 lạng',
    tier: 1,
    slotNumber: 'V2',
    status: 'dang_nuoi_baby',
    statusLabel: 'Đang nuôi',
    gender: 'dan',
    species: 'moc_dai',
    ratCount: 2,
    babyGroup: '5_7_lang',
    currentWeightKg: 0.58,
    weightHistory: [],
    healthHistory: [],
    history: [],
    lastCleanDate: '2026-08-21',
    notes: 'Đàn 2 con'
  },
  {
    id: 'cage-bb-57-03',
    code: 'BB2-03',
    areaId: 'area-bb',
    areaCode: 'KHU-BB',
    areaKind: 'baby',
    rowId: 'row-bb-2',
    rowCode: 'Dãy Baby 5–7 lạng',
    tier: 1,
    slotNumber: 'V3',
    status: 'trong',
    statusLabel: 'Trống',
    gender: 'dan',
    species: 'moc_dai',
    ratCount: 0,
    weightHistory: [],
    healthHistory: [],
    history: [],
    lastCleanDate: '2026-08-20',
    notes: 'Trống'
  },
  {
    id: 'cage-bb-57-04',
    code: 'BB2-04',
    areaId: 'area-bb',
    areaCode: 'KHU-BB',
    areaKind: 'baby',
    rowId: 'row-bb-2',
    rowCode: 'Dãy Baby 5–7 lạng',
    tier: 1,
    slotNumber: 'V4',
    status: 'trong',
    statusLabel: 'Trống',
    gender: 'dan',
    species: 'moc_dai',
    ratCount: 0,
    weightHistory: [],
    healthHistory: [],
    history: [],
    lastCleanDate: '2026-08-20',
    notes: 'Trống'
  },

  // 2.3 Dãy Baby 8 lạng–1,1 kg
  {
    id: 'cage-bb-811-01',
    code: 'BB3-01',
    areaId: 'area-bb',
    areaCode: 'KHU-BB',
    areaKind: 'baby',
    rowId: 'row-bb-3',
    rowCode: 'Dãy Baby 8 lạng–1,1 kg',
    tier: 1,
    slotNumber: 'V1',
    status: 'dang_nuoi_baby',
    statusLabel: 'Đang nuôi',
    gender: 'dan',
    species: 'moc_dai',
    ratCount: 2,
    babyGroup: '8_lang_1_1_kg',
    currentWeightKg: 0.95,
    weightHistory: [],
    healthHistory: [],
    history: [],
    lastCleanDate: '2026-08-22',
    notes: 'Đàn 2 con chuẩn bị lên hậu bị'
  },
  {
    id: 'cage-bb-811-02',
    code: 'BB3-02',
    areaId: 'area-bb',
    areaCode: 'KHU-BB',
    areaKind: 'baby',
    rowId: 'row-bb-3',
    rowCode: 'Dãy Baby 8 lạng–1,1 kg',
    tier: 1,
    slotNumber: 'V2',
    status: 'dang_nuoi_baby',
    statusLabel: 'Đang nuôi',
    gender: 'dan',
    species: 'moc_dai',
    ratCount: 2,
    babyGroup: '8_lang_1_1_kg',
    currentWeightKg: 1.05,
    weightHistory: [],
    healthHistory: [],
    history: [],
    lastCleanDate: '2026-08-22',
    notes: 'Đàn 2 con'
  },
  {
    id: 'cage-bb-811-03',
    code: 'BB3-03',
    areaId: 'area-bb',
    areaCode: 'KHU-BB',
    areaKind: 'baby',
    rowId: 'row-bb-3',
    rowCode: 'Dãy Baby 8 lạng–1,1 kg',
    tier: 1,
    slotNumber: 'V3',
    status: 'trong',
    statusLabel: 'Trống',
    gender: 'dan',
    species: 'moc_dai',
    ratCount: 0,
    weightHistory: [],
    healthHistory: [],
    history: [],
    lastCleanDate: '2026-08-20',
    notes: 'Trống'
  },
  {
    id: 'cage-bb-811-04',
    code: 'BB3-04',
    areaId: 'area-bb',
    areaCode: 'KHU-BB',
    areaKind: 'baby',
    rowId: 'row-bb-3',
    rowCode: 'Dãy Baby 8 lạng–1,1 kg',
    tier: 1,
    slotNumber: 'V4',
    status: 'trong',
    statusLabel: 'Trống',
    gender: 'dan',
    species: 'moc_dai',
    ratCount: 0,
    weightHistory: [],
    healthHistory: [],
    history: [],
    lastCleanDate: '2026-08-20',
    notes: 'Trống'
  },

  // 3. CÁC Ô KHU HẬU BỊ
  // 3.1 Dãy 1
  {
    id: 'cage-hb-1-01',
    code: 'HB1-01',
    areaId: 'area-hb',
    areaCode: 'KHU-HB',
    areaKind: 'hau_bi',
    rowId: 'row-hb-1',
    rowCode: 'Dãy 1',
    tier: 1,
    slotNumber: 'V1',
    status: 'dang_nuoi_hau_bi',
    statusLabel: 'Đang nuôi',
    gender: 'cai',
    species: 'moc_dai',
    ratCount: 1,
    currentWeightKg: 1.8,
    weightHistory: [{ id: 'w-hb-1', date: '2026-08-15', weightKg: 1.8 }],
    healthHistory: [],
    history: [],
    lastCleanDate: '2026-08-22',
    notes: '1.8 kg'
  },
  {
    id: 'cage-hb-1-02',
    code: 'HB1-02',
    areaId: 'area-hb',
    areaCode: 'KHU-HB',
    areaKind: 'hau_bi',
    rowId: 'row-hb-1',
    rowCode: 'Dãy 1',
    tier: 1,
    slotNumber: 'V2',
    status: 'dat_dieu_kien',
    statusLabel: 'Đạt điều kiện',
    gender: 'duc',
    species: 'moc_dai',
    ratCount: 1,
    currentWeightKg: 2.3,
    weightHistory: [{ id: 'w-hb-2', date: '2026-08-20', weightKg: 2.3 }],
    healthHistory: [],
    history: [],
    lastCleanDate: '2026-08-22',
    notes: '2.3 kg'
  },
  {
    id: 'cage-hb-1-03',
    code: 'HB1-03',
    areaId: 'area-hb',
    areaCode: 'KHU-HB',
    areaKind: 'hau_bi',
    rowId: 'row-hb-1',
    rowCode: 'Dãy 1',
    tier: 1,
    slotNumber: 'V3',
    status: 'trong',
    statusLabel: 'Trống',
    gender: 'cai',
    species: 'moc_dai',
    ratCount: 0,
    weightHistory: [],
    healthHistory: [],
    history: [],
    lastCleanDate: '2026-08-20',
    notes: 'Trống'
  },
  {
    id: 'cage-hb-1-04',
    code: 'HB1-04',
    areaId: 'area-hb',
    areaCode: 'KHU-HB',
    areaKind: 'hau_bi',
    rowId: 'row-hb-1',
    rowCode: 'Dãy 1',
    tier: 1,
    slotNumber: 'V4',
    status: 'trong',
    statusLabel: 'Trống',
    gender: 'duc',
    species: 'moc_dai',
    ratCount: 0,
    weightHistory: [],
    healthHistory: [],
    history: [],
    lastCleanDate: '2026-08-20',
    notes: 'Trống'
  },

  // 3.2 Dãy 2
  {
    id: 'cage-hb-2-01',
    code: 'HB2-01',
    areaId: 'area-hb',
    areaCode: 'KHU-HB',
    areaKind: 'hau_bi',
    rowId: 'row-hb-2',
    rowCode: 'Dãy 2',
    tier: 1,
    slotNumber: 'V1',
    status: 'dang_nuoi_hau_bi',
    statusLabel: 'Đang nuôi',
    gender: 'cai',
    species: 'moc_dai',
    ratCount: 1,
    currentWeightKg: 1.9,
    weightHistory: [],
    healthHistory: [],
    history: [],
    lastCleanDate: '2026-08-22',
    notes: '1.9 kg'
  },
  {
    id: 'cage-hb-2-02',
    code: 'HB2-02',
    areaId: 'area-hb',
    areaCode: 'KHU-HB',
    areaKind: 'hau_bi',
    rowId: 'row-hb-2',
    rowCode: 'Dãy 2',
    tier: 1,
    slotNumber: 'V2',
    status: 'dang_nuoi_hau_bi',
    statusLabel: 'Đang nuôi',
    gender: 'duc',
    species: 'moc_dai',
    ratCount: 1,
    currentWeightKg: 2.1,
    weightHistory: [],
    healthHistory: [],
    history: [],
    lastCleanDate: '2026-08-22',
    notes: '2.1 kg'
  },
  {
    id: 'cage-hb-2-03',
    code: 'HB2-03',
    areaId: 'area-hb',
    areaCode: 'KHU-HB',
    areaKind: 'hau_bi',
    rowId: 'row-hb-2',
    rowCode: 'Dãy 2',
    tier: 1,
    slotNumber: 'V3',
    status: 'trong',
    statusLabel: 'Trống',
    gender: 'cai',
    species: 'moc_dai',
    ratCount: 0,
    weightHistory: [],
    healthHistory: [],
    history: [],
    lastCleanDate: '2026-08-20',
    notes: 'Trống'
  },
  {
    id: 'cage-hb-2-04',
    code: 'HB2-04',
    areaId: 'area-hb',
    areaCode: 'KHU-HB',
    areaKind: 'hau_bi',
    rowId: 'row-hb-2',
    rowCode: 'Dãy 2',
    tier: 1,
    slotNumber: 'V4',
    status: 'trong',
    statusLabel: 'Trống',
    gender: 'duc',
    species: 'moc_dai',
    ratCount: 0,
    weightHistory: [],
    healthHistory: [],
    history: [],
    lastCleanDate: '2026-08-20',
    notes: 'Trống'
  },

  // 4. CÁC Ô KHU THƯƠNG PHẨM
  // 4.1 Dãy 1
  {
    id: 'cage-tp-1-01',
    code: 'TP1-01',
    areaId: 'area-tp',
    areaCode: 'KHU-TP',
    areaKind: 'thuong_pham',
    rowId: 'row-tp-1',
    rowCode: 'Dãy 1',
    tier: 1,
    slotNumber: 'V1',
    status: 'dang_nuoi_thuong_pham',
    statusLabel: 'Đang nuôi',
    gender: 'dan',
    species: 'moc_dai',
    ratCount: 2,
    currentWeightKg: 1.9,
    weightHistory: [{ id: 'w-tp-1', date: '2026-08-18', weightKg: 1.9 }],
    healthHistory: [],
    history: [],
    lastCleanDate: '2026-08-20',
    notes: '1.9 kg'
  },
  {
    id: 'cage-tp-1-02',
    code: 'TP1-02',
    areaId: 'area-tp',
    areaCode: 'KHU-TP',
    areaKind: 'thuong_pham',
    rowId: 'row-tp-1',
    rowCode: 'Dãy 1',
    tier: 1,
    slotNumber: 'V2',
    status: 'cho_xuat',
    statusLabel: 'Chờ xuất bán',
    gender: 'dan',
    species: 'moc_dai',
    ratCount: 1,
    currentWeightKg: 2.2,
    weightHistory: [{ id: 'w-tp-2', date: '2026-08-24', weightKg: 2.2 }],
    healthHistory: [],
    history: [],
    lastCleanDate: '2026-08-24',
    notes: '2.2 kg'
  },
  {
    id: 'cage-tp-1-03',
    code: 'TP1-03',
    areaId: 'area-tp',
    areaCode: 'KHU-TP',
    areaKind: 'thuong_pham',
    rowId: 'row-tp-1',
    rowCode: 'Dãy 1',
    tier: 1,
    slotNumber: 'V3',
    status: 'trong',
    statusLabel: 'Trống',
    gender: 'dan',
    species: 'moc_dai',
    ratCount: 0,
    weightHistory: [],
    healthHistory: [],
    history: [],
    lastCleanDate: '2026-08-20',
    notes: 'Trống'
  },
  {
    id: 'cage-tp-1-04',
    code: 'TP1-04',
    areaId: 'area-tp',
    areaCode: 'KHU-TP',
    areaKind: 'thuong_pham',
    rowId: 'row-tp-1',
    rowCode: 'Dãy 1',
    tier: 1,
    slotNumber: 'V4',
    status: 'trong',
    statusLabel: 'Trống',
    gender: 'dan',
    species: 'moc_dai',
    ratCount: 0,
    weightHistory: [],
    healthHistory: [],
    history: [],
    lastCleanDate: '2026-08-20',
    notes: 'Trống'
  },

  // 4.2 Dãy 2
  {
    id: 'cage-tp-2-01',
    code: 'TP2-01',
    areaId: 'area-tp',
    areaCode: 'KHU-TP',
    areaKind: 'thuong_pham',
    rowId: 'row-tp-2',
    rowCode: 'Dãy 2',
    tier: 1,
    slotNumber: 'V1',
    status: 'dang_nuoi_thuong_pham',
    statusLabel: 'Đang nuôi',
    gender: 'dan',
    species: 'moc_dai',
    ratCount: 2,
    currentWeightKg: 2.0,
    weightHistory: [],
    healthHistory: [],
    history: [],
    lastCleanDate: '2026-08-20',
    notes: '2.0 kg'
  },
  {
    id: 'cage-tp-2-02',
    code: 'TP2-02',
    areaId: 'area-tp',
    areaCode: 'KHU-TP',
    areaKind: 'thuong_pham',
    rowId: 'row-tp-2',
    rowCode: 'Dãy 2',
    tier: 1,
    slotNumber: 'V2',
    status: 'dang_nuoi_thuong_pham',
    statusLabel: 'Đang nuôi',
    gender: 'dan',
    species: 'moc_dai',
    ratCount: 2,
    currentWeightKg: 1.85,
    weightHistory: [],
    healthHistory: [],
    history: [],
    lastCleanDate: '2026-08-20',
    notes: '1.85 kg'
  },
  {
    id: 'cage-tp-2-03',
    code: 'TP2-03',
    areaId: 'area-tp',
    areaCode: 'KHU-TP',
    areaKind: 'thuong_pham',
    rowId: 'row-tp-2',
    rowCode: 'Dãy 2',
    tier: 1,
    slotNumber: 'V3',
    status: 'trong',
    statusLabel: 'Trống',
    gender: 'dan',
    species: 'moc_dai',
    ratCount: 0,
    weightHistory: [],
    healthHistory: [],
    history: [],
    lastCleanDate: '2026-08-20',
    notes: 'Trống'
  },
  {
    id: 'cage-tp-2-04',
    code: 'TP2-04',
    areaId: 'area-tp',
    areaCode: 'KHU-TP',
    areaKind: 'thuong_pham',
    rowId: 'row-tp-2',
    rowCode: 'Dãy 2',
    tier: 1,
    slotNumber: 'V4',
    status: 'trong',
    statusLabel: 'Trống',
    gender: 'dan',
    species: 'moc_dai',
    ratCount: 0,
    weightHistory: [],
    healthHistory: [],
    history: [],
    lastCleanDate: '2026-08-20',
    notes: 'Trống'
  },

  // 5. CÁC Ô KHU ĐIỀU TRỊ
  // 5.1 Dãy 1
  {
    id: 'cage-dt-1-01',
    code: 'DT1-01',
    areaId: 'area-dt',
    areaCode: 'KHU-DT',
    areaKind: 'dieu_tri',
    rowId: 'row-dt-1',
    rowCode: 'Dãy 1',
    tier: 1,
    slotNumber: 'V1',
    status: 'dang_dieu_tri',
    statusLabel: 'Đang điều trị',
    gender: 'duc',
    species: 'moc_dai',
    ratCount: 1,
    treatmentDiseaseType: 'Rối loạn tiêu hóa / Phân ướt',
    currentWeightKg: 2.1,
    weightHistory: [{ id: 'w-dt-1', date: '2026-08-22', weightKg: 2.1 }],
    healthHistory: [{ id: 'h-dt-1', date: '2026-08-22', status: 'dau_om' }],
    treatmentFollowups: [],
    history: [],
    lastCleanDate: '2026-08-24',
    notes: 'Theo dõi'
  },
  {
    id: 'cage-dt-1-02',
    code: 'DT1-02',
    areaId: 'area-dt',
    areaCode: 'KHU-DT',
    areaKind: 'dieu_tri',
    rowId: 'row-dt-1',
    rowCode: 'Dãy 1',
    tier: 1,
    slotNumber: 'V2',
    status: 'trong',
    statusLabel: 'Trống',
    gender: 'duc',
    species: 'moc_dai',
    ratCount: 0,
    weightHistory: [],
    healthHistory: [],
    history: [],
    lastCleanDate: '2026-08-20',
    notes: 'Trống'
  },
  {
    id: 'cage-dt-1-03',
    code: 'DT1-03',
    areaId: 'area-dt',
    areaCode: 'KHU-DT',
    areaKind: 'dieu_tri',
    rowId: 'row-dt-1',
    rowCode: 'Dãy 1',
    tier: 1,
    slotNumber: 'V3',
    status: 'trong',
    statusLabel: 'Trống',
    gender: 'cai',
    species: 'moc_dai',
    ratCount: 0,
    weightHistory: [],
    healthHistory: [],
    history: [],
    lastCleanDate: '2026-08-20',
    notes: 'Trống'
  },
  {
    id: 'cage-dt-1-04',
    code: 'DT1-04',
    areaId: 'area-dt',
    areaCode: 'KHU-DT',
    areaKind: 'dieu_tri',
    rowId: 'row-dt-1',
    rowCode: 'Dãy 1',
    tier: 1,
    slotNumber: 'V4',
    status: 'trong',
    statusLabel: 'Trống',
    gender: 'cai',
    species: 'moc_dai',
    ratCount: 0,
    weightHistory: [],
    healthHistory: [],
    history: [],
    lastCleanDate: '2026-08-20',
    notes: 'Trống'
  },

  // 5.2 Dãy 2
  {
    id: 'cage-dt-2-01',
    code: 'DT2-01',
    areaId: 'area-dt',
    areaCode: 'KHU-DT',
    areaKind: 'dieu_tri',
    rowId: 'row-dt-2',
    rowCode: 'Dãy 2',
    tier: 1,
    slotNumber: 'V1',
    status: 'dang_dieu_tri',
    statusLabel: 'Đang điều trị',
    gender: 'cai',
    species: 'moc_dai',
    ratCount: 1,
    currentWeightKg: 1.95,
    weightHistory: [],
    healthHistory: [],
    history: [],
    lastCleanDate: '2026-08-24',
    notes: 'Theo dõi thể trạng'
  },
  {
    id: 'cage-dt-2-02',
    code: 'DT2-02',
    areaId: 'area-dt',
    areaCode: 'KHU-DT',
    areaKind: 'dieu_tri',
    rowId: 'row-dt-2',
    rowCode: 'Dãy 2',
    tier: 1,
    slotNumber: 'V2',
    status: 'trong',
    statusLabel: 'Trống',
    gender: 'cai',
    species: 'moc_dai',
    ratCount: 0,
    weightHistory: [],
    healthHistory: [],
    history: [],
    lastCleanDate: '2026-08-20',
    notes: 'Trống'
  },
  {
    id: 'cage-dt-2-03',
    code: 'DT2-03',
    areaId: 'area-dt',
    areaCode: 'KHU-DT',
    areaKind: 'dieu_tri',
    rowId: 'row-dt-2',
    rowCode: 'Dãy 2',
    tier: 1,
    slotNumber: 'V3',
    status: 'trong',
    statusLabel: 'Trống',
    gender: 'duc',
    species: 'moc_dai',
    ratCount: 0,
    weightHistory: [],
    healthHistory: [],
    history: [],
    lastCleanDate: '2026-08-20',
    notes: 'Trống'
  },
  {
    id: 'cage-dt-2-04',
    code: 'DT2-04',
    areaId: 'area-dt',
    areaCode: 'KHU-DT',
    areaKind: 'dieu_tri',
    rowId: 'row-dt-2',
    rowCode: 'Dãy 2',
    tier: 1,
    slotNumber: 'V4',
    status: 'trong',
    statusLabel: 'Trống',
    gender: 'duc',
    species: 'moc_dai',
    ratCount: 0,
    weightHistory: [],
    healthHistory: [],
    history: [],
    lastCleanDate: '2026-08-20',
    notes: 'Trống'
  }
];

// Helper: Tính số ngày chênh lệch giữa dateStr và todayStr
export function daysBetween(dateStr1: string, dateStr2: string): number {
  const d1 = new Date(dateStr1);
  const d2 = new Date(dateStr2);
  const diffTime = d1.getTime() - d2.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

// Helper: Format ngày chuẩn DD/MM/YYYY
export function formatDateVN(dateStr?: string): string {
  if (!dateStr) return '---';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

// Helper: Thêm ngày vào date string YYYY-MM-DD (Tuyệt đối an toàn, không bao giờ văng ngoại lệ RangeError)
export function addDays(dateStr?: string, days: number = 0): string {
  if (!dateStr || typeof dateStr !== 'string' || !dateStr.trim()) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  } catch {
    return '';
  }
}

/**
 * TỰ ĐỘNG ĐỒNG BỘ ĐÀN CON VÀO KHU BABY KHI MẸ Ở TRẠNG THÁI MỚI TÁCH CON
 * Đảm bảo dữ liệu đàn con lập tức hiển thị tại Ô Baby đích ngay khi mẹ chuyển trạng thái
 */
export function reconcileBabyCagesFromWeanedMothers(
  cages: FarmCage[], 
  todayStr: string = new Date().toISOString().split('T')[0]
): { updatedCages: FarmCage[]; countChanged: number } {
  let countChanged = 0;
  let result = [...cages];

  // Tìm tất cả các ô mẹ đang ở trạng thái 'moi_tach_con' và có đàn con tách
  const weanedMothers = result.filter(c => c.status === 'moi_tach_con' && (c.weanedBabyCount || 0) > 0);

  for (const mother of weanedMothers) {
    const weanedCount = mother.weanedBabyCount || 1;
    const weanedWeight = mother.weanedBabyWeightAvg || 0.35;
    const weanedGroup = mother.weanedBabyGroup || '3_4_lang';
    const targetCode = (mother.targetBabyCageCode || '').trim().toUpperCase();

    // 1. Kiểm tra xem đã có ô Baby nào ghi nhận đàn con từ mẹ này chưa
    const alreadyReceived = result.some(c => 
      c.areaKind === 'baby' && 
      (c.sourceCageCode === mother.code || (c.history && c.history.some(h => h.relatedCageCode === mother.code || (h.summary && h.summary.includes(`từ mẹ Ô ${mother.code}`)))))
    );

    if (!alreadyReceived) {
      // Tìm ô baby đích
      let targetCage = result.find(c => targetCode && c.code.toUpperCase() === targetCode);
      if (!targetCage) {
        targetCage = result.find(c => c.areaKind === 'baby' && (c.status === 'trong' || (c.ratCount || 0) === 0)) ||
                     result.find(c => c.areaKind === 'baby');
      }

      if (targetCage && targetCage.id !== mother.id) {
        countChanged++;
        const currentCount = targetCage.status === 'trong' ? 0 : (targetCage.ratCount || 0);
        const updatedBaby: FarmCage = {
          ...targetCage,
          status: 'dang_nuoi_baby',
          statusLabel: 'Đang nuôi Baby',
          gender: 'dan',
          babyGroup: weanedGroup,
          entryDate: mother.weaningDate || todayStr,
          ratCount: currentCount + weanedCount,
          currentWeightKg: weanedWeight,
          species: mother.species || 'moc_dai',
          sourceCageCode: mother.code,
          history: [
            {
              id: `his-${Date.now()}-auto-reconcile-${Math.random()}`,
              timestamp: `${mother.weaningDate || todayStr} 08:00`,
              eventType: 'chuyen_baby',
              summary: `Đồng bộ tiếp nhận ${weanedCount} con non tách từ mẹ Ô ${mother.code} (Trọng lượng TB: ${weanedWeight}kg, nhóm ${weanedGroup}).`,
              relatedCageCode: mother.code,
              actor: 'Hệ thống tự động'
            },
            ...(targetCage.history || [])
          ]
        };

        result = result.map(c => {
          if (c.id === updatedBaby.id) return updatedBaby;
          if (c.id === mother.id && !c.targetBabyCageCode) {
            return { ...c, targetBabyCageCode: updatedBaby.code };
          }
          return c;
        });
      }
    }
  }

  return { updatedCages: result, countChanged };
}

/**
 * TỰ ĐỘNG CHUYỂN TRẠNG THÁI THEO ĐẶC TẢ CHỐT:
 * 1. "Ô Đực sau tách cái đủ 10 ngày -> tự động chuyển sang Sẵn sàng ghép"
 * 2. Tự động đồng bộ đàn con vào Khu Baby nếu ô mẹ đang mới tách con
 */
export function applyAutoStatusTransitions(cages: FarmCage[], todayStr: string): { updatedCages: FarmCage[]; countChanged: number } {
  let countChanged = 0;
  let updatedCages = cages.map(cage => {
    // 2.5. Mới tách cái / Chờ đánh giá - Ô Đực: sau đủ 10 ngày kể từ ngày tách -> tự động chuyển sang "Sẵn sàng ghép"
    if (cage.areaKind === 'sinh_san' && cage.gender === 'duc' && cage.status === 'moi_tach_cai' && cage.matingSeparationDate) {
      const daysSinceSeparation = daysBetween(todayStr, cage.matingSeparationDate);
      if (daysSinceSeparation >= 10) {
        countChanged++;
        const newHistoryItem = {
          id: `his-auto-${Date.now()}-${Math.random()}`,
          timestamp: `${todayStr} 00:00`,
          eventType: 'tu_dong_chuyen_trang_thai' as const,
          summary: `Hệ thống tự động chuyển sang Sẵn sàng ghép (đủ 10 ngày nghỉ ngơi sau tách cái ngày ${formatDateVN(cage.matingSeparationDate)})`,
          actor: 'Hệ thống tự động'
        };
        return {
          ...cage,
          status: 'san_sang_ghep' as const,
          statusLabel: 'Sẵn sàng ghép',
          history: [newHistoryItem, ...cage.history]
        };
      }
    }
    return cage;
  });

  // Tự động kiểm tra và đồng bộ ô baby nếu có ô mẹ mới tách con
  const babySync = reconcileBabyCagesFromWeanedMothers(updatedCages, todayStr);
  if (babySync.countChanged > 0) {
    updatedCages = babySync.updatedCages;
    countChanged += babySync.countChanged;
  }

  return { updatedCages, countChanged };
}

/**
 * CƠ CHẾ SINH CÔNG VIỆC & CẢNH BÁO TỰ ĐỘNG THEO ĐẶC TẢ CHỐT:
 * 1. Nguyên tắc cốt lõi:
 *    - Trạng thái của Ô không đồng nghĩa với công việc.
 *    - Công việc chỉ sinh từ "việc dự kiến tiếp theo + ngày hẹn thực tế".
 *    - Không có ngày hẹn -> không đưa vào cơ chế cảnh báo.
 *    - Khi hoàn thành -> cảnh báo biến mất, lịch sử giữ nguyên.
 * 2. Ghép đôi: Ngày ghép + 20 ngày -> Việc "Tách ghép / kiểm tra kết quả".
 * 3. Mới tách con / Đang dưỡng:
 *    - Chu kỳ theo dõi 10 ngày kể từ ngày tách con.
 *    - Ngày 8: chưa cảnh báo.
 *    - Ngày 9: bắt đầu cảnh báo sắp đến hạn.
 *    - Ngày 10: đến hạn "Kiểm tra sức khỏe phục vụ ghép lại".
 *    - Từ ngày 11: quá hạn nếu chưa xử lý.
 * 4. Mới tách đực / Chờ kết quả:
 *    - Ngày đánh giá dự kiến (khoảng 45-60 ngày).
 * 5. Tái khám điều trị:
 *    - Ngày tái khám đã ấn định.
 * 6. Vệ sinh chuồng trại:
 *    - Chưa từng ghi nhận -> Nhắc ghi nhận lần đầu hôm nay (đến hạn).
 *    - Đã có ngày gần nhất -> Nhắc lại sau 7 ngày.
 * 7. Phun khử trùng:
 *    - Nhắc lại sau 07 ngày từ lần gần nhất (trùng với chu kỳ vệ sinh 7 ngày). Nếu chưa từng ghi nhận -> không tự nhắc.
 * 8. Sắp xếp hiển thị: Quá hạn trước -> Đến hạn hôm nay -> Sắp đến hạn. Trong cùng nhóm: ngày hẹn tăng dần.
 */
export function generateAutoTasks(
  cages: FarmCage[], 
  disinfectionLogs: DisinfectionLogItem[], 
  todayStr: string
): FarmTask[] {
  const tasks: FarmTask[] = [];

  const hasAnyRats = cages.some(c => c.status !== 'trong' && (c.ratCount || 0) > 0);

  // A. Quét các Ô có nghiệp vụ & ngày hẹn thực tế
  cages.forEach(cage => {
    // Bỏ qua các ô chuồng trống không nuôi con nào (trừ trường hợp đặc biệt)
    const isOccupied = cage.status !== 'trong' && (cage.ratCount || 0) > 0;

    // 1. Ghép đôi -> Mốc +20 ngày chuẩn
    if (cage.status === 'ghep_doi' && cage.matingDate) {
      const dueDate = addDays(cage.matingDate, 20);
      const diff = daysBetween(dueDate, todayStr); // dueDate - todayStr (âm là quá hạn)
      const daysPassed = daysBetween(todayStr, cage.matingDate);
      
      let urgency: TaskUrgency | null = null;
      if (diff < 0) {
        urgency = 'qua_han';
      } else if (diff === 0) {
        urgency = 'den_han';
      } else if (diff <= 2) {
        // Cảnh báo sớm 1-2 ngày
        urgency = 'sap_den_han';
      }

      if (urgency) {
        tasks.push({
          id: `task-mating-${cage.id}`,
          sourceType: 'mating_separation',
          title: `Tách ghép & Kiểm tra kết quả Ô ${cage.code}`,
          description: `Đã ghép đôi từ ngày ${formatDateVN(cage.matingDate)} (ngày ${daysPassed}/20). Kiểm tra tách đực và đánh giá thụ thai.`,
          dueDate,
          cageId: cage.id,
          cageCode: cage.code,
          areaId: cage.areaId,
          areaCode: cage.areaCode,
          urgency,
          isCompleted: false
        });
      }
    }

    // 2. Mới tách con / Đang dưỡng -> Mốc 10 ngày (ngày 9 cảnh báo, ngày 10 đến hạn, ngày 11+ quá hạn)
    if (cage.status === 'moi_tach_con' && cage.weaningDate && !cage.postWeaningHealthChecked) {
      const dueDate = addDays(cage.weaningDate, 10);
      const daysPassed = daysBetween(todayStr, cage.weaningDate);
      
      let urgency: TaskUrgency | null = null;
      if (daysPassed > 10) {
        urgency = 'qua_han';
      } else if (daysPassed === 10) {
        urgency = 'den_han';
      } else if (daysPassed === 9) {
        // Đúng ngày thứ 9 bắt đầu cảnh báo sắp đến hạn theo chuẩn đặc tả!
        urgency = 'sap_den_han';
      }

      if (urgency) {
        tasks.push({
          id: `task-weaning-check-${cage.id}`,
          sourceType: 'post_weaning_health_check',
          title: `Kiểm tra sức khỏe phục vụ ghép lại Ô ${cage.code}`,
          description: `Tách con ngày ${formatDateVN(cage.weaningDate)} (đang ở ngày thứ ${daysPassed}/10). Kiểm tra thể trạng, tuyến vú và xác nhận để chuyển Sẵn sàng ghép.`,
          dueDate,
          cageId: cage.id,
          cageCode: cage.code,
          areaId: cage.areaId,
          areaCode: cage.areaCode,
          urgency,
          isCompleted: false
        });
      }
    }

    // 3. Đang nuôi con -> Mốc 45 ngày tách con chuyển sang Khu Baby
    if (cage.status === 'dang_nuoi_con' && cage.birthDate) {
      const dueDate = addDays(cage.birthDate, 45);
      const diff = daysBetween(dueDate, todayStr);
      const daysPassed = daysBetween(todayStr, cage.birthDate);
      
      let urgency: TaskUrgency | null = null;
      if (diff < 0) {
        urgency = 'qua_han';
      } else if (diff === 0) {
        urgency = 'den_han';
      } else if (diff <= 2) {
        urgency = 'sap_den_han';
      }

      if (urgency) {
        tasks.push({
          id: `task-nursing-wean-${cage.id}`,
          sourceType: 'nursing_weaning',
          title: `Tách đàn con non Ô ${cage.code} (45 ngày tuổi)`,
          description: `Dúi mẹ sinh ngày ${formatDateVN(cage.birthDate)} (đã nuôi ${daysPassed}/45 ngày, ${cage.livingBabyCount || cage.totalBornCount || 0} con non). Tách đàn chuyển sang Khu Baby.`,
          dueDate,
          cageId: cage.id,
          cageCode: cage.code,
          areaId: cage.areaId,
          areaCode: cage.areaCode,
          urgency,
          isCompleted: false
        });
      }
    }

    // 4. Mới tách đực / Chờ kết quả mang thai (Theo dõi 45-60 ngày)
    if (cage.status === 'moi_tach_duc' || cage.status === 'moi_tach_duc_khong_ro') {
      const dueDate = cage.expectedEvaluationDate || (cage.matingSeparationDate ? addDays(cage.matingSeparationDate, 35) : (cage.matingDate ? addDays(cage.matingDate, 50) : null));
      if (dueDate) {
        const diff = daysBetween(dueDate, todayStr);
        
        let urgency: TaskUrgency | null = null;
        if (diff < 0) {
          urgency = 'qua_han';
        } else if (diff === 0) {
          urgency = 'den_han';
        } else if (diff <= 3) {
          urgency = 'sap_den_han';
        }

        if (urgency) {
          tasks.push({
            id: `task-pregnancy-${cage.id}`,
            sourceType: 'pregnancy_check',
            title: `Khám thai & Chuẩn bị ổ đẻ Ô ${cage.code}`,
            description: `Tách đực từ ${formatDateVN(cage.matingSeparationDate || cage.matingDate || todayStr)}. Khám nắn bụng hoặc bổ sung lót ổ chuẩn bị sinh sản.`,
            dueDate,
            cageId: cage.id,
            cageCode: cage.code,
            areaId: cage.areaId,
            areaCode: cage.areaCode,
            urgency,
            isCompleted: false
          });
        }
      }
    }

    // 5. Ô Đực sau tách cái (10 ngày nghỉ hồi sức)
    if (cage.status === 'moi_tach_cai' && cage.matingSeparationDate) {
      const dueDate = addDays(cage.matingSeparationDate, 10);
      const daysPassed = daysBetween(todayStr, cage.matingSeparationDate);
      
      let urgency: TaskUrgency | null = null;
      if (daysPassed >= 10) {
        urgency = 'den_han';
      } else if (daysPassed === 9) {
        urgency = 'sap_den_han';
      }

      if (urgency) {
        tasks.push({
          id: `task-male-rest-${cage.id}`,
          sourceType: 'male_rest_check',
          title: `Kiểm tra đực giống Ô ${cage.code} sau nghỉ dưỡng 10 ngày`,
          description: `Đực tách cái ngày ${formatDateVN(cage.matingSeparationDate)} (đã nghỉ ${daysPassed}/10 ngày). Đã đủ thể lực phục hồi sẵn sàng ghép đôi.`,
          dueDate,
          cageId: cage.id,
          cageCode: cage.code,
          areaId: cage.areaId,
          areaCode: cage.areaCode,
          urgency,
          isCompleted: false
        });
      }
    }

    // 6. Điều trị bệnh -> Ngày tái khám theo phác đồ thú y
    if (cage.status === 'dang_dieu_tri') {
      const dueDate = cage.treatmentNextExamDate || (cage.treatmentTransferDate ? addDays(cage.treatmentTransferDate, 5) : (cage.treatmentDetectionDate ? addDays(cage.treatmentDetectionDate, 5) : todayStr));
      const diff = daysBetween(dueDate, todayStr);
      
      let urgency: TaskUrgency | null = null;
      if (diff < 0) {
        urgency = 'qua_han';
      } else if (diff === 0) {
        urgency = 'den_han';
      } else if (diff <= 1) {
        urgency = 'sap_den_han';
      }

      if (urgency) {
        tasks.push({
          id: `task-treat-${cage.id}`,
          sourceType: 'treatment_re_exam',
          title: `Tái khám & Đánh giá ca bệnh Ô ${cage.code}`,
          description: `Bệnh: ${cage.treatmentDiseaseType || 'Thú y'}. Kiểm tra mức độ hồi phục để chuyển về Ô cũ hoặc xử lý tiếp.`,
          dueDate,
          cageId: cage.id,
          cageCode: cage.code,
          areaId: cage.areaId,
          areaCode: cage.areaCode,
          urgency,
          isCompleted: false
        });
      }
    }

    // 7. Khu Baby -> Cân trọng lượng & chuyển nhóm phân đàn
    if (cage.areaKind === 'baby' && isOccupied) {
      if (cage.readyToTransferDate) {
        const diff = daysBetween(cage.readyToTransferDate, todayStr);
        let urgency: TaskUrgency | null = null;
        if (diff < 0) urgency = 'qua_han';
        else if (diff === 0) urgency = 'den_han';
        else if (diff <= 3) urgency = 'sap_den_han';

        if (urgency) {
          tasks.push({
            id: `task-baby-transfer-${cage.id}`,
            sourceType: 'baby_transfer_check',
            title: `Cân trọng lượng & Phân nhóm đàn Baby Ô ${cage.code}`,
            description: `Đàn Baby (${cage.ratCount} con). Kiểm tra cân nặng để chuyển lên nhóm thể trọng tiếp theo hoặc phân loại Hậu bị.`,
            dueDate: cage.readyToTransferDate,
            cageId: cage.id,
            cageCode: cage.code,
            areaId: cage.areaId,
            areaCode: cage.areaCode,
            urgency,
            isCompleted: false
          });
        }
      }
    }

    // 8. Khu Hậu Bị -> Đánh giá chọn giống F1
    if (cage.areaKind === 'hau_bi' && isOccupied) {
      const evalDate = cage.hauBiEvaluationDate || (cage.hauBiEntryDate ? addDays(cage.hauBiEntryDate, 60) : null);
      if (evalDate) {
        const diff = daysBetween(evalDate, todayStr);
        let urgency: TaskUrgency | null = null;
        if (diff < 0) urgency = 'qua_han';
        else if (diff === 0) urgency = 'den_han';
        else if (diff <= 3) urgency = 'sap_den_han';

        if (urgency) {
          tasks.push({
            id: `task-haubi-eval-${cage.id}`,
            sourceType: 'hau_bi_evaluation',
            title: `Đánh giá phân loại chọn Dúi giống F1 Ô ${cage.code}`,
            description: `Kiểm tra ngoại hình, cân nặng, cơ quan sinh dục đạt chuẩn giống F1 để chuyển sang Khu Sinh Sản hoặc Thương phẩm.`,
            dueDate: evalDate,
            cageId: cage.id,
            cageCode: cage.code,
            areaId: cage.areaId,
            areaCode: cage.areaCode,
            urgency,
            isCompleted: false
          });
        }
      }
    }

    // 9. Khu Thương Phẩm -> Xuất bán
    if (cage.areaKind === 'thuong_pham' && isOccupied && cage.readyToExportDate) {
      const diff = daysBetween(cage.readyToExportDate, todayStr);
      let urgency: TaskUrgency | null = null;
      if (diff < 0) urgency = 'qua_han';
      else if (diff === 0) urgency = 'den_han';
      else if (diff <= 3) urgency = 'sap_den_han';

      if (urgency) {
        tasks.push({
          id: `task-comm-export-${cage.id}`,
          sourceType: 'commercial_export',
          title: `Kiểm tra trọng lượng & Xuất bán Thương phẩm Ô ${cage.code}`,
          description: `Đàn thương phẩm (${cage.ratCount} con). Kiểm tra cân nặng đạt chuẩn thương phẩm và chuẩn bị xuất bán.`,
          dueDate: cage.readyToExportDate,
          cageId: cage.id,
          cageCode: cage.code,
          areaId: cage.areaId,
          areaCode: cage.areaCode,
          urgency,
          isCompleted: false
        });
      }
    }

    // 10. CẢNH BÁO SỨC KHỎE BẤT THƯỜNG (Cá thể có dấu hiệu ốm/thể trạng kém tại các khu nuôi)
    if (isOccupied && cage.status !== 'dang_dieu_tri' && (cage.healthStatus === 'kem' || cage.healthStatus === 'dau_om')) {
      tasks.push({
        id: `task-health-alert-${cage.id}`,
        sourceType: 'health_alert',
        title: `Cảnh báo cá thể có biểu hiện suy giảm sức khỏe Ô ${cage.code}`,
        description: `Thể trạng: ${cage.healthStatus === 'dau_om' ? 'Đau ốm' : 'Kém / Bỏ ăn'}. Cần khám lâm sàng ngay hoặc chuyển cách ly sang Khu Điều trị thú y.`,
        dueDate: todayStr,
        cageId: cage.id,
        cageCode: cage.code,
        areaId: cage.areaId,
        areaCode: cage.areaCode,
        urgency: 'qua_han', // Khẩn cấp
        isCompleted: false
      });
    }

    // 11. Vệ sinh chuồng trại định kỳ (7 ngày)
    // QUAN TRỌNG: CHỈ áp dụng cho các ô ĐANG CÓ DÚI
    if (isOccupied) {
      if (!cage.lastCleanDate) {
        tasks.push({
          id: `task-clean-${cage.id}`,
          sourceType: 'cage_sanitation',
          title: `Ghi nhận vệ sinh lần đầu Ô ${cage.code}`,
          description: `Ô chuồng đang nuôi cá thể nhưng chưa có lịch sử vệ sinh. Cần dọn phân và kiểm tra thức ăn thừa.`,
          dueDate: todayStr,
          cageId: cage.id,
          cageCode: cage.code,
          areaId: cage.areaId,
          areaCode: cage.areaCode,
          urgency: 'den_han',
          isCompleted: false
        });
      } else {
        const cleanDueDate = addDays(cage.lastCleanDate, 7);
        const cleanDiff = daysBetween(cleanDueDate, todayStr);
        if (cleanDiff < 0) {
          tasks.push({
            id: `task-clean-${cage.id}`,
            sourceType: 'cage_sanitation',
            title: `Vệ sinh định kỳ Ô ${cage.code}`,
            description: `Đã 7+ ngày từ lần dọn vệ sinh trước (${formatDateVN(cage.lastCleanDate)}).`,
            dueDate: cleanDueDate,
            cageId: cage.id,
            cageCode: cage.code,
            areaId: cage.areaId,
            areaCode: cage.areaCode,
            urgency: 'qua_han',
            isCompleted: false
          });
        } else if (cleanDiff === 0) {
          tasks.push({
            id: `task-clean-${cage.id}`,
            sourceType: 'cage_sanitation',
            title: `Vệ sinh định kỳ Ô ${cage.code}`,
            description: `Hôm nay đến hạn vệ sinh định kỳ 7 ngày (lần trước: ${formatDateVN(cage.lastCleanDate)}).`,
            dueDate: cleanDueDate,
            cageId: cage.id,
            cageCode: cage.code,
            areaId: cage.areaId,
            areaCode: cage.areaCode,
            urgency: 'den_han',
            isCompleted: false
          });
        } else if (cleanDiff === 1) {
          // Ngày thứ 6: sắp đến hạn
          tasks.push({
            id: `task-clean-${cage.id}`,
            sourceType: 'cage_sanitation',
            title: `Chuẩn bị vệ sinh Ô ${cage.code}`,
            description: `Còn 1 ngày đến hạn vệ sinh định kỳ 7 ngày (lần trước: ${formatDateVN(cage.lastCleanDate)}).`,
            dueDate: cleanDueDate,
            cageId: cage.id,
            cageCode: cage.code,
            areaId: cage.areaId,
            areaCode: cage.areaCode,
            urgency: 'sap_den_han',
            isCompleted: false
          });
        }
      }
    }
  });

  // B. Phun khử trùng định kỳ (07 ngày trùng lịch vệ sinh)
  if (disinfectionLogs.length > 0) {
    const latestDis = disinfectionLogs[0];
    const nextDisDate = addDays(latestDis.date, 7);
    const disDiff = daysBetween(nextDisDate, todayStr);

    if (disDiff < 0) {
      tasks.push({
        id: 'task-disinfection-periodic',
        sourceType: 'disinfection',
        title: 'Phun tiêu độc khử trùng toàn trang trại (07 ngày)',
        description: `Đã quá 07 ngày từ lần phun trước (${formatDateVN(latestDis.date)} - ${latestDis.chemical}). Phun Cloramin B toàn trại kết hợp vệ sinh.`,
        dueDate: nextDisDate,
        urgency: 'qua_han',
        isCompleted: false
      });
    } else if (disDiff === 0) {
      tasks.push({
        id: 'task-disinfection-periodic',
        sourceType: 'disinfection',
        title: 'Phun tiêu độc khử trùng toàn trang trại (07 ngày)',
        description: `Hôm nay đến hạn phun khử trùng định kỳ 07 ngày trùng lịch vệ sinh (lần gần nhất: ${formatDateVN(latestDis.date)}).`,
        dueDate: nextDisDate,
        urgency: 'den_han',
        isCompleted: false
      });
    } else if (disDiff <= 2) {
      tasks.push({
        id: 'task-disinfection-periodic',
        sourceType: 'disinfection',
        title: 'Chuẩn bị thuốc phun khử trùng định kỳ',
        description: `Còn ${disDiff} ngày đến hạn phun khử trùng 07 ngày (${formatDateVN(nextDisDate)}).`,
        dueDate: nextDisDate,
        urgency: 'sap_den_han',
        isCompleted: false
      });
    }
  } else if (hasAnyRats) {
    // Chưa có nhật ký nhưng trang trại đang có nuôi dúi
    tasks.push({
      id: 'task-disinfection-initial',
      sourceType: 'disinfection',
      title: 'Phun tiêu độc khử trùng an toàn sinh học toàn trại',
      description: 'Chưa có ghi nhận phun khử trùng Cloramin B định kỳ 07 ngày (trùng lịch vệ sinh).',
      dueDate: todayStr,
      urgency: 'den_han',
      isCompleted: false
    });
  }

  // C. Sắp xếp theo quy tắc đặc tả:
  // "Quá hạn trước -> Đến hạn hôm nay -> Sắp đến hạn. Trong cùng nhóm: ngày hẹn tăng dần."
  const urgencyWeight: Record<string, number> = {
    'qua_han': 1,
    'den_han': 2,
    'sap_den_han': 3
  };

  tasks.sort((a, b) => {
    const weightA = urgencyWeight[a.urgency] || 99;
    const weightB = urgencyWeight[b.urgency] || 99;
    if (weightA !== weightB) {
      return weightA - weightB;
    }
    return a.dueDate.localeCompare(b.dueDate);
  });

  return tasks;
}

// ==========================================
// CẨM NANG PHÁC ĐỒ ĐIỀU TRỊ THÚ Y DÚI F1
// ==========================================
export interface VeterinaryProtocolItem {
  id: string;
  name: string;
  category: 'ho_hap' | 'tieu_hoa' | 'da_lieu' | 'chan_thuong' | 'stress_sinh_san';
  symptoms: string;
  medicines: string;
  dosageAndProtocol: string;
  durationDays: number;
  dietAndCare: string;
  notes: string;
}

export const VETERINARY_PROTOCOLS: VeterinaryProtocolItem[] = [
  {
    id: 'viem_phoi',
    name: 'Viêm phổi / Hô hấp (Khò khè, chảy nước mũi, thở dốc)',
    category: 'ho_hap',
    symptoms: 'Thở khò khè, hắt hơi liên tục, chảy nước mũi nhờn, mắt kèm nhèm, bỏ ăn, nằm co ro',
    medicines: 'Tylosin 10% (tiêm bắp) hoặc Doxycycline + Bromhexin 2% long đờm + Vitamin C',
    dosageAndProtocol: 'Tiêm bắp Tylosin 10%: liều 0.1 - 0.2 ml/kg thể trọng/ngày trong 4-5 ngày. Nhỏ Bromhexin hòa nước ấm hoặc siro ho thảo dược.',
    durationDays: 5,
    dietAndCare: 'Giữ ấm tuyệt đối, lót rơm khô sạch hoặc thảm gạch khô ráo, che kín gió lùa, bổ sung nước gừng ấm có pha chút đường gluco.',
    notes: 'Tránh để chuồng ẩm mốc hoặc thay đổi nhiệt độ đột ngột.'
  },
  {
    id: 'tieu_chay',
    name: 'Rối loạn tiêu hóa / Tiêu chảy (Phân nát/lỏng, ướt đuôi)',
    category: 'tieu_hoa',
    symptoms: 'Phân ướt, dính bết hậu môn và đuôi, bụng chướng nhẹ, giảm ăn tre',
    medicines: 'Enrofloxacin 10% (hoặc Florfenicol 10%) + Men vi sinh Bio-Gut / B-Complex + Nước chè xanh',
    dosageAndProtocol: 'Nhỏ trực tiếp Berberin dạng lỏng hoặc Enrofloxacin (0.1ml/kg), kết hợp bơm men tiêu hóa Bio-Gut 1-2ml/con/ngày sau ăn 30 phút.',
    durationDays: 4,
    dietAndCare: 'CẮT NGAY thức ăn nhiều nước (củ quả ướt, mía non). Chỉ cho gặm tre già phơi khô ráo và mía già khô.',
    notes: 'Tiêu chảy ở dúi rất nhanh mất nước, cần bổ sung điện giải kịp thời.'
  },
  {
    id: 'ghe_nam',
    name: 'Ghẻ lở / Nấm da (Rụng lông mảng, vảy ngứa, đỏ rát)',
    category: 'da_lieu',
    symptoms: 'Rụng lông thành mảng quanh mắt, tai hoặc sống lưng, da đóng vảy trắng xám, dúi hay gãi cọ chuồng',
    medicines: 'Ivermectin 0.5% (nhỏ gáy) + Cồn đỏ Povidone Iodine 10% + Mỡ kẽm / Dermoscent',
    dosageAndProtocol: 'Nhỏ 2-3 giọt Ivermectin vào gáy (không để dúi liếm được). Sát trùng vết ghẻ bằng Povidone Iodine 1 lần/ngày.',
    durationDays: 7,
    dietAndCare: 'Cách ly ô riêng biệt để tránh lây chéo, khử trùng chuồng cũ bằng vôi bột hoặc đèn khò gas, phơi khô gạch men.',
    notes: 'Nấm da lây lan nhanh qua môi trường chuồng ẩm thấp.'
  },
  {
    id: 'chan_thuong_can',
    name: 'Chấn thương do cắn nhau (Vết thương hở, rách da, chảy máu)',
    category: 'chan_thuong',
    symptoms: 'Vết cắn ở đuôi, đùi hoặc cổ do ghép phối hoặc tranh chấp thức ăn',
    medicines: 'Dung dịch sát khuẩn Povidone Iodine 10% + Thuốc mỡ Tetracyclin / Kháng viêm Alpha Choay',
    dosageAndProtocol: 'Rửa sạch vết thương bằng nước muối sinh lý, sát trùng Povidone, bôi mỡ kháng sinh Tetracyclin 2 lần/ngày trong 3-4 ngày.',
    durationDays: 4,
    dietAndCare: 'Tách nuôi riêng biệt ô đơn, chuồng lót rơm sạch tránh bụi bẩn dính vào miệng vết thương.',
    notes: 'Khi ghép đôi nếu cắn nhau dữ dội cần tách ngay trong 10-15 phút đầu.'
  },
  {
    id: 'me_stress_bo_con',
    name: 'Dúi mẹ stress / Bỏ con / Cắn con sau khi sinh',
    category: 'stress_sinh_san',
    symptoms: 'Mẹ không cho con bú, kêu la, bồn chồn chạy quanh ô, bỏ con ra góc chuồng',
    medicines: 'Vitamin B-Complex + Điện giải Glucose-C + Thảo dược an thần (tâm sen / chè vằng ấm)',
    dosageAndProtocol: 'Bơm nước ấm pha Vitamin B-Complex và Glucose-C cho mẹ. Giữ yên tĩnh tuyệt đối.',
    durationDays: 3,
    dietAndCare: 'Che tối 80-90% nóc ô chuồng bằng bìa carton, cấm người lạ và tiếng ồn lớn, bổ sung khoai lang / mía mềm.',
    notes: 'Không kiểm tra ổ con liên tục trong 3 ngày đầu sau sinh.'
  }
];

// ==========================================
// CƠ CHẾ BỘ LỌC MÃ Ô KHUYẾT & SẮP XẾP TỰ NHIÊN
// ==========================================

/**
 * Trích xuất chỉ số thứ tự của Dãy (1, 2, 3...) từ mã hoặc tên dãy.
 */
export function extractRowNumber(rowCode: string = '', rowName: string = ''): number {
  const codeMatch = rowCode.match(/\d+/);
  if (codeMatch) return parseInt(codeMatch[0], 10);
  const nameMatch = rowName.match(/\d+/);
  if (nameMatch) return parseInt(nameMatch[0], 10);
  return 1;
}

/**
 * Tự động tạo gợi ý tên và mã cho Dãy mới theo phân loại (Đực, Cái, Chung).
 * Tự đồng bộ số thứ tự tiếp theo:
 * - Dãy Đực: Dãy Đực 1 (DĐ1), Dãy Đực 2 (DĐ2), Dãy Đực 3 (DĐ3)...
 * - Dãy Cái: Dãy Cái 1 (DC1), Dãy Cái 2 (DC2), Dãy Cái 3 (DC3)...
 * - Chung / Khác: Dãy 1 (D1), Dãy 2 (D2)...
 */
export function computeNextRowSuggestion(
  existingRowsInArea: FarmRow[] = [],
  kind: 'cai' | 'duc' | 'chung' = 'cai'
): { name: string; code: string; tierCount: number } {
  if (kind === 'duc') {
    const ducRows = existingRowsInArea.filter(r => 
      r.kind === 'duc' || 
      r.code.toUpperCase().includes('DĐ') || 
      r.code.toUpperCase().includes('DD') || 
      r.name.toLowerCase().includes('đực')
    );
    let maxIdx = 0;
    ducRows.forEach(r => {
      const idx = extractRowNumber(r.code, r.name);
      if (idx > maxIdx) maxIdx = idx;
    });
    const nextIdx = maxIdx + 1;
    return {
      name: `Dãy Đực ${nextIdx}`,
      code: `DĐ${nextIdx}`,
      tierCount: 1
    };
  }

  if (kind === 'cai') {
    const caiRows = existingRowsInArea.filter(r => 
      r.kind === 'cai' || 
      r.code.toUpperCase().includes('DC') || 
      r.name.toLowerCase().includes('cái')
    );
    let maxIdx = 0;
    caiRows.forEach(r => {
      const idx = extractRowNumber(r.code, r.name);
      if (idx > maxIdx) maxIdx = idx;
    });
    const nextIdx = maxIdx + 1;
    return {
      name: `Dãy Cái ${nextIdx}`,
      code: `DC${nextIdx}`,
      tierCount: 2
    };
  }

  // Chung / Khác
  const chungRows = existingRowsInArea.filter(r => 
    r.kind === 'chung' || 
    (!r.kind && !r.name.toLowerCase().includes('cái') && !r.name.toLowerCase().includes('đực'))
  );
  let maxIdx = 0;
  chungRows.forEach(r => {
    const idx = extractRowNumber(r.code, r.name);
    if (idx > maxIdx) maxIdx = idx;
  });
  const nextIdx = maxIdx + 1;
  return {
    name: `Dãy ${nextIdx}`,
    code: `D${nextIdx}`,
    tierCount: 1
  };
}

/**
 * Sinh tiền tố chuẩn cho Mã Ô Chuồng theo Dãy, Tầng (Hàng) và Phân khu.
 * - Dãy Đực 1, Hàng 1 -> "DĐ1-H1-"
 * - Dãy Đực 2, Hàng 1 -> "DĐ2-H1-"
 * - Dãy Cái 1, Hàng 1 -> "DC1-H1-"
 * - Dãy Cái 1, Hàng 2 -> "DC1-H2-"
 * - Dãy Cái 2, Hàng 1 -> "DC2-H1-"
 */
export function computeCageCodePrefix(
  row?: FarmRow,
  tier: number = 1,
  area?: FarmArea
): string {
  const safeTier = tier || 1;
  
  if (row) {
    const isDuc = row.kind === 'duc' || 
      row.code.toUpperCase().includes('DĐ') || 
      row.code.toUpperCase().includes('DD') || 
      row.name.toLowerCase().includes('đực');

    if (isDuc) {
      const rowNum = extractRowNumber(row.code, row.name);
      return `DĐ${rowNum}-H${safeTier}-`;
    }

    const isCai = row.kind === 'cai' || 
      row.code.toUpperCase().includes('DC') || 
      row.name.toLowerCase().includes('cái');

    if (isCai) {
      const rowNum = extractRowNumber(row.code, row.name);
      return `DC${rowNum}-H${safeTier}-`;
    }

    // Nếu là baby
    if (area?.kind === 'baby' || row.areaId === 'area-bb' || row.code.startsWith('DB-') || row.code.startsWith('BB')) {
      const rowNum = extractRowNumber(row.code, row.name);
      return `BB${rowNum}-H${safeTier}-`;
    }

    // Nếu là hậu bị
    if (area?.kind === 'hau_bi' || row.code.startsWith('HB')) {
      const rowNum = extractRowNumber(row.code, row.name);
      return `HB${rowNum}-H${safeTier}-`;
    }

    // Nếu là thương phẩm
    if (area?.kind === 'thuong_pham' || row.code.startsWith('TP')) {
      const rowNum = extractRowNumber(row.code, row.name);
      return `TP${rowNum}-H${safeTier}-`;
    }

    // Nếu là điều trị
    if (area?.kind === 'dieu_tri' || row.code.startsWith('DT')) {
      const rowNum = extractRowNumber(row.code, row.name);
      return `DT${rowNum}-H${safeTier}-`;
    }

    // Mặc định dùng mã row sạch
    const cleanRowCode = row.code.replace(/[^a-zA-Z0-9Đđ]/g, '') || 'D1';
    return `${cleanRowCode}-H${safeTier}-`;
  }

  // Nếu chưa có row nhưng biết phân khu
  if (area?.kind === 'sinh_san') {
    return `DC1-H${safeTier}-`;
  }

  return `O-H${safeTier}-`;
}

export function extractCagePrefixAndNumber(code: string): { prefix: string; num: number; numDigits: number } {
  const match = code.match(/^(.*?)(\d+)$/);
  if (match) {
    return {
      prefix: match[1],
      num: parseInt(match[2], 10),
      numDigits: match[2].length
    };
  }
  return { prefix: code, num: 0, numDigits: 1 };
}

export function sortCagesNaturally(cages: FarmCage[]): FarmCage[] {
  return [...cages].sort((a, b) => {
    if (a.areaId !== b.areaId) {
      return a.areaId.localeCompare(b.areaId);
    }
    if (a.rowId !== b.rowId) {
      return a.rowId.localeCompare(b.rowId);
    }
    
    const parsedA = extractCagePrefixAndNumber(a.code);
    const parsedB = extractCagePrefixAndNumber(b.code);
    
    if (parsedA.prefix !== parsedB.prefix) {
      return parsedA.prefix.localeCompare(parsedB.prefix);
    }
    return parsedA.num - parsedB.num;
  });
}

export function findGapAndNextCageCodes(
  existingCagesInRow: FarmCage[] = [],
  defaultPrefix: string = 'DC1-H1-',
  suggestCount: number = 3,
  allExistingCagesInArea: FarmCage[] = []
): { gapCodes: string[]; nextCodes: string[] } {
  const padLength = (defaultPrefix.includes('-H') || defaultPrefix.startsWith('DĐ') || defaultPrefix.startsWith('DC')) ? 3 : 2;

  // Thu thập toàn bộ mã ô đã tồn tại trong Khu vực hoặc trong Dãy để tuyệt đối không gợi ý mã trùng
  const usedCodesSet = new Set<string>();
  existingCagesInRow.forEach(c => {
    if (c?.code) usedCodesSet.add(c.code.trim().toUpperCase());
  });
  allExistingCagesInArea.forEach(c => {
    if (c?.code) usedCodesSet.add(c.code.trim().toUpperCase());
  });

  const numList: { prefix: string; num: number; numDigits: number }[] = [];
  const relevantCages = existingCagesInRow.length > 0 
    ? existingCagesInRow 
    : allExistingCagesInArea.filter(c => c.code?.toUpperCase().startsWith(defaultPrefix.toUpperCase()));

  relevantCages.forEach(c => {
    const parsed = extractCagePrefixAndNumber(c.code);
    numList.push(parsed);
  });

  const matchingItems = numList.filter(item => item.prefix.toUpperCase() === defaultPrefix.toUpperCase());
  const dominantPrefix = matchingItems.length > 0 ? matchingItems[0].prefix : defaultPrefix;
  const digits = Math.max(
    padLength,
    matchingItems.length > 0 ? matchingItems[0].numDigits : (numList[0]?.numDigits || padLength)
  );

  const numbers = matchingItems
    .filter(item => item.num > 0)
    .map(item => item.num)
    .sort((a, b) => a - b);

  const gapCodes: string[] = [];
  const nextCodes: string[] = [];

  if (numbers.length === 0) {
    let candidate = 1;
    while (nextCodes.length < suggestCount && candidate < 1000) {
      const formatted = `${dominantPrefix}${String(candidate).padStart(digits, '0')}`;
      if (!usedCodesSet.has(formatted.toUpperCase())) {
        nextCodes.push(formatted);
      }
      candidate++;
    }
    return { gapCodes, nextCodes };
  }

  const maxNum = numbers[numbers.length - 1];
  const numSet = new Set(numbers);

  for (let i = 1; i < maxNum; i++) {
    if (!numSet.has(i)) {
      const formatted = `${dominantPrefix}${String(i).padStart(digits, '0')}`;
      if (!usedCodesSet.has(formatted.toUpperCase())) {
        gapCodes.push(formatted);
      }
    }
  }

  let candidateNum = maxNum + 1;
  while (nextCodes.length < suggestCount && candidateNum < maxNum + 1000) {
    const formatted = `${dominantPrefix}${String(candidateNum).padStart(digits, '0')}`;
    if (!usedCodesSet.has(formatted.toUpperCase())) {
      nextCodes.push(formatted);
    }
    candidateNum++;
  }

  return { gapCodes, nextCodes };
}

/**
 * Đảm bảo mọi thuộc tính của FarmCage luôn an toàn và đầy đủ,
 * đặc biệt là các mảng con (weightHistory, healthHistory, treatmentFollowups, history)
 * không bao giờ bị undefined khi đồng bộ từ Firebase Realtime Database.
 */
export function normalizeFarmCage(c: any): FarmCage {
  if (!c || typeof c !== 'object') return c;
  const isTrong = c.status === 'trong';
  
  const toCleanArray = (val: any): any[] => {
    if (!val) return [];
    if (Array.isArray(val)) return val.filter(Boolean);
    if (typeof val === 'object') {
      try {
        return Object.values(val).filter(Boolean);
      } catch {
        return [];
      }
    }
    return [];
  };

  let rowId = c.rowId;
  let rowCode = c.rowCode;
  const code = (c.code || '').trim().toUpperCase();

  let areaId = c.areaId;
  let areaCode = c.areaCode;
  if (!areaId || areaId === 'KHU-SS1' || areaId === 'default') {
    if (code.startsWith('DC') || code.startsWith('DĐ') || code.startsWith('DD') || c.areaCode === 'KHU-SS1') {
      areaId = 'area-ss1';
      areaCode = 'KHU-SS1';
    } else if (code.startsWith('BB')) {
      areaId = 'area-bb';
      areaCode = 'KHU-BB';
    } else if (code.startsWith('HB')) {
      areaId = 'area-hb';
      areaCode = 'KHU-HB';
    } else if (code.startsWith('TP')) {
      areaId = 'area-tp';
      areaCode = 'KHU-TP';
    } else if (code.startsWith('CL') || code.startsWith('DT')) {
      areaId = 'area-cl';
      areaCode = 'KHU-CL';
    }
  }

  if (rowId === 'row-area-ss1-c1' || (areaId === 'area-ss1' && code.startsWith('DC1'))) {
    rowId = 'row-ss1-c1';
    rowCode = rowCode || 'Dãy Cái 1';
  } else if (rowId === 'row-area-ss1-c2' || (areaId === 'area-ss1' && code.startsWith('DC2'))) {
    rowId = 'row-ss1-c2';
    rowCode = rowCode || 'Dãy Cái 2';
  } else if (rowId === 'row-area-ss1-d1' || (areaId === 'area-ss1' && (code.startsWith('DĐ1') || code.startsWith('DD1')))) {
    rowId = 'row-ss1-d1';
    rowCode = rowCode || 'Dãy Đực 1';
  }

  // Xác định xem có phải thuộc Khu Sinh Sản không (mỗi ô nuôi 1 con, khi ghép đôi lên 2, ô cái về trống)
  const isBreedingArea = (c.areaKind === 'sinh_san') || 
    (areaId === 'area-ss1') || 
    (c.areaCode === 'KHU-SS1') || 
    code.startsWith('DC') || 
    code.startsWith('DĐ') || 
    code.startsWith('DD') ||
    (c.rowCode && (c.rowCode.includes('Dãy Cái') || c.rowCode.includes('Dãy Đực')));

  let normalizedRatCount: number;
  if (isTrong) {
    normalizedRatCount = 0;
  } else if (isBreedingArea) {
    if (c.status === 'ghep_doi') {
      normalizedRatCount = 2; // Cặp ghép đôi
    } else if (c.status === 'dang_nuoi_con') {
      normalizedRatCount = 1 + (typeof c.livingBabyCount === 'number' ? c.livingBabyCount : (typeof c.totalBornCount === 'number' ? c.totalBornCount : 4));
    } else {
      // Mỗi ô sinh sản nuôi 1 con (sẵn sàng ghép, đực giống, mới tách đực, mới tách đực không rõ, mới tách cái, mới tách con...)
      normalizedRatCount = 1;
    }
  } else {
    normalizedRatCount = typeof c.ratCount === 'number' ? c.ratCount : (isTrong ? 0 : 1);
  }

  return {
    ...c,
    id: c.id || `cage-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    code: c.code || 'CH-00',
    areaId: areaId || c.areaId,
    areaCode: areaCode || c.areaCode,
    rowId,
    rowCode,
    status: c.status || 'trong',
    statusLabel: isTrong 
      ? (c.partnerCageCode || (c.notes && c.notes.includes('ghép đôi')) || (c.statusLabel && c.statusLabel.includes('chuyển ghép')) ? 'Trống do chuyển ghép' : (c.statusLabel || 'Trống'))
      : (c.statusLabel || 'Không xác định'),
    species: c.species || 'moc_dai',
    gender: isTrong ? (c.gender || undefined) : (c.gender || 'dan'),
    ratCount: normalizedRatCount,
    weightHistory: toCleanArray(c.weightHistory),
    healthHistory: toCleanArray(c.healthHistory),
    treatmentFollowups: toCleanArray(c.treatmentFollowups),
    history: toCleanArray(c.history),
    notes: c.notes || ''
  };
}

/**
 * Điều hòa nghiệp vụ Khu Sinh Sản:
 * - Mỗi ô sinh sản nuôi 1 con (nếu đang ở trạng thái nuôi đơn).
 * - Khi ghép đôi: Cặp ghép ở tại Ô Đực (ratCount = 2), Ô Cái về Trống (ratCount = 0 do chuyển ghép đôi).
 */
export function reconcileBreedingPairCages(cages: FarmCage[]): FarmCage[] {
  if (!Array.isArray(cages)) return [];

  const isFemaleCage = (c: FarmCage): boolean => {
    if (c.gender === 'cai') return true;
    const code = (c.code || '').toUpperCase();
    const row = (c.rowCode || '').toUpperCase();
    return code.startsWith('DC') || row.startsWith('DC') || row.includes('CÁI') || code.includes('CAI');
  };

  const isMaleCage = (c: FarmCage): boolean => {
    if (c.gender === 'duc') return true;
    const code = (c.code || '').toUpperCase();
    const row = (c.rowCode || '').toUpperCase();
    return code.startsWith('DĐ') || code.startsWith('DD') || row.startsWith('DĐ') || row.startsWith('DD') || row.includes('ĐỰC') || code.includes('DUC');
  };

  return cages.map(c => {
    const isBreeding = c.areaKind === 'sinh_san' || c.areaId === 'area-ss1' || c.areaCode === 'KHU-SS1' ||
      c.code.startsWith('DC') || c.code.startsWith('DĐ') || c.code.startsWith('DD');

    if (!isBreeding) return c;

    // Nếu ô cái có trạng thái ghép đôi thì chuyển về Trống do chuyển ghép (0 con) vì dúi cái đã chuyển sang ô đực
    if (c.status === 'ghep_doi' && isFemaleCage(c) && !isMaleCage(c)) {
      return {
        ...c,
        status: 'trong',
        statusLabel: 'Trống do chuyển ghép',
        gender: 'cai',
        ratCount: 0,
        notes: c.notes || (c.partnerCageCode ? `Dúi cái chuyển sang ghép đôi tại Ô Đực ${c.partnerCageCode}. Ô tạm thời để trống do chuyển ghép.` : 'Dúi cái đã chuyển sang ô đực ghép đôi.')
      };
    }

    // Nếu ô cái đang ở trạng thái Trống nhưng có liên kết ghép đôi
    if (c.status === 'trong' && (c.partnerCageCode || (c.notes && c.notes.includes('chuyển sang ghép')))) {
      return {
        ...c,
        status: 'trong',
        statusLabel: 'Trống do chuyển ghép',
        gender: c.gender || 'cai',
        ratCount: 0
      };
    }

    // Nếu là ô đực đang ghép đôi
    if (c.status === 'ghep_doi') {
      return {
        ...c,
        ratCount: 2,
        gender: c.gender || 'duc'
      };
    }

    // Ô trống
    if (c.status === 'trong') {
      return {
        ...c,
        ratCount: 0
      };
    }

    // Đang nuôi con: mẹ + đàn con
    if (c.status === 'dang_nuoi_con') {
      return {
        ...c,
        ratCount: 1 + (c.livingBabyCount || c.totalBornCount || 4)
      };
    }

    // Mọi trạng thái nuôi đơn còn lại của Khu Sinh Sản: quy chuẩn đúng 1 con
    return {
      ...c,
      ratCount: 1
    };
  });
}

/**
 * Khử trùng lặp ô chuồng theo Mã ô (Code)
 * Ưu tiên tuyệt đối ô có dữ liệu ghép đôi, lịch sử, cân nặng, hoặc đang nuôi thay vì ô trống
 */
export function deduplicateCagesByCode(cages: FarmCage[]): FarmCage[] {
  if (!Array.isArray(cages)) return [];
  const map = new Map<string, FarmCage>();
  
  const calcScore = (item: FarmCage): number => {
    let score = 0;
    if (item.status !== 'trong') score += 20;
    if (item.status === 'ghep_doi') score += 30;
    if (item.partnerCageCode) score += 25;
    if (item.partnerCageId) score += 10;
    if (item.matingDate) score += 15;
    score += (item.ratCount || 0) * 3;
    score += (item.history?.length || 0) * 2;
    score += (item.weightHistory?.length || 0) * 2;
    score += (item.healthHistory?.length || 0) * 2;
    if (item.notes && item.notes.trim().length > 0) score += 5;
    return score;
  };

  for (const raw of cages) {
    if (!raw || !raw.code) continue;
    const c = normalizeFarmCage(raw);
    const codeKey = c.code.trim().toUpperCase();
    const existing = map.get(codeKey);
    if (!existing) {
      map.set(codeKey, c);
    } else {
      const existingScore = calcScore(existing);
      const newScore = calcScore(c);
      if (newScore > existingScore) {
        map.set(codeKey, c);
      }
    }
  }
  return Array.from(map.values());
}
