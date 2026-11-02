import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Sparkles,
  ArrowUp,
  Bot,
  User,
  Compass,
  Image as ImageIcon,
  Video,
  Database,
  Search,
  Copy,
  RefreshCw,
  ShoppingBag,
  Flame,
  CheckCircle2
} from 'lucide-react';

/**
 * -------------------------------------------------------------------------------------------------
 * 核心架构规划与待办备注 (TODO & Roadmap):
 * 
 * 后续能承接用户的意图 然后从知识库和数据库中 search 处理：
 * 1. 【用户意图识别与分发 (Intent Classification & Routing)】：
 *    - 识别用户自然语言诉求（如：“帮我生成一组适合双11的护肤品主图方案”、“提炼小红书早八爆款文案”）；
 *    - 自动提取结构化参数：商品实体 (Entity)、目标平台 (小红书/抖音/天猫)、目标场景与受众。
 * 
 * 2. 【知识库与数据库语义检索 (RAG & DB Hybrid Search)】：
 *    - 连接知识库 (Knowledge Base / Vector Store)：检索高点击前3秒Hook、行业爆款分镜脚本、类目热词库；
 *    - 连接业务数据库 (SQL / NoSQL DB)：检索当前店铺商品 (SKU)、历史转化数据、竞品大盘指标；
 *    - 混合搜索 (Hybrid Search) 后召回 Top-K 相关上下文注入给大模型。
 * 
 * 3. 【工具调用与业务闭环 (Tool Calling / Agent Action)】：
 *    - 触发生图工具 (generateImageTool)：自动填充提示词、比例并推送到 AI生图；
 *    - 触发视频工具 (generateVideoTool)：自动提取分镜与运镜推送到 AI视频；
 *    - 触发切片工具 (sliceVideoTool)：根据话术锚点自动定位高光。
 * -------------------------------------------------------------------------------------------------
 */

const PRESET_INTENTS = [
  {
    title: '小红书高赞爆款脚本',
    desc: '提炼前3秒抓人Hook与情绪共鸣话术',
    prompt: '结合当前选中的商品，帮我写一篇小红书千赞爆款种草文案，包含黄金前3秒痛点Hook和真实使用体验感。'
  },
  {
    title: '生成电商棚拍生图提示词',
    desc: '生成适用于天猫/淘宝商业级场景摄影Prompt',
    prompt: '帮我设计一组适合当前商品的商业摄影棚生图提示词，要求法式极简光影、微距材质细节、高级留白。'
  },
  {
    title: '双11大促带货旁白策划',
    desc: '围绕破价立减与赠品机制设计主播台词',
    prompt: '策划一段30秒抖音直播带货口播脚本，重点突出限时买正装送同款、破价直降的紧迫感。'
  },
  {
    title: '知识库相似竞品拆解',
    desc: '检索爆款库中同品类完播率超70%的视频结构',
    prompt: '从爆款知识库中检索同类目的Top爆款视频，分析它们完播率最高的黄金分镜结构是什么？'
  }
];

