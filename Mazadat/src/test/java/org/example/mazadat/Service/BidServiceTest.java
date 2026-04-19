package org.example.mazadat.Service;

import java.time.LocalDateTime;
import java.util.Optional;

import org.example.mazadat.Api.ApiException;
import org.example.mazadat.DTOIN.BidDTOIN;
import org.example.mazadat.Model.Auction;
import org.example.mazadat.Model.Bid;
import org.example.mazadat.Model.Buyer;
import org.example.mazadat.Model.User;
import org.example.mazadat.Repository.AuctionRepository;
import org.example.mazadat.Repository.BidRepository;
import org.example.mazadat.Repository.BuyerRepository;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class BidServiceTest {

    @Mock
    private BidRepository bidRepository;

    @Mock
    private AuctionRepository auctionRepository;

    @Mock
    private BuyerRepository buyerRepository;

    @Mock
    private AutoBidService autoBidService;

    @InjectMocks
    private BidService bidService;

    @Test
    void addBidRejectsFirstBidBelowStartingPrice() {
        Buyer buyer = buildBuyer();
        Auction auction = buildAuction();
        BidDTOIN dto = buildBidRequest(99.99);

        when(buyerRepository.findById(1)).thenReturn(Optional.of(buyer));
        when(auctionRepository.findById(10)).thenReturn(Optional.of(auction));
        when(bidRepository.findTopByAuctionIdOrderByAmountDescPlacedAtDesc(10)).thenReturn(Optional.empty());

        ApiException exception = assertThrows(ApiException.class, () -> bidService.addBid(dto, 1));

        assertEquals("First bid must be at least the starting price. Minimum allowed: 100.0", exception.getMessage());
        verify(bidRepository, never()).save(any(Bid.class));
    }

    @Test
    void addBidAcceptsFirstBidAtStartingPrice() {
        Buyer buyer = buildBuyer();
        Auction auction = buildAuction();
        BidDTOIN dto = buildBidRequest(100.00);

        when(buyerRepository.findById(1)).thenReturn(Optional.of(buyer));
        when(auctionRepository.findById(10)).thenReturn(Optional.of(auction));
        when(bidRepository.findTopByAuctionIdOrderByAmountDescPlacedAtDesc(10)).thenReturn(Optional.empty());

        bidService.addBid(dto, 1);

        verify(bidRepository).save(any(Bid.class));
        verify(auctionRepository).save(auction);
        assertEquals(100.0, auction.getCurrentPrice());
        assertEquals("buyer_one", auction.getHighestBidder());
        assertEquals("buyer@example.com", auction.getHighestBidderEmail());
    }

    @Test
    void addBidRejectsBidBelowFivePercentOfHighestBid() {
        Buyer buyer = buildBuyer();
        Auction auction = buildAuction();
        Bid highest = new Bid();
        highest.setAmount(200.0);
        BidDTOIN dto = buildBidRequest(209.99);

        when(buyerRepository.findById(1)).thenReturn(Optional.of(buyer));
        when(auctionRepository.findById(10)).thenReturn(Optional.of(auction));
        when(bidRepository.findTopByAuctionIdOrderByAmountDescPlacedAtDesc(10)).thenReturn(Optional.of(highest));

        ApiException exception = assertThrows(ApiException.class, () -> bidService.addBid(dto, 1));

        assertEquals("Bid must be at least 5% higher than the previous highest bid. Minimum allowed: 210.0", exception.getMessage());
        verify(bidRepository, never()).save(any(Bid.class));
    }

    @Test
    void addBidAcceptsBidAtFivePercentOfHighestBid() {
        Buyer buyer = buildBuyer();
        Auction auction = buildAuction();
        Bid highest = new Bid();
        highest.setAmount(200.0);
        BidDTOIN dto = buildBidRequest(210.0);

        when(buyerRepository.findById(1)).thenReturn(Optional.of(buyer));
        when(auctionRepository.findById(10)).thenReturn(Optional.of(auction));
        when(bidRepository.findTopByAuctionIdOrderByAmountDescPlacedAtDesc(10)).thenReturn(Optional.of(highest));

        bidService.addBid(dto, 1);

        verify(bidRepository).save(any(Bid.class));
        verify(auctionRepository).save(auction);
        assertEquals(210.0, auction.getCurrentPrice());
    }

    private BidDTOIN buildBidRequest(double amount) {
        BidDTOIN bidDTOIN = new BidDTOIN();
        bidDTOIN.setAuctionId(10);
        bidDTOIN.setAmount(amount);
        return bidDTOIN;
    }

    private Auction buildAuction() {
        Auction auction = new Auction();
        auction.setId(10);
        auction.setStartingPrice(100.0);
        auction.setCurrentPrice(100.0);
        auction.setStatus("ACTIVE");
        auction.setEndDate(LocalDateTime.now().plusDays(1));
        return auction;
    }

    private Buyer buildBuyer() {
        User user = new User();
        user.setId(1);
        user.setUsername("buyer_one");
        user.setEmail("buyer@example.com");

        Buyer buyer = new Buyer();
        buyer.setId(1);
        buyer.setUser(user);
        return buyer;
    }
}

