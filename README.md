# Killer Party

Jeu d'élimination pour soirées. Une victime, une mission, un secret.
Le dernier survivant est le Grand Killer.

## Jouer maintenant (iPhone)

Ouvre ce lien dans Safari :

**https://hugotronel-boop.github.io/killer-party/**

Pas de Node, pas d’installation. Passe le téléphone à chaque joueur.

Si tu vois encore le texte du README au lieu du jeu : attends 1 minute et recharge, ou ouvre le lien ci-dessus (avec `/killer-party/` à la fin).

## Comment jouer

1. Un hôte **crée une soirée** et ajoute les prénoms.
2. À partir de 3 joueurs, **lance la chasse**.
3. Passe le téléphone. Chaque joueur **reste appuyé** pour voir sa victime et sa mission.
4. On accomplit la mission **naturellement**, puis on **déclare un kill**.
5. L’hôte **valide ou refuse**.
6. Le dernier en vie est le **Grand Killer**.

Démo : bouton « Essayer la démo ».

## Code source (ordinateur)

```bash
git clone https://github.com/hugotronel-boop/killer-party.git
cd killer-party
npm install
npm run dev
```

React / TanStack Start, port 8080. En local, la base tourne toute seule (PGLite).
