
export interface DomainData {
  domainName: string;
  registrar: string;
  creationDate: string;
  expiryDate: string;
  nameServers: string[];
  status: string;
  organization: string;
  ipAddress: string;
}

export interface AIAnalysis {
  safetyScore: number; // 0 to 100
  summary: string;
  riskFactors: string[];
  verdict: 'Safe' | 'Suspicious' | 'Dangerous' | 'Unknown';
}

export interface DomainSearchHistory extends DomainData {
  id: string;
  searchedAt: string;
  analysis?: AIAnalysis;
}

export interface DomainResponse {
  data: DomainData;
  analysis: AIAnalysis;
}
