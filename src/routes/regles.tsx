import { createFileRoute, Link } from "@tanstack/react-router";
import { Ban, Crosshair, EyeOff, Flag, Ghost, Shield, Target, Trophy } from "lucide-react";
import { Wordmark } from "@/components/mark";

export const Route = createFileRoute("/regles")({ component: RulesPage });

function RulesPage() {
  return (
    <article className="flex min-h-dvh flex-col px-6 pt-[max(2rem,env(safe-area-inset-top))] pb-16">
      <div className="flex items-center justify-between">
        <Wordmark />
        <Link to="/" className="text-sm text-muted transition-colors hover:text-fg">Fermer</Link>
      </div>
      <h1 className="mt-10 font-display text-4xl tracking-tight">Les règles</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        Killer Party se joue pendant toute une soirée. Chaque joueur reçoit en secret une victime et une mission.
      </p>
      <Rule icon={Target} title="Le but" body="Élimine ta victime en lui faisant accomplir ta mission, sans te faire découvrir. À chaque kill validé, tu récupères sa cible et sa mission. Le dernier joueur encore en jeu remporte la partie." />
      <Rule icon={Ghost} title="La mission" body="Amène ta victime à réaliser l'action naturellement. Tu ne peux pas lui demander de la faire pour le jeu. Si elle comprend trop tard, c'est déjà un kill." />
      <Rule icon={Flag} title="Déclarer un kill" body="Quand tu penses avoir réussi, déclare le kill et explique la scène au maître du jeu. Il valide ou refuse. Un refus laisse ta mission active." />
      <Rule icon={Crosshair} title="Les accusations" body="Tu peux accuser celui que tu crois être ton killer. Une bonne accusation le démasque — mais ne l'élimine pas. Une mauvaise t'impose d'attendre 30 minutes." />
      <Rule icon={EyeOff} title="Le secret" body="Ne montre jamais ta victime, ta mission, ni l'écran de l'application. Les missions se jouent dans la discrétion." />
      <Rule icon={Ban} title="Missions interdites" body="Rien de dangereux, d'humiliant, d'illégal, de coûteux, ni qui force à boire, manger, ou à un contact non souhaité. Une bonne mission n'a aucune conséquence négative." />
      <Rule icon={Trophy} title="Le Grand Killer" body="La partie s'arrête quand il ne reste plus qu'un joueur capable de poursuivre la chaîne. Il est déclaré Grand Killer." />
      <Rule icon={Shield} title="Le maître du jeu" body="C'est lui qui lance la soirée, valide les kills, et tranche les doutes. Il peut aussi jouer." />
    </article>
  );
}

function Rule({ icon: Icon, title, body }: { icon: typeof Target; title: string; body: string }) {
  return (
    <section className="mt-8 flex gap-4">
      <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-sm bg-surface shadow-[var(--shadow-border)]">
        <Icon className="size-4 text-muted" strokeWidth={1.6} />
      </div>
      <div>
        <h2 className="font-display text-xl tracking-tight">{title}</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">{body}</p>
      </div>
    </section>
  );
}
