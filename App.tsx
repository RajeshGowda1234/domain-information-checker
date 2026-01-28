import React, { useState, useEffect } from 'react';
import DomainSearch from './components/DomainSearch';
import DomainResult from './components/DomainResult';
import SearchHistory from './components/SearchHistory';
import { fetchDomainInfo } from './services/domainApiService';
import { DomainResponse, DomainSearchHistory } from './types';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState<DomainResponse | null>(null);
  const [history, setHistory] = useState<DomainSearchHistory[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem('domain_search_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse history', e);
      }
    }
  }, []);

  const handleSearch = async (domain: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchDomainInfo(domain);
      setCurrentResult(result);

      // Save to history
      const newHistoryEntry: DomainSearchHistory = {
        ...result.data,
        id: crypto.randomUUID(),
        searchedAt: new Date().toISOString(),
        analysis: result.analysis,
      };

      const updatedHistory = [newHistoryEntry, ...history].slice(0, 10);
      setHistory(updatedHistory);
      localStorage.setItem('domain_search_history', JSON.stringify(updatedHistory));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch domain information. Please try again later.';
      console.error('[App] handleSearch error', err);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectHistory = (entry: DomainSearchHistory) => {
    const fallbackAnalysis = {
      safetyScore: 50,
      summary: 'Historical entry; no analysis stored.',
      riskFactors: [] as string[],
      verdict: 'Unknown' as const,
    };
    setCurrentResult({
      data: {
        domainName: entry.domainName,
        registrar: entry.registrar,
        creationDate: entry.creationDate,
        expiryDate: entry.expiryDate,
        nameServers: entry.nameServers ?? [],
        status: entry.status,
        organization: entry.organization,
        ipAddress: entry.ipAddress,
      },
      analysis: entry.analysis ?? fallbackAnalysis,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('domain_search_history');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 py-6 mb-8 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 max-w-5xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <i className="fa-solid fa-magnifying-glass-chart text-lg"></i>
            </div>
            <h1 className="text-xl font-black tracking-tight text-slate-800">
              Domain<span className="text-blue-600">Checker</span>
            </h1>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
            <span>WHOIS Intelligence</span>
            <span className="w-1 h-1 rounded-full bg-gray-200"></span>
            <span>AI Risk Assessment</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">Verify Any Domain</h2>
          <p className="text-gray-500 max-w-xl mx-auto leading-relaxed">
            Get instant technical details, WHOIS records, and AI-powered safety verdicts for any web address in seconds.
          </p>
        </div>

        <DomainSearch onSearch={handleSearch} isLoading={isLoading} />

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 flex items-center gap-3 animate-in fade-in zoom-in-95">
            <i className="fa-solid fa-circle-exclamation text-xl"></i>
            <span className="font-medium">{error}</span>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-6">
            <div className="h-48 bg-gray-200 animate-pulse rounded-2xl"></div>
            <div className="h-64 bg-gray-200 animate-pulse rounded-2xl"></div>
          </div>
        ) : (
          currentResult && (
            <DomainResult 
              data={currentResult.data} 
              analysis={currentResult.analysis} 
            />
          )
        )}

        <SearchHistory 
          history={history} 
          onSelect={handleSelectHistory} 
          onClear={clearHistory} 
        />
      </main>

      <footer className="mt-20 border-t border-gray-100 py-8 text-center text-gray-400 text-sm">
        <p>&copy; {new Date().getFullYear()} Domain Information Checker. Powered by Gemini AI.</p>
      </footer>
    </div>
  );
};

export default App;
