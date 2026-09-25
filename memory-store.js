const STORE_KEY = "mossMemory.v2";
const OLD_FACTS_KEY = "mossTaught";
const MAX_MESSAGES = 80;

function blankStore() {
  return {
    version: 2,
    updatedAt: Date.now(),
    profile: { name: "" },
    lastTopic: "",
    lastPerson: "",
    lastIntent: "",
    taught: [],
    messages: []
  };
}

function loadStore() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      return Object.assign(blankStore(), data, {
        profile: Object.assign({ name: "" }, data.profile || {}),
        taught: Array.isArray(data.taught) ? data.taught : [],
        messages: Array.isArray(data.messages) ? data.messages : []
      });
    }
  } catch (e) {}
  const store = blankStore();
  try {
    const old = JSON.parse(localStorage.getItem(OLD_FACTS_KEY) || "{}");
    store.taught = Object.values(old).filter(Boolean).map((text, i) => ({
      id: "old-" + i,
      text: String(text),
      created: Date.now()
    }));
  } catch (e) {}
  return store;
}

const memory = loadStore();

function saveStore() {
  memory.updatedAt = Date.now();
  if (memory.messages.length > MAX_MESSAGES) {
    memory.messages = memory.messages.slice(-MAX_MESSAGES);
  }
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(memory));
  } catch (e) {
    const netEl = document.getElementById("net");
    if (netEl) netEl.textContent = "Memory storage is full";
  }
  renderMemory();
}

function esc(s) {
  return String(s || "").replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;" }[c]));
}

function renderMemory() {
  const box = document.getElementById("memoryBox");
  const meta = document.getElementById("memoryMeta");
  if (!box || !meta) return;
  const when = memory.updatedAt ? new Date(memory.updatedAt).toLocaleString() : "never";
  const who = memory.profile.name ? "Friend: " + memory.profile.name + " · " : "";
  meta.textContent = who + memory.messages.length + " chat lines · " + memory.taught.length + " facts · saved " + when;
  if (!memory.taught.length && !memory.lastTopic && !memory.profile.name) {
    box.innerHTML = "No saved facts yet. Say “remember that my favorite game is Minecraft”.";
    return;
  }
  const bits = [];
  if (memory.profile.name) bits.push("<div><b>Name:</b> " + esc(memory.profile.name) + "</div>");
  if (memory.lastTopic) bits.push("<div><b>Last topic:</b> " + esc(memory.lastTopic) + "</div>");
  if (memory.lastPerson) bits.push("<div><b>Last person:</b> " + esc(memory.lastPerson) + "</div>");
  if (memory.taught.length) {
    bits.push("<div><b>Facts</b><ul>" + memory.taught.map(f => "<li>" + esc(f.text) + "</li>").join("") + "</ul></div>");
  }
  box.innerHTML = bits.join("");
}

function addMsg(role, html, skipSave) {
  const logEl = document.getElementById("log");
  const wrap = document.createElement("div");
  wrap.className = "msg " + (role === "me" ? "me" : "ai");
  const who = document.createElement("div");
  who.className = "who";
  who.textContent = role === "me" ? "You" : "Moss";
  wrap.appendChild(who);
  const body = document.createElement("div");
  body.innerHTML = html;
  wrap.appendChild(body);
  logEl.appendChild(wrap);
  logEl.scrollTop = logEl.scrollHeight;
  if (!skipSave) {
    memory.messages.push({ role, html, text: body.innerText, at: Date.now() });
    saveStore();
  }
}

function restoreChat() {
  const logEl = document.getElementById("log");
  logEl.innerHTML = "";
  if (!memory.messages.length) {
    greeting(true);
    return;
  }
  memory.messages.forEach(m => addMsg(m.role, m.html || esc(m.text || ""), true));
  renderMemory();
}

function exportMemory() {
  saveStore();
  const blob = new Blob([JSON.stringify(memory, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "moss-memory.json";
  a.click();
  URL.revokeObjectURL(a.href);
}

function importMemoryFile(file, done) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      const next = Object.assign(blankStore(), data);
      next.taught = Array.isArray(next.taught) ? next.taught : [];
      next.messages = Array.isArray(next.messages) ? next.messages : [];
      Object.keys(memory).forEach(k => delete memory[k]);
      Object.assign(memory, next);
      saveStore();
      restoreChat();
      done(null, memory);
    } catch (e) {
      done(e);
    }
  };
  reader.readAsText(file);
}

function wipeMemory() {
  const empty = blankStore();
  Object.keys(memory).forEach(k => delete memory[k]);
  Object.assign(memory, empty);
  localStorage.removeItem(STORE_KEY);
  localStorage.removeItem(OLD_FACTS_KEY);
  document.getElementById("log").innerHTML = "";
  saveStore();
}
