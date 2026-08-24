create table if not exists parties (
  id            text primary key,
  code          text not null unique,
  host_token    text not null,
  status        text not null default 'lobby',
  is_demo       boolean not null default false,
  winner_id     text,
  created_at    timestamptz not null default now(),
  started_at    timestamptz
);

create table if not exists players (
  id                   text primary key,
  party_id             text not null references parties(id) on delete cascade,
  token                text not null unique,
  name                 text not null,
  is_host              boolean not null default false,
  is_alive             boolean not null default true,
  target_id            text,
  mission              text,
  discovered           boolean not null default false,
  last_accusation_at   timestamptz,
  kill_count           integer not null default 0,
  created_at           timestamptz not null default now()
);

create index if not exists players_party_id_idx on players (party_id);
create unique index if not exists players_party_name_idx on players (party_id, lower(name));

create table if not exists kill_claims (
  id            text primary key,
  party_id      text not null references parties(id) on delete cascade,
  killer_id     text not null,
  victim_id     text not null,
  explanation   text not null,
  status        text not null default 'pending',
  created_at    timestamptz not null default now()
);

create index if not exists kill_claims_party_id_idx on kill_claims (party_id);

create table if not exists accusations (
  id            text primary key,
  party_id      text not null references parties(id) on delete cascade,
  accuser_id    text not null,
  accused_id    text not null,
  correct       boolean not null,
  created_at    timestamptz not null default now()
);
