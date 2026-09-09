import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Users, 
  Sparkles, 
  MapPin, 
  CheckCircle2, 
  Phone,
  Plus
} from 'lucide-react';
import { WeddingInquiry, UserRole } from '../../types';

interface WeddingScheduleViewProps {
  userRole: UserRole;
  weddingInquiries: WeddingInquiry[];
  onOpenBookingModal: (prefill?: any) => void;
}

export const WeddingScheduleView: React.FC<WeddingScheduleViewProps> = ({
  userRole,
  weddingInquiries,
  onOpenBookingModal,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-06');
  const [selectedHall, setSelectedHall] = useState<string>('all');

  // Sample scheduled bookings for calendar display
  const calendarSlots = [
    { date: '2026-06-10', shift: 'noon', hall: 'Sảnh VIP Hoàng Gia', title: 'Tiệc Báo Hỷ Anh Phúc & Chị Thảo', tables: 20, status: 'confirmed' },
    { date: '2026-06-18', shift: 'evening', hall: 'Sảnh Ngọc Nhi 2', title: 'Lễ Cưới Anh Nam & Chị Linh', tables: 28, status: 'confirmed' },
    { date: '2026-06-25', shift: 'evening', hall: 'Sảnh Ngọc Nhi 1', title: 'Hôn Lễ Anh Tuấn & Chị Hương', tables: 35, status: 'confirmed' },
    { date: '2026-06-28', shift: 'noon', hall: 'Sảnh Sân Vườn Romance', title: 'Tiệc Cưới Rustic Hoàng Long & Mỹ Duyên', tables: 30, status: 'confirmed' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-rose-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">
              Lịch Đặt Sảnh & Sự Kiện
            </span>
            <h1 className="text-2xl font-black text-slate-900 font-serif">
              LỊCH TỔ CHỨC TIỆC CƯỚI
            </h1>
            <p className="text-xs text-slate-500">
              Kiểm tra sảnh trống, theo dõi các ca tiệc cưới (Trưa 11:00 / Tối 17:30) trên toàn hệ thống.
            </p>
          </div>

          <button
            onClick={() => onOpenBookingModal()}
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Đặt Giữ Sảnh Ngày Này</span>
          </button>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Chọn sảnh:</span>
            <select
              value={selectedHall}
              onChange={(e) => setSelectedHall(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-semibold focus:outline-none focus:border-rose-500"
            >
              <option value="all">Tất Cả Các Sảnh</option>
              <option value="Sảnh Ngọc Nhi 1">Sảnh Ngọc Nhi 1 (Grand Ballroom)</option>
              <option value="Sảnh Ngọc Nhi 2">Sảnh Ngọc Nhi 2</option>
              <option value="Sảnh VIP Hoàng Gia">Sảnh VIP Hoàng Gia</option>
              <option value="Sảnh Sân Vườn Romance">Sảnh Sân Vườn Romance</option>
            </select>
          </div>

          <div className="text-xs font-mono font-bold text-rose-700 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200">
            Tháng 06/2026 (Mùa Cưới Hoàng Kim)
          </div>
        </div>
      </div>

      {/* Scheduled Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {calendarSlots.map((slot, idx) => (
          <div
            key={idx}
            className="p-5 rounded-3xl bg-white border border-rose-100 shadow-xs hover:border-rose-300 transition-all flex flex-col justify-between space-y-3 group"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-800 text-xs font-bold">
                  <CalendarIcon className="w-3.5 h-3.5 text-rose-600" />
                  <span>{slot.date}</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  {slot.shift === 'noon' ? 'Ca Trưa (11:30)' : 'Ca Tối (17:30)'}
                </span>
              </div>

              <h3 className="font-bold text-slate-900 text-base group-hover:text-rose-700 transition-colors">
                {slot.title}
              </h3>

              <div className="space-y-1 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{slot.hall}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>Quy mô: <strong>{slot.tables} Bàn</strong></span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Đã giữ sảnh & cọc tiệc</span>
              </span>
              <a href="tel:0967823801" className="text-rose-700 font-bold hover:underline">
                Hotline hỗ trợ
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
