import React, { useState } from 'react';
import { 
  Users, 
  Sparkles, 
  MapPin, 
  Check, 
  ChevronRight, 
  Phone, 
  Maximize2,
  Calendar,
  Layers,
  Heart
} from 'lucide-react';
import { WEDDING_REFERENCE_VENUES, WeddingVenueItem } from './weddingData';
import { UserRole } from '../../types';

interface WeddingVenuesViewProps {
  userRole: UserRole;
  onBookVenue: (venue: WeddingVenueItem) => void;
}

export const WeddingVenuesView: React.FC<WeddingVenuesViewProps> = ({
  userRole,
  onBookVenue,
}) => {
  const [activeVenueId, setActiveVenueId] = useState<string>('venue-nn-1');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number>(0);

  const activeVenue = WEDDING_REFERENCE_VENUES.find(v => v.id === activeVenueId) || WEDDING_REFERENCE_VENUES[0];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-rose-700 via-rose-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-rose-100">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Không Gian Sảnh Tiệc Sang Trọng</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-serif">
            HỆ THỐNG SẢNH TIỆC NGỌC NHI
          </h1>
          <p className="text-xs sm:text-sm text-rose-100/90 max-w-xl">
            Sở hữu các sảnh tiệc hiện đại với sức chứa từ 100 đến 600 khách, trần cao không cột chắn, màn hình LED cong P3 và hệ thống âm thanh ánh sáng hòa nhạc đỉnh cao.
          </p>
        </div>

        <button
          onClick={() => onBookVenue(activeVenue)}
          className="px-5 py-3 rounded-2xl bg-white text-rose-800 hover:bg-rose-50 font-black text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Heart className="w-4 h-4 text-rose-600" />
          <span>Đặt Sảnh {activeVenue.name}</span>
        </button>
      </div>

      {/* Venues Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {WEDDING_REFERENCE_VENUES.map((venue) => {
          const isSelected = activeVenueId === venue.id;
          return (
            <button
              key={venue.id}
              onClick={() => {
                setActiveVenueId(venue.id);
                setSelectedPhotoIndex(0);
              }}
              className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                isSelected
                  ? 'border-rose-600 bg-rose-50/70 shadow-md ring-2 ring-rose-200'
                  : 'border-slate-200 bg-white hover:border-rose-300'
              }`}
            >
              <div>
                <div className="font-bold text-slate-900 text-xs sm:text-sm">{venue.name}</div>
                <div className="text-[11px] text-rose-700 font-semibold mt-0.5">{venue.capacityText}</div>
              </div>
              <div className="text-[10px] text-slate-500">Diện tích: {venue.areaM2}m²</div>
            </button>
          );
        })}
      </div>

      {/* Main Venue Display */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-200 shadow-sm space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Photos Showcase (7 Cols) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="relative rounded-3xl overflow-hidden h-72 sm:h-96 border border-slate-100 shadow-sm">
              <img
                src={activeVenue.images[selectedPhotoIndex] || activeVenue.images[0]}
                alt={activeVenue.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-bold">
                {activeVenue.name} • Ảnh {selectedPhotoIndex + 1}/{activeVenue.images.length}
              </div>
            </div>

            {/* Thumbnails */}
            <div className="grid grid-cols-4 gap-2">
              {activeVenue.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedPhotoIndex(idx)}
                  className={`rounded-xl overflow-hidden h-20 border-2 transition-all cursor-pointer ${
                    selectedPhotoIndex === idx
                      ? 'border-rose-600 ring-2 ring-rose-300'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="Thumb" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Details & Specs (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-[11px] font-bold">
                <Users className="w-3.5 h-3.5 text-rose-600" />
                <span>{activeVenue.capacityText}</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 font-serif">
                {activeVenue.name}
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                {activeVenue.description}
              </p>
            </div>

            {/* Specs Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-[11px] text-slate-500 font-semibold">Diện tích sảnh</div>
                <div className="text-base font-black text-slate-900 font-mono">{activeVenue.areaM2} m²</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-[11px] text-slate-500 font-semibold">Độ cao trần</div>
                <div className="text-base font-black text-slate-900 font-mono">{activeVenue.ceilingHeight}</div>
              </div>
            </div>

            {/* Features List */}
            <div className="space-y-2.5">
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">Trang thiết bị & Tiện ích:</div>
              {activeVenue.features.map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-slate-700">
                  <Check className="w-4 h-4 text-rose-600 shrink-0 font-bold" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => onBookVenue(activeVenue)}
                className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>Giữ Ngày Sảnh Này</span>
              </button>
              <a
                href="tel:0967823801"
                className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>Tư vấn trực tiếp</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
