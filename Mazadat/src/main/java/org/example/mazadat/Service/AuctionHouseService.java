package org.example.mazadat.Service;


import lombok.RequiredArgsConstructor;
import org.example.mazadat.Api.ApiException;
import org.example.mazadat.DTOIN.AuctionHouseDTOIN;
import org.example.mazadat.Model.AuctionHouse;
import org.example.mazadat.Model.Seller;
import org.example.mazadat.Repository.AuctionHouseRepository;
import org.example.mazadat.Repository.SellerRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor

public class AuctionHouseService {

    private final AuctionHouseRepository auctionHouseRepository;
    private final SellerRepository sellerRepository;


    public List<AuctionHouse> getAllAuctionHouses(){
        return auctionHouseRepository.findAll();
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
        auctionHouse.setDescription(auctionHouse.getDescription());
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
        if (seller.getAuctionHouse() == null || !seller.getIsAdmin()){
            throw new ApiException("Seller does not admin an auction house");
        }

        AuctionHouse auctionHouse = seller.getAuctionHouse();
        auctionHouse.setName(auctionHouseDTOIN.getName());
        auctionHouse.setLocation(auctionHouseDTOIN.getLocation());
        auctionHouse.setDescription(auctionHouseDTOIN.getDescription());
        auctionHouseRepository.save(auctionHouse);
    }




}
