import { ManagerProfile, MenuItem, WeddingPackage, TableBooking, WeddingInquiry } from '../types';

export const SYSTEM_INFO = {
  name: 'HỆ THỐNG DỊCH VỤ NGỌC NHI',
  shortName: 'DỊCH VỤ NGỌC NHI',
  tagline: 'Hệ Sinh Thái Đa Ngành • Ẩm Thực Đặc Sản & Dịch Vụ Tiệc Cưới',
  address: 'KP 9, phường Lộc Ninh, thành phố Đồng Nai',
  establishedYear: '2020',
  phoneHotline: '0967823801',
  phoneTech: '0969310601',
  description: 'Hệ thống dịch vụ thống nhất kết hợp ẩm thực đặc sản cao cấp (Quán Ăn Ngọc Nhi) và tổ chức sự kiện tiệc cưới sang trọng trọn gói với trung tâm điều hành hiện đại.',
};

export const MANAGERS: { dungKaka: ManagerProfile & { avatar: string }; ngocNhi: ManagerProfile & { avatar: string } } = {
  dungKaka: {
    name: 'Dũng Kaka',
    title: 'Quản Trị Viên Toàn Hệ Thống • Phụ Trách Kỹ Thuật & Vận Hành',
    phones: ['0969310601', '0332332327'],
    responsibilities: [
      'Quản trị viên toàn bộ Hệ thống Dịch vụ Ngọc Nhi',
      'Chỉ đạo kỹ thuật, công nghệ thông tin & an toàn vận hành',
      'Giám sát điều phối tổng thể các phân hệ trực thuộc'
    ],
    avatarBg: 'bg-emerald-600',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  },
  ngocNhi: {
    name: 'Ngọc Nhi',
    title: 'Giám Đốc Hệ Thống • Trực Tiếp Điều Hành Ẩm Thực & Tiệc Cưới',
    phones: ['0967823801'],
    responsibilities: [
      'Giám đốc điều hành Hệ thống Dịch vụ Ngọc Nhi',
      'Quản lý trực tiếp Quán Ăn Ngọc Nhi (Ẩm thực & Đặt bàn)',
      'Quản lý trực tiếp Dịch vụ Tiệc Cưới & Hội nghị Sự Kiện'
    ],
    avatarBg: 'bg-rose-600',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
  }
};

