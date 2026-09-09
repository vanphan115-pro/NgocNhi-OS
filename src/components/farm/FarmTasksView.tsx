import React, { useState } from 'react';
import { FarmTask, FarmCage, TaskUrgency, TaskSourceType } from './farmTypes';
import { formatDateVN, addDays } from './farmData';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ChevronRight, 
  Search, 
  Filter, 
  Calendar, 
  Sparkles, 
  Check,
  Plus,
  Trash2,
  Tag,
  ShieldCheck,
  Stethoscope,
  HeartHandshake,
  Baby,
  Sparkle,
  Lock
} from 'lucide-react';
import { UserRole } from '../../types';

interface FarmTasksViewProps {
  tasks: FarmTask[];
  cages: FarmCage[];
  onSelectCage: (cage: FarmCage) => void;
  onCompleteTask: (taskId: string, note?: string) => void;
  onCreateTask?: (task: FarmTask) => void;
  onDeleteTask?: (taskId: string) => void;
  userRole?: UserRole;
  onOpenAdminLogin?: (reason?: string) => void;
}

export const FarmTasksView: React.FC<FarmTasksViewProps> = ({
  tasks,
  cages,
  onSelectCage,
  onCompleteTask,
  onCreateTask,
  onDeleteTask,
  userRole = 'guest',
  onOpenAdminLogin
}) => {
  const [filterUrgency, setFilterUrgency] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Modals
  const [completionModalTask, setCompletionModalTask] = useState<FarmTask | null>(null);
  const [completionNote, setCompletionNote] = useState<string>('Đã kiểm tra và xử lý đạt chuẩn kỹ thuật.');
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);

  // Form state cho tạo công việc mới
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [newTaskUrgency, setNewTaskUrgency] = useState<TaskUrgency>('den_han');
  const [newTaskSourceType, setNewTaskSourceType] = useState<TaskSourceType>('general_custom');
  const [newTaskCageId, setNewTaskCageId] = useState<string>('');

  const filteredTasks = tasks.filter(t => {
    // Lọc theo Urgency
    if (filterUrgency !== 'all' && t.urgency !== filterUrgency) return false;

    // Lọc theo Danh mục
    if (filterCategory !== 'all') {
      if (filterCategory === 'breeding' && !['mating_separation', 'pregnancy_check', 'male_rest_check'].includes(t.sourceType)) return false;
      if (filterCategory === 'nursing_baby' && !['post_weaning_health_check', 'nursing_weaning', 'baby_transfer_check'].includes(t.sourceType)) return false;
      if (filterCategory === 'health_vet' && !['treatment_re_exam', 'health_alert', 'hau_bi_evaluation'].includes(t.sourceType)) return false;
      if (filterCategory === 'sanitation' && !['cage_sanitation', 'disinfection'].includes(t.sourceType)) return false;
      if (filterCategory === 'custom' && !t.isCustom && t.sourceType !== 'general_custom') return false;
    }

    // Lọc theo Từ khóa tìm kiếm
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        t.title.toLowerCase().includes(term) ||
        t.description.toLowerCase().includes(term) ||
        (t.cageCode && t.cageCode.toLowerCase().includes(term)) ||
        (t.areaName && t.areaName.toLowerCase().includes(term))
      );
    }
    return true;
  });

  const urgentCount = tasks.filter(t => t.urgency === 'qua_han').length;
  const dueTodayCount = tasks.filter(t => t.urgency === 'den_han').length;
  const upcomingCount = tasks.filter(t => t.urgency === 'sap_den_han').length;

  const breedingCount = tasks.filter(t => ['mating_separation', 'pregnancy_check', 'male_rest_check'].includes(t.sourceType)).length;
  const nursingCount = tasks.filter(t => ['post_weaning_health_check', 'nursing_weaning', 'baby_transfer_check'].includes(t.sourceType)).length;
  const vetCount = tasks.filter(t => ['treatment_re_exam', 'health_alert', 'hau_bi_evaluation'].includes(t.sourceType)).length;
  const sanitationCount = tasks.filter(t => ['cage_sanitation', 'disinfection'].includes(t.sourceType)).length;
  const customCount = tasks.filter(t => t.isCustom || t.sourceType === 'general_custom').length;

  const handleConfirmComplete = () => {
    if (completionModalTask) {
      onCompleteTask(completionModalTask.id, completionNote);
      setCompletionModalTask(null);
    }
  };

  const handleCreateNewTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const selectedCage = cages.find(c => c.id === newTaskCageId);

    const newTask: FarmTask = {
      id: `task-custom-${Date.now()}`,
      sourceType: newTaskSourceType,
      title: newTaskTitle.trim(),
      description: newTaskDescription.trim() || 'Công việc theo dõi / kỹ thuật trang trại.',
      dueDate: newTaskDueDate,
      cageId: selectedCage?.id,
      cageCode: selectedCage?.code,
      areaId: selectedCage?.areaId,
      areaCode: selectedCage?.areaCode,
      urgency: newTaskUrgency,
      isCompleted: false,
      isCustom: true
    };

    if (onCreateTask) {
      onCreateTask(newTask);
    }
    
    // Reset form
    setNewTaskTitle('');
    setNewTaskDescription('');
    setNewTaskCageId('');
    setShowAddTaskModal(false);
  };

  const getSourceTypeIcon = (sourceType: TaskSourceType) => {
    switch (sourceType) {
      case 'mating_separation':
      case 'pregnancy_check':
      case 'male_rest_check':
        return <HeartHandshake className="w-4 h-4 text-rose-500" />;
      case 'nursing_weaning':
      case 'post_weaning_health_check':
      case 'baby_transfer_check':
        return <Baby className="w-4 h-4 text-sky-500" />;
      case 'treatment_re_exam':
      case 'health_alert':
        return <Stethoscope className="w-4 h-4 text-red-500" />;
      case 'cage_sanitation':
      case 'disinfection':
        return <ShieldCheck className="w-4 h-4 text-emerald-500" />;
      default:
        return <Tag className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Công Việc & Cảnh Báo */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">
                Lịch Công Việc & Cảnh Báo Tự Động
              </h2>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                tasks.length > 0 ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {tasks.length} việc cần xử lý
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Hệ thống tự động cập nhật 100% theo nghiệp vụ thực tế (Ghép đôi 20 ngày, Sau sinh 45 ngày tách con, Dưỡng 10 ngày, Vệ sinh & Tiêu độc 07 ngày)
            </p>
          </div>

          <div className="flex items-center gap-2">
            {userRole === 'admin' ? (
              <button
                onClick={() => setShowAddTaskModal(true)}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm lịch hẹn / công việc</span>
              </button>
            ) : (
              <button
                onClick={() => onOpenAdminLogin?.('Tạo và quản lý lịch công việc yêu cầu quyền Quản Trị')}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-amber-50 text-slate-600 hover:text-amber-800 text-xs font-semibold flex items-center gap-1.5 border border-slate-200 shadow-2xs cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Đăng Nhập Quản Trị</span>
              </button>
            )}
          </div>
        </div>

        {/* 3 Thẻ thống kê phân loại */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => setFilterUrgency(filterUrgency === 'qua_han' ? 'all' : 'qua_han')}
            className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
              filterUrgency === 'qua_han'
                ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/20'
                : 'bg-rose-50/60 hover:bg-rose-100/70 border-rose-200 text-rose-900'
            }`}
          >
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider block">1. QUÁ HẠN</span>
              <strong className="text-xl font-black font-mono block">{urgentCount} việc</strong>
              <span className={`text-[10px] ${filterUrgency === 'qua_han' ? 'text-rose-100' : 'text-rose-600'}`}>
                Cần xử lý khẩn cấp
              </span>
            </div>
            <AlertTriangle className="w-6 h-6 opacity-70" />
          </button>

          <button
            onClick={() => setFilterUrgency(filterUrgency === 'den_han' ? 'all' : 'den_han')}
            className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
              filterUrgency === 'den_han'
                ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/20'
                : 'bg-amber-50/60 hover:bg-amber-100/70 border-amber-200 text-amber-900'
            }`}
          >
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider block">2. ĐẾN HẠN HÔM NAY</span>
              <strong className="text-xl font-black font-mono block">{dueTodayCount} việc</strong>
              <span className={`text-[10px] ${filterUrgency === 'den_han' ? 'text-amber-100' : 'text-amber-600'}`}>
                Ưu tiên thực hiện trong ngày
              </span>
            </div>
            <Clock className="w-6 h-6 opacity-70" />
          </button>

          <button
            onClick={() => setFilterUrgency(filterUrgency === 'sap_den_han' ? 'all' : 'sap_den_han')}
            className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
              filterUrgency === 'sap_den_han'
                ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                : 'bg-blue-50/60 hover:bg-blue-100/70 border-blue-200 text-blue-900'
            }`}
          >
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider block">3. SẮP ĐẾN HẠN</span>
              <strong className="text-xl font-black font-mono block">{upcomingCount} việc</strong>
              <span className={`text-[10px] ${filterUrgency === 'sap_den_han' ? 'text-blue-100' : 'text-blue-600'}`}>
                Cảnh báo sớm 1-3 ngày
              </span>
            </div>
            <Calendar className="w-6 h-6 opacity-70" />
          </button>
        </div>

        {/* Bộ Lọc Theo Nghiệp Vụ & Tìm Kiếm */}
        <div className="space-y-2.5 pt-2">
          {/* Chips Phân Loại Nghiệp Vụ */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                filterCategory === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>Tất cả nghiệp vụ</span>
              <span className="opacity-70">({tasks.length})</span>
            </button>

            <button
              onClick={() => setFilterCategory('breeding')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                filterCategory === 'breeding' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
              }`}
            >
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Ghép đôi & Sinh sản</span>
              <span>({breedingCount})</span>
            </button>

            <button
              onClick={() => setFilterCategory('nursing_baby')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                filterCategory === 'nursing_baby' ? 'bg-sky-600 text-white' : 'bg-sky-50 text-sky-800 hover:bg-sky-100'
              }`}
            >
              <Baby className="w-3.5 h-3.5" />
              <span>Nuôi con & Đàn Baby</span>
              <span>({nursingCount})</span>
            </button>

            <button
              onClick={() => setFilterCategory('health_vet')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                filterCategory === 'health_vet' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-800 hover:bg-red-100'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Thú y & Sức khỏe</span>
              <span>({vetCount})</span>
            </button>

            <button
              onClick={() => setFilterCategory('sanitation')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                filterCategory === 'sanitation' ? 'bg-teal-600 text-white' : 'bg-teal-50 text-teal-800 hover:bg-teal-100'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Vệ sinh & Tiêu độc</span>
              <span>({sanitationCount})</span>
            </button>

            {customCount > 0 && (
              <button
                onClick={() => setFilterCategory('custom')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  filterCategory === 'custom' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                <span>Việc tự tạo</span>
                <span>({customCount})</span>
              </button>
            )}
          </div>

          {/* Thanh Tìm kiếm & Lọc độ khẩn */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setFilterUrgency('all')}
                className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                  filterUrgency === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Tất cả ({tasks.length})
              </button>
              <button
                onClick={() => setFilterUrgency('qua_han')}
                className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                  filterUrgency === 'qua_han' ? 'bg-rose-600 text-white shadow-xs' : 'text-rose-700 hover:bg-rose-100'
                }`}
              >
                Quá hạn ({urgentCount})
              </button>
              <button
                onClick={() => setFilterUrgency('den_han')}
                className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                  filterUrgency === 'den_han' ? 'bg-amber-500 text-white shadow-xs' : 'text-amber-700 hover:bg-amber-100'
                }`}
              >
                Hôm nay ({dueTodayCount})
              </button>
              <button
                onClick={() => setFilterUrgency('sap_den_han')}
                className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                  filterUrgency === 'sap_den_han' ? 'bg-blue-600 text-white shadow-xs' : 'text-blue-700 hover:bg-blue-100'
                }`}
              >
                Sắp đến ({upcomingCount})
              </button>
            </div>

            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm theo tên công việc, mã ô, khu vực..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-emerald-600"
              />
            </div>
          </div>
        </div>

        {/* Danh sách Công Việc */}
        {filteredTasks.length === 0 ? (
          <div className="py-12 text-center bg-slate-50/70 rounded-2xl border border-slate-200 space-y-2">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-lg font-bold">
              ✓
            </div>
            <p className="font-bold text-slate-800 text-xs">Không có công việc nào trong danh mục này.</p>
            <p className="text-[11px] text-slate-400">Các cảnh báo sẽ tự động xuất hiện khi đàn dúi đạt đến các mốc kỹ thuật (20 ngày ghép, 45 ngày tách con, 10 ngày dưỡng, 7 ngày dọn chuồng).</p>
          </div>
        ) : (
          <div className="space-y-3 pt-2">
            {filteredTasks.map((task) => {
              const targetCage = cages.find(c => c.id === task.cageId);

              return (
                <div
                  key={task.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    task.urgency === 'qua_han'
                      ? 'bg-rose-50/70 border-rose-200 shadow-xs'
                      : task.urgency === 'den_han'
                      ? 'bg-amber-50/70 border-amber-200 shadow-xs'
                      : 'bg-blue-50/50 border-blue-200'
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                      task.urgency === 'qua_han'
                        ? 'bg-rose-600 text-white'
                        : task.urgency === 'den_han'
                        ? 'bg-amber-500 text-white'
                        : 'bg-blue-600 text-white'
                    }`}>
                      {task.urgency === 'qua_han' ? '!' : task.urgency === 'den_han' ? 'HÔM NAY' : 'SẮP'}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-1.5">
                          {getSourceTypeIcon(task.sourceType)}
                          <span className="font-bold text-xs text-slate-900">{task.title}</span>
                        </div>
                        
                        {task.cageCode && (
                          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-800">
                            Ô {task.cageCode}
                          </span>
                        )}

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          task.urgency === 'qua_han'
                            ? 'bg-rose-100 text-rose-800'
                            : task.urgency === 'den_han'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {task.urgency === 'qua_han' ? 'QUÁ HẠN' : task.urgency === 'den_han' ? 'ĐẾN HẠN HÔM NAY' : 'SẮP ĐẾN HẠN'}
                        </span>

                        {task.isCustom && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-purple-100 text-purple-800 border border-purple-200">
                            Tự tạo
                          </span>
                        )}
                      </div>
                      
                      <p className="text-[11px] text-slate-600 leading-relaxed">{task.description}</p>
                      
                      <div className="text-[10px] text-slate-400 font-mono flex items-center gap-2">
                        <span>Ngày hẹn thực tế: <strong className="text-slate-700">{formatDateVN(task.dueDate)}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {/* Nút Tới Ô (mở Hồ Sơ Ô theo chuẩn đặc tả) */}
                    {targetCage && (
                      <button
                        onClick={() => onSelectCage(targetCage)}
                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-emerald-700 text-xs font-bold flex items-center gap-1 transition-colors shadow-2xs"
                      >
                        <span>Tới Ô {targetCage.code}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Nút Xóa việc nếu là việc tự tạo (chỉ cho admin) */}
                    {task.isCustom && onDeleteTask && userRole === 'admin' && (
                      <button
                        onClick={() => onDeleteTask(task.id)}
                        className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 text-xs transition-colors cursor-pointer"
                        title="Xóa công việc tự tạo này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Nút Đánh dấu hoàn thành */}
                    {userRole === 'admin' ? (
                      <button
                        onClick={() => setCompletionModalTask(task)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 transition-colors shadow-xs cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Xác Nhận Xong</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onOpenAdminLogin?.('Xác nhận hoàn tất công việc yêu cầu quyền Quản Trị')}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-amber-50 border border-slate-200 text-slate-600 hover:text-amber-800 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Lock className="w-3 h-3 text-slate-400" />
                        <span>Xử lý</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal 1: Xác Nhận Hoàn Thành Công Việc */}
      {completionModalTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-5 max-w-md w-full border border-slate-200 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Xác Nhận Hoàn Thành Công Việc</span>
            </h3>
            
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1">
              <p className="font-bold text-xs text-slate-900">{completionModalTask.title}</p>
              <p className="text-[11px] text-slate-500">{completionModalTask.description}</p>
            </div>

            {/* Chú thích tác vụ kỹ thuật tự động */}
            {completionModalTask.sourceType === 'post_weaning_health_check' && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px]">
                💡 <strong>Tự động hóa:</strong> Khi hoàn thành, Ô cái sẽ tự động chuyển sang trạng thái <strong>Sẵn sàng ghép</strong> và lưu nhật ký hoàn thành.
              </div>
            )}

            {completionModalTask.sourceType === 'cage_sanitation' && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px]">
                💡 <strong>Tự động hóa:</strong> Ngày vệ sinh gần nhất sẽ được đặt thành hôm nay và chu kỳ 7 ngày được làm mới.
              </div>
            )}

            {completionModalTask.sourceType === 'disinfection' && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px]">
                💡 <strong>Tự động hóa:</strong> Ghi nhận vào nhật ký phun tiêu độc Cloramin B toàn trại (chu kỳ 07 ngày trùng lịch vệ sinh).
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Ghi chú thực hiện</label>
              <textarea
                rows={3}
                value={completionNote}
                onChange={e => setCompletionNote(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:outline-hidden focus:border-emerald-600"
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setCompletionModalTask(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmComplete}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs"
              >
                Xác Nhận & Cập Nhật Lịch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Thêm Công Việc / Lịch Hẹn Mới */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <form onSubmit={handleCreateNewTask} className="bg-white rounded-3xl p-5 max-w-md w-full border border-slate-200 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-600" />
                <span>Thêm Lịch Hẹn / Công Việc Mới</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddTaskModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tên công việc / Nghiệp vụ *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Bổ sung khoáng Canxi, Đổi máng ăn, Cắt tỉa móng..."
                  value={newTaskTitle}
                  onChange={e => setNewTaskTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Ngày hẹn thực hiện *</label>
                  <input
                    type="date"
                    required
                    value={newTaskDueDate}
                    onChange={e => setNewTaskDueDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:border-emerald-600 font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mức độ ưu tiên</label>
                  <select
                    value={newTaskUrgency}
                    onChange={e => setNewTaskUrgency(e.target.value as TaskUrgency)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:border-emerald-600 bg-white"
                  >
                    <option value="den_han">Đến hạn hôm nay</option>
                    <option value="sap_den_han">Sắp đến hạn (1-3 ngày)</option>
                    <option value="qua_han">Quá hạn / Khẩn cấp</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phân loại</label>
                  <select
                    value={newTaskSourceType}
                    onChange={e => setNewTaskSourceType(e.target.value as TaskSourceType)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:border-emerald-600 bg-white"
                  >
                    <option value="general_custom">Công việc chung</option>
                    <option value="mating_separation">Ghép đôi / Phối giống</option>
                    <option value="nursing_weaning">Chăm sóc con non / Baby</option>
                    <option value="treatment_re_exam">Thú y / Sức khỏe</option>
                    <option value="cage_sanitation">Vệ sinh / Khử trùng</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Áp dụng cho Ô (Tùy chọn)</label>
                  <select
                    value={newTaskCageId}
                    onChange={e => setNewTaskCageId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:border-emerald-600 bg-white"
                  >
                    <option value="">-- Toàn trang trại --</option>
                    {cages.map(c => (
                      <option key={c.id} value={c.id}>
                        Ô {c.code} ({c.statusLabel})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mô tả / Hướng dẫn xử lý</label>
                <textarea
                  rows={2}
                  placeholder="Ghi chú thêm về liều lượng, cách thực hiện..."
                  value={newTaskDescription}
                  onChange={e => setNewTaskDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:border-emerald-600"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddTaskModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs"
              >
                Lưu Công Việc
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
