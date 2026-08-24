create table if not exists missions (
  id          text primary key,
  template    text not null,
  created_at  timestamptz not null default now()
);

create unique index if not exists missions_template_lower_idx on missions (lower(template));

insert into missions (id, template) values
  ('seed-01', 'Fais-lui demander sa pizza préférée.'),
  ('seed-02', 'Fais-lui faire un compliment sur une tenue.'),
  ('seed-03', 'Fais-lui raconter une blague.'),
  ('seed-04', 'Fais-lui demander son film préféré.'),
  ('seed-05', 'Fais-lui proposer un toast.'),
  ('seed-06', 'Fais-lui demander l''heure.'),
  ('seed-07', 'Fais-lui faire un selfie.'),
  ('seed-08', 'Fais-lui demander son voyage de rêve.'),
  ('seed-09', 'Fais-lui citer une réplique de film.'),
  ('seed-10', 'Fais-lui choisir la prochaine musique.'),
  ('seed-11', 'Fais-lui demander sa chanson du moment.'),
  ('seed-12', 'Fais-lui raconter un souvenir d''enfance.'),
  ('seed-13', 'Fais-lui complimenter un autre invité.'),
  ('seed-14', 'Fais-lui demander son plat signature.'),
  ('seed-15', 'Fais-lui inventer un super-pouvoir.'),
  ('seed-16', 'Fais-lui faire un vœu à voix haute.'),
  ('seed-17', 'Fais-lui dire le prénom de son premier animal.'),
  ('seed-18', 'Fais-lui raconter le pire jeu de mots.'),
  ('seed-19', 'Fais-lui décrire sa journée en trois mots.'),
  ('seed-20', 'Fais-lui inventer un nom de cocktail.'),
  ('seed-21', 'Fais-lui demander sa saison préférée.'),
  ('seed-22', 'Fais-lui faire un discours de dix secondes.'),
  ('seed-23', 'Fais-lui dire qui arriverait le plus en retard.'),
  ('seed-24', 'Fais-lui présenter deux personnes.'),
  ('seed-25', 'Fais-lui demander sa série du moment.'),
  ('seed-26', 'Fais-lui imiter une voix de film.'),
  ('seed-27', 'Fais-lui demander son café ou thé préféré.'),
  ('seed-28', 'Fais-lui choisir le prochain jeu de société.'),
  ('seed-29', 'Fais-lui révéler un talent caché.'),
  ('seed-30', 'Fais-lui raconter une anecdote de voyage.')
on conflict do nothing;
