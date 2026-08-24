function render() {
  const root = $("app");
  const v = S.view;
  if (v === "home") root.innerHTML = viewHome();
  else if (v === "create" || v === "join") root.innerHTML = viewForm();
  else if (v === "rules") root.innerHTML = viewRules();
  else if (v === "lobby") root.innerHTML = viewLobby();
  else if (v === "playing") root.innerHTML = viewPlaying();
  else if (v === "finale") root.innerHTML = viewFinale();
  else root.innerHTML = viewHome();
  if (S.toast) {
    const t = document.createElement("div");
    t.className = "toast";
    t.textContent = S.toast;
    root.appendChild(t);
  }
  bind();
}
function viewHome() {
  return '<div class="wrap stagger"><div class="kicker">' + dagger() + ' Soirée privée</div><h1 class="title">Killer<br/>Party</h1><div class="rule"></div><p class="lede">Une victime. Une mission. Un secret. Le dernier survivant est le Grand Killer.</p><div class="stack"><button class="btn btn-lg btn-fill" data-go="create">Créer une soirée</button><button class="btn btn-lg btn-out" data-act="demo">Essayer la démo</button><button class="btn btn-lg btn-ghost" data-go="rules">Lire les règles</button></div></div>';
}
function viewForm() {
  const create = S.view === "create";
  return '<div class="wrap"><button class="back" data-go="home">Retour</button><h1 style="font-size:2.2rem;margin-top:2rem">' + (create ? "Nouvelle soirée" : "Rejoindre") + '</h1><p class="lede">' + (create ? "Tu seras le maître du jeu. Passe le téléphone à chaque invité." : "Entre le code et ton prénom.") + '</p><form id="f" class="stack" style="margin-top:2rem"><div class="field"><label>Ton prénom</label><input id="name" value="' + esc(S.name) + '" maxlength="20" autocomplete="given-name" required /></div><button class="btn btn-lg btn-fill" type="submit">Continuer</button></form></div>';
}
function viewRules() {
  const items = [
    ["\uD83C\uDFAF", "Le but", "Élimine ta victime en lui faisant accomplir ta mission, sans te faire découvrir. À chaque kill, tu récupères sa cible."],
    ["\uD83D\uDC7B", "La mission", "Amène-la à le faire naturellement. Tu ne peux pas lui demander de le faire pour le jeu."],
    ["\u2691", "Déclarer un kill", "Explique la scène au maître du jeu. Il valide ou refuse."],
    ["\u2295", "Les accusations", "Une bonne accusation démasque ton killer \u2014 sans l'\u00e9liminer. Une mauvaise : 30 minutes d'attente."],
    ["\uD83D\uDC41", "Le secret", "Ne montre jamais cet écran. Passe le téléphone, chaque joueur ouvre son dossier."],
    ["\uD83C\uDFC6", "Le Grand Killer", "Le dernier encore en vie remporte la soirée."],
  ];
  return '<div class="wrap"><div style="display:flex;justify-content:space-between;align-items:center"><div class="kicker">' + dagger() + ' Killer Party</div><button class="back" data-go="home">Fermer</button></div><h1 style="font-size:2.2rem;margin-top:2.2rem">Les règles</h1>' + items.map(function (x) { return '<section class="rule-item"><div class="ico">' + x[0] + '</div><div><h2 style="font-size:1.25rem">' + x[1] + '</h2><p style="margin-top:.4rem;color:var(--muted);font-size:.9rem;line-height:1.5">' + x[2] + '</p></div></section>'; }).join("") + '</div>';
}
function viewLobby() {
  const p = S.party; const host = me() && me().isHost;
  const rows = p.players.map(function (x) { return '<div class="row"><span>' + esc(x.name) + '</span>' + (x.isHost ? '<span class="chip">Hôte</span>' : '') + '</div>'; }).join("");
  const add = host ? '<form id="add" style="display:flex;gap:.5rem"><input id="guest" value="' + esc(S.guest) + '" placeholder="Ajouter un prénom" maxlength="20" /><button class="btn btn-out" type="submit" style="width:3.25rem;padding:0">+</button></form><button class="btn btn-lg btn-fill" data-act="start"' + (p.players.length < 3 ? ' disabled' : '') + '>' + (p.players.length < 3 ? ('Encore ' + (3 - p.players.length) + ' joueur' + (3 - p.players.length > 1 ? 's' : '')) : 'Lancer la chasse') + '</button>' : '<p style="color:var(--muted);text-align:center">Tu es ' + esc(me() ? me().name : '') + '.</p>';
  return '<div class="wrap"><div style="display:flex;justify-content:space-between"><div class="kicker">' + dagger() + ' Killer Party</div><span class="chip">' + esc(p.code) + ' \u00b7 ' + p.players.length + '</span></div><div class="stagger" style="display:flex;flex-direction:column;gap:1.4rem;flex:1;margin-top:1.5rem"><div><p class="chip">' + (host ? 'Maître du jeu' : 'En attente') + '</p><h1 style="font-size:2.4rem;margin-top:.4rem">Le salon</h1><p class="lede">' + (host ? 'Ajoute les prénoms. Lance à partir de 3 joueurs. Passe ensuite le téléphone.' : 'Le maître du jeu va lancer la chasse.') + '</p></div><button class="card" data-act="copy" style="display:flex;justify-content:space-between;align-items:center;width:100%;text-align:left"><div><p class="chip">Code</p><p style="font-family:var(--display);font-size:2.4rem;margin-top:.2rem">' + esc(p.code) + '</p></div><span class="chip">copier</span></button><div><p class="kicker" style="margin-bottom:.6rem">Invités \u00b7 ' + p.players.length + '</p><div class="list">' + rows + '</div></div>' + add + '<button class="link" data-act="reset">Nouvelle soirée</button></div></div>';
}
function secretCard(kicker, value) {
  if (S.hold) return '<div class="card secret"><p class="chip">' + esc(kicker) + '</p><p style="font-family:var(--display);font-size:1.7rem;margin-top:.45rem">' + esc(value) + '</p></div>';
  return '<div class="card secret" data-hold="1"><p class="chip">' + esc(kicker) + '</p><p class="hold" style="margin-top:.7rem">Reste appuyé pour révéler</p><div class="bar"></div><div class="bar" style="width:48%"></div></div>';
}
function viewPlaying() {
  const p = S.party; const m = me();
  const alive = p.players.filter(function (x) { return x.isAlive; }).length;
  const cd = remainCd(); const pending = pendingAll(); const mine = pendingOf(m);
  const others = p.players.filter(function (x) { return x.id !== m.id && x.isAlive; });
  const tgt = targetOf(m);
  const body = S.tab === "table" ? tableView() : (!m.isAlive ? eliminated(alive) : dossier(m, tgt, mine, others, cd));
  return '<div style="display:flex;flex-direction:column;min-height:100dvh"><div class="wrap" style="padding-bottom:.5rem;flex:1"><div style="display:flex;justify-content:space-between"><div class="kicker">' + dagger() + ' Killer Party</div><span class="chip">' + esc(p.code) + ' \u00b7 ' + alive + '/' + p.players.length + '</span></div><div style="display:flex;flex-direction:column;gap:1.1rem;margin-top:1.1rem;flex:1">' + (m.isHost && pending.length ? hostQueue(pending) : '') + (m.discovered && m.isAlive ? '<div class="warnbox">Tu as été démasqué. Tu n\'es pas éliminé \u2014 ta mission reste à accomplir.</div>' : '') + '<div class="tabs"><button class="' + (S.tab === "dossier" ? "on" : "") + '" data-tab="dossier">Dossier</button><button class="' + (S.tab === "table" ? "on" : "") + '" data-tab="table">Table</button></div>' + body + '</div></div>' + seatBar() + '</div>';
}
function dossier(m, tgt, mine, others, cd) {
  var kill;
  if (mine) kill = '<div class="card"><p class="chip" style="color:var(--warn)">En attente</p><p style="margin-top:.5rem;color:var(--muted);font-size:.9rem">Ton kill est entre les mains du maître du jeu.</p></div>';
  else if (S.killOpen) kill = '<form id="killf" class="card" style="display:flex;flex-direction:column;gap:.7rem"><label>Comment la mission a-t-elle été accomplie ?</label><textarea id="explain" maxlength="600" placeholder="Décris la scène.">' + esc(S.explain) + '</textarea><div style="display:flex;gap:.5rem"><button type="button" class="btn btn-sm btn-ghost" data-act="kill-cancel">Annuler</button><button class="btn btn-sm btn-accent" type="submit">Envoyer</button></div></form>';
  else kill = '<button class="btn btn-lg btn-accent" data-act="kill-open">Déclarer un kill</button>';
  var acc;
  if (S.accuseOpen) acc = '<div class="card"><p style="color:var(--muted);font-size:.9rem">Qui essaie de t\' éliminer ?</p><div style="display:flex;flex-direction:column;gap:.45rem;margin-top:.7rem">' + others.map(function (o) { return '<button class="choice ' + (S.accusedId === o.id ? 'on' : '') + '" data-accuse="' + o.id + '">' + esc(o.name) + (S.accusedId === o.id ? ' \u2713' : '') + '</button>'; }).join('') + '</div><div style="display:flex;gap:.5rem;margin-top:.8rem"><button class="btn btn-sm btn-ghost" data-act="accuse-cancel">Annuler</button><button class="btn btn-sm btn-out" data-act="accuse-go"' + (S.accusedId ? '' : ' disabled') + '>Accuser</button></div></div>';
  else acc = '<button class="btn btn-lg btn-out" data-act="accuse-open"' + (cd > 0 ? ' disabled' : '') + '>' + (cd > 0 ? ('Accuser \u00b7 ' + fmtCd(cd)) : 'Accuser un joueur') + '</button>';
  return '<p style="text-align:center;color:var(--subtle);font-size:.8rem">Ne montre jamais cet écran.</p>' + secretCard('Ta victime', (tgt && tgt.name) || '\u2014') + secretCard('Ta mission', m.mission || '\u2014') + kill + acc;
}
function eliminated(alive) {
  return '<div class="center"><div style="font-size:2rem">\u2620</div><h1 style="font-size:2rem">Éliminé</h1><p style="color:var(--muted);max-width:16rem">Ta soirée s\'arrête ici. Observe. Ne révèle rien.</p><p class="chip">' + alive + ' encore en vie</p></div>';
}
function tableView() {
  return '<div class="list">' + S.party.players.map(function (p) { return '<div class="row"><span class="' + (p.isAlive ? '' : 'out') + '">' + esc(p.name) + '</span><span class="chip">' + (p.discovered && p.isAlive ? 'Démasqué' : (!p.isAlive ? 'Out' : (p.killCount + ' kill' + (p.killCount > 1 ? 's' : '')))) + '</span></div>'; }).join('') + '</div>';
}
function hostQueue(claims) {
  return '<section class="card"><p class="kicker" style="margin-bottom:.7rem">Kills à valider</p>' + claims.map(function (c) {
    const k = byId(c.killerId); const v = byId(c.victimId);
    return '<div style="background:var(--elev);border-radius:10px;padding:.85rem;margin-bottom:.6rem"><p><strong>' + esc(k && k.name) + '</strong> <span style="color:var(--muted)">\u2192</span> <strong>' + esc(v && v.name) + '</strong></p><p style="color:var(--muted);font-size:.8rem;margin-top:.25rem">' + esc(c.mission) + '</p><p style="margin-top:.4rem;font-size:.9rem">' + esc(c.explanation) + '</p><div style="display:flex;gap:.5rem;margin-top:.7rem"><button class="btn btn-sm btn-out" data-refuse="' + c.id + '">Refuser</button><button class="btn btn-sm btn-accent" data-ok="' + c.id + '">Valider</button></div></div>';
  }).join('') + '</section>';
}
function seatBar() {
  return '<div class="seats"><p class="chip" style="margin:0 0 .5rem .25rem">' + (S.party.isDemo ? 'Démo \u00b7 changer de joueur' : 'Passe le téléphone \u00b7 écran d\'un invité') + '</p><div class="scroller">' + S.party.players.map(function (p) { return '<button class="seat ' + (p.id === S.seatId ? 'on' : '') + '" data-seat="' + p.id + '">' + esc(p.name) + '</button>'; }).join('') + '</div></div>';
}
function viewFinale() {
  const recap = (S.party.claims || []).filter(function (c) { return c.status === 'validated'; });
  const list = recap.length ? '<ol class="list" style="width:100%;text-align:left;list-style:none;padding:0;margin-top:1rem">' + recap.map(function (c, i) { return '<li class="row"><span style="color:var(--muted)"><span class="chip" style="margin-right:.5rem">' + (i + 1) + '</span>' + esc(byId(c.killerId) && byId(c.killerId).name) + ' <span style="color:var(--subtle)">a éliminé</span> ' + esc(byId(c.victimId) && byId(c.victimId).name) + '</span></li>'; }).join('') + '</ol>' : '';
  return '<div class="wrap"><div class="center stagger">' + dagger() + '<p class="chip">Dernier survivant</p><h1 style="font-size:3rem">' + esc(S.party.winnerName || '\u2014') + '</h1><p style="font-family:var(--display);font-size:1.3rem;color:var(--muted)">Grand Killer</p>' + list + '<button class="btn btn-out" data-act="reset" style="margin-top:1rem">Nouvelle soirée</button></div></div>';
}
function bind() {
  document.querySelectorAll('[data-go]').forEach(function (el) { el.onclick = function () { S.view = el.dataset.go; S.hold = false; render(); }; });
  var demo = document.querySelector('[data-act=demo]');
  if (demo) demo.onclick = function () { try { createParty('Corentin', true); toast('Démo lancée. Change de joueur en bas.'); render(); } catch (e) { toast(e.message); } };
  var f = $('f');
  if (f) f.onsubmit = function (e) { e.preventDefault(); try { var name = cleanName($('name').value); S.name = name; createParty(name, false); toast('Soirée créée. Ajoute tes invités.'); render(); } catch (err) { toast(err.message); } };
  var add = $('add');
  if (add) add.onsubmit = function (e) { e.preventDefault(); try { addGuest($('guest').value); S.guest = ''; save(); render(); } catch (err) { toast(err.message); } };
  var copy = document.querySelector('[data-act=copy]');
  if (copy) copy.onclick = async function () { try { await navigator.clipboard.writeText(S.party.code); toast('Code copié'); } catch (e) { toast(S.party.code); } };
  var start = document.querySelector('[data-act=start]');
  if (start) start.onclick = function () { try { if (S.party.players.length < 3) throw new Error('Il faut 3 joueurs.'); startChain(S.party); S.view = 'playing'; S.tab = 'dossier'; save(); toast('La chasse commence.'); render(); } catch (err) { toast(err.message); } };
  document.querySelectorAll('[data-act=reset]').forEach(function (el) { el.onclick = function () { S = blank(); save(); render(); }; });
  document.querySelectorAll('[data-tab]').forEach(function (el) { el.onclick = function () { S.tab = el.dataset.tab; S.hold = false; render(); }; });
  document.querySelectorAll('[data-seat]').forEach(function (el) { el.onclick = function () { S.seatId = el.dataset.seat; S.hold = false; S.killOpen = false; S.accuseOpen = false; S.tab = 'dossier'; save(); render(); }; });
  document.querySelectorAll('[data-hold]').forEach(function (el) {
    var on = function () { clearTimeout(holdTimer); holdTimer = setTimeout(function () { S.hold = true; render(); }, 450); };
    var off = function () { clearTimeout(holdTimer); if (S.hold) { S.hold = false; render(); } };
    el.addEventListener('pointerdown', function (ev) { ev.preventDefault(); on(); });
    el.addEventListener('pointerup', off);
    el.addEventListener('pointerleave', off);
    el.addEventListener('pointercancel', off);
  });
  var ko = document.querySelector('[data-act=kill-open]'); if (ko) ko.onclick = function () { S.killOpen = true; render(); };
  var kc = document.querySelector('[data-act=kill-cancel]'); if (kc) kc.onclick = function () { S.killOpen = false; render(); };
  var kf = $('killf');
  if (kf) kf.onsubmit = function (e) { e.preventDefault(); try { S.explain = $('explain').value; declareKill(S.explain); S.killOpen = false; S.explain = ''; save(); toast('Kill déclaré.'); render(); } catch (err) { toast(err.message); } };
  var ao = document.querySelector('[data-act=accuse-open]'); if (ao) ao.onclick = function () { S.accuseOpen = true; render(); };
  var ac = document.querySelector('[data-act=accuse-cancel]'); if (ac) ac.onclick = function () { S.accuseOpen = false; S.accusedId = null; render(); };
  document.querySelectorAll('[data-accuse]').forEach(function (el) { el.onclick = function () { S.accusedId = el.dataset.accuse; render(); }; });
  var ag = document.querySelector('[data-act=accuse-go]');
  if (ag) ag.onclick = function () { try { var r = accuse(S.accusedId); S.accuseOpen = false; S.accusedId = null; save(); toast(r.correct ? ('C\'était ' + r.accusedName + '. Killer démasqué.') : (r.accusedName + ' n\'est pas ton killer.')); render(); } catch (err) { toast(err.message); } };
  document.querySelectorAll('[data-ok]').forEach(function (el) { el.onclick = function () { try { resolveKill(el.dataset.ok, true); save(); toast(S.party.status === 'finished' ? 'La soirée est close.' : 'Kill validé.'); render(); } catch (err) { toast(err.message); } }; });
  document.querySelectorAll('[data-refuse]').forEach(function (el) { el.onclick = function () { try { resolveKill(el.dataset.refuse, false); save(); toast('Kill refusé.'); render(); } catch (err) { toast(err.message); } }; });
}
setInterval(function () { if (S.view === 'playing' && remainCd() > 0) { tick++; if (tick % 2 === 0) render(); } }, 1000);
render();
