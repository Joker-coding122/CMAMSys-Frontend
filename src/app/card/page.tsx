"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress, ProgressTrack, ProgressIndicator, ProgressLabel, ProgressValue } from "@/components/ui/progress";
import { useToast } from "@/components/ui/toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Award,
  Shield,
  Fingerprint,
  Link2,
  Users,
  Briefcase,
  GraduationCap,
  Building2,
  Star,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  Cpu,
  Globe,
  Clock,
  FileCheck,
  BarChart3,
  Target,
  Zap,
  Heart,
  Code,
  BookOpen,
  User,
  Trophy,
  Lock,
  Eye,
  QrCode,
  Database,
  ArrowRight,
} from "lucide-react";

const mainCard = {
  id: "#A3F9D2",
  name: "张三",
  role: "建模手",
  avatar: "ZS",
  expertise: "SEIR模型迭代优化",
  collaborationScore: 87,
  innovation: "改进参数拟合算法，引入自适应网格搜索",
  level: 3,
  levelName: "CMAMSys Level 3",
  year: "2024",
  competitions: [
    { name: "2024 MCM-C 竞赛", role: "建模手", score: "Outstanding Winner" },
    { name: "2025 MCM-A 竞赛", role: "建模手", score: "参赛中" },
  ],
  aiEvaluation:
    "综合能力优秀。建模思路清晰，善于将复杂问题分解为可处理的子问题。创新性地将自适应网格搜索应用于SEIR模型参数拟合，显著提升了拟合精度。团队协作意识强，能主动与编程手和论文手沟通。建议加强编程实现能力。",
  ipfsHash: "ipfs://QmX7bKz8h3nR5pW2mN4kL6jF8dS0aG1cE3bH5jK7lM9n",
  timestamp: "2024-02-05T09:00:00Z",
};

const scoreDimensions = [
  { name: "操作准确性", weight: "40%", score: 90, color: "from-blue-500 to-cyan-400" },
  { name: "协作效率", weight: "30%", score: 85, color: "from-purple-500 to-violet-400" },
  { name: "创新点", weight: "20%", score: 88, color: "from-amber-500 to-orange-400" },
  { name: "规范性", weight: "10%", score: 82, color: "from-green-500 to-emerald-400" },
];

const levelSystem = [
  { level: "L1", range: "<60", label: "入门", color: "bg-slate-400", textColor: "text-slate-600" },
  { level: "L2", range: "60-79", label: "进阶", color: "bg-blue-500", textColor: "text-blue-600" },
  { level: "L3", range: "80-89", label: "优秀", color: "bg-purple-500", textColor: "text-purple-600" },
  { level: "L4", range: "90-100", label: "卓越", color: "bg-amber-500", textColor: "text-amber-600" },
];

const blockchainInfo = [
  {
    icon: Fingerprint,
    label: "存证技术",
    value: "IPFS + 时间戳",
    detail: "利用星际文件系统实现去中心化存储，配合区块链时间戳确保不可篡改",
  },
  {
    icon: Database,
    label: "存证内容",
    value: "Card完整数据 + .mmp文件标识",
    detail: "包含个人能力数据、竞赛记录、AI评价及关联的.mmp文件唯一标识",
  },
  {
    icon: Clock,
    label: "存证时效",
    value: "永久存证",
    detail: "数据一旦上链，永久保存，任何人无法修改或删除",
  },
  {
    icon: Eye,
    label: "验证方法",
    value: "3种验证途径",
    detail: "1) CMAMSys官网查询 2) IPFS网关验证 3) 第三方区块链浏览器",
  },
];

const applicationScenarios = [
  {
    icon: Trophy,
    title: "竞赛成果展示",
    description: "作为竞赛能力的权威证明，展示个人和团队的真实水平",
    gradient: "from-amber-500 to-orange-400",
  },
  {
    icon: GraduationCap,
    title: "保研/评奖材料",
    description: "系统认证的能力评价，为保研推免和奖学金评定提供有力支撑",
    gradient: "from-blue-500 to-cyan-400",
  },
  {
    icon: Users,
    title: "团队组队匹配",
    description: "基于能力维度智能匹配，找到互补型队友，提升团队竞争力",
    gradient: "from-purple-500 to-violet-400",
  },
  {
    icon: Building2,
    title: "实验室招新/企业招聘",
    description: "客观的能力评估数据，帮助实验室和企业精准筛选人才",
    gradient: "from-green-500 to-emerald-400",
  },
];

