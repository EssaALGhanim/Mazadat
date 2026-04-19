package org.example.mazadat.Controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.mazadat.Api.ApiResponse;
import org.example.mazadat.DTOIN.AutoBidDTOIN;
import org.example.mazadat.Model.User;
import org.example.mazadat.Service.AutoBidService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/autobid")
@RequiredArgsConstructor
public class AutoBidController {

    private final AutoBidService autoBidService;

    @PostMapping("/set")
    public ResponseEntity<?> setAutoBid(@Valid @RequestBody AutoBidDTOIN dto,
                                        @AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(autoBidService.setAutoBid(dto, user.getId()));
    }

    @DeleteMapping("/cancel/{auctionId}")
    public ResponseEntity<?> cancelAutoBid(@PathVariable Integer auctionId,
                                           @AuthenticationPrincipal User user) {
        autoBidService.cancelAutoBid(user.getId(), auctionId);
        return ResponseEntity.ok(new ApiResponse("Auto-bid cancelled successfully"));
    }

    @GetMapping("/my-autobids")
    public ResponseEntity<?> getMyAutoBids(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(autoBidService.getMyAutoBids(user.getId()));
    }
}
