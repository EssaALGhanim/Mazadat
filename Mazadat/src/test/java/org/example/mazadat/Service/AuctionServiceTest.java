package org.example.mazadat.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.example.mazadat.Api.ApiException;
import org.example.mazadat.Model.Auction;
import org.example.mazadat.Model.Seller;
import org.example.mazadat.Repository.AuctionRepository;
import org.example.mazadat.Repository.SellerRepository;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.anyString;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

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

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(auctionService, "frontendBaseUrl", "http://localhost:5173");
    }

    // ─── searchAuctions ───────────────────────────────────────────────────────

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

    // ─── getShareLinks ────────────────────────────────────────────────────────

    @Test
    void getShareLinksThrowsWhenSellerNotFound() {
        when(sellerRepository.findById(99)).thenReturn(Optional.empty());

        ApiException ex = assertThrows(ApiException.class,
                () -> auctionService.getShareLinks(1, 99));

        assertEquals("Seller not found", ex.getMessage());
    }

    @Test
    void getShareLinksThrowsWhenAuctionNotFound() {
        when(sellerRepository.findById(1)).thenReturn(Optional.of(buildSeller(1)));
        when(auctionRepository.findById(99)).thenReturn(Optional.empty());

        ApiException ex = assertThrows(ApiException.class,
                () -> auctionService.getShareLinks(99, 1));

        assertEquals("Auction not found", ex.getMessage());
    }

    @Test
    void getShareLinksThrowsWhenAuctionNotOwnedBySeller() {
        when(sellerRepository.findById(2)).thenReturn(Optional.of(buildSeller(2)));
        when(auctionRepository.findById(1)).thenReturn(Optional.of(buildAuctionWithSeller(1, "My Auction", 1)));

        ApiException ex = assertThrows(ApiException.class,
                () -> auctionService.getShareLinks(1, 2));

        assertEquals("Auction does not belong to you", ex.getMessage());
    }

    @Test
    void getShareLinksReturnsAllFivePlatformKeys() {
        when(sellerRepository.findById(1)).thenReturn(Optional.of(buildSeller(1)));
        when(auctionRepository.findById(5)).thenReturn(Optional.of(buildAuctionWithSeller(5, "Vintage Watch", 1)));

        Map<String, String> links = auctionService.getShareLinks(5, 1);

        assertEquals(5, links.size());
        assertTrue(links.containsKey("directLink"));
        assertTrue(links.containsKey("whatsapp"));
        assertTrue(links.containsKey("twitter"));
        assertTrue(links.containsKey("snapchat"));
        assertTrue(links.containsKey("telegram"));
        assertTrue(links.get("directLink").endsWith("/auction/5"));
        assertTrue(links.get("whatsapp").startsWith("https://wa.me/"));
        assertTrue(links.get("twitter").startsWith("https://twitter.com/"));
        assertTrue(links.get("snapchat").startsWith("https://www.snapchat.com/"));
        assertTrue(links.get("telegram").startsWith("https://t.me/"));
    }

    private Seller buildSeller(int id) {
        Seller seller = new Seller();
        seller.setId(id);
        return seller;
    }

    private Auction buildAuctionWithSeller(int auctionId, String title, int sellerId) {
        Seller seller = buildSeller(sellerId);
        Auction auction = new Auction();
        auction.setId(auctionId);
        auction.setTitle(title);
        auction.setSeller(seller);
        return auction;
    }
}


