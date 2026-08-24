export const MISSION_TEMPLATES: string[] = [
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

export function fillMission(template: string, name: string): string {
  return template.replaceAll("{name}", name);
}

export function pickMissions(names: string[], templates: string[] = MISSION_TEMPLATES): string[] {
  const pool = [...(templates.length ? templates : MISSION_TEMPLATES)];
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return names.map((name, i) => fillMission(pool[i % pool.length]!, name));
}
