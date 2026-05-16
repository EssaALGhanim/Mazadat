package org.example.mazadat.DTOOUT;

import java.util.List;
import java.util.Map;

public record SellerAnalyticsDTOOUT(
        Integer totalAuctions,
        Map<String, Long> auctionsByStatus,
        Integer totalBidsReceived,
        Integer totalViews,
        Double averageBidsPerAuction,
        String mostBiddedAuctionTitle,
        Double totalRevenue,
        Double conversionRate,
        List<AuctionAnalyticsDTOOUT> perAuction) {}
