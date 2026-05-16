package org.example.mazadat.DTOOUT;

import java.time.LocalDateTime;

public record AuctionAnalyticsDTOOUT(
        Integer auctionId,
        String title,
        String status,
        Double startingPrice,
        Double currentPrice,
        Integer totalBids,
        Integer uniqueBidders,
        Integer viewCount,
        LocalDateTime createdAt,
        LocalDateTime startDate,
        LocalDateTime endDate) {}
