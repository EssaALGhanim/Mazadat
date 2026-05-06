package org.example.mazadat.Service;


import lombok.RequiredArgsConstructor;
import org.example.mazadat.Api.ApiException;
import org.example.mazadat.DTOIN.AuctionHouseDTOIN;
import org.example.mazadat.DTOIN.AuctionHouseRatingDTOIN;
import org.example.mazadat.DTOOUT.AuctionHouseRatingsDTOOUT;
import org.example.mazadat.DTOOUT.RatingCheckDTOOUT;
import org.example.mazadat.DTOOUT.SellerTeamMemberDTO;
import org.example.mazadat.Model.Auction;
import org.example.mazadat.Model.AuctionHouse;
import org.example.mazadat.Model.AuctionHouseRating;
import org.example.mazadat.Model.Buyer;
import org.example.mazadat.Model.Seller;
import org.example.mazadat.Repository.AuctionRepository;
import org.example.mazadat.Repository.AuctionHouseRepository;
import org.example.mazadat.Repository.AuctionHouseRatingRepository;
import org.example.mazadat.Repository.BuyerRepository;
import org.example.mazadat.Repository.SellerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor

public class AuctionHouseService {

    private final AuctionHouseRepository auctionHouseRepository;
    private final SellerRepository sellerRepository;
    private final AuctionRepository auctionRepository;
    private final BuyerRepository buyerRepository;
    private final AuctionHouseRatingRepository auctionHouseRatingRepository;


    public List<AuctionHouse> getAllAuctionHouses(){
        return auctionHouseRepository.findAll();
    }

    @Transactional
    public AuctionHouse getSellerAuctionHouse(Integer SellerId){
        Seller seller = sellerRepository.findSellerById(SellerId);
        if (seller == null){
            throw new ApiException("Seller not found");
        }

        AuctionHouse auctionHouse = seller.getAuctionHouse();
        if (auctionHouse == null) {
            return null;
        }

        boolean hasUpdates = false;
        for (Auction auction : auctionHouse.getAuctions()) {
            if (refreshAuctionLifecycle(auction)) {
                hasUpdates = true;
            }
        }
        if (hasUpdates) {
            auctionRepository.saveAll(auctionHouse.getAuctions());
        }

        return auctionHouse;
    }

    public void addAuctionHouse(AuctionHouseDTOIN auctionHouseDTOIN, Integer SellerId){
        Seller seller = sellerRepository.findSellerById(SellerId);
        if (seller == null){
            throw new ApiException("Seller not found");
        }
        if (seller.getAuctionHouse() != null){
            throw new ApiException("Seller already has an auction house");
        }

        AuctionHouse auctionHouse = new AuctionHouse();
        auctionHouse.setName(auctionHouseDTOIN.getName());
        auctionHouse.setLocation(auctionHouseDTOIN.getLocation());
        auctionHouse.setDescription(auctionHouseDTOIN.getDescription());
        auctionHouse.setIban(normalizeIban(auctionHouseDTOIN.getIban()));
        auctionHouse.setSettingsNote(auctionHouseDTOIN.getSettingsNote());
        seller.setAuctionHouse(auctionHouse);
        seller.setIsAdmin(true);
        auctionHouse.getSellers().add(seller);
        auctionHouseRepository.save(auctionHouse);
        sellerRepository.save(seller);

    }


    // todo add Admin set


    public void addAdmin(Integer SellerId){
        Seller seller = sellerRepository.findSellerById(SellerId);
        if (seller == null){
            throw new ApiException("Seller not found");
        }
        if (seller.getAuctionHouse() == null){
            throw new ApiException("Seller does not belong an auction house");
        }
        seller.setIsAdmin(true);
        sellerRepository.save(seller);
    }

    public void addAdminByEmail(Integer requesterId, String email){
        Seller requester = sellerRepository.findSellerById(requesterId);
        if (requester == null){
            throw new ApiException("Seller not found");
        }
        if (requester.getAuctionHouse() == null || !Boolean.TRUE.equals(requester.getIsAdmin())){
            throw new ApiException("Only auction house admins can add admins");
        }

        Seller targetSeller = sellerRepository.findSellerByUserEmail(email);
        if (targetSeller == null){
            throw new ApiException("Target seller not found");
        }
        if (targetSeller.getAuctionHouse() == null || !targetSeller.getAuctionHouse().getId().equals(requester.getAuctionHouse().getId())){
            throw new ApiException("Target seller must belong to your auction house");
        }

        targetSeller.setIsAdmin(true);
        sellerRepository.save(targetSeller);
    }

