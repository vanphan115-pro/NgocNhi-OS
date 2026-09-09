export interface WeddingPackageItem {
  id: string;
  name: string;
  badge: string;
  badgeType: 'green' | 'blue' | 'ruby' | 'gold';
  price: number;
  priceFormatted: string;
  tablesRecommended: string;
  features: string[];
  description: string;
  image: string;
  menuDishes: string[];
  addons: string[];
}

export interface WeddingVenueItem {
  id: string;
  name: string;
  capacityText: string;
  minGuests: number;
  maxGuests: number;
  description: string;
  images: string[];
  features: string[];
  areaM2: number;
  ceilingHeight: string;
}

export interface WeddingServiceAddon {
  id: string;
  title: string;
  iconType: 'decor' | 'camera' | 'mc' | 'car' | 'dress' | 'invitation';
  bgClass: string;
  borderClass: string;
  textClass: string;
  price: number;
  priceFormatted: string;
  shortDesc: string;
  detailDesc: string;
  image: string;
  includedList: string[];
}

export interface WeddingPromotionItem {
  id: string;
  title: string;
  discount: string;
  condition: string;
  expiry: string;
  description: string;
  image: string;
  tag: string;
  code: string;
}

export const WEDDING_REFERENCE_PACKAGES: WeddingPackageItem[] = [
  {
    id: 'pkg-economy',
    name: 'Gói Tiết Kiệm',
    badge: 'Tiết Kiệm',
    badgeType: 'green',
    price: 1500000,
    priceFormatted: '1.500.000đ',
    tablesRecommended: 'Từ 10 - 25 bàn',
    features: [
      'Sảnh tiệc tiêu chuẩn',
      'Thực đơn từ 4 món',
      'Trang trí cơ bản',
      'Âm thanh – Ánh sáng'
    ],
    description: 'Lựa chọn tối ưu ngân sách chỉ từ 1.500.000đ/bàn với không gian ấm cúng và thực đơn từ 4 món tròn vị, đậm đà.',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
    menuDishes: [
      'Mâm Khai Vị 2 Món (Chả Giò Ngọc Nhi, Gỏi Củ Hủ Dừa Tôm Thịt)',
      'Gà Ta Quay Lu Da Giòn Xôi Gấc Hạt Sen',
      'Cá Chẽm Hấp Hồng Kông Xì Dầu Gừng Hành',
      'Lẩu Thái Hải Sản Tươi Sống Rau Rừng / Chè Hạt Sen'
    ],
    addons: [
      'Bàn lễ tân đón khách & Thùng tiền mừng tiêu chuẩn',
      'Bảng tên cô dâu chú rể thiết kế trang nhã',
      'Khăn lạnh & nước suối suốt tiệc',
      'Hệ thống âm thanh phát nhạc đón khách'
    ]
  },
  {
    id: 'pkg-standard',
    name: 'Gói Phổ Thông',
    badge: 'Phổ Biến Nhất',
    badgeType: 'blue',
    price: 2000000,
    priceFormatted: '2.000.000đ',
    tablesRecommended: 'Từ 20 - 50 bàn',
    features: [
      'Sảnh tiệc sang trọng',
      'Thực đơn từ 5 món',
      'Trang trí theo chủ đề',
      'Âm thanh – Ánh sáng'
    ],
    description: 'Gói tiệc được hơn 85% các cặp đôi lựa chọn chỉ từ 2.000.000đ/bàn: Sảnh tiệc lộng lẫy, menu từ 5 món phong phú và hoa tươi theo chủ đề.',
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80',
    menuDishes: [
      'Mâm Khai Vị 3 Món (Chả Giò Ngọc Nhi, Gỏi Ngó Sen Tôm Thịt, Mực Trứng Chiên Giòn)',
      'Súp Bắp Cua Gà Xé Nấm Hương Hạt Sen Tươi',
      'Bò Tơ Nướng Tảng Sốt Tiêu Xanh Tây Bắc & Bánh Mì',
      'Cá Lăng Sông Hấp Nấm Đông Cô Xốt Xì Dầu',
      'Lẩu Gà Ta Nấu Măng Le Lá É Trắng / Trái Cây Thập Cẩm'
    ],
    addons: [
      'Backdrop chụp ảnh hoa tươi phong cách hiện đại (3x4m)',
      'Bánh cưới 3 tầng và tháp rượu Champagne phát sáng',
      'MC dẫn chương trình & Nghi thức cắt bánh rót rượu',
      'Pháo kim tuyến & Hiệu ứng khói lạnh lúc mở màn',
      'Tặng 01 bàn ăn thử cho đại diện hai bên gia đình'
    ]
  },
  {
    id: 'pkg-luxury',
    name: 'Gói Cao Cấp',
    badge: 'Đẳng Cấp Thượng Lưu',
    badgeType: 'ruby',
    price: 3000000,
    priceFormatted: '3.000.000đ',
    tablesRecommended: 'Từ 30 - 80 bàn trở lên',
    features: [
      'Sảnh tiệc cao cấp',
      'Thực đơn từ 6 món',
      'Trang trí hoa tươi cao cấp',
      'Âm thanh – Ánh sáng – LED P3',
      'MC – Nghi thức trọn gói'
    ],
    description: 'Đỉnh cao tiệc cưới thượng lưu chỉ từ 3.000.000đ/bàn với thực đơn từ 6 món hảo hạng gồm đặc sản Dúi KaKa than hồng, sảnh LED P3 và xe hoa rước dâu.',
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80',
    menuDishes: [
      'Mâm Khai Vị Hoàng Gia 3 Món (Bào Ngư Mini, Chả Phượng Hoàng Kim, Gỏi Bò Tơ)',
      'Súp Vi Cá Hải Sâm Bào Ngư Nấm Tuyết Thượng Hạng',
      'Đặc Sản Dúi KaKa Nướng Muối Ớt Than Hồng (Chuẩn Trại KaKa)',
      'Tôm Sú Hoàng Kim Sốt Trứng Muối / Cá Tầm Nướng Mắc Khén',
      'Lẩu Cua Đồng Bắp Bò Sườn Sụn Gia Truyền Ngọc Nhi',
      'Bánh Flan Trái Dừa Xiêm Non / Mâm Trái Cây Cao Cấp Theo Mùa'
    ],
    addons: [
      'Xe hoa Mercedes / VinFast Lux đón dâu nội thành ngày cưới',
      'Đội ngũ lễ tân khánh tiết 8 người đón khách trang phục dạ hội',
      'Màn hình LED P3 sân khấu trình chiếu visual kỷ niệm 4K',
      'Dàn nhạc sống Acoustic hoặc Tam tấu hòa tấu suốt tiệc',
      'Miễn phí đồ uống bia & nước ngọt theo tiêu chuẩn tiệc',
      'Gói chụp ảnh phóng sự cưới & quay phim Highlight'
    ]
  }
];

