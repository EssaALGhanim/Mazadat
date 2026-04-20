package org.example.mazadat.Service;

import java.util.List;
import java.util.Optional;

import org.example.mazadat.Api.ApiException;
import org.example.mazadat.DTOIN.SearchPreferenceDTOIN;
import org.example.mazadat.DTOOUT.SearchPreferenceDTOOUT;
import org.example.mazadat.Model.Auction;
import org.example.mazadat.Model.Buyer;
import org.example.mazadat.Model.SearchPreference;
import org.example.mazadat.Model.User;
import org.example.mazadat.Repository.AuctionRepository;
import org.example.mazadat.Repository.BuyerRepository;
import org.example.mazadat.Repository.SearchPreferenceRepository;
import org.example.mazadat.Repository.UserRepository;
import static org.junit.jupiter.api.Assertions.assertEquals;
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
class SearchPreferenceServiceTest {

    @Mock
    private BuyerRepository buyerRepository;

    @Mock
    private AuctionRepository auctionRepository;

    @Mock
    private SearchPreferenceRepository searchPreferenceRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private BuyerService buyerService;

    @Test
    void saveSearchPreferenceSuccessfully() {
        when(buyerRepository.findById(1)).thenReturn(Optional.of(buildBuyer()));
        when(searchPreferenceRepository.save(any(SearchPreference.class))).thenAnswer(inv -> inv.getArgument(0));

        SearchPreferenceDTOIN dto = buildDto("Watches", "watch", 100.0, 500.0, "ACTIVE");
        SearchPreferenceDTOOUT result = buyerService.saveSearchPreference(1, dto);

        assertEquals("Watches", result.getName());
        assertEquals("watch", result.getKeyword());
        assertEquals(100.0, result.getMinPrice());
        assertEquals(500.0, result.getMaxPrice());
        assertEquals("ACTIVE", result.getStatus());
        verify(searchPreferenceRepository).save(any(SearchPreference.class));
    }

    @Test
    void saveSearchPreferenceThrowsWhenMinGreaterThanMax() {
        when(buyerRepository.findById(1)).thenReturn(Optional.of(buildBuyer()));

        SearchPreferenceDTOIN dto = buildDto("Bad Range", null, 1000.0, 100.0, null);
        ApiException exception = assertThrows(ApiException.class, () -> buyerService.saveSearchPreference(1, dto));

        assertEquals("Min price cannot be greater than max price", exception.getMessage());
        verify(searchPreferenceRepository, never()).save(any(SearchPreference.class));
    }

    @Test
    void getMySearchPreferencesReturnsAll() {
        SearchPreference p = buildPreference("Luxury Cars", "car", 5000.0, 50000.0, "ACTIVE");
        when(searchPreferenceRepository.findByBuyerId(1)).thenReturn(List.of(p));

        List<SearchPreferenceDTOOUT> result = buyerService.getMySearchPreferences(1);

        assertEquals(1, result.size());
        assertEquals("Luxury Cars", result.get(0).getName());
    }

    @Test
    void deleteSearchPreferenceSuccessfully() {
        SearchPreference p = buildPreference("Old Pref", null, null, null, null);
        when(searchPreferenceRepository.findByIdAndBuyerId(5, 1)).thenReturn(Optional.of(p));

        buyerService.deleteSearchPreference(1, 5);

        verify(searchPreferenceRepository).delete(p);
    }

    @Test
    void deleteSearchPreferenceThrowsWhenNotOwned() {
        when(searchPreferenceRepository.findByIdAndBuyerId(5, 1)).thenReturn(Optional.empty());

        ApiException exception = assertThrows(ApiException.class, () -> buyerService.deleteSearchPreference(1, 5));

        assertEquals("Search preference not found", exception.getMessage());
    }

    @Test
    void applySearchPreferenceFiltersAuctionsByKeyword() {
        SearchPreference p = buildPreference("Watch Search", "watch", null, null, null);
        when(searchPreferenceRepository.findByIdAndBuyerId(1, 1)).thenReturn(Optional.of(p));
        when(auctionRepository.findAll()).thenReturn(List.of(
                buildAuction(1, "Vintage Watch", "Nice old watch", 200.0, "ACTIVE"),
                buildAuction(2, "Modern Laptop", "Fast computer", 1500.0, "ACTIVE")
        ));

        List<Auction> result = buyerService.applySearchPreference(1, 1);

        assertEquals(1, result.size());
        assertEquals("Vintage Watch", result.get(0).getTitle());
    }

    @Test
    void applySearchPreferenceFiltersAuctionsByPriceRange() {
        SearchPreference p = buildPreference("Mid Range", null, 100.0, 500.0, null);
        when(searchPreferenceRepository.findByIdAndBuyerId(1, 1)).thenReturn(Optional.of(p));
        when(auctionRepository.findAll()).thenReturn(List.of(
                buildAuction(1, "Item A", null, 250.0, "ACTIVE"),
                buildAuction(2, "Item B", null, 800.0, "ACTIVE"),
                buildAuction(3, "Item C", null, 50.0, "ACTIVE")
        ));

        List<Auction> result = buyerService.applySearchPreference(1, 1);

        assertEquals(1, result.size());
        assertEquals("Item A", result.get(0).getTitle());
    }

    @Test
    void applySearchPreferenceFiltersAuctionsByStatus() {
        SearchPreference p = buildPreference("Active Only", null, null, null, "ACTIVE");
        when(searchPreferenceRepository.findByIdAndBuyerId(1, 1)).thenReturn(Optional.of(p));
        when(auctionRepository.findAll()).thenReturn(List.of(
                buildAuction(1, "Item A", null, 100.0, "ACTIVE"),
                buildAuction(2, "Item B", null, 200.0, "PENDING"),
                buildAuction(3, "Item C", null, 300.0, "ENDED")
        ));

        List<Auction> result = buyerService.applySearchPreference(1, 1);

        assertEquals(1, result.size());
        assertEquals("Item A", result.get(0).getTitle());
    }

    @Test
    void applySearchPreferenceReturnsEmptyWhenNoMatch() {
        SearchPreference p = buildPreference("No Match", "xyz123notexist", null, null, null);
        when(searchPreferenceRepository.findByIdAndBuyerId(1, 1)).thenReturn(Optional.of(p));
        when(auctionRepository.findAll()).thenReturn(List.of(
                buildAuction(1, "Watch", "Nice item", 200.0, "ACTIVE")
        ));

        List<Auction> result = buyerService.applySearchPreference(1, 1);

        assertTrue(result.isEmpty());
    }

    private SearchPreferenceDTOIN buildDto(String name, String keyword, Double minPrice, Double maxPrice, String status) {
        SearchPreferenceDTOIN dto = new SearchPreferenceDTOIN();
        dto.setName(name);
        dto.setKeyword(keyword);
        dto.setMinPrice(minPrice);
        dto.setMaxPrice(maxPrice);
        dto.setStatus(status);
        return dto;
    }

    private SearchPreference buildPreference(String name, String keyword, Double minPrice, Double maxPrice, String status) {
        SearchPreference p = new SearchPreference();
        p.setId(1);
        p.setName(name);
        p.setKeyword(keyword);
        p.setMinPrice(minPrice);
        p.setMaxPrice(maxPrice);
        p.setStatus(status);
        p.setBuyer(buildBuyer());
        return p;
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

    private Auction buildAuction(int id, String title, String description, Double currentPrice, String status) {
        Auction auction = new Auction();
        auction.setId(id);
        auction.setTitle(title);
        auction.setDescription(description);
        auction.setCurrentPrice(currentPrice);
        auction.setStatus(status);
        return auction;
    }
}
