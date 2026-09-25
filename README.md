# Moss — Friend AI

A family-friendly chatbot that lives in one HTML page. Moss remembers your chat on this device, looks up Wikipedia, links Minecraft YouTube videos, opens Allrecipes, and already knows a few facts about Minecraft, FNAF, MrBeast, and Saurians Studio.

**Live page (after GitHub Pages finishes):** https://glitchplays1.github.io/moss/

**Repo:** https://github.com/Glitchplays1/moss

## Open it on your computer

1. Download `index.html` or `friend-ai.html`
2. Double-click the file
3. Chat in the box at the bottom

## Put this on GitHub (already done)

This project is already in **Glitchplays1/moss**.

If you make a new copy later:

```bash
git clone https://github.com/Glitchplays1/moss.git
cd moss
# edit files
git add .
git commit -m "Update Moss"
git push
```

## Turn on the website

1. Open the repo: https://github.com/Glitchplays1/moss
2. Click **Settings** → **Pages**
3. Source: **GitHub Actions** (this repo already has `.github/workflows/static.yml`)
4. Wait a minute, then visit https://glitchplays1.github.io/moss/

`index.html` is the page GitHub Pages shows.

## What you can ask

- When was Minecraft made?
- Show me Minecraft YouTube videos
- How many subscribers does MrBeast have?
- Tell me about Saurians Studio
- What is FNAF? then Who made it?
- Give me a chocolate chip cookie recipe
- remember that my favorite game is Minecraft
- my name is Alex
- what do you remember
- forget Minecraft

## Memory storage

Moss keeps a memory file in your browser:

- Chat history comes back after refresh
- Taught facts and your name stay saved
- Last topic is used for follow-up questions
- **Download memory file** saves `moss-memory.json`
- **Load memory file** restores that JSON
- **Wipe all memory** erases storage on this device

Memory stays on the computer/browser you used. It is not uploaded to GitHub.

## How it works

Moss is not a giant cloud AI. It is HTML + CSS + JavaScript:

- Memory storage uses `localStorage`
- Wikipedia lookups when the browser allows them
- YouTube and Allrecipes search links

Subscriber counts change every day, so Moss gives a saved number plus a live search link.

## Files

| File | What it is |
| --- | --- |
| `index.html` | The chat app (GitHub Pages home) |
| `friend-ai.html` | Same app, extra copy |
| `README.md` | This guide |
| `LICENSE` | License for the repo |
| `.github/workflows/static.yml` | Publishes the site |

## License

See `LICENSE` in this repository.
