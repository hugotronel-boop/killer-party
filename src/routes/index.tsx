import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Crosshair, Download, Play, Plus, Users } from "lucide-react";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DaggerMark } from "@/components/mark";
import { createDemo, createParty, joinParty } from "@/lib/game/api";
import { saveSession } from "@/lib/game/session";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"home" | "create" | "join">("home");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await createParty({ data: { name } });
      saveSession({ partyId: res.partyId, code: res.code, playerId: res.playerId, token: res.token, hostToken: res.hostToken, name: res.name });
      await navigate({ to: "/p/$code", params: { code: res.code } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Impossible de créer la soirée.");
    } finally { setBusy(false); }
  }

  async function onJoin(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await joinParty({ data: { code, name } });
      saveSession({ partyId: res.partyId, code: res.code, playerId: res.playerId, token: res.token, name: res.name });
      await navigate({ to: "/p/$code", params: { code: res.code } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Impossible de rejoindre.");
    } finally { setBusy(false); }
  }

  async function onDemo() {
    setBusy(true);
    try {
      const res = await createDemo();
      const host = res.players.find((p) => p.isHost) ?? res.players[0]!;
      saveSession({ partyId: res.partyId, code: res.code, playerId: host.id, token: host.token, hostToken: res.hostToken, name: host.name });
      await navigate({ to: "/p/$code", params: { code: res.code } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Démo indisponible.");
    } finally { setBusy(false); }
  }

  return (
    <div className="flex min-h-dvh flex-col px-6 pt-[max(2.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      {mode === "home" ? (
        <div className="stagger-in flex flex-1 flex-col">
          <div className="flex items-center gap-2 text-muted">
            <DaggerMark className="size-4" />
            <span className="font-mono text-2xs tracking-caps uppercase">Soirée privée</span>
          </div>
          <h1 className="mt-10 font-display text-7xl leading-none tracking-tight">Killer<br />Party</h1>
          <div className="mt-6 h-px w-16 bg-accent" />
          <p className="mt-6 max-w-xs text-base leading-relaxed text-muted">Une victime. Une mission. Un secret. Le dernier survivant est le Grand Killer.</p>
          <div className="mt-auto flex flex-col gap-3 pt-10">
            <Button size="lg" className="w-full" onClick={() => setMode("create")} disabled={busy}><Plus className="size-4" strokeWidth={1.8} />Créer une soirée</Button>
            <Button size="lg" variant="outline" className="w-full" onClick={() => setMode("join")} disabled={busy}><Users className="size-4" strokeWidth={1.8} />Rejoindre</Button>
            <Button size="lg" variant="ghost" className="w-full" onClick={onDemo} disabled={busy}><Play className="size-4" strokeWidth={1.8} />Essayer la démo</Button>
            <Button asChild size="lg" variant="outline" className="w-full"><a href="/killer-party.zip" download="killer-party.zip"><Download className="size-4" strokeWidth={1.8} />Télécharger le jeu</a></Button>
            <Link to="/defis" className="mt-2 inline-flex h-11 items-center justify-center gap-2 text-sm text-muted transition-colors hover:text-fg"><Crosshair className="size-4" strokeWidth={1.6} />Les défis</Link>
            <Link to="/regles" className="inline-flex h-11 items-center justify-center gap-2 text-sm text-muted transition-colors hover:text-fg"><BookOpen className="size-4" strokeWidth={1.6} />Lire les règles</Link>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col">
          <button type="button" onClick={() => setMode("home")} className="self-start text-sm text-muted transition-colors hover:text-fg">Retour</button>
          <h1 className="mt-8 font-display text-4xl tracking-tight">{mode === "create" ? "Nouvelle soirée" : "Rejoindre"}</h1>
          <p className="mt-2 text-sm text-muted">{mode === "create" ? "Tu seras le maître du jeu. Tes invités entreront le code." : "Entre le code à 4 lettres et ton prénom."}</p>
          <form className="mt-8 flex flex-col gap-4" onSubmit={mode === "create" ? onCreate : onJoin}>
            {mode === "join" ? (
              <div className="flex flex-col gap-2">
                <label htmlFor="code" className="text-sm text-muted">Code</label>
                <Input id="code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="K7RM" autoCapitalize="characters" autoComplete="off" maxLength={8} required />
              </div>
            ) : null}
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="text-sm text-muted">Ton prénom</label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Camille" autoComplete="given-name" maxLength={20} required />
            </div>
            <Button type="submit" size="lg" className="mt-4 w-full" disabled={busy || name.trim().length < 2}>Continuer<ArrowRight className="size-4" /></Button>
          </form>
        </div>
      )}
    </div>
  );
}
