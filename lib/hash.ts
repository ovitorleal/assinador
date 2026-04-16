import { createHash, randomUUID } from "node:crypto";

export function sha256(content: string) {
  return createHash("sha256").update(content).digest("hex");
}

export function buildProtocol() {
  return `PR-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${randomUUID().slice(0, 8).toUpperCase()}`;
}