export const WEDDING_REFERENCE_VENUES: WeddingVenueItem[] = [
  {
    id: 'venue-nn-1',
    name: 'Sảnh Ngọc Nhi 1',
    capacityText: 'Sức chứa: 300 – 500 khách',
    minGuests: 300,
    maxGuests: 500,
    description: 'Sảnh lớn – Không gian sang trọng – Phù hợp tiệc cưới, hội nghị, sự kiện lớn.',
    images: [
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=800&q=80'
    ],
    features: ['Trần cao 7m không cột chắn', 'Màn hình LED cong P3 40m²', 'Hệ thống Moving Beam 32 đèn', 'Sân khấu Catwalk dài 18m'],
    areaM2: 750,
    ceilingHeight: '7.2 mét'
  },
  {
    id: 'venue-nn-2',
    name: 'Sảnh Ngọc Nhi 2',
    capacityText: 'Sức chứa: 200 – 350 khách',
    minGuests: 200,
    maxGuests: 350,
    description: 'Sảnh hiện đại – Hệ thống ánh sáng Moving Beam – Không gian lãng mạn ấm áp.',
    images: [
      'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1529636798458-92182e662485?auto=format&fit=crop&w=800&q=80'
    ],
    features: ['Tone màu Pastel hoa hồng', 'Âm thanh JBL Master Pro', 'Bàn Gallery hoa tươi thiết kế riêng', 'Phòng tân nương VIP'],
    areaM2: 520,
    ceilingHeight: '5.5 mét'
  },
  {
    id: 'venue-nn-vip',
    name: 'Sảnh VIP Hoàng Gia',
    capacityText: 'Sức chứa: 100 – 200 khách',
    minGuests: 100,
    maxGuests: 200,
    description: 'Sảnh VIP thượng lưu mang phong cách quý tộc Châu Âu, phù hợp tiệc báo hỷ và gia đình danh giá.',
    images: [
      'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80'
    ],
    features: ['Nội thất mạ vàng hoàng gia', 'Bộ ly pha lê cao cấp', 'Rượu vang phục vụ tận bàn', 'Đầu bếp riêng tại sảnh'],
    areaM2: 380,
    ceilingHeight: '6.0 mét'
  },
  {
    id: 'venue-nn-garden',
    name: 'Sảnh Sân Vườn Romance',
    capacityText: 'Sức chứa: 150 – 350 khách',
    minGuests: 150,
    maxGuests: 350,
    description: 'Tiệc cưới ngoài trời lãng mạn phong cách Rustic giữa thảm cỏ xanh mướt, hoa tươi và dàn đèn Fairy Lights lung linh.',
    images: [
      'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=800&q=80'
    ],
    features: ['Không gian mở hòa mình thiên nhiên', 'Mái che thông minh chống mưa', 'Khu tiệc nướng BBQ & Cocktail Bar ngoài trời', 'Dàn đèn cổ tích Fairy Lights'],
    areaM2: 680,
    ceilingHeight: 'Không gian mở ngoài trời'
  }
];

