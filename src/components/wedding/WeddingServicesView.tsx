import React, { useState } from 'react';
import { 
  Sparkles, 
  Flower2, 
  Camera, 
  Mic2, 
  Car, 
  Sparkle, 
  Mail, 
  CheckCircle2, 
  Phone, 
  Check, 
  Gift, 
  HelpCircle,
  Heart
} from 'lucide-react';
import { WEDDING_REFERENCE_SERVICES, WeddingServiceAddon } from './weddingData';
import { UserRole } from '../../types';

interface WeddingServicesViewProps {
  userRole: UserRole;
  onBookService: (service: WeddingServiceAddon) => void;
}

export const WeddingServicesView: React.FC<WeddingServicesViewProps> = ({
  userRole,
  onBookService,
}) => {
  const [selectedServiceId, setSelectedServiceId] = useState<string>('serv-decor');
  const activeService = WEDDING_REFERENCE_SERVICES.find(s => s.id === selectedServiceId) || WEDDING_REFERENCE_SERVICES[0];

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'decor': return <Flower2 className="w-5 h-5" />;
      case 'camera': return <Camera className="w-5 h-5" />;
      case 'mc': return <Mic2 className="w-5 h-5" />;
      case 'car': return <Car className="w-5 h-5" />;
      case 'dress': return <Sparkle className="w-5 h-5" />;
      case 'invitation': return <Mail className="w-5 h-5" />;
      default: return <Sparkles className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-rose-700 via-rose-800 to-purple-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-rose-100">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Hệ Thống Dịch Vụ Cưới Trọn Gói</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-serif">
            DỊCH VỤ CƯỚI HỎI ĐI KÈM
          </h1>
          <p className="text-xs sm:text-sm text-rose-100/90 max-w-xl">
            Từ hoa tươi nghệ thuật, phóng sự cưới 4K, xe hoa sang trọng đến ban nhạc sống và thiệp cưới điện tử thông minh.
          </p>
        </div>

        <button
          onClick={() => onBookService(activeService)}
          className="px-5 py-3 rounded-2xl bg-white text-rose-800 hover:bg-rose-50 font-black text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Heart className="w-4 h-4 text-rose-600" />
          <span>Đăng Ký {activeService.title}</span>
        </button>
      </div>

      {/* 6 Services Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {WEDDING_REFERENCE_SERVICES.map((serv) => {
          const isSelected = selectedServiceId === serv.id;

          return (
            <div
              key={serv.id}
              onClick={() => setSelectedServiceId(serv.id)}
              className={`rounded-3xl p-6 border-2 transition-all duration-300 flex flex-col justify-between cursor-pointer relative overflow-hidden ${
                isSelected
                  ? 'border-rose-600 bg-white shadow-xl scale-[1.02]'
                  : 'border-slate-200 bg-white/90 hover:border-rose-300 shadow-xs'
              }`}
            >
              <div className="space-y-4">
                {/* Header Icon + Price */}
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-2xl ${serv.bgClass} ${serv.textClass} shadow-xs`}>
                    {getServiceIcon(serv.iconType)}
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black font-mono text-rose-700">{serv.priceFormatted}</div>
                    <div className="text-[10px] text-slate-500">Trọn gói ngày cưới</div>
                  </div>
                </div>

                {/* Title & Short Desc */}
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900 text-base">{serv.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{serv.shortDesc}</p>
                </div>

                {/* Bullets included */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  {serv.includedList.map((inc, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{inc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 mt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onBookService(serv);
                  }}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-rose-600 hover:bg-rose-700 text-white'
                      : 'bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700'
                  }`}
                >
                  <Gift className="w-3.5 h-3.5" />
                  <span>Chọn Dịch Vụ Này</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Featured Service Detail View */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-200 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold">
              {getServiceIcon(activeService.iconType)}
              <span>Dịch Vụ Nổi Bật: {activeService.title}</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 font-serif">
              {activeService.title} — {activeService.priceFormatted}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {activeService.detailDesc}
            </p>

            <div className="space-y-2 pt-2">
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">Hạng mục bao gồm chi tiết:</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activeService.includedList.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 flex items-center gap-2">
                    <Check className="w-4 h-4 text-rose-600 shrink-0 font-bold" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <button
                onClick={() => onBookService(activeService)}
                className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Gift className="w-4 h-4" />
                <span>Thêm Dịch Vụ Vào Đơn Tiệc</span>
              </button>
              <a
                href="tel:0967823801"
                className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>Tư Vấn Miễn Phí</span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-3xl overflow-hidden shadow-lg border border-slate-200 h-80">
              <img
                src={activeService.image}
                alt={activeService.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
