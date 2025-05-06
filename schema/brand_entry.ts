export interface BrandEntry {
    meta: {
      schema_version: 1;
      last_updated: string;                // ISO 8601
      brand: { name: string; slug: string; website: string; };
    };
    ownership_chain: string[];
    naics: string;                         // "311941"
    positive_signals: Evidence[];
    concerns: Evidence[];
}

interface Evidence {
    statement: string;                    // ≤140 chars
    source: {
      url: string;
      title?: string;
      publisher?: string;
      date: string;
    };
    pillar: "Labour" | "Environment" | "Governance" | "Community" | "Other";
    evidence_type?: "Primary" | "NGO" | "Journalism" | "Academic";
    severity?: "Low" | "Medium" | "High";
}
  