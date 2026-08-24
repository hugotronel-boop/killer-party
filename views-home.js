function ico(name) {
  const paths = {
    plus: '<path d="M5 12h14M12 5v14"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    play: '<polygon points="6 3 20 12 6 21 6 3"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
    crosshair: '<circle cx="12" cy="12" r="10"/><path d="M22 12h-4M6 12H2M12 6V2M12 22v-4"/>',
    book: '<path d="M12 7v14M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
    skull: '<path d="M10 20v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4M8 21h8"/><path d="M7 15a7 7 0 1 1 10 0"/><circle cx="9" cy="11" r="1" fill="currentColor"/><circle cx="15" cy="11" r="1" fill="currentColor"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    pencil: '<path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>',
    trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>',
    copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    gavel: '<path d="m14 13-8.5 8.5M16 16l6-6M8 8l6-6M9 7l8 8"/>',
    target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    ghost: '<path d="M9 10h.01M15 10h.01M12 2a8 8 0 0 0-8 8v12l3-3 2.5 3 2.5-3 2.5 3 2.5-3 3 3V10a8 8 0 0 0-8-8z"/>',
    flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7"/>',
    ban: '<circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/>',
    trophy: '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22M18 2H6v7a6 6 0 0 0 12 0V2Z"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    arrow: '<path d="M5 12h14M12 5l7 7-7 7"/>',
  };
  return '<svg class="ico-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' + (paths[name] || "") + "</svg>";
}
function dagger() {
  return '<svg class="mark" viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M16 2.5 L18.4 8.2 L16 29.5 L13.6 8.2 Z" fill="currentColor"/><path d="M10 9.2 H22" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><circle cx="16" cy="8.2" r="1.35" fill="#c42b3a"/></svg>';
}
function wordmark() {
  return '<div class="wordmark">' + dagger() + '<span>Killer Party</span></div>';
}
function render() {
  const root = $("app");
  if (!root) return;
  const v = S.view;
  if (v === "home") root.innerHTML = viewHome();
  else if (v === "create" || v === "join") root.innerHTML = viewForm();
  else if (v === "rules") root.innerHTML = viewRules();
  else if (v === "defis") root.innerHTML = viewDefis();
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
  return (
    '<div class="wrap stagger">' +
      '<div class="kicker">' + dagger() + " Soirée privée</div>" +
      '<h1 class="title">Killer<br/>Party</h1>' +
      '<div class="rule"></div>' +
      '<p class="lede">Une victime. Une mission. Un secret. Le dernier survivant est le Grand Killer.</p>' +
      '<div class="stack">' +
        '<button class="btn btn-lg btn-fill" data-go="create">' + ico("plus") + " Créer une soirée</button>" +
        '<button class="btn btn-lg btn-out" data-go="join">' + ico("users") + " Rejoindre</button>" +
        '<button class="btn btn-lg btn-ghost" data-act="demo">' + ico("play") + " Essayer la démo</button>" +
        '<a class="btn btn-lg btn-out" href="' + ZIP + '">' + ico("download") + " Télécharger le jeu</a>" +
        '<button class="link" data-go="defis">' + ico("crosshair") + " Les défis</button>" +
        '<button class="link" data-go="rules">' + ico("book") + " Lire les règles</button>" +
      "</div>" +
    "</div>"
  );
}
function viewForm() {
  const create = S.view === "create";
  return (
    '<div class="wrap">' +
      '<button class="back" data-go="home">Retour</button>' +
      '<h1 class="page-title">' + (create ? "Nouvelle soirée" : "Rejoindre") + "</h1>" +
      '<p class="lede">' + (create ? "Tu seras le maître du jeu. Tes invités entreront le code." : "Entre le code à 4 lettres et ton prénom.") + "</p>" +
      '<form id="f" class="form">' +
        (create ? "" : '<div class="field"><label>Code</label><input id="code" value="' + esc(S.code) + '" placeholder="K7RM" maxlength="8" autocapitalize="characters" autocomplete="off" required /></div>') +
        '<div class="field"><label>Ton prénom</label><input id="name" value="' + esc(S.name) + '" placeholder="Camille" maxlength="20" autocomplete="given-name" required /></div>' +
        '<button class="btn btn-lg btn-fill" type="submit">Continuer ' + ico("arrow") + "</button>" +
      "</form>" +
    "</div>"
  );
}
function viewRules() {
  const items = [
    ["target", "Le but", "Élimine ta victime en lui faisant accomplir ta mission, sans te faire découvrir. À chaque kill validé, tu récupères sa cible et sa mission. Le dernier joueur encore en jeu remporte la partie."],
    ["ghost", "La mission", "Amène ta victime à réaliser l'action naturellement. Tu ne peux pas lui demander de la faire pour le jeu. Si elle comprend trop tard, c'est déjà un kill."],
    ["flag", "Déclarer un kill", "Quand tu penses avoir réussi, déclare le kill et explique la scène au maître du jeu. Il valide ou refuse. Un refus laisse ta mission active."],
    ["crosshair", "Les accusations", "Tu peux accuser celui que tu crois être ton killer. Une bonne accusation le démasque — mais ne l'élimine pas. Une mauvaise t'impose d'attendre 30 minutes."],
    ["eye", "Le secret", "Ne montre jamais ta victime, ta mission, ni l'écran de l'application. Les missions se jouent dans la discrétion."],
    ["ban", "Missions interdites", "Rien de dangereux, d'humiliant, d'illégal, de coûteux, ni qui force à boire, manger, ou à un contact non souhaité. Une bonne mission n'a aucune conséquence négative."],
    ["trophy", "Le Grand Killer", "La partie s'arrête quand il ne reste plus qu'un joueur capable de poursuivre la chaîne. Il est déclaré Grand Killer."],
    ["shield", "Le maître du jeu", "C'est lui qui lance la soirée, valide les kills, et tranche les doutes. Il peut aussi jouer."],
  ];
  return (
    '<div class="wrap page">' +
      '<div class="topbar">' + wordmark() + '<button class="back" data-go="home">Fermer</button></div>' +
      '<h1 class="page-title">Les règles</h1>' +
      '<p class="lede">Killer Party se joue pendant toute une soirée. Chaque joueur reçoit en secret une victime et une mission.</p>' +
      items.map(function (x) {
        return '<section class="rule-item"><div class="ico">' + ico(x[0]) + '</div><div><h2>' + x[1] + '</h2><p>' + x[2] + "</p></div></section>";
      }).join("") +
    "</div>"
  );
}
function viewDefis() {
  const rows = missions.map(function (m) {
    if (S.editId === m.id) {
      return (
        '<li class="mission">' +
          '<textarea class="edit-area" data-edit-area="' + m.id + '" maxlength="160">' + esc(m.template) + "</textarea>" +
          '<div class="row-actions">' +
            '<button class="btn btn-sm btn-fill" data-save="' + m.id + '">' + ico("check") + " Enregistrer</button>" +
            '<button class="btn btn-sm btn-ghost" data-act="edit-cancel">' + ico("x") + " Annuler</button>" +
          "</div>" +
        "</li>"
      );
    }
    return (
      '<li class="mission">' +
        '<p class="mission-text">' + esc(m.template) + "</p>" +
        '<button class="icon-btn" data-edit="' + m.id + '" aria-label="Modifier">' + ico("pencil") + "</button>" +
        '<button class="icon-btn danger" data-del="' + m.id + '" aria-label="Supprimer">' + ico("trash") + "</button>" +
      "</li>"
    );
  }).join("");
  return (
    '<div class="wrap page">' +
      '<div class="topbar">' + wordmark() + '<button class="back" data-go="home">Fermer</button></div>' +
      '<h1 class="page-title">Les défis</h1>' +
      '<p class="lede">Chaque soirée pioche ici. Un défi peut tomber sur n\'importe qui. Ajoute, modifie ou supprime.</p>' +
      '<form id="add-mission" class="form">' +
        '<div class="field"><label>Nouveau défi</label><textarea id="draft" maxlength="160" placeholder="Fais-lui demander son dessert préféré.">' + esc(S.draft) + "</textarea></div>" +
        '<button class="btn btn-fill" type="submit">' + ico("plus") + " Ajouter</button>" +
      "</form>" +
      '<p class="chip count">' + missions.length + " défi" + (missions.length === 1 ? "" : "s") + "</p>" +
      '<ul class="missions">' + (rows || '<p class="lede">Aucun défi. Ajoutes-en un ci-dessus.</p>') + "</ul>" +
    "</div>"
  );
}
