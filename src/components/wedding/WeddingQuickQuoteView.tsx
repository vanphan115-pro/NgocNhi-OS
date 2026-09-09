import React, { useState } from 'react';
import { 
  Calculator, 
  Sparkles, 
  Send, 
  CheckCircle2, 
  DollarSign, 
  Percent, 
  Gift, 
  Phone, 
  Printer 
} from 'lucide-react';
import { WEDDING_REFERENCE_PACKAGES, WEDDING_REFERENCE_SERVICES } from './weddingData';
import { UserRole } from '../../types';

interface WeddingQuickQuoteViewProps {
  userRole: UserRole;
  onSendQuoteRequest: (quoteData: any) => void;
}

export const WeddingQuickQuoteView: React.FC<WeddingQuickQuoteViewProps> = ({
  userRole,
  onSendQuoteRequest,
}) => {
  const [tableCount, setTableCount] = useState<number>(30);
  const [selectedPkgId, setSelectedPkgId] = useState<string>('pkg-standard');
  const [selectedServices, setSelectedServices] = useState<string[]>(['serv-decor', 'serv-mc']);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [eventDate, setEventDate] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const selectedPkg = WEDDING_REFERENCE_PACKAGES.find(p => p.id === selectedPkgId) || WEDDING_REFERENCE_PACKAGES[1];

  const totalTableCost = tableCount * selectedPkg.price;
  const totalServiceCost = selectedServices.reduce((sum, sid) => {
    const serv = WEDDING_REFERENCE_SERVICES.find(s => s.id === sid);
    return sum + (serv ? serv.price : 0);
  }, 0);

  // 5% discount if >= 25 tables
  const discountRate = tableCount >= 25 ? 0.05 : 0;
  const discountAmount = Math.round(totalTableCost * discountRate);
  const grandTotal = totalTableCost + totalServiceCost - discountAmount;

  const toggleService = (sid: string) => {
    if (selectedServices.includes(sid)) {
      setSelectedServices(selectedServices.filter(s => s !== sid));
    } else {
      setSelectedServices([...selectedServices, sid]);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone) return;

    onSendQuoteRequest({
      customerName,
      phone: customerPhone,
      eventDate: eventDate || new Date().toISOString().split('T')[0],
      tableCount,
      packageId: selectedPkgId,
      packageName: selectedPkg.name,
      selectedServices,
      grandTotal,
    });

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
    }, 4000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 border border-rose-200 shadow-sm space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold">
          <Calculator className="w-3.5 h-3.5 text-rose-600" />
          <span>Công Cụ Dự Toán Chi Phí Tự Động</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 font-serif">
          BÁO GIÁ NHANH TIỆC CƯỚI NGỌC NHI
        </h1>
        <p className="text-xs text-slate-500">
          Tùy chỉnh số lượng bàn, gói tiệc mâm cỗ và các dịch vụ đi kèm để nhận bảng dự toán chính xác nhất.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form Settings (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-rose-200 shadow-sm space-y-6">
          {/* Step 1: Number of Tables Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                1. Số lượng bàn tiệc dự kiến:
              </label>
              <span className="text-base font-black font-mono text-rose-700 bg-rose-50 px-3 py-1 rounded-xl border border-rose-200">
                {tableCount} Bàn (~{tableCount * 10} Khách)
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="80"
              step="1"
              value={tableCount}
              onChange={(e) => setTableCount(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>10 Bàn (Ấm cúng)</span>
              <span>30 Bàn (Tiêu chuẩn)</span>
              <span>50 Bàn (Sảnh lớn)</span>
              <span>80 Bàn (Grand VIP)</span>
            </div>
          </div>

          {/* Step 2: Choose Package */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
              2. Lựa chọn gói tiệc mâm cỗ:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {WEDDING_REFERENCE_PACKAGES.map((pkg) => {
                const isSelected = selectedPkgId === pkg.id;
                return (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() => setSelectedPkgId(pkg.id)}
                    className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-rose-600 bg-rose-50/60 ring-2 ring-rose-300'
                        : 'border-slate-200 bg-white hover:border-rose-300'
                    }`}
                  >
                    <div className="font-bold text-slate-900 text-xs">{pkg.name}</div>
                    <div className="text-sm font-black font-mono text-rose-700 mt-1">{pkg.priceFormatted}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Thực đơn từ {pkg.menuDishes.length} món</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Choose Addon Services */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
              3. Chọn dịch vụ đi kèm bổ sung (Tùy chọn):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {WEDDING_REFERENCE_SERVICES.map((serv) => {
                const isChecked = selectedServices.includes(serv.id);
                return (
                  <div
                    key={serv.id}
                    onClick={() => toggleService(serv.id)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                      isChecked
                        ? 'border-rose-600 bg-rose-50/50'
                        : 'border-slate-200 bg-slate-50 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                          isChecked ? 'bg-rose-600 border-rose-600 text-white' : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                      <span className="font-bold text-xs text-slate-800">{serv.title}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-rose-700">{serv.priceFormatted}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Cost Summary & Lead Form (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-rose-200 shadow-sm space-y-5">
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-rose-700 uppercase tracking-wider">
              BẢNG TÍNH CHI PHÍ DỰ TOÁN
            </h2>

            <div className="space-y-2.5 text-xs text-slate-600 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex justify-between">
                <span>Tiền bàn tiệc ({tableCount} bàn x {selectedPkg.priceFormatted}):</span>
                <span className="font-mono font-bold text-slate-900">{totalTableCost.toLocaleString('vi-VN')}đ</span>
              </div>

              <div className="flex justify-between">
                <span>Dịch vụ đi kèm ({selectedServices.length} dịch vụ):</span>
                <span className="font-mono font-bold text-slate-900">{totalServiceCost.toLocaleString('vi-VN')}đ</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Ưu đãi đặt từ 25 bàn (-5%):</span>
                  <span className="font-mono">-{discountAmount.toLocaleString('vi-VN')}đ</span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                <span className="font-bold text-slate-900 text-sm">TỔNG DỰ TOÁN:</span>
                <div className="text-right">
                  <div className="text-xl font-black font-mono text-rose-700">
                    {grandTotal.toLocaleString('vi-VN')}đ
                  </div>
                  <div className="text-[10px] text-slate-400">
                    (~{Math.round(grandTotal / tableCount).toLocaleString('vi-VN')}đ / Bàn trọn gói)
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Lead Capture Form */}
          {isSubmitted ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2 animate-in zoom-in-95">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <div className="font-bold text-emerald-900 text-xs">Đã lưu bảng dự toán tiệc cưới!</div>
              <p className="text-[11px] text-emerald-700">
                Chuyên viên tư vấn Ngọc Nhi sẽ liên hệ gửi bản in chi tiết kèm quà tặng ưu đãi.
              </p>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase">
                GỬI BẢNG DỰ TOÁN ĐẾN GIÁM ĐỐC NGỌC NHI
              </h3>

              <input
                type="text"
                required
                placeholder="Họ và tên cô dâu / chú rể *"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-rose-500"
              />

              <input
                type="tel"
                required
                placeholder="Số điện thoại nhận báo giá Zalo *"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-rose-500"
              />

              <input
                type="date"
                placeholder="Ngày cưới dự kiến"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-rose-500"
              />

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Gửi Nhận Báo Giá Chi Tiết</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
