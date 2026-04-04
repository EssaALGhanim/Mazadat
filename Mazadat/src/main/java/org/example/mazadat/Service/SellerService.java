package org.example.mazadat.Service;

import lombok.RequiredArgsConstructor;
import org.example.mazadat.Api.ApiException;
import org.example.mazadat.DTOIN.SellerDTOIN;
import org.example.mazadat.Model.Seller;
import org.example.mazadat.Model.User;
import org.example.mazadat.Repository.AuctionHouseRepository;
import org.example.mazadat.Repository.SellerRepository;
import org.example.mazadat.Repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SellerService {

    private final SellerRepository sellerRepository;
    private final UserRepository userRepository;
    private final AuctionHouseRepository auctionHouseRepository;


    public List<Seller> getAllSellers(){
        List<Seller> sellers = sellerRepository.findAll();
        if (sellers.isEmpty()){
            throw new ApiException("Seller array is empty");
        }
        return sellers;
    }

    public void addSeller(SellerDTOIN sellerDTOIN){

        User user = new User();
        user.setUsername(sellerDTOIN.getUsername());
        user.setEmail(sellerDTOIN.getEmail());
        String hashedPassword = new BCryptPasswordEncoder().encode(sellerDTOIN.getPassword());
        user.setPassword(hashedPassword);
        user.setRole("SELLER");

        Seller seller = new Seller();
        seller.setUser(user);
        seller.setBankAccount(sellerDTOIN.getBankAccount());
        seller.setPayoutVerified(false);
        seller.setRating(0.0);
        seller.setIsAdmin(false);

        userRepository.save(user);
        sellerRepository.save(seller);
    }

    public void updateSeller(SellerDTOIN sellerDTOIN, Integer sellerId){
        Seller seller = sellerRepository.findById(sellerId).orElse(null);
        if (seller == null){
            throw new ApiException("Seller not found");
        }

        User user = seller.getUser();
        user.setUsername(sellerDTOIN.getUsername());
        user.setEmail(sellerDTOIN.getEmail());
        String hashedPassword = new BCryptPasswordEncoder().encode(sellerDTOIN.getPassword());
        user.setPassword(hashedPassword);
        seller.setBankAccount(sellerDTOIN.getBankAccount());

        userRepository.save(user);
        sellerRepository.save(seller);
    }

    public void deleteSeller(Integer sellerId){
        Seller seller = sellerRepository.findById(sellerId).orElse(null);
        if (seller == null){
            throw new ApiException("Seller not found");
        }

        if (seller.getAuctionHouse() != null && !sellerRepository.findOtherAuctionHouseAdmins(seller.getAuctionHouse(),seller).isEmpty()){
            throw new ApiException("Seller is the only admin of an auction house");
        }
        sellerRepository.delete(seller);
        userRepository.delete(seller.getUser());
    }

}