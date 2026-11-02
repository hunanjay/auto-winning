import React, { useState } from 'react';
import {
  Crown,
  Zap,
  Heart,
  Bookmark,
  Image as ImageIcon,
  Video,
  Settings,
  Download,
  Trash2,
  Plus,
  Gift,
  Check,
  Sparkles,
  Share2
} from 'lucide-react';
import { PRODUCTS, IMAGE_FEED, VIDEO_FEED, VIRAL_INSPIRATIONS } from '../data/mockData';
import ProductArtwork from './ProductArtwork';

export default function PersonalCenter({
  userProfile,
  credits,
  hasCheckedIn,
  onCheckIn,
  onOpenVip,
  bookmarkedIds,
  onToggleBookmark,
  onMakeSameImage,
  onMakeSameVideo,
  onAddToast
}) {
  const [subTab, setSubTab] = useState('works'); // 'works' | 'bookmarks' | 'products' | 'settings'
  const [workFilter, setWorkFilter] = useState('all'); // 'all' | 'image' | 'video'
  const [preferences, setPreferences] = useState({
    removeWatermark: true,
    hdUpscale: true,
    privateMode: false
  });

  // Combine user works for clean visual gallery
  const imageWorks = IMAGE_FEED.flatMap((b) =>
    b.items.map((it) => ({
      id: it.id,
      type: 'image',
      title: it.tag,
      svgType: b.svgType,
      palette: it.palette,
      prompt: b.prompt,
      ratio: b.ratio
    }))
  );

  const videoWorks = VIDEO_FEED.map((v) => ({
    id: v.id,
    type: 'video',
    title: v.title,
    svgType: v.svgType,
    palette: v.palette,
    prompt: v.prompt,
    duration: v.duration
  }));

  const allWorks = [...videoWorks, ...imageWorks].filter((w) => {
    if (workFilter === 'all') return true;
    return w.type === workFilter;
  });

  const bookmarkedItems = VIRAL_INSPIRATIONS.filter((item) =>
    bookmarkedIds.includes(item.id)
  );

  const creditLogs = [
    { id: 'c-1', title: '每日登录签到奖励', delta: '+60', time: '今天 09:30' },
    { id: 'c-2', title: 'Seedream 3.0 生成 4 张商品图', delta: '-4', time: '今天 14:15' },
    { id: 'c-3', title: 'Video 3.0 Pro 生成 5s 带货视频', delta: '-15', time: '今天 15:20' },
    { id: 'c-4', title: '智能切片拆条 (4条竖屏短片)', delta: '-10', time: '昨天 21:10' }
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* Clean Jimeng-Style Creator Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-400 p-0.5 shadow-md">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-lg font-extrabold text-slate-900">
              {userProfile.name.slice(0, 1)}
            </div>
            <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[9px] font-black flex items-center gap-0.5 shadow">
              <Crown className="w-2.5 h-2.5" />
              PRO
            </div>
          </div>

          {/* Name & Stats */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">{userProfile.name}</h2>
              <span className="text-xs text-slate-400 font-mono">UID: {userProfile.uid}</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span>
                作品 <strong className="text-slate-900">{allWorks.length}</strong>
              </span>
              <span>
                收藏 <strong className="text-slate-900">{bookmarkedItems.length}</strong>
              </span>
              <span>
                被做同款 <strong className="text-slate-900">1,284</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Right: Credits & Membership Capsule */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="px-4 py-2 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center gap-3">
            <div>
              <div className="text-[10px] text-slate-400">剩余可用算力</div>
              <div className="text-sm font-extrabold text-slate-900 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>{credits} 积分</span>
              </div>
            </div>
            <button
              onClick={onCheckIn}
              disabled={hasCheckedIn}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                hasCheckedIn
                  ? 'bg-slate-200/60 text-slate-400'
                  : 'bg-amber-100 hover:bg-amber-200 text-amber-800'
              }`}
            >
              {hasCheckedIn ? '已签到' : '签到 +60'}
            </button>
          </div>

          <button
            onClick={onOpenVip}
            className="px-4 py-3 rounded-2xl bg-slate-900 hover:bg-indigo-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Crown className="w-3.5 h-3.5 text-amber-300" />
            <span>会员与充值</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-full border border-slate-200/80">
          {[
            { id: 'works', label: '我的作品' },
            { id: 'bookmarks', label: `我的收藏 (${bookmarkedItems.length})` },
            { id: 'products', label: '商品底图库' },
            { id: 'settings', label: '积分与设置' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                subTab === tab.id
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {subTab === 'works' && (
          <div className="flex items-center gap-1">
            {[
              { id: 'all', label: '全部' },
              { id: 'image', label: '图片' },
              { id: 'video', label: '视频' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setWorkFilter(f.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer ${
                  workFilter === f.id
                    ? 'bg-slate-200 text-slate-900'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* TAB 1: My Works Gallery */}
      {subTab === 'works' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {allWorks.map((work) => (
            <div
              key={work.id}
              className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-white border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)]"
            >
              <ProductArtwork
                svgType={work.svgType}
                palette={work.palette}
                animate={work.type === 'video'}
                className="w-full h-full"
              />

              <div className="absolute top-3 left-3 z-20 px-2.5 py-1 rounded-full bg-white/85 backdrop-blur-md text-[11px] font-medium text-slate-700 flex items-center gap-1">
                {work.type === 'video' ? (
                  <>
                    <Video className="w-3 h-3 text-indigo-600" />
                    <span>{work.duration}</span>
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-3 h-3 text-slate-600" />
                    <span>{work.ratio}</span>
                  </>
                )}
              </div>

              {/* Hover Actions */}
              <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between z-20">
                <button
                  onClick={() =>
                    work.type === 'video'
                      ? onMakeSameVideo(work)
                      : onMakeSameImage(work)
                  }
                  className="px-3 py-1.5 rounded-xl bg-white text-slate-900 text-[11px] font-semibold flex items-center gap-1 shadow-xs cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-indigo-600" />
                  <span>再次创作</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onAddToast('已发布到社区灵感广场')}
                    title="分享到社区"
                    className="w-7 h-7 rounded-lg bg-white/85 text-slate-700 flex items-center justify-center cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onAddToast('已下载至本地')}
                    title="下载"
                    className="w-7 h-7 rounded-lg bg-white/85 text-slate-700 flex items-center justify-center cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: My Bookmarks */}
      {subTab === 'bookmarks' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {bookmarkedItems.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-2xl overflow-hidden bg-white border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)]"
            >
              <div className="aspect-[3/4] relative">
                <ProductArtwork
                  svgType={item.svgType}
                  palette={item.palette}
                  className="w-full h-full"
                />
                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 z-20">
                  <button
                    onClick={() => onMakeSameImage(item)}
                    className="flex-1 py-1.5 rounded-xl bg-white text-slate-900 text-xs font-semibold cursor-pointer"
                  >
                    做同款
                  </button>
                  <button
                    onClick={() => onToggleBookmark(item.id)}
                    className="w-8 h-8 rounded-xl bg-white/25 text-white flex items-center justify-center cursor-pointer"
                    title="取消收藏"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="p-3 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-800 truncate">{item.title}</span>
                <Bookmark className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: My Uploaded Product Cutouts */}
      {subTab === 'products' && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {/* Upload New Product Slot */}
          <button
            onClick={() => onAddToast('支持上传 PNG/JPG 商品图，AI 将自动完成发丝级抠图')}
            className="aspect-square rounded-2xl border-2 border-dashed border-slate-300 hover:border-indigo-400 bg-white/60 flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
          >
            <Plus className="w-6 h-6" />
            <span className="text-xs font-medium">上传新商品图</span>
          </button>

          {PRODUCTS.map((prod) => (
            <div
              key={prod.id}
              className="rounded-2xl overflow-hidden bg-white border border-slate-200/80 p-2 space-y-2"
            >
              <div className="aspect-square rounded-xl overflow-hidden">
                <ProductArtwork
                  svgType={prod.svgType}
                  isCutout={true}
                  className="w-full h-full"
                />
              </div>
              <div className="px-1 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-800 truncate">{prod.name}</span>
                <span className="text-[10px] text-slate-400">{prod.category}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: Credits Log & C-End Preferences */}
      {subTab === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left: Minimalist Preferences */}
          <div className="md:col-span-6 bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">创作偏好设置</h3>
            {[
              {
                key: 'removeWatermark',
                title: '导出作品自动去除水印',
                desc: 'Pro 会员专属权益，下载图片与视频不带平台角标'
              },
              {
                key: 'hdUpscale',
                title: '默认开启 2K 超清画质增强',
                desc: '增强商品材质纹理与微距光影细节'
              },
              {
                key: 'privateMode',
                title: '私密创作模式',
                desc: '生成的商品图仅自己可见，不展示在灵感广场'
              }
            ].map((item) => {
              const enabled = preferences[item.key];
              return (
                <div
                  key={item.key}
                  onClick={() =>
                    setPreferences((prev) => ({ ...prev, [item.key]: !prev[item.key] }))
                  }
                  className="flex items-center justify-between py-2 border-b border-slate-100 last:border-none cursor-pointer"
                >
                  <div>
                    <div className="text-xs font-semibold text-slate-800">{item.title}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{item.desc}</div>
                  </div>
                  <div
                    className={`w-10 h-6 rounded-full p-1 transition-colors ${
                      enabled ? 'bg-slate-900' : 'bg-slate-200'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        enabled ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Credit Consumption History */}
          <div className="md:col-span-6 bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">近期积分明细</h3>
              <span className="text-xs text-slate-400">当前余额：{credits}</span>
            </div>
            <div className="space-y-2.5">
              {creditLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between py-2 border-b border-slate-100 last:border-none text-xs"
                >
                  <div>
                    <div className="font-medium text-slate-800">{log.title}</div>
                    <div className="text-[11px] text-slate-400">{log.time}</div>
                  </div>
                  <span
                    className={`font-bold ${
                      log.delta.startsWith('+') ? 'text-emerald-600' : 'text-slate-700'
                    }`}
                  >
                    {log.delta} 积分
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
