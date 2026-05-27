"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  FileText,
  Heart,
  User,
  Brain,
  Clock,
  HardDrive,
  FolderOpen,
  Folder,
  File,
  FileCode,
  ChevronRight,
  ChevronDown,
  MessageSquare,
  Star,
  Zap,
  Layers,
  GitBranch,
  Settings,
  Shield,
  Sparkles,
  Activity,
  Calendar,
  Bot,
  CircleDot,
} from "lucide-react";

const coreFiles = [
  {
    name: "AGENTS.md",
    icon: Shield,
    label: "工作守则",
    description: "定义Agent行为规范与工作准则",
    gradient: "from-blue-500 to-cyan-400",
    preview: "# Agent 工作守则\n\n## 核心原则\n1. 始终以用户需求为导向\n2. 保持专业、严谨的工作态度\n3. 主动发现问题并提出解决方案\n4. 遵循学术诚信原则\n\n## 行为规范\n- 禁止替用户完成核心建模工作\n- 提供思路引导而非直接答案\n- 所有建议需有理论依据\n- 及时反馈进度和风险",
    fullContent: `# Agent 工作守则 v2.1

## 一、核心原则
1. 始终以用户需求为导向，理解用户真实意图
2. 保持专业、严谨的工作态度
3. 主动发现问题并提出解决方案
4. 遵循学术诚信原则，绝不鼓励抄袭

## 二、行为规范
### 2.1 交互规范
- 使用清晰、专业的语言
- 回答要有理有据，引用文献时标注来源
- 不确定的内容要明确说明
- 避免使用过于绝对的表达

### 2.2 建模规范
- 禁止替用户完成核心建模工作
- 提供思路引导而非直接答案
- 所有建议需有理论依据
- 模型选择要考虑可解释性

### 2.3 代码规范
- 代码需有完整注释
- 变量命名遵循PEP8规范
- 关键步骤需有中间结果验证
- 提供完整的依赖说明

## 三、工作流程
1. 需求分析 → 2. 方案设计 → 3. 模型构建 → 4. 代码实现 → 5. 结果验证 → 6. 论文撰写

## 四、禁止事项
- 禁止直接提供竞赛答案
- 禁止生成虚假数据
- 禁止绕过系统安全机制
- 禁止泄露其他用户信息`,
  },
  {
    name: "SOUL.md",
    icon: Heart,
    label: "性格与边界",
    description: "定义Agent的性格特征与能力边界",
    gradient: "from-pink-500 to-rose-400",
    preview: "# Agent 性格与边界\n\n## 性格特征\n- 严谨但不刻板\n- 热情但不越界\n- 专业但不冷漠\n\n## 能力边界\n- 数学建模：精通\n- 编程实现：熟练\n- 论文写作：辅助",
    fullContent: `# Agent 性格与边界 v1.5

## 一、性格特征
### 核心性格
- 严谨但不刻板：追求精确，但理解实际约束
- 热情但不越界：乐于助人，但尊重用户自主权
- 专业但不冷漠：技术过硬，但保持亲和力
- 创新但务实：鼓励创新，但注重可落地性

### 沟通风格
- 使用鼓励性语言，增强用户信心
- 适当使用比喻帮助理解复杂概念
- 在指出问题时提供改进建议
- 保持耐心，允许用户反复提问

## 二、能力边界
### 精通领域
- 数学建模方法论
- 常用模型（优化、预测、评价、仿真）
- 统计分析方法
- LaTeX排版

### 熟练领域
- Python/MATLAB编程
- 数据可视化
- 论文结构设计
- 算法实现

### 辅助领域
- 英文翻译与润色
- 参考文献管理
- 团队协作建议

### 禁止领域
- 直接生成完整论文
- 提供虚假实验数据
- 替代用户做决策
- 绕过学术诚信检查`,
  },
  {
    name: "USER.md",
    icon: User,
    label: "用户信息",
    description: "存储用户个人信息与偏好设置",
    gradient: "from-purple-500 to-violet-400",
    preview: "# 用户信息\n\n## 基本信息\n- 用户名：张明远\n- 学校：清华大学\n- 年级：大三\n- 专业：数学与应用数学\n\n## 竞赛经历\n- 2024 MCM A题 Outstanding Winner",
    fullContent: `# 用户信息

## 一、基本信息
- 用户名：张明远
- 学校：清华大学
- 年级：大三
- 专业：数学与应用数学
- 编程语言：Python, MATLAB, R
- 兴趣方向：运筹优化、机器学习

## 二、竞赛经历
| 时间 | 竞赛 | 题目 | 奖项 | 角色 |
|------|------|------|------|------|
| 2024.02 | MCM | A题 | Outstanding Winner | 建模手 |
| 2023.09 | CUMCM | A题 | 国家一等奖 | 建模手 |
| 2023.05 | 校赛 | B题 | 一等奖 | 编程手 |

## 三、能力评估
- 数学建模：★★★★★
- 编程能力：★★★★☆
- 论文写作：★★★★☆
- 团队协作：★★★★★
- 英语水平：CET-6 580

## 四、偏好设置
- 偏好语言：中文
- 代码风格：Python优先
- 回复详细程度：详细
- 是否接受英文资料：是`,
  },
];

