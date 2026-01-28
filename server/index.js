/**
 * Domain Information Checker – Backend
 * - Fetches WHOIS + DNS via whois-json and Node dns.
 * - Calls Gemini for ANALYSIS ONLY (no WHOIS/DNS/search).
 * - GET /api/domain-info?domain=example.com → { data, analysis }
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import express from 'express';
import cors from 'cors';
import dns from 'dns';
import { promisify } from 'util';
import { createRequire } from 'module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

// Load .env then .env.local (override) so GEMINI_API_KEY from .env.local is used
dotenv.config({ path: path.join(root, '.env') });
dotenv.config({ path: path.join(root, '.env.local'), override: true });

const require = createRequire(import.meta.url);
const whois = require('whois-json');

const resolve4 = promisify(dns.resolve4);
const resolve6 = promisify(dns.resolve6);

const app = express();
const PORT = process.env.SERVER_PORT || 3001;

app.use(cors({ origin: ['http://localhost:3000', 'http://127.0.0.1:3000'] }));
app.use(express.json());

/**
 * Resolve domain to IP (A record, fallback to AAAA).
 */
async function getIpAddress(domain) {
  try {
    const addrs = await resolve4(domain);
    return Array.isArray(addrs) && addrs.length ? addrs[0] : null;
  } catch {
    try {
      const addrs = await resolve6(domain);
      return Array.isArray(addrs) && addrs.length ? addrs[0] : null;
    } catch {
      return null;
    }
  }
}

/** Unwrap value: if array, take first element; otherwise return as-is. */
function unwrap(v) {
  if (Array.isArray(v) && v.length) return v[0];
  return v;
}

/**
 * Normalize whois-json output to our DomainData shape.
 * Handles different TLDs and array vs string fields.
 */
function normalizeWhois(raw, domain, ipAddress) {
  const ns = raw.nameServer ?? raw.nameServers ?? raw.nameserver ?? raw.nameservers;
  let nameServers = [];
  if (typeof ns === 'string') {
    nameServers = ns.split(/\s+/).filter(Boolean).map((s) => String(s).replace(/\.$/, ''));
  } else if (Array.isArray(ns)) {
    nameServers = ns.map((s) => (typeof s === 'string' ? s : String(s)).replace(/\.$/, ''));
  }

  const creationDate =
    unwrap(raw.creationDate) ?? unwrap(raw.created) ?? unwrap(raw.registrationDate) ?? unwrap(raw.domainCreationDate) ?? '';
  const expiryDate =
    unwrap(raw.registrarRegistrationExpirationDate) ??
    unwrap(raw.expirationDate) ??
    unwrap(raw.expiryDate) ??
    unwrap(raw.domainExpirationDate) ??
    unwrap(raw.expires) ??
    '';

  const status =
    unwrap(raw.domainStatus) ?? unwrap(raw.status) ?? unwrap(raw.domainStatuses) ?? unwrap(raw.registrarDomainStatus) ?? '';

  const registrar = unwrap(raw.registrar) ?? unwrap(raw.registrarName) ?? '';
  const organization =
    unwrap(raw.registrantOrganization) ??
    unwrap(raw.adminOrganization) ??
    unwrap(raw.registrantName) ??
    unwrap(raw.adminName) ??
    '';

  return {
    domainName: (unwrap(raw.domainName) ?? domain).toString(),
    registrar: String(registrar || 'Unknown').trim(),
    creationDate: String(creationDate).trim() || 'N/A',
    expiryDate: String(expiryDate).trim() || 'N/A',
    nameServers: nameServers.length ? nameServers : ['N/A'],
    status: String(status || 'N/A').trim(),
    organization: String(organization || 'Privacy Protected').trim(),
    ipAddress: ipAddress || 'N/A',
  };
}

/**
 * Fetch domain data via WHOIS + DNS. No Gemini here.
 */
async function fetchDomainData(domain) {
  const [whoisResult, ipAddress] = await Promise.all([
    whois(domain, { follow: 2 }).catch((err) => {
      console.error('[WHOIS]', domain, err?.message || err);
      return null;
    }),
    getIpAddress(domain),
  ]);

  if (!whoisResult || typeof whoisResult !== 'object') {
    throw new Error('WHOIS lookup failed for ' + domain);
  }

  return normalizeWhois(whoisResult, domain, ipAddress);
}

