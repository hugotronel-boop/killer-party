import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Check, Copy, Crosshair, Gavel, Plus, ShieldAlert, Skull, UserRound, Users, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { accusePlayer, addGuest, declareKill, getSnapshot, resolveKill, startGame, switchSeat } from "@/lib/game/api";
import { saveSession } from "@/lib/game/session";
import type { GameSnapshot, KillClaimView, SessionRecord } from "@/lib/game/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DaggerMark, Wordmark } from "@/components/mark";
import { SecretCard } from "./secret-card";
import { cn } from "@/lib/utils";

function errMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === "object" && e && "message" in e) return String((e as { message: unknown }).message);
  return "Une erreur est survenue.";
}
function formatCooldown(ms: number): string {
  if (ms <= 0) return "";
  const s = Math.ceil(ms / 1000);
  if (s < 60) return `${s}s`;
  return `${Math.ceil(s / 60)} min`;
}

export function PartyView({ session }: { session: SessionRecord }) {
  const qc = useQueryClient();
  const [seat, setSeat] = useState(session);
  const [now, setNow] = useState(() => Date.now());
  const gmToken = seat.hostToken ?? (seat.token || "");
  const q = useQuery({
    queryKey: ["snapshot", seat.partyId, seat.token],
    queryFn: () => getSnapshot({ data: { partyId: seat.partyId, token: seat.token } }),
    refetchInterval: 2000,
  });
  const hostQ = useQuery({
    queryKey: ["snapshot", seat.partyId, "host", gmToken],
    queryFn: () => getSnapshot({ data: { partyId: seat.partyId, token: gmToken } }),
    enabled: Boolean(seat.hostToken),
    refetchInterval: 2000,
  });
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);
  const snap = q.data;
  const elapsed = Math.max(0, now - (q.dataUpdatedAt || now));
  const cooldown = snap ? Math.max(0, snap.me.accusationCooldownMs - elapsed) : 0;
  const pendingHost = (hostQ.data?.claims ?? snap?.claims ?? []).filter((c) => c.status === "pending");

  async function adopt(playerId: string) {
    if (!seat.hostToken) { toast.error("Seul le maître du jeu peut changer d'écran."); return; }
    try {
      const res = await switchSeat({ data: { partyId: seat.partyId, hostToken: seat.hostToken, playerId } });
      const next: SessionRecord = { ...seat, playerId: res.playerId, token: res.token, name: res.name };
      setSeat(next); saveSession(next);
      qc.setQueryData(["snapshot", next.partyId, next.token], res.snapshot);
    } catch (e) { toast.error(errMessage(e)); }
  }

  if (q.isLoading && !snap) {
    return (<div className="flex flex-1 flex-col items-center justify-center gap-3 px-6"><DaggerMark className="size-8 animate-pulse text-muted" /><p className="text-sm text-muted">Ouverture du dossier…</p></div>);
  }
  if (q.isError || !snap) {
    return (<div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center"><p className="font-display text-2xl">Session perdue</p><p className="text-sm text-muted">{errMessage(q.error) || "Impossible de rejoindre cette soirée."}</p><Button asChild variant="outline"><Link to="/">Retour</Link></Button></div>);
  }
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center justify-between px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-3">
        <Wordmark />
        <div className="flex items-center gap-2 font-mono text-2xs tracking-caps text-muted uppercase"><span>{snap.party.code}</span><span className="text-subtle">·</span><span>{snap.party.aliveCount}/{snap.party.totalCount}</span></div>
      </header>
      <main className="flex flex-1 flex-col px-5 pb-4">
        {snap.party.status === "lobby" ? <Lobby snap={snap} seat={seat} gmToken={gmToken} /> : snap.party.status === "finished" ? <Finale snap={snap} /> : <Playing snap={snap} seat={seat} cooldown={cooldown} pendingHost={pendingHost} gmToken={gmToken} />}
      </main>
      {seat.hostToken ? <SeatBar snap={snap} currentId={seat.playerId} onAdopt={adopt} /> : <p className="px-5 pb-[max(1rem,env(safe-area-inset-bottom))] text-center text-xs text-subtle">Connecté en tant que {seat.name}</p>}
    </div>
  );
}

