import React, { useState } from 'react';
import { 
  Utensils, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Sparkles, 
  Check, 
  X, 
  UploadCloud, 
  DollarSign, 
  Tag, 
  Image as ImageIcon 
} from 'lucide-react';
import { MenuItem, UserRole } from '../../types';

interface WeddingMenuViewProps {
  userRole: UserRole;
  menuItems: MenuItem[];
  onUpdateMenuItem?: (item: MenuItem) => void;
  onAddMenuItem?: (item: MenuItem) => void;
  onDeleteMenuItem?: (itemId: string) => void;
}

export const WeddingMenuView: React.FC<WeddingMenuViewProps> = ({
  userRole,
  menuItems,
  onUpdateMenuItem,
  onAddMenuItem,
  onDeleteMenuItem,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editingDish, setEditingDish] = useState<MenuItem | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);
  const [deleteConfirmDish, setDeleteConfirmDish] = useState<MenuItem | null>(null);

  // New dish form state
  const [newDishForm, setNewDishForm] = useState<Partial<MenuItem>>({
    name: '',
    category: 'wedding_appetizer',
    price: 350000,
    description: '',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
    serviceType: 'wedding',
    available: true,
    portion: 'Mâm tiệc 10 khách'
  });

  const weddingDishes = menuItems.filter(
    item => item.serviceType === 'wedding' || item.serviceType === 'both' || item.category.startsWith('wedding_')
  );

  const categories = [
    { id: 'all', label: 'Tất Cả Món Tiệc' },
    { id: 'wedding_appetizer', label: 'Khai Vị Hoàng Gia' },
    { id: 'wedding_main', label: 'Món Chính & Sơn Hào' },
    { id: 'wedding_hotpot', label: 'Lẩu & Cơm No Tiệc' },
    { id: 'wedding_dessert', label: 'Tráng Miệng Bổ Dưỡng' },
  ];

  const filteredDishes = weddingDishes.filter((dish) => {
    const matchesCategory = selectedCategory === 'all' || dish.category === selectedCategory;
    const matchesSearch = dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          dish.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSaveNewDish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDishForm.name?.trim() || !onAddMenuItem) return;

    const created: MenuItem = {
      id: `m-wed-${Date.now()}`,
      name: newDishForm.name.trim(),
      category: (newDishForm.category as any) || 'wedding_main',
      price: Number(newDishForm.price) || 300000,
      description: newDishForm.description?.trim() || 'Món ăn tiệc cưới truyền thống thơm ngon.',
      image: newDishForm.image || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
      serviceType: 'wedding',
      available: newDishForm.available !== false,
      portion: newDishForm.portion || 'Mâm tiệc 10 khách',
      isSpecialty: false
    };

    onAddMenuItem(created);
    setIsCreatingNew(false);
    setNewDishForm({
      name: '',
      category: 'wedding_appetizer',
      price: 350000,
      description: '',
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
      serviceType: 'wedding',
      available: true,
      portion: 'Mâm tiệc 10 khách'
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner & Search */}
      <div className="bg-white rounded-3xl p-6 border border-rose-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">
              Ẩm Thực Mâm Cỗ Cưới
            </span>
            <h1 className="text-2xl font-black text-slate-900 font-serif">
              THỰC ĐƠN MÂM CỖ TIỆC CƯỚI NGỌC NHI
            </h1>
            <p className="text-xs text-slate-500">
              Tổng cộng <strong>{weddingDishes.length} món ăn</strong> tiệc cưới cao cấp được chế biến bởi bếp trưởng Ngọc Nhi.
            </p>
          </div>

          {userRole === 'admin' && (
            <button
              onClick={() => setIsCreatingNew(true)}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>+ Thêm Món Tiệc Mới</span>
            </button>
          )}
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === c.id
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm tên món, mô tả..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-rose-500"
            />
          </div>
        </div>
      </div>

      {/* Dish Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDishes.map((dish) => {
          const isAvailable = dish.available !== false;

          return (
            <div
              key={dish.id}
              className="rounded-3xl bg-white border border-rose-100 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="relative h-48 overflow-hidden bg-slate-100">
                  <img
                    src={dish.image}
                    alt={dish.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-rose-600 text-white shadow-md">
                    Tiệc Cưới
                  </span>
                  <span className="absolute bottom-3 right-3 px-3 py-1 rounded-xl text-xs font-mono font-bold bg-slate-950/80 text-rose-300 backdrop-blur-xs">
                    {dish.price.toLocaleString('vi-VN')}đ
                  </span>

                  {!isAvailable && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center">
                      <span className="px-3 py-1 rounded-full bg-red-600 text-white text-xs font-black uppercase tracking-wider">
                        Tạm Ngưng Phục Vụ
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-5 space-y-2">
                  <h3 className="font-bold text-slate-900 text-base group-hover:text-rose-700 transition-colors">
                    {dish.name}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {dish.description}
                  </p>
                </div>
              </div>

              <div className="p-4 pt-0 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-medium text-rose-900 bg-rose-50 px-2.5 py-1 rounded-md text-[11px]">
                  {dish.portion || 'Mâm tiệc 10 khách'}
                </span>

                {userRole === 'admin' ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setEditingDish(dish)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 transition-colors cursor-pointer"
                      title="Sửa món ăn này"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    {onDeleteMenuItem && (
                      <button
                        onClick={() => setDeleteConfirmDish(dish)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-700 transition-colors cursor-pointer"
                        title="Xóa món ăn"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {onUpdateMenuItem && (
                      <button
                        onClick={() => onUpdateMenuItem({ ...dish, available: !isAvailable })}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                          isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {isAvailable ? 'Còn món' : 'Hết món'}
                      </button>
                    )}
                  </div>
                ) : (
                  <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Mâm cỗ chuẩn vị</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmDish && onDeleteMenuItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Xác nhận xóa món ăn?</h3>
            <p className="text-xs text-slate-600">
              Bạn có chắc chắn muốn xóa món <strong>"{deleteConfirmDish.name}"</strong> khỏi thực đơn tiệc cưới?
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmDish(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  onDeleteMenuItem(deleteConfirmDish.id);
                  setDeleteConfirmDish(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Dish Modal */}
      {editingDish && onUpdateMenuItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 my-auto max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-rose-600" />
                <span>Chỉnh Sửa Món Tiệc Cưới</span>
              </h3>
              <button onClick={() => setEditingDish(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                onUpdateMenuItem(editingDish);
                setEditingDish(null);
              }}
              className="space-y-3.5 overflow-y-auto pr-1 flex-1 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên món *</label>
                <input
                  type="text"
                  required
                  value={editingDish.name}
                  onChange={(e) => setEditingDish({ ...editingDish, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Giá (VNĐ) *</label>
                  <input
                    type="number"
                    required
                    value={editingDish.price}
                    onChange={(e) => setEditingDish({ ...editingDish, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 font-mono font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Khẩu phần</label>
                  <input
                    type="text"
                    value={editingDish.portion || ''}
                    onChange={(e) => setEditingDish({ ...editingDish, portion: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ảnh URL</label>
                <input
                  type="url"
                  value={editingDish.image}
                  onChange={(e) => setEditingDish({ ...editingDish, image: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-[11px] font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mô tả món</label>
                <textarea
                  rows={2}
                  value={editingDish.description}
                  onChange={(e) => setEditingDish({ ...editingDish, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingDish(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md"
                >
                  Lưu Thay Đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Dish Modal */}
      {isCreatingNew && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 my-auto max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Plus className="w-4 h-4 text-rose-600" />
                <span>Thêm Món Tiệc Mới</span>
              </h3>
              <button onClick={() => setIsCreatingNew(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewDish} className="space-y-3.5 overflow-y-auto pr-1 flex-1 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên món ăn *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Tôm Sú Hấp Nước Dừa Xiêm"
                  value={newDishForm.name}
                  onChange={(e) => setNewDishForm({ ...newDishForm, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nhóm món *</label>
                  <select
                    value={newDishForm.category}
                    onChange={(e) => setNewDishForm({ ...newDishForm, category: e.target.value as any })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-semibold"
                  >
                    <option value="wedding_appetizer">Khai Vị Hoàng Gia</option>
                    <option value="wedding_main">Món Chính & Sơn Hào</option>
                    <option value="wedding_hotpot">Lẩu & Cơm No Tiệc</option>
                    <option value="wedding_dessert">Tráng Miệng Bổ Dưỡng</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Giá (VNĐ) *</label>
                  <input
                    type="number"
                    required
                    min="50000"
                    step="10000"
                    value={newDishForm.price}
                    onChange={(e) => setNewDishForm({ ...newDishForm, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 font-mono font-bold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ảnh URL</label>
                <input
                  type="url"
                  value={newDishForm.image}
                  onChange={(e) => setNewDishForm({ ...newDishForm, image: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-[11px] font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Khẩu phần</label>
                <input
                  type="text"
                  value={newDishForm.portion}
                  onChange={(e) => setNewDishForm({ ...newDishForm, portion: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mô tả món ăn</label>
                <textarea
                  rows={2}
                  placeholder="Mô tả hương vị, nguyên liệu..."
                  value={newDishForm.description}
                  onChange={(e) => setNewDishForm({ ...newDishForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md"
                >
                  Thêm Món
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
