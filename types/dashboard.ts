export interface DashboardSummary {
  totalBusinesses: number;
  businessesWithoutWebsite: number;
  savedLeads: number;
  clients: number;
}

export interface CategoryBreakdownItem {
  category: string;
  count: number;
}

export interface StatusBreakdownItem {
  status: string;
  label: string;
  count: number;
}

export interface RegionOpportunityItem {
  city: string;
  count: number;
}

export interface DashboardData {
  summary: DashboardSummary;
  conversionRate: number;
  businessesByCategory: CategoryBreakdownItem[];
  leadsByStatus: StatusBreakdownItem[];
  topRegionsByOpportunity: RegionOpportunityItem[];
}
