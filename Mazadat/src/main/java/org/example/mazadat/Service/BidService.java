package org.example.mazadat.Service;

import lombok.RequiredArgsConstructor;
import org.example.mazadat.Api.ApiException;
import org.example.mazadat.DTOIN.BidDTOIN;
import org.example.mazadat.Model.Auction;
import org.example.mazadat.Model.Bid;
import org.example.mazadat.Model.Buyer;
import org.example.mazadat.Repository.AuctionRepository;
import org.example.mazadat.Repository.BidRepository;
import org.example.mazadat.Repository.BuyerRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BidService {

    private final BidRepository bidRepository;
    private final AuctionRepository auctionRepository;
    private final BuyerRepository buyerRepository;


    public List<Bid> getAllBids(){
        List<Bid> bids = bidRepository.findAll();
        if (bids.isEmpty()){
            throw new ApiException("Bid array is empty");
        }
        return bids;
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

        if (!"ACTIVE".equals(auction.getStatus())){
            throw new ApiException("Auction is not active");
        }

        if (bidDTOIN.getAmount() <= auction.getCurrentPrice()){
            throw new ApiException("Bid amount must be higher than current price");
        }

        Bid bid = new Bid();
        bid.setAmount(bidDTOIN.getAmount());
        bid.setAuction(auction);
        bid.setBuyer(buyer);

        auction.setCurrentPrice(bidDTOIN.getAmount());

        auctionRepository.save(auction);
        bidRepository.save(bid);
    }
}