export const WEDDING_REFERENCE_SERVICES: WeddingServiceAddon[] = [
  {
    id: 'serv-decor',
    title: 'Trang trí tiệc cưới',
    iconType: 'decor',
    bgClass: 'bg-rose-100/70 hover:bg-rose-100',
    borderClass: 'border-rose-200',
    textClass: 'text-rose-600',
    price: 8500000,
    priceFormatted: '8.500.000đ',
    shortDesc: 'Hoa tươi, bàn gallery, backdrop, cổng hoa & lối đi catwalk',
    detailDesc: 'Thiết kế concept hoa tươi nghệ thuật 100% nhập khẩu theo phong cách riêng của cô dâu chú rể.',
    image: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=800&q=80',
    includedList: ['Cổng hoa đón khách lụa & hoa tươi', 'Bàn Gallery trưng bày ảnh cưới', 'Backdrop Photo Booth 3D', 'Lối đi sân khấu rải cánh hoa']
  },
  {
    id: 'serv-camera',
    title: 'Chụp ảnh – Quay phim',
    iconType: 'camera',
    bgClass: 'bg-sky-100/70 hover:bg-sky-100',
    borderClass: 'border-sky-200',
    textClass: 'text-sky-600',
    price: 7000000,
    priceFormatted: '7.000.000đ',
    shortDesc: 'Phóng sự cưới, Flycam & Video Highlight 4K sắc nét',
    detailDesc: 'Ekip quay phim chụp ảnh chuyên nghiệp lưu giữ trọn vẹn từng cảm xúc thiêng liêng.',
    image: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=800&q=80',
    includedList: ['2 Nhiếp ảnh gia chụp suốt tiệc', '1 Quay phim chính 4K', 'Toàn bộ file gốc chỉnh màu', '1 Video Highlight 3-5 phút']
  },
  {
    id: 'serv-mc',
    title: 'MC – Ca sĩ',
    iconType: 'mc',
    bgClass: 'bg-emerald-100/70 hover:bg-emerald-100',
    borderClass: 'border-emerald-200',
    textClass: 'text-emerald-600',
    price: 4500000,
    priceFormatted: '4.500.000đ',
    shortDesc: 'MC nghi lễ chuẩn mực & Ban nhạc sống đón khách',
    detailDesc: 'Dẫn dắt cảm xúc chương trình hôn lễ trang trọng, ấm áp cùng các tiết mục ca nhạc sôi động.',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
    includedList: ['MC dẫn lễ chuyên nghiệp', 'Ca sĩ biểu diễn 3 bài hát mừng', 'Vũ đoàn múa mở màn', 'Nhạc công đệm đàn Piano/Organ']
  },
  {
    id: 'serv-car',
    title: 'Xe hoa',
    iconType: 'car',
    bgClass: 'bg-purple-100/70 hover:bg-purple-100',
    borderClass: 'border-purple-200',
    textClass: 'text-purple-600',
    price: 3500000,
    priceFormatted: '3.500.000đ',
    shortDesc: 'Mercedes, VinFast Lux A2.0, Camry hoa tươi sang trọng',
    detailDesc: 'Đội xe hoa đời mới sang trọng đưa đón cô dâu chú rể đúng giờ, an toàn và lộng lẫy.',
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
    includedList: ['Xe Mercedes / VinFast đời mới', 'Trang trí hoa tươi mui xe & cửa', 'Tài xế mặc vest lịch sự', 'Phục vụ rước dâu nội thành 4 giờ']
  },
  {
    id: 'serv-dress',
    title: 'Áo cưới',
    iconType: 'dress',
    bgClass: 'bg-amber-100/70 hover:bg-amber-100',
    borderClass: 'border-amber-200',
    textClass: 'text-amber-600',
    price: 6000000,
    priceFormatted: '6.000.000đ',
    shortDesc: 'Váy cưới công chúa cao cấp & Áo dài truyền thống',
    detailDesc: 'Bộ sưu tập váy cưới và áo dài thiết kế đính đá Swarovski lộng lẫy nhất mùa cưới 2026.',
    image: 'https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=800&q=80',
    includedList: ['1 Váy cưới Luxury ngày cưới', '1 Áo dài cô dâu làm lễ', '2 Bộ Veston chú rể cao cấp', 'Trang sức & phụ kiện cưới đi kèm']
  },
  {
    id: 'serv-invitation',
    title: 'Thiệp cưới',
    iconType: 'invitation',
    bgClass: 'bg-orange-100/70 hover:bg-orange-100',
    borderClass: 'border-orange-200',
    textClass: 'text-orange-600',
    price: 1800000,
    priceFormatted: '1.800.000đ',
    shortDesc: 'Thiệp in ép kim cao cấp + Thiệp cưới điện tử QR thông minh',
    detailDesc: 'Mẫu thiệp cưới thiết kế tinh xảo, tích hợp website thiệp cưới online và mã QR chỉ đường tiện lợi.',
    image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
    includedList: ['In 300 thiệp ép kim dập nổi', 'Thiết kế thiệp điện tử Online', 'Tạo mã QR thiệp mời & xác nhận tham dự', 'Bản đồ chỉ dẫn đường đến nhà hàng']
  }
];

