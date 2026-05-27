export const CMAM_EMBED_PROTOCOL_VERSION = 1 as const;

export type CmamEmbedMessageType =
  | "cmam:init"
  | "cmam:ready"
  | "cmam:context-applied"
  | "cmam:error";

export interface CmamEmbedEnvelope<TType extends CmamEmbedMessageType, TPayload> {
  version: typeof CMAM_EMBED_PROTOCOL_VERSION;
  type: TType;
  payload: TPayload;
}

export interface CmamInitPayload {
  userId: string;
  teamId: string;
  displayName: string;
  token: string;
  source: "cmamsys" | "standalone";
  paperId?: string;
  templateId?: string;
  locale?: "zh-CN" | "en-US";
}

export interface CmamReadyPayload {
  paperId?: string;
  editorVersion?: string;
  capabilities?: string[];
}

export interface CmamContextAppliedPayload {
  paperId: string;
  teamId?: string;
  userId?: string;
  rootDocPath?: string;
  templateId?: string;
  compileStatus?: "idle" | "queued" | "running" | "success" | "error";
}

export interface CmamErrorPayload {
  code: string;
  message: string;
  detail?: unknown;
}

export type CmamChildMessage =
  | CmamEmbedEnvelope<"cmam:ready", CmamReadyPayload>
  | CmamEmbedEnvelope<"cmam:context-applied", CmamContextAppliedPayload>
  | CmamEmbedEnvelope<"cmam:error", CmamErrorPayload>;

function base64UrlEncode(value: string): string {
  if (typeof window !== "undefined" && typeof window.btoa === "function") {
    return window
      .btoa(unescape(encodeURIComponent(value)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/g, "");
  }

  return Buffer.from(value, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export function buildCmamDevToken(
  userId: string,
  teamId: string,
  displayName: string,
  now = Date.now(),
  ttlMs = 8 * 60 * 60 * 1000
): string {
  // Prompt 8 will replace this P0 dev token with JWT; keep this aligned with cmam-editor token.ts.
  return base64UrlEncode(JSON.stringify({ userId, teamId, displayName, iat: now, exp: now + ttlMs }));
}

export function createCmamInitMessage(input: {
  userId: string;
  teamId: string;
  displayName: string;
  token?: string;
  paperId?: string;
  templateId?: string;
}): CmamEmbedEnvelope<"cmam:init", CmamInitPayload> {
  return {
    version: CMAM_EMBED_PROTOCOL_VERSION,
    type: "cmam:init",
    payload: {
      ...input,
      token: input.token ?? buildCmamDevToken(input.userId, input.teamId, input.displayName),
      source: "cmamsys",
    },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

export function parseCmamChildMessage(data: unknown): CmamChildMessage | null {
  if (!isRecord(data) || data.version !== CMAM_EMBED_PROTOCOL_VERSION || typeof data.type !== "string") {
    return null;
  }

  if (
    data.type !== "cmam:ready" &&
    data.type !== "cmam:context-applied" &&
    data.type !== "cmam:error"
  ) {
    return null;
  }

  const payload = isRecord(data.payload) ? data.payload : {};

  if (data.type === "cmam:context-applied" && typeof payload.paperId !== "string") {
    return null;
  }

  const errorCode = payload.code;
  const errorMessage = payload.message;
  if (
    data.type === "cmam:error" &&
    (typeof errorCode !== "string" || typeof errorMessage !== "string")
  ) {
    return null;
  }

  if (data.type === "cmam:ready") {
    return {
      version: CMAM_EMBED_PROTOCOL_VERSION,
      type: "cmam:ready",
      payload: {
        paperId: typeof payload.paperId === "string" ? payload.paperId : undefined,
        editorVersion: typeof payload.editorVersion === "string" ? payload.editorVersion : undefined,
        capabilities: Array.isArray(payload.capabilities)
          ? payload.capabilities.filter((item): item is string => typeof item === "string")
          : undefined,
      },
    };
  }

  if (data.type === "cmam:context-applied") {
    const paperId = payload.paperId;
    if (typeof paperId !== "string") return null;

    return {
      version: CMAM_EMBED_PROTOCOL_VERSION,
      type: "cmam:context-applied",
      payload: {
        paperId,
        teamId: typeof payload.teamId === "string" ? payload.teamId : undefined,
        userId: typeof payload.userId === "string" ? payload.userId : undefined,
        rootDocPath: typeof payload.rootDocPath === "string" ? payload.rootDocPath : undefined,
        templateId: typeof payload.templateId === "string" ? payload.templateId : undefined,
        compileStatus: isCompileStatus(payload.compileStatus) ? payload.compileStatus : undefined,
      },
    };
  }

  if (typeof errorCode !== "string" || typeof errorMessage !== "string") {
    return null;
  }

  return {
    version: CMAM_EMBED_PROTOCOL_VERSION,
    type: "cmam:error",
    payload: {
      code: errorCode,
      message: errorMessage,
      detail: payload.detail ?? payload.details,
    },
  };
}

function isCompileStatus(value: unknown): value is CmamContextAppliedPayload["compileStatus"] {
  return (
    value === "idle" ||
    value === "queued" ||
    value === "running" ||
    value === "success" ||
    value === "error"
  );
}

export function getCmamEditorEmbedUrl(
  baseUrl: string,
  query?: Record<string, string | undefined>
): string {
  const normalizedBase = baseUrl.replace(/\/+$/g, "");
  const url = new URL(`${normalizedBase}/embed`);

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value);
  });

  return url.toString();
}
