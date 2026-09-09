import React, { useState } from 'react';
import { 
  TableBooking, 
  TableBookingStatus, 
  MenuItem, 
  RestaurantOrderItem 
} from '../../types';
import { 
  ChefHat, 
  CheckCircle2, 
  AlertCircle, 
  Phone, 
  MessageSquare, 
  Printer, 
  Send, 
  Save, 
  Sparkles, 
  Clock, 
  MapPin, 
  Users, 
  Check, 
  Copy,
  UtensilsCrossed,
  X,
  XCircle,
  RotateCcw,
  AlertTriangle
} from 'lucide-react';
import { SYSTEM_INFO } from '../../data/initialData';

const PREDEFINED_REJECTION_REASONS = [
  'Nhà hàng đã kín bàn / hết chỗ trong khung giờ yêu cầu',
  'Tạm hết nguyên liệu Dúi tươi thương phẩm / Món ăn khách chọn',
  'Nhà hàng có tiệc cưới / sự kiện trọn gói đột xuất, ngưng nhận khách lẻ',
  'Khu vực khách yêu cầu (Phòng VIP / Chòi riêng) đã kín',
  'Ngoài khung giờ phục vụ của nhà hàng',
  'Khách đặt quá sát giờ, bếp chưa kịp chuẩn bị nguyên liệu tươi',
  'Lý do khác (tự nhập cụ thể)'
];

interface BookingActionSyncPanelProps {
  booking: TableBooking;
  menuItems: MenuItem[];
  onUpdateBooking: (bookingId: string, status: TableBookingStatus, updates?: Partial<TableBooking>) => void;
  onRefreshData?: () => void;
}

