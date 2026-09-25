const logEl = document.getElementById("log");
const form = document.getElementById("form");
const input = document.getElementById("q");
const netEl = document.getElementById("net");

const KNOWN = {
  minecraft: {
    topic: "Minecraft",
    text: "Minecraft first appeared to the public on May 17, 2009 (Classic), created by Markus “Notch” Persson. The full Java Edition 1.0 release was November 18, 2011 at MineCon. It is a sandbox building game by Mojang Studios (now part of Xbox Game Studios)."
  },
  fnaf: {
    topic: "Five Nights at Freddy's",
    text: "Five Nights at Freddy's (FNAF) is a 2014 survival-horror game series created by Scott Cawthon. The first game came out on August 8, 2014. You play a night guard at a pizza place and watch cameras. Later games, books, and a movie followed. Steel Wool and others have helped make newer games."
  },
  mrbeast: {
    topic: "MrBeast",
    person: "MrBeast",
    text: "MrBeast (Jimmy Donaldson) is one of the biggest YouTubers. His main channel is youtube.com/@MrBeast. Around September 2026 public trackers showed about 518 million subscribers. Counts change every day, so tap a live search if you need the newest number."
  },
  saurians: {
    topic: "Saurians Studio",
    person: "Saurians Studio",
    text: "Saurians Studio is a YouTube channel at youtube.com/@SauriansStudio-g7i. When this helper was built it had about 34 subscribers. Videos include SAURIANS: Pilot, SAURIANS II Teaser Trailer 1: A Story, and some Shorts. A small studio channel — a good one to cheer for!"
  }
};

const YOUTUBERS = {
  "mrbeast": { name: "MrBeast", handle: "@MrBeast", url: "https://www.youtube.com/@MrBeast", subs: "about 518 million (Sep 2026, changes daily)", height: "Public reports often list Jimmy Donaldson around 6'2\" / 188 cm. Heights are unofficial." },
  "mr beast": { name: "MrBeast", handle: "@MrBeast", url: "https://www.youtube.com/@MrBeast", subs: "about 518 million (Sep 2026, changes daily)", height: "Public reports often list Jimmy Donaldson around 6'2\" / 188 cm. Heights are unofficial." },
  "saurians studio": { name: "Saurians Studio", handle: "@SauriansStudio-g7i", url: "https://www.youtube.com/@SauriansStudio-g7i", subs: "about 34 (when this AI was built)", height: "No public height — this is a channel, not one famous actor." },
  "saurians": { name: "Saurians Studio", handle: "@SauriansStudio-g7i", url: "https://www.youtube.com/@SauriansStudio-g7i", subs: "about 34 (when this AI was built)", height: "No public height listed." },
  "notch": { name: "Notch (Markus Persson)", handle: null, url: "https://en.wikipedia.org/wiki/Markus_Persson", subs: "Not a main YouTube-stats person in this helper", height: "Not a well-locked official number in this helper." },
  "dream": { name: "Dream", handle: "@Dream", url: "https://www.youtube.com/@Dream", subs: "Search YouTube for the live count", height: "Dream has said he is around 6'3\" / 191 cm. Unofficial." },
  "markiplier": { name: "Markiplier", handle: "@markiplier", url: "https://www.youtube.com/@markiplier", subs: "Search YouTube for the live count", height: "Public listings often say about 6'2\" / 188 cm. Unofficial." }
};

const SPELL = {
  spall: "spell", recpie: "recipe", recipie: "recipe", minecaft: "Minecraft",
  minecraf: "Minecraft", youtobe: "YouTube", youtub: "YouTube",
  suscribers: "subscribers", subcribers: "subscribers", hieght: "height",
  fnaff: "FNAF", fredys: "Freddy's"
};

