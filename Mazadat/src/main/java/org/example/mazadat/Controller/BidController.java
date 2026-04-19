package org.example.mazadat.Controller;

import org.example.mazadat.Api.ApiResponse;
import org.example.mazadat.DTOIN.AutoBidDTOIN;
import org.example.mazadat.DTOIN.BidDTOIN;
import org.example.mazadat.Model.User;
import org.example.mazadat.Service.BidService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/bid")
@RequiredArgsConstructor
public class BidController {

    private final BidService bidService;

    @GetMapping("/get/all")
    public ResponseEntity<?> getAllBids(){
        return ResponseEntity.status(HttpStatus.OK.value()).body(bidService.getAllBids());
    }

    @GetMapping("/buyer/my-bids")
    public ResponseEntity<?> getMyBids(@AuthenticationPrincipal User user){
        return ResponseEntity.status(HttpStatus.OK.value()).body(bidService.getBuyerBids(user.getId()));
    }

    @GetMapping("/buyer/won-bids")
    public ResponseEntity<?> getWonBids(@AuthenticationPrincipal User user){
        return ResponseEntity.status(HttpStatus.OK.value()).body(bidService.getWonBids(user.getId()));
    }

    @PostMapping("/add")
    public ResponseEntity<?> addBid(@Valid @RequestBody BidDTOIN bidDTOIN, @AuthenticationPrincipal User user){
        bidService.addBid(bidDTOIN, user.getId());
        return ResponseEntity.status(HttpStatus.CREATED.value()).body(new ApiResponse("Bid placed successfully"));
    }

    @PostMapping("/autobid/set")
    public ResponseEntity<?> setAutoBid(@Valid @RequestBody AutoBidDTOIN dto, @AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bidService.setAutoBid(dto, user.getId()));
    }

    @DeleteMapping("/autobid/cancel/{auctionId}")
    public ResponseEntity<?> cancelAutoBid(@PathVariable Integer auctionId, @AuthenticationPrincipal User user) {
        bidService.cancelAutoBid(user.getId(), auctionId);
        return ResponseEntity.ok(new ApiResponse("Auto-bid cancelled successfully"));
    }

    @GetMapping("/autobid/my-autobids")
    public ResponseEntity<?> getMyAutoBids(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(bidService.getMyAutoBids(user.getId()));
    }
}