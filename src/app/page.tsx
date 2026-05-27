"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Trophy,
  Brain,
  BookOpen,
  Award,
  FileText,
  Bot,
  Layers,
  Database,
  Shield,
  FolderKanban,
  Clock,
  CheckCircle2,
  GitBranch,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/layout/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useState } from "react";

interface AdvantageCard {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: "indigo" | "cyan" | "purple" | "emerald" | "amber" | "rose";
}

const advantageCards: AdvantageCard[] = [
  {
    icon: <Bot className="size-5" />,
    title: "多AI模型协作",
    description: "集成多个AI模型，智能分工协作，提升建模效率",
    gradient: "indigo",
  },
  {
    icon: <Layers className="size-5" />,
    title: "三层机制设计",
    description: "模型层、协作层、应用层三层架构，系统化建模流程",
    gradient: "cyan",
  },
  {
    icon: <GitBranch className="size-5" />,
    title: "完整数据流",
    description: "从问题分析到模型验证，全流程数据可追溯",
    gradient: "purple",
  },
  {
    icon: <Database className="size-5" />,
    title: "知识沉淀",
    description: "自动沉淀建模经验，形成可复用的知识库",
    gradient: "emerald",
  },
  {
    icon: <Shield className="size-5" />,
    title: "区块链存证",
    description: "关键操作上链存证，确保成果可信不可篡改",
    gradient: "amber",
  },
  {
    icon: <FolderKanban className="size-5" />,
    title: "MMP全记录",
    description: "完整记录数学建模过程，支持回溯与复盘",
    gradient: "rose",
  },
];

interface ActivityItem {
  id: string;
  type: "team" | "model" | "knowledge" | "card" | "mmp";
  title: string;
  description: string;
  time: string;
  icon: React.ReactNode;
}

const recentActivities: ActivityItem[] = [
  {
    id: "1",
    type: "team",
    title: "新团队创建",
    description: "「数学建模先锋队」成功组建，成员5人",
    time: "10分钟前",
    icon: <Users className="size-4" />,
  },
  {
    id: "2",
    type: "model",
    title: "AI模型协作完成",
    description: "GPT-4o与Claude 3.5协作完成「人口增长预测」模型",
    time: "25分钟前",
    icon: <Brain className="size-4" />,
  },
  {
    id: "3",
    type: "knowledge",
    title: "知识库新增论文",
    description: "上传《基于深度学习的优化算法研究》等3篇论文",
    time: "1小时前",
    icon: <BookOpen className="size-4" />,
  },
  {
    id: "4",
    type: "card",
    title: "能力Card生成",
    description: "为「李四」生成数据分析能力Card，评分92分",
    time: "2小时前",
    icon: <Award className="size-4" />,
  },
  {
    id: "5",
    type: "mmp",
    title: "MMP文件归档",
    description: "「2024全国大学生数学建模竞赛」MMP文件已归档",
    time: "3小时前",
    icon: <FileText className="size-4" />,
  },
];

const getActivityTypeColor = (type: ActivityItem["type"]) => {
  switch (type) {
    case "team":
      return "bg-indigo-500/10 text-indigo-600 border-indigo-500/20";
    case "model":
      return "bg-purple-500/10 text-purple-600 border-purple-500/20";
    case "knowledge":
      return "bg-cyan-500/10 text-cyan-600 border-cyan-500/20";
    case "card":
      return "bg-amber-500/10 text-amber-600 border-amber-500/20";
    case "mmp":
      return "bg-rose-500/10 text-rose-600 border-rose-500/20";
    default:
      return "bg-gray-500/10 text-gray-600 border-gray-500/20";
  }
};

