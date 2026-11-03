import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Sparkles,
  Video,
  Copy,
  Check,
  Heart,
  Bookmark,
  ImageIcon,
  Quote,
  Terminal,
  BadgeCheck
} from 'lucide-react';
import ProductArtwork from './ProductArtwork';

export default function XiaohongshuDetailModal({
  item,
  onClose,
  onMakeSameImage,
  onMakeSameVideo,
  onUpdateTemplate,
  onToggleBookmark,
  isBookmarked = false,
  onAddToast
}) {
  if (!item) return null;

  // 1. 初始化多图列表 (兼容 item.images、item.customImageUrl 与 mock 示例)
  const initialImages = () => {
    if (Array.isArray(item.images) && item.images.length > 0) {
      return item.images;
    }
    if (item.customImageUrl) {
      return [item.customImageUrl];
    }
    return [];
  };

  const [images, setImages] = useState(initialImages);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedHook, setCopiedHook] = useState(false);
  const fileInputRef = useRef(null);

  // 快捷键支持：ESC 关闭，左/右箭头切图
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
      } else if (e.key === 'ArrowRight') {
        setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [images.length, onClose]);

  // 同步外部 item 变化
  useEffect(() => {
    const imgs = initialImages();
    setImages(imgs);
    setCurrentIndex(0);
  }, [item.id]);

  // 处理多图上传 (支持一次选择多张图片并自动转 base64)
  const handleAddImages = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    let loadedCount = 0;
    const newUrls = [];

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const rawUrl = ev.target?.result;
        if (rawUrl) {
          newUrls.push(rawUrl);
        }
        loadedCount += 1;
        if (loadedCount === files.length) {
          setImages((prev) => {
            const nextList = [...prev, ...newUrls];
            if (onUpdateTemplate) {
              onUpdateTemplate({
                ...item,
                images: nextList,
                customImageUrl: nextList[0]
              });
            }
            return nextList;
          });
          setCurrentIndex(images.length);
          onAddToast && onAddToast(`已添加 ${newUrls.length} 张图片，当前共 ${images.length + newUrls.length} 张`);
        }
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  // 删除单张图片 (编辑图片数量)
  const handleDeleteImage = (indexToDelete) => {
    if (images.length <= 1) {
      const confirmed = window.confirm('删除后模版将没有图片，确定要移除这张图片吗？');
      if (!confirmed) return;
    }

    const nextList = images.filter((_, idx) => idx !== indexToDelete);
    setImages(nextList);
    if (currentIndex >= nextList.length) {
      setCurrentIndex(Math.max(0, nextList.length - 1));
    }
    if (onUpdateTemplate) {
      onUpdateTemplate({
        ...item,
        images: nextList,
        customImageUrl: nextList[0] || ''
      });
    }
    onAddToast && onAddToast(`已移除第 ${indexToDelete + 1} 张图片，剩余 ${nextList.length} 张`);
  };

  // 将当前图片设为模版封面
  const handleSetAsCover = (idx) => {
    if (idx === 0) return;
    const coverImg = images[idx];
    const nextList = [coverImg, ...images.filter((_, i) => i !== idx)];
    setImages(nextList);
    setCurrentIndex(0);
    if (onUpdateTemplate) {
      onUpdateTemplate({
        ...item,
        images: nextList,
        customImageUrl: nextList[0]
      });
    }
    onAddToast && onAddToast('已设为模版首图封面');
  };

  // 复制提示词 (无 emoji)
  const handleCopyPrompt = () => {
    if (!item.prompt) return;
    navigator.clipboard.writeText(item.prompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
    onAddToast && onAddToast('已复制电商生图提示词');
  };

  // 复制黄金文案 (无 emoji)
  const handleCopyHook = () => {
    if (!item.hook) return;
    navigator.clipboard.writeText(item.hook);
    setCopiedHook(true);
    setTimeout(() => setCopiedHook(false), 2000);
    onAddToast && onAddToast('已复制黄金前3秒爆款文案');
  };

  // 过滤文案中的所有 emoji 字符，确保 100% 纯净
  const cleanText = (str) => {
    if (!str) return '';
    return str.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();
  };

  // 构造带有最新多图的模版对象传递给生图
  const resolvedItemForGeneration = {
    ...item,
    images,
    customImageUrl: images[currentIndex] || images[0] || item.customImageUrl
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 select-none animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl w-full max-w-5xl h-[88vh] max-h-[860px] overflow-hidden shadow-2xl flex flex-col md:flex-row relative border border-slate-200/80"
      >
        {/* 右上角快捷关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 w-8 h-8 rounded-full bg-slate-100/90 hover:bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition cursor-pointer backdrop-blur-xs"
          title="关闭 (Esc)"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ===================== 左侧：小红书多图轮播视窗 ===================== */}
        <div className="md:w-[58%] h-1/2 md:h-full bg-[#0E1015] flex flex-col justify-between relative overflow-hidden shrink-0">
          {/* 顶部工具条：多图计数胶囊与多图管理 */}
          <div className="h-14 px-5 flex items-center justify-between z-20">
            {images.length > 0 ? (
              <div className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-semibold tracking-wider font-mono">
                {currentIndex + 1} / {images.length}
              </div>
            ) : (
              <div className="text-xs text-slate-400">暂无图片</div>
            )}

            {/* 图片管理操作：设为封面、删除单图、上传更多图 */}
            <div className="flex items-center gap-2">
              {images.length > 1 && (
                <button
                  onClick={() => handleSetAsCover(currentIndex)}
                  disabled={currentIndex === 0}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer backdrop-blur-md flex items-center gap-1 ${
                    currentIndex === 0
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-white/10 hover:bg-white/20 text-slate-200'
                  }`}
                  title={currentIndex === 0 ? '当前即为封面首图' : '将此图设为封面'}
                >
                  {currentIndex === 0 && <Check className="w-3 h-3 text-emerald-400" />}
                  <span>{currentIndex === 0 ? '封面首图' : '设为封面'}</span>
                </button>
              )}

              {images.length > 0 && (
                <button
                  onClick={() => handleDeleteImage(currentIndex)}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-rose-500/80 text-white flex items-center justify-center transition cursor-pointer"
                  title="删除当前这张图片 (减少数量)"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}

              {/* 上传多图 */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1 transition cursor-pointer shadow-xs"
                title="上传更多参考图 (支持一次选择多张)"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>加图</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                className="hidden"
                onChange={handleAddImages}
              />
            </div>
          </div>

          {/* 中间主图展示区 (保持完整比例居中展示，不暴力裁剪) */}
          <div className="flex-1 relative flex items-center justify-center p-4 min-h-0 overflow-hidden">
            {images.length > 0 ? (
              <div className="w-full h-full flex items-center justify-center relative">
                <img
                  src={images[currentIndex]}
                  alt={`${item.title} - 图 ${currentIndex + 1}`}
                  className="max-w-full max-h-full object-contain drop-shadow-2xl transition-all duration-300 rounded-lg"
                />
              </div>
            ) : item.svgType ? (
              <div className="w-full h-full flex items-center justify-center">
                <ProductArtwork
                  svgType={item.svgType}
                  palette={item.palette}
                  animate={true}
                  className="w-72 h-72"
                />
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-3 text-slate-400 hover:text-white cursor-pointer p-8 rounded-2xl border border-dashed border-white/20 hover:border-white/40 transition"
              >
                <ImageIcon className="w-10 h-10 stroke-1" />
                <span className="text-xs">点击上传图片</span>
              </div>
            )}

            {/* 左右翻页按钮 */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
                  }
                  className="absolute left-3 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition cursor-pointer backdrop-blur-sm"
                  title="上一张"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() =>
                    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
                  }
                  className="absolute right-3 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition cursor-pointer backdrop-blur-sm"
                  title="下一张"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* 底部缩略图栏 (Thumbnail Strip) */}
          <div className="h-16 px-4 py-2 bg-black/40 backdrop-blur-md border-t border-white/10 flex items-center gap-2 overflow-x-auto z-20 shrink-0">
            {images.map((imgUrl, idx) => (
              <div
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`relative group aspect-square h-12 rounded-lg overflow-hidden border-2 transition cursor-pointer shrink-0 ${
                  currentIndex === idx
                    ? 'border-indigo-500 scale-105 shadow-md'
                    : 'border-white/20 opacity-60 hover:opacity-100 hover:border-white/50'
                }`}
              >
                <img src={imgUrl} alt={`thumb-${idx}`} className="w-full h-full object-cover" />
                {idx === 0 && (
                  <span className="absolute bottom-0 inset-x-0 bg-indigo-600/90 text-white text-[8px] text-center font-bold">
                    封面
                  </span>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteImage(idx);
                  }}
                  className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/70 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition cursor-pointer"
                  title="移除此图"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            ))}

            <button
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square h-12 rounded-lg border border-dashed border-white/30 hover:border-indigo-400 bg-white/5 hover:bg-white/10 flex flex-col items-center justify-center text-slate-300 hover:text-white transition cursor-pointer shrink-0 gap-0.5"
              title="添加更多图片"
            >
              <Plus className="w-4 h-4" />
              <span className="text-[9px]">加图</span>
            </button>
          </div>
        </div>

        {/* ===================== 右侧：小红书笔记流详情 (纯净无 Emoji) ===================== */}
        <div className="md:w-[42%] flex-1 flex flex-col h-1/2 md:h-full bg-white min-h-0">
          {/* 1. 博主卡片：作者头像、创作者标识、画幅比例、一键收藏/取消收藏 */}
          <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-500 via-pink-500 to-indigo-500 p-0.5 shrink-0">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center font-bold text-xs text-rose-600">
                  {item.isCustom ? '我' : 'RED'}
                </div>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900 truncate">
                    {item.isCustom ? '我的创作模版' : item.sourceLabel || '爆款视觉研究社'}
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-50 text-rose-600 flex items-center gap-0.5">
                    <BadgeCheck className="w-3 h-3" />
                    <span>优质创作者</span>
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-medium">
                  {item.category} · {item.ratio || '3:4'} 黄金商拍画幅
                </div>
              </div>
            </div>

            {/* 一键收藏 / 取消收藏 */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  onToggleBookmark && onToggleBookmark(item.id);
                  onAddToast && onAddToast(isBookmarked ? '已取消收藏' : '已收藏到我的灵感库');
                }}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition cursor-pointer ${
                  isBookmarked
                    ? 'bg-rose-50 text-rose-600'
                    : 'bg-slate-100 hover:bg-slate-200/70 text-slate-600'
                }`}
                title={isBookmarked ? '取消收藏' : '收藏模版'}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-rose-500' : ''}`} />
              </button>
            </div>
          </div>

          {/* 2. 详情正文流 */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            {/* 标题 */}
            <h2 className="text-base font-extrabold text-slate-900 leading-snug tracking-tight">
              {cleanText(item.title)}
            </h2>

            {/* 黄金前3秒爆款文案 (小红书便签气泡卡片，绝无 Emoji) */}
            {item.hook && (
              <div className="rounded-2xl bg-amber-50/70 border border-amber-200/70 p-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                  <span className="flex items-center gap-1.5">
                    <Quote className="w-3.5 h-3.5 text-amber-600" />
                    <span>黄金前3秒爆款文案</span>
                  </span>
                  <button
                    onClick={handleCopyHook}
                    className="text-[11px] text-amber-800 hover:text-amber-950 flex items-center gap-1 cursor-pointer font-medium"
                  >
                    {copiedHook ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedHook ? '已复制' : '复制文案'}</span>
                  </button>
                </div>
                <p className="text-xs text-amber-950 font-medium leading-relaxed">
                  {cleanText(item.hook)}
                </p>
              </div>
            )}

            {/* 反推电商生图提示词 (代码级样式展示，绝无 Emoji) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span className="flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-indigo-600" />
                  <span>反推电商生图提示词</span>
                </span>
                <button
                  onClick={handleCopyPrompt}
                  className="text-[11px] text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer font-semibold"
                >
                  {copiedPrompt ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedPrompt ? '已复制' : '复制提示词'}</span>
                </button>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 leading-relaxed font-mono select-text">
                {cleanText(item.prompt) || '暂无详细提示词'}
              </div>
            </div>

            {/* 小红书 Tag 药丸：自动提取分类与画幅标签 (绝无 Emoji) */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-semibold text-slate-400">分类标签</div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  `#小红书爆款`,
                  `#${item.ratio || '3:4'}比例`,
                  `#${images.length}图图文`,
                  `#${item.category || '爆款电商'}`,
                  ...(item.tags ? item.tags.map((t) => `#${cleanText(t)}`) : ['#商业静物摄影', '#视觉设计'])
                ].map((tag, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200/70 text-slate-600 text-[11px] font-medium transition cursor-pointer"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* 真实数据指标 */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                <span>点赞 {item.likes || '42.8w'}</span>
              </span>
              <span>留存转化率 {item.retention || '76%'}</span>
              <span>图片共 {images.length} 张</span>
            </div>
          </div>

          {/* 3. 底部固定转化按钮：一键做同款全链路贯通 (绝无 Emoji) */}
          <div className="p-4 border-t border-slate-100 bg-white/95 backdrop-blur-md flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => {
                onMakeSameImage && onMakeSameImage(resolvedItemForGeneration);
                onClose();
              }}
              className="flex-1 h-11 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-slate-900/10 transition active:scale-[0.99] cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>以此做同款电商图 ({images.length}张参考)</span>
            </button>

            <button
              onClick={() => {
                onMakeSameVideo && onMakeSameVideo(resolvedItemForGeneration);
                onClose();
              }}
              className="h-11 px-4 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center gap-1 transition active:scale-[0.99] cursor-pointer"
            >
              <Video className="w-4 h-4" />
              <span>生成带货视频</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
