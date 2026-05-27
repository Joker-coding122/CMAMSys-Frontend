/**
 * 团队数据管理（前端 localStorage 持久化）
 */
import { logMMP } from "./mmp-logger";

export type TeamRole = "modeler" | "coder" | "writer" | "leader" | "member";

export const TEAM_ROLE_LABELS: Record<TeamRole, string> = {
  modeler: "建模手",
  coder: "编程手",
  writer: "论文手",
  leader: "队长",
  member: "暂未分配",
};

export function getTriHandRoleLabel(role: TeamRole | undefined): string {
  if (role === "modeler" || role === "coder" || role === "writer") {
    return TEAM_ROLE_LABELS[role];
  }
  return "暂未确定";
}

export interface TeamMember {
  id: string;
  name: string;
  role: TeamRole;
  avatar?: string;
}

export interface Team {
  id: string;
  name: string;
  competition: string;
  goal: string;
  inviteCode: string;
  createdAt: number;
  progress: number; // 0-100
  members: TeamMember[];
  currentStage: string; // 例如 "第二轮方案融合中"
  color: "indigo" | "purple" | "cyan" | "emerald" | "amber" | "rose";
}

const STORAGE_KEY = "cmam_teams";
const CURRENT_TEAM_KEY = "cmam_current_team";

const COLORS: Team["color"][] = [
  "indigo",
  "purple",
  "cyan",
  "emerald",
  "amber",
  "rose",
];

const TEAM_ROLES: TeamRole[] = ["modeler", "coder", "writer", "leader", "member"];

function genId(): string {
  return (
    Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4)
  );
}

export function genInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

function normalizeTeamRole(role: unknown): TeamRole {
  return typeof role === "string" && TEAM_ROLES.includes(role as TeamRole)
    ? role as TeamRole
    : "member";
}

function normalizeTeamMembers(members: unknown): TeamMember[] {
  if (!Array.isArray(members)) return [];
  const usedIds = new Set<string>();

  return members.reduce<TeamMember[]>((list, rawMember, idx) => {
    if (!rawMember || typeof rawMember !== "object") return list;
    const member = rawMember as Partial<TeamMember>;
    const name = typeof member.name === "string" ? member.name.trim() : "";
    if (!name || name === "张三（建模手）") return list;

    const baseId =
      typeof member.id === "string" && member.id.trim()
        ? member.id.trim()
        : `member-${idx}`;
    let nextId = baseId;
    let suffix = 1;
    while (usedIds.has(nextId)) {
      nextId = `${baseId}-${suffix}`;
      suffix += 1;
    }
    usedIds.add(nextId);

    list.push({
      id: nextId,
      name,
      role: normalizeTeamRole(member.role),
      avatar: typeof member.avatar === "string" ? member.avatar : undefined,
    });
    return list;
  }, []);
}

export function readTeams(): Team[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    return list.map((team: Team) => ({
      ...team,
      members: normalizeTeamMembers(team.members),
    }));
  } catch {
    return [];
  }
}

export function writeTeams(teams: Team[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(teams.map((team) => ({ ...team, members: normalizeTeamMembers(team.members) })))
  );
}

export function createTeam(input: {
  name: string;
  competition: string;
  goal: string;
  leaderName: string;
  leaderRole?: TeamRole;
}): Team {
  const teams = readTeams();
  const team: Team = {
    id: genId(),
    name: input.name,
    competition: input.competition,
    goal: input.goal,
    inviteCode: genInviteCode(),
    createdAt: Date.now(),
    progress: 5,
    currentStage: "团队刚创建，等待成员加入",
    color: COLORS[teams.length % COLORS.length],
    members: [
      {
        id: genId(),
        name: input.leaderName,
        role: input.leaderRole ?? "member",
      },
    ],
  };
  writeTeams([team, ...teams]);
  logMMP({
    role: "leader",
    action: "create_team",
    description: `创建团队「${team.name}」参加 ${team.competition}`,
  });
  return team;
}

export function joinTeamByCode(
  code: string,
  member: { name: string; role?: TeamRole }
): Team | null {
  const teams = readTeams();
  const idx = teams.findIndex(
    (t) => t.inviteCode.toUpperCase() === code.toUpperCase()
  );
  if (idx === -1) return null;
  const team = teams[idx];
  // 避免重复加入同名成员
  if (!team.members.some((m) => m.name === member.name)) {
    team.members = [
      ...team.members,
      { id: genId(), name: member.name, role: member.role ?? "member" },
    ];
    team.progress = Math.min(100, team.progress + 5);
    team.currentStage = `${member.name} 刚加入团队`;
    teams[idx] = team;
    writeTeams(teams);
    logMMP({
      role: "leader",
      action: "join_team",
      description: `${member.name} 加入团队「${team.name}」`,
    });
  }
  return team;
}

export function getCurrentTeamId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(CURRENT_TEAM_KEY);
}

export function setCurrentTeamId(id: string | null): void {
  if (typeof window === "undefined") return;
  if (id) localStorage.setItem(CURRENT_TEAM_KEY, id);
  else localStorage.removeItem(CURRENT_TEAM_KEY);
}

export function getCurrentTeam(): Team | null {
  const id = getCurrentTeamId();
  if (!id) return null;
  return readTeams().find((t) => t.id === id) ?? null;
}

export function getTeamById(id: string): Team | null {
  return readTeams().find((t) => t.id === id) ?? null;
}

export function getTeamMemberByName(team: Team | null, name: string): TeamMember | null {
  if (!team) return null;
  return team.members.find((member) => member.name === name) ?? null;
}

export function upsertCurrentTeam(team: Team): void {
  const teams = readTeams();
  const idx = teams.findIndex((t) => t.id === team.id);
  if (idx === -1) {
    writeTeams([team, ...teams]);
  } else {
    teams[idx] = team;
    writeTeams(teams);
  }
  setCurrentTeamId(team.id);
}

/* ---------- 演示数据：首次登录填充一个示例团队 ---------- */
export function seedSampleTeam(leaderName: string): void {
  const existing = readTeams();
  if (existing.length > 0) return;

  const sample: Team = {
    id: genId(),
    name: "数模之星队",
    competition: "2025 国赛 A 题",
    goal: "冲刺国家一等奖",
    inviteCode: "MCM2025",
    createdAt: Date.now() - 1000 * 60 * 60 * 24,
    progress: 65,
    currentStage: "建模手第二轮方案融合中",
    color: "indigo",
    members: [
      { id: genId(), name: leaderName, role: "member" },
      { id: genId(), name: "李四（编程手）", role: "coder" },
      { id: genId(), name: "王五（论文手）", role: "writer" },
    ],
  };
  writeTeams([sample]);
}
