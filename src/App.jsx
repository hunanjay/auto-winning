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
import DshPluginTesterStudio from './components/DshPluginTesterStudio';
import {
  AppClerkProvider,
  ClerkHeaderAuthBar,
  ClerkSidebarAvatarTrigger
} from './components/ClerkAuthGateway';

const TAB_ROUTES = {
  chat: '/chat',
  knowledge: '/knowledge',
  image: '/image',
  video: '/video',
  slicer: '/slicer',
  dshTester: '/dsh-tester',
  profile: '/profile',
};

const PATH_TO_TAB = Object.entries(TAB_ROUTES).reduce((acc, [tabId, path]) => {
  acc[path] = tabId;
  return acc;
}, {});

function getTabFromLocation() {
  if (typeof window === 'undefined') return 'image';
  const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
  return PATH_TO_TAB[pathname] || 'image';
}

export default function App() {
  const [activeTab, setActiveTabState] = useState(getTabFromLocation);

  const setActiveTab = (nextTab) => {
    const resolvedTab = TAB_ROUTES[nextTab] ? nextTab : 'image';
    setActiveTabState(resolvedTab);
    const targetPath = TAB_ROUTES[resolvedTab];
    if (typeof window !== 'undefined' && window.location.pathname !== targetPath) {
      window.history.pushState({ tab: resolvedTab }, '', targetPath);
    }
  };

  useEffect(() => {
    const currentTab = getTabFromLocation();
    const targetPath = TAB_ROUTES[currentTab];
    if (window.location.pathname !== targetPath) {
      window.history.replaceState({ tab: currentTab }, '', targetPath);
    }
    const handlePopState = () => {
      setActiveTabState(getTabFromLocation());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

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
  const [externalImages, setExternalImages] = useState([]);
  const [incomingVideoFrame, setIncomingVideoFrame] = useState(null);
  const [toast, setToast] = useState(null);

  // Custom Reference Templates (persisted in SQLite DB & localStorage)
  const [customTemplates, setCustomTemplates] = useState(() => {
    try {
      const saved = localStorage.getItem('jm_custom_templates');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCreateTplOpen, setIsCreateTplOpen] = useState(false);

  // 从 SQLite 数据库加载并双向同步自定义模版
  useEffect(() => {
    fetch('http://localhost:3001/api/templates')
      .then((r) => r.json())
      .then((res) => {
        if (res.code === 0 && Array.isArray(res.data)) {
          if (res.data.length > 0) {
            setCustomTemplates(res.data);
            try {
              localStorage.setItem('jm_custom_templates', JSON.stringify(res.data));
            } catch {}
          } else if (customTemplates.length > 0) {
            // 本地缓存有历史模版但 SQLite 尚为空，自动将本地模版同步迁移到 SQLite
            fetch('http://localhost:3001/api/templates', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(customTemplates),
            }).catch(() => {});
          }
        }
      })
      .catch(() => {});

    // 同步商品
    fetch('http://localhost:3001/api/products')
      .then((r) => r.json())
      .then((res) => {
        if (res.code === 0 && Array.isArray(res.data)) {
          if (res.data.length > 0) {
            setCustomProducts(res.data);
            try {
              localStorage.setItem('jm_custom_products', JSON.stringify(res.data));
            } catch {}
          } else if (customProducts.length > 0) {
            fetch('http://localhost:3001/api/products', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(customProducts),
            }).catch(() => {});
          }
        }
      })
      .catch(() => {});
  }, []);

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
    { id: 'chat', label: '会话', icon: MessageSquare, path: TAB_ROUTES.chat },
    { id: 'knowledge', label: '爆款库', icon: Compass, path: TAB_ROUTES.knowledge },
    { id: 'image', label: '图片模版库', icon: ImageIcon, path: TAB_ROUTES.image },
    { id: 'video', label: '视频模版库', icon: Video, path: TAB_ROUTES.video },
    { id: 'slicer', label: '智能切片', icon: Scissors, path: TAB_ROUTES.slicer },
    { id: 'dshTester', label: 'DSH 风格插件测试', icon: Sparkles, badge: 'DSH', path: TAB_ROUTES.dshTester }
  ];

  const currentTabLabel =
    navItems.find((n) => n.id === activeTab)?.label || (activeTab === 'profile' ? '我的个人中心' : '');
  const currentTabPath = TAB_ROUTES[activeTab] || '/image';

  useEffect(() => {
    document.title = currentTabLabel ? `团团 · ${currentTabLabel}` : '团团有限公司 · AI 电商生成中心';
  }, [currentTabLabel]);

  const handleAddProduct = (newProd) => {
    setCustomProducts((prev) => [newProd, ...prev]);
    setSelectedProduct(newProd);
    showToast(`已成功添加店铺商品「${newProd.name}」（已同步至 SQLite）`);

    fetch('http://localhost:3001/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProd),
    }).catch((err) => console.error('保存商品到 SQLite 失败:', err));
  };

  const handleDeleteProduct = (prodId) => {
    setCustomProducts((prev) => prev.filter((p) => p.id !== prodId));
    if (selectedProduct.id === prodId) {
      setSelectedProduct(PRODUCTS[0]);
    }
    showToast('已移除该自定义商品');

    fetch(`http://localhost:3001/api/products/${prodId}`, {
      method: 'DELETE',
    }).catch((err) => console.error('从 SQLite 删除商品失败:', err));
  };

  const handleSaveTemplate = (tpl) => {
    setCustomTemplates((prev) => [tpl, ...prev]);
    showToast(`已保存至我的参考模版：「${tpl.title}」（已存入 SQLite）`);

    fetch('http://localhost:3001/api/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tpl),
    }).catch((err) => console.error('保存模版到 SQLite 失败:', err));
  };

  const handleDeleteTemplate = (tplId) => {
    setCustomTemplates((prev) => prev.filter((t) => t.id !== tplId));
    showToast('已从模版库删除');

    fetch(`http://localhost:3001/api/templates/${tplId}`, {
      method: 'DELETE',
    }).catch((err) => console.error('从 SQLite 删除模版失败:', err));
  };

  const handleUpdateTemplate = (updatedTpl) => {
    setCustomTemplates((prev) =>
      prev.map((t) => (t.id === updatedTpl.id ? updatedTpl : t))
    );
    // 异步同步到 SQLite
    fetch('http://localhost:3001/api/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedTpl),
    }).catch(() => {});
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
    const imgs = Array.isArray(item.images) && item.images.length > 0
      ? item.images
      : (item.customImageUrl ? [item.customImageUrl] : []);
    setExternalImages(imgs);
    setActiveTab('image');
    showToast(`已载入同款模版 (${item.ratio || '3:4'}${imgs.length > 0 ? ` · ${imgs.length}张参考图` : ''})`);
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
      {/* Standard Sidebar with Same-Row Icon + Label (184px) */}
      <aside className="w-[184px] shrink-0 bg-white border-r border-slate-200/80 flex flex-col justify-between p-3.5 z-30">
        <div className="flex flex-col gap-4">
          {/* Logo & Product Title */}
          <a
            href={TAB_ROUTES.image}
            onClick={(e) => {
              if (!e.metaKey && !e.ctrlKey && !e.shiftKey && e.button === 0) {
                e.preventDefault();
                setActiveTab('image');
              }
            }}
            className="flex items-center justify-start px-1.5 py-1 cursor-pointer group rounded-xl hover:bg-slate-50 transition-colors"
            title="团团有限公司 (/image)"
          >
            <img
              src="/logo.png"
              alt="团团有限公司"
              className="h-8.5 w-auto max-w-[150px] object-contain object-left transition-transform duration-200 group-hover:scale-105"
            />
          </a>

          {/* Quick + New Template Button */}
          <button
            onClick={() => setIsCreateTplOpen(true)}
            className="w-full py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs font-semibold text-xs"
            title="新建我的参考模版 (支持粘贴链接)"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>新建参考模版</span>
          </button>

          {/* Main Tabs: Icon and Text in the Same Row */}
          <nav className="flex flex-col gap-1 w-full">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <a
                  key={item.id}
                  href={item.path}
                  onClick={(e) => {
                    if (!e.metaKey && !e.ctrlKey && !e.shiftKey && e.button === 0) {
                      e.preventDefault();
                      setActiveTab(item.id);
                    }
                  }}
                  title={`${item.label} (${item.path})`}
                  className={`w-full px-3 py-2.5 rounded-xl flex items-center gap-2.5 transition-all cursor-pointer ${
                    active
                      ? 'bg-slate-900 text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-indigo-400' : 'text-slate-500'}`} />
                  <span className="text-xs tracking-tight">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto px-1.5 py-0.5 rounded-md text-[9px] font-black bg-indigo-500 text-white font-mono tracking-wider">
                      {item.badge}
                    </span>
                  )}
                </a>
              );
            })}
          </nav>
        </div>

        {/* Bottom To-C VIP Trigger & User Avatar Button (承载「我的」入口) */}
        <div className="flex flex-col gap-2 w-full pt-3 border-t border-slate-100">
          <button
            onClick={() => setIsVipModalOpen(true)}
            className="w-full px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200/80 flex items-center justify-between text-amber-700 transition-colors cursor-pointer text-xs font-semibold"
            title="升级会员 / 领积分"
          >
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-500" />
              <span>会员权益</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-200/70 text-amber-900 font-bold">
              VIP
            </span>
          </button>

          {/* 用户头像 Link 承接「我的」 */}
          <a
            href={TAB_ROUTES.profile}
            onClick={(e) => {
              if (!e.metaKey && !e.ctrlKey && !e.shiftKey && e.button === 0) {
                e.preventDefault();
                setActiveTab('profile');
              }
            }}
            className={`w-full px-2.5 py-2 rounded-xl flex items-center justify-between transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
            title={`我的 · 个人中心与店铺商品库 (${TAB_ROUTES.profile})`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  activeTab === 'profile'
                    ? 'bg-gradient-to-tr from-indigo-500 to-pink-500 text-white ring-2 ring-white/40 shadow-xs'
                    : 'bg-slate-200 text-slate-800'
                }`}
              >
                苏
              </div>
              <div className="text-left min-w-0">
                <div className="text-xs font-semibold truncate leading-tight">
                  {userProfile.name.slice(0, 5)}
                </div>
                <div className={`text-[10px] truncate ${activeTab === 'profile' ? 'text-slate-300 font-medium' : 'text-slate-400'}`}>
                  我的个人中心
                </div>
              </div>
            </div>
          </a>
        </div>
      </aside>

      {/* Right Main Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-14 shrink-0 px-6 bg-white/80 backdrop-blur-md border-b border-slate-200/70 flex items-center justify-between z-20">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo-icon.png"
              alt="团团"
              className="w-6 h-6 rounded-md object-contain"
            />
            <span className="text-sm font-extrabold tracking-tight text-slate-900">
              团团有限公司
            </span>
            <span className="text-slate-300">/</span>
            <span className="text-sm font-bold text-slate-700 tracking-tight">
              {currentTabLabel}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 font-mono text-[11px] font-medium">
              {currentTabPath}
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

            <ClerkHeaderAuthBar
              onAddToast={showToast}
              onNavigateProfile={() => setActiveTab('profile')}
            />
          </div>
        </header>

        {/* Expansive Light Canvas */}
        <main className={`flex-1 ${activeTab === 'image' ? 'overflow-hidden p-0' : activeTab === 'slicer' ? 'overflow-y-auto p-0' : 'overflow-y-auto px-6 pt-6'}`}>
          <div className={activeTab === 'image' ? 'h-full w-full' : activeTab === 'slicer' ? 'min-h-full w-full' : 'max-w-6xl mx-auto'}>
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
                onUpdateTemplate={handleUpdateTemplate}
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
                externalImages={externalImages}
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

            {activeTab === 'dshTester' && (
              <DshPluginTesterStudio
                onMakeSameImage={handleMakeSameImage}
                onNavigateToTab={setActiveTab}
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
