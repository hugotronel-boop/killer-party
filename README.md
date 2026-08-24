# Killer Party

Jeu d'élimination pour soirées. Une victime, une mission, un secret.
Le dernier survivant est le Grand Killer.

## Lancer le jeu

Il te faut [Node.js 22](https://nodejs.org/) (ou plus récent).

```bash
git clone https://github.com/hugotronel-boop/killer-party.git
cd killer-party
npm install
npm run dev
```

Ouvre ensuite l'adresse affichée (port 8080).

Pas de compte, pas de `.env`. En local, la base tourne toute seule (PGLite).

## Comment jouer

1. Un hôte **crée une soirée** et partage le code à 4 lettres.
2. Les invités **rejoignent** avec ce code et leur prénom.
3. À partir de 3 joueurs, l'hôte **lance la chasse**.
4. Chaque joueur voit **en secret** sa victime et sa mission.
5. On accomplit la mission **naturellement**, puis on **déclare un kill**.
6. L'hôte **valide ou refuse**.
7. Le dernier en vie est le **Grand Killer**.

Démo : bouton « Essayer la démo ».

## Stack

React 19, TanStack Start, Tailwind v4, Postgres / PGLite.
