"use client"

import { useState, useEffect, useRef } from "react"
import {
  Brain, MessageSquare, Sparkles, Trophy, Bot, Star,
  ChevronDown, ChevronUp, Check, X, Send, FileText,
  BookOpen, Clock, User, ThumbsUp, Zap, ArrowRight,
  ExternalLink, Lightbulb
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"
import { logMMP } from "@/lib/mmp-logger"

/* ------------------------------------------------------------------ */
/*  AI日志数据                                                           */
/* ------------------------------------------------------------------ */
const AI_LOG_MESSAGES = [
  { time: "14:23:01", text: "正在爬取MCM 2024 C题相关论文...", type: "info" as const },
  { time: "14:23:03", text: "找到3篇高相关度论文", type: "success" as const },
  { time: "14:23:05", text: "正在分析SEIR模型适用性...", type: "info" as const },
  { time: "14:23:07", text: "模型参数拟合中... R²=0.947", type: "success" as const },
  { time: "14:23:09", text: "发现潜在改进点: 自适应网格搜索", type: "warning" as const },
  { time: "14:23:11", text: "正在生成可视化建议...", type: "info" as const },
  { time: "14:23:13", text: "迭代记录已更新", type: "success" as const },
  { time: "14:23:15", text: "等待用户操作...", type: "info" as const },
]

type AILogEntry = (typeof AI_LOG_MESSAGES)[number]

const logTypeStyles = {
  info: "text-blue-600 dark:text-blue-400",
  success: "text-emerald-600 dark:text-emerald-400",
  warning: "text-amber-600 dark:text-amber-400",
}

const logDotStyles = {
  info: "bg-blue-500",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
}

/* ------------------------------------------------------------------ */
/*  第一轮: AI参考资料数据                                                */
/* ------------------------------------------------------------------ */
const REFERENCE_PAPERS = [
  {
    title: "Spatial-Temporal Epidemic Modeling Using Hybrid SEIR-CA Framework",
    source: "IEEE, 2023",
    summary: "提出了一种结合SEIR与元胞自动机的混合传染病时空传播模型，在多个城市数据集上验证了方法的有效性。该模型将研究区域划分为网格，每个子区域独立运行SEIR模型并通过邻域耦合实现空间传播。",
  },
  {
    title: "Bayesian Inference for SEIR Model Parameters with Spatial Coupling",
    source: "Google Scholar, 2024",
    summary: "研究了基于贝叶斯推断的SEIR模型参数估计方法，特别考虑了空间耦合效应对参数不确定性的影响。采用MCMC采样获取参数后验分布。",
  },
  {
    title: "Graph Neural Networks for Epidemic Spread Prediction: A Survey",
    source: "arXiv, 2024",
    summary: "综述了图神经网络在传染病传播预测中的应用，对比了GCN、GAT、GraphSAGE等模型在时空预测任务上的表现，提出了多尺度GNN框架。",
  },
  {
    title: "Monte Carlo Simulation for Policy Intervention Assessment",
    source: "arXiv, 2023",
    summary: "介绍了蒙特卡洛模拟在传染病模型中评估政策干预效果的方法，包括隔离、疫苗接种等多种策略的量化分析，为决策提供科学依据。",
  },
]

/* ------------------------------------------------------------------ */
/*  第二轮: AI建议数据                                                   */
/* ------------------------------------------------------------------ */
const AI_SUGGESTIONS = [
  {
    id: 1,
    title: "引入贝叶斯推断进行参数估计",
    content: "建议使用MCMC方法对SEIR模型参数进行贝叶斯推断，以真实数据为观测值构建似然函数，通过Metropolis-Hastings采样获取参数后验分布。这样可以有效量化参数不确定性，提高模型预测精度。",
    source: "GPT-4",
  },
  {
    id: 2,
    title: "增加空间耦合机制",
    content: "在SEIR模型基础上引入莫尔邻域耦合项，将研究区域划分为网格，每个子区域通过人口流动矩阵与8个邻居耦合。这样可以同时捕捉时间动力学和空间传播特征。",
    source: "Claude",
  },
  {
    id: 3,
    title: "考虑自适应网格搜索优化",
    content: "建议在参数优化过程中使用自适应网格搜索方法替代传统的网格搜索，可以显著减少计算量同时保持优化精度。特别是在高维参数空间中效果更为明显。",
    source: "DeepSeek",
  },
]

/* ------------------------------------------------------------------ */
/*  第二轮: 迭代记录数据                                                 */
/* ------------------------------------------------------------------ */
const ITERATION_RECORDS = [
  { time: "14:00", content: "初步确定SEIR方向", author: "张三", type: "human" },
  { time: "14:15", content: "AI建议引入贝叶斯推断", author: "GPT-4", type: "ai" },
  { time: "14:30", content: "采纳空间耦合机制建议", author: "张三", type: "human" },
  { time: "14:45", content: "发现自适应网格搜索改进点", author: "DeepSeek", type: "ai" },
  { time: "15:00", content: "融合方案初稿完成", author: "张三", type: "human" },
  { time: "15:10", content: "方案已更新至V2.0", author: "系统", type: "system" },
]

/* ------------------------------------------------------------------ */
/*  第三轮: 同伴评论数据                                                 */
/* ------------------------------------------------------------------ */
const PEER_REVIEWS = [
  {
    author: "李四",
    avatar: "李",
    color: "from-fuchsia-500 to-fuchsia-600",
    ring: "ring-fuchsia-500",
    role: "编程手",
    content: "建模方案整体思路清晰，SEIR+CA的混合框架有创新性。建议在空间耦合部分明确人口流动矩阵的获取方式，这样我才能更好地进行代码实现。另外，参数估计部分建议提供具体的先验分布设定。",
    time: "15:30",
  },
  {
    author: "王五",
    avatar: "王",
    color: "from-pink-500 to-pink-600",
    ring: "ring-pink-500",
    role: "论文手",
    content: "方案逻辑完整，数学推导严谨。建议在论文中增加模型假设的合理性论证部分，以及与现有方法的对比分析。这样可以让评委更好地理解我们方案的优势。",
    time: "15:45",
  },
  {
    author: "赵六",
    avatar: "赵",
    color: "from-blue-500 to-blue-600",
    ring: "ring-blue-500",
    role: "数据分析师",
    content: "数据方面没有问题，我已经准备好了相关的渔业和气候数据集。建议模型中加入数据验证环节，用部分数据做训练、部分数据做验证，这样结果更有说服力。",
    time: "16:00",
  },
]

/* ------------------------------------------------------------------ */
/*  页面组件                                                            */
/* ------------------------------------------------------------------ */
export default function ModelerPage() {
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState("round1")

  // 第一轮 state
  const [expandedPapers, setExpandedPapers] = useState<Set<number>>(new Set())
  const [personalThought, setPersonalThought] = useState(
    "我倾向于结合SEIR模型和元胞自动机的混合方法。用SEIR处理时间维度，用CA处理空间维度。\n\n具体思路：\n1. 将研究区域划分为网格，每个网格单元独立运行SEIR模型\n2. 通过莫尔邻域耦合实现空间传播效应\n3. 使用贝叶斯方法进行参数估计\n4. 考虑气候变化对模型参数的时变影响"
  )

  // 第二轮 state
  const [adoptedSuggestions, setAdoptedSuggestions] = useState<Set<number>>(new Set())
  const [ignoredSuggestions, setIgnoredSuggestions] = useState<Set<number>>(new Set())
  const [mergedPlan, setMergedPlan] = useState(
    "基于SEIR-CA混合框架的气候对渔业影响模型：\n\n1. 基础框架：SEIR微分方程组描述各仓室转化\n2. 空间维度：网格化区域 + 莫尔邻域耦合\n3. 参数估计：贝叶斯推断 + MCMC采样\n4. 气候因素：温度、酸化度作为时变参数\n5. 验证方法：交叉验证 + 灵敏度分析"
  )

  // 第三轮 state
  const [peerScores, setPeerScores] = useState<Record<string, number>>({})

  // AI日志 state
  const [logEntries, setLogEntries] = useState<AILogEntry[]>([])
  const logScrollRef = useRef<HTMLDivElement>(null)
  const [logStarted, setLogStarted] = useState(false)

  useEffect(() => {
    // 启动日志流
    const startLog = setTimeout(() => {
      setLogStarted(true)
    }, 500)

    return () => clearTimeout(startLog)
  }, [])

  useEffect(() => {
    if (!logStarted) return
    let index = 0
    const interval = setInterval(() => {
      if (index < AI_LOG_MESSAGES.length) {
        const nextEntry = AI_LOG_MESSAGES[index]
        if (nextEntry) {
          setLogEntries(prev => [...prev, nextEntry])
        }
        index++
      } else {
        clearInterval(interval)
      }
    }, 2000)
    return () => clearInterval(interval)
  }, [logStarted])

  useEffect(() => {
    const container = logScrollRef.current
    if (!container) return
    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth",
    })
  }, [logEntries])

  const togglePaper = (idx: number) => {
    setExpandedPapers(prev => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }

  const handleAdoptSuggestion = (id: number) => {
    setAdoptedSuggestions(prev => new Set(prev).add(id))
    setIgnoredSuggestions(prev => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
    showToast("已采纳建议", "success")
    logMMP({ role: "modeler", action: "ai_chat", description: "采纳 AI 建模建议" })
  }

  const handleIgnoreSuggestion = (id: number) => {
    setIgnoredSuggestions(prev => new Set(prev).add(id))
    setAdoptedSuggestions(prev => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
    showToast("已忽略建议", "info")
  }

  const handleSetPeerScore = (author: string, score: number) => {
    setPeerScores(prev => ({ ...prev, [author]: score }))
    showToast(`已为${author}评分: ${score}星`, "success")
  }

  const handleSubmitThought = () => {
    showToast("思路已提交！", "success")
    logMMP({ role: "modeler", action: "submit_thought", description: "提交个人思路到团队思路池" })
  }

  const handleSubmitPlan = () => {
    showToast("融合方案已提交！", "success")
    logMMP({ role: "modeler", action: "submit_plan", description: "提交融合后的建模方案" })
  }

  const handleSubmitFinal = () => {
    showToast("最终方案已确认！", "success")
    logMMP({ role: "modeler", action: "submit_final", description: "确认最终建模方案" })
  }

  /* ---------------------------------------------------------------- */
  /*  AI侧边栏                                                           */
  /* ---------------------------------------------------------------- */
  const renderAISidebar = () => (
    <Card className="w-72 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-0 shadow-xl shrink-0 self-start sticky top-8">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg animate-pulse">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <CardTitle className="text-sm">AI 实时日志</CardTitle>
          {logStarted && logEntries.length < AI_LOG_MESSAGES.length && (
            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 text-[10px] animate-pulse">
              运行中
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div ref={logScrollRef} className="h-[500px] overflow-y-auto pr-1 space-y-2 font-mono text-xs">
          {logEntries.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Bot className="w-6 h-6 mx-auto mb-2 opacity-30" />
              <p>等待日志启动...</p>
            </div>
          )}
          {logEntries.map((entry, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2 p-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-800 animate-in fade-in slide-in-from-bottom-1 duration-300"
            >
              <div className={cn("w-1.5 h-1.5 rounded-full mt-1.5 shrink-0", logDotStyles[entry.type])} />
              <div className="flex-1 min-w-0">
                <div className="text-[10px] text-muted-foreground">{entry.time}</div>
                <div className={cn("text-[11px] leading-relaxed break-all", logTypeStyles[entry.type])}>
                  {entry.text}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )

  /* ---------------------------------------------------------------- */
  /*  第一轮: 独立思考                                                   */
  /* ---------------------------------------------------------------- */
  const renderRound1 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左侧: 个人思路编辑区 */}
        <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-0 shadow-xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl shadow-md">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">个人思路</CardTitle>
                <CardDescription>记录你的建模思路和想法</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              value={personalThought}
              onChange={e => setPersonalThought(e.target.value)}
              rows={14}
              className="text-sm leading-relaxed resize-none"
              placeholder="输入你的建模思路..."
            />
            <div className="mt-4 flex justify-end">
              <Button
                className="bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 gap-2"
                onClick={handleSubmitThought}
              >
                <Send className="w-4 h-4" />
                提交思路
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 右侧: AI参考资料面板 */}
        <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-0 shadow-xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-md">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">AI 参考资料</CardTitle>
                <CardDescription>AI自动爬取的相关论文</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
              {REFERENCE_PAPERS.map((paper, idx) => {
                const isExpanded = expandedPapers.has(idx)
                return (
                  <div
                    key={idx}
                    className="p-3 bg-white/60 dark:bg-gray-800/60 rounded-xl border border-gray-200/60 dark:border-gray-700/60 hover:shadow-md transition-all cursor-pointer"
                    onClick={() => togglePaper(idx)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                            论文 {idx + 1}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">{paper.source}</span>
                        </div>
                        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-snug">
                          {paper.title}
                        </h4>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                      )}
                    </div>
                    {isExpanded && (
                      <div className="mt-2 pt-2 border-t border-gray-200/60 dark:border-gray-700/60 animate-in fade-in slide-in-from-top-1 duration-200">
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {paper.summary}
                        </p>
                        <button
                          className="flex items-center gap-1 mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                          onClick={e => { e.stopPropagation(); showToast("正在打开论文...", "info") }}
                        >
                          <ExternalLink className="w-3 h-3" />
                          查看全文
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  /* ---------------------------------------------------------------- */
  /*  第二轮: 人机融合                                                   */
  /* ---------------------------------------------------------------- */
  const renderRound2 = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 左侧: AI建议列表 */}
      <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-0 shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">AI 建议</CardTitle>
              <CardDescription>来自AI模型的优化建议</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {AI_SUGGESTIONS.map((suggestion) => {
              const isAdopted = adoptedSuggestions.has(suggestion.id)
              const isIgnored = ignoredSuggestions.has(suggestion.id)
              return (
                <div
                  key={suggestion.id}
                  className={cn(
                    "p-3 rounded-xl border transition-all",
                    isAdopted && "bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300/60 dark:border-emerald-700/60",
                    isIgnored && "bg-gray-50 dark:bg-gray-900/50 border-gray-200/60 dark:border-gray-700/60 opacity-60",
                    !isAdopted && !isIgnored && "bg-white/60 dark:bg-gray-800/60 border-gray-200/60 dark:border-gray-700/60"
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                      {suggestion.source}
                    </Badge>
                    {isAdopted && <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 text-[10px]"><Check className="w-2.5 h-2.5 mr-0.5" />已采纳</Badge>}
                    {isIgnored && <Badge variant="secondary" className="text-[10px]"><X className="w-2.5 h-2.5 mr-0.5" />已忽略</Badge>}
                  </div>
                  <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1.5">
                    {suggestion.title}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                    {suggestion.content}
                  </p>
                  {!isAdopted && !isIgnored && (
                    <div className="flex gap-2">
                      <Button
                        size="xs"
                        className="bg-emerald-500 hover:bg-emerald-600 text-white"
                        onClick={() => handleAdoptSuggestion(suggestion.id)}
                      >
                        <Check className="w-3 h-3 mr-0.5" />
                        采纳
                      </Button>
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => handleIgnoreSuggestion(suggestion.id)}
                      >
                        <X className="w-3 h-3 mr-0.5" />
                        忽略
                      </Button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* 中间: 融合方案编辑区 */}
      <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-0 shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-md">
              <Lightbulb className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">融合方案</CardTitle>
              <CardDescription>编辑融合后的建模方案</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Textarea
            value={mergedPlan}
            onChange={e => setMergedPlan(e.target.value)}
            rows={18}
            className="text-sm leading-relaxed resize-none font-mono"
            placeholder="融合后的方案..."
          />
          <div className="mt-4 flex justify-end">
            <Button
              className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 gap-2"
              onClick={handleSubmitPlan}
            >
              <Send className="w-4 h-4" />
              提交方案
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 右侧: 迭代记录 */}
      <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-0 shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-md">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">迭代记录</CardTitle>
              <CardDescription>方案迭代过程</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* 时间线竖线 */}
            <div className="absolute left-[14px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-violet-400 via-blue-400 to-indigo-400" />
            <div className="space-y-0">
              {ITERATION_RECORDS.map((record, idx) => {
                const isLast = idx === ITERATION_RECORDS.length - 1
                return (
                  <div key={idx} className="relative flex gap-3 pb-4 last:pb-0">
                    <div className="relative z-10 shrink-0">
                      <div className={cn(
                        "w-7 h-7 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800 shadow-sm",
                        isLast
                          ? "bg-gradient-to-br from-amber-400 to-orange-500 animate-pulse"
                          : record.type === "human"
                            ? "bg-gradient-to-br from-violet-500 to-indigo-500"
                            : record.type === "ai"
                              ? "bg-gradient-to-br from-blue-500 to-cyan-500"
                              : "bg-gradient-to-br from-gray-400 to-gray-500"
                      )}>
                        {record.type === "human" && <User className="w-3 h-3 text-white" />}
                        {record.type === "ai" && <Bot className="w-3 h-3 text-white" />}
                        {record.type === "system" && <Zap className="w-3 h-3 text-white" />}
                      </div>
                    </div>
                    <div className={cn(
                      "flex-1 p-2.5 rounded-lg border transition-all",
                      isLast
                        ? "bg-amber-50 dark:bg-amber-950/30 border-amber-200/60 dark:border-amber-800/60"
                        : "bg-white/60 dark:bg-gray-800/60 border-gray-200/60 dark:border-gray-700/60"
                    )}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] text-muted-foreground">{record.time}</span>
                        <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400">{record.author}</span>
                      </div>
                      <p className="text-xs text-gray-700 dark:text-gray-300">{record.content}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  /* ---------------------------------------------------------------- */
  /*  第三轮: 同伴互评                                                   */
  /* ---------------------------------------------------------------- */
  const renderRound3 = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 左侧: 同伴评论列表 */}
      <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-0 shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-fuchsia-500 to-pink-500 rounded-xl shadow-md">
              <ThumbsUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">同伴评论</CardTitle>
              <CardDescription>来自队友的评审意见</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
            {PEER_REVIEWS.map((review, idx) => (
              <div
                key={idx}
                className="p-3 bg-white/60 dark:bg-gray-800/60 rounded-xl border border-gray-200/60 dark:border-gray-700/60 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className={cn("w-7 h-7 ring-2", review.ring)}>
                    <AvatarFallback className={cn("bg-gradient-to-br text-white font-bold text-[10px]", review.color)}>
                      {review.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm font-semibold">{review.author}</div>
                    <Badge variant="secondary" className="text-[10px]">{review.role}</Badge>
                  </div>
                  <span className="text-[10px] text-muted-foreground ml-auto">{review.time}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {review.content}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 中间: 最终方案展示区 */}
      <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-0 shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-md">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">最终方案</CardTitle>
              <CardDescription>经过三轮辩论后的最终建模方案</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-xl border border-emerald-200/60 dark:border-emerald-800/60 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                <Check className="w-3 h-3 mr-1" />
                方案已确认
              </Badge>
              <Badge variant="secondary" className="text-[10px]">V2.0</Badge>
            </div>
            <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">
              基于SEIR-CA混合框架的气候对渔业影响预测模型
            </h4>
            <div className="space-y-2 text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
              <p><strong>1. 基础框架:</strong> SEIR微分方程组描述各仓室转化动力学</p>
              <p><strong>2. 空间维度:</strong> 网格化区域 + 莫尔邻域耦合实现空间传播</p>
              <p><strong>3. 参数估计:</strong> 贝叶斯推断 + MCMC采样量化不确定性</p>
              <p><strong>4. 气候因素:</strong> 温度、酸化度、洋流作为时变参数</p>
              <p><strong>5. 验证方法:</strong> 交叉验证 + 灵敏度分析 + 对比实验</p>
            </div>
          </div>

          <div className="p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl border border-gray-200/60 dark:border-gray-700/60">
            <h5 className="text-sm font-semibold mb-2">模型优势</h5>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                <span>兼顾时间动力学和空间传播特征</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                <span>贝叶斯推断有效量化参数不确定性</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                <span>莫尔邻域耦合机制物理意义明确</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                <span>考虑气候因素的时变影响</span>
              </li>
            </ul>
          </div>

          <div className="mt-4 flex justify-end">
            <Button
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 gap-2"
              onClick={handleSubmitFinal}
            >
              <Check className="w-4 h-4" />
              确认最终方案
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 右侧: 评分面板 */}
      <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-0 shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-md">
              <Star className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">评分面板</CardTitle>
              <CardDescription>为同伴贡献打分</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-5">
            {PEER_REVIEWS.map((review) => {
              const currentScore = peerScores[review.author] || 0
              return (
                <div key={review.author} className="p-3 bg-white/60 dark:bg-gray-800/60 rounded-xl border border-gray-200/60 dark:border-gray-700/60">
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className={cn("w-7 h-7 ring-2", review.ring)}>
                      <AvatarFallback className={cn("bg-gradient-to-br text-white font-bold text-[10px]", review.color)}>
                        {review.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-semibold">{review.author}</div>
                      <div className="text-[10px] text-muted-foreground">{review.role}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleSetPeerScore(review.author, star)}
                        className="p-0.5 transition-transform hover:scale-110"
                      >
                        <Star
                          className={cn(
                            "w-5 h-5 transition-colors",
                            star <= currentScore
                              ? "fill-amber-400 text-amber-400"
                              : "text-gray-300 dark:text-gray-600"
                          )}
                        />
                      </button>
                    ))}
                    {currentScore > 0 && (
                      <span className="text-xs text-muted-foreground ml-2">{currentScore}/5</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <Separator className="my-4" />

          {/* 快捷操作 */}
          <div className="space-y-2">
            <a href="/programmer">
              <Button variant="outline" className="w-full gap-2 text-sm" onClick={() => showToast("方案已发送给编程手", "success")}>
                <ArrowRight className="w-4 h-4" />
                发送方案给编程手
              </Button>
            </a>
            <a href="/workflow">
              <Button variant="ghost" className="w-full gap-2 text-sm text-muted-foreground">
                返回工作流总览
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  /* ---------------------------------------------------------------- */
  /*  主渲染                                                             */
  /* ---------------------------------------------------------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-slate-950 dark:to-indigo-950">
      {/* 背景装饰 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-96 h-96 bg-purple-300/25 dark:bg-purple-600/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-10 w-[500px] h-[500px] bg-indigo-300/25 dark:bg-indigo-600/15 rounded-full blur-3xl animate-pulse [animation-delay:2s]" />
        <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-violet-300/20 dark:bg-violet-600/10 rounded-full blur-3xl animate-pulse [animation-delay:4s]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        {/* 页面头部 */}
        <div className="mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg shadow-purple-500/30">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent">
                  建模手工作台
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  思路构建 · 数学模型设计 · AI三轮辩论
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-3 py-1 text-sm shadow-md">
                <User className="w-3.5 h-3.5 mr-1.5" />
                张三 · 建模手
              </Badge>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                2024MCM-C
              </Badge>
            </div>
          </div>
        </div>

        {/* 题目信息 */}
        <Card className="mb-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-0 shadow-xl overflow-hidden">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200">
                  Climate Change&apos;s Impact on Fisheries
                </h2>
                <p className="text-xs text-muted-foreground">
                  研究气候变化对全球渔业资源的影响，建立预测模型评估未来50年不同排放情景下渔获量的变化趋势
                </p>
              </div>
              <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                <Zap className="w-3 h-3 mr-1" />
                思路研讨中
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* 主内容区 + AI侧栏 */}
        <div className="flex gap-6">
          {/* 左侧主内容 */}
          <div className="flex-1 min-w-0">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-1 h-auto">
                <TabsTrigger
                  value="round1"
                  className="flex items-center gap-2 px-5 py-2.5 data-active:bg-gradient-to-r data-active:from-purple-500 data-active:to-indigo-500 data-active:text-white rounded-lg"
                >
                  <MessageSquare className="w-4 h-4" />
                  第一轮 · 独立思考
                </TabsTrigger>
                <TabsTrigger
                  value="round2"
                  className="flex items-center gap-2 px-5 py-2.5 data-active:bg-gradient-to-r data-active:from-blue-500 data-active:to-indigo-500 data-active:text-white rounded-lg"
                >
                  <Sparkles className="w-4 h-4" />
                  第二轮 · 人机融合
                </TabsTrigger>
                <TabsTrigger
                  value="round3"
                  className="flex items-center gap-2 px-5 py-2.5 data-active:bg-gradient-to-r data-active:from-emerald-500 data-active:to-teal-500 data-active:text-white rounded-lg"
                >
                  <Trophy className="w-4 h-4" />
                  第三轮 · 同伴互评
                </TabsTrigger>
              </TabsList>

              <TabsContent value="round1">
                {renderRound1()}
              </TabsContent>

              <TabsContent value="round2">
                {renderRound2()}
              </TabsContent>

              <TabsContent value="round3">
                {renderRound3()}
              </TabsContent>
            </Tabs>
          </div>

          {/* 右侧AI侧栏 */}
          {renderAISidebar()}
        </div>
      </div>
    </div>
  )
}