// Dining Spaces Data
export const RESTAURANT_SPACES = [
  {
    id: 'space-garden',
    name: 'Sân Vườn Sinh Thái Thoáng Mát',
    capacity: '120 khách (15 - 20 bàn)',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    description: 'Không gian lộng gió rợp bóng cây xanh, hồ cá sinh thái, thích hợp họp mặt gia đình và bạn bè ngày cuối tuần.',
    badge: 'Được Yêu Thích Nhất'
  },
  {
    id: 'space-main',
    name: 'Sảnh Ẩm Thực Chính Ấm Cúng',
    capacity: '80 khách (10 - 12 bàn)',
    image: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=800&q=80',
    description: 'Bàn ghế gỗ cao cấp, ánh sáng vàng ấm cúng, thưởng thức món ngon trong không khí trang nhã và lịch sự.',
    badge: 'Tiện Nghi Hiện Đại'
  },
  {
    id: 'space-vip',
    name: 'Phòng VIP Hoàng Gia Riêng Tư',
    capacity: '3 phòng (10 - 30 khách/phòng)',
    image: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&w=800&q=80',
    description: 'Phòng riêng máy lạnh độc lập, hệ thống karaoke hiện đại, phục vụ riêng cho tiếp khách đối tác & tiệc sinh nhật.',
    badge: 'Riêng Tư & Đẳng Cấp'
  }
];

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  // ==========================================
  // PHÂN HỆ 1: THỰC ĐƠN QUÁN ĂN / QUÁN NHẬU
  // ==========================================

  // --- Đặc sản Dúi Mốc Đại (Cân tươi sống tại chuồng & Chế biến theo yêu cầu) ---
  {
    id: 'm-dui-tietcanh',
    name: 'Tiết Canh Dúi Tươi Sống (Đặc Sản Rừng)',
    category: 'specialty',
    price: 100000,
    description: 'Tiết canh dúi tươi nguyên chất đỏ tươi, hãm chuẩn vị ngọt mát lành tính, rắc đậu phộng rang bùi béo, ăn kèm bánh đa nướng giòn rụm và rau rừng thơm.',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    isSpecialty: true,
    isPopular: true,
    isDuiDish: true,
    serviceType: 'restaurant',
    available: true,
    portion: 'Đặc sản khai vị',
    unit: 'dĩa'
  },
  {
    id: 'm-dui-01',
    name: 'Dúi Hấp Lá Chanh Rừng Thơm Lừng',
    category: 'specialty',
    price: 0,
    description: 'Thịt dúi tươi sống nguyên con ướp sả ớt, hấp cùng lá chanh rừng giữ trọn vị ngọt thanh tự nhiên và lớp da giòn sần sật. Bắt sống và cân trực tiếp tại chuồng.',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    isSpecialty: true,
    isPopular: true,
    isDuiDish: true,
    serviceType: 'restaurant',
    available: true,
    portion: 'Cân tươi tại chuồng',
    unit: 'món'
  },
  {
    id: 'm-dui-02',
    name: 'Dúi Nướng Muối Ớt Xiêm Xanh',
    category: 'specialty',
    price: 0,
    description: 'Ướp muối hạt giã ớt xiêm xanh rừng cay nồng, nướng than hoa vàng ruộm, lớp da giòn rụm thơm nức mũi chấm muối tiêu chanh tươi.',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
    isSpecialty: true,
    isPopular: true,
    isDuiDish: true,
    serviceType: 'restaurant',
    available: true,
    portion: 'Cân tươi tại chuồng',
    unit: 'món'
  },
  {
    id: 'm-dui-03',
    name: 'Dúi Xào Lăn Nước Cốt Dừa & Bánh Mì',
    category: 'specialty',
    price: 0,
    description: 'Thịt dúi thái lát xào lăn cùng bột cà ri mịn, sả ớt, hành tây và nước cốt dừa sánh béo ngậy, ăn kèm bánh mì giòn nóng hổi.',
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80',
    isSpecialty: true,
    isPopular: false,
    isDuiDish: true,
    serviceType: 'restaurant',
    available: true,
    portion: 'Cân tươi tại chuồng',
    unit: 'món'
  },
  {
    id: 'm-dui-04',
    name: 'Dúi Xào Sả Ớt Cay Nồng Lai Rai',
    category: 'specialty',
    price: 0,
    description: 'Thịt dúi xắt lát xào bén lửa lớn với sả băm, ớt sừng, lá quế và hành tây giòn ngọt, món nhậu bén bia chuẩn vị Tây Nguyên.',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
    isSpecialty: true,
    isPopular: true,
    isDuiDish: true,
    serviceType: 'restaurant',
    available: true,
    portion: 'Cân tươi tại chuồng',
    unit: 'món'
  },
  {
    id: 'm-dui-05',
    name: 'Dúi Nướng Mắc Khén Hạt Dổi Tây Bắc',
    category: 'specialty',
    price: 0,
    description: 'Tẩm ướp gia vị hạt dổi mắc khén chuẩn núi rừng, nướng than đượm thơm nồng quyến rũ khó cưỡng.',
    image: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=800&q=80',
    isSpecialty: true,
    isPopular: false,
    isDuiDish: true,
    serviceType: 'restaurant',
    available: true,
    portion: 'Cân tươi tại chuồng',
    unit: 'món'
  },
  {
    id: 'm-dui-06',
    name: 'Lẩu Dúi Nấu Măng Rừng Chua Cay',
    category: 'hotpot_grill',
    price: 0,
    description: 'Nước dùng lẩu hầm xương ngọt thanh kết hợp măng le rừng muối chua dịu, sả cay nồng, ăn kèm rau rừng bún tươi.',
    image: 'https://images.unsplash.com/photo-1547928576-a4a33237cbc3?auto=format&fit=crop&w=800&q=80',
    isSpecialty: true,
    isPopular: true,
    isDuiDish: true,
    serviceType: 'restaurant',
    available: true,
    portion: 'Cân tươi tại chuồng',
    unit: 'nồi'
  },
  {
    id: 'm-dui-07',
    name: 'Dúi Rựa Mận Nấu Rượu Nếp Ăn Kèm Bún',
    category: 'specialty',
    price: 0,
    description: 'Dúi thui rơm vàng rụm, nấu rựa mận cùng riềng mẻ mắm tôm và rượu nếp thơm lừng, đậm đà khó quên.',
    image: 'https://images.unsplash.com/photo-1514944298352-1bc7e30e70a0?auto=format&fit=crop&w=800&q=80',
    isSpecialty: true,
    isPopular: false,
    isDuiDish: true,
    serviceType: 'restaurant',
    available: true,
    portion: 'Cân tươi tại chuồng',
    unit: 'nồi'
  },
  {
    id: 'm-dui-custom-weight',
    name: 'Dúi Tươi Sống Bắt Tại Chuồng (Cân Trọng Lượng & Chế Biến Theo Yêu Cầu)',
    category: 'specialty',
    price: 0,
    description: 'Khách tự tay chọn dúi sống trong chuồng. Bắt và cân trọng lượng thực tế, đầu bếp chế biến nhiều món theo sở thích (Hấp/Nướng/Xào lăn/Rựa mận/Lẩu).',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    isSpecialty: true,
    isPopular: true,
    isDuiDish: true,
    serviceType: 'restaurant',
    available: true,
    portion: '700.000đ/kg + 250k công/món',
    unit: 'kg'
  },

  // --- Khai Vị & Món Nhậu Lai Rai Quán Ăn ---
  {
    id: 'm-nhau-01',
    name: 'Gỏi Bò Bóp Thấu Hoa Chuối Rừng',
    category: 'appetizer',
    price: 160000,
    description: 'Bắp bò tơ thái mỏng trộn hoa chuối bào giòn sần sật, rau răm, đậu phộng rang và nước mắm chua ngọt đặc trưng.',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
    isSpecialty: false,
    isPopular: true,
    serviceType: 'restaurant',
    available: true,
    portion: 'Đĩa khai vị (3-4 người)'
  },
  {
    id: 'm-nhau-02',
    name: 'Gỏi Củ Hủ Dừa Tôm Thịt Đồng Quê',
    category: 'appetizer',
    price: 170000,
    description: 'Củ hủ dừa non ngọt giòn kết hợp tôm sông, tai heo giòn rụm rưới xốt mắm chua ngọt ăn kèm bánh phồng tôm.',
    image: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=800&q=80',
    isSpecialty: false,
    isPopular: true,
    serviceType: 'restaurant',
    available: true,
    portion: 'Đĩa lớn + Bánh phồng'
  },
  {
    id: 'm-nhau-03',
    name: 'Chả Giò Ngọc Nhi Hải Sản Đặc Biệt',
    category: 'appetizer',
    price: 145000,
    description: 'Cuốn chả giò vỏ rế vàng ươm giòn rụm bên trong là tôm mực tươi, củ năng bùi béo chấm xốt mayonnaise me chua ngọt.',
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80',
    isSpecialty: false,
    isPopular: true,
    serviceType: 'restaurant',
    available: true,
    portion: 'Đĩa 8 cuốn giòn tan'
  },
  {
    id: 'm-nhau-04',
    name: 'Bắp Bò Ngâm Mắm Nhĩ Rau Tiến Vua',
    category: 'appetizer',
    price: 180000,
    description: 'Bắp bò hoa giòn sần sật ngâm nước mắm nhĩ ớt tỏi chua ngọt ngấm vị, ăn kèm rau tiến vua ngâm chua cay.',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    isSpecialty: false,
    isPopular: true,
    serviceType: 'restaurant',
    available: true,
    portion: 'Đĩa nhậu bén (3-4 người)'
  },
  {
    id: 'm-nhau-05',
    name: 'Ếch Núp Rơm Chiên Bơ Tỏi Giòn Rụm',
    category: 'appetizer',
    price: 165000,
    description: 'Đùi ếch đồng săn chắc tẩm bột chiên bơ vàng ruộm ẩn mình dưới lớp sả chiên rơm giòn tan chấm muối ớt xanh.',
    image: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=800&q=80',
    isSpecialty: false,
    isPopular: false,
    serviceType: 'restaurant',
    available: true,
    portion: 'Đĩa đùi ếch lớn'
  },
  {
    id: 'm-nhau-06',
    name: 'Mực Trứng Chiên Nước Mắm Nhĩ',
    category: 'seafood',
    price: 220000,
    description: 'Mực trứng tươi rói ôm trọn trứng bùi béo, chiên cháy cạnh cùng nước mắm nhĩ tỏi ớt thơm lừng.',
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80',
    isSpecialty: false,
    isPopular: true,
    serviceType: 'restaurant',
    available: true,
    portion: 'Đĩa 6-8 con mực trứng'
  },
  {
    id: 'm-nhau-07',
    name: 'Đậu Hũ Lướt Ván Chà Bông Mỡ Hành',
    category: 'appetizer',
    price: 95000,
    description: 'Đậu hũ non chiên phồng ngoài giòn trong mềm mịn béo ngậy, phủ đầy chà bông tơi xốp và mỡ hành thơm nức.',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    isSpecialty: false,
    isPopular: false,
    serviceType: 'restaurant',
    available: true,
    portion: 'Phần 8 miếng nóng hổi'
  },

  // --- Món Chính & Nướng Than Hoa Quán Ăn ---
  {
    id: 'm-main-01',
    name: 'Gà Đồi Nướng Cơm Lam Tây Nguyên',
    category: 'main',
    price: 340000,
    description: 'Gà ta thả đồi săn chắc nướng mật ong rừng vàng óng thơm phức, ăn kèm cơm lam nướng ống nứa dẻo bùi chấm muối é.',
    image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80',
    isSpecialty: false,
    isPopular: true,
    serviceType: 'restaurant',
    available: true,
    portion: '1 Con + 3 ống cơm lam'
  },
  {
    id: 'm-main-02',
    name: 'Gà Ta Hấp Muối Hột Lá Chanh Rừng',
    category: 'main',
    price: 330000,
    description: 'Gà ta nguyên con hấp kín hơi muối hột giữ trọn nước ngọt lịm, da gà vàng căng bóng rắc lá chanh rừng chấm muối tiêu chanh.',
    image: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=800&q=80',
    isSpecialty: false,
    isPopular: false,
    serviceType: 'restaurant',
    available: true,
    portion: '1 Con (khoảng 1.4kg)'
  },
  {
    id: 'm-main-03',
    name: 'Bò Tơ Tây Ninh Nướng Tảng Sốt Tiêu Xanh',
    category: 'main',
    price: 310000,
    description: 'Thịt bò tơ mềm mọng giữ nguyên tảng nướng than xém cạnh, rưới sốt tiêu xanh Phú Quốc cay nồng đậm đà khó cưỡng.',
    image: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=800&q=80',
    isSpecialty: false,
    isPopular: true,
    serviceType: 'restaurant',
    available: true,
    portion: 'Phần 400g bò tơ mềm'
  },
  {
    id: 'm-main-04',
    name: 'Cá Lăng Sông Nướng Muối Ớt Xiêm',
    category: 'main',
    price: 380000,
    description: 'Cá lăng sông tươi sống ướp muối ớt xiêm nướng giòn da, thịt cá béo ngọt thơm ngậy cuộn bánh tráng rau rừng chấm mắm nêm.',
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80',
    isSpecialty: false,
    isPopular: true,
    serviceType: 'restaurant',
    available: true,
    portion: '1 Con (khoảng 1.2kg)'
  },
  {
    id: 'm-main-05',
    name: 'Heo Rừng Lai Xào Lăn Nước Cốt Dừa',
    category: 'main',
    price: 240000,
    description: 'Thịt heo rừng bì giòn sần sật xào lăn cùng sả ớt, bột cà ri, hành tây và nước cốt dừa sánh mịn rắc đậu phộng thơm phức.',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
    isSpecialty: false,
    isPopular: false,
    serviceType: 'restaurant',
    available: true,
    portion: 'Đĩa xào lớn (3-4 người)'
  },
  {
    id: 'm-main-06',
    name: 'Tôm Sú Nướng Muối Ớt Than Hồng',
    category: 'seafood',
    price: 280000,
    description: 'Tôm sú loại 1 tươi sống nướng than hồng xiên que, vỏ tôm đỏ au ngấm muối ớt giòn thơm ngọt thịt chấm muối ớt xanh.',
    image: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=800&q=80',
    isSpecialty: false,
    isPopular: true,
    serviceType: 'restaurant',
    available: true,
    portion: 'Đĩa 10 con tôm sú lớn'
  },

  // --- Lẩu Quán Ăn & Món No ---
  {
    id: 'm-hotpot-01',
    name: 'Lẩu Cá Tầm Nấu Măng Chua Thanh Mát',
    category: 'hotpot_grill',
    price: 490000,
    description: 'Cá tầm tươi giòn sần sật trong nước lẩu măng chua thanh mát, cà chua, thì là, rau thơm và bún tươi thơm nức mũi.',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
    isSpecialty: false,
    isPopular: true,
    serviceType: 'restaurant',
    available: true,
    portion: 'Nồi lẩu lớn (4-6 người)'
  },
  {
    id: 'm-hotpot-02',
    name: 'Lẩu Cua Đồng Bắp Bò Sườn Sụn',
    category: 'hotpot_grill',
    price: 390000,
    description: 'Gạch cua đồng thơm ngậy nổi váng, nhúng bắp bò hoa tươi thái lát, sườn sụn giòn sần sật cùng mẹt rau muống hoa chuối.',
    image: 'https://images.unsplash.com/photo-1547928576-a4a33237cbc3?auto=format&fit=crop&w=800&q=80',
    isSpecialty: false,
    isPopular: true,
    serviceType: 'restaurant',
    available: true,
    portion: 'Nồi lẩu riêu cua (4 người)'
  },
  {
    id: 'm-hotpot-03',
    name: 'Lẩu Gà Tiềm Ớt Hiểm Lá É Trắng',
    category: 'hotpot_grill',
    price: 380000,
    description: 'Gà ta thả đồi tiềm cùng ớt hiểm xanh thơm cay dịu, nhúng lá é trắng nồng đượm giải cảm bồi bổ sức khỏe.',
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80',
    isSpecialty: false,
    isPopular: true,
    serviceType: 'restaurant',
    available: true,
    portion: 'Nồi lẩu gà nguyên con'
  },
  {
    id: 'm-rice-01',
    name: 'Cơm Chiên Cá Mặn Gà Xé Thố Đá',
    category: 'main',
    price: 150000,
    description: 'Hạt cơm tơi săn giòn xào cùng khô cá mặn thơm lừng, thịt gà xé nhỏ và hành hoa giòn thơm trong thố đá nóng xèo xèo.',
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80',
    isSpecialty: false,
    isPopular: true,
    serviceType: 'restaurant',
    available: true,
    portion: 'Thố đá nóng (3-4 người)'
  },
  {
    id: 'm-rice-02',
    name: 'Cơm Chiên Hải Sản Hoàng Bào Ngọc Nhi',
    category: 'main',
    price: 165000,
    description: 'Cơm chiên tôm mực tươi ngon bọc lớp trứng hoàng bào vàng óng, rắc hạt sen bùi béo ngọt lành.',
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80',
    isSpecialty: false,
    isPopular: false,
    serviceType: 'restaurant',
    available: true,
    portion: 'Đĩa lớn (3-4 người)'
  },

  // --- Bia & Đồ Uống Quán Nhậu ---
  {
    id: 'm-drink-01',
    name: 'Bia Tiger Nâu / Tiger Crystal Bạc Ướp Lạnh',
    category: 'drink',
    price: 28000,
    description: 'Bia Tiger ướp đá lạnh sảng khoái mát lạnh, phục vụ theo lon hoặc nguyên két đá.',
    image: 'https://images.unsplash.com/photo-1608270114030-9b3bdfbe6bb4?auto=format&fit=crop&w=800&q=80',
    isSpecialty: false,
    isPopular: true,
    serviceType: 'restaurant',
    available: true,
    portion: 'Lon 330ml (Ướp lạnh)'
  },
  {
    id: 'm-drink-02',
    name: 'Bia Heineken Silver Mát Lạnh',
    category: 'drink',
    price: 35000,
    description: 'Heineken Silver êm đằm sảng khoái, chuẩn vị cao cấp cho bàn tiệc gặp gỡ bạn bè đối tác.',
    image: 'https://images.unsplash.com/photo-1538241353348-655566de3dc0?auto=format&fit=crop&w=800&q=80',
    isSpecialty: false,
    isPopular: true,
    serviceType: 'restaurant',
    available: true,
    portion: 'Lon 330ml (Ướp lạnh)'
  },
  {
    id: 'm-drink-03',
    name: 'Rượu Dúi Thuốc Bắc Ngâm Thảo Dược Quý',
    category: 'drink',
    price: 250000,
    description: 'Rượu nếp cái hoa vàng chưng cất truyền thống ngâm bài thuốc bắc đại bổ, thơm êm dịu không đau đầu.',
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80',
    isSpecialty: true,
    isPopular: true,
    serviceType: 'restaurant',
    available: true,
    portion: 'Chai thủy tinh 500ml'
  },
  {
    id: 'm-drink-04',
    name: 'Trà Trái Cây Nhiệt Đới Hạt Chia Mát Lạnh',
    category: 'drink',
    price: 35000,
    description: 'Trà lài ủ lạnh kết hợp cam vàng, dâu tây, chanh leo tươi mát và hạt chia bổ dưỡng thanh nhiệt.',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80',
    isSpecialty: false,
    isPopular: true,
    serviceType: 'restaurant',
    available: true,
    portion: 'Ly 500ml mát lạnh'
  },
  {
    id: 'm-drink-05',
    name: 'Chè Hạt Sen Long Nhãn Cốt Dừa Béo Bùi',
    category: 'dessert',
    price: 40000,
    description: 'Hạt sen bùi dẻo lồng trong cùi nhãn ngọt thanh, chan nước cốt dừa béo ngậy thanh mát giải nhiệt sau bữa tiệc.',
    image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=800&q=80',
    isSpecialty: false,
    isPopular: true,
    serviceType: 'restaurant',
    available: true,
    portion: 'Chén tráng miệng cao cấp'
  },

  // ==========================================
  // PHÂN HỆ 2: THỰC ĐƠN MÂM CỖ TIỆC CƯỚI & SỰ KIỆN
  // ==========================================

  // --- Món Khai Vị Tiệc Cưới ---
  {
    id: 'm-wed-app-01',
    name: 'Mâm Khai Vị 3 Món Hoàng Gia Ngọc Nhi',
    category: 'wedding_appetizer',
    price: 350000,
    description: 'Bộ ba khai vị hoàn hảo mở đầu bàn tiệc cưới: Chả Giò Ngọc Nhi giòn rụm + Gỏi Củ Hủ Dừa Tôm Thịt thanh tao + Mực Trứng Chiên Giòn xốt tắc.',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
    isSpecialty: true,
    isPopular: true,
    serviceType: 'wedding',
    available: true,
    portion: 'Mâm tiệc 10 khách'
  },
  {
    id: 'm-wed-app-02',
    name: 'Súp Vi Cá Hải Sâm Bào Ngư Thượng Hạng',
    category: 'wedding_appetizer',
    price: 390000,
    description: 'Món súp hoàng gia sánh mịn với bào ngư, hải sâm thái sợi, nấm tuyết và thịt cua tươi ngọt vị hải sản cao cấp.',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80',
    isSpecialty: true,
    isPopular: true,
    serviceType: 'wedding',
    available: true,
    portion: 'Thố súp lớn 10 chén'
  },
  {
    id: 'm-wed-app-03',
    name: 'Súp Gà Xé Nấm Hương Hạt Sen Tươi',
    category: 'wedding_appetizer',
    price: 280000,
    description: 'Nước dùng gà hầm thơm lừng, thịt gà ta xé sợi kết hợp nấm hương rừng và hạt sen bùi ngậy khai tiệc ấm cúng.',
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80',
    isSpecialty: false,
    isPopular: true,
    serviceType: 'wedding',
    available: true,
    portion: 'Thố súp lớn 10 chén'
  },
  {
    id: 'm-wed-app-04',
    name: 'Gỏi Bò Tơ Cải Mầm Rau Càng Cua',
    category: 'wedding_appetizer',
    price: 290000,
    description: 'Bò tơ chần chín tới mềm ngọt bóp cùng rau càng cua non, cải mầm tươi và xốt mè rang chua ngọt ăn kèm bánh phồng.',
    image: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=800&q=80',
    isSpecialty: false,
    isPopular: false,
    serviceType: 'wedding',
    available: true,
    portion: 'Mâm tiệc 10 khách'
  },

  // --- Món Chính Tiệc Cưới (Hải Sản & Sơn Hào) ---
  {
    id: 'm-wed-main-01',
    name: 'Gà Ta Quay Lu Da Giòn Xôi Gấc Hạt Sen',
    category: 'wedding_main',
    price: 420000,
    description: 'Gà ta nguyên con quay lu da đỏ au giòn rụm bên trong mọng nước, ăn cùng mâm xôi gấc đỏ son thắm tình nồng và hạt sen bùi.',
    image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80',
    isSpecialty: true,
    isPopular: true,
    serviceType: 'wedding',
    available: true,
    portion: '1 Con gà quay + Mâm xôi gấc lớn'
  },
  {
    id: 'm-wed-main-02',
    name: 'Cá Chẽm Phi Lê Hấp Hồng Kông Xì Dầu Gừng Hành',
    category: 'wedding_main',
    price: 450000,
    description: 'Cá chẽm tươi sống phi lê hấp chín tới ngấm sốt xì dầu Hồng Kông chuẩn vị, sợi gừng hành thanh ngọt cuốn hút.',
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80',
    isSpecialty: false,
    isPopular: true,
    serviceType: 'wedding',
    available: true,
    portion: 'Mâm cá lớn 10 khách'
  },
  {
    id: 'm-wed-main-03',
    name: 'Cá Tầm Nướng Giấy Bạc Muối Ớt Xiêm Xanh',
    category: 'wedding_main',
    price: 480000,
    description: 'Thịt cá tầm giòn sần sật ướp muối ớt xiêm nướng bọc giấy bạc giữ trọn vị ngọt ngào và sụn giòn tan.',
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80',
    isSpecialty: true,
    isPopular: true,
    serviceType: 'wedding',
    available: true,
    portion: 'Mâm tiệc 10 khách'
  },
  {
    id: 'm-wed-main-04',
    name: 'Tôm Sú Hoàng Kim Sốt Trứng Muối Béo Ngậy',
    category: 'wedding_main',
    price: 490000,
    description: 'Tôm sú biển loại to chiên giòn xóc sốt trứng muối hoàng kim vàng óng, béo ngậy thơm lừng tôn vinh mâm cỗ cưới.',
    image: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=800&q=80',
    isSpecialty: true,
    isPopular: true,
    serviceType: 'wedding',
    available: true,
    portion: 'Mâm 12 con tôm sú hoàng kim'
  },
  {
    id: 'm-wed-main-05',
    name: 'Tôm Sú Hấp Nước Dừa Xiêm Tươi',
    category: 'wedding_main',
    price: 460000,
    description: 'Tôm sú tươi xếp vòng tròn hấp cùng nước dừa xiêm ngọt lịm, giữ trọn vẹn vị tươi ngọt nguyên bản chấm muối tiêu chanh.',
    image: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=800&q=80',
    isSpecialty: false,
    isPopular: false,
    serviceType: 'wedding',
    available: true,
    portion: 'Mâm tiệc 10 khách'
  },
  {
    id: 'm-wed-main-06',
    name: 'Bò Né Hoa Thiên Lý Kèm Bánh Phồng Tôm',
    category: 'wedding_main',
    price: 390000,
    description: 'Bò tơ mềm xào nhanh cùng hoa thiên lý giòn ngọt trên chảo gang nóng, món tiệc cưới thanh nhã và ngon miệng.',
    image: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=800&q=80',
    isSpecialty: false,
    isPopular: true,
    serviceType: 'wedding',
    available: true,
    portion: 'Mâm tiệc 10 khách'
  },
  {
    id: 'm-wed-main-07',
    name: 'Heo Sữa Quay Da Giòn Rụm Bánh Bao Hấp',
    category: 'wedding_main',
    price: 580000,
    description: 'Heo sữa quay nguyên con chuẩn phong cách tiệc cưới cao cấp, da vàng giòn rụm chấm xốt tương ngọt ăn kèm bánh bao hấp mềm mịn.',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    isSpecialty: true,
    isPopular: true,
    serviceType: 'wedding',
    available: true,
    portion: 'Mâm tiệc 10 khách + Bánh bao'
  },
  {
    id: 'm-wed-main-08',
    name: 'Chim Bồ Câu Tiềm Hạt Sen Táo Đỏ Đại Bổ',
    category: 'wedding_main',
    price: 490000,
    description: 'Bồ câu Pháp hầm nhừ cùng hạt sen Đồng Nai, táo đỏ, câu kỷ tử và đẳng sâm, nước tiềm ngọt thanh bồi bổ tuyệt hảo.',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80',
    isSpecialty: true,
    isPopular: false,
    serviceType: 'wedding',
    available: true,
    portion: 'Thố tiệc 10 khách'
  },

  // --- Lẩu & Cơm No Tiệc Cưới ---
  {
    id: 'm-wed-hotpot-01',
    name: 'Lẩu Hải Sản Sa Tế Chua Cay & Bún Tươi',
    category: 'wedding_hotpot',
    price: 490000,
    description: 'Nước lẩu tôm cua chua cay đậm đà, mâm hải sản gồm tôm sú, mực ống, nghêu hai cồi và rau nấm tươi mát bún trắng.',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
    isSpecialty: false,
    isPopular: true,
    serviceType: 'wedding',
    available: true,
    portion: 'Nồi lẩu tiệc lớn 10 khách'
  },
  {
    id: 'm-wed-hotpot-02',
    name: 'Lẩu Gà Ta Lá É Trắng Phú Yên',
    category: 'wedding_hotpot',
    price: 450000,
    description: 'Gà ta thả vườn ngọt thịt ninh kỹ với măng le và lá é trắng thơm lừng, nước dùng thanh ngọt giải ngấy tuyệt vời.',
    image: 'https://images.unsplash.com/photo-1547928576-a4a33237cbc3?auto=format&fit=crop&w=800&q=80',
    isSpecialty: false,
    isPopular: true,
    serviceType: 'wedding',
    available: true,
    portion: 'Nồi lẩu tiệc 10 khách'
  },
  {
    id: 'm-wed-hotpot-03',
    name: 'Cơm Chiên Dương Châu Hải Sản Hạt Sen',
    category: 'wedding_hotpot',
    price: 280000,
    description: 'Hạt cơm vàng tơi xào cùng lạp xưởng tôm khô, tôm sú tươi, đậu Hà Lan và hạt sen bùi thơm trọn vị mâm cỗ cưới.',
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80',
    isSpecialty: false,
    isPopular: true,
    serviceType: 'wedding',
    available: true,
    portion: 'Mâm cơm tiệc 10 khách'
  },

  // --- Tráng Miệng Tiệc Cưới ---
  {
    id: 'm-wed-des-01',
    name: 'Chè Hạt Sen Tuyết Nhĩ Long Nhãn Bổ Dưỡng',
    category: 'wedding_dessert',
    price: 220000,
    description: 'Món chè tráng miệng thanh nhã với hạt sen bùi, tuyết nhĩ giòn và long nhãn ngọt mát khép lại bàn tiệc tròn đầy hạnh phúc.',
    image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=800&q=80',
    isSpecialty: false,
    isPopular: true,
    serviceType: 'wedding',
    available: true,
    portion: 'Mâm 10 chén tráng miệng'
  },
  {
    id: 'm-wed-des-02',
    name: 'Mâm Trái Cây Thập Cẩm Theo Mùa Cao Cấp',
    category: 'wedding_dessert',
    price: 200000,
    description: 'Mâm hoa quả tươi mát cắt tỉa nghệ thuật gồm dưa lưới Hoàng Kim, nho Mỹ, thanh long ruột đỏ và táo Envy.',
    image: 'https://images.unsplash.com/photo-1519996529931-28324d5a630e?auto=format&fit=crop&w=800&q=80',
    isSpecialty: false,
    isPopular: true,
    serviceType: 'wedding',
    available: true,
    portion: 'Mâm trái cây 10 khách'
  },
  {
    id: 'm-wed-des-03',
    name: 'Bánh Flan Trái Dừa Xiêm Béo Ngậy',
    category: 'wedding_dessert',
    price: 220000,
    description: 'Bánh flan mềm mịn đúc trọn trong trái dừa xiêm non, thơm lừng vị sữa trứng và nước cốt dừa mát lạnh.',
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
    isSpecialty: false,
    isPopular: false,
    serviceType: 'wedding',
    available: true,
    portion: 'Mâm 10 phần bánh'
  }
];

