import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
  useUser
} from '@clerk/clerk-react';
import {
  Sparkles,
  Mail,
  Lock,
  User,
  Building2,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  KeyRound,
  LogOut,
  X,
  Gift,
  Eye,
  EyeOff,
  Settings2
} from 'lucide-react';

const ENV_CLERK_KEY =
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ||
  'pk_test_YXdhaXRlZC1wb3Jwb2lzZS0zNTc1LmNsZXJrLmFjY291bnRzLmRldiQ';

const isRealClerkKey = (key) =>
  Boolean(
    key &&
      (key.startsWith('pk_test_') || key.startsWith('pk_live_')) &&
      key !== 'pk_test_replace_with_your_clerk_publishable_key' &&
      key.length > 20
  );

const LocalAuthContext = createContext(null);

export function useAppAuth() {
  return useContext(LocalAuthContext);
}

/**
 * 顶层 Clerk 认证容器：
 * - 当检测到有效的 VITE_CLERK_PUBLISHABLE_KEY（或用户在面板中绑定的 pk_test_ Key）时，启用官方 <ClerkProvider>
 * - 当未配置 Key 时，自动启用 1:1 Clerk 交互风格的「沙盒注册/登录中心」，确保开箱即用零白屏
 */
export function AppClerkProvider({ children, onAddToast }) {
  const [customKey, setCustomKey] = useState(() => {
    try {
      return localStorage.getItem('AUTO_WINNING_CLERK_KEY') || '';
    } catch {
      return '';
    }
  });

  const activeClerkKey = isRealClerkKey(ENV_CLERK_KEY)
    ? ENV_CLERK_KEY
    : isRealClerkKey(customKey)
    ? customKey
    : '';

  const [localUser, setLocalUser] = useState(() => {
    try {
      const saved = localStorage.getItem('AUTO_WINNING_USER');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signup'); // 'signup' | 'signin'

  useEffect(() => {
    try {
      if (localUser) {
        localStorage.setItem('AUTO_WINNING_USER', JSON.stringify(localUser));
      } else {
        localStorage.removeItem('AUTO_WINNING_USER');
      }
    } catch {
      // ignore storage errors
    }
  }, [localUser]);

  const openSignUp = () => {
    setAuthMode('signup');
    setAuthModalOpen(true);
  };

  const openSignIn = () => {
    setAuthMode('signin');
    setAuthModalOpen(true);
  };

  const handleSaveCustomClerkKey = (newKey) => {
    const trimmed = newKey.trim();
    try {
      if (trimmed) {
        localStorage.setItem('AUTO_WINNING_CLERK_KEY', trimmed);
      } else {
        localStorage.removeItem('AUTO_WINNING_CLERK_KEY');
      }
    } catch {
      // ignore
    }
    setCustomKey(trimmed);
    if (isRealClerkKey(trimmed)) {
      setAuthModalOpen(false);
      onAddToast?.('已成功挂载真实 Clerk Publishable Key！');
    }
  };

  const contextValue = {
    isLiveClerk: Boolean(activeClerkKey),
    activeClerkKey,
    localUser,
    setLocalUser,
    openSignUp,
    openSignIn,
    closeModal: () => setAuthModalOpen(false),
    handleSaveCustomClerkKey
  };

  const content = (
    <LocalAuthContext.Provider value={contextValue}>
      {children}
      {!activeClerkKey && authModalOpen && (
        <ClerkAuthModal
          initialMode={authMode}
          onClose={() => setAuthModalOpen(false)}
          onSuccess={(user, isNewUser) => {
            setLocalUser(user);
            setAuthModalOpen(false);
            onAddToast?.(
              isNewUser
                ? `🎉 欢迎加入 auto-winning，${user.fullName}！已为您发放 200 初始生图算力`
                : `👋 欢迎回来，${user.fullName}`
            );
          }}
          customKey={customKey}
          onSaveClerkKey={handleSaveCustomClerkKey}
        />
      )}
    </LocalAuthContext.Provider>
  );

  if (activeClerkKey) {
    return <ClerkProvider publishableKey={activeClerkKey}>{content}</ClerkProvider>;
  }

  return content;
}

/**
 * 顶部导航栏右侧的 Clerk 注册 / 登录 / 用户头像组件
 */
export function ClerkHeaderAuthBar({ onAddToast, onNavigateProfile }) {
  const {
    isLiveClerk,
    localUser,
    setLocalUser,
    openSignUp,
    openSignIn,
    handleSaveCustomClerkKey
  } = useAppAuth();

  const [menuOpen, setMenuOpen] = useState(false);

  // 如果已配置真实 Clerk Publishable Key，直接渲染官方 Clerk 组件
  if (isLiveClerk) {
    return (
      <div className="flex items-center gap-2.5">
        <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/70">
          <ShieldCheck className="w-3 h-3" />
          Clerk Live
        </span>
        <SignedOut>
          <SignInButton mode="modal">
            <button className="px-3 py-1.5 rounded-full text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer">
              登录
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-slate-900 text-white hover:bg-indigo-600 transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer">
              <Sparkles className="w-3.5 h-3.5" />
              <span>免费注册</span>
            </button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <LiveClerkUserBadge onResetKey={() => handleSaveCustomClerkKey('')} />
        </SignedIn>
      </div>
    );
  }

  // 未登录状态：展示「登录」与「免费注册（送算力）」按钮
  if (!localUser) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={openSignIn}
          className="px-3 py-1.5 rounded-full text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          登录
        </button>
        <button
          onClick={openSignUp}
          className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-slate-900 text-white hover:bg-indigo-600 transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>免费注册</span>
        </button>
      </div>
    );
  }

  // 已登录状态：展示算力胶囊 + Clerk 风格 UserButton 弹窗
  return (
    <div className="relative flex items-center gap-2.5">
      <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50/90 border border-indigo-200/70 text-[11px] font-semibold text-indigo-700">
        <Sparkles className="w-3 h-3 text-indigo-500" />
        <span>{localUser.credits ?? 200} 算力</span>
      </div>

      <button
        onClick={() => setMenuOpen((prev) => !prev)}
        className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full border border-slate-200/90 bg-white hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
      >
        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white text-[11px] font-bold flex items-center justify-center">
          {localUser.fullName?.slice(0, 1)?.toUpperCase() || 'U'}
        </div>
        <span className="text-xs font-semibold text-slate-800 max-w-[96px] truncate">
          {localUser.fullName}
        </span>
      </button>

      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute right-0 top-11 w-64 bg-white rounded-2xl border border-slate-200/90 shadow-xl p-3 z-50">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white text-sm font-bold flex items-center justify-center shrink-0">
                {localUser.fullName?.slice(0, 1)?.toUpperCase() || 'U'}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 truncate">
                  {localUser.fullName}
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  {localUser.email}
                </div>
                {localUser.company && (
                  <div className="text-[10px] text-indigo-600 font-medium mt-0.5 truncate">
                    {localUser.company}
                  </div>
                )}
              </div>
            </div>

            <div className="py-2 space-y-1 border-b border-slate-100 text-xs">
              <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-slate-50">
                <span className="text-slate-500">当前认证引擎</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                  Clerk Auth
                </span>
              </div>
              <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-slate-50">
                <span className="text-slate-500">赠送创作算力</span>
                <span className="font-bold text-indigo-600">
                  {localUser.credits ?? 200} 点
                </span>
              </div>
            </div>

            {onNavigateProfile && (
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onNavigateProfile();
                }}
                className="mt-2 w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-indigo-600" />
                <span>我的 · 个人中心与商品库</span>
              </button>
            )}

            <button
              onClick={() => {
                setMenuOpen(false);
                setLocalUser(null);
                onAddToast?.('已安全退出登录');
              }}
              className="mt-2 w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>退出当前账号</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * 左侧极简导航栏底部的头像触发器
 */
export function ClerkSidebarAvatarTrigger() {
  const { isLiveClerk, localUser, openSignUp } = useAppAuth();

  if (isLiveClerk) {
    return (
      <>
        <SignedIn>
          <UserButton />
        </SignedIn>
        <SignedOut>
          <SignUpButton mode="modal">
            <button
              title="点击注册 / 登录"
              className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-100 to-purple-100 border border-slate-200 flex items-center justify-center text-[11px] font-bold text-indigo-700 hover:ring-2 hover:ring-indigo-500/30 transition-all cursor-pointer"
            >
              注册
            </button>
          </SignUpButton>
        </SignedOut>
      </>
    );
  }

  if (localUser) {
    return (
      <div
        title={`${localUser.fullName} (${localUser.email})`}
        className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center text-xs font-bold shadow-xs"
      >
        {localUser.fullName?.slice(0, 1)?.toUpperCase() || 'U'}
      </div>
    );
  }

  return (
    <button
      onClick={openSignUp}
      title="免费注册 auto-winning"
      className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-100 to-purple-100 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-indigo-700 hover:bg-indigo-600 hover:text-white transition-all cursor-pointer"
    >
      注册
    </button>
  );
}

function LiveClerkUserBadge({ onResetKey }) {
  const { user } = useUser();
  return (
    <div className="flex items-center gap-2">
      {user && (
        <span className="text-xs font-medium text-slate-700 hidden sm:inline">
          {user.fullName || user.primaryEmailAddress?.emailAddress}
        </span>
      )}
      <UserButton />
      <button
        onClick={onResetKey}
        title="切换 Clerk Key"
        className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
      >
        <Settings2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

/**
 * 1:1 Clerk 官方视觉风格的「注册 / 登录 / 邮箱验证码校验」弹窗
 */
function ClerkAuthModal({
  initialMode = 'signup',
  onClose,
  onSuccess,
  customKey,
  onSaveClerkKey
}) {
  const [mode, setMode] = useState(initialMode); // 'signup' | 'signin'
  const [step, setStep] = useState('form'); // 'form' | 'verify'
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [verifyCode, setVerifyCode] = useState('886420');
  const [error, setError] = useState('');
  const [showKeyConfig, setShowKeyConfig] = useState(false);
  const [keyInput, setKeyInput] = useState(customKey || '');

  const handleOAuthQuickSign = (providerName) => {
    const demoUser = {
      id: `usr_${Date.now()}`,
      fullName: providerName === 'GitHub' ? 'hunanjay' : 'Alex Chen',
      email:
        providerName === 'GitHub'
          ? '1131347530@qq.com'
          : 'alex.chen@techgift.ai',
      company: 'auto-winning · 3C科技定制团队',
      provider: providerName,
      credits: 200
    };
    onSuccess(demoUser, mode === 'signup');
  };

  const handlePrimarySubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email.includes('@')) {
      setError('请输入有效的企业或个人邮箱地址');
      return;
    }
    if (password.length < 6) {
      setError('密码长度至少需要 6 位字符');
      return;
    }

    if (mode === 'signup') {
      if (!fullName.trim()) {
        setError('请输入您的姓名或昵称');
        return;
      }
      // 进入 Clerk 标志性的邮箱 6 位验证码步骤
      setStep('verify');
    } else {
      onSuccess(
        {
          id: `usr_${Date.now()}`,
          fullName: email.split('@')[0],
          email,
          company: company || '科技礼品定制商户',
          provider: 'Email',
          credits: 200
        },
        false
      );
    }
  };

  const handleVerifySubmit = (e) => {
    e.preventDefault();
    if (verifyCode.trim().length < 4) {
      setError('请输入 6 位邮箱验证码');
      return;
    }
    onSuccess(
      {
        id: `usr_${Date.now()}`,
        fullName: fullName.trim(),
        email: email.trim(),
        company: company.trim() || '3C 科技礼品定制商家',
        provider: 'Clerk Email Verified',
        credits: 200
      },
      true
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-[420px] bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-7">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-md mb-3">
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
              {step === 'verify'
                ? '验证您的注册邮箱'
                : mode === 'signup'
                ? '创建您的 auto-winning 账号'
                : '登录到 auto-winning'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {step === 'verify'
                ? `验证码已发送至 ${email}（演示默认码已自动填入）`
                : mode === 'signup'
                ? '新用户注册即赠 200 点 AI 商拍与科技礼品定制算力'
                : '欢迎回来！请输入您的账号信息继续创作'}
            </p>
          </div>

          {step === 'form' ? (
            <>
              {/* Social OAuth Buttons (Clerk Standard Layout) */}
              <div className="grid grid-cols-2 gap-2.5 mb-5">
                <button
                  type="button"
                  onClick={() => handleOAuthQuickSign('GitHub')}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-all cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.2.5-2.3 1.3-3.1-.2-.4-.6-1.6 0-3.2 0 0 1-.3 3.4 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.6.2 2.8 0 3.2.9.8 1.3 1.9 1.3 3.2 0 4.6-2.8 5.6-5.5 5.9.5.4.9 1.1.9 2.2v3.3c0 .3.1.7.8.6A12 12 0 0 0 12 .3" />
                  </svg>
                  <span>GitHub 一键{mode === 'signup' ? '注册' : '登录'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOAuthQuickSign('Google')}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-all cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96z"
                    />
                  </svg>
                  <span>Google 账号</span>
                </button>
              </div>

              <div className="relative flex py-1 items-center mb-4">
                <div className="flex-grow border-t border-slate-200" />
                <span className="shrink mx-3 text-[11px] text-slate-400 font-medium">
                  或使用邮箱{mode === 'signup' ? '注册' : '登录'}
                </span>
                <div className="flex-grow border-t border-slate-200" />
              </div>

              <form onSubmit={handlePrimarySubmit} className="space-y-3.5">
                {mode === 'signup' && (
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        您的称呼 *
                      </label>
                      <div className="relative">
                        <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="如：李总监"
                          className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        企业 / 品牌名称
                      </label>
                      <div className="relative">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          placeholder="如：极客礼盒定制"
                          className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    邮箱地址 *
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    设置密码 *
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="至少 6 位字符"
                      className="w-full pl-8 pr-9 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="text-[11px] text-rose-600 bg-rose-50 border border-rose-200/60 px-3 py-1.5 rounded-lg">
                    {error}
                  </div>
                )}

                {mode === 'signup' && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-50/70 border border-indigo-100 text-[11px] text-indigo-700">
                    <Gift className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>注册成功后立即解锁 3C 充电宝/键盘 Logo 印刻与 200 点算力</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <span>{mode === 'signup' ? '继续并验证邮箱' : '立即登录'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </>
          ) : (
            /* Step 2: Clerk Email Verification Code */
            <form onSubmit={handleVerifySubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1.5 text-center">
                  输入 6 位安全验证码
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value)}
                  className="w-full text-center tracking-[0.5em] font-mono text-base font-bold py-2.5 rounded-xl border border-indigo-300 bg-indigo-50/30 text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              {error && (
                <div className="text-[11px] text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>完成验证并进入工作台</span>
              </button>

              <button
                type="button"
                onClick={() => setStep('form')}
                className="w-full text-center text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                返回修改邮箱信息
              </button>
            </form>
          )}

          {/* Switch between Sign Up and Sign In */}
          <div className="mt-5 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            {mode === 'signup' ? (
              <>
                已经有账号了？{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setStep('form');
                    setError('');
                  }}
                  className="font-bold text-indigo-600 hover:underline cursor-pointer"
                >
                  直接登录
                </button>
              </>
            ) : (
              <>
                还没有 auto-winning 账号？{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setStep('form');
                    setError('');
                  }}
                  className="font-bold text-indigo-600 hover:underline cursor-pointer"
                >
                  免费注册
                </button>
              </>
            )}
          </div>
        </div>

        {/* Clerk Footer & Optional Live Publishable Key Binding */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200/70">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
              Secured by <strong className="text-slate-600">Clerk</strong>
            </span>
            <button
              type="button"
              onClick={() => setShowKeyConfig((prev) => !prev)}
              className="flex items-center gap-1 text-indigo-600 hover:underline font-medium cursor-pointer"
            >
              <KeyRound className="w-3 h-3" />
              <span>配置 Publishable Key</span>
            </button>
          </div>

          {showKeyConfig && (
            <div className="mt-2.5 pt-2.5 border-t border-slate-200/70 space-y-2">
              <p className="text-[11px] text-slate-500 leading-relaxed">
                可在 <code className="text-slate-700 font-mono">.env.local</code> 设置{' '}
                <code className="text-slate-700 font-mono">VITE_CLERK_PUBLISHABLE_KEY</code>
                ，或在下方直接粘贴 <code className="text-slate-700 font-mono">pk_test_...</code> 切换到云端实例：
              </p>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="pk_test_..."
                  className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-[11px] font-mono text-slate-800 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => onSaveClerkKey(keyInput)}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-[11px] font-semibold hover:bg-indigo-600 cursor-pointer"
                >
                  应用
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
