import React, { useState } from 'react';
import { 
  Sparkles, 
  Crown, 
  Star, 
  Gem, 
  Check, 
  Users, 
  ChevronLeft, 
  ChevronRight, 
  Phone, 
  Send, 
  Gift, 
  Calendar, 
  User, 
  CheckCircle2, 
  Flower2, 
  Camera, 
  Mic2, 
  Car, 
  Sparkle, 
  Mail, 
  MapPin, 
  Clock, 
  QrCode, 
  CheckCircle,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  Heart
} from 'lucide-react';
import { 
  WEDDING_REFERENCE_PACKAGES, 
  WEDDING_REFERENCE_VENUES, 
  WEDDING_REFERENCE_SERVICES, 
  WEDDING_REFERENCE_RECENT_ORDERS, 
  WEDDING_REFERENCE_PROMOTIONS,
  WeddingPackageItem,
  WeddingVenueItem
} from './weddingData';
import { WeddingInquiry, UserRole } from '../../types';

interface WeddingOverviewProps {
  userRole: UserRole;
  weddingInquiries: WeddingInquiry[];
  onNavigateTab: (tab: string, extraData?: any) => void;
  onOpenBookingModal: (prefill?: any) => void;
  onSelectPackageDetail: (pkg: WeddingPackageItem) => void;
  onSelectVenueDetail: (venue: WeddingVenueItem) => void;
  onSubmitQuickInquiry: (formData: {
    customerName: string;
    phone: string;
    eventDate: string;
    guestCount: number;
    packageId: string;
  }) => void;
}

