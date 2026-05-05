package org.example.mazadat.Service;

import java.util.Optional;

import org.example.mazadat.Api.ApiException;
import org.example.mazadat.DTOIN.BuyerRatingDTOIN;
import org.example.mazadat.DTOOUT.RatingCheckDTOOUT;
import org.example.mazadat.Model.Auction;
import org.example.mazadat.Model.AuctionHouse;
import org.example.mazadat.Model.Buyer;
import org.example.mazadat.Model.BuyerRating;
import org.example.mazadat.Model.Seller;
import org.example.mazadat.Model.User;
import org.example.mazadat.Repository.AuctionRepository;
import org.example.mazadat.Repository.BuyerRepository;
import org.example.mazadat.Repository.BuyerRatingRepository;
import org.example.mazadat.Repository.SearchPreferenceRepository;
import org.example.mazadat.Repository.SellerRepository;
import org.example.mazadat.Repository.UserRepository;
import org.example.mazadat.Repository.WatchlistRepository;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
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
class BuyerRatingServiceTest {

    @Mock
    private BuyerRepository buyerRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AuctionRepository auctionRepository;

    @Mock
    private SearchPreferenceRepository searchPreferenceRepository;

    @Mock
    private WatchlistRepository watchlistRepository;

    @Mock
    private BuyerRatingRepository buyerRatingRepository;

    @Mock
    private SellerRepository sellerRepository;

    @InjectMocks
    private BuyerService buyerService;

    // ─── submitBuyerRating ────────────────────────────────────────────────────

    @Test
    void submitBuyerRatingSuccessfully() {
        Seller seller = buildSeller(1, 20);
        Auction auction = buildAuction(10, "buyer_one", "ENDED", 20);
        User winnerUser = buildUser(5, "buyer_one");
        Buyer winnerBuyer = buildBuyer(5, "buyer_one");

        when(sellerRepository.findSellerById(1)).thenReturn(seller);
        when(auctionRepository.findById(10)).thenReturn(Optional.of(auction));
        when(userRepository.findUserByUsername("buyer_one")).thenReturn(winnerUser);
        when(buyerRepository.findById(5)).thenReturn(Optional.of(winnerBuyer));
        when(buyerRatingRepository.findByAuctionId(10)).thenReturn(Optional.empty());

        RatingCheckDTOOUT result = buyerService.submitBuyerRating(1, buildDto(10, 4, "Good buyer"));

        assertTrue(result.getRated());
        assertEquals(4, result.getRating());
        assertEquals("Good buyer", result.getComment());
        verify(buyerRatingRepository).save(any(BuyerRating.class));
    }

    @Test
    void submitBuyerRatingThrowsWhenAuctionNotEnded() {
        Seller seller = buildSeller(1, 20);
        Auction auction = buildAuction(10, "buyer_one", "ACTIVE", 20);

        when(sellerRepository.findSellerById(1)).thenReturn(seller);
        when(auctionRepository.findById(10)).thenReturn(Optional.of(auction));

        ApiException ex = assertThrows(ApiException.class,
                () -> buyerService.submitBuyerRating(1, buildDto(10, 5, null)));

        assertEquals("Auction has not ended yet", ex.getMessage());
        verify(buyerRatingRepository, never()).save(any());
    }

    @Test
    void submitBuyerRatingThrowsWhenSellerNotAuthorized() {
        // seller belongs to house 99, auction belongs to house 20
        Seller seller = buildSeller(1, 99);
        Auction auction = buildAuction(10, "buyer_one", "ENDED", 20);

        when(sellerRepository.findSellerById(1)).thenReturn(seller);
        when(auctionRepository.findById(10)).thenReturn(Optional.of(auction));

        ApiException ex = assertThrows(ApiException.class,
                () -> buyerService.submitBuyerRating(1, buildDto(10, 3, null)));

        assertEquals("You are not authorized to rate buyers for this auction", ex.getMessage());
        verify(buyerRatingRepository, never()).save(any());
    }

    @Test
    void submitBuyerRatingThrowsWhenAlreadyRated() {
        Seller seller = buildSeller(1, 20);
        Auction auction = buildAuction(10, "buyer_one", "ENDED", 20);
        User winnerUser = buildUser(5, "buyer_one");
        Buyer winnerBuyer = buildBuyer(5, "buyer_one");

        when(sellerRepository.findSellerById(1)).thenReturn(seller);
        when(auctionRepository.findById(10)).thenReturn(Optional.of(auction));
        when(userRepository.findUserByUsername("buyer_one")).thenReturn(winnerUser);
        when(buyerRepository.findById(5)).thenReturn(Optional.of(winnerBuyer));
        when(buyerRatingRepository.findByAuctionId(10)).thenReturn(Optional.of(new BuyerRating()));

        ApiException ex = assertThrows(ApiException.class,
                () -> buyerService.submitBuyerRating(1, buildDto(10, 5, null)));

        assertEquals("This auction has already been rated", ex.getMessage());
        verify(buyerRatingRepository, never()).save(any());
    }

    // ─── checkBuyerRating ─────────────────────────────────────────────────────

    @Test
    void checkBuyerRatingReturnsFalseWhenNotRated() {
        when(buyerRatingRepository.findByAuctionId(10)).thenReturn(Optional.empty());

        RatingCheckDTOOUT result = buyerService.checkBuyerRating(10);

        assertFalse(result.getRated());
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private Seller buildSeller(Integer id, Integer auctionHouseId) {
        AuctionHouse house = new AuctionHouse();
        house.setId(auctionHouseId);

        User user = new User();
        user.setId(id);

        Seller seller = new Seller();
        seller.setId(id);
        seller.setUser(user);
        seller.setAuctionHouse(house);
        return seller;
    }

    private Auction buildAuction(Integer id, String highestBidder, String status, Integer auctionHouseId) {
        AuctionHouse house = new AuctionHouse();
        house.setId(auctionHouseId);

        Auction auction = new Auction();
        auction.setId(id);
        auction.setHighestBidder(highestBidder);
        auction.setStatus(status);
        auction.setAuctionHouse(house);
        return auction;
    }

    private User buildUser(Integer id, String username) {
        User user = new User();
        user.setId(id);
        user.setUsername(username);
        return user;
    }

    private Buyer buildBuyer(Integer id, String username) {
        User user = buildUser(id, username);
        Buyer buyer = new Buyer();
        buyer.setId(id);
        buyer.setUser(user);
        return buyer;
    }

    private BuyerRatingDTOIN buildDto(Integer auctionId, Integer rating, String comment) {
        BuyerRatingDTOIN dto = new BuyerRatingDTOIN();
        dto.setAuctionId(auctionId);
        dto.setRating(rating);
        dto.setComment(comment);
        return dto;
    }
}
