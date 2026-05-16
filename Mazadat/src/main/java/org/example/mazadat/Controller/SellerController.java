package org.example.mazadat.Controller;

import org.example.mazadat.Api.ApiResponse;
import org.example.mazadat.DTOIN.SellerDTOIN;
import org.example.mazadat.DTOIN.SellerUpdateDTOIN;
import org.example.mazadat.Model.User;
import org.example.mazadat.Service.SellerAnalyticsService;
import org.example.mazadat.Service.SellerService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/seller")
@RequiredArgsConstructor
public class SellerController {

    private final SellerService sellerService;
    private final SellerAnalyticsService sellerAnalyticsService;

    @GetMapping("/get/all")
    public ResponseEntity<?> getAllSellers(){
        return ResponseEntity.status(HttpStatus.OK.value()).body(sellerService.getAllSellers());
    }

    @GetMapping("/current")
    public ResponseEntity<?> getCurrentSeller(@AuthenticationPrincipal User user){
        return ResponseEntity.status(HttpStatus.OK.value()).body(sellerService.getCurrentSeller(user.getId()));
    }

    @PostMapping("/add")
    public ResponseEntity<?> addSeller(@Valid @RequestBody SellerDTOIN sellerDTOIN){
        sellerService.addSeller(sellerDTOIN);
        return ResponseEntity.status(HttpStatus.CREATED.value()).body(new ApiResponse("Seller created successfully"));
    }

    @PutMapping("/update")
    public ResponseEntity<?> updateSeller(@Valid @RequestBody SellerUpdateDTOIN sellerDTOIN, @AuthenticationPrincipal User user){
        sellerService.updateSeller(sellerDTOIN, user.getId());
        return ResponseEntity.status(HttpStatus.OK.value()).body(new ApiResponse("Seller updated successfully"));
    }

    @DeleteMapping("/delete")
    public ResponseEntity<?> deleteSeller(@AuthenticationPrincipal User user){
        sellerService.deleteSeller(user.getId());
        return ResponseEntity.status(HttpStatus.OK.value()).body(new ApiResponse("Seller deleted successfully"));
    }

    @DeleteMapping("/delete/{sellerId}")
    public ResponseEntity<?> deleteSellerById(@PathVariable Integer sellerId, @AuthenticationPrincipal User user) {
        sellerService.deleteSellerByAuthorized(user, sellerId);
        return ResponseEntity.status(HttpStatus.OK.value()).body(new ApiResponse("Seller deleted successfully"));
    }

    @GetMapping("/analytics")
    public ResponseEntity<?> getSellerAnalytics(@AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.OK.value()).body(sellerAnalyticsService.getSellerAnalytics(user.getId()));
    }

    @GetMapping("/analytics/{auctionId}")
    public ResponseEntity<?> getAuctionAnalytics(@PathVariable Integer auctionId, @AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.OK.value()).body(sellerAnalyticsService.getAuctionAnalytics(auctionId, user.getId()));
    }
}