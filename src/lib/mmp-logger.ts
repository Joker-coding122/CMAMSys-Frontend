/**
 * MMP 日志统一工具
 * 所有用户操作都应通过 logMMP() 写入 localStorage.cmam_mmp_log
 * 供 /mmp 页面读取并展示"实时操作流"和"区块链存证"
 */
import CryptoJS from "crypto-js";

export type MMPRole = "modeler" | "coder" | "writer" | "system" | "leader";

export type MMPAction =
  | "edit"
  | "save"
  | "ai_chat"
  | "submit"
  | "submit_thought"
  | "submit_plan"
  | "submit_final"
  | "review"
  | "export"
  | "login"
  | "create_team"
  | "join_team"
  | "run_code"
  | "debug"
  | "custom";

export interface MMPLogEntry {
  id: string;
  timestamp: number;
  isoTime: string;
  role: MMPRole;
  roleName: string;
  action: MMPAction;
  actionLabel: string;
  file?: string;
  description: string;
  hash: string; // SHA-256
  hashShort: string; // 前 8 位
  blockNumber: number;
  gasUsed: number;
  txHash: string;
  contentPreview?: string;
}

const STORAGE_KEY = "cmam_mmp_log";
const BLOCK_SEED = 18234567; // 伪区块号起点（贴近以太坊实际高度）

/* ---------- 角色 / 动作 可视化映射 ---------- */
const ROLE_NAMES: Record<MMPRole, string> = {
  modeler: "建模手",
  coder: "编程手",
  writer: "论文手",
  system: "系统",
  leader: "队长",
};

const ACTION_LABELS: Record<MMPAction, string> = {
  edit: "编辑",
  save: "保存",
  ai_chat: "AI对话",
  submit: "提交",
  submit_thought: "提交思路",
  submit_plan: "提交方案",
  submit_final: "确认最终方案",
  review: "评审",
  export: "导出",
  login: "登录",
  create_team: "创建团队",
  join_team: "加入团队",
  run_code: "运行代码",
  debug: "调试",
  custom: "操作",
};

/* ---------- 工具函数 ---------- */
function genId(): string {
  return (
    Date.now().toString(36) + Math.random().toString(36).substring(2, 8)
  ).toUpperCase();
}

function calcHash(input: string): string {
  return CryptoJS.SHA256(input).toString(CryptoJS.enc.Hex);
}

function genTxHash(): string {
  // 64 位十六进制（贴近 EVM 交易哈希格式）
  const rand = CryptoJS.SHA256(
    Date.now().toString() + Math.random().toString()
  ).toString(CryptoJS.enc.Hex);
  return "0x" + rand;
}

/* ---------- 读写 ---------- */
export function readMMPLog(): MMPLogEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function clearMMPLog(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export interface LogMMPInput {
  role: MMPRole;
  action: MMPAction;
  description: string;
  file?: string;
  content?: string;
}

export function logMMP(input: LogMMPInput): MMPLogEntry | null {
  if (typeof window === "undefined") return null;

  const now = new Date();
  const timestamp = now.getTime();
  const existing = readMMPLog();
  const blockNumber = BLOCK_SEED + existing.length + 1;

  const payload = JSON.stringify({
    role: input.role,
    action: input.action,
    description: input.description,
    file: input.file,
    content: input.content,
    timestamp,
  });
  const hash = calcHash(payload);

  const entry: MMPLogEntry = {
    id: genId(),
    timestamp,
    isoTime: now.toISOString(),
    role: input.role,
    roleName: ROLE_NAMES[input.role],
    action: input.action,
    actionLabel: ACTION_LABELS[input.action],
    file: input.file,
    description: input.description,
    hash,
    hashShort: hash.slice(0, 8),
    blockNumber,
    gasUsed: Math.floor(21000 + Math.random() * 30000),
    txHash: genTxHash(),
    contentPreview: input.content?.slice(0, 120),
  };

  const next = [...existing, entry];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // 容量爆掉就裁掉一半
    const truncated = next.slice(-500);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(truncated));
  }
  return entry;
}

