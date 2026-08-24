const MISSIONS = [
  "Fais-lui demander sa pizza préférée.",
  "Fais-lui faire un compliment sur une tenue.",
  "Fais-lui raconter une blague.",
  "Fais-lui demander son film préféré.",
  "Fais-lui proposer un toast.",
  "Fais-lui demander l'heure.",
  "Fais-lui faire un selfie.",
  "Fais-lui demander son voyage de rêve.",
  "Fais-lui citer une réplique de film.",
  "Fais-lui choisir la prochaine musique.",
  "Fais-lui demander sa chanson du moment.",
  "Fais-lui raconter un souvenir d'enfance.",
  "Fais-lui complimenter un autre invité.",
  "Fais-lui demander son plat signature.",
  "Fais-lui inventer un super-pouvoir.",
  "Fais-lui faire un vœu à voix haute.",
  "Fais-lui dire le prénom de son premier animal.",
  "Fais-lui raconter le pire jeu de mots.",
  "Fais-lui décrire sa journée en trois mots.",
  "Fais-lui inventer un nom de cocktail.",
  "Fais-lui demander sa saison préférée.",
  "Fais-lui faire un discours de dix secondes.",
  "Fais-lui dire qui arriverait le plus en retard.",
  "Fais-lui présenter deux personnes.",
  "Fais-lui demander sa série du moment.",
  "Fais-lui imiter une voix de film.",
  "Fais-lui demander son café ou thé préféré.",
  "Fais-lui choisir le prochain jeu de société.",
  "Fais-lui révéler un talent caché.",
  "Fais-lui raconter une anecdote de voyage.",
];
const DEMO = ["Corentin", "Flora", "Léa", "Hugo", "Inès"];
const KEY = "killer-party-v2";
const MKEY = "killer-party-missions";
const ALPHA = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const ZIP = "https://github.com/hugotronel-boop/killer-party/archive/refs/heads/main.zip";
const $ = (id) => document.getElementById(id);
const uid = () => crypto.randomUUID();
const now = () => Date.now();
function makeCode() {
  const b = crypto.getRandomValues(new Uint8Array(4));
  return [...b].map((x) => ALPHA[x % ALPHA.length]).join("");
}
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function cooldown(demo) { return demo ? 30_000 : 30 * 60 * 1000; }
function fmtCd(ms) {
  if (ms <= 0) return "";
  const s = Math.ceil(ms / 1000);
  return s < 60 ? s + "s" : Math.ceil(s / 60) + " min";
}
function cleanName(raw) {
  const n = (raw || "").trim().replace(/\s+/g, " ");
  if (n.length < 2 || n.length > 20) throw new Error("Prénom : 2 à 20 caractères.");
  return n;
}
function player(name, isHost) {
  return { id: uid(), name, isHost: !!isHost, isAlive: true, targetId: null, mission: null, discovered: false, lastAccusationAt: 0, killCount: 0 };
}
function defaultMissions() {
  return MISSIONS.map((t) => ({ id: uid(), template: t }));
}
function loadMissions() {
  try {
    const x = JSON.parse(localStorage.getItem(MKEY) || "null");
    if (Array.isArray(x) && x.length) return x;
  } catch (e) { /* ignore */ }
  return defaultMissions();
}
function saveMissions() {
  localStorage.setItem(MKEY, JSON.stringify(missions));
}
let missions = loadMissions();
function pickMissions(n) {
  const pool = shuffle(missions.map((m) => m.template).filter(Boolean));
  if (!pool.length) throw new Error("Ajoute au moins un défi avant de lancer.");
  return Array.from({ length: n }, (_, i) => pool[i % pool.length]);
}
function addMission(template) {
  const t = (template || "").trim();
  if (t.length < 8) throw new Error("Écris un défi un peu plus long.");
  if (t.length > 160) throw new Error("Défi trop long.");
  missions.push({ id: uid(), template: t });
  saveMissions();
}
function updateMission(id, template) {
  const t = (template || "").trim();
  if (t.length < 8) throw new Error("Écris un défi un peu plus long.");
  const m = missions.find((x) => x.id === id);
  if (!m) throw new Error("Défi introuvable.");
  m.template = t;
  saveMissions();
}
function deleteMission(id) {
  missions = missions.filter((x) => x.id !== id);
  saveMissions();
}
function blank() {
  return {
    view: "home", name: "", code: "", tab: "dossier",
    killOpen: false, accuseOpen: false, accusedId: null, explain: "", guest: "",
    party: null, seatId: null, toast: "", reveal: {}, draft: "", editId: null,
  };
}
function load() {
  try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) { return null; }
}
function save() {
  const copy = { ...S, toast: "", reveal: {} };
  localStorage.setItem(KEY, JSON.stringify(copy));
}
function toast(msg) {
  S.toast = msg;
  render();
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { S.toast = ""; render(); }, 2400);
}
let S = load() || blank();
if (!S.reveal) S.reveal = {};
if (S.draft == null) S.draft = "";
let toastTimer = 0;
let revealTimers = {};
function me() { return S.party && S.party.players.find((p) => p.id === S.seatId) || null; }
function byId(id) { return S.party && S.party.players.find((p) => p.id === id) || null; }
function targetOf(p) { return p && p.targetId ? byId(p.targetId) : null; }
function pendingOf(p) { return S.party && S.party.claims.find((c) => c.killerId === p.id && c.status === "pending") || null; }
function pendingAll() { return (S.party && S.party.claims || []).filter((c) => c.status === "pending"); }
function startChain(party) {
  const order = shuffle(party.players);
  const picked = pickMissions(order.length);
  order.forEach((p, i) => {
    const t = order[(i + 1) % order.length];
    p.targetId = t.id;
    p.mission = picked[i];
    p.isAlive = true;
    p.discovered = false;
    p.killCount = 0;
  });
  party.status = "playing";
  party.winnerId = null;
  party.startedAt = now();
}
function createParty(name, demo) {
  const host = player(name, true);
  const party = {
    id: uid(), code: makeCode(), status: "lobby", isDemo: !!demo,
    hostId: host.id, players: [host], claims: [], winnerId: null, winnerName: null,
  };
  if (demo) DEMO.slice(1).forEach((n) => party.players.push(player(n, false)));
  S.party = party;
  S.seatId = host.id;
  S.name = name;
  if (demo) startChain(party);
  S.view = demo ? "playing" : "lobby";
  save();
}
function joinParty(code, name) {
  const c = (code || "").trim().toUpperCase();
  if (!S.party || S.party.code !== c) {
    throw new Error("Code introuvable sur ce téléphone. Crée la soirée ici, puis passe le téléphone.");
  }
  if (S.party.status !== "lobby") throw new Error("La chasse a déjà commencé.");
  addGuest(name);
  const n = cleanName(name);
  const p = S.party.players.find((x) => x.name.toLowerCase() === n.toLowerCase());
  S.seatId = p.id;
  S.name = p.name;
  S.view = "lobby";
  save();
}
function addGuest(name) {
  const n = cleanName(name);
  if (S.party.players.some((p) => p.name.toLowerCase() === n.toLowerCase())) throw new Error("Ce prénom est déjà pris.");
  if (S.party.players.length >= 20) throw new Error("Soirée complète.");
  S.party.players.push(player(n, false));
}
function declareKill(explanation) {
  const p = me();
  if (!p || !p.isAlive) throw new Error("Tu as déjà été éliminé.");
  if (pendingOf(p)) throw new Error("Un kill est déjà en attente.");
  if ((explanation || "").trim().length < 8) throw new Error("Explique un peu plus.");
  S.party.claims.push({
    id: uid(), killerId: p.id, victimId: p.targetId, explanation: explanation.trim(),
    status: "pending", createdAt: now(), mission: p.mission,
  });
}
function resolveKill(claimId, approve) {
  const c = S.party.claims.find((x) => x.id === claimId);
  if (!c || c.status !== "pending") throw new Error("Déclaration introuvable.");
  if (!approve) { c.status = "refused"; return; }
  const killer = byId(c.killerId);
  const victim = byId(c.victimId);
  if (!killer || !victim || !killer.isAlive || !victim.isAlive || killer.targetId !== victim.id) {
    c.status = "refused";
    throw new Error("Le kill n'est plus valable.");
  }
  const inheritedTarget = victim.targetId;
  const inheritedMission = victim.mission;
  victim.isAlive = false;
  victim.targetId = null;
  victim.mission = null;
  killer.targetId = inheritedTarget;
  killer.mission = inheritedMission;
  killer.killCount += 1;
  c.status = "validated";
  const alive = S.party.players.filter((x) => x.isAlive);
  if (alive.length <= 1 || inheritedTarget === killer.id) {
    S.party.status = "finished";
    S.party.winnerId = killer.id;
    S.party.winnerName = killer.name;
    S.view = "finale";
  }
}
function accuse(accusedId) {
  const p = me();
  const cd = cooldown(S.party.isDemo);
  const remain = p.lastAccusationAt ? p.lastAccusationAt + cd - now() : 0;
  if (remain > 0) throw new Error("Encore " + fmtCd(remain) + " avant une nouvelle accusation.");
  if (accusedId === p.id) throw new Error("Tu ne peux pas t'accuser.");
  const accused = byId(accusedId);
  if (!accused) throw new Error("Joueur introuvable.");
  const killer = S.party.players.find((x) => x.isAlive && x.targetId === p.id);
  const correct = !!(killer && killer.id === accused.id);
  p.lastAccusationAt = now();
  if (correct) killer.discovered = true;
  return { correct, accusedName: accused.name };
}
function remainCd() {
  const p = me();
  if (!p) return 0;
  return Math.max(0, (p.lastAccusationAt || 0) + cooldown(S.party.isDemo) - now());
}
function esc(s) {
  const d = document.createElement("div");
  d.textContent = String(s == null ? "" : s);
  return d.innerHTML;
}
