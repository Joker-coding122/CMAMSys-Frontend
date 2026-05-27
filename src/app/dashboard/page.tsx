"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Plus,
  LogIn,
  ArrowRight,
  CalendarDays,
  ClipboardList,
  Clock,
  Target,
  BookOpen,
  FileCode,
  ChevronRight,
  Copy,
  Check,
  Activity,
  Brain,
  Code,
  PenTool,
  Crown,
  HelpCircle,
  BarChart3,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/contexts/auth-context";
import {
  readTeams,
  joinTeamByCode,
  setCurrentTeamId,
  getCurrentTeamId,
  getTeamMemberByName,
  getTriHandRoleLabel,
  seedSampleTeam,
  Team,
} from "@/lib/teams-storage";
import { readMMPLog } from "@/lib/mmp-logger";
import { cn } from "@/lib/utils";

const TEAM_ACCENTS: Record<Team["color"], {
  rail: string;
  icon: string;
  text: string;
  soft: string;
}> = {
  indigo: {
    rail: "bg-chart-1",
    icon: "bg-chart-1 text-white",
    text: "text-chart-1",
    soft: "bg-chart-1/10 text-chart-1",
  },
  purple: {
    rail: "bg-chart-5",
    icon: "bg-chart-5 text-white",
    text: "text-chart-5",
    soft: "bg-chart-5/10 text-chart-5",
  },
  cyan: {
    rail: "bg-chart-2",
    icon: "bg-chart-2 text-white",
    text: "text-chart-2",
    soft: "bg-chart-2/10 text-chart-2",
  },
  emerald: {
    rail: "bg-chart-3",
    icon: "bg-chart-3 text-white",
    text: "text-chart-3",
    soft: "bg-chart-3/10 text-chart-3",
  },
  amber: {
    rail: "bg-chart-4",
    icon: "bg-chart-4 text-white",
    text: "text-chart-4",
    soft: "bg-chart-4/10 text-chart-4",
  },
  rose: {
    rail: "bg-rose-500",
    icon: "bg-rose-500 text-white",
    text: "text-rose-600",
    soft: "bg-rose-500/10 text-rose-600",
  },
};

const roleFlow = [
  { label: "建模手", value: "题意解析", icon: Brain, color: "bg-chart-1" },
  { label: "编程手", value: "模型实现", icon: Code, color: "bg-chart-2" },
  { label: "论文手", value: "成果表达", icon: PenTool, color: "bg-chart-4" },
];

const ROLE_ICON: Record<string, React.ElementType> = {
  modeler: Brain,
  coder: Code,
  writer: PenTool,
  leader: Crown,
  member: Users,
  undecided: HelpCircle,
};

