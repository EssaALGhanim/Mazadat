package org.example.mazadat.Service;

import lombok.RequiredArgsConstructor;
import org.example.mazadat.Api.ApiException;
import org.example.mazadat.DTOOUT.AuctionAnalyticsDTOOUT;
import org.example.mazadat.DTOOUT.SellerAnalyticsDTOOUT;
import org.example.mazadat.Model.Auction;
import org.example.mazadat.Repository.AuctionRepository;
import org.example.mazadat.Repository.SellerRepository;
import org.example.mazadat.Repository.WatchlistRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SellerAnalyticsService {

    private final AuctionRepository auctionRepository;
    private final SellerRepository sellerRepository;
    private final WatchlistRepository watchlistRepository;

    @Transactional(readOnly = true)
    public SellerAnalyticsDTOOUT getSellerAnalytics(int sellerId) {
        sellerRepository.findById(sellerId)
                .orElseThrow(() -> new ApiException("Seller not found"));

        List<Auction> auctions = auctionRepository.findBySellerId(sellerId);

        int totalAuctions = auctions.size();
        int totalBidsReceived = auctions.stream()
                .mapToInt(a -> a.getBids() == null ? 0 : a.getBids().size())
                .sum();
        int totalViews = auctions.stream()
                .mapToInt(a -> a.getViewCount() == null ? 0 : a.getViewCount())
                .sum();
        int totalWatchlistSaves = auctions.stream()
                .mapToInt(a -> (int) watchlistRepository.countByAuctionId(a.getId()))
                .sum();
        double highestCurrentBid = auctions.stream()
                .mapToDouble(a -> a.getCurrentPrice() == null ? 0.0 : a.getCurrentPrice())
                .max()
                .orElse(0.0);
        double averageBidsPerAuction = totalAuctions == 0 ? 0.0 : (double) totalBidsReceived / totalAuctions;

        Map<String, Long> auctionsByStatus = auctions.stream()
                .collect(Collectors.groupingBy(
                        a -> a.getStatus() == null ? "UNKNOWN" : a.getStatus(),
                        Collectors.counting()));

        long endedCount = auctionsByStatus.getOrDefault("ENDED", 0L);
        long failedCount = auctionsByStatus.getOrDefault("FAILED_BELOW_RESERVE", 0L);
        long completedCount = endedCount + failedCount;
        double conversionRate = completedCount == 0 ? 0.0 : (double) endedCount / completedCount;

        double totalRevenue = auctions.stream()
                .filter(a -> "ENDED".equals(a.getStatus()))
                .mapToDouble(a -> a.getCurrentPrice() == null ? 0.0 : a.getCurrentPrice())
                .sum();

        String mostBiddedAuctionTitle = auctions.stream()
                .filter(a -> a.getBids() != null && !a.getBids().isEmpty())
                .max(Comparator.comparingInt(a -> a.getBids().size()))
                .map(Auction::getTitle)
                .orElse(null);

        List<AuctionAnalyticsDTOOUT> perAuction = auctions.stream()
                .map(this::toAuctionAnalytics)
                .toList();

        return new SellerAnalyticsDTOOUT(
                sellerId,
                totalAuctions,
                auctionsByStatus,
                totalBidsReceived,
                totalViews,
                highestCurrentBid,
                totalWatchlistSaves,
                averageBidsPerAuction,
                mostBiddedAuctionTitle,
                totalRevenue,
                conversionRate,
                perAuction);
    }

    @Transactional(readOnly = true)
    public AuctionAnalyticsDTOOUT getAuctionAnalytics(int auctionId, int sellerId) {
        sellerRepository.findById(sellerId)
                .orElseThrow(() -> new ApiException("Seller not found"));
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new ApiException("Auction not found"));
        if (!auction.getSeller().getId().equals(sellerId)) {
            throw new ApiException("Auction does not belong to you");
        }
        return toAuctionAnalytics(auction);
    }

    private AuctionAnalyticsDTOOUT toAuctionAnalytics(Auction auction) {
        int totalBids = auction.getBids() == null ? 0 : auction.getBids().size();
        int uniqueBidders = auction.getBids() == null ? 0 : (int) auction.getBids().stream()
                .filter(b -> b.getBuyer() != null)
                .map(b -> b.getBuyer().getId())
                .distinct()
                .count();
        int watchlistCount = (int) watchlistRepository.countByAuctionId(auction.getId());
        String image = auction.getImages() == null ? null : auction.getImages().stream()
                .findFirst()
                .map(i -> i.getUrl())
                .orElse(null);
        return new AuctionAnalyticsDTOOUT(
                auction.getId(),
                auction.getTitle(),
                image,
                auction.getStatus(),
                auction.getStartingPrice(),
                auction.getCurrentPrice(),
                auction.getCurrentPrice() == null ? 0.0 : auction.getCurrentPrice(),
                totalBids,
                uniqueBidders,
                watchlistCount,
                auction.getViewCount() == null ? 0 : auction.getViewCount(),
                auction.getCreatedAt(),
                auction.getStartDate(),
                auction.getEndDate());
    }
}
