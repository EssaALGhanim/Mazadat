package org.example.mazadat.DTOOUT;

import java.time.LocalDateTime;

public record AuctionAnalyticsDTOOUT(
        Integer auctionId,
        String title,
        String image,
        String status,
        Double startingPrice,
        Double currentPrice,
        Double currentHighestBid,
        Integer totalBids,
        Integer uniqueBidders,
        Integer watchlistCount,
        Integer viewCount,
        LocalDateTime createdAt,
        LocalDateTime startDate,
        LocalDateTime endDate) {}
