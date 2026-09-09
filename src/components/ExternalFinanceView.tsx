import React, { useState, useMemo } from 'react';
import { ExternalFinanceRecord, FinanceCategory, FinanceEntryType } from '../types';
import { FINANCE_CATEGORY_NAMES } from '../utils/operationsData';
import { MANAGERS } from '../data/initialData';
import { 
  Plus, 
  Search, 
  Filter, 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  Trash2, 
  Edit3, 
  FileText, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  AlertCircle,
  X,
  CreditCard,
  Building,
  UtensilsCrossed,
  Sparkles,
  Zap,
  Users,
  Megaphone,
  Wrench,
  Boxes,
  HelpCircle,
  RefreshCw
} from 'lucide-react';

interface ExternalFinanceViewProps {
  records: ExternalFinanceRecord[];
  onAddRecord: (record: Omit<ExternalFinanceRecord, 'id' | 'code' | 'createdAt'>) => void;
  onUpdateRecord: (id: string, record: Partial<ExternalFinanceRecord>) => void;
  onDeleteRecord: (id: string) => void;
  onRefresh: () => void;
}

export const ExternalFinanceView: React.FC<ExternalFinanceViewProps> = ({
  records,
  onAddRecord,
  onUpdateRecord,
  onDeleteRecord,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'THU' | 'CHI'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ExternalFinanceRecord | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    type: FinanceEntryType;
    category: FinanceCategory;
    title: string;
    amount: number | '';
    paymentMethod: 'Chuyển khoản' | 'Tiền mặt' | 'Thẻ tín dụng' | 'Khác';
    recordDate: string;
    recordedBy: string;
    notes: string;
    invoiceCode: string;
  }>({
    type: 'CHI',
    category: 'dien_nuoc_tien_ich',
    title: '',
    amount: '',
    paymentMethod: 'Chuyển khoản',
    recordDate: new Date().toISOString().split('T')[0],
    recordedBy: MANAGERS.ngocNhi.name,
    notes: '',
    invoiceCode: ''
  });

  // Open modal for add
  const handleOpenAddModal = () => {
    setEditingRecord(null);
    setFormData({
      type: 'CHI',
      category: 'dien_nuoc_tien_ich',
      title: '',
      amount: '',
      paymentMethod: 'Chuyển khoản',
      recordDate: new Date().toISOString().split('T')[0],
      recordedBy: MANAGERS.ngocNhi.name,
      notes: '',
      invoiceCode: ''
    });
    setIsModalOpen(true);
  };

  // Open modal for edit
  const handleOpenEditModal = (rec: ExternalFinanceRecord) => {
    setEditingRecord(rec);
    setFormData({
      type: rec.type,
      category: rec.category,
      title: rec.title,
      amount: rec.amount,
      paymentMethod: rec.paymentMethod,
      recordDate: rec.recordDate,
      recordedBy: rec.recordedBy,
      notes: rec.notes || '',
      invoiceCode: rec.invoiceCode || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.amount || Number(formData.amount) <= 0) {
      alert('Vui lòng nhập đầy đủ tiêu đề và số tiền hợp lệ (> 0đ)!');
      return;
    }

    const categoryName = FINANCE_CATEGORY_NAMES[formData.category] || 'Nguồn Khác';

    if (editingRecord) {
      onUpdateRecord(editingRecord.id, {
        type: formData.type,
        category: formData.category,
        categoryName,
        title: formData.title.trim(),
        amount: Number(formData.amount),
        paymentMethod: formData.paymentMethod,
        recordDate: formData.recordDate,
        recordedBy: formData.recordedBy,
        notes: formData.notes.trim(),
        invoiceCode: formData.invoiceCode.trim()
      });
    } else {
      onAddRecord({
        type: formData.type,
        category: formData.category,
        categoryName,
        title: formData.title.trim(),
        amount: Number(formData.amount),
        paymentMethod: formData.paymentMethod,
        recordDate: formData.recordDate,
        recordedBy: formData.recordedBy,
        notes: formData.notes.trim(),
        invoiceCode: formData.invoiceCode.trim()
      });
    }

    setIsModalOpen(false);
  };

  // Quick Amount Helper
  const addQuickAmount = (val: number) => {
    setFormData(prev => ({
      ...prev,
      amount: (typeof prev.amount === 'number' ? prev.amount : 0) + val
    }));
  };

  // Format Currency
  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num) + 'đ';
  };

  // Category Icon helper
  const getCategoryIcon = (cat: FinanceCategory) => {
    switch (cat) {
      case 'quan_an': return <UtensilsCrossed className="w-3.5 h-3.5 text-amber-500" />;
      case 'trang_trai': return <span className="text-xs">🐹</span>;
      case 'tiec_cuoi': return <Sparkles className="w-3.5 h-3.5 text-purple-500" />;
      case 'thue_mat_bang': return <Building className="w-3.5 h-3.5 text-blue-500" />;
      case 'dien_nuoc_tien_ich': return <Zap className="w-3.5 h-3.5 text-yellow-500" />;
      case 'luong_nhan_su': return <Users className="w-3.5 h-3.5 text-cyan-500" />;
      case 'tiep_thi_quang_cao': return <Megaphone className="w-3.5 h-3.5 text-rose-500" />;
      case 'trang_thiet_bi': return <Wrench className="w-3.5 h-3.5 text-orange-500" />;
      case 'vat_tu_kho': return <Boxes className="w-3.5 h-3.5 text-emerald-500" />;
      default: return <DollarSign className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  // Filtered Records
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      if (typeFilter !== 'ALL' && r.type !== typeFilter) return false;
      if (categoryFilter !== 'ALL' && r.category !== categoryFilter) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          r.code.toLowerCase().includes(q) ||
          r.title.toLowerCase().includes(q) ||
          r.recordedBy.toLowerCase().includes(q) ||
          (r.notes && r.notes.toLowerCase().includes(q)) ||
          (r.invoiceCode && r.invoiceCode.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [records, typeFilter, categoryFilter, searchTerm]);

  // Aggregate stats
  const totalRevenue = useMemo(() => {
    return records.filter(r => r.type === 'THU').reduce((s, r) => s + r.amount, 0);
  }, [records]);

  const totalExpenses = useMemo(() => {
    return records.filter(r => r.type === 'CHI').reduce((s, r) => s + r.amount, 0);
  }, [records]);

  const netBalance = totalRevenue - totalExpenses;

  return (
    <div className="space-y-6">
      {/* 1. Header and Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">
              Sổ Quỹ & Nhập Thu Chi Ngoài Hệ Thống
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              {records.length} giao dịch
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Ghi nhận các khoản chi phí mặt bằng, điện nước, lương nhân sự, tiếp thị, sửa chữa và doanh thu bán ngoài
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Nhập Thu / Chi Mới</span>
          </button>
        </div>
      </div>

      {/* 2. Key KPI Metric Cards for External Finance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total External Revenue */}
        <div className="p-4 rounded-2xl bg-white border border-emerald-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
              TỔNG THU NGOÀI HỆ THỐNG
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-slate-900 font-mono">
            {formatVND(totalRevenue)}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            {records.filter(r => r.type === 'THU').length} khoản thu đã ghi nhận
          </div>
        </div>

        {/* Total External Expenses */}
        <div className="p-4 rounded-2xl bg-white border border-rose-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700">
              TỔNG CHI PHÍ NGOÀI HỆ THỐNG
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-slate-900 font-mono">
            {formatVND(totalExpenses)}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            {records.filter(r => r.type === 'CHI').length} khoản chi đã ghi nhận
          </div>
        </div>

        {/* Net External Balance */}
        <div className="p-4 rounded-2xl bg-white border border-blue-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
              CÂN ĐỐI THU - CHI NGOÀI
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-xl font-black font-mono ${netBalance >= 0 ? 'text-blue-700' : 'text-rose-600'}`}>
            {netBalance >= 0 ? '+' : ''}{formatVND(netBalance)}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Tự động hạch toán vào Lợi Nhuận Ròng hệ thống
          </div>
        </div>
      </div>

      {/* 3. Filter Bar & Search */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Box */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo mã, nội dung, người ghi nhận..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Type Filter */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setTypeFilter('ALL')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                typeFilter === 'ALL' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setTypeFilter('THU')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                typeFilter === 'THU' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:text-emerald-600'
              }`}
            >
              Thu (+)
            </button>
            <button
              onClick={() => setTypeFilter('CHI')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                typeFilter === 'CHI' ? 'bg-rose-600 text-white shadow-2xs' : 'text-slate-600 hover:text-rose-600'
              }`}
            >
              Chi (-)
            </button>
          </div>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="ALL">Tất cả hạng mục</option>
            {Object.entries(FINANCE_CATEGORY_NAMES).map(([key, name]) => (
              <option key={key} value={key}>{name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 4. Table of Transactions */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">MÃ GD / NGÀY</th>
                <th className="py-3 px-3">LOẠI</th>
                <th className="py-3 px-3">HẠNG MỤC</th>
                <th className="py-3 px-4">NỘI DUNG / DIỄN GIẢI</th>
                <th className="py-3 px-4 text-right">SỐ TIỀN</th>
                <th className="py-3 px-3">HÌNH THỨC</th>
                <th className="py-3 px-3">NGƯỜI GHI</th>
                <th className="py-3 px-4 text-center">THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="max-w-sm mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div className="text-sm font-bold text-slate-700">Chưa có giao dịch thu / chi ngoài nào</div>
                      <p className="text-xs text-slate-500">
                        Bấm nút "Nhập Thu / Chi Mới" để thêm chi phí mặt bằng, điện nước, lương hoặc doanh thu ngoài hệ thống.
                      </p>
                      <button
                        onClick={handleOpenAddModal}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Thêm giao dịch đầu tiên</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Code & Date */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-mono font-bold text-slate-900">{r.code}</div>
                      <div className="text-[10.5px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        <span>{r.recordDate}</span>
                      </div>
                    </td>

                    {/* Type Badge */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      {r.type === 'THU' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <ArrowUpRight className="w-3 h-3 text-emerald-700" />
                          THU (+)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-200">
                          <ArrowDownRight className="w-3 h-3 text-rose-700" />
                          CHI (-)
                        </span>
                      )}
                    </td>

                    {/* Category */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {getCategoryIcon(r.category)}
                        <span className="font-semibold text-slate-700">{r.categoryName}</span>
                      </div>
                    </td>

                    {/* Title & Notes */}
                    <td className="py-3 px-4 min-w-[200px]">
                      <div className="font-bold text-slate-900">{r.title}</div>
                      {r.notes && (
                        <div className="text-[11px] text-slate-500 mt-0.5 truncate max-w-xs">{r.notes}</div>
                      )}
                      {r.invoiceCode && (
                        <div className="text-[10px] text-blue-600 font-mono mt-0.5">HĐ: {r.invoiceCode}</div>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className={`font-mono font-bold text-sm ${r.type === 'THU' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {r.type === 'THU' ? '+' : '-'}{formatVND(r.amount)}
                      </div>
                    </td>

                    {/* Payment Method */}
                    <td className="py-3 px-3 whitespace-nowrap text-slate-600 text-[11px] font-medium">
                      {r.paymentMethod}
                    </td>

                    {/* Recorded By */}
                    <td className="py-3 px-3 whitespace-nowrap text-slate-700 font-medium">
                      {r.recordedBy}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenEditModal(r)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Chỉnh sửa giao dịch"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Bạn có chắc chắn muốn xóa giao dịch "${r.title}" (${formatVND(r.amount)})?`)) {
                              onDeleteRecord(r.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Xóa giao dịch"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Add / Edit Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white ${
                  formData.type === 'THU' ? 'bg-emerald-600' : 'bg-rose-600'
                }`}>
                  {formData.type === 'THU' ? '+' : '-'}
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    {editingRecord ? 'Chỉnh Sửa Giao Dịch Thu / Chi' : 'Nhập Khoản Thu / Chi Ngoài Hệ Thống'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Số liệu sẽ tự động cộng dồn vào Báo Cáo Tài Chính & Dòng Tiền
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* Type Switcher */}
              <div>
                <label className="block text-slate-700 font-bold mb-1.5">
                  Loại Giao Dịch <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, type: 'THU' }))}
                    className={`py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-2 border transition-all ${
                      formData.type === 'THU'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                    <span>🟢 Doanh Thu Ngoài (Thu vào)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, type: 'CHI' }))}
                    className={`py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-2 border transition-all ${
                      formData.type === 'CHI'
                        ? 'bg-rose-50 border-rose-500 text-rose-800 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <ArrowDownRight className="w-4 h-4 text-rose-600" />
                    <span>🔴 Chi Phí Ngoài (Chi ra)</span>
                  </button>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-slate-700 font-bold mb-1.5">
                  Hạng Mục Thu / Chi <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as FinanceCategory }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="dien_nuoc_tien_ich">⚡ Điện Nước, Internet & Tiện Ích</option>
                  <option value="thue_mat_bang">🏢 Thuê Mặt Bằng & Cơ Sở Vật Chất</option>
                  <option value="luong_nhan_su">👥 Lương, Thưởng & Phụ Cấp Nhân Sự</option>
                  <option value="tiep_thi_quang_cao">📢 Tiếp Thị, Quảng Cáo & Sự Kiện</option>
                  <option value="trang_thiet_bi">🛠️ Trang Thiết Bị, Máy Móc & Sửa Chữa</option>
                  <option value="vat_tu_kho">📦 Vật Tư, Bao Bì & Kho Bãi</option>
                  <option value="quan_an">🍽️ Quán Ăn Ngọc Nhi (Thu/Chi ngoài)</option>
                  <option value="trang_trai">🐹 Trang Trại Dúi (Thu/Chi ngoài)</option>
                  <option value="tiec_cuoi">💍 Dịch Vụ Tiệc Cưới (Thu/Chi ngoài)</option>
                  <option value="nguon_khac">💡 Nguồn Khác (Đầu tư, lãi vay, phân bón,...)</option>
                </select>
              </div>

              {/* Amount (VND) */}
              <div>
                <label className="block text-slate-700 font-bold mb-1.5">
                  Số Tiền (VND) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value === '' ? '' : Number(e.target.value) }))}
                    placeholder="Nhập số tiền..."
                    className="w-full pl-3.5 pr-12 py-2.5 rounded-xl border border-slate-200 font-mono text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                    VNĐ
                  </span>
                </div>

                {/* Quick Add Amount Buttons */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[10px] text-slate-400 font-medium mr-1">Cộng nhanh:</span>
                  {[500000, 1000000, 2000000, 5000000, 10000000, 20000000, 50000000].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => addQuickAmount(val)}
                      className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[10.5px] font-semibold transition-colors"
                    >
                      +{val >= 1000000 ? `${val / 1000000}Tr` : `${val / 1000}K`}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, amount: '' }))}
                    className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-[10.5px] font-semibold transition-colors"
                  >
                    Xóa số
                  </button>
                </div>
              </div>

              {/* Title / Description */}
              <div>
                <label className="block text-slate-700 font-bold mb-1.5">
                  Nội Dung / Diễn Giải <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ví dụ: Tiền điện chiếu sáng & làm mát tháng 8/2026..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Date & Payment Method Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Date */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1.5">
                    Ngày Phát Sinh <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.recordDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, recordDate: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Method */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1.5">
                    Hình Thức Thanh Toán
                  </label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value as any }))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Chuyển khoản">Chuyển khoản ngân hàng</option>
                    <option value="Tiền mặt">Tiền mặt</option>
                    <option value="Thẻ tín dụng">Thẻ tín dụng / POS</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
              </div>

              {/* Recorded By & Invoice Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1.5">
                    Người Ghi Nhận / Thủ Quỹ
                  </label>
                  <input
                    type="text"
                    value={formData.recordedBy}
                    onChange={(e) => setFormData(prev => ({ ...prev, recordedBy: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1.5">
                    Mã Hóa Đơn / Chứng Từ (nếu có)
                  </label>
                  <input
                    type="text"
                    value={formData.invoiceCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, invoiceCode: e.target.value }))}
                    placeholder="VD: HĐ-EVN-8291..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-slate-700 font-bold mb-1.5">
                  Ghi Chú Thêm
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Ghi chú chi tiết thêm..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 font-bold text-slate-600 transition-colors"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2.5 rounded-xl text-white font-bold transition-colors shadow-xs ${
                    formData.type === 'THU' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {editingRecord ? 'Cập Nhật Giao Dịch' : 'Lưu Giao Dịch Vào Hệ Thống'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
