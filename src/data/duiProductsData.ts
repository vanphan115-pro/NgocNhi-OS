import { DuiProductOrder, DuiProductType } from '../types';
import duiBabyImg from '../assets/images/dui_baby_giong_1788326854818.jpg';
import dui56Img from '../assets/images/dui_giong_56_1788326871527.jpg';
import dui81Img from '../assets/images/dui_giong_81_1788326884177.jpg';
import duiHauBiImg from '../assets/images/dui_haubi_mature_1788326899158.jpg';
import duiBoMeImg from '../assets/images/dui_bome_pair_1788326912571.jpg';
import duiThuongPhamImg from '../assets/images/dui_thuong_pham_1788326926962.jpg';

export interface DuiProductItem {
  id: string;
  type: DuiProductType;
  name: string;
  category: 'giong' | 'thit';
  price: number;
  unit: string;
  image: string;
  tagline: string;
  description: string;
  highlights: string[];
  inStock: boolean;
  minOrder: number;
  badge?: string;
}

export const DUI_PRODUCTS: DuiProductItem[] = [
  {
    id: 'prod-giong-3-4-lang',
    type: 'giong_3_4_lang',
    name: 'Dúi Giống (3 – 4 lạng)',
    category: 'giong',
    price: 1500000,
    unit: 'cặp',
    image: duiBabyImg,
    tagline: 'Trọng lượng 3–4 lạng / con, cai sữa khỏe mạnh, đã tập ăn cứng cáp',
    description: 'Dúi giống mốc đại thuần chủng phân loại 3–4 lạng, tỷ lệ sống cao, thích nghi môi trường nhanh, phù hợp nhân đàn mới.',
    highlights: [
      'Trọng lượng đạt chuẩn 3–4 lạng/con (tập ăn tre, mía, ngô thuần)',
      'Bảo hành con giống 30 ngày (1 đổi 1)',
      'Được hướng dẫn kỹ thuật làm chuồng và phòng bệnh'
    ],
    inStock: true,
    minOrder: 1,
    badge: '3 – 4 lạng'
  },
  {
    id: 'prod-giong-5-6-lang',
    type: 'giong_5_6_lang',
    name: 'Dúi Giống (5 – 6 lạng)',
    category: 'giong',
    price: 1700000,
    unit: 'cặp',
    image: dui56Img,
    tagline: 'Trọng lượng 5–6 lạng / con, tăng trưởng mạnh, sức đề kháng cao',
    description: 'Dòng con giống 5–6 lạng khung to xương lớn, ăn khỏe, tăng trọng đều đặn, đề kháng tốt với thời tiết.',
    highlights: [
      'Trọng lượng đạt chuẩn 5–6 lạng/con',
      'Đã ổn định tiêu hóa, thích hợp nuôi phát triển nhanh',
      'Tặng sổ tay dinh dưỡng và phòng bệnh theo mùa'
    ],
    inStock: true,
    minOrder: 1,
    badge: '5 – 6 lạng'
  },
  {
    id: 'prod-giong-8-lang-1kg',
    type: 'giong_8_lang_1kg',
    name: 'Dúi Giống (8 lạng – 1 kg)',
    category: 'giong',
    price: 2400000,
    unit: 'cặp',
    image: dui81Img,
    tagline: 'Trọng lượng 8 lạng – 1 kg / con, tuyển chọn khỏe mạnh',
    description: 'Dúi giống đạt trọng lượng 0.8kg - 1.0kg, ngoại hình đẹp, lông mượt, răng mọc đều, chuẩn bị bước vào giai đoạn phát triển hậu bị.',
    highlights: [
      'Trọng lượng 8 lạng – 1 kg/con',
      'Thích nghi môi trường tốt, tăng trưởng nhanh',
      'Hỗ trợ kỹ thuật nuôi dưỡng và thức ăn'
    ],
    inStock: true,
    minOrder: 1,
    badge: '8 lạng – 1 kg'
  },
  {
    id: 'prod-giong-haubi',
    type: 'giong_hau_bi',
    name: 'Dúi Giống Hậu Bị (1,2 – 1,4 kg)',
    category: 'giong',
    price: 3000000,
    unit: 'cặp',
    image: duiHauBiImg,
    tagline: 'Đồng bộ từ Khu Hậu Bị: Trọng lượng 1,2 – 1,4 kg/con, thành thục sinh dục, sẵn sàng lên giống',
    description: 'Dúi giống hậu bị thể trạng lớn 1,2 – 1,4 kg/con, tuyển chọn trực tiếp từ Khu Hậu Bị của trang trại. Đã qua kiểm tra khung xương, răng và sức đề kháng, sẵn sàng ghép đôi phối giống.',
    highlights: [
      'Liên kết trực tiếp từ Khu Hậu Bị (Khu-HB) của trang trại',
      'Trọng lượng chuẩn 1,2 – 1,4 kg/con (khung to, thể lực sung mãn)',
      'Sẵn sàng ghép đôi phối giống sinh sản ngay',
      'Bảo hành chất lượng giống thuần chủng Mốc Đại'
    ],
    inStock: true,
    minOrder: 1,
    badge: 'Khu Hậu Bị'
  },
  {
    id: 'prod-giong-bome-baode',
    type: 'giong_bo_me_bao_de',
    name: 'Dúi Bố Mẹ Bao Đẻ',
    category: 'giong',
    price: 4000000,
    unit: 'cặp',
    image: duiBoMeImg,
    tagline: 'Đồng bộ từ Khu Sinh Sản: Cặp bố mẹ thuần thục đã qua kiểm chứng sinh sản, cam kết bao đẻ',
    description: 'Cặp dúi bố mẹ liên kết trực tiếp từ Khu Sinh Sản của trang trại, đã đẻ thành công, con đực sung mãn phối tốt, con cái khéo nuôi con, cam kết 100% sinh sản.',
    highlights: [
      'Liên kết trực tiếp từ Khu Sinh Sản (Khu-SS) của trang trại',
      'Cam kết chất lượng bao đẻ (1 đổi 1 nếu không sinh sản)',
      'Bố mẹ thuần thục, mắn đẻ (3-5 con/lứa)',
      'Hỗ trợ thu mua bao tiêu đầu ra lứa con non'
    ],
    inStock: true,
    minOrder: 1,
    badge: 'Khu Sinh Sản'
  },
  {
    id: 'prod-thit-thuong-pham',
    type: 'dui_thuong_pham',
    name: 'Dúi Thương Phẩm',
    category: 'thit',
    price: 700000,
    unit: 'kg',
    image: duiThuongPhamImg,
    tagline: 'Đồng bộ từ Khu Thương Phẩm: Nuôi tự nhiên bằng tre, mía, ngô - thịt thơm ngon săn chắc',
    description: 'Dúi thịt thương phẩm liên kết trực tiếp từ Khu Thương Phẩm của trang trại, cân ký tươi sống tại chuồng, thịt nạc ngọt đậm đà, da dày giòn không mỡ.',
    highlights: [
      'Liên kết trực tiếp từ Khu Thương Phẩm (Khu-TP) của trang trại',
      'Giá bán thống nhất: 700.000đ / kg',
      'Cân thực tế trực tiếp tại chuồng trại',
      'Hỗ trợ chọn con và giao sống tận nơi'
    ],
    inStock: true,
    minOrder: 1,
    badge: 'Khu Thương Phẩm'
  }
];

