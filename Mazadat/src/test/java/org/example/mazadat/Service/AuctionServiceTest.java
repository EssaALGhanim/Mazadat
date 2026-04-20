package org.example.mazadat.Service;

import org.example.mazadat.Model.Auction;
import org.example.mazadat.Repository.AuctionRepository;
import org.example.mazadat.Repository.SellerRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuctionServiceTest {

    @Mock
    private AuctionRepository auctionRepository;

    @Mock
    private SellerRepository sellerRepository;

    @Mock
    private ImageService imageService;

    @InjectMocks
    private AuctionService auctionService;

    @Test
    void searchAuctionsReturnsAllAuctionsWhenQueryBlank() {
        List<Auction> auctions = List.of(buildAuction("ACTIVE", LocalDateTime.now().plusDays(1), 200.0, 100.0));
        when(auctionRepository.findAll()).thenReturn(auctions);

        List<Auction> result = auctionService.searchAuctions("   ");

        assertEquals(1, result.size());
        verify(auctionRepository).findAll();
        verify(auctionRepository, never()).searchByQuery(anyString());
    }

    @Test
    void searchAuctionsUsesTrimmedQuery() {
        List<Auction> auctions = List.of(buildAuction("ACTIVE", LocalDateTime.now().plusDays(1), 200.0, 100.0));
        when(auctionRepository.searchByQuery("laptop")).thenReturn(auctions);

        List<Auction> result = auctionService.searchAuctions("  laptop  ");

        assertEquals(1, result.size());
        verify(auctionRepository).searchByQuery("laptop");
        verify(auctionRepository, never()).findAll();
    }

    @Test
    void searchAuctionsRefreshesEndedAuctionStatusAndClearsWinnerWhenReserveNotMet() {
        Auction auction = buildAuction("ACTIVE", LocalDateTime.now().minusMinutes(1), 50.0, 100.0);
        auction.setHighestBidder("buyer_one");
        auction.setHighestBidderEmail("buyer@example.com");

        when(auctionRepository.searchByQuery("car")).thenReturn(List.of(auction));

        List<Auction> result = auctionService.searchAuctions("car");

        assertEquals("FAILED_BELOW_RESERVE", result.get(0).getStatus());
        assertNull(result.get(0).getHighestBidder());
        assertNull(result.get(0).getHighestBidderEmail());
        verify(auctionRepository).saveAll(List.of(auction));
    }

    private Auction buildAuction(String status, LocalDateTime endDate, Double currentPrice, Double reservePrice) {
        Auction auction = new Auction();
        auction.setStatus(status);
        auction.setEndDate(endDate);
        auction.setCurrentPrice(currentPrice);
        auction.setReservePrice(reservePrice);
        return auction;
    }
}