function linkCards(items) {
  return `<div class="cards">${items.map(i => `<div class="card"><a href="${i.href}" target="_blank" rel="noopener">${esc(i.title)}</a><div>${esc(i.sub || "")}</div></div>`).join("")}</div>`;
}
function youtubeSearch(q) { return "https://www.youtube.com/results?search_query=" + encodeURIComponent(q); }
function wikiSearch(q) { return "https://en.wikipedia.org/wiki/Special:Search?search=" + encodeURIComponent(q); }
function recipeSearch(q) { return "https://www.allrecipes.com/search?q=" + encodeURIComponent(q); }
function socialblade(handle) { return "https://socialblade.com/youtube/handle/" + encodeURIComponent(handle.replace(/^@/, "")); }
function normalize(s) { return s.toLowerCase().replace(/[^\w\s'@]/g, " ").replace(/\s+/g, " ").trim(); }

function correctSpelling(text) {
  return {
    text: text.split(/(\s+)/).map(w => {
      const key = w.toLowerCase().replace(/[^a-z]/g, "");
      return SPELL[key] && SPELL[key].toLowerCase() !== key ? SPELL[key] : w;
    }).join(""),
    notes: []
  };
}

function detectTopic(t) {
  const n = normalize(t);
  if (/\b(fnaf|five nights|freddy)\b/.test(n)) return KNOWN.fnaf;
  if (/\bminecraft|mine craft|mojang|notch\b/.test(n)) return KNOWN.minecraft;
  if (/\bmr\s*beast|mrbeast|jimmy donaldson\b/.test(n)) return KNOWN.mrbeast;
  if (/\bsaurians?( studio)?\b/.test(n)) return KNOWN.saurians;
  return null;
}

function findPerson(t) {
  const n = normalize(t);
  for (const key of Object.keys(YOUTUBERS)) {
    if (n.includes(key)) return YOUTUBERS[key];
  }
  const m = n.match(/how (?:tall|old|many subs(?:cribers)?) (?:is|does|do) (.+?)(?: have|$)/);
  if (m) return { name: m[1].trim(), handle: null, url: wikiSearch(m[1]), guessed: true };
  return null;
}

async function wikiSummary(title) {
  const url = "https://en.wikipedia.org/api/rest_v1/page/summary/" + encodeURIComponent(title.replace(/ /g, "_"));
  const res = await fetch(url, { headers: { "Accept": "application/json" } });
  if (!res.ok) throw new Error("wiki");
  const data = await res.json();
  if (data.type === "disambiguation") return { title: data.title, extract: "That name can mean more than one thing. " + (data.extract || ""), url: data.content_urls && data.content_urls.desktop && data.content_urls.desktop.page };
  return { title: data.title, extract: data.extract, url: (data.content_urls && data.content_urls.desktop && data.content_urls.desktop.page) || wikiSearch(title) };
}

async function wikiSearchTitle(q) {
  const url = "https://en.wikipedia.org/w/api.php?action=opensearch&limit=1&namespace=0&format=json&origin=*&search=" + encodeURIComponent(q);
  const res = await fetch(url);
  if (!res.ok) throw new Error("search");
  const data = await res.json();
  return data[1] && data[1][0] ? data[1][0] : q;
}

function minecraftVideos(extra) {
  const q = extra ? ("Minecraft " + extra) : "Minecraft";
  return linkCards([
    { title: "YouTube: " + q + " videos", href: youtubeSearch(q + " gameplay"), sub: "Family search for gameplay and builds" },
    { title: "Minecraft official channel", href: "https://www.youtube.com/@Minecraft", sub: "Updates and official videos" },
    { title: "Minecraft tutorials", href: youtubeSearch("Minecraft tutorial for beginners"), sub: "Learn to play" },
    { title: "Saurians Studio", href: "https://www.youtube.com/@SauriansStudio-g7i", sub: "Tracked channel · about 34 subs when saved" }
  ]);
}

function greeting(first) {
  const name = memory.profile.name ? ", " + esc(memory.profile.name) : "";
  addMsg("ai", "Hey" + name + ", I'm <b>Moss</b>. Your chat and facts are saved in this browser’s memory storage. Say <i>remember that …</i> or <i>my name is …</i>. Follow-ups like <i>who made it?</i> use the last topic.", first);
}

function followUpRewrite(raw) {
  const n = normalize(raw);
  const topic = memory.lastTopic || memory.lastPerson;
  if (!topic) return raw;
  if (/^(who made it|who created it|who invented it|who is it made by|who made that|who created that)\??$/.test(n)) return "Who created " + topic + "?";
  if (/^(what is it|what is that|explain it|explain that|what does it mean)\??$/.test(n)) return "What is " + topic + "?";
  if (/^(how old is (he|she|they|it)|how old)\??$/.test(n)) return "How old is " + (memory.lastPerson || topic) + "?";
  if (/^(how tall is (he|she|they|it)|how tall)\??$/.test(n)) return "How tall is " + (memory.lastPerson || topic) + "?";
  if (/^(how many subscribers|how many subs|their subs|their subscribers)\??$/.test(n)) return "How many subscribers does " + (memory.lastPerson || topic) + " have?";
  if (/^(when (was|is) it (made|released|created)|when did it come out)\??$/.test(n)) return "When was " + topic + " made?";
  return raw;
}

async function reply(userText) {
  const spell = correctSpelling(userText);
  let text = followUpRewrite(spell.text.trim());
  const n = normalize(text);

  if (/^(my name is|i am|i'm|im)\s+/.test(n)) {
    const name = text.replace(/^(my name is|i am|i'm|im)\s+/i, "").replace(/[!.]+$/, "").trim();
    if (name) {
      memory.profile.name = name.slice(0, 40);
      saveStore();
      return "Nice to meet you, <b>" + esc(memory.profile.name) + "</b>. I saved your name in memory storage.";
    }
  }

  if (n.startsWith("remember that ") || n.startsWith("remember ")) {
    const fact = text.replace(/^remember( that)? /i, "").trim();
    if (fact) {
      memory.taught.push({ id: "f-" + Date.now(), text: fact, created: Date.now() });
      saveStore();
      return "Saved to memory storage: <b>" + esc(fact) + "</b>";
    }
  }

  if (n.startsWith("forget ")) {
    const needle = n.replace(/^forget /, "");
    const before = memory.taught.length;
    memory.taught = memory.taught.filter(f => !normalize(f.text).includes(needle));
    saveStore();
    return before === memory.taught.length ? "I did not find that fact." : "Forgot matching facts.";
  }

  const taughtHit = memory.taught.find(f => n.includes(normalize(f.text).slice(0, 24)) || normalize(f.text).includes(n));
  if (n.startsWith("what do you remember") || n === "memory" || n === "show memory") {
    const facts = memory.taught.map(f => f.text);
    const last = memory.lastTopic ? "Last topic: " + memory.lastTopic : "No last topic yet.";
    const name = memory.profile.name ? "Your name: " + memory.profile.name + "<br>" : "";
    return name + (facts.length ? "Saved facts:<br>- " + facts.map(esc).join("<br>- ") + "<br><br>" : "No taught facts yet.<br>") + last;
  }

  if (/\b(hello|hi|hey|yo|sup|whats up|what's up)\b/.test(n) && n.split(" ").length < 6) {
    return "Hey" + (memory.profile.name ? " " + esc(memory.profile.name) : "") + "! Want Minecraft videos, a recipe, a game fact, or a YouTuber lookup?";
  }
  if (/\b(who are you|what are you|your name)\b/.test(n)) {
    return "I'm Moss. I use rules, memory storage on this device, and Wikipedia when the internet is allowed.";
  }

  if (/\b(youtube|video|videos|vid|vids|watch)\b/.test(n)) {
    memory.lastIntent = "videos";
    const extra = text.replace(/.*(youtube|videos?|vids?|watch)\s*(for|about|of)?/i, "").trim();
    const q = extra && extra.length > 1 ? extra : "Minecraft";
    memory.lastTopic = /minecraft/i.test(q) ? "Minecraft" : q;
    return "Minecraft-friendly YouTube searches unless you name something else.<br>" + minecraftVideos(/minecraft/i.test(q) ? extra.replace(/minecraft/ig, "").trim() : q);
  }

  if (/\b(recipe|recipes|cook|cooking|how do i make|how to make)\b/.test(n)) {
    let dish = text.replace(/.*?(recipe for|recipes for|how do i make|how to make|cook|cooking)\s*/i, "");
    dish = dish.replace(/recipe[s]?/ig, "").trim() || "easy dinner";
    memory.lastTopic = dish;
    return "Allrecipes search:<br>" + linkCards([
      { title: "Allrecipes search: " + dish, href: recipeSearch(dish), sub: "www.allrecipes.com" },
      { title: "Allrecipes home", href: "https://www.allrecipes.com/", sub: "Browse popular recipes" }
    ]);
  }

  if (/\b(subscriber|subscribers|subs)\b/.test(n)) {
    const person = findPerson(text) || (memory.lastPerson && YOUTUBERS[normalize(memory.lastPerson)]) || null;
    if (person) {
      memory.lastPerson = person.name;
      memory.lastTopic = person.name;
      const extra = person.url ? linkCards([
        { title: person.name + " on YouTube", href: person.url },
        { title: "Live-ish stats search", href: person.handle ? socialblade(person.handle) : youtubeSearch(person.name + " subscribers") }
      ]) : "";
      return (person.subs ? (person.name + " has <b>" + esc(person.subs) + "</b>. ") : "No locked subscriber number for " + esc(person.name) + ". ") +
        "Counts change, so use a live page for the newest number.<br>" + extra;
    }
    const guess = text.replace(/.*(?:subscribers does|subs does|subscribers do|how many subscribers|how many subs)\s*/i, "").replace(/\shave\??/i, "").trim();
    memory.lastPerson = guess;
    memory.lastTopic = guess;
    return "I don’t keep a live subscriber API. Check here:<br>" + linkCards([
      { title: "YouTube search", href: youtubeSearch(guess) },
      { title: "Social Blade search", href: "https://socialblade.com/youtube/search/" + encodeURIComponent(guess) }
    ]);
  }

  if (/\b(how tall|height|how high is)\b/.test(n)) {
    const person = findPerson(text);
    const name = person ? person.name : (memory.lastPerson || text.replace(/how tall is/i, "").trim());
    memory.lastPerson = name;
    memory.lastTopic = name;
    if (person && person.height) {
      return esc(person.name) + ": " + esc(person.height) + "<br>" + linkCards([{ title: "Wikipedia / source search", href: person.url || wikiSearch(name) }]);
    }
    try {
      const title = await wikiSearchTitle(name);
      const w = await wikiSummary(title);
      return "Wikipedia for <b>" + esc(w.title) + "</b>:<br><br>" + esc(w.extract || "No summary.") + "<br>" + linkCards([{ title: "Open Wikipedia", href: w.url || wikiSearch(name) }]);
    } catch (e) {
      return "Could not fetch live height.<br>" + linkCards([{ title: "Search height of " + name, href: wikiSearch(name + " height") }]);
    }
  }

  if (/\b(how old|age of|when was .+ born)\b/.test(n)) {
    const person = findPerson(text);
    const name = person ? person.name : (memory.lastPerson || text.replace(/how old is/i, "").trim());
    memory.lastPerson = name;
    memory.lastTopic = name;
    try {
      const title = await wikiSearchTitle(name);
      const w = await wikiSummary(title);
      return "Age changes every birthday, so I use Wikipedia.<br><br><b>" + esc(w.title) + "</b><br>" + esc(w.extract || "") + "<br>" + linkCards([{ title: "Wikipedia page", href: w.url || wikiSearch(name) }]);
    } catch (e) {
      return "Couldn’t reach Wikipedia.<br>" + linkCards([{ title: "Search " + name, href: wikiSearch(name) }]);
    }
  }

  const known = detectTopic(text);
  if (known) {
    memory.lastTopic = known.topic;
    if (known.person) memory.lastPerson = known.person;
    return known.text + "<br>" + linkCards([
      { title: "Wikipedia: " + known.topic, href: wikiSearch(known.topic) },
      { title: "YouTube: " + known.topic, href: youtubeSearch(known.topic) }
    ]);
  }

  if (taughtHit && n.length < 80) return "From memory storage: " + esc(taughtHit.text);

  const cleaned = text.replace(/^(what is|what's|who is|who's|tell me about|explain|when was|when were|when did)\s+/i, "").replace(/\?+$/, "");
  memory.lastTopic = cleaned;
  try {
    const title = await wikiSearchTitle(cleaned);
    const w = await wikiSummary(title);
    netEl.textContent = "Looked up Wikipedia";
    return "Wikipedia for <b>" + esc(w.title) + "</b>.<br><br>" + esc(w.extract || "No short summary found.") + "<br>" + linkCards([
      { title: "Read more on Wikipedia", href: w.url || wikiSearch(cleaned) },
      { title: "YouTube videos", href: youtubeSearch(/game|minecraft|fnaf/i.test(cleaned) ? cleaned : "Minecraft " + cleaned) },
      { title: "Allrecipes if this is food", href: recipeSearch(cleaned) }
    ]);
  } catch (e) {
    netEl.textContent = "Offline lookup — using local knowledge";
    return "I couldn’t reach Wikipedia from this page. I still have memory storage.<br>" + linkCards([
      { title: "Search Wikipedia", href: wikiSearch(cleaned) },
      { title: "Minecraft videos", href: youtubeSearch("Minecraft " + cleaned) },
      { title: "Allrecipes", href: recipeSearch(cleaned) }
    ]);
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  input.value = "";
  addMsg("me", esc(text));
  const tip = document.createElement("div");
  tip.className = "typing";
  tip.textContent = "Moss is thinking…";
  logEl.appendChild(tip);
  try {
    const html = await reply(text);
    tip.remove();
    addMsg("ai", html);
  } catch (err) {
    tip.remove();
    addMsg("ai", "Something broke on that lookup. Try another question.");
  }
});

document.getElementById("clear").onclick = () => {
  logEl.innerHTML = "";
  memory.messages = [];
  memory.lastTopic = "";
  memory.lastPerson = "";
  saveStore();
  greeting();
};
document.getElementById("forget").onclick = () => {
  memory.taught = [];
  saveStore();
  addMsg("ai", "Taught facts cleared. Chat history is still saved until you press Clear or Wipe all memory.");
};
document.getElementById("wipeAll").onclick = () => {
  wipeMemory();
  greeting();
  addMsg("ai", "All memory storage on this device is empty now.");
};
document.getElementById("exportMem").onclick = exportMemory;
document.getElementById("importMem").onclick = () => document.getElementById("importFile").click();
document.getElementById("importFile").onchange = (ev) => {
  const file = ev.target.files && ev.target.files[0];
  if (!file) return;
  importMemoryFile(file, (err) => {
    if (err) addMsg("ai", "That file was not valid Moss memory.");
    else addMsg("ai", "Loaded memory file. I remember " + memory.taught.length + " facts and " + memory.messages.length + " chat lines.");
  });
  ev.target.value = "";
};
document.querySelectorAll("button.chip[data-q]").forEach(btn => {
  btn.onclick = () => {
    input.value = btn.getAttribute("data-q");
    form.requestSubmit();
  };
});

restoreChat();