    public void removeAdminByEmail(Integer requesterId, String email) {
        Seller requester = sellerRepository.findSellerById(requesterId);
        if (requester == null) {
            throw new ApiException("Seller not found");
        }
        if (requester.getAuctionHouse() == null || !Boolean.TRUE.equals(requester.getIsAdmin())) {
            throw new ApiException("Only auction house admins can demote admins");
        }

        Seller targetSeller = sellerRepository.findSellerByUserEmail(email);
        if (targetSeller == null) {
            throw new ApiException("Target seller not found");
        }
        if (targetSeller.getAuctionHouse() == null || !targetSeller.getAuctionHouse().getId().equals(requester.getAuctionHouse().getId())) {
            throw new ApiException("Target seller must belong to your auction house");
        }
        if (!Boolean.TRUE.equals(targetSeller.getIsAdmin())) {
            throw new ApiException("Target seller is not an admin");
        }

        targetSeller.setIsAdmin(false);
        sellerRepository.save(targetSeller);
    }

    public List<SellerTeamMemberDTO> getAuctionHouseTeam(Integer requesterId){
        Seller requester = sellerRepository.findSellerById(requesterId);
        if (requester == null){
            throw new ApiException("Seller not found");
        }
        if (requester.getAuctionHouse() == null){
            throw new ApiException("Seller does not belong to an auction house");
        }

        List<Seller> sellers = sellerRepository.findByAuctionHouseId(requester.getAuctionHouse().getId());
        List<SellerTeamMemberDTO> team = new ArrayList<>();
        for (Seller seller : sellers) {
            SellerTeamMemberDTO dto = new SellerTeamMemberDTO();
            dto.setSellerId(seller.getId());
            dto.setUsername(seller.getUser() != null ? seller.getUser().getUsername() : null);
            dto.setEmail(seller.getUser() != null ? seller.getUser().getEmail() : null);
            dto.setIsAdmin(Boolean.TRUE.equals(seller.getIsAdmin()));
            dto.setPayoutVerified(Boolean.TRUE.equals(seller.getPayoutVerified()));
            dto.setRating(seller.getRating());
            team.add(dto);
        }
        return team;
    }

    public void addSellerToAuctionHouse(Integer requesterId, String email){
        Seller requester = sellerRepository.findSellerById(requesterId);
        if (requester == null){
            throw new ApiException("Seller not found");
        }
        if (requester.getAuctionHouse() == null || !Boolean.TRUE.equals(requester.getIsAdmin())){
            throw new ApiException("Only auction house admins can add team members");
        }

        Seller targetSeller = sellerRepository.findSellerByUserEmail(email);
        if (targetSeller == null){
            throw new ApiException("Target seller not found");
        }
        if (targetSeller.getAuctionHouse() != null){
            throw new ApiException("Target seller already belongs to an auction house");
        }

        if (targetSeller.getPendingAuctionHouse() != null
                && "PENDING".equals(targetSeller.getInvitationStatus())
                && !targetSeller.getPendingAuctionHouse().getId().equals(requester.getAuctionHouse().getId())) {
            throw new ApiException("Target seller already has a pending invitation from another auction house");
        }

        targetSeller.setPendingAuctionHouse(requester.getAuctionHouse());
        targetSeller.setInvitationStatus("PENDING");
        targetSeller.setInvitationSentAt(LocalDateTime.now());
        targetSeller.setInvitationFrom(requester.getUser() != null ? requester.getUser().getUsername() : null);
        sellerRepository.save(targetSeller);
    }

    public List<Map<String, Object>> getPendingInvitations(Integer sellerId) {
        Seller seller = sellerRepository.findSellerById(sellerId);
        if (seller == null) {
            throw new ApiException("Seller not found");
        }

        List<Map<String, Object>> invitations = new ArrayList<>();
        if (seller.getPendingAuctionHouse() != null && "PENDING".equals(seller.getInvitationStatus())) {
            Map<String, Object> invitation = new HashMap<>();
            invitation.put("auctionHouseId", seller.getPendingAuctionHouse().getId());
            invitation.put("auctionHouseName", seller.getPendingAuctionHouse().getName());
            invitation.put("invitedBy", seller.getInvitationFrom());
            invitation.put("sentAt", seller.getInvitationSentAt());
            invitations.add(invitation);
        }
        return invitations;
    }

