import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  TableBooking, 
  WeddingInquiry, 
  UserRole, 
  AppView, 
  TableBookingStatus, 
  WeddingStatus,
  MenuItem,
  ExternalFinanceRecord
} from '../types';
import { MANAGERS } from '../data/initialData';
import { computeOperationsData, OperationalTransaction, OperationalNotification, OperationalTask } from '../utils/operationsData';
import { ExternalFinanceView } from './ExternalFinanceView';
import { UniversalQRModal } from './farm/UniversalQRModal';
import { syncOnlinePayload } from '../services/onlineSyncService';
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  AlertCircle, 
  AlertTriangle,
  Info,
  CheckCircle2, 
  ChevronRight, 
  ChevronDown,
  ChevronLeft,
  Phone, 
  UserCheck, 
  Calendar,
  Users,
  Activity,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Wallet,
  Building,
  Building2,
  Boxes,
  Briefcase,
  User,
  BarChart3,
  Bell,
  Settings,
  FileText,
  HelpCircle,
  Search,
  CheckSquare,
  Square,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Eye,
  RefreshCw,
  X,
  Menu,
  Crown,
  Database,
  Layers,
  QrCode
} from 'lucide-react';

interface OperationsCenterProps {
  userRole: UserRole;
  onNavigate: (view: AppView) => void;
  bookings: TableBooking[];
  weddingInquiries: WeddingInquiry[];
  menuItems?: MenuItem[];
  onUpdateBookingStatus: (id: string, status: TableBookingStatus) => void;
  onUpdateWeddingStatus: (id: string, status: WeddingStatus, deposit?: number) => void;
}

