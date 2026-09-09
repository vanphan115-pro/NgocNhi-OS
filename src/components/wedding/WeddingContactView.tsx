import React, { useState } from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  MessageSquare,
  ShieldCheck
} from 'lucide-react';
import { UserRole } from '../../types';

interface WeddingContactViewProps {
  userRole: UserRole;
  onSendMessage: (data: any) => void;
}

export const WeddingContactView: React.FC<WeddingContactViewProps> = ({
  userRole,
  onSendMessage,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
  });
  const [sentSuccess, setSentSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    onSendMessage(formData);
    setSentSuccess(true);
    setTimeout(() => {
      setSentSuccess(false);
      setFormData({ name: '', phone: '', email: '', message: '' });
    }, 4000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-rose-700 via-rose-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white space-y-2 shadow-md">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-rose-100">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Hỗ Trợ & Tư Vấn Tận Tâm 24/7</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black font-serif">
          LIÊN HỆ TRUNG TÂM TIỆC CƯỚI NGỌC NHI
        </h1>
        <p className="text-xs sm:text-sm text-rose-100/90 max-w-xl">
          Đội ngũ chuyên viên sự kiện của Giám đốc Ngọc Nhi luôn sẵn sàng lắng nghe và hiện thực hóa đám cưới trong mơ của bạn.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Information Cards (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-3xl bg-white border border-rose-200 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-rose-700 uppercase tracking-wider">
              THÔNG TIN ĐỊA CHỈ & LIÊN HỆ
            </h2>

            <div className="space-y-4 text-xs text-slate-700">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">Địa chỉ trung tâm</div>
                  <div className="text-slate-500 mt-0.5 leading-relaxed">
                    KP 9, Phường Lộc Ninh, Thành phố Đồng Nai
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">Hotline Giám Đốc (Ngọc Nhi)</div>
                  <a href="tel:0967823801" className="text-rose-700 font-mono font-bold text-sm hover:underline block mt-0.5">
                    0967 823 801
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">Thời gian làm việc & Đón khách</div>
                  <div className="text-slate-500 mt-0.5 leading-relaxed">
                    Thứ 2 – Chủ Nhật: 08:00 – 22:00 (Mở cửa tất cả ngày lễ)
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Director Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-200 space-y-3">
            <div className="flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80"
                alt="Ngọc Nhi"
                className="w-12 h-12 rounded-full object-cover border-2 border-rose-300 shadow-xs"
              />
              <div>
                <div className="font-bold text-slate-900 text-sm">Giám Đốc: Ngọc Nhi</div>
                <div className="text-xs text-rose-700 font-medium">Chuyên gia cố vấn & tổ chức tiệc cưới</div>
              </div>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed italic">
              "Chúng tôi không chỉ tổ chức một bữa tiệc, chúng tôi cùng bạn kiến tạo khoảnh khắc thiêng liêng và kỷ niệm trọn vẹn nhất cuộc đời."
            </p>
          </div>
        </div>

        {/* Right Contact Form (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-rose-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-rose-700 uppercase tracking-wider">
            GỬI TIN NHẮN TƯ VẤN TRỰC TIẾP
          </h2>

          {sentSuccess ? (
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2 animate-in zoom-in-95">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <div className="font-bold text-emerald-900 text-sm">Tin nhắn đã được gửi thành công!</div>
              <p className="text-xs text-emerald-700">
                Giám đốc Ngọc Nhi sẽ phản hồi qua điện thoại / Zalo trong ít phút.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Họ và tên của bạn *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nguyễn Văn A"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số điện thoại liên hệ *</label>
                  <input
                    type="tel"
                    required
                    placeholder="0913xxxxxx"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email (nếu có)</label>
                <input
                  type="email"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nội dung câu hỏi / Ngày dự kiến tổ chức</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Tôi muốn hỏi về chi phí sảnh tiệc 30 bàn cho ngày cưới tháng 10..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-rose-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Gửi Tin Nhắn Cho Ngọc Nhi</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