export const WEDDING_REFERENCE_RECENT_ORDERS = [
  {
    id: 'rec-01',
    customerName: 'Anh Tuấn & Chị Hương',
    hallAndTables: 'Sảnh Ngọc Nhi 1 – 35 bàn',
    date: '25/06/2026',
    status: 'confirmed' as const,
    statusText: 'Đã xác nhận',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    phone: '0918 234 567',
    pkg: 'Gói Phổ Thông (2.000.000đ/bàn)',
    deposit: '30.000.000đ'
  },
  {
    id: 'rec-02',
    customerName: 'Anh Nam & Chị Linh',
    hallAndTables: 'Sảnh Ngọc Nhi 2 – 28 bàn',
    date: '18/06/2026',
    status: 'paid' as const,
    statusText: 'Đã thanh toán',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    phone: '0977 889 911',
    pkg: 'Gói Cao Cấp (3.000.000đ/bàn)',
    deposit: '84.000.000đ'
  },
  {
    id: 'rec-03',
    customerName: 'Anh Phúc & Chị Thảo',
    hallAndTables: 'Sảnh VIP – 20 bàn',
    date: '10/06/2026',
    status: 'pending' as const,
    statusText: 'Đang chờ',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    phone: '0933 445 566',
    pkg: 'Gói Tiết Kiệm (1.500.000đ/bàn)',
    deposit: 'Chờ cọc 10.000.000đ'
  }
];

export const WEDDING_REFERENCE_PROMOTIONS: WeddingPromotionItem[] = [
  {
    id: 'promo-01',
    title: 'Giảm ngay 5%',
    discount: 'Giảm 5%',
    condition: 'Khi đặt tiệc trước 30 ngày',
    expiry: 'Áp dụng đến hết 31/12/2026',
    description: 'Ưu đãi dành cho các cặp đôi lên kế hoạch sớm: Giảm trực tiếp 5% trên tổng hóa đơn bàn tiệc và tặng gói pháo kim tuyến.',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80',
    tag: 'Hot Nhất',
    code: 'NGOCNHI5'
  },
  {
    id: 'promo-02',
    title: 'Tặng 01 Bàn Ăn Thử Miễn Phí',
    discount: '100% Bàn Dùng Thử',
    condition: 'Khi đặt tiệc từ 20 bàn trở lên',
    expiry: 'Áp dụng đến hết 31/12/2026',
    description: 'Đại diện gia đình hai bên được mời thưởng thức thực đơn tiệc cưới hoàn chỉnh 7 món trước ngày cưới để điều chỉnh gia vị theo ý thích.',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
    tag: 'Đặc Quyền',
    code: 'FREETEST'
  },
  {
    id: 'promo-03',
    title: 'Tặng Xe Hoa Mercedes Đón Dâu',
    discount: 'Miễn phí xe hoa',
    condition: 'Khi chọn Gói Cao Cấp từ 35 bàn',
    expiry: 'Áp dụng đến hết 31/12/2026',
    description: 'Tặng trọn gói xe hoa Mercedes E-Class trang trí hoa tươi nhập khẩu rước dâu nội thành 4 giờ.',
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80',
    tag: 'Cao Cấp',
    code: 'VIPCAR'
  }
];
