import React, { useState } from 'react';
import {
  Sparkles,
  Play,
  Heart,
  FileText,
  X,
  Copy,
  Image as ImageIcon,
  Video,
  Bookmark
} from 'lucide-react';
import { VIRAL_INSPIRATIONS } from '../data/mockData';
import ProductArtwork from './ProductArtwork';

export default function KnowledgeBaseStudio({
  bookmarkedIds = [],
  onToggleBookmark,
  onMakeSameImage,
  onMakeSameVideo,
  onAddToast
}) {
  const [filter, setFilter] = useState('全部');
  const [activeModalItem, setActiveModalItem] = useState(null);

  const tabs = ['全部', '爆款视频', '爆款文案', '美妆', '家电', '数码', '穿搭'];

  const filteredItems = VIRAL_INSPIRATIONS.filter((item) => {
    if (filter === '全部') return true;
    if (filter === '爆款视频') return item.type === 'video';
    if (filter === '爆款文案') return item.type === 'copy';
    return item.category === filter;
  });

  return (
    <div className="space-y-6 pb-28">
      {/* Minimalist Top Filter Pills (Jimeng Explore Style) */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 flex-wrap">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                filter === t
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/70'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-400 hidden sm:inline">
          悬停卡片一键「做同款」或收藏
        </span>
      </div>

      {/* Visual-First Waterfall Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredItems.map((item) => {
          const isBookmarked = bookmarkedIds.includes(item.id);
          return (
            <div
              key={item.id}
              onClick={() => setActiveModalItem(item)}
              className="group relative rounded-2xl overflow-hidden bg-white border border-slate-200/70 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.09)] transition-all cursor-pointer"
            >
              {/* Pure Visual Container */}
              <div className="aspect-[3/4] w-full relative">
                <ProductArtwork
                  svgType={item.svgType}
                  palette={item.palette}
                  className="w-full h-full"
                />

                {/* Top-left subtle type indicator */}
                <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/80 backdrop-blur-md text-[11px] font-medium text-slate-700 shadow-xs">
                  {item.type === 'video' ? (
                    <>
                      <Play className="w-3 h-3 fill-slate-700" />
                      <span>留存 {item.retention}</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-3 h-3 text-indigo-600" />
                      <span>爆款文案</span>
                    </>
                  )}
                </div>

                {/* Top-right Bookmark Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleBookmark && onToggleBookmark(item.id);
                  }}
                  className="absolute top-3 right-3 z-20 w-7 h-7 rounded-full bg-white/80 hover:bg-white backdrop-blur-md flex items-center justify-center shadow-xs cursor-pointer"
                  title="收藏到个人中心"
                >
                  <Bookmark
                    className={`w-3.5 h-3.5 ${
                      isBookmarked ? 'text-amber-500 fill-amber-500' : 'text-slate-600'
                    }`}
                  />
                </button>

                {/* Hover Gradient Overlay (Jimeng Style: Only visible on hover) */}
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/75 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  <p className="text-xs font-medium text-white/95 line-clamp-2 mb-3 leading-relaxed">
                    {item.hook}
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMakeSameImage(item);
                      }}
                      className="flex-1 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-900 font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md transition-transform active:scale-95 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>做同款图</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMakeSameVideo(item);
                      }}
                      className="py-2 px-3 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-medium text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>生视频</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Minimal Bottom Bar */}
              <div className="px-3.5 py-2.5 flex items-center justify-between bg-white">
                <span className="text-xs font-medium text-slate-800 truncate">{item.title}</span>
                <span className="text-[11px] text-slate-400 flex items-center gap-1 shrink-0">
                  <Heart className="w-3 h-3 text-rose-400 fill-rose-400" />
                  {item.likes}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Clean Jimeng-Style Split Detail Modal */}
      {activeModalItem && (
        <div
          onClick={() => setActiveModalItem(null)}
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-200/80 grid grid-cols-1 md:grid-cols-12"
          >
            {/* Left Artwork */}
            <div className="md:col-span-6 aspect-square md:aspect-auto min-h-[340px]">
              <ProductArtwork
                svgType={activeModalItem.svgType}
                palette={activeModalItem.palette}
                animate={true}
                className="w-full h-full"
              />
            </div>

            {/* Right Minimalist Prompt & Hook Info */}
            <div className="md:col-span-6 p-6 flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
                    {activeModalItem.category} · 前3秒留存 {activeModalItem.retention}
                  </span>
                  <button
                    onClick={() => setActiveModalItem(null)}
                    className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-base font-bold text-slate-900">{activeModalItem.title}</h3>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>黄金前3秒文案 Hook</span>
                    <button
                      onClick={() => {
                        navigator.clipboard?.writeText(activeModalItem.hook);
                        onAddToast('已复制黄金文案');
                      }}
                      className="text-indigo-600 hover:text-indigo-500 flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      复制
                    </button>
                  </div>
                  <p className="text-xs font-medium text-slate-800">{activeModalItem.hook}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-1.5">
                  <div className="text-[11px] text-slate-400">同款画面提示词</div>
                  <p className="text-xs text-slate-600 leading-relaxed">{activeModalItem.prompt}</p>
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  onClick={() => {
                    onMakeSameImage(activeModalItem);
                    setActiveModalItem(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>一键做同款图</span>
                </button>
                <button
                  onClick={() => {
                    onMakeSameVideo(activeModalItem);
                    setActiveModalItem(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>一键做同款视频</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