function getRoleWorkspaceHref(role: Team["members"][number]["role"] | undefined) {
  switch (role) {
    case "modeler":
      return "/modeler";
    case "coder":
      return "/programmer";
    case "writer":
      return "/writer";
    default:
      return null;
  }
}

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();

  const [teams, setTeams] = useState<Team[]>([]);
  const [currentTeamId, setCurrentTeamIdState] = useState<string | null>(null);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // 初始化：种子示例团队 + 读取
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (user?.displayName) {
        seedSampleTeam(user.displayName);
      }
      setTeams(readTeams());
      setCurrentTeamIdState(getCurrentTeamId());
    }, 0);

    return () => window.clearTimeout(timer);
  }, [user?.displayName]);

  /* ---------- 统计 ---------- */
  const stats = useMemo(() => {
    const mmpCount = readMMPLog().length;
    const totalMembers = teams.reduce((sum, t) => sum + t.members.length, 0);
    return {
      teamCount: teams.length,
      mmpCount,
      totalMembers,
    };
  }, [teams]);

  const currentUserName = user?.displayName || user?.username || "";
  const currentTeam = useMemo(() => {
    if (!teams.length) return null;
    if (currentTeamId) {
      return teams.find((team) => team.id === currentTeamId) ?? teams[0];
    }
    return teams[0];
  }, [currentTeamId, teams]);
  const currentTeamMember = useMemo(
    () => getTeamMemberByName(currentTeam, currentUserName),
    [currentTeam, currentUserName]
  );
  const currentRoleLabel = getTriHandRoleLabel(currentTeamMember?.role);
  const isTriHandRole =
    currentTeamMember?.role === "modeler" ||
    currentTeamMember?.role === "coder" ||
    currentTeamMember?.role === "writer";
  const headerRoleLabel = isTriHandRole ? currentRoleLabel : "待确认分工";
  const HeaderRoleIcon =
    isTriHandRole && currentTeamMember?.role ? ROLE_ICON[currentTeamMember.role] : HelpCircle;
  const headerRoleHref = getRoleWorkspaceHref(currentTeamMember?.role);

  /* ---------- 操作 ---------- */
  const handleEnterRoleWorkspace = () => {
    if (!headerRoleHref) return;
    router.push(headerRoleHref);
  };

  const handleEnter = (team: Team) => {
    setCurrentTeamId(team.id);
    setCurrentTeamIdState(team.id);
    window.dispatchEvent(new Event("cmam-current-team-change"));
    showToast(`已进入团队「${team.name}」`, "success");
    router.push("/");
  };

  const handleSelectTeam = (team: Team) => {
    setCurrentTeamId(team.id);
    setCurrentTeamIdState(team.id);
    window.dispatchEvent(new Event("cmam-current-team-change"));
    showToast(`当前团队已切换为「${team.name}」`, "success");
  };

  const handleAdjustRoles = (team: Team) => {
    setCurrentTeamId(team.id);
    setCurrentTeamIdState(team.id);
    window.dispatchEvent(new Event("cmam-current-team-change"));
    router.push(`/team?teamId=${team.id}&mode=editRoles`);
  };

  const handleJoin = () => {
    const code = joinCode.trim().toUpperCase();
    if (!code) {
      showToast("请输入邀请码", "warning");
      return;
    }
    const team = joinTeamByCode(code, {
      name: user?.displayName ?? "未知成员",
      role: "member",
    });
    if (!team) {
      showToast("邀请码无效或团队不存在", "warning");
      return;
    }
    setTeams(readTeams());
    setCurrentTeamId(team.id);
    setCurrentTeamIdState(team.id);
    window.dispatchEvent(new Event("cmam-current-team-change"));
    setJoinDialogOpen(false);
    setJoinCode("");
    showToast(`已加入「${team.name}」`, "success");
  };

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      showToast(`邀请码 ${code} 已复制`, "success");
    } catch {
      showToast("复制失败，请手动复制", "warning");
    }
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="min-h-screen gradient-bg-mesh">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <header className="mb-6 flex flex-col gap-4 rounded-3xl border border-border/70 bg-card/95 p-5 shadow-[var(--shadow-card)] lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-lg font-bold text-primary-foreground shadow-sm">
              {(user?.displayName || "U").slice(0, 1).toUpperCase()}
            </div>
            <div>
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-foreground">
                  你好，{user?.displayName || "队员"}
                </h1>
                <Badge variant="secondary">{currentRoleLabel}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                当前团队：{currentTeam?.name || "暂未选择"} · 每次协作都会同步沉淀到 MMP 记录
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:justify-end">
            {headerRoleHref ? (
              <button
                type="button"
                onClick={handleEnterRoleWorkspace}
                aria-label={`进入${headerRoleLabel}工作台`}
                className="group flex min-h-12 min-w-0 items-center gap-3 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-left text-primary transition-all hover:-translate-y-0.5 hover:border-primary/35 hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 sm:min-w-60"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                  <HeaderRoleIcon className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">
                    进入{headerRoleLabel}工作台
                  </span>
                  <span className="block truncate text-xs text-primary/70">
                    {currentTeam?.name || "暂无当前团队"}
                  </span>
                </span>
                <ArrowRight className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
              </button>
            ) : (
              <div className="flex min-h-12 min-w-0 items-center gap-3 rounded-full border border-border/60 bg-muted/40 px-4 py-2 text-muted-foreground sm:min-w-60">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-background/80">
                  <HeaderRoleIcon className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-foreground">
                    当前分工 · {headerRoleLabel}
                  </span>
                  <span className="block truncate text-xs">
                    {currentTeam?.name || "暂无当前团队"}
                  </span>
                </span>
              </div>
            )}
            <Button
              onClick={() => router.push("/team")}
              className="min-h-10 gap-1.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="size-4" />
              创建团队
            </Button>
          </div>
        </header>

        <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardMetric label="我的团队" value={stats.teamCount} icon={Users} tone="primary" />
          <DashboardMetric label="协作成员" value={stats.totalMembers} icon={Target} tone="success" />
          <DashboardMetric label="MMP 记录" value={stats.mmpCount} icon={Activity} tone="accent" />
          <DashboardMetric label="当前进度" value={`${currentTeam?.progress ?? 0}%`} icon={BarChart3} tone="warning" />
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <main className="space-y-6">
            <Card className="rounded-3xl border-border/70 bg-card/95 shadow-[var(--shadow-card)]">
              <CardHeader className="px-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <CardTitle className="text-xl">当前协作工作台</CardTitle>
                    <CardDescription>
                      以团队为中心组织建模、代码、论文和 MMP 复盘
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="w-fit">
                    <CalendarDays className="size-3" />
                    今日待推进
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-5 px-5">
                {currentTeam ? (
                  <>
                    <div className="rounded-2xl border border-border/70 bg-gradient-bg-subtle p-5">
                      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h2 className="text-lg font-semibold text-foreground">{currentTeam.name}</h2>
                          <p className="mt-1 text-sm text-muted-foreground">{currentTeam.competition}</p>
                        </div>
                        <Badge className={cn("border-0", TEAM_ACCENTS[currentTeam.color].soft)}>
                          {currentTeam.members.length} 位成员
                        </Badge>
                      </div>
                      <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{currentTeam.goal}</p>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="font-medium text-foreground">项目进度</span>
                        <span className={cn("font-semibold tabular-nums", TEAM_ACCENTS[currentTeam.color].text)}>
                          {currentTeam.progress}%
                        </span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-background/80">
                        <div
                          className={cn("h-full rounded-full transition-all", TEAM_ACCENTS[currentTeam.color].rail)}
                          style={{ width: `${currentTeam.progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-3">
                      {roleFlow.map((item) => {
                        const Icon = item.icon;
                        return (
                          <div key={item.label} className="rounded-2xl border border-border/70 bg-background/70 p-4">
                            <div className={cn("mb-3 flex size-9 items-center justify-center rounded-xl text-white", item.color)}>
                              <Icon className="size-4" />
                            </div>
                            <div className="text-sm font-semibold text-foreground">{item.label}</div>
                            <div className="mt-1 text-xs text-muted-foreground">{item.value}</div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-background/70 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <Clock className="size-5" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-foreground">当前阶段</div>
                          <div className="text-sm text-muted-foreground">{currentTeam.currentStage}</div>
                        </div>
                      </div>
                      <Button onClick={() => handleEnter(currentTeam)} className="min-h-10 gap-1.5 rounded-xl">
                        进入协作空间
                        <ArrowRight className="size-4" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <EmptyTeamState onJoin={() => setJoinDialogOpen(true)} onCreate={() => router.push("/team")} />
                )}
              </CardContent>
            </Card>

            <section>
              <SectionHeading
                title="我加入的团队"
                desc="点击卡片切换当前团队，保持团队任务流清晰可见"
                action={(
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setJoinDialogOpen(true)} className="min-h-10 gap-1.5 rounded-xl">
                      <LogIn className="size-4" />
                      加入团队
                    </Button>
                    <Button onClick={() => router.push("/team")} className="min-h-10 gap-1.5 rounded-xl">
                      <Plus className="size-4" />
                      创建团队
                    </Button>
                  </div>
                )}
              />

              {teams.length === 0 ? (
                <EmptyTeamState onJoin={() => setJoinDialogOpen(true)} onCreate={() => router.push("/team")} />
              ) : (
                <div className="grid gap-4 lg:grid-cols-2">
                  {teams.map((team) => (
                    <TeamCard
                      key={team.id}
                      team={team}
                      active={currentTeam?.id === team.id}
                      copied={copiedCode === team.inviteCode}
                      onSelect={() => handleSelectTeam(team)}
                      onEnter={() => handleEnter(team)}
                      onAdjustRoles={() => handleAdjustRoles(team)}
                      onCopy={() => handleCopyCode(team.inviteCode)}
                    />
                  ))}
                </div>
              )}
            </section>
          </main>

          <aside className="space-y-6">
            <Card className="rounded-3xl border-border/70 bg-card/95 shadow-[var(--shadow-card)]">
              <CardHeader className="px-5">
                <CardTitle className="text-base">快捷入口</CardTitle>
                <CardDescription>围绕一次建模任务的高频操作</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 px-5">
                <QuickLink title="协作工作流" desc="三手分工协作" icon={Activity} tone="primary" onClick={() => router.push("/workflow")} />
                <QuickLink title="知识库" desc="论文、思路、案例检索" icon={BookOpen} tone="success" onClick={() => router.push("/knowledge")} />
                <QuickLink title=".mmp 文件" desc="操作流与存证记录" icon={FileCode} tone="accent" onClick={() => router.push("/mmp")} />
                <QuickLink title="产品教程" desc="5 分钟了解机制" icon={HelpCircle} tone="warning" onClick={() => router.push("/guide")} />
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-border/70 bg-card/95 shadow-[var(--shadow-card)]">
              <CardHeader className="px-5">
                <CardTitle className="text-base">团队成员</CardTitle>
                <CardDescription>{currentTeam?.name || "暂未选择团队"}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 px-5">
                {currentTeam?.members.length ? currentTeam.members.map((member) => {
                  const Icon = ROLE_ICON[member.role] ?? Users;
                  return (
                    <div key={member.id} className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background/70 p-3">
                      <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Icon className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-foreground">{member.name}</div>
                        <div className="text-xs text-muted-foreground">{getTriHandRoleLabel(member.role)}</div>
                      </div>
                    </div>
                  );
                }) : (
                  <p className="text-sm text-muted-foreground">选择团队后会显示成员分工。</p>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-border/70 bg-card/95 shadow-[var(--shadow-card)]">
              <CardHeader className="px-5">
                <CardTitle className="text-base">最近活动</CardTitle>
                <CardDescription>自动沉淀到 MMP 的关键动作</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 px-5">
                {[
                  { title: "团队切换", desc: currentTeam?.name || "等待选择团队", icon: Users },
                  { title: "阶段状态", desc: currentTeam?.currentStage || "暂无阶段", icon: ClipboardList },
                  { title: "MMP 记录", desc: `${stats.mmpCount} 条操作记录`, icon: FileCode },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.title}
                      type="button"
                      onClick={() => showToast(`${item.title}：${item.desc}`, "info")}
                      className="flex min-h-14 w-full items-center gap-3 rounded-2xl border border-border/60 bg-background/70 p-3 text-left transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                    >
                      <div className="flex size-9 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                        <Icon className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-foreground">{item.title}</div>
                        <div className="truncate text-xs text-muted-foreground">{item.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>

      <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LogIn className="w-5 h-5 text-indigo-600" />
              通过邀请码加入团队
            </DialogTitle>
            <DialogDescription>
              向队长索取 6 位邀请码，输入后即可加入团队
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="例如：MCM2025"
              maxLength={6}
              className="h-12 text-lg font-mono text-center tracking-[0.4em] uppercase"
              onKeyDown={(e) => e.key === "Enter" && handleJoin()}
            />
            <p className="text-xs text-muted-foreground mt-2 text-center">
              提示：试试演示码 <code className="px-1 font-mono">MCM2025</code>
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setJoinDialogOpen(false)}
              className="flex-1"
            >
              取消
            </Button>
            <Button
              onClick={handleJoin}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <ChevronRight className="w-4 h-4 mr-1" />
              加入
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ---------- 子组件 ---------- */
function DashboardMetric({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  tone: "primary" | "success" | "accent" | "warning";
}) {
  const toneMap = {
    primary: "bg-chart-1/10 text-chart-1 border-chart-1/20",
    success: "bg-chart-3/10 text-chart-3 border-chart-3/20",
    accent: "bg-chart-2/10 text-chart-2 border-chart-2/20",
    warning: "bg-chart-4/10 text-chart-4 border-chart-4/20",
  };

  return (
    <div className="rounded-2xl border border-border/70 bg-card/95 p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
          <div className="mt-2 text-3xl font-bold tabular-nums text-foreground">{value}</div>
        </div>
        <div className={cn("flex size-11 items-center justify-center rounded-xl border", toneMap[tone])}>
          <Icon className="size-5" />
        </div>
      </div>
    </div>
  );
}

function SectionHeading({
  title,
  desc,
  action,
}: {
  title: string;
  desc?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
        {desc && <p className="mt-1 text-sm text-muted-foreground">{desc}</p>}
      </div>
      {action}
    </div>
  );
}

function QuickLink({
  title,
  desc,
  icon: Icon,
  tone,
  onClick,
}: {
  title: string;
  desc: string;
  icon: React.ElementType;
  tone: "primary" | "success" | "accent" | "warning";
  onClick: () => void;
}) {
  const toneMap = {
    primary: "bg-chart-1/10 text-chart-1",
    success: "bg-chart-3/10 text-chart-3",
    accent: "bg-chart-2/10 text-chart-2",
    warning: "bg-chart-4/10 text-chart-4",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex min-h-16 w-full items-center gap-3 rounded-2xl border border-border/70 bg-background/70 p-3 text-left transition-all hover:-translate-y-0.5 hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
    >
      <div
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105",
          toneMap[tone]
        )}
      >
        <Icon className="size-5" />
      </div>
      <div className="min-w-0">
        <div className="font-semibold text-foreground">{title}</div>
        <div className="text-xs leading-relaxed text-muted-foreground">{desc}</div>
      </div>
      <ArrowRight className="ml-auto size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </button>
  );
}

function EmptyTeamState({
  onJoin,
  onCreate,
}: {
  onJoin: () => void;
  onCreate: () => void;
}) {
  return (
    <Card className="rounded-3xl border-border/70 bg-card/95 shadow-[var(--shadow-card)]">
      <CardContent className="py-12 text-center">
        <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Users className="size-10" />
        </div>
        <h3 className="mb-2 text-lg font-semibold">还没有加入任何团队</h3>
        <p className="mx-auto mb-6 max-w-md text-sm text-muted-foreground">
          创建一个新团队开始参赛，或用邀请码加入已有团队开始协作。
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button variant="outline" onClick={onJoin} className="min-h-10 rounded-xl">
            <LogIn className="size-4" />
            输入邀请码
          </Button>
          <Button onClick={onCreate} className="min-h-10 rounded-xl">
            <Plus className="size-4" />
            创建团队
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function TeamCard({
  team,
  active,
  copied,
  onSelect,
  onEnter,
  onAdjustRoles,
  onCopy,
}: {
  team: Team;
  active: boolean;
  copied: boolean;
  onSelect: () => void;
  onEnter: () => void;
  onAdjustRoles: () => void;
  onCopy: () => void;
}) {
  const accent = TEAM_ACCENTS[team.color];

  return (
    <Card
      className={cn(
        "group relative cursor-pointer rounded-3xl border-border/70 bg-card/95 shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)]",
        active && "ring-2 ring-primary/45"
      )}
      onClick={onSelect}
    >
      <div className={cn("absolute inset-y-5 left-0 w-1 rounded-r-full", accent.rail)} />
      <CardHeader className="px-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div className={cn("flex size-11 shrink-0 items-center justify-center rounded-2xl font-bold", accent.icon)}>
              {team.name.slice(0, 1)}
            </div>
            <div className="min-w-0">
              <CardTitle className="truncate text-base">{team.name}</CardTitle>
              <CardDescription className="truncate text-xs">{team.competition}</CardDescription>
            </div>
          </div>
          <Badge variant={active ? "default" : "outline"} className="shrink-0">
            {active ? "当前" : `${team.members.length} 人`}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 px-5">
        <p className="line-clamp-2 text-sm text-muted-foreground">{team.goal}</p>
        <div>
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">项目进度</span>
            <span className={cn("font-semibold tabular-nums", accent.text)}>{team.progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className={cn("h-full rounded-full transition-all", accent.rail)} style={{ width: `${team.progress}%` }} />
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-2xl bg-muted/60 p-3 text-xs text-muted-foreground">
          <Clock className="size-3.5 shrink-0" />
          <span className="truncate">{team.currentStage}</span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex -space-x-2">
            {team.members.slice(0, 4).map((member) => {
              const Icon = ROLE_ICON[member.role] ?? Users;
              return (
                <div
                  key={member.id}
                  title={`${member.name} (${getTriHandRoleLabel(member.role)})`}
                  className="flex size-8 items-center justify-center rounded-full border-2 border-card bg-primary/10 text-primary shadow-sm"
                >
                  <Icon className="size-3.5" />
                </div>
              );
            })}
            {team.members.length > 4 && (
              <div className="flex size-8 items-center justify-center rounded-full border-2 border-card bg-muted text-[10px] font-medium">
                +{team.members.length - 4}
              </div>
            )}
          </div>
          <button
            type="button"
            aria-label={`复制 ${team.name} 的邀请码`}
            onClick={(event) => {
              event.stopPropagation();
              onCopy();
            }}
            className="flex min-h-9 items-center gap-1 rounded-lg bg-muted px-2 text-xs font-mono transition-colors hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          >
            {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
            {team.inviteCode}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            className="min-h-10 w-full rounded-xl"
            onClick={(event) => {
              event.stopPropagation();
              onEnter();
            }}
          >
            进入空间
            <ArrowRight className="size-4" />
          </Button>
          <Button
            variant="secondary"
            className="min-h-10 w-full rounded-xl"
            onClick={(event) => {
              event.stopPropagation();
              onAdjustRoles();
            }}
          >
            调整角色
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
