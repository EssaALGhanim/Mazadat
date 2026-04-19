package org.example.mazadat.Service;

import lombok.RequiredArgsConstructor;
import org.example.mazadat.Api.ApiException;
import org.example.mazadat.DTOIN.AutoBidDTOIN;
import org.example.mazadat.DTOOUT.AutoBidDTOOUT;
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

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AutoBidService {

    private final AutoBidRepository autoBidRepository;
    private final AuctionRepository auctionRepository;
    private final BuyerRepository buyerRepository;
    private final BidRepository bidRepository;

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

        // Deactivate any existing auto-bid for this buyer on this auction
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

        // Immediately trigger in case this auto-bid can already outbid the current highest bidder
        triggerAutoBidding(auction);

        // Reload auction to get updated price after potential auto-bid chain
        auction = auctionRepository.findById(dto.getAuctionId()).orElse(auction);

        return toDto(autoBid, auction);
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
                .map(ab -> toDto(ab, ab.getAuction()))
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

            // Place an auto-bid at the minimum required amount
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

        // Deactivate exhausted auto-bids (those that can no longer outbid the current price)
        String finalHighestBidder = auction.getHighestBidder() == null ? "" : auction.getHighestBidder();
        double finalNextMin = Math.ceil((auction.getCurrentPrice() == null ? 0.0 : auction.getCurrentPrice()) * 1.05);

        List<AutoBid> exhausted = autoBidRepository.findExhaustedAutoBids(auction.getId(), finalHighestBidder, finalNextMin);
        exhausted.forEach(ab -> ab.setActive(false));
        autoBidRepository.saveAll(exhausted);
    }

    private AutoBidDTOOUT toDto(AutoBid autoBid, Auction auction) {
        return new AutoBidDTOOUT(
                autoBid.getId(),
                auction != null ? auction.getId() : null,
                auction != null ? auction.getTitle() : null,
                autoBid.getMaxAmount(),
                autoBid.getActive(),
                autoBid.getCreatedAt()
        );
    }
}
