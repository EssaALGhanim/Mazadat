package org.example.mazadat.Controller;

import lombok.RequiredArgsConstructor;
import org.example.mazadat.Api.ApiResponse;
import org.example.mazadat.Model.User;
import org.example.mazadat.Service.ReceiptService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/receipt")
@RequiredArgsConstructor
public class ReceiptController {

    private final ReceiptService receiptService;

    @GetMapping("/get/all")
    public ResponseEntity<?> getAllReceipts(){
        return ResponseEntity.status(HttpStatus.OK.value()).body(receiptService.getAllReceipts());
    }

    @PostMapping("/generate/{auctionId}")
    public ResponseEntity<?> generateReceipt(@PathVariable Integer auctionId, @AuthenticationPrincipal User user){
        receiptService.generateReceipt(auctionId, user.getId());
        return ResponseEntity.status(HttpStatus.CREATED.value()).body(new ApiResponse("Receipt generated successfully"));
    }

}