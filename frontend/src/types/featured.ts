export interface FeaturedAuction {
  id: number;
  auctionId: number;
  createdAt?: string;
}

export interface FeaturedResponse {
  data: FeaturedAuction[];
}
