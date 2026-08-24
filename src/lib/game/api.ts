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
  for (let i = a.length - 1; i > 0; i -= 1) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
async function partyByCode(sql: Sql, code: string) {
  const rows = await sql<PartyRow>`select * from parties where code = ${code.toUpperCase()} limit 1`;
  return rows[0] ?? null;
}
async function partyById(sql: Sql, partyId: string) {
  const rows = await sql<PartyRow>`select * from parties where id = ${partyId} limit 1`;
  return rows[0] ?? null;
}
async function playersOf(sql: Sql, partyId: string) {
  return sql<PlayerRow>`select * from players where party_id = ${partyId} order by created_at asc`;
}
async function claimsOf(sql: Sql, partyId: string) {
  return sql<ClaimRow>`select * from kill_claims where party_id = ${partyId} order by created_at desc`;
}
async function playerByToken(sql: Sql, tokenValue: string) {
  const rows = await sql<PlayerRow>`select * from players where token = ${tokenValue} limit 1`;
  return rows[0] ?? null;
}
function toPublic(p: PlayerRow, hideDiscovered: boolean): PublicPlayer {
  return { id: p.id, name: p.name, isHost: asBool(p.is_host), isAlive: asBool(p.is_alive), killCount: Number(p.kill_count) || 0, discovered: hideDiscovered ? false : asBool(p.discovered) };
}
async function assertHost(sql: Sql, party: PartyRow, tokenValue: string) {
  if (tokenValue === party.host_token) return;
  const me = await playerByToken(sql, tokenValue);
  if (!me || me.party_id !== party.id || !asBool(me.is_host)) throw new Error("Action réservée au maître du jeu.");
}
async function loadMissionTemplates(sql: Sql): Promise<string[]> {
  const rows = await sql<{ template: string }>`select template from missions`;
  if (!rows.length) return [...MISSION_TEMPLATES];
  return rows.map((r) => r.template);
}
function cleanMission(raw: string): string {
  const template = raw.trim().replace(/\s+/g, " ");
  if (template.length < 8) throw new Error("Écris un défi un peu plus long.");
  if (template.length > 160) throw new Error("160 caractères maximum.");
  return template;
}

export const createParty = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({ name: z.string().min(2).max(20), demo: z.boolean().optional() }).parse(data))
  .handler(async ({ data }) => {
    const sql = await getDb();
    const name = cleanName(data.name);
    const partyId = id(); const hostToken = token(); const playerId = id(); const playerToken = token();
    let code = makeCode();
    for (let i = 0; i < 8; i += 1) { if (!(await partyByCode(sql, code))) break; code = makeCode(); }
    await sql`insert into parties (id, code, host_token, status, is_demo) values (${partyId}, ${code}, ${hostToken}, 'lobby', ${Boolean(data.demo)})`;
    await sql`insert into players (id, party_id, token, name, is_host) values (${playerId}, ${partyId}, ${playerToken}, ${name}, true)`;
    return { partyId, code, playerId, token: playerToken, hostToken, name };
  });

export const joinParty = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({ code: z.string().min(4).max(8), name: z.string().min(2).max(20) }).parse(data))
  .handler(async ({ data }) => {
    const sql = await getDb();
    const name = cleanName(data.name);
    const party = await partyByCode(sql, data.code.trim());
    if (!party) throw new Error("Aucun code ne correspond.");
    if (party.status !== "lobby") throw new Error("La partie a déjà commencé.");
    const existing = await playersOf(sql, party.id);
    if (existing.length >= 20) throw new Error("Soirée complète (20 joueurs).");
    if (existing.some((p) => p.name.toLowerCase() === name.toLowerCase())) throw new Error("Ce prénom est déjà pris.");
    const playerId = id(); const playerToken = token();
    await sql`insert into players (id, party_id, token, name, is_host) values (${playerId}, ${party.id}, ${playerToken}, ${name}, false)`;
    return { partyId: party.id, code: party.code, playerId, token: playerToken, name };
  });

