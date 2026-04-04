package org.example.mazadat.Controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.mazadat.Api.ApiResponse;
import org.example.mazadat.DTOIN.SellerDTOIN;
import org.example.mazadat.Model.User;
import org.example.mazadat.Service.SellerService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/seller")
@RequiredArgsConstructor
public class SellerController {

    private final SellerService sellerService;

    @GetMapping("/get/all")
    public ResponseEntity<?> getAllSellers(){
        return ResponseEntity.status(HttpStatus.OK.value()).body(sellerService.getAllSellers());
    }

    @PostMapping("/add")
    public ResponseEntity<?> addSeller(@Valid @RequestBody SellerDTOIN sellerDTOIN){
        sellerService.addSeller(sellerDTOIN);
        return ResponseEntity.status(HttpStatus.CREATED.value()).body(new ApiResponse("Seller created successfully"));
    }

    @PutMapping("/update")
    public ResponseEntity<?> updateSeller(@Valid @RequestBody SellerDTOIN sellerDTOIN, @AuthenticationPrincipal User user){
        sellerService.updateSeller(sellerDTOIN, user.getId());
        return ResponseEntity.status(HttpStatus.OK.value()).body(new ApiResponse("Seller updated successfully"));
    }

    @DeleteMapping("/delete")
    public ResponseEntity<?> deleteSeller(@AuthenticationPrincipal User user){
        sellerService.deleteSeller(user.getId());
        return ResponseEntity.status(HttpStatus.OK.value()).body(new ApiResponse("Seller deleted successfully"));
    }
}