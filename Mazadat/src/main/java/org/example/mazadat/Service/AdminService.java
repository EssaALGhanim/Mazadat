package org.example.mazadat.Service;

import lombok.RequiredArgsConstructor;
import org.example.mazadat.Api.ApiException;
import org.example.mazadat.Model.*;
import org.example.mazadat.Repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final BuyerRepository buyerRepository;
    private final SellerRepository sellerRepository;
    private final AuctionRepository auctionRepository;
    private final AuctionHouseRepository auctionHouseRepository;
    private final BidRepository bidRepository;
    private final AutoBidRepository autoBidRepository;
    private final AuctionHouseRatingRepository auctionHouseRatingRepository;
    private final BuyerRatingRepository buyerRatingRepository;
    private final NotificationRepository notificationRepository;
    private final WatchlistRepository watchlistRepository;
    private final SearchPreferenceRepository searchPreferenceRepository;
    private final ImageService imageService;
    private final ReportRepository reportRepository;

    public User getAdminUserById(Integer userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ApiException("User not found"));
    }

    /**
     * Returns a warning payload if deleting this user would also delete an auction house
     * because they are its sole admin.
     */
    public Map<String, Object> getUserDeletionWarning(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException("User not found"));

        if ("ADMIN".equals(user.getRole())) {
            throw new ApiException("Platform admins cannot be deleted through the admin dashboard.");
        }

        Map<String, Object> result = new HashMap<>();
        result.put("hasWarning", false);

        if (!"SELLER".equals(user.getRole())) {
            return result;
        }

        Seller seller = sellerRepository.findSellerById(userId);
        if (seller == null || seller.getAuctionHouse() == null || !Boolean.TRUE.equals(seller.getIsAdmin())) {
            return result;
        }

        Set<Seller> otherAdmins = sellerRepository.findOtherAuctionHouseAdmins(seller.getAuctionHouse(), seller);
        if (otherAdmins.isEmpty()) {
            result.put("hasWarning", true);
            result.put("auctionHouseName", seller.getAuctionHouse().getName());
            result.put("auctionHouseId", seller.getAuctionHouse().getId());
            result.put("message",
                    "Deleting this seller will also permanently delete the auction house \""
                    + seller.getAuctionHouse().getName()
                    + "\" and all its auctions, because this user is its only admin.");
        }

        return result;
    }

    @Transactional
    public void deleteUser(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException("User not found"));

        if ("ADMIN".equals(user.getRole())) {
            throw new ApiException("Platform admins cannot be deleted through the admin dashboard.");
        }

        notificationRepository.deleteByUserId(userId);
        reportRepository.nullifyReporterReference(userId);

        if ("BUYER".equals(user.getRole())) {
            deleteBuyerData(user);
        } else if ("SELLER".equals(user.getRole())) {
            deleteSellerData(user);
        }

        userRepository.delete(user);
    }

    // ── Buyer deletion ────────────────────────────────────────────────────────

    private void deleteBuyerData(User user) {
        Buyer buyer = buyerRepository.findById(user.getId()).orElse(null);
        if (buyer == null) return;

        Integer buyerId = buyer.getId();

        // 1. Reassign active auctions where this buyer is the current highest bidder
        reassignAuctionsFromDeletedBuyer(buyer);

        // 2. Nullify buyer FK on winning bids (bids linked to a Receipt) to preserve audit trail
        preserveWinningBids(buyer);

        // 3. Delete all orphan data referencing this buyer (no cascade from Buyer entity)
        watchlistRepository.deleteByBuyerId(buyerId);
        searchPreferenceRepository.deleteByBuyerId(buyerId);
        autoBidRepository.deleteByBuyerId(buyerId);
        auctionHouseRatingRepository.deleteByBuyerId(buyerId);
        buyerRatingRepository.deleteByBuyerId(buyerId);
    }

    private void reassignAuctionsFromDeletedBuyer(Buyer buyer) {
        String username = buyer.getUser() != null ? buyer.getUser().getUsername() : null;
        if (username == null) return;

        List<Auction> affectedAuctions = auctionRepository.findActiveAuctionsByHighestBidder(username);
        for (Auction auction : affectedAuctions) {
            List<Bid> remainingBids = bidRepository.findTopBidsExcludingBuyer(auction.getId(), buyer.getId());
            if (!remainingBids.isEmpty()) {
                Bid newHighest = remainingBids.get(0);
                auction.setCurrentPrice(newHighest.getAmount());
                auction.setHighestBidder(newHighest.getBuyer().getUser().getUsername());
                auction.setHighestBidderEmail(newHighest.getBuyer().getUser().getEmail());
            } else {
                auction.setCurrentPrice(auction.getStartingPrice());
                auction.setHighestBidder(null);
                auction.setHighestBidderEmail(null);
            }
            auctionRepository.save(auction);
        }
    }

    private void preserveWinningBids(Buyer buyer) {
        List<Bid> winningBids = bidRepository.findWinningBidsByBuyerId(buyer.getId());
        for (Bid bid : winningBids) {
            // Detach from buyer so cascade-remove on the buyer entity does not delete them
            if (buyer.getBids() != null) {
                buyer.getBids().remove(bid);
            }
            bid.setBuyer(null);
            bidRepository.save(bid);
        }
    }

    // ── Seller deletion ───────────────────────────────────────────────────────

    private void deleteSellerData(User user) {
        Seller seller = sellerRepository.findSellerById(user.getId());
        if (seller == null) return;

        AuctionHouse auctionHouse = seller.getAuctionHouse();

        if (auctionHouse != null && Boolean.TRUE.equals(seller.getIsAdmin())) {
            Set<Seller> otherAdmins = sellerRepository.findOtherAuctionHouseAdmins(auctionHouse, seller);

            if (otherAdmins.isEmpty()) {
                // This seller is the last admin — delete the entire auction house
                deleteAuctionHouseAndContents(auctionHouse, seller);
                return;
            }
        }

        // Either not in a house, not an admin, or there are other admins
        deleteSellerOwnedAuctions(seller);

        if (auctionHouse != null) {
            seller.setAuctionHouse(null);
            seller.setIsAdmin(false);
            sellerRepository.save(seller);
        }

        buyerRatingRepository.deleteBySellerId(seller.getId());
    }

    private void deleteAuctionHouseAndContents(AuctionHouse auctionHouse, Seller deletingSeller) {
        // Detach all other sellers from the house so cascade on AuctionHouse.sellers
        // does not delete them when the house is deleted
        List<Seller> allMembers = sellerRepository.findByAuctionHouseId(auctionHouse.getId());
        for (Seller member : allMembers) {
            if (!member.getId().equals(deletingSeller.getId())) {
                member.setAuctionHouse(null);
                member.setIsAdmin(false);
                sellerRepository.save(member);
            }
        }

        // Delete all auctions in the house (with their dependent data)
        for (Auction auction : auctionHouse.getAuctions()) {
            deleteAuctionDependencies(auction.getId());
        }

        // Detach the deleting seller from the house (User cascade will delete the Seller later)
        deletingSeller.setAuctionHouse(null);
        sellerRepository.save(deletingSeller);

        buyerRatingRepository.deleteBySellerId(deletingSeller.getId());

        auctionHouseRepository.delete(auctionHouse);
    }

    private void deleteSellerOwnedAuctions(Seller seller) {
        List<Auction> auctions = auctionRepository.findBySellerId(seller.getId());
        for (Auction auction : auctions) {
            deleteAuctionDependencies(auction.getId());
            auctionRepository.delete(auction);
        }
    }

    // ── Auction deletion (admin force-delete) ─────────────────────────────────

    @Transactional
    public void deleteAuction(Integer auctionId) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new ApiException("Auction not found"));

        deleteAuctionDependencies(auctionId);
        auctionRepository.delete(auction);
    }

    /**
     * Deletes all data that references an auction but is NOT covered by JPA cascade
     * (AuctionHouseRatings, BuyerRatings, Watchlist entries, images on disk).
     * Also nullifies buyer FK on any winning bids to allow the auction's bids to be
     * cascade-deleted without violating Receipt → Bid FK integrity.
     */
    private void deleteAuctionDependencies(Integer auctionId) {
        imageService.deleteAuctionImages(auctionId);
        auctionHouseRatingRepository.deleteByAuctionId(auctionId);
        buyerRatingRepository.deleteByAuctionId(auctionId);
        watchlistRepository.deleteByAuctionId(auctionId);
        reportRepository.nullifyAuctionReference(auctionId);

        // Detach winning bids so cascade-delete of bids does not violate Receipt's winning_bid FK
        List<Bid> winningBids = bidRepository.findWinningBidsByAuctionId(auctionId);
        for (Bid bid : winningBids) {
            bid.setBuyer(null);
            bidRepository.save(bid);
        }
    }
}