export const WeddingOverview: React.FC<WeddingOverviewProps> = ({
  userRole,
  weddingInquiries,
  onNavigateTab,
  onOpenBookingModal,
  onSelectPackageDetail,
  onSelectVenueDetail,
  onSubmitQuickInquiry,
}) => {
  // Venue Carousel state
  const [currentVenueIndex, setCurrentVenueIndex] = useState(0);

  // Quick form state
  const [quickForm, setQuickForm] = useState({
    customerName: '',
    phone: '',
    eventDate: '',
    guestCount: '300 khách (30 bàn)',
    packageId: 'pkg-standard',
  });
  const [quickSuccess, setQuickSuccess] = useState(false);
  const [formError, setFormError] = useState('');

  const currentVenue = WEDDING_REFERENCE_VENUES[currentVenueIndex] || WEDDING_REFERENCE_VENUES[0];

  const handlePrevVenue = () => {
    setCurrentVenueIndex((prev) => (prev === 0 ? WEDDING_REFERENCE_VENUES.length - 1 : prev - 1));
  };

  const handleNextVenue = () => {
    setCurrentVenueIndex((prev) => (prev === WEDDING_REFERENCE_VENUES.length - 1 ? 0 : prev + 1));
  };

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!quickForm.customerName.trim()) {
      setFormError('Vui lòng nhập họ và tên');
      return;
    }
    if (!quickForm.phone.trim() || quickForm.phone.length < 9) {
      setFormError('Vui lòng nhập số điện thoại hợp lệ');
      return;
    }

    const guests = parseInt(quickForm.guestCount) || 300;
    onSubmitQuickInquiry({
      customerName: quickForm.customerName.trim(),
      phone: quickForm.phone.trim(),
      eventDate: quickForm.eventDate || new Date().toISOString().split('T')[0],
      guestCount: guests,
      packageId: quickForm.packageId,
    });

    setQuickSuccess(true);
    setTimeout(() => {
      setQuickSuccess(false);
      setQuickForm({
        customerName: '',
        phone: '',
        eventDate: '',
        guestCount: '300 khách (30 bàn)',
        packageId: 'pkg-standard',
      });
    }, 4000);
  };

  // Combine reference orders and live inquiries
  const displayOrders = [
    ...weddingInquiries.slice(0, 2).map((inq) => ({
      id: inq.id,
      customerName: inq.customerName,
      hallAndTables: `${inq.venueLocation === 'hall_ngocnhi' ? 'Sảnh Ngọc Nhi 1' : 'Sảnh Sân Vườn'} – ${inq.expectedTables || 30} bàn`,
      date: inq.eventDate || 'Sắp tới',
      statusText: inq.status === 'confirmed' ? 'Đã xác nhận' : inq.status === 'completed' ? 'Đã thanh toán' : 'Đang chờ',
      statusClass: inq.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : inq.status === 'completed' ? 'bg-sky-50 text-sky-700 border-sky-200' : 'bg-amber-50 text-amber-700 border-amber-200',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    })),
    ...WEDDING_REFERENCE_RECENT_ORDERS.map(o => ({
      ...o,
      statusClass: o.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : o.status === 'paid' ? 'bg-sky-50 text-sky-700 border-sky-200' : 'bg-amber-50 text-amber-700 border-amber-200'
    }))
  ].slice(0, 3);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ========================================================= */}
      {/* ROW 1: HERO BANNER (Left 8 cols) + QUICK INQUIRY FORM (Right 4 cols) */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Romantic Wedding Hall Banner */}
        <div className="lg:col-span-8 relative rounded-3xl overflow-hidden shadow-sm border border-rose-100 min-h-[300px] flex flex-col justify-between p-6 sm:p-8 group">
          {/* Backdrop Image with romantic warm banquet hall */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{ 
              backgroundImage: `url('https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1400&q=80')` 
            }}
          />
          {/* Warm Golden/Rose Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-rose-950/85 via-rose-900/70 to-amber-950/60" />

          {/* Top Decorative Monogram / Watermark */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Trung Tâm Yến Tiệc & Hội Nghị Đẳng Cấp</span>
            </div>
            <div className="w-10 h-10 rounded-full border border-amber-300/40 bg-amber-400/10 backdrop-blur-sm flex items-center justify-center text-amber-200 font-serif font-bold text-sm">
              NN
            </div>
          </div>

          {/* Center Romantic Text */}
          <div className="relative z-10 py-6 text-center sm:text-left space-y-2">
            <div className="font-serif italic text-2xl sm:text-3xl text-rose-200 tracking-wide font-normal drop-shadow-sm">
              Tiệc cưới Ngọc Nhi
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-wider uppercase font-sans drop-shadow-md">
              NÂNG TẦM HẠNH PHÚC
            </h1>
            <p className="text-xs sm:text-sm text-rose-100 font-medium tracking-wide drop-shadow-sm max-w-xl">
              Không gian sang trọng – Dịch vụ hoàn hảo – Kỷ niệm trọn vẹn
            </p>
          </div>

          {/* Bottom 4 Feature Highlight Pills (Exact matching image) */}
          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-2.5 flex items-center gap-2.5 border border-white/80 shadow-xs hover:bg-white transition-colors">
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <Gem className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-rose-900 leading-tight">Sảnh tiệc</div>
                <div className="text-[10px] text-slate-500">Sang trọng</div>
              </div>
            </div>

            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-2.5 flex items-center gap-2.5 border border-white/80 shadow-xs hover:bg-white transition-colors">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Crown className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-900 leading-tight">Thực đơn</div>
                <div className="text-[10px] text-slate-500">Đặc sắc</div>
              </div>
            </div>

            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-2.5 flex items-center gap-2.5 border border-white/80 shadow-xs hover:bg-white transition-colors">
              <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                <Heart className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-900 leading-tight">Dịch vụ</div>
                <div className="text-[10px] text-slate-500">Chuyên nghiệp</div>
              </div>
            </div>

            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-2.5 flex items-center gap-2.5 border border-white/80 shadow-xs hover:bg-white transition-colors">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Star className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-900 leading-tight">Giá cả</div>
                <div className="text-[10px] text-slate-500">Hợp lý</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: YÊU CẦU BÁO GIÁ / ĐẶT TIỆC Card */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-5 sm:p-6 border border-rose-100 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="text-center font-bold text-sm tracking-wider text-rose-700 uppercase">
              YÊU CẦU BÁO GIÁ / ĐẶT TIỆC
            </h2>

            {quickSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2 animate-in zoom-in-95">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <div className="font-bold text-emerald-900 text-xs">Đã gửi yêu cầu thành công!</div>
                <p className="text-[11px] text-emerald-700 leading-relaxed">
                  Giám đốc Ngọc Nhi sẽ liên hệ tư vấn và gửi bản phối cảnh hoa tươi trong 15 phút.
                </p>
              </div>
            ) : (
              <form onSubmit={handleQuickSubmit} className="space-y-2.5">
                {formError && (
                  <div className="text-[11px] text-rose-600 bg-rose-50 p-2 rounded-xl border border-rose-200 font-medium">
                    {formError}
                  </div>
                )}

                {/* Full name input */}
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Họ và tên *"
                    value={quickForm.customerName}
                    onChange={(e) => setQuickForm({ ...quickForm, customerName: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-rose-500 focus:bg-white transition-all"
                  />
                </div>

                {/* Phone input */}
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    placeholder="Số điện thoại *"
                    value={quickForm.phone}
                    onChange={(e) => setQuickForm({ ...quickForm, phone: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-rose-500 focus:bg-white transition-all"
                  />
                </div>

                {/* Date input */}
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="date"
                    value={quickForm.eventDate}
                    onChange={(e) => setQuickForm({ ...quickForm, eventDate: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-rose-500 focus:bg-white transition-all"
                  />
                </div>

                {/* Guests input */}
                <div className="relative">
                  <Users className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Số lượng khách (hoặc số bàn)"
                    value={quickForm.guestCount}
                    onChange={(e) => setQuickForm({ ...quickForm, guestCount: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-rose-500 focus:bg-white transition-all"
                  />
                </div>

                {/* Select Package */}
                <div className="relative">
                  <Gift className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={quickForm.packageId}
                    onChange={(e) => setQuickForm({ ...quickForm, packageId: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-rose-500 focus:bg-white transition-all appearance-none cursor-pointer"
                  >
                    {WEDDING_REFERENCE_PACKAGES.map((pkg) => (
                      <option key={pkg.id} value={pkg.id}>
                        {pkg.name} ({pkg.priceFormatted}/bàn)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Pink Call-to-action button */}
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-[0.99] text-white font-bold text-xs shadow-md shadow-rose-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>GỬI YÊU CẦU</span>
                </button>
              </form>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 text-center">
            <span className="text-[11px] text-slate-500">
              Hotline: <strong className="text-rose-700">0967 823 801</strong> (Ngọc Nhi)
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* ROW 2: GÓI TIỆC CƯỚI NỔI BẬT + SẢNH TIỆC + ĐƠN ĐẶT TIỆC / KHUYẾN MÃI */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Col Left (8 cols): Packages + Venues */}
        <div className="lg:col-span-8 space-y-6">
          {/* Section: GÓI TIỆC CƯỚI NỔI BẬT */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-rose-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-xs sm:text-sm uppercase tracking-wider text-rose-800 flex items-center gap-2">
                <span>GÓI TIỆC CƯỚI NỔI BẬT</span>
              </h2>
              <button
                onClick={() => onNavigateTab('packages')}
                className="text-xs font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1 hover:underline cursor-pointer"
              >
                <span>Xem tất cả</span>
                <span>→</span>
              </button>
            </div>

            {/* 3 Package Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {WEDDING_REFERENCE_PACKAGES.map((pkg) => {
                const isEconomy = pkg.id === 'pkg-economy';
                const isStandard = pkg.id === 'pkg-standard';
                const isLuxury = pkg.id === 'pkg-luxury';

                return (
                  <div
                    key={pkg.id}
                    className={`rounded-2xl p-4.5 border transition-all duration-200 flex flex-col justify-between space-y-4 ${
                      isEconomy
                        ? 'border-emerald-200 bg-emerald-50/20 hover:border-emerald-300'
                        : isStandard
                        ? 'border-sky-200 bg-sky-50/20 hover:border-sky-300'
                        : 'border-rose-200 bg-rose-50/20 hover:border-rose-300'
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Top title & badge icon */}
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-slate-900 text-sm">{pkg.name}</h3>
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-white ${
                            isEconomy
                              ? 'bg-emerald-500'
                              : isStandard
                              ? 'bg-sky-500'
                              : 'bg-rose-500'
                          }`}
                        >
                          {isEconomy && <Crown className="w-3.5 h-3.5" />}
                          {isStandard && <Star className="w-3.5 h-3.5" />}
                          {isLuxury && <Gem className="w-3.5 h-3.5" />}
                        </div>
                      </div>

                      {/* Price */}
                      <div>
                        <div
                          className={`text-lg font-black font-mono ${
                            isEconomy
                              ? 'text-emerald-700'
                              : isStandard
                              ? 'text-sky-700'
                              : 'text-rose-700'
                          }`}
                        >
                          {pkg.priceFormatted}
                          <span className="text-xs text-slate-500 font-normal ml-1">/ bàn</span>
                        </div>
                      </div>

                      {/* Bullets List */}
                      <div className="space-y-1.5 text-xs text-slate-600">
                        {pkg.features.map((feat, idx) => (
                          <div key={idx} className="flex items-center gap-1.5">
                            <span className="text-slate-400">•</span>
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Action Button */}
                    <button
                      onClick={() => onSelectPackageDetail(pkg)}
                      className={`w-full py-2 rounded-xl text-xs font-bold transition-colors border cursor-pointer ${
                        isEconomy
                          ? 'border-emerald-300 bg-white text-emerald-800 hover:bg-emerald-50'
                          : isStandard
                          ? 'border-sky-300 bg-white text-sky-800 hover:bg-sky-50'
                          : 'border-rose-300 bg-white text-rose-800 hover:bg-rose-50'
                      }`}
                    >
                      Xem chi tiết
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section: SẢNH TIỆC */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-rose-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-xs sm:text-sm uppercase tracking-wider text-rose-800 flex items-center gap-2">
                <span>SẢNH TIỆC</span>
              </h2>
              <button
                onClick={() => onNavigateTab('venues')}
                className="text-xs font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1 hover:underline cursor-pointer"
              >
                <span>Xem tất cả</span>
                <span>→</span>
              </button>
            </div>

            {/* Main Featured Venue Card with Image & Details */}
            <div className="space-y-3">
              <div className="relative rounded-2xl overflow-hidden h-56 sm:h-64 border border-slate-100 group">
                <img
                  src={currentVenue.images[0]}
                  alt={currentVenue.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />

                <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-medium flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-rose-300" />
                  <span>{currentVenue.capacityText}</span>
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 text-base">{currentVenue.name}</h3>
                <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>{currentVenue.capacityText}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pt-0.5">
                  {currentVenue.description}
                </p>
              </div>

              {/* Carousel Thumbnails with Prev / Next Arrow buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handlePrevVenue}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 flex items-center justify-center shrink-0 border border-slate-200 transition-colors cursor-pointer"
                  title="Sảnh trước"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="grid grid-cols-4 gap-2 flex-1">
                  {WEDDING_REFERENCE_VENUES.map((venue, idx) => (
                    <button
                      key={venue.id}
                      onClick={() => setCurrentVenueIndex(idx)}
                      className={`relative rounded-xl overflow-hidden h-14 border-2 transition-all cursor-pointer ${
                        currentVenueIndex === idx
                          ? 'border-rose-600 ring-2 ring-rose-300/50 scale-[1.02]'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={venue.images[0]}
                        alt={venue.name}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleNextVenue}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 flex items-center justify-center shrink-0 border border-slate-200 transition-colors cursor-pointer"
                  title="Sảnh tiếp theo"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Col Right (4 cols): ĐƠN ĐẶT TIỆC GẦN ĐÂY + KHUYẾN MÃI HIỆN HÀNH */}
        <div className="lg:col-span-4 space-y-6">
          {/* Section: ĐƠN ĐẶT TIỆC GẦN ĐÂY */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-rose-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-xs uppercase tracking-wider text-rose-800">
                ĐƠN ĐẶT TIỆC GẦN ĐÂY
              </h2>
              <button
                onClick={() => onNavigateTab('orders')}
                className="text-xs font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1 hover:underline cursor-pointer"
              >
                <span>Xem tất cả</span>
                <span>→</span>
              </button>
            </div>

            <div className="space-y-3">
              {displayOrders.map((order, idx) => (
                <div
                  key={idx}
                  onClick={() => onNavigateTab('orders')}
                  className="p-3 rounded-2xl bg-slate-50/70 hover:bg-rose-50/50 border border-slate-100 transition-all flex items-center justify-between gap-3 cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={order.avatar}
                      alt={order.customerName}
                      className="w-10 h-10 rounded-full object-cover border border-rose-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 text-xs truncate group-hover:text-rose-700 transition-colors">
                        {order.customerName}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {order.hallAndTables}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 space-y-1">
                    <div className="text-[10px] text-slate-400 font-medium font-mono">
                      {order.date}
                    </div>
                    <span
                      className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border ${order.statusClass}`}
                    >
                      {order.statusText}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: KHUYẾN MÃI HIỆN HÀNH */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-rose-100 shadow-sm space-y-4">
            <h2 className="font-bold text-xs uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
              <Gift className="w-4 h-4 text-rose-600" />
              <span>KHUYẾN MÃI HIỆN HÀNH</span>
            </h2>

            {/* Pink Soft Gradient Card with Gift Box Image */}
            <div className="rounded-2xl bg-gradient-to-br from-rose-50 via-rose-100/60 to-rose-200/40 p-4 border border-rose-200 relative overflow-hidden flex items-center justify-between gap-3">
              <div className="space-y-1 z-10">
                <div className="text-base font-black text-rose-700">Giảm ngay 5%</div>
                <div className="text-xs text-slate-700 font-medium">Khi đặt tiệc trước 30 ngày</div>
                <div className="text-[11px] text-slate-500">Áp dụng đến hết 31/12/2026</div>

                <div className="pt-2">
                  <button
                    onClick={() => onNavigateTab('promotions')}
                    className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                  >
                    Xem chi tiết
                  </button>
                </div>
              </div>

              {/* 3D Gift Box visual representation */}
              <div className="w-20 h-20 shrink-0 relative flex items-center justify-center">
                <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-300 flex items-center justify-center rotate-6 shadow-sm">
                  <Gift className="w-10 h-10 text-rose-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* ROW 3: DỊCH VỤ ĐI KÈM (6 Cards) */}
      {/* ========================================================= */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-rose-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-xs sm:text-sm uppercase tracking-wider text-rose-800">
            DỊCH VỤ ĐI KÈM
          </h2>
          <button
            onClick={() => onNavigateTab('services')}
            className="text-xs font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1 hover:underline cursor-pointer"
          >
            <span>Xem tất cả các dịch vụ</span>
            <span>→</span>
          </button>
        </div>

        {/* 6 Service Cards Grid (Matching the reference image pills) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {WEDDING_REFERENCE_SERVICES.map((serv) => {
            return (
              <div
                key={serv.id}
                onClick={() => onNavigateTab('services')}
                className={`p-3.5 rounded-2xl border transition-all duration-200 flex flex-col items-center justify-center text-center gap-2.5 cursor-pointer group active:scale-95 ${serv.bgClass} ${serv.borderClass}`}
              >
                <div className={`p-2 rounded-xl bg-white shadow-2xs ${serv.textClass} group-hover:scale-110 transition-transform`}>
                  {serv.iconType === 'decor' && <Flower2 className="w-5 h-5" />}
                  {serv.iconType === 'camera' && <Camera className="w-5 h-5" />}
                  {serv.iconType === 'mc' && <Mic2 className="w-5 h-5" />}
                  {serv.iconType === 'car' && <Car className="w-5 h-5" />}
                  {serv.iconType === 'dress' && <Sparkle className="w-5 h-5" />}
                  {serv.iconType === 'invitation' && <Mail className="w-5 h-5" />}
                </div>

                <div className="font-bold text-slate-800 text-xs leading-snug group-hover:text-rose-800 transition-colors">
                  {serv.title}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================= */}
      {/* ROW 4: FOOTER BANNER (Full width dark rose/ruby banner) */}
      {/* ========================================================= */}
      <footer className="rounded-3xl bg-[#be123c] text-white p-6 sm:p-8 relative overflow-hidden shadow-md">
        {/* Subtle Decorative Rings Watermark */}
        <div className="absolute -right-8 -bottom-8 w-44 h-44 opacity-10 pointer-events-none">
          <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3" className="w-full h-full text-white">
            <circle cx="35" cy="50" r="28" />
            <circle cx="65" cy="50" r="28" />
          </svg>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10 items-start">
          {/* Col 1: ĐỊA CHỈ */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-rose-200">
              <MapPin className="w-4 h-4 text-rose-300" />
              <span>ĐỊA CHỈ</span>
            </div>
            <p className="text-xs text-rose-100 leading-relaxed font-medium">
              KP 9, Phường Lộc Ninh,<br />Thành phố Đồng Nai
            </p>
          </div>

          {/* Col 2: HOTLINE */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-rose-200">
              <Phone className="w-4 h-4 text-rose-300" />
              <span>HOTLINE</span>
            </div>
            <div>
              <a href="tel:0967823801" className="text-sm font-black font-mono text-white hover:text-amber-200 transition-colors">
                0967 823 801
              </a>
              <span className="text-xs text-rose-200 ml-1 font-medium">(Ngọc Nhi)</span>
              <div className="text-[11px] text-rose-200/80 mt-0.5">Tư vấn: 08:00 – 22:00</div>
            </div>
          </div>

          {/* Col 3: KẾT NỐI VỚI CHÚNG TÔI */}
          <div className="space-y-2">
            <div className="text-xs font-black uppercase tracking-wider text-rose-200">
              KẾT NỐI VỚI CHÚNG TÔI
            </div>
            <div className="flex items-center gap-2.5 pt-1">
              {/* Facebook */}
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center font-bold text-xs transition-colors"
                title="Facebook Ngọc Nhi"
              >
                f
              </a>
              {/* Zalo */}
              <a 
                href="https://zalo.me/0967823801" 
                target="_blank" 
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-blue-600/80 hover:bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] transition-colors"
                title="Zalo 0967 823 801"
              >
                Zalo
              </a>
              {/* TikTok */}
              <a 
                href="https://tiktok.com" 
                target="_blank" 
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center font-bold text-xs transition-colors"
                title="TikTok Tiệc Cưới Ngọc Nhi"
              >
                ♪
              </a>
              {/* YouTube */}
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-red-600/90 hover:bg-red-600 text-white flex items-center justify-center font-bold text-xs transition-colors"
                title="Kênh Video Sự Kiện Ngọc Nhi"
              >
                ▶
              </a>
            </div>
          </div>

          {/* Col 4: QUÉT MÃ QR */}
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-xl bg-white p-1.5 shadow-md flex items-center justify-center shrink-0">
              <QrCode className="w-full h-full text-slate-900" />
            </div>
            <div className="space-y-0.5">
              <div className="text-xs font-black uppercase tracking-wider text-rose-200">
                QUÉT MÃ QR
              </div>
              <p className="text-[11px] text-rose-100/90 leading-tight">
                Kết nối nhanh với Ngọc Nhi qua Zalo & Nhận Catalogue 2026
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
