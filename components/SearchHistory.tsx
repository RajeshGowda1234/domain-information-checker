
import React from 'react';
import { DomainSearchHistory } from '../types';

interface SearchHistoryProps {
  history: DomainSearchHistory[];
  onSelect: (entry: DomainSearchHistory) => void;
  onClear: () => void;
}

const SearchHistory: React.FC<SearchHistoryProps> = ({ history, onSelect, onClear }) => {
  if (history.length === 0) {
    return (
      <div className="mt-12 text-center py-12 border-2 border-dashed border-gray-100 rounded-3xl">
        <i className="fa-solid fa-history text-3xl text-gray-200 mb-3"></i>
        <p className="text-gray-400">No search history yet</p>
      </div>
    );
  }

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <i className="fa-solid fa-clock-rotate-left text-gray-400"></i>
          Recent Searches
        </h2>
        <button 
          onClick={onClear}
          className="text-xs font-bold text-gray-400 hover:text-red-500 transition-colors uppercase tracking-widest"
        >
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {history.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item)}
            className="group bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all text-left flex items-start gap-4"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
              <i className="fa-solid fa-globe text-lg"></i>
            </div>
            <div className="flex-grow min-w-0">
              <h3 className="font-bold text-gray-900 truncate">{item.domainName}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tighter ${
                  item.analysis?.verdict === 'Safe' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {item.analysis?.verdict || 'Unknown'}
                </span>
                <span className="text-[10px] text-gray-400">{new Date(item.searchedAt).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="text-gray-300 group-hover:text-blue-500 transition-colors self-center">
              <i className="fa-solid fa-chevron-right"></i>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SearchHistory;
