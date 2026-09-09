import React from 'react';
import { SYSTEM_INFO, MANAGERS } from '../data/initialData';
import { AppView, UserRole } from '../types';
import { MapPin, Phone, ShieldCheck, UtensilsCrossed, Sparkles, LayoutDashboard, Clock, ExternalLink } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: AppView) => void;
  userRole?: UserRole;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, userRole }) => {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-300 pt-16 pb-12 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Column 1: Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 font-serif font-black text-xl shadow-md">
                NN
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-white uppercase tracking-wide">
                  {SYSTEM_INFO.name}
                </h3>
                <p className="text-xs text-amber-400 font-medium">Nền Tảng Dịch Vụ Tổng Thể</p>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-slate-400">
              {SYSTEM_INFO.description}
            </p>

            <div className="pt-2 text-xs space-y-2 text-slate-300">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{SYSTEM_INFO.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Mở cửa: 08:00 - 22:30 hàng ngày</span>
              </div>
            </div>
          </div>

          {/* Column 2: Management Team */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white border-b border-slate-800 pb-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Ban Quản Lý Trực Tiếp</span>
            </h4>

            {/* Dũng Kaka */}
            <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-emerald-500/30">
              <div className="text-xs font-bold text-emerald-400">{MANAGERS.dungKaka.name}</div>
              <div className="text-[11px] text-slate-400 mb-1.5">{MANAGERS.dungKaka.title}</div>
              <div className="space-y-1 text-xs">
                {MANAGERS.dungKaka.phones.map((phone) => (
                  <a
                    key={phone}
                    href={`tel:${phone}`}
                    className="flex items-center gap-1.5 text-slate-300 hover:text-emerald-300 font-mono"
                  >
                    <Phone className="w-3 h-3 text-emerald-400" />
                    <span>{phone}</span>
                  </a>
                ))}
              </div>
              <div className="mt-1.5 text-[10px] text-slate-500 italic">
                * Cả hai số điện thoại thuộc cùng một người: Dũng Kaka
              </div>
            </div>

            {/* Ngọc Nhi */}
            <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-rose-500/30">
              <div className="text-xs font-bold text-rose-400">{MANAGERS.ngocNhi.name}</div>
              <div className="text-[11px] text-slate-400 mb-1.5">{MANAGERS.ngocNhi.title}</div>
              <div className="text-xs">
                <a
                  href={`tel:${MANAGERS.ngocNhi.phones[0]}`}
                  className="flex items-center gap-1.5 text-slate-300 hover:text-rose-300 font-mono"
                >
                  <Phone className="w-3 h-3 text-rose-400" />
                  <span>{MANAGERS.ngocNhi.phones[0]}</span>
                </a>
              </div>
            </div>
          </div>

          {/* Column 3: Ecosystem Navigation */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white border-b border-slate-800 pb-2">
              Các Phân Hệ Chính
            </h4>

            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('farm')}
                  className="flex items-center gap-2 text-slate-300 hover:text-emerald-400 transition-colors w-full text-left"
                >
                  <span className="text-xs">🦔</span>
                  <span>Trang Trại Dúi KaKa (5 Phân Khu)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('restaurant')}
                  className="flex items-center gap-2 text-slate-300 hover:text-amber-400 transition-colors w-full text-left"
                >
                  <UtensilsCrossed className="w-3.5 h-3.5 text-amber-400" />
                  <span>Quán Ăn Ngọc Nhi (Ẩm thực & Đặt bàn)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('wedding')}
                  className="flex items-center gap-2 text-slate-300 hover:text-rose-400 transition-colors w-full text-left"
                >
                  <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                  <span>Dịch Vụ Tiệc Cưới & Hội Nghị</span>
                </button>
              </li>
              {userRole === 'admin' && (
                <li>
                  <button
                    onClick={() => onNavigate('operations')}
                    className="flex items-center gap-2 text-slate-300 hover:text-indigo-400 transition-colors w-full text-left"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Trung Tâm Điều Hành Toàn Hệ Thống</span>
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Column 4: Architectural Notes & Compliance */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white border-b border-slate-800 pb-2">
              Chuẩn Tích Hợp Hệ Thống
            </h4>

            <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700/80 text-xs text-slate-400 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <span>Dự Án Ngọc Nhi</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-300">
                Hệ thống dịch vụ thống nhất: Quán Ăn Đặc Sản và Dịch Vụ Tiệc Cưới được quản trị và điều phối tập trung với luồng đặt hẹn, xử lý đơn hàng và phục vụ chuyên nghiệp.
              </p>
              <div className="pt-2 border-t border-slate-700 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>Phiên bản: 1.0.0</span>
                <span className="text-emerald-400 font-sans font-bold">Đồng bộ 2026</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright & status bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <div>
            © 2026 <span className="text-white font-medium">{SYSTEM_INFO.name}</span>. Tất cả các quyền được bảo lưu.
          </div>
          <div className="flex items-center gap-4">
            <span>Địa chỉ: KP 9, P. Lộc Ninh, TP. Đồng Nai</span>
            <span>•</span>
            <span className="text-amber-400 font-medium">Hotline: 0967823801 / 0969310601</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
