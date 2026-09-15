import React, { useState } from 'react';
import { 
  Home, 
  Gift, 
  Landmark, 
  Utensils, 
  HeartHandshake, 
  ClipboardList, 
  Calendar, 
  Users, 
  Calculator, 
  Tag, 
  PhoneCall, 
  Sparkles, 
  X, 
  CheckCircle2, 
  Send, 
  ChevronRight, 
  Phone,
  Menu as MenuIcon
} from 'lucide-react';
import { MenuItem, WeddingInquiry, WeddingStatus, UserRole } from '../types';
import { 
  WEDDING_REFERENCE_PACKAGES, 
  WEDDING_REFERENCE_VENUES, 
  WEDDING_REFERENCE_SERVICES,
  WeddingPackageItem,
  WeddingVenueItem,
  WeddingServiceAddon
} from './wedding/weddingData';
import { WeddingOverview } from './wedding/WeddingOverview';
import { WeddingPackagesView } from './wedding/WeddingPackagesView';
import { WeddingVenuesView } from './wedding/WeddingVenuesView';
import { WeddingMenuView } from './wedding/WeddingMenuView';
import { WeddingServicesView } from './wedding/WeddingServicesView';
import { WeddingOrdersView } from './wedding/WeddingOrdersView';
import { WeddingScheduleView } from './wedding/WeddingScheduleView';
import { WeddingCustomersView } from './wedding/WeddingCustomersView';
import { WeddingQuickQuoteView } from './wedding/WeddingQuickQuoteView';
import { WeddingPromotionsView } from './wedding/WeddingPromotionsView';
import { WeddingContactView } from './wedding/WeddingContactView';
import { ModuleChatWidget, QuickPrompt } from './chat/ModuleChatWidget';

const WEDDING_QUICK_PROMPTS: QuickPrompt[] = [
  {
    label: '💍 Báo giá bàn tiệc',
    question: 'Tôi muốn xin bảng báo giá các gói tiệc cưới trọn gói?',
    answer: 'Ngọc Nhi cung cấp 4 gói bàn tiệc chuẩn:\n• Gói Hạnh Phúc (Silver): 2.200.000đ/bàn (6 món đặc sản)\n• Gói Như Ý (Gold): 2.800.000đ/bàn (Kèm bia & nước ngọt)\n• Gói Uyên Ương (Diamond): 3.600.000đ/bàn (Sảnh VIP + Hoa tươi)\n• Gói Hoàng Gia (Royal): 4.800.000đ/bàn (Thực đơn Dúi & Hải sản cao cấp).'
  },
  {
    label: '🏰 Xem sảnh tiệc',
    question: 'Trung tâm có những sảnh tiệc nào và sức chứa bao nhiêu khách?',
    answer: 'Ngọc Nhi có 2 không gian chính:\n1. Sảnh Ngọc Nhi 1 (Grand Ballroom): Sức chứa 300 - 500 khách, âm thanh ánh sáng LED 4K sân khấu hiện đại.\n2. Sảnh Sân Vườn Romance: Không gian mở ngoài trời lãng mạn cho 150 - 350 khách.'
  },
  {
    label: '🍲 Nấu tiệc tận nhà',
    question: 'Nhà hàng có nhận nấu tiệc cưới/thôi nôi tận nhà không?',
    answer: 'Có ạ! Chúng tôi nhận nấu tiệc tại gia từ 3 bàn trở lên tại TP. Đồng Nai và lân cận, đầy đủ bàn ghế, dụng cụ tiệc cao cấp và nhân viên phục vụ tận tình, nóng sốt tại chỗ.'
  },
  {
    label: '🎁 Ưu đãi cưới mùa này',
    question: 'Hiện có chương trình khuyến mãi hay quà tặng gì cho tiệc cưới không?',
    answer: '🎁 Đặt từ 15 bàn: Tặng MC dẫn chương trình + Tháp ly sâm panh + Bánh kem 3 tầng.\n🎁 Đặt từ 25 bàn: Tặng thêm gói trang trí hoa tươi đường dẫn sân khấu + Ban nhạc đón khách.\n🎁 Đặt cọc giữ ngày sớm: Giảm ngay 5% trên tổng hóa đơn!'
  },
  {
    label: '📞 Hotline tư vấn',
    question: 'Làm sao để đặt lịch xem sảnh và thử món trực tiếp?',
    answer: 'Quý khách vui lòng gọi Hotline 0967.823.801 hoặc 0969.310.601, hoặc bấm nút "Mở form đặt tiệc nhanh" trên khung chat để chuyên viên xếp lịch đón tiếp chu đáo nhất ạ!'
  }
];

