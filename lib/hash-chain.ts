import type { AuditEntry, AuditSeedEvent, IntegrityStatus } from "./types";

export const GENESIS_HASH = "0".repeat(64);

export async function sha256Hex(message: string): Promise<string> {
  const encoded = new TextEncoder().encode(message);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function canonicalPayload(entry: Pick<AuditEntry, "timestamp" | "actor" | "action" | "detail">) {
  return JSON.stringify({
    timestamp: entry.timestamp,
    actor: entry.actor,
    action: entry.action,
    detail: entry.detail,
  });
}

export async function hashEntry(prevHash: string, payload: string): Promise<string> {
  return sha256Hex(`${prevHash}|${payload}`);
}

export async function buildChain(events: AuditSeedEvent[], actorFallback = "system"): Promise<AuditEntry[]> {
  const chain: AuditEntry[] = [];
  let prev = GENESIS_HASH;
  for (let i = 0; i < events.length; i += 1) {
    const event = events[i];
    const base = {
      timestamp: event.timestamp,
      actor: event.actor || actorFallback,
      action: event.action,
      detail: event.detail,
    };
    const hash = await hashEntry(prev, canonicalPayload(base));
    const entry: AuditEntry = {
      id: `AUD-${String(i + 1).padStart(3, "0")}`,
      ...base,
      prevHash: prev,
      hash,
    };
    chain.push(entry);
    prev = hash;
  }
  return chain;
}

export async function appendEntry(
  chain: AuditEntry[],
  event: Omit<AuditSeedEvent, "timestamp"> & { timestamp?: string },
): Promise<AuditEntry[]> {
  const prev = chain.length ? chain[chain.length - 1].hash : GENESIS_HASH;
  const base = {
    timestamp: event.timestamp ?? new Date().toISOString(),
    actor: event.actor,
    action: event.action,
    detail: event.detail,
  };
  const hash = await hashEntry(prev, canonicalPayload(base));
  const entry: AuditEntry = {
    id: `AUD-${String(chain.length + 1).padStart(3, "0")}`,
    ...base,
    prevHash: prev,
    hash,
  };
  return [...chain, entry];
}

export async function verifyChain(chain: AuditEntry[]): Promise<{
  status: IntegrityStatus;
  brokenAt: string | null;
}> {
  let prev = GENESIS_HASH;
  for (const entry of chain) {
    if (entry.prevHash !== prev) {
      return { status: "tampered", brokenAt: entry.id };
    }
    const expected = await hashEntry(prev, canonicalPayload(entry));
    if (expected !== entry.hash) {
      return { status: "tampered", brokenAt: entry.id };
    }
    prev = entry.hash;
  }
  return { status: "valid", brokenAt: null };
}

export function shortenHash(hash: string, size = 10) {
  return `${hash.slice(0, size)}…${hash.slice(-6)}`;
}
