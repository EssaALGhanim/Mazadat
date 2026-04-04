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

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuctionService {

    private final AuctionRepository auctionRepository;
    private final SellerRepository sellerRepository;


    public List<Auction> getAllAuctions(){
        List<Auction> auctions = auctionRepository.findAll();
        if (auctions.isEmpty()){
            throw new ApiException("Auction array is empty");
        }
        return auctions;
    }

    public void addAuction(AuctionDTOIN auctionDTOIN, Integer sellerId){
        Seller seller = sellerRepository.findById(sellerId).orElse(null);
        if (seller == null){
            throw new ApiException("Seller not found");
        }
        if (!seller.getIsAdmin()){
            throw new ApiException("Only auction house admins can create auctions");
        }

        AuctionHouse auctionHouse = seller.getAuctionHouse();
        if (auctionHouse == null){
            throw new ApiException("Seller does not belong to an auction house");
        }

        Auction auction = new Auction();
        auction.setTitle(auctionDTOIN.getTitle());
        auction.setDescription(auctionDTOIN.getDescription());
        auction.setStartingPrice(auctionDTOIN.getStartingPrice());
        auction.setCurrentPrice(auctionDTOIN.getStartingPrice());
        auction.setStatus("PENDING");
        auction.setStartDate(auctionDTOIN.getStartDate());
        auction.setEndDate(auctionDTOIN.getEndDate());
        auction.setAuctionHouse(auctionHouse);

        auctionRepository.save(auction);
    }

    public void updateAuction(AuctionDTOIN auctionDTOIN, Integer auctionId, Integer sellerId){
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
        auction.setStartDate(auctionDTOIN.getStartDate());
        auction.setEndDate(auctionDTOIN.getEndDate());

        auctionRepository.save(auction);
    }

    public void deleteAuction(Integer auctionId, Integer sellerId){
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
        auctionRepository.delete(auction);
    }
}