import React, { useState } from 'react';
import {
  Compass,
  Image as ImageIcon,
  Video,
  Scissors,
  User,
  Sparkles,
  CheckCircle2,
  Zap,
  Crown,
  Bell,
  Gift
} from 'lucide-react';
import { PRODUCTS } from './data/mockData';
import ImageStudio from './components/ImageStudio';
import VideoStudio from './components/VideoStudio';
import VideoSlicerStudio from './components/VideoSlicerStudio';
import KnowledgeBaseStudio from './components/KnowledgeBaseStudio';
import PersonalCenter from './components/PersonalCenter';
import MembershipModal from './components/MembershipModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('image');
  const [selectedProduct, setSelectedProduct] = useState(PRODUCTS[0]);
  const [externalImagePrompt, setExternalImagePrompt] = useState('');
  const [incomingVideoFrame, setIncomingVideoFrame] = useState(null);
  const [toast, setToast] = useState(null);

  // To-C User State
  const [userProfile] = useState({
    name: '苏苏的AI美学店',
    uid: '8849201',
    plan: 'Pro'
  });
  const [credits, setCredits] = useState(680);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [isVipModalOpen, setIsVipModalOpen] = useState(false);
  const [showNotifPopover, setShowNotifPopover] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState(['ins-1', 'ins-2']);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => {
      setToast((prev) => (prev === msg ? null : prev));
    }, 2800);
  };

  const navItems = [
    { id: 'knowledge', label: '爆款库', icon: Compass },
    { id: 'image', label: 'AI生图', icon: ImageIcon },
    { id: 'video', label: 'AI视频', icon: Video },
    { id: 'slicer', label: '智能切片', icon: Scissors },
    { id: 'profile', label: '我的', icon: User }
  ];

  const handleCheckIn = () => {
    if (hasCheckedIn) return;
    setCredits((c) => c + 60);
    setHasCheckedIn(true);
    showToast('签到成功！今日赠送 +60 算力积分');
  };

  const handleToggleBookmark = (id) => {
    setBookmarkedIds((prev) => {
      const exists = prev.includes(id);
      showToast(exists ? '已取消收藏' : '已加入「我的收藏」');
      return exists ? prev.filter((x) => x !== id) : [...prev, id];
    });
  };

  const handleMakeSameImage = (item) => {
    const matchedProd = PRODUCTS.find((p) => p.svgType === item.svgType) || PRODUCTS[0];
    setSelectedProduct(matchedProd);
    setExternalImagePrompt(item.prompt);
    setActiveTab('image');
    showToast('已载入同款提示词与参考商品');
  };

  const handleMakeSameVideo = (item) => {
    const matchedProd = PRODUCTS.find((p) => p.svgType === item.svgType) || PRODUCTS[0];
    setSelectedProduct(matchedProd);
    setIncomingVideoFrame({
      svgType: item.svgType,
      palette: item.palette,
      prompt: item.prompt
    });
    setActiveTab('video');
    showToast('已载入同款首帧与视频描述');
  };

  const handleSendImageToVideo = (frameData) => {
    setIncomingVideoFrame(frameData);
    setActiveTab('video');
    showToast('已作为首帧图载入 AI 视频');
  };

  const handleSendVideoToSlicer = () => {
    setActiveTab('slicer');
    showToast('已载入智能切片轨道');
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-[#F6F7F9] text-slate-900 select-none">
      {/* Jimeng Style Ultra-Slim Left Icon Rail (72px) */}
      <aside className="w-[72px] shrink-0 bg-white border-r border-slate-200/80 flex flex-col items-center justify-between py-4 z-30">
        {/* Top Brand + 5 Navigation Icons */}
        <div className="flex flex-col items-center gap-5">
          <div
            onClick={() => setActiveTab('image')}
            className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-sm cursor-pointer hover:bg-indigo-600 transition-colors"
            title="即梦电商工作台"
          >
            <Sparkles className="w-5 h-5" />
          </div>

          <nav className="flex flex-col items-center gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-14 py-2.5 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    active
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-[11px] font-medium tracking-tight">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom To-C VIP Trigger & Avatar */}
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={() => setIsVipModalOpen(true)}
            className="w-11 h-11 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200/80 flex flex-col items-center justify-center text-amber-600 transition-colors cursor-pointer"
            title="升级会员 / 领积分"
          >
            <Crown className="w-4 h-4" />
            <span className="text-[9px] font-bold mt-0.5">VIP</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`relative w-9 h-9 rounded-full p-0.5 transition-transform hover:scale-105 cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-gradient-to-tr from-indigo-600 to-pink-500'
                : 'bg-slate-200'
            }`}
            title="个人中心"
          >
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-xs font-extrabold text-slate-900">
              苏
            </div>
          </button>
        </div>
      </aside>

      {/* Right Main Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Clean Minimal Top Bar with To-C Credits, Sign-In, Notifications & Avatar */}
        <header className="h-14 shrink-0 px-6 bg-white/80 backdrop-blur-md border-b border-slate-200/70 flex items-center justify-between z-20">
          {/* Left: Current Module Title & Quick Product Switcher */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-slate-900">
              {navItems.find((n) => n.id === activeTab)?.label}
            </span>

            {activeTab !== 'profile' && (
              <div className="hidden md:flex items-center gap-1 bg-slate-100/90 p-1 rounded-full">
                {PRODUCTS.map((prod) => {
                  const active = prod.id === selectedProduct.id;
                  return (
                    <button
                      key={prod.id}
                      onClick={() => setSelectedProduct(prod)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                        active
                          ? 'bg-white text-slate-900 shadow-2xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {prod.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: To-C Consumer Bar (Daily Check-in + Credits + VIP + Notifications + Profile) */}
          <div className="flex items-center gap-2.5 relative">
            {/* Daily Check-in Gift Pill */}
            {!hasCheckedIn && (
              <button
                onClick={handleCheckIn}
                className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-200/80 text-amber-700 text-xs font-semibold transition-all cursor-pointer"
              >
                <Gift className="w-3.5 h-3.5 text-amber-500" />
                <span>签到 +60</span>
              </button>
            )}

            {/* Credits Pill */}
            <button
              onClick={() => setIsVipModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/70 text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>{credits}</span>
              <span className="text-slate-300">|</span>
              <span className="text-indigo-600">会员</span>
            </button>

            {/* Notification Bell */}
            <button
              onClick={() => setShowNotifPopover(!showNotifPopover)}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200/70 flex items-center justify-center text-slate-600 relative cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1.5 right-1.5" />
            </button>

            {/* Notification Popover */}
            {showNotifPopover && (
              <div className="absolute right-0 top-11 w-72 bg-white rounded-2xl shadow-xl border border-slate-200/80 p-3.5 space-y-2.5 z-50">
                <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                  <span>消息通知</span>
                  <button
                    onClick={() => setShowNotifPopover(false)}
                    className="text-[11px] text-slate-400 hover:text-slate-600"
                  >
                    关闭
                  </button>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 text-xs space-y-1">
                  <div className="font-semibold text-slate-800">🎁 每日免费算力待领取</div>
                  <div className="text-[11px] text-slate-500">
                    今日登录可免费领取 60 积分，可生成 15 张电商主图。
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 text-xs space-y-1">
                  <div className="font-semibold text-slate-800">✨ Seedream 3.0 电商版已升级</div>
                  <div className="text-[11px] text-slate-500">
                    玻璃反光与真丝垂坠感真实度提升 40%。
                  </div>
                </div>
              </div>
            )}

            {/* User Profile Pill */}
            <button
              onClick={() => setActiveTab('profile')}
              className="flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200/70 transition-colors cursor-pointer"
            >
              <div className="w-6 h-6 rounded-full bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center">
                苏
              </div>
              <span className="text-xs font-medium text-slate-800 hidden sm:inline">
                {userProfile.name.slice(0, 5)}
              </span>
            </button>
          </div>
        </header>

        {/* Expansive Light Canvas */}
        <main className="flex-1 overflow-y-auto px-6 pt-6">
          <div className="max-w-6xl mx-auto">
            {activeTab === 'knowledge' && (
              <KnowledgeBaseStudio
                bookmarkedIds={bookmarkedIds}
                onToggleBookmark={handleToggleBookmark}
                onMakeSameImage={handleMakeSameImage}
                onMakeSameVideo={handleMakeSameVideo}
                onAddToast={showToast}
              />
            )}

            {activeTab === 'image' && (
              <ImageStudio
                selectedProduct={selectedProduct}
                onSelectProduct={setSelectedProduct}
                externalPrompt={externalImagePrompt}
                onSendToVideo={handleSendImageToVideo}
                onAddToast={(msg) => {
                  setCredits((c) => Math.max(0, c - 4));
                  showToast(`${msg} (-4 积分)`);
                }}
              />
            )}

            {activeTab === 'video' && (
              <VideoStudio
                selectedProduct={selectedProduct}
                incomingFrame={incomingVideoFrame}
                onSendToSlicer={handleSendVideoToSlicer}
                onAddToast={(msg) => {
                  setCredits((c) => Math.max(0, c - 15));
                  showToast(`${msg} (-15 积分)`);
                }}
              />
            )}

            {activeTab === 'slicer' && (
              <VideoSlicerStudio
                selectedProduct={selectedProduct}
                onAddToast={showToast}
              />
            )}

            {activeTab === 'profile' && (
              <PersonalCenter
                userProfile={userProfile}
                credits={credits}
                hasCheckedIn={hasCheckedIn}
                onCheckIn={handleCheckIn}
                onOpenVip={() => setIsVipModalOpen(true)}
                bookmarkedIds={bookmarkedIds}
                onToggleBookmark={handleToggleBookmark}
                onMakeSameImage={handleMakeSameImage}
                onMakeSameVideo={handleMakeSameVideo}
                onAddToast={showToast}
              />
            )}
          </div>
        </main>
      </div>

      {/* To-C Membership & Credits Modal */}
      <MembershipModal
        isOpen={isVipModalOpen}
        onClose={() => setIsVipModalOpen(false)}
        credits={credits}
        hasCheckedIn={hasCheckedIn}
        onCheckIn={handleCheckIn}
        onUpgradePlan={(plan) => {
          setCredits((c) => c + 3000);
          setIsVipModalOpen(false);
          showToast(`已开通 ${plan.name}，到账 +3,000 极速积分！`);
        }}
      />

      {/* Minimal Light Toast */}
      {toast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-full shadow-lg text-xs font-medium">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
