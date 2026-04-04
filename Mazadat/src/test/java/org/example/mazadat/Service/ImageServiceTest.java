package org.example.mazadat.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.example.mazadat.Api.ApiException;
import org.example.mazadat.Model.Auction;
import org.example.mazadat.Model.AuctionHouse;
import org.example.mazadat.Model.Image;
import org.example.mazadat.Model.Seller;
import org.example.mazadat.Repository.AuctionRepository;
import org.example.mazadat.Repository.ImageRepository;
import org.example.mazadat.Repository.SellerRepository;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

@ExtendWith(MockitoExtension.class)
class ImageServiceTest {

    @Mock
    private ImageRepository imageRepository;

    @Mock
    private AuctionRepository auctionRepository;

    @Mock
    private SellerRepository sellerRepository;

    @Mock
    private ImageStorageService imageStorageService;

    @InjectMocks
    private ImageService imageService;

    @Test
    void addAuctionImagesSavesImagesAndNormalizesOrder() {
        Seller seller = buildSeller();
        Auction auction = buildAuction();

        when(sellerRepository.findById(1)).thenReturn(Optional.of(seller));
        when(auctionRepository.findById(10)).thenReturn(Optional.of(auction));
        when(imageRepository.findByAuctionIdOrderByDisplayOrderAsc(10)).thenReturn(List.of());
        when(imageStorageService.store(any())).thenReturn("/uploads/images/one.png", "/uploads/images/two.png");

        List<MultipartFile> files = List.of(
                new MockMultipartFile("files", "one.png", "image/png", new byte[]{1}),
                new MockMultipartFile("files", "two.png", "image/png", new byte[]{2})
        );

        var result = imageService.addAuctionImages(10, 1, files);

        assertEquals(2, result.size());
        assertEquals(1, result.get(0).getDisplayOrder());
        assertEquals(2, result.get(1).getDisplayOrder());
        verify(imageStorageService).store(files.get(0));
        verify(imageStorageService).store(files.get(1));
    }

    @Test
    void addAuctionImagesRejectsMoreThanFiveImages() {
        Seller seller = buildSeller();
        Auction auction = buildAuction();

        when(sellerRepository.findById(1)).thenReturn(Optional.of(seller));
        when(auctionRepository.findById(10)).thenReturn(Optional.of(auction));
        when(imageRepository.findByAuctionIdOrderByDisplayOrderAsc(10)).thenReturn(List.of(
                buildImage(1, 1), buildImage(2, 2), buildImage(3, 3), buildImage(4, 4)
        ));

        List<MultipartFile> files = List.of(
                new MockMultipartFile("files", "one.png", "image/png", new byte[]{1}),
                new MockMultipartFile("files", "two.png", "image/png", new byte[]{2})
        );

        ApiException exception = assertThrows(ApiException.class, () -> imageService.addAuctionImages(10, 1, files));
        assertEquals("Auction cannot have more than 5 images", exception.getMessage());
        verify(imageStorageService, never()).store(any());
    }

    @Test
    void deleteImageRemovesFileAndRecord() {
        Seller seller = buildSeller();
        Auction auction = buildAuction();
        Image image = buildImage(5, 2);
        image.setAuction(auction);

        when(imageRepository.findById(5)).thenReturn(Optional.of(image));
        when(sellerRepository.findById(1)).thenReturn(Optional.of(seller));
        when(imageRepository.findByAuctionIdOrderByDisplayOrderAsc(10)).thenReturn(List.of(image));

        imageService.deleteImage(5, 1);

        verify(imageStorageService).delete("/uploads/images/test.png");
        verify(imageRepository).delete(image);
    }

    private Seller buildSeller() {
        Seller seller = new Seller();
        seller.setId(1);
        seller.setIsAdmin(true);
        seller.setAuctionHouse(buildAuctionHouse());
        return seller;
    }

    private Auction buildAuction() {
        Auction auction = new Auction();
        auction.setId(10);
        auction.setTitle("Auction");
        auction.setStartingPrice(100.0);
        auction.setCurrentPrice(100.0);
        auction.setStatus("PENDING");
        auction.setStartDate(LocalDateTime.now());
        auction.setEndDate(LocalDateTime.now().plusDays(1));
        auction.setAuctionHouse(buildAuctionHouse());
        return auction;
    }

    private AuctionHouse buildAuctionHouse() {
        AuctionHouse auctionHouse = new AuctionHouse();
        auctionHouse.setId(7);
        auctionHouse.setName("House");
        auctionHouse.setLocation("Riyadh");
        return auctionHouse;
    }

    private Image buildImage(int id, int displayOrder) {
        Image image = new Image();
        image.setId(id);
        image.setUrl("/uploads/images/test.png");
        image.setDisplayOrder(displayOrder);
        return image;
    }
}