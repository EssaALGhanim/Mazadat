package org.example.mazadat.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.example.mazadat.Api.ApiException;
import org.example.mazadat.Model.Auction;
import org.example.mazadat.Model.Buyer;
import org.example.mazadat.Model.User;
import org.example.mazadat.Model.Watchlist;
import org.example.mazadat.Repository.AuctionRepository;
import org.example.mazadat.Repository.BuyerRepository;
import org.example.mazadat.Repository.UserRepository;
import org.example.mazadat.Repository.WatchlistRepository;
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
class WatchlistServiceTest {

    @Mock
    private BuyerRepository buyerRepository;

    @Mock
    private AuctionRepository auctionRepository;

    @Mock
    private WatchlistRepository watchlistRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private BuyerService buyerService;

    @Test
    void addToWatchlistSuccessfully() {
        when(buyerRepository.findById(1)).thenReturn(Optional.of(buildBuyer()));
        when(auctionRepository.findById(10)).thenReturn(Optional.of(buildAuction()));
        when(watchlistRepository.existsByBuyerIdAndAuctionId(1, 10)).thenReturn(false);

        buyerService.addToWatchlist(1, 10);

        verify(watchlistRepository).save(any(Watchlist.class));
    }

    @Test
    void addToWatchlistThrowsWhenDuplicate() {
        when(buyerRepository.findById(1)).thenReturn(Optional.of(buildBuyer()));
        when(auctionRepository.findById(10)).thenReturn(Optional.of(buildAuction()));
        when(watchlistRepository.existsByBuyerIdAndAuctionId(1, 10)).thenReturn(true);

        ApiException exception = assertThrows(ApiException.class, () -> buyerService.addToWatchlist(1, 10));

        assertEquals("Auction already in watchlist", exception.getMessage());
        verify(watchlistRepository, never()).save(any(Watchlist.class));
    }

    @Test
    void addToWatchlistThrowsWhenAuctionNotFound() {
        when(buyerRepository.findById(1)).thenReturn(Optional.of(buildBuyer()));
        when(auctionRepository.findById(99)).thenReturn(Optional.empty());

        ApiException exception = assertThrows(ApiException.class, () -> buyerService.addToWatchlist(1, 99));

        assertEquals("Auction not found", exception.getMessage());
        verify(watchlistRepository, never()).save(any(Watchlist.class));
    }

    @Test
    void removeFromWatchlistSuccessfully() {
        Watchlist watchlist = buildWatchlistItem();
        when(watchlistRepository.findByBuyerIdAndAuctionId(1, 10)).thenReturn(Optional.of(watchlist));

        buyerService.removeFromWatchlist(1, 10);

        verify(watchlistRepository).delete(watchlist);
    }

    @Test
    void removeFromWatchlistThrowsWhenNotFound() {
        when(watchlistRepository.findByBuyerIdAndAuctionId(1, 10)).thenReturn(Optional.empty());

        ApiException exception = assertThrows(ApiException.class, () -> buyerService.removeFromWatchlist(1, 10));

        assertEquals("Watchlist item not found", exception.getMessage());
        verify(watchlistRepository, never()).delete(any(Watchlist.class));
    }

    @Test
    void getMyWatchlistReturnsMappedDTOs() {
        Watchlist item = buildWatchlistItem();
        when(watchlistRepository.findByBuyerId(1)).thenReturn(List.of(item));

        var result = buyerService.getMyWatchlist(1);

        assertEquals(1, result.size());
        assertEquals(10, result.get(0).getAuctionId());
        assertEquals("Test Auction", result.get(0).getAuctionTitle());
        assertEquals(200.0, result.get(0).getCurrentPrice());
        assertEquals("ACTIVE", result.get(0).getStatus());
    }

    private Buyer buildBuyer() {
        User user = new User();
        user.setId(1);
        user.setUsername("buyer_one");

        Buyer buyer = new Buyer();
        buyer.setId(1);
        buyer.setUser(user);
        return buyer;
    }

    private Auction buildAuction() {
        Auction auction = new Auction();
        auction.setId(10);
        auction.setTitle("Test Auction");
        auction.setStartingPrice(100.0);
        auction.setCurrentPrice(200.0);
        auction.setStatus("ACTIVE");
        auction.setEndDate(LocalDateTime.now().plusDays(1));
        return auction;
    }

    private Watchlist buildWatchlistItem() {
        Watchlist w = new Watchlist();
        w.setId(1);
        w.setBuyer(buildBuyer());
        w.setAuction(buildAuction());
        w.setAddedAt(LocalDateTime.now());
        return w;
    }
}
