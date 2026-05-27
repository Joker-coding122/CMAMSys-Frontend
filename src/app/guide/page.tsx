"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Brain,
  Users,
  Workflow,
  BookOpen,
  Award,
  FileText,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Bot,
  Code,
  PenTool,
  Database,
  Lightbulb,
  Rocket,
  Hash,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { readMMPLog, type MMPLogEntry } from "@/lib/mmp-logger";

interface GuideStep {
  id: number;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  gradient: string;
  features: {
    icon: React.ReactNode;
    title: string;
    description: string;
  }[];
  ctaHref: string;
  ctaLabel: string;
}

const guideSteps: GuideStep[] = [
  {
    id: 1,
    title: "认识 CMAMSys",
    subtitle: "AI驱动的数学建模全流程协作系统",
    icon: <Sparkles className="size-6" />,
    gradient: "from-indigo-500 to-purple-600",
    ctaHref: "/team",
    ctaLabel: "开始组建团队",
    features: [
      {
        icon: <Brain className="size-5" />,
        title: "三层机制",
        description: "建模手、编程手、论文手三层分工协作，各司其职，高效运转",
      },
      {
        icon: <Bot className="size-5" />,
        title: "AI协作",
        description: "集成多个AI模型，通过三轮辩论机制选出最优建模方案",
      },
      {
        icon: <Database className="size-5" />,
        title: "知识沉淀",
        description: "自动沉淀建模经验与知识，形成可复用的团队知识库",
      },
    ],
  },
  {
    id: 2,
    title: "组建你的团队",
    subtitle: "快速创建团队，智能推荐分工",
    icon: <Users className="size-6" />,
    gradient: "from-cyan-500 to-blue-600",
    ctaHref: "/team",
    ctaLabel: "去团队页面",
    features: [
      {
        icon: <Users className="size-5" />,
        title: "创建团队",
        description: "一键创建建模团队，设置团队名称和目标竞赛",
      },
      {
        icon: <Lightbulb className="size-5" />,
        title: "邀请成员",
        description: "通过链接或用户名邀请队友加入团队",
      },
      {
        icon: <Award className="size-5" />,
        title: "AI推荐分工",
        description: "AI根据成员能力Card智能推荐建模手、编程手、论文手角色",
      },
    ],
  },
  {
    id: 3,
    title: "协作建模流程",
    subtitle: "从思路研讨到代码实现的完整工作流",
    icon: <Workflow className="size-6" />,
    gradient: "from-purple-500 to-violet-600",
    ctaHref: "/modeler",
    ctaLabel: "进入建模手工作台",
    features: [
      {
        icon: <Brain className="size-5" />,
        title: "建模手三轮辩论",
        description: "AI模型独立思考 -> 人机融合 -> 同伴互评，选出最优方案",
      },
      {
        icon: <Code className="size-5" />,
        title: "编程手IDE协作",
        description: "在线IDE环境，AI辅助编程，实时调试模型参数",
      },
      {
        icon: <PenTool className="size-5" />,
        title: "论文手整合输出",
        description: "自动整合建模过程与结果，生成结构化论文初稿",
      },
    ],
  },
  {
    id: 4,
    title: "知识管理与成果",
    subtitle: "知识库、MMP文件、能力Card全记录",
    icon: <BookOpen className="size-6" />,
    gradient: "from-emerald-500 to-teal-600",
    ctaHref: "/mmp",
    ctaLabel: "查看 MMP 操作流",
    features: [
      {
        icon: <BookOpen className="size-5" />,
        title: "知识库",
        description: "论文、代码、模型等知识资产的统一管理与检索",
      },
      {
        icon: <FileText className="size-5" />,
        title: "MMP文件",
        description: "完整记录数学建模全流程，支持回溯与复盘",
      },
      {
        icon: <Award className="size-5" />,
        title: "能力Card",
        description: "量化评估成员建模能力，区块链存证确保可信",
      },
    ],
  },
];

