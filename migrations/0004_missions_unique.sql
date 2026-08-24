delete from missions
where id not in (
  select min(id) from missions group by lower(template)
);

create unique index if not exists missions_template_unique_idx on missions (template);
