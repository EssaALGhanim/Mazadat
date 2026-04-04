package org.example.mazadat.Service;

import lombok.RequiredArgsConstructor;
import org.example.mazadat.Api.ApiException;
import org.example.mazadat.Model.Auction;
import org.example.mazadat.Model.Bid;
import org.example.mazadat.Model.Buyer;
import org.example.mazadat.Model.Receipt;
import org.example.mazadat.Repository.AuctionRepository;
import org.example.mazadat.Repository.BuyerRepository;
import org.example.mazadat.Repository.ReceiptRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReceiptService {

    private final ReceiptRepository receiptRepository;
    private final AuctionRepository auctionRepository;
    private final BuyerRepository buyerRepository;


    public List<Receipt> getAllReceipts(){
        List<Receipt> receipts = receiptRepository.findAll();
        if (receipts.isEmpty()){
            throw new ApiException("Receipt array is empty");
        }
        return receipts;
    }

    public void generateReceipt(Integer auctionId, Integer buyerId){
        Buyer buyer = buyerRepository.findById(buyerId).orElse(null);
        if (buyer == null){
            throw new ApiException("Buyer not found");
        }

        Auction auction = auctionRepository.findById(auctionId).orElse(null);
        if (auction == null){
            throw new ApiException("Auction not found");
        }
        if (auction.getReceipt() != null){
            throw new ApiException("Receipt already exists for this auction");
        }
        if (auction.getBids() == null || auction.getBids().isEmpty()){
            throw new ApiException("Auction has no bids");
        }

        // Find the winning bid (highest amount)
        Bid winningBid = auction.getBids().stream()
                .max((b1, b2) -> Double.compare(b1.getAmount(), b2.getAmount()))
                .orElseThrow(() -> new ApiException("No bids found"));

        // Verify that the buyer placing this request is the one with the winning bid
        if (!winningBid.getBuyer().getId().equals(buyerId)){
            throw new ApiException("Only the winning bidder can generate a receipt");
        }

        Receipt receipt = new Receipt();
        receipt.setTotalAmount(winningBid.getAmount());
        receipt.setAuction(auction);
        receipt.setWinningBid(winningBid);

        auction.setStatus("COMPLETED");

        auctionRepository.save(auction);
        receiptRepository.save(receipt);
    }


}