export const BookingActionSyncPanel: React.FC<BookingActionSyncPanelProps> = ({
  booking,
  menuItems,
  onUpdateBooking,
  onRefreshData
}) => {
  // State for assigned table number
  const [tableNumber, setTableNumber] = useState<string>(booking.tableNumber || '');
  
  // State for admin note to customer
  const [adminNote, setAdminNote] = useState<string>(
    booking.adminNote || (booking.tableNumber 
      ? `Nhà hàng đã giữ ${booking.tableNumber} (${booking.tableArea || 'Khu sân vườn'}) và chuẩn bị sẵn sàng đón quý khách lúc ${booking.bookingTime}!`
      : '')
  );

  // Dishes confirmed override
  const [dishesConfirmed, setDishesConfirmed] = useState<boolean>(booking.dishesConfirmed || false);
  
  // Kitchen status
  const [kitchenStatus, setKitchenStatus] = useState<string>(booking.kitchenStatus || 'pending');

  // UI feedback states
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string>('');
  const [copiedZaloMsg, setCopiedZaloMsg] = useState<boolean>(false);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);

  // Rejection Workflow State
  const [showRejectModal, setShowRejectModal] = useState<boolean>(false);
  const [selectedRejectReason, setSelectedRejectReason] = useState<string>(
    booking.rejectionReason || PREDEFINED_REJECTION_REASONS[0]
  );
  const [customRejectReason, setCustomRejectReason] = useState<string>('');
  const [rejectCustomNote, setRejectCustomNote] = useState<string>(
    booking.rejectionCustomNote || `Rất tiếc nhà hàng chưa thể tiếp nhận phiếu đặt này lúc ${booking.bookingTime}. Kính mời quý khách đổi sang khung giờ khác hoặc chọn lại món nhé!`
  );

  // Handle Reject Confirmation
  const handleConfirmReject = () => {
    const finalReason = selectedRejectReason === 'Lý do khác (tự nhập cụ thể)' && customRejectReason.trim()
      ? customRejectReason.trim()
      : selectedRejectReason;

    const nowStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString('vi-VN');
    const finalNote = rejectCustomNote.trim() || `Nhà hàng chưa thể tiếp nhận vì: ${finalReason}. Kính mong quý khách thông cảm!`;

    const updates: Partial<TableBooking> = {
      rejectionReason: finalReason,
      rejectionCustomNote: rejectCustomNote.trim() || undefined,
      adminNote: finalNote,
      rejectedAt: nowStr,
      lastSyncAt: nowStr,
      customerAction: undefined
    };

    onUpdateBooking(booking.id, 'cancelled', updates);
    setShowRejectModal(false);
    setSyncSuccessMsg(`Đã gửi phản hồi không tiếp nhận đơn kèm lý do tới khách hàng lúc ${nowStr}!`);
    setTimeout(() => setSyncSuccessMsg(''), 4500);

    if (onRefreshData) onRefreshData();
  };

  // Handle Re-opening a previously rejected booking
  const handleReopenBooking = () => {
    const nowStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString('vi-VN');
    const updates: Partial<TableBooking> = {
      rejectionReason: undefined,
      rejectionCustomNote: undefined,
      adminNote: `Nhà hàng đã tiếp nhận lại phiếu đặt bàn #${booking.code} và sẵn sàng phục vụ quý khách lúc ${booking.bookingTime}!`,
      lastSyncAt: nowStr,
      customerAction: undefined
    };

    onUpdateBooking(booking.id, 'confirmed', updates);
    setSyncSuccessMsg(`Đã mở lại và tiếp nhận phiếu đặt bàn #${booking.code}!`);
    setTimeout(() => setSyncSuccessMsg(''), 4500);

    if (onRefreshData) onRefreshData();
  };

  // Quick templates for admin message
  const quickTemplates = [
    `Nhà hàng đã giữ ${tableNumber || 'bàn đẹp'} khu ${booking.tableArea || 'sân vườn'} và chuẩn bị 2 món Dúi nóng sốt lúc ${booking.bookingTime}. Hân hạnh đón tiếp!`,
    `Bàn tiệc của quý khách đã được bố trí sẵn sàng. Bếp đã chuẩn bị xong nguyên liệu tươi ngon theo yêu cầu.`,
    `Nhà hàng đã giữ chỗ thành công cho đoàn ${booking.guestCount} khách. Xin vui lòng đến đúng giờ ${booking.bookingTime} để món ăn ngon nhất!`
  ];

  // Quick table suggestions based on area
  const suggestedTables = booking.tableArea?.includes('VIP')
    ? ['Bàn VIP-01', 'Bàn VIP-02', 'Bàn VIP-03', 'Phòng Lạnh 01']
    : ['Bàn SV-01', 'Bàn SV-02', 'Bàn SV-03', 'Bàn SV-04 (Chòi)', 'Bàn VIP-01'];

  // Handle Save & Synchronize with Customer
  const handleSaveAndSync = (newStatus?: TableBookingStatus) => {
    const targetStatus = newStatus || booking.status;
    const nowStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString('vi-VN');

    const updates: Partial<TableBooking> = {
      tableNumber: tableNumber.trim() || undefined,
      adminNote: adminNote.trim() || undefined,
      dishesConfirmed: dishesConfirmed,
      kitchenStatus: kitchenStatus as any,
      lastSyncAt: nowStr,
    };

    onUpdateBooking(booking.id, targetStatus, updates);

    // Provide user feedback
    setSyncSuccessMsg(`Đã đồng bộ thành công với khách hàng lúc ${nowStr}!`);
    setTimeout(() => {
      setSyncSuccessMsg('');
    }, 4500);

    if (onRefreshData) onRefreshData();
  };

  // Generate Zalo / SMS message
  const generateConfirmationMessage = () => {
    const dishesText = booking.preOrderItems && booking.preOrderItems.length > 0
      ? `\n- Món đã duyệt chuẩn bị: ${booking.preOrderItems.map(i => `${i.quantity}x ${i.name}`).join(', ')} (Tổng: ${(booking.preOrderTotal || 0).toLocaleString('vi-VN')}đ)`
      : '';
    const noteText = adminNote ? `\n- Lời nhắn từ nhà hàng: ${adminNote}` : '';
    const assignedTable = tableNumber ? `\n- Vị trí bàn: ${tableNumber} (${booking.tableArea || 'Khu sân vườn'})` : `\n- Khu vực: ${booking.tableArea || 'Khu sân vườn'}`;

    return `[NHÀ HÀNG & TRANG TRẠI PHAN DŨNG]
Kính gửi Quý khách: ${booking.customerName}!
Nhà hàng đã xác nhận phiếu đặt bàn #${booking.code}:
- Thời gian: ${booking.bookingTime} ngày ${booking.bookingDate}
- Số lượng: ${booking.guestCount} khách${assignedTable}${dishesText}${noteText}
Hotline hỗ trợ: ${SYSTEM_INFO.phoneHotline}.
Rất hân hạnh được phục vụ Quý khách!`;
  };

  const handleCopyZalo = () => {
    const msg = generateConfirmationMessage();
    navigator.clipboard.writeText(msg).then(() => {
      setCopiedZaloMsg(true);
      setTimeout(() => setCopiedZaloMsg(false), 3500);
      
      // Clean phone number
      const cleanPhone = booking.phone.replace(/[^0-9]/g, '');
      if (cleanPhone) {
        window.open(`https://zalo.me/${cleanPhone}`, '_blank');
      }
    }).catch(() => {
      alert('Đã sao chép tin nhắn xác nhận!');
    });
  };

  return (
    <div className="mt-3 pt-3 border-t border-slate-200/80 space-y-3 bg-gradient-to-b from-blue-50/40 to-slate-50/60 p-3.5 rounded-2xl border border-blue-100">
      {/* Header bar of Sync Action Panel */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900">
              Thao Tác Tiếp Theo & Đồng Bộ Với Khách Hàng
            </span>
            <span className="text-[10px] text-slate-500 ml-2">
              (Mọi cập nhật sẽ hiển thị tức thì khi khách tra cứu phiếu #{booking.code})
            </span>
          </div>
        </div>

        {booking.lastSyncAt && (
          <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Đồng bộ gần nhất: {booking.lastSyncAt}</span>
          </div>
        )}
      </div>

      {/* SUCCESS BANNER NOTIFICATION */}
      {syncSuccessMsg && (
        <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-900 text-xs font-semibold flex items-center justify-between border border-emerald-300 animate-fadeIn shadow-xs">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{syncSuccessMsg}</span>
          </div>
          <span className="text-[10px] bg-emerald-200/70 text-emerald-950 px-2 py-0.5 rounded-full font-bold">
            Khách hàng xem được ngay
          </span>
        </div>
      )}

      {/* REJECTED STATUS NOTIFICATION BANNER */}
      {(booking.status === 'cancelled' || booking.rejectionReason) && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-xs text-rose-950 space-y-2 animate-fadeIn shadow-xs">
          <div className="flex items-center justify-between font-bold text-rose-900 flex-wrap gap-1">
            <span className="flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Đơn này đã được xử lý: Không tiếp nhận</span>
            </span>
            {booking.rejectedAt && (
              <span className="text-[10px] text-rose-700 font-mono font-medium">Từ chối lúc: {booking.rejectedAt}</span>
            )}
          </div>
          {booking.rejectionReason && (
            <p className="text-rose-900 font-medium">
              <strong>Lý do từ chối:</strong> {booking.rejectionReason}
            </p>
          )}
          {booking.adminNote && (
            <p className="text-rose-800 italic bg-white/80 p-2 rounded-lg border border-rose-200">
              "{booking.adminNote}"
            </p>
          )}
          <div className="flex items-center justify-between pt-1 border-t border-rose-200 flex-wrap gap-2">
            <span className="text-[10px] text-rose-600">Khách hàng sẽ thấy lý do này và có nút chọn món đặt lại hoặc đổi lịch.</span>
            <button
              type="button"
              onClick={handleReopenBooking}
              className="px-3 py-1 rounded-lg bg-white hover:bg-rose-100 text-rose-800 border border-rose-300 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
            >
              <RotateCcw className="w-3 h-3 text-rose-600" />
              <span>Mở lại & Tiếp nhận đơn</span>
            </button>
          </div>
        </div>
      )}

      {/* SECTION 1: XỬ LÝ MÓN ĂN & NGUYÊN LIỆU (ĐẶC BIỆT KHI CẢNH BÁO TẠM HẾT) */}
      {booking.preOrderItems && booking.preOrderItems.length > 0 && (
        <div className="p-3 rounded-xl bg-white border border-amber-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-1">
            <span className="text-[11px] font-bold text-amber-950 flex items-center gap-1.5">
              <ChefHat className="w-4 h-4 text-amber-700" />
              <span>Xử lý {booking.preOrderItems.length} món đặt trước ({(booking.preOrderTotal || 0).toLocaleString('vi-VN')}đ)</span>
            </span>

            {dishesConfirmed ? (
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] border border-emerald-300 flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-600" />
                Đã duyệt nguyên liệu & Bếp nhận nấu
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px] border border-amber-300 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-amber-600" />
                Cần duyệt nguyên liệu với Bếp
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-1">
            <p className="text-[11px] text-slate-600">
              {dishesConfirmed ? (
                <span className="text-emerald-800 font-medium">
                  ✓ Bếp trưởng đã chốt giữ nguyên liệu Dúi tươi ngon để nấu cho khách lúc {booking.bookingTime}.
                </span>
              ) : (
                <span className="text-amber-800 font-medium">
                  ⚠️ Nếu kho thương phẩm báo tạm hết nhưng thực tế quán còn Dúi hoặc chuẩn bị kịp, bấm nút bên cạnh để duyệt cho khách:
                </span>
              )}
            </p>

            <button
              type="button"
              onClick={() => {
                const nextState = !dishesConfirmed;
                setDishesConfirmed(nextState);
                if (nextState) {
                  setAdminNote(prev => prev || `Nhà hàng đã xác nhận 2 món Dúi và chuẩn bị bàn chu đáo đón quý khách lúc ${booking.bookingTime}!`);
                }
              }}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs shrink-0 cursor-pointer ${
                dishesConfirmed
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                  : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white active:scale-95'
              }`}
            >
              <ChefHat className="w-3.5 h-3.5" />
              <span>{dishesConfirmed ? '✓ Bếp đã nhận nấu (Bấm để hủy)' : '✓ Bếp Nhận Nấu & Duyệt Món'}</span>
            </button>
          </div>
        </div>
      )}

      {/* SECTION 2: GÁN SỐ BÀN & CẬP NHẬT TIẾN TRÌNH */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* Sub-col 1: Gán số bàn */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-1.5">
          <label className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-blue-600" />
              <span>Gán số bàn cụ thể cho khách:</span>
            </span>
            {tableNumber && (
              <span className="text-[10px] text-blue-700 font-mono font-bold">Đã gán: {tableNumber}</span>
            )}
          </label>
          <div className="flex gap-1.5">
            <input
              type="text"
              placeholder="VD: Bàn SV-02, Bàn VIP-01..."
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none font-medium bg-slate-50"
            />
          </div>
          {/* Quick Table Selection Tags */}
          <div className="flex items-center gap-1 flex-wrap pt-0.5">
            <span className="text-[9px] text-slate-400 font-medium">Gợi ý nhanh:</span>
            {suggestedTables.map((t, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setTableNumber(t)}
                className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors ${
                  tableNumber === t 
                    ? 'bg-blue-600 text-white border-blue-600 font-bold' 
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Sub-col 2: Tiến trình trạng thái (Workflow Stepper) */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-1.5">
          <label className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-indigo-600" />
              <span>Chuyển tiến trình tiếp theo:</span>
            </span>
            <span className="text-[10px] font-bold text-slate-500 uppercase">
              Hiện tại: {
                booking.status === 'new' ? 'Mới nhận' :
                booking.status === 'confirmed' ? 'Đã xác nhận' :
                booking.status === 'serving' ? 'Đang phục vụ' :
                booking.status === 'completed' ? 'Đã hoàn tất' : 'Đã hủy'
              }
            </span>
          </label>
          
          <div className="grid grid-cols-2 gap-1.5 pt-0.5">
            <button
              type="button"
              onClick={() => handleSaveAndSync('confirmed')}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                booking.status === 'confirmed'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>1. Xác nhận & Giữ bàn</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setKitchenStatus('preparing');
                handleSaveAndSync('confirmed');
              }}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                kitchenStatus === 'preparing'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-amber-50 hover:text-amber-800 border border-slate-200'
              }`}
            >
              <ChefHat className="w-3.5 h-3.5" />
              <span>2. Báo Bếp Nấu</span>
            </button>

            <button
              type="button"
              onClick={() => handleSaveAndSync('serving')}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                booking.status === 'serving'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-800 border border-slate-200'
              }`}
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>3. Đang Phục Vụ</span>
            </button>

            <button
              type="button"
              onClick={() => handleSaveAndSync('completed')}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                booking.status === 'completed'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-purple-50 hover:text-purple-800 border border-slate-200'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>4. Hoàn Tất</span>
            </button>
          </div>

          {/* Action Row: Không Tiếp Nhận Đơn */}
          <div className="pt-2 border-t border-slate-100">
            {booking.status === 'cancelled' ? (
              <button
                type="button"
                onClick={handleReopenBooking}
                className="w-full py-1.5 px-3 rounded-lg text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
                <span>Mở lại &amp; Tiếp nhận đơn</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowRejectModal(true)}
                className="w-full py-1.5 px-3 rounded-lg text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 border border-rose-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                <span>❌ Không Tiếp Nhận Đơn (Từ chối &amp; Báo lý do)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 3: PHẢN HỒI GỬI KHÁCH HÀNG (ADMIN NOTE) */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
            <span>Phản hồi gửi khách hàng (Hiển thị khi khách tra cứu):</span>
          </label>
          <span className="text-[10px] text-slate-400">Chọn mẫu nhanh hoặc tự nhập:</span>
        </div>

        <textarea
          rows={2}
          value={adminNote}
          onChange={(e) => setAdminNote(e.target.value)}
          placeholder="Nhập lời nhắn hoặc ghi chú phản hồi gửi khách hàng..."
          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-blue-500 focus:outline-none bg-slate-50 text-slate-800 leading-relaxed"
        />

        {/* Quick template buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] text-slate-400 font-semibold">Mẫu nhanh:</span>
          {quickTemplates.map((tpl, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setAdminNote(tpl)}
              className="text-[10px] px-2 py-1 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-left transition-colors truncate max-w-xs"
              title={tpl}
            >
              Mẫu {idx + 1}: {tpl.slice(0, 32)}...
            </button>
          ))}
        </div>
      </div>

      {/* SECTION 4: NÚT HÀNH ĐỘNG ĐỒNG BỘ VÀ KÊNH LIÊN LẠC */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-1">
        {/* Left: Contact actions */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Zalo button */}
          <button
            type="button"
            onClick={handleCopyZalo}
            className="px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-xs flex items-center gap-1.5 border border-blue-200 transition-colors shadow-2xs cursor-pointer active:scale-95"
            title="Mở Zalo và gửi tin nhắn xác nhận cho khách"
          >
            <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
            <span>{copiedZaloMsg ? '✓ Đã chép & Mở Zalo' : 'Gửi Zalo cho khách'}</span>
          </button>

          {/* Call button */}
          <a
            href={`tel:${booking.phone}`}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 border border-slate-200 transition-colors shadow-2xs"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-600" />
            <span>Gọi {booking.phone}</span>
          </a>

          {/* Print ticket button */}
          <button
            type="button"
            onClick={() => setShowPrintModal(true)}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 border border-slate-200 transition-colors shadow-2xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>In Phiếu Bàn / Lệnh Bếp</span>
          </button>
        </div>

        {/* Right: Master Save & Sync button */}
        <button
          type="button"
          onClick={() => handleSaveAndSync()}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Lưu &amp; Đồng Bộ Ngay Cho Khách</span>
        </button>
      </div>

      {/* PRINT TICKET MODAL */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-blue-600" />
                <h4 className="font-bold text-base text-slate-900">Phiếu Đặt Bàn &amp; Lệnh Bếp</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable ticket paper design */}
            <div className="p-4 rounded-2xl bg-amber-50/50 border border-dashed border-amber-300 font-mono text-xs space-y-2 text-slate-800">
              <div className="text-center pb-2 border-b border-dashed border-amber-300">
                <p className="font-bold text-sm text-slate-900">NHÀ HÀNG &amp; NÔNG TRẠI SINH THÁI PHAN DŨNG</p>
                <p className="text-[10px] text-slate-500">ĐC: Thôn 2, Xã Ea Kao, TP. Buôn Ma Thuột</p>
                <p className="text-[10px] text-slate-500">Hotline: {SYSTEM_INFO.phoneHotline}</p>
                <div className="mt-1.5 inline-block font-bold bg-amber-200/80 px-2 py-0.5 rounded text-[11px] text-amber-950">
                  PHIẾU BÀN: #{booking.code}
                </div>
              </div>

              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Khách hàng:</span>
                  <strong>{booking.customerName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Điện thoại:</span>
                  <strong>{booking.phone}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Thời gian đến:</span>
                  <strong className="text-blue-900">{booking.bookingTime} • {booking.bookingDate}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Số lượng:</span>
                  <strong>{booking.guestCount} Khách</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Vị trí bàn:</span>
                  <strong className="text-emerald-800">{tableNumber || 'Chưa gán'} ({booking.tableArea || 'Sân vườn'})</strong>
                </div>
              </div>

              {booking.preOrderItems && booking.preOrderItems.length > 0 && (
                <div className="pt-2 border-t border-dashed border-amber-300 space-y-1">
                  <div className="font-bold text-[11px] text-amber-900 flex justify-between">
                    <span>LỆNH BẾP NẤU TRƯỚC:</span>
                    <span>{(booking.preOrderTotal || 0).toLocaleString('vi-VN')}đ</span>
                  </div>
                  {booking.preOrderItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-[11px] pl-1">
                      <span>• {item.quantity}x {item.name}</span>
                      <span>{(item.price * item.quantity).toLocaleString('vi-VN')}đ</span>
                    </div>
                  ))}
                </div>
              )}

              {adminNote && (
                <div className="pt-2 border-t border-dashed border-amber-300 text-[10px] italic">
                  <strong>Lời nhắn cho khách:</strong> {adminNote}
                </div>
              )}

              <div className="pt-2 border-t border-dashed border-amber-300 text-center text-[10px] text-slate-500">
                Chúc Quý Khách Có Bữa Ăn Ngon Miệng!
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>In Phiếu Ngay</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECTION REASON MODAL */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-rose-100 flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-slate-900">Không Tiếp Nhận Phiếu Đặt Bàn</h4>
                  <p className="text-xs text-slate-500">Mã phiếu: #{booking.code} • Khách: {booking.customerName}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Prompt explanation */}
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <p>
                Lý do từ chối sẽ được <strong>đồng bộ ngay lập tức sang màn hình khách hàng</strong> khi họ tra cứu. Khách hàng sẽ thấy lý do minh bạch và có nút để <strong>tiếp tục chọn món khác / đổi lịch đặt lại</strong> hoặc đóng phiếu.
              </p>
            </div>

            {/* Rejection reason options */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 block">
                Chọn lý do không tiếp nhận (Bắt buộc):
              </label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {PREDEFINED_REJECTION_REASONS.map((r, idx) => (
                  <label
                    key={idx}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      selectedRejectReason === r
                        ? 'bg-rose-50/90 border-rose-300 font-bold text-rose-950 ring-1 ring-rose-300'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="rejectionReason"
                      value={r}
                      checked={selectedRejectReason === r}
                      onChange={() => setSelectedRejectReason(r)}
                      className="mt-0.5 text-rose-600 focus:ring-rose-500"
                    />
                    <span>{r}</span>
                  </label>
                ))}
              </div>

              {selectedRejectReason === 'Lý do khác (tự nhập cụ thể)' && (
                <div className="pt-1">
                  <input
                    type="text"
                    placeholder="Nhập lý do cụ thể..."
                    value={customRejectReason}
                    onChange={(e) => setCustomRejectReason(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                  />
                </div>
              )}
            </div>

            {/* Custom feedback note to customer */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>Lời nhắn / Hướng dẫn gửi khách (Để khách chọn lại):</span>
                <span className="text-[10px] text-slate-400 font-normal">Gợi ý cách giải quyết</span>
              </label>
              <textarea
                rows={2}
                value={rejectCustomNote}
                onChange={(e) => setRejectCustomNote(e.target.value)}
                placeholder="VD: Quán đã kín bàn lúc 18:30, kính mời quý khách đổi sang khung giờ sau 19:30 hoặc liên hệ Hotline..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-rose-500 focus:outline-none bg-slate-50 text-slate-800 leading-relaxed"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
              >
                <XCircle className="w-4 h-4" />
                <span>Xác Nhận Không Tiếp Nhận &amp; Đồng Bộ Cho Khách</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
