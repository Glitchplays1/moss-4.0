(function () {
  let deferred;
  const buttons = ["installBtn", "installBtn2"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  function setLabel(text) {
    buttons.forEach((b) => {
      b.hidden = false;
      b.textContent = text;
    });
  }

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferred = e;
    setLabel("Add to home screen");
  });

  window.addEventListener("appinstalled", () => {
    deferred = null;
    setLabel("Added to home screen");
  });

  function help() {
    const standalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;
    if (standalone) {
      alert("Moss is already running as an app window.");
      return;
    }
    alert("On a Chromebook: Chrome menu (3 dots) → Cast, save and share → Create shortcut. Turn ON “Open as window”, then Create. Moss will show on the shelf and launcher.");
  }

  async function install() {
    if (!deferred) {
      help();
      return;
    }
    deferred.prompt();
    await deferred.userChoice;
    deferred = null;
  }

  buttons.forEach((b) => {
    b.hidden = false;
    b.addEventListener("click", install);
  });

  if ("serviceWorker" in navigator) {
    const sw = new URL("sw.js", window.location.href);
    navigator.serviceWorker.register(sw.href).catch(() => {});
  }
})();