function Lobby({ snap, seat, gmToken }: { snap: GameSnapshot; seat: SessionRecord; gmToken: string }) {
  const qc = useQueryClient();
  const [guest, setGuest] = useState("");
  const isHost = Boolean(seat.hostToken) || snap.me.isHost;
  const start = useMutation({
    mutationFn: () => startGame({ data: { partyId: seat.partyId, token: gmToken } }),
    onSuccess: (data) => { qc.setQueryData(["snapshot", seat.partyId, seat.token], data); toast.success("La chasse commence."); },
    onError: (e) => toast.error(errMessage(e)),
  });
  const add = useMutation({
    mutationFn: (name: string) => addGuest({ data: { partyId: seat.partyId, token: gmToken, name } }),
    onSuccess: (data) => { qc.setQueryData(["snapshot", seat.partyId, seat.token], data); setGuest(""); },
    onError: (e) => toast.error(errMessage(e)),
  });
  return (
    <div className="stagger-in flex flex-1 flex-col gap-6">
      <div>
        <p className="font-mono text-2xs tracking-caps text-muted uppercase">{isHost ? "Maître du jeu" : "En attente"}</p>
        <h1 className="mt-2 font-display text-4xl leading-none tracking-tight">Le salon</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">{isHost ? "Partage le code. Lance la partie à partir de 3 joueurs." : "Le maître du jeu va bientôt lancer la chasse."}</p>
      </div>
      <button type="button" onClick={() => { void navigator.clipboard.writeText(snap.party.code); toast.success("Code copié"); }} className="flex items-center justify-between rounded-xl bg-surface px-5 py-4 shadow-[var(--shadow-border)]">
        <div><p className="font-mono text-2xs tracking-caps text-muted uppercase">Code</p><p className="mt-1 font-display text-4xl tracking-caps">{snap.party.code}</p></div>
        <Copy className="size-5 text-muted" strokeWidth={1.6} />
      </button>
      <section>
        <div className="mb-3 flex items-center gap-2 text-muted"><Users className="size-4" strokeWidth={1.6} /><h2 className="text-sm font-medium">Invités · {snap.players.length}</h2></div>
        <ul className="divide-y divide-border rounded-xl bg-surface shadow-[var(--shadow-border)]">
          {snap.players.map((p) => (
            <li key={p.id} className="flex items-center justify-between px-4 py-3"><span className="text-fg">{p.name}</span>{p.isHost ? <span className="font-mono text-2xs tracking-caps text-muted uppercase">Hôte</span> : null}</li>
          ))}
        </ul>
      </section>
      {isHost ? (
        <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (guest.trim()) add.mutate(guest.trim()); }}>
          <Input value={guest} onChange={(e) => setGuest(e.target.value)} placeholder="Ajouter un prénom" maxLength={20} />
          <Button type="submit" variant="outline" size="icon" disabled={add.isPending} aria-label="Ajouter"><Plus className="size-5" /></Button>
        </form>
      ) : null}
      {isHost ? (
        <Button size="lg" className="mt-auto w-full" disabled={snap.players.length < 3 || start.isPending} onClick={() => start.mutate()}>
          {snap.players.length < 3 ? `Encore ${3 - snap.players.length} joueur${3 - snap.players.length > 1 ? "s" : ""}` : "Lancer la chasse"}
        </Button>
      ) : <p className="mt-auto text-center text-sm text-muted">Tu es {snap.me.name}. Reste dans le salon.</p>}
    </div>
  );
}

function Playing({ snap, seat, cooldown, pendingHost, gmToken }: { snap: GameSnapshot; seat: SessionRecord; cooldown: number; pendingHost: KillClaimView[]; gmToken: string }) {
  const [tab, setTab] = useState<"dossier" | "table">("dossier");
  return (
    <div className="flex flex-1 flex-col gap-5">
      {seat.hostToken && pendingHost.length > 0 ? <HostQueue seat={seat} claims={pendingHost} gmToken={gmToken} /> : null}
      {snap.me.discovered && snap.me.isAlive ? (
        <div className="flex items-start gap-3 rounded-lg bg-surface px-4 py-3 shadow-[var(--shadow-border)]">
          <ShieldAlert className="mt-0.5 size-4 shrink-0 text-accent" strokeWidth={1.6} />
          <p className="text-sm leading-relaxed text-muted">Tu as été démasqué. Tu n'es pas éliminé — ta mission reste à accomplir.</p>
        </div>
      ) : null}
      <div className="flex rounded-md bg-surface p-1 shadow-[var(--shadow-border)]">
        {([["dossier", "Dossier"], ["table", "Table"]] as const).map(([id, label]) => (
          <button key={id} type="button" onClick={() => setTab(id)} className={cn("h-10 flex-1 rounded-sm text-sm font-medium transition-colors duration-150", tab === id ? "bg-bg-elevated text-fg" : "text-muted")}>{label}</button>
        ))}
      </div>
      {tab === "dossier" ? (snap.me.isAlive ? <AliveDossier snap={snap} seat={seat} cooldown={cooldown} /> : <Eliminated snap={snap} />) : <Table snap={snap} />}
    </div>
  );
}

