import React from 'react';
import {
  Sparkles,
  Image as ImageIcon,
  Video,
  Scissors,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Zap,
  CheckCircle2,
  Clock,
  Layers,
  Flame,
  Play
} from 'lucide-react';
import { WORKBENCH_METRICS, SAMPLE_PRODUCTS, VIRAL_KNOWLEDGE_VIDEOS } from '../data/mockData';
import ProductArtwork from './ProductArtwork';

export default function OverviewDashboard({
  onNavigate,
  selectedProduct,
  onSelectProduct,
  recentTasks
}) {
  const pipelineSteps = [
    {
      id: 'knowledge',
      step: 'STEP 01',
      title: '爆款视频与文案知识库',
      subtitle: 'RAG 拆解千川/小红书爆款基因',
      desc: '提取黄金前3秒Hook、分镜结构与高转化痛点词云',
      icon: BookOpen,
      accent: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      actionLabel: '去提炼爆款脚本'
    },
    {
      id: 'image',
      step: 'STEP 02',
      title: 'AI 商品生图工作台',
      subtitle: '白底图秒变奢品级主图/模特图',
      desc: '智能光影重打光、3D场景置换、大促卖点角标合成',
      icon: ImageIcon,
      accent: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
      actionLabel: '生成高点击主图'
    },
    {
      id: 'video',
      step: 'STEP 03',
      title: 'AI 带货生视频中心',
      subtitle: '首帧图生视频 + 数字人口播',
      desc: '微距流体运镜、分镜脚本自动成片、多语种情绪配音',
      icon: Video,
      accent: 'text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/30',
      actionLabel: '合成带货短视频'
    },
    {
      id: 'slicer',
      step: 'STEP 04',
      title: '视频自动切片矩阵',
      subtitle: '直播回放/长测评智能拆条',
      desc: '语音价格锚点识别、转化波峰捕手、自动去重批量分发',
      icon: Scissors,
      accent: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      actionLabel: '进入智能切片台'
    }
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Top Hero Banner: Active Product Context + Full-Link Pipeline */}
      <div className="relative rounded-2xl border border-white/10 bg-gradient-to-r from-slate-900/90 via-indigo-950/60 to-slate-900/90 p-6 overflow-hidden shadow-2xl">
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-400/30 text-indigo-300 text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>OmniCommerce AIGC Studio · 2026 双11全链路生产力引擎已就绪</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              从「爆款知识库」到「生图 · 生视频 · 自动切片」一站式闭环
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              当前绑定商品项目：<span className="text-indigo-300 font-semibold">{selectedProduct.name}</span>（{selectedProduct.sku}）。
              您可以在下方切换当前主推商品，所有工作台模块会自动同步商品卖点、视觉色调与话术资产。
            </p>
          </div>

          {/* Quick Product Switcher Pill Bar */}
          <div className="bg-slate-950/70 backdrop-blur-md border border-white/10 rounded-xl p-3 flex flex-col gap-2 min-w-[290px]">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>当前工作台绑定商品</span>
              <span className="text-indigo-400 font-medium">{selectedProduct.category}</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {SAMPLE_PRODUCTS.map((prod) => {
                const active = prod.id === selectedProduct.id;
                return (
                  <button
                    key={prod.id}
                    onClick={() => onSelectProduct(prod)}
                    className={`text-left px-2.5 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2 border ${
                      active
                        ? 'bg-indigo-600/25 border-indigo-400/60 text-white shadow-sm'
                        : 'bg-white/5 border-transparent text-slate-400 hover:bg-white/10 hover:text-slate-200'
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: prod.themeColor }}
                    />
                    <span className="truncate">{prod.name.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 4 Core Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {WORKBENCH_METRICS.map((m) => (
          <div
            key={m.id}
            className="rounded-2xl border border-white/10 bg-slate-900/65 backdrop-blur-md p-5 hover:border-white/20 transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-400">{m.label}</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300">
                {m.badge}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {m.value}
              </span>
              {m.unit && <span className="text-xs text-slate-400">{m.unit}</span>}
              <span className="ml-auto inline-flex items-center gap-0.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                <TrendingUp className="w-3 h-3" />
                {m.trend}
              </span>
            </div>
            <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
              <span>{m.desc}</span>
              <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${m.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* End-to-End 4-Stage Workflow Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <h2 className="text-base font-bold text-white">电商全链路 AI 创作流水线</h2>
          </div>
          <span className="text-xs text-slate-400">点击任意环节直接进入对应专业工作台</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {pipelineSteps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="cursor-pointer group relative rounded-2xl border border-white/10 bg-slate-900/75 p-5 hover:border-indigo-500/50 hover:bg-slate-900 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                      {item.step}
                    </span>
                    <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${item.accent}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {item.title}
                  </h3>
                  <div className="text-xs font-medium text-indigo-400/90 mt-0.5 mb-2">
                    {item.subtitle}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                </div>

                <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-slate-200 group-hover:text-indigo-300">
                  <span>{item.actionLabel}</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>

                {idx < 3 && (
                  <div className="hidden xl:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-6 h-6 rounded-full bg-slate-800 border border-white/15 items-center justify-center text-slate-400">
                    <ArrowRight className="w-3 h-3" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Split: Current Product Live Asset Preview + Recent AI Task Queue & Viral Inspiration */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Product Visual Card */}
        <div className="lg:col-span-5 rounded-2xl border border-white/10 bg-slate-900/70 p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">当前主推商品视觉资产预览</h3>
              <p className="text-xs text-slate-400 mt-0.5">{selectedProduct.name}</p>
            </div>
            <button
              onClick={() => onNavigate('image')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
            >
              <span>去生图精修</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 my-auto">
            <div className="space-y-1.5">
              <div className="aspect-square rounded-xl overflow-hidden border border-white/10">
                <ProductArtwork
                  svgType={selectedProduct.svgType}
                  isWhiteBg={true}
                  showPromoBadge={false}
                  className="w-full h-full"
                />
              </div>
              <div className="text-center text-[11px] text-slate-400">原始白底商品图</div>
            </div>
            <div className="space-y-1.5">
              <div className="aspect-square rounded-xl overflow-hidden border border-indigo-500/40 shadow-lg shadow-indigo-500/10">
                <ProductArtwork
                  svgType={selectedProduct.svgType}
                  isWhiteBg={false}
                  promoText={selectedProduct.sellingPoints[0]}
                  priceText={selectedProduct.promoPrice}
                  className="w-full h-full"
                />
              </div>
              <div className="text-center text-[11px] text-indigo-300 font-medium">
                AI 奢品光影合成主图
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap gap-1.5">
            {selectedProduct.sellingPoints.map((pt, i) => (
              <span
                key={i}
                className="text-[11px] px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300"
              >
                #{pt}
              </span>
            ))}
          </div>
        </div>

        {/* Right: Recent AI Production Queue & Hot Viral Reference */}
        <div className="lg:col-span-7 rounded-2xl border border-white/10 bg-slate-900/70 p-5 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">实时云端渲染与切片任务队列</h3>
            </div>
            <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              GPU 集群空闲 · 极速出图
            </span>
          </div>

          <div className="space-y-2.5">
            {recentTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => onNavigate(task.targetTab)}
                className="cursor-pointer flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-white/5 hover:border-white/15 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${task.badgeClass}`}>
                    {task.status === '已完成' ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <Clock className="w-4 h-4 animate-spin" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-white truncate">{task.title}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>{task.module}</span>
                      <span>·</span>
                      <span>{task.time}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-medium">
                    {task.metrics}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                </div>
              </div>
            ))}
          </div>

          {/* Hot Viral Knowledge Base Callout */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-indigo-950/70 via-purple-950/50 to-slate-900 border border-indigo-500/30 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">
                  今日千川爆款拆解上新：{VIRAL_KNOWLEDGE_VIDEOS[0].title}
                </div>
                <div className="text-[11px] text-slate-300 mt-0.5">
                  前3秒留存率 <span className="text-emerald-400 font-semibold">{VIRAL_KNOWLEDGE_VIDEOS[0].retention3s}</span> · 单条带货 GMV <span className="text-amber-300 font-semibold">{VIRAL_KNOWLEDGE_VIDEOS[0].gmv}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => onNavigate('knowledge')}
              className="shrink-0 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors flex items-center gap-1"
            >
              <Play className="w-3 h-3" />
              <span>拆解拉片</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
