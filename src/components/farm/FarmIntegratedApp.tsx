import React, { useState, useEffect, useRef } from 'react';
import { UserRole, DuiProductOrder, DuiOrderStatus } from '../../types';
import { 
  FarmNavTab, 
  FarmArea, 
  FarmRow, 
  FarmCage, 
  FarmTask, 
  DisinfectionLogItem 
} from './farmTypes';
import { 
  INITIAL_AREAS, 
  INITIAL_ROWS, 
  INITIAL_CAGES, 
  INITIAL_DISINFECTION_LOGS,
  SAMPLE_DEMO_CAGES,
  FARM_METADATA,
  FARM_PHOTOS,
  applyAutoStatusTransitions,
  reconcileBabyCagesFromWeanedMothers,
  generateAutoTasks,
  formatDateVN,
  addDays,
  daysBetween
} from './farmData';
import { FarmOverviewView } from './FarmOverviewView';
import { FarmAreasView } from './FarmAreasView';
import { FarmTasksView } from './FarmTasksView';
import { FarmTreatmentView } from './FarmTreatmentView';
import { FarmReportsView } from './FarmReportsView';
import { DuiMarketplaceView } from './DuiMarketplaceView';
import { FarmCageProfileModal } from './FarmCageProfileModal';
import { AddCageModal } from './AddCageModal';
import { FarmSanitationModal } from './FarmSanitationModal';
import { FarmQRModal, CageQRModal } from './FarmModals';
import { UniversalQRModal } from './UniversalQRModal';
import { ManageStructureModal } from './ManageStructureModal';
import { 
  migrateFarmEntities, 
  resolveQrTargetFromUrl, 
  registerOrRecoverPhysicalLocation,
  markPhysicalLocationDeleted,
  PhysicalLocationRecord,
  QrTargetType 
} from '../../utils/qrHelper';
import { syncOnlinePayload, isOnlineSyncReady } from '../../services/onlineSyncService';
import { 
  Home, 
  Building2, 
  Clock, 
  ShieldAlert, 
  BarChart3, 
  Plus, 
  ArrowLeft, 
  Sparkles, 
  CheckCircle2, 
  RefreshCw,
  Phone,
  MapPin,
  Layers,
  Database,
  Check,
  ShoppingBag,
  Lock,
  Crown,
  AlertTriangle,
  QrCode
} from 'lucide-react';

interface FarmIntegratedAppProps {
  onBackToPortal?: () => void;
  userRole?: UserRole;
  duiOrders?: DuiProductOrder[];
  onAddDuiOrder?: (orderData: Omit<DuiProductOrder, 'id' | 'code' | 'createdAt' | 'status'>) => DuiProductOrder;
  onUpdateDuiOrderStatus?: (orderId: string, status: DuiOrderStatus) => void;
  onOpenAdminLogin?: (reason?: string) => void;
}