/* ---------- 整体文件哈希 ---------- */
export function calcMMPFileHash(): { hash: string; short: string } {
  const log = readMMPLog();
  const serialized = JSON.stringify(log);
  const hash = calcHash(serialized || "empty");
  return { hash, short: hash.slice(0, 16) };
}

/* ---------- 导出 .mmp 文件 ---------- */
export function exportMMPFile(): void {
  if (typeof window === "undefined") return;
  const log = readMMPLog();
  const { hash } = calcMMPFileHash();
  const header = `# CMAMSys MMP File
# Generated: ${new Date().toISOString()}
# Total Entries: ${log.length}
# File SHA-256: ${hash}
# ----------------------------------------

`;
  const body = log
    .map(
      (e) =>
        `[${new Date(e.timestamp).toLocaleString("zh-CN")}] <${e.roleName}> ${
          e.actionLabel
        } ${e.file ? `@${e.file} ` : ""}| ${e.description}
  Hash: ${e.hash}
  Block: #${e.blockNumber}
  Tx: ${e.txHash}
`
    )
    .join("\n");

  const blob = new Blob([header + body], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `cmamsys-${Date.now()}.mmp`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ---------- 种子数据（首次访问 /mmp 时填充演示数据） ---------- */
export function seedIfEmpty(): void {
  if (typeof window === "undefined") return;
  const existing = readMMPLog();
  if (existing.length > 0) return;

  const seeds: LogMMPInput[] = [
    { role: "leader", action: "create_team", description: "创建团队 MathStars，参赛类型：国赛 A 题" },
    { role: "modeler", action: "ai_chat", description: "与 GPT-4 讨论 SEIR 模型参数边界" },
    { role: "modeler", action: "edit", file: "round-1/solution.md", description: "撰写第一轮独立思考方案" },
    { role: "modeler", action: "submit", description: "第一轮独立思考方案已提交" },
    { role: "modeler", action: "ai_chat", description: "Claude 提出引入空间异质性修正项" },
    { role: "modeler", action: "edit", file: "round-2/fusion.md", description: "融合三方建议，输出人机融合方案" },
    { role: "coder", action: "edit", file: "modeling.py", description: "实现 SEIR 微分方程数值求解" },
    { role: "coder", action: "save", file: "modeling.py", description: "保存 modeling.py (+42 行)" },
    { role: "coder", action: "ai_chat", description: "DeepSeek 建议用 RK45 替换欧拉法" },
    { role: "coder", action: "edit", file: "visualization.py", description: "绘制感染峰值热力图" },
    { role: "writer", action: "edit", file: "chapter-5.md", description: "撰写第五章模型建立部分" },
    { role: "writer", action: "ai_chat", description: "AI 润色第五章 3.2 节摘要段" },
    { role: "modeler", action: "review", description: "第三轮同伴互评：给方案 B 打 4.6 分" },
  ];

  const start = Date.now() - 1000 * 60 * 60 * 3; // 从 3 小时前开始
  seeds.forEach((s, idx) => {
    // 按时间递增伪造 timestamp
    const fakeNow = start + idx * 1000 * 60 * (8 + Math.random() * 6);
    const existing2 = readMMPLog();
    const blockNumber = BLOCK_SEED + existing2.length + 1;
    const payload = JSON.stringify({ ...s, timestamp: fakeNow });
    const hash = calcHash(payload);
    const entry: MMPLogEntry = {
      id: genId(),
      timestamp: fakeNow,
      isoTime: new Date(fakeNow).toISOString(),
      role: s.role,
      roleName: ROLE_NAMES[s.role],
      action: s.action,
      actionLabel: ACTION_LABELS[s.action],
      file: s.file,
      description: s.description,
      hash,
      hashShort: hash.slice(0, 8),
      blockNumber,
      gasUsed: Math.floor(21000 + Math.random() * 30000),
      txHash: genTxHash(),
      contentPreview: s.content?.slice(0, 120),
    };
    const next = [...existing2, entry];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  });
}
