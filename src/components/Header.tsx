import React, { useState } from 'react';
import { AppView, UserRole } from '../types';
import { SYSTEM_INFO, MANAGERS } from '../data/initialData';
import { 
  Building2, 
  UtensilsCrossed, 
  Sparkles, 
  LayoutDashboard, 
  Phone, 
  ShieldCheck, 
  User, 
  Search, 
  Menu, 
  X, 
  ChevronDown,
  MapPin, 
  Clock, 
  ExternalLink, 
  Crown,
  KeyRound,
  Settings,
  Bell,
  QrCode
} from 'lucide-react';
import { AdminNotificationMenu } from './AdminNotificationMenu';
import { AdminAlertPayload } from '../utils/notificationSound';

interface HeaderProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  userRole: UserRole;
  onToggleRole: (role: UserRole) => void;
  onOpenLookupModal: () => void;
  onOpenAdminLogin?: (reason?: string) => void;
  onOpenSystemQR?: () => void;
  pendingBookingsCount: number;
  pendingWeddingCount: number;
  notifications?: AdminAlertPayload[];
  onClearNotifications?: () => void;
  onMarkNotificationRead?: (id: string) => void;
  onMarkAllNotificationsRead?: () => void;
  isOnlineConnected?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  userRole,
  onToggleRole,
  onOpenLookupModal,
  onOpenAdminLogin,
  onOpenSystemQR,
  pendingBookingsCount,
  pendingWeddingCount,
  notifications = [],
  onClearNotifications = () => {},
  onMarkNotificationRead = () => {},
  onMarkAllNotificationsRead = () => {},
  isOnlineConnected = true,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contactsDropdownOpen, setContactsDropdownOpen] = useState(false);

  const handleAdminToggle = () => {
    if (userRole !== 'admin') {
      if (onOpenAdminLogin) {
        onOpenAdminLogin('Vui lòng đăng nhập để truy cập quyền Quản Trị');
      } else {
        onToggleRole('admin');
      }
    } else {
      onToggleRole('guest');
    }
  };

  const navItems: { id: AppView; label: string; icon: React.ReactNode; badge?: string; count?: number; color: string }[] = [
    {
      id: 'portal',
      label: 'Tổng Quan Hệ Thống',
      icon: <Building2 className="w-4 h-4" />,
      color: 'amber'
    },
    {
      id: 'farm',
      label: 'Trang Trại Dúi KaKa',
      icon: <span className="text-sm">🦔</span>,
      badge: 'Nông Nghiệp',
      color: 'emerald'
    },
    {
      id: 'restaurant',
      label: 'Quán Ăn Ngọc Nhi',
      icon: <UtensilsCrossed className="w-4 h-4 text-amber-600" />,
      count: userRole === 'admin' ? pendingBookingsCount : undefined,
      color: 'amber'
    },
    {
      id: 'wedding',
      label: 'Dịch Vụ Tiệc Cưới',
      icon: <Sparkles className="w-4 h-4 text-rose-600" />,
      count: userRole === 'admin' ? pendingWeddingCount : undefined,
      color: 'rose'
    },
    ...(userRole === 'admin' ? [{
      id: 'operations' as AppView,
      label: 'Trung Tâm Điều Hành',
      icon: <LayoutDashboard className="w-4 h-4 text-indigo-600" />,
      badge: 'Quản Trị',
      color: 'indigo'
    }] : [])
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-sm transition-all">
      {/* Top Banner with Address & Emergency Contacts */}
      <div className="hidden lg:flex items-center justify-between px-6 py-2 bg-slate-900 text-xs text-slate-300 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-amber-400 font-medium">
            <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            {SYSTEM_INFO.address}
          </span>
          <span className="text-slate-600">|</span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            Giờ phục vụ: 08:00 - 22:30 (Mở cửa tất cả các ngày trong tuần)
          </span>
        </div>

        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Quản trị viên:</span>
            <span className="text-emerald-400 font-semibold">{MANAGERS.dungKaka.name}</span>
            <a href={`tel:${MANAGERS.dungKaka.phones[0]}`} className="text-slate-300 hover:text-white font-mono">
              ({MANAGERS.dungKaka.phones[0]})
            </a>
          </div>
          <span className="text-slate-700">•</span>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Giám đốc:</span>
            <span className="text-rose-400 font-semibold">{MANAGERS.ngocNhi.name}</span>
            <a href={`tel:${MANAGERS.ngocNhi.phones[0]}`} className="text-slate-300 hover:text-white font-mono">
              ({MANAGERS.ngocNhi.phones[0]})
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand Identity */}
          <div 
            onClick={() => onNavigate('portal')}
            className="flex items-center gap-3.5 cursor-pointer group select-none"
            id="brand-logo-button"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-600 to-amber-700 p-0.5 shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform duration-200">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                <span className="font-serif text-2xl font-black bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 bg-clip-text text-transparent">
                  NN
                </span>
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-serif text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-amber-700 transition-colors">
                  HỆ THỐNG DỊCH VỤ NGỌC NHI
                </span>
                <span className="hidden xl:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                  Đồng Nai
                </span>
                <span 
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                    isOnlineConnected 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                      : 'bg-amber-50 text-amber-700 border-amber-300'
                  }`}
                  title={isOnlineConnected ? 'Firebase Realtime Database đang đồng bộ thời gian thực đa thiết bị' : 'Đang kết nối lại Database Online'}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isOnlineConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                  <span className="hidden sm:inline">{isOnlineConnected ? 'Cloud Online' : 'Kết nối...'}</span>
                </span>
              </div>
              <span className="text-[11px] text-slate-700 font-medium tracking-wide">
                {userRole === 'admin' 
                  ? 'Quán Ăn Đặc Sản • Tiệc Cưới Trọn Gói • Trung Tâm Điều Hành'
                  : 'Quán Ăn Đặc Sản • Tiệc Cưới Trọn Gói • Nông Nghiệp KaKa'}
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5">
            {navItems.map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`relative flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25 font-bold'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  id={`nav-link-${item.id}`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>

                  {item.badge && (
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                      isActive 
                        ? 'bg-white/20 text-white' 
                        : 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                    }`}>
                      {item.badge}
                    </span>
                  )}

                  {item.count !== undefined && item.count > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-600 text-white animate-bounce">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Desktop Right Actions: Thông Báo, Tra cứu, Ban Quản Lý, Switch Role */}
          <div className="hidden lg:flex items-center gap-2.5">
            {/* Real-time Admin Notification Bell */}
            <AdminNotificationMenu
              userRole={userRole}
              notifications={notifications}
              onNavigate={onNavigate}
              onClearAll={onClearNotifications}
              onMarkRead={onMarkNotificationRead}
              onMarkAllRead={onMarkAllNotificationsRead}
            />

            {/* Mã QR Hệ Thống (Cả Khách & Admin đều thấy) */}
            {onOpenSystemQR && (
              <button
                onClick={onOpenSystemQR}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200 text-amber-900 border border-amber-300 shadow-2xs transition-all hover:scale-[1.02] cursor-pointer"
                title="Xem & in mã QR Tổng của toàn bộ Hệ thống Dịch vụ Ngọc Nhi"
                id="header-system-qr-button"
              >
                <QrCode className="w-3.5 h-3.5 text-amber-700" />
                <span>QR Hệ Thống</span>
              </button>
            )}

            {/* Tra Cứu Mã Đặt Nhanh */}
            <button
              onClick={onOpenLookupModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-amber-50 hover:text-amber-800 text-slate-700 border border-slate-200 transition-colors shadow-xs"
              title="Tra cứu phiếu đặt bàn hoặc tiệc cưới bằng mã hoặc SĐT"
              id="header-lookup-button"
            >
              <Search className="w-3.5 h-3.5 text-amber-600" />
              <span>Tra Cứu Phiếu Đặt</span>
            </button>

            {/* Switch User Role Toggle */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200">
              <button
                onClick={() => onToggleRole('guest')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  userRole === 'guest'
                    ? 'bg-white text-slate-900 font-bold shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Khách
              </button>
              <button
                onClick={handleAdminToggle}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  userRole === 'admin'
                    ? 'bg-slate-900 text-amber-400 font-bold shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title={userRole === 'admin' ? 'Nhấn để chuyển về Khách hoặc Đổi Mật Khẩu' : 'Đăng nhập Quản Trị'}
              >
                <Crown className="w-3 h-3 text-amber-400" />
                <span>Quản Trị</span>
              </button>

              {userRole === 'admin' && onOpenAdminLogin && (
                <button
                  onClick={() => onOpenAdminLogin('Đổi tên đăng nhập & mật khẩu quản trị')}
                  className="p-1 text-slate-400 hover:text-amber-600 ml-0.5 rounded-lg hover:bg-slate-200 transition-colors"
                  title="Cài đặt tài khoản & đổi mật khẩu quản trị"
                >
                  <Settings className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Mobile Menu, Notifications & Lookup Buttons */}
          <div className="flex items-center gap-1.5 lg:hidden">
            <AdminNotificationMenu
              userRole={userRole}
              notifications={notifications}
              onNavigate={onNavigate}
              onClearAll={onClearNotifications}
              onMarkRead={onMarkNotificationRead}
              onMarkAllRead={onMarkAllNotificationsRead}
            />

            {onOpenSystemQR && (
              <button
                onClick={onOpenSystemQR}
                className="p-2 rounded-xl bg-amber-50 border border-amber-300 text-amber-800 hover:bg-amber-100 cursor-pointer shadow-2xs"
                title="Xem & in mã QR Hệ Thống"
                id="header-mobile-system-qr-button"
              >
                <QrCode className="w-4 h-4 text-amber-700" />
              </button>
            )}

            <button
              onClick={onOpenLookupModal}
              className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200"
              title="Tra cứu phiếu"
            >
              <Search className="w-4 h-4 text-amber-600" />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200"
              id="mobile-menu-toggle"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white/98 backdrop-blur-xl px-4 pt-3 pb-6 space-y-3 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs space-y-1">
            <div className="font-bold text-amber-900 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-600" />
              {SYSTEM_INFO.address}
            </div>
            <div className="text-slate-600">
              Hotline Quán & Tiệc: <a href={`tel:${MANAGERS.ngocNhi.phones[0]}`} className="text-rose-700 font-bold font-mono">{MANAGERS.ngocNhi.phones[0]}</a>
            </div>
            <div className="text-slate-600">
              Hotline Kỹ Thuật: <a href={`tel:${MANAGERS.dungKaka.phones[0]}`} className="text-emerald-700 font-bold font-mono">{MANAGERS.dungKaka.phones[0]}</a>
            </div>
          </div>

          {onOpenSystemQR && (
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenSystemQR();
              }}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold shadow-2xs hover:bg-amber-100"
            >
              <div className="flex items-center gap-2.5">
                <QrCode className="w-4 h-4 text-amber-700" />
                <span>Xem & In Mã QR Tổng Hệ Thống</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-200/60 text-amber-950 font-bold">Mở QR</span>
            </button>
          )}

          <div className="grid grid-cols-1 gap-1">
            {navItems.map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-amber-500 text-white font-bold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Chế độ phân quyền:</span>
            <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200">
              <button
                onClick={() => {
                  onToggleRole('guest');
                  setMobileMenuOpen(false);
                }}
                className={`px-3 py-1 rounded-lg text-xs ${
                  userRole === 'guest' ? 'bg-white font-bold text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                Khách Xem
              </button>
              <button
                onClick={() => {
                  handleAdminToggle();
                  setMobileMenuOpen(false);
                }}
                className={`px-3 py-1 rounded-lg text-xs flex items-center gap-1 ${
                  userRole === 'admin' ? 'bg-slate-900 text-amber-400 font-bold shadow-xs' : 'text-slate-500'
                }`}
              >
                <Crown className="w-3 h-3 text-amber-400" />
                <span>Quản Trị</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
