package org.example.mazadat.Controller;


import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.mazadat.DTOIN.BuyerDTOIN;
import org.example.mazadat.Service.BuyerService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/buyer")
@RequiredArgsConstructor
public class BuyerController {

    private final BuyerService buyerService;


    @PostMapping("/add")
    public ResponseEntity<?> addBuyer(@Valid @RequestBody BuyerDTOIN buyerDTOIN) {
        buyerService.addBuyer(buyerDTOIN);
        return ResponseEntity.status(HttpStatus.CREATED.value()).body("Buyer updated successfully.");
    }
}
