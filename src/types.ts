
export interface Article {
  url: string;
  title: string;
}

export interface BrandInput {
  name: string;
  articles: Article[];
}

// Output Schema Interfaces
export interface ThemeShare {
  theme: string;
  totals: { all_brands_count: number };
  by_brand: Record<string, { count: number; pct: number }>;
}

export interface ArticleDetail {
  url: string;
  title: string;
  format?: string;
  intent?: string;
}

export interface ThemeCluster {
  theme: string;
  by_brand: Record<string, { count: number; pct: number }>;
  // Drilldown limitato e semplificato
  drilldown_articles: Record<string, ArticleDetail[]>;
}

export interface MatrixRow {
  dimension_value: string;
  by_brand: Record<string, { count: number; pct_within_brand: number }>;
  // RIMOSSO DRILLDOWN PER RISPARMIO TOKEN
}

export interface MatrixGroup {
  theme: string;
  rows: MatrixRow[];
}

export interface GapAnalysis {
  theme: string;
  competitor_avg_pct: number;
  focus_pct: number;
  gap_type: string;
  priority: string;
  rationale: string;
  what_to_emulate: string[];
  what_to_avoid: string[];
}

export interface Opportunity {
  rank: number;
  opportunity: string;
  type: string;
  why_it_matters: string;
  suggested_angles: string[];
  proof_points: { brand: string; url: string; title: string }[];
}

export interface DepthMetrics {
  note: string;
}

export interface DistributionItem {
  format?: string;
  intent?: string;
  by_brand: Record<string, { count: number; pct: number }>;
}

export interface PillarCandidate {
  url: string;
  title: string;
  reason: string;
}

export interface AnalysisResult {
  meta: {
    focus_brand: string;
    brands: string[];
    article_counts: Record<string, number>;
    second_dimension_used: string;
  };
  tab1_overview: {
    theme_share_table: ThemeShare[];
    leaders: {
      breadth_leader: { brand: string; why: string } | null;
      specialist: { brand: string; why: string } | null;
    };
    focus_brand_exposure: {
      overexposed: { theme: string; focus_pct: number; competitor_avg_pct: number; note: string }[];
      underexposed: { theme: string; focus_pct: number; competitor_avg_pct: number; note: string }[];
    };
    key_insights: string[];
  };
  tab2_theme_clustering: {
    themes: ThemeCluster[];
    key_insights: string[];
  };
  tab3_dual_clustering: {
    dimension_x: string;
    dimension_y: string;
    matrix: MatrixGroup[];
    key_insights: string[];
  };
  tab4_depth_and_format: {
    depth_metrics: DepthMetrics;
    pillar_candidates: Record<string, PillarCandidate[]>;
    key_insights: string[];
  };
  tab5_gap_analysis: {
    theme_gaps: GapAnalysis[];
    prioritized_opportunities: Opportunity[];
    key_insights: string[];
  };
}