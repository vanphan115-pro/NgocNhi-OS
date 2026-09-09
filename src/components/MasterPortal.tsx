import React, { useState } from 'react';
import { 
  AppView, 
  UserRole, 
  RestaurantOrder, 
  RestaurantOrderStatus, 
  TableBooking, 
  TableBookingStatus, 
  WeddingInquiry, 
  WeddingStatus 
} from '../types';
import { MasterAdminHub } from './admin/MasterAdminHub';
import { 
  SYSTEM_INFO, 
  MANAGERS, 
  INITIAL_MENU_ITEMS, 
  WEDDING_PACKAGES, 
  RESTAURANT_SPACES, 
  WEDDING_VENUES, 
  TESTIMONIALS 
} from '../data/initialData';
import { 
  UtensilsCrossed, 
  Sparkles, 
  LayoutDashboard, 
  ArrowRight, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Star, 
  CheckCircle2, 
  Calendar, 
  Users, 
  Layers, 
  Clock, 
  ExternalLink, 
  ChevronRight, 
  Award, 
  Sparkle, 
  Heart, 
  Quote,
  QrCode 
} from 'lucide-react';
import { UniversalQRModal } from './farm/UniversalQRModal';

interface MasterPortalProps {
  onNavigate: (view: AppView) => void;
  userRole: UserRole;
  pendingBookingsCount: number;
  pendingWeddingCount: number;
  orders?: RestaurantOrder[];
  bookings?: TableBooking[];
  weddingInquiries?: WeddingInquiry[];
  onUpdateOrderStatus?: (orderId: string, status: RestaurantOrderStatus, additionalData?: Partial<RestaurantOrder>) => void;
  onUpdateBookingStatus?: (bookingId: string, status: TableBookingStatus) => void;
  onUpdateWeddingStatus?: (inquiryId: string, status: WeddingStatus) => void;
}

