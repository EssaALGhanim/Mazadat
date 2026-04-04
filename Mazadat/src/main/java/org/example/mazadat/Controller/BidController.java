package org.example.mazadat.Controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.mazadat.Api.ApiResponse;
import org.example.mazadat.DTOIN.BidDTOIN;
import org.example.mazadat.Model.User;
import org.example.mazadat.Service.BidService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/bid")
@RequiredArgsConstructor
public class BidController {

    private final BidService bidService;

    @GetMapping("/get/all")
    public ResponseEntity<?> getAllBids(){
        return ResponseEntity.status(HttpStatus.OK.value()).body(bidService.getAllBids());
    }

    @PostMapping("/add")
    public ResponseEntity<?> addBid(@Valid @RequestBody BidDTOIN bidDTOIN, @AuthenticationPrincipal User user){
        bidService.addBid(bidDTOIN, user.getId());
        return ResponseEntity.status(HttpStatus.CREATED.value()).body(new ApiResponse("Bid placed successfully"));
    }


}