package org.example.mazadat.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.example.mazadat.Api.ApiException;
import org.example.mazadat.DTOIN.AutoBidDTOIN;
import org.example.mazadat.DTOOUT.AutoBidDTOOUT;
import org.example.mazadat.Model.Auction;
import org.example.mazadat.Model.AutoBid;
import org.example.mazadat.Model.Buyer;
import org.example.mazadat.Model.User;
import org.example.mazadat.Repository.AuctionRepository;
import org.example.mazadat.Repository.AutoBidRepository;
import org.example.mazadat.Repository.BidRepository;
import org.example.mazadat.Repository.BuyerRepository;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AutoBidServiceTest {

    @Mock private AutoBidRepository autoBidRepository;
    @Mock private AuctionRepository auctionRepository;
    @Mock private BuyerRepository buyerRepository;
    @Mock private BidRepository bidRepository;

    @InjectMocks
    private AutoBidService autoBidService;

    // ─── setAutoBid ───────────────────────────────────────────────────────────

    @Test
    void setAutoBidThrowsWhenBuyerNotFound() {
        when(buyerRepository.findById(1)).thenReturn(Optional.empty());
        assertThrows(ApiException.class, () -> autoBidService.setAutoBid(buildDto(10, 500.0), 1));
    }

    @Test
    void setAutoBidThrowsWhenAuctionNotFound() {
        when(buyerRepository.findById(1)).thenReturn(Optional.of(buildBuyer(1, "buyer1")));
        when(auctionRepository.findById(10)).thenReturn(Optional.empty());
        assertThrows(ApiException.class, () -> autoBidService.setAutoBid(buildDto(10, 500.0), 1));
    }

    @Test
    void setAutoBidThrowsWhenAuctionNotActive() {
        Auction auction = buildAuction();
        auction.setStatus("ENDED");
        when(buyerRepository.findById(1)).thenReturn(Optional.of(buildBuyer(1, "buyer1")));
        when(auctionRepository.findById(10)).thenReturn(Optional.of(auction));
        assertThrows(ApiException.class, () -> autoBidService.setAutoBid(buildDto(10, 500.0), 1));
    }

    @Test
    void setAutoBidThrowsWhenMaxAmountEqualToCurrentPrice() {
        Auction auction = buildAuction(); // currentPrice = 100.0
        when(buyerRepository.findById(1)).thenReturn(Optional.of(buildBuyer(1, "buyer1")));
        when(auctionRepository.findById(10)).thenReturn(Optional.of(auction));
        assertThrows(ApiException.class, () -> autoBidService.setAutoBid(buildDto(10, 100.0), 1));
    }

    @Test
    void setAutoBidThrowsWhenMaxAmountBelowCurrentPrice() {
        Auction auction = buildAuction(); // currentPrice = 100.0
        when(buyerRepository.findById(1)).thenReturn(Optional.of(buildBuyer(1, "buyer1")));
        when(auctionRepository.findById(10)).thenReturn(Optional.of(auction));
        assertThrows(ApiException.class, () -> autoBidService.setAutoBid(buildDto(10, 50.0), 1));
    }

    @Test
    void setAutoBidSavesAndReturnsDto() {
        Buyer buyer = buildBuyer(1, "buyer1");
        Auction auction = buildAuction();
        when(buyerRepository.findById(1)).thenReturn(Optional.of(buyer));
        when(auctionRepository.findById(10)).thenReturn(Optional.of(auction));
        when(autoBidRepository.findByBuyerIdAndAuctionIdAndActiveTrue(1, 10)).thenReturn(Optional.empty());
        when(autoBidRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(autoBidRepository.findBestCompetingAutoBid(eq(10), any())).thenReturn(Optional.empty());
        when(autoBidRepository.findExhaustedAutoBids(any(), any(), any())).thenReturn(List.of());

        AutoBidDTOOUT result = autoBidService.setAutoBid(buildDto(10, 500.0), 1);

        assertNotNull(result);
        assertEquals(500.0, result.getMaxAmount());
        verify(autoBidRepository).save(any(AutoBid.class));
    }

    @Test
    void setAutoBidDeactivatesExistingBeforeSavingNew() {
        Buyer buyer = buildBuyer(1, "buyer1");
        Auction auction = buildAuction();
        AutoBid existing = new AutoBid();
        existing.setActive(true);
        when(buyerRepository.findById(1)).thenReturn(Optional.of(buyer));
        when(auctionRepository.findById(10)).thenReturn(Optional.of(auction));
        when(autoBidRepository.findByBuyerIdAndAuctionIdAndActiveTrue(1, 10)).thenReturn(Optional.of(existing));
        when(autoBidRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(autoBidRepository.findBestCompetingAutoBid(eq(10), any())).thenReturn(Optional.empty());
        when(autoBidRepository.findExhaustedAutoBids(any(), any(), any())).thenReturn(List.of());

        autoBidService.setAutoBid(buildDto(10, 500.0), 1);

        assertFalse(existing.getActive());
        verify(autoBidRepository).save(existing);
    }

    // ─── cancelAutoBid ────────────────────────────────────────────────────────

    @Test
    void cancelAutoBidThrowsWhenNoneFound() {
        when(autoBidRepository.findByBuyerIdAndAuctionIdAndActiveTrue(1, 10)).thenReturn(Optional.empty());
        assertThrows(ApiException.class, () -> autoBidService.cancelAutoBid(1, 10));
    }

    @Test
    void cancelAutoBidSetsActiveFalse() {
        AutoBid autoBid = new AutoBid();
        autoBid.setActive(true);
        when(autoBidRepository.findByBuyerIdAndAuctionIdAndActiveTrue(1, 10)).thenReturn(Optional.of(autoBid));

        autoBidService.cancelAutoBid(1, 10);

        assertFalse(autoBid.getActive());
        verify(autoBidRepository).save(autoBid);
    }

    // ─── triggerAutoBidding ───────────────────────────────────────────────────

    @Test
    void triggerAutoBiddingDoesNothingWhenNoCompetingAutoBids() {
        Auction auction = buildAuction();
        when(autoBidRepository.findBestCompetingAutoBid(eq(10), any())).thenReturn(Optional.empty());
        when(autoBidRepository.findExhaustedAutoBids(any(), any(), any())).thenReturn(List.of());

        autoBidService.triggerAutoBidding(auction);

        verify(bidRepository, never()).save(any());
    }

    @Test
    void triggerAutoBiddingDoesNothingWhenLimitTooLow() {
        Auction auction = buildAuction(); // currentPrice=100, nextMin=105
        AutoBid lowBid = buildAutoBid(buildBuyer(2, "buyer2"), auction, 104.0); // 104 < 105
        when(autoBidRepository.findBestCompetingAutoBid(eq(10), any())).thenReturn(Optional.of(lowBid));
        when(autoBidRepository.findExhaustedAutoBids(any(), any(), any())).thenReturn(List.of());

        autoBidService.triggerAutoBidding(auction);

        verify(bidRepository, never()).save(any());
    }

    @Test
    void triggerAutoBiddingPlacesBidAtMinimumAndUpdatesAuction() {
        Auction auction = buildAuction(); // currentPrice=100.0
        Buyer autoBuyer = buildBuyer(2, "buyer2");
        AutoBid competingBid = buildAutoBid(autoBuyer, auction, 300.0);
        when(autoBidRepository.findBestCompetingAutoBid(eq(10), any()))
                .thenReturn(Optional.of(competingBid))
                .thenReturn(Optional.empty());
        when(autoBidRepository.findExhaustedAutoBids(any(), any(), any())).thenReturn(List.of());

        autoBidService.triggerAutoBidding(auction);

        verify(bidRepository).save(any());
        assertEquals(105.0, auction.getCurrentPrice()); // ceil(100 * 1.05) = 105
        assertEquals("buyer2", auction.getHighestBidder());
        assertEquals("buyer2@example.com", auction.getHighestBidderEmail());
    }

    @Test
    void triggerAutoBiddingChainFiresTwoBids() {
        Auction auction = buildAuction(); // currentPrice=100.0
        AutoBid autoBid1 = buildAutoBid(buildBuyer(1, "buyer1"), auction, 300.0);
        AutoBid autoBid2 = buildAutoBid(buildBuyer(2, "buyer2"), auction, 400.0);
        when(autoBidRepository.findBestCompetingAutoBid(eq(10), any()))
                .thenReturn(Optional.of(autoBid1))
                .thenReturn(Optional.of(autoBid2))
                .thenReturn(Optional.empty());
        when(autoBidRepository.findExhaustedAutoBids(any(), any(), any())).thenReturn(List.of());

        autoBidService.triggerAutoBidding(auction);

        verify(bidRepository, times(2)).save(any());
        // Round 1: ceil(100 * 1.05) = 105 → buyer1
        // Round 2: ceil(105 * 1.05) = ceil(110.25) = 111 → buyer2
        assertEquals(111.0, auction.getCurrentPrice());
        assertEquals("buyer2", auction.getHighestBidder());
    }

    @Test
    void triggerAutoBiddingDeactivatesExhaustedAutoBids() {
        Auction auction = buildAuction();
        AutoBid exhausted = buildAutoBid(buildBuyer(3, "buyer3"), auction, 50.0);
        when(autoBidRepository.findBestCompetingAutoBid(eq(10), any())).thenReturn(Optional.empty());
        when(autoBidRepository.findExhaustedAutoBids(any(), any(), any())).thenReturn(List.of(exhausted));

        autoBidService.triggerAutoBidding(auction);

        assertFalse(exhausted.getActive());
        verify(autoBidRepository).saveAll(any());
    }

    // ─── getMyAutoBids ────────────────────────────────────────────────────────

    @Test
    void getMyAutoBidsReturnsListOfDtos() {
        Auction auction = buildAuction();
        AutoBid autoBid = buildAutoBid(buildBuyer(1, "buyer1"), auction, 300.0);
        when(autoBidRepository.findByBuyerIdAndActiveTrue(1)).thenReturn(List.of(autoBid));

        List<AutoBidDTOOUT> result = autoBidService.getMyAutoBids(1);

        assertEquals(1, result.size());
        assertEquals(300.0, result.get(0).getMaxAmount());
        assertEquals(10, result.get(0).getAuctionId());
        assertEquals("Test Auction", result.get(0).getAuctionTitle());
    }

    @Test
    void getMyAutoBidsReturnsEmptyListWhenNoneActive() {
        when(autoBidRepository.findByBuyerIdAndActiveTrue(1)).thenReturn(List.of());

        List<AutoBidDTOOUT> result = autoBidService.getMyAutoBids(1);

        assertTrue(result.isEmpty());
    }

    // ─── helpers ─────────────────────────────────────────────────────────────

    private AutoBidDTOIN buildDto(int auctionId, double maxAmount) {
        AutoBidDTOIN dto = new AutoBidDTOIN();
        dto.setAuctionId(auctionId);
        dto.setMaxAmount(maxAmount);
        return dto;
    }

    private Buyer buildBuyer(int id, String username) {
        User user = new User();
        user.setId(id);
        user.setUsername(username);
        user.setEmail(username + "@example.com");
        Buyer buyer = new Buyer();
        buyer.setId(id);
        buyer.setUser(user);
        return buyer;
    }

    private Auction buildAuction() {
        Auction auction = new Auction();
        auction.setId(10);
        auction.setTitle("Test Auction");
        auction.setStartingPrice(100.0);
        auction.setCurrentPrice(100.0);
        auction.setStatus("ACTIVE");
        auction.setHighestBidder("");
        auction.setEndDate(LocalDateTime.now().plusDays(1));
        return auction;
    }

    private AutoBid buildAutoBid(Buyer buyer, Auction auction, double maxAmount) {
        AutoBid autoBid = new AutoBid();
        autoBid.setBuyer(buyer);
        autoBid.setAuction(auction);
        autoBid.setMaxAmount(maxAmount);
        autoBid.setActive(true);
        return autoBid;
    }
}
