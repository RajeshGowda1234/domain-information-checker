<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Domain Information Checker

WHOIS/DNS lookup plus AI-powered risk assessment. Backend fetches domain data; Gemini analyzes it only (no WHOIS/DNS in the browser).

## Run locally

**Prerequisites:** Node.js 18+

1. **Install dependencies:** `npm install`
2. **Environment:** Copy `.env.example` to `.env` (or use `.env.local`) and set `GEMINI_API_KEY` ([Google AI Studio](https://aistudio.google.com/apikey)). Optional: `SERVER_PORT` (default `3001`).
3. **Run:** `npm run dev` — starts Express (3001) + Vite (3000). If `concurrently` isn’t found, use `npm run dev:runner` instead.

**Run these in your system terminal** (PowerShell or CMD), not inside Cursor, if you see npm cache or spawn errors.

Open http://localhost:3000 and search for a domain (e.g. `google.com`).