export default function GuidePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const step = guideSteps[currentStep];
  const progress = ((currentStep + 1) / guideSteps.length) * 100;

  const handleNext = () => {
    if (currentStep < guideSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    router.push("/");
  };

  const handleStart = () => {
    router.push("/team");
  };

  return (
    <div className="min-h-full gradient-bg-mesh">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 顶部进度条 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-foreground">新手引导</h1>
            <span className="text-sm text-muted-foreground">
              {currentStep + 1} / {guideSteps.length}
            </span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full bg-gradient-to-r transition-all duration-500 ease-out",
                step.gradient
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
          {/* 步骤指示器 */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {guideSteps.map((s, index) => (
              <button
                key={s.id}
                onClick={() => setCurrentStep(index)}
                className={cn(
                  "flex items-center justify-center rounded-full transition-all duration-300",
                  index === currentStep
                    ? "w-8 h-8 bg-gradient-to-br text-white shadow-lg " + s.gradient
                    : index < currentStep
                    ? "w-8 h-8 bg-emerald-500 text-white"
                    : "w-8 h-8 bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {index < currentStep ? (
                  <CheckCircle2 className="size-4" />
                ) : (
                  <span className="text-xs font-medium">{s.id}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 步骤内容 */}
        <div className="animate-fade-in-up" key={step.id}>
          {/* 标题区域 */}
          <div className="text-center mb-8">
            <div
              className={cn(
                "inline-flex items-center justify-center size-16 rounded-2xl bg-gradient-to-br text-white shadow-xl mb-4",
                step.gradient
              )}
            >
              {step.icon}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              {step.title}
            </h2>
            <p className="text-muted-foreground">{step.subtitle}</p>
          </div>

          {/* 交互式预览区 */}
          <div className="mb-8">
            <div className="relative rounded-2xl overflow-hidden h-56 sm:h-72 glass-card-strong border border-border/40 shadow-lg">
              {/* 顶部 mac 风格小圆点 + CTA */}
              <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-400/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
                </div>
                <button
                  onClick={() => router.push(step.ctaHref)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white shadow-md hover:opacity-90 transition-opacity bg-gradient-to-r animate-cta-pulse",
                    step.gradient
                  )}
                >
                  {step.ctaLabel}
                  <ArrowRight className="size-3" />
                </button>
              </div>

              {/* 按 step 渲染不同交互 */}
              <div className="absolute inset-0 pt-12 pb-3 px-4">
                {currentStep === 0 && <Step1AIDebatePreview />}
                {currentStep === 1 && <Step2AbilityRadarPreview />}
                {currentStep === 2 && <Step3TriHandFlowPreview onPickRole={(href) => router.push(href)} />}
                {currentStep === 3 && <Step4PreviewMMPFeed />}
              </div>
            </div>
          </div>

          {/* 功能列表 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {step.features.map((feature, index) => (
              <div
                key={index}
                className={cn(
                  "glass-card-strong rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
                  "animate-fade-in-up"
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div
                  className={cn(
                    "flex size-10 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg mb-3",
                    step.gradient
                  )}
                >
                  {feature.icon}
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1.5">
                  {feature.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 底部操作按钮 */}
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <div>
            {currentStep > 0 ? (
              <Button
                variant="outline"
                onClick={handlePrev}
                className="gap-1.5"
              >
                <ArrowLeft className="size-4" />
                上一步
              </Button>
            ) : (
              <Button variant="ghost" onClick={handleSkip} className="text-muted-foreground">
                跳过引导
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {currentStep < guideSteps.length - 1 ? (
              <Button onClick={handleNext} className="gap-1.5 gradient-bg text-white hover:opacity-90 shadow-lg shadow-indigo-500/25">
                下一步
                <ArrowRight className="size-4" />
              </Button>
            ) : (
              <Button
                onClick={handleStart}
                className="gap-1.5 gradient-bg text-white hover:opacity-90 shadow-lg shadow-indigo-500/25"
              >
                <Rocket className="size-4" />
                开始使用
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ====================================================
   Step1: AI 协作辩论流
   ==================================================== */
function Step1AIDebatePreview() {
  const debateRounds = [
    {
      label: "Round 1",
      title: "独立思考",
      decision: "候选方案已生成，进入人机融合",
      messages: [
        { model: "GPT-4", icon: <Bot className="size-4" />, color: "from-emerald-500 to-teal-500", accent: "border-l-emerald-400", text: "建议使用 SEIR 经典模型 + Logistic 调整因子。" },
        { model: "Claude", icon: <Brain className="size-4" />, color: "from-cyan-500 to-blue-500", accent: "border-l-cyan-400", text: "推荐 SEIR-CA 混合模型，引入空间扩散。" },
        { model: "Gemini", icon: <Sparkles className="size-4" />, color: "from-purple-500 to-violet-500", accent: "border-l-purple-400", text: "可以试试图神经网络捕获区域耦合。" },
      ],
    },
    {
      label: "Round 2",
      title: "人机融合",
      decision: "融合版本稳定，进入同伴互评",
      messages: [
        { model: "GPT-4", icon: <Bot className="size-4" />, color: "from-emerald-500 to-teal-500", accent: "border-l-emerald-400", text: "结合空间扩散，调整传染率参数 β=0.34。" },
        { model: "Claude", icon: <Brain className="size-4" />, color: "from-cyan-500 to-blue-500", accent: "border-l-cyan-400", text: "保留 CA 网格，加入气候扰动项。" },
        { model: "Gemini", icon: <Sparkles className="size-4" />, color: "from-purple-500 to-violet-500", accent: "border-l-purple-400", text: "建议网格分辨率提升至 1km × 1km。" },
      ],
    },
    {
      label: "Round 3",
      title: "同伴互评",
      decision: "最优方案：SEIR-CA 混合模型 · R²=0.953",
      messages: [
        { model: "GPT-4", icon: <Bot className="size-4" />, color: "from-emerald-500 to-teal-500", accent: "border-l-emerald-400", text: "+1 Claude 方案，理论扎实。" },
        { model: "Claude", icon: <Brain className="size-4" />, color: "from-cyan-500 to-blue-500", accent: "border-l-cyan-400", text: "投 Gemini，分辨率确实关键。" },
        { model: "Gemini", icon: <Sparkles className="size-4" />, color: "from-purple-500 to-violet-500", accent: "border-l-purple-400", text: "✓ 同意 Claude，融合后 R²=0.953。" },
      ],
    },
  ];
  const [roundIndex, setRoundIndex] = useState(0);
  const [activeLine, setActiveLine] = useState(0);
  const [typed, setTyped] = useState("");
  const [completed, setCompleted] = useState<string[]>([]);
  const [showDecision, setShowDecision] = useState(false);
  const round = debateRounds[roundIndex];

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const currentRound = debateRounds[roundIndex];
    timers.push(setTimeout(() => {
      setActiveLine(0);
      setTyped("");
      setCompleted([]);
      setShowDecision(false);
    }, 0));

    let delay = 220;
    currentRound.messages.forEach((message, messageIndex) => {
      timers.push(setTimeout(() => setActiveLine(messageIndex), delay));
      for (let cursor = 1; cursor <= message.text.length; cursor += 1) {
        timers.push(setTimeout(() => setTyped(message.text.slice(0, cursor)), delay + cursor * 22));
      }
      delay += message.text.length * 22 + 420;
      timers.push(setTimeout(() => {
        setCompleted((prev) => [...prev, message.text]);
        setTyped("");
      }, delay));
    });
    timers.push(setTimeout(() => setShowDecision(true), delay + 260));
    timers.push(setTimeout(() => setRoundIndex((idx) => (idx + 1) % debateRounds.length), delay + 2200));

    return () => timers.forEach((timer) => clearTimeout(timer));
  }, [roundIndex]);

  return (
    <div className="h-full flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 rounded-lg bg-indigo-100 text-indigo-700 text-[10px] font-bold">
            {round.label}
          </span>
          <span className="text-xs font-semibold text-foreground">{round.title}</span>
        </div>
        <span className="text-[10px] text-muted-foreground">三 AI 协同推理中</span>
      </div>

      <div className="flex-1 grid grid-rows-3 gap-1.5">
        {round.messages.map((message, index) => {
          const content = completed[index] ?? (activeLine === index ? typed : "");
          const visible = index <= activeLine || Boolean(completed[index]);
          return (
            <div
              key={`${round.label}-${message.model}`}
              className={cn(
                "flex items-start gap-2 rounded-lg border-l-4 bg-white/85 backdrop-blur border-y border-r border-border/40 px-2.5 py-1.5 shadow-sm transition-all",
                message.accent,
                visible ? "opacity-100 translate-y-0" : "opacity-25 translate-y-1"
              )}
            >
              <div className={cn("size-7 rounded-lg bg-gradient-to-br flex items-center justify-center text-white shrink-0", message.color)}>
                {message.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-foreground">{message.model}</span>
                  {activeLine === index && !completed[index] && (
                    <span className="text-[10px] text-indigo-500">typing...</span>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug truncate">
                  {content}
                  {activeLine === index && !completed[index] && <span className="animate-pulse">▍</span>}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className={cn(
        "h-7 flex items-center justify-center gap-1.5 rounded-lg text-[11px] font-semibold transition-all",
        showDecision ? "bg-emerald-100 text-emerald-700 animate-feed-pop" : "bg-muted/60 text-muted-foreground"
      )}>
        <CheckCircle2 className="size-3.5" />
        {showDecision ? round.decision : "等待三轮辩论结果..."}
      </div>
    </div>
  );
}

/* ====================================================
   Step2: 能力雷达图 + AI 智能分工
   ==================================================== */
function Step2AbilityRadarPreview() {
  const members = [
    { name: "张三", role: "建模手", color: "#10b981", ring: "ring-emerald-400", badge: "bg-emerald-100 text-emerald-700", values: [90, 60, 70, 95] },
    { name: "李四", role: "编程手", color: "#06b6d4", ring: "ring-cyan-400", badge: "bg-cyan-100 text-cyan-700", values: [65, 92, 50, 75] },
    { name: "王五", role: "论文手", color: "#f59e0b", ring: "ring-amber-400", badge: "bg-amber-100 text-amber-700", values: [55, 50, 90, 65] },
    { name: "赵六", role: "候补", color: "#64748b", ring: "ring-slate-400", badge: "bg-slate-100 text-slate-700", values: [70, 70, 70, 70] },
  ];
  const [assigned, setAssigned] = useState(false);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    const assignTimer = setTimeout(() => setAssigned(true), 700);
    const loopTimer = setInterval(() => {
      setAssigned(false);
      setCycle((value) => value + 1);
      setTimeout(() => setAssigned(true), 700);
    }, 5600);
    return () => {
      clearTimeout(assignTimer);
      clearInterval(loopTimer);
    };
  }, []);

  return (
    <div className="h-full flex flex-col gap-2" key={cycle}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-cyan-500 animate-pulse" />
          <span className="text-[11px] font-semibold text-foreground">AI 智能分工引擎</span>
        </div>
        <span className="text-[10px] text-muted-foreground">
          {assigned ? "匹配完成" : "分析中..."}
        </span>
      </div>

      <div className="flex-1 grid grid-cols-4 gap-2">
        {members.map((member, index) => (
          <div
            key={member.name}
            className={cn(
              "rounded-lg bg-white/85 backdrop-blur border border-border/40 px-2 py-2 shadow-sm transition-all duration-500",
              assigned && `ring-2 ${member.ring} -translate-y-0.5`
            )}
            style={{ transitionDelay: `${index * 120}ms` }}
          >
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="text-[11px] font-semibold text-foreground">{member.name}</span>
              <span className={cn(
                "px-1.5 py-0.5 rounded text-[9px] font-semibold transition-opacity",
                member.badge,
                assigned ? "opacity-100" : "opacity-0"
              )}>
                {member.role}
              </span>
            </div>
            <AbilityRadar values={member.values} color={assigned ? member.color : "#94a3b8"} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-2">
        {members.map((member) => (
          <div key={`${member.name}-score`} className="rounded-md bg-muted/60 px-2 py-1">
            <div className="flex items-center justify-between text-[9px] text-muted-foreground">
              <span>建模</span><span>{member.values[0]}</span>
            </div>
            <div className="flex items-center justify-between text-[9px] text-muted-foreground">
              <span>编程</span><span>{member.values[1]}</span>
            </div>
            <div className="flex items-center justify-between text-[9px] text-muted-foreground">
              <span>写作</span><span>{member.values[2]}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AbilityRadar({ values, color }: { values: number[]; color: string }) {
  const center = 50;
  const radius = 34;
  const angles = [-90, 0, 90, 180];
  const toPoint = (value: number, angle: number) => {
    const rad = (Math.PI / 180) * angle;
    const r = radius * (value / 100);
    return `${center + Math.cos(rad) * r},${center + Math.sin(rad) * r}`;
  };
  const outer = angles.map((angle) => toPoint(100, angle)).join(" ");
  const inner = values.map((value, index) => toPoint(value, angles[index])).join(" ");

  return (
    <svg viewBox="0 0 100 100" className="w-full h-16">
      <polygon points={outer} fill="none" stroke="#cbd5e1" strokeWidth="1" />
      <line x1="50" y1="16" x2="50" y2="84" stroke="#e2e8f0" strokeWidth="0.8" />
      <line x1="16" y1="50" x2="84" y2="50" stroke="#e2e8f0" strokeWidth="0.8" />
      <polygon points={inner} fill={color} fillOpacity="0.28" stroke={color} strokeWidth="2" />
      <circle cx="50" cy="16" r="1.8" fill={color} />
      <circle cx="84" cy="50" r="1.8" fill={color} />
      <circle cx="50" cy="84" r="1.8" fill={color} />
      <circle cx="16" cy="50" r="1.8" fill={color} />
      <text x="50" y="9" textAnchor="middle" fontSize="7" fill="#64748b">模</text>
      <text x="94" y="52" textAnchor="middle" fontSize="7" fill="#64748b">编</text>
      <text x="50" y="98" textAnchor="middle" fontSize="7" fill="#64748b">写</text>
      <text x="6" y="52" textAnchor="middle" fontSize="7" fill="#64748b">数</text>
    </svg>
  );
}

/* ====================================================
   Step3: 三层机制流动架构图
   ==================================================== */
function Step3TriHandFlowPreview({ onPickRole }: { onPickRole: (href: string) => void }) {
  const [hovered, setHovered] = useState<string | null>(null);

  const roles = [
    {
      key: "modeler",
      label: "建模手",
      icon: <Brain className="size-5" />,
      gradient: "from-emerald-500 to-teal-500",
      ring: "ring-emerald-400",
      duty: "三轮辩论 · 选最优方案",
      href: "/modeler",
    },
    {
      key: "coder",
      label: "编程手",
      icon: <Code className="size-5" />,
      gradient: "from-cyan-500 to-blue-500",
      ring: "ring-cyan-400",
      duty: "在线 IDE · AI 辅助调参",
      href: "/programmer",
    },
    {
      key: "writer",
      label: "论文手",
      icon: <PenTool className="size-5" />,
      gradient: "from-amber-500 to-orange-500",
      ring: "ring-amber-400",
      duty: "结构化整合 · 一键成稿",
      href: "/writer",
    },
  ];

  return (
    <div className="relative h-full flex flex-col">
      {/* 三栏角色卡 */}
      <div className="flex-1 flex items-center">
        <div className="relative w-full grid grid-cols-3 gap-2 sm:gap-4 px-2">
          {roles.map((r) => (
            <button
              key={r.key}
              onClick={() => onPickRole(r.href)}
              onMouseEnter={() => setHovered(r.key)}
              onMouseLeave={() => setHovered(null)}
              className={cn(
                "relative z-10 flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl bg-white/90 backdrop-blur shadow-md transition-all hover:-translate-y-1 hover:shadow-xl",
                hovered === r.key ? `ring-2 ${r.ring}` : "ring-1 ring-border/40"
              )}
            >
              <div
                className={cn(
                  "size-9 rounded-lg flex items-center justify-center text-white shadow-md bg-gradient-to-br",
                  r.gradient
                )}
              >
                {r.icon}
              </div>
              <div className="text-xs font-semibold text-foreground">{r.label}</div>
              <div className="text-[10px] text-muted-foreground text-center leading-tight line-clamp-2">
                {r.duty}
              </div>
              {/* 悬停浮出小箭头 */}
              <div
                className={cn(
                  "absolute -bottom-1 right-1 text-[10px] text-muted-foreground transition-opacity",
                  hovered === r.key ? "opacity-100" : "opacity-0"
                )}
              >
                <ExternalLink className="size-3" />
              </div>
            </button>
          ))}

          {/* SVG 连线 + 流动 token */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            preserveAspectRatio="none"
            viewBox="0 0 100 100"
            aria-hidden
          >
            <defs>
              <linearGradient id="flow-grad-1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.7" />
              </linearGradient>
              <linearGradient id="flow-grad-2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.7" />
              </linearGradient>
            </defs>
            <line x1="33" y1="50" x2="40" y2="50" stroke="url(#flow-grad-1)" strokeWidth="0.6" strokeDasharray="2 1" />
            <line x1="60" y1="50" x2="67" y2="50" stroke="url(#flow-grad-2)" strokeWidth="0.6" strokeDasharray="2 1" />
          </svg>

          {/* 流动 token 粒子（CSS 实现） */}
          <FlowTokens />
        </div>
      </div>

      {/* 底部说明 */}
      <div className="text-center text-[11px] text-muted-foreground pb-1">
        <span className="font-medium text-foreground/80">完整作品</span> = 三手协作 + AI 辅助 + MMP 全流程留痕
      </div>
    </div>
  );
}

function FlowTokens() {
  return (
    <>
      {/* 第一段连线（建模 → 编程） */}
      <div className="absolute left-[34%] top-1/2 -translate-y-1/2 w-[6%] pointer-events-none">
        {[0, 0.6, 1.2].map((delay, i) => (
          <div
            key={`a-${i}`}
            className="absolute size-1.5 rounded-full bg-emerald-400 animate-flow-token"
            style={{
              ["--flow-distance" as string]: "100%",
              animationDelay: `${delay}s`,
              top: "-3px",
            }}
          />
        ))}
      </div>
      {/* 第二段连线（编程 → 论文） */}
      <div className="absolute left-[60%] top-1/2 -translate-y-1/2 w-[6%] pointer-events-none">
        {[0.3, 0.9, 1.5].map((delay, i) => (
          <div
            key={`b-${i}`}
            className="absolute size-1.5 rounded-full bg-amber-400 animate-flow-token"
            style={{
              ["--flow-distance" as string]: "100%",
              animationDelay: `${delay}s`,
              top: "-3px",
            }}
          />
        ))}
      </div>
    </>
  );
}

/* ====================================================
   Step4: mini MMP 日志流
   ==================================================== */
function Step4PreviewMMPFeed() {
  const [feed, setFeed] = useState<MMPLogEntry[]>([]);
  const [tickKey, setTickKey] = useState(0);
  const cursorRef = useRef(0);

  // 加载真实日志，没有则用 demo 数据
  useEffect(() => {
    const timer = setTimeout(() => {
      const real = readMMPLog();
      if (real.length > 0) {
        setFeed(real.slice(-5).reverse());
      } else {
        const now = Date.now();
        // 演示数据（用于无日志情况下也有动效）
        const demo: MMPLogEntry[] = Array.from({ length: 4 }).map((_, i) => ({
          id: `demo-${i}`,
          timestamp: now - (i + 1) * 60000,
          isoTime: new Date(now - (i + 1) * 60000).toLocaleTimeString("zh-CN"),
          role: (["modeler", "coder", "writer"] as const)[i % 3],
          roleName: ["建模手", "编程手", "论文手"][i % 3],
          action: "edit",
          actionLabel: ["提交方案", "运行代码", "插入素材", "保存草稿"][i % 4],
          description: ["提交融合后的建模方案", "运行求解脚本", "引用文献到论文", "自动保存"][i % 4],
          hash: `0x${"abcdef0123456789".repeat(4).slice(0, 64)}`,
          hashShort: `0x${"abcdef01".slice(0, 8)}`,
          blockNumber: 18234567 + i,
          gasUsed: 21000 + i * 500,
          txHash: `0x${"f".repeat(64)}`,
        }));
        setFeed(demo);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // 每 1.8s 滚动一次（模拟新事件冒头）
  useEffect(() => {
    const t = setInterval(() => {
      cursorRef.current += 1;
      setTickKey((k) => k + 1);
    }, 1800);
    return () => clearInterval(t);
  }, []);

  const visible = feed.length > 0 ? feed.slice(0, 4) : [];
  const ROLE_COLORS: Record<string, string> = {
    modeler: "bg-emerald-100 text-emerald-700",
    coder: "bg-cyan-100 text-cyan-700",
    writer: "bg-amber-100 text-amber-700",
    system: "bg-slate-100 text-slate-700",
    leader: "bg-purple-100 text-purple-700",
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
          实时操作流
        </div>
        <span className="text-[10px] text-muted-foreground">最近 {visible.length} 条</span>
      </div>
      <div className="flex-1 space-y-1.5 overflow-hidden">
        {visible.map((entry, i) => (
          <div
            key={`${entry.id}-${tickKey}-${i}`}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-white/80 backdrop-blur border border-border/40 shadow-sm animate-feed-pop"
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            <span
              className={cn(
                "px-1.5 py-0.5 rounded text-[10px] font-semibold shrink-0",
                ROLE_COLORS[entry.role] || ROLE_COLORS.system
              )}
            >
              {entry.roleName}
            </span>
            <span className="text-[11px] text-foreground font-medium shrink-0">{entry.actionLabel}</span>
            <span className="text-[10px] text-muted-foreground truncate flex-1">{entry.description}</span>
            <span className="hidden sm:inline-flex items-center gap-0.5 text-[10px] text-muted-foreground font-mono shrink-0">
              <Hash className="size-2.5" />
              {entry.hashShort}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