export const OperationsCenter: React.FC<OperationsCenterProps> = ({
  userRole,
  onNavigate,
  bookings,
  weddingInquiries,
  menuItems = [],
  onUpdateBookingStatus,
  onUpdateWeddingStatus,
}) => {
  // Navigation & UI state: 'overview' | 'external_finance' | 'financial_report'
  const [activeNav, setActiveNav] = useState<string>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [timeRange, setTimeRange] = useState<'7days' | '30days' | 'quarter'>('7days');
  const [activeTxFilter, setActiveTxFilter] = useState<'all' | 'THU' | 'CHI'>('all');
  
  // Real-time ticking clock
  const [currentDateTime, setCurrentDateTime] = useState<string>(() => {
    const now = new Date();
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const dayName = days[now.getDay()];
    const dateStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
    const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    return `Hôm nay là ${dayName}, ${dateStr} - ${timeStr}`;
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
      const dayName = days[now.getDay()];
      const dateStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
      const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      setCurrentDateTime(`Hôm nay là ${dayName}, ${dateStr} - ${timeStr}`);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // -------------------------------------------------------------
  // EXTERNAL FINANCE PERSISTENCE & SYNC (Zero based by default)
  // -------------------------------------------------------------
  const [externalRecords, setExternalRecords] = useState<ExternalFinanceRecord[]>(() => {
    try {
      const saved = localStorage.getItem('nn_external_finance_transactions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  });

  // Syncing state and notifications
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>(() => {
    const now = new Date();
    return `${now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;
  });
  const [syncToast, setSyncToast] = useState<string | null>(null);

  // Trigger sync manually or automatically
  const handleSyncData = useCallback(() => {
    setIsSyncing(true);
    // Reload external records from localStorage in case updated elsewhere
    try {
      const saved = localStorage.getItem('nn_external_finance_transactions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setExternalRecords(parsed);
      }
    } catch (e) {}

    setTimeout(() => {
      setIsSyncing(false);
      const now = new Date();
      const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastSyncTime(timeStr);
      setSyncToast('Đã đồng bộ số liệu thực tế từ 4 phân hệ & Sổ Quỹ thành công!');
      setTimeout(() => setSyncToast(null), 3000);
    }, 400);
  }, []);

  // Auto-sync continuously in real time without requiring manual clicks
  useEffect(() => {
    const autoSyncInterval = setInterval(() => {
      try {
        const saved = localStorage.getItem('nn_external_finance_transactions');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setExternalRecords(prev => {
              if (JSON.stringify(prev) !== JSON.stringify(parsed)) {
                return parsed;
              }
              return prev;
            });
          }
        }
      } catch (e) {}
    }, 2000);
    return () => clearInterval(autoSyncInterval);
  }, []);

  // Listen to window storage and custom sync events for real-time synchronization across views
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const saved = localStorage.getItem('nn_external_finance_transactions');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setExternalRecords(prev => JSON.stringify(prev) !== JSON.stringify(parsed) ? parsed : prev);
          }
        }
      } catch (e) {}
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('nn_data_sync', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('nn_data_sync', handleStorageChange);
    };
  }, []);

  // Save external records
  const saveExternalRecords = (newRecords: ExternalFinanceRecord[]) => {
    setExternalRecords(newRecords);
    try {
      localStorage.setItem('nn_external_finance_transactions', JSON.stringify(newRecords));
    } catch (e) {}
    syncOnlinePayload({ externalRecords: newRecords });
    handleSyncData();
  };

  // Add new external record
  const handleAddExternalRecord = (record: Omit<ExternalFinanceRecord, 'id' | 'code' | 'createdAt'>) => {
    const newId = `ext-${Date.now()}`;
    const code = `GD-NG-${String(Date.now()).slice(-6)}`;
    const newRecord: ExternalFinanceRecord = {
      ...record,
      id: newId,
      code,
      createdAt: new Date().toISOString()
    };
    saveExternalRecords([newRecord, ...externalRecords]);
  };

  // Update existing external record
  const handleUpdateExternalRecord = (id: string, updated: Partial<ExternalFinanceRecord>) => {
    const next = externalRecords.map(r => r.id === id ? { ...r, ...updated } : r);
    saveExternalRecords(next);
  };

  // Delete external record
  const handleDeleteExternalRecord = (id: string) => {
    const next = externalRecords.filter(r => r.id !== id);
    saveExternalRecords(next);
  };

  // Today's Interactive Tasks
  const [tasks, setTasks] = useState<OperationalTask[]>([
    { id: 't-1', title: 'Kiểm tra sức khỏe đàn dúi & vệ sinh chuồng', tag: 'Trang trại', tagColor: 'emerald', time: '08:00', completed: false },
    { id: 't-2', title: 'Nhập thực phẩm tươi sống cho quán ăn', tag: 'Quán ăn', tagColor: 'blue', time: '10:00', completed: false },
    { id: 't-3', title: 'Tư vấn & tiếp nhận yêu cầu tiệc cưới', tag: 'Tiệc cưới', tagColor: 'purple', time: '14:00', completed: false },
    { id: 't-4', title: 'Kiểm tra sổ quỹ & đối soát thu chi ngày', tag: 'Tài chính', tagColor: 'amber', time: '17:00', completed: false },
  ]);

  const toggleTask = (taskId: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
  };

  // Modals state
  const [showSystemQRModal, setShowSystemQRModal] = useState<boolean>(false);
  const [showAllNotifsModal, setShowAllNotifsModal] = useState<boolean>(false);
  const [showAllTasksModal, setShowAllTasksModal] = useState<boolean>(false);
  const [showAllTxModal, setShowAllTxModal] = useState<boolean>(false);
  const [showInventoryModal, setShowInventoryModal] = useState<boolean>(false);

  // Compute Operations Data (Base 0 + Live Real Data)
  const { stats, transactions: allTransactions, notifications } = useMemo(() => {
    return computeOperationsData(bookings, weddingInquiries, menuItems, externalRecords);
  }, [bookings, weddingInquiries, menuItems, externalRecords]);

  // Filtered transactions for display
  const displayedTransactions = useMemo(() => {
    return allTransactions.filter(tx => {
      if (activeTxFilter !== 'all' && tx.type !== activeTxFilter) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          tx.code.toLowerCase().includes(q) ||
          tx.content.toLowerCase().includes(q) ||
          tx.source.toLowerCase().includes(q) ||
          tx.recordedBy.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allTransactions, activeTxFilter, searchTerm]);

  // Helper format currency
  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num) + 'đ';
  };

  const formatShortBillions = (num: number) => {
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(3) + 'B';
    }
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    return formatVND(num);
  };

  // Mini Calendar helper (August 2026)
  const calendarDays = [
    { day: 28, isCurrentMonth: false, hasEvent: false },
    { day: 29, isCurrentMonth: false, hasEvent: false },
    { day: 30, isCurrentMonth: false, hasEvent: false },
    { day: 31, isCurrentMonth: false, hasEvent: false },
    { day: 1, isCurrentMonth: true, hasEvent: false },
    { day: 2, isCurrentMonth: true, hasEvent: false },
    { day: 3, isCurrentMonth: true, hasEvent: false },
    { day: 4, isCurrentMonth: true, hasEvent: false },
    { day: 5, isCurrentMonth: true, hasEvent: false },
    { day: 6, isCurrentMonth: true, hasEvent: false },
    { day: 7, isCurrentMonth: true, hasEvent: false },
    { day: 8, isCurrentMonth: true, hasEvent: false },
    { day: 9, isCurrentMonth: true, hasEvent: false },
    { day: 10, isCurrentMonth: true, hasEvent: false },
    { day: 11, isCurrentMonth: true, hasEvent: false },
    { day: 12, isCurrentMonth: true, hasEvent: false },
    { day: 13, isCurrentMonth: true, hasEvent: false },
    { day: 14, isCurrentMonth: true, hasEvent: false },
    { day: 15, isCurrentMonth: true, hasEvent: false },
    { day: 16, isCurrentMonth: true, hasEvent: false },
    { day: 17, isCurrentMonth: true, hasEvent: false },
    { day: 18, isCurrentMonth: true, hasEvent: false },
    { day: 19, isCurrentMonth: true, hasEvent: false },
    { day: 20, isCurrentMonth: true, hasEvent: false },
    { day: 21, isCurrentMonth: true, hasEvent: false },
    { day: 22, isCurrentMonth: true, hasEvent: false },
    { day: 23, isCurrentMonth: true, hasEvent: false },
    { day: 24, isCurrentMonth: true, hasEvent: false },
    { day: 25, isCurrentMonth: true, hasEvent: false },
    { day: 26, isCurrentMonth: true, hasEvent: false },
    { day: 27, isCurrentMonth: true, hasEvent: false },
    { day: 28, isCurrentMonth: true, hasEvent: false },
    { day: 29, isCurrentMonth: true, isToday: true, hasEvent: weddingInquiries.length > 0 },
    { day: 30, isCurrentMonth: true, hasEvent: false },
    { day: 31, isCurrentMonth: true, hasEvent: false },
  ];

  return (
    <div className="min-h-screen bg-[#F4F6FA] text-slate-800 -mx-4 sm:-mx-6 lg:-mx-8 -my-6 sm:-my-8 flex flex-col md:flex-row font-sans">
      {/* Toast Notification */}
      {syncToast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white rounded-2xl shadow-xl border border-slate-700 animate-in fade-in slide-in-from-top-3 duration-300 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{syncToast}</span>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 1. LEFT SIDEBAR NAVIGATION (Dark Slate/Navy Theme) */}
      {/* ------------------------------------------------------------- */}
      <aside className={`bg-[#0F172A] text-slate-300 w-full md:w-64 shrink-0 flex flex-col justify-between border-r border-slate-800 transition-all duration-300 ${sidebarCollapsed ? 'md:w-20' : 'md:w-64'}`}>
        <div>
          {/* Brand Header */}
          <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 font-black text-base shadow-inner shrink-0">
              <span className="text-xs font-bold font-serif">NN</span>
            </div>
            {!sidebarCollapsed && (
              <div className="overflow-hidden">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block leading-none">
                  HỆ THỐNG DỊCH VỤ
                </span>
                <span className="text-base font-extrabold text-emerald-400 font-serif tracking-tight block">
                  NGỌC NHI
                </span>
                <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                  TRUNG TÂM ĐIỀU HÀNH
                </span>
              </div>
            )}
          </div>

          {/* Nav List */}
          <div className="p-3 space-y-6 overflow-y-auto max-h-[calc(100vh-180px)]">
            {/* Overview / Tổng quan */}
            <div className="space-y-1">
              <button
                onClick={() => setActiveNav('overview')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                  activeNav === 'overview'
                    ? 'bg-[#1E293B] text-white border-l-4 border-blue-500 shadow-xs'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-blue-400 shrink-0" />
                {!sidebarCollapsed && <span>Tổng quan</span>}
              </button>

              {/* Sổ Thu - Chi Ngoài Hệ Thống */}
              <button
                onClick={() => setActiveNav('external_finance')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                  activeNav === 'external_finance'
                    ? 'bg-[#1E293B] text-white border-l-4 border-emerald-500 shadow-xs'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Wallet className="w-4 h-4 text-emerald-400 shrink-0" />
                  {!sidebarCollapsed && <span>Sổ Thu - Chi Ngoài</span>}
                </div>
                {!sidebarCollapsed && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {externalRecords.length}
                  </span>
                )}
              </button>
            </div>

            {/* QUẢN LÝ HỆ THỐNG */}
            <div className="space-y-1">
              {!sidebarCollapsed && (
                <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  QUẢN LÝ CÁC PHÂN HỆ
                </div>
              )}

              {/* Trang Trại Dúi */}
              <button
                onClick={() => onNavigate('farm')}
                className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors group"
                title="Chuyển đến phân hệ Trang Trại Dúi KaKa"
              >
                <div className="flex items-center gap-3">
                  <span className="text-emerald-400 text-sm">🐹</span>
                  {!sidebarCollapsed && <span>Trang Trại Dúi</span>}
                </div>
                {!sidebarCollapsed && <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />}
              </button>

              {/* Quán Ăn Ngọc Nhi */}
              <button
                onClick={() => onNavigate('restaurant')}
                className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors group"
                title="Chuyển đến phân hệ Quán Ăn Ngọc Nhi"
              >
                <div className="flex items-center gap-3">
                  <UtensilsCrossed className="w-4 h-4 text-amber-400 shrink-0" />
                  {!sidebarCollapsed && <span>Quán Ăn Ngọc Nhi</span>}
                </div>
                {!sidebarCollapsed && <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />}
              </button>

              {/* Dịch Vụ Tiệc Cưới */}
              <button
                onClick={() => onNavigate('wedding')}
                className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors group"
                title="Chuyển đến phân hệ Tiệc Cưới Ngọc Nhi"
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="w-4 h-4 text-rose-400 shrink-0" />
                  {!sidebarCollapsed && <span>Dịch Vụ Tiệc Cưới</span>}
                </div>
                {!sidebarCollapsed && <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-400 group-hover:translate-x-0.5 transition-all" />}
              </button>

              {/* Kho & Vật Tư */}
              <button
                onClick={() => setShowInventoryModal(true)}
                className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Boxes className="w-4 h-4 text-orange-400 shrink-0" />
                  {!sidebarCollapsed && <span>Kho & Vật Tư</span>}
                </div>
                {!sidebarCollapsed && <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-orange-400 transition-colors" />}
              </button>

              {/* Nhân Sự */}
              <button
                onClick={() => setShowAllTasksModal(true)}
                className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-cyan-400 shrink-0" />
                  {!sidebarCollapsed && <span>Nhân Sự & Tác Vụ</span>}
                </div>
              </button>

              {/* Báo Cáo Tài Chính */}
              <button
                onClick={() => setShowAllTxModal(true)}
                className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-4 h-4 text-violet-400 shrink-0" />
                  {!sidebarCollapsed && <span>Toàn Bộ Giao Dịch</span>}
                </div>
                {!sidebarCollapsed && (
                  <span className="text-[10px] text-slate-400 font-mono">
                    {allTransactions.length}
                  </span>
                )}
              </button>
            </div>

            {/* HỆ THỐNG */}
            <div className="space-y-1">
              {!sidebarCollapsed && (
                <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  HỆ THỐNG
                </div>
              )}

              {/* Nút Đồng Bộ Số Liệu Trực Tiếp */}
              <button
                onClick={handleSyncData}
                disabled={isSyncing}
                className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-emerald-300 bg-emerald-950/40 border border-emerald-800/50 hover:bg-emerald-900/50 transition-colors"
                title="Tự động đồng bộ số liệu từ Trang Trại, Quán Ăn, Tiệc Cưới và Sổ Thu Chi Ngoài"
              >
                <div className="flex items-center gap-3">
                  <RefreshCw className={`w-4 h-4 text-emerald-400 ${isSyncing ? 'animate-spin' : ''}`} />
                  {!sidebarCollapsed && <span>Đồng bộ số liệu</span>}
                </div>
                {!sidebarCollapsed && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                )}
              </button>

              {/* QR Hệ Thống Toàn Diện */}
              <button
                onClick={() => setShowSystemQRModal(true)}
                className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-amber-300 bg-amber-950/40 border border-amber-800/50 hover:bg-amber-900/50 transition-colors cursor-pointer"
                title="Xem & in mã QR Tổng của toàn bộ Hệ thống Dịch vụ Ngọc Nhi"
              >
                <div className="flex items-center gap-3">
                  <QrCode className="w-4 h-4 text-amber-400 shrink-0" />
                  {!sidebarCollapsed && <span>01 QR Tổng Hệ Thống</span>}
                </div>
                {!sidebarCollapsed && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold">In tem</span>
                )}
              </button>

              {/* Thông Báo */}
              <button
                onClick={() => setShowAllNotifsModal(true)}
                className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4 text-amber-400 shrink-0" />
                  {!sidebarCollapsed && <span>Thông báo</span>}
                </div>
                {!sidebarCollapsed && notifications.length > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                    {notifications.length}
                  </span>
                )}
              </button>

              {/* Cài Đặt */}
              <button
                onClick={() => onNavigate('portal')}
                className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
              >
                <Settings className="w-4 h-4 text-slate-400 shrink-0" />
                {!sidebarCollapsed && <span>Quay lại Cổng Dịch Vụ</span>}
              </button>
            </div>
          </div>
        </div>

        {/* User Card Bottom */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/60 transition-colors cursor-pointer">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <img 
                src={MANAGERS.ngocNhi.avatar} 
                alt="Ngọc Nhi" 
                className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-500/60 shrink-0"
              />
              {!sidebarCollapsed && (
                <div className="overflow-hidden text-left">
                  <div className="text-xs font-bold text-white truncate flex items-center gap-1">
                    <span>{MANAGERS.ngocNhi.name}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  </div>
                  <div className="text-[10.5px] text-slate-400 truncate">Giám đốc Điều hành</div>
                </div>
              )}
            </div>
            {!sidebarCollapsed && <ChevronDown className="w-4 h-4 text-slate-400" />}
          </div>
        </div>
      </aside>

      {/* ------------------------------------------------------------- */}
      {/* 2. MAIN CONTENT AREA */}
      {/* ------------------------------------------------------------- */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 space-y-6 overflow-x-hidden">
        {/* Top Header Bar */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                <span>Chào mừng trở lại, Giám đốc {MANAGERS.ngocNhi.name}!</span>
                <span>👋</span>
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-0.5">
                <p className="text-xs text-slate-500 font-medium">
                  {currentDateTime}
                </p>
                <span className="text-slate-300">•</span>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Đồng bộ thực: {lastSyncTime}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Header Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Auto-Sync Indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold shadow-2xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="hidden sm:inline font-medium">Tự Động Đồng Bộ Live</span>
            </div>

            {/* Quick QR Hệ Thống Button */}
            <button
              onClick={() => setShowSystemQRModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold transition-all shadow-2xs cursor-pointer hover:scale-105"
              title="Xem & in mã QR Tổng của toàn bộ Hệ thống Dịch vụ Ngọc Nhi"
              id="ops-system-qr-button"
            >
              <QrCode className="w-3.5 h-3.5 text-amber-700" />
              <span>QR Hệ Thống</span>
            </button>

            {/* Quick Add External Finance Button */}
            <button
              onClick={() => setActiveNav('external_finance')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nhập Thu / Chi Ngoài</span>
            </button>

            {/* Notification Bell */}
            <button 
              onClick={() => setShowAllNotifsModal(true)}
              className="relative p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <Bell className="w-4 h-4" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* ------------------------------------------------------------- */}
        {/* VIEW CONDITIONAL: OVERVIEW DASHBOARD vs EXTERNAL FINANCE VIEW */}
        {/* ------------------------------------------------------------- */}
        {activeNav === 'external_finance' ? (
          <ExternalFinanceView
            records={externalRecords}
            onAddRecord={handleAddExternalRecord}
            onUpdateRecord={handleUpdateExternalRecord}
            onDeleteRecord={handleDeleteExternalRecord}
            onRefresh={handleSyncData}
          />
        ) : (
          <>
            {/* ------------------------------------------------------------- */}
            {/* 3. TOP 5 KEY KPI METRICS CARDS (Pure Zero Base + Real Sync) */}
            {/* ------------------------------------------------------------- */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Card 1: TỔNG DOANH THU */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                    TỔNG DOANH THU
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-lg sm:text-xl font-black text-slate-900 font-mono tracking-tight">
                  {formatVND(stats.totalRevenue)}
                </div>
                <div className="mt-2 flex items-center gap-1 text-[11px] text-emerald-600 font-bold">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>Đồng bộ thực từ 4 nguồn thu</span>
                </div>
              </div>

              {/* Card 2: TỔNG CHI PHÍ */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                    TỔNG CHI PHÍ
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-lg sm:text-xl font-black text-slate-900 font-mono tracking-tight">
                  {formatVND(stats.totalExpenses)}
                </div>
                <div className="mt-2 flex items-center gap-1 text-[11px] text-rose-600 font-bold">
                  <ArrowDownRight className="w-3.5 h-3.5 text-rose-500" />
                  <span>Tổng chi phí phát sinh</span>
                </div>
              </div>

              {/* Card 3: LỢI NHUẬN RÒNG */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                    LỢI NHUẬN RÒNG
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                </div>
                <div className={`text-lg sm:text-xl font-black font-mono tracking-tight ${stats.netProfit >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
                  {formatVND(stats.netProfit)}
                </div>
                <div className="mt-2 flex items-center gap-1 text-[11px] text-blue-600 font-bold">
                  <Activity className="w-3.5 h-3.5" />
                  <span>Doanh thu trừ chi phí</span>
                </div>
              </div>

              {/* Card 4: DÒNG TIỀN HIỆN TẠI */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                    DÒNG TIỀN HIỆN TẠI
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Wallet className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-lg sm:text-xl font-black text-slate-900 font-mono tracking-tight">
                  {formatVND(stats.currentCashflow)}
                </div>
                <div className="mt-2 text-[11px] text-slate-500 font-medium">
                  Hạch toán thời gian thực
                </div>
              </div>

              {/* Card 5: ĐƠN HÀNG HÔM NAY */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                    ĐƠN HÀNG HÔM NAY
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <ShoppingCart className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-lg sm:text-xl font-black text-slate-900 font-mono tracking-tight">
                  {stats.todayOrdersCount}
                </div>
                <div className="mt-2 flex items-center gap-1 text-[11px] text-emerald-600 font-bold">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>Đơn quán & Dúi trong ngày</span>
                </div>
              </div>
            </section>

            {/* ------------------------------------------------------------- */}
            {/* 4. CHARTS & CRITICAL NOTIFICATIONS ROW */}
            {/* ------------------------------------------------------------- */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left: DOANH THU THEO NGUỒN (Donut Chart) (4 Cols) */}
              <div className="lg:col-span-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
                  DOANH THU THEO NGUỒN
                </h2>

                {/* Donut Visual with SVG */}
                <div className="relative flex items-center justify-center my-2">
                  <svg className="w-44 h-44 -rotate-90" viewBox="0 0 100 100">
                    {/* Background Ring */}
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#F1F5F9" strokeWidth="12" />
                    
                    {stats.totalRevenue > 0 ? (
                      <>
                        {/* 1. Trang Trại Dúi */}
                        <circle 
                          cx="50" 
                          cy="50" 
                          r="38" 
                          fill="transparent" 
                          stroke="#10B981" 
                          strokeWidth="12" 
                          strokeDasharray={`${stats.revenueBySource.farmPercent * 2.38} 238.7`}
                          strokeDashoffset="0"
                        />
                        
                        {/* 2. Quán Ăn Ngọc Nhi */}
                        <circle 
                          cx="50" 
                          cy="50" 
                          r="38" 
                          fill="transparent" 
                          stroke="#3B82F6" 
                          strokeWidth="12" 
                          strokeDasharray={`${stats.revenueBySource.restaurantPercent * 2.38} 238.7`}
                          strokeDashoffset={`-${stats.revenueBySource.farmPercent * 2.38}`}
                        />

                        {/* 3. Tiệc Cưới */}
                        <circle 
                          cx="50" 
                          cy="50" 
                          r="38" 
                          fill="transparent" 
                          stroke="#8B5CF6" 
                          strokeWidth="12" 
                          strokeDasharray={`${stats.revenueBySource.weddingPercent * 2.38} 238.7`}
                          strokeDashoffset={`-${(stats.revenueBySource.farmPercent + stats.revenueBySource.restaurantPercent) * 2.38}`}
                        />

                        {/* 4. Khác */}
                        <circle 
                          cx="50" 
                          cy="50" 
                          r="38" 
                          fill="transparent" 
                          stroke="#F59E0B" 
                          strokeWidth="12" 
                          strokeDasharray={`${stats.revenueBySource.otherPercent * 2.38} 238.7`}
                          strokeDashoffset={`-${(stats.revenueBySource.farmPercent + stats.revenueBySource.restaurantPercent + stats.revenueBySource.weddingPercent) * 2.38}`}
                        />
                      </>
                    ) : null}
                  </svg>

                  {/* Donut Center Text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] font-medium text-slate-500">Tổng thực nhận</span>
                    <span className="text-base font-black text-slate-900 font-mono tracking-tight">
                      {formatShortBillions(stats.totalRevenue)}
                    </span>
                  </div>
                </div>

                {/* Legend List */}
                <div className="space-y-2 pt-3 text-xs border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span>
                      <span className="text-slate-600 font-medium">Trang Trại Dúi</span>
                    </div>
                    <div className="font-mono text-slate-900 font-bold">
                      {formatVND(stats.revenueBySource.farm)} <span className="text-slate-500 font-normal">({stats.revenueBySource.farmPercent}%)</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-sm bg-blue-500"></span>
                      <span className="text-slate-600 font-medium">Quán Ăn Ngọc Nhi</span>
                    </div>
                    <div className="font-mono text-slate-900 font-bold">
                      {formatVND(stats.revenueBySource.restaurant)} <span className="text-slate-500 font-normal">({stats.revenueBySource.restaurantPercent}%)</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-sm bg-purple-500"></span>
                      <span className="text-slate-600 font-medium">Dịch Vụ Tiệc Cưới</span>
                    </div>
                    <div className="font-mono text-slate-900 font-bold">
                      {formatVND(stats.revenueBySource.wedding)} <span className="text-slate-500 font-normal">({stats.revenueBySource.weddingPercent}%)</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-sm bg-amber-500"></span>
                      <span className="text-slate-600 font-medium">Doanh thu ngoài / Khác</span>
                    </div>
                    <div className="font-mono text-slate-900 font-bold">
                      {formatVND(stats.revenueBySource.other)} <span className="text-slate-500 font-normal">({stats.revenueBySource.otherPercent}%)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Center: DOANH THU 7 NGÀY QUA (Trend Chart) (4 Cols) */}
              <div className="lg:col-span-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    DOANH THU 7 NGÀY QUA
                  </h2>
                  <div className="relative">
                    <select
                      value={timeRange}
                      onChange={(e: any) => setTimeRange(e.target.value)}
                      className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 focus:outline-none cursor-pointer"
                    >
                      <option value="7days">7 ngày qua</option>
                      <option value="30days">30 ngày qua</option>
                      <option value="quarter">Quý này</option>
                    </select>
                  </div>
                </div>

                {/* Line/Area SVG Chart */}
                <div className="relative h-48 w-full pt-4">
                  {stats.sevenDaysTrend.some(d => d.total > 0) ? (
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 350 140">
                      {/* Gradient */}
                      <defs>
                        <linearGradient id="chartGradReal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10B981" stopOpacity="0.35" />
                          <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Grid lines */}
                      <line x1="30" y1="20" x2="340" y2="20" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
                      <line x1="30" y1="60" x2="340" y2="60" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
                      <line x1="30" y1="100" x2="340" y2="100" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
                      <line x1="30" y1="130" x2="340" y2="130" stroke="#E2E8F0" strokeWidth="1" />

                      {/* Points */}
                      {stats.sevenDaysTrend.map((pt, i) => {
                        const cx = 40 + i * 48;
                        const maxVal = Math.max(...stats.sevenDaysTrend.map(d => d.total), 1000000);
                        const cy = 130 - (pt.total / maxVal) * 110;
                        return (
                          <g key={i}>
                            <circle cx={cx} cy={cy} r="3.5" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
                            <text x={cx} y="142" fill="#64748B" fontSize="8" textAnchor="middle" fontWeight="500">
                              {pt.dayLabel}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                      <BarChart3 className="w-8 h-8 text-slate-300 mb-2" />
                      <span className="text-xs font-bold text-slate-600">Chưa có dữ liệu phát sinh 7 ngày qua</span>
                      <span className="text-[11px] text-slate-400 mt-0.5">
                        Dữ liệu sẽ tự động vẽ biểu đồ khi có đơn đặt bàn, tiệc cưới hoặc giao dịch ngoài
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-2 text-center text-[11px] text-slate-500 font-medium">
                  Biểu đồ tăng trưởng doanh thu liên kết 4 phân hệ thời gian thực
                </div>
              </div>

              {/* Right: THÔNG BÁO QUAN TRỌNG (4 Cols) */}
              <div className="lg:col-span-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    THÔNG BÁO QUAN TRỌNG
                  </h2>
                  <button
                    onClick={() => setShowAllNotifsModal(true)}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                  >
                    Xem tất cả ({notifications.length})
                  </button>
                </div>

                <div className="space-y-3">
                  {notifications.slice(0, 3).map((n) => (
                    <div key={n.id} className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/60 transition-colors">
                      <div className="mt-0.5 shrink-0">
                        {n.level === 'critical' ? (
                          <div className="w-6 h-6 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </div>
                        ) : n.level === 'warning' ? (
                          <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                            <AlertCircle className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                            <Info className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 text-xs">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-slate-900 truncate">{n.title}</h4>
                          <span className="text-[10px] text-slate-400 shrink-0 ml-2">{n.timeAgo}</span>
                        </div>
                        <p className="text-slate-500 text-[11px] truncate mt-0.5">{n.subtitle}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleSyncData}
                    className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                    <span>Làm mới toàn bộ thông báo hệ thống</span>
                  </button>
                </div>
              </div>
            </section>

            {/* ------------------------------------------------------------- */}
            {/* 5. TÌNH HÌNH HOẠT ĐỘNG (4 SUBSYSTEM CARDS GRID) */}
            {/* ------------------------------------------------------------- */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  TÌNH HÌNH HOẠT ĐỘNG
                </h2>
                <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>Đồng bộ dữ liệu trực tiếp với 4 phân hệ</span>
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Subsystem 1: TRANG TRẠI DÚI */}
                <div className="p-5 rounded-2xl bg-white border border-emerald-200/90 shadow-2xs flex flex-col justify-between hover:border-emerald-500 hover:shadow-md transition-all">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs">
                          🐹
                        </div>
                        <h3 className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider">
                          TRANG TRẠI DÚI
                        </h3>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                        {stats.farm.totalHerd} con
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Tổng đàn</span>
                        <strong className="font-mono text-slate-900">{stats.farm.totalHerd} con</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Đàn sinh sản</span>
                        <strong className="font-mono text-slate-900">{stats.farm.breedingHerd} con</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Đàn thương phẩm</span>
                        <strong className="font-mono text-slate-900">{stats.farm.commercialHerd} con</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Chuồng trại</span>
                        <strong className="font-mono text-slate-900">{String(stats.farm.cageAreasCount).padStart(2, '0')} khu</strong>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-2 text-[11px]">
                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-500">DOANH THU THỰC TẾ</div>
                        <div className="text-sm font-black text-slate-900 font-mono">{formatVND(stats.farm.monthlyRevenue)}</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-500">CHI PHÍ VẬN HÀNH</div>
                        <div className="text-xs font-bold text-rose-700 font-mono">{formatVND(stats.farm.monthlyExpenses)}</div>
                      </div>
                      <div className="pt-1 border-t border-emerald-200/80">
                        <div className="text-[10px] uppercase font-bold text-slate-500">LỢI NHUẬN TRẠI DÚI</div>
                        <div className="text-xs font-black text-emerald-800 font-mono">{formatVND(stats.farm.monthlyProfit)}</div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3">
                    <button
                      onClick={() => onNavigate('farm')}
                      className="w-full py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs transition-colors"
                    >
                      Quản lý Trại Dúi KaKa
                    </button>
                  </div>
                </div>

                {/* Subsystem 2: QUÁN ĂN NGỌC NHI */}
                <div className="p-5 rounded-2xl bg-white border border-blue-200/90 shadow-2xs flex flex-col justify-between hover:border-blue-500 hover:shadow-md transition-all">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs">
                          <UtensilsCrossed className="w-3.5 h-3.5" />
                        </div>
                        <h3 className="text-xs font-extrabold text-blue-800 uppercase tracking-wider">
                          QUÁN ĂN NGỌC NHI
                        </h3>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold border border-blue-200">
                        {stats.restaurant.servingTables} bàn đang mở
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Đơn hàng hôm nay</span>
                        <strong className="font-mono text-slate-900">{stats.restaurant.todayOrders} đơn</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Doanh thu ngày</span>
                        <strong className="font-mono text-slate-900">{formatVND(stats.restaurant.todayRevenue)}</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Bàn đang phục vụ</span>
                        <strong className="font-mono text-slate-900">{stats.restaurant.servingTables} bàn</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Đánh giá trung bình</span>
                        <strong className="font-mono text-amber-600">⭐ {stats.restaurant.avgRating > 0 ? `${stats.restaurant.avgRating}/5` : 'Chưa có'}</strong>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200 space-y-2 text-[11px]">
                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-500">DOANH THU QUÁN ĂN</div>
                        <div className="text-sm font-black text-slate-900 font-mono">{formatVND(stats.restaurant.monthlyRevenue)}</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-500">CHI PHÍ NGUYÊN LIỆU & QUÁN</div>
                        <div className="text-xs font-bold text-rose-700 font-mono">{formatVND(stats.restaurant.monthlyExpenses)}</div>
                      </div>
                      <div className="pt-1 border-t border-blue-200/80">
                        <div className="text-[10px] uppercase font-bold text-slate-500">LỢI NHUẬN QUÁN ĂN</div>
                        <div className="text-xs font-black text-blue-800 font-mono">{formatVND(stats.restaurant.monthlyProfit)}</div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3">
                    <button
                      onClick={() => onNavigate('restaurant')}
                      className="w-full py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-xs transition-colors"
                    >
                      Quản lý Quán Ăn & Đặt Bàn
                    </button>
                  </div>
                </div>

                {/* Subsystem 3: DỊCH VỤ TIỆC CƯỚI */}
                <div className="p-5 rounded-2xl bg-white border border-purple-200/90 shadow-2xs flex flex-col justify-between hover:border-purple-500 hover:shadow-md transition-all">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center text-xs">
                          <Sparkles className="w-3.5 h-3.5" />
                        </div>
                        <h3 className="text-xs font-extrabold text-purple-800 uppercase tracking-wider">
                          DỊCH VỤ TIỆC CƯỚI
                        </h3>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-purple-50 text-purple-700 font-bold border border-purple-200">
                        {stats.wedding.monthlyEventsCount} hợp đồng
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Số tiệc trong tháng</span>
                        <strong className="font-mono text-slate-900">{stats.wedding.monthlyEventsCount} tiệc</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Tiền cọc thực nhận</span>
                        <strong className="font-mono text-purple-700">{formatVND(stats.wedding.depositCollected)}</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Tiệc sắp tới</span>
                        <strong className="font-mono text-slate-900">{stats.wedding.upcomingEventsCount} tiệc</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Tỷ lệ đặt cọc</span>
                        <strong className="font-mono text-slate-900">{stats.wedding.depositRatio}</strong>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-200 space-y-2 text-[11px]">
                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-500">DOANH THU TIỆC CƯỚI</div>
                        <div className="text-sm font-black text-slate-900 font-mono">{formatVND(stats.wedding.monthlyRevenue)}</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-500">CHI PHÍ TỔ CHỨC & RẠP</div>
                        <div className="text-xs font-bold text-rose-700 font-mono">{formatVND(stats.wedding.monthlyExpenses)}</div>
                      </div>
                      <div className="pt-1 border-t border-purple-200/80">
                        <div className="text-[10px] uppercase font-bold text-slate-500">LỢI NHUẬN TIỆC CƯỚI</div>
                        <div className="text-xs font-black text-purple-800 font-mono">{formatVND(stats.wedding.monthlyProfit)}</div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3">
                    <button
                      onClick={() => onNavigate('wedding')}
                      className="w-full py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-xs transition-colors"
                    >
                      Quản lý Đặt Tiệc Cưới
                    </button>
                  </div>
                </div>

                {/* Subsystem 4: SỔ QUỸ & NGOÀI HỆ THỐNG */}
                <div className="p-5 rounded-2xl bg-white border border-amber-200/90 shadow-2xs flex flex-col justify-between hover:border-amber-500 hover:shadow-md transition-all">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center text-xs">
                          <Wallet className="w-3.5 h-3.5" />
                        </div>
                        <h3 className="text-xs font-extrabold text-amber-800 uppercase tracking-wider">
                          THU CHI NGOÀI
                        </h3>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 font-bold border border-amber-200">
                        {stats.externalFinance.totalEntriesCount} bút toán
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Tổng thu ngoài</span>
                        <strong className="font-mono text-emerald-600">+{formatVND(stats.externalFinance.totalExternalRevenue)}</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Tổng chi ngoài</span>
                        <strong className="font-mono text-rose-600">-{formatVND(stats.externalFinance.totalExternalExpenses)}</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Số lượng món ăn</span>
                        <strong className="font-mono text-slate-900">{stats.inventory.totalItems} món</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Hết hàng tạm thời</span>
                        <strong className="font-mono text-slate-900">{stats.inventory.outOfStockCount} món</strong>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 space-y-2 text-[11px]">
                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-500">CÂN ĐỐI THU - CHI NGOÀI</div>
                        <div className={`text-sm font-black font-mono ${stats.externalFinance.netExternal >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {stats.externalFinance.netExternal >= 0 ? '+' : ''}{formatVND(stats.externalFinance.netExternal)}
                        </div>
                      </div>
                      <div className="pt-1 border-t border-amber-200/80">
                        <div className="text-[10px] uppercase font-bold text-slate-500">GIÁ TRỊ MENU & TỒN KHO</div>
                        <div className="text-xs font-black text-amber-800 font-mono">{formatVND(stats.inventory.totalValuation)}</div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3">
                    <button
                      onClick={() => setActiveNav('external_finance')}
                      className="w-full py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs transition-colors"
                    >
                      Nhập / Xem Sổ Thu Chi Ngoài
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* ------------------------------------------------------------- */}
            {/* 6. TASKS & MINI CALENDAR ROW */}
            {/* ------------------------------------------------------------- */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left: CÔNG VIỆC HÔM NAY (7 Cols) */}
              <div className="lg:col-span-7 p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      CÔNG VIỆC HÔM NAY
                    </h2>
                    <span className="text-[11px] font-bold text-slate-500">
                      Đã hoàn thành {tasks.filter(t => t.completed).length}/{tasks.length}
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {tasks.map((t) => (
                      <div 
                        key={t.id}
                        onClick={() => toggleTask(t.id)}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                          t.completed 
                            ? 'bg-slate-50/80 border-slate-200 text-slate-400' 
                            : 'bg-white border-slate-200 hover:border-blue-400 text-slate-800 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <button type="button" className="text-slate-400 hover:text-blue-600 transition-colors">
                            {t.completed ? (
                              <CheckSquare className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-400" />
                            )}
                          </button>
                          <span className={`text-xs font-semibold ${t.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                            {t.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            t.tagColor === 'emerald' ? 'bg-emerald-50 text-emerald-700' :
                            t.tagColor === 'blue' ? 'bg-blue-50 text-blue-700' :
                            t.tagColor === 'purple' ? 'bg-purple-50 text-purple-700' :
                            'bg-amber-50 text-amber-700'
                          }`}>
                            {t.tag}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400 font-medium">
                            {t.time}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-slate-100 mt-4">
                  <span className="text-[11px] text-slate-500 font-medium">
                    Nhắc việc tự động theo lịch phân ca
                  </span>
                  <button
                    onClick={() => setShowAllTasksModal(true)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700"
                  >
                    Xem toàn bộ công việc
                  </button>
                </div>
              </div>

              {/* Right: LỊCH SỰ KIỆN (5 Cols) */}
              <div className="lg:col-span-5 p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      LỊCH SỰ KIỆN
                    </h2>
                    <span className="text-xs font-bold text-slate-700">Tháng 8/2026</span>
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1 text-center text-xs">
                    {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((d, i) => (
                      <div key={i} className="font-bold text-slate-400 text-[10px] py-1">
                        {d}
                      </div>
                    ))}

                    {calendarDays.map((item, i) => (
                      <div
                        key={i}
                        className={`py-2 rounded-lg text-xs font-semibold relative transition-colors ${
                          item.isToday 
                            ? 'bg-blue-600 text-white font-bold shadow-xs' 
                            : !item.isCurrentMonth 
                            ? 'text-slate-300' 
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span>{item.day}</span>
                        {item.hasEvent && !item.isToday && (
                          <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 mt-3 space-y-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    <span className="text-slate-600 font-medium">Hôm nay ({currentDateTime.split('-')[0].trim()})</span>
                  </div>
                  {weddingInquiries.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                      <span className="text-slate-600 font-medium">Có {weddingInquiries.length} lịch tiệc cưới trong hệ thống</span>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* ------------------------------------------------------------- */}
            {/* 7. BẢNG GIAO DỊCH GẦN ĐÂY */}
            {/* ------------------------------------------------------------- */}
            <section className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    GIAO DỊCH GẦN ĐÂY
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Hợp nhất dữ liệu thu/chi từ Tiệc cưới, Quán ăn, Trang trại và Sổ quỹ ngoài hệ thống
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
                    <button
                      onClick={() => setActiveTxFilter('all')}
                      className={`px-3 py-1 rounded-lg transition-colors ${
                        activeTxFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                      }`}
                    >
                      Tất cả
                    </button>
                    <button
                      onClick={() => setActiveTxFilter('THU')}
                      className={`px-3 py-1 rounded-lg transition-colors ${
                        activeTxFilter === 'THU' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600'
                      }`}
                    >
                      Thu (+)
                    </button>
                    <button
                      onClick={() => setActiveTxFilter('CHI')}
                      className={`px-3 py-1 rounded-lg transition-colors ${
                        activeTxFilter === 'CHI' ? 'bg-rose-600 text-white shadow-2xs' : 'text-slate-600'
                      }`}
                    >
                      Chi (-)
                    </button>
                  </div>

                  <button
                    onClick={() => setActiveNav('external_finance')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Nhập Giao Dịch Ngoài</span>
                  </button>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-2.5 px-3">MÃ GD</th>
                      <th className="py-2.5 px-3">LOẠI</th>
                      <th className="py-2.5 px-3">NGUỒN</th>
                      <th className="py-2.5 px-4">NỘI DUNG</th>
                      <th className="py-2.5 px-4 text-right">SỐ TIỀN</th>
                      <th className="py-2.5 px-3">HÌNH THỨC</th>
                      <th className="py-2.5 px-3">THỜI GIAN</th>
                      <th className="py-2.5 px-3">NGƯỜI GHI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {displayedTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-slate-400">
                          Chưa có giao dịch phát sinh. Hãy nhập thêm khoản thu/chi ngoài hoặc tạo đơn bàn ăn/tiệc cưới.
                        </td>
                      </tr>
                    ) : (
                      displayedTransactions.slice(0, 8).map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{tx.code}</td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              tx.type === 'THU' 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}>
                              {tx.type}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-slate-700">{tx.source}</td>
                          <td className="py-2.5 px-4 text-slate-800 max-w-xs truncate">{tx.content}</td>
                          <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                            {tx.type === 'THU' ? '+' : '-'}{formatVND(tx.amount)}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">{tx.method}</td>
                          <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">{tx.time}</td>
                          <td className="py-2.5 px-3 text-slate-700 font-medium">{tx.recordedBy}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>

      {/* ------------------------------------------------------------- */}
      {/* ALL NOTIFICATIONS MODAL */}
      {/* ------------------------------------------------------------- */}
      {showAllNotifsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-sm text-slate-900">Toàn Bộ Thông Báo Hệ Thống</h3>
              </div>
              <button
                onClick={() => setShowAllNotifsModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-3 overflow-y-auto flex-1 text-xs">
              {notifications.map((n) => (
                <div key={n.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{n.title}</span>
                    <span className="text-[10px] text-slate-400">{n.timeAgo}</span>
                  </div>
                  <p className="text-slate-600 text-[11px]">{n.subtitle}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* ALL TRANSACTIONS MODAL */}
      {/* ------------------------------------------------------------- */}
      {showAllTxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-violet-500" />
                <h3 className="font-bold text-sm text-slate-900">Sổ Nhật Ký Giao Dịch Toàn Hệ Thống ({allTransactions.length})</h3>
              </div>
              <button
                onClick={() => setShowAllTxModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1 text-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-2.5 px-3">MÃ GD</th>
                      <th className="py-2.5 px-3">LOẠI</th>
                      <th className="py-2.5 px-3">NGUỒN</th>
                      <th className="py-2.5 px-4">NỘI DUNG</th>
                      <th className="py-2.5 px-4 text-right">SỐ TIỀN</th>
                      <th className="py-2.5 px-3">HÌNH THỨC</th>
                      <th className="py-2.5 px-3">THỜI GIAN</th>
                      <th className="py-2.5 px-3">NGƯỜI GHI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {allTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{tx.code}</td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            tx.type === 'THU' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                          }`}>
                            {tx.type}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-700">{tx.source}</td>
                        <td className="py-2.5 px-4 text-slate-800 max-w-xs truncate">{tx.content}</td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                          {tx.type === 'THU' ? '+' : '-'}{formatVND(tx.amount)}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">{tx.method}</td>
                        <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">{tx.time}</td>
                        <td className="py-2.5 px-3 text-slate-700 font-medium">{tx.recordedBy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* INVENTORY MODAL */}
      {/* ------------------------------------------------------------- */}
      {showInventoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Boxes className="w-4 h-4 text-orange-500" />
                <h3 className="font-bold text-sm text-slate-900">Kho & Danh Mục Menu ({menuItems.length} món)</h3>
              </div>
              <button
                onClick={() => setShowInventoryModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-2 overflow-y-auto flex-1 text-xs">
              {menuItems.slice(0, 15).map((m) => (
                <div key={m.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <img src={m.image} alt={m.name} className="w-8 h-8 rounded-lg object-cover" />
                    <div>
                      <div className="font-bold text-slate-900">{m.name}</div>
                      <div className="text-[10px] text-slate-400">{m.category}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-slate-900">{formatVND(m.price)}</div>
                    <div className={`text-[10px] font-bold ${m.available ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {m.available ? 'Còn hàng' : 'Hết hàng'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* Universal System QR Modal */}
      {showSystemQRModal && (
        <UniversalQRModal
          initialType="system"
          onClose={() => setShowSystemQRModal(false)}
        />
      )}
    </div>
  );
};
