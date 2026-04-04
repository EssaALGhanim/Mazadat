package org.example.mazadat.Controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.mazadat.Api.ApiResponse;
import org.example.mazadat.DTOIN.AuctionDTOIN;
import org.example.mazadat.Model.User;
import org.example.mazadat.Service.AuctionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auction")
@RequiredArgsConstructor
public class AuctionController {

    private final AuctionService auctionService;

    @GetMapping("/get/all")
    public ResponseEntity<?> getAllAuctions(){
        return ResponseEntity.status(HttpStatus.OK.value()).body(auctionService.getAllAuctions());
    }

    @PostMapping("/add")
    public ResponseEntity<?> addAuction(@Valid @RequestBody AuctionDTOIN auctionDTOIN, @AuthenticationPrincipal User user){
        auctionService.addAuction(auctionDTOIN, user.getId());
        return ResponseEntity.status(HttpStatus.CREATED.value()).body(new ApiResponse("Auction created successfully"));
    }

    @PutMapping("/update/{auctionId}")
    public ResponseEntity<?> updateAuction(@Valid @RequestBody AuctionDTOIN auctionDTOIN, @PathVariable Integer auctionId, @AuthenticationPrincipal User user){
        auctionService.updateAuction(auctionDTOIN, auctionId, user.getId());
        return ResponseEntity.status(HttpStatus.OK.value()).body(new ApiResponse("Auction updated successfully"));
    }

    @DeleteMapping("/delete/{auctionId}")
    public ResponseEntity<?> deleteAuction(@PathVariable Integer auctionId, @AuthenticationPrincipal User user){
        auctionService.deleteAuction(auctionId, user.getId());
        return ResponseEntity.status(HttpStatus.OK.value()).body(new ApiResponse("Auction deleted successfully"));
    }
}