const handleWeddingChatResponse = (text: string): string | null => {
  const lower = text.toLowerCase();
  if (lower.includes('giá') || lower.includes('báo giá') || lower.includes('bàn tiệc') || lower.includes('chi phí') || lower.includes('gói') || lower.includes('bao nhiêu')) {
    return `Ngọc Nhi hiện phục vụ 4 gói tiệc cưới trọn gói chuẩn:\n• Gói Hạnh Phúc: 2.200.000đ/bàn (6 món đặc sản)\n• Gói Như Ý: 2.800.000đ/bàn (Kèm bia & nước ngọt)\n• Gói Uyên Ương: 3.600.000đ/bàn (Sảnh VIP + Hoa tươi)\n• Gói Hoàng Gia: 4.800.000đ/bàn (Thực đơn Dúi & Hải sản cao cấp)\nQuý khách có thể bấm "Mở form đặt tiệc nhanh" ngay góc trên khung chat để gửi yêu cầu đặt ngày nhé!`;
  }
  if (lower.includes('sảnh') || lower.includes('không gian') || lower.includes('khách') || lower.includes('sân khấu') || lower.includes('âm thanh') || lower.includes('led')) {
    return `Trung tâm Tiệc Cưới Ngọc Nhi sở hữu 2 không gian sảnh tiệc nổi bật:\n1. Sảnh Ngọc Nhi 1 (Grand Ballroom): Sức chứa 300 - 500 khách, trần cao lộng lẫy, màn hình LED 4K và dàn âm thanh hiện đại.\n2. Sảnh Sân Vườn Romance: Không gian mở thoáng đãng, lãng mạn cho 150 - 350 khách.\nKính mời quý khách liên hệ hotline 0967.823.801 để đặt lịch xem sảnh thực tế!`;
  }
  if (lower.includes('nấu') || lower.includes('tại gia') || lower.includes('tại nhà') || lower.includes('đám cưới nhà') || lower.includes('thôi nôi') || lower.includes('tân gia') || lower.includes('lưu động')) {
    return `Dịch vụ Nấu tiệc tận nhà của Ngọc Nhi nhận phục vụ từ 3 bàn trở lên tại TP. Đồng Nai và khu vực lân cận:\n• Cung cấp trọn gói bàn ghế inox/chiavari, chén dĩa sứ cao cấp, nhân viên phục vụ tận tình.\n• Bếp trưởng chế biến nóng sốt tại nhà bạn, đảm bảo tiêu chuẩn ATVSTP 100%.`;
  }
  if (lower.includes('ưu đãi') || lower.includes('quà') || lower.includes('khuyến mãi') || lower.includes('giảm giá')) {
    return `Chương trình quà tặng tiệc cưới mùa này tại Ngọc Nhi:\n🎁 Đặt từ 15 bàn: Tặng MC chuyên nghiệp + Tháp sâm panh + Bánh kem 3 tầng.\n🎁 Đặt từ 25 bàn: Tặng thêm gói hoa tươi lối đi sân khấu + Ban nhạc đón khách.\n🎁 Đặt cọc giữ ngày sớm: Giảm ngay 5% trên tổng hóa đơn dịch vụ!`;
  }
  if (lower.includes('địa chỉ') || lower.includes('ở đâu') || lower.includes('vị trí')) {
    return `Địa chỉ Trung tâm Tiệc Cưới & Quán Ăn Ngọc Nhi:\n📍 Khu phố 9, phường Lộc Ninh, TP. Đồng Nai.\n📞 Hotline tư vấn: 0967.823.801 - 0969.310.601\nRất hân hạnh được đón tiếp quý khách!`;
  }
  return null;
};

export interface WeddingModuleProps {
  userRole: UserRole;
  menuItems: MenuItem[];
  onUpdateMenuItem: (item: MenuItem) => void;
  onAddMenuItem: (item: MenuItem) => void;
  onDeleteMenuItem: (itemId: string) => void;
  onBatchReplaceMenuItems?: (newItems: MenuItem[]) => void;
  weddingInquiries: WeddingInquiry[];
  onAddWeddingInquiry: (inquiry: Omit<WeddingInquiry, 'id' | 'code' | 'createdAt' | 'status'>) => WeddingInquiry;
  onUpdateWeddingStatus: (id: string, status: WeddingStatus, deposit?: number) => void;
}

