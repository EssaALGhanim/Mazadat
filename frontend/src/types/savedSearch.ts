export interface SavedSearchFilters {
  auctionHouse: string;
  priceRange: [number, number];
  sortBy: string;
  category: string;
  status: string;
}

export interface SavedSearch {
  id: number;
  name: string;
  filters: SavedSearchFilters;
  userId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface SavedSearchResponse {
  data: SavedSearch[];
}

export interface CreateSavedSearchRequest {
  name: string;
  filters: SavedSearchFilters;
}

export interface UpdateSavedSearchRequest {
  name?: string;
  filters?: SavedSearchFilters;
}
