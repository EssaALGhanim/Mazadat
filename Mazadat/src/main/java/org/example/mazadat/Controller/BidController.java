package org.example.mazadat.Controller;

import org.example.mazadat.Api.ApiResponse;
import org.example.mazadat.DTOIN.AutoBidDTOIN;
import org.example.mazadat.DTOIN.BidDTOIN;
import org.example.mazadat.Model.User;
import org.example.mazadat.Service.BidService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
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
    public ResponseEntity<?> addBid(@Valid @RequestBody BidDTOIN bidDTOIN,
                                    @AuthenticationPrincipal User user,
                                    HttpServletRequest request,
                                    @RequestHeader(value = "X-Device-Id", required = false) String deviceId){
        bidService.addBid(bidDTOIN, user.getId(), resolveClientIp(request), resolveDeviceFingerprint(deviceId, request));
        return ResponseEntity.status(HttpStatus.CREATED.value()).body(new ApiResponse("Bid placed successfully"));
    }

    private String resolveClientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }

        return request.getRemoteAddr();
    }

    private String resolveDeviceFingerprint(String deviceId, HttpServletRequest request) {
        if (deviceId != null && !deviceId.isBlank()) {
            return deviceId;
        }

        String userAgent = request.getHeader("User-Agent");
        return (userAgent == null || userAgent.isBlank()) ? null : userAgent;
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