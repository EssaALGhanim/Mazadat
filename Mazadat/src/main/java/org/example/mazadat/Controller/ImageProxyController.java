package org.example.mazadat.Controller;

import org.example.mazadat.Service.ImageStorageService;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/media")
@RequiredArgsConstructor
public class ImageProxyController {

    private final ImageStorageService imageStorageService;

    @GetMapping("/image")
    public ResponseEntity<byte[]> getImage(@RequestParam("url") String url) {
        ImageStorageService.ImageAsset asset = imageStorageService.load(url);
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .contentType(MediaType.parseMediaType(asset.contentType()))
                .body(asset.bytes());
    }
}

