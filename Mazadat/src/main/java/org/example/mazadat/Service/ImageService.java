package org.example.mazadat.Service;

import lombok.RequiredArgsConstructor;
import org.example.mazadat.Api.ApiException;
import org.example.mazadat.DTOOUT.ImageDTOOUT;
import org.example.mazadat.Model.Auction;
import org.example.mazadat.Model.Image;
import org.example.mazadat.Model.Seller;
import org.example.mazadat.Repository.AuctionRepository;
import org.example.mazadat.Repository.ImageRepository;
import org.example.mazadat.Repository.SellerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ImageService {

    private static final int MAX_IMAGES_PER_AUCTION = 5;

    private final ImageRepository imageRepository;
    private final AuctionRepository auctionRepository;
    private final SellerRepository sellerRepository;
    private final ImageStorageService imageStorageService;

    public List<ImageDTOOUT> getAuctionImages(int auctionId) {
        List<Image> images = imageRepository.findByAuctionIdOrderByDisplayOrderAsc(auctionId);
        if (images.isEmpty()) {
            throw new ApiException("Image array is empty");
        }
        return images.stream().map(this::toDto).toList();
    }

    @Transactional
    public List<ImageDTOOUT> addAuctionImages(int auctionId, int sellerId, List<MultipartFile> files) {
        Auction auction = getAuthorizedAuction(sellerId, auctionId);

        if (files == null || files.isEmpty()) {
            throw new ApiException("Image array is empty");
        }

        List<Image> existingImages = new ArrayList<>(imageRepository.findByAuctionIdOrderByDisplayOrderAsc(auctionId));
        if (existingImages.size() + files.size() > MAX_IMAGES_PER_AUCTION) {
            throw new ApiException("Auction cannot have more than 5 images");
        }

        List<Image> savedImages = new ArrayList<>();
        int nextDisplayOrder = existingImages.stream()
                .map(Image::getDisplayOrder)
                .filter(order -> order != null)
                .max(Comparator.naturalOrder())
                .orElse(0) + 1;

        for (MultipartFile file : files) {
            String storedUrl = imageStorageService.store(file);

            Image image = new Image();
            image.setUrl(storedUrl);
            image.setDisplayOrder(nextDisplayOrder++);
            image.setAuction(auction);

            savedImages.add(image);
            imageRepository.save(image);
        }

        return savedImages.stream().map(this::toDto).toList();
    }

    @Transactional
    public void deleteImage(int imageId, int sellerId) {
        Image image = imageRepository.findById(imageId).orElse(null);
        if (image == null) {
            throw new ApiException("Image not found");
        }

        Seller seller = sellerRepository.findById(sellerId).orElse(null);
        if (seller == null) {
            throw new ApiException("Seller not found");
        }
        if (!seller.getIsAdmin()) {
            throw new ApiException("Only auction house admins can manage images");
        }
        if (seller.getAuctionHouse() == null || image.getAuction() == null || !image.getAuction().getAuctionHouse().getId().equals(seller.getAuctionHouse().getId())) {
            throw new ApiException("Image does not belong to your auction house");
        }

        imageStorageService.delete(image.getUrl());
        imageRepository.delete(image);
        normalizeDisplayOrder(image.getAuction().getId());
    }

    @Transactional
    public void deleteAuctionImages(int auctionId) {
        List<Image> images = imageRepository.findByAuctionIdOrderByDisplayOrderAsc(auctionId);
        for (Image image : images) {
            imageStorageService.delete(image.getUrl());
        }
        imageRepository.deleteByAuctionId(auctionId);
    }

    @Transactional
    public void replaceAuctionImages(int auctionId, int sellerId, List<MultipartFile> files) {
        Auction auction = auctionRepository.findById(auctionId).orElse(null);
        if (auction == null) {
            throw new ApiException("Auction not found");
        }

        deleteAuctionImages(auctionId);
        addAuctionImages(auctionId, sellerId, files);
    }

    private Auction getAuthorizedAuction(int sellerId, int auctionId) {
        Seller seller = sellerRepository.findById(sellerId).orElse(null);
        if (seller == null) {
            throw new ApiException("Seller not found");
        }
        if (!seller.getIsAdmin()) {
            throw new ApiException("Only auction house admins can manage images");
        }
        if (seller.getAuctionHouse() == null) {
            throw new ApiException("Seller does not belong to an auction house");
        }

        Auction auction = auctionRepository.findById(auctionId).orElse(null);
        if (auction == null) {
            throw new ApiException("Auction not found");
        }
        if (!auction.getAuctionHouse().getId().equals(seller.getAuctionHouse().getId())) {
            throw new ApiException("Auction does not belong to your auction house");
        }
        return auction;
    }

    private void normalizeDisplayOrder(int auctionId) {
        List<Image> images = imageRepository.findByAuctionIdOrderByDisplayOrderAsc(auctionId);
        int order = 1;
        for (Image image : images) {
            if (!Integer.valueOf(order).equals(image.getDisplayOrder())) {
                image.setDisplayOrder(order);
                imageRepository.save(image);
            }
            order++;
        }
    }

    private ImageDTOOUT toDto(Image image) {
        return new ImageDTOOUT(image.getId(), image.getUrl(), image.getDisplayOrder(), image.getCreatedAt());
    }
}