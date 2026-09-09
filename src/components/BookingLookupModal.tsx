import React, { useState } from 'react';
import { TableBooking, WeddingInquiry, RestaurantOrder } from '../types';
import { Search, X, CheckCircle2, AlertCircle, UtensilsCrossed, Sparkles, Phone, Calendar, Clock, MapPin, ShoppingBag, AlertTriangle, RotateCcw } from 'lucide-react';
import { SYSTEM_INFO } from '../data/initialData';

interface BookingLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookings: TableBooking[];
  weddingInquiries: WeddingInquiry[];
  onReorderBooking?: (booking: TableBooking) => void;
}

export const BookingLookupModal: React.FC<BookingLookupModalProps> = ({
  isOpen,
  onClose,
  bookings,
  weddingInquiries,
  onReorderBooking,
}) => {
  const [lookupQuery, setLookupQuery] = useState('');
  const [searched, setSearched] = useState(false);

  if (!isOpen) return null;

  const rawQuery = lookupQuery.trim();
  const cleanDigits = rawQuery.replace(/[^0-9]/g, '');
  const upperCode = rawQuery.toUpperCase();

  // Search Table Bookings
  const matchedBookings = rawQuery
    ? bookings.filter(b => {
        const bPhoneDigits = (b.phone || '').replace(/[^0-9]/g, '');
        const matchPhone = cleanDigits.length >= 3 && (bPhoneDigits.includes(cleanDigits) || cleanDigits.includes(bPhoneDigits));
        const matchCode = (b.code || '').toUpperCase().includes(upperCode);
        return matchPhone || matchCode;
      })
    : [];

  // Search Wedding Inquiries
  const matchedWeddings = rawQuery
    ? weddingInquiries.filter(w => {
        const wPhoneDigits = (w.phone || '').replace(/[^0-9]/g, '');
        const matchPhone = cleanDigits.length >= 3 && (wPhoneDigits.includes(cleanDigits) || cleanDigits.includes(wPhoneDigits));
        const matchCode = (w.code || '').toUpperCase().includes(upperCode);
        return matchPhone || matchCode;
      })
    : [];

  // Search Restaurant Orders from LocalStorage
  let restaurantOrders: RestaurantOrder[] = [];
  try {
    const rawOrd = localStorage.getItem('nn_restaurant_orders');
    if (rawOrd) {
      restaurantOrders = JSON.parse(rawOrd) || [];
    }
  } catch (e) {}

  const matchedOrders = rawQuery
    ? restaurantOrders.filter(o => {
        const oPhoneDigits = (o.phone || '').replace(/[^0-9]/g, '');
        const matchPhone = cleanDigits.length >= 3 && (oPhoneDigits.includes(cleanDigits) || cleanDigits.includes(oPhoneDigits));
        const matchCode = (o.code || '').toUpperCase().includes(upperCode);
        return matchPhone || matchCode;
      })
    : [];

  // Search Dui Breeding/Meat Orders from LocalStorage
  let duiOrders: any[] = [];
  try {
    const rawDui = localStorage.getItem('nn_dui_orders');
    if (rawDui) {
      duiOrders = JSON.parse(rawDui) || [];
    }
  } catch (e) {}

  const matchedDuiOrders = rawQuery
    ? duiOrders.filter(d => {
        const dPhoneDigits = (d.phone || '').replace(/[^0-9]/g, '');
        const matchPhone = cleanDigits.length >= 3 && (dPhoneDigits.includes(cleanDigits) || cleanDigits.includes(dPhoneDigits));
        const matchCode = (d.code || '').toUpperCase().includes(upperCode);
        return matchPhone || matchCode;
      })
    : [];

  const totalFound = matchedBookings.length + matchedWeddings.length + matchedOrders.length + matchedDuiOrders.length;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
  };

  const renderBookingCard = (foundBooking: TableBooking) => (
    <div key={foundBooking.id} className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2 text-xs">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 font-bold text-amber-900">
          <UtensilsCrossed className="w-4 h-4 text-amber-700" />
          Phiếu Đặt Bàn Quán Ăn
        </span>
        <span className="font-mono font-bold text-amber-900 px-2 py-0.5 rounded-lg bg-white border border-amber-200 shadow-xs">
          #{foundBooking.code}
        </span>
      </div>
      <div className="space-y-1 text-slate-700 bg-white/80 p-2.5 rounded-xl border border-amber-100">
        <div className="flex justify-between">
          <span className="text-slate-500">Khách hàng:</span>
          <strong className="text-slate-900">{foundBooking.customerName}</strong>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Thời gian:</span>
          <span className="font-semibold text-amber-900">{foundBooking.bookingTime} • {foundBooking.bookingDate}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Số lượng:</span>
          <span>{foundBooking.guestCount} Khách ({foundBooking.tableArea})</span>
        </div>
        {foundBooking.tableNumber && (
          <div className="flex justify-between items-center bg-blue-50 px-2 py-1 rounded-lg border border-blue-200">
            <span className="text-blue-900 font-semibold">Vị trí bàn được xếp:</span>
            <strong className="text-blue-900 font-bold">{foundBooking.tableNumber}</strong>
          </div>
        )}
        {foundBooking.preOrderItems && foundBooking.preOrderItems.length > 0 && (
          <div className="pt-2 mt-1 border-t border-amber-200/50 space-y-1.5">
            <div className="flex items-center justify-between font-bold text-amber-900 text-[11px]">
              <span>Món đặt trước ({foundBooking.preOrderItems.length} món):</span>
              <span className="font-mono text-orange-700">{(foundBooking.preOrderTotal || 0).toLocaleString('vi-VN')}đ</span>
            </div>
            <div className="space-y-1 bg-amber-50/60 p-2 rounded-lg border border-amber-200/40 text-[11px]">
              {foundBooking.preOrderItems.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-slate-700">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span>{item.quantity}x {item.name}</span>
                    {foundBooking.dishesConfirmed && (
                      <span className="text-[9px] bg-emerald-600 text-white font-bold px-1.5 py-0.2 rounded">
                        ✓ Bếp đã nhận nấu
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-slate-600">{(item.price * item.quantity).toLocaleString('vi-VN')}đ</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Rejection Notification & Interactive Decision Controls */}
        {(foundBooking.status === 'cancelled' || foundBooking.rejectionReason) ? (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 space-y-2.5 mt-2">
            <div className="flex items-center gap-2 text-rose-900 font-bold text-xs">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Rất tiếc: Nhà hàng chưa thể tiếp nhận phiếu đặt này</span>
            </div>
            {foundBooking.rejectionReason && (
              <p className="text-xs text-rose-950">
                <strong>Lý do từ nhà hàng:</strong> {foundBooking.rejectionReason}
              </p>
            )}
            {foundBooking.adminNote && (
              <div className="p-2.5 rounded-lg bg-white/90 border border-rose-200 text-xs text-rose-900 italic leading-relaxed">
                "{foundBooking.adminNote}"
              </div>
            )}
            {foundBooking.rejectedAt && (
              <p className="text-[10px] text-rose-600">Thời gian phản hồi: {foundBooking.rejectedAt}</p>
            )}

            {/* Customer Decision Buttons */}
            <div className="pt-2 border-t border-rose-200/80 flex items-center justify-between gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  if (onReorderBooking) {
                    onReorderBooking(foundBooking);
                  }
                  onClose();
                }}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                <UtensilsCrossed className="w-3.5 h-3.5" />
                <span>Tiếp tục chọn món &amp; Đặt lại</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold text-xs transition-colors cursor-pointer"
              >
                Đóng / Không đặt nữa
              </button>
            </div>
          </div>
        ) : (
          <>
            {foundBooking.adminNote && (
              <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-[11px] space-y-1">
                <div className="font-bold text-blue-950 flex items-center gap-1">
                  <span>📩 Lời nhắn từ Quản Lý Nhà Hàng:</span>
                </div>
                <p className="text-blue-900 italic font-medium leading-relaxed">
                  "{foundBooking.adminNote}"
                </p>
              </div>
            )}
            <div className="flex justify-between items-center pt-1 border-t border-amber-200/60">
              <span className="text-slate-500">Trạng thái:</span>
              <span className="font-bold text-emerald-700 uppercase tracking-wide">
                {foundBooking.status === 'new' ? 'Mới nhận — Đang xử lý' :
                 foundBooking.status === 'confirmed' ? 'Đã xác nhận giữ chỗ' :
                 foundBooking.status === 'serving' ? 'Đang phục vụ tại bàn' :
                 foundBooking.status === 'completed' ? 'Đã dùng bữa hoàn tất' : 'Đã hủy'}
              </span>
            </div>
          </>
        )}
        {foundBooking.lastSyncAt && (
          <div className="text-[10px] text-slate-400 text-right pt-0.5">
            Đồng bộ lần cuối: {foundBooking.lastSyncAt}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-5 sm:p-7 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200 my-8 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base sm:text-lg text-slate-900">Tra Cứu Đơn Hàng & Phiếu Đặt</h3>
              <p className="text-[11px] text-slate-500">Tra cứu nhanh bằng số điện thoại khách hàng</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSearch} className="space-y-2 shrink-0">
          <label className="block text-xs font-bold text-slate-700">
            Nhập số điện thoại khách hàng (hoặc mã đơn / phiếu đặt):
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="tel"
                required
                placeholder="Nhập số điện thoại khách hàng..."
                value={lookupQuery}
                onChange={(e) => {
                  setLookupQuery(e.target.value);
                  setSearched(false);
                }}
                className="w-full pl-8 pr-3 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
              />
              <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 cursor-pointer transition-all shrink-0"
            >
              Tra Cứu
            </button>
          </div>
        </form>

        {!searched && !rawQuery && bookings.length > 0 && (
          <div className="flex-1 overflow-y-auto pr-1 space-y-3 pt-1">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <UtensilsCrossed className="w-3.5 h-3.5 text-amber-600" />
                Phiếu đặt bàn của bạn ({bookings.length} phiếu):
              </span>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-bold">
                ✓ Đã lưu hệ thống
              </span>
            </div>
            {bookings.map(renderBookingCard)}
          </div>
        )}

        {searched && (
          <div className="flex-1 overflow-y-auto pr-1 space-y-3 pt-1">
            {/* Restaurant Orders */}
            {matchedOrders.map(ord => (
              <div key={ord.id} className="p-4 rounded-2xl bg-orange-50/70 border border-orange-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-bold text-orange-900">
                    <ShoppingBag className="w-4 h-4 text-orange-600" />
                    Đơn Đặt Món Quán Ăn
                  </span>
                  <span className="font-mono font-bold text-orange-900 px-2 py-0.5 rounded-lg bg-white border border-orange-200 shadow-xs">
                    #{ord.code}
                  </span>
                </div>
                <div className="space-y-1 text-slate-700 bg-white/80 p-2.5 rounded-xl border border-orange-100">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Khách:</span>
                    <strong>{ord.customerName} ({ord.phone})</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Thời gian:</span>
                    <span>{ord.createdAt}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Hình thức:</span>
                    <span>{ord.orderType === 'dine_in' ? `Tại bàn ${ord.tableNumber || ''}` : ord.orderType === 'takeaway' ? 'Mang về' : 'Giao tận nơi'}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-100 font-bold">
                    <span>Tổng tiền:</span>
                    <span className="text-orange-600 font-mono">{ord.total?.toLocaleString('vi-VN')}đ</span>
                  </div>
                </div>
              </div>
            ))}

            {/* Dui Breeding/Meat Orders */}
            {matchedDuiOrders.map(dui => (
              <div key={dui.id} className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-bold text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Đơn Mua Dúi Con Giống / Thịt
                  </span>
                  <span className="font-mono font-bold text-emerald-900 px-2 py-0.5 rounded-lg bg-white border border-emerald-200 shadow-xs">
                    #{dui.code}
                  </span>
                </div>
                <div className="space-y-1 text-slate-700 bg-white/80 p-2.5 rounded-xl border border-emerald-100">
                  <div className="font-bold text-slate-900">{dui.productName} ({dui.quantity} {dui.unit})</div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Khách:</span>
                    <strong>{dui.customerName} ({dui.phone})</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Trạng thái:</span>
                    <span className="font-bold text-emerald-700">
                      {dui.status === 'new' ? 'Mới đặt' : dui.status === 'confirmed' ? 'Đã duyệt con giống' : dui.status === 'shipping' ? 'Đang giao' : 'Hoàn tất'}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-100 font-bold">
                    <span>Tổng tính:</span>
                    <span className="text-emerald-700 font-mono">{dui.estimatedTotal?.toLocaleString('vi-VN')}đ</span>
                  </div>
                </div>
              </div>
            ))}

            {/* Table Bookings */}
            {matchedBookings.map(renderBookingCard)}

            {/* Wedding Inquiries */}
            {matchedWeddings.map(foundWedding => (
              <div key={foundWedding.id} className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-bold text-rose-900">
                    <Sparkles className="w-4 h-4 text-rose-700" />
                    Hồ Sơ Tiệc Cưới & Sự Kiện
                  </span>
                  <span className="font-mono font-bold text-rose-900 px-2 py-0.5 rounded-lg bg-white border border-rose-200 shadow-xs">
                    #{foundWedding.code}
                  </span>
                </div>
                <div className="space-y-1 text-slate-700 bg-white/80 p-2.5 rounded-xl border border-rose-100">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Khách hàng:</span>
                    <strong className="text-slate-900">{foundWedding.customerName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Ngày tiệc dự kiến:</span>
                    <span className="font-semibold text-rose-900">{foundWedding.eventDate} ({foundWedding.eventTime === 'noon' ? 'Trưa' : 'Tối'})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Quy mô:</span>
                    <span>{foundWedding.expectedTables} Bàn (~{foundWedding.expectedGuests} Khách)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Gói quan tâm:</span>
                    <span className="text-amber-800 font-bold">{foundWedding.packageName}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-rose-200/60">
                    <span className="text-slate-500">Trạng thái:</span>
                    <span className="font-bold text-emerald-700 uppercase tracking-wide">
                      {foundWedding.status === 'new' ? 'Tiếp nhận — Chuyên viên sẽ gọi' :
                       foundWedding.status === 'consulting' ? 'Đang tư vấn sảnh & menu' :
                       foundWedding.status === 'confirmed' ? 'Đã chốt hợp đồng' :
                       foundWedding.status === 'preparing' ? 'Đang chuẩn bị tiệc' :
                       foundWedding.status === 'completed' ? 'Đã tổ chức thành công' : 'Đã hủy'}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {totalFound === 0 && (
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
                <AlertCircle className="w-6 h-6 text-slate-400 mx-auto" />
                <p className="text-xs text-slate-600 font-medium">
                  Không tìm thấy đơn hàng hoặc phiếu đặt nào khớp với thông tin "{lookupQuery}".
                </p>
                <div className="text-[11px] text-slate-500">
                  Vui lòng kiểm tra lại số điện thoại hoặc liên hệ hotline: <strong className="text-amber-800">{SYSTEM_INFO.phoneHotline}</strong>.
                </div>
              </div>
            )}
          </div>
        )}

        <div className="text-[11px] text-slate-400 text-center shrink-0 pt-1">
          Bảo mật thông tin: Quý khách có thể tra cứu nhanh chính xác theo số điện thoại đã đặt.
        </div>
      </div>
    </div>
  );
};