export const WEDDING_PACKAGES: WeddingPackage[] = [
  {
    id: 'pkg-silver',
    name: 'Gói Tiết Kiệm — Ấm Cúng',
    tier: 'silver',
    tagline: 'Ấm cúng, tinh tế và tối ưu chi phí chỉ từ 1.500.000đ/bàn',
    pricePerTable: 1500000,
    menuItemCount: 4,
    badge: 'Tiết Kiệm & Tối Ưu',
    recommendedFor: 'Tiệc từ 10 - 25 bàn',
    image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=800&q=80',
    highlights: [
      'Thực đơn từ 4 món chuẩn vị đậm đà truyền thống',
      'Trang trí bàn tiệc & hoa lụa tiêu chuẩn trang nhã',
      'Hệ thống âm thanh, ánh sáng tiêu chuẩn sảnh tiệc',
      'Bánh cưới 3 tầng và tháp rượu champagne khai tiệc'
    ],
    includes: [
      'Bàn lễ tân đón khách & thùng tiền mừng',
      'Bảng tên cô dâu chú rể thiết kế riêng',
      'MC dẫn chương trình lễ cưới chuyên nghiệp',
      'Khăn lạnh & nước suối suốt tiệc'
    ]
  },
  {
    id: 'pkg-gold',
    name: 'Gói Phổ Thông — Sang Trọng',
    tier: 'gold',
    tagline: 'Lựa chọn hoàn hảo nhất cho lễ cưới rực rỡ chỉ từ 2.000.000đ/bàn',
    pricePerTable: 2000000,
    menuItemCount: 5,
    badge: 'Được Đặt Nhiều Nhất',
    recommendedFor: 'Tiệc từ 20 - 50 bàn',
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80',
    highlights: [
      'Thực đơn từ 5 món phong phú bao gồm đặc sản núi rừng & hải sản',
      'Gói trang trí hoa tươi tự nhiên tại lối đi & bàn tiệc',
      'Màn hình LED P3 sân khấu trình chiếu visual lãng mạn',
      'Ban nhạc tam tấu hòa tấu acoustic đón khách & nghi lễ'
    ],
    includes: [
      'Toàn bộ quyền lợi của Gói Tiết Kiệm',
      'Backdrop chụp ảnh hoa tươi nghệ thuật (Photo Booth 3x4m)',
      'Pháo kim tuyến & hiệu ứng khói lạnh lúc cô dâu chú rể bước vào',
      'Tặng 01 bàn tiệc dùng thử cho gia đình trước ngày cưới',
      'Vũ đoàn múa khai tiệc đón tân lang tân nương'
    ]
  },
  {
    id: 'pkg-diamond',
    name: 'Gói Cao Cấp — Hoàng Gia',
    tier: 'diamond',
    tagline: 'Đẳng cấp thượng lưu với thực đơn 6 món cao cấp & đặc sản Dúi KaKa',
    pricePerTable: 3000000,
    menuItemCount: 6,
    badge: 'Đẳng Cấp Thượng Lưu',
    recommendedFor: 'Tiệc từ 30 - 80 bàn trở lên',
    image: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=800&q=80',
    highlights: [
      'Thực đơn từ 6 món cao cấp gồm đặc sản Dúi KaKa & sơn hào hải vị',
      'Thiết kế không gian Concept độc quyền theo câu chuyện tình yêu',
      'Đại tiệc ánh sáng hiệu ứng Moving Beam, Laser và khói tuyết',
      'Dàn nhạc sống & MC biểu diễn suốt tiệc'
    ],
    includes: [
      'Toàn bộ quyền lợi cao cấp của Gói Phổ Thông',
      'Xe hoa Mercedes / VinFast đón dâu ngày cưới (nội thành)',
      'Đội ngũ lễ tân khánh tiết 8 người trang phục dạ hội',
      'Miễn phí đồ uống bia & nước ngọt theo tiêu chuẩn tiệc',
      'Tặng gói chụp ảnh phóng sự cưới & quay phim Highlight'
    ]
  }
];

