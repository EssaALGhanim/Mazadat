package org.example.mazadat.Service;

import lombok.RequiredArgsConstructor;
import org.example.mazadat.Api.ApiException;
import org.example.mazadat.DTOIN.AuctionDTOIN;
import org.example.mazadat.Model.Auction;
import org.example.mazadat.Model.AuctionHouse;
import org.example.mazadat.Model.Seller;
import org.example.mazadat.Repository.AuctionRepository;
import org.example.mazadat.Repository.SellerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuctionService {

    private final AuctionRepository auctionRepository;
    private final SellerRepository sellerRepository;
    private final ImageService imageService;


    public List<Auction> getAllAuctions(){
        List<Auction> auctions = auctionRepository.findAll();
        refreshAuctionLifecycle(auctions);
        refreshAuctionOutcomes(auctions);
        return auctions;
    }

    public List<Auction> searchAuctions(String query) {
        if (query == null || query.isBlank()) {
            return getAllAuctions();
        }

        List<Auction> auctions = auctionRepository.searchByQuery(query.trim());
        refreshAuctionLifecycle(auctions);
        refreshAuctionOutcomes(auctions);
        return auctions;
    }

    public Auction getAuctionById(Integer auctionId) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new ApiException("Auction not found"));
        if (refreshAuctionLifecycle(auction)) {
            auctionRepository.save(auction);
        }
        if (refreshAuctionOutcome(auction)) {
            auctionRepository.save(auction);
        }
        return auction;
    }

    @Transactional
    public void addAuction(AuctionDTOIN auctionDTOIN, int sellerId){
        Seller seller = sellerRepository.findById(sellerId).orElse(null);
        if (seller == null){
            throw new ApiException("Seller not found");
        }

        AuctionHouse auctionHouse = seller.getAuctionHouse();
        if (auctionHouse == null){
            throw new ApiException("Seller does not belong to an auction house");
        }

        Auction auction = new Auction();
        auction.setTitle(auctionDTOIN.getTitle());
        auction.setDescription(auctionDTOIN.getDescription());
        auction.setStartingPrice(auctionDTOIN.getStartingPrice());
        validateReservePrice(auctionDTOIN.getStartingPrice(), auctionDTOIN.getReservePrice());
        validateAuctionSchedule(auctionDTOIN.getStartDate(), auctionDTOIN.getEndDate());
        auction.setReservePrice(auctionDTOIN.getReservePrice());
        auction.setCurrentPrice(auctionDTOIN.getStartingPrice());
        auction.setStatus("PENDING");
        auction.setStartDate(auctionDTOIN.getStartDate());
        auction.setEndDate(auctionDTOIN.getEndDate());
        auction.setAuctionHouse(auctionHouse);
        auction.setSeller(seller);

        auctionRepository.save(auction);
    }

    @Transactional
    public void updateAuction(AuctionDTOIN auctionDTOIN, int auctionId, int sellerId){
        Seller seller = sellerRepository.findById(sellerId).orElse(null);
        if (seller == null){
            throw new ApiException("Seller not found");
        }
        if (!seller.getIsAdmin()){
            throw new ApiException("Only auction house admins can update auctions");
        }

        Auction auction = auctionRepository.findById(auctionId).orElse(null);
        if (auction == null){
            throw new ApiException("Auction not found");
        }
        if (!auction.getAuctionHouse().getId().equals(seller.getAuctionHouse().getId())){
            throw new ApiException("Auction does not belong to your auction house");
        }

        auction.setTitle(auctionDTOIN.getTitle());
        auction.setDescription(auctionDTOIN.getDescription());
        auction.setStartingPrice(auctionDTOIN.getStartingPrice());
        validateReservePrice(auctionDTOIN.getStartingPrice(), auctionDTOIN.getReservePrice());
        validateAuctionSchedule(auctionDTOIN.getStartDate(), auctionDTOIN.getEndDate());
        auction.setReservePrice(auctionDTOIN.getReservePrice());
        auction.setStartDate(auctionDTOIN.getStartDate());
        auction.setEndDate(auctionDTOIN.getEndDate());

        auctionRepository.save(auction);
    }

    @Transactional
    public void deleteAuction(int auctionId, int sellerId){
        Seller seller = sellerRepository.findById(sellerId).orElse(null);
        if (seller == null){
            throw new ApiException("Seller not found");
        }
        if (!seller.getIsAdmin()){
            throw new ApiException("Only auction house admins can delete auctions");
        }

        Auction auction = auctionRepository.findById(auctionId).orElse(null);
        if (auction == null){
            throw new ApiException("Auction not found");
        }
        if (!auction.getAuctionHouse().getId().equals(seller.getAuctionHouse().getId())){
            throw new ApiException("Auction does not belong to your auction house");
        }
        if (auction.getBids() != null && !auction.getBids().isEmpty()){
            throw new ApiException("Auction has bids");
        }
        imageService.deleteAuctionImages(auctionId);
        auctionRepository.delete(auction);
    }

    private void validateReservePrice(Double startingPrice, Double reservePrice) {
        if (reservePrice != null && reservePrice < startingPrice) {
            throw new ApiException("Reserve price cannot be lower than starting price");
        }
    }

    private void validateAuctionSchedule(LocalDateTime startDate, LocalDateTime endDate) {
        if (startDate == null || endDate == null) {
            return;
        }

        if (startDate.isBefore(LocalDateTime.now())) {
            throw new ApiException("Start date cannot be in the past");
        }

        if (!endDate.isAfter(startDate)) {
            throw new ApiException("End date must be after start date");
        }
    }

    private boolean refreshAuctionOutcome(Auction auction) {
        if (auction == null || auction.getEndDate() == null || LocalDateTime.now().isBefore(auction.getEndDate())) {
            return false;
        }

        boolean failedBelowReserve = auction.getReservePrice() != null
                && (auction.getCurrentPrice() == null || auction.getCurrentPrice() < auction.getReservePrice());
        String nextStatus = failedBelowReserve ? "FAILED_BELOW_RESERVE" : "ENDED";

        if (nextStatus.equals(auction.getStatus())) {
            return false;
        }

        auction.setStatus(nextStatus);
        if (failedBelowReserve) {
            auction.setHighestBidder(null);
            auction.setHighestBidderEmail(null);
        }
        return true;
    }

    private void refreshAuctionOutcomes(List<Auction> auctions) {
        boolean hasUpdates = false;
        for (Auction auction : auctions) {
            hasUpdates = refreshAuctionOutcome(auction) || hasUpdates;
        }
        if (hasUpdates) {
            auctionRepository.saveAll(auctions);
        }
    }

    private boolean refreshAuctionLifecycle(Auction auction) {
        if (auction == null || auction.getStartDate() == null || auction.getEndDate() == null) {
            return false;
        }

        LocalDateTime now = LocalDateTime.now();
        if (auction.getStartDate().isAfter(now) || !now.isBefore(auction.getEndDate())) {
            return false;
        }

        if ("PENDING".equals(auction.getStatus())) {
            auction.setStatus("ACTIVE");
            return true;
        }

        return false;
    }

    private void refreshAuctionLifecycle(List<Auction> auctions) {
        boolean hasUpdates = false;
        for (Auction auction : auctions) {
            hasUpdates = refreshAuctionLifecycle(auction) || hasUpdates;
        }
        if (hasUpdates) {
            auctionRepository.saveAll(auctions);
        }
    }

    @Transactional
    public Auction featureAuction(Integer auctionId, Integer sellerId, LocalDateTime featuredEndDate) {
        Seller seller = sellerRepository.findById(sellerId)
                .orElseThrow(() -> new ApiException("Seller not found"));

        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new ApiException("Auction not found"));

        if (!auction.getSeller().getId().equals(sellerId)) {
            throw new ApiException("You can only feature your own auctions");
        }

        LocalDateTime now = LocalDateTime.now();
        if (!isAuctionLive(auction, now)) {
            throw new ApiException("Only live auctions can be featured");
        }

        if (featuredEndDate.isBefore(now) || featuredEndDate.equals(now)) {
            throw new ApiException("Featured end date must be in the future");
        }

        if (auction.getEndDate() != null && featuredEndDate.isAfter(auction.getEndDate())) {
            throw new ApiException("Featured end date cannot exceed the auction end date");
        }

        if (auction.getIsFeatured() && auction.getFeaturedEndDate() != null && auction.getFeaturedEndDate().isAfter(now)) {
            throw new ApiException("This auction is already featured");
        }

        auction.setIsFeatured(true);
        auction.setFeaturedEndDate(featuredEndDate);

        return auctionRepository.save(auction);
    }

    @Transactional
    public void unfeatureAuction(Integer auctionId, Integer sellerId) {
        Seller seller = sellerRepository.findById(sellerId)
                .orElseThrow(() -> new ApiException("Seller not found"));

        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new ApiException("Auction not found"));

        if (!auction.getSeller().getId().equals(sellerId)) {
            throw new ApiException("You can only unfeature your own auctions");
        }

        auction.setIsFeatured(false);
        auction.setFeaturedEndDate(null);

        auctionRepository.save(auction);
    }

    public List<Auction> getRandomFeaturedAuctions() {
        return auctionRepository.findRandomFeaturedAuctions();
    }

    public List<Auction> getSellerFeaturedAuctions(Integer sellerId) {
        sellerRepository.findById(sellerId)
                .orElseThrow(() -> new ApiException("Seller not found"));
        return auctionRepository.findActiveFeaturedBySellerIdOrderByEndDate(sellerId);
    }

    private boolean isAuctionLive(Auction auction, LocalDateTime now) {
        return auction != null
                && auction.getStartDate() != null
                && auction.getEndDate() != null
                && !now.isBefore(auction.getStartDate())
                && now.isBefore(auction.getEndDate());
    }
}