function AliveDossier({ snap, seat, cooldown }: { snap: GameSnapshot; seat: SessionRecord; cooldown: number }) {
  const qc = useQueryClient();
  const [explain, setExplain] = useState("");
  const [killOpen, setKillOpen] = useState(false);
  const [accuseOpen, setAccuseOpen] = useState(false);
  const [accusedId, setAccusedId] = useState<string | null>(null);
  const kill = useMutation({
    mutationFn: () => declareKill({ data: { partyId: seat.partyId, token: seat.token, explanation: explain } }),
    onSuccess: (data) => { qc.setQueryData(["snapshot", seat.partyId, seat.token], data); setKillOpen(false); setExplain(""); toast.success("Kill déclaré. En attente du maître du jeu."); },
    onError: (e) => toast.error(errMessage(e)),
  });
  const accuse = useMutation({
    mutationFn: (id: string) => accusePlayer({ data: { partyId: seat.partyId, token: seat.token, accusedId: id } }),
    onSuccess: (data) => {
      qc.setQueryData(["snapshot", seat.partyId, seat.token], data.snapshot);
      setAccuseOpen(false); setAccusedId(null);
      if (data.correct) toast.success(`C'était ${data.accusedName}. Tu as démasqué ton killer.`);
      else toast.error(`${data.accusedName} n'est pas ton killer.`);
    },
    onError: (e) => toast.error(errMessage(e)),
  });
  const others = snap.players.filter((p) => p.id !== snap.me.id && p.isAlive);
  return (
    <div className="flex flex-1 flex-col gap-4">
      <p className="text-center text-xs tracking-wide text-subtle">Ne montre jamais cet écran.</p>
      <SecretCard kicker="Ta victime" title={snap.target?.name ?? "—"} />
      <SecretCard kicker="Ta mission" body={snap.mission ?? "—"} />
      {snap.pendingClaim ? (
        <div className="rounded-xl bg-surface px-5 py-4 shadow-[var(--shadow-border)]"><p className="font-mono text-2xs tracking-caps text-warn uppercase">En attente</p><p className="mt-2 text-sm leading-relaxed text-muted">Ton kill est entre les mains du maître du jeu.</p></div>
      ) : killOpen ? (
        <form className="flex flex-col gap-3 rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]" onSubmit={(e) => { e.preventDefault(); kill.mutate(); }}>
          <label className="text-sm text-muted" htmlFor="explain">Comment la mission a-t-elle été accomplie ?</label>
          <Textarea id="explain" value={explain} onChange={(e) => setExplain(e.target.value)} placeholder="Décris la scène, sans révéler ta mission à voix haute." maxLength={600} />
          <div className="flex gap-2">
            <Button type="button" variant="ghost" className="flex-1" onClick={() => setKillOpen(false)}>Annuler</Button>
            <Button type="submit" variant="accent" className="flex-1" disabled={explain.trim().length < 8 || kill.isPending}>Envoyer</Button>
          </div>
        </form>
      ) : (
        <Button size="lg" variant="accent" className="w-full" onClick={() => setKillOpen(true)}><Skull className="size-4" strokeWidth={1.7} />Déclarer un kill</Button>
      )}
      {accuseOpen ? (
        <div className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]">
          <p className="text-sm text-muted">Qui essaie de t'éliminer ?</p>
          <ul className="mt-3 flex flex-col gap-2">
            {others.map((p) => (
              <button key={p.id} type="button" onClick={() => setAccusedId(p.id)} className={cn("flex h-12 items-center justify-between rounded-md px-3 text-left text-sm shadow-[var(--shadow-border)]", accusedId === p.id ? "bg-bg-elevated text-fg" : "bg-surface-2 text-muted")}>
                {p.name}{accusedId === p.id ? <Check className="size-4" /> : null}
              </button>
            ))}
          </ul>
          <div className="mt-3 flex gap-2">
            <Button type="button" variant="ghost" className="flex-1" onClick={() => setAccuseOpen(false)}>Annuler</Button>
            <Button className="flex-1" variant="outline" disabled={!accusedId || accuse.isPending} onClick={() => accusedId && accuse.mutate(accusedId)}>Accuser</Button>
          </div>
        </div>
      ) : (
        <Button variant="outline" className="w-full" disabled={cooldown > 0} onClick={() => setAccuseOpen(true)}>
          <Crosshair className="size-4" strokeWidth={1.7} />{cooldown > 0 ? `Accuser · ${formatCooldown(cooldown)}` : "Accuser un joueur"}
        </Button>
      )}
    </div>
  );
}

