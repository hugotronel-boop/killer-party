import { createFileRoute, Link } from "@tanstack/react-router";
import { type FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { PartyView } from "@/components/game/party-view";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Wordmark } from "@/components/mark";
import { joinParty } from "@/lib/game/api";
import { getSession, saveSession } from "@/lib/game/session";
import type { SessionRecord } from "@/lib/game/types";

export const Route = createFileRoute("/p/$code")({ component: PartyRoute });

function PartyRoute() {
  const { code } = Route.useParams();
  const [session, setSession] = useState<SessionRecord | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSession(getSession(code));
    setReady(true);
  }, [code]);

  if (!ready) return <div className="flex-1" />;

  if (!session || session.code.toUpperCase() !== code.toUpperCase()) {
    return <JoinGate code={code.toUpperCase()} onJoined={setSession} />;
  }

  return <PartyView key={session.playerId + session.token} session={session} />;
}

function JoinGate({
  code,
  onJoined,
}: {
  code: string;
  onJoined: (s: SessionRecord) => void;
}) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await joinParty({ data: { code, name } });
      const record: SessionRecord = {
        partyId: res.partyId,
        code: res.code,
        playerId: res.playerId,
        token: res.token,
        name: res.name,
      };
      saveSession(record);
      onJoined(record);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Impossible de rejoindre.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col px-6 pt-[max(2rem,env(safe-area-inset-top))] pb-8">
      <Wordmark />
      <h1 className="mt-10 font-display text-4xl tracking-tight">Rejoindre {code}</h1>
      <p className="mt-2 text-sm text-muted">Entre ton prénom. Personne d'autre ne doit voir ton écran.</p>
      <form className="mt-8 flex flex-col gap-4" onSubmit={onSubmit}>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ton prénom" maxLength={20} required />
        <Button type="submit" size="lg" disabled={busy || name.trim().length < 2}>
          Entrer dans le salon
        </Button>
      </form>
      <Link to="/" className="mt-6 text-center text-sm text-muted">
        Retour
      </Link>
    </div>
  );
}
