package org.example.mazadat.Service;

import java.util.Optional;

import org.example.mazadat.Api.ApiException;
import org.example.mazadat.DTOIN.AuctionHouseRatingDTOIN;
import org.example.mazadat.DTOOUT.RatingCheckDTOOUT;
import org.example.mazadat.Model.Auction;
import org.example.mazadat.Model.AuctionHouse;
import org.example.mazadat.Model.AuctionHouseRating;
import org.example.mazadat.Model.Buyer;
import org.example.mazadat.Model.User;
import org.example.mazadat.Repository.AuctionHouseRatingRepository;
import org.example.mazadat.Repository.AuctionHouseRepository;
import org.example.mazadat.Repository.AuctionRepository;
import org.example.mazadat.Repository.BuyerRepository;
import org.example.mazadat.Repository.SellerRepository;
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
class AuctionHouseRatingServiceTest {

    @Mock
    private AuctionHouseRepository auctionHouseRepository;

    @Mock
    private SellerRepository sellerRepository;

    @Mock
    private AuctionRepository auctionRepository;

    @Mock
    private BuyerRepository buyerRepository;

    @Mock
    private AuctionHouseRatingRepository auctionHouseRatingRepository;

    @InjectMocks
    private AuctionHouseService auctionHouseService;

    // ─── submitAuctionHouseRating ─────────────────────────────────────────────

    @Test
    void submitRatingSuccessfully() {
        when(buyerRepository.findById(1)).thenReturn(Optional.of(buildBuyer()));
        when(auctionRepository.findById(10)).thenReturn(Optional.of(buildAuction("buyer_one", 20)));
        when(auctionHouseRepository.findById(20)).thenReturn(Optional.of(buildAuctionHouse(20)));
        when(auctionHouseRatingRepository.findByBuyerIdAndAuctionId(1, 10)).thenReturn(Optional.empty());

        RatingCheckDTOOUT result = auctionHouseService.submitAuctionHouseRating(1, buildDto(10, 20, 4, "Good"));

        assertTrue(result.getRated());
        assertEquals(4, result.getRating());
        assertEquals("Good", result.getComment());
        verify(auctionHouseRatingRepository).save(any(AuctionHouseRating.class));
    }

    @Test
    void submitRatingThrowsWhenNotWinner() {
        Buyer buyer = buildBuyer(); // username = "buyer_one"
        Auction auction = buildAuction("other_buyer", 20); // different winner
        when(buyerRepository.findById(1)).thenReturn(Optional.of(buyer));
        when(auctionRepository.findById(10)).thenReturn(Optional.of(auction));

        ApiException ex = assertThrows(ApiException.class,
                () -> auctionHouseService.submitAuctionHouseRating(1, buildDto(10, 20, 5, null)));

        assertEquals("You did not win this auction", ex.getMessage());
        verify(auctionHouseRatingRepository, never()).save(any());
    }

    @Test
    void submitRatingThrowsWhenAlreadyRated() {
        when(buyerRepository.findById(1)).thenReturn(Optional.of(buildBuyer()));
        when(auctionRepository.findById(10)).thenReturn(Optional.of(buildAuction("buyer_one", 20)));
        when(auctionHouseRepository.findById(20)).thenReturn(Optional.of(buildAuctionHouse(20)));
        when(auctionHouseRatingRepository.findByBuyerIdAndAuctionId(1, 10))
                .thenReturn(Optional.of(new AuctionHouseRating()));

        ApiException ex = assertThrows(ApiException.class,
                () -> auctionHouseService.submitAuctionHouseRating(1, buildDto(10, 20, 3, null)));

        assertEquals("You have already rated this auction house for this auction", ex.getMessage());
        verify(auctionHouseRatingRepository, never()).save(any());
    }

    // ─── checkAuctionHouseRating ──────────────────────────────────────────────

    @Test
    void checkRatingReturnsRatedTrue() {
        AuctionHouseRating existing = new AuctionHouseRating();
        existing.setRating(5);
        existing.setComment("Excellent");
        when(auctionHouseRatingRepository.findByBuyerIdAndAuctionId(1, 10))
                .thenReturn(Optional.of(existing));

        RatingCheckDTOOUT result = auctionHouseService.checkAuctionHouseRating(1, 10);

        assertTrue(result.getRated());
        assertEquals(5, result.getRating());
        assertEquals("Excellent", result.getComment());
    }

    @Test
    void checkRatingReturnsRatedFalse() {
        when(auctionHouseRatingRepository.findByBuyerIdAndAuctionId(1, 10))
                .thenReturn(Optional.empty());

        RatingCheckDTOOUT result = auctionHouseService.checkAuctionHouseRating(1, 10);

        assertFalse(result.getRated());
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private Buyer buildBuyer() {
        User user = new User();
        user.setId(1);
        user.setUsername("buyer_one");

        Buyer buyer = new Buyer();
        buyer.setId(1);
        buyer.setUser(user);
        return buyer;
    }

    private Auction buildAuction(String highestBidder, Integer auctionHouseId) {
        AuctionHouse house = buildAuctionHouse(auctionHouseId);
        Auction auction = new Auction();
        auction.setId(10);
        auction.setHighestBidder(highestBidder);
        auction.setAuctionHouse(house);
        auction.setStatus("ENDED");
        return auction;
    }

    private AuctionHouse buildAuctionHouse(Integer id) {
        AuctionHouse house = new AuctionHouse();
        house.setId(id);
        house.setName("Test House");
        return house;
    }

    private AuctionHouseRatingDTOIN buildDto(Integer auctionId, Integer auctionHouseId,
                                              Integer rating, String comment) {
        AuctionHouseRatingDTOIN dto = new AuctionHouseRatingDTOIN();
        dto.setAuctionId(auctionId);
        dto.setAuctionHouseId(auctionHouseId);
        dto.setRating(rating);
        dto.setComment(comment);
        return dto;
    }
}