export const WeddingModule: React.FC<WeddingModuleProps> = ({
  userRole,
  menuItems,
  onUpdateMenuItem,
  onAddMenuItem,
  onDeleteMenuItem,
  weddingInquiries,
  onAddWeddingInquiry,
  onUpdateWeddingStatus,
}) => {
  // Navigation tabs matching the reference image sidebar
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Booking Modal State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);
  const [bookingPrefill, setBookingPrefill] = useState<any>(null);
  const [bookingFormData, setBookingFormData] = useState({
    customerName: '',
    phone: '',
    eventDate: '',
    eventTime: 'evening' as 'noon' | 'evening',
    expectedTables: 30,
    expectedGuests: 300,
    venueLocation: 'hall_ngocnhi' as 'hall_ngocnhi' | 'outdoor_garden' | 'home_catering',
    eventType: 'wedding' as 'wedding' | 'engagement' | 'birthday' | 'corporate',
    packageId: 'pkg-standard',
    packageName: 'Gói Phổ Thông (2.000.000đ/bàn)',
    notes: '',
  });

  const [bookingSuccessInquiry, setBookingSuccessInquiry] = useState<WeddingInquiry | null>(null);

  // Navigation Items
  const navItems = [
    { id: 'overview', label: 'Tổng quan', icon: Home },
    { id: 'packages', label: 'Gói tiệc cưới', icon: Gift },
    { id: 'venues', label: 'Sảnh tiệc', icon: Landmark },
    { id: 'menu', label: 'Thực đơn', icon: Utensils },
    { id: 'services', label: 'Dịch vụ đi kèm', icon: HeartHandshake },
    { 
      id: 'orders', 
      label: 'Đơn đặt tiệc', 
      icon: ClipboardList, 
      badge: weddingInquiries.filter(i => i.status === 'new').length > 0 
        ? weddingInquiries.filter(i => i.status === 'new').length 
        : undefined 
    },
    { id: 'schedule', label: 'Lịch đã đặt', icon: Calendar },
    { id: 'customers', label: 'Khách hàng', icon: Users },
    { id: 'quick_quote', label: 'Báo giá nhanh', icon: Calculator },
    { id: 'promotions', label: 'Khuyến mãi', icon: Tag },
    { id: 'contact', label: 'Liên hệ', icon: PhoneCall },
  ];

  const handleOpenBookingModal = (prefill?: any) => {
    if (prefill) {
      setBookingPrefill(prefill);
      if (prefill.pkg) {
        setBookingFormData(prev => ({
          ...prev,
          packageId: prefill.pkg.id,
          packageName: `${prefill.pkg.name} (${prefill.pkg.priceFormatted}/bàn)`
        }));
      }
      if (prefill.venue) {
        setBookingFormData(prev => ({
          ...prev,
          venueLocation: prefill.venue.id === 'venue-nn-garden' ? 'outdoor_garden' : 'hall_ngocnhi',
        }));
      }
    }
    setIsBookingModalOpen(true);
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingFormData.customerName.trim() || !bookingFormData.phone.trim()) return;

    const newInq = onAddWeddingInquiry({
      customerName: bookingFormData.customerName.trim(),
      phone: bookingFormData.phone.trim(),
      eventDate: bookingFormData.eventDate || new Date().toISOString().split('T')[0],
      eventTime: bookingFormData.eventTime,
      expectedGuests: bookingFormData.expectedTables * 10,
      expectedTables: Number(bookingFormData.expectedTables) || 30,
      venueLocation: bookingFormData.venueLocation,
      eventType: bookingFormData.eventType,
      packageId: bookingFormData.packageId,
      packageName: bookingFormData.packageName,
      notes: bookingFormData.notes.trim() || undefined,
    });

    setBookingSuccessInquiry(newInq);
  };

  const handleQuickInquiryFromOverview = (formData: {
    customerName: string;
    phone: string;
    eventDate: string;
    guestCount: number;
    packageId: string;
  }) => {
    const pkg = WEDDING_REFERENCE_PACKAGES.find(p => p.id === formData.packageId) || WEDDING_REFERENCE_PACKAGES[1];
    const tables = Math.round(formData.guestCount / 10) || 30;

    onAddWeddingInquiry({
      customerName: formData.customerName,
      phone: formData.phone,
      eventDate: formData.eventDate,
      eventTime: 'evening',
      expectedGuests: formData.guestCount,
      expectedTables: tables,
      venueLocation: 'hall_ngocnhi',
      eventType: 'wedding',
      packageId: pkg.id,
      packageName: `${pkg.name} (${pkg.priceFormatted}/bàn)`,
      notes: 'Đăng ký nhanh từ Trang Tổng Quan',
    });
  };

  return (
    <div className="min-h-screen pb-12">
      {/* Mobile Toggle Button */}
      <div className="lg:hidden mb-4 flex items-center justify-between bg-white p-3 rounded-2xl border border-rose-200 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            💍
          </div>
          <div>
            <div className="font-bold text-slate-900 text-xs">Tiệc Cưới Ngọc Nhi</div>
            <div className="text-[10px] text-rose-700 font-semibold">Nâng tầm hạnh phúc</div>
          </div>
        </div>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-xl bg-rose-50 text-rose-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
        >
          <MenuIcon className="w-4 h-4" />
          <span>Danh Mục</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ========================================================= */}
        {/* LEFT SIDEBAR (Matching reference image navigation & style) */}
        {/* ========================================================= */}
        <aside
          className={`lg:col-span-3 space-y-4 ${
            isMobileMenuOpen ? 'block' : 'hidden lg:block'
          }`}
        >
          {/* Logo & Brand Header Card */}
          <div className="bg-white rounded-3xl p-5 border border-rose-100 shadow-xs space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-600 to-rose-800 text-white flex items-center justify-center shadow-md shadow-rose-600/20 text-lg">
                💍
              </div>
              <div>
                <h1 className="font-black text-rose-700 text-sm tracking-wide uppercase font-serif">
                  TIỆC CƯỚI NGỌC NHI
                </h1>
                <p className="text-[11px] text-slate-500 italic">Nâng tầm hạnh phúc</p>
              </div>
            </div>

            {/* Navigation Menu List */}
            <nav className="space-y-1 pt-2 border-t border-slate-100">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-between gap-3 cursor-pointer text-left ${
                      isActive
                        ? 'bg-rose-600 text-white shadow-md shadow-rose-600/25'
                        : 'text-slate-700 hover:bg-rose-50 hover:text-rose-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>

                    {item.badge !== undefined && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        isActive ? 'bg-white text-rose-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Bottom Consulting & Hotline Card (Exact match to reference image) */}
          <div className="rounded-3xl bg-[#fff1f2] border border-[#fecdd3] p-4 space-y-3">
            <div className="space-y-1">
              <h2 className="font-bold text-xs text-rose-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                <span>Tư vấn & đặt tiệc</span>
              </h2>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Đội ngũ Ngọc Nhi luôn sẵn sàng hỗ trợ và tư vấn tận tâm!
              </p>
            </div>

            <div className="flex items-center gap-2.5 pt-1">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80"
                alt="Ngọc Nhi"
                className="w-9 h-9 rounded-full object-cover border-2 border-rose-300 shadow-2xs shrink-0"
              />
              <div className="min-w-0">
                <div className="text-[11px] font-bold text-slate-900 truncate">Giám đốc: Ngọc Nhi</div>
                <div className="text-[10px] text-rose-700 font-medium truncate">Cố vấn trưởng</div>
              </div>
            </div>

            <a
              href="tel:0967823801"
              className="w-full py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>0967 823 801</span>
            </a>
          </div>
        </aside>

        {/* ========================================================= */}
        {/* RIGHT MAIN CONTENT AREA */}
        {/* ========================================================= */}
        <main className="lg:col-span-9 space-y-6">
          {activeTab === 'overview' && (
            <WeddingOverview
              userRole={userRole}
              weddingInquiries={weddingInquiries}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onOpenBookingModal={handleOpenBookingModal}
              onSelectPackageDetail={(pkg) => {
                setActiveTab('packages');
              }}
              onSelectVenueDetail={(venue) => {
                setActiveTab('venues');
              }}
              onSubmitQuickInquiry={handleQuickInquiryFromOverview}
            />
          )}

          {activeTab === 'packages' && (
            <WeddingPackagesView
              userRole={userRole}
              onSelectPackageForBooking={(pkg) => {
                handleOpenBookingModal({ pkg });
              }}
            />
          )}

          {activeTab === 'venues' && (
            <WeddingVenuesView
              userRole={userRole}
              onBookVenue={(venue) => {
                handleOpenBookingModal({ venue });
              }}
            />
          )}

          {activeTab === 'menu' && (
            <WeddingMenuView
              userRole={userRole}
              menuItems={menuItems}
              onUpdateMenuItem={onUpdateMenuItem}
              onAddMenuItem={onAddMenuItem}
              onDeleteMenuItem={onDeleteMenuItem}
            />
          )}

          {activeTab === 'services' && (
            <WeddingServicesView
              userRole={userRole}
              onBookService={(serv) => {
                handleOpenBookingModal({ service: serv });
              }}
            />
          )}

          {activeTab === 'orders' && (
            <WeddingOrdersView
              userRole={userRole}
              weddingInquiries={weddingInquiries}
              onUpdateWeddingStatus={onUpdateWeddingStatus}
              onOpenBookingModal={() => handleOpenBookingModal()}
            />
          )}

          {activeTab === 'schedule' && (
            <WeddingScheduleView
              userRole={userRole}
              weddingInquiries={weddingInquiries}
              onOpenBookingModal={() => handleOpenBookingModal()}
            />
          )}

          {activeTab === 'customers' && (
            <WeddingCustomersView
              userRole={userRole}
              weddingInquiries={weddingInquiries}
            />
          )}

          {activeTab === 'quick_quote' && (
            <WeddingQuickQuoteView
              userRole={userRole}
              onSendQuoteRequest={(quoteData) => {
                onAddWeddingInquiry({
                  customerName: quoteData.customerName,
                  phone: quoteData.phone,
                  eventDate: quoteData.eventDate,
                  eventTime: 'evening',
                  expectedGuests: quoteData.tableCount * 10,
                  expectedTables: quoteData.tableCount,
                  venueLocation: 'hall_ngocnhi',
                  eventType: 'wedding',
                  packageId: quoteData.packageId,
                  packageName: quoteData.packageName,
                  notes: `Dự toán tự động: ${quoteData.grandTotal.toLocaleString('vi-VN')}đ (${quoteData.selectedServices.length} dịch vụ đi kèm)`,
                });
              }}
            />
          )}

          {activeTab === 'promotions' && (
            <WeddingPromotionsView
              userRole={userRole}
              onSelectPromo={(promo) => {
                handleOpenBookingModal({ promo });
              }}
            />
          )}

          {activeTab === 'contact' && (
            <WeddingContactView
              userRole={userRole}
              onSendMessage={(msg) => {
                onAddWeddingInquiry({
                  customerName: msg.name,
                  phone: msg.phone,
                  eventDate: new Date().toISOString().split('T')[0],
                  eventTime: 'evening',
                  expectedGuests: 300,
                  expectedTables: 30,
                  venueLocation: 'hall_ngocnhi',
                  eventType: 'wedding',
                  notes: `Tin nhắn liên hệ: ${msg.message} (Email: ${msg.email || 'N/A'})`,
                });
              }}
            />
          )}
        </main>
      </div>

      {/* ========================================================= */}
      {/* GLOBAL BOOKING / INQUIRY MODAL */}
      {/* ========================================================= */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 shadow-2xl animate-in zoom-in-95 my-auto max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">
                  Trung Tâm Yến Tiệc Ngọc Nhi
                </span>
                <h3 className="font-bold text-slate-900 text-lg font-serif">
                  Phiếu Đăng Ký Tư Vấn & Đặt Tiệc
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsBookingModalOpen(false);
                  setBookingSuccessInquiry(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {bookingSuccessInquiry ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3 animate-in zoom-in-95">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-emerald-900 text-base">Đăng Ký Thành Công!</h4>
                <div className="p-3 bg-white rounded-xl border border-emerald-200 text-xs font-mono font-bold text-rose-700">
                  Mã phiếu: {bookingSuccessInquiry.code}
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Cảm ơn <strong>{bookingSuccessInquiry.customerName}</strong>. Giám đốc Ngọc Nhi sẽ liên hệ qua số điện thoại <strong>{bookingSuccessInquiry.phone}</strong> trong vòng 15 phút để tư vấn phối cảnh hoa tươi và gửi bảng báo giá chi tiết.
                </p>
                <button
                  onClick={() => {
                    setIsBookingModalOpen(false);
                    setBookingSuccessInquiry(null);
                  }}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                >
                  Đóng Cửa Sổ
                </button>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-3.5 text-xs overflow-y-auto pr-1 flex-1">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Họ và tên cô dâu / chú rể <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Hoàng Long & Mỹ Duyên"
                    value={bookingFormData.customerName}
                    onChange={(e) => setBookingFormData({ ...bookingFormData, customerName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Số điện thoại <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="0913xxxxxx"
                      value={bookingFormData.phone}
                      onChange={(e) => setBookingFormData({ ...bookingFormData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Số bàn dự kiến <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="150"
                      required
                      value={bookingFormData.expectedTables}
                      onChange={(e) => setBookingFormData({ ...bookingFormData, expectedTables: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Ngày tổ chức</label>
                    <input
                      type="date"
                      required
                      value={bookingFormData.eventDate}
                      onChange={(e) => setBookingFormData({ ...bookingFormData, eventDate: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Ca tiệc</label>
                    <select
                      value={bookingFormData.eventTime}
                      onChange={(e) => setBookingFormData({ ...bookingFormData, eventTime: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-rose-500"
                    >
                      <option value="noon">Ca Trưa (11:00 – 14:00)</option>
                      <option value="evening">Ca Tối (17:30 – 21:30)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Gói tiệc mâm cỗ</label>
                  <select
                    value={bookingFormData.packageId}
                    onChange={(e) => {
                      const sel = WEDDING_REFERENCE_PACKAGES.find(p => p.id === e.target.value);
                      setBookingFormData({
                        ...bookingFormData,
                        packageId: e.target.value,
                        packageName: sel ? `${sel.name} (${sel.priceFormatted}/bàn)` : 'Gói Tiệc Cưới'
                      });
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-rose-500"
                  >
                    {WEDDING_REFERENCE_PACKAGES.map((pkg) => (
                      <option key={pkg.id} value={pkg.id}>
                        {pkg.name} ({pkg.priceFormatted}/Bàn)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Địa điểm / Không gian sảnh</label>
                  <select
                    value={bookingFormData.venueLocation}
                    onChange={(e) => setBookingFormData({ ...bookingFormData, venueLocation: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-rose-500"
                  >
                    <option value="hall_ngocnhi">Sảnh Ngọc Nhi 1 (Grand Ballroom - 300 - 500 khách)</option>
                    <option value="outdoor_garden">Sảnh Sân Vườn Romance (150 - 350 khách)</option>
                    <option value="home_catering">Nấu Tiệc Tận Nhà Khách Hàng (Đồng Nai & lân cận)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ghi chú & Yêu cầu hoa tươi / MC / Tone màu</label>
                  <textarea
                    rows={2}
                    placeholder="Ví dụ: Tone màu chủ đạo hồng pastel, cần chuẩn bị lễ gia tiên..."
                    value={bookingFormData.notes}
                    onChange={(e) => setBookingFormData({ ...bookingFormData, notes: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="pt-2 border-t border-slate-100 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsBookingModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Gửi Phiếu Đặt Tiệc</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Floating Chat Tư vấn Trực tuyến Phân Hệ Tiệc Cưới */}
      <ModuleChatWidget
        module="wedding"
        title="Tư Vấn Tiệc Cưới & Sự Kiện Ngọc Nhi"
        subtitle="Quản lý Ngọc Nhi • Hỗ trợ 24/7"
        avatarIcon={<Sparkles className="w-5 h-5 text-amber-200" />}
        headerGradientClass="bg-gradient-to-r from-rose-700 via-pink-700 to-amber-700"
        accentColorClass="bg-rose-600 hover:bg-rose-700"
        hotline="0967823801"
        hotlineFormatted="0967.823.801 - 0969.310.601"
        initialMessage="Kính chào quý khách! Trung tâm Tiệc Cưới & Sự Kiện Ngọc Nhi rất vinh hạnh được đồng hành cùng ngày trọng đại của bạn. Chúng tôi cung cấp các gói bàn tiệc trọn gói, sảnh tiệc lộng lẫy, thực đơn đa dạng và dịch vụ nấu tiệc tại gia. Quý khách cần hỗ trợ tư vấn ngày nào ạ?"
        quickPrompts={WEDDING_QUICK_PROMPTS}
        smartResponseHandler={handleWeddingChatResponse}
        onSpecialAction={() => setIsBookingModalOpen(true)}
        specialActionLabel="Mở form gửi thông tin đặt tiệc nhanh"
      />
    </div>
  );
};
