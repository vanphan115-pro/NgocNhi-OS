import React, { useState } from 'react';
import { 
  Sparkles, 
  Crown, 
  Star, 
  Gem, 
  Check, 
  CheckCircle2, 
  Phone, 
  Calendar, 
  Users, 
  Heart,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  Gift
} from 'lucide-react';
import { WEDDING_REFERENCE_PACKAGES, WeddingPackageItem } from './weddingData';
import { UserRole } from '../../types';

interface WeddingPackagesViewProps {
  userRole: UserRole;
  onSelectPackageForBooking: (pkg: WeddingPackageItem) => void;
}

export const WeddingPackagesView: React.FC<WeddingPackagesViewProps> = ({
  userRole,
  onSelectPackageForBooking,
}) => {
  const [activePkgId, setActivePkgId] = useState<string>('pkg-standard');
  const selectedPkg = WEDDING_REFERENCE_PACKAGES.find(p => p.id === activePkgId) || WEDDING_REFERENCE_PACKAGES[1];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-rose-600 via-rose-700 to-rose-800 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-rose-100">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Thực Đơn Mâm Cỗ & Dịch Vụ Trọn Gói 2026</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-serif">
            CÁC GÓI TIỆC CƯỚI NGỌC NHI
          </h1>
          <p className="text-xs sm:text-sm text-rose-100/90 max-w-xl">
            Tất cả các gói tiệc đều được Giám đốc Ngọc Nhi thiết kế trọn gói từ sảnh tiệc, trang trí hoa tươi, âm thanh ánh sáng đến thực đơn mâm cỗ cao cấp.
          </p>
        </div>

        <div className="shrink-0">
          <button
            onClick={() => onSelectPackageForBooking(selectedPkg)}
            className="px-5 py-3 rounded-2xl bg-white text-rose-800 hover:bg-rose-50 font-black text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer"
          >
            <Heart className="w-4 h-4 text-rose-600" />
            <span>Đặt Gói Này Ngay</span>
          </button>
        </div>
      </div>

      {/* 3 Main Package Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {WEDDING_REFERENCE_PACKAGES.map((pkg) => {
          const isSelected = activePkgId === pkg.id;
          const isEconomy = pkg.id === 'pkg-economy';
          const isStandard = pkg.id === 'pkg-standard';
          const isLuxury = pkg.id === 'pkg-luxury';

          return (
            <div
              key={pkg.id}
              onClick={() => setActivePkgId(pkg.id)}
              className={`rounded-3xl p-6 border-2 transition-all duration-300 flex flex-col justify-between cursor-pointer relative overflow-hidden ${
                isSelected
                  ? 'border-rose-600 bg-white shadow-xl scale-[1.02]'
                  : 'border-slate-200 bg-white/80 hover:border-rose-300 shadow-xs'
              }`}
            >
              {isSelected && (
                <div className="absolute top-0 right-0 bg-rose-600 text-white px-3 py-1 rounded-bl-xl text-[10px] font-black uppercase tracking-wider">
                  Đang chọn
                </div>
              )}

              <div className="space-y-4">
                {/* Top Badge & Icon */}
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md ${
                      isEconomy
                        ? 'bg-emerald-500'
                        : isStandard
                        ? 'bg-sky-500'
                        : 'bg-rose-600'
                    }`}
                  >
                    {isEconomy && <Crown className="w-5 h-5" />}
                    {isStandard && <Star className="w-5 h-5" />}
                    {isLuxury && <Gem className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">{pkg.name}</h3>
                    <span className="text-xs font-semibold text-slate-500">{pkg.tablesRecommended}</span>
                  </div>
                </div>

                {/* Price Display */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="text-2xl font-black font-mono text-rose-700">
                    {pkg.priceFormatted}
                    <span className="text-xs font-normal text-slate-500 ml-1">/ Bàn (10 khách)</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{pkg.description}</div>
                </div>

                {/* Highlights */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">Đặc quyền nổi bật:</div>
                  {pkg.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-6 mt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectPackageForBooking(pkg);
                  }}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-rose-600 hover:bg-rose-700 text-white'
                      : 'bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700'
                  }`}
                >
                  <Gift className="w-3.5 h-3.5" />
                  <span>Đăng ký nhận báo giá gói này</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed View of Active Package */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 pb-5 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 uppercase tracking-wider mb-1">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>CHI TIẾT THỰC ĐƠN & QUYỀN LỢI</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 font-serif">
              {selectedPkg.name} — {selectedPkg.priceFormatted}/bàn
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="tel:0967823801"
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span>0967 823 801</span>
            </a>
            <button
              onClick={() => onSelectPackageForBooking(selectedPkg)}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Giữ ngày & Đặt gói này</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Menu Dishes in this package */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
              <span>Thực Đơn Mâm Cỗ Tiệc ({selectedPkg.menuDishes.length} Món):</span>
            </h3>
            <div className="space-y-2.5">
              {selectedPkg.menuDishes.map((dish, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-rose-50/50 border border-rose-100 flex items-start gap-3 text-xs text-slate-800"
                >
                  <span className="w-5 h-5 rounded-full bg-rose-200 text-rose-800 font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div className="font-medium leading-relaxed">{dish}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Included Services & Amenities */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span>Dịch Vụ & Trang Thiết Bị Đi Kèm:</span>
            </h3>
            <div className="space-y-2.5">
              {selectedPkg.addons.map((addon, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs text-slate-800"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="font-medium leading-relaxed">{addon}</div>
                </div>
              ))}
            </div>

            {/* Special Gift Guarantee */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-rose-50 border border-amber-200 space-y-1.5 mt-4">
              <div className="font-bold text-amber-900 text-xs flex items-center gap-1.5">
                <Gift className="w-4 h-4 text-amber-600" />
                <span>Cam Kết Chất Lượng Ngọc Nhi</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Được đổi món trong cùng nhóm thực đơn miễn phí. Tặng kèm 01 bàn tiệc ăn thử khi đặt tiệc từ 20 bàn trở lên.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
