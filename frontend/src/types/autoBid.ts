export interface AutoBid {
  id: number;
  auctionId: number;
  userId: number;
  maxAmount: number;
  currentAmount?: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AutoBidResponse {
  data: AutoBid[];
}

export interface CreateAutoBidRequest {
  auctionId: number;
  maxAmount: number;
}

export interface UpdateAutoBidRequest {
  maxAmount?: number;
  isActive?: boolean;
}
