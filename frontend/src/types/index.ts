export interface User {
  id: number;
  email: string;
  full_name: string;
  organization_name: string;
  role: 'admin' | 'supplier' | 'buyer';
  city?: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

export interface WasteListing {
  id: number;
  listing_code?: string;
  supplier_id?: number;
  supplier_name: string;
  supplier_type?: string;
  source_sector: string;
  material_name: string;
  material_category: string;
  condition: string;
  quantity_tonnes: number;
  quality_score_0_100: number;
  contamination_est_pct: number;
  indicative_price_inr_per_kg: number;
  city: string;
  latitude?: number;
  longitude?: number;
  listing_status: 'Available' | 'Under Review' | 'Reserved' | 'Sold' | 'Rejected';
  hazardous_flag: boolean;
  demo_data_flag: boolean;
  created_at: string;
  updated_at: string;
}

export interface BuyerRequirement {
  id: number;
  buyer_need_code?: string;
  buyer_id?: number;
  buyer_name: string;
  buyer_type?: string;
  buyer_sector: string;
  required_material_category: string;
  preferred_material_name?: string;
  minimum_quality_score: number;
  maximum_contamination_pct: number;
  minimum_quantity_tonnes: number;
  maximum_quantity_tonnes: number;
  max_budget_inr_per_kg: number;
  city: string;
  latitude?: number;
  longitude?: number;
  required_condition: string;
  status: 'Active' | 'Fulfilled' | 'Cancelled';
  demo_data_flag: boolean;
  created_at: string;
  updated_at: string;
}

export interface SubScoreBreakdown {
  category_compatibility: number;
  quality_score: number;
  contamination_score: number;
  quantity_fit_score: number;
  budget_fit_score: number;
  distance_score: number;
  distance_km?: number;
}

export interface MatchResultItem {
  listing: WasteListing;
  overall_score: number;
  recommendation_level: 'High Match' | 'Moderate Match' | 'Low Match' | 'Incompatible';
  is_compatible: boolean;
  sub_scores: SubScoreBreakdown;
  explanation: string[];
  failed_constraints: string[];
  scoring_mode: 'rule_based' | 'ml_ranking';
}

export interface MatchResponse {
  buyer_requirement_summary: Record<string, any>;
  total_evaluated: number;
  matches: MatchResultItem[];
  disclaimer: string;
}

export interface ExchangeTransaction {
  id: number;
  transaction_code?: string;
  material_name: string;
  material_category: string;
  source_sector: string;
  buyer_sector: string;
  quantity_tonnes: number;
  quality_score_0_100: number;
  contamination_pct: number;
  price_inr_per_kg: number;
  distance_km?: number;
  match_completed: boolean;
  estimated_reuse_yield_fraction: number;
  verified_by_admin: boolean;
  demo_data_flag: boolean;
  completed_at: string;
}

export interface ExchangeRequest {
  id: number;
  request_code?: string;
  listing_id: number;
  buyer_requirement_id?: number;
  buyer_id: number;
  supplier_id: number;
  requested_quantity_tonnes: number;
  offered_price_inr_per_kg: number;
  status: 'Submitted' | 'Under Review' | 'Accepted' | 'Rejected' | 'In Transit' | 'Completed' | 'Cancelled' | 'Disputed';
  notes?: string;
  rejection_reason?: string;
  dispute_details?: string;
  created_at: string;
  updated_at: string;
  listing?: WasteListing;
  buyer?: User;
  supplier?: User;
  transaction?: ExchangeTransaction;
}

export interface PricePredictionResponse {
  predicted_price_inr_per_kg: number;
  price_range_low: number;
  price_range_high: number;
  model_used: string;
  model_mae: number;
  model_r2: number;
  disclaimer: string;
}

export interface QuantityForecastResponse {
  status: 'sufficient' | 'insufficient_data';
  message: string;
  provided_points_count: number;
  minimum_required_points: number;
  forecasted_quantity_tonnes?: number;
  trend_direction?: string;
  confidence_interval?: { low: number; high: number };
  data_limitation_note: string;
}

export interface DemandTrendsResponse {
  total_requirements: number;
  category_breakdown: Array<{
    material_category: string;
    active_requirements_count: number;
    total_requested_tonnes: number;
    average_budget_inr_per_kg: number;
  }>;
  top_demanded_categories: string[];
  demo_data_notice: string;
}

export interface GlobalImpactSummary {
  total_exchanged_tonnes: number;
  total_diverted_tonnes: number;
  total_avoided_co2e_tonnes: number;
  total_completed_exchanges: number;
  verified_transactions_count: number;
  category_breakdown: Array<{
    material_category: string;
    exchanged_tonnes: number;
    diverted_tonnes: number;
    avoided_co2e_tonnes: number;
    completed_transactions: number;
  }>;
  demo_data_flag: boolean;
  methodology_summary: string;
}

export interface AdminStats {
  total_users: number;
  total_listings: number;
  pending_moderation_listings: number;
  total_requirements: number;
  total_exchange_requests: number;
  completed_transactions: number;
  active_disputes: number;
  audit_logs_count: number;
}

export interface AuditLog {
  id: number;
  user_id?: number;
  user_email?: string;
  action: string;
  entity_type: string;
  entity_id?: number;
  details?: string;
  timestamp: string;
}
