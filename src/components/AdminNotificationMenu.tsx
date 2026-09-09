import React, { useState, useEffect, useRef } from 'react';
import { AppView, UserRole } from '../types';
import { AdminAlertPayload, playNotificationChime } from '../utils/notificationSound';
import { 
  Bell, 
  X, 
  CheckCheck, 
  Trash2, 
  Volume2, 
  VolumeX, 
  ShoppingBag, 
  UtensilsCrossed, 
  Sparkles, 
  ExternalLink,
  ChevronRight,
  Clock,
  Phone,
  AlertCircle
} from 'lucide-react';

interface AdminNotificationMenuProps {
  userRole: UserRole;
  notifications: AdminAlertPayload[];
  onNavigate: (view: AppView) => void;
  onClearAll: () => void;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}

export const AdminNotificationMenu: React.FC<AdminNotificationMenuProps> = ({
  userRole,
  notifications,
  onNavigate,
  onClearAll,
  onMarkRead,
  onMarkAllRead,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'order' | 'booking' | 'dui_quote' | 'farm_order' | 'wedding'>('all');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('nn_sound_enabled');
      return saved !== 'false';
    } catch (e) {
      return true;
    }
  });

  const menuRef = useRef<HTMLDivElement>(null);

  // Close when clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem('nn_sound_enabled', String(next));
    if (next) {
      playNotificationChime();
    }
  };

  const unreadCount = notifications.filter(n => (n as any).read === false).length;

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true;
    return n.type === filter;
  });

  const handleItemClick = (notif: AdminAlertPayload) => {
    if (notif.id) {
      onMarkRead(notif.id);
    }
    setIsOpen(false);
    if (notif.view) {
      onNavigate(notif.view);
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'order':
        return <ShoppingBag className="w-4 h-4 text-orange-600" />;
      case 'booking':
        return <UtensilsCrossed className="w-4 h-4 text-amber-600" />;
      case 'dui_quote':
        return <span className="text-sm">🦔</span>;
      case 'farm_order':
        return <span className="text-sm">🦔</span>;
      case 'wedding':
        return <Sparkles className="w-4 h-4 text-rose-600" />;
      default:
        return <Bell className="w-4 h-4 text-indigo-600" />;
    }
  };

  const getBadgeForType = (type: string) => {
    switch (type) {
      case 'order':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-800 border border-orange-200">Đơn Món</span>;
      case 'booking':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">Đặt Bàn</span>;
      case 'dui_quote':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">Báo Giá Dúi</span>;
      case 'farm_order':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Mua Dúi Giống</span>;
      case 'wedding':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">Tiệc Cưới</span>;
      default:
        return null;
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-xl border transition-all duration-200 ${
          isOpen
            ? 'bg-amber-500 text-white border-amber-600 shadow-md shadow-amber-500/20'
            : unreadCount > 0
            ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
            : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
        }`}
        title={`Thông báo hệ thống (${unreadCount} mới)`}
        id="admin-notification-bell-button"
      >
        <Bell className={`w-4 h-4 ${unreadCount > 0 ? 'animate-wiggle' : ''}`} />

        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.2 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-black bg-rose-600 text-white shadow-sm border border-white animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-[340px] sm:w-[420px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-200 z-50 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold flex items-center gap-1.5">
                  <span>Thông Báo Trực Tuyến</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.2 text-[10px] font-extrabold rounded-full bg-rose-600 text-white">
                      {unreadCount} mới
                    </span>
                  )}
                </h3>
                <p className="text-[10px] text-slate-300">Đơn hàng, đặt bàn & yêu cầu mới từ khách</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={toggleSound}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  soundEnabled ? 'text-amber-400 hover:bg-white/10' : 'text-slate-400 hover:bg-white/10'
                }`}
                title={soundEnabled ? 'Chuông báo đang BẬT (Bấm để tắt)' : 'Chuông báo đang TẮT (Bấm để bật)'}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Bar & Quick Actions */}
          <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-1 text-[11px] shrink-0 overflow-x-auto">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition-all ${
                  filter === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                Tất cả ({notifications.length})
              </button>
              <button
                onClick={() => setFilter('order')}
                className={`px-2 py-1 rounded-lg font-semibold whitespace-nowrap transition-all ${
                  filter === 'order'
                    ? 'bg-orange-600 text-white'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                Đơn món
              </button>
              <button
                onClick={() => setFilter('booking')}
                className={`px-2 py-1 rounded-lg font-semibold whitespace-nowrap transition-all ${
                  filter === 'booking'
                    ? 'bg-amber-600 text-white'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                Đặt bàn
              </button>
              <button
                onClick={() => setFilter('dui_quote')}
                className={`px-2 py-1 rounded-lg font-semibold whitespace-nowrap transition-all ${
                  filter === 'dui_quote'
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                Cân Dúi
              </button>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {unreadCount > 0 && (
                <button
                  onClick={onMarkAllRead}
                  className="p-1 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded"
                  title="Đánh dấu tất cả đã đọc"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={onClearAll}
                  className="p-1 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded"
                  title="Xóa danh sách thông báo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 max-h-[380px]">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <Bell className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs font-medium text-slate-600">Chưa có thông báo mới nào</p>
                <p className="text-[11px] text-slate-400">
                  Khi khách đặt bàn, đặt món online hoặc gửi yêu cầu, chuông và thông báo sẽ hiển thị tại đây ngay lập tức.
                </p>
                <button
                  onClick={() => playNotificationChime()}
                  className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                >
                  <Volume2 className="w-3.5 h-3.5 text-amber-600" />
                  <span>Thử chuông báo</span>
                </button>
              </div>
            ) : (
              filteredNotifications.map((notif) => {
                const isUnread = (notif as any).read === false;
                return (
                  <div
                    key={notif.id}
                    onClick={() => handleItemClick(notif)}
                    className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex items-start gap-3 relative group ${
                      isUnread ? 'bg-amber-50/40' : ''
                    }`}
                  >
                    {isUnread && (
                      <span className="w-2 h-2 rounded-full bg-rose-600 absolute left-2 top-4 animate-ping" />
                    )}

                    <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                      {getIconForType(notif.type)}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold text-slate-900 leading-tight">
                            {notif.title}
                          </span>
                          {getBadgeForType(notif.type)}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0 flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" />
                          {notif.timestamp}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {notif.message}
                      </p>

                      <div className="flex items-center justify-between text-[11px] pt-1 text-slate-500">
                        <span className="font-mono font-bold text-amber-800">
                          #{notif.code}
                        </span>
                        {notif.amount !== undefined && notif.amount > 0 && (
                          <span className="font-mono font-extrabold text-orange-600">
                            {notif.amount.toLocaleString('vi-VN')}đ
                          </span>
                        )}
                        <span className="text-slate-400 group-hover:text-amber-700 flex items-center gap-0.5 font-medium transition-colors">
                          <span>Xử lý</span>
                          <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs shrink-0">
            <span className="text-[11px] text-slate-500">
              Quản trị viên: {userRole === 'admin' ? 'Đã kích hoạt' : 'Khách xem'}
            </span>
            <button
              onClick={() => {
                setIsOpen(false);
                onNavigate('restaurant');
              }}
              className="text-amber-700 hover:text-amber-900 font-bold flex items-center gap-1 text-xs"
            >
              <span>Vào Quản Lý Bếp & Bàn</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