const sessionInput = z.object({ partyId: z.string().min(1), token: z.string().min(8) });

export const getSnapshot = createServerFn({ method: "GET" })
  .validator((data: unknown) => sessionInput.parse(data))
  .handler(async ({ data }) => {
    const sql = await getDb();
    return loadSnapshot(sql, data.partyId, data.token);
  });

export const addGuest = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({ partyId: z.string().min(1), token: z.string().min(8), name: z.string().min(2).max(20) }).parse(data))
  .handler(async ({ data }) => {
    const sql = await getDb();
    const party = await partyById(sql, data.partyId);
    if (!party) throw new Error("Soirée introuvable.");
    await assertHost(sql, party, data.token);
    if (party.status !== "lobby") throw new Error("Impossible d'ajouter un joueur maintenant.");
    const name = cleanName(data.name);
    const existing = await playersOf(sql, party.id);
    if (existing.length >= 20) throw new Error("Soirée complète.");
    if (existing.some((p) => p.name.toLowerCase() === name.toLowerCase())) throw new Error("Ce prénom est déjà pris.");
    const playerId = id(); const playerToken = token();
    await sql`insert into players (id, party_id, token, name, is_host) values (${playerId}, ${party.id}, ${playerToken}, ${name}, false)`;
    return loadSnapshot(sql, party.id, data.token);
  });

export const startGame = createServerFn({ method: "POST" })
  .validator((data: unknown) => sessionInput.parse(data))
  .handler(async ({ data }) => {
    const sql = await getDb();
    const party = await partyById(sql, data.partyId);
    if (!party) throw new Error("Soirée introuvable.");
    await assertHost(sql, party, data.token);
    if (party.status !== "lobby") throw new Error("La partie a déjà commencé.");
    const players = await playersOf(sql, party.id);
    if (players.length < 3) throw new Error("Il faut au moins 3 joueurs.");
    const order = shuffle(players);
    const templates = await loadMissionTemplates(sql);
    const missions = pickMissions(order.map((_, i) => order[(i + 1) % order.length]!.name), templates);
    for (let i = 0; i < order.length; i += 1) {
      const killer = order[i]!; const target = order[(i + 1) % order.length]!;
      await sql`update players set target_id = ${target.id}, mission = ${missions[i]!}, is_alive = true, discovered = false, kill_count = 0 where id = ${killer.id}`;
    }
    await sql`update parties set status = 'playing', started_at = now(), winner_id = null where id = ${party.id}`;
    return loadSnapshot(sql, party.id, data.token);
  });

export const declareKill = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({ partyId: z.string().min(1), token: z.string().min(8), explanation: z.string().min(8).max(600) }).parse(data))
  .handler(async ({ data }) => {
    const sql = await getDb();
    const party = await partyById(sql, data.partyId);
    if (!party) throw new Error("Soirée introuvable.");
    if (party.status !== "playing") throw new Error("La partie n'est pas en cours.");
    const me = await playerByToken(sql, data.token);
    if (!me || me.party_id !== party.id) throw new Error("Session invalide.");
    if (!asBool(me.is_alive)) throw new Error("Tu as déjà été éliminé.");
    if (!me.target_id) throw new Error("Pas de cible.");
    const pending = await sql<ClaimRow>`select * from kill_claims where party_id = ${party.id} and killer_id = ${me.id} and status = 'pending' limit 1`;
    if (pending[0]) throw new Error("Un kill est déjà en attente de validation.");
    const explanation = data.explanation.trim();
    if (explanation.length < 8) throw new Error("Explique comment la mission a été accomplie.");
    await sql`insert into kill_claims (id, party_id, killer_id, victim_id, explanation, status) values (${id()}, ${party.id}, ${me.id}, ${me.target_id}, ${explanation}, 'pending')`;
    return loadSnapshot(sql, party.id, data.token);
  });