export default function Home() {
  const router = useRouter();
  const { showToast } = useToast();
  const [advantageDialog, setAdvantageDialog] = useState<AdvantageCard | null>(null);

  return (
    <div className="min-h-full gradient-bg-mesh">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 系统概览横幅 */}
        <div className="relative mb-8 overflow-hidden rounded-3xl border border-border/70 bg-card/95 p-6 shadow-[var(--shadow-card)] sm:p-8">
          <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-bg-subtle opacity-70" />
          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <Sparkles className="size-5 text-primary" />
                <Badge variant="secondary">系统概览</Badge>
              </div>
              <h1 className="mb-3 text-3xl font-bold text-foreground sm:text-4xl">
                数学建模协作控制台
              </h1>
              <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
                CMAMSys 将团队组建、三手协作、知识沉淀与 MMP 存证集中到一个工作台，帮助队伍更清楚地推进每个建模阶段。
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a href="/workflow">
                <Button size="lg" className="min-h-10 rounded-xl">
                  开始建模
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              </a>
              <a href="/guide">
                <Button size="lg" variant="outline" className="min-h-10 rounded-xl">
                  查看教程
                </Button>
              </a>
            </div>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <StatCard
            icon={<Users className="size-5" />}
            title="活跃团队"
            value="128"
            change={12}
            changeLabel="较上周"
            gradient="indigo"
          />
          <StatCard
            icon={<Trophy className="size-5" />}
            title="进行中竞赛"
            value="42"
            change={8}
            changeLabel="较上周"
            gradient="purple"
          />
          <StatCard
            icon={<Brain className="size-5" />}
            title="AI模型协作"
            value="1,024"
            change={24}
            changeLabel="较上周"
            gradient="cyan"
          />
          <StatCard
            icon={<BookOpen className="size-5" />}
            title="知识库论文"
            value="3,567"
            change={15}
            changeLabel="较上周"
            gradient="emerald"
          />
          <StatCard
            icon={<Award className="size-5" />}
            title="能力Card"
            value="892"
            change={18}
            changeLabel="较上周"
            gradient="amber"
          />
          <StatCard
            icon={<FileText className="size-5" />}
            title="MMP文件"
            value="2,341"
            change={21}
            changeLabel="较上周"
            gradient="rose"
          />
        </div>

        {/* 团队概览 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground">团队概览</h2>
            <Badge variant="outline" className="text-muted-foreground">
              展示不同开发阶段
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 团队1：思路研讨阶段 */}
            <Card className="group relative cursor-pointer overflow-hidden rounded-2xl border-border/70 bg-card/95 shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)]" onClick={() => router.push("/modeler")}>
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-chart-1 text-white shadow-sm">
                    <Users className="size-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">数模之星队</h3>
                    <p className="text-xs text-muted-foreground">当前团队</p>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">阶段</span>
                    <Badge className="bg-chart-1/10 text-chart-1">思路研讨</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">进度</span>
                    <span className="font-medium text-foreground">65%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-chart-1 h-2 rounded-full" style={{ width: "65%" }}></div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">建模手正在进行AI三轮辩论...</p>
                <div className="flex items-center justify-end mt-3 text-sm text-chart-1 font-medium group-hover:translate-x-1 transition-transform">
                  查看详情 <ArrowRight className="ml-1 size-3.5" />
                </div>
              </CardContent>
            </Card>

            {/* 团队2：代码实现阶段 */}
            <Card className="group relative cursor-pointer overflow-hidden rounded-2xl border-border/70 bg-card/95 shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)]" onClick={() => router.push("/programmer")}>
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-chart-2 text-white shadow-sm">
                    <Brain className="size-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">智慧建模组</h3>
                    <p className="text-xs text-muted-foreground">示例团队</p>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">阶段</span>
                    <Badge className="bg-chart-2/10 text-chart-2">代码实现</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">进度</span>
                    <span className="font-medium text-foreground">78%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-chart-2 h-2 rounded-full" style={{ width: "78%" }}></div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">编程手正在调试SEIR模型参数...</p>
                <div className="flex items-center justify-end mt-3 text-sm text-chart-2 font-medium group-hover:translate-x-1 transition-transform">
                  查看详情 <ArrowRight className="ml-1 size-3.5" />
                </div>
              </CardContent>
            </Card>

            {/* 团队3：论文撰写阶段 */}
            <Card className="group relative cursor-pointer overflow-hidden rounded-2xl border-border/70 bg-card/95 shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)]" onClick={() => router.push("/writer")}>
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-chart-4 text-white shadow-sm">
                    <FileText className="size-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">创新团队</h3>
                    <p className="text-xs text-muted-foreground">示例团队</p>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">阶段</span>
                    <Badge className="bg-chart-4/10 text-chart-4">论文撰写</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">进度</span>
                    <span className="font-medium text-foreground">92%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-chart-4 h-2 rounded-full" style={{ width: "92%" }}></div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">论文手正在整合最终成果...</p>
                <div className="flex items-center justify-end mt-3 text-sm text-chart-4 font-medium group-hover:translate-x-1 transition-transform">
                  查看详情 <ArrowRight className="ml-1 size-3.5" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 系统核心优势 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground">系统核心优势</h2>
            <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => setAdvantageDialog(advantageCards[0])}>
              了解更多
              <ArrowRight className="ml-1 size-3.5" />
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {advantageCards.map((card, index) => (
              <Card
                key={index}
                className={cn(
                  "group relative cursor-pointer overflow-hidden rounded-2xl border-border/70 bg-card/95",
                  "shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)]"
                )}
                onClick={() => setAdvantageDialog(card)}
              >
                <CardContent className="relative p-5">
                  <div
                    className={cn(
                      "mb-4 flex size-12 items-center justify-center rounded-xl text-white shadow-sm transition-transform duration-200 group-hover:scale-105",
                      card.gradient === "indigo" && "bg-chart-1",
                      card.gradient === "cyan" && "bg-chart-2",
                      card.gradient === "purple" && "bg-chart-5",
                      card.gradient === "emerald" && "bg-chart-3",
                      card.gradient === "amber" && "bg-chart-4",
                      card.gradient === "rose" && "bg-rose-500"
                    )}
                  >
                    <div className="text-white">{card.icon}</div>
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-2">
                    {card.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {card.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* 最近活动 */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground">最近活动</h2>
            <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => router.push("/knowledge")}>
              查看全部
              <ArrowRight className="ml-1 size-3.5" />
            </Button>
          </div>
          <Card className="rounded-2xl border-border/70 bg-card/95 shadow-[var(--shadow-card)]">
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                {recentActivities.map((activity, index) => (
                  <div
                    key={activity.id}
                    className={cn(
                      "flex items-start gap-4 p-4 transition-colors hover:bg-muted/30 cursor-pointer",
                      index === 0 && "animate-fade-in-up"
                    )}
                    onClick={() => showToast(`${activity.title}：${activity.description}`, "info")}
                  >
                    <div
                      className={cn(
                        "flex size-10 items-center justify-center rounded-lg border shrink-0",
                        getActivityTypeColor(activity.type)
                      )}
                    >
                      <div className="text-foreground">{activity.icon}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-semibold text-foreground">
                          {activity.title}
                        </h4>
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1.5 py-0 h-4"
                        >
                          {activity.type === "team" && "团队"}
                          {activity.type === "model" && "AI协作"}
                          {activity.type === "knowledge" && "知识库"}
                          {activity.type === "card" && "能力Card"}
                          {activity.type === "mmp" && "MMP"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1.5">
                        {activity.description}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="size-3" />
                        <span>{activity.time}</span>
                      </div>
                    </div>
                    <div className="flex items-center shrink-0">
                      <CheckCircle2 className="size-4 text-emerald-500" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 优势详情对话框 */}
      <Dialog open={!!advantageDialog} onOpenChange={(open) => !open && setAdvantageDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {advantageDialog && <div className="text-primary">{advantageDialog.icon}</div>}
              {advantageDialog?.title}
            </DialogTitle>
            <DialogDescription>{advantageDialog?.description}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {advantageDialog?.title === "多AI模型协作" && "CMAMSys集成了GPT-4、Claude、DeepSeek等多个主流AI模型，通过三轮辩论机制让不同模型独立思考、人机融合、同伴互评，最终选出最优方案，大幅提升建模效率和质量。"}
              {advantageDialog?.title === "三层机制设计" && "系统采用模型层（AI模型协作）、协作层（团队分工与沟通）、应用层（知识库、Card、MMP）三层架构，每一层都有明确的职责和接口，形成系统化的建模流程。"}
              {advantageDialog?.title === "完整数据流" && "从问题分析、思路研讨、代码实现到结果审核，全流程数据可追溯。每个环节都有详细的记录和版本管理，确保建模过程的透明性和可复现性。"}
              {advantageDialog?.title === "知识沉淀" && "系统自动将建模过程中的优秀方案、解题思路、代码模式等知识进行提取和分类，形成可复用的知识库，为未来的建模任务提供参考和灵感。"}
              {advantageDialog?.title === "区块链存证" && "关键操作和成果通过IPFS+区块链时间戳进行存证，确保数据不可篡改。能力Card和MMP文件均有唯一标识，可通过多种途径验证真实性。"}
              {advantageDialog?.title === "MMP全记录" && "MMP(MathModel Project)文件记录了数学建模竞赛的全流程操作，包括题目解析、思路研讨、代码记录、结果审核、论文版本等8大核心章节，支持完整回溯与复盘。"}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
