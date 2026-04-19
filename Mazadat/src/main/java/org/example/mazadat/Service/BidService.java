package org.example.mazadat.Service;

import lombok.RequiredArgsConstructor;
import org.example.mazadat.Api.ApiException;
import org.example.mazadat.DTOIN.BidDTOIN;
import org.example.mazadat.DTOOUT.BidDTOOUT;
import org.example.mazadat.Model.Auction;
import org.example.mazadat.Model.Bid;
import org.example.mazadat.Model.Buyer;
import org.example.mazadat.Repository.AuctionRepository;
import org.example.mazadat.Repository.BidRepository;
import org.example.mazadat.Repository.BuyerRepository;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BidService {

    private final BidRepository bidRepository;
    private final AuctionRepository auctionRepository;
    private final BuyerRepository buyerRepository;
    @Lazy
    private final AutoBidService autoBidService;


    public List<Bid> getAllBids(){
        return bidRepository.findAll();
    }

    public List<BidDTOOUT> getBuyerBids(Integer buyerId){
        return bidRepository.findHighestBuyerBidPerAuction(buyerId)
                .stream()
                .map(this::toDto)
                .toList();
    }

    public List<BidDTOOUT> getWonBids(Integer buyerId){
        return bidRepository.findWonHighestBuyerBidPerAuction(buyerId, LocalDateTime.now())
                .stream()
                .map(this::toDto)
                .toList();
    }

    public void addBid(BidDTOIN bidDTOIN, Integer buyerId){
        Buyer buyer = buyerRepository.findById(buyerId).orElse(null);
        if (buyer == null){
            throw new ApiException("Buyer not found");
        }

        Auction auction = auctionRepository.findById(bidDTOIN.getAuctionId()).orElse(null);
        if (auction == null){
            throw new ApiException("Auction not found");
        }

        if (!"ACTIVE".equals(auction.getStatus()) && !"PENDING".equals(auction.getStatus())){
            throw new ApiException("Auction is not active");
        }

        // Check if auction has ended
        if (auction.getEndDate() != null && LocalDateTime.now().isAfter(auction.getEndDate())){
            throw new ApiException("Auction has ended");
        }

        Optional<Bid> highestBidOpt = bidRepository.findTopByAuctionIdOrderByAmountDescPlacedAtDesc(bidDTOIN.getAuctionId());

        if (highestBidOpt.isEmpty()) {
            // First bid — must be at least the starting price
            if (bidDTOIN.getAmount() < auction.getStartingPrice()) {
                throw new ApiException("First bid must be at least the starting price. Minimum allowed: " + auction.getStartingPrice());
            }
        } else {
            // Subsequent bids — must be at least 5% above the current highest bid
            double minRequired = Math.ceil(highestBidOpt.get().getAmount() * 1.05);
            if (bidDTOIN.getAmount() < minRequired) {
                throw new ApiException("Bid must be at least 5% higher than the previous highest bid. Minimum allowed: " + minRequired);
            }
        }

        Bid bid = new Bid();
        bid.setAmount(bidDTOIN.getAmount());
        bid.setAuction(auction);
        bid.setBuyer(buyer);

        auction.setCurrentPrice(bidDTOIN.getAmount());
        auction.setHighestBidder(buyer.getUser().getUsername());
        auction.setHighestBidderEmail(buyer.getUser().getEmail());

        auctionRepository.save(auction);
        bidRepository.save(bid);

        autoBidService.triggerAutoBidding(auction);
    }

    private BidDTOOUT toDto(Bid bid) {
        Auction auction = bid.getAuction();
        return new BidDTOOUT(
                bid.getId(),
                auction != null ? auction.getId() : null,
                auction != null ? auction.getTitle() : null,
                bid.getAmount(),
                auction != null ? auction.getStartingPrice() : null,
                bid.getPlacedAt(),
                bid.getBuyer() != null ? bid.getBuyer().getId() : null,
                auction != null ? auction.getEndDate() : null,
                auction != null ? auction.getStatus() : null
        );
    }
}