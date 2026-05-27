"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import {
  Activity,
  Blocks,
  Boxes,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Database,
  Download,
  ExternalLink,
  FileCode,
  Fingerprint,
  Hash,
  Info,
  Layers,
  Link2,
  Lock,
  RefreshCw,
  Search,
  Shield,
  Sparkles,
  Trash2,
  Zap,
} from "lucide-react";
import {
  readMMPLog,
  clearMMPLog,
  exportMMPFile,
  seedIfEmpty,
  calcMMPFileHash,
  MMPLogEntry,
  MMPRole,
} from "@/lib/mmp-logger";

/* ------------------------------------------------------------------ */
/*  常量 & 视觉映射                                                    */
/* ------------------------------------------------------------------ */
const ROLE_COLORS: Record<MMPRole, string> = {
  modeler: "from-blue-500 to-indigo-600",
  coder: "from-purple-500 to-violet-600",
  writer: "from-orange-500 to-amber-600",
  system: "from-gray-500 to-slate-600",
  leader: "from-emerald-500 to-teal-600",
};

const ROLE_BADGE: Record<MMPRole, string> = {
  modeler: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  coder:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  writer:
    "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  system: "bg-gray-100 text-gray-700 dark:bg-gray-800/60 dark:text-gray-300",
  leader:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
};

const ROLE_FILTERS: { value: "all" | MMPRole; label: string }[] = [
  { value: "all", label: "全部" },
  { value: "modeler", label: "建模手" },
  { value: "coder", label: "编程手" },
  { value: "writer", label: "论文手" },
  { value: "leader", label: "队长" },
  { value: "system", label: "系统" },
];

