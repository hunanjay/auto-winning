import React, { useState, useEffect } from 'react';
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
  Gift,
  Plus,
  Package,
  MessageSquare
} from 'lucide-react';
import { PRODUCTS } from './data/mockData';
import ImageStudio from './components/ImageStudio';
import VideoStudio from './components/VideoStudio';
import VideoSlicerStudio from './components/VideoSlicerStudio';
import KnowledgeBaseStudio from './components/KnowledgeBaseStudio';
import PersonalCenter from './components/PersonalCenter';
import MembershipModal from './components/MembershipModal';
import CreateTemplateModal from './components/CreateTemplateModal';
import AddProductModal from './components/AddProductModal';
import AIChatStudio from './components/AIChatStudio';
import {
  AppClerkProvider,
  ClerkHeaderAuthBar,
  ClerkSidebarAvatarTrigger
} from './components/ClerkAuthGateway';

export default function App() {
  const [activeTab, setActiveTab] = useState('image');

  // Custom Products (persisted in localStorage)
  const [customProducts, setCustomProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('jm_custom_products');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const allProducts = [...customProducts, ...PRODUCTS];
  const [selectedProduct, setSelectedProduct] = useState(allProducts[0]);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('jm_custom_products', JSON.stringify(customProducts));
    } catch {}
  }, [customProducts]);

  const [externalImagePrompt, setExternalImagePrompt] = useState('');
  const [externalImageRatio, setExternalImageRatio] = useState('3:4');
  const [incomingVideoFrame, setIncomingVideoFrame] = useState(null);
  const [toast, setToast] = useState(null);

  // Custom Reference Templates (persisted in localStorage)
  const [customTemplates, setCustomTemplates] = useState(() => {
    try {
      const saved = localStorage.getItem('jm_custom_templates');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCreateTplOpen, setIsCreateTplOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('jm_custom_templates', JSON.stringify(customTemplates));
    } catch {}
  }, [customTemplates]);

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
    { id: 'chat', label: 'AI对话', icon: MessageSquare },
    { id: 'knowledge', label: '爆款库', icon: Compass },
    { id: 'image', label: 'AI生图', icon: ImageIcon },
    { id: 'video', label: 'AI视频', icon: Video },
    { id: 'slicer', label: '智能切片', icon: Scissors },
    { id: 'profile', label: '我的', icon: User }
  ];

  const handleAddProduct = (newProd) => {
    setCustomProducts((prev) => [newProd, ...prev]);
    setSelectedProduct(newProd);
    showToast(`已成功添加店铺商品「${newProd.name}」并设为当前工作台商品`);
  };

  const handleDeleteProduct = (prodId) => {
    setCustomProducts((prev) => prev.filter((p) => p.id !== prodId));
    if (selectedProduct.id === prodId) {
      setSelectedProduct(PRODUCTS[0]);
    }
    showToast('已移除该自定义商品');
  };

  const handleSaveTemplate = (tpl) => {
    setCustomTemplates((prev) => [tpl, ...prev]);
    showToast(`已保存至我的参考模版：「${tpl.title}」`);
  };

  const handleDeleteTemplate = (tplId) => {
    setCustomTemplates((prev) => prev.filter((t) => t.id !== tplId));
    showToast('已删除该模版');
  };

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
    const matchedProd = allProducts.find((p) => p.svgType === item.svgType) || allProducts[0];
    setSelectedProduct(matchedProd);
    setExternalImagePrompt(item.prompt);
    if (item.ratio) setExternalImageRatio(item.ratio);
    setActiveTab('image');
    showToast(`已载入同款模版 (${item.ratio || '3:4'})`);
  };

  const handleMakeSameVideo = (item) => {
    const matchedProd = allProducts.find((p) => p.svgType === item.svgType) || allProducts[0];
    setSelectedProduct(matchedProd);
    setIncomingVideoFrame({
      svgType: item.svgType,
      customImageUrl: item.customImageUrl,
      palette: item.palette,
      prompt: item.prompt
    });
    setActiveTab('video');
    showToast('已载入同款首帧与视频模版');
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
    <AppClerkProvider onAddToast={showToast}>
    <div className="h-screen w-screen overflow-hidden flex bg-[#F6F7F9] text-slate-900 select-none">
      {/* Jimeng Style Ultra-Slim Left Icon Rail (72px) */}
      <aside className="w-[72px] shrink-0 bg-white border-r border-slate-200/80 flex flex-col items-center justify-between py-4 z-30">
        <div className="flex flex-col items-center gap-5">
          <div
            onClick={() => setActiveTab('image')}
            className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-sm cursor-pointer hover:bg-indigo-600 transition-colors"
            title="auto-winning"
          >
            <Sparkles className="w-5 h-5" />
          </div>

          {/* Quick + New Template Circle Button in Sidebar */}
          <button
            onClick={() => setIsCreateTplOpen(true)}
            className="w-11 h-11 rounded-2xl bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white flex flex-col items-center justify-center transition-all cursor-pointer shadow-2xs"
            title="新建我的参考模版 (支持粘贴链接)"
          >
            <Plus className="w-4 h-4" />
            <span className="text-[9px] font-bold mt-0.5">模版</span>
          </button>

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

          <ClerkSidebarAvatarTrigger />
        </div>
      </aside>

      {/* Right Main Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-14 shrink-0 px-6 bg-white/80 backdrop-blur-md border-b border-slate-200/70 flex items-center justify-between z-20">
          <div className="flex items-center gap-2.5">
            <span className="text-sm font-extrabold tracking-tight text-slate-900">
              auto-winning
            </span>
            <span className="text-slate-300">/</span>
            <span className="text-sm font-bold text-slate-700 tracking-tight">
              {navItems.find((n) => n.id === activeTab)?.label}
            </span>
          </div>

          {/* Right: To-C Consumer Bar */}
          <div className="flex items-center gap-2.5 relative">
            {!hasCheckedIn && (
              <button
                onClick={handleCheckIn}
                className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-200/80 text-amber-700 text-xs font-semibold transition-all cursor-pointer"
              >
                <Gift className="w-3.5 h-3.5 text-amber-500" />
                <span>签到 +60</span>
              </button>
            )}

            <button
              onClick={() => setIsVipModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/70 text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>{credits}</span>
              <span className="text-slate-300">|</span>
              <span className="text-indigo-600">会员</span>
            </button>

            <button
              onClick={() => setShowNotifPopover(!showNotifPopover)}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200/70 flex items-center justify-center text-slate-600 relative cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1.5 right-1.5" />
            </button>

            {showNotifPopover && (
              <div className="absolute right-0 top-11 w-72 bg-white rounded-2xl shadow-xl border border-slate-200/80 p-3.5 space-y-2.5 z-50">
                <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                  <span>消息通知</span>
                  <button
                    onClick={() => setShowNotifPopover(false)}
                    className="text-[11px] text-slate-400 hover:text-slate-600 cursor-pointer"
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
                  <div className="font-semibold text-slate-800">🛍️ 店铺新商品管理已就绪</div>
                  <div className="text-[11px] text-slate-500">
                    支持直接上传实拍图，AI 自动白底抠图并无缝合成大促场景图与视频。
                  </div>
                </div>
              </div>
            )}

            <ClerkHeaderAuthBar onAddToast={showToast} />
          </div>
        </header>

        {/* Expansive Light Canvas */}
        <main className="flex-1 overflow-y-auto px-6 pt-6">
          <div className="max-w-6xl mx-auto">
            {activeTab === 'chat' && (
              <AIChatStudio
                selectedProduct={selectedProduct}
                onMakeSameImage={handleMakeSameImage}
                onMakeSameVideo={handleMakeSameVideo}
                onNavigateToTab={setActiveTab}
                onAddToast={showToast}
              />
            )}

            {activeTab === 'knowledge' && (
              <KnowledgeBaseStudio
                customTemplates={customTemplates}
                bookmarkedIds={bookmarkedIds}
                onToggleBookmark={handleToggleBookmark}
                onOpenCreateTemplate={() => setIsCreateTplOpen(true)}
                onDeleteTemplate={handleDeleteTemplate}
                onMakeSameImage={handleMakeSameImage}
                onMakeSameVideo={handleMakeSameVideo}
                onAddToast={showToast}
              />
            )}

            {activeTab === 'image' && (
              <ImageStudio
                selectedProduct={selectedProduct}
                allProducts={allProducts}
                onSelectProduct={setSelectedProduct}
                externalPrompt={externalImagePrompt}
                externalRatio={externalImageRatio}
                customTemplates={customTemplates}
                onOpenCreateTemplate={() => setIsCreateTplOpen(true)}
                onOpenAddProduct={() => setIsAddProductOpen(true)}
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
                allProducts={allProducts}
                onSelectProduct={setSelectedProduct}
                incomingFrame={incomingVideoFrame}
                onOpenCreateTemplate={() => setIsCreateTplOpen(true)}
                onOpenAddProduct={() => setIsAddProductOpen(true)}
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
                allProducts={allProducts}
                selectedProduct={selectedProduct}
                onSelectProduct={setSelectedProduct}
                onOpenAddProduct={() => setIsAddProductOpen(true)}
                onDeleteProduct={handleDeleteProduct}
                onAddToast={showToast}
              />
            )}
          </div>
        </main>
      </div>

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
        onAddProduct={handleAddProduct}
      />

      {/* Create Custom Reference Template Modal */}
      <CreateTemplateModal
        isOpen={isCreateTplOpen}
        onClose={() => setIsCreateTplOpen(false)}
        onSaveTemplate={handleSaveTemplate}
        onSaveAndUseImage={(tpl) => {
          handleSaveTemplate(tpl);
          handleMakeSameImage(tpl);
        }}
        onSaveAndUseVideo={(tpl) => {
          handleSaveTemplate(tpl);
          handleMakeSameVideo(tpl);
        }}
      />

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
    </AppClerkProvider>
  );
}
