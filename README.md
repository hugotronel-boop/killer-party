# Killer Party

Jeu d'élimination pour soirées. Une victime, une mission, un secret.
Le dernier survivant est le Grand Killer.

## Lancer le jeu

Il te faut [Node.js 22](https://nodejs.org/) (ou plus récent).

```bash
npm install
npm run dev
```

Ouvre ensuite l'adresse affichée dans le terminal (par défaut le port 8080).

Pas de compte, pas de `.env` à créer. En local, la base tourne toute seule (PGLite).

## Comment jouer

1. Un hôte **crée une soirée** et partage le code à 4 lettres.
2. Les invités **rejoignent** avec ce code et leur prénom.
3. À partir de 3 joueurs, l'hôte **lance la chasse**.
4. Chaque joueur voit **en secret** sa victime et sa mission (appuyer pour révéler).
5. On accomplit la mission **naturellement**, puis on **déclare un kill**.
6. L'hôte **valide ou refuse**. Si c'est validé, le tueur récupère la cible et la mission de sa victime.
7. Le dernier en vie est le **Grand Killer**.

**Démo :** bouton « Essayer la démo ».

### Accusations

Bonne accusation : tu as trouvé ton killer. Il est démasqué, mais pas éliminé.
Mauvaise accusation : attente de 30 minutes (30 secondes en démo).

## Stack

React 19, TanStack Start, Tailwind v4, Postgres / PGLite.
Auth désactivée : identification par jeton dans le navigateur.
