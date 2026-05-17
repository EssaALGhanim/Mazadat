package org.example.mazadat.Controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.mazadat.Api.ApiResponse;
import org.example.mazadat.DTOIN.WatchlistDTOIN;
import org.example.mazadat.Model.User;
import org.example.mazadat.Service.BuyerService;
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

@RestController
@RequestMapping("/api/v1/watchlist")
@RequiredArgsConstructor
public class WatchlistController {

    private final BuyerService buyerService;

    @GetMapping
    public ResponseEntity<?> getMyWatchlist(@AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.OK.value()).body(buyerService.getMyWatchlist(user.getId()));
    }

    @PostMapping
    public ResponseEntity<?> addToWatchlist(@Valid @RequestBody WatchlistDTOIN dto, @AuthenticationPrincipal User user) {
        buyerService.addToWatchlist(user.getId(), dto.getAuctionId());
        return ResponseEntity.status(HttpStatus.CREATED.value()).body(new ApiResponse("Added to watchlist"));
    }

    @DeleteMapping("/{auctionId}")
    public ResponseEntity<?> removeFromWatchlist(@PathVariable Integer auctionId, @AuthenticationPrincipal User user) {
        buyerService.removeFromWatchlist(user.getId(), auctionId);
        return ResponseEntity.status(HttpStatus.OK.value()).body(new ApiResponse("Removed from watchlist"));
    }
}
