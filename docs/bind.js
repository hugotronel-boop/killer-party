function go(view) {
  S.view = view;
  S.reveal = {};
  S.killOpen = false;
  S.accuseOpen = false;
  render();
}

function bind() {
  document.querySelectorAll("[data-go]").forEach(function (el) {
    el.onclick = function () { go(el.getAttribute("data-go")); };
  });
  var demo = document.querySelector("[data-act=demo]");
  if (demo) demo.onclick = function () {
    try { createParty("Corentin", true); toast("Démo lancée. Change de joueur en bas."); render(); }
    catch (e) { toast(e.message); }
  };
  var f = $("f");
  if (f) f.onsubmit = function (e) {
    e.preventDefault();
    try {
      var name = cleanName($("name").value);
      S.name = name;
      if (S.view === "join") {
        S.code = ($("code").value || "").toUpperCase();
        joinParty(S.code, name);
        toast("Tu as rejoint la soirée.");
      } else {
        createParty(name, false);
        toast("Soirée créée. Ajoute tes invités.");
      }
      render();
    } catch (err) { toast(err.message); }
  };
  var addM = $("add-mission");
  if (addM) addM.onsubmit = function (e) {
    e.preventDefault();
    try {
      addMission($("draft").value);
      S.draft = "";
      toast("Défi ajouté.");
      render();
    } catch (err) { toast(err.message); }
  };
  document.querySelectorAll("[data-edit]").forEach(function (el) {
    el.onclick = function () { S.editId = el.getAttribute("data-edit"); render(); };
  });
  var cancelEdit = document.querySelector("[data-act=edit-cancel]");
  if (cancelEdit) cancelEdit.onclick = function () { S.editId = null; render(); };
  document.querySelectorAll("[data-save]").forEach(function (el) {
    el.onclick = function () {
      try {
        var id = el.getAttribute("data-save");
        var area = document.querySelector('[data-edit-area="' + id + '"]');
        updateMission(id, area.value);
        S.editId = null;
        toast("Défi modifié.");
        render();
      } catch (err) { toast(err.message); }
    };
  });
  document.querySelectorAll("[data-del]").forEach(function (el) {
    el.onclick = function () {
      deleteMission(el.getAttribute("data-del"));
      render();
    };
  });
  var add = $("add");
  if (add) add.onsubmit = function (e) {
    e.preventDefault();
    try { addGuest($("guest").value); S.guest = ""; save(); render(); }
    catch (err) { toast(err.message); }
  };
  var copy = document.querySelector("[data-act=copy]");
  if (copy) copy.onclick = async function () {
    try { await navigator.clipboard.writeText(S.party.code); toast("Code copié"); }
    catch (e) { toast(S.party.code); }
  };
  var start = document.querySelector("[data-act=start]");
  if (start) start.onclick = function () {
    try {
      if (S.party.players.length < 3) throw new Error("Il faut 3 joueurs.");
      startChain(S.party);
      S.view = "playing";
      S.tab = "dossier";
      save();
      toast("La chasse commence.");
      render();
    } catch (err) { toast(err.message); }
  };
  document.querySelectorAll("[data-act=reset]").forEach(function (el) {
    el.onclick = function () { S = blank(); save(); render(); };
  });
  document.querySelectorAll("[data-tab]").forEach(function (el) {
    el.onclick = function () { S.tab = el.getAttribute("data-tab"); S.reveal = {}; render(); };
  });
  document.querySelectorAll("[data-seat]").forEach(function (el) {
    el.onclick = function () {
      S.seatId = el.getAttribute("data-seat");
      S.reveal = {};
      S.killOpen = false;
      S.accuseOpen = false;
      S.tab = "dossier";
      save();
      render();
    };
  });
  document.querySelectorAll("[data-reveal]").forEach(function (el) {
    el.onclick = function () {
      var key = el.getAttribute("data-reveal");
      S.reveal = S.reveal || {};
      S.reveal[key] = !S.reveal[key];
      clearTimeout(revealTimers[key]);
      if (S.reveal[key]) {
        revealTimers[key] = setTimeout(function () { S.reveal[key] = false; render(); }, 8000);
      }
      render();
    };
  });
  var ko = document.querySelector("[data-act=kill-open]");
  if (ko) ko.onclick = function () { S.killOpen = true; render(); };
  var kc = document.querySelector("[data-act=kill-cancel]");
  if (kc) kc.onclick = function () { S.killOpen = false; render(); };
  var kf = $("killf");
  if (kf) kf.onsubmit = function (e) {
    e.preventDefault();
    try { S.explain = $("explain").value; declareKill(S.explain); S.killOpen = false; S.explain = ""; save(); toast("Kill déclaré. En attente du maître du jeu."); render(); }
    catch (err) { toast(err.message); }
  };
  var ao = document.querySelector("[data-act=accuse-open]");
  if (ao) ao.onclick = function () { S.accuseOpen = true; render(); };
  var ac = document.querySelector("[data-act=accuse-cancel]");
  if (ac) ac.onclick = function () { S.accuseOpen = false; S.accusedId = null; render(); };
  document.querySelectorAll("[data-accuse]").forEach(function (el) {
    el.onclick = function () { S.accusedId = el.getAttribute("data-accuse"); render(); };
  });
  var ag = document.querySelector("[data-act=accuse-go]");
  if (ag) ag.onclick = function () {
    try {
      var r = accuse(S.accusedId);
      S.accuseOpen = false;
      S.accusedId = null;
      save();
      toast(r.correct ? ("C'était " + r.accusedName + ". Tu as démasqué ton killer.") : (r.accusedName + " n'est pas ton killer."));
      render();
    } catch (err) { toast(err.message); }
  };
  document.querySelectorAll("[data-ok]").forEach(function (el) {
    el.onclick = function () {
      try { resolveKill(el.getAttribute("data-ok"), true); save(); toast(S.party.status === "finished" ? "La soirée est close." : "Kill validé."); render(); }
      catch (err) { toast(err.message); }
    };
  });
  document.querySelectorAll("[data-refuse]").forEach(function (el) {
    el.onclick = function () {
      try { resolveKill(el.getAttribute("data-refuse"), false); save(); toast("Kill refusé."); render(); }
      catch (err) { toast(err.message); }
    };
  });
}

render();
setInterval(function () {
  if (S.view === "playing" && !S.killOpen && !S.accuseOpen && remainCd() > 0) render();
}, 1000);
