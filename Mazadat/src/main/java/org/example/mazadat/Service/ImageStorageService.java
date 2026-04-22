package org.example.mazadat.Service;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

import org.example.mazadat.Api.ApiException;
import software.amazon.awssdk.core.sync.ResponseTransformer;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ImageStorageService {

    public record ImageAsset(byte[] bytes, String contentType) {}

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp"
    );

    private final Path imageStorageLocation;
    private final String storageMode;
    private final String publicBaseUrl;
    private final String bucketName;
    private final String s3KeyPrefix;
    private final S3Client s3Client;

    public ImageStorageService(
            @Value("${mazadat.upload-dir:uploads/images}") String uploadDir,
            @Value("${mazadat.storage.mode:local}") String storageMode,
            @Value("${mazadat.storage.public-base-url:}") String publicBaseUrl,
            @Value("${mazadat.storage.s3.endpoint:}") String s3Endpoint,
            @Value("${mazadat.storage.s3.region:us-east-1}") String s3Region,
            @Value("${mazadat.storage.s3.bucket:}") String bucketName,
            @Value("${mazadat.storage.s3.access-key:}") String accessKey,
            @Value("${mazadat.storage.s3.secret-key:}") String secretKey,
            @Value("${mazadat.storage.s3.path-prefix:images}") String s3KeyPrefix) {
        this.imageStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        this.storageMode = storageMode == null ? "local" : storageMode.trim().toLowerCase(Locale.ROOT);
        this.publicBaseUrl = trimTrailingSlash(publicBaseUrl);
        this.bucketName = bucketName == null ? "" : bucketName.trim();
        this.s3KeyPrefix = normalizePrefix(s3KeyPrefix);
        this.s3Client = shouldUseBucketStorage()
                ? createS3Client(s3Endpoint, s3Region, accessKey, secretKey)
                : null;
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
            String originalFilename = file.getOriginalFilename();
            if (originalFilename == null) {
                originalFilename = "image";
            }
            originalFilename = StringUtils.cleanPath(originalFilename);
            String extension = getFileExtension(originalFilename);
            String storedFileName = UUID.randomUUID() + extension;

            if (shouldUseBucketStorage()) {
                ensureBucketConfiguration();
                String objectKey = buildObjectKey(storedFileName);
                PutObjectRequest request = PutObjectRequest.builder()
                        .bucket(bucketName)
                        .key(objectKey)
                        .contentType(contentType)
                        .build();
                s3Client.putObject(request, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
                return buildPublicUrl(objectKey);
            }

            Files.createDirectories(imageStorageLocation);

            Path targetLocation = imageStorageLocation.resolve(storedFileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            return "/images/" + storedFileName;
        } catch (IOException e) {
            throw new ApiException("Failed to store image file: " + e.getMessage());
        }
    }

    public void delete(String storedUrl) {
        if (storedUrl == null || storedUrl.isBlank()) {
            return;
        }

        try {
            if (shouldUseBucketStorage()) {
                ensureBucketConfiguration();
                String objectKey = extractObjectKey(storedUrl);
                if (!objectKey.isBlank()) {
                    s3Client.deleteObject(DeleteObjectRequest.builder()
                            .bucket(bucketName)
                            .key(objectKey)
                            .build());
                }
                return;
            }

            String fileName = storedUrl.substring(storedUrl.lastIndexOf('/') + 1);
            Path filePath = imageStorageLocation.resolve(fileName).normalize();
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            throw new ApiException("Failed to delete image file: " + e.getMessage());
        }
    }

    public ImageAsset load(String storedUrl) {
        if (storedUrl == null || storedUrl.isBlank()) {
            throw new ApiException("Image not found");
        }

        try {
            if (shouldUseBucketStorage()) {
                ensureBucketConfiguration();
                String objectKey = extractObjectKey(storedUrl);
                if (objectKey.isBlank()) {
                    throw new ApiException("Image not found");
                }

                var response = s3Client.getObject(
                        GetObjectRequest.builder()
                                .bucket(bucketName)
                                .key(objectKey)
                                .build(),
                        ResponseTransformer.toBytes());

                String contentType = response.response().contentType();
                return new ImageAsset(response.asByteArray(), contentType == null || contentType.isBlank() ? "application/octet-stream" : contentType);
            }

            String fileName = storedUrl.substring(storedUrl.lastIndexOf('/') + 1);
            Path filePath = imageStorageLocation.resolve(fileName).normalize();
            if (!Files.exists(filePath)) {
                throw new ApiException("Image not found");
            }

            byte[] bytes = Files.readAllBytes(filePath);
            String contentType = Files.probeContentType(filePath);
            return new ImageAsset(bytes, contentType == null || contentType.isBlank() ? "application/octet-stream" : contentType);
        } catch (ApiException e) {
            throw e;
        } catch (IOException e) {
            throw new ApiException("Failed to load image file: " + e.getMessage());
        } catch (Exception e) {
            throw new ApiException("Failed to load image file: " + e.getMessage());
        }
    }

    private boolean shouldUseBucketStorage() {
        return "s3".equals(storageMode)
                || !bucketName.isBlank()
                || !publicBaseUrl.isBlank();
    }

    private void ensureBucketConfiguration() {
        if (bucketName.isBlank()) {
            throw new ApiException("MAZADAT_S3_BUCKET is required for bucket image storage");
        }
        if (publicBaseUrl.isBlank()) {
            throw new ApiException("MAZADAT_IMAGE_PUBLIC_BASE_URL is required for bucket image storage");
        }
        if (s3Client == null) {
            throw new ApiException("S3 client is not configured");
        }
    }

    private S3Client createS3Client(String endpoint, String region, String accessKey, String secretKey) {
        if (endpoint == null || endpoint.isBlank()) {
            throw new ApiException("MAZADAT_S3_ENDPOINT is required for bucket image storage");
        }
        if (accessKey == null || accessKey.isBlank() || secretKey == null || secretKey.isBlank()) {
            throw new ApiException("MAZADAT_S3_ACCESS_KEY and MAZADAT_S3_SECRET_KEY are required for bucket image storage");
        }

        return S3Client.builder()
                .credentialsProvider(StaticCredentialsProvider.create(AwsBasicCredentials.create(accessKey.trim(), secretKey.trim())))
                .endpointOverride(URI.create(endpoint.trim()))
                .region(Region.of((region == null || region.isBlank()) ? "us-east-1" : region.trim()))
                .serviceConfiguration(S3Configuration.builder().pathStyleAccessEnabled(true).build())
                .build();
    }

    private String buildObjectKey(String storedFileName) {
        return s3KeyPrefix.isBlank() ? storedFileName : s3KeyPrefix + "/" + storedFileName;
    }

    private String buildPublicUrl(String objectKey) {
        return publicBaseUrl + "/" + objectKey;
    }

    private String extractObjectKey(String storedUrl) {
        try {
            String path = URI.create(storedUrl).getPath();
            if (path == null || path.isBlank()) {
                return "";
            }

            path = path.startsWith("/") ? path.substring(1) : path;
            if (!s3KeyPrefix.isBlank() && path.startsWith(s3KeyPrefix + "/")) {
                return path;
            }

            if (!publicBaseUrl.isBlank()) {
                String normalizedBase = publicBaseUrl;
                String normalizedPath = storedUrl;
                if (normalizedPath.startsWith(normalizedBase)) {
                    String remainder = normalizedPath.substring(normalizedBase.length());
                    remainder = remainder.startsWith("/") ? remainder.substring(1) : remainder;
                    return remainder;
                }
            }

            return path;
        } catch (Exception e) {
            return "";
        }
    }

    private String normalizePrefix(String prefix) {
        if (prefix == null || prefix.isBlank()) {
            return "";
        }
        String normalized = prefix.trim();
        while (normalized.startsWith("/")) {
            normalized = normalized.substring(1);
        }
        while (normalized.endsWith("/")) {
            normalized = normalized.substring(0, normalized.length() - 1);
        }
        return normalized;
    }

    private String trimTrailingSlash(String value) {
        if (value == null || value.isBlank()) {
            return "";
        }
        String trimmed = value.trim();
        while (trimmed.endsWith("/")) {
            trimmed = trimmed.substring(0, trimmed.length() - 1);
        }
        return trimmed;
    }

    private String getFileExtension(String filename) {
        int index = filename.lastIndexOf('.');
        if (index < 0) {
            return "";
        }
        return filename.substring(index);
    }
}