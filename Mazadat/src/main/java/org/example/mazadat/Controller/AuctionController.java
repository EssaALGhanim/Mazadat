package org.example.mazadat.Controller;

import org.example.mazadat.Api.ApiResponse;
import org.example.mazadat.DTOIN.AuctionCommentDTOIN;
import org.example.mazadat.DTOIN.AuctionDTOIN;
import org.example.mazadat.DTOIN.FeatureAuctionDTOIN;
import org.example.mazadat.Model.User;
import org.example.mazadat.Service.AuctionCommentService;
import org.example.mazadat.Service.AuctionService;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/auction")
@RequiredArgsConstructor
public class AuctionController {

    private final AuctionService auctionService;
    private final AuctionCommentService auctionCommentService;

    @GetMapping("/get/all")
    public ResponseEntity<?> getAllAuctions(){
        return ResponseEntity.status(HttpStatus.OK.value()).body(auctionService.getAllAuctions());
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchAuctions(@RequestParam(required = false) String query){
        return ResponseEntity.status(HttpStatus.OK.value()).body(auctionService.searchAuctions(query));
    }

    @GetMapping("/{auctionId}")
    public ResponseEntity<?> getAuctionById(@PathVariable Integer auctionId){
        return ResponseEntity.status(HttpStatus.OK.value()).body(auctionService.getAuctionById(auctionId));
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

    @GetMapping("/featured/random")
    public ResponseEntity<?> getRandomFeaturedAuctions(){
        return ResponseEntity.status(HttpStatus.OK.value()).body(auctionService.getRandomFeaturedAuctions());
    }

    @GetMapping("/featured/my-featured")
    public ResponseEntity<?> getMyFeaturedAuctions(@AuthenticationPrincipal User user){
        return ResponseEntity.status(HttpStatus.OK.value()).body(auctionService.getSellerFeaturedAuctions(user.getId()));
    }

    @PostMapping("/{auctionId}/feature")
    public ResponseEntity<?> featureAuction(
            @PathVariable Integer auctionId,
            @Valid @RequestBody FeatureAuctionDTOIN featureAuctionDTOIN,
            @AuthenticationPrincipal User user){
        auctionService.featureAuction(auctionId, user.getId(), featureAuctionDTOIN.getFeaturedEndDate());
        return ResponseEntity.status(HttpStatus.OK.value()).body(new ApiResponse("Auction featured successfully"));
    }

    @DeleteMapping("/{auctionId}/feature")
    public ResponseEntity<?> unfeatureAuction(@PathVariable Integer auctionId, @AuthenticationPrincipal User user){
        auctionService.unfeatureAuction(auctionId, user.getId());
        return ResponseEntity.status(HttpStatus.OK.value()).body(new ApiResponse("Auction unfeatured successfully"));
    }

    @GetMapping("/{auctionId}/comments")
    public ResponseEntity<?> getComments(@PathVariable Integer auctionId){
        return ResponseEntity.status(HttpStatus.OK.value()).body(auctionCommentService.getComments(auctionId));
    }

    @PostMapping("/{auctionId}/comments")
    public ResponseEntity<?> addComment(@PathVariable Integer auctionId,
                                        @Valid @RequestBody AuctionCommentDTOIN dto,
                                        @AuthenticationPrincipal User user){
        auctionCommentService.addComment(dto, auctionId, user.getId());
        return ResponseEntity.status(HttpStatus.CREATED.value()).body(new ApiResponse("Comment added successfully"));
    }

    @PutMapping("/{auctionId}/comments/{commentId}")
    public ResponseEntity<?> editComment(@PathVariable Integer auctionId,
                                         @PathVariable Integer commentId,
                                         @Valid @RequestBody AuctionCommentDTOIN dto,
                                         @AuthenticationPrincipal User user){
        auctionCommentService.editComment(dto, commentId, user.getId());
        return ResponseEntity.status(HttpStatus.OK.value()).body(new ApiResponse("Comment updated successfully"));
    }

    @DeleteMapping("/{auctionId}/comments/{commentId}")
    public ResponseEntity<?> deleteComment(@PathVariable Integer auctionId,
                                           @PathVariable Integer commentId,
                                           @AuthenticationPrincipal User user){
        auctionCommentService.deleteComment(commentId, user.getId());
        return ResponseEntity.status(HttpStatus.OK.value()).body(new ApiResponse("Comment deleted successfully"));
    }
}