export const resolveKill = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({ partyId: z.string().min(1), token: z.string().min(8), claimId: z.string().min(1), approve: z.boolean() }).parse(data))
  .handler(async ({ data }) => {
    const sql = await getDb();
    const party = await partyById(sql, data.partyId);
    if (!party) throw new Error("Soirée introuvable.");
    await assertHost(sql, party, data.token);
    if (party.status !== "playing") throw new Error("La partie n'est pas en cours.");
    const claimRows = await sql<ClaimRow>`select * from kill_claims where id = ${data.claimId} limit 1`;
    const claim = claimRows[0];
    if (!claim || claim.party_id !== party.id) throw new Error("Déclaration introuvable.");
    if (claim.status !== "pending") throw new Error("Cette déclaration a déjà été traitée.");
    if (!data.approve) {
      await sql`update kill_claims set status = 'refused' where id = ${claim.id}`;
      return loadSnapshot(sql, party.id, data.token);
    }
    const players = await playersOf(sql, party.id);
    const killer = players.find((p) => p.id === claim.killer_id);
    const victim = players.find((p) => p.id === claim.victim_id);
    if (!killer || !victim) throw new Error("Joueurs introuvables.");
    if (!asBool(killer.is_alive) || !asBool(victim.is_alive)) {
      await sql`update kill_claims set status = 'refused' where id = ${claim.id}`;
      throw new Error("Le kill n'est plus valable.");
    }
    if (killer.target_id !== victim.id) {
      await sql`update kill_claims set status = 'refused' where id = ${claim.id}`;
      throw new Error("Cette cible n'est plus la victime du joueur.");
    }
    const inheritedTarget = victim.target_id; const inheritedMission = victim.mission;
    await sql`update players set is_alive = false, target_id = null, mission = null where id = ${victim.id}`;
    await sql`update players set target_id = ${inheritedTarget}, mission = ${inheritedMission}, kill_count = ${Number(killer.kill_count) + 1} where id = ${killer.id}`;
    await sql`update kill_claims set status = 'validated' where id = ${claim.id}`;
    const remaining = players.filter((p) => asBool(p.is_alive) && p.id !== victim.id);
    if (remaining.length <= 1 || inheritedTarget === killer.id) {
      await sql`update parties set status = 'finished', winner_id = ${killer.id} where id = ${party.id}`;
    }
    return loadSnapshot(sql, party.id, data.token);
  });

export const accusePlayer = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({ partyId: z.string().min(1), token: z.string().min(8), accusedId: z.string().min(1) }).parse(data))
  .handler(async ({ data }) => {
    const sql = await getDb();
    const party = await partyById(sql, data.partyId);
    if (!party) throw new Error("Soirée introuvable.");
    if (party.status !== "playing") throw new Error("La partie n'est pas en cours.");
    const me = await playerByToken(sql, data.token);
    if (!me || me.party_id !== party.id) throw new Error("Session invalide.");
    if (!asBool(me.is_alive)) throw new Error("Les éliminés ne peuvent plus accuser.");
    if (data.accusedId === me.id) throw new Error("Tu ne peux pas t'accuser toi-même.");
    const lastAcc = me.last_accusation_at ? Date.parse(me.last_accusation_at) : 0;
    const remain = lastAcc ? lastAcc + cooldownMs(asBool(party.is_demo)) - Date.now() : 0;
    if (remain > 0) {
      const mins = Math.ceil(remain / 60000); const secs = Math.ceil(remain / 1000);
      throw new Error(asBool(party.is_demo) ? `Encore ${secs}s avant une nouvelle accusation.` : `Encore ${mins} min avant une nouvelle accusation.`);
    }
    const players = await playersOf(sql, party.id);
    const accused = players.find((p) => p.id === data.accusedId);
    if (!accused) throw new Error("Joueur introuvable.");
    const killer = players.find((p) => asBool(p.is_alive) && p.target_id === me.id);
    const correct = Boolean(killer && killer.id === accused.id);
    await sql`insert into accusations (id, party_id, accuser_id, accused_id, correct) values (${id()}, ${party.id}, ${me.id}, ${accused.id}, ${correct})`;
    await sql`update players set last_accusation_at = now() where id = ${me.id}`;
    if (correct && killer) await sql`update players set discovered = true where id = ${killer.id}`;
    return { correct, accusedName: accused.name, snapshot: await loadSnapshot(sql, party.id, data.token) };
  });

