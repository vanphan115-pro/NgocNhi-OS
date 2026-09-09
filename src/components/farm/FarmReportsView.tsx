import React from 'react';
import { FarmCage, FarmArea, DisinfectionLogItem } from './farmTypes';
import { formatDateVN } from './farmData';
import { 
  BarChart3, 
  TrendingUp, 
  ShieldCheck, 
  PieChart, 
  Scale, 
  Activity,
  CheckCircle2,
  Info,
  Check
} from 'lucide-react';

interface FarmReportsViewProps {
  cages: FarmCage[];
  areas: FarmArea[];
  disinfectionLogs: DisinfectionLogItem[];
}

export const FarmReportsView: React.FC<FarmReportsViewProps> = ({
  cages,
  areas,
  disinfectionLogs
}) => {
  const totalCages = cages.length;
  const occupiedCages = cages.filter(c => c.ratCount > 0).length;
  const totalRats = cages.reduce((sum, c) => sum + c.ratCount, 0);

  // Tỷ lệ sinh sản
  const breedingCages = cages.filter(c => c.areaKind === 'sinh_san');
  const matingCount = breedingCages.filter(c => c.status === 'ghep_doi').length;
  const nursingCount = breedingCages.filter(c => c.status === 'dang_nuoi_con').length;
  const weanedCount = breedingCages.filter(c => c.status === 'moi_tach_con').length;

  // Thống kê chi tiết Dúi Baby theo nhóm trọng lượng
  const nursingMothersCages = cages.filter(c => c.status === 'dang_nuoi_con' && c.status !== 'trong');
  const nursingPupsCount = nursingMothersCages.reduce((sum, c) => sum + (c.livingBabyCount ?? c.totalBornCount ?? (c.ratCount || 0)), 0);

  const babyAreaCages = cages.filter(c => c.areaKind === 'baby' && c.status !== 'trong');
  const baby34Cages = babyAreaCages.filter(c => c.babyGroup === '3_4_lang' || ((c.currentWeightKg || 0) > 0 && (c.currentWeightKg || 0) <= 0.45));
  const baby34Count = baby34Cages.reduce((sum, c) => sum + (c.ratCount || 1), 0);

  const baby57Cages = babyAreaCages.filter(c => c.babyGroup === '5_7_lang' || ((c.currentWeightKg || 0) > 0.45 && (c.currentWeightKg || 0) <= 0.75));
  const baby57Count = baby57Cages.reduce((sum, c) => sum + (c.ratCount || 1), 0);

  const baby811Cages = babyAreaCages.filter(c => c.babyGroup === '8_lang_1_1_kg' || (c.currentWeightKg || 0) > 0.75);
  const baby811Count = baby811Cages.reduce((sum, c) => sum + (c.ratCount || 1), 0);

  const totalAllBabies = nursingPupsCount + baby34Count + baby57Count + baby811Count;

  // Thống kê chi tiết Dúi Hậu Bị (Đực & Cái)
  const hauBiAreaCages = cages.filter(c => c.areaKind === 'hau_bi' && c.status !== 'trong');
  const hauBiMaleCages = hauBiAreaCages.filter(c => c.gender === 'duc');
  const hauBiFemaleCages = hauBiAreaCages.filter(c => c.gender === 'cai' || !c.gender);

  const hauBiMaleCount = hauBiMaleCages.reduce((sum, c) => sum + (c.ratCount || 1), 0);
  const hauBiFemaleCount = hauBiFemaleCages.reduce((sum, c) => sum + (c.ratCount || 1), 0);
  const totalHauBiCount = hauBiMaleCount + hauBiFemaleCount;

  const hauBiReadyCages = hauBiAreaCages.filter(c => 
    c.status === 'dat_dieu_kien' || 
    c.hauBiPassed === true || 
    (c.gender === 'duc' ? ((c.currentWeightKg || 0) >= 2.0) : ((c.currentWeightKg || 0) >= 1.8))
  );
  const hauBiReadyCount = hauBiReadyCages.reduce((sum, c) => sum + (c.ratCount || 1), 0);

  const hauBiGrowingCages = hauBiAreaCages.filter(c => !hauBiReadyCages.includes(c));
  const hauBiGrowingCount = hauBiGrowingCages.reduce((sum, c) => sum + (c.ratCount || 1), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-6">
        <div className="pb-3 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            <span>Báo Cáo Tổng Hợp & Chỉ Số Kỹ Thuật</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Phân tích số liệu vận hành, cơ cấu đàn baby theo trọng lượng, phân định đực/cái đàn hậu bị và an toàn sinh học
          </p>
        </div>

        {/* 5 Thẻ chỉ số tổng quan */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
            <span className="text-[10px] font-bold text-emerald-800 uppercase block">TỔNG ĐÀN HIỆN TẠI</span>
            <strong className="text-2xl font-black text-emerald-900 font-mono block">{totalRats}</strong>
            <span className="text-[10px] text-emerald-700">Cá thể sinh trưởng</span>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
            <span className="text-[10px] font-bold text-blue-800 uppercase block">TỶ LỆ LẤP ĐẦY</span>
            <strong className="text-2xl font-black text-blue-900 font-mono block">
              {totalCages > 0 ? Math.round((occupiedCages / totalCages) * 100) : 0}%
            </strong>
            <span className="text-[10px] text-blue-700">{occupiedCages}/{totalCages} Ô hoạt động</span>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200">
            <span className="text-[10px] font-bold text-purple-800 uppercase block">ĐANG PHỐI GIỐNG</span>
            <strong className="text-2xl font-black text-purple-900 font-mono block">{matingCount} Cặp</strong>
            <span className="text-[10px] text-purple-700">Chu kỳ ghép 20 ngày</span>
          </div>

          <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200">
            <span className="text-[10px] font-bold text-sky-800 uppercase block">ĐÀN DÚI BABY</span>
            <strong className="text-2xl font-black text-sky-900 font-mono block">{totalAllBabies} Con</strong>
            <span className="text-[10px] text-sky-700">4 Nhóm trọng lượng</span>
          </div>

          <div className="p-4 rounded-2xl bg-fuchsia-50 border border-fuchsia-200">
            <span className="text-[10px] font-bold text-fuchsia-900 uppercase block">ĐÀN HẬU BỊ</span>
            <strong className="text-2xl font-black text-fuchsia-950 font-mono block">{totalHauBiCount} Con</strong>
            <span className="text-[10px] text-fuchsia-800 font-semibold">♂ {hauBiMaleCount} Đực • ♀ {hauBiFemaleCount} Cái</span>
          </div>
        </div>

        {/* THỐNG KÊ CHI TIẾT CƠ CẤU ĐÀN DÚI BABY THEO TRỌNG LƯỢNG NGHIỆP VỤ */}
        <div className="p-5 rounded-2xl bg-sky-50/50 border border-sky-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-sky-100">
            <div>
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-2 uppercase tracking-tight">
                <span>🍼</span>
                <span>Phân Bổ Chi Tiết Đàn Dúi Baby Theo Trọng Lượng Nghiệp Vụ</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Bóc tách chi tiết từng nhóm tuổi, trọng lượng kỹ thuật và chế độ chăm sóc
              </p>
            </div>
            <span className="text-xs font-bold text-sky-800 bg-sky-100 px-3 py-1 rounded-full font-mono">
              Tổng {totalAllBabies} Cá Thể Baby
            </span>
          </div>

          {/* 4 Nhóm Baby */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3.5 bg-white rounded-xl border border-sky-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <strong className="text-xs font-bold text-sky-800 flex items-center gap-1">
                  <span>🍼</span>
                  <span>Bú Mẹ (&lt; 3 Lạng)</span>
                </strong>
                <span className="text-xs font-black text-sky-900 font-mono">{nursingPupsCount} con</span>
              </div>
              <div className="text-[11px] text-slate-500">
                • Ô mẹ sinh sản: <strong>{nursingMothersCages.length} ổ</strong><br />
                • Trọng lượng: <strong>&lt; 0.30 kg</strong><br />
                • Tách con: <strong>Ngày thứ 45</strong>
              </div>
            </div>

            <div className="p-3.5 bg-white rounded-xl border border-teal-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <strong className="text-xs font-bold text-teal-800 flex items-center gap-1">
                  <span>🥗</span>
                  <span>Baby 3 – 4 Lạng</span>
                </strong>
                <span className="text-xs font-black text-teal-900 font-mono">{baby34Count} con</span>
              </div>
              <div className="text-[11px] text-slate-500">
                • Ô chuồng nuôi: <strong>{baby34Cages.length} ô</strong><br />
                • Trọng lượng: <strong>0.30 – 0.45 kg</strong><br />
                • Thức ăn: <strong>Mía mềm, tre non, men</strong>
              </div>
            </div>

            <div className="p-3.5 bg-white rounded-xl border border-blue-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <strong className="text-xs font-bold text-blue-800 flex items-center gap-1">
                  <span>🎋</span>
                  <span>Baby 5 – 7 Lạng</span>
                </strong>
                <span className="text-xs font-black text-blue-900 font-mono">{baby57Count} con</span>
              </div>
              <div className="text-[11px] text-slate-500">
                • Ô chuồng nuôi: <strong>{baby57Cages.length} ô</strong><br />
                • Trọng lượng: <strong>0.50 – 0.75 kg</strong><br />
                • Giai đoạn: <strong>Phát triển khung xương</strong>
              </div>
            </div>

            <div className="p-3.5 bg-white rounded-xl border border-indigo-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <strong className="text-xs font-bold text-indigo-900 flex items-center gap-1">
                  <span>⚖️</span>
                  <span>8 Lạng – 1,1 Kg</span>
                </strong>
                <span className="text-xs font-black text-indigo-900 font-mono">{baby811Count} con</span>
              </div>
              <div className="text-[11px] text-slate-500">
                • Ô chuồng nuôi: <strong>{baby811Cages.length} ô</strong><br />
                • Trọng lượng: <strong>0.80 – 1.10 kg</strong><br />
                • Mục tiêu: <strong>Tuyển Hậu bị / Thương phẩm</strong>
              </div>
            </div>
          </div>
        </div>

        {/* THỐNG KÊ CHI TIẾT CƠ CẤU ĐÀN DÚI HẬU BỊ THEO GIỚI TÍNH & TIÊU CHUẨN SINH SẢN */}
        <div className="p-5 rounded-2xl bg-purple-50/50 border border-purple-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-purple-100">
            <div>
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-2 uppercase tracking-tight">
                <span>🌟</span>
                <span>Phân Bổ Chi Tiết Đàn Dúi Hậu Bị (Phân Định Đực & Cái)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Cập nhật tự động toàn trại: Theo dõi cá thể đực/cái chuẩn gen, tỷ lệ phối lứa đầu và chuẩn bị ghép đàn
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-purple-900 bg-purple-100 px-3 py-1 rounded-full font-mono">
                Tổng {totalHauBiCount} Con
              </span>
              <span className="text-xs font-bold text-blue-800 bg-blue-100 px-2.5 py-1 rounded-full font-mono">
                ♂ {hauBiMaleCount} Đực
              </span>
              <span className="text-xs font-bold text-pink-800 bg-pink-100 px-2.5 py-1 rounded-full font-mono">
                ♀ {hauBiFemaleCount} Cái
              </span>
            </div>
          </div>

          {/* 4 Nhóm Hậu Bị */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3.5 bg-white rounded-xl border border-blue-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <strong className="text-xs font-bold text-blue-800 flex items-center gap-1">
                  <span>♂</span>
                  <span>Hậu Bị Đực Tuyển</span>
                </strong>
                <span className="text-xs font-black text-blue-900 font-mono">{hauBiMaleCount} con</span>
              </div>
              <div className="text-[11px] text-slate-500">
                • Ô chuồng nuôi: <strong>{hauBiMaleCages.length} ô</strong><br />
                • Đạt chuẩn ghép (≥2kg): <strong>{hauBiMaleCages.filter(c => c.status === 'dat_dieu_kien' || ((c.currentWeightKg || 0) >= 2.0)).length} con</strong><br />
                • Độ tuổi: <strong>8 – 10 tháng tuổi</strong>
              </div>
            </div>

            <div className="p-3.5 bg-white rounded-xl border border-pink-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <strong className="text-xs font-bold text-pink-800 flex items-center gap-1">
                  <span>♀</span>
                  <span>Hậu Bị Cái Tuyển</span>
                </strong>
                <span className="text-xs font-black text-pink-900 font-mono">{hauBiFemaleCount} con</span>
              </div>
              <div className="text-[11px] text-slate-500">
                • Ô chuồng nuôi: <strong>{hauBiFemaleCages.length} ô</strong><br />
                • Đạt chuẩn ghép (≥1.8kg): <strong>{hauBiFemaleCages.filter(c => c.status === 'dat_dieu_kien' || ((c.currentWeightKg || 0) >= 1.8)).length} con</strong><br />
                • Ngoại hình: <strong>8–10 núm vú đều, hông rộng</strong>
              </div>
            </div>

            <div className="p-3.5 bg-white rounded-xl border border-emerald-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <strong className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                  <span>★</span>
                  <span>Đạt Chuẩn Ghép Giống</span>
                </strong>
                <span className="text-xs font-black text-emerald-900 font-mono">{hauBiReadyCount} con</span>
              </div>
              <div className="text-[11px] text-slate-500">
                • Tỷ lệ giới tính: <strong>♂ {hauBiReadyCages.filter(c => c.gender === 'duc').reduce((s,c)=>s+(c.ratCount||1),0)} • ♀ {hauBiReadyCages.filter(c => c.gender !== 'duc').reduce((s,c)=>s+(c.ratCount||1),0)}</strong><br />
                • Trạng thái: <strong>Sẵn sàng chuyển sinh sản</strong><br />
                • Tỷ lệ ghép khuyến nghị: <strong>1 đực : 3-4 cái</strong>
              </div>
            </div>

            <div className="p-3.5 bg-white rounded-xl border border-purple-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <strong className="text-xs font-bold text-purple-900 flex items-center gap-1">
                  <span>⏳</span>
                  <span>Đang Nuôi Dưỡng</span>
                </strong>
                <span className="text-xs font-black text-purple-900 font-mono">{hauBiGrowingCount} con</span>
              </div>
              <div className="text-[11px] text-slate-500">
                • Ô chuồng nuôi: <strong>{hauBiGrowingCages.length} ô</strong><br />
                • Đánh giá tăng trọng: <strong>15 ngày/lần</strong><br />
                • Chế độ: <strong>Tăng cường đạm & canxi</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Lịch sử phun khử trùng */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Nhật Ký An Toàn Sinh Học & Tiêu Độc Khử Trùng (07 Ngày)</span>
            </h3>
            <span className="text-[10px] text-slate-500">Chu kỳ 07 ngày/lần (trùng lịch vệ sinh)</span>
          </div>

          {disinfectionLogs.length === 0 ? (
            <p className="text-slate-400 italic text-xs">Chưa có bản ghi phun khử trùng nào.</p>
          ) : (
            <div className="space-y-2">
              {disinfectionLogs.map(log => (
                <div key={log.id} className="p-3 rounded-xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <strong className="text-slate-800 block">{log.areaName}</strong>
                    <span className="text-slate-500 text-[11px]">Hóa chất: <strong>{log.chemical}</strong> ({log.dosage}) • {log.notes}</span>
                  </div>
                  <div className="text-right font-mono text-[10px] text-slate-400">
                    <div>{formatDateVN(log.date)}</div>
                    <div>Thực hiện: {log.executor}</div>
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
