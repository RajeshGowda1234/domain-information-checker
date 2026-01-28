
import React from 'react';
import { DomainData, AIAnalysis } from '../types';

interface DomainResultProps {
  data: DomainData;
  analysis: AIAnalysis;
}

const DomainResult: React.FC<DomainResultProps> = ({ data, analysis }) => {
  const getVerdictColor = (verdict: string) => {
    switch (verdict.toLowerCase()) {
      case 'safe': return 'bg-green-100 text-green-800 border-green-200';
      case 'suspicious': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'dangerous': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Safety Analysis Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <i className="fa-solid fa-shield-halved text-blue-500"></i>
              AI Safety Analysis
            </h2>
            <p className="text-gray-500 text-sm mt-1">Based on domain age, registrar, and DNS data</p>
          </div>
          <div className="flex items-center gap-4">
            <div className={`px-4 py-1.5 rounded-full border text-sm font-bold uppercase tracking-wider ${getVerdictColor(analysis.verdict)}`}>
              {analysis.verdict}
            </div>
            <div className="flex flex-col items-end">
              <span className={`text-2xl font-black ${getScoreColor(analysis.safetyScore)}`}>
                {analysis.safetyScore}%
              </span>
              <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Safety Score</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-5 mb-6">
          <p className="text-gray-700 leading-relaxed italic">"{analysis.summary}"</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <i className="fa-solid fa-triangle-exclamation text-yellow-500"></i>
              Key Observations
            </h3>
            <ul className="space-y-2">
              {analysis.riskFactors.map((factor, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0"></span>
                  {factor}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Technical Data Card */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <i className="fa-solid fa-server text-indigo-500"></i>
            Domain Details
          </h2>
          <span className="text-xs font-medium text-gray-400">WHOIS Records</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-50">
          <div className="p-6">
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Domain Name</label>
                <p className="text-gray-900 font-semibold">{data.domainName}</p>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Registrar</label>
                <p className="text-gray-700">{data.registrar || 'Unknown'}</p>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Organization</label>
                <p className="text-gray-700">{data.organization || 'Privacy Protected'}</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-gray-50/30">
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Created On</label>
                <p className="text-gray-700">{data.creationDate}</p>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Expires On</label>
                <p className="text-gray-700">{data.expiryDate}</p>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</label>
                <p className="text-xs bg-white border px-2 py-0.5 rounded inline-block text-blue-600 font-medium">
                  {data.status}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">IP Address</label>
                <p className="font-mono text-gray-900 font-semibold bg-gray-50 px-2 py-1 rounded inline-block border border-gray-100">
                  {data.ipAddress}
                </p>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Name Servers</label>
                <div className="mt-1 space-y-1">
                  {data.nameServers.map((ns, idx) => (
                    <p key={idx} className="text-xs text-gray-500 font-mono">{ns}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DomainResult;
