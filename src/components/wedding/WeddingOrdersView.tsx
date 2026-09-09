import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Phone, 
  Calendar, 
  Users, 
  MapPin, 
  Sparkles, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  X, 
  Eye, 
  Edit3, 
  Printer, 
  FileText,
  DollarSign
} from 'lucide-react';
import { WeddingInquiry, WeddingStatus, UserRole } from '../../types';

interface WeddingOrdersViewProps {
  userRole: UserRole;
  weddingInquiries: WeddingInquiry[];
  onUpdateWeddingStatus: (id: string, newStatus: WeddingStatus) => void;
  onOpenBookingModal: () => void;
}

export const WeddingOrdersView: React.FC<WeddingOrdersViewProps> = ({
  userRole,
  weddingInquiries,
  onUpdateWeddingStatus,
  onOpenBookingModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedInquiry, setSelectedInquiry] = useState<WeddingInquiry | null>(null);
  const [printContractInquiry, setPrintContractInquiry] = useState<WeddingInquiry | null>(null);

  const filtered = weddingInquiries.filter((inq) => {
    const matchesStatus = statusFilter === 'all' || inq.status === statusFilter;
    const matchesSearch =
      inq.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inq.phone.includes(searchQuery) ||
      inq.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: WeddingStatus) => {
    switch (status) {
      case 'new':
        return <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">Yêu Cầu Mới</span>;
      case 'consulting':
        return <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Đang Tư Vấn</span>;
      case 'confirmed':
        return <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Đã Xác Nhận</span>;
      case 'preparing':
        return <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">Đang Chuẩn Bị</span>;
      case 'completed':
        return <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200">Đã Hoàn Thành</span>;
      case 'cancelled':
        return <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-200">Đã Hủy</span>;
    }
  };

  const getVenueName = (loc: string) => {
    switch (loc) {
      case 'hall_ngocnhi': return 'Sảnh Ngọc Nhi 1 (Grand Ballroom)';
      case 'outdoor_garden': return 'Sảnh Sân Vườn Romance';
      case 'home_catering': return 'Nấu Tiệc Tận Nhà Khách Hàng';
      default: return 'Sảnh Ngọc Nhi';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner & Action */}
      <div className="bg-white rounded-3xl p-6 border border-rose-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">
              Quản Lý Nghiệp Vụ Yến Tiệc
            </span>
            <h1 className="text-2xl font-black text-slate-900 font-serif">
              DANH SÁCH ĐƠN ĐẶT TIỆC CƯỚI
            </h1>
            <p className="text-xs text-slate-500">
              Tổng cộng <strong>{weddingInquiries.length} đơn đặt tiệc</strong> trên toàn hệ thống trung tâm yến tiệc Ngọc Nhi.
            </p>
          </div>

          <button
            onClick={onOpenBookingModal}
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tạo Đơn Đặt Tiệc Mới</span>
          </button>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'all' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Tất Cả ({weddingInquiries.length})
            </button>
            <button
              onClick={() => setStatusFilter('new')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'new' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Yêu Cầu Mới ({weddingInquiries.filter(i => i.status === 'new').length})
            </button>
            <button
              onClick={() => setStatusFilter('confirmed')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'confirmed' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Đã Xác Nhận ({weddingInquiries.filter(i => i.status === 'confirmed').length})
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'completed' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Đã Hoàn Thành ({weddingInquiries.filter(i => i.status === 'completed').length})
            </button>
          </div>

          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm tên cô dâu, SĐT, mã..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-rose-500"
            />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="p-4">Mã Phiếu</th>
                <th className="p-4">Cô Dâu & Chú Rể</th>
                <th className="p-4">Ngày Cưới & Quy Mô</th>
                <th className="p-4">Gói & Sảnh Tiệc</th>
                <th className="p-4">Trạng Thái</th>
                <th className="p-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 text-xs">
                    Không có đơn đặt tiệc nào phù hợp với điều kiện tìm kiếm.
                  </td>
                </tr>
              ) : (
                filtered.map((inq) => (
                  <tr key={inq.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-mono font-bold text-rose-700">
                      {inq.code}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{inq.customerName}</div>
                      <a href={`tel:${inq.phone}`} className="text-slate-500 hover:text-rose-700 font-mono text-[11px] flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{inq.phone}</span>
                      </a>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-rose-600" />
                        <span>{inq.eventDate}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                        <Users className="w-3 h-3 text-slate-400" />
                        <span>{inq.expectedTables || 30} Bàn ({inq.eventTime === 'noon' ? 'Ca Trưa' : 'Ca Tối'})</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{inq.packageName || 'Gói Tiệc Cưới'}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[200px]">
                        {getVenueName(inq.venueLocation)}
                      </div>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(inq.status)}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedInquiry(inq)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors cursor-pointer"
                          title="Xem chi tiết phiếu"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setPrintContractInquiry(inq)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 font-medium transition-colors cursor-pointer"
                          title="In phiếu / Báo giá hợp đồng"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>

                        {inq.status === 'new' && (
                          <button
                            onClick={() => onUpdateWeddingStatus(inq.id, 'consulting')}
                            className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[11px] cursor-pointer"
                          >
                            Tư Vấn
                          </button>
                        )}
                        {inq.status === 'consulting' && (
                          <button
                            onClick={() => onUpdateWeddingStatus(inq.id, 'confirmed')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] cursor-pointer"
                          >
                            Xác Nhận
                          </button>
                        )}
                        {inq.status === 'confirmed' && (
                          <button
                            onClick={() => onUpdateWeddingStatus(inq.id, 'preparing')}
                            className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] cursor-pointer"
                          >
                            Chuẩn Bị
                          </button>
                        )}
                        {inq.status === 'preparing' && (
                          <button
                            onClick={() => onUpdateWeddingStatus(inq.id, 'completed')}
                            className="px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-[11px] cursor-pointer"
                          >
                            Hoàn Thành
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-mono font-bold text-rose-700">{selectedInquiry.code}</span>
                <h3 className="font-bold text-slate-900 text-base">{selectedInquiry.customerName}</h3>
              </div>
              <button onClick={() => setSelectedInquiry(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-2xl">
                <div>
                  <div className="text-slate-500 font-medium">Số điện thoại</div>
                  <div className="font-mono font-bold text-slate-900 mt-0.5">{selectedInquiry.phone}</div>
                </div>
                <div>
                  <div className="text-slate-500 font-medium">Ngày tổ chức</div>
                  <div className="font-bold text-slate-900 mt-0.5">{selectedInquiry.eventDate} ({selectedInquiry.eventTime === 'noon' ? 'Ca Trưa' : 'Ca Tối'})</div>
                </div>
                <div>
                  <div className="text-slate-500 font-medium">Số lượng bàn</div>
                  <div className="font-bold text-slate-900 mt-0.5">{selectedInquiry.expectedTables} Bàn</div>
                </div>
                <div>
                  <div className="text-slate-500 font-medium">Gói tiệc</div>
                  <div className="font-bold text-rose-700 mt-0.5">{selectedInquiry.packageName || 'Gói Tiệc Cưới'}</div>
                </div>
              </div>

              <div>
                <div className="text-slate-500 font-medium">Địa điểm tổ chức</div>
                <div className="font-semibold text-slate-900 mt-0.5">{getVenueName(selectedInquiry.venueLocation)}</div>
              </div>

              {selectedInquiry.notes && (
                <div>
                  <div className="text-slate-500 font-medium">Ghi chú & Yêu cầu hoa tươi/MC</div>
                  <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-100 text-slate-700 mt-0.5">
                    {selectedInquiry.notes}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedInquiry(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  setPrintContractInquiry(selectedInquiry);
                  setSelectedInquiry(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>In Phiếu Báo Giá</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print Contract / Quote Modal */}
      {printContractInquiry && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-8 space-y-6 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="text-center border-b-2 border-rose-600 pb-4 space-y-1">
              <div className="text-xs uppercase font-serif text-rose-800 tracking-widest">TRUNG TÂM YẾN TIỆC & HỘI NGHỊ</div>
              <h2 className="text-xl font-black text-slate-900 font-serif">TIỆC CƯỚI NGỌC NHI</h2>
              <div className="text-[11px] text-slate-500">KP 9, P. Lộc Ninh, TP. Đồng Nai • Hotline: 0967 823 801 (Ngọc Nhi)</div>
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-bold text-base text-slate-900 uppercase">PHIẾU BÁO GIÁ & ĐẶT CỌC TIỆC CƯỚI</h3>
              <div className="text-xs font-mono text-slate-500">Mã hợp đồng: {printContractInquiry.code} • Ngày lập: {new Date().toLocaleDateString('vi-VN')}</div>
            </div>

            <div className="space-y-3 text-xs border border-slate-200 rounded-2xl p-4 bg-slate-50">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Đại diện khách hàng:</span>
                <strong className="text-slate-900">{printContractInquiry.customerName}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Số điện thoại:</span>
                <strong className="font-mono text-slate-900">{printContractInquiry.phone}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Ngày giờ tổ chức:</span>
                <strong className="text-slate-900">{printContractInquiry.eventDate} ({printContractInquiry.eventTime === 'noon' ? 'Ca Trưa 11:30' : 'Ca Tối 17:30'})</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Địa điểm / Sảnh tiệc:</span>
                <strong className="text-slate-900">{getVenueName(printContractInquiry.venueLocation)}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Gói tiệc lựa chọn:</span>
                <strong className="text-rose-700">{printContractInquiry.packageName || 'Gói Tiệc Cưới'}</strong>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Quy mô tiệc:</span>
                <strong className="text-slate-900">{printContractInquiry.expectedTables} Bàn chính thức + 2 Bàn dự phòng</strong>
              </div>
            </div>

            <div className="text-[11px] text-slate-600 italic bg-amber-50 p-3 rounded-xl border border-amber-200">
              * Cam kết giữ đúng sảnh tiệc, trang trí hoa tươi nghệ thuật theo concept thỏa thuận và đảm bảo 100% vệ sinh an toàn thực phẩm chuẩn Ngọc Nhi.
            </div>

            <div className="flex justify-between pt-6 text-center text-xs font-bold text-slate-800">
              <div>
                <div>ĐẠI DIỆN KHÁCH HÀNG</div>
                <div className="text-[10px] font-normal text-slate-400 mt-0.5">(Ký & ghi rõ họ tên)</div>
                <div className="h-14"></div>
                <div className="font-medium text-slate-600">{printContractInquiry.customerName}</div>
              </div>

              <div>
                <div>ĐẠI DIỆN NGỌC NHI</div>
                <div className="text-[10px] font-normal text-slate-400 mt-0.5">(Giám đốc điều hành)</div>
                <div className="h-14"></div>
                <div className="font-bold text-rose-700">Ngọc Nhi (0967 823 801)</div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                onClick={() => setPrintContractInquiry(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>In Phiếu Này</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
