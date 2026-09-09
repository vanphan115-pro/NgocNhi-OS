import React from 'react';
import { 
  Gift, 
  Sparkles, 
  Tag, 
  Clock, 
  CheckCircle2, 
  Copy, 
  Check, 
  Phone,
  Heart 
} from 'lucide-react';
import { WEDDING_REFERENCE_PROMOTIONS, WeddingPromotionItem } from './weddingData';
import { UserRole } from '../../types';

interface WeddingPromotionsViewProps {
  userRole: UserRole;
  onSelectPromo: (promo: WeddingPromotionItem) => void;
}

export const WeddingPromotionsView: React.FC<WeddingPromotionsViewProps> = ({
  userRole,
  onSelectPromo,
}) => {
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-rose-600 via-rose-700 to-amber-600 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-rose-100">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Chương Trình Ưu Đãi Mùa Cưới 2026</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-serif">
            KHUYẾN MÃI & QUÀ TẶNG CƯỚI
          </h1>
          <p className="text-xs sm:text-sm text-rose-100/90 max-w-xl">
            Tận hưởng trọn vẹn các gói ưu đãi giảm giá đến 5%, tặng xe hoa Mercedes và tặng bàn dùng thử miễn phí.
          </p>
        </div>

        <a
          href="tel:0967823801"
          className="px-5 py-3 rounded-2xl bg-white text-rose-800 hover:bg-rose-50 font-black text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Phone className="w-4 h-4 text-emerald-600" />
          <span>Hotline: 0967 823 801</span>
        </a>
      </div>

      {/* Promotions List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {WEDDING_REFERENCE_PROMOTIONS.map((promo) => (
          <div
            key={promo.id}
            className="rounded-3xl bg-white border border-rose-200 overflow-hidden shadow-xs hover:shadow-xl transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="relative h-48 overflow-hidden bg-rose-50">
                <img
                  src={promo.image}
                  alt={promo.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-black bg-rose-600 text-white shadow-md">
                  {promo.tag}
                </span>
                <span className="absolute bottom-3 right-3 px-3 py-1 rounded-xl text-xs font-black bg-white/95 text-rose-700 shadow-md backdrop-blur-xs">
                  {promo.discount}
                </span>
              </div>

              <div className="p-5 space-y-3">
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900 text-lg group-hover:text-rose-700 transition-colors">
                    {promo.title}
                  </h3>
                  <div className="text-xs font-semibold text-rose-600">{promo.condition}</div>
                  <div className="text-[11px] text-slate-400">{promo.expiry}</div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {promo.description}
                </p>

                {/* Promo Code Box */}
                <div className="p-3 rounded-2xl bg-rose-50/70 border border-rose-200 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Mã Voucher</div>
                    <div className="font-mono font-black text-rose-800 text-sm tracking-wider">{promo.code}</div>
                  </div>

                  <button
                    onClick={() => handleCopy(promo.code)}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-rose-100 border border-rose-300 text-rose-700 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {copiedCode === promo.code ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Đã chép</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Sao chép</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="p-5 pt-0 border-t border-slate-100">
              <button
                onClick={() => onSelectPromo(promo)}
                className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Gift className="w-3.5 h-3.5" />
                <span>Áp Dụng Ưu Đãi Này</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
