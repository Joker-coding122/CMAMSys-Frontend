"use client"

/**
 * Deprecated: legacy TipTap writer draft page.
 * The primary Writer Hub lives at /writer and embeds cmam-editor-shell.
 */

import { useState, useCallback, useEffect, useMemo, useRef } from "react"
import dynamic from "next/dynamic"
import type { TiptapEditorHandle } from "./tiptap-editor-wrapper"

const TiptapEditorWrapper = dynamic(
  () => import("./tiptap-editor-wrapper"),
  { ssr: false }
)
import {
  PenTool, ArrowRight, CheckCircle2, Circle, Edit3,
  BookOpen, Sparkles, Bot, Brain, ChevronRight,
  Bold, Italic, Underline, Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Code2, Table2, Image,
  Wand2, Type, FileText, Lightbulb, Send,
  FunctionSquare, Hash, ChevronDown, ChevronUp,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"

/* ============================================================
   章节数据
   ============================================================ */
interface Chapter {
  id: number
  title: string
  status: "completed" | "writing" | "empty"
  words: number
}

const chapters: Chapter[] = [
  { id: 1, title: "摘要", status: "completed", words: 280 },
  { id: 2, title: "问题重述", status: "completed", words: 520 },
  { id: 3, title: "模型假设", status: "completed", words: 380 },
  { id: 4, title: "符号说明", status: "completed", words: 450 },
  { id: 5, title: "模型建立", status: "writing", words: 1200 },
  { id: 6, title: "模型求解", status: "empty", words: 0 },
  { id: 7, title: "结果分析", status: "empty", words: 0 },
  { id: 8, title: "模型评价与改进", status: "empty", words: 0 },
  { id: 9, title: "参考文献", status: "empty", words: 0 },
]

/* ============================================================
   各章节 HTML 内容
   ============================================================ */
const chapterHtmlContents: Record<number, string> = {
  1: `<h2>1. 摘要</h2>
<p>本文针对2024年MCM-C题「渔业气候影响分析」问题，建立了一个SEIR-CA混合模型来研究气候变化对渔业资源的影响机制。首先，我们构建了基于SEIR框架的渔业资源动态模型，将渔业资源分为健康、退化、枯竭和恢复四个状态。其次，引入元胞自动机（CA）处理不同海域之间的空间扩散效应。通过贝叶斯推断方法对模型参数进行拟合，结果表明模型拟合优度R²达到0.947。最后，基于模型结果提出了可持续渔业管理的政策建议。</p>
<p><strong>关键词：</strong>SEIR模型；元胞自动机；渔业资源；气候变化；空间扩散</p>`,

  2: `<h2>2. 问题重述</h2>
<h3>2.1 问题背景</h3>
<p>全球气候变化对海洋生态系统产生了深远影响，渔业资源作为海洋生态系统的重要组成部分，其动态变化直接关系到全球粮食安全和经济发展。近年来，海水温度升高、海洋酸化、洋流变化等因素导致渔业资源分布和产量发生显著变化。</p>
<h3>2.2 问题要求</h3>
<p>题目要求我们：</p>
<ol><li>建立气候变化对渔业资源影响的数学模型；</li><li>分析不同气候情景下渔业资源的动态变化趋势；</li><li>评估现有渔业管理政策的有效性；</li><li>提出可持续渔业管理的优化建议。</li></ol>
<p>需要考虑时间维度和空间维度的耦合效应。</p>`,

  3: `<h2>3. 模型假设</h2>
<p>为简化模型并保证其合理性，本文提出以下假设：</p>
<p><strong>假设1：</strong>研究区域内渔业资源总量在短期内保持相对稳定，不考虑外部物种入侵的影响。</p>
<p><strong>假设2：</strong>气候变化参数（如海表温度、盐度等）在模型时间尺度内呈连续变化趋势。</p>
<p><strong>假设3：</strong>各海域之间的渔业资源扩散遵循距离衰减规律，扩散概率与海域间距离成反比。</p>
<p><strong>假设4：</strong>模型参数不随时间变化，即采用时不变参数假设。</p>
<p><strong>假设5：</strong>渔业资源的自然恢复率与当前资源量成正比，符合Logistic增长模型。</p>`,

  4: `<h2>4. 符号说明</h2>
<p>本文使用的主要符号及其含义如下表所示：</p>
<pre><code>S(t): t时刻健康渔业资源量
E(t): t时刻退化渔业资源量
I(t): t时刻枯竭渔业资源量
R(t): t时刻恢复渔业资源量
\u03B2: 资源退化率
\u03C3: 退化到枯竭的转化率
\u03B3: 资源恢复率
N: 渔业资源总量
L: 空间网格边长
d\u2080: 特征距离参数</code></pre>`,

  5: `<h2>5. 模型建立</h2>
<h3>5.1 SEIR基础模型</h3>
<p>我们采用SEIR（Susceptible-Exposed-Infectious-Recovered）模型作为传染病传播的基础框架。该模型将人群分为四个仓室：易感者(S)、潜伏者(E)、感染者(I)和康复者(R)，其动力学方程如下：</p>
<pre><code>dS/dt = -\u03B2SI / N
dE/dt = \u03B2SI / N - \u03C3E
dI/dt = \u03C3E - \u03B3I
dR/dt = \u03B3I</code></pre>
<p>其中 \u03B2 为传染率，\u03C3 为潜伏期转化率，\u03B3 为恢复率，N 为总人口数。模型的基本再生数 R\u2080 = \u03B2/\u03B3 决定了疫情的传播趋势。</p>
<h3>5.2 元胞自动机空间扩展</h3>
<p>在SEIR模型基础上，我们引入元胞自动机(CA)来处理疾病传播的空间异质性。将研究区域划分为 L\u00D7L 的网格，每个网格单元代表一个子区域，其状态由该区域内的SEIR各仓室人数决定。</p>
<p>元胞的状态转移规则如下：每个时间步内，中心元胞与Moore邻域（8个相邻元胞）进行人口流动交互，流动概率与相邻元胞间的距离成反比。设 p_ij 为元胞 i 向元胞 j 的流动概率：</p>
<pre><code>p_ij = k \u00B7 exp(-d_ij / d\u2080)</code></pre>
<p>其中 d_ij 为两元胞中心间距离，d\u2080 为特征距离参数，k 为归一化系数。通过这种混合建模方式，我们能够同时捕捉疫情传播的时间动态特征和空间扩散模式。</p>`,

  6: `<h2>6. 模型求解</h2>
<p>该章节尚未开始编写。</p>
<p>计划内容：</p>
<ol><li>SEIR模型数值求解方法（四阶Runge-Kutta法）</li><li>元胞自动机迭代规则实现</li><li>参数拟合方法（贝叶斯MCMC）</li><li>模型耦合求解流程</li></ol>`,

  7: `<h2>7. 结果分析</h2>
<p>该章节尚未开始编写。</p>
<p>计划内容：</p>
<ol><li>不同气候情景下的模拟结果对比</li><li>参数敏感性分析</li><li>模型鲁棒性验证</li><li>与历史数据的对比分析</li></ol>`,

  8: `<h2>8. 模型评价与改进</h2>
<p>该章节尚未开始编写。</p>
<p>计划内容：</p>
<ol><li>模型优缺点分析</li><li>与其他模型的对比</li><li>改进方向探讨</li><li>局限性说明</li></ol>`,

  9: `<h2>9. 参考文献</h2>
<p>该章节尚未开始编写。</p>
<p>计划引用文献：</p>
<p>[1] Anderson R M, May R M. Infectious Diseases of Humans[M]. Oxford University Press, 1991.</p>
<p>[2] Wolfram S. A New Kind of Science[M]. Wolfram Media, 2002.</p>
<p>[3] FAO. The State of World Fisheries and Aquaculture[R]. Rome: FAO, 2024.</p>`,
}

/* ============================================================
   参考资料数据
   ============================================================ */
interface Reference {
  id: number
  title: string
  source: string
  summary: string
  expanded: boolean
}

const references: Reference[] = [
  {
    id: 1,
    title: "SEIR-CA混合模型方案 V3.0",
    source: "建模手 · 张三",
    summary: "SEIR处理时间维度，CA处理空间维度。模型采用Moore邻域进行空间交互，参数通过贝叶斯推断拟合。建议在论文中重点阐述两个子模型的耦合机制。",
    expanded: false,
  },
  {
    id: 2,
    title: "编程手代码 V2.5",
    source: "编程手 · 李四",
    summary: "SEIR-CA混合模型Python实现，含参数拟合、敏感性分析和可视化模块。使用scipy.integrate.odeint求解ODE系统。",
    expanded: false,
  },
  {
    id: 3,
    title: "模拟结果数据",
    source: "运行输出",
    summary: "R²=0.947, RMSE=0.032, 模拟耗时12.3s。包含SEIR传播曲线图、空间分布热力图、参数敏感性分析图。",
    expanded: false,
  },
  {
    id: 4,
    title: "模型假设清单 V2.0",
    source: "建模手 · 张三",
    summary: "共8条假设，涵盖人口封闭性、参数时不变性、混合均匀性等。已标注每条假设在论文中的引用位置。",
    expanded: false,
  },
]

/* ============================================================
   AI写作建议
   ============================================================ */
const aiWritingSuggestions = [
  {
    id: 1,
    text: "第五章逻辑清晰，建议在5.1和5.2之间添加过渡段，使两个子模型的衔接更加自然流畅。",
    type: "结构优化",
  },
  {
    id: 2,
    text: "公式(5.1)-(5.4)建议添加编号和变量说明表，方便评委快速理解模型参数含义。",
    type: "格式建议",
  },
  {
    id: 3,
    text: "建议在5.2节添加CA网格示意图，直观展示空间传播机制，提升论文可读性。",
    type: "内容补充",
  },
]

/* ============================================================
   主页面组件
   ============================================================ */
export default function WriterPage() {
  const { showToast } = useToast()
  const [activeChapter, setActiveChapter] = useState(5)
  const [expandedRefs, setExpandedRefs] = useState<Set<number>>(new Set())
  const [wordCount, setWordCount] = useState(0)
  const editorRef = useRef<TiptapEditorHandle>(null)

  const handleCiteReference = useCallback((ref: { title: string; source: string; summary: string }) => {
    const html = `<blockquote><p><strong>${ref.title}</strong>（${ref.source}）：${ref.summary}</p></blockquote>`
    editorRef.current?.insertContent(html)
    showToast(`已引用《${ref.title}》到论文`, "success")
  }, [showToast])

  const handleAiPolish = useCallback(() => {
    const polished = "<p><em>（AI 润色后段落）</em>本文通过 SEIR-CA 混合模型系统地刻画了气候扰动对渔业资源的多尺度影响机制，模型拟合优度 <code>R²=0.953</code>，显著优于单一 SEIR 基线模型。</p>"
    editorRef.current?.insertContent(polished)
    showToast("AI 润色完成，已在正文插入优化段落", "success")
  }, [showToast])

  const handleChapterClick = useCallback((chapter: Chapter) => {
    setActiveChapter(chapter.id)
    if (chapter.status === "empty") {
      showToast("该章节尚未开始编写", "warning")
    }
  }, [showToast])

  const toggleRef = useCallback((id: number) => {
    setExpandedRefs((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const handleWordCountUpdate = useCallback((count: number) => {
    setWordCount(count)
  }, [])

  const totalWords = chapters.reduce((sum, c) => sum + c.words, 0)
  const targetWords = 25000
  const progressPercent = Math.round((totalWords / targetWords) * 100)

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/60 via-amber-50/40 to-rose-50/30">
      {/* 装饰背景 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-amber-400/20 to-orange-400/15 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute top-1/3 -right-32 w-80 h-80 bg-gradient-to-br from-orange-400/15 to-rose-400/10 rounded-full blur-3xl animate-float" />
      </div>

      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 页面头部 */}
        <div className="mb-6 animate-fade-in-up">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/25">
                <PenTool className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 bg-clip-text text-transparent">
                  论文手工作台
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  论文撰写 · 成果呈现 · AI辅助写作
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 px-3 py-1 text-sm shadow-md shadow-amber-500/20">
                王五 · 论文手
              </Badge>
              <a href="/modeler">
                <Button variant="outline" size="sm" className="gap-1.5 text-xs border-amber-200 hover:bg-amber-50 hover:border-amber-300 text-amber-700">
                  前往建模手工作台
                  <ChevronRight className="w-3 h-3" />
                </Button>
              </a>
              <a href="/programmer">
                <Button variant="outline" size="sm" className="gap-1.5 text-xs border-amber-200 hover:bg-amber-50 hover:border-amber-300 text-amber-700">
                  前往编程手工作台
                  <ChevronRight className="w-3 h-3" />
                </Button>
              </a>
            </div>
          </div>
        </div>

        {/* 进度条 */}
        <div className="mb-6 bg-white/70 backdrop-blur-xl rounded-xl border border-amber-100/50 p-4 shadow-sm animate-fade-in-up" style={{ animationDelay: "0.05s" }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-semibold text-slate-700">论文进度</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>当前章节: 第{activeChapter}章 {chapters.find(c => c.id === activeChapter)?.title}</span>
              <span>|</span>
              <span>本章 {wordCount > 0 ? wordCount : chapters.find(c => c.id === activeChapter)?.words || 0}字</span>
              <span>|</span>
              <span>全文 {totalWords.toLocaleString()} / {targetWords.toLocaleString()}字</span>
            </div>
          </div>
          <div className="relative flex h-2 w-full items-center overflow-hidden rounded-full bg-amber-100">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="text-right text-xs text-muted-foreground mt-1">{progressPercent}%</div>
        </div>

        {/* 三栏布局 */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
          {/* 左栏: 论文大纲 */}
          <div className="xl:col-span-2 bg-white/70 backdrop-blur-xl rounded-xl border border-amber-100/50 shadow-lg shadow-amber-500/5 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            <div className="px-4 py-3 border-b border-amber-100/50">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-bold text-slate-800">论文大纲</span>
              </div>
            </div>
            <div className="p-2">
              <ScrollArea className="h-[calc(100vh-260px)]">
                <div className="space-y-0.5">
                  {chapters.map((chapter) => (
                    <button
                      key={chapter.id}
                      onClick={() => handleChapterClick(chapter)}
                      className={cn(
                        "w-full flex items-start gap-2.5 px-3 py-2.5 rounded-lg text-left transition-all duration-200 group",
                        activeChapter === chapter.id
                          ? "bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 shadow-sm"
                          : "hover:bg-amber-50/50 border border-transparent"
                      )}
                    >
                      <span className="mt-0.5 shrink-0">
                        {chapter.status === "completed" && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        )}
                        {chapter.status === "writing" && (
                          <Edit3 className="w-4 h-4 text-orange-500 animate-pulse" />
                        )}
                        {chapter.status === "empty" && (
                          <Circle className="w-4 h-4 text-slate-300" />
                        )}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "text-xs font-medium leading-tight",
                          activeChapter === chapter.id ? "text-amber-800" :
                          chapter.status === "completed" ? "text-slate-600" :
                          chapter.status === "writing" ? "text-orange-700" : "text-slate-400"
                        )}>
                          {chapter.id}. {chapter.title}
                        </p>
                        {chapter.words > 0 && (
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {chapter.status === "completed" ? "已完成" : "编写中"}，{chapter.words}字
                          </p>
                        )}
                        {chapter.status === "empty" && (
                          <p className="text-[10px] text-slate-300 mt-0.5">未开始</p>
                        )}
                      </div>
                      {activeChapter === chapter.id && (
                        <ChevronRight className="w-3 h-3 text-amber-500 mt-1 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>

          {/* 中栏: Tiptap 编辑器 + 工具栏 */}
          <div className="xl:col-span-6 bg-white/80 backdrop-blur-xl rounded-xl border border-amber-100/50 shadow-xl shadow-amber-500/5 animate-fade-in-up flex flex-col" style={{ animationDelay: "0.15s" }}>
            {/* 编辑器工具栏 */}
            <div className="px-4 py-2 border-b border-amber-100/50 shrink-0">
              <div className="flex items-center gap-1 flex-wrap">
                {/* 格式按钮 */}
                <ToolbarButton icon={<Bold className="w-3.5 h-3.5" />} title="加粗" onClick={() => showToast("已切换加粗", "info")} />
                <ToolbarButton icon={<Italic className="w-3.5 h-3.5" />} title="斜体" onClick={() => showToast("已切换斜体", "info")} />
                <ToolbarButton icon={<Underline className="w-3.5 h-3.5" />} title="下划线" onClick={() => showToast("已切换下划线", "info")} />
                <div className="w-px h-5 bg-amber-200 mx-1" />
                <ToolbarButton icon={<Heading1 className="w-3.5 h-3.5" />} title="标题1" onClick={() => showToast("已切换为标题1", "info")} />
                <ToolbarButton icon={<Heading2 className="w-3.5 h-3.5" />} title="标题2" onClick={() => showToast("已切换为标题2", "info")} />
                <ToolbarButton icon={<Heading3 className="w-3.5 h-3.5" />} title="标题3" onClick={() => showToast("已切换为标题3", "info")} />
                <div className="w-px h-5 bg-amber-200 mx-1" />
                <ToolbarButton icon={<List className="w-3.5 h-3.5" />} title="无序列表" onClick={() => showToast("已插入无序列表", "info")} />
                <ToolbarButton icon={<ListOrdered className="w-3.5 h-3.5" />} title="有序列表" onClick={() => showToast("已插入有序列表", "info")} />
                <ToolbarButton icon={<Quote className="w-3.5 h-3.5" />} title="引用" onClick={() => showToast("已插入引用块", "info")} />
                <ToolbarButton icon={<Code2 className="w-3.5 h-3.5" />} title="代码块" onClick={() => showToast("已插入代码块", "info")} />
                <div className="w-px h-5 bg-amber-200 mx-1" />
                <ToolbarButton icon={<FunctionSquare className="w-3.5 h-3.5" />} title="公式" onClick={() => showToast("公式编辑器开发中", "warning")} />
                <ToolbarButton icon={<Table2 className="w-3.5 h-3.5" />} title="表格" onClick={() => showToast("已插入表格", "info")} />
                <ToolbarButton icon={<Image className="w-3.5 h-3.5" />} title="图片" onClick={() => showToast("已插入图片", "info")} />
                <div className="w-px h-5 bg-amber-200 mx-1" />
                <ToolbarButton icon={<Wand2 className="w-3.5 h-3.5" />} title="AI润色" onClick={() => showToast("AI润色完成，优化了8处表达", "success")} />
                <ToolbarButton icon={<Type className="w-3.5 h-3.5" />} title="字数统计" onClick={() => showToast(`当前章节共 ${wordCount || chapters.find(c => c.id === activeChapter)?.words || 0} 字`, "info")} />
                <ToolbarButton icon={<FileText className="w-3.5 h-3.5" />} title="导出" onClick={() => showToast("论文已导出", "success")} />
              </div>
            </div>

            {/* Tiptap 编辑器 */}
            <div className="flex-1 min-h-0">
              <TiptapEditorWrapper
                key={activeChapter}
                ref={editorRef}
                chapterId={activeChapter}
                initialContent={chapterHtmlContents[activeChapter] || ""}
                onWordCountUpdate={handleWordCountUpdate}
              />
            </div>

            {/* 底部状态栏 */}
            <div className="px-4 py-2 border-t border-amber-100/50 flex items-center justify-between text-xs text-muted-foreground shrink-0">
              <div className="flex items-center gap-3">
                <span>第{activeChapter}章 {chapters.find(c => c.id === activeChapter)?.title}</span>
                <span>|</span>
                <span>{wordCount || chapters.find(c => c.id === activeChapter)?.words || 0}字</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  已保存
                </span>
              </div>
            </div>
          </div>

          {/* 右栏: 参考资料 + AI建议 */}
          <div className="xl:col-span-4 space-y-5">
            {/* 参考资料面板 */}
            <div className="bg-white/70 backdrop-blur-xl rounded-xl border border-amber-100/50 shadow-lg shadow-amber-500/5 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              <div className="px-4 py-3 border-b border-amber-100/50">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-bold text-slate-800">参考资料</span>
                </div>
              </div>
              <div className="p-3 space-y-2">
                {references.map((ref) => (
                  <div
                    key={ref.id}
                    className="rounded-lg bg-gradient-to-r from-amber-50/50 to-orange-50/30 border border-amber-100/60 overflow-hidden"
                  >
                    <button
                      className="w-full flex items-center justify-between px-3 py-2.5 text-left"
                      onClick={() => toggleRef(ref.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-700 truncate">{ref.title}</p>
                        <p className="text-[10px] text-muted-foreground">{ref.source}</p>
                      </div>
                      {expandedRefs.has(ref.id) ? (
                        <ChevronUp className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      )}
                    </button>
                    {expandedRefs.has(ref.id) && (
                      <div className="px-3 pb-2.5 border-t border-amber-100/40">
                        <p className="text-xs text-slate-600 leading-relaxed mt-2">{ref.summary}</p>
                        <Button
                          size="xs"
                          className="mt-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 hover:from-amber-600 hover:to-orange-600"
                          onClick={() => handleCiteReference(ref)}
                        >
                          引用到论文
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* AI写作建议 */}
            <div className="bg-white/70 backdrop-blur-xl rounded-xl border border-amber-100/50 shadow-lg shadow-amber-500/5 animate-fade-in-up" style={{ animationDelay: "0.25s" }}>
              <div className="px-4 py-3 border-b border-amber-100/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-bold text-slate-800">AI写作建议</span>
                  </div>
                  <Button
                    size="xs"
                    className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 hover:from-amber-600 hover:to-orange-600"
                    onClick={handleAiPolish}
                  >
                    <Wand2 className="w-3 h-3 mr-1" />
                    AI润色全文
                  </Button>
                </div>
              </div>
              <div className="p-3 space-y-2">
                {aiWritingSuggestions.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className="flex items-start gap-2.5 rounded-lg bg-gradient-to-r from-amber-50/50 to-orange-50/30 border border-amber-100/60 p-3"
                  >
                    <div className="w-6 h-6 rounded bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-3 h-3 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Badge variant="secondary" className="text-[10px] bg-amber-100 text-amber-600 mb-1">
                        {suggestion.type}
                      </Badge>
                      <p className="text-xs text-slate-700 leading-relaxed">{suggestion.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 字数统计面板 */}
            <div className="bg-white/70 backdrop-blur-xl rounded-xl border border-amber-100/50 shadow-lg shadow-amber-500/5 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
              <div className="px-4 py-3 border-b border-amber-100/50">
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-bold text-slate-800">字数统计</span>
                </div>
              </div>
              <div className="p-4">
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                    {totalWords.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">/ {targetWords.toLocaleString()} 字</p>
                </div>
                <div className="space-y-2">
                  {chapters.filter(c => c.words > 0).map((chapter) => (
                    <div key={chapter.id} className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">第{chapter.id}章 {chapter.title}</span>
                      <span className="font-medium text-slate-800">{chapter.words}字</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ============================================================
   工具栏按钮组件
   ============================================================ */
function ToolbarButton({
  icon,
  title,
  onClick,
}: {
  icon: React.ReactNode
  title: string
  onClick: () => void
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className="p-1.5 rounded-md text-slate-500 hover:text-amber-700 hover:bg-amber-50 transition-colors"
    >
      {icon}
    </button>
  )
}