export const MasterPortal: React.FC<MasterPortalProps> = ({
  onNavigate,
  userRole,
  pendingBookingsCount,
  pendingWeddingCount,
  orders = [],
  bookings = [],
  weddingInquiries = [],
  onUpdateOrderStatus = () => {},
  onUpdateBookingStatus = () => {},
  onUpdateWeddingStatus = () => {},
}) => {
  const [showSystemQRModal, setShowSystemQRModal] = useState(false);

  return (
    <div className="space-y-16 pb-20">
      {/* 1. Hero Master Ecosystem Banner (Bright, Luminous, High-Contrast Luxury) */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/10 via-white to-rose-500/10 border border-amber-200/80 p-8 sm:p-12 lg:p-14 shadow-xl">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-80 h-80 bg-rose-400/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100/90 border border-amber-300 text-amber-900 text-xs font-bold uppercase tracking-wider shadow-xs">
              <span className="w-2 h-2 rounded-full bg-amber-600 animate-ping" />
              <span>Dự Án Ngọc Nhi • Hệ Sinh Thái Dịch Vụ Thống Nhất</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
              HỆ THỐNG DỊCH VỤ <br />
              <span className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-900 bg-clip-text text-transparent">
                NGỌC NHI
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-normal">
              Chuỗi dịch vụ đa ngành hàng đầu tại <strong className="text-slate-900 font-bold">KP 9, phường Lộc Ninh, TP. Đồng Nai</strong>. 
              Giao thoa hoàn hảo giữa ẩm thực đặc sản cao cấp, dịch vụ tiệc cưới hội nghị trọn gói sang trọng và trung tâm điều hành hiện đại.
            </p>

            {/* Quick Hub Badges */}
            <div className={`grid gap-3 pt-2 ${userRole === 'admin' ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-1 sm:grid-cols-3'}`}>
              <div 
                onClick={() => onNavigate('farm')}
                className="p-3.5 rounded-2xl bg-white border border-emerald-200/90 hover:border-emerald-500 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md group shadow-xs"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs">
                    🦔
                  </div>
                  <span className="text-xs font-bold text-slate-900">Trại Dúi</span>
                </div>
                <span className="text-[11px] text-emerald-700 font-medium">KaKa • Phan Dũng</span>
              </div>

              <div 
                onClick={() => onNavigate('restaurant')}
                className="p-3.5 rounded-2xl bg-white border border-amber-200/90 hover:border-amber-500 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md group shadow-xs"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                    <UtensilsCrossed className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-900">Quán Ăn</span>
                </div>
                <span className="text-[11px] text-amber-700 font-medium">Thực đơn & Đặt bàn</span>
              </div>

              <div 
                onClick={() => onNavigate('wedding')}
                className="p-3.5 rounded-2xl bg-white border border-rose-200/90 hover:border-rose-500 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md group shadow-xs"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-900">Tiệc Cưới</span>
                </div>
                <span className="text-[11px] text-rose-700 font-medium">Gói tiệc & Hội nghị</span>
              </div>

              {userRole === 'admin' && (
                <div 
                  onClick={() => onNavigate('operations')}
                  className="p-3.5 rounded-2xl bg-white border border-indigo-200/90 hover:border-indigo-500 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md group shadow-xs"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                      <LayoutDashboard className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-slate-900">Điều Hành</span>
                  </div>
                  <span className="text-[11px] text-indigo-700 font-medium">Ban chỉ huy</span>
                </div>
              )}
            </div>

            {/* Quick Action Buttons: When user is admin, show the 3 synchronized management sections; otherwise show customer CTA buttons */}
            {userRole === 'admin' ? (
              <MasterAdminHub
                orders={orders}
                bookings={bookings}
                weddingInquiries={weddingInquiries}
                onNavigate={onNavigate}
                onUpdateOrderStatus={onUpdateOrderStatus}
                onUpdateBookingStatus={onUpdateBookingStatus}
                onUpdateWeddingStatus={onUpdateWeddingStatus}
              />
            ) : (
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => onNavigate('restaurant')}
                  className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white font-bold text-sm shadow-lg shadow-amber-500/25 flex items-center gap-2 transition-all hover:scale-[1.02]"
                >
                  <UtensilsCrossed className="w-4 h-4" />
                  <span>Xem Thực Đơn & Đặt Bàn Ngay</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onNavigate('wedding')}
                  className="px-5 py-3.5 rounded-2xl bg-white hover:bg-rose-50 text-rose-800 font-bold text-sm border border-rose-300 shadow-sm flex items-center gap-2 transition-all hover:scale-[1.02]"
                >
                  <Sparkles className="w-4 h-4 text-rose-600" />
                  <span>Khám Phá Sảnh & Gói Tiệc Cưới</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowSystemQRModal(true)}
                  className="px-4 py-3.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-sm border border-amber-300/90 shadow-sm flex items-center gap-2 transition-all hover:scale-[1.02]"
                  title="Xem & in mã QR Tổng của toàn bộ Hệ thống Dịch vụ Ngọc Nhi"
                >
                  <QrCode className="w-4 h-4 text-amber-700" />
                  <span>01 QR Tổng Hệ Thống</span>
                </button>
              </div>
            )}
          </div>

          {/* Hero Visual Showcase Collages */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-3 relative">
            <div className="space-y-3">
              <div className="relative rounded-2xl overflow-hidden shadow-md group h-44">
                <img 
                  src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80" 
                  alt="Đặc sản Quán Ăn Ngọc Nhi" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-3">
                  <span className="text-white text-xs font-bold drop-shadow-sm">Đặc Sản Quán Ăn</span>
                </div>
              </div>

              <div className="relative rounded-2xl overflow-hidden shadow-md group h-36">
                <img 
                  src="https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=600&q=80" 
                  alt="Sảnh Ẩm Thực Ấm Cúng" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-3">
                  <span className="text-white text-xs font-bold drop-shadow-sm">Sảnh Ẩm Thực</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <div className="relative rounded-2xl overflow-hidden shadow-md group h-36">
                <img 
                  src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=600&q=80" 
                  alt="Sảnh Tiệc Cưới Sang Trọng" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-3">
                  <span className="text-white text-xs font-bold drop-shadow-sm">Sảnh Cưới Hoàng Gia</span>
                </div>
              </div>

              <div className="relative rounded-2xl overflow-hidden shadow-md group h-44">
                <img 
                  src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80" 
                  alt="Không Gian Sân Vườn Sinh Thái" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-3">
                  <span className="text-white text-xs font-bold drop-shadow-sm">Sân Vườn Sinh Thái</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Main Pillars Section */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Sparkle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Cấu Trúc Hệ Sinh Thái Thống Nhất</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-4xl font-extrabold text-slate-900">
              Các Phân Hệ Trọng Điểm Của Hệ Thống
            </h2>
          </div>
          <p className="text-sm text-slate-600 max-w-md">
            Mỗi phân hệ đảm nhận vai trò chuyên biệt, vận hành đồng bộ trên nền tảng Quản Trị Ngọc Nhi.
          </p>
        </div>

        <div className={`grid gap-6 ${userRole === 'admin' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 md:grid-cols-3'}`}>
          {/* Pillar 0: Trang Trại Dúi KaKa */}
          <div className="rounded-3xl bg-white border border-emerald-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
            <div className="relative h-44 w-full overflow-hidden bg-emerald-900">
              <img 
                src="https://images.unsplash.com/photo-1535083783855-76ae62b2914e?auto=format&fit=crop&w=800&q=80" 
                alt="Trang Trại Dúi KaKa" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent flex items-end p-4">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md font-black text-sm">
                      🦔
                    </div>
                    <div>
                      <span className="text-emerald-300 text-[10px] font-bold uppercase tracking-wider block">Phân Hệ Nông Nghiệp</span>
                      <h3 className="text-base font-bold text-white leading-tight">Trại Dúi KaKa</h3>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500 text-slate-950 shadow-xs">
                    MỐC ĐẠI & MÁ ĐÀO
                  </span>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-3 flex-1 flex flex-col justify-between text-xs">
              <p className="text-slate-600 leading-relaxed">
                Chuỗi 5 phân khu: Sinh sản, Baby, Hậu bị, Thương phẩm, Điều trị thú y. Cảnh báo tự động tách ghép, an toàn sinh học.
              </p>

              <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Chủ trang trại:</span>
                  <strong className="text-emerald-900 font-bold">Phan Dũng</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Quy mô:</span>
                  <span className="text-emerald-800 font-semibold">1.500m² • 5 Phân Khu</span>
                </div>
              </div>

              <button
                onClick={() => onNavigate('farm')}
                className="w-full py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Vào Trang Trại Dúi</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Pillar 1: Quán Ăn Ngọc Nhi */}
          <div className="rounded-3xl bg-white border border-amber-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
            <div className="relative h-44 w-full overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80" 
                alt="Quán Ăn Ẩm Thực Ngọc Nhi" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent flex items-end p-4">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-md">
                      <UtensilsCrossed className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-amber-300 text-[10px] font-bold uppercase tracking-wider block">Phân Hệ Ẩm Thực</span>
                      <h3 className="text-base font-bold text-white leading-tight">Quán Ăn Ngọc Nhi</h3>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500 text-slate-950 shadow-xs">
                    ĐẶC SẢN
                  </span>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-3 flex-1 flex flex-col justify-between text-xs">
              <p className="text-slate-600 leading-relaxed">
                Ẩm thực đặc sản: Dúi hấp lá chanh, dúi nướng than hoa, gà đồi, lẩu măng rừng. Đặt bàn online nhanh chóng, nhận vé giữ chỗ tức thì.
              </p>

              <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Giám đốc điều hành:</span>
                  <strong className="text-rose-800 font-bold">{MANAGERS.ngocNhi.name}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Không gian:</span>
                  <span className="text-amber-800 font-semibold">Sân vườn • VIP</span>
                </div>
              </div>

              <button
                onClick={() => onNavigate('restaurant')}
                className="w-full py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Xem Menu & Đặt Bàn</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Pillar 2: Dịch Vụ Tiệc Cưới Ngọc Nhi */}
          <div className="rounded-3xl bg-white border border-rose-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
            <div className="relative h-44 w-full overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80" 
                alt="Dịch Vụ Tiệc Cưới Ngọc Nhi" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent flex items-end p-4">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-md">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-rose-300 text-[10px] font-bold uppercase tracking-wider block">Phân Hệ Tiệc Cưới</span>
                      <h3 className="text-base font-bold text-white leading-tight">Tiệc Cưới & Hội Nghị</h3>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-500 text-white shadow-xs">
                    TRỌN GÓI
                  </span>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-3 flex-1 flex flex-col justify-between text-xs">
              <p className="text-slate-600 leading-relaxed">
                Tổ chức lễ cưới với 3 gói tiệc (Tiết Kiệm, Phổ Thông, Cao Cấp), sảnh Hoàng Gia lộng lẫy hoặc nấu tiệc tận nhà theo yêu cầu.
              </p>

              <div className="p-3 rounded-2xl bg-rose-50/80 border border-rose-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Giám đốc điều hành:</span>
                  <strong className="text-rose-800 font-bold">{MANAGERS.ngocNhi.name}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Giá bàn từ:</span>
                  <span className="text-rose-700 font-bold font-mono">1.500.000đ/Bàn</span>
                </div>
              </div>

              <button
                onClick={() => onNavigate('wedding')}
                className="w-full py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md shadow-rose-600/20 flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Gói Tiệc & Báo Giá</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Pillar 3: Trung Tâm Điều Hành Thống Nhất (Chỉ hiển thị cho Quản Trị Viên) */}
          {userRole === 'admin' && (
            <div className="rounded-3xl bg-white border border-indigo-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
              <div className="relative h-44 w-full overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80" 
                  alt="Trung Tâm Điều Hành Ngọc Nhi" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent flex items-end p-4">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                        <LayoutDashboard className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-indigo-300 text-[10px] font-bold uppercase tracking-wider block">Phân Hệ Điều Hành</span>
                        <h3 className="text-base font-bold text-white leading-tight">Trung Tâm Điều Hành</h3>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-indigo-600 text-white shadow-xs">
                      QUẢN TRỊ
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between text-xs">
                <p className="text-slate-600 leading-relaxed">
                  Nền tảng kiểm soát luồng hoạt động đồng bộ: xử lý yêu cầu đặt bàn tức thì, quản lý phân công và theo dõi tiến độ chuẩn bị tiệc.
                </p>

                <div className="p-3 rounded-2xl bg-indigo-50/80 border border-indigo-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Chỉ huy tối cao:</span>
                    <strong className="text-indigo-900 font-bold">{MANAGERS.dungKaka.name}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Công cụ:</span>
                    <span className="text-indigo-700 font-semibold">Giám sát tổng thể</span>
                  </div>
                </div>

                <button
                  onClick={() => onNavigate('operations')}
                  className="w-full py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Mở Bảng Điều Hành</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 3. Featured Dishes Preview (Thực Đơn Đặc Sắc Kèm Ảnh Món Ngon Hấp Dẫn) */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">
              Hương Vị Độc Bản Quán Ăn
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-slate-900">
              Đặc Sản Nổi Bật Tại Quán Ăn Ngọc Nhi
            </h2>
          </div>

          <button
            onClick={() => onNavigate('restaurant')}
            className="hidden sm:flex items-center gap-1 text-xs font-bold text-amber-800 hover:text-amber-900 hover:underline"
          >
            <span>Xem toàn bộ thực đơn ({INITIAL_MENU_ITEMS.length} món)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {INITIAL_MENU_ITEMS.slice(0, 4).map((item) => (
            <div 
              key={item.id}
              onClick={() => onNavigate('restaurant')}
              className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="relative h-44 overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  {item.isSpecialty && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-500 text-slate-950 shadow-md">
                      ★ Đặc Sản Đệ Nhất
                    </span>
                  )}
                  <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg text-xs font-bold font-mono bg-slate-900/90 text-amber-400 shadow-md">
                    {item.price.toLocaleString('vi-VN')}đ
                  </span>
                </div>

                <div className="p-4 space-y-2">
                  <h3 className="font-bold text-slate-900 text-sm group-hover:text-amber-700 transition-colors line-clamp-1">
                    {item.name}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="p-4 pt-0 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>{item.portion}</span>
                <span className="text-amber-700 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  Đặt món <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Wedding Venues & Packages Highlight (Ảnh Sảnh Cưới & Dịch Vụ) */}
      <section className="rounded-3xl bg-gradient-to-br from-rose-50/70 via-white to-amber-50/50 border border-rose-200 p-8 sm:p-12 space-y-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-rose-700 uppercase tracking-wider mb-1">
              Không Gian Hạnh Phúc Viên Mãn
            </div>
            <h2 className="font-serif text-2xl sm:text-4xl font-extrabold text-slate-900">
              Sảnh Tiệc Sang Trọng & Gói Tiệc Cưới Trọn Gói
            </h2>
          </div>

          <button
            onClick={() => onNavigate('wedding')}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <span>Tư Vấn Báo Giá Tiệc Cưới</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 3 Wedding Packages Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {WEDDING_PACKAGES.map((pkg) => (
            <div 
              key={pkg.id}
              onClick={() => onNavigate('wedding')}
              className="rounded-2xl bg-white border border-rose-100 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="relative h-44 overflow-hidden">
                  <img 
                    src={pkg.image} 
                    alt={pkg.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent flex items-end p-4">
                    <div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white text-rose-800 shadow-xs mb-1 inline-block">
                        {pkg.badge}
                      </span>
                      <h3 className="text-base font-bold text-white">{pkg.name}</h3>
                    </div>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div className="font-mono text-xl font-extrabold text-rose-800">
                    {pkg.pricePerTable.toLocaleString('vi-VN')}đ
                    <span className="text-xs text-slate-500 font-normal ml-1">/ Bàn</span>
                  </div>

                  <p className="text-xs text-slate-600">{pkg.tagline}</p>

                  <ul className="space-y-1.5 pt-2 border-t border-slate-100">
                    {pkg.highlights.slice(0, 3).map((hl, idx) => (
                      <li key={idx} className="text-xs text-slate-600 flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                        <span>{hl}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="p-4 bg-rose-50/60 border-t border-rose-100 flex items-center justify-between text-xs font-bold text-rose-800">
                <span>{pkg.recommendedFor}</span>
                <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Chọn gói <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Customer Testimonials (Cảm Nhận Khách Hàng Sinh Động Kèm Avatar) */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto">
          <div className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">
            Niềm Tin & Hài Lòng
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-slate-900">
            Khách Hàng Nói Gì Về Hệ Thống Ngọc Nhi
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((item, idx) => (
            <div key={idx} className="rounded-2xl bg-white border border-slate-200 p-6 space-y-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                    {item.tag}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                  "{item.comment}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <img 
                  src={item.avatar} 
                  alt={item.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-300" 
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{item.name}</h4>
                  <p className="text-[11px] text-slate-500">{item.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Executive Leadership Spotlight (Ban Chỉ Đạo & Danh Bạ Trực Tiếp) */}
      <section className="rounded-3xl bg-slate-900 text-white p-8 sm:p-12 shadow-2xl space-y-8">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Ban Quản Trị Hệ Thống Dịch Vụ Ngọc Nhi</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold">
            Lãnh Đạo & Phụ Trách Trực Tiếp Các Phân Hệ
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Mọi dịch vụ trong hệ sinh thái Ngọc Nhi đều được cam kết chất lượng trực tiếp bởi đội ngũ quản lý cao nhất.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Dũng Kaka */}
          <div className="p-6 rounded-2xl bg-slate-800/80 border border-emerald-500/40 space-y-4 hover:border-emerald-500 transition-all flex flex-col justify-between">
            <div className="flex items-center gap-4">
              <img 
                src={MANAGERS.dungKaka.avatar} 
                alt={MANAGERS.dungKaka.name} 
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-emerald-400 shadow-md shrink-0"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-base">{MANAGERS.dungKaka.name}</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700">
                    Toàn Quyền Quản Trị
                  </span>
                </div>
                <p className="text-xs text-emerald-400 font-medium mt-0.5">
                  {MANAGERS.dungKaka.title}
                </p>
              </div>
            </div>

            <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
              <li>Quản trị viên toàn bộ Hệ thống Dịch vụ Ngọc Nhi</li>
              <li>Chỉ đạo kỹ thuật, công nghệ thông tin & an toàn vận hành</li>
              <li>Giám sát điều phối tổng thể các phân hệ trực thuộc</li>
            </ul>

            <div className="pt-3 border-t border-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <a 
                href={`tel:${MANAGERS.dungKaka.phones[0]}`}
                className="flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-900 hover:bg-emerald-950 text-emerald-400 text-xs font-mono font-bold border border-emerald-900/60 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{MANAGERS.dungKaka.phones[0]}</span>
              </a>
              <a 
                href={`tel:${MANAGERS.dungKaka.phones[1]}`}
                className="flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-900 hover:bg-emerald-950 text-emerald-400 text-xs font-mono font-bold border border-emerald-900/60 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{MANAGERS.dungKaka.phones[1]}</span>
              </a>
            </div>
          </div>

          {/* Giám Đốc Ngọc Nhi */}
          <div className="p-6 rounded-2xl bg-slate-800/80 border border-rose-500/40 space-y-4 hover:border-rose-500 transition-all flex flex-col justify-between">
            <div className="flex items-center gap-4">
              <img 
                src={MANAGERS.ngocNhi.avatar} 
                alt={MANAGERS.ngocNhi.name} 
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-rose-400 shadow-md shrink-0"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-base">{MANAGERS.ngocNhi.name}</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-700">
                    Giám Đốc Điều Hành
                  </span>
                </div>
                <p className="text-xs text-rose-400 font-medium mt-0.5">
                  {MANAGERS.ngocNhi.title}
                </p>
              </div>
            </div>

            <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
              <li>Giám đốc điều hành trực tiếp Quán Ăn Ẩm Thực Ngọc Nhi</li>
              <li>Chỉ đạo thiết kế và tổ chức Dịch vụ Tiệc Cưới & Sự Kiện</li>
              <li>Trực tiếp tiếp nhận hợp đồng và phân công đội ngũ phục vụ</li>
            </ul>

            <div className="pt-3 border-t border-slate-700">
              <a 
                href={`tel:${MANAGERS.ngocNhi.phones[0]}`}
                className="flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-900 hover:bg-rose-950 text-rose-400 text-xs font-mono font-bold border border-rose-900/60 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Hotline Điều Hành: {MANAGERS.ngocNhi.phones[0]}</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* MODAL 01 QR TỔNG HỆ THỐNG DỊCH VỤ NGỌC NHI */}
      {showSystemQRModal && (
        <UniversalQRModal
          initialType="system"
          onClose={() => setShowSystemQRModal(false)}
        />
      )}
    </div>
  );
};
