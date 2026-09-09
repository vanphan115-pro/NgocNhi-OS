import React, { useState } from 'react';
import { DisinfectionLogItem } from './farmTypes';
import { X, ShieldCheck, Calendar, BellRing, Sparkles } from 'lucide-react';
import { addDays, formatDateVN } from './farmData';

interface FarmSanitationModalProps {
  onClose: () => void;
  onAddDisinfectionLog: (log: DisinfectionLogItem) => void;
}

export const FarmSanitationModal: React.FC<FarmSanitationModalProps> = ({
  onClose,
  onAddDisinfectionLog
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [sprayDate, setSprayDate] = useState<string>(todayStr);
  const [areaName, setAreaName] = useState<string>('Toàn bộ trang trại (Khu SS, BB, HB, TP, DT)');
  const [chemical, setChemical] = useState<string>('Cloramin B 0.5%');
  const [dosage, setDosage] = useState<string>('100g / 20L nước sạch');
  const [executor, setExecutor] = useState<string>('Phan Dũng');
  const [notes, setNotes] = useState<string>('Phun sương đều lối đi, vách tường và hành lang chuồng trại.');

  // Tính toán thời hạn phun tiếp theo (Chu kỳ 07 ngày chuẩn)
  const nextDueDate = sprayDate ? addDays(sprayDate, 7) : addDays(todayStr, 7);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalDate = sprayDate || todayStr;
    const newLog: DisinfectionLogItem = {
      id: `dis-${Date.now()}`,
      date: finalDate,
      areaName,
      chemical,
      dosage,
      executor,
      notes
    };

    onAddDisinfectionLog(newLog);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Ghi Nhận Phun Tiêu Độc Khử Trùng</h3>
              <p className="text-xs text-slate-500">Chu kỳ 07 ngày bảo vệ an toàn sinh học (trùng lịch vệ sinh)</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-200 text-slate-400 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3.5 text-xs">
          {/* Ngày Phun Khử Trùng Gần Nhất */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-300 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-emerald-950 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-700" />
                <span>NGÀY PHUN (NGÀY GẦN NHẤT) *</span>
              </label>
              <span className="text-[10px] font-bold text-emerald-800 px-2.5 py-0.5 rounded-full bg-emerald-100/90 border border-emerald-200">
                Chu kỳ 07 ngày
              </span>
            </div>

            <input
              type="date"
              value={sprayDate}
              onChange={e => setSprayDate(e.target.value)}
              required
              max={todayStr}
              className="w-full px-3.5 py-2 rounded-xl border border-emerald-400 bg-white font-mono font-bold text-emerald-950 text-sm shadow-2xs focus:ring-2 focus:ring-emerald-500 outline-hidden"
            />

            {/* Thông báo tự động tính hạn tiếp theo */}
            <div className="p-2.5 rounded-xl bg-white/90 border border-emerald-200/90 flex items-start gap-2">
              <BellRing className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-[11px] text-emerald-900 leading-tight space-y-0.5">
                <div>
                  Hạn phun kế tiếp: <strong className="font-mono text-emerald-950 font-bold underline">{formatDateVN(nextDueDate)}</strong>
                </div>
                <p className="text-[10px] text-slate-500">
                  Hệ thống sẽ tự động cập nhật cảnh báo & nhắc việc định kỳ vào ngày này.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Phạm vi phun *</label>
            <input
              type="text"
              value={areaName}
              onChange={e => setAreaName(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Hóa chất sử dụng *</label>
              <input
                type="text"
                value={chemical}
                onChange={e => setChemical(e.target.value)}
                required
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Liều lượng *</label>
              <input
                type="text"
                value={dosage}
                onChange={e => setDosage(e.target.value)}
                required
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Người thực hiện *</label>
            <input
              type="text"
              value={executor}
              onChange={e => setExecutor(e.target.value)}
              required
              className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Ghi chú kỹ thuật</label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
            />
          </div>

          <div className="pt-2 flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <span>Lưu & Cập Nhật Chu Kỳ 07 Ngày</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
