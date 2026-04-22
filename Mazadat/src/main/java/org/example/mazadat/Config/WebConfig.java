package org.example.mazadat.Config;

import java.util.Arrays;
import java.nio.file.Paths;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.CacheControl;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final String uploadDir;
    private final String allowedOrigins;
    private final String allowedMethods;
    private final String allowedHeaders;
    private final long corsMaxAge;

    public WebConfig(
            @Value("${mazadat.upload-dir:uploads/images}") String uploadDir,
            @Value("${mazadat.cors.allowed-origins:http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000}") String allowedOrigins,
            @Value("${mazadat.cors.allowed-methods:GET,POST,PUT,DELETE,OPTIONS,PATCH}") String allowedMethods,
            @Value("${mazadat.cors.allowed-headers:*}") String allowedHeaders,
            @Value("${mazadat.cors.max-age:3600}") long corsMaxAge) {
        this.uploadDir = uploadDir;
        this.allowedOrigins = allowedOrigins;
        this.allowedMethods = allowedMethods;
        this.allowedHeaders = allowedHeaders;
        this.corsMaxAge = corsMaxAge;
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        List<String> origins = Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(origin -> !origin.isBlank())
                .collect(Collectors.toList());

        String[] methods = Arrays.stream(allowedMethods.split(","))
                .map(String::trim)
                .filter(method -> !method.isBlank())
                .toArray(String[]::new);

        String[] headers = Arrays.stream(allowedHeaders.split(","))
                .map(String::trim)
                .filter(header -> !header.isBlank())
                .toArray(String[]::new);

        registry.addMapping("/api/**")
                .allowedOriginPatterns(origins.toArray(String[]::new))
                .allowedMethods(methods)
                .allowedHeaders(headers)
                .allowCredentials(true)
                .maxAge(corsMaxAge);
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String uploadLocation = Paths.get(uploadDir).toAbsolutePath().normalize().toUri().toString();
        registry.addResourceHandler("/images/**")
                .addResourceLocations(uploadLocation)
                .setCacheControl(CacheControl.noStore());
    }
}

