package org.example.mazadat.Service;

import java.util.List;

import org.example.mazadat.Api.ApiException;
import org.example.mazadat.DTOIN.BuyerDTOIN;
import org.example.mazadat.DTOIN.BuyerUpdateDTOIN;
import org.example.mazadat.DTOIN.SearchPreferenceDTOIN;
import org.example.mazadat.DTOOUT.SearchPreferenceDTOOUT;
import org.example.mazadat.DTOOUT.WatchlistDTOOUT;
import org.example.mazadat.Model.Auction;
import org.example.mazadat.Model.Buyer;
import org.example.mazadat.Model.SearchPreference;
import org.example.mazadat.Model.User;
import org.example.mazadat.Model.Watchlist;
import org.example.mazadat.Repository.AuctionRepository;
import org.example.mazadat.Repository.BuyerRepository;
import org.example.mazadat.Repository.SearchPreferenceRepository;
import org.example.mazadat.Repository.UserRepository;
import org.example.mazadat.Repository.WatchlistRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BuyerService {

    private final BuyerRepository buyerRepository;
    private final UserRepository userRepository;
    private final AuctionRepository auctionRepository;
    private final SearchPreferenceRepository searchPreferenceRepository;
    private final WatchlistRepository watchlistRepository;


    public void addBuyer(BuyerDTOIN buyerDTOIN){

        if (userRepository.existsByUsername(buyerDTOIN.getUsername())) {
            throw new ApiException("Username already exists");
        }
        if (userRepository.existsByEmail(buyerDTOIN.getEmail())) {
            throw new ApiException("Email already exists");
        }

        User user = new User();
        user.setUsername(buyerDTOIN.getUsername());
        user.setEmail(buyerDTOIN.getEmail());
        String hashedPassword = new BCryptPasswordEncoder().encode(buyerDTOIN.getPassword());
        user.setPassword(hashedPassword);
        user.setPhoneNumber(buyerDTOIN.getPhoneNumber());
        user.setRole("BUYER");

        Buyer buyer = new Buyer();
        buyer.setUser(user);

        userRepository.save(user);
        buyerRepository.save(buyer);

    }

    public Buyer getCurrentBuyer(Integer buyerId) {
        Buyer buyer = buyerRepository.findById(buyerId).orElse(null);
        if (buyer == null) {
            throw new ApiException("Buyer not found");
        }
        return buyer;
    }

    public void updateBuyer(BuyerUpdateDTOIN buyerDTOIN, Integer buyerId) {
        Buyer buyer = buyerRepository.findById(buyerId).orElse(null);
        if (buyer == null) {
            throw new ApiException("Buyer not found");
        }

        User user = buyer.getUser();

        boolean hasAnyField = false;

        if (StringUtils.hasText(buyerDTOIN.getUsername())) {
            User userWithSameUsername = userRepository.findUserByUsername(buyerDTOIN.getUsername());
            if (userWithSameUsername != null && !userWithSameUsername.getId().equals(user.getId())) {
                throw new ApiException("Username already exists");
            }
            user.setUsername(buyerDTOIN.getUsername());
            hasAnyField = true;
        }

        if (StringUtils.hasText(buyerDTOIN.getEmail())) {
            User userWithSameEmail = userRepository.findUserByEmail(buyerDTOIN.getEmail());
            if (userWithSameEmail != null && !userWithSameEmail.getId().equals(user.getId())) {
                throw new ApiException("Email already exists");
            }
            user.setEmail(buyerDTOIN.getEmail());
            hasAnyField = true;
        }

        if (StringUtils.hasText(buyerDTOIN.getPhoneNumber())) {
            user.setPhoneNumber(buyerDTOIN.getPhoneNumber());
            hasAnyField = true;
        }

        if (StringUtils.hasText(buyerDTOIN.getPassword())) {
            user.setPassword(new BCryptPasswordEncoder().encode(buyerDTOIN.getPassword()));
            hasAnyField = true;
        }

        if (!hasAnyField) {
            throw new ApiException("No fields provided for update");
        }

        userRepository.save(user);
        buyerRepository.save(buyer);
    }

    public SearchPreferenceDTOOUT saveSearchPreference(Integer buyerId, SearchPreferenceDTOIN dto) {
        Buyer buyer = buyerRepository.findById(buyerId).orElse(null);
        if (buyer == null) {
            throw new ApiException("Buyer not found");
        }

        if (dto.getMinPrice() != null && dto.getMaxPrice() != null && dto.getMinPrice() > dto.getMaxPrice()) {
            throw new ApiException("Min price cannot be greater than max price");
        }

        SearchPreference preference = new SearchPreference();
        preference.setBuyer(buyer);
        preference.setName(dto.getName());
        preference.setKeyword(dto.getKeyword());
        preference.setMinPrice(dto.getMinPrice());
        preference.setMaxPrice(dto.getMaxPrice());
        preference.setStatus(dto.getStatus());
        searchPreferenceRepository.save(preference);

        return toSearchPreferenceDto(preference);
    }

    public List<SearchPreferenceDTOOUT> getMySearchPreferences(Integer buyerId) {
        return searchPreferenceRepository.findByBuyerId(buyerId)
                .stream()
                .map(this::toSearchPreferenceDto)
                .toList();
    }

    public void deleteSearchPreference(Integer buyerId, Integer preferenceId) {
        SearchPreference preference = searchPreferenceRepository.findByIdAndBuyerId(preferenceId, buyerId)
                .orElseThrow(() -> new ApiException("Search preference not found"));
        searchPreferenceRepository.delete(preference);
    }

    public List<Auction> applySearchPreference(Integer buyerId, Integer preferenceId) {
        SearchPreference preference = searchPreferenceRepository.findByIdAndBuyerId(preferenceId, buyerId)
                .orElseThrow(() -> new ApiException("Search preference not found"));

        return auctionRepository.findAll().stream()
                .filter(a -> {
                    if (preference.getKeyword() != null && !preference.getKeyword().isBlank()) {
                        String kw = preference.getKeyword().toLowerCase();
                        boolean titleMatch = a.getTitle() != null && a.getTitle().toLowerCase().contains(kw);
                        boolean descMatch = a.getDescription() != null && a.getDescription().toLowerCase().contains(kw);
                        if (!titleMatch && !descMatch) return false;
                    }
                    if (preference.getMinPrice() != null && a.getCurrentPrice() != null
                            && a.getCurrentPrice() < preference.getMinPrice()) return false;
                    if (preference.getMaxPrice() != null && a.getCurrentPrice() != null
                            && a.getCurrentPrice() > preference.getMaxPrice()) return false;
                    if (preference.getStatus() != null && !preference.getStatus().isBlank()
                            && !preference.getStatus().equalsIgnoreCase(a.getStatus())) return false;
                    return true;
                })
                .toList();
    }

    private SearchPreferenceDTOOUT toSearchPreferenceDto(SearchPreference p) {
        return new SearchPreferenceDTOOUT(
                p.getId(),
                p.getName(),
                p.getKeyword(),
                p.getMinPrice(),
                p.getMaxPrice(),
                p.getStatus(),
                p.getCreatedAt()
        );
    }

    public void addToWatchlist(Integer buyerId, Integer auctionId) {
        Buyer buyer = buyerRepository.findById(buyerId)
                .orElseThrow(() -> new ApiException("Buyer not found"));
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new ApiException("Auction not found"));

        if (watchlistRepository.existsByBuyerIdAndAuctionId(buyerId, auctionId)) {
            throw new ApiException("Auction already in watchlist");
        }

        Watchlist watchlist = new Watchlist();
        watchlist.setBuyer(buyer);
        watchlist.setAuction(auction);
        watchlistRepository.save(watchlist);
    }

    public void removeFromWatchlist(Integer buyerId, Integer auctionId) {
        Watchlist watchlist = watchlistRepository.findByBuyerIdAndAuctionId(buyerId, auctionId)
                .orElseThrow(() -> new ApiException("Watchlist item not found"));
        watchlistRepository.delete(watchlist);
    }

    public List<WatchlistDTOOUT> getMyWatchlist(Integer buyerId) {
        return watchlistRepository.findByBuyerId(buyerId)
                .stream()
                .map(w -> new WatchlistDTOOUT(
                        w.getId(),
                        w.getAuction().getId(),
                        w.getAuction().getTitle(),
                        w.getAuction().getCurrentPrice(),
                        w.getAuction().getStatus(),
                        w.getAuction().getEndDate(),
                        w.getAddedAt()
                ))
                .toList();
    }
}
