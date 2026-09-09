import React from 'react';
import { FarmCage, FarmArea } from './farmTypes';
import { formatDateVN } from './farmData';
import { 
  ShieldAlert, 
  Activity, 
  Plus, 
  AlertTriangle, 
  Clock, 
  ChevronRight, 
  CheckCircle2, 
  Sparkles,
  Info
} from 'lucide-react';

interface FarmTreatmentViewProps {
  cages: FarmCage[];
  areas: FarmArea[];
  onSelectCage: (cage: FarmCage) => void;
  onOpenAddCage: () => void;
}

export const FarmTreatmentView: React.FC<FarmTreatmentViewProps> = ({
  cages,
  areas,
  onSelectCage,
  onOpenAddCage
}) => {
  // Lấy các Ô thuộc Khu Điều Trị hoặc đang ở trạng thái 'dang_dieu_tri'
  const treatmentCages = cages.filter(c => c.areaKind === 'dieu_tri' || c.status === 'dang_dieu_tri');
  const activeCases = treatmentCages.filter(c => c.status === 'dang_dieu_tri' && c.ratCount > 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Khu Điều Trị */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                <span>Khu Điều Trị & Bệnh Án Thú Y (KHU-DT)</span>
              </h2>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800">
                {activeCases.length} ca đang theo dõi
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Quy chuẩn cách ly, phác đồ điều trị, theo dõi diễn biến và đánh giá 3 hướng (Về Ô cũ, Thương phẩm, Chết)
            </p>
          </div>
        </div>

        {/* Thống kê ca bệnh */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200">
            <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block">CA ĐANG ĐIỀU TRỊ</span>
            <strong className="text-xl font-black text-rose-900 font-mono block">{activeCases.length} Ô</strong>
            <span className="text-[10px] text-rose-600">Đang cách ly</span>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">SỨC CHỨA KHU DT</span>
            <strong className="text-xl font-black text-amber-900 font-mono block">
              {treatmentCages.filter(c => c.areaKind === 'dieu_tri').length} Ô
            </strong>
            <span className="text-[10px] text-amber-600">Chuồng cách ly gạch men</span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">QUY TRÌNH KỸ THUẬT</span>
            <strong className="text-xs font-bold text-emerald-900 block mt-1">Chuẩn thú y Dúi F1</strong>
            <span className="text-[10px] text-emerald-700">Bio-Gut • Kháng sinh thảo dược</span>
          </div>
        </div>

        {/* Danh sách các ca bệnh */}
        <div className="space-y-3 pt-2">
          <h3 className="font-bold text-slate-900 text-xs">Danh Sách Ca Bệnh Đang Cách Ly</h3>

          {activeCases.length === 0 ? (
            <div className="py-10 text-center bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <h4 className="font-bold text-slate-900 text-xs">Hiện Không Có Ca Bệnh Nào Cần Điều Trị</h4>
              <p className="text-slate-500 text-[11px]">Toàn bộ đàn dúi đang duy trì thể trạng khỏe mạnh.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeCases.map((cage) => (
                <div
                  key={cage.id}
                  onClick={() => onSelectCage(cage)}
                  className="p-4 rounded-2xl border border-rose-200 bg-rose-50/30 hover:border-rose-500 hover:shadow-md transition-all cursor-pointer space-y-3 flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center font-mono font-bold text-xs">
                        {cage.code}
                      </div>
                      <div>
                        <strong className="text-xs font-bold text-slate-900 block">Ô {cage.code}</strong>
                        <span className="text-[10px] text-slate-500">Nguồn: Ô {cage.sourceCageCode || '---'} ({cage.sourceAreaCode || ''})</span>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                      Đang điều trị
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-rose-100 space-y-1.5 text-xs text-slate-700">
                    <div>
                      <span className="text-slate-400 text-[10px] block font-bold uppercase">Bệnh lý</span>
                      <strong className="text-rose-900">{cage.treatmentDiseaseType || 'Thú y theo dõi'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block font-bold uppercase">Phác đồ</span>
                      <p className="line-clamp-2 text-[11px] text-slate-600">{cage.treatmentProtocol || 'Nghỉ ngơi, ăn tre già, Bio-Gut'}</p>
                    </div>
                    <div className="pt-1 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>Tái khám: <strong>{formatDateVN(cage.treatmentNextExamDate)}</strong></span>
                      <span>{cage.treatmentFollowups?.length || 0} lần cập nhật</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-rose-100/80 flex items-center justify-between text-[11px] text-rose-700 font-bold">
                    <span>Mở Bệnh Án & Đánh Giá</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
