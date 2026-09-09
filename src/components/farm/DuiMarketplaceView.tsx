import React, { useState, useMemo } from 'react';
import { UserRole, DuiProductOrder, DuiProductType, DuiOrderStatus } from '../../types';
import { FarmCage } from './farmTypes';
import { DUI_PRODUCTS, DuiProductItem } from '../../data/duiProductsData';
import { MANAGERS, SYSTEM_INFO } from '../../data/initialData';
import { 
  ShoppingBag, 
  Sparkles, 
  CheckCircle2, 
  Truck, 
  ShieldCheck, 
  Phone, 
  MapPin, 
  Calendar, 
  Layers, 
  FileText, 
  Search, 
  Plus, 
  Check, 
  X, 
  Clock, 
  AlertCircle,
  Tag,
  DollarSign,
  ChevronRight,
  Filter,
  Package,
  Award,
  BookOpen,
  Boxes,
  TrendingUp
} from 'lucide-react';

interface DuiMarketplaceViewProps {
  userRole: UserRole;
  duiOrders: DuiProductOrder[];
  onAddDuiOrder: (orderData: Omit<DuiProductOrder, 'id' | 'code' | 'createdAt' | 'status'>) => DuiProductOrder;
  onUpdateDuiOrderStatus?: (orderId: string, status: DuiOrderStatus) => void;
  onOpenAdminLogin?: (reason?: string) => void;
  farmLiveRatCount?: number;
  cages?: FarmCage[];
}

