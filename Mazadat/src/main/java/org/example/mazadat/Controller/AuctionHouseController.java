package org.example.mazadat.Controller;


import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.mazadat.Api.ApiResponse;
import org.example.mazadat.DTOIN.AuctionHouseDTOIN;
import org.example.mazadat.DTOIN.AuctionHouseRatingDTOIN;
import org.example.mazadat.Model.AuctionHouse;
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

    @GetMapping("/seller/current")
    public ResponseEntity<?> getSellerAuctionHouse(@AuthenticationPrincipal User user){
        AuctionHouse auctionHouse = auctionHouseService.getSellerAuctionHouse(user.getId());
        if (auctionHouse == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ApiResponse("Seller is not part of any Auction House"));
        }
        return ResponseEntity.ok(auctionHouse);
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

    @PutMapping("/admin/add/{email}")
    public ResponseEntity<?> addAdminByEmail(@PathVariable String email, @AuthenticationPrincipal User user){
        auctionHouseService.addAdminByEmail(user.getId(), email);
        return ResponseEntity.status(HttpStatus.OK.value()).body(new ApiResponse("Admin was added successfully"));
    }

    @PutMapping("/admin/remove/{email}")
    public ResponseEntity<?> removeAdminByEmail(@PathVariable String email, @AuthenticationPrincipal User user) {
        auctionHouseService.removeAdminByEmail(user.getId(), email);
        return ResponseEntity.status(HttpStatus.OK.value()).body(new ApiResponse("Admin was demoted successfully"));
    }

    @GetMapping("/team")
    public ResponseEntity<?> getAuctionHouseTeam(@AuthenticationPrincipal User user){
        return ResponseEntity.status(HttpStatus.OK.value()).body(auctionHouseService.getAuctionHouseTeam(user.getId()));
    }

    @PutMapping("/team/add/{email}")
    public ResponseEntity<?> addSellerToAuctionHouse(@PathVariable String email, @AuthenticationPrincipal User user){
        auctionHouseService.addSellerToAuctionHouse(user.getId(), email);
        return ResponseEntity.status(HttpStatus.OK.value()).body(new ApiResponse("Invitation email sent successfully. Seller must accept before joining"));
    }

    @GetMapping("/team/invitations/pending")
    public ResponseEntity<?> getPendingInvitations(@AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.OK.value()).body(auctionHouseService.getPendingInvitations(user.getId()));
    }

    @GetMapping("/team/invitations/sent")
    public ResponseEntity<?> getSentInvitations(@AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.OK.value()).body(auctionHouseService.getSentInvitations(user.getId()));
    }

    @PutMapping("/team/invitations/accept")
    public ResponseEntity<?> acceptInvitation(@AuthenticationPrincipal User user) {
        auctionHouseService.acceptInvitation(user.getId());
        return ResponseEntity.status(HttpStatus.OK.value()).body(new ApiResponse("Invitation accepted successfully"));
    }

    @PutMapping("/team/invitations/reject")
    public ResponseEntity<?> rejectInvitation(@AuthenticationPrincipal User user) {
        auctionHouseService.rejectInvitation(user.getId());
        return ResponseEntity.status(HttpStatus.OK.value()).body(new ApiResponse("Invitation rejected successfully"));
    }

    @PutMapping("/team/invitations/cancel/{email}")
    public ResponseEntity<?> cancelInvitation(@PathVariable String email, @AuthenticationPrincipal User user) {
        auctionHouseService.cancelSentInvitation(user.getId(), email);
        return ResponseEntity.status(HttpStatus.OK.value()).body(new ApiResponse("Invitation cancelled successfully"));
    }

    @PutMapping("/team/leave")
    public ResponseEntity<?> leaveAuctionHouse(@AuthenticationPrincipal User user) {
        auctionHouseService.leaveAuctionHouse(user.getId());
        return ResponseEntity.status(HttpStatus.OK.value()).body(new ApiResponse("You left the auction house successfully"));
    }

    @PutMapping("/team/remove/{email}")
    public ResponseEntity<?> removeSellerFromAuctionHouse(@PathVariable String email, @AuthenticationPrincipal User user){
        auctionHouseService.removeSellerFromAuctionHouse(user.getId(), email);
        return ResponseEntity.status(HttpStatus.OK.value()).body(new ApiResponse("Seller was removed from the auction house successfully"));
    }

    @PutMapping("/team/promote/{email}")
    public ResponseEntity<?> promoteSellerToAdmin(@PathVariable String email, @AuthenticationPrincipal User user){
        auctionHouseService.addAdminByEmail(user.getId(), email);
        return ResponseEntity.status(HttpStatus.OK.value()).body(new ApiResponse("Seller was promoted to admin successfully"));
    }

    @PutMapping("/admin/remove")
    public ResponseEntity<?> removeAdmin(@AuthenticationPrincipal User user){
        auctionHouseService.removeAdmin(user.getId());
        return ResponseEntity.status(HttpStatus.OK.value()).body(new ApiResponse("Admin was removed successfully"));
    }

    @PostMapping("/rate")
    public ResponseEntity<?> submitAuctionHouseRating(@RequestBody @Valid AuctionHouseRatingDTOIN dto,
                                                      @AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                auctionHouseService.submitAuctionHouseRating(user.getId(), dto));
    }

    @GetMapping("/rate/check/{auctionId}")
    public ResponseEntity<?> checkAuctionHouseRating(@PathVariable Integer auctionId,
                                                     @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(auctionHouseService.checkAuctionHouseRating(user.getId(), auctionId));
    }
}