// Wedding Venues & Services
export const WEDDING_VENUES = [
  {
    id: 'venue-grand',
    title: 'Sảnh Hoàng Gia (Grand Ballroom)',
    capacity: 'Sức chứa lên tới 600 khách (60 bàn)',
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80',
    description: 'Không gian trần cao lộng lẫy, hệ thống đèn chùm pha lê sang trọng và màn hình LED P3 sân khấu lớn.'
  },
  {
    id: 'venue-garden',
    title: 'Khu Vườn Tình Yêu (Garden Wedding)',
    capacity: 'Sức chứa 150 - 350 khách (15 - 35 bàn)',
    image: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=800&q=80',
    description: 'Tiệc cưới ngoài trời lãng mạn phong cách Rustic giữa thảm cỏ xanh mướt, hoa tươi và dàn đèn Fairy Lights.'
  },
  {
    id: 'venue-rose',
    title: 'Sảnh Hoa Hồng (Rose Hall)',
    capacity: 'Sức chứa 100 - 250 khách (10 - 25 bàn)',
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80',
    description: 'Không gian ấm cúng tone màu hồng pastel trang nhã, lý tưởng cho lễ đính hôn và tiệc báo hỷ thân mật.'
  },
  {
    id: 'venue-home',
    title: 'Dịch Vụ Nấu Tiệc Tại Tư Gia (Home Catering)',
    capacity: 'Phục vụ từ 5 - 100 bàn tận nơi',
    image: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80',
    description: 'Mang trọn vẹn rạp cưới chuẩn sự kiện, đầu bếp kinh nghiệm và trang thiết bị bàn ghế cao cấp đến tận nhà bạn.'
  }
];

