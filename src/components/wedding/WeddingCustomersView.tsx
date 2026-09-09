import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Phone, 
  Calendar, 
  Heart, 
  Sparkles, 
  Mail, 
  DollarSign,
  Award
} from 'lucide-react';
import { WeddingInquiry, UserRole } from '../../types';
import { WEDDING_REFERENCE_PACKAGES } from './weddingData';

interface WeddingCustomersViewProps {
  userRole: UserRole;
  weddingInquiries: WeddingInquiry[];
}

export const WeddingCustomersView: React.FC<WeddingCustomersViewProps> = ({
  userRole,
  weddingInquiries,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const sampleCustomers = [
    { id: 'c1', name: 'Anh Tuấn & Chị Hương', phone: '0918 234 567', date: '25/06/2026', tables: 35, pkg: 'Gói Phổ Thông (2.000.000đ/bàn)', totalSpent: '70.000.000đ', status: 'Hôn Lễ Sắp Tổ Chức' },
    { id: 'c2', name: 'Anh Nam & Chị Linh', phone: '0977 889 911', date: '18/06/2026', tables: 28, pkg: 'Gói Cao Cấp (3.000.000đ/bàn)', totalSpent: '84.000.000đ', status: 'Đã Hoàn Tất Hợp Đồng' },
    { id: 'c3', name: 'Anh Phúc & Chị Thảo', phone: '0933 445 566', date: '10/06/2026', tables: 20, pkg: 'Gói Tiết Kiệm (1.500.000đ/bàn)', totalSpent: '30.000.000đ', status: 'Đang Chuẩn Bị Thực Đơn' },
  ];

  // Merge live inquiries
  const displayList = [
    ...weddingInquiries.map((inq) => {
      const matchedPkg = WEDDING_REFERENCE_PACKAGES.find(p => p.id === inq.packageId);
      const pkgPrice = matchedPkg ? matchedPkg.price : 2000000;
      const tables = inq.expectedTables || 30;
      return {
        id: inq.id,
        name: inq.customerName,
        phone: inq.phone,
        date: inq.eventDate || 'Chưa định ngày',
        tables,
        pkg: inq.packageName || (matchedPkg ? `${matchedPkg.name} (${matchedPkg.priceFormatted}/bàn)` : 'Gói Phổ Thông (2.000.000đ/bàn)'),
        totalSpent: `${(tables * pkgPrice).toLocaleString('vi-VN')}đ (Dự tính)`,
        status: inq.status === 'confirmed' ? 'Đã Chốt Tiệc' : inq.status === 'completed' ? 'Đã Hoàn Thành' : 'Đang Tư Vấn',
      };
    }),
    ...sampleCustomers
  ].filter((c, index, self) => index === self.findIndex((t) => t.phone === c.phone));

  const filtered = displayList.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-rose-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">
              Khách Hàng & Các Cặp Đôi
            </span>
            <h1 className="text-2xl font-black text-slate-900 font-serif">
              DANH SÁCH KHÁCH HÀNG TIỆC CƯỚI
            </h1>
            <p className="text-xs text-slate-500">
              Hệ thống chăm sóc khách hàng và các cặp đôi đã và đang đặt tiệc tại Ngọc Nhi.
            </p>
          </div>

          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm tên cô dâu chú rể, SĐT..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-rose-500"
            />
          </div>
        </div>
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((c) => (
          <div
            key={c.id}
            className="p-5 rounded-3xl bg-white border border-rose-100 shadow-xs hover:border-rose-300 transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs">
                    <Heart className="w-5 h-5 fill-rose-200 text-rose-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{c.name}</h3>
                    <a href={`tel:${c.phone}`} className="text-xs text-slate-500 hover:text-rose-700 font-mono">
                      {c.phone}
                    </a>
                  </div>
                </div>

                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                  {c.status}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Ngày cưới:</span>
                  <strong className="text-slate-900">{c.date}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Quy mô:</span>
                  <strong className="text-slate-900">{c.tables} Bàn</strong>
                </div>
                <div className="flex justify-between">
                  <span>Gói tiệc:</span>
                  <strong className="text-rose-700">{c.pkg}</strong>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200 font-bold">
                  <span>Tổng giá trị:</span>
                  <span className="text-emerald-700 font-mono">{c.totalSpent}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <a
                href={`tel:${c.phone}`}
                className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>Gọi Chăm Sóc</span>
              </a>
              <a
                href={`https://zalo.me/${c.phone.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center transition-colors"
              >
                Zalo
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