/* ============================================================
   短期记忆 - 对话池
   ============================================================ */
const chatPool = [
  { sender: "张三", content: "这个SEIR模型的参数需要调整", isAI: false },
  { sender: "AI", content: "建议将β值从0.3调整为0.25，可以提高拟合度", isAI: true },
  { sender: "李四", content: "代码已经提交，运行结果R²=0.947", isAI: false },
  { sender: "王五", content: "论文第五章初稿完成，请审核", isAI: false },
  { sender: "AI", content: "检测到模型收敛，建议进行敏感性分析", isAI: true },
  { sender: "张三", content: "好的，我来做敏感性分析", isAI: false },
  { sender: "李四", content: "可视化图表已生成，保存在./output/目录", isAI: false },
  { sender: "AI", content: "知识库已自动更新，新增3条相关文献", isAI: true },
  { sender: "王五", content: "参考文献格式已统一为GB/T 7714", isAI: false },
  { sender: "赵六", content: "数据清洗完成，共处理12,847条记录", isAI: false },
  { sender: "AI", content: "团队协作指数上升至87分", isAI: true },
  { sender: "张三", content: "模型验证通过，准备提交最终方案", isAI: false },
  { sender: "李四", content: "代码审查完成，发现2处优化点", isAI: false },
  { sender: "AI", content: "MMP文件已自动更新第4章代码记录", isAI: true },
  { sender: "王五", content: "论文摘要已精简至280字", isAI: false },
  { sender: "AI", content: "距离竞赛截止还有23小时45分钟", isAI: true },
];

/* ============================================================
   长期记忆 - MEMORY.md 内容
   ============================================================ */
const memoryMdContent = `# MEMORY.md - 团队长期记忆

## 模型知识
- SEIR-CA混合模型适用于空间传播建模
- 参数拟合推荐使用贝叶斯推断方法
- 网格搜索比随机搜索效率高3.2倍

## 团队偏好
- 张三擅长微分方程和优化算法
- 李四熟练使用Python和MATLAB
- 王五论文写作风格严谨，注重逻辑性

## 竞赛经验
- 2024 MCM-C: SEIR-CA渔业模型, R²=0.947
- 2023 CUMCM-A: 交通优化, 国家一等奖`;

/* ============================================================
   临时记忆 - 按小时分组的折叠列表
   ============================================================ */
interface TempMemory {
  time: string;
  text: string;
}

interface TempMemoryGroup {
  label: string;
  memories: TempMemory[];
}

const initialTempGroups: TempMemoryGroup[] = [
  {
    label: "14:00 - 15:00",
    memories: [
      { time: "14:23", text: "张三提交了模型参数调整方案" },
      { time: "14:35", text: "AI完成了参数敏感性分析" },
      { time: "14:42", text: "李四更新了可视化代码" },
      { time: "14:58", text: "王五修改了论文摘要" },
    ],
  },
  {
    label: "13:00 - 14:00",
    memories: [
      { time: "13:05", text: "团队开始第二轮AI辩论" },
      { time: "13:22", text: "AI推荐了3篇相关论文" },
      { time: "13:45", text: "赵六完成了数据预处理" },
    ],
  },
  {
    label: "12:00 - 13:00",
    memories: [
      { time: "12:10", text: "团队午餐休息" },
      { time: "12:45", text: "张三开始了模型验证" },
    ],
  },
  {
    label: "11:00 - 12:00",
    memories: [
      { time: "11:00", text: "团队组建完成" },
      { time: "11:15", text: "AI完成了团队分工推荐" },
      { time: "11:30", text: "开始第一轮独立思考" },
    ],
  },
];

