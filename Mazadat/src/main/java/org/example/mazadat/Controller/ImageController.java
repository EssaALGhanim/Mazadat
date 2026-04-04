package org.example.mazadat.Controller;

import java.util.List;

import org.example.mazadat.Api.ApiResponse;
import org.example.mazadat.DTOOUT.ImageDTOOUT;
import org.example.mazadat.Model.User;
import org.example.mazadat.Service.ImageService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/auction")
@RequiredArgsConstructor
public class ImageController {

    private final ImageService imageService;

    @GetMapping("/{auctionId}/images")
    public ResponseEntity<?> getAuctionImages(@PathVariable int auctionId) {
        List<ImageDTOOUT> images = imageService.getAuctionImages(auctionId);
        return ResponseEntity.ok(images);
    }

    @PostMapping(value = "/{auctionId}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> addAuctionImages(
            @PathVariable int auctionId,
            @RequestParam("files") List<MultipartFile> files,
            @AuthenticationPrincipal User user
    ) {
        List<ImageDTOOUT> images = imageService.addAuctionImages(auctionId, user.getId(), files);
        return ResponseEntity.status(HttpStatus.CREATED).body(images);
    }

    @DeleteMapping("/images/{imageId}")
    public ResponseEntity<?> deleteImage(@PathVariable int imageId, @AuthenticationPrincipal User user) {
        imageService.deleteImage(imageId, user.getId());
        return ResponseEntity.ok(new ApiResponse("Image deleted successfully"));
    }
}