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
  Bookmark,
  Plus,
  Link2,
  Maximize2,
  Search,
  ArrowUpDown,
  Trash2
} from 'lucide-react';
import { VIRAL_INSPIRATIONS } from '../data/mockData';
import ProductArtwork from './ProductArtwork';

export default function KnowledgeBaseStudio({
  customTemplates = [],
  bookmarkedIds = [],
  onToggleBookmark,
  onOpenCreateTemplate,
  onDeleteTemplate,
  onMakeSameImage,
  onMakeSameVideo,
  onAddToast
}) {
  const [filter, setFilter] = useState('全部');
  const [ratioFilter, setRatioFilter] = useState('全部尺寸');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recommend'); // 'recommend' | 'retention' | 'likes'
  const [activeModalItem, setActiveModalItem] = useState(null);

  const tabs = [
    '全部',
    `我的模版 (${customTemplates.length})`,
    '爆款视频',
    '爆款文案',
    '美妆',
    '家电',
    '数码',
    '穿搭'
  ];

  const ratioOptions = [
    { id: '全部尺寸', label: '全部尺寸', desc: '' },
    { id: '1:1', label: '1:1', desc: '主图' },
    { id: '3:4', label: '3:4', desc: '小红书' },
    { id: '9:16', label: '9:16', desc: '竖屏' },
    { id: '16:9', label: '16:9', desc: '横屏' }
  ];

  const allItems = [...customTemplates, ...VIRAL_INSPIRATIONS];

  let filteredItems = allItems.filter((item) => {
    // Ratio filter
    const itemRatio = item.ratio || '3:4';
    const matchRatio = ratioFilter === '全部尺寸' || itemRatio === ratioFilter;
    if (!matchRatio) return false;

    // Category filter
    let matchCat = true;
    if (filter === '全部') matchCat = true;
    else if (filter.startsWith('我的模版')) matchCat = item.isCustom;
    else if (filter === '爆款视频') matchCat = item.type === 'video';
    else if (filter === '爆款文案') matchCat = item.type === 'copy';
    else matchCat = item.category === filter;

    if (!matchCat) return false;

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText =
        (item.title && item.title.toLowerCase().includes(q)) ||
        (item.hook && item.hook.toLowerCase().includes(q)) ||
        (item.category && item.category.toLowerCase().includes(q)) ||
        (item.prompt && item.prompt.toLowerCase().includes(q));
      if (!matchText) return false;
    }

    return true;
  });

  // Sorting
  if (sortBy === 'retention') {
    filteredItems.sort((a, b) => {
      const rA = parseInt(a.retention || '0', 10);
      const rB = parseInt(b.retention || '0', 10);
      return rB - rA;
    });
  } else if (sortBy === 'likes') {
    filteredItems.sort((a, b) => {
      const lA = parseFloat(a.likes || '0');
      const lB = parseFloat(b.likes || '0');
      return lB - lA;
    });
  }

  const getAspectClass = (r) => {
    if (r === '1:1') return 'aspect-square';
    if (r === '9:16') return 'aspect-[9/14]';
    if (r === '16:9') return 'aspect-[16/10]';
    return 'aspect-[3/4]';
  };

  return (
    <div className="space-y-5 pb-28">
      {/* Search & Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="在爆款库中搜索商品、前3秒Hook或拍摄场景（如：精华、咖啡、露营、显瘦）..."
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200/70">
          <span className="text-[11px] text-slate-400 px-2 flex items-center gap-1">
            <ArrowUpDown className="w-3 h-3" />
            <span>排序：</span>
          </span>
          {[
            { id: 'recommend', label: '综合推荐' },
            { id: 'retention', label: '高完播留存' },
            { id: 'likes', label: '万赞高热' }
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setSortBy(s.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                sortBy === s.id
                  ? 'bg-slate-900 text-white shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <button
          onClick={onOpenCreateTemplate}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>新建我的参考模版</span>
        </button>
      </div>

      {/* Category & Dimension Filter Pills */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  filter === t
                    ? 'bg-slate-900 text-white shadow-sm font-bold'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/70'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <span className="text-xs text-slate-400">
            共找到 <strong className="text-slate-800">{filteredItems.length}</strong> 个爆款同款资产
          </span>
        </div>

        {/* Aspect Ratio Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="inline-flex items-center gap-1 bg-white p-1 rounded-full border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-1 px-2.5 text-[11px] font-medium text-slate-400">
              <Maximize2 className="w-3 h-3" />
              <span>尺寸画幅</span>
            </div>
            {ratioOptions.map((ro) => {
              const active = ratioFilter === ro.id;
              return (
                <button
                  key={ro.id}
                  onClick={() => setRatioFilter(ro.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                    active
                      ? 'bg-slate-900 text-white shadow-2xs font-bold'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {ro.id !== '全部尺寸' && (
                    <span
                      className={`inline-block border border-current rounded-[2px] ${
                        ro.id === '1:1'
                          ? 'w-2.5 h-2.5'
                          : ro.id === '3:4'
                          ? 'w-2.5 h-3'
                          : ro.id === '9:16'
                          ? 'w-2 h-3.5'
                          : 'w-3.5 h-2'
                      }`}
                    />
                  )}
                  <span>{ro.label}</span>
                  {ro.desc && (
                    <span className={`text-[10px] ${active ? 'text-slate-300' : 'text-slate-400'}`}>
                      {ro.desc}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Waterfall Columns */}
      <div className="columns-2 md:columns-3 xl:columns-4 gap-4 space-y-4">
        {/* Quick New Reference Template Trigger Card */}
        <div
          onClick={onOpenCreateTemplate}
          className="break-inside-avoid group rounded-2xl border-2 border-dashed border-slate-300/90 hover:border-indigo-400 bg-white/60 hover:bg-white transition-all flex flex-col items-center justify-center p-6 text-center cursor-pointer aspect-[3/4]"
        >
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 group-hover:bg-indigo-600 text-indigo-600 group-hover:text-white flex items-center justify-center transition-colors mb-3 shadow-2xs">
            <Link2 className="w-5 h-5" />
          </div>
          <div className="text-xs font-bold text-slate-800">新建我的参考模版</div>
          <p className="text-[11px] text-slate-400 mt-1 max-w-[180px] leading-relaxed">
            粘贴淘宝/小红书/抖音链接或上传图片，自动反推同款模版
          </p>
        </div>

        {filteredItems.map((item) => {
          const isBookmarked = bookmarkedIds.includes(item.id);
          const itemRatio = item.ratio || '3:4';
          return (
            <div
              key={item.id}
              onClick={() => setActiveModalItem(item)}
              className="break-inside-avoid group relative rounded-2xl overflow-hidden bg-white border border-slate-200/70 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.09)] transition-all cursor-pointer"
            >
              <div className={`${getAspectClass(itemRatio)} w-full relative`}>
                {item.customImageUrl ? (
                  <img
                    src={item.customImageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ProductArtwork
                    svgType={item.svgType}
                    palette={item.palette}
                    className="w-full h-full"
                  />
                )}

                {/* Top-left subtle type + ratio indicator */}
                <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/85 backdrop-blur-md text-[11px] font-medium text-slate-700 shadow-xs">
                  {item.isCustom ? (
                    <>
                      <Sparkles className="w-3 h-3 text-indigo-600" />
                      <span className="text-indigo-600 font-semibold">我的模版</span>
                    </>
                  ) : item.type === 'video' ? (
                    <>
                      <Play className="w-3 h-3 fill-slate-700" />
                      <span>{item.retention}</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-3 h-3 text-indigo-600" />
                      <span>文案</span>
                    </>
                  )}
                  <span className="text-slate-300">|</span>
                  <span className="font-mono text-[10px] text-slate-500">{itemRatio}</span>
                </div>

                {/* Top-right Actions: Delete for Custom + Bookmark */}
                <div className="absolute top-3 right-3 z-20 flex items-center gap-1">
                  {item.isCustom && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteTemplate && onDeleteTemplate(item.id);
                      }}
                      className="w-7 h-7 rounded-full bg-white/80 hover:bg-rose-50 text-slate-500 hover:text-rose-600 backdrop-blur-md flex items-center justify-center shadow-xs cursor-pointer"
                      title="删除模版"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleBookmark && onToggleBookmark(item.id);
                    }}
                    className="w-7 h-7 rounded-full bg-white/80 hover:bg-white backdrop-blur-md flex items-center justify-center shadow-xs cursor-pointer"
                    title="收藏到个人中心"
                  >
                    <Bookmark
                      className={`w-3.5 h-3.5 ${
                        isBookmarked ? 'text-amber-500 fill-amber-500' : 'text-slate-600'
                      }`}
                    />
                  </button>
                </div>

                {/* Hover Gradient Overlay */}
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
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

      {/* Detail Modal */}
      {activeModalItem && (
        <div
          onClick={() => setActiveModalItem(null)}
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-200/80 grid grid-cols-1 md:grid-cols-12"
          >
            {/* Left Artwork */}
            <div className="md:col-span-6 aspect-square md:aspect-auto min-h-[340px]">
              {activeModalItem.customImageUrl ? (
                <img
                  src={activeModalItem.customImageUrl}
                  alt={activeModalItem.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <ProductArtwork
                  svgType={activeModalItem.svgType}
                  palette={activeModalItem.palette}
                  animate={true}
                  className="w-full h-full"
                />
              )}
            </div>

            {/* Right Info */}
            <div className="md:col-span-6 p-6 flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
                      {activeModalItem.category}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-semibold font-mono">
                      {activeModalItem.ratio || '3:4'} {activeModalItem.sizeLabel || ''}
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveModalItem(null)}
                    className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {activeModalItem.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                    <span>点赞 {activeModalItem.likes}</span>
                    <span>•</span>
                    <span>留存转化率 {activeModalItem.retention || '68%'}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1.5">
                  <div className="text-[11px] font-bold text-indigo-600">
                    💡 爆款黄金前3秒 Hook 话术
                  </div>
                  <div className="text-xs text-slate-700 font-medium leading-relaxed">
                    {activeModalItem.hook}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-xs font-bold text-slate-800">反推电商提示词</div>
                  <div className="p-2.5 rounded-xl bg-slate-50 text-xs text-slate-600 leading-relaxed font-mono">
                    {activeModalItem.prompt}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => {
                    onMakeSameImage(activeModalItem);
                    setActiveModalItem(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>以此做同款电商图</span>
                </button>
                <button
                  onClick={() => {
                    onMakeSameVideo(activeModalItem);
                    setActiveModalItem(null);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>生带货视频</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
