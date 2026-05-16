package org.example.mazadat.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.example.mazadat.Api.ApiException;
import org.example.mazadat.DTOOUT.AuctionAnalyticsDTOOUT;
import org.example.mazadat.DTOOUT.SellerAnalyticsDTOOUT;
import org.example.mazadat.Model.Auction;
import org.example.mazadat.Model.Bid;
import org.example.mazadat.Model.Buyer;
import org.example.mazadat.Model.Seller;
import org.example.mazadat.Repository.AuctionRepository;
import org.example.mazadat.Repository.SellerRepository;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
public class SellerAnalyticsServiceTest {

    @InjectMocks
    private SellerAnalyticsService sellerAnalyticsService;

    @Mock
    private AuctionRepository auctionRepository;

    @Mock
    private SellerRepository sellerRepository;

    // --- getSellerAnalytics ---

    @Test
    void getSellerAnalyticsThrowsWhenSellerNotFound() {
        when(sellerRepository.findById(1)).thenReturn(Optional.empty());
        assertThrows(ApiException.class, () -> sellerAnalyticsService.getSellerAnalytics(1));
    }

    @Test
    void getSellerAnalyticsReturnsZerosWhenNoAuctions() {
        when(sellerRepository.findById(1)).thenReturn(Optional.of(new Seller()));
        when(auctionRepository.findBySellerId(1)).thenReturn(List.of());

        SellerAnalyticsDTOOUT result = sellerAnalyticsService.getSellerAnalytics(1);

        assertEquals(0, result.totalAuctions());
        assertEquals(0, result.totalBidsReceived());
        assertEquals(0, result.totalViews());
        assertEquals(0.0, result.averageBidsPerAuction());
        assertEquals(0.0, result.conversionRate());
        assertEquals(0.0, result.totalRevenue());
        assertNull(result.mostBiddedAuctionTitle());
        assertTrue(result.perAuction().isEmpty());
    }

    @Test
    void getSellerAnalyticsAggregatesCorrectly() {
        Auction endedAuction = buildAuction(1, "ENDED", 1000.0, 3, 10);
        Auction failedAuction = buildAuction(2, "FAILED_BELOW_RESERVE", 500.0, 1, 5);
        Auction activeAuction = buildAuction(3, "ACTIVE", 0.0, 0, 2);

        when(sellerRepository.findById(1)).thenReturn(Optional.of(new Seller()));
        when(auctionRepository.findBySellerId(1)).thenReturn(List.of(endedAuction, failedAuction, activeAuction));

        SellerAnalyticsDTOOUT result = sellerAnalyticsService.getSellerAnalytics(1);

        assertEquals(3, result.totalAuctions());
        assertEquals(4, result.totalBidsReceived());
        assertEquals(17, result.totalViews());
        assertEquals(1000.0, result.totalRevenue());
        assertEquals(0.5, result.conversionRate(), 0.001);
        assertEquals(4.0 / 3, result.averageBidsPerAuction(), 0.001);
        assertEquals(1L, result.auctionsByStatus().get("ENDED"));
        assertEquals(1L, result.auctionsByStatus().get("FAILED_BELOW_RESERVE"));
        assertEquals("AuctionTitle1", result.mostBiddedAuctionTitle());
        assertEquals(3, result.perAuction().size());
    }

    @Test
    void getSellerAnalyticsConversionRateIsZeroWhenNoCompletedAuctions() {
        when(sellerRepository.findById(1)).thenReturn(Optional.of(new Seller()));
        when(auctionRepository.findBySellerId(1)).thenReturn(List.of(buildAuction(1, "ACTIVE", 0.0, 0, 0)));

        SellerAnalyticsDTOOUT result = sellerAnalyticsService.getSellerAnalytics(1);

        assertEquals(0.0, result.conversionRate());
    }

    // --- getAuctionAnalytics ---

    @Test
    void getAuctionAnalyticsThrowsWhenSellerNotFound() {
        when(sellerRepository.findById(1)).thenReturn(Optional.empty());
        assertThrows(ApiException.class, () -> sellerAnalyticsService.getAuctionAnalytics(1, 1));
    }

    @Test
    void getAuctionAnalyticsThrowsWhenAuctionNotFound() {
        when(sellerRepository.findById(1)).thenReturn(Optional.of(new Seller()));
        when(auctionRepository.findById(1)).thenReturn(Optional.empty());
        assertThrows(ApiException.class, () -> sellerAnalyticsService.getAuctionAnalytics(1, 1));
    }

    @Test
    void getAuctionAnalyticsThrowsWhenAuctionNotOwnedBySeller() {
        Seller seller = buildSeller(1);
        Auction auction = buildAuction(1, "ACTIVE", 0.0, 0, 0);
        auction.setSeller(buildSeller(2));

        when(sellerRepository.findById(1)).thenReturn(Optional.of(seller));
        when(auctionRepository.findById(1)).thenReturn(Optional.of(auction));

        assertThrows(ApiException.class, () -> sellerAnalyticsService.getAuctionAnalytics(1, 1));
    }

    @Test
    void getAuctionAnalyticsReturnsMappedFields() {
        Seller seller = buildSeller(1);
        Auction auction = buildAuction(1, "ENDED", 500.0, 2, 7);
        auction.setSeller(seller);

        when(sellerRepository.findById(1)).thenReturn(Optional.of(seller));
        when(auctionRepository.findById(1)).thenReturn(Optional.of(auction));

        AuctionAnalyticsDTOOUT result = sellerAnalyticsService.getAuctionAnalytics(1, 1);

        assertEquals(1, result.auctionId());
        assertEquals("AuctionTitle1", result.title());
        assertEquals("ENDED", result.status());
        assertEquals(500.0, result.currentPrice());
        assertEquals(2, result.totalBids());
        assertEquals(2, result.uniqueBidders());
        assertEquals(7, result.viewCount());
    }

    // --- helpers ---

    private Seller buildSeller(int id) {
        Seller seller = new Seller();
        seller.setId(id);
        return seller;
    }

    private Auction buildAuction(int id, String status, double currentPrice, int bidCount, int viewCount) {
        Auction auction = new Auction();
        auction.setId(id);
        auction.setTitle("AuctionTitle" + id);
        auction.setStatus(status);
        auction.setStartingPrice(100.0);
        auction.setCurrentPrice(currentPrice);
        auction.setViewCount(viewCount);

        Set<Bid> bids = new HashSet<>();
        for (int i = 0; i < bidCount; i++) {
            Bid bid = new Bid();
            Buyer buyer = new Buyer();
            buyer.setId(i + 1);
            bid.setBuyer(buyer);
            bids.add(bid);
        }
        auction.setBids(bids);

        return auction;
    }
}
