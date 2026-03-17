export type Flag = "LOW" | "NORMAL" | "HIGH" | "UNKNOWN";

export interface PredictRequest {
  cbc_values: Record<string, number>;
  cbc_flags?: Record<string, Flag>;
  context?: Record<string, any>;
  top_k?: number;
}

export interface Stage1Result {
  cbc_related_probability: number;
  cbc_related: boolean;
  threshold: number;
  note: string;
}

export interface OntologyRule {
  feature: string;
  direction: string;
  reason?: string;
  weight?: number;
}

export interface RecommendedTest {
  test: string;
  reason: string;
  priority?: number;
  turnaround_time?: string;
  cost?: string;
}

export interface TopPrediction {
  rank: number;
  condition: string;
  probability: number;
  probability_percent: number;
  likely_causes?: string[];
  confirmatory_tests?: Array<string | RecommendedTest>;
  specialty?: string | null;
  red_flags?: string[];
  low_confidence?: boolean;
  max_probability?: number;
  confidence_threshold?: number;
}

export interface OntologySupport {
  condition: string;
  score?: number;
  score_percent?: number;
  matched_rules?: OntologyRule[];
  likely_causes?: string[];
  confirmatory_tests?: Array<string | RecommendedTest>;
  specialty?: string | null;
  red_flags?: string[];
  weak_match?: boolean;
  passed_min_score?: boolean;
  min_score?: number;
}

export interface PredictResponse {
  stage1: Stage1Result;
  path: string;
  top_predictions: TopPrediction[];
  ontology_support: OntologySupport[];
  urgent_attention: boolean;
  recommended_tests: RecommendedTest[];
  specialty: string[];
  red_flags: string[];
  warnings: string[];
  disclaimer: string;
}

export interface HealthResponse {
  status: string;
  loaded: string[];
}