export const INITIAL_DUI_ORDERS: DuiProductOrder[] = [
  {
    id: 'dui-order-1',
    code: 'NN-DUI-9021',
    customerName: 'Anh Trần Minh Tuấn',
    phone: '0913.882.114',
    deliveryAddress: 'Phường Trảng Dài, TP. Biên Hòa, Đồng Nai',
    deliveryType: 'ship_home',
    productType: 'giong_8_lang_1kg',
    productName: 'Dúi Giống (8 lạng – 1 kg)',
    quantity: 2,
    unit: 'cặp',
    pricePerUnit: 2400000,
    estimatedTotal: 4800000,
    expectedDate: '2026-08-30',
    notes: 'Nhờ Trại chuyển giao kèm tài liệu kỹ thuật xây chuồng và máng ăn.',
    status: 'confirmed',
    createdAt: '2026-08-28 14:20'
  },
  {
    id: 'dui-order-2',
    code: 'NN-DUI-8412',
    customerName: 'Chị Nguyễn Thu Hằng',
    phone: '0908.552.930',
    deliveryAddress: 'Đến bắt trực tiếp tại Trại Dúi KaKa (Trảng Bom)',
    deliveryType: 'at_farm',
    productType: 'dui_thuong_pham',
    productName: 'Dúi Thương Phẩm',
    quantity: 3,
    unit: 'kg',
    pricePerUnit: 700000,
    estimatedTotal: 2100000,
    expectedDate: '2026-08-29',
    notes: 'Chiều 16h ghé trại bắt sống về làm tiệc sinh nhật gia đình.',
    status: 'new',
    createdAt: '2026-08-28 16:45'
  },
  {
    id: 'dui-order-3',
    code: 'NN-DUI-7719',
    customerName: 'Nhà Hàng Cơm Quê Long Khánh',
    phone: '0937.112.449',
    deliveryAddress: 'Số 45 Đường Hùng Vương, TP. Long Khánh, Đồng Nai',
    deliveryType: 'ship_home',
    productType: 'giong_bo_me_bao_de',
    productName: 'Dúi Bố Mẹ Bao Đẻ',
    quantity: 1,
    unit: 'cặp',
    pricePerUnit: 4000000,
    estimatedTotal: 4000000,
    expectedDate: '2026-08-31',
    notes: 'Chọn cặp bố mẹ đang phát triển tốt nhất giúp em.',
    status: 'new',
    createdAt: '2026-08-28 18:10'
  }
];