const teamCards = [
  {
    name: "张三",
    role: "建模手",
    avatar: "ZS",
    score: 87,
    level: 3,
    expertise: "SEIR模型迭代优化",
    innovation: "改进参数拟合算法",
    color: "from-blue-500 to-purple-500",
    dimensions: { accuracy: 90, efficiency: 85, innovation: 88, standard: 82 },
  },
  {
    name: "李四",
    role: "编程手",
    avatar: "LS",
    score: 91,
    level: 3,
    expertise: "深度学习与高性能计算",
    innovation: "GPU并行加速蒙特卡洛",
    color: "from-emerald-500 to-teal-500",
    dimensions: { accuracy: 93, efficiency: 90, innovation: 89, standard: 92 },
  },
  {
    name: "王五",
    role: "论文手",
    avatar: "WW",
    score: 84,
    level: 3,
    expertise: "学术写作与数据可视化",
    innovation: "交互式图表设计方案",
    color: "from-amber-500 to-rose-500",
    dimensions: { accuracy: 82, efficiency: 86, innovation: 85, standard: 80 },
  },
];

function AbilityCard({
  card,
  size = "large",
}: {
  card: (typeof teamCards)[0] | typeof mainCard;
  size?: "large" | "small";
}) {
  const isMain = size === "large";
  const score = "collaborationScore" in card ? card.collaborationScore : card.score;
  const name = card.name;
  const role = card.role;
  const avatar = card.avatar;
  const expertise = card.expertise;
  const innovation = card.innovation;
  const color = "color" in card ? card.color : "from-blue-500 to-purple-500";
  const level = card.level;

  return (
    <div
      className={`relative rounded-2xl overflow-hidden ${
        isMain ? "max-w-md mx-auto" : ""
      }`}
    >
      {/* 全息渐变边框 */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-2xl p-[2px]">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-400 via-pink-500 to-amber-400 rounded-2xl opacity-50 animate-pulse" />
      </div>

      {/* 卡片内容 */}
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 backdrop-blur-xl">
        {/* 光泽效果 */}
        <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/5 to-transparent rounded-t-2xl pointer-events-none" />
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br from-pink-500/20 to-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* 头部 */}
        <div className="relative flex items-center gap-4 mb-5">
          <div
            className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg shadow-purple-500/30 ring-2 ring-white/10`}
          >
            <span className="text-xl font-bold text-white">{avatar}</span>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white">{name}</h3>
            <Badge className="bg-white/10 text-white/80 border-white/20 text-xs">
              {role}
            </Badge>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              {score}
            </div>
            <div className="text-xs text-white/50">协作指数</div>
          </div>
        </div>

        <Separator className="bg-white/10 mb-5" />

        {/* 信息区域 */}
        <div className="relative space-y-3 mb-5">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-white/60">擅长领域：</span>
            <span className="text-sm text-white font-medium">{expertise}</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-white/60">创新点：</span>
            <span className="text-sm text-white font-medium">{innovation}</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-green-400" />
            <span className="text-sm text-white/60">系统认证：</span>
            <span className="text-sm text-white font-medium">
              CMAMSys Level {level}（2024）
            </span>
          </div>
        </div>

        {/* 历史竞赛 */}
        {"competitions" in card && (
          <>
            <Separator className="bg-white/10 mb-4" />
            <div className="relative">
              <h4 className="text-xs text-white/40 uppercase tracking-wider mb-3">
                历史竞赛记录
              </h4>
              <div className="space-y-2">
                {card.competitions.map((comp, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 bg-white/5 rounded-lg px-3 py-2 border border-white/5"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-[10px] text-white font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <span className="text-sm text-white">{comp.name}</span>
                      <span className="text-xs text-white/40 ml-2">{comp.role}</span>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-[10px] border-amber-500/30 text-amber-400"
                    >
                      {comp.score}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* AI评价 (仅主卡) */}
        {"aiEvaluation" in card && (
          <>
            <Separator className="bg-white/10 my-4" />
            <div className="relative">
              <h4 className="text-xs text-white/40 uppercase tracking-wider mb-2">
                AI 总评价
              </h4>
              <p className="text-xs text-white/70 leading-relaxed">{card.aiEvaluation}</p>
            </div>
            <Separator className="bg-white/10 my-4" />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Fingerprint className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-[10px] text-white/40">唯一标识：{card.id}</span>
              </div>
              <div className="flex items-center gap-2">
                <Link2 className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-[10px] text-white/40">IPFS存证</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function CardPage() {
  const { showToast } = useToast();
  const [verifyDialog, setVerifyDialog] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/30 to-purple-50/30">
      {/* 装饰背景 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-amber-400/20 to-purple-400/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-20 w-60 h-60 bg-gradient-to-br from-blue-400/15 to-pink-400/15 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-gradient-to-br from-purple-400/10 to-amber-400/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 to-purple-500/10 border border-amber-200/50 mb-4">
            <Award className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-medium text-amber-600">不可篡改的能力证明</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
            能力 Card 系统
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            基于全流程操作与AI评价，生成不可篡改的个人数模能力证明
          </p>
        </div>

        {/* 主Card展示 */}
        <div className="mb-4">
          <AbilityCard card={mainCard} size="large" />
        </div>
        {/* 操作按钮 */}
        <div className="flex justify-center gap-3 mb-12">
          <Button className="bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 text-white" onClick={() => setVerifyDialog(true)}>
            <Shield className="w-4 h-4 mr-2" />
            验证Card
          </Button>
          <Button variant="outline" onClick={() => {
            navigator.clipboard.writeText("https://cmamsys.app/card/#A3F9D2").then(() => {
              showToast("Card分享链接已复制到剪贴板！", "success");
            }).catch(() => {
              showToast("分享链接: https://cmamsys.app/card/#A3F9D2", "info");
            });
          }}>
            <QrCode className="w-4 h-4 mr-2" />
            分享
          </Button>
        </div>

        {/* 评分体系说明 */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-slate-800 mb-5 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-500" />
            评分体系
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 协作指数计算 */}
            <Card className="border-0 bg-white/60 backdrop-blur-xl shadow-lg">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-500" />
                  协作指数计算
                </CardTitle>
                <CardDescription>基于四个维度加权计算综合协作指数</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {scoreDimensions.map((dim) => (
                  <div key={dim.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{dim.name}</span>
                        <Badge variant="secondary" className="text-[10px] bg-slate-100">
                          权重 {dim.weight}
                        </Badge>
                      </div>
                      <span className="font-bold text-slate-700">{dim.score}分</span>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${dim.color} rounded-full transition-all duration-1000`}
                        style={{ width: `${dim.score}%` }}
                      />
                    </div>
                  </div>
                ))}
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="font-semibold">综合协作指数</span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    87<span className="text-sm text-muted-foreground font-normal">/100</span>
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* 系统认证等级 */}
            <Card className="border-0 bg-white/60 backdrop-blur-xl shadow-lg">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="w-5 h-5 text-purple-500" />
                  系统认证等级
                </CardTitle>
                <CardDescription>根据协作指数划分四个认证等级</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {levelSystem.map((lvl) => (
                  <div
                    key={lvl.level}
                    className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${
                      lvl.level === "L3"
                        ? "bg-purple-50/80 border-purple-200 shadow-md shadow-purple-500/10"
                        : "bg-white/50 border-slate-100"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-xl ${lvl.color} flex items-center justify-center shadow-md`}
                    >
                      <span className="text-white font-bold text-sm">{lvl.level}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold text-sm ${lvl.textColor}`}>
                          {lvl.label}
                        </span>
                        {lvl.level === "L3" && (
                          <Badge className="bg-purple-500 text-white border-0 text-[10px]">
                            当前等级
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">分数范围：{lvl.range}</span>
                    </div>
                    <div className="flex gap-0.5">
                      {lvl.level === "L1" && (
                        <>
                          <div className="w-2 h-6 rounded-full bg-slate-300" />
                          <div className="w-2 h-6 rounded-full bg-slate-100" />
                          <div className="w-2 h-6 rounded-full bg-slate-100" />
                          <div className="w-2 h-6 rounded-full bg-slate-100" />
                        </>
                      )}
                      {lvl.level === "L2" && (
                        <>
                          <div className="w-2 h-6 rounded-full bg-blue-400" />
                          <div className="w-2 h-6 rounded-full bg-blue-400" />
                          <div className="w-2 h-6 rounded-full bg-slate-100" />
                          <div className="w-2 h-6 rounded-full bg-slate-100" />
                        </>
                      )}
                      {lvl.level === "L3" && (
                        <>
                          <div className="w-2 h-6 rounded-full bg-purple-400" />
                          <div className="w-2 h-6 rounded-full bg-purple-400" />
                          <div className="w-2 h-6 rounded-full bg-purple-400" />
                          <div className="w-2 h-6 rounded-full bg-slate-100" />
                        </>
                      )}
                      {lvl.level === "L4" && (
                        <>
                          <div className="w-2 h-6 rounded-full bg-amber-400" />
                          <div className="w-2 h-6 rounded-full bg-amber-400" />
                          <div className="w-2 h-6 rounded-full bg-amber-400" />
                          <div className="w-2 h-6 rounded-full bg-amber-400" />
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 区块链存证信息 */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-slate-800 mb-5 flex items-center gap-2">
            <Lock className="w-5 h-5 text-cyan-500" />
            区块链存证信息
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {blockchainInfo.map((info, index) => (
              <Card
                key={index}
                className="border-0 bg-white/60 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <CardContent className="p-5">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-md mb-3`}
                  >
                    <info.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{info.label}</h3>
                  <p className="text-sm font-medium text-cyan-600 mb-2">{info.value}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{info.detail}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* 应用场景 */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-slate-800 mb-5 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            应用场景
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {applicationScenarios.map((scenario, index) => (
              <Card
                key={index}
                className="border-0 bg-white/60 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
                onClick={() => showToast(`${scenario.title}: ${scenario.description}`, "info")}
              >
                <CardContent className="p-5 text-center">
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${scenario.gradient} flex items-center justify-center shadow-lg mx-auto mb-3 group-hover:scale-110 transition-transform`}
                  >
                    <scenario.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{scenario.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {scenario.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* 多Card对比 */}
        <div>
          <h2 className="text-xl font-bold text-slate-800 mb-5 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            团队 Card 对比
          </h2>
          <p className="text-sm text-muted-foreground mb-5">
            同一团队不同角色的能力Card对比，展示各自优势与互补性
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {teamCards.map((member, index) => (
              <div key={index}>
                <AbilityCard card={member} size="small" />
                {/* 维度对比条 */}
                <div className="mt-3 space-y-2 px-1">
                  {[
                    { label: "准确性", value: member.dimensions.accuracy, color: "from-blue-400 to-blue-500" },
                    { label: "效率", value: member.dimensions.efficiency, color: "from-purple-400 to-purple-500" },
                    { label: "创新", value: member.dimensions.innovation, color: "from-amber-400 to-amber-500" },
                    { label: "规范", value: member.dimensions.standard, color: "from-green-400 to-green-500" },
                  ].map((dim) => (
                    <div key={dim.label} className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground w-8">{dim.label}</span>
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${dim.color} rounded-full`}
                          style={{ width: `${dim.value}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-medium text-slate-600 w-6 text-right">
                        {dim.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 验证Card对话框 */}
      <Dialog open={verifyDialog} onOpenChange={setVerifyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-cyan-500" />
              Card 验证信息
            </DialogTitle>
            <DialogDescription>验证该能力Card的真实性与完整性</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <div>
                <div className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">验证通过</div>
                <div className="text-xs text-muted-foreground">该Card已通过区块链存证验证</div>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Card ID</span>
                <span className="font-mono text-xs">#A3F9D2</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">持有人</span>
                <span>张三</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">认证等级</span>
                <span>CMAMSys Level 3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">协作指数</span>
                <span>87/100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">IPFS Hash</span>
                <span className="font-mono text-xs truncate max-w-[200px]">QmX7bKz8h3nR5pW2mN4k...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">存证时间</span>
                <span>2024-02-05 09:00:00 UTC</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