    public List<Map<String, Object>> getSentInvitations(Integer requesterId) {
        Seller requester = sellerRepository.findSellerById(requesterId);
        if (requester == null) {
            throw new ApiException("Seller not found");
        }
        if (requester.getAuctionHouse() == null || !Boolean.TRUE.equals(requester.getIsAdmin())) {
            throw new ApiException("Only auction house admins can view sent invitations");
        }

        List<Seller> invitedSellers = sellerRepository.findByPendingAuctionHouseIdAndInvitationStatus(
                requester.getAuctionHouse().getId(),
                "PENDING"
        );

        List<Map<String, Object>> invitations = new ArrayList<>();
        for (Seller invited : invitedSellers) {
            Map<String, Object> invitation = new HashMap<>();
            invitation.put("sellerId", invited.getId());
            invitation.put("username", invited.getUser() != null ? invited.getUser().getUsername() : null);
            invitation.put("email", invited.getUser() != null ? invited.getUser().getEmail() : null);
            invitation.put("sentAt", invited.getInvitationSentAt());
            invitation.put("invitedBy", invited.getInvitationFrom());
            invitations.add(invitation);
        }
        return invitations;
    }

    public void cancelSentInvitation(Integer requesterId, String email) {
        Seller requester = sellerRepository.findSellerById(requesterId);
        if (requester == null) {
            throw new ApiException("Seller not found");
        }
        if (requester.getAuctionHouse() == null || !Boolean.TRUE.equals(requester.getIsAdmin())) {
            throw new ApiException("Only auction house admins can cancel invitations");
        }

        Seller targetSeller = sellerRepository.findSellerByUserEmail(email);
        if (targetSeller == null) {
            throw new ApiException("Target seller not found");
        }
        if (targetSeller.getPendingAuctionHouse() == null || !"PENDING".equals(targetSeller.getInvitationStatus())) {
            throw new ApiException("No pending invitation found for this seller");
        }
        if (!targetSeller.getPendingAuctionHouse().getId().equals(requester.getAuctionHouse().getId())) {
            throw new ApiException("Invitation does not belong to your auction house");
        }

        targetSeller.setPendingAuctionHouse(null);
        targetSeller.setInvitationStatus("CANCELLED");
        targetSeller.setInvitationFrom(null);
        targetSeller.setInvitationSentAt(null);
        sellerRepository.save(targetSeller);
    }

    public void acceptInvitation(Integer sellerId) {
        Seller seller = sellerRepository.findSellerById(sellerId);
        if (seller == null) {
            throw new ApiException("Seller not found");
        }
        if (seller.getPendingAuctionHouse() == null || !"PENDING".equals(seller.getInvitationStatus())) {
            throw new ApiException("No pending invitation found");
        }
        if (seller.getAuctionHouse() != null) {
            throw new ApiException("Seller already belongs to an auction house");
        }

        seller.setAuctionHouse(seller.getPendingAuctionHouse());
        seller.setIsAdmin(false);
        seller.setPendingAuctionHouse(null);
        seller.setInvitationStatus("ACCEPTED");
        seller.setInvitationFrom(null);
        seller.setInvitationSentAt(null);
        sellerRepository.save(seller);
    }

    public void rejectInvitation(Integer sellerId) {
        Seller seller = sellerRepository.findSellerById(sellerId);
        if (seller == null) {
            throw new ApiException("Seller not found");
        }
        if (seller.getPendingAuctionHouse() == null || !"PENDING".equals(seller.getInvitationStatus())) {
            throw new ApiException("No pending invitation found");
        }

        seller.setPendingAuctionHouse(null);
        seller.setInvitationStatus("REJECTED");
        seller.setInvitationFrom(null);
        seller.setInvitationSentAt(null);
        sellerRepository.save(seller);
    }

    public void removeSellerFromAuctionHouse(Integer requesterId, String email){
        Seller requester = sellerRepository.findSellerById(requesterId);
        if (requester == null){
            throw new ApiException("Seller not found");
        }
        if (requester.getAuctionHouse() == null || !Boolean.TRUE.equals(requester.getIsAdmin())){
            throw new ApiException("Only auction house admins can remove team members");
        }

        Seller targetSeller = sellerRepository.findSellerByUserEmail(email);
        if (targetSeller == null){
            throw new ApiException("Target seller not found");
        }
        if (targetSeller.getAuctionHouse() == null || !targetSeller.getAuctionHouse().getId().equals(requester.getAuctionHouse().getId())){
            throw new ApiException("Target seller does not belong to your auction house");
        }
        if (targetSeller.getId().equals(requester.getId())){
            throw new ApiException("You cannot remove yourself from the auction house");
        }

        targetSeller.setAuctionHouse(null);
        targetSeller.setIsAdmin(false);
        sellerRepository.save(targetSeller);
    }


    public void removeAdmin(Integer SellerId){

        Seller seller = sellerRepository.findSellerById(SellerId);
        if (seller == null){
            throw new ApiException("Seller not found");
        }
        if (seller.getAuctionHouse() == null){
            throw new ApiException("Seller does not belong an auction house");
        }
        if (!seller.getIsAdmin()){
            throw new ApiException("Seller is not an admin");
        }
        seller.setIsAdmin(false);
        sellerRepository.save(seller);
    }

