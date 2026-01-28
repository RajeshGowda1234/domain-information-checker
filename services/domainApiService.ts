/**
 * Domain API service – frontend
 * Calls backend GET /api/domain-info?domain=... for WHOIS/DNS + AI analysis.
 * No Gemini or WHOIS/DNS logic in the browser.
 */

import type { DomainResponse } from '../types';

const API_BASE = '';

/**
 * Fetch domain info and AI analysis from backend.
 * Backend performs WHOIS/DNS lookup and Gemini analysis-only.
 */
export async function fetchDomainInfo(domain: string): Promise<DomainResponse> {
  const url = `${API_BASE}/api/domain-info?domain=${encodeURIComponent(domain)}`;
  let res: Response;
  try {
    res = await fetch(url);
  } catch (e) {
    console.error('[domainApi] fetch failed', e);
    throw new Error(
      'Cannot reach server. Ensure the backend is running (npm run dev).'
    );
  }

  if (!res.ok) {
    let body: { code?: string; error?: string } = {};
    const ct = res.headers.get('content-type') || '';
    try {
      if (ct.includes('application/json')) {
        body = (await res.json()) as { code?: string; error?: string };
      }
    } catch {
      /* response was not JSON (e.g. HTML error page) */
    }
    const code = body?.code;
    const msg = body?.error || res.statusText;

    if (res.status === 400) {
      if (code === 'MISSING_DOMAIN') throw new Error('Please enter a domain name.');
      if (code === 'INVALID_DOMAIN') throw new Error('Invalid domain format (e.g. example.com).');
      throw new Error(msg || 'Invalid request.');
    }

    if (res.status === 500) {
      if (code === 'WHOIS_FAILED') {
        throw new Error('WHOIS lookup failed for this domain. It may be invalid or unavailable.');
      }
      throw new Error(
        msg || 'Failed to fetch domain information. Please try again later.'
      );
    }

    throw new Error(msg || 'Failed to fetch domain information. Please try again later.');
  }

  const json = (await res.json()) as DomainResponse;
  if (!json.data || !json.analysis) {
    throw new Error('Invalid response from server. Please try again.');
  }
  return json;
}
