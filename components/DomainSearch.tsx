
import React, { useState } from 'react';

interface DomainSearchProps {
  onSearch: (domain: string) => void;
  isLoading: boolean;
}

const DomainSearch: React.FC<DomainSearchProps> = ({ onSearch, isLoading }) => {
  const [domain, setDomain] = useState('');
  const [error, setError] = useState('');

  const validateDomain = (val: string) => {
    const pattern = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
    return pattern.test(val);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!domain) {
      setError('Please enter a domain name');
      return;
    }

    if (!validateDomain(domain)) {
      setError('Invalid domain format (e.g., example.com)');
      return;
    }

    onSearch(domain);
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <form onSubmit={handleSubmit} className="relative flex flex-col sm:flex-row gap-2">
        <div className="relative flex-grow">
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="Enter domain name (e.g. google.com)"
            disabled={isLoading}
            className={`w-full px-4 py-4 pr-10 bg-white border-2 rounded-xl shadow-sm focus:outline-none focus:ring-2 transition-all ${
              error ? 'border-red-300 focus:ring-red-100' : 'border-gray-100 focus:ring-blue-100'
            }`}
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
            <i className="fa-solid fa-globe"></i>
          </div>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <i className="fa-solid fa-circle-notch animate-spin"></i>
          ) : (
            <i className="fa-solid fa-magnifying-glass"></i>
          )}
          <span>Check Domain</span>
        </button>
      </form>
      {error && <p className="mt-2 text-red-500 text-sm font-medium ml-1">{error}</p>}
    </div>
  );
};

export default DomainSearch;