export const FarmIntegratedApp: React.FC<FarmIntegratedAppProps> = ({
  onBackToPortal,
  userRole = 'guest',
  duiOrders = [],
  onAddDuiOrder,
  onUpdateDuiOrderStatus,
  onOpenAdminLogin
}) => {
  // Local state persistence with schema versioning v3 (Dữ liệu thật 100% bắt đầu sạch)
  const [cages, setCages] = useState<FarmCage[]>(() => {
    const saved = localStorage.getItem('farm_cages_real_v3');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        const { updatedCages } = reconcileBabyCagesFromWeanedMothers(parsed);
        return updatedCages;
      } catch (e) {}
    }
    const { updatedCages } = reconcileBabyCagesFromWeanedMothers(INITIAL_CAGES);
    return updatedCages;
  });

  const [areas, setAreas] = useState<FarmArea[]>(() => {
    const saved = localStorage.getItem('farm_areas_real_v3');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_AREAS;
  });

  const [rows, setRows] = useState<FarmRow[]>(() => {
    const saved = localStorage.getItem('farm_rows_real_v3');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_ROWS;
  });

  const [disinfectionLogs, setDisinfectionLogs] = useState<DisinfectionLogItem[]>(() => {
    const saved = localStorage.getItem('farm_disinfection_real_v3');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_DISINFECTION_LOGS;
  });

  const [customTasks, setCustomTasks] = useState<FarmTask[]>(() => {
    const saved = localStorage.getItem('farm_custom_tasks_v3');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  const [currentTab, setCurrentTab] = useState<FarmNavTab>('areas');
  const [selectedAreaId, setSelectedAreaId] = useState<string | undefined>(undefined);
  
  // Modals state
  const [selectedCageForProfile, setSelectedCageForProfile] = useState<FarmCage | null>(null);
  const [showAddCageModal, setShowAddCageModal] = useState<boolean>(false);
  const [showSanitationModal, setShowSanitationModal] = useState<boolean>(false);
  const [showFarmQRModal, setShowFarmQRModal] = useState<boolean>(false);
  const [showStructureModal, setShowStructureModal] = useState<boolean>(false);
  const [selectedQRTarget, setSelectedQRTarget] = useState<{ 
    cage?: FarmCage; 
    area?: FarmArea; 
    row?: FarmRow; 
    type?: QrTargetType 
  } | null>(null);

  // State thông báo nhận diện vị trí vật lý khi quét QR (khi dữ liệu chưa có hoặc đã bị xóa)
  const [emptyLocationAlert, setEmptyLocationAlert] = useState<{
    isOpen: boolean;
    message: string;
    targetType?: QrTargetType;
    physicalLocation?: PhysicalLocationRecord;
  } | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  // 1. Migration an toàn: Tự động bổ sung ID duy nhất & ổn định cho Khu/Dãy/Ô nếu dữ liệu cũ chưa có
  useEffect(() => {
    const migration = migrateFarmEntities(areas, rows, cages);
    if (migration.hasChanges) {
      setAreas(migration.migratedAreas);
      setRows(migration.migratedRows);
      setCages(migration.migratedCages);
      try {
        localStorage.setItem('farm_areas_real_v3', JSON.stringify(migration.migratedAreas));
        localStorage.setItem('farm_rows_real_v3', JSON.stringify(migration.migratedRows));
        localStorage.setItem('farm_cages_real_v3', JSON.stringify(migration.migratedCages));
      } catch (e) {}
    }
  }, []);

  // 2. Xử lý quét mã QR từ URL (hỗ trợ camera điện thoại quét mở trực tiếp qua URL thật)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.location.search) return;

    const query = window.location.search;
    const lookup = resolveQrTargetFromUrl(query, { areas, rows, cages });

    if (lookup.status === 'location_empty') {
      // YÊU CẦU: Khi quét QR của vị trí đã bị xóa dữ liệu nhưng chưa tạo lại, báo:
      // “Vị trí này chưa có dữ liệu trên hệ thống”, KHÔNG báo QR không hợp lệ.
      setEmptyLocationAlert({
        isOpen: true,
        message: lookup.message || 'Vị trí này chưa có dữ liệu trên hệ thống',
        targetType: lookup.targetType,
        physicalLocation: lookup.physicalLocation
      });
    } else if (lookup.status === 'success') {
      if (lookup.targetType === 'cage' && lookup.cage) {
        setCurrentTab('areas');
        setSelectedAreaId(lookup.cage.areaId);
        setSelectedCageForProfile(lookup.cage);
        showToast(`Đã quét mở thành công Hồ sơ Ô chuồng ${lookup.cage.code}!`);
      } else if (lookup.targetType === 'row' && lookup.row) {
        setCurrentTab('areas');
        setSelectedAreaId(lookup.row.areaId);
        showToast(`Đã quét mở thành công Dãy ${lookup.row.name}!`);
      } else if (lookup.targetType === 'area' && lookup.area) {
        setCurrentTab('areas');
        setSelectedAreaId(lookup.area.id);
        showToast(`Đã quét mở thành công Phân khu ${lookup.area.name}!`);
      }
    }
  }, [areas.length, rows.length, cages.length]);

  // Guard refs ngăn thiết bị mới ghi đè khi vừa mount
  const isCagesMounted = useRef(false);
  const isAreasMounted = useRef(false);
  const isRowsMounted = useRef(false);
  const isDisinfectionMounted = useRef(false);
  const isTasksMounted = useRef(false);

  // Lưu localStorage và đồng bộ Online Firestore mỗi khi dữ liệu thay đổi
  useEffect(() => {
    if (!isCagesMounted.current) {
      isCagesMounted.current = true;
      return;
    }
    localStorage.setItem('farm_cages_real_v3', JSON.stringify(cages));
    if (isOnlineSyncReady()) {
      syncOnlinePayload({ farmCages: cages });
    }
  }, [cages]);

  useEffect(() => {
    if (!isAreasMounted.current) {
      isAreasMounted.current = true;
      return;
    }
    localStorage.setItem('farm_areas_real_v3', JSON.stringify(areas));
    if (isOnlineSyncReady()) {
      syncOnlinePayload({ farmAreas: areas });
    }
  }, [areas]);

  useEffect(() => {
    if (!isRowsMounted.current) {
      isRowsMounted.current = true;
      return;
    }
    localStorage.setItem('farm_rows_real_v3', JSON.stringify(rows));
    if (isOnlineSyncReady()) {
      syncOnlinePayload({ farmRows: rows });
    }
  }, [rows]);

  useEffect(() => {
    if (!isDisinfectionMounted.current) {
      isDisinfectionMounted.current = true;
      return;
    }
    localStorage.setItem('farm_disinfection_real_v3', JSON.stringify(disinfectionLogs));
    if (isOnlineSyncReady()) {
      syncOnlinePayload({ farmDisinfection: disinfectionLogs });
    }
  }, [disinfectionLogs]);

  useEffect(() => {
    if (!isTasksMounted.current) {
      isTasksMounted.current = true;
      return;
    }
    localStorage.setItem('farm_custom_tasks_v3', JSON.stringify(customTasks));
    if (isOnlineSyncReady()) {
      syncOnlinePayload({ farmTasks: customTasks });
    }
  }, [customTasks]);

  // Lắng nghe sự kiện đồng bộ từ Firestore Online để cập nhật thời gian thực trên đa thiết bị
  useEffect(() => {
    const handleSync = () => {
      try {
        const sCages = localStorage.getItem('farm_cages_real_v3');
        if (sCages) {
          const parsed = JSON.parse(sCages);
          if (Array.isArray(parsed)) {
            setCages(prev => JSON.stringify(prev) !== JSON.stringify(parsed) ? parsed : prev);
          }
        }
        const sAreas = localStorage.getItem('farm_areas_real_v3');
        if (sAreas) {
          const parsed = JSON.parse(sAreas);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setAreas(prev => JSON.stringify(prev) !== JSON.stringify(parsed) ? parsed : prev);
          }
        }
        const sRows = localStorage.getItem('farm_rows_real_v3');
        if (sRows) {
          const parsed = JSON.parse(sRows);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setRows(prev => JSON.stringify(prev) !== JSON.stringify(parsed) ? parsed : prev);
          }
        }
        const sDisinfection = localStorage.getItem('farm_disinfection_real_v3');
        if (sDisinfection) {
          const parsed = JSON.parse(sDisinfection);
          if (Array.isArray(parsed)) {
            setDisinfectionLogs(prev => JSON.stringify(prev) !== JSON.stringify(parsed) ? parsed : prev);
          }
        }
        const sTasks = localStorage.getItem('farm_custom_tasks_v3');
        if (sTasks) {
          const parsed = JSON.parse(sTasks);
          if (Array.isArray(parsed)) {
            setCustomTasks(prev => JSON.stringify(prev) !== JSON.stringify(parsed) ? parsed : prev);
          }
        }
      } catch (e) {}
    };

    window.addEventListener('storage', handleSync);
    window.addEventListener('nn_data_sync', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('nn_data_sync', handleSync);
    };
  }, []);

  // Áp dụng quy tắc tự động chuyển trạng thái:
  // "Ô Đực sau tách cái đủ 10 ngày -> tự động chuyển sang Sẵn sàng ghép"
  useEffect(() => {
    const { updatedCages, countChanged } = applyAutoStatusTransitions(cages, todayStr);
    if (countChanged > 0) {
      setCages(updatedCages);
    }
  }, [cages, todayStr]);

  // Tạo danh sách Công việc & Cảnh báo tự động theo đặc tả + việc tùy chỉnh
  const autoTasks = generateAutoTasks(cages, disinfectionLogs, todayStr);
  const allTasks = [...autoTasks, ...customTasks.filter(t => !t.isCompleted)];

  // Xử lý tạo và xóa công việc tùy chỉnh
  const handleCreateCustomTask = (task: FarmTask) => {
    setCustomTasks(prev => [task, ...prev]);
    showToast(`Đã thêm công việc "${task.title}" vào lịch!`);
  };

  const handleDeleteCustomTask = (taskId: string) => {
    setCustomTasks(prev => prev.filter(t => t.id !== taskId));
    showToast('Đã xóa công việc khỏi lịch.');
  };

  // Xử lý Cập nhật Ô (hỗ trợ cập nhật 2 ô đồng thời khi ghép/tách/chuyển đàn + tự động đồng bộ khi tách con)
  const handleUpdateCage = (updatedCage: FarmCage, secondCageUpdate?: FarmCage) => {
    setCages(prev => {
      let next = prev.map(c => c.id === updatedCage.id ? updatedCage : c);
      if (secondCageUpdate) {
        next = next.map(c => c.id === secondCageUpdate.id ? secondCageUpdate : c);
      } else if (updatedCage.status === 'moi_tach_con' && (updatedCage.weanedBabyCount || 0) > 0) {
        // Tự động tìm ô baby và đồng bộ đàn con vào Khu Baby nếu chưa có secondCageUpdate
        const targetCode = (updatedCage.targetBabyCageCode || '').trim().toUpperCase();
        let babyCage = next.find(c => targetCode && c.code.toUpperCase() === targetCode);
        if (!babyCage) {
          babyCage = next.find(c => c.areaKind === 'baby' && c.status === 'trong') ||
                     next.find(c => c.areaKind === 'baby');
        }

        if (babyCage && babyCage.id !== updatedCage.id) {
          const todayStr = updatedCage.weaningDate || new Date().toISOString().split('T')[0];
          const weanedCount = updatedCage.weanedBabyCount || 4;
          const weanedWeight = updatedCage.weanedBabyWeightAvg || 0.35;
          const weanedGroup = updatedCage.weanedBabyGroup || '3_4_lang';
          const currentBabyCount = babyCage.status === 'trong' ? 0 : (babyCage.ratCount || 0);

          const syncedBabyCage: FarmCage = {
            ...babyCage,
            status: 'dang_nuoi_baby',
            statusLabel: 'Đang nuôi Baby',
            gender: 'dan',
            babyGroup: weanedGroup,
            entryDate: todayStr,
            ratCount: currentBabyCount + weanedCount,
            currentWeightKg: weanedWeight,
            species: updatedCage.species || 'moc_dai',
            history: [
              {
                id: `his-${Date.now()}-auto-sync`,
                timestamp: `${todayStr} ${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`,
                eventType: 'chuyen_baby',
                summary: `Tự động tiếp nhận ${weanedCount} con non tách từ mẹ Ô ${updatedCage.code} (Trọng lượng TB: ${weanedWeight}kg, nhóm ${weanedGroup}).`,
                relatedCageCode: updatedCage.code,
                actor: 'Phan Dũng'
              },
              ...babyCage.history
            ]
          };

          next = next.map(c => c.id === syncedBabyCage.id ? syncedBabyCage : c);
        }
      }
      return next;
    });

    // Cập nhật modal đang mở nếu đang xem ô này
    if (selectedCageForProfile && selectedCageForProfile.id === updatedCage.id) {
      setSelectedCageForProfile(updatedCage);
    }
  };

  // Thêm Ô mới
  const [addCageOptions, setAddCageOptions] = useState<{ 
    areaId?: string; 
    rowId?: string; 
    tier?: number;
    initialCageCode?: string;
  } | undefined>(undefined);

  const handleOpenAddCageWithOptions = (options?: { 
    areaId?: string; 
    rowId?: string; 
    tier?: number;
    initialCageCode?: string;
  }) => {
    setAddCageOptions(options);
    setShowAddCageModal(true);
  };

  const handleAddCage = (newCage: FarmCage) => {
    const parentArea = areas.find(a => a.id === newCage.areaId);
    const parentRow = rows.find(r => r.id === newCage.rowId);

    // Đăng ký hoặc phục hồi định danh vật lý trong Registry
    const reg = registerOrRecoverPhysicalLocation('cage', {
      code: newCage.code,
      name: `Ô ${newCage.code}`,
      areaId: newCage.areaId,
      areaCode: newCage.areaCode || parentArea?.code,
      areaName: parentArea?.name,
      rowId: newCage.rowId,
      rowCode: newCage.rowCode || parentRow?.code,
      rowName: parentRow?.name,
      tier: newCage.tier,
      slotNumber: newCage.slotNumber,
      dataId: newCage.id
    });

    const finalCage: FarmCage = {
      ...newCage,
      physicalId: reg.physicalId
    };

    setCages(prev => [...prev, finalCage]);
    // Cập nhật số lượng ô của khu tương ứng
    setAreas(prev => prev.map(a => {
      if (a.id === finalCage.areaId) {
        return {
          ...a,
          totalCages: a.totalCages + 1
        };
      }
      return a;
    }));

    if (reg.isRecovered) {
      showToast(`✓ Đã phục hồi mã QR vật lý cũ cho ô ${finalCage.code}! Tem QR đã in ngoài chuồng hoạt động bình thường.`);
    } else {
      showToast(`Đã thêm thành công ô ${finalCage.code} (${finalCage.slotNumber || 'Vị trí mới'})!`);
    }
  };

  const handleDeleteCage = (cageId: string) => {
    const targetCage = cages.find(c => c.id === cageId);
    if (targetCage) {
      // Đánh dấu vị trí vật lý đã xóa dữ liệu, KHÔNG XÓA mapping physicalId trong registry!
      markPhysicalLocationDeleted('cage', {
        physicalId: targetCage.physicalId,
        code: targetCage.code,
        dataId: targetCage.id
      });
    }

    setCages(prev => prev.filter(c => c.id !== cageId));
    if (targetCage) {
      setAreas(prev => prev.map(a => {
        if (a.id === targetCage.areaId) {
          return {
            ...a,
            totalCages: Math.max(0, a.totalCages - 1)
          };
        }
        return a;
      }));
    }
    showToast(`Đã xóa ô ${targetCage?.code || ''}. Tem QR dán chuồng được giữ nguyên trong Registry vị trí vật lý.`);
  };

  // Thêm / Sửa / Xóa Khu
  const handleAddArea = (newArea: FarmArea) => {
    const reg = registerOrRecoverPhysicalLocation('area', {
      code: newArea.code,
      name: newArea.name,
      dataId: newArea.id
    });
    const finalArea: FarmArea = {
      ...newArea,
      physicalId: reg.physicalId
    };
    setAreas(prev => [...prev, finalArea]);
    if (reg.isRecovered) {
      showToast(`✓ Đã phục hồi mã QR vật lý cũ cho Phân khu ${finalArea.name}!`);
    }
  };

  const handleEditArea = (updatedArea: FarmArea) => {
    setAreas(prev => prev.map(a => a.id === updatedArea.id ? updatedArea : a));
  };

  const handleDeleteArea = (areaId: string) => {
    const targetArea = areas.find(a => a.id === areaId);
    if (targetArea) {
      markPhysicalLocationDeleted('area', {
        physicalId: targetArea.physicalId,
        code: targetArea.code,
        dataId: targetArea.id
      });
      const rowsInArea = rows.filter(r => r.areaId === areaId);
      rowsInArea.forEach(r => {
        markPhysicalLocationDeleted('row', { physicalId: r.physicalId, code: r.code, dataId: r.id });
      });
      const cagesInArea = cages.filter(c => c.areaId === areaId);
      cagesInArea.forEach(c => {
        markPhysicalLocationDeleted('cage', { physicalId: c.physicalId, code: c.code, dataId: c.id });
      });
    }

    setAreas(prev => prev.filter(a => a.id !== areaId));
    setRows(prev => prev.filter(r => r.areaId !== areaId));
    setCages(prev => prev.filter(c => c.areaId !== areaId));
    if (selectedAreaId === areaId) {
      setSelectedAreaId(undefined);
    }
    showToast(`Đã xóa phân khu ${targetArea?.name || ''}. Tem QR vật lý được bảo lưu.`);
  };

  // Thêm trọn gói cấu trúc Khu Sinh Sản Mới
  const handleAddFullBreedingStructure = (newArea: FarmArea, newRows: FarmRow[], newCages: FarmCage[]) => {
    const areaReg = registerOrRecoverPhysicalLocation('area', {
      code: newArea.code,
      name: newArea.name,
      dataId: newArea.id
    });
    const areaWithPhys = { ...newArea, physicalId: areaReg.physicalId };

    const rowsWithPhys = newRows.map(r => {
      const rReg = registerOrRecoverPhysicalLocation('row', {
        code: r.code,
        name: r.name,
        areaId: newArea.id,
        areaCode: newArea.code,
        dataId: r.id
      });
      return { ...r, physicalId: rReg.physicalId };
    });

    const cagesWithPhys = newCages.map(c => {
      const cReg = registerOrRecoverPhysicalLocation('cage', {
        code: c.code,
        name: `Ô ${c.code}`,
        areaId: c.areaId,
        areaCode: c.areaCode,
        rowId: c.rowId,
        rowCode: c.rowCode,
        tier: c.tier,
        slotNumber: c.slotNumber,
        dataId: c.id
      });
      return { ...c, physicalId: cReg.physicalId };
    });

    setAreas(prev => [...prev, areaWithPhys]);
    setRows(prev => [...prev, ...rowsWithPhys]);
    setCages(prev => [...cagesWithPhys, ...prev]);
    setSelectedAreaId(newArea.id);
  };

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => prev === msg ? null : prev);
    }, 3500);
  };

  // Thêm / Sửa / Xóa Dãy
  const handleAddRow = (
    areaId: string, 
    rowName: string, 
    rowCode: string, 
    kind: 'cai' | 'duc' | 'chung' = 'cai', 
    tierCount: number = 2
  ) => {
    const parentArea = areas.find(a => a.id === areaId);
    const reg = registerOrRecoverPhysicalLocation('row', {
      code: rowCode,
      name: rowName,
      areaId,
      areaCode: parentArea?.code,
      areaName: parentArea?.name
    });

    const newRow: FarmRow = {
      id: `row-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      physicalId: reg.physicalId,
      areaId,
      code: rowCode,
      name: rowName,
      kind,
      genderBadge: kind === 'cai' ? '♀ Dãy Cái' : kind === 'duc' ? '♂ Dãy Đực' : undefined,
      tierCount,
      cageCount: 0
    };
    setRows(prev => [...prev, newRow]);

    setAreas(prev => prev.map(a => {
      if (a.id === areaId) {
        const nextRowCount = rows.filter(r => r.areaId === areaId).length + 1;
        return {
          ...a,
          rowCount: nextRowCount
        };
      }
      return a;
    }));

    if (reg.isRecovered) {
      showToast(`✓ Đã phục hồi mã QR vật lý cũ cho dãy "${rowName}" (${rowCode})!`);
    } else {
      showToast(`Đã thêm thành công dãy "${rowName}" (${rowCode})!`);
    }
  };

  const handleEditRow = (updatedRow: FarmRow) => {
    setRows(prev => prev.map(r => r.id === updatedRow.id ? updatedRow : r));
    showToast(`Đã cập nhật thông tin dãy "${updatedRow.name}"!`);
  };

  const handleDeleteRow = (rowId: string) => {
    const targetRow = rows.find(r => r.id === rowId);
    const rowName = targetRow ? targetRow.name : 'dãy chuồng';
    const areaId = targetRow ? targetRow.areaId : null;

    if (targetRow) {
      markPhysicalLocationDeleted('row', {
        physicalId: targetRow.physicalId,
        code: targetRow.code,
        dataId: targetRow.id
      });
      const cagesInRow = cages.filter(c => c.rowId === rowId);
      cagesInRow.forEach(c => {
        markPhysicalLocationDeleted('cage', {
          physicalId: c.physicalId,
          code: c.code,
          dataId: c.id
        });
      });
    }

    // Xóa Dãy khỏi danh sách rows
    setRows(prev => prev.filter(r => r.id !== rowId));

    // Xóa tất cả các Ô chuồng thuộc Dãy này
    setCages(prev => prev.filter(c => c.rowId !== rowId));

    // Cập nhật lại số lượng Dãy và Ô trong Phân khu tương ứng
    if (areaId) {
      setAreas(prev => prev.map(a => {
        if (a.id === areaId) {
          const remainingRows = rows.filter(r => r.areaId === a.id && r.id !== rowId);
          const remainingCages = cages.filter(c => c.areaId === a.id && c.rowId !== rowId);
          const occupied = remainingCages.filter(c => c.status !== 'trong').length;
          return {
            ...a,
            rowCount: remainingRows.length,
            totalCages: remainingCages.length,
            occupiedCages: occupied,
            occupancyRate: remainingCages.length > 0 ? Math.round((occupied / remainingCages.length) * 100) : 0
          };
        }
        return a;
      }));
    }

    // Nếu đang xem profile ô thuộc dãy vừa xóa thì đóng modal profile
    if (selectedCageForProfile && selectedCageForProfile.rowId === rowId) {
      setSelectedCageForProfile(null);
    }

    showToast(`Đã xóa ${rowName} và toàn bộ ô chuồng. Tem QR dán thực tế được bảo lưu trong Registry.`);
  };

  // Thêm bản ghi phun khử trùng & cập nhật tự động cảnh báo chu kỳ 07 ngày
  const handleAddDisinfectionLog = (newLog: DisinfectionLogItem) => {
    setDisinfectionLogs(prev => [newLog, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    showToast(`Đã lưu nhật ký phun tiêu độc (${formatDateVN(newLog.date)})! Chu kỳ 07 ngày tới đã được cập nhật tự động.`);
  };

  // Hoàn thành công việc (xác nhận xong -> cảnh báo biến mất, cập nhật trạng thái nghiệp vụ, lưu lịch sử)
  const handleCompleteTask = (taskId: string, note?: string) => {
    // 1. Kiểm tra nếu là việc tự tạo
    const customTaskIdx = customTasks.findIndex(t => t.id === taskId);
    if (customTaskIdx !== -1) {
      setCustomTasks(prev => prev.filter(t => t.id !== taskId));
      showToast('Đã hoàn thành công việc tự tạo!');
      return;
    }

    const targetTask = autoTasks.find(t => t.id === taskId);
    if (!targetTask) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const timestampStr = `${todayStr} ${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;

    if (targetTask.cageId) {
      const targetCage = cages.find(c => c.id === targetTask.cageId);
      if (targetCage) {
        let updatedCage: FarmCage = {
          ...targetCage,
          history: [
            {
              id: `his-${Date.now()}-comp`,
              timestamp: timestampStr,
              eventType: 'hoan_thanh_cong_viec',
              summary: `Đã hoàn thành: ${targetTask.title} (${note || 'Đạt tiêu chuẩn'})`,
              actor: 'Phan Dũng'
            },
            ...targetCage.history
          ]
        };

        // Nghiệp vụ 1: Vệ sinh chuồng -> Cập nhật lastCleanDate hôm nay
        if (targetTask.sourceType === 'cage_sanitation') {
          updatedCage.lastCleanDate = todayStr;
        }

        // Nghiệp vụ 2: Kiểm tra sau tách con 10 ngày -> Chuyển sang Sẵn sàng ghép
        else if (targetTask.sourceType === 'post_weaning_health_check') {
          updatedCage.postWeaningHealthChecked = true;
          updatedCage.status = 'san_sang_ghep';
          updatedCage.statusLabel = 'Sẵn sàng ghép';
        }

        // Nghiệp vụ 3: Đực sau nghỉ dưỡng 10 ngày -> Chuyển sang Sẵn sàng ghép
        else if (targetTask.sourceType === 'male_rest_check') {
          updatedCage.status = 'san_sang_ghep';
          updatedCage.statusLabel = 'Sẵn sàng ghép';
        }

        // Nghiệp vụ 4: Tách con sau 45 ngày nuôi con -> Chuyển Ô Mẹ sang Mới tách con (Đang dưỡng)
        else if (targetTask.sourceType === 'nursing_weaning') {
          const weanedCount = targetCage.livingBabyCount || targetCage.totalBornCount || 4;
          updatedCage.status = 'moi_tach_con';
          updatedCage.statusLabel = 'Mới tách con / Đang dưỡng';
          updatedCage.weaningDate = todayStr;
          updatedCage.weanedBabyCount = weanedCount;
          updatedCage.weanedBabyWeightAvg = 0.35;
          updatedCage.weanedBabyGroup = '3_4_lang';
          updatedCage.postWeaningHealthChecked = false;
          updatedCage.livingBabyCount = 0;
          updatedCage.ratCount = 1; // Chỉ còn mẹ
        }

        // Nghiệp vụ 5: Tách ghép đôi sau 20 ngày
        else if (targetTask.sourceType === 'mating_separation') {
          updatedCage.status = 'moi_tach_duc';
          updatedCage.statusLabel = 'Mới tách đực / Chờ kết quả';
          updatedCage.matingSeparationDate = todayStr;
          updatedCage.expectedEvaluationDate = addDays(todayStr, 35);
          updatedCage.ratCount = 1; // Ô cái còn 1
        }

        handleUpdateCage(updatedCage);
        showToast(`Đã hoàn thành và cập nhật Ô ${updatedCage.code}!`);
      }
    } else if (targetTask.sourceType === 'disinfection') {
      // Phun khử trùng -> thêm vào log
      const newDisLog: DisinfectionLogItem = {
        id: `dis-${Date.now()}`,
        date: todayStr,
        areaName: 'Toàn bộ trang trại',
        chemical: 'Cloramin B 0.5%',
        dosage: '100g / 20L nước',
        executor: 'Phan Dũng',
        notes: note || 'Phun khử trùng hoàn thành định kỳ an toàn sinh học'
      };
      handleAddDisinfectionLog(newDisLog);
      showToast('Đã ghi nhận nhật ký phun khử trùng trang trại!');
    }
  };

  // Nút ghi nhận nhanh vệ sinh toàn trại hôm nay
  const handleQuickCleanAllToday = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const timestampStr = `${todayStr} ${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;

    setCages(prev => prev.map(c => ({
      ...c,
      lastCleanDate: todayStr,
      history: [
        {
          id: `his-${Date.now()}-${c.id}`,
          timestamp: timestampStr,
          eventType: 'hoan_thanh_cong_viec',
          summary: 'Ghi nhận dọn dẹp vệ sinh chuồng trại định kỳ',
          actor: 'Phan Dũng'
        },
        ...c.history
      ]
    })));

    alert('Đã cập nhật vệ sinh toàn bộ ô chuồng hôm nay! Chu kỳ 7 ngày được làm mới.');
  };

  // Đặt lại dữ liệu thực tế (Toàn bộ chuồng trống sạch, sẵn sàng nhập dữ liệu thật)
  const handleResetToRealData = () => {
    if (window.confirm('Bạn có chắc chắn muốn đặt lại trang trại về TRẠNG THÁI THỰC TẾ (0 cá thể ảo, toàn bộ các ô chuồng trống để bắt đầu nhập đàn thật)?')) {
      localStorage.removeItem('farm_cages_real_v3');
      localStorage.removeItem('farm_areas_real_v3');
      localStorage.removeItem('farm_rows_real_v3');
      localStorage.removeItem('farm_disinfection_real_v3');
      setCages(INITIAL_CAGES);
      setAreas(INITIAL_AREAS);
      setRows(INITIAL_ROWS);
      setDisinfectionLogs(INITIAL_DISINFECTION_LOGS);
      showToast('✓ Đã chuyển về dữ liệu thực tế sạch (0 cá thể ảo)!');
    }
  };

  // Nạp dữ liệu mẫu Demo (nếu muốn xem thử các tính năng)
  const handleLoadDemoData = () => {
    if (window.confirm('Nạp dữ liệu mẫu thử nghiệm (có sẵn các cặp phối, đàn con non, điều trị để trải nghiệm tính năng)?')) {
      setCages(SAMPLE_DEMO_CAGES);
      showToast('✓ Đã nạp dữ liệu mẫu demo!');
    }
  };

  // Tìm kiếm nhanh mã ô từ topbar
  const [topSearchTerm, setTopSearchTerm] = useState('');
  const handleTopSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topSearchTerm.trim()) return;
    const term = topSearchTerm.trim().toLowerCase();
    const foundCage = cages.find(c => c.code.toLowerCase().includes(term));
    if (foundCage) {
      setSelectedCageForProfile(foundCage);
      setTopSearchTerm('');
    } else {
      // Chuyển sang trang sơ đồ chuồng trại và lọc
      setCurrentTab('areas');
    }
  };

  // Tính toán dữ liệu đồng bộ thời gian thực cho toàn bộ thanh điều hướng
  const overdueTasksCount = allTasks.filter(t => t.urgency === 'qua_han').length;
  const dueTodayTasksCount = allTasks.filter(t => t.urgency === 'den_han').length;

  // Số lượng ca thực tế đang bệnh / cách ly (chỉ tính ô có dúi và đang điều trị)
  const activeTreatmentCount = cages.filter(
    c => (c.status === 'dang_dieu_tri' || (c.areaKind === 'dieu_tri' && c.status !== 'trong')) && (c.ratCount || 0) > 0
  ).length;

  // Tổng số lượng cá thể dúi thực tế và số ô có dúi
  const occupiedCagesCount = cages.filter(c => c.status !== 'trong' && (c.ratCount || 0) > 0).length;
  const totalRealRats = cages.reduce((sum, c) => sum + (c.status !== 'trong' ? (c.ratCount || 1) : 0), 0);

  // Trạng thái tiêu độc khử trùng
  const latestDisinfection = disinfectionLogs[0];
  const isDisinfectionDue = latestDisinfection 
    ? (daysBetween(addDays(latestDisinfection.date, 7), todayStr) <= 0)
    : (totalRealRats > 0);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col lg:flex-row">
      {/* SIDEBAR BÊN TRÁI (DARK FOREST THEME GIỐNG HÌNH THAM CHIẾU 100%) */}
      <aside className="w-full lg:w-72 bg-[#072419] text-white flex flex-col justify-between shrink-0 p-5 border-r border-[#0f3829] min-h-screen">
        <div className="space-y-6">
          {/* 1. Header Trang Trại Logo */}
          <div className="flex items-center gap-3 pb-3 border-b border-[#144231]">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-emerald-400 p-0.5 shrink-0 bg-white/10">
              <img
                src={FARM_PHOTOS.youngSelect}
                alt="Trang trại Dúi Mốc Đại"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div>
              <h1 className="font-bold text-white text-sm leading-tight">
                Trang trại Dúi Mốc Đại
              </h1>
              <h2 className="font-bold text-white text-sm leading-tight">
                Phan Dũng Kaka
              </h2>
              <p className="text-emerald-400 text-xs font-semibold mt-0.5">
                Hệ thống chuồng trại
              </p>
            </div>
          </div>

          {/* 2. Nhóm Navigation 1: HỆ THỐNG CHUỒNG TRẠI */}
          <div className="space-y-1.5">
            <span className="text-emerald-400 text-[11px] font-bold tracking-wider uppercase block px-3 mb-2">
              HỆ THỐNG CHUỒNG TRẠI
            </span>

            <button
              onClick={() => setCurrentTab('home')}
              className={`w-full px-4 py-3 rounded-2xl font-bold text-xs flex items-center justify-between transition-all ${
                currentTab === 'home'
                  ? 'bg-[#15803d] text-white shadow-sm'
                  : 'text-emerald-100 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-base">🏠</span>
                <span>Tổng quan trang trại</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#143d2c] text-emerald-300 font-mono">
                {totalRealRats} con
              </span>
            </button>

            <button
              onClick={() => {
                setCurrentTab('areas');
                setSelectedAreaId(undefined);
              }}
              className={`w-full px-4 py-3 rounded-2xl font-semibold text-xs flex items-center justify-between transition-all ${
                currentTab === 'areas'
                  ? 'bg-[#15803d] text-white shadow-sm font-bold'
                  : 'text-emerald-100 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-base">🏡</span>
                <span>Khu vực chuồng nuôi</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#143d2c] text-emerald-300">
                {areas.length} khu
              </span>
            </button>

            {/* Mục Đặt Mua Con Giống & Dúi Thịt Thương Phẩm */}
            <button
              onClick={() => setCurrentTab('marketplace')}
              className={`w-full px-4 py-3 rounded-2xl font-semibold text-xs flex items-center justify-between transition-all ${
                currentTab === 'marketplace'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                  : 'text-amber-200 hover:text-white hover:bg-amber-500/10'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-base">🛒</span>
                <span>Đặt Mua Giống & Thịt</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                currentTab === 'marketplace' ? 'bg-slate-950 text-amber-300' : 'bg-amber-500/20 text-amber-300'
              }`}>
                {duiOrders.length > 0 ? `${duiOrders.length} đơn` : 'Đang mở'}
              </span>
            </button>
          </div>

          {/* 3. Nhóm Navigation 2: NGHIỆP VỤ & QUẢN TRỊ (ĐỒNG BỘ THỜI GIAN THỰC) */}
          <div className="space-y-1.5 pt-2">
            <span className="text-emerald-400 text-[11px] font-bold tracking-wider uppercase block px-3 mb-2">
              NGHIỆP VỤ & QUẢN TRỊ
            </span>

            {/* Lịch công việc & Cảnh báo */}
            <button
              onClick={() => setCurrentTab('tasks')}
              className={`w-full px-4 py-3 rounded-2xl font-semibold text-xs flex items-center justify-between transition-all ${
                currentTab === 'tasks'
                  ? 'bg-[#15803d] text-white shadow-sm font-bold'
                  : 'text-emerald-100 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3 text-left">
                <span className="text-base">📋</span>
                <span>Lịch công việc & Cảnh báo</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono flex items-center justify-center shrink-0 ${
                overdueTasksCount > 0
                  ? 'bg-[#ef4444] text-white animate-pulse'
                  : dueTodayTasksCount > 0
                    ? 'bg-[#f59e0b] text-white'
                    : allTasks.length > 0
                      ? 'bg-[#1d4634] text-emerald-200'
                      : 'bg-[#143d2c] text-emerald-400/80'
              }`}>
                {allTasks.length}
              </span>
            </button>

            {/* Khu điều trị & Cách ly */}
            <button
              onClick={() => setCurrentTab('treatment')}
              className={`w-full px-4 py-3 rounded-2xl font-semibold text-xs flex items-center justify-between transition-all ${
                currentTab === 'treatment'
                  ? 'bg-[#15803d] text-white shadow-sm font-bold'
                  : 'text-emerald-100 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-base">🏥</span>
                <span>Khu điều trị & Cách ly</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono flex items-center justify-center shrink-0 ${
                activeTreatmentCount > 0
                  ? 'bg-[#ef4444] text-white animate-pulse'
                  : 'bg-[#143d2c] text-emerald-400/80'
              }`}>
                {activeTreatmentCount} ca
              </span>
            </button>

            {/* Báo cáo & Tổng đàn */}
            <button
              onClick={() => setCurrentTab('reports')}
              className={`w-full px-4 py-3 rounded-2xl font-semibold text-xs flex items-center justify-between transition-all ${
                currentTab === 'reports'
                  ? 'bg-[#15803d] text-white shadow-sm font-bold'
                  : 'text-emerald-100 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-base">📊</span>
                <span>Báo cáo & Tổng đàn</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#143d2c] text-emerald-300 font-mono">
                {totalRealRats} con
              </span>
            </button>

            {/* Vệ sinh & Sát trùng */}
            <button
              onClick={() => {
                if (userRole === 'admin') {
                  setShowSanitationModal(true);
                } else {
                  onOpenAdminLogin?.('Ghi nhận lịch phun khử trùng yêu cầu quyền Quản Trị');
                }
              }}
              className="w-full px-4 py-3 rounded-2xl font-semibold text-xs flex items-center justify-between text-emerald-100 hover:text-white hover:bg-white/5 transition-all text-left"
            >
              <div className="flex items-center gap-3">
                <span className="text-base">🧹</span>
                <span>Vệ sinh & Sát trùng</span>
              </div>
              {isDisinfectionDue ? (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Cần phun
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#143d2c] text-emerald-300">
                  {disinfectionLogs.length > 0 ? `${disinfectionLogs.length} lần` : 'Định kỳ'}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* 4. Bottom Box: Phân Quyền & Quản Lý Dữ Liệu */}
        <div className="mt-8 pt-4">
          <div className="bg-[#0b3323] border border-[#164e38] rounded-3xl p-3 space-y-2.5 text-center shadow-sm">
            <div className="flex items-center justify-between bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-800/40">
              <span className="text-[11px] font-bold text-emerald-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>{userRole === 'admin' ? 'Quyền Quản Trị' : 'Khách Tham Quan'}</span>
              </span>
              <span className="text-[10px] font-semibold text-emerald-100/80 font-mono">
                {occupiedCagesCount} / {cages.length} ô ({totalRealRats} con)
              </span>
            </div>

            {userRole === 'admin' ? (
              <div className="space-y-1.5">
                <button
                  onClick={handleResetToRealData}
                  title="Xóa sạch dữ liệu ảo, giữ khung chuồng để nhập đàn thực tế"
                  className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-emerald-600/30 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Đặt về dữ liệu thực (0 con)</span>
                </button>

                <button
                  onClick={handleLoadDemoData}
                  title="Nạp dữ liệu mẫu thử nghiệm để xem mô phỏng"
                  className="w-full py-1.5 px-3 rounded-xl hover:bg-white/5 text-emerald-200/80 hover:text-white text-[11px] font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <span>📊 Nạp mẫu demo tham khảo</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2 text-left p-2 rounded-xl bg-emerald-950/40 border border-emerald-800/30">
                <p className="text-[11px] text-emerald-200/90 leading-relaxed">
                  👀 Bạn đang xem trại ở chế độ <b>Khách xem</b>. Bạn có thể tra cứu thông tin ô, đặt mua con giống & dúi thịt thương phẩm.
                </p>
                <button
                  onClick={() => onOpenAdminLogin?.('Đăng nhập Quản Trị Viên Trang Trại Dúi KaKa')}
                  className="w-full py-1.5 px-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Đăng Nhập Quản Trị</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* VÙNG NỘI DUNG CHÍNH (TOPBAR + MAIN CONTENT) */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOPBAR HEADER (KHỚP CHÍNH XÁC HÌNH THAM CHIẾU) */}
        <header className="bg-white border-b border-slate-200 px-6 py-3 sticky top-0 z-20 shadow-2xs">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Nhóm tìm kiếm & Thao tác nhanh */}
            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              {/* Ô tìm kiếm nhanh */}
              <form onSubmit={handleTopSearchSubmit} className="relative flex-1 sm:w-64">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</span>
                <input
                  type="text"
                  placeholder="Tìm nhanh mã ô (VD: A1-"
                  value={topSearchTerm}
                  onChange={(e) => setTopSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-full border border-slate-200 bg-[#f8fafc] text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-emerald-600 focus:bg-white transition-colors"
                />
              </form>

              {/* Nút Đặt Mua Giống & Thịt Nhanh */}
              <button
                onClick={() => setCurrentTab('marketplace')}
                className="px-3.5 py-2 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
              >
                <span>🛒</span>
                <span>Mua Giống & Dúi Thịt</span>
              </button>

              {/* Nút Quét QR */}
              <button
                onClick={() => setShowFarmQRModal(true)}
                className="px-4 py-2 rounded-full bg-[#dcfce7] hover:bg-[#bbf7d0] border border-[#86efac] text-[#166534] text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
              >
                <span>📷</span>
                <span>Quét QR (Trại • Khu • Ô)</span>
              </button>

              {/* Nút QR Trang Trại */}
              <button
                onClick={() => setShowFarmQRModal(true)}
                className="px-3.5 py-2 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
              >
                <span>🏠</span>
                <span>QR Trang Trại</span>
              </button>
            </div>

            {/* Nhóm Thông báo & Profile góc phải */}
            <div className="flex items-center gap-3.5">
              {/* Nút chuông thông báo */}
              <button
                onClick={() => setCurrentTab('tasks')}
                className="p-2 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 relative transition-colors cursor-pointer"
                title="Xem công việc & cảnh báo"
              >
                <span className="text-sm">🔔</span>
                {allTasks.length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-[#ef4444] text-white text-[9px] font-bold flex items-center justify-center absolute -top-1 -right-1">
                    {allTasks.length > 99 ? '99+' : allTasks.length}
                  </span>
                )}
              </button>

              {/* User Profile & Role Indicator */}
              <div className="flex items-center gap-2.5 pl-1 border-l border-slate-200">
                {userRole === 'admin' ? (
                  <>
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                      alt="Phan Dũng"
                      className="w-9 h-9 rounded-full object-cover border-2 border-emerald-500"
                    />
                    <div className="leading-tight">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-slate-900 block">Phan Dũng</span>
                        <Crown className="w-3 h-3 text-amber-500" />
                      </div>
                      <span className="text-[11px] text-emerald-700 font-semibold block">Chủ trại • Quản trị</span>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-600 font-bold text-xs">
                      👤
                    </div>
                    <div className="leading-tight">
                      <span className="text-xs font-bold text-slate-800 block">Khách xem</span>
                      <button
                        onClick={() => onOpenAdminLogin?.('Đăng nhập Quản Trị để chỉnh sửa dữ liệu trang trại')}
                        className="text-[10.5px] text-amber-700 hover:text-amber-900 font-semibold hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <Lock className="w-2.5 h-2.5" />
                        <span>Đăng nhập</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* MAIN BODY CONTENT */}
        <main className="p-6 flex-1">
          {currentTab === 'home' && (
            <FarmOverviewView
              areas={areas}
              rows={rows}
              cages={cages}
              tasks={allTasks}
              onNavigateToArea={(areaId) => {
                setSelectedAreaId(areaId);
                setCurrentTab('areas');
              }}
              onNavigateToTasks={() => setCurrentTab('tasks')}
              onSelectCage={(cage) => setSelectedCageForProfile(cage)}
              onOpenFarmQR={() => setShowFarmQRModal(true)}
              onOpenAreaQR={(area) => setSelectedQRTarget({ area })}
              onOpenAddCage={() => {
                if (userRole === 'admin') setShowAddCageModal(true);
                else onOpenAdminLogin?.('Thêm ô chuồng yêu cầu quyền Quản Trị');
              }}
              onOpenAddArea={() => {
                if (userRole === 'admin') setShowStructureModal(true);
                else onOpenAdminLogin?.('Quản lý cấu trúc khu nuôi yêu cầu quyền Quản Trị');
              }}
              onQuickCleanToday={handleQuickCleanAllToday}
              onOpenSanitationModal={() => {
                if (userRole === 'admin') setShowSanitationModal(true);
                else onOpenAdminLogin?.('Ghi nhận khử trùng yêu cầu quyền Quản Trị');
              }}
              userRole={userRole}
              onOpenAdminLogin={onOpenAdminLogin}
              onNavigateToMarketplace={() => setCurrentTab('marketplace')}
            />
          )}

          {currentTab === 'areas' && (
            <FarmAreasView
              areas={areas}
              rows={rows}
              cages={cages}
              selectedAreaId={selectedAreaId}
              onSelectArea={(areaId) => setSelectedAreaId(areaId)}
              onSelectCage={(cage) => setSelectedCageForProfile(cage)}
              onOpenAddCage={(opts) => {
                if (userRole === 'admin') handleOpenAddCageWithOptions(opts);
                else onOpenAdminLogin?.('Thêm ô chuồng mới yêu cầu quyền Quản Trị');
              }}
              onOpenAreaQR={(area) => setSelectedQRTarget({ type: 'area', area })}
              onOpenRowQR={(row, curArea) => setSelectedQRTarget({ type: 'row', row, area: curArea })}
              onOpenCageQR={(cage) => setSelectedQRTarget({ type: 'cage', cage })}
              onDeleteCage={handleDeleteCage}
              onEditCage={handleUpdateCage}
              onAddRow={handleAddRow}
              onEditRow={handleEditRow}
              onDeleteRow={handleDeleteRow}
              onEditArea={handleEditArea}
              onDeleteArea={handleDeleteArea}
              onOpenManageStructure={() => {
                if (userRole === 'admin') setShowStructureModal(true);
                else onOpenAdminLogin?.('Quản lý cấu trúc trại yêu cầu quyền Quản Trị');
              }}
              userRole={userRole}
              onOpenAdminLogin={onOpenAdminLogin}
            />
          )}

          {currentTab === 'marketplace' && (
            <DuiMarketplaceView
              userRole={userRole}
              duiOrders={duiOrders}
              onAddDuiOrder={onAddDuiOrder || (() => ({} as any))}
              onUpdateDuiOrderStatus={onUpdateDuiOrderStatus}
              onOpenAdminLogin={onOpenAdminLogin}
              farmLiveRatCount={totalRealRats}
              cages={cages}
            />
          )}

          {currentTab === 'tasks' && (
            <FarmTasksView
              tasks={allTasks}
              cages={cages}
              onSelectCage={(cage) => setSelectedCageForProfile(cage)}
              onCompleteTask={handleCompleteTask}
              onCreateTask={handleCreateCustomTask}
              onDeleteTask={handleDeleteCustomTask}
              userRole={userRole}
              onOpenAdminLogin={onOpenAdminLogin}
            />
          )}

          {currentTab === 'treatment' && (
            <FarmTreatmentView
              cages={cages}
              areas={areas}
              onSelectCage={(cage) => setSelectedCageForProfile(cage)}
              onOpenAddCage={() => handleOpenAddCageWithOptions()}
            />
          )}

          {currentTab === 'reports' && (
            <FarmReportsView
              cages={cages}
              areas={areas}
              disinfectionLogs={disinfectionLogs}
            />
          )}
        </main>
      </div>

      {/* MODAL 1: HỒ SƠ Ô CHUỒNG (Bấm Ô đã tồn tại mở Hồ Sơ Ô) */}
      {selectedCageForProfile && (
        <FarmCageProfileModal
          cage={selectedCageForProfile}
          allCages={cages}
          allAreas={areas}
          onClose={() => setSelectedCageForProfile(null)}
          onUpdateCage={handleUpdateCage}
          onDeleteCage={(cageId) => {
            handleDeleteCage(cageId);
            setSelectedCageForProfile(null);
          }}
          onOpenQR={(cage) => setSelectedQRTarget({ cage })}
          userRole={userRole}
          onOpenAdminLogin={onOpenAdminLogin}
        />
      )}

      {/* MODAL 2: FORM RIÊNG BIỆT THÊM Ô MỚI */}
      {showAddCageModal && (
        <AddCageModal
          areas={areas}
          rows={rows}
          existingCages={cages}
          initialAreaId={addCageOptions?.areaId || selectedAreaId}
          initialRowId={addCageOptions?.rowId}
          initialTier={addCageOptions?.tier}
          initialCageCode={addCageOptions?.initialCageCode}
          onClose={() => {
            setShowAddCageModal(false);
            setAddCageOptions(undefined);
          }}
          onAddCage={handleAddCage}
        />
      )}

      {/* MODAL 3: QUẢN LÝ CẤU TRÚC TRẠI (KHU & DÃY) */}
      {showStructureModal && (
        <ManageStructureModal
          areas={areas}
          rows={rows}
          cages={cages}
          onClose={() => setShowStructureModal(false)}
          onAddArea={handleAddArea}
          onEditArea={handleEditArea}
          onDeleteArea={handleDeleteArea}
          onAddRow={handleAddRow}
          onDeleteRow={handleDeleteRow}
          onAddFullBreedingStructure={handleAddFullBreedingStructure}
        />
      )}

      {/* MODAL 4: GHI NHẬN PHUN TIÊU ĐỘC KHỬ TRÙNG 07 NGÀY */}
      {showSanitationModal && (
        <FarmSanitationModal
          onClose={() => setShowSanitationModal(false)}
          onAddDisinfectionLog={handleAddDisinfectionLog}
        />
      )}

      {/* MODAL 5: QR TRANG TRẠI & TỔNG HỆ THỐNG */}
      {showFarmQRModal && (
        <UniversalQRModal 
          initialType="system"
          allAreas={areas}
          allRows={rows}
          onClose={() => setShowFarmQRModal(false)} 
        />
      )}

      {/* MODAL 6: QR Ô / KHU / DÃY / TỔNG (4 CẤP ĐỘ QR THỰC qrcode) */}
      {selectedQRTarget && (
        <UniversalQRModal
          initialType={selectedQRTarget.type || (selectedQRTarget.cage ? 'cage' : selectedQRTarget.row ? 'row' : selectedQRTarget.area ? 'area' : 'system')}
          cage={selectedQRTarget.cage}
          area={selectedQRTarget.area}
          row={selectedQRTarget.row}
          allAreas={areas}
          allRows={rows}
          onClose={() => setSelectedQRTarget(null)}
        />
      )}

      {/* THÔNG BÁO VỊ TRÍ VẬT LÝ KHI QUÉT QR (BÁO: "Vị trí này chưa có dữ liệu trên hệ thống", KHÔNG BÁO QR KHÔNG HỢP LỆ) */}
      {emptyLocationAlert && emptyLocationAlert.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-amber-200 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full inline-block mb-1">
                  ✓ Tem QR Vật Lý Hợp Lệ
                </span>
                <h3 className="text-base font-bold text-slate-900 leading-tight">
                  Nhận Diện Vị Trí Vật Lý Ngoài Chuồng Trại
                </h3>
              </div>
            </div>

            {/* Banner nổi bật theo yêu cầu: "Vị trí này chưa có dữ liệu trên hệ thống" */}
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <p className="text-sm font-black text-amber-900">
                  “{emptyLocationAlert.message}”
                </p>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed pl-6">
                Mã QR bạn vừa quét đại diện cho vị trí vật lý cố định đã dán ngoài thực tế. Bản ghi dữ liệu hoặc cá thể tại vị trí này hiện đang trống (chưa nhập hoặc đã bị xóa nhầm).
              </p>
            </div>

            {/* Chi tiết vị trí vật lý nhận diện */}
            {emptyLocationAlert.physicalLocation && (
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
                <div className="font-bold text-slate-700 flex items-center justify-between pb-1.5 border-b border-slate-200">
                  <span>Thông Tin Vị Trí Nhận Diện</span>
                  <span className="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {emptyLocationAlert.physicalLocation.type === 'cage' ? 'CẤP Ô' : emptyLocationAlert.physicalLocation.type === 'row' ? 'CẤP DÃY' : 'CẤP KHU'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Mã Vị Trí Vật Lý:</span>
                    <strong className="text-slate-900 font-mono text-sm">{emptyLocationAlert.physicalLocation.code}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Định danh QR (physicalId):</span>
                    <span className="font-mono text-slate-700 text-[11px] truncate block" title={emptyLocationAlert.physicalLocation.physicalId}>
                      {emptyLocationAlert.physicalLocation.physicalId}
                    </span>
                  </div>
                  {(emptyLocationAlert.physicalLocation.areaName || emptyLocationAlert.physicalLocation.areaCode) && (
                    <div>
                      <span className="text-slate-400 block text-[10px]">Phân khu:</span>
                      <span className="text-slate-800 font-medium">{emptyLocationAlert.physicalLocation.areaName || emptyLocationAlert.physicalLocation.areaCode}</span>
                    </div>
                  )}
                  {(emptyLocationAlert.physicalLocation.rowName || emptyLocationAlert.physicalLocation.rowCode) && (
                    <div>
                      <span className="text-slate-400 block text-[10px]">Dãy chuồng:</span>
                      <span className="text-slate-800 font-medium">{emptyLocationAlert.physicalLocation.rowName || emptyLocationAlert.physicalLocation.rowCode}</span>
                    </div>
                  )}
                  {emptyLocationAlert.physicalLocation.tier && (
                    <div>
                      <span className="text-slate-400 block text-[10px]">Tầng / Hàng:</span>
                      <span className="text-slate-800 font-medium">Tầng {emptyLocationAlert.physicalLocation.tier}</span>
                    </div>
                  )}
                  {emptyLocationAlert.physicalLocation.slotNumber && (
                    <div>
                      <span className="text-slate-400 block text-[10px]">Số vị trí:</span>
                      <span className="text-slate-800 font-medium">{emptyLocationAlert.physicalLocation.slotNumber}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-800 leading-relaxed">
              <strong>💡 Cơ chế phục hồi QR tự động:</strong> Bạn chỉ cần tạo lại dữ liệu đúng mã/vị trí này. Mã QR dán ngoài chuồng trại sẽ <strong>TỰ ĐỘNG PHỤC HỒI</strong> mà không cần in lại tem QR mới!
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              {emptyLocationAlert.physicalLocation?.type === 'cage' && (
                <button
                  type="button"
                  onClick={() => {
                    const phys = emptyLocationAlert.physicalLocation;
                    const matchedArea = areas.find(a => a.code === phys?.areaCode || a.id === phys?.areaId) || areas[0];
                    const matchedRow = rows.find(r => r.code === phys?.rowCode || r.id === phys?.rowId);

                    setEmptyLocationAlert(null);
                    window.history.replaceState({}, '', window.location.pathname + '?view=farm&tab=areas');
                    setCurrentTab('areas');
                    if (matchedArea) setSelectedAreaId(matchedArea.id);

                    handleOpenAddCageWithOptions({
                      areaId: matchedArea?.id,
                      rowId: matchedRow?.id,
                      tier: phys?.tier || 1,
                      initialCageCode: phys?.code
                    });
                  }}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Tạo Dữ Liệu Cho Ô Này (Phục Hồi QR)
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setEmptyLocationAlert(null);
                  window.history.replaceState({}, '', window.location.pathname + '?view=farm&tab=areas');
                  setCurrentTab('areas');
                }}
                className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer"
              >
                Về Sơ Đồ Khu
              </button>

              {onBackToPortal && (
                <button
                  type="button"
                  onClick={() => {
                    setEmptyLocationAlert(null);
                    window.history.replaceState({}, '', window.location.pathname);
                    onBackToPortal();
                  }}
                  className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
                >
                  Về Cổng Dịch Vụ
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION THÔNG BÁO THÀNH CÔNG */}
      {toastMessage && (
        <div 
          id="farm-toast-notification"
          className="fixed bottom-6 right-6 z-100 max-w-md bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-slate-100 flex-1 leading-snug">
            {toastMessage}
          </p>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};
