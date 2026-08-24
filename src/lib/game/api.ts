import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { MISSION_TEMPLATES, pickMissions } from "./missions";
import type { GameSnapshot, KillClaimView, PublicPlayer, RecapEvent } from "./types";

type Sql = Awaited<ReturnType<typeof import("@/lib/db").getSql>>;
async function getDb(): Promise<Sql> {
  const { getSql } = await import("@/lib/db");
  return getSql();
}
function id(): string { return crypto.randomUUID(); }
function token(): string {
  return crypto.randomUUID().replaceAll("-", "") + crypto.randomUUID().replaceAll("-", "");
}
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function makeCode(): string {
  let out = "";
  const bytes = crypto.getRandomValues(new Uint8Array(4));
  for (const b of bytes) out += CODE_ALPHABET[b % CODE_ALPHABET.length];
  return out;
}
const NAME_RE = /^[\p{L}][\p{L}\s'-]{0,19}$/u;
function cleanName(raw: string): string {
  const name = raw.trim().replace(/\s+/g, " ");
  if (!NAME_RE.test(name) || name.length < 2) throw new Error("Prénom invalide (2 à 20 lettres).");
  return name;
}
type PartyRow = { id: string; code: string; host_token: string; status: "lobby" | "playing" | "finished"; is_demo: boolean; winner_id: string | null; created_at: string; started_at: string | null; };
type PlayerRow = { id: string; party_id: string; token: string; name: string; is_host: boolean; is_alive: boolean; target_id: string | null; mission: string | null; discovered: boolean; last_accusation_at: string | null; kill_count: number; created_at: string; };
type ClaimRow = { id: string; party_id: string; killer_id: string; victim_id: string; explanation: string; status: "pending" | "validated" | "refused"; created_at: string; };
function cooldownMs(isDemo: boolean): number { return isDemo ? 30_000 : 30 * 60 * 1000; }
function asBool(v: boolean | number | string): boolean { return v === true || v === 1 || v === "t" || v === "true"; }
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
async function partyByCode(sql: Sql, code: string): Promise<PartyRow | null> {
  const rows = await sql<PartyRow>`select * from parties where code = ${code.toUpperCase()} limit 1`;
  return rows[0] ?? null;
}
async function partyById(sql: Sql, partyId: string): Promise<PartyRow | null> {
  const rows = await sql<PartyRow>`select * from parties where id = ${partyId} limit 1`;
  return rows[0] ?? null;
}
async function playersOf(sql: Sql, partyId: string): Promise<PlayerRow[]> {
  return sql<PlayerRow>`select * from players where party_id = ${partyId} order by created_at asc`;
}
async function claimsOf(sql: Sql, partyId: string): Promise<ClaimRow[]> {
  return sql<ClaimRow>`select * from kill_claims where party_id = ${partyId} order by created_at desc`;
}
async function playerByToken(sql: Sql, tokenValue: string): Promise<PlayerRow | null> {
  const rows = await sql<PlayerRow>`select * from players where token = ${tokenValue} limit 1`;
  return rows[0] ?? null;
}
function toPublic(p: PlayerRow, hideDiscovered: boolean): PublicPlayer {
  return { id: p.id, name: p.name, isHost: asBool(p.is_host), isAlive: asBool(p.is_alive), killCount: Number(p.kill_count) || 0, discovered: hideDiscovered ? false : asBool(p.discovered) };
}
