import React, { useEffect } from 'react';
import { AppView } from '../types';
import { AdminAlertPayload } from '../utils/notificationSound';
import { Bell, X, ArrowRight, UtensilsCrossed, ShoppingBag, Sparkles, Phone, Clock } from 'lucide-react';

interface AdminToastAlertProps {
  notification: AdminAlertPayload | null;
  onClose: () => void;
  onNavigate: (view: AppView) => void;
}

export const AdminToastAlert: React.FC<AdminToastAlertProps> = ({
  notification,
  onClose,
  onNavigate,
}) => {
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      onClose();
    }, 8000);
    return () => clearTimeout(timer);
  }, [notification, onClose]);

  if (!notification) return null;

  const handleAction = () => {
    if (notification.view) {
      onNavigate(notification.view);
    }
    onClose();
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'order':
        return <ShoppingBag className="w-5 h-5 text-orange-600" />;
      case 'booking':
        return <UtensilsCrossed className="w-5 h-5 text-amber-600" />;
      case 'dui_quote':
        return <span className="text-lg">🦔</span>;
      case 'farm_order':
        return <span className="text-lg">🦔</span>;
      case 'wedding':
        return <Sparkles className="w-5 h-5 text-rose-600" />;
      default:
        return <Bell className="w-5 h-5 text-amber-600" />;
    }
  };

  return (
    <div className="fixed top-20 right-4 z-50 max-w-md w-full sm:w-[420px] bg-slate-900 text-white rounded-2xl p-4 shadow-2xl border-2 border-amber-500/80 animate-in slide-in-from-top-4 duration-300">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0 animate-bounce">
          {getIcon()}
        </div>

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />
              {notification.title}
            </span>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs font-semibold text-slate-100 line-clamp-2">
            {notification.message}
          </p>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="font-mono text-amber-400 font-bold">#{notification.code}</span>
              {notification.amount !== undefined && notification.amount > 0 && (
                <span className="text-emerald-400 font-mono font-black">
                  {notification.amount.toLocaleString('vi-VN')}đ
                </span>
              )}
            </div>

            <button
              onClick={handleAction}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <span>Xem & Xử Lý</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
