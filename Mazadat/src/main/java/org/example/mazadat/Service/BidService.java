package org.example.mazadat.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.example.mazadat.Api.ApiException;
import org.example.mazadat.DTOIN.AutoBidDTOIN;
import org.example.mazadat.DTOIN.BidDTOIN;
import org.example.mazadat.DTOOUT.AutoBidDTOOUT;
import org.example.mazadat.DTOOUT.BidDTOOUT;
import org.example.mazadat.Model.Auction;
import org.example.mazadat.Model.AutoBid;
import org.example.mazadat.Model.Bid;
import org.example.mazadat.Model.Buyer;
import org.example.mazadat.Repository.AuctionRepository;
import org.example.mazadat.Repository.AutoBidRepository;
import org.example.mazadat.Repository.BidRepository;
import org.example.mazadat.Repository.BuyerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BidService {

    private final BidRepository bidRepository;
    private final AuctionRepository auctionRepository;
    private final BuyerRepository buyerRepository;
    private final AutoBidRepository autoBidRepository;


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

        triggerAutoBidding(auction);
    }

    public AutoBidDTOOUT setAutoBid(AutoBidDTOIN dto, Integer buyerId) {
        Buyer buyer = buyerRepository.findById(buyerId).orElse(null);
        if (buyer == null) {
            throw new ApiException("Buyer not found");
        }

        Auction auction = auctionRepository.findById(dto.getAuctionId()).orElse(null);
        if (auction == null) {
            throw new ApiException("Auction not found");
        }

        if (!"ACTIVE".equals(auction.getStatus()) && !"PENDING".equals(auction.getStatus())) {
            throw new ApiException("Auction is not active");
        }

        if (dto.getMaxAmount() <= auction.getCurrentPrice()) {
            throw new ApiException("Max auto-bid amount must be higher than the current price: " + auction.getCurrentPrice());
        }

        Optional<AutoBid> existing = autoBidRepository.findByBuyerIdAndAuctionIdAndActiveTrue(buyerId, dto.getAuctionId());
        existing.ifPresent(ab -> {
            ab.setActive(false);
            autoBidRepository.save(ab);
        });

        AutoBid autoBid = new AutoBid();
        autoBid.setBuyer(buyer);
        autoBid.setAuction(auction);
        autoBid.setMaxAmount(dto.getMaxAmount());
        autoBid.setActive(true);
        autoBidRepository.save(autoBid);

        triggerAutoBidding(auction);

        auction = auctionRepository.findById(dto.getAuctionId()).orElse(auction);
        return toAutoBidDto(autoBid, auction);
    }

    public void cancelAutoBid(Integer buyerId, Integer auctionId) {
        AutoBid autoBid = autoBidRepository.findByBuyerIdAndAuctionIdAndActiveTrue(buyerId, auctionId)
                .orElseThrow(() -> new ApiException("No active auto-bid found for this auction"));
        autoBid.setActive(false);
        autoBidRepository.save(autoBid);
    }

    public List<AutoBidDTOOUT> getMyAutoBids(Integer buyerId) {
        return autoBidRepository.findByBuyerIdAndActiveTrue(buyerId)
                .stream()
                .map(ab -> toAutoBidDto(ab, ab.getAuction()))
                .toList();
    }

    @Transactional
    public void triggerAutoBidding(Auction auction) {
        final int MAX_ITERATIONS = 200;
        int iterations = 0;

        while (iterations < MAX_ITERATIONS) {
            iterations++;

            String currentHighestBidder = auction.getHighestBidder() == null ? "" : auction.getHighestBidder();
            double currentPrice = auction.getCurrentPrice() == null ? 0.0 : auction.getCurrentPrice();
            double nextMin = Math.ceil(currentPrice * 1.05);

            Optional<AutoBid> bestOpt = autoBidRepository.findBestCompetingAutoBid(auction.getId(), currentHighestBidder);

            if (bestOpt.isEmpty()) {
                break;
            }

            AutoBid best = bestOpt.get();

            if (best.getMaxAmount() < nextMin) {
                break;
            }

            Buyer autoBuyer = best.getBuyer();

            Bid autoBidBid = new Bid();
            autoBidBid.setAmount(nextMin);
            autoBidBid.setAuction(auction);
            autoBidBid.setBuyer(autoBuyer);
            bidRepository.save(autoBidBid);

            auction.setCurrentPrice(nextMin);
            auction.setHighestBidder(autoBuyer.getUser().getUsername());
            auction.setHighestBidderEmail(autoBuyer.getUser().getEmail());
            auctionRepository.save(auction);
        }

        String finalHighestBidder = auction.getHighestBidder() == null ? "" : auction.getHighestBidder();
        double finalNextMin = Math.ceil((auction.getCurrentPrice() == null ? 0.0 : auction.getCurrentPrice()) * 1.05);

        List<AutoBid> exhausted = autoBidRepository.findExhaustedAutoBids(auction.getId(), finalHighestBidder, finalNextMin);
        exhausted.forEach(ab -> ab.setActive(false));
        autoBidRepository.saveAll(exhausted);
    }

    private AutoBidDTOOUT toAutoBidDto(AutoBid autoBid, Auction auction) {
        return new AutoBidDTOOUT(
                autoBid.getId(),
                auction != null ? auction.getId() : null,
                auction != null ? auction.getTitle() : null,
                autoBid.getMaxAmount(),
                autoBid.getActive(),
                autoBid.getCreatedAt()
        );
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