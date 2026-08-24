import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { addMission, deleteMission, listMissions, updateMission } from "@/lib/game/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Wordmark } from "@/components/mark";

export const Route = createFileRoute("/defis")({ component: MissionsPage });

function MissionsPage() {
  const qc = useQueryClient();
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const list = useQuery({ queryKey: ["missions"], queryFn: () => listMissions() });

  const add = useMutation({
    mutationFn: () => addMission({ data: { template: draft } }),
    onSuccess: () => {
      setDraft("");
      void qc.invalidateQueries({ queryKey: ["missions"] });
      toast.success("Défi ajouté.");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Impossible d'ajouter."),
  });

  const update = useMutation({
    mutationFn: ({ id, template }: { id: string; template: string }) =>
      updateMission({ data: { id, template } }),
    onSuccess: () => {
      setEditingId(null);
      void qc.invalidateQueries({ queryKey: ["missions"] });
      toast.success("Défi modifié.");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Impossible de modifier."),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteMission({ data: { id } }),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ["missions"] }); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Impossible de supprimer."),
  });

  async function onAdd(e: FormEvent) {
    e.preventDefault();
    if (sending || add.isPending) return;
    if (draft.trim().length < 8) {
      toast.error("Écris un défi un peu plus long.");
      return;
    }
    setSending(true);
    try { await add.mutateAsync(); }
    finally { setSending(false); }
  }

  const missions = list.data ?? [];

  return (
    <div className="flex min-h-dvh flex-col px-6 pt-[max(2rem,env(safe-area-inset-top))] pb-16">
      <div className="flex items-center justify-between">
        <Wordmark />
        <Link to="/" className="text-sm text-muted transition-colors hover:text-fg">Fermer</Link>
      </div>
      <h1 className="mt-10 font-display text-4xl tracking-tight">Les défis</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        Chaque soirée pioche ici. Un défi peut tomber sur n'importe qui. Ajoute, modifie ou supprime.
      </p>
      <form className="mt-8 flex flex-col gap-3" onSubmit={onAdd}>
        <label htmlFor="mission" className="text-sm text-muted">Nouveau défi</label>
        <Textarea id="mission" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Fais-lui demander son dessert préféré." maxLength={160} />
        <Button type="submit" disabled={sending || add.isPending || draft.trim().length < 8}>
          <Plus className="size-4" strokeWidth={1.8} />Ajouter
        </Button>
      </form>
      <p className="mt-10 font-mono text-2xs tracking-caps uppercase text-muted">
        {missions.length} défi{missions.length === 1 ? "" : "s"}
      </p>
      <ul className="mt-2">
        {missions.map((m) => (
          <MissionRow key={m.id} id={m.id} template={m.template} editing={editingId === m.id} busy={update.isPending || remove.isPending} onEdit={() => setEditingId(m.id)} onCancel={() => setEditingId(null)} onSave={(template) => update.mutate({ id: m.id, template })} onDelete={() => remove.mutate(m.id)} />
        ))}
      </ul>
      {list.isLoading ? <p className="mt-6 text-sm text-muted">Chargement…</p> : null}
      {!list.isLoading && missions.length === 0 ? (
        <p className="mt-6 text-sm text-muted">Aucun défi. Ajoutes-en un ci-dessus.</p>
      ) : null}
    </div>
  );
}

function MissionRow({ template, editing, busy, onEdit, onCancel, onSave, onDelete }: {
  id: string; template: string; editing: boolean; busy: boolean;
  onEdit: () => void; onCancel: () => void; onSave: (template: string) => void; onDelete: () => void;
}) {
  const [value, setValue] = useState(template);
  if (editing) {
    return (
      <li className="border-b border-border py-4 last:border-b-0">
        <Textarea value={value} onChange={(e) => setValue(e.target.value)} maxLength={160} className="min-h-24" />
        <div className="mt-3 flex gap-2">
          <Button type="button" size="sm" disabled={busy || value.trim().length < 8} onClick={() => onSave(value)}>
            <Check className="size-4" strokeWidth={1.8} />Enregistrer
          </Button>
          <Button type="button" size="sm" variant="ghost" disabled={busy} onClick={onCancel}>
            <X className="size-4" strokeWidth={1.8} />Annuler
          </Button>
        </div>
      </li>
    );
  }
  return (
    <li className="flex items-start gap-1 border-b border-border py-4 last:border-b-0">
      <p className="flex-1 pt-2 text-sm leading-relaxed">{template}</p>
      <button type="button" className="flex size-11 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface hover:text-fg" onClick={() => { setValue(template); onEdit(); }} disabled={busy} aria-label="Modifier ce défi">
        <Pencil className="size-4" strokeWidth={1.6} />
      </button>
      <button type="button" className="flex size-11 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface hover:text-accent" onClick={onDelete} disabled={busy} aria-label="Supprimer ce défi">
        <Trash2 className="size-4" strokeWidth={1.6} />
      </button>
    </li>
  );
}
