export interface WatchlistItem {
  id: number;
  auctionId: number;
  userId: number;
  createdAt?: string;
}

export interface WatchlistResponse {
  data: WatchlistItem[];
}

export interface AddToWatchlistRequest {
  auctionId: number;
}

export interface RemoveFromWatchlistRequest {
  auctionId: number;
}