export default function AIChatStudio({
  selectedProduct,
  onMakeSameImage,
  onMakeSameVideo,
  onNavigateToTab,
  onAddToast
}) {
  const [messages, setMessages] = useState([
    {
      id: 'm-init',
      sender: 'ai',
      time: '刚刚',
      text: `你好！我是你的电商 AI 增长顾问。我已经就绪当前店铺主推商品：**「${selectedProduct.name}」**（${selectedProduct.category}）。\n\n你可以随时向我描述你的营销诉求，无论是提炼爆款前3秒Hook、设计高点击场景生图提示词，还是从爆款库中检索行业打法，我都会智能为你分析处理！`,
      actionSuggestion: null
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  /**
   * 处理用户发送消息
   * TODO: 后续在这里接后端 Agent Pipeline：
   * 1. 发送 prompt 到后端意图识别分类器
   * 2. 执行向量库检索 (Vector Search in Knowledge Base) 和数据库商品检索 (Search from DB)
   * 3. 流式返回回答，并携带工具调用结构化建议
   */
  const handleSendMessage = (textToSend = null) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isTyping) return;

    const userMsg = {
      id: `u-${Date.now()}`,
      sender: 'user',
      time: '刚刚',
      text
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setIsTyping(true);

    // 模拟意图识别和知识库检索处理
    setTimeout(() => {
      let aiResponseText = '';
      let actionSuggestion = null;

      if (text.includes('生图') || text.includes('提示词') || text.includes('棚拍')) {
        const generatedPrompt = `${selectedProduct.name}置于天然米白洞石展台，午后百叶窗温暖阳光斜射，高级柔和光斑阴影，微距水珠细节，8K超清电商静物摄影`;
        aiResponseText = `已为你检索电商高点击主图知识库，并针对【${selectedProduct.name}】规划了如下商业级场景方案：\n\n**建议场景方案：**\n• 视觉风格：侘寂洞石 · 清晨自然水光\n• 光影布局：百叶窗斜射侧逆光 + 微弱反光板补光\n• 构图比例：3:4 小红书 / 1:1 淘宝天猫标准画幅\n\n**推荐生图提示词 (Prompt)：**\n\`${generatedPrompt}\``;
        actionSuggestion = {
          type: 'image',
          label: '一键将此提示词带去「AI生图」',
          payload: { prompt: generatedPrompt, ratio: '3:4' }
        };
      } else if (text.includes('脚本') || text.includes('口播') || text.includes('带货') || text.includes('视频')) {
        const videoPrompt = `镜头缓慢360度环绕${selectedProduct.name}，清晨柔和丁达尔光斑流动，微距特写展示高级质感`;
        aiResponseText = `已从爆款短视频库中检索到类似品类平均留存率达 72% 的分镜结构：\n\n**30秒黄金带货脚本规划：**\n1. **前3秒 Hook 视觉反差**：“为什么平时花上千元买的${selectedProduct.category}，其实90%都在交智商税？”\n2. **4-15秒 痛点展示**：特写质感对比，直击暗沉/干燥/卡顿痛点\n3. **16-25秒 卖点实测**：展示24小时实测效果与核心专利\n4. **26-30秒 促单逼单**：“今天大促前100单多送同款体验装，不满意包退！”\n\n**推荐视频首帧描述：**\n\`${videoPrompt}\``;
        actionSuggestion = {
          type: 'video',
          label: '以此分镜去「AI视频」生成短片',
          payload: { prompt: videoPrompt }
        };
      } else {
        aiResponseText = `已在知识库中匹配到关于【${selectedProduct.name}】的爆款电商基因数据：\n\n• **高频痛点词云**：熬夜急救、水润温和、早八必备、性价比高\n• **最佳投放平台**：小红书（图文种草）、抖音千川（前3秒视觉奇观视频）\n• **转化建议**：建议搭配“白底实拍 + 营销角标”打造主图，并在短视频开头3秒采用特写镜头制造视觉停顿。`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          time: '刚刚',
          text: aiResponseText,
          actionSuggestion
        }
      ]);
      setIsTyping(false);
    }, 900);
  };

  const handleActionClick = (action) => {
    if (action.type === 'image') {
      onMakeSameImage({
        prompt: action.payload.prompt,
        ratio: action.payload.ratio || '3:4',
        svgType: selectedProduct.svgType
      });
      onAddToast && onAddToast('已载入 AI 生图工作台');
    } else if (action.type === 'video') {
      onMakeSameVideo({
        prompt: action.payload.prompt,
        svgType: selectedProduct.svgType,
        palette: selectedProduct.palette
      });
      onAddToast && onAddToast('已载入 AI 视频工作台');
    }
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col bg-white rounded-3xl border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden">
      {/* Top Studio Header Bar */}
      <div className="px-6 py-3.5 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-2xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">电商 AI 企划助手</h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>RAG 知识库已挂载</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              当前关联商品项目：<strong className="text-slate-700">{selectedProduct.name}</strong>（{selectedProduct.category}）
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200/60">
          <Database className="w-3.5 h-3.5 text-indigo-500" />
          <span>意图识别 · 知识库搜索 · 自动工具闭环</span>
        </div>
      </div>

      {/* Main Conversation Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
        {/* Preset Intent Quick Starters */}
        {messages.length <= 1 && (
          <div className="space-y-3 mb-6">
            <span className="text-xs font-bold text-slate-400 px-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>智能企划常见意图推荐（点击即问）：</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {PRESET_INTENTS.map((intent) => (
                <button
                  key={intent.title}
                  onClick={() => handleSendMessage(intent.prompt)}
                  className="p-3.5 rounded-2xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-200/70 hover:border-indigo-300 text-left transition-all group cursor-pointer"
                >
                  <div className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 flex items-center justify-between">
                    <span>{intent.title}</span>
                    <ArrowUp className="w-3.5 h-3.5 rotate-45 text-slate-400 group-hover:text-indigo-600" />
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">{intent.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message Items */}
        {messages.map((msg) => {
          const isAi = msg.sender === 'ai';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isAi ? '' : 'flex-row-reverse'}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  isAi
                    ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-xs'
                    : 'bg-slate-900 text-white'
                }`}
              >
                {isAi ? <Bot className="w-4 h-4" /> : '苏'}
              </div>

              {/* Message Bubble */}
              <div className={`space-y-2 max-w-2xl ${isAi ? '' : 'items-end'}`}>
                <div
                  className={`p-4 rounded-2xl text-xs leading-relaxed ${
                    isAi
                      ? 'bg-slate-50 text-slate-800 border border-slate-200/70 shadow-2xs'
                      : 'bg-slate-900 text-white shadow-sm'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                </div>

                {/* AI Interactive Action Suggestion Card */}
                {msg.actionSuggestion && (
                  <div className="p-3 rounded-2xl bg-indigo-50/90 border border-indigo-200/80 flex items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      {msg.actionSuggestion.type === 'image' ? (
                        <ImageIcon className="w-4 h-4 text-indigo-600 shrink-0" />
                      ) : (
                        <Video className="w-4 h-4 text-indigo-600 shrink-0" />
                      )}
                      <span className="text-xs font-bold text-indigo-950 truncate">
                        {msg.actionSuggestion.label}
                      </span>
                    </div>

                    <button
                      onClick={() => handleActionClick(msg.actionSuggestion)}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shrink-0 transition-all shadow-xs cursor-pointer"
                    >
                      立即前往执行
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* AI Typing Indicator */}
        {isTyping && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs text-slate-500 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
              <span>正在理解意图并检索电商爆款知识库与商品数据库...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Floating Bottom Input Area */}
      <div className="p-4 bg-white border-t border-slate-100">
        <div className="relative flex items-center bg-slate-50 rounded-2xl border border-slate-200/80 focus-within:border-indigo-500 focus-within:bg-white transition-all shadow-inner">
          <textarea
            rows={1}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="向 AI 描述你的企划需求，例如：帮我写一条适合小红书的香薰种草文案、提炼卖点..."
            className="flex-1 bg-transparent px-4 py-3.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none resize-none leading-relaxed"
          />

          <div className="pr-3 flex items-center gap-1.5">
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isTyping}
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                inputValue.trim() && !isTyping
                  ? 'bg-slate-900 text-white hover:bg-indigo-600 shadow-xs'
                  : 'bg-slate-200 text-slate-400'
              }`}
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
