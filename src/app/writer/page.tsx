"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ComponentType, ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileText,
  Layers3,
  Loader2,
  PenTool,
  RefreshCw,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import {
  getCurrentTeam,
  getTriHandRoleLabel,
  type Team,
} from "@/lib/teams-storage";
import {
  buildCmamDevToken,
  createCmamInitMessage,
  getCmamEditorEmbedUrl,
  parseCmamChildMessage,
  type CmamContextAppliedPayload,
} from "@/lib/cmam-editor-bridge";
import { cn } from "@/lib/utils";

type ConnectionStatus = "booting" | "connecting" | "ready" | "applied" | "error";

const DEFAULT_EDITOR_URL = "http://localhost:5173";

export default function WriterPage() {
  return (
    <Suspense fallback={<WriterHubLoading />}>
      <WriterHub />
    </Suspense>
  );
}

function WriterHub() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading } = useAuth();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [team, setTeam] = useState<Team | null>(() => getCurrentTeam());
  const [iframeKey, setIframeKey] = useState(0);
  const [status, setStatus] = useState<ConnectionStatus>("booting");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [context, setContext] = useState<CmamContextAppliedPayload | null>(null);
  const userId = user?.id;
  const displayName = user?.displayName;
  const teamId = team?.id;

  const requestedPaperId = searchParams.get("paperId")?.trim() || undefined;
  const requestedTemplateId = searchParams.get("templateId")?.trim() || undefined;
  const editorBaseUrl = process.env.NEXT_PUBLIC_CMAM_EDITOR_URL || DEFAULT_EDITOR_URL;

  const cachedPaperId =
    teamId && typeof window !== "undefined" ? localStorage.getItem(getPaperCacheKey(teamId)) || undefined : undefined;
  const paperId = requestedPaperId ?? cachedPaperId;
  const embedUrl = useMemo(
    () => getCmamEditorEmbedUrl(editorBaseUrl, { paperId, templateId: requestedTemplateId }),
    [editorBaseUrl, paperId, requestedTemplateId]
  );
  const targetOrigin = useMemo(() => new URL(embedUrl).origin, [embedUrl]);
  const initToken = useMemo(
    () => (userId && teamId && displayName ? buildCmamDevToken(userId, teamId, displayName) : undefined),
    [displayName, teamId, userId]
  );

  const sendInit = useCallback(() => {
    if (!user || !team || !initToken || !iframeRef.current?.contentWindow) return;

    const message = createCmamInitMessage({
      userId: user.id,
      teamId: team.id,
      displayName: user.displayName,
      token: initToken,
      paperId,
      templateId: requestedTemplateId,
    });

    iframeRef.current.contentWindow.postMessage(message, targetOrigin);
    setStatus((current) => (current === "applied" ? current : "connecting"));
    setErrorMessage(null);
  }, [initToken, paperId, requestedTemplateId, targetOrigin, team, user]);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }

    const currentTeam = getCurrentTeam();
    if (!currentTeam) {
      router.replace("/team");
      return;
    }

    if (team?.id === currentTeam.id) return;
    const timer = window.setTimeout(() => setTeam(currentTeam), 0);
    return () => window.clearTimeout(timer);
  }, [isLoading, router, team?.id, user]);

  useEffect(() => {
    const handleTeamChange = () => {
      const nextTeam = getCurrentTeam();
      if (!nextTeam) {
        router.replace("/team");
        return;
      }

      setTeam(nextTeam);
      setContext(null);
      setStatus("connecting");
      setIframeKey((key) => key + 1);
    };

    window.addEventListener("cmam-current-team-change", handleTeamChange);
    return () => window.removeEventListener("cmam-current-team-change", handleTeamChange);
  }, [router]);

  useEffect(() => {
    if (!user || !team || status === "applied" || status === "error") return;

    const firstAttempt = window.setTimeout(sendInit, 150);
    const retry = window.setInterval(sendInit, 1500);

    return () => {
      window.clearTimeout(firstAttempt);
      window.clearInterval(retry);
    };
  }, [sendInit, status, team, user]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== targetOrigin) return;
      const message = parseCmamChildMessage(event.data);
      if (!message) return;

      if (message.type === "cmam:ready") {
        setStatus("ready");
        sendInit();
        return;
      }

      if (message.type === "cmam:context-applied") {
        setContext(message.payload);
        setStatus("applied");
        setErrorMessage(null);
        if (team) {
          localStorage.setItem(getPaperCacheKey(team.id), message.payload.paperId);
        }
        return;
      }

      if (team && cachedPaperId && !requestedPaperId && isRecoverableEditorContextError(message.payload)) {
        localStorage.removeItem(getPaperCacheKey(team.id));
        setContext(null);
        setStatus("connecting");
        setErrorMessage("缓存的论文已失效，正在重新创建...");
        setIframeKey((key) => key + 1);
        return;
      }

      setStatus("error");
      setErrorMessage(message.payload.message);
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [cachedPaperId, requestedPaperId, sendInit, targetOrigin, team]);

  if (isLoading || !user || !team) {
    return <WriterHubLoading />;
  }

  const writer = team.members.find((member) => member.role === "writer");
  const displayPaperId = context?.paperId ?? paperId ?? "待 cmam-editor 分配";
  const compileStatus = context?.compileStatus ?? "idle";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto flex min-h-screen max-w-[1680px] flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="mb-4 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-white">
                <PenTool className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="truncate text-xl font-semibold tracking-normal">LaTeX Writer Hub</h1>
                  <Badge className="border-amber-200 bg-amber-50 text-amber-700">论文手</Badge>
                  <a
                    href="/writer/draft"
                    className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 underline-offset-4 hover:text-slate-900 hover:underline"
                  >
                    Deprecated 草稿页
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <p className="mt-1 truncate text-sm text-slate-500">
                  {team.name} · {team.competition} · {team.currentStage}
                </p>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              <TopMetric icon={Users} label="团队" value={`${team.members.length} 人`} />
              <TopMetric icon={ShieldCheck} label="当前身份" value={getTriHandRoleLabel(writer?.role ?? "writer")} />
              <TopMetric icon={Layers3} label="进度" value={`${team.progress}%`} />
              <ConnectionBadge status={status} />
            </div>
          </div>
        </header>

        <section className="grid min-h-0 flex-1 gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-h-[680px] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <iframe
              key={iframeKey}
              ref={iframeRef}
              title="CMAM LaTeX Writer"
              src={embedUrl}
              className="h-full min-h-[680px] w-full bg-white"
              onLoad={sendInit}
              allow="clipboard-read; clipboard-write"
            />
          </div>

          <aside className="space-y-4">
            <Panel title="上下文" icon={FileText}>
              <InfoRow label="paperId" value={displayPaperId} />
              <InfoRow label="templateId" value={context?.templateId ?? requestedTemplateId ?? "默认模板"} />
              <InfoRow label="compile" value={compileStatus} />
              {errorMessage ? (
                <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {errorMessage}
                </div>
              ) : null}
              <Button
                variant="outline"
                className="mt-4 w-full justify-center gap-2"
                onClick={() => {
                  setStatus("connecting");
                  setIframeKey((key) => key + 1);
                }}
              >
                <RefreshCw className="h-4 w-4" />
                重连编辑器
              </Button>
            </Panel>

            <Panel title="6.3 预留" icon={Clock3}>
              <div className="space-y-3 text-sm text-slate-600">
                <ReservedItem title="协作批注" />
                <ReservedItem title="编译日志" />
                <ReservedItem title="模型/代码素材引用" />
              </div>
            </Panel>

            <Panel title="连接" icon={AlertTriangle}>
              <div className="space-y-2 text-xs text-slate-500">
                <p>Embed URL</p>
                <p className="break-all rounded-md bg-slate-100 px-2 py-1 font-mono text-slate-700">{embedUrl}</p>
                <p>Target Origin</p>
                <p className="break-all rounded-md bg-slate-100 px-2 py-1 font-mono text-slate-700">{targetOrigin}</p>
              </div>
            </Panel>
          </aside>
        </section>
      </div>
    </main>
  );
}

