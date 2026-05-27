"use client"

import { useState } from "react"
import { Brain, Code, PenTool, ArrowRight, Zap, Clock } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"

/* ------------------------------------------------------------------ */
/*  工作台数据                                                           */
/* ------------------------------------------------------------------ */
const WORKSPACES = [
  {
    id: "modeler",
    title: "建模手工作台",
    icon: Brain,
    gradient: "from-blue-500 to-indigo-600",
    gradientBg: "from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40",
    gradientBorder: "border-blue-300/60 dark:border-blue-700/60",
    gradientHover: "hover:border-blue-400/80 dark:hover:border-blue-600/80",
    shadowColor: "shadow-blue-500/20",
    iconBg: "from-blue-500 to-indigo-600",
    status: "进行中 - 第二轮",
    statusType: "active" as const,
    description: "三轮AI辩论，独立思考 -> 人机融合 -> 同伴互评",
    progress: 65,
    href: "/modeler",
  },
  {
    id: "programmer",
    title: "编程手工作台",
    icon: Code,
    gradient: "from-purple-500 to-violet-600",
    gradientBg: "from-purple-50 to-violet-50 dark:from-purple-950/40 dark:to-violet-950/40",
    gradientBorder: "border-purple-300/60 dark:border-purple-700/60",
    gradientHover: "hover:border-purple-400/80 dark:hover:border-purple-600/80",
    shadowColor: "shadow-purple-500/20",
    iconBg: "from-purple-500 to-violet-600",
    status: "等待建模手方案",
    statusType: "waiting" as const,
    description: "IDE协作开发，AI辅助编程与代码审查",
    progress: 20,
    href: "/programmer",
  },
  {
    id: "writer",
    title: "论文手工作台",
    icon: PenTool,
    gradient: "from-orange-500 to-amber-600",
    gradientBg: "from-orange-50 to-amber-50 dark:from-orange-950/40 dark:to-amber-950/40",
    gradientBorder: "border-orange-300/60 dark:border-orange-700/60",
    gradientHover: "hover:border-orange-400/80 dark:hover:border-orange-600/80",
    shadowColor: "shadow-orange-500/20",
    iconBg: "from-orange-500 to-amber-600",
    status: "未开始",
    statusType: "pending" as const,
    description: "论文整合输出，AI润色与格式检查",
    progress: 0,
    href: "/writer",
  },
]

const statusConfig = {
  active: {
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
    dot: "bg-emerald-500",
    label: "进行中",
  },
  waiting: {
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
    dot: "bg-amber-500",
    label: "等待中",
  },
  pending: {
    badge: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
    dot: "bg-gray-400",
    label: "未开始",
  },
}

/* ------------------------------------------------------------------ */
/*  环形进度条组件                                                       */
/* ------------------------------------------------------------------ */
function CircularProgress({ value, size = 64, strokeWidth = 5, gradient }: {
  value: number
  size?: number
  strokeWidth?: number
  gradient: string
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-200 dark:text-gray-700"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#gradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000"
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={gradient.includes("blue") ? "#3B82F6" : gradient.includes("purple") ? "#A855F7" : "#F97316"} />
            <stop offset="100%" stopColor={gradient.includes("blue") ? "#6366F1" : gradient.includes("purple") ? "#7C3AED" : "#F59E0B"} />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{value}%</span>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  页面组件                                                            */
/* ------------------------------------------------------------------ */
export default function WorkflowPage() {
  const { showToast } = useToast()

  const overallProgress = 35

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-950 dark:to-indigo-950">
      {/* 背景装饰 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-80 h-80 bg-blue-300/30 dark:bg-blue-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-indigo-300/30 dark:bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/3 w-72 h-72 bg-violet-300/20 dark:bg-violet-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
        {/* 页面标题 */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl shadow-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                选择工作台
              </h1>
              <p className="text-sm text-muted-foreground">进入对应角色的专属工作台，开始协作</p>
            </div>
          </div>
        </div>

        {/* 三个工作台卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {WORKSPACES.map((ws) => {
            const IconComp = ws.icon
            const status = statusConfig[ws.statusType]

            return (
              <Card
                key={ws.id}
                className={cn(
                  "bg-gradient-to-br border-2 backdrop-blur-xl shadow-xl transition-all duration-300 hover:shadow-2xl cursor-pointer group",
                  ws.gradientBg,
                  ws.gradientBorder,
                  ws.gradientHover,
                  ws.shadowColor
                )}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <div className={cn(
                      "p-3 bg-gradient-to-br rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300",
                      ws.iconBg
                    )}>
                      <IconComp className="w-7 h-7 text-white" />
                    </div>
                    <CircularProgress value={ws.progress} gradient={ws.gradient} />
                  </div>
                  <CardTitle className="text-xl mb-1">{ws.title}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {ws.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* 状态指示 */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className={cn("w-2 h-2 rounded-full", status.dot, ws.statusType === "active" && "animate-pulse")} />
                    <Badge variant="secondary" className={cn("text-xs", status.badge)}>
                      {ws.status}
                    </Badge>
                  </div>

                  {/* 线性进度条 */}
                  <div className="mb-5">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                      <span>进度</span>
                      <span className="font-medium">{ws.progress}%</span>
                    </div>
                    <div className="h-2 bg-gray-200/80 dark:bg-gray-700/80 rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-1000", ws.gradient)}
                        style={{ width: `${ws.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* 进入按钮 */}
                  <a href={ws.href}>
                    <Button
                      className={cn(
                        "w-full bg-gradient-to-r hover:opacity-90 text-white shadow-lg gap-2 transition-all",
                        ws.gradient,
                        ws.shadowColor
                      )}
                      onClick={() => showToast(`正在进入${ws.title}...`, "info")}
                    >
                      进入工作台
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                    </Button>
                  </a>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* 整体进度 */}
        <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-0 shadow-xl overflow-hidden">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-lg font-semibold">整体进度</div>
                  <p className="text-sm text-muted-foreground">团队协作整体完成度</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-48">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                    <span>总进度</span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">{overallProgress}%</span>
                  </div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500 transition-all duration-1000"
                      style={{ width: `${overallProgress}%` }}
                    />
                  </div>
                </div>
                <CircularProgress value={overallProgress} size={56} strokeWidth={4} gradient="from-blue-500 to-indigo-600" />
              </div>
            </div>

            {/* 各工作台进度概览 */}
            <div className="mt-5 pt-5 border-t border-gray-200/60 dark:border-gray-700/60">
              <div className="grid grid-cols-3 gap-4">
                {WORKSPACES.map((ws) => {
                  const IconComp = ws.icon
                  return (
                    <div key={ws.id} className="flex items-center gap-3">
                      <div className={cn("p-1.5 bg-gradient-to-br rounded-lg", ws.iconBg)}>
                        <IconComp className="w-3.5 h-3.5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium truncate">{ws.title.replace("工作台", "")}</div>
                        <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-1">
                          <div
                            className={cn("h-full rounded-full bg-gradient-to-r", ws.gradient)}
                            style={{ width: `${ws.progress}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">{ws.progress}%</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
