import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Sparkles,
  Terminal,
  Layers,
  Copy,
  Check,
  RefreshCw,
  Search,
  ExternalLink,
  Sliders,
  Send,
  Boxes,
  Code2,
  CheckCircle2,
  AlertCircle,
  Eye,
  X
} from 'lucide-react';

export default function DshPluginTesterStudio({
  onMakeSameImage,
  onNavigateToTab,
  onAddToast,
}) {
  const [activeSubTab, setActiveSubTab] = useState('promptStudio'); // 'promptStudio' | 'agentTools' | 'caseGallery'
  const [healthData, setHealthData] = useState(null);
  const [healthLoading, setHealthLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('product-commerce-visual');

  // Prompt Composer State
  const [composeSubject, setComposeSubject] = useState(
    '3C企业科技定制磁吸无线充电宝，深空灰阳极氧化磨砂铝合金外壳，中心微距激光镭雕客户Logo'
  );
  const [composeRatio, setComposeRatio] = useState('3:4');
  const [composeStyle, setComposeStyle] = useState('高端工业商拍大片、冷白边缘轮廓光、接触阴影');
  const [composeText, setComposeText] = useState('ANERVO POWER');
  const [composeResult, setComposeResult] = useState(null);
  const [isComposing, setIsComposing] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);

  // Agent Tools Sandbox State
  const [selectedTool, setSelectedTool] = useState('compose_industrial_image_prompt');
  const [toolArgsText, setToolArgsText] = useState('');
  const [toolResult, setToolResult] = useState(null);
  const [isToolCalling, setIsToolCalling] = useState(false);
  const [toolCallDuration, setToolCallDuration] = useState(null);

  // Gallery Explorer State
  const [galleryCases, setGalleryCases] = useState([]);
  const [galleryTotal, setGalleryTotal] = useState(0);
  const [galleryPage, setGalleryPage] = useState(1);
  const [galleryCategory, setGalleryCategory] = useState('');
  const [gallerySearch, setGallerySearch] = useState('');
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [activeModalCase, setActiveModalCase] = useState(null);

  const backendBase = 'http://localhost:3001';

  // 1. 获取健康检查与模板数据
  const fetchHealth = async () => {
    setHealthLoading(true);
    try {
      const res = await fetch(`${backendBase}/api/style-library/health`);
      const data = await res.json();
      if (data.code === 0) {
        setHealthData(data.data);
      }
    } catch (err) {
      console.error('获取健康状态失败:', err);
    } finally {
      setHealthLoading(false);
    }
  };

  const fetchMeta = async () => {
    try {
      const [catRes, tplRes] = await Promise.all([
        fetch(`${backendBase}/api/style-library/categories`).then((r) => r.json()),
        fetch(`${backendBase}/api/style-library/templates`).then((r) => r.json()),
      ]);
      if (catRes.code === 0) setCategories(catRes.data || []);
      if (tplRes.code === 0) {
        setTemplates(tplRes.data || []);
        if (tplRes.data?.length > 0 && !selectedTemplateId) {
          setSelectedTemplateId(tplRes.data[0].id);
        }
      }
    } catch (err) {
      console.error('获取模板元数据失败:', err);
    }
  };

  useEffect(() => {
    fetchHealth();
    fetchMeta();
  }, []);

  // 2. 获取案例列表
  const fetchCases = async (page = 1, category = galleryCategory, search = gallerySearch) => {
    setGalleryLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('pageSize', '24');
      if (category) params.set('category', category);
      if (search) params.set('query', search);

      const res = await fetch(`${backendBase}/api/style-library/cases?${params.toString()}`);
      const data = await res.json();
      if (data.code === 0 && data.data) {
        setGalleryCases(data.data.cases || []);
        setGalleryTotal(data.data.total || 0);
        setGalleryPage(data.data.page || 1);
      }
    } catch (err) {
      console.error('获取案例失败:', err);
    } finally {
      setGalleryLoading(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'caseGallery') {
      fetchCases(1, galleryCategory, gallerySearch);
    }
  }, [activeSubTab, galleryCategory]);

  // 3. 执行 Prompt 工业级装配
  const handleCompose = async () => {
    setIsComposing(true);
    try {
      const res = await fetch(`${backendBase}/api/style-library/prompt/compose`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: composeSubject,
          templateId: selectedTemplateId,
          aspectRatio: composeRatio,
          visualStyle: composeStyle,
          textRequirements: composeText,
        }),
      });
      const data = await res.json();
      if (data.code === 0) {
        setComposeResult(data.data);
        onAddToast && onAddToast('✨ 工业级提示词装配完成');
      } else {
        alert(`装配失败: ${data.error}`);
      }
    } catch (err) {
      alert(`网络错误: ${err.message}`);
    } finally {
      setIsComposing(false);
    }
  };

  // 自动装配一次默认值
  useEffect(() => {
    if (templates.length > 0 && !composeResult) {
      handleCompose();
    }
  }, [templates]);

  // 4. Agent Tools 预设参数自动填充
  useEffect(() => {
    let preset = {};
    if (selectedTool === 'compose_industrial_image_prompt') {
      preset = {
        subject: '企业高定科技无线充，阳极氧化太空灰机身，放置在极简黑色木纹展台上',
        template_id: 'product-commerce-visual',
        aspect_ratio: '3:4',
        visual_style: '高奢商拍光影、轮廓高光',
        text_requirements: 'LOGO保真',
      };
    } else if (selectedTool === 'search_image_styles') {
      preset = {
        search: '3C数码',
        category: 'Products & E-commerce',
      };
    } else if (selectedTool === 'get_style_template_details') {
      preset = {
        template_id: 'product-commerce-visual',
      };
    } else if (selectedTool === 'get_style_cases') {
      preset = {
        query: '无线充',
        limit: 3,
      };
    }
    setToolArgsText(JSON.stringify(preset, null, 2));
  }, [selectedTool]);

  // 5. 派发 Agent Tool 调用
  const handleCallAgentTool = async () => {
    setIsToolCalling(true);
    setToolResult(null);
    const start = performance.now();
    try {
      let parsedArgs = {};
      try {
        parsedArgs = JSON.parse(toolArgsText || '{}');
      } catch (e) {
        alert('参数 JSON 格式不正确，请检查！');
        setIsToolCalling(false);
        return;
      }

      const res = await fetch(`${backendBase}/api/dsh/tools/call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolName: selectedTool,
          args: parsedArgs,
        }),
      });
      const data = await res.json();
      setToolCallDuration(Math.round(performance.now() - start));
      setToolResult(data);
      if (data.code === 0) {
        onAddToast && onAddToast(`🤖 Agent 工具 [${selectedTool}] 执行成功`);
      } else {
        onAddToast && onAddToast(`⚠️ 调用返回错误: ${data.error}`);
      }
    } catch (err) {
      setToolResult({ code: 500, error: err.message });
    } finally {
      setIsToolCalling(false);
    }
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    onAddToast && onAddToast('已复制到剪贴板');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const selectedTemplateObj = templates.find((t) => t.id === selectedTemplateId);

  return (
    <div className="pb-16 space-y-6">
      {/* 顶部标题与 DSH 微内核运行状态看板 */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200/60 text-indigo-700 text-[11px] font-bold font-mono">
                DSH PLUG-IN HARNESS
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Cordis 微内核已挂载
              </span>
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>GPT-Image-2 工业级风格库插件调试舱</span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono font-medium">
                awesome-gpt-image-2
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              面向 Agent 自动化与电商创作台的 Prompt as Code 工业级模板、541+ 真实案例及 Function Calling 调试沙盒。
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchHealth}
              disabled={healthLoading}
              className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${healthLoading ? 'animate-spin' : ''}`} />
              <span>刷新内核状态</span>
            </button>
          </div>
        </div>

        {/* 状态统计胶囊条 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-2">
          <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100">
            <div className="text-[11px] text-slate-400 font-medium">DSH 插件名称</div>
            <div className="text-xs font-bold text-slate-800 font-mono truncate mt-0.5">
              gpt-image-style
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-indigo-50/40 border border-indigo-100/60">
            <div className="text-[11px] text-indigo-600 font-medium">工业级黄金模板</div>
            <div className="text-base font-extrabold text-indigo-700 font-mono mt-0.5">
              {healthData?.templatesCount || 22} 套
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-purple-50/40 border border-purple-100/60">
            <div className="text-[11px] text-purple-600 font-medium">真实收录案例</div>
            <div className="text-base font-extrabold text-purple-700 font-mono mt-0.5">
              {healthData?.casesCount || 541} 个
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-blue-50/40 border border-blue-100/60">
            <div className="text-[11px] text-blue-600 font-medium">细分分类体系</div>
            <div className="text-base font-extrabold text-blue-700 font-mono mt-0.5">
              {healthData?.categoriesCount || 13} 类别
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-amber-50/40 border border-amber-100/60">
            <div className="text-[11px] text-amber-600 font-medium">视觉与场景标签</div>
            <div className="text-base font-extrabold text-amber-700 font-mono mt-0.5">
              {(healthData?.stylesCount || 19) + (healthData?.scenesCount || 10)} 标签
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-50/40 border border-emerald-100/60">
            <div className="text-[11px] text-emerald-600 font-medium">DSH Agent 工具</div>
            <div className="text-base font-extrabold text-emerald-700 font-mono mt-0.5">
              4 个 Tools
            </div>
          </div>
        </div>
      </div>

      {/* 选项卡导航 */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveSubTab('promptStudio')}
          className={`px-4 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeSubTab === 'promptStudio'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Prompt-as-Code 组装沙盒</span>
        </button>
        <button
          onClick={() => setActiveSubTab('agentTools')}
          className={`px-4 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeSubTab === 'agentTools'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>DSH Agent Tools 实时调试</span>
        </button>
        <button
          onClick={() => setActiveSubTab('caseGallery')}
          className={`px-4 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeSubTab === 'caseGallery'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>541+ 真实案例画廊探测</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* 视图 1: Prompt as Code 工业级组装沙盒 */}
      {/* ========================================================= */}
      {activeSubTab === 'promptStudio' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 左侧：输入控制器 */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-600" />
                  <span>选择工业级黄金模板</span>
                </h3>
                <span className="text-[11px] text-slate-400">来自 style-library.json</span>
              </div>

              {/* 模板下拉选择 */}
              <div className="space-y-1.5">
                <select
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  {templates.map((tpl) => (
                    <option key={tpl.id} value={tpl.id}>
                      [{tpl.category}] {tpl.title.zh} ({tpl.title.en})
                    </option>
                  ))}
                </select>

                {/* 选中的模板信息胶囊卡片 */}
                {selectedTemplateObj && (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="font-semibold text-slate-800">
                        {selectedTemplateObj.title.zh}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600 text-[10px] font-mono">
                        {selectedTemplateObj.id}
                      </span>
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      {selectedTemplateObj.description?.zh}
                    </div>
                    {/* 排版指导 */}
                    {selectedTemplateObj.guidance?.zh && (
                      <div className="space-y-0.5 text-[11px]">
                        <span className="font-bold text-indigo-600">📐 排版规范：</span>
                        <ul className="list-disc list-inside text-slate-600 pl-1">
                          {selectedTemplateObj.guidance.zh.map((g, idx) => (
                            <li key={idx}>{g}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {/* 避坑原则 */}
                    {selectedTemplateObj.pitfalls?.zh && (
                      <div className="space-y-0.5 text-[11px]">
                        <span className="font-bold text-amber-600">⚠️ 避坑约束：</span>
                        <ul className="list-disc list-inside text-slate-600 pl-1">
                          {selectedTemplateObj.pitfalls.zh.map((p, idx) => (
                            <li key={idx}>{p}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 主体描述 */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>画面主体与核心任务 (Subject & Task)</span>
                  <button
                    onClick={() =>
                      setComposeSubject(
                        '3C企业科技定制磁吸无线充电宝，哑光钛灰色铝合金外壳，中心激光镭雕定制Logo'
                      )
                    }
                    className="text-[11px] text-indigo-600 hover:underline cursor-pointer"
                  >
                    填入 3C 定制案例
                  </button>
                </label>
                <textarea
                  rows={3}
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  placeholder="输入你想生成的画面主体..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* 画幅比例 */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">画幅比例 (Aspect Ratio)</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: '3:4', label: '3:4 电商主图' },
                    { id: '9:16', label: '9:16 竖屏详情' },
                    { id: '1:1', label: '1:1 方形橱窗' },
                    { id: '16:9', label: '16:9 横屏展示' },
                  ].map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setComposeRatio(r.id)}
                      className={`py-2 px-1 text-center rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        composeRatio === r.id
                          ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {r.id}
                    </button>
                  ))}
                </div>
              </div>

              {/* 视觉风格与光影材质 */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  视觉风格与光影材质 (Style & Materials)
                </label>
                <input
                  type="text"
                  value={composeStyle}
                  onChange={(e) => setComposeStyle(e.target.value)}
                  placeholder="例如：高端工业商拍、冷白边缘轮廓光、微距景深"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* 文字排版需求 */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  画面文案与排版需求 (Text & Typography)
                </label>
                <input
                  type="text"
                  value={composeText}
                  onChange={(e) => setComposeText(e.target.value)}
                  placeholder="例如：ANERVO POWER、极简大写无衬线英文字母"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* 触发装配按钮 */}
              <button
                onClick={handleCompose}
                disabled={isComposing}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-transform active:scale-[0.99] cursor-pointer"
              >
                <Sparkles className={`w-4 h-4 ${isComposing ? 'animate-spin' : ''}`} />
                <span>{isComposing ? 'Prompt 装配中...' : '立即通过 DSH 插件编译装配 Prompt'}</span>
              </button>
            </div>
          </div>

          {/* 右侧：Prompt 工业装配成果展示与分层解析 */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Prompt-as-Code 工业组装产物
                  </h3>
                </div>
                {composeResult?.prompt && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyToClipboard(composeResult.prompt, 'composedPrompt')}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      {copiedKey === 'composedPrompt' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>已复制</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>复制代码</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        onMakeSameImage &&
                          onMakeSameImage({
                            prompt: composeResult.prompt,
                            ratio: composeRatio,
                          });
                        onNavigateToTab && onNavigateToTab('image');
                      }}
                      className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>带入 AI 生图工坊</span>
                    </button>
                  </div>
                )}
              </div>

              {/* 完整装配后的 Prompt 文本 */}
              <div className="p-4 rounded-xl bg-slate-900 text-emerald-300 font-mono text-xs leading-relaxed whitespace-pre-wrap selection:bg-emerald-900 shadow-inner">
                {composeResult?.prompt || '等待装配生成...'}
              </div>

              {/* 原子块分层解析 (Block Breakdown) */}
              {composeResult?.blocks && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="text-xs font-bold text-slate-800">
                    🧩 工业标准分层解构 (6-Block Schema):
                  </div>
                  <div className="space-y-1.5 text-[11px]">
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/60">
                      <span className="font-bold text-indigo-700">1. 主体与任务：</span>
                      <span className="text-slate-700">{composeResult.blocks.subject}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/60">
                      <span className="font-bold text-indigo-700">2. 构图与画幅：</span>
                      <span className="text-slate-700">{composeResult.blocks.composition}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/60">
                      <span className="font-bold text-indigo-700">3. 风格与光影材质：</span>
                      <span className="text-slate-700">{composeResult.blocks.style}</span>
                    </div>
                    {composeResult.blocks.text && (
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/60">
                        <span className="font-bold text-indigo-700">4. 文案排版约束：</span>
                        <span className="text-slate-700">{composeResult.blocks.text}</span>
                      </div>
                    )}
                    {composeResult.blocks.guidance && (
                      <div className="p-2 rounded-lg bg-indigo-50/60 border border-indigo-100">
                        <span className="font-bold text-indigo-800">5. 模板排版指南：</span>
                        <span className="text-indigo-900">{composeResult.blocks.guidance}</span>
                      </div>
                    )}
                    <div className="p-2 rounded-lg bg-rose-50/60 border border-rose-100">
                      <span className="font-bold text-rose-700">6. 负向避坑约束：</span>
                      <span className="text-rose-900">{composeResult.blocks.constraints}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 视图 2: DSH Agent Tools 实时调试控制台 */}
      {/* ========================================================= */}
      {activeSubTab === 'agentTools' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 左侧：选择工具与设置参数 */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  选择 DSH Function Calling 工具
                </h3>
              </div>

              {/* 工具切换单选卡片 */}
              <div className="space-y-2">
                {[
                  {
                    name: 'compose_industrial_image_prompt',
                    desc: '按工业级规范编译生成结构化提示词',
                    tag: '核心编译',
                  },
                  {
                    name: 'search_image_styles',
                    desc: '根据意图检索风格模板、标签与场景',
                    tag: '智能检索',
                  },
                  {
                    name: 'get_style_template_details',
                    desc: '查询指定模板的排版指导与防坑约束',
                    tag: '模板详情',
                  },
                  {
                    name: 'get_style_cases',
                    desc: '在 541+ 真实案例画廊中推荐同款参考',
                    tag: '案例推荐',
                  },
                ].map((t) => (
                  <div
                    key={t.name}
                    onClick={() => setSelectedTool(t.name)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      selectedTool === t.name
                        ? 'border-indigo-600 bg-indigo-50/40 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold font-mono text-slate-800">{t.name}</span>
                      <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] text-slate-600 font-medium">
                        {t.tag}
                      </span>
                    </div>
                    <p className="text-slate-500 text-[11px] mt-1">{t.desc}</p>
                  </div>
                ))}
              </div>

              {/* 参数 JSON 编辑区 */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">调用参数 (Arguments JSON)</span>
                  <span className="text-[11px] text-slate-400">标准 OpenAI / DSH 格式</span>
                </div>
                <textarea
                  rows={8}
                  value={toolArgsText}
                  onChange={(e) => setToolArgsText(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-900 text-amber-300 font-mono text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* 派发工具按钮 */}
              <button
                onClick={handleCallAgentTool}
                disabled={isToolCalling}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-transform active:scale-[0.99] cursor-pointer"
              >
                <Send className={`w-3.5 h-3.5 ${isToolCalling ? 'animate-spin' : ''}`} />
                <span>{isToolCalling ? '调用 DSH 内核执行中...' : '派发 Agent Tool 执行'}</span>
              </button>
            </div>
          </div>

          {/* 右侧：执行结果与控制台输出 */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    DSH Agent Tool Call 响应结果
                  </h3>
                </div>
                {toolCallDuration !== null && (
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold">
                    ⚡ 响应耗时: {toolCallDuration}ms
                  </span>
                )}
              </div>

              {/* 响应 JSON 显示 */}
              <div className="p-4 rounded-xl bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto max-h-[500px] overflow-y-auto leading-relaxed shadow-inner">
                {toolResult ? (
                  <pre>{JSON.stringify(toolResult, null, 2)}</pre>
                ) : (
                  <div className="text-slate-500 italic">
                    点击左侧「派发 Agent Tool 执行」查看 DSH 微内核派发的实际响应 JSON...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 视图 3: 541+ 真实案例画廊探测器 */}
      {/* ========================================================= */}
      {activeSubTab === 'caseGallery' && (
        <div className="space-y-4">
          {/* 筛选与搜索栏 */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            {/* 分类下拉 */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-xs font-bold text-slate-600 shrink-0">分类筛选:</span>
              <select
                value={galleryCategory}
                onChange={(e) => setGalleryCategory(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="">全部工业分类 (541+)</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.value}>
                    {c.title.zh} ({c.title.en})
                  </option>
                ))}
              </select>
            </div>

            {/* 搜索框 */}
            <div className="relative w-full md:w-72">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={gallerySearch}
                onChange={(e) => setGallerySearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchCases(1, galleryCategory, gallerySearch)}
                placeholder="搜索案例标题、标签或提示词..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="text-xs text-slate-400 shrink-0">
              共检索到 <span className="font-bold text-slate-800">{galleryTotal}</span> 个高保真案例
            </div>
          </div>

          {/* 案例网格 */}
          {galleryLoading ? (
            <div className="py-20 text-center text-xs text-slate-400">
              <RefreshCw className="w-5 h-5 mx-auto animate-spin mb-2 text-indigo-600" />
              正在从 DSH 插件加载案例库...
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {galleryCases.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setActiveModalCase(c)}
                  className="group relative rounded-xl overflow-hidden bg-white border border-slate-200/80 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col"
                >
                  <div className="aspect-3/4 w-full bg-slate-100 overflow-hidden relative">
                    <img
                      src={c.imageUrl}
                      alt={c.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-[10px] text-white font-mono">
                      #{c.id}
                    </div>
                  </div>
                  <div className="p-2.5 flex-1 flex flex-col justify-between space-y-1">
                    <div className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                      {c.title}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {c.category}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 分页控制 */}
          {galleryTotal > 24 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                disabled={galleryPage <= 1}
                onClick={() => fetchCases(galleryPage - 1)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 disabled:opacity-40 cursor-pointer"
              >
                上一页
              </button>
              <span className="text-xs text-slate-500 font-mono">
                第 {galleryPage} 页 / 共 {Math.ceil(galleryTotal / 24)} 页
              </span>
              <button
                disabled={galleryPage >= Math.ceil(galleryTotal / 24)}
                onClick={() => fetchCases(galleryPage + 1)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 disabled:opacity-40 cursor-pointer"
              >
                下一页
              </button>
            </div>
          )}
        </div>
      )}

      {/* 案例详情与 Prompt 大图弹窗 */}
      {activeModalCase && (
        <div
          onClick={() => setActiveModalCase(null)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-slate-200/80 grid grid-cols-1 md:grid-cols-12"
          >
            {/* 左侧大图 */}
            <div className="md:col-span-5 bg-slate-100 flex items-center justify-center p-4">
              <img
                src={activeModalCase.imageUrl}
                alt={activeModalCase.title}
                className="max-h-[75vh] w-auto object-contain rounded-xl shadow-md"
              />
            </div>

            {/* 右侧信息 */}
            <div className="md:col-span-7 p-6 flex flex-col justify-between space-y-4 overflow-y-auto">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-mono font-bold">
                      案例 #{activeModalCase.id}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs">
                      {activeModalCase.category}
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveModalCase(null)}
                    className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                  {activeModalCase.title}
                </h3>

                {activeModalCase.sourceUrl && (
                  <a
                    href={activeModalCase.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:underline"
                  >
                    <span>来源：{activeModalCase.sourceLabel || activeModalCase.sourceUrl}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}

                <div className="space-y-1">
                  <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
                    <span>逆向反推提示词 (Prompt):</span>
                    <button
                      onClick={() => copyToClipboard(activeModalCase.prompt, 'modalPrompt')}
                      className="text-[11px] text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedKey === 'modalPrompt' ? '已复制' : '复制Prompt'}</span>
                    </button>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 text-emerald-300 font-mono text-[11px] leading-relaxed max-h-56 overflow-y-auto whitespace-pre-wrap selection:bg-emerald-950">
                    {activeModalCase.prompt}
                  </div>
                </div>
              </div>

              {/* 弹窗底部操作 */}
              <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => {
                    onMakeSameImage &&
                      onMakeSameImage({
                        prompt: activeModalCase.prompt,
                        ratio: '3:4',
                      });
                    setActiveModalCase(null);
                    onNavigateToTab && onNavigateToTab('image');
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>以此做同款电商图</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
