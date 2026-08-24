function viewLobby() {
  const p = S.party;
  const host = me() && me().isHost;
  const rows = p.players.map(function (x) {
    return '<li class="row"><span>' + esc(x.name) + "</span>" + (x.isHost ? '<span class="chip">Hôte</span>' : "") + "</li>";
  }).join("");
  const add = host
    ? '<form id="add" class="add-row"><input id="guest" value="' + esc(S.guest) + '" placeholder="Ajouter un prénom" maxlength="20" /><button class="btn btn-out icon-only" type="submit" aria-label="Ajouter">' + ico("plus") + "</button></form>" +
      '<button class="btn btn-lg btn-fill" data-act="start"' + (p.players.length < 3 ? " disabled" : "") + ">" +
        (p.players.length < 3 ? ("Encore " + (3 - p.players.length) + " joueur" + (3 - p.players.length > 1 ? "s" : "")) : "Lancer la chasse") +
      "</button>"
    : '<p class="muted center-text">Tu es ' + esc(me() ? me().name : "") + ". Reste dans le salon.</p>";
  return (
    '<div class="wrap">' +
      '<div class="topbar">' + wordmark() + '<span class="chip">' + esc(p.code) + " · " + p.players.length + "</span></div>" +
      '<div class="stagger col">' +
        '<div><p class="chip">' + (host ? "Maître du jeu" : "En attente") + '</p><h1 class="page-title tight">Le salon</h1>' +
        '<p class="lede">' + (host ? "Partage le code. Lance la partie à partir de 3 joueurs." : "Le maître du jeu va bientôt lancer la chasse.") + "</p></div>" +
        '<button class="card code-card" data-act="copy"><div><p class="chip">Code</p><p class="code-big">' + esc(p.code) + "</p></div>" + ico("copy") + "</button>" +
        '<section><div class="kicker tight">' + ico("users") + " invités · " + p.players.length + '</div><ul class="list">' + rows + "</ul></section>" +
        add +
        '<button class="link" data-act="reset">Nouvelle soirée</button>' +
      "</div>" +
    "</div>"
  );
}
function secretCard(key, kicker, title, body) {
  const open = S.reveal && S.reveal[key];
  if (open) {
    return (
      '<button type="button" class="card secret" data-reveal="' + key + '">' +
        '<p class="chip">' + esc(kicker) + "</p>" +
        (title ? '<p class="secret-title">' + esc(title) + "</p>" : "") +
        (body ? '<p class="secret-body">' + esc(body) + "</p>" : "") +
      "</button>"
    );
  }
  return (
    '<button type="button" class="card secret" data-reveal="' + key + '">' +
      '<p class="chip">' + esc(kicker) + "</p>" +
      '<div class="bars"><div class="bar"></div><div class="bar short"></div></div>' +
      '<span class="hold">' + ico("eye") + " Appuie pour révéler</span>" +
    "</button>"
  );
}
function viewPlaying() {
  const p = S.party;
  const m = me();
  const alive = p.players.filter(function (x) { return x.isAlive; }).length;
  const cd = remainCd();
  const pending = pendingAll();
  const mine = pendingOf(m);
  const others = p.players.filter(function (x) { return x.id !== m.id && x.isAlive; });
  const tgt = targetOf(m);
  const body = S.tab === "table" ? tableView() : (!m.isAlive ? eliminated(alive) : dossier(m, tgt, mine, others, cd));
  return (
    '<div class="screen">' +
      '<div class="wrap play">' +
        '<div class="topbar">' + wordmark() + '<span class="chip">' + esc(p.code) + " · " + alive + "/" + p.players.length + "</span></div>" +
        '<div class="col play-body">' +
          (m.isHost && pending.length ? hostQueue(pending) : "") +
          (m.discovered && m.isAlive ? '<div class="warnbox">' + ico("shield") + "<p>Tu as été démasqué. Tu n'es pas éliminé — ta mission reste à accomplir.</p></div>" : "") +
          '<div class="tabs"><button class="' + (S.tab === "dossier" ? "on" : "") + '" data-tab="dossier">Dossier</button><button class="' + (S.tab === "table" ? "on" : "") + '" data-tab="table">Table</button></div>' +
          body +
        "</div>" +
      "</div>" +
      seatBar() +
    "</div>"
  );
}
function dossier(m, tgt, mine, others, cd) {
  var kill;
  if (mine) {
    kill = '<div class="card"><p class="chip warn">En attente</p><p class="muted small">Ton kill est entre les mains du maître du jeu.</p></div>';
  } else if (S.killOpen) {
    kill = '<form id="killf" class="card form tight"><label>Comment la mission a-t-elle été accomplie ?</label><textarea id="explain" maxlength="600" placeholder="Décris la scène, sans révéler ta mission à voix haute.">' + esc(S.explain) + '</textarea><div class="row-actions"><button type="button" class="btn btn-sm btn-ghost" data-act="kill-cancel">Annuler</button><button class="btn btn-sm btn-accent" type="submit">Envoyer</button></div></form>';
  } else {
    kill = '<button class="btn btn-lg btn-accent" data-act="kill-open">' + ico("skull") + " Déclarer un kill</button>";
  }
  var acc;
  if (S.accuseOpen) {
    acc = '<div class="card"><p class="muted small">Qui essaie de t\' éliminer ?</p><div class="choices">' +
      others.map(function (o) {
        return '<button class="choice ' + (S.accusedId === o.id ? "on" : "") + '" data-accuse="' + o.id + '">' + esc(o.name) + (S.accusedId === o.id ? " " + ico("check") : "") + "</button>";
      }).join("") +
      '</div><div class="row-actions"><button class="btn btn-sm btn-ghost" data-act="accuse-cancel">Annuler</button><button class="btn btn-sm btn-out" data-act="accuse-go"' + (S.accusedId ? "" : " disabled") + ">Accuser</button></div></div>";
  } else {
    acc = '<button class="btn btn-lg btn-out" data-act="accuse-open"' + (cd > 0 ? " disabled" : "") + ">" + ico("crosshair") + " " + (cd > 0 ? ("Accuser · " + fmtCd(cd)) : "Accuser un joueur") + "</button>";
  }
  return '<p class="whisper">Ne montre jamais cet écran.</p>' +
    secretCard("victim", "Ta victime", (tgt && tgt.name) || "—", "") +
    secretCard("mission", "Ta mission", "", m.mission || "—") +
    kill + acc;
}
function eliminated(alive) {
  return '<div class="center"><div class="big-ico">' + ico("skull") + '</div><h1 class="page-title tight">Éliminé</h1><p class="lede">Ta soirée de killer s\'arrête ici. Observe. Ne révèle rien.</p><p class="chip">' + alive + " encore en vie</p></div>";
}
function tableView() {
  return '<ul class="list">' + S.party.players.map(function (p) {
    return '<li class="row"><span class="row-name">' + ico("user") + '<span class="' + (p.isAlive ? "" : "out") + '">' + esc(p.name) + '</span></span><span class="chip">' +
      (p.discovered && p.isAlive ? '<span class="accent">Démasqué</span>' : (!p.isAlive ? "Out" : (p.killCount + " kill" + (p.killCount > 1 ? "s" : "")))) +
      "</span></li>";
  }).join("") + "</ul>";
}
function hostQueue(claims) {
  return '<section class="card"><div class="kicker tight">' + ico("gavel") + " Kills à valider</div>" + claims.map(function (c) {
    const k = byId(c.killerId); const v = byId(c.victimId);
    return '<div class="claim"><p><strong>' + esc(k && k.name) + '</strong> <span class="muted">→</span> <strong>' + esc(v && v.name) + '</strong></p><p class="muted tiny">' + esc(c.mission) + '</p><p class="claim-exp">' + esc(c.explanation) + '</p><div class="row-actions"><button class="btn btn-sm btn-out" data-refuse="' + c.id + '">' + ico("x") + ' Refuser</button><button class="btn btn-sm btn-accent" data-ok="' + c.id + '">' + ico("check") + " Valider</button></div></div>";
  }).join("") + "</section>";
}
function seatBar() {
  return '<div class="seats"><p class="chip">' + (S.party.isDemo ? "Démo · changer de joueur" : "Passe le téléphone · écran d'un invité") + '</p><div class="scroller">' +
    S.party.players.map(function (p) {
      return '<button class="seat ' + (p.id === S.seatId ? "on" : "") + '" data-seat="' + p.id + '">' + esc(p.name) + "</button>";
    }).join("") +
    "</div></div>";
}
function viewFinale() {
  const recap = (S.party.claims || []).filter(function (c) { return c.status === "validated"; });
  const list = recap.length
    ? '<ol class="list recap">' + recap.map(function (c, i) {
        return '<li class="row"><span class="muted"><span class="chip">' + (i + 1) + "</span> " + esc(byId(c.killerId) && byId(c.killerId).name) + ' <span class="subtle">a éliminé</span> ' + esc(byId(c.victimId) && byId(c.victimId).name) + "</span></li>";
      }).join("") + "</ol>"
    : "";
  return '<div class="wrap"><div class="center stagger">' + dagger() + '<p class="chip">Dernier survivant</p><h1 class="hero-name">' + esc(S.party.winnerName || "—") + '</h1><p class="grand">Grand Killer</p>' + list + '<button class="btn btn-out" data-act="reset">Nouvelle soirée</button></div></div>';
}