const DEMO_NAMES = ["Corentin", "Flora", "Léa", "Hugo", "Inès"];
export const createDemo = createServerFn({ method: "POST" }).handler(async () => {
  const sql = await getDb();
  const partyId = id(); const hostToken = token(); const code = makeCode();
  await sql`insert into parties (id, code, host_token, status, is_demo) values (${partyId}, ${code}, ${hostToken}, 'lobby', true)`;
  const created: { id: string; token: string; name: string; isHost: boolean }[] = [];
  for (let i = 0; i < DEMO_NAMES.length; i += 1) {
    const pid = id(); const ptoken = token(); const name = DEMO_NAMES[i]!; const isHost = i === 0;
    await sql`insert into players (id, party_id, token, name, is_host) values (${pid}, ${partyId}, ${ptoken}, ${name}, ${isHost})`;
    created.push({ id: pid, token: ptoken, name, isHost });
  }
  const players = await playersOf(sql, partyId);
  const order = shuffle(players);
  const templates = await loadMissionTemplates(sql);
  const missions = pickMissions(order.map((_, i) => order[(i + 1) % order.length]!.name), templates);
  for (let i = 0; i < order.length; i += 1) {
    const killer = order[i]!; const target = order[(i + 1) % order.length]!;
    await sql`update players set target_id = ${target.id}, mission = ${missions[i]!}, is_alive = true where id = ${killer.id}`;
  }
  await sql`update parties set status = 'playing', started_at = now() where id = ${partyId}`;
  const host = created.find((p) => p.isHost)!;
  return { partyId, code, hostToken, players: created, snapshot: await loadSnapshot(sql, partyId, host.token) };
});

export const switchSeat = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({ partyId: z.string().min(1), hostToken: z.string().min(8), playerId: z.string().min(1) }).parse(data))
  .handler(async ({ data }) => {
    const sql = await getDb();
    const party = await partyById(sql, data.partyId);
    if (!party) throw new Error("Soirée introuvable.");
    await assertHost(sql, party, data.hostToken);
    const rows = await sql<PlayerRow>`select * from players where id = ${data.playerId} and party_id = ${party.id} limit 1`;
    const player = rows[0];
    if (!player) throw new Error("Joueur introuvable.");
    return { playerId: player.id, token: player.token, name: player.name, snapshot: await loadSnapshot(sql, party.id, player.token) };
  });

export const listMissions = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getDb();
  return sql<{ id: string; template: string }>`select id, template from missions order by created_at asc, template asc`;
});
export const addMission = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({ template: z.string().min(8).max(160) }).parse(data))
  .handler(async ({ data }) => {
    const sql = await getDb();
    const template = cleanMission(data.template);
    const existing = await sql<{ id: string }>`select id from missions where lower(template) = lower(${template}) limit 1`;
    if (existing[0]) throw new Error("Ce défi est déjà dans la liste.");
    const missionId = id();
    try { await sql`insert into missions (id, template) values (${missionId}, ${template})`; }
    catch { throw new Error("Ce défi est déjà dans la liste."); }
    return { id: missionId, template };
  });
export const deleteMission = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({ id: z.string().min(1) }).parse(data))
  .handler(async ({ data }) => {
    const sql = await getDb();
    await sql`delete from missions where id = ${data.id}`;
    return { ok: true };
  });
