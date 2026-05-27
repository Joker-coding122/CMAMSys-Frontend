import {
  buildCmamDevToken,
  createCmamInitMessage,
  parseCmamChildMessage,
} from "./cmam-editor-bridge";

function decodeBase64UrlJson<T>(token: string): T {
  const base64 = token.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  return JSON.parse(Buffer.from(padded, "base64").toString("utf8")) as T;
}

export function runBridgeSmoke(): void {
  const token = buildCmamDevToken("u1", "t1", "Alice");
  const decoded = decodeBase64UrlJson<{
    userId: string;
    teamId: string;
    displayName: string;
    iat: number;
    exp: number;
  }>(token);

  if (
    decoded.userId !== "u1" ||
    decoded.teamId !== "t1" ||
    decoded.displayName !== "Alice" ||
    typeof decoded.iat !== "number" ||
    typeof decoded.exp !== "number"
  ) {
    throw new Error("buildCmamDevToken failed round-trip smoke check");
  }

  const init = createCmamInitMessage({
    userId: "u1",
    teamId: "t1",
    displayName: "Alice",
    token,
  });
  if (init.payload.token !== token) {
    throw new Error("createCmamInitMessage should preserve caller-provided token");
  }

  const ready = parseCmamChildMessage({
    version: 1,
    type: "cmam:ready",
    payload: { editorVersion: "p0" },
  });
  if (ready?.type !== "cmam:ready") {
    throw new Error("parseCmamChildMessage failed ready smoke check");
  }

  const error = parseCmamChildMessage({
    version: 1,
    type: "cmam:error",
    payload: { code: "CONTEXT_FAILED", message: "smoke" },
  });
  if (error?.type !== "cmam:error") {
    throw new Error("parseCmamChildMessage failed error smoke check");
  }
}
