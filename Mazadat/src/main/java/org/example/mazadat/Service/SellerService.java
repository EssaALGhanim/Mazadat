package org.example.mazadat.Service;

import lombok.RequiredArgsConstructor;
import org.example.mazadat.Api.ApiException;
import org.example.mazadat.DTOIN.SellerDTOIN;
import org.example.mazadat.DTOIN.SellerUpdateDTOIN;
import org.example.mazadat.Model.Seller;
import org.example.mazadat.Model.User;
import org.example.mazadat.Repository.AuctionHouseRepository;
import org.example.mazadat.Repository.SellerRepository;
import org.example.mazadat.Repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class SellerService {

    private final SellerRepository sellerRepository;
    private final UserRepository userRepository;
    private final AuctionHouseRepository auctionHouseRepository;
    private final OtpService otpService;


    public List<Seller> getAllSellers(){
        List<Seller> sellers = sellerRepository.findAll();
        if (sellers.isEmpty()){
            throw new ApiException("Seller array is empty");
        }
        return sellers;
    }

    public Seller getCurrentSeller(Integer sellerId){
        Seller seller = sellerRepository.findById(sellerId).orElse(null);
        if (seller == null){
            throw new ApiException("Seller not found");
        }
        return seller;
    }

    public void addSeller(SellerDTOIN sellerDTOIN){

        if (userRepository.existsByUsername(sellerDTOIN.getUsername())) {
            throw new ApiException("Username already exists");
        }
        if (userRepository.existsByEmail(sellerDTOIN.getEmail())) {
            throw new ApiException("Email already exists");
        }

        User user = new User();
        user.setUsername(sellerDTOIN.getUsername());
        user.setEmail(sellerDTOIN.getEmail());
        String hashedPassword = new BCryptPasswordEncoder().encode(sellerDTOIN.getPassword());
        user.setPassword(hashedPassword);
        user.setPhoneNumber(sellerDTOIN.getPhoneNumber());
        user.setRole("SELLER");

        Seller seller = new Seller();
        seller.setUser(user);
        seller.setPayoutVerified(false);
        seller.setRating(0.0);
        seller.setIsAdmin(false);

        userRepository.save(user);
        sellerRepository.save(seller);

        otpService.sendOtpToNewUser(user.getEmail(), user.getUsername());
    }

    public void updateSeller(SellerUpdateDTOIN sellerDTOIN, Integer sellerId){
        Seller seller = sellerRepository.findById(sellerId).orElse(null);
        if (seller == null){
            throw new ApiException("Seller not found");
        }

        User user = seller.getUser();

        boolean hasAnyField = false;

        if (StringUtils.hasText(sellerDTOIN.getUsername())) {
            User userWithSameUsername = userRepository.findUserByUsername(sellerDTOIN.getUsername());
            if (userWithSameUsername != null && !userWithSameUsername.getId().equals(user.getId())) {
                throw new ApiException("Username already exists");
            }
            user.setUsername(sellerDTOIN.getUsername());
            hasAnyField = true;
        }

        if (StringUtils.hasText(sellerDTOIN.getEmail())) {
            User userWithSameEmail = userRepository.findUserByEmail(sellerDTOIN.getEmail());
            if (userWithSameEmail != null && !userWithSameEmail.getId().equals(user.getId())) {
                throw new ApiException("Email already exists");
            }
            user.setEmail(sellerDTOIN.getEmail());
            hasAnyField = true;
        }

        if (StringUtils.hasText(sellerDTOIN.getPassword())) {
            String hashedPassword = new BCryptPasswordEncoder().encode(sellerDTOIN.getPassword());
            user.setPassword(hashedPassword);
            hasAnyField = true;
        }

        if (StringUtils.hasText(sellerDTOIN.getPhoneNumber())) {
            user.setPhoneNumber(sellerDTOIN.getPhoneNumber());
            hasAnyField = true;
        }

        if (!hasAnyField) {
            throw new ApiException("No fields provided for update");
        }

        userRepository.save(user);
        sellerRepository.save(seller);
    }

    public void deleteSeller(Integer sellerId){
        Seller seller = sellerRepository.findById(sellerId).orElse(null);
        if (seller == null){
            throw new ApiException("Seller not found");
        }

        validateAdminRemovalSafety(seller, false);
        sellerRepository.delete(seller);
        userRepository.delete(seller.getUser());
    }

    public void deleteSellerByAuthorized(User requesterUser, Integer targetSellerId) {
        Seller target = sellerRepository.findById(targetSellerId).orElse(null);
        if (target == null) {
            throw new ApiException("Seller not found");
        }

        boolean isPlatformAdmin = requesterUser != null && "ADMIN".equalsIgnoreCase(requesterUser.getRole());
        if (!isPlatformAdmin) {
            Seller requesterSeller = sellerRepository.findById(requesterUser.getId()).orElse(null);
            if (requesterSeller == null) {
                throw new ApiException("Requester seller profile not found");
            }
            if (!Boolean.TRUE.equals(requesterSeller.getIsAdmin())) {
                throw new ApiException("Only authorized admins can delete other sellers");
            }
            if (requesterSeller.getAuctionHouse() == null || target.getAuctionHouse() == null
                    || !requesterSeller.getAuctionHouse().getId().equals(target.getAuctionHouse().getId())) {
                throw new ApiException("You can only delete sellers from your auction house");
            }
            if (requesterSeller.getId().equals(target.getId())) {
                throw new ApiException("Use your profile settings to delete your own account");
            }
        }

        // Authorized admin deletion is allowed for any teammate account except self.
        validateAdminRemovalSafety(target, true);
        sellerRepository.delete(target);
        userRepository.delete(target.getUser());
    }

    private void validateAdminRemovalSafety(Seller seller, boolean skipForPlatformAdmin) {
        if (skipForPlatformAdmin) {
            return;
        }
        if (seller.getAuctionHouse() != null && Boolean.TRUE.equals(seller.getIsAdmin())) {
            Set<Seller> otherAdmins = sellerRepository.findOtherAuctionHouseAdmins(seller.getAuctionHouse(), seller);
            if (otherAdmins.isEmpty()) {
                throw new ApiException("Cannot remove the last admin of an auction house");
            }
        }
    }

}