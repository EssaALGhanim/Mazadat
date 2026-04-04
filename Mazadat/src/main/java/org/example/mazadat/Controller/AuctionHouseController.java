package org.example.mazadat.Controller;


import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.mazadat.Api.ApiResponse;
import org.example.mazadat.DTOIN.AuctionHouseDTOIN;
import org.example.mazadat.Model.User;
import org.example.mazadat.Service.AuctionHouseService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auctionhouse")
@RequiredArgsConstructor
public class AuctionHouseController {

    private final AuctionHouseService auctionHouseService;

    @GetMapping("/get/all")
    public ResponseEntity<?> getAllAuctionHouses(){
        return ResponseEntity.ok(auctionHouseService.getAllAuctionHouses());
    }

    @PostMapping("/add")
    public ResponseEntity<?> addAuctionHouse(@Valid @RequestBody AuctionHouseDTOIN auctionHouseDTOIN, @AuthenticationPrincipal User user){
        auctionHouseService.addAuctionHouse(auctionHouseDTOIN, user.getId());
        return ResponseEntity.status(HttpStatus.CREATED.value()).body(new ApiResponse("Auction house was created successfully"));
    }

    @PutMapping("/update")
    public ResponseEntity<?> updateAuctionHouse(@Valid @RequestBody AuctionHouseDTOIN auctionHouseDTOIN, @AuthenticationPrincipal User user){
        auctionHouseService.updateAuctionHouse(auctionHouseDTOIN, user.getId());
        return ResponseEntity.status(HttpStatus.OK.value()).body(new ApiResponse("Auction house was updated successfully"));
    }

    @PutMapping("/admin/add")
    public ResponseEntity<?> addAdmin(@AuthenticationPrincipal User user){
        auctionHouseService.addAdmin(user.getId());
        return ResponseEntity.status(HttpStatus.OK.value()).body(new ApiResponse("Admin was added successfully"));
    }

    @PutMapping("/admin/remove")
    public ResponseEntity<?> removeAdmin(@AuthenticationPrincipal User user){
        auctionHouseService.removeAdmin(user.getId());
        return ResponseEntity.status(HttpStatus.OK.value()).body(new ApiResponse("Admin was removed successfully"));
    }

}