export const WEDDING_SERVICES_GALLERY = [
  {
    title: 'Trang Trí Hoa Tươi & Bàn Gallery',
    image: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=600&q=80',
    subtitle: 'Nghệ thuật hoa tươi nhập khẩu'
  },
  {
    title: 'Lễ Tân Khánh Tiết Rạng Rỡ',
    image: 'https://images.unsplash.com/photo-1529636798458-92182e662485?auto=format&fit=crop&w=600&q=80',
    subtitle: 'Đội ngũ chuyên nghiệp, chu đáo'
  },
  {
    title: 'Tháp Rượu Champagne & Bánh Kem',
    image: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=600&q=80',
    subtitle: 'Khoảnh khắc mở đầu thăng hoa'
  },
  {
    title: 'Âm Thanh Ánh Sáng & Ban Nhạc Sống',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80',
    subtitle: 'Âm thanh chuẩn hòa nhạc đỉnh cao'
  }
];

export const INITIAL_RESERVATIONS: TableBooking[] = [];

export const INITIAL_WEDDING_INQUIRIES: WeddingInquiry[] = [];

export const TESTIMONIALS = [
  {
    name: 'Anh Trần Minh Trí',
    role: 'Khách hàng ẩm thực thân thiết',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    comment: 'Món dúi hấp lá chanh và dúi nướng muối ớt tại Quán Ăn Ngọc Nhi ngon vượt mong đợi. Thịt săn ngọt, da giòn sần sật, không gian sân vườn thoáng mát lý tưởng.',
    rating: 5,
    tag: 'Ẩm Thực Quán Ăn'
  },
  {
    name: 'Cô dâu Thanh Thảo & Chú rể Quốc Bảo',
    role: 'Tổ chức tiệc cưới tại Sảnh Hoàng Gia',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    comment: 'Cảm ơn chị Ngọc Nhi và đội ngũ đã giúp chúng tôi có một ngày cưới trọn vẹn hoàn hảo. Khách mời khen đồ ăn ngon miệng, khánh tiết và âm thanh ánh sáng rất chỉn chu.',
    rating: 5,
    tag: 'Tiệc Cưới Trọn Gói'
  },
  {
    name: 'Bác Nguyễn Văn Thắng',
    role: 'Khách hàng đặt tiệc họp mặt gia đình',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
    comment: 'Gia đình tôi tổ chức tiệc sinh nhật 5 bàn tại phòng VIP Ngọc Nhi. Món ăn nấu rất vừa miệng, phục vụ chu đáo, hệ thống âm thanh karaoke hát rất hay và ấm cúng.',
    rating: 5,
    tag: 'Tiệc Hội Nghị & Gia Đình'
  }
];