export const DuiMarketplaceView: React.FC<DuiMarketplaceViewProps> = ({
  userRole,
  duiOrders,
  onAddDuiOrder,
  onUpdateDuiOrderStatus,
  onOpenAdminLogin,
  farmLiveRatCount = 0,
  cages = []
}) => {
  const [activeTab, setActiveTab] = useState<'catalog' | 'order_form' | 'admin_orders'>('catalog');
  const [selectedProduct, setSelectedProduct] = useState<DuiProductItem | null>(DUI_PRODUCTS[0]);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'giong' | 'thit'>('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');

  // TÍNH TOÁN SỐ LIỆU ĐÀN THỰC TẾ TỰ ĐỘNG THEO TRANG TRẠI (REAL-TIME CAGE INVENTORY)
  const farmStats = useMemo(() => {
    // 1. Nhóm 3-4 lạng (Dúi giống baby tách mẹ)
    const baby34Cages = cages.filter(c => 
      c.status !== 'trong' && (c.ratCount || 0) > 0 &&
      (c.weanedBabyGroup === '3_4_lang' || (c.areaKind === 'baby' && (!c.currentWeightKg || c.currentWeightKg <= 0.45)))
    );
    const count34 = baby34Cages.reduce((sum, c) => sum + (c.ratCount || 0), 0);
    const pairs34 = Math.floor(count34 / 2);

    // 2. Nhóm 5-6 lạng (Dúi giống ăn khỏe)
    const baby56Cages = cages.filter(c => 
      c.status !== 'trong' && (c.ratCount || 0) > 0 &&
      (c.weanedBabyGroup === '5_7_lang' || (c.areaKind === 'baby' && c.currentWeightKg && c.currentWeightKg > 0.45 && c.currentWeightKg <= 0.75))
    );
    const count56 = baby56Cages.reduce((sum, c) => sum + (c.ratCount || 0), 0);
    const pairs56 = Math.floor(count56 / 2);

    // 3. Nhóm 8 lạng - 1 kg (Con giống nhỡ)
    const baby81Cages = cages.filter(c => 
      c.status !== 'trong' && (c.ratCount || 0) > 0 &&
      (c.weanedBabyGroup === '8_lang_1_1kg' || 
       (c.areaKind === 'baby' && c.currentWeightKg && c.currentWeightKg > 0.75 && c.currentWeightKg <= 1.15) ||
       (c.babyGroup === '8_lang_1_1_kg'))
    );
    const count81 = baby81Cages.reduce((sum, c) => sum + (c.ratCount || 0), 0);
    const pairs81 = Math.floor(count81 / 2);

    // 4. Dúi Giống Hậu Bị (Đồng bộ trực tiếp 100% từ KHU HẬU BỊ)
    const hauBiCages = cages.filter(c => c.areaKind === 'hau_bi' && c.status !== 'trong' && (c.ratCount || 0) > 0);
    const hauBiMales = hauBiCages.filter(c => c.gender === 'duc').reduce((sum, c) => sum + (c.ratCount || 0), 0);
    const hauBiFemales = hauBiCages.filter(c => c.gender === 'cai' || (!c.gender && c.areaKind === 'hau_bi')).reduce((sum, c) => sum + (c.ratCount || 0), 0);
    const hauBiTotalCount = hauBiCages.reduce((sum, c) => sum + (c.ratCount || 0), 0);
    const hauBiPairs = (hauBiMales > 0 && hauBiFemales > 0) 
      ? Math.min(hauBiMales, hauBiFemales) 
      : Math.floor(hauBiTotalCount / 2);

    // 5. Dúi Bố Mẹ Bao Đẻ (Đồng bộ trực tiếp 100% từ KHU SINH SẢN)
    const breedingCages = cages.filter(c => 
      c.areaKind === 'sinh_san' && c.status !== 'trong' && (c.ratCount || 0) > 0
    );
    const breedingMales = breedingCages.filter(c => c.gender === 'duc').reduce((sum, c) => sum + (c.ratCount || 0), 0);
    const breedingFemales = breedingCages.filter(c => c.gender === 'cai' || c.gender === 'doi').reduce((sum, c) => sum + (c.ratCount || 0), 0);
    const breedingTotalCount = breedingCages.reduce((sum, c) => sum + (c.ratCount || 0), 0);
    const breedingPairs = (breedingMales > 0 && breedingFemales > 0) 
      ? Math.min(breedingMales, breedingFemales) 
      : Math.floor(breedingTotalCount / 2);

    // 6. Dúi Thịt Thương Phẩm (Đồng bộ trực tiếp 100% từ KHU THƯƠNG PHẨM)
    const commercialCages = cages.filter(c => c.areaKind === 'thuong_pham' && c.status !== 'trong' && (c.ratCount || 0) > 0);
    const commercialCount = commercialCages.reduce((sum, c) => sum + (c.ratCount || 0), 0);
    const commercialTotalWeightKg = commercialCages.reduce((sum, c) => {
      const avgWeight = c.currentWeightKg || 1.6;
      return sum + ((c.ratCount || 0) * avgWeight);
    }, 0);

    // Tổng số lượng toàn đàn
    const totalLiveRats = cages.reduce((sum, c) => sum + (c.status !== 'trong' ? (c.ratCount || 0) : 0), 0);

    return {
      count34,
      pairs34,
      count56,
      pairs56,
      count81,
      pairs81,
      hauBiTotalCount,
      hauBiMales,
      hauBiFemales,
      hauBiPairs,
      breedingTotalCount,
      breedingMales,
      breedingFemales,
      breedingPairs,
      commercialCount,
      commercialTotalWeightKg: Math.round(commercialTotalWeightKg * 10) / 10,
      totalLiveRats
    };
  }, [cages]);

  // Cập nhật danh mục sản phẩm kèm số liệu tồn chuồng động từ trang trại
  const dynamicProducts = useMemo(() => {
    return DUI_PRODUCTS.map(p => {
      let liveStock = 0;
      let liveStockLabel = '';
      let isAvailable = true;

      switch (p.type) {
        case 'giong_3_4_lang':
          liveStock = farmStats.count34;
          liveStockLabel = farmStats.count34 > 0 
            ? `${farmStats.count34} con (${farmStats.pairs34} cặp sẵn sàng)`
            : 'Đang chờ lứa mới cai sữa';
          isAvailable = farmStats.count34 > 0;
          break;

        case 'giong_5_6_lang':
          liveStock = farmStats.count56;
          liveStockLabel = farmStats.count56 > 0 
            ? `${farmStats.count56} con (${farmStats.pairs56} cặp sẵn sàng)`
            : 'Đang nuôi tăng trọng';
          isAvailable = farmStats.count56 > 0;
          break;

        case 'giong_8_lang_1kg':
          liveStock = farmStats.count81;
          liveStockLabel = farmStats.count81 > 0 
            ? `${farmStats.count81} con (${farmStats.pairs81} cặp sẵn sàng)`
            : 'Tạm hết đợt 8 lạng - 1kg';
          isAvailable = farmStats.count81 > 0;
          break;

        case 'giong_hau_bi':
        case 'giong_1_2_1_4kg':
          liveStock = farmStats.hauBiTotalCount;
          liveStockLabel = farmStats.hauBiTotalCount > 0 
            ? `${farmStats.hauBiTotalCount} con (${farmStats.hauBiPairs} cặp hậu bị) • Đồng bộ Khu Hậu Bị`
            : 'Đang nuôi dưỡng đàn hậu bị tại Khu Hậu Bị';
          isAvailable = farmStats.hauBiTotalCount > 0;
          break;

        case 'giong_bo_me_bao_de':
          liveStock = farmStats.breedingPairs;
          liveStockLabel = (farmStats.breedingMales > 0 || farmStats.breedingFemales > 0)
            ? `${farmStats.breedingPairs} cặp bố mẹ (${farmStats.breedingMales} đực, ${farmStats.breedingFemales} cái) • Đồng bộ Khu Sinh Sản`
            : 'Đang nuôi dưỡng đàn bố mẹ tại Khu Sinh Sản';
          isAvailable = farmStats.breedingPairs > 0;
          break;

        case 'dui_thuong_pham':
          liveStock = farmStats.commercialCount;
          liveStockLabel = farmStats.commercialCount > 0 
            ? `${farmStats.commercialCount} con (~${farmStats.commercialTotalWeightKg} kg tại chuồng) • Đồng bộ Khu Thương Phẩm`
            : 'Đang vỗ béo lứa tiếp theo tại Khu Thương Phẩm';
          isAvailable = farmStats.commercialCount > 0;
          break;

        default:
          liveStock = farmStats.totalLiveRats;
          liveStockLabel = `${farmStats.totalLiveRats} cá thể`;
          isAvailable = farmStats.totalLiveRats > 0;
      }

      return {
        ...p,
        liveStock,
        liveStockLabel,
        inStock: isAvailable
      };
    });
  }, [farmStats]);

  // Form State
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    deliveryAddress: '',
    deliveryType: 'ship_home' as 'at_farm' | 'ship_home',
    productType: DUI_PRODUCTS[0].type as DuiProductType,
    quantity: 1,
    expectedDate: '',
    notes: ''
  });

  const [createdOrderSuccess, setCreatedOrderSuccess] = useState<DuiProductOrder | null>(null);

  // Quick product select for order form
  const handleSelectProductForOrder = (product: DuiProductItem) => {
    setSelectedProduct(product);
    setFormData(prev => ({
      ...prev,
      productType: product.type,
      quantity: product.minOrder || 1
    }));
    setActiveTab('order_form');
  };

  const currentProductObj = dynamicProducts.find(p => p.type === formData.productType) || dynamicProducts[0];
  const calculatedTotal = currentProductObj.price * (formData.quantity || 1);

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName.trim() || !formData.phone.trim()) {
      alert('Vui lòng nhập Họ tên và Số điện thoại!');
      return;
    }

    const newOrder = onAddDuiOrder({
      customerName: formData.customerName.trim(),
      phone: formData.phone.trim(),
      deliveryAddress: formData.deliveryType === 'at_farm' 
        ? 'Nhận trực tiếp tại Trại Dúi KaKa (Trảng Bom, Đồng Nai)' 
        : formData.deliveryAddress.trim(),
      deliveryType: formData.deliveryType,
      productType: currentProductObj.type,
      productName: currentProductObj.name,
      quantity: Number(formData.quantity) || 1,
      unit: currentProductObj.unit,
      pricePerUnit: currentProductObj.price,
      estimatedTotal: calculatedTotal,
      expectedDate: formData.expectedDate,
      notes: formData.notes
    });

    setCreatedOrderSuccess(newOrder);
  };

  const filteredProducts = categoryFilter === 'all' 
    ? dynamicProducts 
    : dynamicProducts.filter(p => p.category === categoryFilter);

  const filteredOrders = duiOrders.filter(order => {
    if (orderStatusFilter === 'all') return true;
    return order.status === orderStatusFilter;
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-[#072419] via-[#0d3b2b] to-[#124d38] text-white p-6 sm:p-10 shadow-xl border border-emerald-800/60 relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-600/60 text-emerald-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Trang Trại Dúi Mốc Đại KaKa • Dữ Liệu Tồn Chuồng Tự Động</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold font-serif text-white tracking-tight">
            ĐẶT MUA CON GIỐNG & DÚI THỊT THƯƠNG PHẨM
          </h2>

          <p className="text-emerald-100/90 text-xs sm:text-sm leading-relaxed max-w-2xl">
            Số lượng con giống, hậu bị và dúi thịt được <strong>tự động liên kết trực tiếp với dữ liệu thực tế tại các ô chuồng</strong>. Cam kết 100% con giống thuần chủng Mốc Đại tuyển chọn và Dúi thịt sạch tự nhiên.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="px-3.5 py-2.5 rounded-2xl bg-emerald-950/70 border border-emerald-700/60 text-xs text-emerald-200">
              <div className="text-[11px] text-emerald-300/80 font-medium">Tổng Đàn Toàn Trại</div>
              <div className="text-white font-mono font-black text-base">{farmStats.totalLiveRats} <span className="text-[11px] font-normal text-emerald-300">con</span></div>
            </div>

            <div className="px-3.5 py-2.5 rounded-2xl bg-emerald-950/70 border border-emerald-700/60 text-xs text-emerald-200">
              <div className="text-[11px] text-emerald-300/80 font-medium">Dúi Giống Hậu Bị (Khu-HB)</div>
              <div className="text-purple-300 font-mono font-black text-base">{farmStats.hauBiTotalCount} <span className="text-[11px] font-normal text-emerald-300">con ({farmStats.hauBiPairs} cặp)</span></div>
            </div>

            <div className="px-3.5 py-2.5 rounded-2xl bg-emerald-950/70 border border-emerald-700/60 text-xs text-emerald-200">
              <div className="text-[11px] text-emerald-300/80 font-medium">Dúi Bố Mẹ (Khu Sinh Sản)</div>
              <div className="text-amber-300 font-mono font-black text-base">{farmStats.breedingPairs} <span className="text-[11px] font-normal text-emerald-300">cặp ({farmStats.breedingMales}đ, {farmStats.breedingFemales}c)</span></div>
            </div>

            <div className="px-3.5 py-2.5 rounded-2xl bg-emerald-950/70 border border-emerald-700/60 text-xs text-emerald-200">
              <div className="text-[11px] text-emerald-300/80 font-medium">Dúi Thương Phẩm (Khu-TP)</div>
              <div className="text-rose-300 font-mono font-black text-base">{farmStats.commercialCount} <span className="text-[11px] font-normal text-emerald-300">con (~{farmStats.commercialTotalWeightKg}kg)</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === 'catalog'
                ? 'bg-emerald-700 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Danh Mục Con Giống & Dúi Thịt</span>
          </button>

          <button
            onClick={() => setActiveTab('order_form')}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === 'order_form'
                ? 'bg-emerald-700 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Gửi Đơn Đặt Mua Trực Tuyến</span>
          </button>

          {userRole === 'admin' && (
            <button
              onClick={() => setActiveTab('admin_orders')}
              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
                activeTab === 'admin_orders'
                  ? 'bg-slate-900 text-amber-400 shadow-md'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Quản Lý Đơn Mua Dúi ({duiOrders.length})</span>
            </button>
          )}
        </div>

        {userRole === 'guest' && (
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Khách xem có thể đặt mua trực tiếp</span>
          </div>
        )}
      </div>

      {/* 1. CATALOG TAB */}
      {activeTab === 'catalog' && (
        <div className="space-y-6">
          {/* BẢNG GIÁ DÚI ĐÃ THỐNG NHẤT (OFFICIAL UNIFIED PRICE LIST TABLE) */}
          <div className="rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 to-emerald-950 text-white flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="text-lg sm:text-xl font-bold tracking-tight uppercase flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  <span>BẢNG GIÁ DÚI ĐÃ THỐNG NHẤT</span>
                </h3>
                <p className="text-xs text-emerald-200/90 mt-0.5">
                  Bảng giá niêm yết chính thức • Đồng bộ trực tiếp theo các phân khu trang trại
                </p>
              </div>
              <div className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-900/80 border border-emerald-600/60 text-emerald-300">
                Cập nhật chuẩn 100%
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-700 font-bold">
                    <th className="py-3 px-4 sm:px-6">Loại dúi</th>
                    <th className="py-3 px-4 sm:px-6">Trọng lượng / Phân loại</th>
                    <th className="py-3 px-4 sm:px-6 text-right">Giá</th>
                    <th className="py-3 px-4 sm:px-6 text-center">Tồn chuồng thực tế</th>
                    <th className="py-3 px-4 sm:px-6 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {/* Row 1 */}
                  <tr className="hover:bg-emerald-50/40 transition-colors">
                    <td className="py-3.5 px-4 sm:px-6 font-bold text-slate-900">Dúi giống</td>
                    <td className="py-3.5 px-4 sm:px-6 text-slate-700">3–4 lạng</td>
                    <td className="py-3.5 px-4 sm:px-6 text-right font-mono font-bold text-emerald-700 text-sm">
                      1.500.000đ/cặp
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {farmStats.count34} con ({farmStats.pairs34} cặp)
                      </span>
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-right">
                      <button
                        type="button"
                        onClick={() => handleSelectProductForOrder(dynamicProducts.find(p => p.type === 'giong_3_4_lang') || dynamicProducts[0])}
                        className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-all cursor-pointer shadow-xs"
                      >
                        Đặt mua
                      </button>
                    </td>
                  </tr>

                  {/* Row 2 */}
                  <tr className="hover:bg-emerald-50/40 transition-colors">
                    <td className="py-3.5 px-4 sm:px-6 font-bold text-slate-900">Dúi giống</td>
                    <td className="py-3.5 px-4 sm:px-6 text-slate-700">5–6 lạng</td>
                    <td className="py-3.5 px-4 sm:px-6 text-right font-mono font-bold text-emerald-700 text-sm">
                      1.700.000đ/cặp
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {farmStats.count56} con ({farmStats.pairs56} cặp)
                      </span>
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-right">
                      <button
                        type="button"
                        onClick={() => handleSelectProductForOrder(dynamicProducts.find(p => p.type === 'giong_5_6_lang') || dynamicProducts[0])}
                        className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-all cursor-pointer shadow-xs"
                      >
                        Đặt mua
                      </button>
                    </td>
                  </tr>

                  {/* Row 3 */}
                  <tr className="hover:bg-emerald-50/40 transition-colors">
                    <td className="py-3.5 px-4 sm:px-6 font-bold text-slate-900">Dúi giống</td>
                    <td className="py-3.5 px-4 sm:px-6 text-slate-700">8 lạng – 1 kg</td>
                    <td className="py-3.5 px-4 sm:px-6 text-right font-mono font-bold text-emerald-700 text-sm">
                      2.400.000đ/cặp
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {farmStats.count81} con ({farmStats.pairs81} cặp)
                      </span>
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-right">
                      <button
                        type="button"
                        onClick={() => handleSelectProductForOrder(dynamicProducts.find(p => p.type === 'giong_8_lang_1kg') || dynamicProducts[0])}
                        className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-all cursor-pointer shadow-xs"
                      >
                        Đặt mua
                      </button>
                    </td>
                  </tr>

                  {/* Row 4: DÚI GIỐNG HẬU BỊ (ĐỒNG BỘ KHU HẬU BỊ) */}
                  <tr className="hover:bg-purple-50/40 transition-colors bg-purple-50/10">
                    <td className="py-3.5 px-4 sm:px-6 font-bold text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                        <span>Dúi giống hậu bị</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-slate-700">
                      <span className="font-semibold">Hậu bị (1,2 – 1,4 kg)</span>
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-right font-mono font-bold text-emerald-700 text-sm">
                      3.000.000đ/cặp
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100/80 text-purple-900 border border-purple-300">
                        {farmStats.hauBiTotalCount} con ({farmStats.hauBiPairs} cặp) • Khu Hậu Bị
                      </span>
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-right">
                      <button
                        type="button"
                        onClick={() => handleSelectProductForOrder(dynamicProducts.find(p => p.type === 'giong_hau_bi' || p.type === 'giong_1_2_1_4kg') || dynamicProducts[0])}
                        className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-all cursor-pointer shadow-xs"
                      >
                        Đặt mua
                      </button>
                    </td>
                  </tr>

                  {/* Row 5: DÚI BỐ MẸ BAO ĐẺ (ĐỒNG BỘ KHU SINH SẢN) */}
                  <tr className="hover:bg-amber-50/40 transition-colors bg-amber-50/10">
                    <td className="py-3.5 px-4 sm:px-6 font-bold text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                        <span>Dúi bố mẹ bao đẻ</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-slate-700">
                      <span className="font-semibold">Bố mẹ sinh sản</span>
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-right font-mono font-bold text-emerald-700 text-sm">
                      4.000.000đ/cặp
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100/80 text-amber-900 border border-amber-300">
                        {farmStats.breedingPairs} cặp ({farmStats.breedingMales} đực, {farmStats.breedingFemales} cái) • Khu Sinh Sản
                      </span>
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-right">
                      <button
                        type="button"
                        onClick={() => handleSelectProductForOrder(dynamicProducts.find(p => p.type === 'giong_bo_me_bao_de') || dynamicProducts[0])}
                        className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-all cursor-pointer shadow-xs"
                      >
                        Đặt mua
                      </button>
                    </td>
                  </tr>

                  {/* Row 6: DÚI THƯƠNG PHẨM (ĐỒNG BỘ KHU THƯƠNG PHẨM) */}
                  <tr className="hover:bg-rose-50/40 transition-colors bg-rose-50/10">
                    <td className="py-3.5 px-4 sm:px-6 font-bold text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                        <span>Dúi thương phẩm</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-slate-700">
                      <span className="font-semibold">Tính theo kg</span>
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-right font-mono font-bold text-emerald-700 text-sm">
                      700.000đ/kg
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100/80 text-rose-900 border border-rose-300">
                        {farmStats.commercialCount} con (~{farmStats.commercialTotalWeightKg} kg) • Khu Thương Phẩm
                      </span>
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-right">
                      <button
                        type="button"
                        onClick={() => handleSelectProductForOrder(dynamicProducts.find(p => p.type === 'dui_thuong_pham') || dynamicProducts[0])}
                        className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-all cursor-pointer shadow-xs"
                      >
                        Đặt mua
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-600 italic flex items-center justify-between flex-wrap gap-2">
              <span>Đây là bảng giá đã thống nhất trước đó, tôi không bổ sung hay tự đoán thêm mức giá khác.</span>
              <span className="font-semibold text-emerald-800 not-italic">Đồng bộ kho thực tế: {farmStats.totalLiveRats} cá thể</span>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center justify-between flex-wrap gap-3 pt-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-500 mr-1">Lọc thẻ chi tiết:</span>
              <button
                onClick={() => setCategoryFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  categoryFilter === 'all' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Tất Cả Sản Phẩm ({dynamicProducts.length})
              </button>
              <button
                onClick={() => setCategoryFilter('giong')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  categoryFilter === 'giong' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                🦔 Dúi Con Giống Thuần Chủng ({dynamicProducts.filter(p => p.category === 'giong').length})
              </button>
              <button
                onClick={() => setCategoryFilter('thit')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  categoryFilter === 'thit' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                🍖 Dúi Thịt Thương Phẩm ({dynamicProducts.filter(p => p.category === 'thit').length})
              </button>
            </div>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div 
                key={product.id}
                className={`rounded-3xl bg-white border overflow-hidden shadow-xs hover:shadow-xl transition-all flex flex-col justify-between group ${
                  product.inStock ? 'border-slate-200 hover:border-emerald-500' : 'border-amber-200/80 bg-slate-50/50'
                }`}
              >
                <div>
                  {/* Image & Badges */}
                  <div className="relative h-52 w-full overflow-hidden bg-slate-100">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                      {product.badge && (
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950 shadow-md">
                          {product.badge}
                        </span>
                      )}
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-xs ${
                        product.category === 'giong' ? 'bg-emerald-700 text-white' : 'bg-rose-700 text-white'
                      }`}>
                        {product.category === 'giong' ? 'Con Giống' : 'Thịt Thương Phẩm'}
                      </span>
                    </div>

                    <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-slate-950/80 backdrop-blur-xs text-amber-400 font-mono font-black text-sm shadow-md">
                      {product.price.toLocaleString('vi-VN')} đ <span className="text-[10px] text-slate-300 font-normal">/ {product.unit}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 space-y-3">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-emerald-800 transition-colors">
                          {product.name}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-500 italic mt-0.5">
                        {product.tagline}
                      </p>
                    </div>

                    {/* Live farm stock indicator */}
                    <div className={`px-3 py-2 rounded-xl text-xs flex items-center gap-2 border ${
                      product.inStock 
                        ? 'bg-emerald-50 text-emerald-900 border-emerald-200' 
                        : 'bg-amber-50 text-amber-900 border-amber-200'
                    }`}>
                      <Boxes className={`w-4 h-4 shrink-0 ${product.inStock ? 'text-emerald-600' : 'text-amber-600'}`} />
                      <div className="leading-tight">
                        <span className="text-[10px] text-slate-500 block">Hiện có tại chuồng:</span>
                        <strong className="font-mono text-xs">{product.liveStockLabel}</strong>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {product.description}
                    </p>

                    {/* Highlights */}
                    <div className="space-y-1.5 pt-1">
                      <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                        Ưu điểm & Cam kết:
                      </div>
                      <ul className="space-y-1 text-[11px] text-slate-600">
                        {product.highlights.map((h, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Bottom Action */}
                <div className="p-5 pt-0">
                  <button
                    type="button"
                    onClick={() => handleSelectProductForOrder(product)}
                    className="w-full py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Đặt Mua Sản Phẩm Này</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Farm Policy Assurance Block */}
          <div className="rounded-3xl bg-emerald-50 border border-emerald-200 p-6 sm:p-8 space-y-4">
            <h4 className="font-bold text-emerald-950 text-base flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-700" />
              <span>Chính Sách Chuyển Giao & Đồng Hành Của Trại Dúi KaKa</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-emerald-900">
              <div className="p-4 rounded-2xl bg-white border border-emerald-100 space-y-1.5 shadow-2xs">
                <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Bảo Hành 1 Đổi 1</span>
                </div>
                <p className="text-slate-600">
                  Bảo hành con giống 30 ngày đối với mọi rủi ro về dịch bệnh hoặc không thích nghi.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-emerald-100 space-y-1.5 shadow-2xs">
                <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  <span>Chuyển Giao Kỹ Thuật</span>
                </div>
                <p className="text-slate-600">
                  Tặng kèm cẩm nang quy trình làm chuồng, thức ăn, lịch phối giống và xử lý bệnh miễn phí.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-emerald-100 space-y-1.5 shadow-2xs">
                <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-emerald-600" />
                  <span>Giao Hàng Toàn Quốc</span>
                </div>
                <p className="text-slate-600">
                  Vận chuyển an toàn bằng xe chuyên dụng kèm thùng thông gió và thức ăn nước uống trên đường.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. ORDER FORM TAB */}
      {activeTab === 'order_form' && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 space-y-6 shadow-md">
            <div>
              <h3 className="font-bold text-slate-900 text-lg sm:text-xl">
                Phiếu Đăng Ký Mua Con Giống / Dúi Thịt
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Điền thông tin bên dưới, Trại Dúi KaKa sẽ liên hệ xác nhận và chuẩn bị đơn hàng cho quý khách.
              </p>
            </div>

            {/* Current Selected Product Stock Notice */}
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Boxes className="w-4 h-4 text-emerald-700" />
                <span>Số lượng thực tế tại trại cho loại này: <strong className="font-mono text-emerald-900">{currentProductObj.liveStockLabel}</strong></span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200/80 text-emerald-900">
                Tự động đồng bộ
              </span>
            </div>

            <form onSubmit={handleSubmitOrder} className="space-y-4 text-xs">
              {/* Product Select */}
              <div className="space-y-1">
                <label className="font-bold text-slate-800 block">
                  Chọn Loại Dúi Muốn Mua *
                </label>
                <select
                  value={formData.productType}
                  onChange={(e) => setFormData({ ...formData, productType: e.target.value as DuiProductType })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold focus:outline-none focus:border-emerald-500"
                >
                  {dynamicProducts.map(p => (
                    <option key={p.id} value={p.type}>
                      {p.name} - {p.price.toLocaleString('vi-VN')} đ / {p.unit} ({p.liveStockLabel})
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity and Estimate */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-800 block">
                    Số Lượng ({currentProductObj.unit}) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Math.max(1, Number(e.target.value)) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono font-bold text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800 block">
                    Tạm Tính Tiền Hàng
                  </label>
                  <div className="w-full px-3.5 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 font-mono font-black text-base flex items-center justify-between">
                    <span>Tổng:</span>
                    <span>{calculatedTotal.toLocaleString('vi-VN')} đ</span>
                  </div>
                </div>
              </div>

              {/* Customer Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-800 block">
                    Họ và Tên Khách Hàng *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Anh Nguyễn Văn Bình..."
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800 block">
                    Số Điện Thoại Liên Hệ *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Ví dụ: 0912.345.678..."
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono"
                  />
                </div>
              </div>

              {/* Delivery Type */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 block">
                  Hình Thức Nhận Hàng *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className={`p-3 rounded-2xl border-2 flex items-center gap-3 cursor-pointer transition-all ${
                    formData.deliveryType === 'ship_home'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                      : 'border-slate-200 bg-white text-slate-600'
                  }`}>
                    <input
                      type="radio"
                      name="deliveryType"
                      checked={formData.deliveryType === 'ship_home'}
                      onChange={() => setFormData({ ...formData, deliveryType: 'ship_home' })}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <div className="text-xs">🚚 Giao Hàng Tận Nơi</div>
                      <div className="text-[10px] text-slate-500">Đóng thùng chuyên dụng giao tận tay</div>
                    </div>
                  </label>

                  <label className={`p-3 rounded-2xl border-2 flex items-center gap-3 cursor-pointer transition-all ${
                    formData.deliveryType === 'at_farm'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                      : 'border-slate-200 bg-white text-slate-600'
                  }`}>
                    <input
                      type="radio"
                      name="deliveryType"
                      checked={formData.deliveryType === 'at_farm'}
                      onChange={() => setFormData({ ...formData, deliveryType: 'at_farm' })}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <div className="text-xs">🏡 Đến Bắt Trực Tiếp Tại Trại</div>
                      <div className="text-[10px] text-slate-500">Được chọn lựa tại chuồng và tham quan</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Delivery Address (if ship_home) */}
              {formData.deliveryType === 'ship_home' && (
                <div className="space-y-1">
                  <label className="font-bold text-slate-800 block">
                    Địa Chỉ Giao Hàng Chi Tiết *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Số nhà, tên đường, xã/phường, quận/huyện, tỉnh/thành phố..."
                    value={formData.deliveryAddress}
                    onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900"
                  />
                </div>
              )}

              {/* Expected Date & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-800 block">
                    Ngày Dự Kiến Nhận Hàng
                  </label>
                  <input
                    type="date"
                    value={formData.expectedDate}
                    onChange={(e) => setFormData({ ...formData, expectedDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800 block">
                    Ghi Chú Yêu Cầu Riêng
                  </label>
                  <input
                    type="text"
                    placeholder="Yêu cầu độ tuổi, cách chế biến, giờ giao..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-lg shadow-emerald-700/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Xác Nhận Gửi Đơn Đặt Mua Dúi ({calculatedTotal.toLocaleString('vi-VN')} đ)</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3. ADMIN ORDERS MANAGEMENT TAB (ADMIN ONLY) */}
      {activeTab === 'admin_orders' && userRole === 'admin' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                Danh Sách Đơn Đặt Mua Con Giống & Dúi Thịt
              </h3>
              <p className="text-xs text-slate-500">
                Theo dõi, xác nhận và cập nhật tiến độ giao hàng cho khách
              </p>
            </div>

            {/* Filter by status */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Trạng thái:</span>
              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold"
              >
                <option value="all">Tất cả ({duiOrders.length})</option>
                <option value="new">Mới nhận ({duiOrders.filter(o => o.status === 'new').length})</option>
                <option value="confirmed">Đã xác nhận ({duiOrders.filter(o => o.status === 'confirmed').length})</option>
                <option value="shipping">Đang giao ({duiOrders.filter(o => o.status === 'shipping').length})</option>
                <option value="completed">Hoàn thành ({duiOrders.filter(o => o.status === 'completed').length})</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="p-8 rounded-3xl bg-white border border-slate-200 text-center text-slate-400 space-y-2">
              <Package className="w-8 h-8 mx-auto opacity-50" />
              <p className="text-xs">Chưa có đơn đặt hàng nào trong danh mục này.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-md font-mono font-black text-xs bg-slate-900 text-amber-400">
                        {order.code}
                      </span>
                      <span className="font-bold text-slate-900 text-sm">
                        {order.customerName}
                      </span>
                      <a href={`tel:${order.phone}`} className="text-emerald-700 font-mono font-bold text-xs hover:underline">
                        ({order.phone})
                      </a>
                      <span className="text-[11px] text-slate-400">• {order.createdAt}</span>
                    </div>

                    <div className="text-xs text-slate-700 space-y-1">
                      <div>
                        Sản phẩm: <strong>{order.productName}</strong> — Số lượng: <span className="font-mono font-bold text-emerald-800">{order.quantity} {order.unit}</span>
                      </div>
                      <div className="text-slate-500">
                        Địa chỉ: <span>{order.deliveryAddress}</span> ({order.deliveryType === 'at_farm' ? '🏡 Nhận tại trại' : '🚚 Giao tận nơi'})
                      </div>
                      {order.notes && (
                        <div className="text-amber-800 italic">
                          Ghi chú: {order.notes}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-start md:items-end justify-between gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400">Tổng tiền ước tính:</div>
                      <div className="font-mono font-black text-amber-700 text-base">
                        {order.estimatedTotal.toLocaleString('vi-VN')} đ
                      </div>
                    </div>

                    {/* Status update buttons */}
                    {onUpdateDuiOrderStatus && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {order.status === 'new' && (
                          <button
                            onClick={() => onUpdateDuiOrderStatus(order.id, 'confirmed')}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                          >
                            Xác Nhận Đơn
                          </button>
                        )}

                        {order.status === 'confirmed' && (
                          <button
                            onClick={() => onUpdateDuiOrderStatus(order.id, 'shipping')}
                            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs"
                          >
                            Xuất Chuồng Giao
                          </button>
                        )}

                        {order.status === 'shipping' && (
                          <button
                            onClick={() => onUpdateDuiOrderStatus(order.id, 'completed')}
                            className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs"
                          >
                            Hoàn Thành
                          </button>
                        )}

                        {order.status !== 'cancelled' && order.status !== 'completed' && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Hủy đơn hàng ${order.code}?`)) {
                                onUpdateDuiOrderStatus(order.id, 'cancelled');
                              }
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 font-bold text-xs"
                          >
                            Hủy
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Success Modal after submitting order */}
      {createdOrderSuccess && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 text-lg sm:text-xl">
                Đăng Ký Mua Dúi Thành Công!
              </h3>
              <p className="text-xs text-slate-500">
                Đơn hàng của bạn đã được gửi đến Ban Quản Trị Trại Dúi KaKa.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-left text-xs space-y-2 text-emerald-950">
              <div className="flex justify-between items-center border-b border-emerald-200/60 pb-2">
                <span className="text-emerald-800">Mã đơn hàng của bạn:</span>
                <span className="font-mono font-black text-sm bg-white px-2.5 py-1 rounded-lg border border-emerald-300 text-slate-900 shadow-2xs">
                  {createdOrderSuccess.code}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-800">Sản phẩm:</span>
                <strong className="text-slate-900">{createdOrderSuccess.productName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-800">Số lượng:</span>
                <span className="font-bold">{createdOrderSuccess.quantity} {createdOrderSuccess.unit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-800">Tạm tính:</span>
                <span className="font-mono font-black text-emerald-900">{createdOrderSuccess.estimatedTotal.toLocaleString('vi-VN')} đ</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Chủ trại <strong>{MANAGERS.dungKaka.name}</strong> sẽ gọi điện thoại tới số <strong>{createdOrderSuccess.phone}</strong> trong vòng 15-30 phút để xác nhận phương thức vận chuyển.
            </p>

            <button
              onClick={() => {
                setCreatedOrderSuccess(null);
                setActiveTab('catalog');
              }}
              className="w-full py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md cursor-pointer"
            >
              Đã Hiểu & Quay Lại Danh Mục
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