const extraMemoryPool = [
  "[15:02] AI检测到新的优化机会",
  "[15:05] 张三更新了模型假设",
  "[15:08] 李四提交了代码审查报告",
  "[15:12] 王五完成了参考文献整理",
  "[15:15] AI更新了知识库索引",
];

/* ============================================================
   文件树
   ============================================================ */
interface FileTreeNodeType {
  name: string;
  type: string;
  icon?: React.ElementType;
  children?: FileTreeNodeType[];
}

const fileTree: FileTreeNodeType = {
  name: "workspace",
  type: "folder",
  children: [
    { name: "AGENTS.md", type: "file", icon: FileText },
    { name: "SOUL.md", type: "file", icon: Heart },
    { name: "USER.md", type: "file", icon: User },
    { name: "MEMORY.md", type: "file", icon: Brain },
    {
      name: "memory",
      type: "folder",
      children: [
        { name: "2024-01-15-09.md", type: "file" },
        { name: "2024-01-15-10.md", type: "file" },
        { name: "2024-01-15-14.md", type: "file" },
      ],
    },
    {
      name: "projects",
      type: "folder",
      children: [
        { name: "2024MCM-C", type: "folder", children: [{ name: "model.py", type: "file" }, { name: "data.csv", type: "file" }] },
        { name: "2023CUMCM-A", type: "folder", children: [{ name: "main.m", type: "file" }, { name: "figures/", type: "folder" }] },
      ],
    },
    {
      name: "models",
      type: "folder",
      children: [
        { name: "seir_model.py", type: "file" },
        { name: "ga_optimizer.py", type: "file" },
      ],
    },
  ],
};

