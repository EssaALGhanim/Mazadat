package org.example.mazadat.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

import org.example.mazadat.Api.ApiException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ImageStorageService {

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp"
    );

    private final Path imageStorageLocation;

    public ImageStorageService(@Value("${mazadat.upload-dir:uploads/images}") String uploadDir) {
        this.imageStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    public String store(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ApiException("Image file must exist");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase(Locale.ROOT))) {
            throw new ApiException("Only JPEG, PNG, and WebP images are allowed");
        }

        try {
            Files.createDirectories(imageStorageLocation);

            String originalFilename = file.getOriginalFilename();
            if (originalFilename == null) {
                originalFilename = "image";
            }
            originalFilename = StringUtils.cleanPath(originalFilename);
            String extension = getFileExtension(originalFilename);
            String storedFileName = UUID.randomUUID() + extension;

            Path targetLocation = imageStorageLocation.resolve(storedFileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            return "/uploads/images/" + storedFileName;
        } catch (IOException e) {
            throw new ApiException("Failed to store image file: " + e.getMessage());
        }
    }

    public void delete(String storedUrl) {
        if (storedUrl == null || storedUrl.isBlank()) {
            return;
        }

        String fileName = storedUrl.substring(storedUrl.lastIndexOf('/') + 1);
        Path filePath = imageStorageLocation.resolve(fileName).normalize();

        try {
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            throw new ApiException("Failed to delete image file: " + e.getMessage());
        }
    }

    private String getFileExtension(String filename) {
        int index = filename.lastIndexOf('.');
        if (index < 0) {
            return "";
        }
        return filename.substring(index);
    }
}