function getPaperCacheKey(teamId: string): string {
  return `cmam_writer_paper_${teamId}`;
}

function isRecoverableEditorContextError(payload: { code: string; message: string }): boolean {
  const text = `${payload.code} ${payload.message}`;
  return (
    text.includes("CMAM_PAPER_NOT_FOUND") ||
    text.includes("CMAM_PAPER_TREE_NOT_FOUND") ||
    text.includes("没有找到对应的论文") ||
    text.includes("CONTEXT_FAILED")
  );
}

function WriterHubLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500">
      <div className="flex items-center gap-2 text-sm">
        <Loader2 className="h-4 w-4 animate-spin" />
        Writer Hub 初始化中...
      </div>
    </div>
  );
}

function TopMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-h-12 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3">
      <Icon className="h-4 w-4 shrink-0 text-slate-500" />
      <div className="min-w-0">
        <p className="text-[11px] text-slate-500">{label}</p>
        <p className="truncate text-sm font-semibold text-slate-800">{value}</p>
      </div>
    </div>
  );
}

function ConnectionBadge({ status }: { status: ConnectionStatus }) {
  const config = {
    booting: { label: "启动中", className: "border-slate-200 bg-slate-50 text-slate-600", icon: Loader2 },
    connecting: { label: "连接中", className: "border-sky-200 bg-sky-50 text-sky-700", icon: Loader2 },
    ready: { label: "已就绪", className: "border-cyan-200 bg-cyan-50 text-cyan-700", icon: CheckCircle2 },
    applied: { label: "上下文已应用", className: "border-emerald-200 bg-emerald-50 text-emerald-700", icon: CheckCircle2 },
    error: { label: "连接错误", className: "border-red-200 bg-red-50 text-red-700", icon: AlertTriangle },
  } satisfies Record<ConnectionStatus, { label: string; className: string; icon: ComponentType<{ className?: string }> }>;
  const Icon = config[status].icon;

  return (
    <div className={cn("flex min-h-12 items-center gap-2 rounded-lg border px-3", config[status].className)}>
      <Icon className={cn("h-4 w-4", status === "booting" || status === "connecting" ? "animate-spin" : "")} />
      <div>
        <p className="text-[11px] opacity-75">连接状态</p>
        <p className="text-sm font-semibold">{config[status].label}</p>
      </div>
    </div>
  );
}

function Panel({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: ComponentType<{ className?: string }>;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3">
        <Icon className="h-4 w-4 text-amber-600" />
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-slate-100 py-2 last:border-0">
      <span className="text-xs font-medium uppercase text-slate-400">{label}</span>
      <span className="max-w-[190px] break-all text-right text-sm font-medium text-slate-800">{value}</span>
    </div>
  );
}

function ReservedItem({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-dashed border-slate-200 px-3 py-2">
      <span>{title}</span>
      <Badge variant="secondary" className="bg-slate-100 text-slate-500">6.3</Badge>
    </div>
  );
}