function FileTreeNode({ node, depth = 0, onFileClick }: { node: FileTreeNodeType; depth?: number; onFileClick?: (name: string) => void }) {
  const [expanded, setExpanded] = useState(depth < 2);
  const isFolder = node.type === "folder";

  return (
    <div>
      <div
        className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-white/60 cursor-pointer transition-colors group"
        style={{ paddingLeft: `${depth * 20 + 8}px` }}
        onClick={() => {
          if (isFolder) {
            setExpanded(!expanded);
          } else {
            onFileClick?.(node.name);
          }
        }}
      >
        {isFolder ? (
          <>
            <ChevronRight
              className={`w-4 h-4 text-muted-foreground transition-transform ${expanded ? "rotate-90" : ""}`}
            />
            <Folder className="w-4 h-4 text-amber-500" />
          </>
        ) : (
          <>
            <span className="w-4" />
            <File className="w-4 h-4 text-blue-400" />
          </>
        )}
        <span className="text-sm font-medium">{node.name}</span>
        {isFolder && node.children && (
          <span className="text-xs text-muted-foreground ml-auto">{node.children.length} 项</span>
        )}
      </div>
      {isFolder && expanded && node.children && (
        <div>
          {node.children.map((child, index) => (
            <FileTreeNode key={index} node={child} depth={depth + 1} onFileClick={onFileClick} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   主页面组件
   ============================================================ */
export default function WorkspacePage() {
  const { showToast } = useToast();
  const [memoryDialog, setMemoryDialog] = useState<{
    name: string;
    time: string;
    entries: number;
  } | null>(null);
  const [coreFileDialog, setCoreFileDialog] = useState<string | null>(null);
  const selectedCoreFile = coreFiles.find((f) => f.name === coreFileDialog) ?? null;

  /* ---------- 短期记忆状态 ---------- */
  const [messages, setMessages] = useState<Array<{ sender: string; content: string; isAI: boolean }>>(() =>
    chatPool.slice(0, 3)
  );
  const [chatIndex, setChatIndex] = useState(3);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setChatIndex((prev) => {
        const nextMsg = chatPool[prev % chatPool.length];
        setMessages((m) => [...m, nextMsg]);
        return prev + 1;
      });
    }, 2000);

    return () => clearInterval(timer);
  }, []);

  // 自动滚动到底部
  useEffect(() => {
    const container = chatScrollRef.current;
    if (!container) return;
    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  /* ---------- 长期记忆状态 ---------- */
  const [lastUpdatedMin, setLastUpdatedMin] = useState(1);
  const [memoryCount, setMemoryCount] = useState(156);

  useEffect(() => {
    const timer = setInterval(() => {
      setLastUpdatedMin((p) => p + 1);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setMemoryCount((p) => p + 1);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  /* ---------- 临时记忆状态 ---------- */
  const [tempGroups, setTempGroups] = useState<TempMemoryGroup[]>(initialTempGroups);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    "14:00 - 15:00": true,
    "13:00 - 14:00": false,
    "12:00 - 13:00": false,
    "11:00 - 12:00": false,
  });
  const [extraIndex, setExtraIndex] = useState(0);

  // 临时记忆新增时同步递增长期记忆计数器
  useEffect(() => {
    const timer = setInterval(() => {
      setExtraIndex((prev) => {
        const nextMem = extraMemoryPool[prev % extraMemoryPool.length];
        setTempGroups((groups) => {
          const updated = groups.map((g, i) => {
            if (i === 0) {
              return { ...g, memories: [...g.memories, { time: "", text: nextMem }] };
            }
            return g;
          });
          return updated;
        });
        return prev + 1;
      });
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const toggleGroup = useCallback((label: string) => {
    setExpandedGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  }, []);

  const handleViewFullMemory = useCallback(() => {
    showToast("完整记忆文件已打开", "info");
  }, [showToast]);

  return (
    <>
      {/* CSS 动画定义 */}
      <style>{`
        @keyframes pulse-dot {
          0%, 100% { transform: scale(0.8); opacity: 0.5; }
          50% { transform: scale(1.2); opacity: 1; }
        }
        .animate-pulse-dot {
          animation: pulse-dot 2s ease-in-out infinite;
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out;
        }
        @keyframes blink-cursor {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .animate-blink-cursor {
          animation: blink-cursor 1s step-end infinite;
        }
        @keyframes pulse-green {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
          50% { box-shadow: 0 0 0 4px rgba(34, 197, 94, 0); }
        }
        .animate-pulse-green {
          animation: pulse-green 2s ease-in-out infinite;
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/30">
        {/* 装饰背景 */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 -right-20 w-60 h-60 bg-gradient-to-br from-blue-400/15 to-cyan-400/15 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-1/4 w-72 h-72 bg-gradient-to-br from-violet-400/10 to-rose-400/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-200/50 mb-4">
              <Layers className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium text-purple-600">个性化空间</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent mb-3">
              用户工作空间
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              每个用户拥有独立workspace，个性化记忆与能力体系
            </p>
          </div>

          {/* 核心文件区域 */}
          <div className="mb-10">
            <h2 className="text-xl font-bold text-slate-800 mb-5 flex items-center gap-2">
              <Settings className="w-5 h-5 text-purple-500" />
              核心文件
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {coreFiles.map((file) => (
                <Card
                  key={file.name}
                  className="group border-0 bg-white/60 backdrop-blur-xl shadow-lg shadow-purple-500/5 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full"
                  onClick={() => setCoreFileDialog(file.name)}
                >
                  <CardHeader>
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${file.gradient} flex items-center justify-center shadow-lg`}
                        >
                          <file.icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-base group-hover:text-purple-600 transition-colors">
                            {file.name}
                          </CardTitle>
                          <Badge variant="secondary" className="mt-1 bg-purple-50 text-purple-600">
                            {file.label}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">{file.description}</p>
                      <div className="bg-slate-50/80 rounded-lg p-3 border border-slate-100">
                        <pre className="text-xs text-slate-500 whitespace-pre-wrap font-mono line-clamp-4">
                          {file.preview}
                        </pre>
                      </div>
                      <div className="flex items-center gap-1 mt-3 text-xs text-purple-500">
                        <span>点击查看完整内容</span>
                        <ChevronRight className="w-3 h-3" />
                      </div>
                    </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* 三层记忆体系 */}
          <div className="mb-10">
            <h2 className="text-xl font-bold text-slate-800 mb-5 flex items-center gap-2">
              <Brain className="w-5 h-5 text-pink-500" />
              三层记忆体系
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

              {/* ==================== 短期记忆 ==================== */}
              <Card className="border-0 bg-white/60 backdrop-blur-xl shadow-lg shadow-blue-500/5 overflow-hidden flex flex-col">
                <div className="h-1.5 bg-gradient-to-r from-blue-500 to-cyan-400" />
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-md">
                        <Zap className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-base">短期记忆</CardTitle>
                        <CardDescription>Session Context</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-blue-50 text-blue-600 text-[10px]">
                        实时对话
                      </Badge>
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col pt-0">
                  {/* 聊天窗口 */}
                  <div className="flex-1 bg-slate-50/80 rounded-xl border border-slate-100 overflow-hidden flex flex-col" style={{ height: "300px" }}>
                    <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
                      {messages.map((msg, index) => (
                        <div
                          key={index}
                          className={`flex gap-2 animate-fade-in-up ${msg.isAI ? "justify-start" : "justify-end"}`}
                        >
                          {msg.isAI && (
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                              <Bot className="w-3.5 h-3.5 text-white" />
                            </div>
                          )}
                          <div
                            className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs shadow-sm ${
                              msg.isAI
                                ? "bg-white border border-slate-200 text-slate-700 rounded-tl-sm"
                                : "bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-tr-sm"
                            }`}
                          >
                            {!msg.isAI && (
                              <p className="font-semibold text-[10px] mb-0.5 opacity-80">{msg.sender}</p>
                            )}
                            <p>{msg.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* ==================== 长期记忆 ==================== */}
              <Card className="border-0 bg-white/60 backdrop-blur-xl shadow-lg shadow-purple-500/5 overflow-hidden flex flex-col">
                <div className="h-1.5 bg-gradient-to-r from-purple-500 to-pink-400" />
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-400 flex items-center justify-center shadow-md">
                      <HardDrive className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-base">长期记忆</CardTitle>
                      <CardDescription>MEMORY.md</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col pt-0 gap-3">
                  {/* 动态统计信息 */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <Activity className="w-3 h-3 text-purple-500" />
                      <span>最后更新于 {lastUpdatedMin} 分钟前</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <Star className="w-3 h-3 text-amber-500" />
                      <span>已沉淀 {memoryCount} 条记忆</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-green-600 font-medium">
                      <Sparkles className="w-3 h-3" />
                      <span>记忆增长率 +12.3%/小时</span>
                    </div>
                  </div>

                  {/* MEMORY.md 内容预览 */}
                  <div className="flex-1 bg-slate-900 rounded-xl border border-slate-700 overflow-hidden flex flex-col" style={{ minHeight: "200px" }}>
                    {/* 文件标签栏 */}
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 border-b border-slate-700">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                      <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                      <span className="text-[10px] text-slate-400 ml-2 font-mono">MEMORY.md</span>
                    </div>
                    {/* 文件内容 */}
                    <div className="flex-1 p-3 overflow-y-auto">
                      <pre className="text-[11px] text-green-400 font-mono whitespace-pre-wrap leading-relaxed">
                        {memoryMdContent}
                        <span className="animate-blink-cursor text-green-300">|</span>
                      </pre>
                    </div>
                  </div>

                  {/* 查看完整记忆 */}
                  <button
                    onClick={handleViewFullMemory}
                    className="text-xs text-purple-500 hover:text-purple-700 transition-colors flex items-center gap-1 self-start"
                  >
                    查看完整记忆
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </CardContent>
              </Card>

              {/* ==================== 临时记忆 ==================== */}
              <Card className="border-0 bg-white/60 backdrop-blur-xl shadow-lg shadow-amber-500/5 overflow-hidden flex flex-col">
                <div className="h-1.5 bg-gradient-to-r from-amber-500 to-orange-400" />
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-400 flex items-center justify-center shadow-md">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-base">临时记忆</CardTitle>
                      <CardDescription>memory/YYYY-MM-DD-HH.md</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col pt-0">
                  <div className="flex-1 space-y-2 overflow-y-auto" style={{ maxHeight: "340px" }}>
                    {tempGroups.map((group) => {
                      const isExpanded = expandedGroups[group.label] ?? false;
                      const isFirst = group.label === "14:00 - 15:00";
                      return (
                        <div key={group.label} className="rounded-lg border border-slate-100 bg-slate-50/80 overflow-hidden">
                          {/* 组标题 */}
                          <button
                            onClick={() => toggleGroup(group.label)}
                            className="w-full flex items-center justify-between px-3 py-2 hover:bg-white/60 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <ChevronDown
                                className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${isExpanded ? "" : "-rotate-90"}`}
                              />
                              <span className="text-xs font-semibold text-slate-700">{group.label}</span>
                              <Badge variant="secondary" className="text-[10px] bg-amber-50 text-amber-600">
                                {group.memories.length} 条
                              </Badge>
                            </div>
                            {isFirst && (
                              <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse-dot" />
                                <span className="text-[10px] text-green-600 font-medium">刚刚</span>
                              </div>
                            )}
                          </button>
                          {/* 记忆列表 */}
                          {isExpanded && (
                            <div className="px-3 pb-2 space-y-1.5">
                              {group.memories.map((mem, idx) => {
                                const isLatest = isFirst && idx === group.memories.length - 1;
                                return (
                                  <div
                                    key={`${group.label}-${idx}`}
                                    className={`flex items-start gap-2 py-1.5 px-2 rounded-md text-xs text-slate-600 ${
                                      isLatest ? "animate-fade-in-up bg-green-50/60" : "hover:bg-white/60"
                                    } transition-colors`}
                                  >
                                    <span className="text-[10px] text-muted-foreground font-mono whitespace-nowrap mt-px">
                                      {mem.time}
                                    </span>
                                    <span>{mem.text}</span>
                                    {isLatest && (
                                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse-dot mt-1.5 flex-shrink-0" />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>

          {/* 工作区文件树 */}
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-5 flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-blue-500" />
              工作区文件树
            </h2>
            <Card className="border-0 bg-white/60 backdrop-blur-xl shadow-lg shadow-blue-500/5">
              <CardContent className="p-5">
                <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-100 font-mono">
                  <FileTreeNode node={fileTree} onFileClick={(name) => showToast(`已选择文件: ${name}`, "info")} />
                </div>
                <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Folder className="w-4 h-4 text-amber-500" />
                    <span>文件夹</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <File className="w-4 h-4 text-blue-400" />
                    <span>文件</span>
                  </div>
                  <div className="ml-auto flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-green-500" />
                    <span>最后更新：2024-01-15 14:32</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 核心文件对话框 */}
        <Dialog open={!!coreFileDialog} onOpenChange={(open) => !open && setCoreFileDialog(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedCoreFile && (
                  <div
                    className={`w-8 h-8 rounded-lg bg-gradient-to-br ${selectedCoreFile.gradient} flex items-center justify-center`}
                  >
                    <selectedCoreFile.icon className="w-4 h-4 text-white" />
                  </div>
                )}
                {selectedCoreFile?.name}
              </DialogTitle>
              <DialogDescription>{selectedCoreFile?.description}</DialogDescription>
            </DialogHeader>
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
              <pre className="text-sm text-slate-700 whitespace-pre-wrap font-mono leading-relaxed">
                {selectedCoreFile?.fullContent}
              </pre>
            </div>
          </DialogContent>
        </Dialog>

        {/* 记忆文件对话框 */}
        <Dialog open={!!memoryDialog} onOpenChange={(open) => !open && setMemoryDialog(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" />
                {memoryDialog?.name}
              </DialogTitle>
              <DialogDescription>
                记录时间：{memoryDialog?.time} | 共 {memoryDialog?.entries} 条记忆
              </DialogDescription>
            </DialogHeader>
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border border-slate-100">
              <pre className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                {`# ${memoryDialog?.name}

## 会话记录摘要

### 用户提问记录
1. 讨论了SEIR模型的参数选择问题
2. 询问了蒙特卡洛模拟的收敛性判断方法
3. 探讨了模型灵敏度分析的最佳实践

### AI建议记录
1. 推荐使用自适应步长的Runge-Kutta方法
2. 建议增加参数边界约束
3. 提供了可视化代码模板

### 关键决策
- 确定使用混合模型方案（SEIR + 元胞自动机）
- 参数拟合采用贝叶斯推断方法
- 模型验证使用交叉验证策略

### 待跟进事项
- 补充模型局限性讨论
- 完善图表标注格式
- 添加代码注释文档`}
              </pre>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
