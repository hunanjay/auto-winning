import React, { useState } from 'react';
import { Sparkles, Check, X, Zap, Crown, Gift } from 'lucide-react';

export default function MembershipModal({
  isOpen,
  onClose,
  credits,
  hasCheckedIn,
  onCheckIn,
  onUpgradePlan
}) {
  const [billingCycle, setBillingCycle] = useState('monthly');

  if (!isOpen) return null;

  const plans = [
    {
      id: 'free',
      name: '免费版',
      price: '¥0',
      sub: '永久免费体验',
      creditsText: '每日登录赠 60 积分',
      features: ['Seedream 3.0 标准生图', '每日可生成约 15 张图', '社区灵感一键做同款', '带即梦水印导出'],
      btnText: '当前使用中',
      popular: false
    },
    {
      id: 'pro',
      name: 'Pro 创作者会员',
      price: billingCycle === 'monthly' ? '¥29' : '¥249',
      sub: billingCycle === 'monthly' ? '/ 月 (首月特惠)' : '/ 年 (省 ¥99)',
      creditsText: '每月 3,000 极速积分',
      features: ['无水印超清 4K 导出', 'AI 视频 3.0 Pro 优先队列', '智能切片不限时长', '商用版权授权'],
      btnText: '立即开通 Pro',
      popular: true
    },
    {
      id: 'ultra',
      name: '尊享工作室版',
      price: billingCycle === 'monthly' ? '¥99' : '¥899',
      sub: billingCycle === 'monthly' ? '/ 月' : '/ 年',
      creditsText: '每月 12,000 极速积分',
      features: ['闲时无限次免费生图', '多商品批量并发生成', '专属高速 GPU 通道', '全品类爆款库实时同步'],
      btnText: '开通尊享版',
      popular: false
    }
  ];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl border border-slate-200/80 p-6 sm:p-8 space-y-6"
      >
        {/* Top Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">会员中心与积分充值</h2>
              <p className="text-xs text-slate-400">当前剩余算力：{credits} 积分</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Daily Check-in Pill */}
            <button
              onClick={onCheckIn}
              disabled={hasCheckedIn}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                hasCheckedIn
                  ? 'bg-slate-100 text-slate-400'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200'
              }`}
            >
              <Gift className="w-3.5 h-3.5" />
              <span>{hasCheckedIn ? '今日已签到 (+60)' : '每日签到领 +60 积分'}</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Billing Cycle Toggle */}
        <div className="flex justify-center">
          <div className="inline-flex bg-slate-100 p-1 rounded-full">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                billingCycle === 'monthly'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500'
              }`}
            >
              按月订阅
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                billingCycle === 'yearly'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500'
              }`}
            >
              <span>连续包年</span>
              <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px]">
                7折
              </span>
            </button>
          </div>
        </div>

        {/* 3 Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((p) => (
            <div
              key={p.id}
              className={`relative rounded-3xl p-5 flex flex-col justify-between border transition-all ${
                p.popular
                  ? 'bg-gradient-to-b from-indigo-50/60 to-white border-indigo-400 shadow-lg shadow-indigo-500/5'
                  : 'bg-slate-50/60 border-slate-200/80'
              }`}
            >
              {p.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold">
                  最受创作者欢迎
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{p.name}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-slate-900">{p.price}</span>
                    <span className="text-xs text-slate-400">{p.sub}</span>
                  </div>
                </div>

                <div className="px-3 py-2 rounded-xl bg-white border border-slate-200/70 flex items-center gap-2 text-xs font-semibold text-indigo-600">
                  <Zap className="w-3.5 h-3.5 fill-indigo-600" />
                  <span>{p.creditsText}</span>
                </div>

                <ul className="space-y-2.5 pt-1">
                  {p.features.map((f, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-xs text-slate-600">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => {
                  if (p.id !== 'free') {
                    onUpgradePlan(p);
                  }
                }}
                className={`mt-6 w-full py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                  p.popular
                    ? 'bg-slate-900 hover:bg-indigo-600 text-white shadow-md'
                    : p.id === 'free'
                    ? 'bg-slate-200/70 text-slate-500 cursor-default'
                    : 'bg-white hover:bg-slate-100 text-slate-900 border border-slate-200'
                }`}
              >
                {p.btnText}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