/**
 * Call Gemini for ANALYSIS ONLY. Do NOT ask it to fetch WHOIS/DNS or search.
 */
async function analyzeWithGemini(domainData) {
  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey) {
    console.warn('[Gemini] GEMINI_API_KEY missing; returning placeholder analysis.');
    return {
      safetyScore: 50,
      summary: 'AI analysis unavailable (missing API key). Domain data only.',
      riskFactors: ['Unable to perform AI risk assessment.'],
      verdict: 'Unknown',
    };
  }

  try {
    const { GoogleGenAI, Type } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are a domain safety analyst. You will ONLY analyze the following domain data. Do NOT fetch WHOIS, DNS, or search the internet.

Domain data (already retrieved):
${JSON.stringify(domainData, null, 2)}

Based ONLY on this data, provide a risk assessment. Consider: domain age (creation/expiry), registrar reputation, use of privacy protection, name servers, and status. Return valid JSON only.`;

    const res = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            safetyScore: { type: Type.NUMBER, description: '0-100' },
            summary: { type: Type.STRING },
            riskFactors: { type: Type.ARRAY, items: { type: Type.STRING } },
            verdict: {
              type: Type.STRING,
              enum: ['Safe', 'Suspicious', 'Dangerous', 'Unknown'],
            },
          },
          required: ['safetyScore', 'summary', 'riskFactors', 'verdict'],
        },
      },
    });

    const text = (res && typeof res.text === 'string' ? res.text : '') || (res?.candidates?.[0]?.content?.parts?.[0]?.text ?? '');
    if (!text) throw new Error('Empty Gemini response');
    const analysis = JSON.parse(text);

    if (typeof analysis.safetyScore !== 'number' || analysis.safetyScore < 0 || analysis.safetyScore > 100) {
      analysis.safetyScore = Math.max(0, Math.min(100, Number(analysis.safetyScore) || 50));
    }
    if (!Array.isArray(analysis.riskFactors)) analysis.riskFactors = [];
    const allowed = ['Safe', 'Suspicious', 'Dangerous', 'Unknown'];
    if (!allowed.includes(analysis.verdict)) analysis.verdict = 'Unknown';

    return {
      safetyScore: analysis.safetyScore,
      summary: String(analysis.summary ?? '').trim() || 'No summary available.',
      riskFactors: analysis.riskFactors,
      verdict: analysis.verdict,
    };
  } catch (e) {
    const msg = e?.message || String(e);
    if (/api key|invalid.*key|401|403/i.test(msg)) {
      throw new Error('Invalid or missing Gemini API key. Check .env or .env.local.');
    }
    if (/rate limit|429|quota/i.test(msg)) {
      throw new Error('Gemini rate limit exceeded. Try again later.');
    }
    console.error('[Gemini]', msg);
    throw new Error('AI analysis failed. ' + (msg || 'Please try again.'));
  }
}

/**
 * Wraps async route handlers so rejections are passed to Express error middleware.
 * Express 4 does not catch async errors otherwise → "Internal Server Error" HTML.
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * GET /api/domain-info?domain=example.com
 * Returns { data: DomainData, analysis: AIAnalysis }
 */
app.get(
  '/api/domain-info',
  asyncHandler(async (req, res) => {
    const domain = (req.query.domain || '').toString().trim().toLowerCase();
    if (!domain) {
      res.status(400).json({ error: 'Missing domain', code: 'MISSING_DOMAIN' });
      return;
    }
    if (!/^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}$/i.test(domain)) {
      res.status(400).json({ error: 'Invalid domain format', code: 'INVALID_DOMAIN' });
      return;
    }

    const data = await fetchDomainData(domain);
    const analysis = await analyzeWithGemini(data);
    res.json({ data, analysis });
  })
);

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

/** Global error handler: always return JSON. Prevents "Internal Server Error" HTML. */
app.use((err, req, res, next) => {
  console.error('[domain-info]', req.query?.domain, err?.message || err);
  const code = err?.message?.includes('WHOIS') ? 'WHOIS_FAILED' : 'SERVER_ERROR';
  res.status(500).json({
    error: err?.message || 'Failed to fetch domain information',
    code,
  });
});

app.listen(PORT, () => {
  console.log(`[server] Domain API running on http://localhost:${PORT}`);
});