function Eliminated({ snap }: { snap: GameSnapshot }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-10 text-center">
      <Skull className="size-10 text-muted" strokeWidth={1.4} />
      <h2 className="font-display text-3xl tracking-tight">Éliminé</h2>
      <p className="max-w-xs text-sm leading-relaxed text-muted">Ta soirée de killer s'arrête ici. Observe. Ne révèle rien.</p>
      <p className="font-mono text-2xs tracking-caps text-subtle uppercase">{snap.party.aliveCount} encore en vie</p>
    </div>
  );
}
function Table({ snap }: { snap: GameSnapshot }) {
  return (
    <ul className="divide-y divide-border rounded-xl bg-surface shadow-[var(--shadow-border)]">
      {snap.players.map((p) => (
        <li key={p.id} className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3"><UserRound className={cn("size-4", p.isAlive ? "text-muted" : "text-subtle")} strokeWidth={1.6} /><span className={p.isAlive ? "text-fg" : "text-subtle line-through"}>{p.name}</span></div>
          <div className="flex items-center gap-3 font-mono text-2xs tracking-wide text-muted uppercase">
            {p.discovered && p.isAlive ? <span className="text-accent">Démasqué</span> : null}
            {!p.isAlive ? <span>Out</span> : <span className="tabular-nums">{p.killCount} kill{p.killCount > 1 ? "s" : ""}</span>}
          </div>
        </li>
      ))}
    </ul>
  );
}
function HostQueue({ seat, claims, gmToken }: { seat: SessionRecord; claims: KillClaimView[]; gmToken: string }) {
  const qc = useQueryClient();
  const resolve = useMutation({
    mutationFn: (input: { claimId: string; approve: boolean }) => resolveKill({ data: { partyId: seat.partyId, token: gmToken, ...input } }),
    onSuccess: (data) => { qc.invalidateQueries({ queryKey: ["snapshot", seat.partyId] }); toast.success(data.party.status === "finished" ? "La soirée est close." : "Décision enregistrée."); },
    onError: (e) => toast.error(errMessage(e)),
  });
  return (
    <section className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]">
      <div className="mb-3 flex items-center gap-2"><Gavel className="size-4 text-accent" strokeWidth={1.6} /><h2 className="text-sm font-medium">Kills à valider</h2></div>
      <ul className="flex flex-col gap-3">
        {claims.map((c) => (
          <li key={c.id} className="rounded-md bg-bg-elevated p-3">
            <p className="text-sm text-fg"><span className="font-medium">{c.killerName}</span><span className="text-muted"> → </span><span className="font-medium">{c.victimName}</span></p>
            <p className="mt-1 text-xs text-muted">{c.mission}</p>
            <p className="mt-2 text-sm leading-relaxed text-fg">{c.explanation}</p>
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="outline" className="flex-1" disabled={resolve.isPending} onClick={() => resolve.mutate({ claimId: c.id, approve: false })}><X className="size-4" />Refuser</Button>
              <Button size="sm" variant="accent" className="flex-1" disabled={resolve.isPending} onClick={() => resolve.mutate({ claimId: c.id, approve: true })}><Check className="size-4" />Valider</Button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
function Finale({ snap }: { snap: GameSnapshot }) {
  return (
    <div className="stagger-in flex flex-1 flex-col items-center justify-center gap-5 py-8 text-center">
      <DaggerMark className="size-12 text-accent" />
      <p className="font-mono text-2xs tracking-caps text-muted uppercase">Dernier survivant</p>
      <h1 className="font-display text-5xl leading-none tracking-tight">{snap.party.winnerName ?? "—"}</h1>
      <p className="font-display text-xl text-muted">Grand Killer</p>
      {snap.recap.length > 0 ? (
        <ol className="mt-4 w-full divide-y divide-border rounded-xl bg-surface text-left shadow-[var(--shadow-border)]">
          {snap.recap.map((e, i) => (<li key={e.id} className="flex items-baseline justify-between px-4 py-3 text-sm"><span className="text-muted"><span className="mr-2 font-mono text-2xs text-subtle">{i + 1}</span>{e.killerName}<span className="text-subtle"> a éliminé </span>{e.victimName}</span></li>))}
        </ol>
      ) : null}
      <Button asChild variant="outline" className="mt-4"><Link to="/">Nouvelle soirée</Link></Button>
    </div>
  );
}
function SeatBar({ snap, currentId, onAdopt }: { snap: GameSnapshot; currentId: string; onAdopt: (id: string) => void }) {
  const seats = useMemo(() => snap.players, [snap.players]);
  return (
    <div className="border-t border-border bg-bg-elevated px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <p className="mb-2 px-1 font-mono text-2xs tracking-caps text-subtle uppercase">{snap.party.isDemo ? "Démo · changer de joueur" : "Écran d'un invité"}</p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {seats.map((p) => (
          <button key={p.id} type="button" onClick={() => onAdopt(p.id)} className={cn("h-10 shrink-0 rounded-full px-3.5 text-sm transition-colors duration-150", p.id === currentId ? "bg-fg text-bg" : "bg-surface text-muted shadow-[var(--shadow-border)]")}>{p.name}</button>
        ))}
      </div>
    </div>
  );
}