/* ------------------------------------------------------------------ */
/*  章节静态数据（保留原设计，作为下方展示）                             */
/* ------------------------------------------------------------------ */
const mmpChapters = [
  {
    id: 1,
    title: "文件头部信息",
    description: "UUID、关联竞赛、团队信息和系统版本",
    gradient: "from-blue-500 to-cyan-400",
    fields: [
      { label: "UUID", value: "a3f9d2e8-4b7c-4f1a-9d3e-5c8b2a1f6e4d" },
      { label: "关联竞赛", value: "2024 MCM Problem C" },
      { label: "团队名称", value: "AlphaStar" },
      { label: "系统版本", value: "CMAMSys v2.1.0" },
    ],
  },
  {
    id: 2,
    title: "题目信息",
    description: "题目原文、AI 解析结果和修改记录",
    gradient: "from-purple-500 to-violet-400",
    fields: [
      { label: "核心问题", value: "网球比赛动量建模" },
      { label: "关键词", value: "动量, 马尔可夫链, 蒙特卡洛" },
      { label: "修改记录", value: "v1 → v2 → v3（细化子问题）" },
    ],
  },
  {
    id: 3,
    title: "思路研讨记录",
    description: "研讨时间、AI 素材、讨论内容和思路迭代",
    gradient: "from-pink-500 to-rose-400",
    fields: [
      { label: "研讨时长", value: "5 小时 45 分钟" },
      { label: "AI 素材引用", value: "#3421, #5678, #9012" },
      { label: "思路迭代", value: "统计回归 → 马尔可夫链 → 混合模型" },
    ],
  },
  {
    id: 4,
    title: "代码记录",
    description: "代码版本、AI 校验结果和运行日志",
    gradient: "from-green-500 to-emerald-400",
    fields: [
      { label: "版本", value: "v1.0 → v1.1 → v2.0" },
      { label: "AI 校验", value: "通过（规范✓ 算法✓ 性能✓）" },
      { label: "运行", value: "12.3s / 256MB / 无报错" },
    ],
  },
  {
    id: 5,
    title: "结果审核记录",
    description: "审核人、审核记录和最终结果确认",
    gradient: "from-amber-500 to-orange-400",
    fields: [
      { label: "审核方式", value: "AI Reviewer + 人工复核" },
      { label: "审核结果", value: "通过（92/100）" },
      { label: "警告", value: "图 3 坐标轴标签已统一" },
    ],
  },
  {
    id: 6,
    title: "论文与图表记录",
    description: "论文版本迭代和所有图表的生成过程",
    gradient: "from-teal-500 to-cyan-400",
    fields: [
      { label: "论文版本", value: "v1 → v2 → v3（终稿）" },
      { label: "图表数量", value: "12 张图 + 5 张表" },
      { label: "格式检查", value: "LaTeX 编译通过，24 页" },
    ],
  },
  {
    id: 7,
    title: "AI 实时评价记录",
    description: "各 AI 角色对团队表现的评价和评分",
    gradient: "from-indigo-500 to-blue-400",
    fields: [
      { label: "评价主体", value: "建模/编程/论文 三位 AI 导师" },
      { label: "综合评分", value: "92/100（优秀）" },
      { label: "细分", value: "建模 95 · 编程 88 · 论文 93" },
    ],
  },
  {
    id: 8,
    title: "赛后补充记录",
    description: "脱敏处理、解法库录入和区块链存证信息",
    gradient: "from-rose-500 to-red-400",
    fields: [
      { label: "脱敏处理", value: "已替换为 Team-2024MC-0142" },
      { label: "解法库分类", value: "混合模型 > 马尔可夫链 > 体育" },
      { label: "链上存证 ID", value: "#A3F9D2" },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  页面组件                                                           */
/* ------------------------------------------------------------------ */
export default function MMPPage() {
  const { showToast } = useToast();

  const [log, setLog] = useState<MMPLogEntry[]>([]);
  const [roleFilter, setRoleFilter] =
    useState<"all" | MMPRole>("all");
  const [expandedChapter, setExpandedChapter] = useState<number | null>(1);
  const [detailEntry, setDetailEntry] = useState<MMPLogEntry | null>(null);
  const [chainDialogOpen, setChainDialogOpen] = useState(false);
  const [chainViewedAt, setChainViewedAt] = useState<number | null>(null);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);

  /* ---------- 初始化：种子 + 读取 ---------- */
  useEffect(() => {
    const timer = window.setTimeout(() => {
      seedIfEmpty();
      setLog(readMMPLog());
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const refresh = useCallback(() => {
    setLog(readMMPLog());
    showToast("操作日志已刷新", "info");
  }, [showToast]);

  const filteredLog = useMemo(() => {
    const src = [...log].sort((a, b) => b.timestamp - a.timestamp);
    if (roleFilter === "all") return src;
    return src.filter((e) => e.role === roleFilter);
  }, [log, roleFilter]);

  /* ---------- 区块链哈希（真算） ---------- */
  const fileHash = useMemo(() => calcMMPFileHash(), [log]);
  const latestEntry = log[log.length - 1];
  const latestBlockNumber = latestEntry?.blockNumber ?? 18234567;
  const latestTxHash = latestEntry?.txHash ?? "0x" + "0".repeat(64);

  /* ---------- 操作 ---------- */
  const handleCopy = async (text: string, label = "已复制") => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(label, "success");
    } catch {
      showToast("复制失败，请手动复制", "warning");
    }
  };

  const handleExport = () => {
    exportMMPFile();
    showToast("MMP 文件已导出", "success");
  };

  const handleClear = () => {
    setClearDialogOpen(true);
  };

  const confirmClear = () => {
    clearMMPLog();
    setLog([]);
    setClearDialogOpen(false);
    showToast("操作日志已清空", "warning");
  };

  return (
    <div className="relative min-h-screen gradient-bg-mesh">
      {/* 背景装饰 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl animate-float-slow" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl animate-float" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* 顶部标题 */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                <FileCode className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-foreground">
                .mmp 文件系统
              </h1>
              <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0">
                实时自动记录
              </Badge>
            </div>
            <p className="text-muted-foreground">
              全程操作自动上链，每一步都可追溯、可审计
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" onClick={refresh}>
              <RefreshCw className="w-4 h-4 mr-1.5" />
              刷新
            </Button>
            <Button variant="outline" onClick={handleClear}>
              <Trash2 className="w-4 h-4 mr-1.5" />
              清空日志
            </Button>
            <Button
              onClick={handleExport}
              className="gradient-bg text-white shadow-lg shadow-indigo-500/25"
            >
              <Download className="w-4 h-4 mr-1.5" />
              导出 .mmp 文件
            </Button>
          </div>
        </div>

        {/* ============ 实时操作流 ============ */}
        <Card className="glass-card-strong border-indigo-200/60 dark:border-indigo-700/60">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <div className="relative">
                    <Activity className="w-5 h-5 text-indigo-600" />
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full" />
                  </div>
                  实时操作流
                  <Badge variant="outline" className="text-xs font-mono">
                    {log.length} 条记录
                  </Badge>
                </CardTitle>
                <CardDescription>
                  所有成员操作自动记录，按时间倒序
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {ROLE_FILTERS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setRoleFilter(f.value)}
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium transition-all",
                      roleFilter === f.value
                        ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredLog.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Boxes className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p className="text-sm">
                  开始使用系统后这里会自动记录每一步操作
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[480px] overflow-y-auto pr-2">
                <AnimatePresence initial={false}>
                  {filteredLog.map((entry) => (
                    <motion.div
                      key={entry.id}
                      layout
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.25 }}
                      onClick={() => setDetailEntry(entry)}
                      className="group flex items-center gap-3 p-3 rounded-xl bg-white/60 dark:bg-gray-800/40 border border-gray-200/60 dark:border-gray-700/60 hover:border-indigo-300/80 dark:hover:border-indigo-600/80 hover:shadow-md cursor-pointer transition-all"
                    >
                      <div
                        className={cn(
                          "w-9 h-9 rounded-xl bg-gradient-to-br flex items-center justify-center text-white text-xs font-semibold shrink-0",
                          ROLE_COLORS[entry.role]
                        )}
                      >
                        {entry.roleName.slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <Badge className={cn("text-xs", ROLE_BADGE[entry.role])}>
                            {entry.roleName}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {entry.actionLabel}
                          </span>
                          {entry.file && (
                            <code className="text-[11px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-300">
                              {entry.file}
                            </code>
                          )}
                          <span className="text-xs text-muted-foreground ml-auto">
                            {new Date(entry.timestamp).toLocaleTimeString("zh-CN")}
                          </span>
                        </div>
                        <div className="text-sm text-foreground truncate">
                          {entry.description}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground font-mono">
                          <span className="flex items-center gap-1">
                            <Hash className="w-3 h-3" />
                            {entry.hashShort}
                          </span>
                          <span className="flex items-center gap-1">
                            <Blocks className="w-3 h-3" />#{entry.blockNumber}
                          </span>
                        </div>
                      </div>
                      <ChevronDown className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ============ 区块链存证 ============ */}
        <Card className="glass-card-strong relative overflow-hidden border-purple-300/60 dark:border-purple-600/60">
          {/* 发光装饰 */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-3xl" />

          <CardHeader className="relative">
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg shadow-purple-500/30">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <CardTitle className="flex items-center gap-2">
                链上存证
                <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 shadow-md">
                  <Check className="w-3 h-3 mr-1" />
                  已验证
                </Badge>
              </CardTitle>
            </div>
            <CardDescription>
              文件哈希实时写入区块链，不可篡改
            </CardDescription>
          </CardHeader>

          <CardContent className="relative">
            <div className="grid md:grid-cols-[1fr_auto] gap-6 items-center">
              {/* 左侧：存证信息 */}
              <div className="space-y-3 font-mono text-sm">
                <AttestRow
                  label="File SHA-256"
                  value={fileHash.hash}
                  icon={Fingerprint}
                  onCopy={() => handleCopy(fileHash.hash, "文件哈希已复制")}
                  monoBreak
                />
                <AttestRow
                  label="Block Number"
                  value={`#${latestBlockNumber}`}
                  icon={Blocks}
                />
                <AttestRow
                  label="Transaction Hash"
                  value={latestTxHash}
                  icon={Link2}
                  onCopy={() => handleCopy(latestTxHash, "交易哈希已复制")}
                  monoBreak
                />
                <AttestRow
                  label="Gas Used"
                  value={`${latestEntry?.gasUsed ?? 21000} / 50000`}
                  icon={Zap}
                />
                <AttestRow
                  label="Timestamp"
                  value={
                    latestEntry
                      ? new Date(latestEntry.timestamp).toLocaleString("zh-CN")
                      : "—"
                  }
                  icon={Info}
                />
                <div className="pt-2">
                  <Button
                    onClick={() => {
                      setChainViewedAt(Date.now());
                      setChainDialogOpen(true);
                    }}
                    className="gradient-bg text-white shadow-lg"
                  >
                    <ExternalLink className="w-4 h-4 mr-1.5" />
                    查看链上详情
                  </Button>
                </div>
              </div>

              {/* 右侧：QR 码 */}
              <div className="flex flex-col items-center gap-2 p-5 rounded-2xl bg-white dark:bg-gray-900 shadow-inner border border-purple-200/60 dark:border-purple-700/60">
                <QRCodeSVG
                  value={`https://etherscan.io/tx/${latestTxHash}`}
                  size={140}
                  bgColor="transparent"
                  fgColor="currentColor"
                  className="text-foreground"
                />
                <span className="text-[11px] text-muted-foreground text-center">
                  扫码到 Etherscan
                  <br />
                  查询完整记录
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ============ 文件章节结构 ============ */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              文件结构：8 大章节自动组织
            </CardTitle>
            <CardDescription>
              .mmp 文件遵循固定结构，系统自动填充内容，无需人工维护
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-3">
              {mmpChapters.map((ch) => {
                const open = expandedChapter === ch.id;
                return (
                  <button
                    key={ch.id}
                    onClick={() =>
                      setExpandedChapter(open ? null : ch.id)
                    }
                    className={cn(
                      "text-left rounded-xl border p-4 transition-all",
                      open
                        ? "bg-white dark:bg-gray-800 border-indigo-300 dark:border-indigo-600 shadow-md"
                        : "bg-white/50 dark:bg-gray-800/30 border-gray-200 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-700"
                    )}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center text-white font-bold text-xs shrink-0",
                          ch.gradient
                        )}
                      >
                        {ch.id}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm">{ch.title}</div>
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {ch.description}
                        </div>
                      </div>
                      {open ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    {open && (
                      <div className="mt-3 space-y-2 pl-11">
                        {ch.fields.map((f, idx) => (
                          <div key={idx} className="text-xs">
                            <span className="text-muted-foreground">
                              {f.label}：
                            </span>
                            <span className="text-foreground">{f.value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* ============ 价值说明 ============ */}
        <Card className="glass-card border-emerald-200/60 dark:border-emerald-700/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              为什么需要 .mmp 文件？
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-4 text-sm">
            <ValueCard
              icon={Database}
              title="全程可追溯"
              desc="从题目下发到论文提交，每一步都被系统记录，审核无死角。"
            />
            <ValueCard
              icon={Lock}
              title="防篡改存证"
              desc="关键节点自动上链，哈希校验保证数据真实性。"
            />
            <ValueCard
              icon={Search}
              title="赛后沉淀"
              desc="成为团队能力 Card 和知识库的一手数据源。"
            />
          </CardContent>
        </Card>
      </div>

      {/* ==================== 详情 Dialog：单条日志 ==================== */}
      <Dialog
        open={!!detailEntry}
        onOpenChange={(o) => !o && setDetailEntry(null)}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Hash className="w-4 h-4" />
              操作详情
            </DialogTitle>
            <DialogDescription>链上存证完整记录</DialogDescription>
          </DialogHeader>
          {detailEntry && (
            <div className="space-y-3 font-mono text-xs">
              <KV label="角色" value={`${detailEntry.roleName}（${detailEntry.role}）`} />
              <KV label="操作" value={detailEntry.actionLabel} />
              {detailEntry.file && <KV label="文件" value={detailEntry.file} />}
              <KV label="描述" value={detailEntry.description} />
              <KV
                label="时间"
                value={new Date(detailEntry.timestamp).toLocaleString("zh-CN")}
              />
              <KV label="SHA-256" value={detailEntry.hash} break />
              <KV label="区块号" value={`#${detailEntry.blockNumber}`} />
              <KV label="交易哈希" value={detailEntry.txHash} break />
              <KV label="Gas" value={`${detailEntry.gasUsed}`} />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ==================== 清空日志确认 Dialog ==================== */}
      <Dialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-rose-500" />
              确认清空日志
            </DialogTitle>
            <DialogDescription>
              确定要清空所有操作日志吗？此操作不可撤销。
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setClearDialogOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={confirmClear}>
              确认清空
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ==================== 链上详情 Dialog ==================== */}
      <Dialog open={chainDialogOpen} onOpenChange={setChainDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-600" />
              区块链浏览器 · 链上详情
            </DialogTitle>
            <DialogDescription>
              完整的链上交易记录（演示数据，格式贴近 Etherscan）
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 font-mono text-xs bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <EtherRow label="Block Number" value={`#${latestBlockNumber}`} />
            <EtherRow
              label="Timestamp"
              value={
                latestEntry
                  ? `${new Date(latestEntry.timestamp).toLocaleString("zh-CN")} (${
                      Math.floor(
                        ((chainViewedAt ?? latestEntry.timestamp) - latestEntry.timestamp) / 1000
                      )
                    }s ago)`
                  : "—"
              }
            />
            <EtherRow
              label="Transaction Hash"
              value={latestTxHash}
              copy
              onCopy={() => handleCopy(latestTxHash)}
            />
            <EtherRow
              label="From"
              value="0xCmAmSySzhoUKeHanZhangSanLiSi0000aabbccdd"
              copy
              onCopy={() =>
                handleCopy("0xCmAmSySzhoUKeHanZhangSanLiSi0000aabbccdd")
              }
            />
            <EtherRow
              label="To (Contract)"
              value="0xCmAmSysAttestation0v01Mmp000000000000dead"
              copy
              onCopy={() =>
                handleCopy("0xCmAmSysAttestation0v01Mmp000000000000dead")
              }
            />
            <EtherRow
              label="Input Data"
              value={`writeMmpHash(bytes32 0x${fileHash.hash.slice(0, 32)}...)`}
            />
            <EtherRow label="Gas Used" value={`${latestEntry?.gasUsed ?? 0}`} />
            <EtherRow label="Gas Price" value="21 Gwei" />
            <EtherRow label="Status" value="✓ Success" />
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">
            * 当前为演示网络（CMAMSys Testnet），正式版将对接以太坊主网或联盟链。
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  子组件                                                             */
/* ------------------------------------------------------------------ */
interface AttestRowProps {
  label: string;
  value: string;
  icon: React.ElementType;
  onCopy?: () => void;
  monoBreak?: boolean;
}
function AttestRow({
  label,
  value,
  icon: Icon,
  onCopy,
  monoBreak,
}: AttestRowProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex items-center gap-2 w-40 shrink-0 text-muted-foreground">
        <Icon className="w-4 h-4" />
        <span className="text-xs font-sans">{label}</span>
      </div>
      <div
        className={cn(
          "flex-1 text-foreground",
          monoBreak && "break-all"
        )}
      >
        {value}
      </div>
      {onCopy && (
        <button
          onClick={onCopy}
          className="text-muted-foreground hover:text-foreground p-1 rounded transition-colors"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

function KV({
  label,
  value,
  break: shouldBreak,
}: {
  label: string;
  value: string;
  break?: boolean;
}) {
  return (
    <div className="flex gap-3">
      <span className="w-24 shrink-0 text-muted-foreground">{label}</span>
      <span className={cn("flex-1 text-foreground", shouldBreak && "break-all")}>
        {value}
      </span>
    </div>
  );
}

function EtherRow({
  label,
  value,
  copy,
  onCopy,
}: {
  label: string;
  value: string;
  copy?: boolean;
  onCopy?: () => void;
}) {
  return (
    <div className="flex items-start gap-3 py-1.5 border-b border-dashed border-gray-200 dark:border-gray-700 last:border-0">
      <span className="w-36 shrink-0 text-gray-500 dark:text-gray-400">
        {label}
      </span>
      <span className="flex-1 text-gray-900 dark:text-gray-100 break-all">
        {value}
      </span>
      {copy && onCopy && (
        <button
          onClick={onCopy}
          className="text-gray-400 hover:text-indigo-500 p-0.5 transition-colors"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

function ValueCard({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
}) {
  return (
    <div className="p-4 rounded-xl bg-white/60 dark:bg-gray-800/40 border border-gray-200/60 dark:border-gray-700/60">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-emerald-600" />
        <span className="font-semibold text-sm">{title}</span>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}