export const updateMission = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({ id: z.string().min(1), template: z.string().min(8).max(160) }).parse(data))
  .handler(async ({ data }) => {
    const sql = await getDb();
    const template = cleanMission(data.template);
    const rows = await sql<{ id: string }>`select id from missions where id = ${data.id} limit 1`;
    if (!rows[0]) throw new Error("Défi introuvable.");
    const dup = await sql<{ id: string }>`select id from missions where lower(template) = lower(${template}) and id <> ${data.id} limit 1`;
    if (dup[0]) throw new Error("Ce défi est déjà dans la liste.");
    try { await sql`update missions set template = ${template} where id = ${data.id}`; }
    catch { throw new Error("Ce défi est déjà dans la liste."); }
    return { id: data.id, template };
  });

async function loadSnapshot(sql: Sql, partyId: string, tokenValue: string): Promise<GameSnapshot> {
  const party = await partyById(sql, partyId);
  if (!party) throw new Error("Soirée introuvable.");
  const isHostToken = tokenValue === party.host_token;
  const me = isHostToken
    ? (await sql<PlayerRow>`select * from players where party_id = ${partyId} and is_host = true limit 1`)[0]
    : await playerByToken(sql, tokenValue);
  if (!me || me.party_id !== partyId) throw new Error("Session invalide.");
  const players = await playersOf(sql, partyId);
  const claims = await claimsOf(sql, partyId);
  const includeHost = asBool(me.is_host) || isHostToken;
  const byId = new Map(players.map((p) => [p.id, p]));
  const alive = players.filter((p) => asBool(p.is_alive));
  const winner = party.winner_id ? (byId.get(party.winner_id) ?? null) : null;
  const target = me.target_id && asBool(me.is_alive) ? (byId.get(me.target_id) ?? null) : null;
  const lastAcc = me.last_accusation_at ? Date.parse(me.last_accusation_at) : 0;
  const remain = lastAcc ? lastAcc + cooldownMs(asBool(party.is_demo)) - Date.now() : 0;
  const claimView = (c: ClaimRow): KillClaimView => ({
    id: c.id, killerId: c.killer_id, killerName: byId.get(c.killer_id)?.name ?? "?",
    victimId: c.victim_id, victimName: byId.get(c.victim_id)?.name ?? "?",
    mission: byId.get(c.killer_id)?.mission ?? "", explanation: c.explanation, status: c.status, createdAt: String(c.created_at),
  });
  const pendingMine = claims.find((c) => c.killer_id === me.id && c.status === "pending") ?? null;
  const recap: RecapEvent[] = claims.filter((c) => c.status === "validated").slice().reverse().map((c) => ({
    id: c.id, killerName: byId.get(c.killer_id)?.name ?? "?", victimName: byId.get(c.victim_id)?.name ?? "?", createdAt: String(c.created_at),
  }));
  const snapshot: GameSnapshot = {
    party: { id: party.id, code: party.code, status: party.status, isDemo: asBool(party.is_demo), aliveCount: alive.length, totalCount: players.length, winnerId: party.winner_id, winnerName: winner?.name ?? null },
    me: { id: me.id, name: me.name, isHost: asBool(me.is_host), isAlive: asBool(me.is_alive), killCount: Number(me.kill_count) || 0, discovered: asBool(me.discovered), accusationCooldownMs: Math.max(0, remain) },
    target: target && asBool(me.is_alive) ? { id: target.id, name: target.name } : null,
    mission: asBool(me.is_alive) ? me.mission : null,
    pendingClaim: pendingMine ? claimView(pendingMine) : null,
    players: players.map((p) => toPublic(p, !includeHost)),
    claims: includeHost ? claims.map(claimView) : [],
    recap,
  };
  if (includeHost) {
    snapshot.hostTokens = Object.fromEntries(players.map((p) => [p.id, p.token]));
    snapshot.claims = claims.map((c) => {
      const view = claimView(c);
      const killer = byId.get(c.killer_id);
      if (c.status === "pending" && killer?.mission) view.mission = killer.mission;
      return view;
    });
  }
  return snapshot;
}