    public void updateAuctionHouse(AuctionHouseDTOIN auctionHouseDTOIN, Integer SellerId){
        Seller seller = sellerRepository.findSellerById(SellerId);
        if (seller == null){
            throw new ApiException("Seller not found");
        }
        if (seller.getAuctionHouse() == null || !Boolean.TRUE.equals(seller.getIsAdmin())){
            throw new ApiException("Only auction house admins can update auction house settings");
        }

        AuctionHouse auctionHouse = seller.getAuctionHouse();
        auctionHouse.setName(auctionHouseDTOIN.getName());
        auctionHouse.setLocation(auctionHouseDTOIN.getLocation());
        auctionHouse.setDescription(auctionHouseDTOIN.getDescription());
        auctionHouse.setIban(normalizeIban(auctionHouseDTOIN.getIban()));
        auctionHouseRepository.save(auctionHouse);
    }

    public void leaveAuctionHouse(Integer sellerId) {
        Seller seller = sellerRepository.findSellerById(sellerId);
        if (seller == null) {
            throw new ApiException("Seller not found");
        }
        if (seller.getAuctionHouse() == null) {
            throw new ApiException("Seller does not belong to an auction house");
        }

        if (Boolean.TRUE.equals(seller.getIsAdmin())) {
            if (sellerRepository.findOtherAuctionHouseAdmins(seller.getAuctionHouse(), seller).isEmpty()) {
                throw new ApiException("You cannot leave as the last admin of this auction house");
            }
        }

        seller.setAuctionHouse(null);
        seller.setIsAdmin(false);
        sellerRepository.save(seller);
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

    private String normalizeIban(String iban) {
        if (iban == null) {
            return null;
        }
        String normalized = iban.trim().toUpperCase();
        return normalized.isEmpty() ? null : normalized;
    }

    public RatingCheckDTOOUT submitAuctionHouseRating(Integer buyerId, AuctionHouseRatingDTOIN dto) {
        Buyer buyer = buyerRepository.findById(buyerId).orElse(null);
        if (buyer == null) {
            throw new ApiException("Buyer not found");
        }

        Auction auction = auctionRepository.findById(dto.getAuctionId()).orElse(null);
        if (auction == null) {
            throw new ApiException("Auction not found");
        }

        String highestBidder = auction.getHighestBidder();
        if (highestBidder == null || !highestBidder.equals(buyer.getUser().getUsername())) {
            throw new ApiException("You did not win this auction");
        }

        AuctionHouse auctionHouse = auctionHouseRepository.findById(dto.getAuctionHouseId()).orElse(null);
        if (auctionHouse == null) {
            throw new ApiException("Auction house not found");
        }

        if (auctionHouseRatingRepository.findByBuyerIdAndAuctionId(buyerId, dto.getAuctionId()).isPresent()) {
            throw new ApiException("You have already rated this auction house for this auction");
        }

        AuctionHouseRating rating = new AuctionHouseRating();
        rating.setBuyer(buyer);
        rating.setAuctionHouse(auctionHouse);
        rating.setAuction(auction);
        rating.setRating(dto.getRating());
        rating.setComment(dto.getComment());
        auctionHouseRatingRepository.save(rating);

        return new RatingCheckDTOOUT(true, rating.getRating(), rating.getComment());
    }

    public RatingCheckDTOOUT checkAuctionHouseRating(Integer buyerId, Integer auctionId) {
        return auctionHouseRatingRepository.findByBuyerIdAndAuctionId(buyerId, auctionId)
                .map(r -> new RatingCheckDTOOUT(true, r.getRating(), r.getComment()))
                .orElse(new RatingCheckDTOOUT(false, null, null));
    }

    public AuctionHouseRatingsDTOOUT getAuctionHouseRatings(Integer auctionHouseId) {
        List<AuctionHouseRating> ratings = auctionHouseRatingRepository.findByAuctionHouseId(auctionHouseId);
        double avg = ratings.stream().mapToInt(AuctionHouseRating::getRating).average().orElse(0.0);
        double roundedAvg = Math.round(avg * 10.0) / 10.0;
        List<AuctionHouseRatingsDTOOUT.RatingEntry> entries = ratings.stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(r -> new AuctionHouseRatingsDTOOUT.RatingEntry(
                        r.getBuyer() != null && r.getBuyer().getUser() != null
                                ? r.getBuyer().getUser().getUsername() : "Anonymous",
                        r.getRating(),
                        r.getComment(),
                        r.getCreatedAt()
                ))
                .toList();
        return new AuctionHouseRatingsDTOOUT(roundedAvg, ratings.size(), entries);
    }
}
