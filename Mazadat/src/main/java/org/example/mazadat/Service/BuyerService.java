package org.example.mazadat.Service;

import lombok.RequiredArgsConstructor;
import org.example.mazadat.DTOIN.BuyerDTOIN;
import org.example.mazadat.Model.Buyer;
import org.example.mazadat.Model.User;
import org.example.mazadat.Repository.BuyerRepository;
import org.example.mazadat.Repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BuyerService {

    private final BuyerRepository buyerRepository;
    private final UserRepository userRepository;


    public void addBuyer(BuyerDTOIN buyerDTOIN){

        User user = new User();
        user.setUsername(buyerDTOIN.getUsername());
        user.setEmail(buyerDTOIN.getEmail());
        String hashedPassword = new BCryptPasswordEncoder().encode(buyerDTOIN.getPassword());
        user.setPassword(hashedPassword);
        user.setRole("BUYER");

        Buyer buyer = new Buyer();
        buyer.setUser(user);

        userRepository.save(user);
        buyerRepository.save(buyer);

    }
}
